# Re-arma el esqueleto del hincha: huesos en su lugar (mismos nombres Mixamo) y pesos de piel nuevos
import sys,json,struct,numpy as np
sys.path.insert(0,'tools')
from render import load,acc
src,dst=sys.argv[1],sys.argv[2]
js,bn=load(src);nodes=js['nodes'];sk=js['skins'][0];J=sk['joints']
nm=lambda i:nodes[i]['name'].split(':')[-1]
prim=js['meshes'][0]['primitives'][0];P=acc(js,bn,prim['attributes']['POSITION'])
# posiciones medidas sobre la malla (frente +z, izquierda del hincha = +x)
B={'Hips':(0,.14,0),'Spine':(0,.18,0),'Spine1':(0,.26,0),'Spine2':(0,.33,0),'Neck':(0,.40,0),'Head':(0,.44,0),
   'LeftShoulder':(.07,.37,0),'LeftArm':(.17,.36,0),'LeftForeArm':(.25,.29,.02),'LeftHand':(.31,.22,.03),
   'LeftUpLeg':(.09,.13,0),'LeftLeg':(.12,.07,0),'LeftFoot':(.13,.025,.02),'LeftToeBase':(.13,.01,.09),'LeftToe_End':(.13,.01,.14)}
for k,v in list(B.items()):
    if k.startswith('Left'):B['Right'+k[4:]]=(-v[0],v[1],v[2])
pos={}
for j in J:
    n=nm(j)
    if n in B:pos[j]=np.array(B[n],float)
for j in J:   # dedos y demás: en la mano
    if j in pos:continue
    n=nm(j);side='Left' if n.startswith('Left') else 'Right'
    h=np.array(B[side+'Hand']);out=np.array([.04 if side=='Left' else -.04,-.05,.01]);pos[j]=h+out
parent={}
for i,n in enumerate(nodes):
    for c in n.get('children',[]):parent[c]=i
for j in J:
    p=parent.get(j);pp=pos.get(p,np.zeros(3))
    nodes[j]['translation']=[float(x) for x in pos[j]-pp];nodes[j]['rotation']=[0,0,0,1];nodes[j]['scale']=[1,1,1];nodes[j].pop('matrix',None)
# matrices de enlace inversas (column-major)
ib=np.zeros((len(J),16),np.float32)
for k,j in enumerate(J):
    M=np.eye(4);M[:3,3]=-pos[j];ib[k]=M.T.reshape(-1)
def addview(data):
    global bn
    bn+=b'\0'*((-len(bn))%4);off=len(bn);bn+=data
    js['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(data)});return len(js['bufferViews'])-1
def addacc(arr,ctype,typ):
    js['accessors'].append({'bufferView':addview(arr.tobytes()),'componentType':ctype,'count':len(arr),'type':typ});return len(js['accessors'])-1
sk['inverseBindMatrices']=addacc(ib,5126,'MAT4')
# pesos: distancia a segmentos hueso→hijo
idx={nm(j):k for k,j in enumerate(J)}
SEG=[('Hips','Spine'),('Spine','Spine1'),('Spine1','Spine2'),('Spine2','Neck'),('Neck','Head')]
for s in ('Left','Right'):SEG+=[(s+'Shoulder',s+'Arm'),(s+'Arm',s+'ForeArm'),(s+'ForeArm',s+'Hand'),(s+'UpLeg',s+'Leg'),(s+'Leg',s+'Foot'),(s+'Foot',s+'ToeBase')]
segs=[(idx[a],np.array(B[a]),np.array(B[b])) for a,b in SEG]
segs.append((idx['Head'],np.array(B['Head']),np.array([0,.98,0])))
for s,sx in (('Left',1),('Right',-1)):segs.append((idx[s+'Hand'],np.array(B[s+'Hand']),np.array([sx*.36,.15,.04])))
def dist(p,a,b):
    ab=b-a;t=np.clip(((p-a)@ab)/(ab@ab+1e-12),0,1);return np.linalg.norm(p-(a+t[:,None]*ab),axis=1)
D=np.stack([dist(P,a,b) for _,a,b in segs],1)
# reglas por zona: la cabeza (todo lo de arriba del cuello) es rígida; los brazos solo usan huesos de brazo y el cuerpo solo del cuerpo
headY=.43;ax=np.abs(P[:,0]);arm=((ax>.21)&(P[:,1]>.12)&(P[:,1]<.40))|((ax>.17)&(P[:,1]>.30)&(P[:,1]<.41))
segbone=np.array([s[0] for s in segs]);isArm=np.array([any(x in nm(J[b]) for x in ('Arm','Hand','Shoulder')) for b in segbone])
side=np.array([1 if nm(J[b]).startswith('Left') else -1 if nm(J[b]).startswith('Right') else 0 for b in segbone])
vside=np.sign(P[:,0])
bad=(arm[:,None]&~isArm[None,:])|(~arm[:,None]&isArm[None,:])|(arm[:,None]&isArm[None,:]&(side[None,:]!=vside[:,None]))
D=D+np.where(bad,9.,0)
order=np.argsort(D,1)[:,:2];dk=np.take_along_axis(D,order,1)+1e-3;w=1/dk**6;w/=w.sum(1,keepdims=True)
JO=np.zeros((len(P),4),np.uint16);WT=np.zeros((len(P),4),np.float32)
for i in range(2):JO[:,i]=segbone[order[:,i]];WT[:,i]=w[:,i]
# hombro: borde entre manga y pecho, mitad brazo y mitad pecho para que no se rompa
edge=arm&(ax<.21)&(P[:,1]>.30)
for i in np.nonzero(edge)[0]:
    sd='Left' if P[i,0]>0 else 'Right';JO[i,:2]=[idx[sd+'Arm'],idx['Spine2']];WT[i,:2]=[.5,.5]
hd=idx['Head'];up=P[:,1]>headY
JO[up]=0;WT[up]=0;JO[up,0]=hd;WT[up,0]=1
band=(P[:,1]>headY-.03)&~up&~arm;JO[band,0]=hd;WT[band,0]=.5;JO[band,1]=idx['Spine2'];WT[band,1]=.5;JO[band,2:]=0;WT[band,2:]=0
prim['attributes']['JOINTS_0']=addacc(JO,5123,'VEC4');prim['attributes']['WEIGHTS_0']=addacc(WT,5126,'VEC4')
js['buffers'][0]['byteLength']=len(bn)
from collections import Counter
print('hueso principal:',dict(Counter(nm(J[j]) for j in JO[:,0]).most_common()))
j=json.dumps(js,separators=(',',':')).encode();j+=b' '*((-len(j))%4);bn+=b'\0'*((-len(bn))%4)
open(dst,'wb').write(struct.pack('<4sII',b'glTF',2,12+8+len(j)+8+len(bn))+struct.pack('<II',len(j),0x4E4F534A)+j+struct.pack('<II',len(bn),0x004E4942)+bn)
