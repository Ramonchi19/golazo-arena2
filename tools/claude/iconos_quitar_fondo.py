import numpy as np,glob,os,re
from PIL import Image,ImageDraw
from scipy import ndimage as nd
REN={'amigos pero solo 2 monos, uno azul y otro naranja':'amigos','amigos':'miembros','sobre':'invitar','sobre con punto rojo':'solicitudes','escudo de cclubes':'club','subio':'subir','Capitan':'capitan','miembro':'jugador'}
HOLES={'trofeo','candado','arena-pueblo','arena-playa','arena-bosque','silencio','ajustes'}
TH={'arena-tundra':8}
def cut(p):
    k=os.path.basename(p)[:-5].strip()
    im=np.asarray(Image.open(p).convert('RGB')).astype(float)
    edge=np.concatenate([im[0],im[-1],im[:,0],im[:,-1]]);bg=np.median(edge,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    lab,n=nd.label(d<TH.get(k,14));bl=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    back=np.isin(lab,list(bl))
    if k in HOLES:
        l2,n2=nd.label(d<6);sz=nd.sum(np.ones_like(d),l2,range(1,n2+1))
        big=[i+1 for i,v in enumerate(sz) if v>800]
        back|=np.isin(l2,big)
    a=np.where(back,0.,1.);band=nd.binary_dilation(back,iterations=2)&~back
    a[band]=np.clip((d[band]-8)/40,0,1);a=nd.gaussian_filter(a,.6);a[back]=0;a=np.clip(a,0,1)
    aa=np.maximum(a,1e-3)[...,None];col=np.clip((im-(1-aa)*bg)/aa,0,255);col[a<=0]=0
    return Image.fromarray(np.dstack([col,a*255]).astype(np.uint8),'RGBA')
def fit(im,S=256,pad=10):
    im=im.crop(im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox())
    sc=(S-2*pad)/max(im.size);im=im.resize((max(1,round(im.width*sc)),max(1,round(im.height*sc))),Image.LANCZOS)
    cv=Image.new('RGBA',(S,S),(0,0,0,0));cv.paste(im,((S-im.width)//2,(S-im.height)//2),im);return cv
names=[]
for p in sorted(glob.glob('raw/*.webp')):
    k=os.path.basename(p)[:-5].strip();k=REN.get(k,k)
    ic=fit(cut(p));ic.save(f'out/{k}.webp',quality=90,method=6);names.append(k)
# bajar = subir en rojo e invertido
s=np.asarray(Image.open('out/subir.webp').convert('RGBA')).astype(float)
r=s.copy();r[...,0],r[...,1],r[...,2]=s[...,1],s[...,0]*.35,s[...,2]*.6
b=Image.fromarray(np.clip(r,0,255).astype(np.uint8),'RGBA').transpose(Image.FLIP_TOP_BOTTOM);b.save('out/bajar.webp',quality=90,method=6);names.append('bajar')
names.sort();cols=8;S=150
sh=Image.new('RGB',(cols*S,((len(names)+cols-1)//cols)*(S+16)),(18,40,90));d=ImageDraw.Draw(sh)
for i,k in enumerate(names):
    im=Image.open(f'out/{k}.webp').resize((S-14,S-14));x=(i%cols)*S;y=(i//cols)*(S+16)
    bgc=(18,40,90) if (i//cols)%2==0 else (40,120,60)
    sh.paste(Image.new('RGB',(S,S+16),bgc),(x,y));sh.paste(im,(x+7,y+4),im);d.text((x+4,y+S),k,fill='white')
sh.save('revision.png');print(len(names),names)
