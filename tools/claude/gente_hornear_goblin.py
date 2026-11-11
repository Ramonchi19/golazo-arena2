"""Público v217 (estilo Strikers): vikinguito, gnomo, hongo amarillo, hongo rojo y esqueleto con 4 animaciones:
normal, brinquitos, manos arriba con brincos y cabeza abajo. Brazos abiertos solo donde las manos chocaban (pubfix).
Salida pub5/out/: gente.json + <especie>.bin + <especie>.jpg (mismo formato que v215)"""
import sys,json,io,os;sys.path.insert(0,'tools')
from pubfix import *
from PIL import Image
FPS=8
SP=[('goblin','pub5/goblin.glb',True)]
CL=[('normal','anim_normal'),('brinquitos','anim_brinquitos'),('manos','anim_manos_arriba_brincos'),('cabeza','anim_cabeza_abajo')]
srcs=[Src(f'pub5/anim/{f}.glb',0) for _,f in CL]
ref=Tgt('pub5/vikingo.glb');wins=[]
for (n,_),s in zip(CL,srcs):
    ts=np.arange(0,s.dur-1e-3,1/FPS);P=np.array([ref.pose(*s.frame(t))[0] for t in ts]);L=len(ts);best=None
    for a in range(0,L//3):
        for b in range(a+int(2.0*FPS),min(L,a+int(3.0*FPS)+1)):
            d=np.abs(P[a]-P[b]).mean()-.0003*(b-a)
            if best is None or d<best[0]:best=(d,a,b)
    _,a,b=best;wins.append((ts[a],ts[b],b-a));print(n,'loop',round(ts[a],2),'a',round(ts[b],2),'error',round(float(np.abs(P[a]-P[b]).mean()),4))
os.makedirs('pub5/out',exist_ok=True)
old=json.load(open('pub5/out/gente.json'));meta={'fps':FPS,'v':217,'clips':[],'species':[x for x in old['species'] if x['name']!='goblin']};st=0
for (n,_),(a,b,k) in zip(CL,wins):meta['clips'].append({'name':n,'start':st,'n':k});st+=k
NF=st
def octe(n):
    n=n/(np.abs(n).sum(1,keepdims=True)+1e-9);x,y,z=n[:,0],n[:,1],n[:,2]
    ox=np.where(z<0,(1-np.abs(y))*np.sign(x+1e-12),x);oy=np.where(z<0,(1-np.abs(x))*np.sign(y+1e-12),y)
    return np.round((np.c_[ox,oy]*.5+.5)*255).astype(np.uint8)
for name,f,fx in SP:
    t=Tgt(f,fx);r=t.r;F=r.F;UV=r.UV;nv=len(t.P)
    key=np.round(t.P/1e-5).astype(np.int64);_,winv=np.unique(key,axis=0,return_inverse=True);winv=winv.ravel();nW=winv.max()+1
    def vnorm(P):
        fn=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]]);n=np.zeros((nW,3))
        for q in range(3):np.add.at(n,winv[F[:,q]],fn)
        n=n[winv];return n/(np.linalg.norm(n,axis=1,keepdims=True)+1e-9)
    im=r.js['images'][0];bv=r.js['bufferViews'][im['bufferView']];o=bv.get('byteOffset',0)
    img=Image.open('pub5/goblin_tex.png').convert('RGB');TEX=np.asarray(img).astype(float)/255;th,tw=TEX.shape[:2]
    col=TEX[np.clip((UV[:,1]%1*(th-1)).astype(int),0,th-1),np.clip((UV[:,0]%1*(tw-1)).astype(int),0,tw-1)]
    J,W=r.J,r.W;dom=np.array(t.names)[J[np.arange(len(J)),W.argmax(1)]];y=t.P[:,1]
    knee=t.pos[t.names.index('LeftLeg')][1];lum=col.mean(1);sat=col.max(1)-col.min(1)
    # zonas (el color se decide pixel por pixel en la tarjeta de video): 1 = torso y cadera (blanco = playera, oscuro = short), 2 = muslos (oscuro = short)
    shirt=np.isin(dom,['Spine','Spine1','Spine2','Hips'])
    shorts=np.isin(dom,['LeftUpLeg','RightUpLeg'])&(y>knee)
    part=np.where(shirt,1,np.where(shorts,2,0)).astype(np.uint8)
    print(name,'vértices',nv,'triángulos',len(F),'playera',int(shirt.sum()),'short',int(shorts.sum()))
    fr=[];nr=[];hd=[];sc=t.pos[t.hip][1];ih=t.names.index('RightHand');ifa=t.names.index('RightForeArm')
    for s,(a,b,k) in zip(srcs,wins):
        tt=[a+(b-a)*i/k for i in range(k)];fx_=fix(t,s,tt,sc/s.hip0[1])
        for i in range(k):
            D,dh=s.frame(tt[i]);dh=dh*(sc/s.hip0[1]);dh[0]=dh[2]=0
            P,Dk,pc=t.pose(D,dh,extra_at(fx_,i));fr.append(P);nr.append(vnorm(P))
            up=pc[ih]-pc[ifa];up=up/np.linalg.norm(up)+np.array([0,1.2,0]);up/=np.linalg.norm(up)
            xa=np.cross(up,[0,0,1.]);xa/=np.linalg.norm(xa)+1e-9;za=np.cross(xa,up);hd.append(np.c_[np.c_[xa,up,za],pc[ih]])
    fr=np.array(fr);mn=fr.reshape(-1,3).min(0);mx=fr.reshape(-1,3).max(0);sc_=(mx-mn)/65535
    q=np.round((fr-mn)/sc_).astype(np.uint16);oc=np.array([octe(n) for n in nr])
    buf=io.BytesIO();off=[]
    for arr in (q,oc,UV.astype(np.float32),F.astype(np.uint16),part,np.array(hd,np.float32)):
        while buf.tell()%4:buf.write(b'\0')
        off.append(buf.tell());buf.write(np.ascontiguousarray(arr).tobytes())
    open(f'pub5/out/{name}.bin','wb').write(buf.getvalue())
    img.resize((512,512),Image.LANCZOS).save(f'pub5/out/{name}.jpg',quality=88)
    meta['species'].append({'name':name,'nv':int(nv),'nt':int(len(F)),'min':mn.tolist(),'scale':sc_.tolist(),'height':float(t.P[:,1].max()),'off':off,'tex':name+'.jpg'})
    print('  bytes',buf.tell())
assert meta['clips']==old['clips'],(meta['clips'],old['clips']);meta['nf']=NF;json.dump(meta,open('pub5/out/gente.json','w'))
