import json,struct,io,sys,copy
import numpy as np
from scipy.spatial import cKDTree
from PIL import Image
sys.path.insert(0,'../tools');import render as R
ja,ba=R.load('a.glb');jb,bb=R.load('b.glb')
pa=ja['meshes'][0]['primitives'][0];pb=jb['meshes'][0]['primitives'][0]
A=lambda j,b,i:R.acc(j,b,i)
Pa=A(ja,ba,pa['attributes']['POSITION']).astype(np.float32);Na=A(ja,ba,pa['attributes']['NORMAL']).astype(np.float32)
Ua=A(ja,ba,pa['attributes']['TEXCOORD_0']).astype(np.float32);Ia=A(ja,ba,pa['indices']).astype(np.uint32).ravel()
Pb=A(jb,bb,pb['attributes']['POSITION']);Jb=A(jb,bb,pb['attributes']['JOINTS_0']).astype(int);Wb=A(jb,bb,pb['attributes']['WEIGHTS_0'])
nj=len(jb['skins'][0]['joints'])
# pesos: promedio de los 6 vértices más cercanos del modelo con esqueleto (pesado por distancia)
tr=cKDTree(Pb);dist,idx=tr.query(Pa,k=6);w=1/(dist+1e-4)**2;w/=w.sum(1,keepdims=True)
D=np.zeros((len(Pa),nj),np.float32)
for k in range(6):
    for c in range(4):np.add.at(D,(np.arange(len(Pa)),Jb[idx[:,k],c]),w[:,k]*Wb[idx[:,k],c])
top=np.argsort(-D,1)[:,:4];Wn=np.take_along_axis(D,top,1);Wn/=Wn.sum(1,keepdims=True)
Jn=top.astype(np.uint16);Wn=Wn.astype(np.float32)
print('max dist',dist[:,0].max(),'median',np.median(dist[:,0]))
def build(texpath,out,size):
    j=copy.deepcopy(jb);blob=bytearray();views=[];accs=[]
    def add(data,target=None):
        while len(blob)%4:blob.append(0)
        off=len(blob);blob.extend(data);v={'buffer':0,'byteOffset':off,'byteLength':len(data)}
        if target:v['target']=target
        views.append(v);return len(views)-1
    def addacc(arr,ctype,typ,target,minmax=False):
        vi=add(arr.tobytes(),target);a={'bufferView':vi,'componentType':ctype,'count':len(arr),'type':typ}
        if minmax:a['min']=arr.min(0).tolist();a['max']=arr.max(0).tolist()
        accs.append(a);return len(accs)-1
    # copiar accesores viejos que no son de la malla (huesos, animación)
    mesh_acc=set(pb['attributes'].values())|{pb['indices']}
    remap={}
    for i,a in enumerate(jb['accessors']):
        if i in mesh_acc:continue
        bv=jb['bufferViews'][a['bufferView']];o=bv.get('byteOffset',0)+a.get('byteOffset',0)
        dt=np.dtype(R.CT[a['componentType']]);n=R.NC[a['type']];data=bb[o:o+a['count']*n*dt.itemsize]
        na=dict(a);na['bufferView']=add(data);na.pop('byteOffset',None);accs.append(na);remap[i]=len(accs)-1
    attr={'POSITION':addacc(Pa,5126,'VEC3',34962,True),'NORMAL':addacc(Na,5126,'VEC3',34962),'TEXCOORD_0':addacc(Ua,5126,'VEC2',34962),
          'JOINTS_0':addacc(Jn,5123,'VEC4',34962),'WEIGHTS_0':addacc(Wn,5126,'VEC4',34962)}
    ind=addacc(Ia,5125,'SCALAR',34963)
    im=Image.open(texpath).convert('RGB')
    if im.size[0]!=size:im=im.resize((size,size),Image.LANCZOS)
    bio=io.BytesIO();im.save(bio,'JPEG',quality=92);img_view=add(bio.getvalue())
    j['meshes'][0]['primitives'][0]['attributes']=attr;j['meshes'][0]['primitives'][0]['indices']=ind
    for s in j['skins']:s['inverseBindMatrices']=remap[s['inverseBindMatrices']]
    for an in j['animations']:
        for s in an['samplers']:s['input']=remap[s['input']];s['output']=remap[s['output']]
    j['images']=[{'bufferView':img_view,'mimeType':'image/jpeg','name':'kragor'}]
    j['accessors']=accs;j['bufferViews']=views;j['buffers']=[{'byteLength':len(blob)}]
    j['animations'][0]['name']='idle'
    js=json.dumps(j,separators=(',',':')).encode();js+=b' '*((4-len(js)%4)%4)
    while len(blob)%4:blob.append(0)
    tot=12+8+len(js)+8+len(blob)
    with open(out,'wb') as f:
        f.write(struct.pack('<III',0x46546C67,2,tot));f.write(struct.pack('<II',len(js),0x4E4F534A));f.write(js)
        f.write(struct.pack('<II',len(blob),0x004E4942));f.write(blob)
    print(out,tot//1024,'KB')
build('tex_pelo.jpg','kragor_4k.glb',4096)
build('tex_pelo.jpg','kragor_2k.glb',2048)
