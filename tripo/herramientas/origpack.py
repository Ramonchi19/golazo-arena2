import sys,json,struct;sys.path.insert(0,'tools')
from rig import *
from canon import B,glb_bytes
from clips import read_anim
SRC={'correr':'zurdito','trottar':'leon','tiro fuerte':'leon','pase 2 mas ligero':'zurdito','barrida':'perro','cabezaszo':'leon','chilena':'leon','lanzarse':'muralla',
 'agarrr arriba al centro':'muralla','golpe portero 1':'muralla','manotazo 2':'muralla','mareado':'zurdito','enojo portero':'muralla','salir volando':'zurdito','levantarse 3':'zurdito','lado a lado brazos abiertos':'muralla'}
b=B();js=b.js;nodes=[];nid={};anims=[]
for f,who in SRC.items():
    r=Rig(f'nuevo/an/{f}.glb');ch,d=read_anim(r);C=[];S=[]
    for n,p,t,v,ip in ch:
        nm=r.nodes[n].get('name','')
        if nm not in nid:nid[nm]=len(nodes);nodes.append({'name':nm})
        ti=b.add(t.astype(np.float32).reshape(-1,1),'SCALAR',mm=True);o=b.add(v.astype(np.float32),'VEC4' if p=='rotation' else 'VEC3')
        S.append({'input':ti,'output':o,'interpolation':ip});C.append({'sampler':len(S)-1,'target':{'node':nid[nm],'path':p}})
    anims.append({'name':f,'channels':C,'samplers':S,'extras':{'who':who}})
js['nodes']=nodes;js['scenes']=[{'nodes':list(range(len(nodes)))}];js['scene']=0;js['animations']=anims
open('nuevo/out2/orig.glb','wb').write(glb_bytes(js,b.bin));print(len(anims))
