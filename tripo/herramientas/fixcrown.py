import sys,json,struct,io;sys.path.insert(0,'tools')
from rig import *
from PIL import Image,ImageDraw
src,dst=sys.argv[1],sys.argv[2]
r=Rig(src);P=r.skin();UV=r.UV;F=r.F
b=open(src,'rb').read();jl=struct.unpack('<I',b[12:16])[0];js=json.loads(b[20:20+jl]);binb=bytearray(b[20+jl+8:])
img=js['images'][0];bv=js['bufferViews'][img['bufferView']]
T=Image.open(io.BytesIO(bytes(binb[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]))).convert('RGB');W,H=T.size;A=np.asarray(T).astype(float)/255
def col(f):
    u=UV[f].mean(0)%1;return A[int(u[1]*(H-1)),int(u[0]*(W-1))]
cen=P[F].mean(1);top=P[:,1].max()
# pelo: triángulos de la nuca (atrás, arriba de los hombros)
hair=[col(f) for i,f in enumerate(F) if cen[i,2]<-.03 and cen[i,1]>top-.16 and cen[i,1]<top-.08]
hair=np.array(hair);lum=hair@[.3,.6,.1];hc=np.median(hair[(lum<.35)],0);print('pelo',hc,len(hair))
# componentes conectados (por posición) para no pintar la corona
from collections import defaultdict
key=np.round(r.P0 if hasattr(r,'P0') else P,5);_,inv=np.unique(key,axis=0,return_inverse=True);inv=inv.ravel()
par=list(range(inv.max()+1))
def fd(x):
    while par[x]!=x:par[x]=par[par[x]];x=par[x]
    return x
for f in F:
    a,b2,c2=fd(inv[f[0]]),fd(inv[f[1]]),fd(inv[f[2]]);par[b2]=a;par[fd(c2)]=a
comp=np.array([fd(inv[f[0]]) for f in F])
gold=defaultdict(list)
for i,f in enumerate(F):
    if cen[i][1]>top-.15:
        k=col(f);gold[comp[i]].append(1 if (k[1]>.45 and k[2]<.35 and k[1]/max(k[0],1e-3)>.72) else 0)
crown={c for c,v in gold.items() if np.mean(v)>.3 and len(v)>20}
print('componentes corona',[(c,len(gold[c]),round(np.mean(gold[c]),2)) for c in crown])
sel=[]
for i,f in enumerate(F):
    c=cen[i]
    if comp[i] in crown:continue
    if c[1]<top-.085 or np.hypot(c[0],c[2]+.0)>.11:continue
    k=col(f);
    if k[0]>.45 and k[0]>k[1]>k[2] and k[0]-k[2]>.12 and not (k[1]>.5 and k[2]<.3 and k[1]/k[0]>.75): sel.append(i)
print('triangulos',len(sel))
im=T.copy();d=ImageDraw.Draw(im);hcol=tuple(int(v*255) for v in hc)
rng=np.random.default_rng(1)
for i in sel:
    uv=UV[F[i]]%1;pts=[(u*W,v*H) for u,v in uv]
    # agranda un poquito el triángulo para tapar costuras
    c=np.mean(pts,0);pts=[tuple(c+(np.array(p)-c)*1.15) for p in pts]
    j=rng.normal(0,.04);d.polygon(pts,fill=tuple(int(np.clip(v*(1+j),0,1)*255) for v in hc))
buf=io.BytesIO();im.save(buf,'JPEG',quality=90);nb=buf.getvalue()
# reemplaza la imagen al final del buffer
while len(binb)%4:binb.append(0)
off=len(binb);binb.extend(nb);js['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(nb)});img['bufferView']=len(js['bufferViews'])-1;img['mimeType']='image/jpeg'
while len(binb)%4:binb.append(0)
js['buffers'][0]['byteLength']=len(binb)
j=json.dumps(js,separators=(',',':')).encode();j+=b' '*((4-len(j)%4)%4)
open(dst,'wb').write(struct.pack('<4sII',b'glTF',2,12+8+len(j)+8+len(binb))+struct.pack('<II',len(j),0x4E4F534A)+j+struct.pack('<II',len(binb),0x004E4942)+bytes(binb))
