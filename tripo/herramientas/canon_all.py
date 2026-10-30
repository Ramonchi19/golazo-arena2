import sys;sys.path.insert(0,'tools')
from canon import canon_model
MAP={'zurdito':'Simún','cazador':'Barbanegra','perro':'Fenrir','sangre':'demonio','coletazo':'esorpio','expreso':'mosquetero','pausa':'tortuga','rey':'anubis','gato':'gato',
 'toro':'toro','vikingo':'vikingo','muralla':'golem','ciclon':'samurai','malabares':'negro pelo chino','ruleta':'gladidador','leon':'rey barbaro','turbo':'volt','valkiria':'Valkiria'}
import numpy as np
def tail_to_hips(r):
    # la cola venía pegada a la pierna derecha (se despegaba al correr): toda la cola va con la cadera
    P=r.skin();nm=[gname(r.nodes[j].get('name','')) for j in r.joints];hi=nm.index('Hips');H=r.G[r.joints[hi]][:3,3]
    th=[k for k,j in enumerate(r.joints) if gname(r.nodes[j].get('name','')) in ('LeftUpLeg','RightUpLeg') or r.nodes[j].get('name','').startswith(('R_Thigh','L_Thigh'))]
    tw=sum(r.W[:,c]*np.isin(r.J[:,c],th) for c in range(4))>0
    m=tw&((P[:,2]<H[2]-.1)|((P[:,2]<H[2]-.04)&(P[:,1]>.30)))
    r.J[m]=hi;r.W[m]=[1,0,0,0];print('cola',m.sum())
from canon import gname
from pose import to_ref,refdirs
from rig import Rig
REFD=refdirs(Rig('nuevo/pj/Simún.glb'))
TAILS={'coletazo','gato','perro'}
ONLY=sys.argv[1:] or list(MAP)
for k,v in MAP.items():
    if k not in ONLY:continue
    canon_model(f'nuevo/pj/{v}.glb',f'nuevo/canon2/{k}.glb',name=k,fix=lambda r,k=k:(tail_to_hips(r) if k in TAILS else None,to_ref(r,REFD)));print(k)
