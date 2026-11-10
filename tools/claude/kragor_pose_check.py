import numpy as np,sys,io
sys.path.insert(0,'../tools');import render as R
sys.path.insert(0,'.');from rk import rend
from PIL import Image
js,bn=R.load(sys.argv[1]);pr=js['meshes'][0]['primitives'][0];A=lambda i:R.acc(js,bn,i)
P=A(pr['attributes']['POSITION']);U=A(pr['attributes']['TEXCOORD_0']);F=A(pr['indices']).astype(int).reshape(-1,3)
J=A(pr['attributes']['JOINTS_0']).astype(int);W=A(pr['attributes']['WEIGHTS_0'])
print('w sum',W.sum(1).min(),W.sum(1).max(),'J max',J.max())
im=js['images'][0];bv=js['bufferViews'][im['bufferView']];o=bv.get('byteOffset',0)
tex=np.asarray(Image.open(io.BytesIO(bn[o:o+bv['byteLength']])).convert('RGB').resize((1024,1024))).astype(float)/255
def q2m(q):
    x,y,z,w=q;return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def slerp(a,b,t):
    d=np.dot(a,b)
    if d<0:b=-b;d=-d
    if d>.9995:r=a+(b-a)*t;return r/np.linalg.norm(r)
    th=np.arccos(d);return (np.sin((1-t)*th)*a+np.sin(t*th)*b)/np.sin(th)
def pose(t):
    N=js['nodes'];T={i:dict(t=np.array(n.get('translation',[0,0,0]),float),r=np.array(n.get('rotation',[0,0,0,1]),float),s=np.array(n.get('scale',[1,1,1]),float)) for i,n in enumerate(N)}
    an=js['animations'][0]
    for ch in an['channels']:
        s=an['samplers'][ch['sampler']];ti=A(s['input']).ravel();vo=A(s['output']);k=np.searchsorted(ti,t)
        k=min(max(k,1),len(ti)-1);f=np.clip((t-ti[k-1])/(ti[k]-ti[k-1]+1e-9),0,1);path=ch['target']['path'];nd=ch['target']['node']
        v=slerp(vo[k-1],vo[k],f) if path=='rotation' else vo[k-1]+(vo[k]-vo[k-1])*f
        T[nd][{'translation':'t','rotation':'r','scale':'s'}[path]]=v
    par={c:i for i,n in enumerate(N) for c in n.get('children',[])}
    Wm={}
    def wm(i):
        if i in Wm:return Wm[i]
        M=np.eye(4);M[:3,:3]=q2m(T[i]['r'])*T[i]['s'];M[:3,3]=T[i]['t']
        Wm[i]=wm(par[i])@M if i in par else M;return Wm[i]
    sk=js['skins'][0];ibm=A(sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
    mesh_node=[i for i,n in enumerate(N) if 'mesh' in n][0]
    Jm=np.array([wm(j)@ibm[k] for k,j in enumerate(sk['joints'])])
    Ph=np.c_[P,np.ones(len(P))];out=np.zeros((len(P),4))
    for c in range(4):out+=W[:,c,None]*np.einsum('nij,nj->ni',Jm[J[:,c]],Ph)
    return out[:,:3]
ims=[]
for t in [0,1.6,3.2]:
    Q=pose(t);ims.append(rend(Q,U,F,tex,.5,.15,380))
s=Image.new('RGB',(380*3,380),'white')
for i,im in enumerate(ims):s.paste(im,(i*380,0))
s.save(sys.argv[2])
