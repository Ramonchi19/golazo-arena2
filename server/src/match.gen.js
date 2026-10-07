// ARCHIVO GENERADO por server/build-sim.mjs a partir de assets/sim/match.js. No editar a mano.
import "../../assets/sim/ball.js";

export function makeMatch(opts = {}) {
  const SIM = globalThis.SIM;
  const { L, HW, GW, GH, BR, GRAV, RUN } = SIM.C;
  const CHAR_SCALE = 1.12, SUPER_COST = 3, MATCH_T = 120, X2T = 45, OT_T = 45;
  const rand = SIM.rand, clamp = SIM.clamp;
  const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const dirOf = t => t === 0 ? 1 : -1;
  const DIFF = { easy: { ai: .75, keep: .85, think: 1.5, tack: .6 }, normal: { ai: 1, keep: 1, think: 1, tack: 1 }, hard: { ai: 1.25, keep: 1.1, think: .65, tack: 1.35 } };
  const HITS = ['¡PUM!', '¡ZAS!', '¡CRACK!', '¡BAM!', '¡TRAS!'];

  // ---- estado del partido (en el juego son variables globales) ----
  let players = [], user = null, ball = SIM.newBall(), score = [0, 0], energy = [5, 5], time = MATCH_T, overtime = false, otTime = OT_T;
  let pause = 0, pauseCb = null, state = 'play', D = DIFF[opts.dif || 'normal'], hitstop = 0, shakeAmt = 0, superNext = [false, false];
  let shield = [0, 0], pressT = 0, T = 0, aiT = 2, traps = [], zones = [], walls = [], effects = [];
  let cine = null, qte = null, slowT = 0, goalCam = 0, fenceFlash = 0, lastKickPow = 0, ballSq = 0;
  const joy = { id: null, x: 0, y: 0 };
  const events = [];

  // ---- lo visual y el sonido no existen en el servidor ----
  const NO = () => {};
  const sfx = NO, burst = NO, part = NO, dust = NO, popText = NO, showBig = NO, ringFx = NO, vib = NO, pwElectro = NO,
    crowdShot = NO, zapFx = NO, shotScar = NO, spinBallMesh = NO, netCollide = NO, bigSave = NO, startQTE = NO;
  const fb = () => false, psfx = () => false, handPos = () => null;
  // sin cinemática: el súper tiro sale de inmediato
  const startCine = (p, args) => { if (ball.owner === p && state === 'play') { p._cineGo = true; shoot.apply(null, args); } };
  function dangerCheck() {}
  function landing() { return SIM.landing(ball); }
  function ballLandT() { return SIM.landT(ball); }
  function wallBall() { SIM.ballWalls(SIMW); }
  const SIMW = { get ball() { return ball; }, get players() { return players; }, get zones() { return zones; }, get walls() { return walls; },
    get score() { return score; }, get energy() { return energy; }, fx: null,
    knock: (o, dx, dz, pw, st) => knock(o, dx, dz, pw, st), onGoal: t => goal(t) };

  function goal(team) {
    if (pause > 0) return;
    SIM.scoreGoal(SIMW, team); events.push({ t: 'gol', team, score: score.slice() });
    pause = 2.3; pauseCb = () => { if (overtime) endGame(); else kickoff(1 - team); };
  }
  function endGame() { state = 'fin'; events.push({ t: 'fin', score: score.slice() }); }

// ======================= assets/sim/match.js =======================
/* Wild Strikers · simulación del partido (parte 2: jugadores, IA y porteros)
   Lógica del partido sin gráficos. En el navegador se carga como script normal y usa las mismas
   variables del juego (ball, players, user...). En el servidor se envuelve en una función que
   declara esas variables y cambia los efectos (sonidos, partículas, letreros) por funciones vacías.
   Regla: aquí no se usa THREE, ni document, ni mallas; lo visual se pide con funciones como
   sfx(), burst(), popText(), dust() o fb(), que el juego dibuja y el servidor ignora. */
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function fieldOf(t){return players.filter(p=>p.team===t&&!p.gk);}
function keeperOf(t){return players.find(p=>p.team===t&&p.gk);}

const HOMES=[{x:-13,z:0},{x:-5,z:-7},{x:-5,z:7}];
function kickoff(team){
  for(const p of players){
    const d=dirOf(p.team);
    if(p.gk){p.x=-d*(L-1);p.z=0;}
    else{const h=p.slot||{x:-8,z:0};p.homeX=h.x*d;p.homeZ=h.z;p.x=p.homeX;p.z=p.homeZ;}
    p.vx=p.vz=0;p.stun=0;p.act=null;p.recover=0;p.charging=false;p.charge=0;p.slip=0;p.celebrate=0;p.react=null;p.gest=null;p.flyY=0;p.flyVy=0;p.spinT=0;p.elecT=0;p.getUp=0;p._landed=false;p.face=d>0?Math.PI/2:-Math.PI/2;
    dust(p.x,p.z);
  }
  const fwd=t=>fieldOf(t).slice().sort((a,b)=>(b.slot?b.slot.x:0)-(a.slot?a.slot.x:0))[0];const k=fwd(team);k.x=-dirOf(team)*.9;k.z=0;
  SIM.resetBall(ball);
  take(k,true);
  user=team===0?k:fwd(0);
  pause=.7;pauseCb=null;
}


// ================== BALÓN ==================
function take(p,silent){p.protect=.5;p.queue=null;ball.owner=p;ball.gk=null;ball.passTo=null;ball.cross=false;ball.super=false;ball.lastTeam=p.team;p.hold=0;if(p.team===0)user=p;if(!silent)sfx('touch');}
function release(p){ball.owner=null;ball.gk=null;ball.lastTeam=p.team;ball.tried=[false,false];p.pcd=.35;p.kickT=.28;p.charging=false;p.charge=0;}
function faceTo(p,dx,dz){if(Math.abs(dx)+Math.abs(dz)>.01)p.face=Math.atan2(dx,dz);}
function loseBall(p,dx,dz){
  if(ball.owner===p){ball.owner=null;ball.vx=(dx||rand(-1,1))*6+rand(-2,2);ball.vz=(dz||rand(-1,1))*6+rand(-2,2);ball.vy=3.5;ball.lastTeam=p.team;ball.passTo=null;ball.cross=false;ball.tried=[false,false];}
  p.pcd=Math.max(p.pcd,.8);p.charging=false;p.charge=0;
}
function pass(p,m,mult){
  if(cine&&cine.p===p)return;
  if(qKick(p,'pass',[p,m,mult]))return;
  release(p);const t=d2(p,m)/16,tx=m.x+m.vx*t*.8,tz=m.z+m.vz*t*.8;
  const dx=tx-ball.x,dz=tz-ball.z,l=Math.hypot(dx,dz)||1,sp=clamp(clamp(l*1.45+13,16,30)*(mult||1),11,36);
  const ea=rand(-1,1)*p.passErr,ca=Math.cos(ea),sa=Math.sin(ea);ball.vx=(dx*ca-dz*sa)/l*sp;ball.vz=(dx*sa+dz*ca)/l*sp;ball.vy=1.2;ball.passTo=m;ball.cross=false;ball.super=false;faceTo(p,dx,dz);p.kickPow=.55;sfx('pass');lastKickPow=.5;ball.isShot=false;burst(ball.x,ball.y,ball.z,0xffffff,4,3);
  if(p.team===0)user=m;
}
function centro(p,m){
  if(cine&&cine.p===p)return;
  if(qKick(p,'centro',[p,m]))return;
  release(p);const d=dirOf(p.team);let lx=m.x+m.vx*.7+d*1.5,lz=m.z+m.vz*.7;
  lx=clamp(lx,-L+2,L-2);lz=clamp(lz,-HW+2,HW-2);
  const dx=lx-ball.x,dz=lz-ball.z,l=Math.hypot(dx,dz),t=clamp(l/18,.7,1.3);
  ball.vx=dx/t;ball.vz=dz/t;ball.vy=(1.3-ball.y)/t+.5*GRAV*t;ball.passTo=m;ball.cross=true;ball.super=false;m.crossSpot={x:lx,z:lz};
  faceTo(p,dx,dz);sfx('cross');sfx('kick');lastKickPow=.6;ball.isShot=false;burst(ball.x,ball.y,ball.z,0xffffff,6,4);popText('¡Centro!',p.x,2.4,p.z,'#bff');
  if(p.team===0)user=m;
}
function centroSpot(p){
  if(qKick(p,'centroSpot',[p]))return;
  const d=dirOf(p.team),lx=d*(L-6),lz=rand(-4,4);
  release(p);const dx=lx-ball.x,dz=lz-ball.z,l=Math.hypot(dx,dz),t=clamp(l/15,.8,1.6);
  ball.vx=dx/t;ball.vz=dz/t;ball.vy=(1.3-ball.y)/t+.5*GRAV*t;ball.cross=true;ball.passTo=null;faceTo(p,dx,dz);sfx('cross');
}
function shoot(p,power,kind,aim){
  if(cine&&cine.p===p&&!p._cineGo)return;
  if(!kind&&qKick(p,'shoot',[p,power,kind,aim]))return;
  const team=p.team,d=dirOf(team);
  // v48: súper tiro = barra llena + 3 de energía (o carta/estrella). Antes de patear hay mini cinemática.
  let sup;
  if(p._cineGo){sup=true;p._cineGo=false;}
  else{sup=p.star>0||superNext[team];if(superNext[team])superNext[team]=false;
    if(!sup&&!kind&&power>=.97&&energy[team]>=SUPER_COST){energy[team]-=SUPER_COST;sup=true;}
    if(sup&&!kind&&ball.owner===p&&!cine&&state==='play'){startCine(p,[p,power,kind,aim]);return;}}
  const perfect=!sup&&!kind&&(aim?(power>=.79&&power<.91):(power>=.85&&Math.random()<.22));
  release(p);ball.isShot=true;ball.slowDone=false;
  const kp=keeperOf(1-p.team);let az=(kp&&Math.abs(kp.z)>.3?-Math.sign(kp.z):(Math.random()<.5?1:-1))*rand(1.2,GW-.7);
  if(p===user&&Math.hypot(joy.x,joy.y)>.3)az=clamp(joy.x,-1,1)*(GW-.6)+rand(-.4,.4);
  az+=rand(-1,1)*p.shotErr*(sup?.3:perfect?.2:1);
  if(aim){az=aim.az;const zf=perfect?.15:power<.6?.5:power<.85?1:1.6;az+=rand(-1,1)*(p.shotErr*zf*(sup?.3:1)+(power>=.85&&!sup&&!perfect?.7:0));}
  let ay=sup?rand(.5,1.3):clamp(.3+power*1.6+rand(-.2,.4),.25,GH+(power>.95?.5:-.2));
  if(kind)ay=rand(.4,2.2);
  if(aim&&!sup&&!perfect&&power>=.85)ay+=Math.random()*(power-.8)*6;
  if(aim&&power<.6)ay=Math.min(ay,1.2);
  const tx=d*(L+1),dx=tx-ball.x,dz=az-ball.z,l=Math.hypot(dx,dz);
  const sp=(sup?44:(kind?28:19+power*18))*p.shotMul*(perfect?1.12:1),t=l/sp,g=sup?GRAV*.15:GRAV;
  ball.vx=dx/t;ball.vz=dz/t;ball.vy=(ay-ball.y)/t+.5*g*t;
  if(l>24&&!sup){const e=(l-24)*.09;ball.vz+=rand(-e,e)*sp/l*4;}
  ball.super=sup;ball.passTo=null;ball.cross=false;faceTo(p,dx,dz);p.kickPow=sup?1.15:1;
  if(!kind&&(sup||power>=.85))shotScar(ball.x,ball.z,dx,dz,sup);
  if(sup){popText('¡SÚPER TIRO!',p.x,2.6,p.z,'#ffcc33',22);hitstop=.13;shakeAmt=1.1;burst(ball.x,ball.y,ball.z,0xffb000,26,10);ringFx(ball.x,ball.z,3.2,0xffb000,.35);psfx('superbalon');sfx('super');sfx('kickHard');vib(60);}
  else if(perfect){popText('¡PERFECTO!',p.x,2.9,p.z,'#ffd23a',28);hitstop=.07;shakeAmt=Math.max(shakeAmt,.55);burst(ball.x,ball.y,ball.z,0xffd23a,20,8);ringFx(ball.x,ball.z,2.4,0xffd23a,.3);sfx('perfect');sfx('kickHard');vib(40);}
  else{if(kind)popText(kind,p.x,2.6,p.z,'#fff');
    const pw=+power||(kind?.8:0);if(pw>=.6){hitstop=Math.max(hitstop||0,.03+pw*.025);shakeAmt=Math.max(shakeAmt||0,.18+pw*.3);burst(ball.x,ball.y,ball.z,0xffffff,(8+pw*10)|0,6+pw*3);ringFx(ball.x,ball.z,1.2+pw,0xffffff,.22);sfx('kickHard');if(pw>=.85)vib(25);}
    else sfx('kick');}
  lastKickPow=sup?1.2:perfect?1:(kind?.9:(+power||0));
}
function qKick(p,fn,args){if(ball.owner!==p||p._fromQ)return false;if(Math.hypot(ball.x-p.x,ball.z-p.z)<=1.05)return false;p.queue={fn,args};p.queueT=.55;return true;}
function runQueue(p,dt){if(p.queue&&!({pass,centro,centroSpot,shoot,passAim,crossAim})[p.queue.fn]){p.queue=null;return;}if(!p.queue)return;if(ball.owner!==p){p.queue=null;return;}p.queueT-=dt;
  if(Math.hypot(ball.x-p.x,ball.z-p.z)<=1.05||p.queueT<=0){const q=p.queue;p.queue=null;p._fromQ=true;({pass,centro,centroSpot,shoot,passAim,crossAim})[q.fn](...q.args);p._fromQ=false;}}
function contestBall(dt){
  const c=ball.owner;if(!c||c.gk)return;
  if(c.protect>0){c.protect-=dt;return;}
  const db=Math.hypot(ball.x-c.x,ball.z-c.z),e=clamp((db-.55)/.8,0,1);
  for(const o of players){
    if(o.team===c.team||o.gk||o.stun>0||o.act||o.recover>0)continue;
    const dob=Math.hypot(ball.x-o.x,ball.z-o.z),doc=d2(o,c);let rate=0;
    if(dob<.8*(o.defReach||1))rate+=(.5+2.8*e)*(o.defMul||1);
    if(doc<1.15){o.pressT2=(o.pressT2||0)+dt;if(o.pressT2>.7)rate+=.35*(o.defMul||1);}else o.pressT2=0;
    rate*=(1-(c.dodge||0));
    if(rate>0&&Math.random()<rate*dt){take(o);c.stun=Math.max(c.stun,.25);c.vx*=.4;c.vz*=.4;c.charging=false;
      popText(Math.random()<.5?'¡Robo!':'¡Se la quitó!',o.x,2.5,o.z,'#bff');sfx('hit');return;}
  }
}


function aimDefault(p,type){
  const d=dirOf(p.team);let tx,tz;
  if(type==='shot'){tx=d*L;const kp=keeperOf(1-p.team);tz=(kp&&Math.abs(kp.z)>.3?-Math.sign(kp.z):(p.z>0?-1:1))*(GW-1.3);}
  else{const m=type==='pass'?bestPassTarget(p,null):bestCrossTarget(p,null);if(m){tx=m.x;tz=m.z;}else{tx=p.x+d*10;tz=p.z*.5;}}
  const dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz)||1;return{x:dx/l,z:dz/l};
}

function coneMate(p,dir,maxAng){let best=null,bs=1e9;for(const m of fieldOf(p.team)){if(m===p)continue;const dx=m.x-p.x,dz=m.z-p.z,l=Math.hypot(dx,dz);if(l<3||l>32)continue;const ang=Math.acos(clamp((dx*dir.x+dz*dir.z)/l,-1,1));if(ang>maxAng)continue;const s=ang*10+l*.05;if(s<bs){bs=s;best=m;}}return best;}
function nearestMateTo(p,x,z,maxD){let best=null,bd=maxD;for(const m of fieldOf(p.team)){if(m===p)continue;const dd=Math.hypot(m.x-x,m.z-z);if(dd<bd){bd=dd;best=m;}}return best;}

function passAim(p,pw,dir){
  if(qKick(p,'passAim',[p,pw,dir]))return;
  const m=coneMate(p,dir,.6);
  if(m){pass(p,m,pw==null?1:.65+pw*.7);return;}
  const dist=5+(pw==null?.45:pw)*20,tx=clamp(p.x+dir.x*dist,-L+1,L-1),tz=clamp(p.z+dir.z*dist,-HW+1,HW-1);
  release(p);const dx=tx-ball.x,dz=tz-ball.z,l=Math.hypot(dx,dz)||1,sp=clamp(l*1.25+8,11,28);
  ball.vx=dx/l*sp;ball.vz=dz/l*sp;ball.vy=1;ball.cross=false;ball.super=false;faceTo(p,dx,dz);p.kickPow=.55;sfx('pass');lastKickPow=.5;ball.isShot=false;burst(ball.x,ball.y,ball.z,0xffffff,4,3);
  const r=nearestMateTo(p,tx,tz,9);ball.passTo=r;if(r&&p.team===0)user=r;
}
function crossAim(p,pw,dir){
  if(qKick(p,'crossAim',[p,pw,dir]))return;
  const dist=8+(pw==null?.55:pw)*24;let lx=clamp(p.x+dir.x*dist,-L+2,L-2),lz=clamp(p.z+dir.z*dist,-HW+2,HW-2);
  release(p);const dx=lx-ball.x,dz=lz-ball.z,l=Math.hypot(dx,dz),t=clamp(l/15,.8,1.6);
  ball.vx=dx/t;ball.vz=dz/t;ball.vy=(1.3-ball.y)/t+.5*GRAV*t;ball.cross=true;ball.super=false;faceTo(p,dx,dz);p.kickPow=.7;sfx('cross');
  const r=nearestMateTo(p,lx,lz,7);ball.passTo=r;if(r){r.crossSpot={x:lx,z:lz};if(p.team===0)user=r;}
  popText('¡Centro!',p.x,2.4,p.z,'#bff');
}

function bestPassTarget(p,dv){
  const d=dirOf(p.team);let best=null,bs=-1e9;
  for(const m of fieldOf(p.team)){if(m===p||m.stun>0)continue;const dist=d2(p,m);if(dist<3||dist>28)continue;
    const dx=(m.x-p.x)/dist,dz=(m.z-p.z)/dist;let s=0;
    if(dv&&Math.hypot(dv.x,dv.z)>.2){const l=Math.hypot(dv.x,dv.z);s+=(dx*dv.x/l+dz*dv.z/l)*3;}
    const o=nearestOpp(m);s+=Math.min(6,o?d2(m,o):6)/3;s+=(m.x-p.x)*d*.04-dist*.03;
    if(s>bs){bs=s;best=m;}}
  return best;
}
function bestCrossTarget(p,dv){
  const d=dirOf(p.team);let best=null,bs=-1e9;
  for(const m of fieldOf(p.team)){if(m===p||m.stun>0)continue;const dist=d2(p,m);if(dist<5||dist>32)continue;
    let s=(m.x*d)*.12-Math.abs(m.z)*.05;
    if(dv&&Math.hypot(dv.x,dv.z)>.2){const l=Math.hypot(dv.x,dv.z);s+=((m.x-p.x)/dist*dv.x/l+(m.z-p.z)/dist*dv.z/l)*2;}
    if(s>bs){bs=s;best=m;}}
  return best;
}

function updateBall(dt){_updateBall(dt);try{dangerCheck();}catch(e){}if(walls.length)wallBall();netCollide(dt);}
// v62: la física del balón vive en assets/sim/ball.js (la misma que usará el servidor); aquí solo lo visual

function _updateBall(dt){
  if(ball.gk){const k=ball.gk;if(gkSequence(k,dt))return;if(ballToHands(k,'mid')){k.hold-=dt;if(k.hold<=0)keeperDistribute(k);return;}ball.x=k.x+Math.sin(k.face)*.55;ball.z=k.z+Math.cos(k.face)*.55;ball.y=1.05;ball.vx=ball.vy=ball.vz=0;k.hold-=dt;if(k.hold<=0)keeperDistribute(k);return;}
  if(ball.owner){SIM.ballCarried(SIMW,dt);spinBallMesh(dt);return;}
  SIM.ballFree(SIMW,dt);spinBallMesh(dt);
}


// ================== PORTEROS ==================
function kStat(k,s){const c=k.card;return c&&c.st&&c.st[s]?Math.min(99,c.st[s]+((k.lvl||1)-1)*3):66;}
function screened(k){for(const o of players){if(o===k||o.gk)continue;const ax=k.x-ball.x,az=k.z-ball.z,l2=ax*ax+az*az||1;let t=((o.x-ball.x)*ax+(o.z-ball.z)*az)/l2;if(t<.1||t>.9)continue;const px=ball.x+ax*t,pz=ball.z+az*t;if(Math.hypot(o.x-px,o.z-pz)<.8)return true;}return false;}
function updateKeeper(k,dt){
  const d=dirOf(k.team),gx=-d*L;
  if(k.dive>0)k.dive-=dt;if(k.smother>0)k.smother-=dt;if(k.highT>0)k.highT-=dt;if(k.blockT>0)k.blockT-=dt;if(k.setPos&&k.vx===0&&k.vz===0)k.face=Math.atan2(ball.x-k.x,ball.z-k.z);
  if(k.stun>0){k.stun-=dt;k.vx*=.9;k.vz*=.9;movePlayer(k,dt);return;}
  if(ball.gk===k){k.vx=k.vz=0;k.face=d>0?Math.PI/2:-Math.PI/2;return;}
  const REF=kStat(k,'ref'),ALC=kStat(k,'alc'),SAL=kStat(k,'sal'),dif=k.team===1?D.keep:1;
  const hs=Math.hypot(ball.vx,ball.vz),free=!ball.owner&&!ball.gk;
  // ¿viene un tiro hacia mi portería? (predicción por física)
  let pred=null;
  if(free&&ball.vx*-d>5){const tc=(k.x-ball.x)/ball.vx;if(tc>0&&tc<2.2){const g=ball.super?GRAV*.15:GRAV;let yc=ball.y+ball.vy*tc-.5*g*tc*tc;if(yc<BR)yc=BR;const zc=ball.z+ball.vz*tc;if(Math.abs(zc)<GW+1.5&&yc<GH+.9)pred={zc,yc,tc};}}
  if(pred){
    if(!k.alert){k.alert=true;if(ball.super&&k.team===0&&ball.lastTeam===1)startQTE(k);k.reactT=(.36-REF*.0022)*rand(.92,1.08)/dif+(screened(k)?.08:0);k.diveLeft=(2.2+ALC*.008)*dif;}
    k.reactT-=dt;
    if(k.reactT<=0){const vD=(3+ALC*.01+REF*.006)*dif,dz=pred.zc-k.z;
      if(Math.abs(dz)>.3&&k.diveLeft>0){const st=Math.min(Math.abs(dz)-.15,vD*dt,k.diveLeft);k.z=clamp(k.z+Math.sign(dz)*st,-GW-1,GW+1);k.diveLeft-=st;if(k.dive<=0&&Math.abs(dz)>1.7){k.dive=.55;k.diveDir=Math.sign(dz);k.diveH=pred.yc;}}}
    k.vx=k.vz=0;
  } else {
    k.alert=false;
    {const c0=ball.owner,danger=(c0&&c0.team!==k.team&&Math.abs(c0.x-gx)<20)||(free&&ball.vx*-d>2&&Math.abs(ball.x-gx)<20);k.setPos=danger;}
    // colocación por ángulo: entre el balón y el centro de la portería; sale más cuando el balón se acerca
    const bx=ball.x-gx,bz=ball.z,bl=Math.hypot(bx,bz)||1;
    let out=1+clamp((20-bl)/20,0,1)*(.6+SAL*.012);if(Math.abs(bz)>Math.abs(bx)*1.3)out=Math.min(out,1.3);
    let tx=gx+bx/bl*out,tz=clamp(bz/bl*out,-GW+.4,GW-.4);
    tx=gx+d*clamp((tx-gx)*d,.6,2.2+SAL*.012);
    k.claim=false;if(free&&!pred&&Math.abs(ball.x-gx)<11&&Math.abs(ball.z)<12.5&&ball.y<1.7&&hs<15){const o=nearestOpp({x:ball.x,z:ball.z,team:k.team});if(!o||Math.hypot(o.x-ball.x,o.z-ball.z)>d2(k,ball)-1.5){tx=ball.x+ball.vx*.25;tz=ball.z+ball.vz*.25;k.claim=true;}}
    const c=ball.owner;k.rushCD=(k.rushCD||0)-dt;
    if(c&&c.team!==k.team&&Math.abs(c.x-gx)<9+SAL*.04&&Math.abs(c.z)<8&&k.rushCD<=0){
      let cover=false;for(const m of fieldOf(k.team)){if(Math.abs(m.x-gx)<Math.abs(c.x-gx)-.3&&d2(m,c)<3.2){cover=true;break;}}
      if(!cover){tx=ball.x;tz=ball.z;k.rushing=true;
        if(d2(k,ball)<1.25){k.rushCD=1.4;const exp=clamp((Math.hypot(ball.x-c.x,ball.z-c.z)-.5)/.8,0,1),pr=clamp(.32+(SAL-60)*.012+exp*.3-(c.dodge||0),.1,.85)*dif;
          if(Math.random()<pr){catchBall(k);popText('¡Salida perfecta!',k.x,2.6,k.z,'#fff',18);bigSave();}
          else{k.stun=.7;k.dive=.55;k.diveDir=Math.sign(c.z-k.z)||1;c.protect=Math.max(c.protect||0,.4);popText('¡Lo esquivó!',c.x,2.6,c.z,'#bff',18);}}}
    }else k.rushing=false;
    const sp=(4.5+SAL*.025)*dif*(k.rushing||k.claim?1.45:k.setPos?.72:1),dx=tx-k.x,dz2=tz-k.z,l=Math.hypot(dx,dz2);
    if(k.rushing&&d2(k,ball)<2.4&&(k.smother||0)<=0){k.smother=.6;k.smDir=Math.sign(ball.z-k.z)||1;}
    if(l>.1){k.vx=dx/l*Math.min(sp,l*6);k.vz=dz2/l*Math.min(sp,l*6);}else k.vx=k.vz=0;
    movePlayer(k,dt);
  }
  if(!k.distrib&&!(k.dive>0)&&!(k.smother>0)){const want=Math.atan2(ball.x-k.x,ball.z-k.z);let df=want-k.face;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;k.face+=df*Math.min(1,dt*10);}
  if(k.pcd<=0&&free&&!pred&&d2(k,ball)<1.15&&ball.y<1.9&&hs<14&&!ball.super){catchBall(k);return;}
  if(free&&ball.vx*-d>3){const front=(ball.x-k.x)*d;if(front<.5&&front>-1.2&&!ball.tried[k.team]){ball.tried[k.team]=true;resolveSave(k,REF,ALC,dif);}}
  if(Math.abs(ball.x-gx)>9)ball.tried[k.team]=false;
}
function resolveSave(k,REF,ALC,dif){
  const lat=Math.abs(ball.z-k.z),y=ball.y,s=Math.hypot(ball.vx,ball.vy,ball.vz),diving=k.dive>0,d=dirOf(k.team);
  if(Math.abs(ball.z)>GW+.3||y>GH+.25)return; // va fuera
  let reach=.45+(diving?.3+ALC*.004:.25+ALC*.002);
  if(y>1.85)reach-=(y-1.85)*.9;        // escuadra: más difícil
  if(y<.45&&lat>1.2)reach-=.2;          // rasante lejos del cuerpo
  reach*=Math.sqrt(dif);
  if(shield[k.team]>0)reach=99;
  const margin=reach-lat;
  if(margin<0){if(margin>-.3)popText('¡Por poquito!',k.x,2.6,k.z,'#ffd6a0');return;}
  if(ball.super&&k.qteRes==='ok'){k.qteRes=null;k.dive=.55;k.diveDir=Math.sign(ball.z-k.z)||1;ball.vx=-ball.vx*.25;ball.vz=(Math.sign(ball.z-k.z)||1)*rand(6,10);ball.vy=rand(3,6);ball.super=false;ball.lastTeam=k.team;ball.tried=[false,false];ball.tried[k.team]=true;k.pcd=.6;popText('¡ATAJADÓN!',k.x,2.8,k.z,'#ffcc33',26);burst(ball.x,ball.y,ball.z,0xffcc33,24,8);sfx('catch');bigSave();return;}
  if(ball.super&&margin<.55&&shield[k.team]<=0){knock(k,-d*.3,Math.sign(ball.z-k.z)||1,6,.9);popText('¡Lo atravesó!',k.x,2.7,k.z,'#ffcc33');ball.vx*=.9;return;}
  const catchMax=19+REF*.08,big=margin<.3||s>24;
  if(margin>.35&&Math.abs(y-1.1)<.95&&s<catchMax&&!ball.super){
    if(shield[k.team]<=0&&Math.random()<Math.max(0,(72-REF)/100)*.15){ball.vx*=-.15;ball.vz=rand(-2,2);ball.vy=2;ball.lastTeam=k.team;popText('¡Se le escapó!',k.x,2.6,k.z,'#ff9aa4');sfx('bounce');return;}
    catchBall(k);popText(big?'¡ATAJADÓN!':(Math.random()<.5?'¡Atajada!':'¡A las manos!'),k.x,2.7,k.z,'#fff',big?22:16);
    if(big)bigSave();return;
  }
  const side=Math.sign(ball.z-k.z)||(Math.random()<.5?1:-1);
  if(y<.5&&lat<.75){ball.vx=-ball.vx*rand(.25,.4);ball.vz=side*rand(2,5);ball.vy=rand(1,2.5);popText('¡Con el pie!',k.x,2.6,k.z,'#fff',17);}
  else if(margin<.22&&s>21&&y<=1.6){ball.vx=-ball.vx*rand(.3,.45);ball.vz=side*rand(.5,2.5);ball.vy=rand(1,2.5);popText('¡Rebote!',k.x,2.6,k.z,'#ffd6a0',18);}
  else if(y>1.6&&margin<.3){ball.vx*=.3;ball.vy=7+rand(0,2);ball.vz+=side*1.5;popText('¡Con la punta, por arriba!',k.x,2.7,k.z,'#fff',18);}
  else{ball.vx=-ball.vx*rand(.2,.35);ball.vz=side*rand(4,9)*(s>25?.7:1);ball.vy=rand(1.5,5);popText(margin<.25?'¡Con la punta!':'¡Qué mano!',k.x,2.7,k.z,'#fff',big?20:16);}
  if(ball.super)knock(k,-d*.2,side,4,.6);
  ball.lastTeam=k.team;ball.super=false;ball.tried=[false,false];ball.tried[k.team]=true;k.pcd=.6;
  sfx('catch');if(!fb('impacto',ball.x,ball.y,ball.z,big?3.2:2,.35))burst(ball.x,ball.y,ball.z,0xffffff,10,5);if(big)bigSave();
}
function catchBall(k){k.catchY=ball.y;if(ball.y>1.75&&k.dive<=0)k.highT=.45;else if(k.dive<=0)k.blockT=.5;ball.gk=k;ball.owner=null;k.hold=k.team===0?2.2:rand(.55,.95);k.distrib=null;ball.super=false;ball.passTo=null;ball.cross=false;ball.vx=ball.vy=ball.vz=0;sfx('catch');}
function gkTargets(k,dir){
  const d=dirOf(k.team),mates=fieldOf(k.team).filter(m=>m.stun<=0);let best=null,bs=-1e9;
  for(const m of mates){const o=nearestOpp(m),free=o?Math.min(9,d2(m,o)):9,dist=d2(k,m);let s=free-dist*.06;
    if(dir){const dx=m.x-k.x,dz=m.z-k.z,l=Math.hypot(dx,dz)||1,cos=(dx*dir.x+dz*dir.z)/l;s+=cos*6;}if(s>bs){bs=s;best=m;}}
  return best;}
function keeperDistribute(k,type,dir){
  if(k.distrib)return;const d=dirOf(k.team);
  if(!type){const t=gkTargets(k,null),o=t?nearestOpp(t):null,open=t&&(!o||d2(t,o)>4.5),dist=t?d2(k,t):99;
    type=open&&dist<13?(nearestOpp(k)&&d2(k,nearestOpp(k))<9?'mano':(Math.random()<.5?'corto':'mano')):'largo';}
  k.distrib={type,t:0,dir:dir||null,target:type==='largo'?null:gkTargets(k,dir)};
  if(type==='largo'&&!k.distrib.target){let far=null,fx=-1e9;for(const m of fieldOf(k.team)){const v=m.x*d-(dir?0:0);if(v>fx){fx=v;far=m;}}k.distrib.target=far;}
  if(k.distrib.target)faceTo(k,k.distrib.target.x-k.x,k.distrib.target.z-k.z);else faceTo(k,d,0);
}

function ballToHands(k,which){const h=handPos(k,which);if(!h)return false;ball.x=h.x;ball.y=Math.max(BR,h.y);ball.z=h.z;ball.vx=ball.vy=ball.vz=0;return true;}
function gkSequence(k,dt){
  const s=k.distrib;if(!s)return false;s.t+=dt;const d=dirOf(k.team),hx=Math.sin(k.face),hz=Math.cos(k.face),tg=s.target;
  if(s.type==='mano'){k.throwT=s.t;if(!ballToHands(k,'r')){ball.x=k.x-hx*.2;ball.z=k.z-hz*.2;ball.y=1.05+Math.min(1,s.t/.35)*1.3;}
    if(s.t>=.38){const tx=tg?tg.x:k.x+d*12,tz=tg?tg.z:k.z;release(k);k.kickT=0;ball.y=2.2;const dx=tx-ball.x,dz=tz-ball.z,l=Math.hypot(dx,dz)||1,ft=clamp(l/19,.35,.9);
      ball.vx=dx/ft;ball.vz=dz/ft;ball.vy=(1-ball.y)/ft+.5*GRAV*ft;ball.passTo=tg;if(tg&&k.team===0)user=tg;sfx('pass');k.distrib=null;k.throwT=-1;ball.tried[k.team]=true;k.pcd=1.2;}
    return true;}
  if(s.type==='largo'){if(s.t<.32){if(!ballToHands(k,'mid')){ball.x=k.x+hx*.6;ball.z=k.z+hz*.6;ball.y=1.05+Math.sin(s.t/.32*Math.PI)*.5;}return true;}
    const tx=tg?tg.x+d*4:k.x+d*30,tz=tg?tg.z:rand(-6,6);release(k);k.kickPow=1;ball.y=.7;const dx=tx-ball.x,dz=tz-ball.z,l=Math.hypot(dx,dz)||1,ft=clamp(l/24,.9,1.4);
    ball.vx=dx/ft;ball.vz=dz/ft;ball.vy=(1-ball.y)/ft+.5*GRAV*ft;ball.passTo=null;ball.cross=false;sfx('kick');fb('impacto',ball.x,.8,ball.z,1.6,.25);if(tg&&k.team===0)user=tg;k.distrib=null;ball.tried[k.team]=true;k.pcd=1.2;return true;}
  if(s.type==='corto'){k.crouchT=s.t<.3?s.t/.3:Math.max(0,1-(s.t-.3)/.3);if(!(s.t<.45&&ballToHands(k,'mid'))){ball.x=k.x+hx*.75;ball.z=k.z+hz*.75;ball.y=Math.max(BR,1.05-s.t/.3*(1.05-BR));}
    if(s.t>=.75){const tx=tg?tg.x:k.x+d*10,tz=tg?tg.z:k.z;release(k);ball.y=BR;const dx=tx-ball.x,dz=tz-ball.z,l=Math.hypot(dx,dz)||1,sp=clamp(l*1.2+8,10,22);
      ball.vx=dx/l*sp;ball.vz=dz/l*sp;ball.vy=.6;ball.passTo=tg;if(tg&&k.team===0)user=tg;sfx('pass');k.distrib=null;k.crouchT=0;ball.tried[k.team]=true;k.pcd=1.2;}
    return true;}
  return false;}


// ================== JUGADORES ==================
function nearestOpp(p){let b=null,bd=1e9;for(const e of players){if(e.team===p.team||e.gk)continue;const d=d2(p,e);if(d<bd){bd=d;b=e;}}return b;}
function knock(o,dx,dz,power,stun){
  if(o.star>0)return false;
  power*=o.knockRes||1;o.vx=dx*power;o.vz=dz*power;o.stun=Math.max(o.stun,stun);o.act=null;o.recover=0;
  if(ball.gk===o){ball.gk=null;ball.vx=rand(-5,5);ball.vz=rand(-5,5);ball.vy=4;ball.tried=[true,true];}
  loseBall(o,dx,dz);return true;
}

function zapPlayer(p){fb('chispas',p.x,1.3,p.z,3.2,.5);p.zapcd=.8;p.stun=Math.max(p.stun,1.2);p.elecT=Math.max(p.elecT||0,1.1);pwElectro(1.1);fenceFlash=.35;for(let i=0;i<18;i++)part(p.x,rand(.3,2),p.z,rand(-7,7),rand(0,7),rand(-7,7),Math.random()<.5?0x8ff4ff:0xffffff,.35,10,1.2);
  shakeAmt=Math.max(shakeAmt,.5);popText('¡ZAP!',p.x,2.5,p.z,'#8ff4ff',20);sfx('zap');loseBall(p,0,0);}
function movePlayer(p,dt){
  const px0=p.x;p.x+=p.vx*dt;p.z+=p.vz*dt;let hit=false;
  for(const w of walls){if(w.up<.6)continue;const hx=w.th/2+.45,hz=w.len/2+.3;if(Math.abs(p.x-w.x)<hx&&Math.abs(p.z-w.z)<hz){const s=Math.sign(px0-w.x)||1;p.x=w.x+s*hx;p.vx=0;}}
  if(p.z>HW-.5){p.z=HW-.5;if(p.vz>7)hit=true;p.vz=-Math.abs(p.vz)*.4;}
  if(p.z<-HW+.5){p.z=-HW+.5;if(p.vz<-7)hit=true;p.vz=Math.abs(p.vz)*.4;}
  const lim=L-.45;
  if(p.x>lim){p.x=lim;if(p.vx>7&&Math.abs(p.z)>GW)hit=true;p.vx=-Math.abs(p.vx)*.4;}
  if(p.x<-lim){p.x=-lim;if(p.vx<-7&&Math.abs(p.z)>GW)hit=true;p.vx=Math.abs(p.vx)*.4;}
  if(hit&&!p.gk&&p.zapcd<=0&&p.star<=0&&(p.stun>0||p.act))zapPlayer(p);
}
function startAct(p,type,dx,dz){
  const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
  p.act=type;p.actDir={x:dx,z:dz};p.hitSet=new Set();faceTo(p,dx,dz);p.tcd=type==='slide'?1.2:.8;
  if(type==='slide'){p.actT=.45;p.vx=dx*15;p.vz=dz*15;sfx('slide');}
  else{p.actT=.24;p.vx=dx*13.5;p.vz=dz*13.5;}
}
function updateAct(p,dt){
  p.actT-=dt;const f=p.act==='slide'?Math.max(0,1-2.2*dt):1;p.vx*=f;p.vz*=f;
  if(p.act==='slide'&&Math.random()<.5)dust(p.x,p.z);
  for(const o of players){
    if(o.team===p.team||p.hitSet.has(o)||o.stun>0)continue;
    const d=d2(p,o),reach=(p.act==='slide'?1.05:1.15)*p.defReach*CHAR_SCALE;if(d>reach)continue;
    if(o.gk&&p.act==='slide')continue;
    p.hitSet.add(o);
    if(o.star>0){knock(p,-p.actDir.x,-p.actDir.z,8,.6);popText('¡REBOTE!',p.x,2.4,p.z,'#fff');sfx('hit');continue;}
    const had=ball.owner===o;
    if(had&&Math.random()>clamp(.62*p.defMul-o.dodge,.3,.9)){popText('¡Lo esquivó!',o.x,2.4,o.z,'#bff');o.vx+=p.actDir.z*3;o.vz-=p.actDir.x*3;continue;}
    if(p.act==='slide'){if(knock(o,p.actDir.x,p.actDir.z,7.5*p.fisMul,.75)&&!o.gk)launch(o,3.2);if(had){ball.vx=p.actDir.x*8+rand(-2,2);ball.vz=p.actDir.z*8+rand(-2,2);ball.vy=2.5;}}
    else{if(knock(o,p.actDir.x,p.actDir.z,(o.gk?5:12)*p.fisMul,o.gk?.5:.6)&&!o.gk)launch(o,4.2);if(had&&!p.stun){take(p);}}
    hitstop=.075;shakeAmt=Math.max(shakeAmt,.5);burst((p.x+o.x)/2,1,(p.z+o.z)/2,0xfff6a0,14,7);ringFx((p.x+o.x)/2,(p.z+o.z)/2,2.2,0xfff6a0,.25);
    popText(HITS[Math.floor(Math.random()*HITS.length)],(p.x+o.x)/2,2.4,(p.z+o.z)/2,'#fff');sfx('hit');
  }
  if(p.act==='slide'&&!ball.owner&&!ball.gk&&ball.y<.8&&Math.hypot(ball.x-p.x,ball.z-p.z)<1){ball.vx=p.actDir.x*9;ball.vz=p.actDir.z*9;ball.vy=1.5;ball.lastTeam=p.team;}
  if(p.actT<=0){p.recover=p.act==='slide'?.35:.18;p.act=null;}
}
function tryPick(p){
  if(ball.owner||ball.gk||p.pcd>0||p.stun>0||p.act||p.recover>0)return;
  const d=Math.hypot(ball.x-p.x,ball.z-p.z);if(d>.95||ball.y>1.1)return;
  const hs=Math.hypot(ball.vx,ball.vz);
  if(ball.super&&ball.lastTeam!==p.team&&p.star<=0)return;
  const intc=ball.passTo?(hs<9?.25:hs<16?.06:0):(hs<17?.5:0);
  if(ball.passTo===p||(ball.lastTeam===p.team?hs<13:(hs<9||Math.random()<intc)))take(p);
}
function updateControl(){
  const c=ball.owner;
  if(c&&c.team===0){user=c;return;}
  if(ball.passTo&&ball.passTo.team===0){user=ball.passTo;return;}
  if(user&&(user.act||user.recover>0))return;
  const tgt=ball.cross?landing():ball;
  let best=user,bd=user?d2(user,tgt):1e9;
  for(const p of fieldOf(0)){const d=d2(p,tgt);if(d<bd-1.8){bd=d;best=p;}}
  user=best;
}
function attackMode(){
  if(ball.owner)return ball.owner.team===0;
  if(ball.gk)return ball.gk.team===0;
  if(ball.passTo)return ball.passTo.team===0;
  return ball.lastTeam===0&&ball.y>.6;
}
function aiTarget(p,dt){
  const d=dirOf(p.team),c=ball.owner,gx=-d*L,s=p.slot||{x:-9,z:0,r:'MED'};
  const homeX=s.x*d,homeZ=s.z,bx=clamp(ball.x,-L+6,L-6);
  let tx=homeX,tz=homeZ,spd=RUN*.92;
  if(ball.passTo===p){if(ball.cross&&p.crossSpot){tx=p.crossSpot.x;tz=p.crossSpot.z;}else{tx=ball.x+ball.vx*.25;tz=ball.z+ball.vz*.25;}return{tx,tz,spd:RUN};}
  const mates=fieldOf(p.team);
  if(c&&c.team===p.team){
    // ataque: cada rol hace su trabajo
    if(s.r==='DEL'){spd=RUN;tx=clamp(c.x+d*9,-L+3,L-3);if(tx*d>L-8)tx=d*(L-6.5);tz=(homeZ!==0?homeZ*.85:(c.z>0?-5:5))+Math.sin(T*.7+p.idx)*2;}
    else if(s.r==='MED'){tx=c.x-d*3;tz=homeZ!==0?homeZ:(c.z>0?-6:6);}
    else{const lim=d>0?-2:2;tx=c.x-d*13;tx=d>0?Math.min(tx,lim):Math.max(tx,lim);tz=homeZ*.8+c.z*.2;}
    const o=nearestOpp({x:tx,z:tz,team:p.team});if(o&&Math.hypot(o.x-tx,o.z-tz)<2.5)tz+=(tz>o.z?2.5:-2.5);
  } else if(c&&c.team!==p.team){
    // defensa
    const fl=mates.slice().sort((a,b)=>d2(a,c)-d2(b,c));
    const presser=p.team===1?fl[0]:(pressT>0?fl.find(m=>m!==user):null);
    if(p===presser){tx=ball.x+ball.vx*.15;tz=ball.z+ball.vz*.15;spd=RUN;
      p.react-=dt;if(p.react<=0&&p.tcd<=0&&d2(p,c)<1.9){p.react=rand(.5,1.1)*D.think/(p.team===1?D.tack:1);
        if(Math.random()<.5*p.defMul*(p.team===1?D.tack:1)){if(Math.random()<.45)startAct(p,'slide',c.x-p.x,c.z-p.z);else if(d2(p,c)<1.35)startAct(p,'body',c.x-p.x,c.z-p.z);}}}
    else if(s.r==='DEF'){
      const defs=mates.filter(m=>m.slot&&m.slot.r==='DEF'&&m!==presser&&m!==user).sort((a,b)=>a.idx-b.idx);
      const opps=fieldOf(1-p.team).filter(o=>o!==c).sort((a,b)=>Math.abs(a.x-gx)-Math.abs(b.x-gx));
      const o=opps[defs.indexOf(p)];
      if(o&&Math.abs(o.x-gx)<L*1.1){tx=o.x+(gx-o.x)*.15;tz=o.z*.9;}else{tx=c.x+(gx-c.x)*.45;tz=c.z*.5+homeZ*.3;}
    }
    else if(s.r==='MED'){tx=c.x+(gx-c.x)*.35;tz=c.z*.5+homeZ*.4;}
    else{tx=bx*.5-d*2;tz=homeZ*.7+c.z*.2;}
  } else if(ball.gk){tx=homeX+(ball.gk.team===p.team?d*8:0);tz=homeZ;spd=RUN*.6;}
  else{
    const tgt=ball.cross?landing():{x:ball.x+ball.vx*.3,z:ball.z+ball.vz*.3};
    const fl=mates.slice().sort((a,b)=>d2(a,tgt)-d2(b,tgt));
    let chaser=fl[0];if(p.team===0&&chaser===user)chaser=null;
    if(chaser===p){tx=tgt.x;tz=tgt.z;spd=RUN;}
    else{tx=clamp(homeX+bx*.55,-L+3,L-3);tz=clamp(homeZ*.85+ball.z*.3,-HW+2,HW-2);}
  }
  {const dd=Math.hypot(tx-p.x,tz-p.z);if(spd<RUN*.95&&dd<7)spd=RUN*(.42+.05*dd);}
  return{tx:clamp(tx,-L+1,L-1),tz:clamp(tz,-HW+1,HW-1),spd};
}
function aiCarrier(p,dt){
  const d=dirOf(p.team),gx=d*L,distGoal=Math.hypot(gx-p.x,p.z);
  if(p.charging){p.charge=Math.min(1,p.charge+dt*1.1*p.chargeMul);if(p.charge>=p.chargeTarget){shoot(p,p.charge);}return{tx:p.x,tz:p.z,spd:0};}
  let tx=gx,tz=p.z*.5;const o=nearestOpp(p),od=o?d2(p,o):99;
  if(o&&od<4.5&&(o.x-p.x)*d>-.5){tz=p.z+(o.z<p.z?1:-1)*4;tx=p.x+d*5;}
  p.hold+=dt;p.think-=dt;
  if(p.think<=0){p.think=(.25+rand(0,.3))*D.think;
    if(distGoal<22&&Math.random()<.75){if(Math.random()<.24||superNext[p.team]){p.charging=true;p.charge=0;p.chargeTarget=1;}else shoot(p,rand(.5,.92));return{tx,tz,spd:0};}
    if(Math.abs(p.z)>8&&p.x*d>L-15&&Math.random()<.45){const m=bestCrossTarget(p,null);if(m){centro(p,m);return{tx,tz,spd:0};}}
    if((od<2.3&&Math.random()<.6)||(p.hold>4&&Math.random()<.3)){const m=bestPassTarget(p,null);if(m){pass(p,m);return{tx,tz,spd:0};}}
  }
  return{tx,tz,spd:RUN*.88};
}
function tryVolley(p){
  if(ball.owner||ball.gk||p.stun>0||p.act)return false;
  if(ball.y<.45||ball.y>2.7||Math.hypot(ball.x-p.x,ball.z-p.z)>(p.aereo?2.3:1.7))return false;
  shoot(p,.85,ball.y>1.5?'¡Cabezazo!':'¡Volea!');p.volleyQ=0;return true;
}
function updatePlayer(p,dt){
  if(cine&&cine.p===p){p.vx*=.5;p.vz*=.5;return;}
  p.tcd-=dt;p.pcd-=dt;p.zapcd-=dt;if(p.star>0)p.star-=dt;if(p.kickT>0)p.kickT-=dt;if(p.touchVis>0)p.touchVis-=dt;if(p.slip>0)p.slip-=dt;if(p.volleyQ>0)p.volleyQ-=dt;
  if(p.gk){updateKeeper(p,dt);return;}
  if(p.charging&&ball.owner!==p){p.charging=false;p.charge=0;}
  if(p.stun>0){p.stun-=dt;const f=Math.max(0,1-3*dt);p.vx*=f;p.vz*=f;movePlayer(p,dt);return;}
  if(p.recover>0){p.recover-=dt;p.vx*=.85;p.vz*=.85;movePlayer(p,dt);return;}
  if(p.act){updateAct(p,dt);movePlayer(p,dt);return;}
  let slow=1;for(const z of zones){if(z.team!==p.team&&Math.hypot(p.x-z.x,p.z-z.z)<z.r){slow=Math.min(slow,z.kind==='lodo'?.36:.45);if(z.kind==='lodo'&&Math.hypot(p.vx,p.vz)>2&&Math.random()<.25)part(p.x,.15,p.z,rand(-1.5,1.5),rand(1.5,3),rand(-1.5,1.5),Math.random()<.5?0x5a3b1e:0x7a5230,.45,12,rand(.5,.9));}}
  let dvx=0,dvz=0;
  if(p===user){
    let jx=-joy.y,jz=joy.x;const m=Math.hypot(jx,jz);
    let sp=RUN*p.spdMul*(ball.owner===p?p.dribMul:1)*(p.charging?.45:1)*(p.star>0?1.35:1)*slow;
    // v47: arrancón corto al salir de parado o al cambiar de dirección de golpe
    p.burstCd=(p.burstCd||0)-dt;p.burst=(p.burst||0)-dt;
    if(m>.55&&p.burstCd<=0&&!p.charging){const cv=Math.hypot(p.vx,p.vz),dot=cv>.1?(p.vx*jx+p.vz*jz)/(cv*m):-1;
      if(cv<1.6||dot<-.25){p.burst=.22;p.burstCd=.7;dust(p.x,p.z);}}
    if(p.burst>0)sp*=1.32;
    if(pressT>0&&m<.2&&ball.owner&&ball.owner.team!==0){const dx=ball.x-p.x,dz=ball.z-p.z,l=Math.hypot(dx,dz)||1;dvx=dx/l*sp;dvz=dz/l*sp;}
    else if(m>.12){const k=Math.min(1,m);dvx=jx/m*k*sp;dvz=jz/m*k*sp;}
    if(p.charging)p.charge=Math.min(1,p.charge+dt*1.1*p.chargeMul);
    if(ball.owner===p)p.hold+=dt;
    if(p.volleyQ>0)tryVolley(p);
  } else {
    let r=ball.owner===p?aiCarrier(p,dt):aiTarget(p,dt);p._r=r;
    if(ball.owner!==p&&ball.passTo===p&&ball.cross&&ball.vy<0){const near=Math.hypot(ball.x-p.x,ball.z-p.z)<1.6&&ball.y<2.6&&ball.y>.5;
      if(near&&p.x*dirOf(p.team)>L-20&&Math.random()<.6*dt*20)tryVolley(p);}
    if(!r)r={tx:p.x,tz:p.z,spd:0};
    const dx=r.tx-p.x,dz=r.tz-p.z,l=Math.hypot(dx,dz),sp=r.spd*p.spdMul*(ball.owner===p?p.dribMul:1)*(p.star>0?1.35:1)*slow;
    if(l>.3){const k=Math.min(1,l/1.5);dvx=dx/l*sp*k;dvz=dz/l*sp*k;}
  }
  p.wantFace=null;
  if(ball.owner===p){
    let I=null,want=RUN;
    if(p===user){const mj=Math.hypot(joy.x,joy.y);if(mj>.15&&!p.aim){I={x:-joy.y/mj,z:joy.x/mj};want=RUN*Math.min(1,mj);}}
    else{const r=p._r;if(r&&r.spd>0){const ix=r.tx-ball.x,iz=r.tz-ball.z,il=Math.hypot(ix,iz);if(il>.6){I={x:ix/il,z:iz/il};want=r.spd;}}}
    p.intent=I;p.intentSp=want;
    const fd=I||(p.aim?p.aim.dir:{x:Math.sin(p.face),z:Math.cos(p.face)});
    const px=ball.x+ball.vx*.1-fd.x*.5,pz=ball.z+ball.vz*.1-fd.z*.5;
    const maxS=Math.max(2.5,want)*p.spdMul*p.dribMul*(p.star>0?1.35:1)*slow*(p.charging?.5:1);
    let vx,vz,cap=maxS;if(I){vx=(px-p.x)*6+ball.vx;vz=(pz-p.z)*6+ball.vz;}else{vx=(px-p.x)*3+ball.vx*.5;vz=(pz-p.z)*3+ball.vz*.5;cap=Math.min(maxS,Math.max(1.5,Math.hypot(ball.vx,ball.vz)));}
    const vl=Math.hypot(vx,vz);if(vl>cap){vx*=cap/vl;vz*=cap/vl;}
    dvx=vx;dvz=vz;if(Math.hypot(px-p.x,pz-p.z)<.8)p.wantFace=fd;
  }
  const acc=Math.min(1,(slow<1?2.5:(p===user?(p.burst>0?24:16):(ball.owner===p?13:11)))*dt);p.vx+=(dvx-p.vx)*acc;p.vz+=(dvz-p.vz)*acc;
  const sp=Math.hypot(p.vx,p.vz);
  if(p.wantFace){const target=Math.atan2(p.wantFace.x,p.wantFace.z);let df=target-p.face;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;p.face+=df*Math.min(1,20*dt);}
  else if(sp>.6){const target=Math.atan2(p.vx,p.vz);let df=target-p.face;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;p.face+=df*Math.min(1,(p===user?22:15)*dt);}
  else if(ball.owner!==p){const lk=(p.gest&&p.gestAt)?p.gestAt:ball;const target=Math.atan2(lk.x-p.x,lk.z-p.z);let df=target-p.face;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;p.face+=df*Math.min(1,6*dt);}
  movePlayer(p,dt);tryPick(p);
}
function separate(){
  for(let i=0;i<players.length;i++){const a=players[i];for(let j=i+1;j<players.length;j++){const b=players[j];
    const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),m=1.05*CHAR_SCALE;
    if(d<m&&d>.001){const o=(m-d)/2,nx=dx/d,nz=dz/d;a.x-=nx*o;a.z-=nz*o;b.x+=nx*o;b.z+=nz*o;}}}
}



// jugador sin malla (el juego le agrega la malla en newPlayer)
function newPlayerState(team,gk,idx,card,lvl,slot){
  const p={team,gk,idx,card,slot:slot||null,oop:!gk&&!!card&&!!slot&&card.pos!==slot.r,lvl:lvl||1,x:0,z:0,vx:0,vz:0,face:team===0?Math.PI/2:-Math.PI/2,stun:0,slip:0,star:0,act:null,actT:0,actDir:{x:1,z:0},hitSet:null,recover:0,tcd:0,pcd:0,react:0,charge:0,charging:false,chargeTarget:1,kickT:0,anim:Math.random()*6,think:0,hold:0,dive:0,diveDir:1,zapcd:0,volleyQ:0,celebrate:0,homeX:0,homeZ:0};
  applyStats(p);return p;
}
function applyStats(p){
  const c=p.card,b=(p.lvl-1)*3,S=k=>c?Math.max(20,Math.min(99,(c.st[k]||50)+b-(p.oop?6:0))):55;
  if(p.gk){p.spdMul=.8+S('vel')*.004;p.keepMul=.7+S('ref')*.006;p.reachMul=.8+S('alc')*.004;p.salMul=.8+S('sal')*.004;p.passErr=Math.max(0,(90-S('pas'))*.004);p.knockRes=1.3-S('fis')*.006;p.shotMul=1;p.shotErr=0;p.chargeMul=1;p.dribMul=1;p.dodge=0;p.defReach=1;p.defMul=1;p.fisMul=1;return;}
  p.spdMul=.78+S('vel')*.0045;p.dribMul=.8+S('reg')*.0022;p.dodge=Math.max(0,(S('reg')-55)/180);
  p.shotMul=.8+S('tir')*.004;p.shotErr=Math.max(0,(85-S('tir'))*.035);p.chargeMul=(.8+S('tir')*.004)*(c&&c.trait==='carga'?1.4:1);
  p.passErr=Math.max(0,(90-S('pas'))*.004);p.defReach=.85+S('def')*.003;p.defMul=.6+S('def')*.008;
  p.fisMul=.7+S('fis')*.006;p.knockRes=1.3-S('fis')*.006;p.aereo=!!(c&&c.trait==='aereo');p.keepMul=1;p.reachMul=1;p.salMul=1;
}
function launch(p,vy){p.flyVy=vy;p.flyY=Math.max(p.flyY||0,.01);p.flySpin=rand(7,12)*(Math.random()<.5?1:-1);p.flyRot=0;}

// ===================================================================

  function setup(sq0, sq1) {
    players = [];
    for (const [team, sq] of [[0, sq0], [1, sq1]]) {
      players.push(newPlayerState(team, true, 0, sq.gk.card, sq.gk.lvl));
      sq.f.forEach((o, i) => players.push(newPlayerState(team, false, i, o.card, o.lvl, sq.slots[i])));
    }
    ball = SIM.newBall(); score = [0, 0]; energy = [5, 5]; time = MATCH_T; overtime = false; otTime = OT_T; state = 'play';
    kickoff(0);
  }
  // un paso del partido (sin poderes todavía: llegan en la parte 3)
  function step(dt) {
    if (state !== 'play') return;
    T += dt;
    if (pause > 0) { pause -= dt; if (pause <= 0 && pauseCb) { const cb = pauseCb; pauseCb = null; cb(); } return; }
    if (!overtime) { time -= dt; if (time <= 0) { time = 0; if (score[0] === score[1]) { overtime = true; otTime = OT_T; pause = 1.8; pauseCb = () => kickoff(Math.random() < .5 ? 0 : 1); return; } endGame(); return; } }
    else { otTime -= dt; if (otTime <= 0) { endGame(); return; } }
    pressT -= dt; shield[0] -= dt; shield[1] -= dt;
    updateControl();
    for (const p of players) { updatePlayer(p, dt); runQueue(p, dt); }
    contestBall(dt); separate(); updateBall(dt);
  }
  return {
    setup, step, events,
    get ball() { return ball; }, get players() { return players; }, get score() { return score; },
    get time() { return time; }, get state() { return state; }, get pause() { return pause; }
  };
}
