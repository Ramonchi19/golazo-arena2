import sys,numpy as np,io
sys.path.insert(0,'../tools');import render as R
from PIL import Image
def mesh(p,T=1024):
    js,bn=R.load(p);im=js['images'][0];bv=js['bufferViews'][im['bufferView']];o=bv.get('byteOffset',0)
    tex=np.asarray(Image.open(io.BytesIO(bn[o:o+bv['byteLength']])).convert('RGB').resize((T,T))).astype(float)/255
    pr=js['meshes'][0]['primitives'][0]
    P=R.acc(js,bn,pr['attributes']['POSITION']);U=R.acc(js,bn,pr['attributes']['TEXCOORD_0']);F=R.acc(js,bn,pr['indices']).astype(int).reshape(-1,3)
    return P,U,F,tex
def rend(P,U,F,tex,yaw,pitch,S,crop=None):
    if crop is not None:
        keep=(P[F][:,:,1].min(1)>crop);F=F[keep]
    T=tex.shape[0]
    c=(P[np.unique(F)].min(0)+P[np.unique(F)].max(0))/2;V=(P-c)@R.rot(yaw,pitch).T
    ext=np.abs(V[np.unique(F)][:,:2]).max()*1.05
    sx=(V[:,0]/ext*.5+.5)*S;sy=(.5-V[:,1]/ext*.5)*S;z=V[:,2]
    img=np.ones((S,S,3));zb=np.full((S,S),-1e9);L=np.array([.4,.7,.6]);L/=np.linalg.norm(L)
    for a,b,cc in F:
        x0,y0,x1,y1,x2,y2=sx[a],sy[a],sx[b],sy[b],sx[cc],sy[cc];den=(y1-y2)*(x0-x2)+(x2-x1)*(y0-y2)
        if abs(den)<1e-9:continue
        n=np.cross(V[b]-V[a],V[cc]-V[a]);nl=np.linalg.norm(n)
        if nl==0:continue
        sh=.5+.5*abs(n@L/nl)
        xmin=max(int(min(x0,x1,x2)),0);xmax=min(int(max(x0,x1,x2))+1,S-1);ymin=max(int(min(y0,y1,y2)),0);ymax=min(int(max(y0,y1,y2))+1,S-1)
        if xmin>xmax or ymin>ymax:continue
        xs,ys=np.meshgrid(np.arange(xmin,xmax+1)+.5,np.arange(ymin,ymax+1)+.5)
        w0=((y1-y2)*(xs-x2)+(x2-x1)*(ys-y2))/den;w1=((y2-y0)*(xs-x2)+(x0-x2)*(ys-y2))/den;w2=1-w0-w1
        m=(w0>=0)&(w1>=0)&(w2>=0)
        if not m.any():continue
        zz=w0*z[a]+w1*z[b]+w2*z[cc];yy=(ys-.5).astype(int);xx=(xs-.5).astype(int);sel=m&(zz>zb[yy,xx])
        if not sel.any():continue
        u=(w0*U[a,0]+w1*U[b,0]+w2*U[cc,0])[sel]%1;v=(w0*U[a,1]+w1*U[b,1]+w2*U[cc,1])[sel]%1
        img[yy[sel],xx[sel]]=np.clip(tex[(v*(T-1)).astype(int),(u*(T-1)).astype(int)]*sh,0,1);zb[yy[sel],xx[sel]]=zz[sel]
    return Image.fromarray((img*255).astype(np.uint8))
if __name__=='__main__':
    f=sys.argv[1];out=sys.argv[2];P,U,F,tex=mesh(f)
    top=P[:,1].max();ims=[rend(P,U,F,tex,0,0,420),rend(P,U,F,tex,np.pi,0,420),rend(P,U,F,tex,0,0,420,crop=top-.17),rend(P,U,F,tex,np.pi,0,420,crop=top-.17),rend(P,U,F,tex,0,1.2,420,crop=top-.17)]
    sh=Image.new('RGB',(420*len(ims),420),'white')
    for i,im in enumerate(ims):sh.paste(im,(i*420,0))
    sh.save(out)
