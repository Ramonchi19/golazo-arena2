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
function mySquadInfo(){const sq=save.squad;return{form:sq.form,gk:{id:sq.gk,lvl:(save.players[sq.gk]||{}).lvl||1},f:sq.f.map(id=>({id,lvl:(save.players[id]||{}).lvl||1}))};}
function deckLvl(){const L=save.deck.map(k=>(save.powers[k]||{}).lvl||1);return Math.round(L.reduce((a,b)=>a+b,0)/(L.length||1));}
function myInfo(){return{t:'buscar',uid:NET.user?NET.user.uid:'',name:save.name,avatar:save.avatar,country:save.country,trophies:save.trophies,
  squad:mySquadInfo(),deck:save.deck.slice(),plvl:deckLvl(),kit:{k:save.equip.kit,b:save.equip.boots}};}
// rival → objeto que entiende newGame()
function oppFrom(r){
  const sq=r.squad||{},form=FORMS[sq.form]?sq.form:'ataque',F=FORMS[form].s;
  const card=(id,pos)=>PBY[id]&&READY.has(id)?PBY[id]:PLAYERS.find(p=>p.pos===pos)||PLAYERS[0];
  const lv=v=>Math.max(1,Math.min(MAXLVL,v|0||1));
  // uniforme del rival; si se parece al mío, se cambia por uno que contraste (como contra la CPU)
  let kk=r.kit&&KITS[r.kit.k]?r.kit.k:'rojo',bk=r.kit&&BOOTS[r.kit.b]?r.kit.b:'negro';
  const mk=hexN(KITS[save.equip.kit].j),dist=k=>{const c=hexN(KITS[k].j);const dr=((c>>16)&255)-((mk>>16)&255),dg=((c>>8)&255)-((mk>>8)&255),db=(c&255)-(mk&255);return Math.sqrt(dr*dr+dg*dg+db*db);};
  if(!KITS[kk]||dist(kk)<200){const ok=Object.keys(KITS).filter(k=>dist(k)>200);kk=ok.includes('rojo')?'rojo':(ok[0]||'blanco');}
  const g=sq.gk||{},f=(sq.f||[]).slice(0,4);while(f.length<4)f.push({});
  return{name:r.name||'Rival',av:r.avatar||'⚽',c:r.country||'MX',trophies:r.trophies|0,online:true,
    squad:{form,kit:kitColors(kk,bk),gk:{card:card(g.id,'POR'),lvl:lv(g.lvl)},f:f.map((o,i)=>({card:card(o.id,F[i].r),lvl:lv(o.lvl)}))},
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
function fail(msg){if(!O)return;const wasStarted=O.started;O.ended=true;window.ONLINE=null;H1=false;
  try{closeModal();}catch(e){}say(msg);
  if(wasStarted&&state==='play'){state='end';crowdStop(false);onMatchEnd(score[0],Math.max(score[1],score[0]+1),true);}
  O=null;}
function send(o){if(O&&O.ws&&O.ws.readyState===1)O.ws.send(JSON.stringify(o));}

function onMsg(m){if(!O)return;
  if(m.t==='sala'){O.retries=0;if(!O.rival){O.rival=oppFrom(m.rival);showVS(O.rival,()=>{});}}
  else if(m.t==='cuenta'){startOnline();}
  else if(m.t==='inicio'){if(!O.started)startOnline();O.go=true;pause=0;pauseCb=null;showBig('¡A jugar!');sfx('whistle');}
  else if(m.t==='s'){applySnap(m);}
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
  H1=true;user1=fieldOf(1)[0];
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
  H1=false;window.ONLINE=null;const ws=O.ws;O=null;try{ws.close();}catch(e){}
  onMatchEnd(a,b,false);
}

// ---------- corrección con la foto del servidor ----------
function angLerp(a,b,k){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*k;}
function applySnap(S){
  if(!O||!O.started||state!=='play')return;O.snaps++;
  time=S.tm;overtime=!!S.ot;score=S.sc.slice();energy[0]=S.en;
  if(S.ps>0){pause=Math.max(pause,S.ps);pauseCb=null;}else if(O.go&&pause>0&&pause<50)pause=0;
  const B=S.b;
  const own=B[6]>=0?players[B[6]]:null,gk=B[7]>=0?players[B[7]]:null;
  if(own){if(ball.owner!==own){ball.owner=own;ball.gk=null;own.protect=.3;}}
  else if(gk){if(ball.gk!==gk){ball.gk=gk;ball.owner=null;}}
  else if(ball.owner||ball.gk){ball.owner=null;ball.gk=null;}
  const bd=Math.hypot(B[0]-ball.x,B[2]-ball.z,B[1]-ball.y),bk=bd>3?1:.45;
  ball.x+=(B[0]-ball.x)*bk;ball.y+=(B[1]-ball.y)*bk;ball.z+=(B[2]-ball.z)*bk;
  if(!own){ball.vx=B[3];ball.vy=B[4];ball.vz=B[5];}ball.super=!!B[8];
  S.p.forEach((q,i)=>{const p=players[i];if(!p)return;
    const d=Math.hypot(q[0]-p.x,q[1]-p.z),mine=p===user;
    const k=d>3.5?1:mine?.12:.35;
    p.x+=(q[0]-p.x)*k;p.z+=(q[1]-p.z)*k;
    if(!mine||d>3.5){p.vx=q[2];p.vz=q[3];p.face=angLerp(p.face,q[4],mine?.1:.5);}
    if(q[5]>0&&!(p.stun>0))p.stun=q[5];else if(q[5]<=0&&p.stun>.25)p.stun=.05;
    if(q[7]>0&&!(p.flyY>0)){p.flyY=q[7];p.flyVy=0;}
    p.star=q[8];
  });
}

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
  askConfirm('¿Rendirte?','Contará como derrota.',()=>{const ws=O&&O.ws;if(O){O.ended=true;}window.ONLINE=null;H1=false;O=null;try{ws&&ws.close();}catch(e){}state='end';crowdStop(false);onMatchEnd(score[0],Math.max(score[1],score[0]+1),true);});};}

// joystick al servidor (hasta 30 veces por segundo, solo si cambió)
(function pump(){requestAnimationFrame(pump);if(!O||!O.go||state!=='play')return;
  const now=performance.now();if(now-O.lastSend<33)return;
  const jx=+joy.x.toFixed(2),jy=+joy.y.toFixed(2);
  if(Math.abs(jx-O.lj[0])+Math.abs(jy-O.lj[1])>.04||now-O.lastSend>250){O.lj=[jx,jy];O.lastSend=now;send({t:'in',j:[jx,jy]});}})();

window.NETPLAY={get active(){return !!O;},get info(){return O;}};
})();
