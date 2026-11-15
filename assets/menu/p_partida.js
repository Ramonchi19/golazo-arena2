// ===== BUSCAR PARTIDA · VS · VICTORIA · PREMIO =====
(function(){
const css=`
#s-buscar .fondo{--bg:linear-gradient(180deg,#2a1050 0%,#7a2a8a 40%,#ff7a45 75%,#ffc65a 100%);--motivo:none}
#s-buscar .sol{position:absolute;left:560px;top:250px;width:480px;height:480px;border-radius:50%;background:repeating-linear-gradient(180deg,#fff2a0 0 34px,transparent 34px 48px);-webkit-mask:linear-gradient(#000 40%,transparent 95%);mask:linear-gradient(#000 40%,transparent 95%);opacity:.85}
#s-buscar .isla{position:absolute;width:300px;opacity:.9;animation:flota 6s ease-in-out infinite;filter:drop-shadow(0 20px 20px rgba(0,0,0,.35))}
#s-buscar .piso{position:absolute;left:0;right:0;bottom:0;height:330px;background:linear-gradient(#3a1846,#140a22);border-top:6px solid #ff9a5a}
#s-buscar .yo{position:absolute;left:800px;bottom:300px;width:0}
#s-buscar .slots{position:absolute;left:0;right:0;bottom:150px;display:flex;justify-content:center;gap:14px}
#s-buscar .sl{width:104px;height:120px;border:3.5px solid var(--ink);border-radius:14px;background:rgba(0,0,0,.35);position:relative;overflow:hidden;box-shadow:0 6px 0 var(--ink)}
#s-buscar .sl:nth-child(5){margin-right:50px}
#s-buscar .sl.on{animation:inS .4s cubic-bezier(.2,1.6,.4,1)}
#s-buscar .sl.az.on{background:linear-gradient(#5fa8ff,#1f5bff)}#s-buscar .sl.ro.on{background:linear-gradient(#ff7a50,#d8261f)}
#s-buscar .corre{position:absolute;bottom:150px;left:0;width:0;animation:cruza 4.4s linear infinite}
#s-buscar .corre img{position:absolute;left:-180px;bottom:0;height:400px;animation:pasos .32s ease-in-out infinite alternate;transform-origin:50% 100%}
@keyframes cruza{from{transform:translateX(-300px)}to{transform:translateX(1900px)}}
@keyframes pasos{from{transform:translateY(0) rotate(4deg)}to{transform:translateY(-22px) rotate(8deg)}}
#s-buscar .polvo{position:absolute;bottom:150px;width:60px;height:40px;border-radius:50%;background:#fff;opacity:0;animation:polvo 4.4s linear infinite}
@keyframes polvo{0%{opacity:0}5%{opacity:.9;transform:scale(.4)}20%{opacity:0;transform:scale(1.6) translateY(-20px)}100%{opacity:0}}
#s-buscar .cont{position:absolute;left:0;right:0;top:150px;text-align:center;font-size:64px}
#s-buscar .tip{position:absolute;left:300px;right:300px;bottom:44px;text-align:center;font-size:30px;line-height:1.3;z-index:3}
#s-buscar .salir{position:absolute;left:40px;bottom:36px;width:220px;height:96px;font-size:40px;z-index:3}
#s-buscar .rueda{position:absolute;right:50px;bottom:40px;width:110px;height:110px;border-radius:50%;border:3px solid var(--ink);background:radial-gradient(circle,#ffd23a 40%,#c27a00);z-index:3;display:flex;align-items:center;justify-content:center}
#s-buscar .rueda::after{content:'';position:absolute;inset:-14px;border-radius:50%;border:8px solid transparent;border-top-color:#ffd23a;animation:gira 1s linear infinite}
#s-buscar .rueda img{width:70px}
#s-vs .fondo{--bg:url(a/ar/a7.webp) center/120% no-repeat,#1a0a2a;--motivo:none;filter:blur(6px) brightness(.55)}
#s-vs .banda{position:absolute;left:-40px;right:-40px;height:380px;display:flex;gap:14px;padding:0 140px;transform:skewY(-4deg)}
#s-vs .banda.roja{top:40px}#s-vs .banda.azul{top:470px;padding-left:80px}
#s-vs .pc{flex:1;position:relative;border:3px solid var(--ink);overflow:hidden;box-shadow:0 10px 0 var(--ink);transform:skewX(-8deg)}
#s-vs .roja .pc{background:linear-gradient(160deg,#ff7a50,#e3261c 60%,#9a1010)}
#s-vs .azul .pc{background:linear-gradient(160deg,#5fa8ff,#1f5bff 60%,#0d2f9c)}
#s-vs .pc::before{content:'';position:absolute;inset:0;background-image:url(a/balon.png);background-size:90px;opacity:.08}
#s-vs .pc img{position:absolute;left:50%;bottom:20px;height:330px;transform:translateX(-50%) skewX(8deg) skewY(4deg);filter:drop-shadow(0 8px 0 rgba(0,0,0,.3))}
#s-vs .pc .n{position:absolute;left:0;right:0;bottom:0;height:56px;background:var(--ink);display:flex;align-items:center;padding:0 16px;font-size:26px;transform:skewX(8deg);transform-origin:0 100%}
#s-vs .pc.yo{box-shadow:0 0 0 6px #fff,0 10px 0 6px var(--ink);z-index:2}
#s-vs .vs{position:absolute;left:660px;top:345px;width:320px;height:240px;display:flex;align-items:center;justify-content:center;font-size:170px;z-index:5;--sw:16px;--sd:12px;transform:rotate(-6deg)}
#s-vs .vs::before{content:'';position:absolute;inset:-60px;background:radial-gradient(circle,#fff6a0,rgba(255,200,40,.0) 60%);animation:latido 1s ease-in-out infinite;z-index:-1}
#s-vs .cuenta{position:absolute;right:30px;top:340px;display:flex;align-items:flex-end;gap:16px;z-index:6}
#s-vs .cuenta .num{font-size:150px;--sw:14px;--sd:10px;animation:pum 1s ease-out infinite}
@keyframes pum{0%{transform:scale(1.6);opacity:.3}25%{transform:scale(1);opacity:1}}
#s-victoria .fondo{--bg:linear-gradient(105deg,#3d8bff 0%,#1f5bff 55%,#e3261c 55.2%,#b81a14 100%)}
#s-victoria .tit{position:absolute;left:40px;top:24px;font-size:110px;transform:rotate(-4deg);--sw:12px;--sd:9px}
#s-victoria .copa{position:absolute;left:60px;top:150px;display:flex;align-items:center;gap:8px;font-size:44px}
#s-victoria .copa img{width:60px}
#s-victoria .eq{position:absolute;left:30px;bottom:200px;width:860px;height:560px}
#s-victoria .eq .p{position:absolute;bottom:0;width:0}
#s-victoria .eq .p img{position:absolute;bottom:0;transform:translateX(-50%);filter:drop-shadow(0 8px 0 rgba(0,0,0,.3));animation:festeja 1.2s ease-in-out infinite alternate;transform-origin:50% 100%}
@keyframes festeja{0%{transform:translateX(-50%) translateY(0) rotate(-2deg)}100%{transform:translateX(-50%) translateY(-18px) rotate(2deg)}}
#s-victoria .eq .p.mvp img{animation:salta2 1s cubic-bezier(.3,1.6,.5,1) infinite}
@keyframes salta2{0%,100%{transform:translateX(-50%) translateY(0) scale(1,1)}15%{transform:translateX(-50%) scale(1.06,.92)}45%{transform:translateX(-50%) translateY(-60px) scale(.96,1.05)}}
#s-victoria .eq .tag{left:-60px;top:auto}
#s-victoria .rivales{position:absolute;right:30px;bottom:200px;width:600px;height:420px;filter:saturate(.55) brightness(.75)}
#s-victoria .rivales img{position:absolute;bottom:0;height:330px;transform:translateX(-50%)}
#s-victoria .tabla{position:absolute;left:30px;right:30px;bottom:110px;height:110px;display:flex;gap:10px}
#s-victoria .tabla .c{flex:1;padding:10px 14px}
#s-victoria .tabla .c .n{font-size:22px}
#s-victoria .tabla .c .v{display:flex;gap:14px;margin-top:8px;font-size:26px}
#s-victoria .tabla .c .v img{width:30px;display:inline;vertical-align:-6px;margin-right:4px}
#s-victoria .bots{position:absolute;right:30px;bottom:16px;display:flex;gap:16px}
#s-victoria .bots .btn{width:300px;height:84px;font-size:32px}
#s-premio .fondo{--bg:radial-gradient(circle at 50% 50%,#8cf55a,#35c21c 50%,#126a10);--motivo:url(a/corona.png)}
#s-premio .rayos{position:absolute;left:800px;top:470px;width:2600px;height:2600px;margin:-1300px 0 0 -1300px;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.14) 0 7deg,transparent 7deg 18deg);animation:gira 40s linear infinite}
#s-premio .tt{position:absolute;left:40px;top:30px;font-size:58px;transform:rotate(-3deg)}
#s-premio .sobre{position:absolute;left:640px;top:180px;width:320px;height:440px;border:7px solid var(--ink);border-radius:24px;background:linear-gradient(160deg,#ffe25a,#ff9d00);box-shadow:inset 0 0 0 10px rgba(255,255,255,.35),0 12px 0 var(--ink);cursor:pointer;animation:espera 1.6s ease-in-out infinite}
#s-premio .sobre img{width:270px;margin:150px auto 0;position:relative;z-index:2}
#s-premio .sobre .estr{position:absolute;left:50%;top:40px;width:110px;margin:0 0 0 -55px!important;z-index:2}
#s-premio .sobre{overflow:hidden}
#s-premio .sobre::after{z-index:3}
#s-premio .sobre::before{content:'';position:absolute;left:-7px;right:-7px;top:60px;height:30px;background:repeating-linear-gradient(90deg,#0a0d1c 0 12px,transparent 12px 24px);opacity:.25}
@keyframes espera{0%,100%{transform:rotate(-2deg) scale(1)}50%{transform:rotate(2deg) scale(1.03)}}
#s-premio .sobre.tiembla{animation:tiembla .08s linear infinite}
@keyframes tiembla{0%{transform:translate(-6px,2px) rotate(-3deg)}50%{transform:translate(6px,-2px) rotate(3deg)}100%{transform:translate(-6px,2px) rotate(-3deg)}}
#s-premio .sobre.abre{animation:abre .45s ease-in forwards}
@keyframes abre{to{transform:scale(1.5);opacity:0}}
#s-premio .aro{pointer-events:none;position:absolute;left:800px;top:400px;width:40px;height:40px;margin:-20px;border-radius:50%;border:16px solid #fff;opacity:0}
#s-premio .aro.go{animation:aro .7s ease-out forwards}
@keyframes aro{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(30)}}
#s-premio .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:8}
#s-premio .flash.go{animation:destello .8s ease-out}
#s-premio .toca{position:absolute;left:0;right:0;bottom:90px;text-align:center;font-size:40px;animation:latido 1.2s infinite}
#s-premio .res{position:absolute;left:0;right:0;top:170px;display:flex;justify-content:center;gap:50px;pointer-events:none}
#s-premio .it{width:300px;height:420px;border:3px solid var(--ink);border-radius:20px;position:relative;overflow:hidden;box-shadow:0 10px 0 var(--ink);opacity:0}
#s-premio .it.go{animation:vuela .7s cubic-bezier(.2,1.5,.4,1) both}
@keyframes vuela{0%{opacity:0;transform:translateY(300px) scale(.3) rotate(-30deg)}100%{opacity:1;transform:none}}
#s-premio .it .q{position:absolute;left:0;right:0;bottom:0;height:80px;background:var(--ink);display:flex;align-items:center;justify-content:center;font-size:40px}
#s-premio .cont{position:absolute;right:50px;bottom:40px;width:340px;height:104px;font-size:42px;opacity:0;pointer-events:none;transition:.3s}
#s-premio .cont.on{opacity:1;pointer-events:auto}

#s-buscar .yo3{position:absolute;left:540px;bottom:250px;width:520px;height:640px}
#s-buscar .yo3 .previo{position:absolute;left:50%;bottom:0;height:520px;transform:translateX(-50%)}
#s-buscar .yo3 canvas{position:absolute;left:0;bottom:0}
#s-vs .pc canvas{position:absolute;left:50%;bottom:0;transform:translateX(-50%) skewX(8deg) skewY(4deg)}
.c3.foto{animation:respiraF 3.2s ease-in-out infinite;transform-origin:50% 100%}
#s-vs .pc canvas.foto{animation:respiraV 3.2s ease-in-out infinite}
@keyframes respiraF{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.022)}}
@keyframes respiraV{0%,100%{transform:translateX(-50%) skewX(8deg) skewY(4deg) scale(1,1)}50%{transform:translateX(-50%) skewX(8deg) skewY(4deg) scale(1.012,1.022)}}
.ligero{position:absolute;left:24px;top:20px;z-index:20;background:rgba(10,13,28,.75);border:3px solid #fff;border-radius:12px;padding:8px 14px;font-size:20px;cursor:pointer}
.fps3d{position:absolute;right:24px;top:72px;z-index:20;font-size:16px;opacity:.85;text-align:right}

#s-buscar .busca{position:absolute;left:0;right:0;top:40px;text-align:center;font-size:64px;--sw:10px;--sd:8px}
#s-buscar .busca.ok{color:#8dff5c;animation:pum .5s ease-out}
#s-buscar .busca .pts i{display:inline-block;animation:pt 1.2s infinite;font-style:normal}#s-buscar .busca .pts i:nth-child(2){animation-delay:.2s}#s-buscar .busca .pts i:nth-child(3){animation-delay:.4s}
#s-buscar .busca.ok .pts{display:none}
@keyframes pt{0%,100%{opacity:.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-10px)}}
#s-buscar .reloj{position:absolute;left:0;right:0;top:130px;text-align:center;font-size:34px;opacity:.9}
#s-vs .fondo{--bg:linear-gradient(100deg,#5fa8ff 0%,#1f5bff 49.8%,#0a0d1c 49.8%,#0a0d1c 50.2%,#e3261c 50.2%,#9a1010 100%) !important;filter:none !important;--motivo:none}
#s-vs .lado{position:absolute;top:30px;width:560px;height:840px}
#s-vs .lado.iz{left:50px}#s-vs .lado.de{right:50px}
#s-vs .grande{position:absolute;left:45px;top:0;width:470px;height:520px;border:3px solid var(--ink);border-radius:22px;overflow:hidden;box-shadow:0 10px 0 var(--ink)}
#s-vs .iz .grande{background:radial-gradient(circle at 50% 35%,#a8d4ff,#3b7dff 55%,#123a9c)}
#s-vs .de .grande{background:radial-gradient(circle at 50% 35%,#ffb39a,#f0402c 55%,#8a0e0e)}
#s-vs .grande canvas,#s-vs .ch canvas{position:absolute;left:0;top:0}
#s-vs .grande .previo{position:absolute;left:50%;bottom:-40px;height:560px;transform:translateX(-50%)}
#s-vs .grande .cap{position:absolute;left:14px;top:12px;background:#ffd23a;color:var(--ink);border:3px solid var(--ink);border-radius:10px;padding:4px 12px;font-size:20px;--sw:0px;--sd:0px;text-shadow:none}
#s-vs .placa{position:absolute;left:25px;top:540px;width:510px;height:78px;background:var(--ink);border-radius:16px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:36px}
#s-vs .placa .tro{display:flex;align-items:center;gap:6px;font-size:30px}#s-vs .placa .tro img{width:40px}
#s-vs .chicas{position:absolute;left:25px;top:640px;width:510px;display:flex;justify-content:space-between}
#s-vs .ch{position:relative;width:112px;height:140px;border:3.5px solid var(--ink);border-radius:14px;overflow:hidden;box-shadow:0 6px 0 var(--ink)}
#s-vs .iz .ch{background:radial-gradient(circle at 50% 35%,#a8d4ff,#3b7dff 60%,#123a9c)}#s-vs .de .ch{background:radial-gradient(circle at 50% 35%,#ffb39a,#f0402c 60%,#8a0e0e)}
#s-vs .ch .previo{position:absolute;left:50%;bottom:-20px;height:170px;transform:translateX(-50%)}
#s-vs .vs{left:640px !important;top:300px !important}
#s-vs .cuenta{right:auto !important;left:650px !important;top:auto !important;bottom:40px;width:300px;flex-direction:column;align-items:center !important;gap:0 !important}
#s-victoria .fondo{--bg:radial-gradient(circle at 35% 55%,#7fc4ff,#2a6bff 45%,#122f8a) !important}
#s-victoria .fondo.pierde{--bg:radial-gradient(circle at 35% 55%,#8a90a8,#4a4f68 45%,#23263a) !important}
#s-victoria .rayos2{position:absolute;left:-300px;top:-300px;width:1500px;height:1500px;background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,255,255,.10) 0 10deg,transparent 10deg 20deg);animation:gira 30s linear infinite;-webkit-mask:radial-gradient(circle,#000 20%,transparent 65%)}
#s-victoria .rayos2.pierde{opacity:.25}
@keyframes gira{to{transform:rotate(360deg)}}
#s-victoria .tit.gris{color:#cfd3e0}
#s-victoria .esc3{position:absolute;left:0;top:120px;width:1000px;height:700px}
#s-victoria .esc3 canvas{position:absolute;left:0;top:0}
#s-victoria .esc3 .previo{position:absolute;left:50%;bottom:30px;height:520px;transform:translateX(-50%)}
#s-victoria .panel{position:absolute;right:30px;top:160px;width:540px;height:560px;padding:22px 26px}
#s-victoria .marc{display:flex;align-items:center;justify-content:space-between;gap:10px}
#s-victoria .marc .ju{width:150px;font-size:22px}#s-victoria .marc .go{font-size:84px;--sw:10px;--sd:7px}#s-victoria .marc .go span{opacity:.6}
#s-victoria .est{margin-top:16px;display:flex;flex-direction:column;gap:10px;font-size:26px}
#s-victoria .est div{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.25);border-radius:12px;padding:8px 14px}
#s-victoria .est img,#s-victoria .prem img{width:34px;display:inline;vertical-align:-8px;margin-right:8px}
#s-victoria .prem{margin-top:18px;display:flex;justify-content:space-around;font-size:34px}
#s-victoria .prueba{position:absolute;right:30px;top:100px;background:rgba(10,13,28,.75);border:3px solid #fff;border-radius:12px;padding:8px 14px;font-size:20px;cursor:pointer;z-index:20}
.b3d{position:absolute;right:24px;top:20px;z-index:20;display:flex;gap:10px}
.b3d .ligero{position:static}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
let tb=0,tv=0;
// ---------- 1 vs 1: cada jugador lleva su capitán + 4 titanes ----------
const TODOS=PJ.map(p=>p.id),CAPS=['leon','turbo'];
const YO={n:'LOVEGORDAS',tr:78},RIVALES=[{n:'Hikari',tr:81},{n:'Gato Lunar',tr:74},{n:'MiguelRQ',tr:90},{n:'Xx_Lobo',tr:69}];
let EQ=null;window.RESULTADO=window.RESULTADO||'victoria';
function equiposJuego(){const P=J.partida()||{},f=x=>x.filter(TIENE4K),lado=(q,def)=>{if(!q)return def;const t=f([q.cap,...(q.eq||[])]);
    return{n:q.n,tr:q.tr,cap:t[0]||'leon',eq:t.slice(1,5)};};
  const yo=lado(P.yo,{n:'Tú',tr:0,cap:window.HEROE||'leon',eq:[]});
  EQ={yo,riv:lado(P.riv,{n:'???',tr:0,cap:'turbo',eq:[]})};EQ.hayRiv=!!P.riv;}
function equipos(){if(window.J){equiposJuego();return;}const yo=CAPS.includes(window.HEROE)?window.HEROE:'leon',riv=CAPS[Math.floor(Math.random()*CAPS.length)];
  const r=TODOS.filter(x=>x!==yo&&x!==riv).sort(()=>Math.random()-.5);
  EQ={yo:{cap:yo,eq:r.slice(0,4),...YO},riv:{cap:riv,eq:r.slice(4,8),...RIVALES[Math.floor(Math.random()*RIVALES.length)]}};}
function calidad(){return Math.min(2,(devicePixelRatio||1)*(typeof SC!=='undefined'?SC:1));}
function lienzo(w,h,cls){const q=calidad();return `<canvas class="${cls||''}" width="${Math.round(w*q)}" height="${Math.round(h*q)}" style="width:${w}px;height:${h}px"></canvas>`;}
function botones3d(){if(window.J)return '';return `<div class="b3d"><div class="ligero t xs" onclick="VS3D.setLigero(!VS3D.ligero());this.querySelector('b').textContent=VS3D.ligero()?'SÍ':'NO';toast('Se aplica al volver a entrar')">MODO LIGERO: <b>${VS3D.ligero()?'SÍ':'NO'}</b></div>
<div class="ligero t xs" onclick="COLOR3D.setVivo(!COLOR3D.VIVO());location.reload()">COLOR: <b>${COLOR3D.VIVO()?'VIVO':'ANTES'}</b></div><div class="ligero t xs" onclick="CONTORNO.setActivo(!CONTORNO.ACTIVO());location.reload()">CONTORNO: <b>${CONTORNO.ACTIVO()?'SÍ':'NO'}</b></div></div><div id="fps3d" class="t xs fps3d"></div>`;}
const MIS=()=>[EQ.yo.cap,...EQ.yo.eq,EQ.riv.cap,...EQ.riv.eq];
// ---------- BUSCANDO RIVAL ----------
PANT.buscar={html:()=>{equipos();return `<div class="fondo"></div><div class="sol"></div>
<img class="isla" src="a/ar/a3.webp" style="left:120px;top:120px;width:260px"><img class="isla" src="a/ar/a5.webp" style="right:140px;top:90px;width:280px;animation-delay:-3s">
<div class="piso"></div>
<div class="yo3"><img class="previo" src="${cuerpo(EQ.yo.cap)}">${lienzo(520,640,'c3')}</div>
<div class="busca t" data-in="d"><span id="bt">BUSCANDO RIVAL</span><span class="pts"><i>.</i><i>.</i><i>.</i></span></div>
<div class="reloj t s" data-in="d" style="--d:1"><span id="seg">0:00</span></div>
<div class="tip t s" data-in="u" style="--d:2">Mantén presionado el tiro para cargarlo: entre más cargado, más fuerte sale el balón.</div>
<div class="btn rojo salir t" ${window.J?'onclick="J.cancelarBusqueda()"':'data-go="lobby"'} data-in="l">SALIR</div><div class="rueda" data-in="s"><img src="a/i/balon.webp"></div>${botones3d()}`;},
entrar(el){if(window.J){buscarJuego(el);return;}const yo=EQ.yo.cap;let t0=performance.now(),listos=0;const todos=MIS(),hayRival=2.5+Math.random()*2;
  VS3D.cargar(yo,'u').then(()=>{if(actual!=='buscar')return;VS3D.tarjetas([{cv:el.querySelector('.c3'),id:yo,tipo:'u',enc:'cuerpo'}]);VS3D.arrancar();el.querySelector('.previo').style.display='none';}).catch(e=>console.warn(e));
  // mientras se busca se cargan los titanes del VS y de la pantalla final
  const pend=[...todos.map(id=>['l',id]),['v',EQ.yo.cap],['k',EQ.yo.cap],['u',EQ.yo.cap]];
  pend.forEach(([t,id])=>VS3D.cargar(id,t).then(()=>listos++).catch(()=>listos++));
  clearInterval(tb);tb=setInterval(()=>{const s=(performance.now()-t0)/1000,e=$('#seg');if(e)e.textContent='0:'+String(Math.floor(s)).padStart(2,'0');
    if(s>hayRival&&listos>=pend.length){clearInterval(tb);const b=$('#bt');if(b){b.textContent='¡RIVAL ENCONTRADO!';b.parentNode.classList.add('ok');}setTimeout(()=>actual==='buscar'&&ir('vs'),1100);}},250);},
salir(){clearInterval(tb);VS3D.parar();}};
function buscarJuego(el){const yo=EQ.yo.cap,t0=performance.now();
  VS3D.cargar(yo,'u').then(()=>{if(actual!=='buscar')return;VS3D.tarjetas([{cv:el.querySelector('.c3'),id:yo,tipo:'u',enc:'cuerpo'}]);VS3D.arrancar();el.querySelector('.previo').style.display='none';}).catch(e=>console.warn(e));
  clearInterval(tb);tb=setInterval(()=>{const s=(performance.now()-t0)/1000,e=$('#seg');if(e)e.textContent=Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');},250);}
// el juego avisa: ya hay rival → VS
window.RIVAL_ENCONTRADO=()=>{equipos();clearInterval(tb);const b=$('#bt');if(b){b.textContent='¡RIVAL ENCONTRADO!';b.parentNode.classList.add('ok');}
  const s=$('#s-buscar .salir');if(s)s.style.display='none';setTimeout(()=>{if(actual==='buscar'||actual==='lobby')ir('vs');},450);};
window.PROGRESO=(k,txt)=>{const b=$('#vsBar'),t=$('#vsTxt');if(b&&k!=null)b.style.width=Math.round(Math.max(0,Math.min(1,k))*100)+'%';if(t&&txt)t.textContent=txt.toUpperCase();};
// ---------- VS (1 contra 1) ----------
function lado(j,cls,col){return `<div class="lado ${cls}">
  <div class="grande" data-in="${cls==='iz'?'l':'r'}"><img class="previo" src="${cuerpo(j.cap)}">${lienzo(470,520,'c3')}<div class="cap t xs">CAPITÁN</div></div>
  <div class="placa t" data-in="${cls==='iz'?'l':'r'}" style="--d:2"><span class="nom">${j.n}</span><span class="tro"><img src="a/i/trofeo.webp">${j.tr}</span></div>
  <div class="chicas">${j.eq.map((id,i)=>`<div class="ch" data-in="u" style="--d:${3+i}"><img class="previo" src="${cuerpo(id)}">${lienzo(112,140,'c3')}</div>`).join('')}</div></div>`;}
PANT.vs={html:()=>{if(!EQ)equipos();return `<div class="fondo"></div>${lado(EQ.yo,'iz')}${lado(EQ.riv,'de')}
<div class="vs t" data-in="s" style="--d:5">VS</div>
${window.J?`<div class="cuenta"><div class="t s" id="vsTxt" style="font-size:24px;text-align:center">CARGANDO ARENA…</div><div style="width:280px;height:26px;border:3px solid #0a0d1c;border-radius:14px;background:rgba(0,0,0,.45);overflow:hidden;margin-top:10px"><i id="vsBar" style="display:block;height:100%;width:8%;background:linear-gradient(#fff47a,#ffb21a);transition:width .25s"></i></div></div>`
  :`<div class="cuenta"><div class="t s" style="font-size:26px;text-align:center">LA PARTIDA EMPIEZA EN</div><div class="num t" id="cta">5</div></div>`}${botones3d()}`;},
entrar(el){if(window.J){vsJuego(el);return;}const cv=[...el.querySelectorAll('.c3')],ids=[EQ.yo.cap,...EQ.yo.eq,EQ.riv.cap,...EQ.riv.eq],lista=[];
  ids.forEach((id,i)=>{if(VS3D.listo(id,'l'))lista.push({cv:cv[i],id,tipo:'l',enc:'cintura'});});
  VS3D.tarjetas(lista);VS3D.arrancar();lista.forEach(t=>{const im=t.cv.parentNode.querySelector('.previo');if(im)im.style.display='none';});
  let n=5;clearInterval(tv);tv=setInterval(()=>{n--;const e=$('#cta');if(e&&n>0){e.textContent=n;e.style.animation='none';void e.offsetWidth;e.style.animation='';}
    if(n<=0){clearInterval(tv);window.RESULTADO=Math.random()<.5?'victoria':'derrota';actual==='vs'&&ir('victoria');}},1000);},
salir(){clearInterval(tv);VS3D.parar();}};
function vsJuego(el){const g=[...el.querySelectorAll('.grande')],caps=[EQ.yo.cap,EQ.riv.cap];
  Promise.all(caps.map(id=>VS3D.cargar(id,'u').catch(()=>null))).then(()=>{if(actual!=='vs')return;
    const lista=caps.map((id,i)=>({cv:g[i].querySelector('.c3'),id,tipo:'u',enc:'cintura'})).filter(t=>VS3D.listo(t.id,'u'));
    VS3D.tarjetas(lista);VS3D.arrancar();lista.forEach(t=>{const im=t.cv.parentNode.querySelector('.previo');if(im)im.style.display='none';});});
  el.querySelectorAll('.ch .c3').forEach(c=>c.remove());}
// ---------- VICTORIA / DERROTA ----------
PANT.victoria={html:()=>{if(window.J)return victoriaJuego();if(!EQ)equipos();const g=window.RESULTADO!=='derrota',j=EQ.yo,r=EQ.riv,gm=g?[3,1]:[1,2];
  return `<div class="fondo ${g?'':'pierde'}"></div><div class="rayos2 ${g?'':'pierde'}"></div>
<div class="tit t ${g?'amarillo':'gris'}" data-in="l">${g?'¡VICTORIA!':'DERROTA'}</div>
<div class="copa t" data-in="l" style="--d:2"><img src="a/i/trofeo.webp">${g?'+':'−'}<span>${g?8:5}</span></div>
<div class="esc3" data-in="u" style="--d:1"><img class="previo" src="${cuerpo(j.cap)}">${lienzo(1000,700,'c3')}</div>
<div class="panel pan" data-in="r" style="--d:3">
  <div class="marc"><div class="ju t xs">${j.n}</div><div class="go t">${gm[0]} <span>-</span> ${gm[1]}</div><div class="ju t xs" style="text-align:right">${r.n}</div></div>
  <div class="est t xs"><div><span>${I('balon')}Goles</span><b>${gm[0]}</b></div><div><span>${I('super-tiro')}Súper tiros</span><b>${g?2:1}</b></div><div><span>${I('defensa')}Barridas</span><b>${g?5:3}</b></div><div><span>${I('estrella')}Mejor titán</span><b>${PJI[j.cap].n}</b></div></div>
  <div class="prem t xs"><div>${I('moneda')}<b>+${g?40:15}</b></div><div>${I('experiencia')}<b>+${g?20:8}</b></div><div>${I('trofeo')}<b>${g?'+8':'−5'}</b></div></div>
</div>
<div class="bots"><div class="btn azul t s" data-go="buscar" data-in="u" style="--d:6">VOLVER A JUGAR</div><div class="btn t s" data-go="${g?'premio':'lobby'}" data-in="u" style="--d:7">${g?'SIGUIENTE':'SALIR'}</div></div>
<div class="prueba t xs" onclick="window.RESULTADO=window.RESULTADO==='derrota'?'victoria':'derrota';const a=actual;actual=null;ir(a,{sinWipe:true})">VER ${g?'DERROTA':'VICTORIA'} (prueba)</div>${botones3d()}`;},
entrar(el){if(window.J){escenaJuego(el);return;}const g=window.RESULTADO!=='derrota',j=EQ.yo,cap=j.cap,cv=el.querySelector('.c3');
  const need=[[g?'v':'k',cap],['u',cap],...j.eq.map(id=>['l',id])];
  Promise.all(need.map(([t,id])=>VS3D.cargar(id,t).catch(()=>null))).then(()=>{if(actual!=='victoria')return;VS3D.parar();
    const pos=[[-2.3,-3.2],[2.3,-3.2],[-4.4,-4.6],[4.4,-4.6]];
    VS3D.escena(cv,[{id:cap,tipo:g?'v':'k',x:0,z:1.2,acc:g?'victoria':'lamento',idleDe:'u'+cap,s:1.3},...j.eq.map((id,i)=>({id,tipo:'l',x:pos[i][0],z:pos[i][1],s:.82,oscuro:g?.62:.45}))],
      {x:0,y:2.2,z:12,mira:[0,1.7,-1],fov:30});
    VS3D.arrancar();el.querySelector('.previo').style.display='none';});},
salir(){VS3D.parar();}};
let RJ=null;
function victoriaJuego(){const R=RJ=J.resultado()||{res:'draw',a:0,b:0,dt:0,gold:0,xp:0,eq:{cap:window.HEROE,eq:[]},yo:'Tú',rival:'Rival'};
  const t=[R.eq.cap,...(R.eq.eq||[])].filter(TIENE4K);R.cap=t[0]||window.HEROE||'leon';R.mates=t.slice(1,5);
  const g=R.res==='win',e=R.res==='draw',tit=g?'¡VICTORIA!':e?'EMPATE':R.forfeit?'TE RENDISTE':'DERROTA',dt=R.dt|0;
  const fila=(ic,k,v)=>`<div><span>${I(ic)}${k}</span><b>${v}</b></div>`;
  return `<div class="fondo ${g?'':'pierde'}"></div><div class="rayos2 ${g?'':'pierde'}"></div>
<div class="tit t ${g?'amarillo':'gris'}" data-in="l">${tit}</div>
<div class="copa t" data-in="l" style="--d:2"><img src="a/i/trofeo.webp">${dt>0?'+':dt<0?'−':''}<span>${Math.abs(dt)}</span></div>
<div class="esc3" data-in="u" style="--d:1"><img class="previo" src="${cuerpo(R.cap)}">${lienzo(1000,700,'c3')}</div>
<div class="panel pan" data-in="r" style="--d:3">
  <div class="marc"><div class="ju t xs">${R.yo}</div><div class="go t">${R.a} <span>-</span> ${R.b}</div><div class="ju t xs" style="text-align:right">${R.rival}</div></div>
  <div class="est t xs">${fila('trofeo','Copas',(R.tr0!=null?R.tr0+' → ':'')+R.tr)}${fila('experiencia','Nivel',R.lvl+(R.lu?' · ¡SUBISTE!':''))}${R.pack?fila('regalo','Premio',R.pack):''}${R.liga?`<div style="justify-content:center;color:#ffd23a">${R.liga}</div>`:''}${R.err?`<div style="justify-content:center;font-size:20px">${R.err}</div>`:''}</div>
  <div class="prem t xs"><div>${I('moneda')}<b>+${R.gold|0}</b></div><div>${I('experiencia')}<b>+${R.xp|0}</b></div><div>${I('trofeo')}<b>${dt>0?'+':''}${dt}</b></div></div>
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">${R.adG?`<div class="btn verde t xs" style="height:58px;font-size:22px" onclick="anuncioJ(this,'gold2')">▶ ANUNCIO · x2 MONEDAS (+${R.adG})</div>`:''}${R.adT?`<div class="btn azul t xs" style="height:58px;font-size:22px" onclick="anuncioJ(this,'tro')">▶ ANUNCIO · RECUPERA ${R.adT} COPAS</div>`:''}</div>
</div>
<div class="bots"><div class="btn azul t s" onclick="J.salirResultado(true)" data-in="u" style="--d:6">VOLVER A JUGAR</div><div class="btn t s" onclick="J.salirResultado(false)" data-in="u" style="--d:7">SALIR</div></div>`;}
window.anuncioJ=(b,k)=>{if(b.dataset.o)return;b.dataset.o=1;b.style.opacity=.6;J.anuncio(k).then(o=>{if(o)b.remove();else{b.dataset.o='';b.style.opacity='';}}).catch(()=>{b.dataset.o='';b.style.opacity='';});};
function escenaJuego(el){const R=RJ;if(!R)return;const g=R.res==='win',cap=R.cap,cv=el.querySelector('.c3'),esCap=['leon','turbo'].includes(cap);
  const tc=esCap?(g?'v':'k'):'u',acc=esCap?(g?'victoria':R.res==='draw'?null:'lamento'):null;
  const need=[[tc,cap],['u',cap],...R.mates.map(id=>['l',id])];
  Promise.all(need.map(([t,id])=>VS3D.cargar(id,t).catch(()=>null))).then(()=>{if(actual!=='victoria')return;VS3D.parar();
    const pos=[[-2.3,-3.2],[2.3,-3.2],[-4.4,-4.6],[4.4,-4.6]];
    const it=[{id:cap,tipo:tc,x:0,z:1.2,acc,idleDe:'u'+cap,s:1.3},...R.mates.filter(id=>VS3D.listo(id,'l')).map((id,i)=>({id,tipo:'l',x:pos[i][0],z:pos[i][1],s:.82,oscuro:g?.62:.45}))];
    if(!VS3D.listo(cap,tc))return;
    VS3D.escena(cv,it,{x:0,y:2.2,z:12,mira:[0,1.7,-1],fov:30});VS3D.arrancar();el.querySelector('.previo').style.display='none';});}
PANT.premio={html:()=>`<div class="fondo"></div><div class="rayos"></div><div class="tt t" data-in="l">¡RECOMPENSA DE VICTORIA!</div>
<div class="sobre brillo" id="sobre" onclick="abrirSobre()" data-in="s"><img src="a/logo.webp"><img class="estr" src="a/i/estrella.webp"></div><div class="aro" id="aro"></div>
<div class="res" id="res">
 <div class="it r-epica" style="background:linear-gradient(160deg,#d58bff,#5b1aa8)">${retrato('ciclon','','bottom:80px')}<div class="q t">KENSHI</div><div class="tag t xs" style="left:12px;top:12px">¡NUEVO!</div></div>
 <div class="it" style="background:radial-gradient(circle,#fff3a8,#ffb21a)"><img src="a/i/moneda.webp" style="width:220px;margin:70px auto 0"><div class="q t">x<span id="mon">0</span></div></div>
 <div class="it" style="background:linear-gradient(160deg,#5fd6ff,#1f6bff)"><img src="a/pw/hielo.webp" style="position:absolute;inset:0 0 80px 0;width:100%;height:calc(100% - 80px);object-fit:cover"><div class="q t">HIELO x3</div></div></div>
<div class="toca t s" id="toca">TOCA PARA ABRIR</div><div class="flash" id="flash"></div>
<div class="btn azul cont t" id="pcont" data-go="lobby">CONTINUAR</div>`};
window.abrirSobre=()=>{const s=$('#sobre');if(s.dataset.o)return;s.dataset.o=1;s.classList.add('tiembla');$('#toca').style.display='none';
 setTimeout(()=>{s.classList.remove('tiembla');s.classList.add('abre');$('#aro').classList.add('go');$('#flash').classList.add('go');},900);
 setTimeout(()=>{$$('#res .it').forEach((e,i)=>setTimeout(()=>e.classList.add('go'),i*260));const m=$('#mon');m.dataset.count=150;m.dataset.delay=700;contar(m);},1250);
 setTimeout(()=>$('#pcont').classList.add('on'),2300);};
})();
