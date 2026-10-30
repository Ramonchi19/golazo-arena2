import sys,json,glob;sys.path.insert(0,'tools')
from clips import *
from canon import B,glb_bytes,gname
FPS=30
REF=Rig('nuevo/canon2/zurdito.glb')   # esqueleto canónico de referencia (jerarquía y nombres)
names=[REF.nodes[j]['name'] for j in REF.joints if not REF.nodes[j]['name'].endswith(('_End','_end','4'))]
par={}
for j in REF.joints:
    n=REF.nodes[j]['name'];p=REF.parent[j];par[n]=REF.nodes[p]['name'] if p>=0 and REF.nodes[p]['name'] in names else None
MIR=lambda n:n.replace('Left','#').replace('Right','Left').replace('#','Right')
def mq(q):return np.array([q[0],-q[1],-q[2],q[3]])
class OldSrc(Src):
    """animaciones viejas del juego (anims.glb / base_anims.glb) sobre el esqueleto viejo (zurdito)"""
    def __init__(s,lib,name):
        s.r=Rig('/home/claude/repo/assets/models/zurdito.glb');s.m={gname(s.r.nodes[j].get('name','')):j for j in s.r.joints}
        L=Rig.__new__(Rig);import struct as st;b=open(lib,'rb').read();jl=st.unpack('<I',b[12:16])[0];L.js=json.loads(b[20:20+jl]);L.bin=b[20+jl+8:]
        a=next(a for a in L.js['animations'] if a['name']==name);s.ch=[];s.hipT=None
        for c in a['channels']:
            sm=a['samplers'][c['sampler']];t=L.acc(sm['input']).ravel();v=L.acc(sm['output']);nm=L.js['nodes'][c['target']['node']].get('name','')
            if c['target']['path']=='translation' and nm=='Hips':s.hipT=(t,v);continue
            if c['target']['path']=='rotation' and nm in s.r.name:s.ch.append((s.r.name[nm],'rotation',t,v,'LINEAR'))
        s.dur=max(c[2][-1] for c in s.ch);s.rest=norm_rest(s.r,s.m)
        h=81.379 if 'base_anims' in lib else 96.956;s.hipH=h;s.hip0=np.array([0,h,0.])
        if s.hipT is None:s.hipT=(np.array([0.,s.dur]),np.array([s.hip0,s.hip0]))
    def frame(s,t):
        setpose(s.r,s.ch,t);D={k:qnorm(qmul(s.r.wrot(i),qinv(s.rest[k]))) for k,i in s.m.items()}
        ts,v=s.hipT;hp=np.array([np.interp(t,ts,v[:,k]) for k in range(3)]);return D,hp
def bake(src,t0,t1,mirror=False,fps=FPS):
    n=max(2,int(round((t1-t0)*fps))+1);ts=np.linspace(t0,t1,n);out={k:[] for k in names};hip=[];feet=[];W=[]
    for t in ts:
        D,hp=src.frame(t)
        if mirror:D={MIR(k):mq(q) for k,q in D.items()}
        for k in names:
            q=D.get(k,np.array([0,0,0,1.]));p=par[k];pq=D.get(p,np.array([0,0,0,1.])) if p else np.array([0,0,0,1.])
            if p is None and k!='Hips':pq=D.get('Hips',pq)
            out[k].append(qnorm(qmul(qinv(pq),q)))
        h=(hp-src.hip0)/src.hipH
        if mirror:h[0]=-h[0]
        hip.append(h)
    for k in names:
        v=out[k]
        for i in range(1,len(v)):
            if np.dot(v[i],v[i-1])<0:v[i]=-v[i]
    return ts-t0,out,np.array(hip)

def energy(src,ts,mirror=False):
    prev=None;e=[]
    for t in ts:
        D,_=src.frame(t);v=np.array([D[k] for k in ('LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftArm','RightArm','LeftForeArm','RightForeArm','Spine01','Head') if k in D])
        e.append(0 if prev is None else float(np.abs(np.abs((v*prev).sum(1))-1).sum()));prev=v
    return np.array(e)
def trim(src):
    ts=np.arange(0,src.dur+1e-6,1/FPS);e=energy(src,ts);sm=np.convolve(e,np.ones(5)/5,'same');th=sm.max()*.04
    act=np.where(sm>th)[0];a=ts[max(0,act[0]-4)];b=ts[min(len(ts)-1,act[-1]+6)];return float(a),float(b)
def loopwin(src,lo=.45,hi=2.4):
    ts=np.arange(.3,src.dur-.1,1/FPS);P=[];H=[]
    for t in ts:
        D,hp=src.frame(t);P.append(np.array([D[k] for k in ('LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftArm','RightArm','Spine01')]));H.append(hp[1])
    P=np.array(P);H=np.array(H);best=(9,0,0)
    for i in range(0,len(ts)//2):
        for j in range(i+int(lo*FPS),min(len(ts),i+int(hi*FPS))):
            d=np.abs(np.abs((P[i]*P[j]).sum(-1))-1).sum()+abs(H[i]-H[j])/src.hipH
            d+= (ts[j]-ts[i])*.002
            if d<best[0]:best=(d,ts[i],ts[j])
    return best
FOOT=('LeftToeBase','RightToeBase');HAND=('LeftHand','RightHand')
def keytime(src,a,b,what):
    ts=np.arange(a,b,1/FPS);r=src.r;prev=None;sp=[]
    for t in ts:
        src.frame(t)
        if what=='head':sp.append(r.G[src.m['Head']][1,3]);continue
        bs=FOOT if what=='foot' else HAND;p=np.array([r.G[src.m[x]][:3,3] for x in bs])
        sp.append(0 if prev is None else np.linalg.norm(p-prev,axis=1).max());prev=p
    return float(ts[int(np.argmax(sp))]-a)
def floor_speed(src,a,b):
    """carrera en su lugar: rapidez con que el pie apoyado se va para atrás (en alturas de cadera por segundo)"""
    ts=np.arange(a,b,1/FPS);r=src.r;prev=None;v=[]
    for t in ts:
        src.frame(t);p=np.array([r.G[src.m[x]][:3,3]-r.G[src.m['Hips']][:3,3]*[1,0,1] for x in FOOT])
        if prev is not None:
            k=int(np.argmin(p[:,1]));v.append((prev[k,2]-p[k,2])*FPS)
        prev=p
    return max(.5,float(np.median(v)))/src.hipH

# (nombre en el juego, archivo, tipo, opciones)   tipo: loop | once ; key: foot/hand/head ; side: 'l' -> el archivo va hacia la izquierda del personaje (+x)
NEW=[('sprint','correr','loop',{}),('jog','trottar','loop',{}),
 ('receive','recibir pase 2 normal','once',{'key':'foot'}),
 ('pass_r','pase 2 mas ligero','once',{'key':'foot'}),('pass_l','pase 2 mas ligero','once',{'key':'foot','mirror':1}),
 ('shoot_run','tiro fuerte','once',{'key':'foot'}),('chip','centro','once',{'key':'foot'}),('shoot_quick','tiro rapido con prisa, ','once',{'key':'foot'}),
 ('header','cabezaszo','once',{'key':'head'}),('bicycle','chilena','once',{'key':'foot'}),
 ('tackle1','barrida','once',{'key':'foot'}),('tackle2','barrida','once',{'key':'foot','mirror':1}),
 ('swipe_in','zarpazo hacia adentro','once',{'key':'hand'}),('swipe_out','zarpazo hacia afuera','once',{'key':'hand'}),
 ('trip','tropezar','once',{'key':'foot'}),('stumble','tropezar','once',{}),
 ('fly_back','salir volando','once',{'key':'start'}),('knocked','salir volando','once',{'key':'start'}),
 ('getup','levantarse 3','once',{}),('getup_slow','levantarse 2','once',{}),('getup_front','levantarse','once',{}),
 ('electro','electrocutado','loop',{'lo':1.0}),('dizzy','mareado','once',{'loop':1}),
 ('angry','enojo portero','once',{}),('disappointed','lamento','once',{}),('sad1','lamento','once',{}),
 ('gk_idle','esperando brazos semiabiertos','loop',{'lo':1.6,'hi':3.5}),('gk_idle_low','Esperando agachado','loop',{'lo':1.6,'hi':3.5}),
 ('gk_step_l','lado a lado brazos abiertos','loop',{'hi':3.6}),('gk_step_r','lado a lado brazos abiertos','loop',{'hi':3.6,'mirror':1}),
 ('gk_dive_l','lanzarse','once',{'key':'hand','side':1}),('gk_dive_r','lanzarse','once',{'key':'hand','side':1,'mirror':1}),
 ('gk_dive_high_l','lanzarse','once',{'key':'hand','side':1}),('gk_dive_high_r','lanzarse','once',{'key':'hand','side':1,'mirror':1}),
 ('gk_dive_low_l','lanzarse','once',{'key':'hand','side':1}),('gk_dive_low_r','lanzarse','once',{'key':'hand','side':1,'mirror':1}),
 ('gk_getup_ball','levantarse despues de atajar balon en mano','once',{}),
 ('gk_catch_high','agarrr arriba al centro','once',{'key':'hand'}),('gk_catch_jump','agarrr arriba al centro','once',{'key':'hand'}),
 ('gk_catch_chest','agarrar balon al medio arriba del pecho','once',{'key':'hand'}),('gk_catch_belly','agarrar balon al medio arriba del pecho','once',{'key':'hand'}),
 ('gk_scoop','agarrar cuando viene rodando','once',{'key':'hand'}),
 ('gk_dropkick','despeje largo','once',{'key':'foot'}),('gk_throw','saque de manos','once',{'key':'hand'}),('gk_roll','saque con la mano por abajo','once',{'key':'hand'}),
 ('gk_block_l','manotazo 2','once',{'key':'hand','side':1}),('gk_block_r','manotazo 2','once',{'key':'hand','side':1,'mirror':1}),
 ('gk_slap_high','manotazo 1','once',{'key':'hand'}),
 ('gk_punch1','golpe portero 1','once',{'key':'hand'}),('gk_punch2','golpe portero 2','once',{'key':'hand'}),
 ('gk_miss','lamento','once',{})]
OLDKEEP=['idle_ball','turn180','run_to_turn','turn_to_run','strafe_l','walkstrafe_l','back_diag_r','back_diag_l','jog_back','fwd_diag','hit_side1','hit_side2','hit_back','sad2','victory1','victory2','cheer','cheer2','fistpump','dance','hiphop','silly','gk_place','gk_backpedal','gk_direct']
def build(out_glb,out_json):
    OM=json.load(open('/home/claude/repo/assets/anims.json'));b=B();js=b.js;nodes=[{'name':n} for n in names];js['nodes']=nodes;js['scenes']=[{'nodes':list(range(len(names)))}];js['scene']=0
    nid={n:i for i,n in enumerate(names)};anims=[];meta={'_hips':[0,100,0]};cache={}
    def add(name,ts,rot,hip,m):
        ti=b.add(np.asarray(ts,np.float32).reshape(-1,1),'SCALAR',mm=True);ch=[];sm=[]
        for k,v in rot.items():
            o=b.add(np.asarray(v,np.float32),'VEC4');sm.append({'input':ti,'output':o,'interpolation':'LINEAR'});ch.append({'sampler':len(sm)-1,'target':{'node':nid[k],'path':'rotation'}})
        hp=np.asarray(hip)*100+[0,100,0];o=b.add(hp.astype(np.float32),'VEC3');sm.append({'input':ti,'output':o,'interpolation':'LINEAR'});ch.append({'sampler':len(sm)-1,'target':{'node':nid['Hips'],'path':'translation'}})
        anims.append({'name':name,'channels':ch,'samplers':sm});meta[name]=m
    for name,f,kind,o in NEW:
        if f not in cache:cache[f]=Src(f'nuevo/an/{f}.glb')
        s=cache[f];mir=bool(o.get('mirror'))
        if kind=='loop':
            _,a,c=loopwin(s,lo=o.get('lo',.45),hi=o.get('hi',2.4));ts,rot,hip=bake(s,a,c,mir)
            for k in rot:rot[k][-1]=rot[k][0]
            hip[-1]=hip[0];v=floor_speed(s,a,c) if name in('sprint','jog') else 0
            m={'dur':round(float(ts[-1]),3),'loop':1,'root':[0,round(v*float(ts[-1]),3)]}
        else:
            a,c=trim(s)
            if o.get('side'):   # ¿hacia qué lado va el archivo?
                _,h0=s.frame(a);_,h1=s.frame(a+(c-a)*.5);goes_left=(h1-h0)[0]>0
                if not goes_left:mir=not mir
            ts,rot,hip=bake(s,a,c,mir);d=float(ts[-1]);m={'dur':round(d,3),'loop':int(o.get('loop',0))}
            k=o.get('key')
            if k=='start':m['key']=.1
            elif k:m['key']=round(keytime(s,a,c,k),3)
            hx=hip[:,[0,2]];m['root']=[round(float(x),2) for x in hx[-1]-hx[0]];m['rootTrack']=[[round(float(x),2) for x in hx[i]-hx[0]] for i in range(0,len(hx),3)]
            if name.startswith('gk_dive'):
                ki=int(m.get('key',.4)*FPS);yy=hip[:,1];low=np.where(yy[ki:]<yy.min()*.7)[0];m['land']=round((ki+(low[0] if len(low) else 0))/FPS,2)
        add(name,ts,rot,hip,m);print(name,f[:20],m.get('dur'),m.get('key'),m.get('root'))
    for name in OLDKEEP+['idle','run','kick']:
        lib='/home/claude/repo/assets/'+('base_anims.glb' if name in('idle','run','kick') else 'anims.glb')
        try:s=OldSrc(lib,name)
        except StopIteration:print('falta',name);continue
        ts,rot,hip=bake(s,0,s.dur);mm=dict(OM.get(name,{'loop':1 if name in('idle','run') else 0}));mm['dur']=round(float(ts[-1]),3);add(name,ts,rot,hip,mm);print('viejo',name,mm['dur'])
    js['animations']=anims;open(out_glb,'wb').write(glb_bytes(js,b.bin));json.dump(meta,open(out_json,'w'),separators=(',',':'))
if __name__=='__main__':build(sys.argv[1],sys.argv[2])
