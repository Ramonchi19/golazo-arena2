import numpy as np,sys,io,json,struct
sys.path.insert(0,'.');sys.path.insert(0,'../tools');import render as R
from PIL import Image
js,bn=R.load('a.glb');pr=js['meshes'][0]['primitives'][0]
P=R.acc(js,bn,pr['attributes']['POSITION']);U=R.acc(js,bn,pr['attributes']['TEXCOORD_0']);F=R.acc(js,bn,pr['indices']).astype(int).reshape(-1,3)
im=js['images'][0];bv=js['bufferViews'][im['bufferView']];o=bv.get('byteOffset',0)
tex=np.asarray(Image.open(io.BytesIO(bn[o:o+bv['byteLength']])).convert('RGB')).astype(np.float32)/255;T=tex.shape[0]
fl=np.load('fl.npy');fc=P[F].mean(1)
# paleta del pelo real (componente 16)
h=F[fl==16];hc=U[h].mean(1);hcol=tex[((hc[:,1]%1)*(T-1)).astype(int),((hc[:,0]%1)*(T-1)).astype(int)]
lo,mid,hi=np.percentile(hcol,[15,50,88],axis=0);hi=np.minimum(mid*1.75,1);lo=mid*.6;print('hair',lo,mid,hi)
# corona y su borde de abajo por ángulo
cr=F[fl==22];cp=P[cr].reshape(-1,3);c=(cp[:,[0,2]].min(0)+cp[:,[0,2]].max(0))/2;print('crown center',c)
def polar(X):dv=X[:,[0,2]]-c;return np.linalg.norm(dv,axis=1),np.arctan2(dv[:,1],dv[:,0])
dcr,acr=polar(cp);nb=48;bcr=((acr+np.pi)/(2*np.pi)*nb).astype(int)%nb
base=np.array([np.percentile(cp[bcr==k,1],2) for k in range(nb)]);rin=np.array([np.percentile(dcr[bcr==k],2) for k in range(nb)])
d,a=polar(fc);b=((a+np.pi)/(2*np.pi)*nb).astype(int)%nb
cen=U[F].mean(1);fcol=tex[((cen[:,1]%1)*(T-1)).astype(int),((cen[:,0]%1)*(T-1)).astype(int)]
skin=(fcol[:,0]>.42)&(fcol[:,0]-fcol[:,2]>.15)
sel=np.isin(fl,[16,21])&(fc[:,1]>base[b]-.003)&(d<rin[b]+.006)&skin
print('scalp faces',sel.sum())
# pintar en UV: el color sale de la posición 3D (mechones que salen de la coronilla)
rng=np.random.default_rng(3)
ph=rng.uniform(0,2*np.pi,8)
def hair(X):
    dd,aa=polar(X);y=X[:,1]
    t=(np.sin(aa*70+np.sin(aa*9+ph[0])*3+dd*40)*.5+.5)
    t2=(np.sin(aa*160+ph[1]+np.sin(aa*23)*2)*.5+.5)
    k=np.clip(.25+.55*t*.7+.3*t2*.5,0,1)
    edge=np.clip((y-(base[(((aa+np.pi)/(2*np.pi)*nb).astype(int)%nb)]))/.02,0,1)   # sombra bajo la corona
    k=k*(.55+.45*edge)
    col=lo[None]+(hi-lo)[None]*k[:,None]
    return col
out=tex.copy();painted=np.zeros((T,T),bool)
for f in F[sel]:
    uv=U[f]%1*np.array([T,T]);x0,y0=uv.min(0).astype(int)-2;x1,y1=uv.max(0).astype(int)+3
    x0=max(x0,0);y0=max(y0,0);x1=min(x1,T);y1=min(y1,T)
    xs,ys=np.meshgrid(np.arange(x0,x1)+.5,np.arange(y0,y1)+.5)
    (ax,ay),(bx,by),(cx,cy)=uv;den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
    if abs(den)<1e-9:continue
    w0=((by-cy)*(xs-cx)+(cx-bx)*(ys-cy))/den;w1=((cy-ay)*(xs-cx)+(ax-cx)*(ys-cy))/den;w2=1-w0-w1
    e=-1.5/max(abs(den)**.5,1)   # un poquito más grande para tapar costuras
    m=(w0>=e)&(w1>=e)&(w2>=e)
    if not m.any():continue
    X=(w0[m,None]*P[f[0]]+w1[m,None]*P[f[1]]+w2[m,None]*P[f[2]])
    yy=(ys[m]-.5).astype(int);xx=(xs[m]-.5).astype(int)
    out[yy,xx]=hair(X);painted[yy,xx]=True
print('texels',painted.sum())
Image.fromarray((np.clip(out,0,1)*255).astype(np.uint8)).save('tex_pelo.jpg',quality=93)
np.save('sel.npy',sel)
