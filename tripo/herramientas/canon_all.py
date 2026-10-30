import sys;sys.path.insert(0,'tools')
from canon import canon_model
MAP={'zurdito':'Simún','cazador':'Barbanegra','perro':'Fenrir','sangre':'demonio','coletazo':'esorpio','expreso':'mosquetero','pausa':'tortuga','rey':'anubis','gato':'gato',
 'toro':'toro','vikingo':'vikingo','muralla':'golem','ciclon':'samurai','malabares':'negro pelo chino','ruleta':'gladidador','leon':'rey barbaro','turbo':'volt','valkiria':'Valkiria'}
for k,v in MAP.items():
    canon_model(f'nuevo/pj/{v}.glb',f'nuevo/canon/{k}.glb',name=k);print(k)
