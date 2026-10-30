import sys,json,struct;sys.path.insert(0,'tools')
from rig import *
from clips import setpose
from PIL import Image
class Lib:
    def __init__(s,path):
        b=open(path,'rb').read();jl=struct.unpack('<I',b[12:16])[0];s.js=json.loads(b[20:20+jl]);s.bin=b[20+jl+8:]
    acc=Rig.acc
    def clip(s,name,model):
        a=next(a for a in s.js['animations'] if a['name']==name);ch=[];nm={model.nodes[j]['name']:j for j in model.joints}
        for c in a['channels']:
            n=s.js['nodes'][c['target']['node']]['name']
            if n not in nm:continue
            sm=a['samplers'][c['sampler']];t=s.acc(sm['input']).ravel();v=s.acc(sm['output'])
            if c['target']['path']=='translation':
                h0=model.rest[0][nm['Hips']];v=np.c_[np.full(len(v),h0[0]),v[:,1]*h0[1]/100,np.full(len(v),h0[2])]
            ch.append((nm[n],c['target']['path'],t,v,'LINEAR'))
        return ch,max(c[2][-1] for c in ch)
def strip(model,lib,name,n=8,yaw=np.pi/2,S=180):
    ch,d=lib.clip(name,model);P=model.skin();H=P[:,1].max();fr=[]
    for k in range(n):
        setpose(model,ch,d*k/(n-1));fr.append(model.shot(yaw=yaw,pitch=.1,S=S,center=np.array([0,H*.5,0]),ext=H*.75))
    im=Image.new('RGB',(S*n,S),'white');[im.paste(f,(i*S,0)) for i,f in enumerate(fr)];return im
if __name__=='__main__':
    m=Rig(sys.argv[1]);L=Lib(sys.argv[2]);ims=[strip(m,L,nm,yaw=float(sys.argv[4]) if len(sys.argv)>4 else np.pi/2) for nm in sys.argv[3].split(',')]
    out=Image.new('RGB',(ims[0].width,sum(i.height for i in ims)));y=0
    for i in ims:out.paste(i,(0,y));y+=i.height
    out.save('render/lib.png')
