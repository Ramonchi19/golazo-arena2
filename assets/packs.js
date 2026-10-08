// Titan Crashers · sobres (v72): aspecto metálico por tipo, inclinación con el dedo, apertura deslizando,
// rayos del color de la mejor carta, pistas para épicas/legendarias, cartas que salen una por una y sonidos propios.
(function(){
'use strict';
// ---------------- estilos ----------------
const css=`
.pack.pack2{--c1:#e8a066;--c2:#7a4416;--c3:#4a2408;--ink:#3a1a04;--glow:rgba(255,170,90,.0);background:none;border:2.5px solid #0a1636;border-radius:10px;overflow:hidden;
  transform:perspective(500px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s;box-shadow:0 3px 0 #0a1636,0 0 14px var(--glow)}
.pack.pack2::before,.pack.pack2::after{display:none}
.pack2 .pk-foil{position:absolute;inset:0;background:
  repeating-linear-gradient(115deg,rgba(255,255,255,.07) 0 3px,transparent 3px 9px),
  radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.55),transparent 55%),
  linear-gradient(165deg,var(--c1) 0%,var(--c2) 55%,var(--c3) 100%)}
.pack2 .pk-shine{position:absolute;top:-30%;bottom:-30%;width:45%;left:var(--sx,-60%);background:linear-gradient(100deg,transparent,rgba(255,255,255,.75),transparent);mix-blend-mode:overlay;animation:pk2shine 3.4s ease-in-out infinite;pointer-events:none}
.pack2.tilting .pk-shine{animation:none}
@keyframes pk2shine{0%,55%{left:-60%}100%{left:130%}}
.pack2 .pk-strip{position:absolute;left:0;right:0;top:0;height:15%;background:linear-gradient(var(--c3),var(--c2));border-bottom:2px dashed rgba(255,255,255,.55);z-index:2}
.pack2 .pk-strip::after{content:'';position:absolute;left:0;right:0;bottom:-5px;height:6px;background:radial-gradient(circle at 4px -1px,transparent 3px,var(--c2) 3.5px) 0 0/8px 6px repeat-x}
.pack2 .pk-emb{position:relative;z-index:1;width:62%;margin-top:8%;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
.pack2 .pk-emb svg{width:100%;display:block}
.pack2 .pk-n{position:relative;z-index:1;margin-top:4%;font-size:clamp(8px,2.4vw,13px);letter-spacing:1px;color:#fff;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill}
.pack2 .pk-holo{position:absolute;inset:0;background:conic-gradient(from var(--ha,0deg),#ff5ec4,#ffd84a,#5affb0,#4ab8ff,#b26bff,#ff5ec4);mix-blend-mode:color-dodge;opacity:.42;animation:pk2holo 5s linear infinite;pointer-events:none}
@property --ha{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes pk2holo{to{--ha:360deg}}
.pack2 .pk-p{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff7c0;box-shadow:0 0 6px #ffd84a;animation:pk2float 3s ease-in infinite;opacity:0;z-index:1}
@keyframes pk2float{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-60px);opacity:0}}
.pk-bronce.pack2{--c1:#f3b27a;--c2:#9a5420;--c3:#5a2a08;--ink:#3a1a04}
.pk-plata.pack2{--c1:#ffffff;--c2:#a7b2c6;--c3:#5d6a84;--ink:#263049;--glow:rgba(200,220,255,.35)}
.pk-oro.pack2{--c1:#fff0a0;--c2:#e2a20a;--c3:#8a5200;--ink:#4a2a00;--glow:rgba(255,210,80,.55)}
.pk-leyenda.pack2{--c1:#d9a8ff;--c2:#7a2fd6;--c3:#2a0a5e;--ink:#1e0742;--glow:rgba(210,140,255,.75)}
/* apertura */
.po2{position:relative;min-height:min(640px,92vh);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;user-select:none;touch-action:none;
  background:radial-gradient(ellipse at 50% 70%,rgba(60,90,200,.55),rgba(5,8,25,.0) 70%)}
.po2 .beams{position:absolute;width:1000px;height:1000px;left:50%;top:44%;margin:-500px;border-radius:50%;opacity:0;transition:opacity .5s;pointer-events:none;
  background:repeating-conic-gradient(var(--bc) 0 5deg,transparent 5deg 15deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 62%);mask:radial-gradient(circle,#000 0,transparent 62%);animation:rot 14s linear infinite}
.po2.lit .beams{opacity:1}
.po2 .dark{position:absolute;inset:0;background:#02030a;opacity:0;transition:opacity .4s;pointer-events:none;z-index:3}
.po2.walk .dark{opacity:.82}
.po2 .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9}
.po2 .flash.go{animation:pk2flash .55s ease-out}
@keyframes pk2flash{0%{opacity:.95}100%{opacity:0}}
.po2 .ped{position:absolute;left:50%;top:66%;width:240px;height:54px;margin-left:-120px;border-radius:50%;background:radial-gradient(ellipse,rgba(140,200,255,.85),rgba(60,110,255,.25) 55%,transparent 70%);filter:blur(1px);animation:pk2ped 2s ease-in-out infinite}
@keyframes pk2ped{50%{transform:scale(1.08);opacity:.85}}
.po2 .bp{width:180px;position:relative;z-index:4;animation:pk2drop .7s cubic-bezier(.3,1.5,.5,1) both}
@keyframes pk2drop{0%{transform:translateY(-120vh) rotate(-20deg)}100%{transform:none}}
.po2 .bp .pack{width:100%}
.po2 .bp.shake{animation:pk2shake .5s}
@keyframes pk2shake{20%,60%{transform:rotate(-5deg) scale(1.04)}40%,80%{transform:rotate(5deg) scale(1.07)}100%{transform:scale(1.06)}}
.po2 .bp.open .pk-strip{transition:transform .5s cubic-bezier(.2,.8,.3,1),opacity .5s;transform:translate(140px,-160px) rotate(38deg);opacity:0}
.po2 .bp.gone{transition:transform .45s ease-in,opacity .45s;transform:translateY(60vh) scale(.7);opacity:0}
.po2 .tearline{position:absolute;left:0;top:13%;height:4px;width:0;background:linear-gradient(90deg,#fff,#ffe58a);box-shadow:0 0 10px #fff;z-index:5;border-radius:2px}
.po2 .hint{position:relative;z-index:6;margin-top:22px;font-size:17px;color:#e8efff;text-align:center}
.po2 .hand{position:absolute;z-index:6;left:50%;top:calc(50% - 150px);width:44px;height:44px;margin-left:-110px;animation:pk2hand 1.4s ease-in-out infinite;pointer-events:none}
@keyframes pk2hand{0%{transform:translateX(0);opacity:0}15%{opacity:1}80%{transform:translateX(170px);opacity:1}100%{transform:translateX(190px);opacity:0}}
.po2 .skip{position:absolute;right:10px;top:10px;z-index:10}
.po2 .stage{position:relative;z-index:6;display:flex;flex-direction:column;align-items:center}
.po2 .clue2{font-size:20px;text-align:center;animation:clueIn .45s cubic-bezier(.2,1.6,.4,1)}
.po2 .clue2 svg{width:110px;height:110px;display:block;margin:0 auto 6px;filter:drop-shadow(0 0 18px var(--cc))}
.po2 .clue2 b{display:block;font-size:24px;color:var(--cc);-webkit-text-stroke:3px #0a1636;paint-order:stroke fill}
.po2 .card3d{width:156px;perspective:900px}
.po2 .card3d .in{position:relative;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.3,1.5,.5,1)}
.po2 .card3d .in.hidden{transform:rotateY(180deg) scale(.6)}
.po2 .card3d .fr{backface-visibility:hidden}
.po2 .card3d .bk{position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:10px;border:3px solid #0a1636;overflow:hidden}
.po2 .wname{font-size:26px;margin-top:12px;text-align:center;animation:clueIn .5s both}
.po2 .wname small{display:block;font-size:14px;color:#dfe7ff}
.po2 .count{margin-top:10px;font-size:14px;color:#cfe0ff}
.po2 .sum{position:relative;z-index:6;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;padding:8px}
.po2 .sum .it{animation:flipSmall .45s both;position:relative}
.po2 .sum .it b{display:block;text-align:center;font-size:12px;margin-top:2px;-webkit-text-stroke:2px #0a1636;paint-order:stroke fill}
.po2 .sum .bar{height:7px;border-radius:4px;background:#0a1636;margin:3px 4px 0;overflow:hidden;border:1.5px solid #0a1636}
.po2 .sum .bar i{display:block;height:100%;background:linear-gradient(90deg,#3ccf5a,#9cff6a);width:0;transition:width .8s .3s}
.po2 .sum .bar.up i{background:linear-gradient(90deg,#ffd23a,#fff38a)}
.po2 .gold{margin-top:10px;font-size:22px;position:relative;z-index:6}
.po2 .paper{position:absolute;width:10px;height:6px;z-index:7;pointer-events:none;animation:pk2paper 1s ease-out forwards}
@keyframes pk2paper{to{transform:translate(var(--x),var(--y)) rotate(var(--r));opacity:0}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

// ---------------- emblema del sobre (dibujado, sin emojis) ----------------
const TIER={bronce:{stars:1,n:'BRONCE'},plata:{stars:2,n:'PLATA'},oro:{stars:3,n:'ORO'},leyenda:{stars:0,n:'LEYENDA',crown:1}};
function emblem(type){const t=TIER[type]||TIER.bronce;
  const star=(cx,cy,r)=>{let p='';for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;p+=(i?'L':'M')+(cx+Math.cos(a)*rr).toFixed(1)+' '+(cy+Math.sin(a)*rr).toFixed(1);}return `<path d="${p}Z" fill="#fff6c8" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>`;};
  let top='';if(t.crown)top=`<path d="M30 30 L34 14 L43 23 L50 8 L57 23 L66 14 L70 30 Z" fill="#ffe36a" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="8" r="3.5" fill="#fff6c8" stroke="var(--ink)" stroke-width="2"/>`;
  else{const xs=t.stars===1?[50]:t.stars===2?[40,60]:[32,50,68];top=xs.map((x,i)=>star(x,t.stars===3&&i===1?16:20,t.stars===3&&i===1?9:7.5)).join('');}
  // escudo + balón
  let pent='';const P=(cx,cy,r,rot)=>{let s='';for(let j=0;j<5;j++){const a=rot+j*2*Math.PI/5;s+=(j?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1);}return s+'Z';};
  pent+=`<path d="${P(50,72,7,-Math.PI/2)}" fill="#1c2038"/>`;
  for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;pent+=`<path d="${P(50+Math.cos(a)*15.5,72+Math.sin(a)*15.5,6.5,a+Math.PI)}" fill="#1c2038"/>`;}
  return `<svg viewBox="0 0 100 112" aria-hidden="true"><defs><clipPath id="bc${type}"><circle cx="50" cy="72" r="18"/></clipPath>
    <linearGradient id="sg${type}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--c1)"/><stop offset="1" stop-color="var(--c3)"/></linearGradient></defs>
    ${top}<path d="M14 36 L50 28 L86 36 L86 66 Q86 94 50 108 Q14 94 14 66 Z" fill="url(#sg${type})" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
    <path d="M20 40 L50 33.5 L80 40 L80 64 Q80 88 50 101 Q20 88 20 64 Z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
    <circle cx="50" cy="72" r="19.5" fill="#fff" stroke="var(--ink)" stroke-width="3.5"/><g clip-path="url(#bc${type})">${pent}</g>
    <ellipse cx="43" cy="64" rx="6" ry="3.5" fill="#fff" opacity=".85"/></svg>`;}
window.packHTML=function(type,label){
  const p=type==='leyenda'?Array.from({length:6},(_,i)=>`<i class="pk-p" style="left:${12+i*15}%;bottom:${8+(i%3)*10}%;animation-delay:${(i*.53)%3}s"></i>`).join(''):'';
  return `<div class="pack pack2 pk-${type}"><div class="pk-foil"></div>${type==='leyenda'?'<div class="pk-holo"></div>':''}<div class="pk-shine"></div><div class="pk-strip"></div>
    <div class="pk-emb">${emblem(type)}</div>${label===true?`<div class="pk-n">${(TIER[type]||TIER.bronce).n}</div>`:''}${p}</div>`;};
// inclinar el sobre con el dedo (en el menú y en la apertura)
function tiltAt(el,x,y){const r=el.getBoundingClientRect(),u=(x-r.left)/r.width-.5,v=(y-r.top)/r.height-.5;
  el.style.setProperty('--ry',(u*22).toFixed(1)+'deg');el.style.setProperty('--rx',(-v*22).toFixed(1)+'deg');el.style.setProperty('--sx',(u*120+20).toFixed(0)+'%');el.classList.add('tilting');}
function untilt(el){el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg');el.classList.remove('tilting');}
let lastTilt=null;
document.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest('.pack2');if(lastTilt&&lastTilt!==el)untilt(lastTilt);if(el){tiltAt(el,e.clientX,e.clientY);lastTilt=el;}},{passive:true});
document.addEventListener('pointerup',()=>{if(lastTilt){untilt(lastTilt);lastTilt=null;}},{passive:true});

// ---------------- sonidos propios (sintetizados) ----------------
const S=window.SFX||{};
S.pkDrop=()=>{tone(90,.25,'sine',.32,45);noiseF(.12,.12,600,'lowpass',200);};
S.pkRustle=()=>{for(let i=0;i<4;i++)setTimeout(()=>noiseF(.07,.07,2400+Math.random()*1800,'bandpass',4000,2.5),i*55);};
S.pkRip=()=>{noiseF(.42,.22,1200,'highpass',5200,.7);noiseF(.3,.1,3000,'bandpass',900,3);};
S.pkWhoosh=()=>noiseF(.32,.12,400,'bandpass',3200,1.8);
S.pkFlip=()=>{noiseF(.05,.1,3500,'highpass');tone(880,.05,'triangle',.05,1200);};
S.pkComun=()=>tone(660,.12,'triangle',.07,700);
S.pkRara=()=>{[988,1318].forEach((f,i)=>setTimeout(()=>tone(f,.25,'triangle',.08),i*70));};
S.pkEpica=()=>{[523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.3,'triangle',.08),i*70));noiseF(.6,.05,800,'bandpass',4000,1.2);};
S.pkLeg=()=>{[392,523,659,784].forEach((f,i)=>setTimeout(()=>{tone(f,.5,'sawtooth',.05);tone(f*2,.4,'triangle',.04);},i*120));
  setTimeout(()=>{[523,659,784,1046].forEach(f=>tone(f,1.1,'sawtooth',.045));tone(130,1.1,'sine',.18,120);},520);};
S.pkClue=()=>{tone(220,.35,'sawtooth',.06,440);noiseF(.35,.08,300,'bandpass',2500,2);};
S.pkCoin=()=>{tone(1975,.08,'square',.04);setTimeout(()=>tone(2637,.12,'square',.035),45);};
const RSND={comun:'pkComun',rara:'pkRara',epica:'pkEpica',legendaria:'pkLeg'};
const play=n=>{try{S[n]&&S[n]();}catch(e){}};

// ---------------- apertura ----------------
const RC={comun:'rgba(200,215,255,.32)',rara:'rgba(255,170,60,.45)',epica:'rgba(200,110,255,.5)',legendaria:'rgba(255,215,80,.6)'};
const POSI={POR:['Portero','<path d="M30 70 Q24 40 34 24 Q38 18 44 22 L46 40 L48 16 Q52 10 56 16 L56 40 L60 18 Q64 12 68 18 L66 42 L72 28 Q78 24 80 32 L74 60 Q70 76 52 80 Q36 82 30 70Z" fill="#e8f2ff" stroke="#0a1636" stroke-width="4" stroke-linejoin="round"/>'],
  DEF:['Defensa','<path d="M50 12 L82 24 L82 50 Q82 76 50 90 Q18 76 18 50 L18 24 Z" fill="#7fc0ff" stroke="#0a1636" stroke-width="5" stroke-linejoin="round"/><path d="M50 24 L70 31 L70 50 Q70 68 50 78 Z" fill="#c6e3ff"/>'],
  MED:['Medio','<circle cx="50" cy="50" r="36" fill="#ffe08a" stroke="#0a1636" stroke-width="5"/><circle cx="50" cy="50" r="22" fill="#fff" stroke="#0a1636" stroke-width="4"/><circle cx="50" cy="50" r="9" fill="#ff5a4a" stroke="#0a1636" stroke-width="4"/>'],
  DEL:['Delantero','<path d="M54 8 L30 54 L48 54 L40 92 L72 40 L54 40 L64 8 Z" fill="#ffd23a" stroke="#0a1636" stroke-width="5" stroke-linejoin="round"/>']};
const GEM='<path d="M30 30 L50 14 L70 30 L60 80 L40 80 Z" fill="var(--cc)" stroke="#0a1636" stroke-width="5" stroke-linejoin="round"/><path d="M30 30 L70 30 M40 80 L50 30 L60 80" stroke="#0a1636" stroke-width="3" fill="none" opacity=".6"/>';
const CROWN='<path d="M14 72 L20 30 L36 50 L50 20 L64 50 L80 30 L86 72 Z" fill="var(--cc)" stroke="#0a1636" stroke-width="5" stroke-linejoin="round"/><rect x="14" y="70" width="72" height="12" rx="3" fill="var(--cc)" stroke="#0a1636" stroke-width="5"/>';
const nameOf=it=>it.kind==='kit'?KITS[it.id].n:it.kind==='boots'?BOOTS[it.id].n:isPower(it.id)?CARDS[it.id].name:PBY[it.id].nick;
function cardBack(type){return `<div class="pack pack2 pk-${type}" style="width:100%;height:100%;border:none;box-shadow:none"><div class="pk-foil"></div>${type==='leyenda'?'<div class="pk-holo"></div>':''}<div class="pk-emb" style="margin-top:22%">${emblem(type)}</div></div>`;}
function papers(host,x,y,col,n){for(let i=0;i<n;i++){const p=document.createElement('i');p.className='paper';p.style.left=x+'px';p.style.top=y+'px';p.style.background=i%3?col:'#fff';
  p.style.setProperty('--x',(Math.random()*240-60)+'px');p.style.setProperty('--y',(-Math.random()*180-20)+'px');p.style.setProperty('--r',(Math.random()*720-360)+'deg');host.appendChild(p);setTimeout(()=>p.remove(),1100);}}
window.openPack=function(type){
  audio();try{crowdLoad();}catch(e){}
  const res=rollPack(type),items=res.items,best=items[0],br=best.rar,bi=RORD.indexOf(br);let phase='drop',idx=0,done=false;
  showModal(`<div class="po2" id="po2" style="--bc:${RC[br]}"><div class="beams"></div><div class="ped"></div><div class="dark"></div><div class="flash"></div>
    <button class="btn b sm skip" id="pkSkip">Saltar »</button>
    <div class="bp" id="bp">${packHTML(type,true)}<div class="tearline" id="tl"></div></div>
    <svg class="hand" viewBox="0 0 44 44"><circle cx="22" cy="22" r="12" fill="rgba(255,255,255,.85)" stroke="#0a1636" stroke-width="3"/></svg>
    <p class="hint ct" id="pkH">Desliza el dedo por arriba para abrir</p></div>`,true,true);
  const po=$('#po2'),bp=$('#bp'),pk=bp.querySelector('.pack'),tl=$('#tl');
  play('pkWhoosh');setTimeout(()=>{play('pkDrop');vib(25);},560);setTimeout(()=>{phase='ready';},650);
  const stage=h=>{po.querySelectorAll('.stage,.sum,.gold,.wname,.hint,.hand').forEach(e=>e.remove());const d=document.createElement('div');d.className='stage';d.innerHTML=h;po.appendChild(d);return d;};
  const flash=()=>{const f=po.querySelector('.flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');};
  // ---- 1) rasgar ----
  let sx=null,prog=0,ripT=0;
  function tear(){if(phase!=='ready'&&phase!=='tearing')return;phase='opened';tl.style.width='100%';play('pkRip');vib(40);
    bp.classList.add('open');const r=bp.getBoundingClientRect(),pr=po.getBoundingClientRect();papers(po,r.left-pr.left+r.width*.5,r.top-pr.top+r.height*.1,'#ffe9a8',26);
    setTimeout(()=>{bp.classList.add('shake');play('pkRustle');po.classList.add('lit');flash();if(bi>=2){vib(60);}},350);
    setTimeout(()=>{bp.classList.add('gone');play('pkWhoosh');},1050);
    setTimeout(()=>{bi>=2?walkout(0):showBest();},1450);}
  pk.addEventListener('pointerdown',e=>{if(phase!=='ready')return;sx=e.clientX;phase='tearing';try{pk.setPointerCapture(e.pointerId);}catch(_){}});
  pk.addEventListener('pointermove',e=>{if(phase!=='tearing'||sx==null)return;const w=pk.getBoundingClientRect().width;prog=Math.max(prog,Math.min(1,Math.abs(e.clientX-sx)/(w*.75)));
    tl.style.width=(prog*100)+'%';const now=performance.now();if(now-ripT>90){ripT=now;noiseF(.08,.06+prog*.08,1800+prog*2500,'highpass');}if(prog>=1)tear();});
  pk.addEventListener('pointerup',()=>{if(phase==='tearing'){if(prog<.15||prog>.4)tear();else{phase='ready';prog=0;tl.style.width='0';}}});
  po.addEventListener('pointerup',e=>{if(phase==='ready'&&!e.target.closest('.pack')&&!e.target.closest('#pkSkip'))tear();});
  po.addEventListener('click',e=>{if(e.target.closest('#pkSkip'))return;if(phase==='ready'&&!e.target.closest('.pack'))tear();else if(phase==='best')nextCard();else if(phase==='rest')summary();});
  // ---- 2) pistas para épicas y legendarias ----
  function walkout(step){phase='walk';po.classList.add('walk');play('pkClue');vib(50);
    if(step===0&&best.kind==='player'){const [n,svg]=POSI[PBY[best.id].pos]||POSI.DEL;stage(`<div class="clue2" style="--cc:#bfe0ff"><svg viewBox="0 0 100 100">${svg}</svg><b>${n}</b></div>`);setTimeout(()=>walkout(1),1300);return;}
    stage(`<div class="clue2" style="--cc:${RARS[br].c}"><svg viewBox="0 0 100 100">${br==='legendaria'?CROWN:GEM}</svg><b>${RARS[br].n}</b></div>`);
    setTimeout(()=>{po.classList.remove('walk');showBest();},1400);}
  // ---- 3) la mejor carta ----
  function showBest(){phase='best';flash();
    const s=stage(`<div class="card3d"><div class="in hidden"><div class="fr">${itemHTML(best)}</div><div class="bk">${cardBack(type)}</div></div></div>
      <div class="wname ct" style="color:${RARS[br].c}">${esc(nameOf(best))}<small>${RARS[br].n}${best.n>1?' · x'+best.n:''}${best.isNew?' · ¡NUEVA!':''}</small></div>
      <div class="count ct">${items.length>1?'Toca para ver las demás ('+(items.length-1)+')':'Toca para continuar'}</div>`);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{s.querySelector('.in').classList.remove('hidden');play('pkFlip');setTimeout(()=>play(RSND[br]),180);
      if(br==='legendaria'){try{crowdShot('whoa',.5,.1);}catch(e){}}if(bi>=2){vib(80);const r=s.getBoundingClientRect(),pr=po.getBoundingClientRect();(window.sparks||(()=>{}))(po,RARS[br].c,40);}}));
    idx=1;}
  // ---- 4) las demás, una por una ----
  function nextCard(){if(idx>=items.length){summary();return;}phase='rest';const it=items[idx++];
    const s=stage(`<div class="card3d" style="width:132px"><div class="in hidden"><div class="fr">${itemHTML(it)}</div><div class="bk">${cardBack(type)}</div></div></div>
      <div class="wname ct" style="font-size:20px;color:${RARS[it.rar].c}">${esc(nameOf(it))}<small>${RARS[it.rar].n}${it.n>1?' · x'+it.n:''}${it.isNew?' · ¡NUEVA!':''}</small></div>
      <div class="count ct">${idx}/${items.length} · toca para seguir</div>`);
    play('pkWhoosh');requestAnimationFrame(()=>requestAnimationFrame(()=>{s.querySelector('.in').classList.remove('hidden');setTimeout(()=>{play('pkFlip');play(RSND[it.rar]);},120);}));
    po.onclick=null;setTimeout(()=>{phase=idx>=items.length?'last':'best';if(phase==='last')phase='rest2';},250);}
  po.addEventListener('click',e=>{if(phase==='rest2'){summary();}});
  // ---- 5) resumen ----
  function summary(){if(done)return;done=true;phase='sum';po.classList.remove('walk');po.querySelector('#pkSkip').remove();
    po.querySelectorAll('.stage,.bp,.hint,.hand').forEach(e=>e.remove());
    const bar=it=>{if(it.kind!=='player'&&it.kind!=='power')return '';const T=it.kind==='power'?save.powers:save.players,o=T[it.id];if(!o)return '';
      if(o.lvl>=MAXLVL)return '<div class="bar up"><i data-w="100"></i></div>';const need=LVL_COPIES[o.lvl],w=Math.min(100,o.copies/need*100);return `<div class="bar ${o.copies>=need?'up':''}"><i data-w="${w.toFixed(0)}"></i></div>`;};
    const d=document.createElement('div');d.className='sum';d.innerHTML=items.map((it,i)=>`<div class="it" style="animation-delay:${i*.09}s">${itemHTML(it)}<b>x${it.n}</b>${bar(it)}</div>`).join('');po.appendChild(d);
    const g=document.createElement('div');g.className='gold ct';g.innerHTML='🪙 +<span id="pkG">0</span>';po.appendChild(g);
    const ok=document.createElement('button');ok.className='btn y';ok.style.cssText='position:relative;z-index:6;margin-top:12px';ok.textContent='Continuar';po.appendChild(ok);
    items.forEach((_,i)=>setTimeout(()=>play('pkFlip'),i*90));
    setTimeout(()=>d.querySelectorAll('.bar i').forEach(b=>b.style.width=b.dataset.w+'%'),60);
    let n=0;const tgt=res.gold,steps=Math.min(20,tgt),inc=Math.max(1,Math.ceil(tgt/steps));const ti=setInterval(()=>{n=Math.min(tgt,n+inc);const e=$('#pkG');if(e)e.textContent=n;play('pkCoin');if(n>=tgt)clearInterval(ti);},55);
    ok.onclick=e=>{e.stopPropagation();clearInterval(ti);closeModal();renderTab();};}
  $('#pkSkip').onclick=e=>{e.stopPropagation();if(phase==='drop'||phase==='ready'||phase==='tearing'){bp.classList.add('open','gone');po.classList.add('lit');}summary();};
};
})();
