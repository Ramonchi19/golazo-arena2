import sys,json;sys.path.insert(0,'tools')
from libview import *
H={'zurdito':2.35,'cazador':2.5,'perro':2.35,'sangre':2.45,'coletazo':2.4,'pausa':2.3,'rey':2.45,'expreso':2.4,'gato':2.35,'toro':2.6,'vikingo':2.55,'muralla':2.75,'ciclon':2.35,'malabares':2.4,'ruleta':2.45,'leon':2.5,'turbo':2.4}
L=Lib('nuevo/out/anims.glb');clips=[a['name'] for a in L.js['animations']]
import os
ONLY=sys.argv[1:];out=json.load(open('nuevo/out/floorfix.json')) if ONLY and os.path.exists('nuevo/out/floorfix.json') else {}
for idn,hh in H.items():
    if ONLY and idn not in ONLY:continue
    m=Rig(f'nuevo/canon/{idn}.glb');P=m.skin();sub=slice(None,None,3);m.P=m.P[sub];m.J=m.J[sub];m.W=m.W[sub]
    mh=P[:,1].max()-P[:,1].min();base=P[:,1].min();out[idn]={}
    for c in clips:
        ch,d=L.clip(c,m);n=min(31,max(9,int(d*8)));v=[]
        for k in range(n):
            setpose(m,ch,d*k/(n-1));v.append(int(round(100*hh*(m.skin()[:,1].min()-base)/mh)))
        out[idn][c]=v
    print(idn,flush=True)
json.dump(out,open('nuevo/out/floorfix.json','w'),separators=(',',':'))
