import numpy as np,sys
from PIL import Image,ImageFilter
from scipy import ndimage as nd
A='/mnt/user-data/attachments/bc698779-c6f4-5cf3-a758-59e499658a8f/'
S={'campeon':'39a57f57','momia':'03db9b86','zombi':'fec4a47b','monje':'d0b949c4','hongo':'0c81d095','duende':'1dfb1c5d','yeti':'acea1d1e','remiendo':'305090b7','goblin':'f0bac66c'}
C={'duende':'00887b70','yeti':'3dbfb6ab','momia':'fa7457b2','zombi':'3c8bf793','campeon':'803c4d1f','monje':'91d58394','hongo':'7005ac74','remiendo':'40e6cb84','goblin':'4bb6941a'}
def cut(f):
    im=np.asarray(Image.open(A+f+'-image.webp').convert('RGB')).astype(float)
    h,w,_=im.shape;edge=np.concatenate([im[0],im[-1],im[:,0],im[:,-1]]);bg=np.median(edge,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    near=d<22;lab,n=nd.label(near);bl=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    back=np.isin(lab,list(bl))
    # orilla suave: banda de 2 px alrededor del fondo con alfa por distancia
    a=np.where(back,0.,1.)
    band=nd.binary_dilation(back,iterations=2)&~back
    a[band]=np.clip((d[band]-10)/45,0,1)
    a=nd.gaussian_filter(a,.6);a[back]=np.minimum(a[back],0)
    a=np.clip(a,0,1)
    # quitar el halo blanco
    aa=np.maximum(a,1e-3)[...,None];col=np.clip((im-(1-aa)*bg)/aa,0,255);col[a<=0]=0
    out=np.dstack([col,a*255]).astype(np.uint8);return Image.fromarray(out,'RGBA')
for k,f in S.items():
    im=cut(f);bb=im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox();im=im.crop(bb)
    W,H=625,900;sc=min(W*.96/im.width,(H-14)/im.height);im=im.resize((round(im.width*sc),round(im.height*sc)),Image.LANCZOS)
    cv=Image.new('RGBA',(W,H),(0,0,0,0));cv.paste(im,((W-im.width)//2,H-im.height),im);cv.save(k+'_s.webp',quality=92)
for k,f in C.items():
    im=Image.open(A+f+'-image.webp').convert('RGB');r=450/598;w,h=im.size
    if w/h>r:nw=round(h*r);im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
    else:nh=round(w/r);im=im.crop((0,0,w,nh))
    im.resize((450,598),Image.LANCZOS).save(k+'_c.webp',quality=92)
# hoja de revisión sobre fondo oscuro y claro
ks=list(S);sheet=Image.new('RGB',(len(ks)*210,620),(30,30,40))
for i,k in enumerate(ks):
    s=Image.open(k+'_s.webp').resize((208,300));c=Image.open(k+'_c.webp').resize((208,277))
    d=Image.new('RGB',(208,300),(20,60,30));d.paste(s,(0,0),s);sheet.paste(d,(i*210,0))
    sheet.paste(c,(i*210,310))
sheet.save('revision.png')
