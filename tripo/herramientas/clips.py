import sys;sys.path.insert(0,'tools')
from rig import *
from canon import gname,jmap
def read_anim(r,ai=0):
    a=r.js['animations'][ai];ch=[]
    for c in a['channels']:
        s=a['samplers'][c['sampler']];t=r.acc(s['input']).ravel();v=r.acc(s['output'])
        ch.append((c['target']['node'],c['target']['path'],t,v,s.get('interpolation','LINEAR')))
    return ch,max(c[2][-1] for c in ch)
def setpose(r,ch,t):
    r.reset()
    for n,p,ts,v,ip in ch:
        if p=='weights':continue
        if t<=ts[0]:x=v[0]
        elif t>=ts[-1]:x=v[-1]
        else:
            k=np.searchsorted(ts,t)-1;u=(t-ts[k])/(ts[k+1]-ts[k])
            x=slerp(v[k],v[k+1],u) if p=='rotation' else v[k]*(1-u)+v[k+1]*u
        if p=='rotation':r.R[n]=qnorm(x)
        elif p=='translation':r.T[n]=x
        else:r.S[n]=x
    r.update()
_REF=None
def norm_rest(r,m):
    global _REF
    from pose import refdirs,to_ref
    if _REF is None:_REF=refdirs(Rig('nuevo/pj/Simún.glb'))
    to_ref(r,_REF);out={k:r.wrot(i) for k,i in m.items()};r.reset();return out
class Src:
    """animación de un GLB (cualquier esqueleto) -> deltas de giro en el mundo por hueso del juego"""
    def __init__(s,path):
        s.r=Rig(path);s.ch,s.dur=read_anim(s.r);s.m=jmap(s.r)
        s.rest=norm_rest(s.r,s.m);s.hip0=s.r.G[s.m['Hips']][:3,3].copy()
        s.hipH=s.hip0[1]-min(s.r.G[s.m[f]][:3,3][1] for f in ('LeftToeBase','RightToeBase') if f in s.m)
    def frame(s,t):
        setpose(s.r,s.ch,t);D={k:qnorm(qmul(s.r.wrot(i),qinv(s.rest[k]))) for k,i in s.m.items()}
        hp=s.r.G[s.m['Hips']][:3,3];return D,hp
