/* v65 · Wild Strikers: buscar rival y jugar en vivo
   - "¡Batalla!" con sesión iniciada → fila de búsqueda en el servidor (por copas).
   - Si aparece rival → partido en vivo: el teléfono simula el partido (para que se sienta inmediato)
     y el servidor manda la verdad 30 veces por segundo; aquí se corrige suavemente.
   - Si nadie aparece en ~18 s → bot de tu nivel (partido contra la IA como siempre). */
(function(){
'use strict';
const WS=(window.NET&&NET.server)||'wss://wild-strikers.ramoncas0234.workers.dev';
let O=null;               // partido en línea activo
window.ONLINE=null;
const say=t=>{try{toast(t);}catch(e){}};
const h=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---------- datos que se mandan a la fila ----------
function mySquadInfo(){const sq=save.squad;return{form:sq.form,gk:{id:sq.gk,lvl:(save.players[sq.gk]||{}).lvl||1,num:numOf(sq.gk)},f:sq.f.map(id=>({id,lvl:(save.players[id]||{}).lvl||1,num:numOf(id)}))};}
function deckLvl(){const L=save.deck.map(k=>(save.powers[k]||{}).lvl||1);return Math.round(L.reduce((a,b)=>a+b,0)/(L.length||1));}
function myInfo(){return{t:'buscar',uid:NET.user?NET.user.uid:'',name:save.name,avatar:save.avatar,country:save.country,trophies:save.trophies,
  squad:mySquadInfo(),deck:save.deck.slice(),plvl:deckLvl(),kit:{k:save.equip.kit,b:save.equip.boots}};}
// rival → objeto que entiende newGame()
function oppFrom(r){
  const sq=r.squad||{},form=FORMS[sq.form]?sq.form:'ataque',F=FORMS[form].s;
  const card=(id,pos)=>PBY[id]&&READY.has(id)?PBY[id]:PLAYERS.find(p=>p.pos===pos)||PLAYERS[0];
  const lv=v=>Math.max(1,Math.min(MAXLVL,v|0||1));
  // v68: el rival juega con SU uniforme; si se confunde con el mío, newGame() pone el visitante al que juega de visita
  const kk=r.kit&&KITS[r.kit.k]?r.kit.k:'clasico',bk=r.kit&&BOOTS[r.kit.b]?r.kit.b:'negro';
  const g=sq.gk||{},f=(sq.f||[]).slice(0,4);while(f.length<4)f.push({});
  const nums={},nn=v=>{v=v|0;return v>=1&&v<=99?v:0;};
  {const c0=card(g.id,'POR');if(nn(g.num))nums[c0.id]=nn(g.num);f.forEach((o,i)=>{const c=card(o.id,F[i].r);if(nn(o.num))nums[c.id]=nn(o.num);});}
  return{name:r.name||'Rival',av:r.avatar||'⚽',c:r.country||'MX',trophies:r.trophies|0,online:true,
    squad:{form,kit:kitColors(kk,bk),gk:{card:card(g.id,'POR'),lvl:lv(g.lvl)},f:f.map((o,i)=>({card:card(o.id,F[i].r),lvl:lv(o.lvl)})),nums},
    deck:(r.deck||[]).filter(k=>CARDS[k]).slice(0,8),plvl:1,li:leagueIdx(r.trophies|0)};
}

// ---------- pantalla de búsqueda ----------
const origMatchmaking=window.matchmaking;
window.matchmaking=function(){
  if(!(window.NET&&NET.user)||NET.offline){return origMatchmaking();}
  let fila=null,done=false,t0=Date.now();
  showModal(`<div class="mm ct"><div class="spin">⚽</div><span id="mmT">Buscando rival...</span><small id="mmS">${LEAGUES[leagueIdx(save.trophies)].n} · 🏆 ${save.trophies}</small><button class="btn r sm" id="mmX">Cancelar</button></div>`,true,true);
  const setT=(a,b)=>{const x=document.getElementById('mmT'),y=document.getElementById('mmS');if(x&&a)x.textContent=a;if(y&&b)y.textContent=b;};
  const finish=()=>{done=true;try{fila&&fila.close();}catch(e){}};
  document.getElementById('mmX').onclick=()=>{finish();closeModal();};
  const toBot=()=>{if(done)return;finish();const opp=makeOpponent();showVS(opp,()=>startMatch(opp));};
  try{fila=new WebSocket(WS+'/fila');}catch(e){toBot();return;}
  const failT=setTimeout(()=>{if(!done&&(!fila||fila.readyState!==1))toBot();},6000);
  fila.onopen=()=>{clearTimeout(failT);fila.send(JSON.stringify(myInfo()));};
  fila.onmessage=ev=>{let m;try{m=JSON.parse(ev.data);}catch(e){return;}if(done)return;
    if(m.t==='buscando')setT('Buscando rival...',`🏆 ${save.trophies} · rango ±${m.rango} copas · ${m.seg||0} s`);
    else if(m.t==='bot')toBot();
    else if(m.t==='rival'){finish();setT('¡Rival encontrado!','Conectando…');joinMatch(m);}};
  fila.onerror=()=>{if(!done&&Date.now()-t0<6000)toBot();};
  fila.onclose=()=>{if(!done){toBot();}};
};
function showVS(opp,go){sfx('whistle');
  const box=document.getElementById('mbox');if(!box){go();return;}
  box.innerHTML=`<div class="vs"><div class="vs-s"><span class="av" style="background:${save.color}">${save.avatar}</span><b class="ct">${h(save.name)}</b><small class="ct">${flag(save.country)} 🏆 ${save.trophies}</small></div><div class="vs-x ct">VS</div><div class="vs-s op"><span class="av" style="background:#ff3b4e">${h(opp.av)}</span><b class="ct">${h(opp.name)}</b><small class="ct">${flag(opp.c)} 🏆 ${opp.trophies}</small></div></div>`;
  setTimeout(()=>{closeModal();go();},1700);}

// ---------- conexión al partido ----------
function joinMatch(m){
  O={id:m.partido,team:m.equipo,key:m.clave,ws:null,started:false,ended:false,lastSend:0,lj:[9,9],snaps:0,retries:0,rival:null};window.ONLINE=O;
  connect();
}
function connect(){
  const url=`${WS}/partido?id=${encodeURIComponent(O.id)}&equipo=${O.team}&clave=${encodeURIComponent(O.key)}`;
  let ws;try{ws=new WebSocket(url);}catch(e){fail('No se pudo conectar al partido');return;}
  O.ws=ws;
  ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data);}catch(e){return;}onMsg(m);};
  ws.onclose=()=>{if(!O||O.ended||O.ws!==ws)return;
    if(O.retries<4){O.retries++;say('Reconectando…');setTimeout(()=>{if(O&&!O.ended)connect();},800*O.retries);}
    else fail('Se perdió la conexión');};
}
function fail(msg){if(!O)return;const wasStarted=O.started;O.ended=true;window.ONLINE=null;H1=false;CTRL_LOCK[1]=false;
  try{closeModal();}catch(e){}say(msg);
  if(wasStarted&&state==='play'){state='end';crowdStop(false);onMatchEnd(score[0],Math.max(score[1],score[0]+1),true);}
  O=null;}
function send(o){if(O&&O.ws&&O.ws.readyState===1)O.ws.send(JSON.stringify(o));}

function onMsg(m){if(!O)return;
  if(m.t==='sala'){O.retries=0;if(!O.rival){O.rival=oppFrom(m.rival);showVS(O.rival,()=>{});}}
  else if(m.t==='cuenta'){startOnline();}
  else if(m.t==='inicio'){if(!O.started)startOnline();O.go=true;pause=0;pauseCb=null;showBig('¡A jugar!');sfx('whistle');}
  else if(m.t==='s'){applySnap(m);}
  else if(m.t==='po'){const r=performance.now()-m.c;O.rtt=O.rtt?O.rtt*.7+r*.3:r;}
  else if(m.t==='ri'){joy1.x=m.j[0];joy1.y=m.j[1];}
  else if(m.t==='rb'){if(m.d)simBtnDown(1,m.k);else simBtnUp(1,m.k);}
  else if(m.t==='rc'){if(CARDS[m.k])castSpell(m.k,1,m.x,m.z);}
  else if(m.t==='gol'){O.srvGoal=true;try{goal(m.equipo);}finally{O.srvGoal=false;}score=m.sc.slice();pauseCb=null;try{updateBoards();}catch(e){}}
  else if(m.t==='rivalSeFue'){say('Tu rival se desconectó…');}
  else if(m.t==='fin'){endOnline(m);}
}
async function startOnline(){
  if(O.started)return;O.started=true;
  const opp=O.rival||oppFrom({});
  await startMatch(opp);
  if(!O)return;
  H1=true;user1=fieldOf(1)[0];CTRL_LOCK[1]=true;
  if(O.team===1)kickoff(1);          // el servidor saca con el equipo azul; desde el lado rojo eso es el rival
  pause=O.go?0:99;pauseCb=null;      // congelado hasta 'inicio'
  if(!O.go){let n=3;const c=()=>{if(!O||O.go||n<=0)return;showBig(String(n),'#fff');sfx('touch');n--;setTimeout(c,1000);};c();}
}
function endOnline(m){if(!O||O.ended)return;O.ended=true;
  if(!O.started){const ws=O.ws;O=null;window.ONLINE=null;try{ws.close();}catch(e){}try{closeModal();}catch(e){}say(m.motivo==='rival_no_llego'?'El rival no llegó. Intenta de nuevo.':'Partido cancelado');return;}
  const sc=m.sc||score,won=m.gana===true,lost=m.gana===false;
  let a=sc[0],b=sc[1];
  if(won&&a<=b)a=b+1;if(lost&&a>=b)b=a+1;      // victoria o derrota por abandono
  if(m.motivo==='abandono'||m.motivo==='rival_no_llego')say(won?'Tu rival abandonó: ¡ganas!':'Abandonaste el partido');
  try{tensEl.classList.remove('on','fast');clockEl.classList.remove('hot');}catch(e){}
  state='end';selCard=-1;ghost=null;try{updateSel();}catch(e){}
  sfx('whistle');crowdStop(false);
  H1=false;CTRL_LOCK[1]=false;window.ONLINE=null;const ws=O.ws;O=null;try{ws.close();}catch(e){}
  onMatchEnd(a,b,false);
}

// ---------- corrección con la foto del servidor ----------
function angLerp(a,b,k){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*k;}
function applySnap(S){
  if(!O||!O.started||state!=='play')return;O.snaps++;
  time=S.tm;overtime=!!S.ot;score=S.sc.slice();energy[0]=S.en;
  if(S.ps>0){pause=Math.max(pause,S.ps);pauseCb=null;}else if(O.go&&pause>0&&pause<50)pause=0;
  // v66: el jugador que controla el rival lo dice el servidor; el mío lo decido yo
  if(S.u&&S.u[1]>=0&&players[S.u[1]]&&players[S.u[1]].team===1)user1=players[S.u[1]];
  const lead=Math.min(.15,(O.rtt||80)/2000);              // el servidor va un poco atrás: se adelanta su foto
  const B=S.b;
  const own=B[6]>=0?players[B[6]]:null,gk=B[7]>=0?players[B[7]]:null;
  if(own){if(ball.owner!==own){ball.owner=own;ball.gk=null;own.protect=.3;}}
  else if(gk){if(ball.gk!==gk){ball.gk=gk;ball.owner=null;}}
  else if(ball.owner||ball.gk){ball.owner=null;ball.gk=null;}
  {const tx=B[0]+(own||gk?0:B[3]*lead),ty=B[1],tz=B[2]+(own||gk?0:B[5]*lead),d=Math.hypot(tx-ball.x,tz-ball.z,ty-ball.y);
    if(d>3){ball.x=tx;ball.y=ty;ball.z=tz;ball._ex=ball._ey=ball._ez=0;}else{ball._ex=tx-ball.x;ball._ey=ty-ball.y;ball._ez=tz-ball.z;}
    if(!own){ball.vx=B[3];ball.vy=B[4];ball.vz=B[5];}ball.super=!!B[8];}
  S.p.forEach((q,i)=>{const p=players[i];if(!p)return;const mine=p===user;
    const tx=q[0]+q[2]*lead,tz=q[1]+q[3]*lead,d=Math.hypot(tx-p.x,tz-p.z);
    if(d>3.5){p.x=tx;p.z=tz;p._ex=p._ez=0;p.vx=q[2];p.vz=q[3];}
    else{const k=mine?.35:1;p._ex=(tx-p.x)*k;p._ez=(tz-p.z)*k;
      if(!mine){p.vx=q[2];p.vz=q[3];p._fa=q[4];}}
    if(q[5]>0&&!(p.stun>0))p.stun=q[5];else if(q[5]<=0&&p.stun>.25)p.stun=.05;
    if(q[7]>0&&!(p.flyY>0)){p.flyY=q[7];p.flyVy=0;}
    p.star=q[8];
  });
  // v67: el portero hace lo mismo que en el servidor (estirada, atajada, puño...) aunque aquí el azar haya salido distinto
  if(S.g)S.g.forEach((g,i)=>{const k=players[i*5];if(!k||!k.gk||!g)return;
    const up=(f,v)=>{if(v>0){if(!(k[f]>0)||Math.abs(k[f]-v)>.12)k[f]=v;}else if(k[f]>0)k[f]=0;};
    if(g[0]>0&&!(k.dive>0)){k.diveDir=g[1];k.diveH=g[2];}up('dive',g[0]);
    if(g[3]>0&&!(k.smother>0))k.smDir=g[4];up('smother',g[3]);
    if((g[5]>0||g[6]>0))k.catchY=g[7];up('highT',g[5]);up('blockT',g[6]);
    if(g[9]>0&&!(k.saveT>0)){k.saveKind=SAVEK[g[8]]||null;k.saveY=g[10];k.saveZ=g[11];}up('saveT',g[9]);
    if(g[12]>0&&!(k.prepT>0))k.prepY=g[13];up('prepT',g[12]);up('down',g[14]);up('backT',g[15]);});
}
const SAVEK=['','fallo','pecho','alta','baja','lado','rechazo','travesano','pie','cuerpo','punta','desvio'];
// v66: la diferencia con el servidor se reparte poco a poco (unos 0.15 s), sin saltos
function smoothStep(dt){if(!O||!O.started)return;const f=Math.min(1,dt/.15),fb=Math.min(1,dt/.1);
  for(const p of players){if(p._ex||p._ez){const dx=p._ex*f,dz=p._ez*f;p.x+=dx;p.z+=dz;p._ex-=dx;p._ez-=dz;if(Math.abs(p._ex)+Math.abs(p._ez)<.002)p._ex=p._ez=0;}
    if(p._fa!=null&&p!==user&&ball.owner!==p){let df=p._fa-p.face;while(df>Math.PI)df-=Math.PI*2;while(df<-Math.PI)df+=Math.PI*2;p.face+=df*Math.min(1,dt*8);if(Math.abs(df)<.02)p._fa=null;}}
  if(ball._ex||ball._ez||ball._ey){const dx=ball._ex*fb,dy=ball._ey*fb,dz=ball._ez*fb;ball.x+=dx;ball.y=Math.max(BR,ball.y+dy);ball.z+=dz;ball._ex-=dx;ball._ey-=dy;ball._ez-=dz;}}

// ---------- lo que cambia en el juego cuando hay partido en línea ----------
const origGoal=window.goal;
window.goal=function(team){if(O&&!O.srvGoal)return;return origGoal(team);};   // solo el servidor decide los goles
const origEnd=window.endGame;
window.endGame=function(){if(O)return;return origEnd();};                    // y cuándo termina
const origCine=window.startCine;
window.startCine=function(p,args){if(O){if(ball.owner===p&&state==='play'){p._cineGo=true;shoot.apply(null,args);}return;}return origCine(p,args);};
const origQTE=window.startQTE;
window.startQTE=function(k){if(O)return;return origQTE(k);};
const origTS=window.timeScaleNow;
window.timeScaleNow=function(rdt){if(O){slowT=0;return 1;}return origTS(rdt);};
const origDown=window.btnDown,origUp=window.btnUp;
window.btnDown=function(k){if(O&&O.go)send({t:'b',k,d:1});return origDown(k);};
window.btnUp=function(k){if(O&&O.go)send({t:'b',k,d:0});return origUp(k);};
const origPlay=window.playCard;
window.playCard=function(team,i,x,z){if(O&&team===0){const k=hands[0][i];const ok=origPlay(team,i,x,z);if(ok)send({t:'c',k,x:+x.toFixed(2),z:+z.toFixed(2)});return ok;}return origPlay(team,i,x,z);};
const qb=document.getElementById('quit');
if(qb){const orig=qb.onclick;qb.onclick=()=>{if(!O)return orig&&orig();if(state!=='play')return;
  askConfirm('¿Rendirte?','Contará como derrota.',()=>{const ws=O&&O.ws;if(O){O.ended=true;}window.ONLINE=null;H1=false;CTRL_LOCK[1]=false;O=null;try{ws&&ws.close();}catch(e){}state='end';crowdStop(false);onMatchEnd(score[0],Math.max(score[1],score[0]+1),true);});};}

// joystick al servidor (hasta 30 veces por segundo, solo si cambió)
(function pump(){requestAnimationFrame(pump);if(!O||!O.go||state!=='play')return;
  const now=performance.now();
  const dt=Math.min(.05,(now-(O.lastFrame||now))/1000);O.lastFrame=now;smoothStep(dt);
  if(now-(O.lastPing||0)>2000){O.lastPing=now;send({t:'p',c:now});}
  if(now-O.lastSend<33)return;
  const jx=+joy.x.toFixed(2),jy=+joy.y.toFixed(2),u=players.indexOf(user);
  if(Math.abs(jx-O.lj[0])+Math.abs(jy-O.lj[1])>.04||u!==O.lu||now-O.lastSend>250){O.lj=[jx,jy];O.lu=u;O.lastSend=now;send({t:'in',j:[jx,jy],u});}})();

window.NETPLAY={get active(){return !!O;},get info(){return O;}};
})();
