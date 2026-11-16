/* v238 — PORTERO NUEVO (lo de la página de prueba, metido al juego)
   - Animaciones horneadas al esqueleto común (assets/anims_gk.glb, hechas con tools/claude/gk_demo_bake.py + gk_atletico.py + gk_ajustes.py)
   - Pasos mezclados según hacia dónde se mueve (de lado / al frente / atrás) mirando siempre al balón
   - Atajadas encadenadas sin cortes: cada animación entra mezclándose con la anterior; los tiempos de contacto están MEDIDOS
     y la animación arranca justo para que las manos (o el pie, o el puño) lleguen cuando llega el balón
   - Dedos que aprietan el balón, puño cerrado al despejar de puño, palmas planas al desviar
   - Mientras tiene el balón voltea a ver a sus compañeros (analiza), y al sacar gira hacia donde va a mandarlo
   - Seguro: si alguna vez la pose se rompe (cadera fuera de lugar o valores inválidos) se reinicia al instante (nunca desaparece)
   La lógica (si ataja o no, a dónde rebota) sigue en assets/sim/match.js; aquí solo se dibuja lo que la lógica decidió. */
(function(){
const G2={lib:null,cv:{},ready:false,log:{n:0,last:''},on:true};window.GK2=G2;
const ACT=['gk_estrella','gk_recoge','gk_dive_l','gk_getup_ball','gk_catch_jump','gk_scoop','gk_throw','gk_roll','gk_punch1','gk_miss','gk_dropkick','gk_block_l','gk_slap_high'];
// tiempos de contacto medidos en cada animación (segundos del clip) y el tramo que se usa
const K={
  dive:{n:'gk_dive_l',from:.9,to:2.3,ts:2.5,key:1.7},diveEnd:{n:'gk_dive_l',from:2.3,to:2.8,ts:2.8},getup:{n:'gk_getup_ball',from:.5,to:2.9,ts:3.0,drift:1},
  pie:{n:'gk_estrella',from:.3,to:1.15,ts:2.3,key:.95},pieEnd:{n:'gk_estrella',from:2.55,to:3.3,ts:2.4},
  puno:{n:'gk_punch1',from:.85,to:2.5,ts:2.4,key:1.38},
  slap:{n:'gk_slap_high',from:1.25,to:2.75,ts:2.3,key:2.067},
  alta:{n:'gk_catch_jump',from:1.2,to:2.7,ts:2.3,key:1.95},
  recoge:{n:'gk_recoge',from:.3,to:3.6,ts:2.4,key:1.55,drift:1},
  achique:{n:'gk_recoge',from:.3,to:3.6,ts:2.7,key:1.55,drift:1},
  agarra:{n:'gk_recoge',from:1.3,to:3.6,ts:2.6},
  throw:{n:'gk_throw',from:.8,to:3.0,ts:2.4,key:2.0,drift:1},roll:{n:'gk_roll',from:.6,to:3.1,ts:2.3,key:1.78,drift:1},
  kick:{n:'gk_dropkick',from:1.45,to:2.9,ts:2.2,key:2.03,drift:1},
  block:{n:'gk_block_l',from:.35,to:2.2,ts:2.7,key:1.07},
  miss:{n:'gk_miss',from:.5,to:3.4,ts:2.0}};
const VMAXL=5.2,VMAXF=4.2,LOOPS=['gk_base','gk_lado','gk_lado_l','gk_frente','atras'];
const _fa=new THREE.Vector3(),_fb=new THREE.Vector3(),_fc=new THREE.Vector3(),_v=new THREE.Vector3(),_v2=new THREE.Vector3(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_up=new THREE.Vector3(0,1,0);
function mirrorBone(s){return s.replace(/Left/g,'#L#').replace(/Right/g,'Left').replace(/#L#/g,'Right');}
function mirror(c,name){const tr=c.tracks.map(t=>{const u=t.clone(),dot=u.name.lastIndexOf('.'),prop=u.name.slice(dot);u.name=mirrorBone(u.name.slice(0,dot))+prop;const v=u.values;
    if(prop==='.quaternion'){for(let i=0;i<v.length;i+=4){v[i+1]=-v[i+1];v[i+2]=-v[i+2];}}else if(prop==='.position'){for(let i=0;i<v.length;i+=3)v[i]=-v[i];}return u;});
  return new THREE.AnimationClip(name,c.duration,tr);}
// saca de la cadera lo que avanza y lo que gira (se mueve el personaje entero por código, así no se patina ni da vueltas solo)
function rootify(c){const t=c.tracks.find(x=>/Hips\.position$/.test(x.name));if(!t)return null;const v=t.values,x0=v[0],z0=v[2],cv={t:Array.from(t.times),x:[],z:[],yt:[0],y:[0]};
  for(let i=0;i<v.length;i+=3){cv.x.push(v[i]-x0);cv.z.push(v[i+2]-z0);v[i]=x0;v[i+2]=z0;}
  const rq=c.tracks.find(x=>/Hips\.quaternion$/.test(x.name));if(rq){const q=new THREE.Quaternion(),f=new THREE.Vector3(),qy=new THREE.Quaternion(),Y=[],w=rq.values;let y0=null,prev=0;
    for(let i=0;i<w.length;i+=4){q.fromArray(w,i);f.set(0,0,1).applyQuaternion(q);let y=Math.atan2(f.x,f.z);if(y0===null)y0=y;let d=y-y0;while(d-prev>Math.PI)d-=2*Math.PI;while(d-prev<-Math.PI)d+=2*Math.PI;prev=d;Y.push(d);
      qy.setFromAxisAngle(_up,-d);q.premultiply(qy).toArray(w,i);}
    cv.yt=Array.from(rq.times);cv.y=Y;}
  return cv;}
const L=(a,b,t)=>a+(b-a)*t;
function cvAt(cv,t){if(!cv)return [0,0];const T=cv.t;if(t<=T[0])return [cv.x[0],cv.z[0]];for(let i=1;i<T.length;i++)if(t<=T[i]){const u=(t-T[i-1])/(T[i]-T[i-1]);return [L(cv.x[i-1],cv.x[i],u),L(cv.z[i-1],cv.z[i],u)];}const n=T.length-1;return [cv.x[n],cv.z[n]];}
function yAt(cv,t){if(!cv)return 0;const T=cv.yt;if(t<=T[0])return cv.y[0];for(let i=1;i<T.length;i++)if(t<=T[i]){const u=(t-T[i-1])/(T[i]-T[i-1]);return L(cv.y[i-1],cv.y[i],u);}return cv.y[T.length-1];}
G2.load=async function(){if(G2.lib||typeof THREE==='undefined'||!THREE.GLTFLoader)return;
  try{const buf=await fetch('assets/anims_gk.glb?v=238').then(r=>{if(!r.ok)throw new Error('anims_gk');return r.arrayBuffer();});
    await new Promise((res,rej)=>new THREE.GLTFLoader().parse(buf,'',gl=>{const C={};for(const c of gl.animations)C[c.name]=c;
      C.gk_lado_l=mirror(C.gk_lado,'gk_lado_l');C.atras=C.gk_frente.clone();C.atras.name='atras';
      for(const n of ACT){if(!C[n])continue;const m=mirror(C[n],n+'_m');C[n+'_m']=m;G2.cv[n]=rootify(C[n]);G2.cv[n+'_m']=rootify(m);}
      G2.lib=C;G2.ready=true;res();},rej));}catch(e){console.warn('portero nuevo',e);G2.ready=false;}};
// ---------- estado por personaje ----------
function setup(p,m){const B=m.bones,S={A:{},w:{gk_base:1,gk_lado:0,gk_lado_l:0,gk_frente:0,atras:0,run:0},seq:null,hold:null,off:{x:0,z:0,y:0},offK:0,ev:{},H:{},scan:0,u:(B.hipsWorldH||1)/100};
  const act=n=>{if(S.A[n])return S.A[n];const c=G2.lib[n];if(!c)return null;const a=m.mixer.clipAction(c);if(!LOOPS.includes(n)){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;}S.A[n]=a;return a;};
  S.act=act;for(const n of LOOPS){const a=act(n);a.play();a.setEffectiveWeight(0);if(n==='atras')a.timeScale=-1;}
  // manos: palma (hacia adentro) en el espacio del hueso y los dedos (para apretar el balón / cerrar el puño / dejar la mano plana)
  const bn={};B.model.traverse(o=>{if(o.isBone)bn[o.name]=o;});m.root.updateMatrixWorld(true);
  for(const sd of ['Left','Right']){const h=bn[sd+'Hand'],mi=bn[sd+'HandMiddle1'],ix=bn[sd+'HandIndex1'],pk=bn[sd+'HandPinky1'];if(!h||!mi||!ix||!pk)continue;
    const P=o=>o.getWorldPosition(new THREE.Vector3()),hp=P(h),f=P(mi).sub(hp),sv=P(ix).sub(P(pk)),n=new THREE.Vector3().crossVectors(f,sv).normalize().multiplyScalar(sd==='Left'?1:-1);
    const q=new THREE.Quaternion();h.getWorldQuaternion(q);q.invert();
    const F=[];for(const fn of ['Index','Middle','Ring','Pinky','Thumb']){const js=[1,2,3].map(i=>bn[sd+'Hand'+fn+i]);let tip=bn[sd+'Hand'+fn+'4'];if(!js.every(Boolean))continue;if(!tip)tip=null;F.push({fn,js,tip});}
    S.H[sd]={b:h,palm:n.applyQuaternion(q).normalize(),F,g:0,fs:[]};}
  m._g2=S;return S;}
// ---------- secuencias ----------
function stepOf(spec,o){return Object.assign({},spec,o||{});}
// arranca la secuencia; si el contacto llega después de lo que tarda la animación, espera (nunca la pone en cámara lenta)
function begin(p,m,S,kind,steps,lead){const s0=steps[0];let wait=0;
  if(s0.key!=null&&lead!=null){const need=(s0.key-s0.from)/s0.ts;if(lead>need)wait=lead-need;else s0.from=Math.max(0,s0.key-lead*s0.ts);}
  if(S.seq)endSeq(p,m,S,true);
  S.seq={kind,steps,i:-1,a:null,prev:null,xf:1,w:S.hold?1:0,wait,fired:false,bx:0,bz:0,by:0,ending:false};S.hold=S.hold||null;
  if(wait<=0)next(p,m,S);}
function next(p,m,S){const Q=S.seq;
  if(Q.i>=0&&Q.a){const st=Q.steps[Q.i],cv=G2.cv[st.n];if(cv){const d=cvAt(cv,st.to),d0=cvAt(cv,st.from);if(st.drift){const r=rot(d[0]-d0[0],d[1]-d0[1],Q.by,S);Q.bx+=r[0];Q.bz+=r[1];}Q.by+=yAt(cv,st.to)-yAt(cv,st.from);}}
  Q.i++;
  if(Q.i>=Q.steps.length){Q.ending=true;return;}
  const st=Q.steps[Q.i],a=S.act(st.n);if(!a){Q.ending=true;return;}
  Q.prev=Q.a&&Q.a!==a?Q.a:(Q.i===0&&S.hold&&S.hold!==a?S.hold:null);if(Q.i===0&&S.hold&&S.hold!==a)S.hold=null;
  Q.xf=Q.prev?0:1;a.reset();a.time=st.from;a.timeScale=st.ts;a.setEffectiveWeight(0);a.play();Q.a=a;Q.fired=false;}
function rot(dx,dz,by,S){const y=(S.face||0)+by,c=Math.cos(y),s=Math.sin(y),u=S.u;return [(dx*c+dz*s)*u,(-dx*s+dz*c)*u];}
function endSeq(p,m,S,interrupt){const Q=S.seq;if(!Q)return;
  // lo que avanzó con la animación se queda (sin regresar patinando): fuera de línea se pasa a su posición real
  S.seqOffX=(S.off.x||0);S.seqOffZ=(S.off.z||0);
  if(!window.ONLINE&&!interrupt&&(Math.abs(S.off.x)+Math.abs(S.off.z))>.01&&!(p.dive>0)){p.x+=S.off.x;p.z+=S.off.z;S.off.x=S.off.z=0;}
  if(Q.a&&ball.gk===p&&!interrupt){S.hold=Q.a;Q.a.timeScale=0;}   // se queda con el balón en la última pose
  else if(Q.a&&interrupt&&Q.a!==S.hold){}
  S.seq=null;}
// ---------- elegir qué hacer según lo que decidió la lógica ----------
function sideOf(p,dz,dx){const r=-Math.cos(p.face)*(dx||0)+Math.sin(p.face)*dz;return r>0?'r':'l';}
function events(p,m,S){const E=S.ev,mir=(spec,sd)=>stepOf(spec,{n:spec.n+(sd==='r'?'_m':'')});
  const held=ball.gk===p;
  // estirada (a su izquierda = la animación tal cual; a su derecha = en espejo)
  if(p.dive>0&&!E.dive){E.dive=1;const sd=sideOf(p,p.diveDir||1),arr=Math.max(.05,p.diveArrive||.12);
    begin(p,m,S,'dive',[mir(K.dive,sd)],arr);S.seq.sd=sd;return;}
  if(!(p.dive>0))E.dive=0;
  if(p.smother>0&&!E.sm){E.sm=1;begin(p,m,S,'achique',[stepOf(K.achique)],.22);return;}
  if(!(p.smother>0))E.sm=0;
  // manotazo al que trae el balón pegado (rápido)
  if(p.swipeT>0&&!E.sw){E.sw=1;const sd=p.swipeTgt?sideOf(p,p.swipeTgt.z-p.z,p.swipeTgt.x-p.x):'l';begin(p,m,S,'swipe',[mir(K.block,sd)],Math.max(.05,p.swipeHit||.25));return;}
  if(!(p.swipeT>0))E.sw=0;
  // despeje de patada (balón suelto en el área con un rival cerca)
  if(p.clearT>0&&!E.cl){E.cl=1;begin(p,m,S,'despeje',[stepOf(K.kick)],p.clearT);return;}
  if(!(p.clearT>0))E.cl=0;
  // atajada de frente: según la altura y la fuerza (lo mismo que decide la lógica)
  if(p.prepT>0&&!E.pr){E.pr=1;const k=p.prepKind||'puno',sd=sideOf(p,p.prepZ||1),lead=Math.max(.04,p.prepT);
    if(k==='pie')begin(p,m,S,'pie',[mir(K.pie,sd),mir(K.pieEnd,sd)],lead);
    else if(k==='recoge')begin(p,m,S,'recoge',[stepOf(K.recoge)],lead);
    else if(k==='alta')begin(p,m,S,'alta',[stepOf(K.alta)],lead);
    else if(k==='slap')begin(p,m,S,'slap',[mir(K.slap,sd)],lead);
    else begin(p,m,S,'puno',[stepOf(K.puno)],lead);
    return;}
  if(!(p.prepT>0)&&!(p.alert))E.pr=0;
  if(p.highT>0&&!E.hi&&!held&&!S.hold&&!(S.seq&&S.seq.kind==='alta')){E.hi=1;begin(p,m,S,'alta',[stepOf(K.alta)],.1);return;}
  if(!(p.highT>0))E.hi=0;
  // la lógica despejó sin aviso (rebote cercano, balón que no venía leído como tiro): golpe inmediato con la parte que le pegó
  if(p.saveT>.6&&!E.sv&&/^(puno|pie|slap)$/.test(p.saveKind||'')&&!(S.seq&&/^(puno|pie|slap|dive)$/.test(S.seq.kind))){E.sv=1;const sd=sideOf(p,p.saveZ||1),k=p.saveKind,spec=k==='pie'?mir(K.pie,sd):k==='slap'?mir(K.slap,sd):stepOf(K.puno);
    spec.from=Math.max(spec.from,spec.key-.06*spec.ts);begin(p,m,S,k,[spec],null);return;}
  if(!(p.saveT>.6))E.sv=0;
  if(p.saveT>0&&p.saveKind==='fallo'&&!(p.dive>0)&&!E.mi&&(p.saveY||0)>1.6&&!S.seq){E.mi=1;begin(p,m,S,'miss',[stepOf(K.miss)],null);return;}
  if(!(p.saveT>0))E.mi=0;
  // saque: gira hacia donde lo va a mandar (lo hace el giro suave del cuerpo) y la animación suelta el balón justo cuando sale
  if(p.distrib&&!E.di){E.di=1;const t=p.distrib.type,spec=t==='mano'?K.throw:t==='corto'?K.roll:K.kick,rel=(G2REL[t]||.5)-(p.distrib.t||0);
    begin(p,m,S,'saque',[stepOf(spec)],Math.max(.05,rel));return;}
  if(!p.distrib)E.di=0;
  // la agarró sin animación que la llevara (balón suelto a sus pies): se agacha y la recoge
  if(held&&!E.hd){E.hd=1;if(!S.seq||!/^(dive|recoge|achique|alta|agarra)$/.test(S.seq.kind))begin(p,m,S,'agarra',[stepOf(K.agarra)],null);}
  if(!held)E.hd=0;}
const G2REL={mano:.6,corto:.6,largo:.45};G2.REL=G2REL;
// continúa la estirada: si la atrapó se levanta con ella; si la desvió termina la caída y se levanta
function diveFollow(p,m,S){const Q=S.seq;if(!Q||Q.kind!=='dive'||Q.followed)return;if(Q.i!==Q.steps.length-1)return;const st=Q.steps[Q.i];if(!Q.a||Q.a.time<st.key-.02)return;
  Q.followed=true;const sd=Q.sd||'l';if(ball.gk===p)Q.steps.push(stepOf(K.getup));else{Q.steps.push(stepOf(K.diveEnd,{n:K.diveEnd.n+(sd==='r'?'_m':'')}));Q.steps.push(stepOf(K.getup));}}
function seqStep(p,m,S,dt){const Q=S.seq;
  if(Q.wait>0){Q.wait-=dt;if(Q.wait<=0)next(p,m,S);else{Q.w=Math.max(Q.w,0);return 0;}}
  if(!Q.ending){const st=Q.steps[Q.i];if(st.key!=null&&!Q.fired&&Q.a.time>=st.key){Q.fired=true;}
    diveFollow(p,m,S);
    if(Q.a.time>=st.to-1e-3){if(Q.i===Q.steps.length-1&&ball.gk===p&&!p.distrib){endSeq(p,m,S,false);return 1;}next(p,m,S);}}
  Q.w=Q.ending?Math.max(0,Q.w-dt/.2):Math.min(1,Q.w+dt/.08);Q.xf=Math.min(1,Q.xf+dt/.09);
  if(Q.prev){Q.prev.setEffectiveWeight(Q.w*(1-Q.xf));if(Q.xf>=1){Q.prev.stop();Q.prev=null;}}
  if(Q.a)Q.a.setEffectiveWeight(Q.w*(Q.prev?Q.xf:1));
  let ox=0,oz=0,oy=0;if(!Q.ending&&Q.a){const st=Q.steps[Q.i],cv=G2.cv[st.n];if(cv){const d=cvAt(cv,Q.a.time),d0=cvAt(cv,st.from);if(st.drift){const r=rot(d[0]-d0[0],d[1]-d0[1],Q.by,S);ox=r[0];oz=r[1];}oy=yAt(cv,Q.a.time)-yAt(cv,st.from);}}
  S.off.x=Q.bx+ox;S.off.z=Q.bz+oz;S.off.y=Q.by+oy;
  if(Q.ending&&Q.w<=0){if(Q.a)Q.a.stop();if(Q.prev)Q.prev.stop();endSeq(p,m,S,false);return 0;}
  if(Q.ending&&ball.gk===p){endSeq(p,m,S,false);return 1;}
  return Q.w;}
// ---------- dedos ----------
const CURL={f:[.7,.95,.8],t:[.3,.45,.35]},FIST={f:[1.35,1.6,1.25],t:[.55,.8,.6]};
function fingers(p,m,S,dt){const Q=S.seq,kind=Q&&!Q.ending?Q.kind:null,held=ball.gk===p,one=p.distrib&&(p.distrib.type==='mano'||p.distrib.type==='corto');
  const flat=kind==='slap'||(kind==='dive'&&!held&&Q&&Q.a&&Q.a.time<(K.dive.key+.2)),fist=kind==='puno';
  m.root.updateMatrixWorld(true);
  for(const sd of ['Left','Right']){const h=S.H[sd];if(!h)continue;
    let tg=held?(one&&sd==='Left'?0:1):0;if(flat&&!held)tg=-.35;if(fist)tg=1;
    h.g+=(tg-h.g)*Math.min(1,dt*(tg>h.g?(fist?24:16):12));if(Math.abs(h.g)<.01)continue;
    h.b.getWorldQuaternion(_q);const n=_v2.copy(h.palm).applyQuaternion(_q).normalize();
    for(const f of h.F){const C=fist?FIST:CURL,amt=f.fn==='Thumb'?C.t:C.f;
      for(let i=0;i<3;i++){const j=f.js[i],nx=i<2?f.js[i+1]:f.tip;if(!nx)continue;j.updateMatrixWorld(true);
        const a=j.getWorldPosition(_fa),b=nx.getWorldPosition(_fb),d=b.sub(a).normalize();   // v239: sin crear objetos cada cuadro
        const ax=_fc.crossVectors(d,n);if(ax.lengthSq()<1e-6)continue;ax.normalize();
        j.getWorldQuaternion(_q2);ax.applyQuaternion(_q2.invert());
        const sv=h.fs.length<(h.fp||(h.fp=[])).length?h.fp[h.fs.length]:(h.fp[h.fs.length]=[null,new THREE.Quaternion()]);sv[0]=j;sv[1].copy(j.quaternion);h.fs.push(sv);j.quaternion.multiply(_q2.setFromAxisAngle(ax,amt[i]*h.g));}}}}
function restoreFingers(S){for(const k in S.H){const h=S.H[k];for(const [b,q] of h.fs)b.quaternion.copy(q);h.fs.length=0;}}
// ---------- seguro: nunca desaparece ----------
function guard(p,m,S){const B=m.bones,h=B.hips&&B.hips.b;if(!h)return;h.getWorldPosition(_v);const H=(B.hipsWorldH||1);
  const bad=!isFinite(_v.x+_v.y+_v.z)||Math.hypot(_v.x-m.root.position.x,_v.z-m.root.position.z)>H*4||_v.y<-H||_v.y>H*6;
  if(!bad)return;G2.log.n++;G2.log.last=((p.card&&p.card.id)||'?')+':'+(S.seq?S.seq.kind:'pasos');
  for(const o of B.all){o.b.position.copy(o.p0);o.b.quaternion.copy(o.q0);o.b.scale.copy(o.s0);}
  for(const k in S.A){const a=S.A[k];if(!LOOPS.includes(k))a.stop();}S.seq=null;S.hold=null;S.off.x=S.off.z=S.off.y=0;
  for(const n of LOOPS){S.w[n]=n==='gk_base'?1:0;}if(!isFinite(p.x)||!isFinite(p.z)){p.x=p.x||0;p.z=p.z||0;}}
// ---------- cada cuadro ----------
// regresa true si este cuadro lo dibuja el portero nuevo
G2.anim=function(p,m,dt){
  if(!G2.ready||!G2.on||!p.gk||!m||!m.glb||!m.bones||!m.bones.hips||!m.mixer)return false;
  const react=p.react||p.stun>0||p.elecT>0||p.flyY>.05||p.flyVy>0||p.slip>0||p.spinT>0;
  let S=m._g2;
  if(react){if(S&&S.on){S.on=false;for(const k in S.A){const a=S.A[k];if(a.enabled&&a.getEffectiveWeight()>0){try{softOut(a,.15);}catch(e){a.stop();}}}S.seq=null;S.hold=null;S.off.x=S.off.z=S.off.y=0;m.curA=null;restoreFingers(S);}return false;}
  if(!S)S=setup(p,m);
  if(!S.on){S.on=true;   // toma el control: lo que estuviera sonando se apaga suave
    if(m.L)for(const k in m.L){const x=m.L[k];if(x.enabled&&x.getEffectiveWeight()>0&&!Object.values(S.A).includes(x)){try{softOut(x,.15);}catch(e){x.stop();}}}
    if(m.A)for(const k in m.A){const x=m.A[k];if(x.enabled&&x.getEffectiveWeight()>0){try{softOut(x,.15);}catch(e){x.stop();}}}
    for(const n of LOOPS){const a=S.A[n];if(!a.isRunning())a.play();}}
  S.face=p._vface==null?p.face:p._vface;
  events(p,m,S);
  // pasos: pesos según la velocidad vista desde el portero (mira al balón)
  const vx=window.ONLINE&&p._mv!=null?p.vx:p.vx,vz=p.vz,sp=Math.hypot(vx,vz),cy=Math.cos(S.face),sy=Math.sin(S.face),lx=vx*cy-vz*sy,lz=vx*sy+vz*cy;
  const sx=Math.abs(lx)/VMAXL,sz=Math.abs(lz)/VMAXF,mv=Math.min(1,Math.max(sx,sz)/.12),fx=sx/(sx+sz+1e-6);
  const run=sp>5.4&&lz>sp*.6?Math.min(1,(sp-5.4)/1.4):0;   // corriendo a fondo (salida): carrera normal
  const tgt={gk_base:1-mv,gk_lado:lx<0?mv*fx:0,gk_lado_l:lx>0?mv*fx:0,gk_frente:lz>0?mv*(1-fx)*(1-run):0,atras:lz<0?mv*(1-fx):0,run};
  let seqW=0;if(S.seq)seqW=seqStep(p,m,S,dt);
  const holdW=S.hold&&!S.seq?1:(S.hold&&S.seq?Math.max(0,1-seqW):0);
  if(S.hold&&(ball.gk!==p)&&!S.seq){S.hold.stop();S.hold=null;}
  const off=Math.max(seqW,S.hold?1:0);
  const ra=run>0||S.w.run>.01?(window.act?act(m,'sprint'):null):null;
  if(ra&&!ra.isRunning()){ra.reset();ra.play();}
  for(const n in tgt){S.w[n]=L(S.w[n],tgt[n],Math.min(1,dt*8));if(n==='run'){if(ra)ra.setEffectiveWeight(S.w.run*(1-off));continue;}S.A[n].setEffectiveWeight(S.w[n]*(1-off));}
  if(S.hold)S.hold.setEffectiveWeight(holdW);
  const rs=Math.min(3.7,Math.max(1.1,1.1+Math.abs(lx)/VMAXL*2.6)),rf=Math.min(3.0,Math.max(1.1,1.1+Math.abs(lz)/VMAXF*1.9));
  S.A.gk_lado.timeScale=S.A.gk_lado_l.timeScale=rs;S.A.gk_frente.timeScale=rf;S.A.atras.timeScale=-rf;if(ra)ra.timeScale=Math.min(1.7,Math.max(.8,sp/7.6));
  // sin animación de acción, lo avanzado se regresa a cero suave (en línea)
  if(!S.seq){const k=Math.min(1,dt*10);S.off.x*=1-k;S.off.z*=1-k;S.off.y*=1-k;}
  m.curA=S.seq?(S.seq.kind==='dive'?'gk_dive_g2':'gk_catch_g2'):(S.hold?'gk_hold_g2':'gk_loco_g2');m.lockUntil=0;
  // pose de la animación (los dedos regresan a la pose antes de avanzar)
  restoreFingers(S);const B=m.bones;if(B.hd)B.hd.b.quaternion.copy(B.hd.q0);
  m.mixer.update(p.frozen>0?0:p.rooted>0?dt*.25:dt);if(window.mixForce)mixForce(m);
  // cadera a la estatura de cada personaje (la animación viene a 100 de alto), en su lugar (lo que avanza lo pone el código)
  {const h=B.hips.b,r=B.hips.p0,c=(typeof ANIMMETA!=='undefined'&&ANIMMETA&&ANIMMETA._hips)||[0,100,0],k=r.y/c[1];h.position.set(r.x,h.position.y*k,r.z);}
  B.feet&&B.feet.forEach(f=>f.scale.setScalar(1));
  // cabeza: sigue al balón; con el balón en las manos voltea a ver a sus compañeros (analiza a quién mandarla)
  if(B.hd){let a=0;if(ball.gk===p&&!p.distrib){S.scan+=dt;a=Math.sin(S.scan*2.6)*.55;}else{S.scan=0;a=Math.atan2(ball.x-p.x,ball.z-p.z)-S.face;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;a=Math.max(-.55,Math.min(.55,a))*(S.seq?0:1);}
    p._hy=(p._hy||0)+(a-(p._hy||0))*Math.min(1,dt*6);_q.setFromAxisAngle(B.hd.ay,p._hy*(B.fwd||1));B.hd.b.quaternion.premultiply(_q);}
  fingers(p,m,S,dt);
  // pies al piso solo en los pasos (en las atajadas el cuerpo va por el aire)
  m.footAdj=0;if(!S.seq&&!S.hold&&B.toes&&B.toes.length&&B.restFootY!=null){let mn=1e9;for(const b of B.toes){b.getWorldPosition(_v);B.model.worldToLocal(_v);mn=Math.min(mn,_v.y);}
    const want=(B.restFootY-mn)*B.model.scale.y;p._fadj=(p._fadj||0)+(Math.max(-.5,Math.min(.5,want))-(p._fadj||0))*Math.min(1,dt*12);m.footAdj=p._fadj;}else p._fadj=(p._fadj||0)*.85;
  guard(p,m,S);
  return true;};
// después de colocar al personaje: lo que avanzó/giró con la animación
G2.place=function(p,m){const S=m&&m._g2;if(!S||!S.on)return;const o=S.off;if(!o)return;m.root.position.x+=o.x;m.root.position.z+=o.z;m.root.rotation.y+=o.y;};
})();
