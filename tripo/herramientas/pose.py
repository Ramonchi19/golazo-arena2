"""Lleva cualquier esqueleto a la MISMA pose de reposo (la de Simún): cada hueso apunta igual y las manos con la palma igual.
Así una animación hecha en un personaje se pasa a otro sin hombros chuecos ni manos volteadas."""
import sys,json;sys.path.insert(0,'tools')
from rig import *
from canon import gname
CHILD={'Hips':None,'Spine':'Spine01','Spine01':'Spine02','Spine02':'neck','neck':'Head','Head':'head_end',
 'LeftShoulder':'LeftArm','LeftArm':'LeftForeArm','LeftForeArm':'LeftHand','LeftHand':'LeftHandMiddle1',
 'LeftUpLeg':'LeftLeg','LeftLeg':'LeftFoot','LeftFoot':'LeftToeBase','LeftToeBase':'LeftToe_End'}
for s in ('Left',):
    for f in ('Index','Middle','Ring','Pinky','Thumb'):
        for k in (1,2,3):CHILD[f'{s}Hand{f}{k}']=f'{s}Hand{f}{k+1}'
for k,v in list(CHILD.items()):
    if k.startswith('Left'):CHILD[k.replace('Left','Right')]=v.replace('Left','Right') if v else None
def gm(r):return {gname(r.nodes[j].get('name','')):j for j in r.joints}
def refdirs(r):
    m=gm(r);D={}
    for b,c in CHILD.items():
        if b in m and c in m:D[b]=r.G[m[c]][:3,3]-r.G[m[b]][:3,3]
    for h in ('Left','Right'):
        a,p=f'{h}HandIndex1',f'{h}HandPinky1'
        if a in m and p in m:D[h+'Hand_lat']=r.G[m[a]][:3,3]-r.G[m[p]][:3,3]
    return D
def unit(v):return v/(np.linalg.norm(v)+1e-12)
def to_ref(r,R):
    """gira los huesos de r (en orden de jerarquía) para que apunten como R (direcciones de referencia)"""
    m=gm(r);inv={v:k for k,v in m.items()}
    for j in r.order:
        b=inv.get(j)
        if b is None or b not in R:continue
        c=m.get(CHILD[b])
        if c is None:continue
        cur=r.G[c][:3,3]-r.G[j][:3,3]
        if np.linalg.norm(cur)<1e-9:continue
        q=qfrom(unit(cur),unit(R[b]))
        lat=b+'_lat'
        if lat in R:   # la palma: gira sobre el eje del hueso para que el ancho de la mano quede igual
            a,p=m[b+'Index1'],m[b+'Pinky1']
            lv=q2m(q)@(r.G[a][:3,3]-r.G[p][:3,3]);ax=unit(R[b]);
            u=unit(lv-ax*(lv@ax));w=unit(R[lat]-ax*(R[lat]@ax));ang=np.arctan2(np.cross(u,w)@ax,u@w);q=qmul(qaxis(ax,ang),q)
        wq=r.wrot(j);p=r.parent[j];pq=r.wrot(p) if p>=0 else np.array([0,0,0,1.])
        r.R[j]=qnorm(qmul(qinv(pq),qmul(q,wq)));r.update()
