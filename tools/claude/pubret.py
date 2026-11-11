"""Público mixto: pasa las animaciones del hongo (pub3) a cualquier personaje (pub2) por giros en el mundo.
Los personajes nuevos vienen mirando a +x: se giran para mirar a +z como el hongo."""
import sys;sys.path.insert(0,'tools')
from rig import *
from clips import read_anim,setpose
def nrm(m):return m/np.linalg.norm(m,axis=0,keepdims=True)
class Tgt:
    def __init__(s,path,face_x=True):
        r=Rig(path);s.r=r;B=np.linalg.inv(r.ibm)
        Ry=np.eye(4)
        if face_x:Ry[:3,:3]=np.array([[0,0,-1],[0,1,0],[1,0,0]])   # +x -> +z
        s.B=np.einsum('ij,njk->nik',Ry,B);s.P=(Ry[:3,:3]@r.P.T).T
        s.names=[r.nodes[j]['name'].replace('mixamorig:','') for j in r.joints]
        idx={j:k for k,j in enumerate(r.joints)};s.par=[]
        for j in r.joints:
            p=r.parent[j]
            while p>=0 and p not in idx:p=r.parent[p]
            s.par.append(idx.get(p,-1))
        s.order=sorted(range(len(s.names)),key=lambda k:s.depth(k))
        s.pos=s.B[:,:3,3];s.Rr=np.array([nrm(b[:3,:3]) for b in s.B])
        s.hip=s.names.index('Hips')
        print('test rest: arms', s.pos[s.names.index('LeftHand')].round(2), 'face?')
    def depth(s,k):
        d=0
        while s.par[k]>=0:k=s.par[k];d+=1
        return d
    def pose(s,D,dhip,extra=None):
        """D: nombre-> matriz 3x3 de giro en el mundo; dhip: movimiento de la cadera; extra: {'Left':R,'Right':R} giro extra del brazo desde el hombro"""
        n=len(s.names);Dk=np.zeros((n,3,3));pc=np.zeros((n,3))
        for k in s.order:
            Dk[k]=D.get(s.names[k],Dk[s.par[k]] if s.par[k]>=0 else np.eye(3))
            if extra:
                nm=s.names[k]
                for side,R in extra.items():
                    if nm.startswith(side+'Arm') or nm.startswith(side+'ForeArm') or nm.startswith(side+'Hand'):Dk[k]=R@Dk[k]
            p=s.par[k]
            pc[k]=s.pos[k]+dhip if p<0 else pc[p]+Dk[p]@(s.pos[k]-s.pos[p])
        J=s.r.J;W=s.r.W;out=np.zeros_like(s.P)
        for q in range(4):
            j=J[:,q];v=np.einsum('nij,nj->ni',Dk[j],s.P-s.pos[j])+pc[j];out+=W[:,q:q+1]*v
        return out,Dk,pc
class Src:
    def __init__(s,path,ai=0):
        r=Rig(path);s.r=r;s.ch,s.dur=read_anim(r,ai);r.reset();r.update()
        s.rest={k:nrm(r.G[i][:3,:3]) for k,i in r.bone.items()};s.hip0=r.G[r.bone['Hips']][:3,3].copy()
    def frame(s,t):
        r=s.r;setpose(r,s.ch,t);D={k:nrm(r.G[i][:3,:3])@s.rest[k].T for k,i in r.bone.items()}
        return D,r.G[r.bone['Hips']][:3,3]-s.hip0
