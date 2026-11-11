"""Quita choques de las manos con la cabeza (sombrero, casco, barba) y con el cuerpo: abre el brazo desde el hombro solo lo necesario,
cuadro por cuadro, y lo suaviza. Prueba con la malla real: un punto de la mano está adentro si queda detrás de la superficie más cercana del cuerpo.
No cambia nada más de la animación."""
import sys;sys.path.insert(0,'tools')
from pubret import *
from scipy.spatial import cKDTree
def rotz(a):c,s_=np.cos(a),np.sin(a);return np.array([[c,-s_,0],[s_,c,0],[0,0,1.]])
class Body:
    def __init__(s,t):
        s.t=t;J,W=t.r.J,t.r.W;dom=J[np.arange(len(J)),W.argmax(1)];nm=np.array(t.names)[dom]
        names=np.array(t.names)
        isarm=np.array([any(x.startswith(sd+k) for sd in ('Left','Right') for k in ('Arm','ForeArm','Hand','Shoulder')) for x in names])
        armw=(W*isarm[J]).sum(1)                       # cuánto lo mueve el brazo (mangas incluidas)
        s.hand={sd:np.array([x.startswith(sd+'Hand') for x in nm]) for sd in ('Left','Right')}
        s.body=armw<.05
        s.F=t.r.F;s.H=t.P[:,1].max()-t.P[:,1].min()
    def normals(s,P):
        F=s.F;fn=np.cross(P[F[:,1]]-P[F[:,0]],P[F[:,2]]-P[F[:,0]]);n=np.zeros_like(P)
        for k in range(3):np.add.at(n,F[:,k],fn)
        return n/(np.linalg.norm(n,axis=1,keepdims=True)+1e-12)
    def hits(s,P,sides=('Left','Right')):
        N=s.normals(P);B=P[s.body];BN=N[s.body];tree=cKDTree(B);out={}
        for sd in sides:
            Q=P[s.hand[sd]];d,i=tree.query(Q,k=1)
            depth=((Q-B[i])*BN[i]).sum(1)
            out[sd]=int(((depth<-.012*s.H)&(d<.08*s.H)).sum())
        return out
def fix(t,src,times,dhs=1.0,maxa=np.radians(70),step=np.radians(2.5),tol=4):
    bd=Body(t);A={'Left':[],'Right':[]};S={}
    for tt in times:
        D,dh=src.frame(tt);dh=dh*dhs
        P0,_,pc0=t.pose(D,dh)
        for sd,side in (('Left',1),('Right',-1)):
            dy=pc0[t.names.index(sd+'Hand')][1]-pc0[t.names.index(sd+'Arm')][1]
            sg=-side*(1 if dy>=0 else -1)          # el giro que aleja la mano del cuerpo (brazo arriba o abajo)
            S.setdefault(sd,[]).append(sg)
            a=0.
            while a<=maxa:
                P,_,_=t.pose(D,dh,{sd:rotz(sg*a)} if a else None)
                if bd.hits(P,(sd,))[sd]<=tol:break
                a+=step
            A[sd].append(min(a,maxa))
    out={}
    for sd in A:
        a=np.array(A[sd]);n=len(a)
        m=np.array([a[max(0,i-2):i+3].max() for i in range(n)])
        k=np.array([1,2,3,2,1.]);k/=k.sum();sm=np.convolve(np.r_[m[-2:],m,m[:2]],k,'valid')
        out[sd]=np.maximum(sm,a)*np.array(S[sd])   # con signo
    return out
def extra_at(out,i):
    e={sd:rotz(out[sd][i]) for sd in out if abs(out[sd][i])>1e-6}
    return e or None
