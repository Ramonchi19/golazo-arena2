"""Esqueleto canónico: todos los huesos con giro de reposo = identidad (mundo), nombres del juego.
Así una misma animación (rotaciones locales) se ve igual en todos los personajes."""
import sys,json,struct,io;sys.path.insert(0,'tools')
from rig import *
from PIL import Image
GAME={'Spine1':'Spine01','Spine2':'Spine02','Neck':'neck','HeadTop_End':'head_end'}
TRIPO={'Hip':'Hips','L_Thigh':'LeftUpLeg','L_Calf':'LeftLeg','L_Foot':'LeftFoot','L_ToeBase':'LeftToeBase','R_Thigh':'RightUpLeg','R_Calf':'RightLeg','R_Foot':'RightFoot','R_ToeBase':'RightToeBase',
 'Waist':'Spine','Spine01':'Spine01','Spine02':'Spine02','NeckTwist01':'neck','Head':'Head','L_Clavicle':'LeftShoulder','L_Upperarm':'LeftArm','L_Forearm':'LeftForeArm','L_Hand':'LeftHand',
 'R_Clavicle':'RightShoulder','R_Upperarm':'RightArm','R_Forearm':'RightForeArm','R_Hand':'RightHand'}
for s,S in (('L','Left'),('R','Right')):
    for a,A in (('Index','Index'),('Mid','Middle'),('Ring','Ring'),('Pinky','Pinky'),('Thumb','Thumb')):
        for k in (1,2,3):TRIPO[f'{s}_{a}{k}']=f'{S}Hand{A}{k}'
# Unreal (zarpazo hacia afuera)
UE={'pelvis':'Hips','spine_01':'Spine','spine_03':'Spine01','spine_05':'Spine02','neck_01':'neck','head':'Head','thigh_l':'LeftUpLeg','calf_l':'LeftLeg','foot_l':'LeftFoot','ball_l':'LeftToeBase',
 'thigh_r':'RightUpLeg','calf_r':'RightLeg','foot_r':'RightFoot','ball_r':'RightToeBase','clavicle_l':'LeftShoulder','upperarm_l':'LeftArm','lowerarm_l':'LeftForeArm','hand_l':'LeftHand',
 'clavicle_r':'RightShoulder','upperarm_r':'RightArm','lowerarm_r':'RightForeArm','hand_r':'RightHand'}
for s,S in (('l','Left'),('r','Right')):
    for a,A in (('index','Index'),('middle','Middle'),('ring','Ring'),('pinky','Pinky'),('thumb','Thumb')):
        for k in (1,2,3):UE[f'{a}_0{k}_{s}']=f'{S}Hand{A}{k}'
def gname(n):
    n=n.replace('mixamorig:','')
    if n in TRIPO and not n.startswith('Spine'):return TRIPO[n]
    if n in UE:return UE[n]
    return GAME.get(n,n)
def jmap(r):
    """nombre del juego -> índice de nodo (solo huesos del esqueleto)"""
    return {gname(r.nodes[j].get('name','')):j for j in r.joints}
def wq(r,i):return r.wrot(i)
def glb_bytes(js,binb):
    while len(binb)%4:binb.append(0)
    js['buffers']=[{'byteLength':len(binb)}]
    j=json.dumps(js,separators=(',',':')).encode();j+=b' '*((4-len(j)%4)%4)
    return struct.pack('<4sII',b'glTF',2,12+8+len(j)+8+len(binb))+struct.pack('<II',len(j),0x4E4F534A)+j+struct.pack('<II',len(binb),0x004E4942)+bytes(binb)
class B:
    def __init__(s):s.js={'asset':{'version':'2.0','generator':'titan canon'},'bufferViews':[],'accessors':[]};s.bin=bytearray()
    def add(s,arr,typ,ct=5126,target=None,mm=False):
        while len(s.bin)%4:s.bin.append(0)
        a=np.ascontiguousarray(arr);d=a.tobytes();bv={'buffer':0,'byteOffset':len(s.bin),'byteLength':len(d)}
        if target:bv['target']=target
        s.js['bufferViews'].append(bv);s.bin.extend(d)
        acc={'bufferView':len(s.js['bufferViews'])-1,'componentType':ct,'count':len(a),'type':typ}
        if mm:acc['min']=[float(x) for x in np.atleast_1d(a.min(0))];acc['max']=[float(x) for x in np.atleast_1d(a.max(0))]
        s.js['accessors'].append(acc);return len(s.js['accessors'])-1
def canon_model(src,dst,texsize=1024,name='char'):
    r=Rig(src);M=np.stack([r.G[j]@r.ibm[k] for k,j in enumerate(r.joints)])
    P=r.skin()
    # normales: del archivo, giradas con la piel en reposo
    pr=r.js['meshes'][r.nodes[next(i for i,n in enumerate(r.nodes) if 'mesh' in n)]['mesh']]['primitives'][0]
    Nn=r.acc(pr['attributes']['NORMAL']);Nw=np.zeros_like(Nn)
    for k in range(4):Nw+=r.W[:,k:k+1]*np.einsum('nij,nj->ni',M[r.J[:,k]][:,:3,:3],Nn)
    Nw/=np.linalg.norm(Nw,axis=1,keepdims=True)+1e-12
    # huesos: posición mundo, padre = ancestro más cercano que sea hueso
    J=r.joints;Jset=set(J);pos={j:r.G[j][:3,3] for j in J}
    def jpar(j):
        p=r.parent[j]
        while p>=0 and p not in Jset:p=r.parent[p]
        return p
    b=B();js=b.js;nodes=[{'name':'Armature','children':[]}];idx={}
    order=[j for j in r.order if j in Jset]
    for j in order:
        idx[j]=len(nodes);nodes.append({'name':gname(r.nodes[j].get('name','')),'translation':[0,0,0]})
    for j in order:
        p=jpar(j);t=pos[j]-(pos[p] if p>=0 else 0);nodes[idx[j]]['translation']=[float(x) for x in t]
        (nodes[idx[p]] if p>=0 else nodes[0]).setdefault('children',[]).append(idx[j])
    ibm=np.zeros((len(J),4,4));
    for k,j in enumerate(J):m=np.eye(4);m[:3,3]=-pos[j];ibm[k]=m.T
    # textura
    im=r.js['images'][0];bv=r.js['bufferViews'][im['bufferView']];o=bv.get('byteOffset',0)
    T=Image.open(io.BytesIO(r.bin[o:o+bv['byteLength']])).convert('RGB')
    if max(T.size)>texsize:T=T.resize((texsize,texsize),Image.LANCZOS)
    tb=io.BytesIO();T.save(tb,'JPEG',quality=88);tb=tb.getvalue()
    ip=b.add(P.astype(np.float32),'VEC3',target=34962,mm=True);inn=b.add(Nw.astype(np.float32),'VEC3',target=34962)
    iuv=b.add(r.UV.astype(np.float32),'VEC2',target=34962);ij=b.add(r.J.astype(np.uint16),'VEC4',5123,34962)
    W=r.W/np.maximum(r.W.sum(1,keepdims=True),1e-9);iw=b.add(W.astype(np.float32),'VEC4',target=34962)
    ii=b.add(r.F.astype(np.uint32).ravel(),'SCALAR',5125,34963);iib=b.add(ibm.reshape(len(J),16).astype(np.float32),'MAT4')
    while len(b.bin)%4:b.bin.append(0)
    js['bufferViews'].append({'buffer':0,'byteOffset':len(b.bin),'byteLength':len(tb)});b.bin.extend(tb)
    js['images']=[{'bufferView':len(js['bufferViews'])-1,'mimeType':'image/jpeg'}];js['textures']=[{'source':0}]
    js['materials']=[{'name':name,'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':.8},'doubleSided':True}]
    js['meshes']=[{'name':name,'primitives':[{'attributes':{'POSITION':ip,'NORMAL':inn,'TEXCOORD_0':iuv,'JOINTS_0':ij,'WEIGHTS_0':iw},'indices':ii,'material':0}]}]
    mi=len(nodes);nodes.append({'name':'char1','mesh':0,'skin':0})
    js['skins']=[{'joints':[idx[j] for j in J],'inverseBindMatrices':iib,'skeleton':idx[order[0]]}]
    js['nodes']=nodes;js['scenes']=[{'name':'Scene','nodes':[0,mi]}];js['scene']=0
    open(dst,'wb').write(glb_bytes(js,b.bin))
    return P
if __name__=='__main__':canon_model(sys.argv[1],sys.argv[2])
