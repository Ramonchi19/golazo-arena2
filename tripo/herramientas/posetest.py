import sys,numpy as np
sys.path.insert(0,'tools')
from render import load,acc,render
from PIL import Image
js,bn=load(sys.argv[1]);nodes=js['nodes'];sk=js['skins'][0];J=sk['joints']
nm=lambda i:nodes[i]['name'].split(':')[-1]
prim=js['meshes'][0]['primitives'][0];P=acc(js,bn,prim['attributes']['POSITION']);UV=acc(js,bn,prim['attributes']['TEXCOORD_0'])
F=acc(js,bn,prim['indices']).astype(int).reshape(-1,3);JO=acc(js,bn,prim['attributes']['JOINTS_0']).astype(int);W=acc(js,bn,prim['attributes']['WEIGHTS_0'])
IB=acc(js,bn,sk['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
import io
im=js['images'][0];bv=js['bufferViews'][im['bufferView']];tex=np.asarray(Image.open(io.BytesIO(bn[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])).convert('RGB').resize((512,512)))/255
parent={}
for i,n in enumerate(nodes):
    for c in n.get('children',[]):parent[c]=i
def rotm(a,b):
    a=a/np.linalg.norm(a);b=b/np.linalg.norm(b);v=np.cross(a,b);c=a@b
    if np.linalg.norm(v)<1e-8:return np.eye(3)
    K=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]]);return np.eye(3)+K+K@K*(1/(1+c))
byname={nm(j):j for j in J}
def glob(i,R):
    M=np.eye(4);M[:3,3]=nodes[i].get('translation',[0,0,0]);M[:3,:3]=R.get(i,np.eye(3))
    p=parent.get(i);return (glob(p,R)@M) if p is not None else M
def aim(R,b,c,d):
    gb=glob(byname[b],R);gc=glob(byname[c],R);cur=gc[:3,3]-gb[:3,3];rot=rotm(cur,np.array(d,float))
    # nueva rotación global = rot @ global actual; local = parent_global^-1 @ nueva
    pg=glob(parent[byname[b]],R)[:3,:3];R[byname[b]]=pg.T@(rot@gb[:3,:3])
def skin(R):
    mats=np.stack([glob(j,R)@IB[k] for k,j in enumerate(J)]);Ph=np.c_[P,np.ones(len(P))];out=np.zeros((len(P),3))
    for k in range(4):out+=W[:,k:k+1]*np.einsum('nij,nj->ni',mats[JO[:,k]],Ph)[:,:3]
    return out
poses={'reposo':[],'brazos_arriba':[('LeftArm','LeftForeArm',(.45,1,.05)),('LeftForeArm','LeftHand',(.3,1,.1)),('RightArm','RightForeArm',(-.45,1,.05)),('RightForeArm','RightHand',(-.3,1,.1))],
 'aplauso':[('LeftArm','LeftForeArm',(.25,-.3,.9)),('LeftForeArm','LeftHand',(-.65,.1,.7)),('RightArm','RightForeArm',(-.25,-.3,.9)),('RightForeArm','RightHand',(.65,.1,.7))],
 'cabeza_triste':[('Neck','Head',(0,.85,.5)),('LeftArm','LeftForeArm',(.15,-1,.08)),('RightArm','RightForeArm',(-.15,-1,.08))],
 'saludo':[('RightArm','RightForeArm',(-.45,.95,.15)),('RightForeArm','RightHand',(-.75,.6,.1))],
 'agachado':[('LeftUpLeg','LeftLeg',(.14,-1,.6)),('LeftLeg','LeftFoot',(.06,-1,-.5)),('RightUpLeg','RightLeg',(-.14,-1,.6)),('RightLeg','RightFoot',(-.06,-1,-.5))]}
S=260;sheet=Image.new('RGB',(S*len(poses),S),'white')
for i,(k,ops) in enumerate(poses.items()):
    R={}
    for b,c,d in ops:aim(R,b,c,d)
    sheet.paste(render(skin(R),UV,F,tex,0.35,.15,S),(i*S,0))
sheet.save(sys.argv[2]);print('ok')
