// ===== LOBBY =====
(function(){
const css=`
#s-lobby .fondo{--bg:linear-gradient(180deg,#1a1050 0%,#4a1a7a 28%,#b03a7a 55%,#ff7a45 78%,#ffb35a 100%);--motivo:none}
#s-lobby .cielo{position:absolute;inset:0;pointer-events:none}
#s-lobby .elige{position:absolute;left:50%;top:118px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(14,40px);gap:4px;z-index:4}
#s-lobby .elige div{width:40px;height:40px;border:3px solid var(--ink);border-radius:12px;overflow:hidden;position:relative;cursor:pointer;box-shadow:0 4px 0 var(--ink);background:#1d3fc0}
#s-lobby .elige div.on{box-shadow:0 0 0 4px #ffd23a,0 4px 0 4px var(--ink)}
#s-lobby .ajuste{position:absolute;left:1080px;top:250px;width:300px;padding:14px 16px;z-index:5}
#s-lobby .ajuste label{display:block;font-size:20px;margin:6px 0 4px}
#s-lobby .ajuste input{width:100%;accent-color:#ffd23a}
#s-lobby .cargando{position:absolute;left:50%;top:420px;transform:translateX(-50%);font-size:26px;z-index:4;display:none}
#s-lobby .lienzo3d{position:absolute;left:-380px;bottom:-96px;width:760px;height:640px;pointer-events:auto;cursor:pointer}
#s-lobby .sol{position:absolute;left:520px;top:300px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,#fff6c8 0%,#ffd45a 30%,rgba(255,140,60,.0) 70%);opacity:.75}
#s-lobby .rayo{position:absolute;left:800px;top:640px;width:2200px;height:2200px;margin:-1100px 0 0 -1100px;background:repeating-conic-gradient(from 0deg,rgba(255,240,200,.10) 0 6deg,transparent 6deg 18deg);animation:gira 80s linear infinite;-webkit-mask:radial-gradient(circle,#000 10%,transparent 60%);mask:radial-gradient(circle,#000 10%,transparent 60%)}
@keyframes gira{to{transform:rotate(360deg)}}
#s-lobby .lejos{position:absolute;left:0;right:0;bottom:180px;height:200px;background:
  radial-gradient(ellipse 18% 70% at 12% 100%,#3a1446 98%,transparent),radial-gradient(ellipse 22% 90% at 88% 100%,#3a1446 98%,transparent),
  radial-gradient(ellipse 30% 55% at 50% 100%,#4a1a55 98%,transparent);opacity:.85}
#s-lobby .torre{position:absolute;bottom:330px;width:16px;height:240px;background:#2a0f38;border-radius:4px}
#s-lobby .torre::before{content:'';position:absolute;left:-34px;top:-26px;width:84px;height:34px;border-radius:6px;background:linear-gradient(#fffbe0,#ffd65a);box-shadow:0 0 40px 18px rgba(255,230,140,.55)}
#s-lobby .haz{position:absolute;bottom:560px;width:260px;height:900px;transform-origin:50% 100%;background:linear-gradient(0deg,rgba(255,240,180,.28),transparent 80%);clip-path:polygon(44% 100%,56% 100%,100% 0,0 0);animation:haz 7s ease-in-out infinite alternate}
@keyframes haz{from{transform:rotate(var(--a1))}to{transform:rotate(var(--a2))}}
#s-lobby .piso{position:absolute;left:-100px;right:-100px;bottom:-40px;height:360px;background:linear-gradient(180deg,rgba(60,20,70,0) 0,#3a1846 18%,#1c0d2c 60%,#0e0618)}
#s-lobby .piso::before{content:'';position:absolute;left:50%;top:70px;width:1000px;height:220px;margin-left:-500px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,170,90,.32),transparent)}
#s-lobby .podio{position:absolute;left:-230px;bottom:-58px;width:460px;height:110px;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#5a2a6a,#2a1238 70%);border:3.5px solid var(--ink);box-shadow:inset 0 8px 0 rgba(255,180,120,.35),0 10px 0 var(--ink),0 0 60px rgba(255,150,80,.45)}
#s-lobby .podio::after{content:'';position:absolute;inset:14px 40px;border-radius:50%;border:4px solid rgba(255,200,120,.35)}
#s-lobby .isla{position:absolute;left:615px;top:70px;width:370px;animation:flota 6s ease-in-out infinite;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45)) brightness(.9)}
@keyframes flota{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
#s-lobby .chispa{position:absolute;width:8px;height:8px;border-radius:50%;background:#ffcf6a;box-shadow:0 0 12px 4px rgba(255,160,60,.8);animation:sube var(--t) linear infinite;animation-delay:var(--dl)}
@keyframes sube{0%{transform:translate(0,0);opacity:0}10%{opacity:1}100%{transform:translate(var(--x),-700px);opacity:0}}
#s-lobby .heroe{position:absolute;left:800px;bottom:190px;width:0;height:0}
#s-lobby .heroe .render{left:0;transform:translateX(-50%);bottom:-6px;height:470px;cursor:pointer;pointer-events:auto}
#s-lobby .heroe .sombra{left:-170px;bottom:-22px;width:340px;height:50px;z-index:1}
#s-lobby .heroe.salta .respira{animation:salta .7s cubic-bezier(.3,1.6,.5,1)}
@keyframes salta{0%{transform:scale(1)}20%{transform:scale(1.08,.9)}45%{transform:translateY(-70px) scale(.96,1.06)}75%{transform:scale(1.06,.94)}100%{transform:scale(1)}}
#s-lobby .placa{position:absolute;left:-95px;bottom:488px;display:none;align-items:center;gap:8px;transform:skewX(-8deg)}
#s-lobby .placa .tro{display:flex;align-items:center;gap:6px;height:46px;padding:0 16px 0 8px;background:rgba(8,10,40,.82);border:3px solid var(--ink);border-radius:10px;font-size:26px}
#s-lobby .placa .tro img{width:40px;height:40px}
#s-lobby .placa .nv{width:52px;height:52px;border-radius:50%;border:3px solid var(--ink);background:radial-gradient(circle at 35% 30%,#d58bff,#8b2be0 70%);display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 0 var(--ink)}
#s-lobby .invita{position:absolute;bottom:250px;transform:skewX(-6deg);width:120px;height:150px;border:4px dashed rgba(255,255,255,.55);border-radius:18px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:76px;color:rgba(255,255,255,.8);cursor:pointer}
#s-lobby .lado{position:absolute;top:140px;display:flex;flex-direction:column;gap:22px;z-index:4}
#s-lobby .ib{width:150px;height:118px;flex-direction:column;gap:0;padding-top:4px}
#s-lobby .ib img{width:96px;height:96px;margin-top:-30px;filter:drop-shadow(0 5px 0 rgba(0,0,0,.45));transition:transform .2s}
#s-lobby .ib:hover img{transform:scale(1.08) rotate(-4deg)}
#s-lobby .ib span{font-size:24px;margin-top:2px}
#s-lobby .perfil{position:absolute;left:18px;top:14px;width:340px;height:96px;display:flex;align-items:center;gap:12px;padding:0 14px 0 8px;cursor:pointer}
#s-lobby .perfil .av{width:74px;height:74px;border-radius:12px;border:3px solid var(--ink);background:#1d3fc0;overflow:hidden}
#s-lobby .perfil .av img{width:100%;height:100%}
#s-lobby .xp{height:18px;border:3px solid var(--ink);border-radius:9px;background:#0b1240;overflow:hidden;margin-top:6px}
#s-lobby .xp i{display:block;height:100%;width:62%;background:linear-gradient(#b98cff,#7a3ae0);box-shadow:inset 0 3px 0 rgba(255,255,255,.4)}
#s-lobby .camino{position:absolute;left:376px;top:14px;width:300px;height:96px;display:flex;align-items:center;gap:8px;padding:0 14px;cursor:pointer;--c1:#ffe25a;--c2:#ffbe1a;--c3:#c27a00}
#s-lobby .camino img{width:70px;height:70px;margin-left:-6px;filter:drop-shadow(0 4px 0 rgba(0,0,0,.4))}
#s-lobby .barra{height:22px;border:3px solid var(--ink);border-radius:11px;background:#5a3a00;overflow:hidden;position:relative}
#s-lobby .barra i{position:absolute;inset:0;width:58%;background:linear-gradient(#ff9a3c,#ff6a1a);box-shadow:inset 0 3px 0 rgba(255,255,255,.4)}
#s-lobby .topd{position:absolute;right:18px;top:20px;display:flex;align-items:center;gap:26px}
#s-lobby .mbtn{width:92px;height:80px}
#s-lobby .mbtn svg{width:48px;height:48px}
#s-lobby .abajo{position:absolute;left:18px;right:18px;bottom:16px;height:140px;display:flex;align-items:flex-end;gap:16px;z-index:4}
#s-lobby .pase{width:250px;height:130px;flex-direction:column;--c1:#ffe25a;--c2:#ffbe1a;--c3:#c27a00}
#s-lobby .pase .tk{width:170px;height:92px;margin-top:-52px;transform:rotate(-8deg);filter:drop-shadow(0 6px 0 rgba(0,0,0,.45))}
#s-lobby .mis{width:150px;height:118px;flex-direction:column}
#s-lobby .mis img{width:84px;height:84px;margin-top:-24px}
#s-lobby .modo{flex:1;height:118px;display:flex;align-items:center;gap:14px;padding:0 18px 0 6px;cursor:pointer;transform:skewX(-8deg);overflow:visible}
#s-lobby .modo>*{transform:skewX(8deg)}
#s-lobby .modo img{width:150px;margin-top:-50px;filter:drop-shadow(0 8px 6px rgba(0,0,0,.5))}
#s-lobby .jugar{width:400px;height:132px;font-size:72px;--sw:9px;--sd:6px}
#s-lobby .racha{position:absolute;right:20px;bottom:168px;width:398px;height:88px;padding:8px 10px 8px 14px;display:flex;align-items:center;gap:8px;z-index:4}
#s-lobby .racha .n{flex:1;height:58px;border:3px solid var(--ink);border-radius:10px;background:linear-gradient(#3d6cff,#1d3fc0);display:flex;align-items:center;justify-content:center}
#s-lobby .racha .n img{width:44px;height:44px}
#s-lobby .racha .n.ok{background:linear-gradient(#6af04a,#2bb51c)}
#s-lobby .racha .lbl{position:absolute;left:50%;top:-24px;transform:translateX(-50%) skewX(-8deg);padding:4px 16px;background:var(--ink);border-radius:8px;font-size:20px;white-space:nowrap;color:var(--oro)}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const chispas=()=>Array.from({length:18},(_,i)=>`<i class="chispa" style="left:${400+Math.random()*800}px;bottom:${150+Math.random()*80}px;--t:${5+Math.random()*5}s;--dl:-${Math.random()*8}s;--x:${(Math.random()-.5)*200}px"></i>`).join('');
PANT.lobby={html:()=>`
<div class="fondo"></div>
<div class="cielo"><div class="rayo"></div><div class="sol"></div>
  <div class="haz" style="left:120px;--a1:18deg;--a2:34deg"></div><div class="haz" style="left:1230px;--a1:-34deg;--a2:-16deg"></div>
  <div class="torre" style="left:240px"></div><div class="torre" style="left:1350px"></div>
  <div class="lejos"></div><div class="piso"></div>${chispas()}</div>
<div class="elige" data-in="d" style="--d:3">${["leon","turbo","nebula","vampira","yeti","remiendo","zombi","momia","monje","campeon","goblin","duende","hongo","malabares","rey","cazador","ciclon","zurdito","ruleta","expreso","sangre","toro","vikingo","reina","perro","muralla","valkiria"].map(k=>`<div class="${k===(window.HEROE||"leon")?"on":""}" onclick="cambiaHeroe('${k}',this)">${retrato(k)}</div>`).join("")}</div><div id="capb" style="position:absolute;left:1090px;top:200px;display:flex;flex-direction:column;gap:10px;z-index:5">
 <div class="t xs" style="font-size:20px;color:#ffd23a">CAPITANES (KRAGOR Y VOLT)</div>
 <div class="btn gris t s" style="width:220px;height:44px;font-size:18px" onclick="CONTORNO.setActivo(!CONTORNO.ACTIVO());location.reload()">CONTORNO: ${window.CONTORNO&&CONTORNO.ACTIVO()?'SÍ':'NO'}</div>
 ${[['VICTORIA','verde','victoria()'],['LAMENTO','rojo','lamento()'],['LOBBY 1','azul','lobby(0)'],['LOBBY 2','azul','lobby(1)'],['NORMAL','gris','normal()']].map(([t,c,f])=>`<div class="btn ${c} t s" style="width:220px;height:60px;font-size:24px" onclick="LOBBY3D.${f}||toast('Solo los capitanes tienen esta animación')">${t}</div>`).join('')}
 <div class="sub" style="font-size:14px;width:230px">Cada 8 a 15 s hacen solos una acción del lobby.</div></div><div class="cargando t s" id="carg">CARGANDO…</div>
<div class="heroe" id="heroe" data-in="u" style="--d:2">
  <div class="podio"></div><div class="sombra"></div>
  <div class="respira" id="caja3d" style="position:absolute;left:0;bottom:0"><img class="render" id="kr2d" src="${cuerpo('leon')}" style="display:none"></div>
  <div class="placa"><div class="tro t s"><img src="a/i/trofeo.webp">78</div><div class="nv t s">5</div></div>
</div>
<div class="btn gris perfil" data-go="perfil" data-in="l"><div class="av"><img src="a/i/avatar-leon.webp"></div>
  <div style="flex:1"><div class="t s" style="font-size:25px">LOVEGORDAS</div><div class="xp"><i></i></div></div></div>
<div class="btn camino" data-go="camino" data-in="d" style="--d:1"><img src="a/i/trofeo.webp"><div style="flex:1"><div class="t" style="font-size:38px" data-count="78">78</div><div class="barra"><i></i></div></div><div class="badge t xs">!</div></div>
<div class="topd" data-in="d" style="--d:2">${cur().replace('data-in="d"','')}<div class="btn gris mbtn" data-go="ajustes">${ICO.menu}<div class="badge t xs">1</div></div></div>
<div class="lado" style="left:18px">
  <div class="btn gris ib" data-go="tienda" data-in="l" style="--d:2">${I('tienda')}<span class="t s">TIENDA</span><div class="tag verde t xs" style="right:-30px;top:-6px">GRATIS</div></div>
  <div class="btn gris ib" data-go="personajes" data-in="l" style="--d:3">${I('cartas')}<span class="t s">TITANES</span></div>
  <div class="btn gris ib" data-go="ranking" data-in="l" style="--d:4">${I('ranking')}<span class="t s">RANKING</span></div></div>
<div class="lado" style="right:18px;top:150px">
  <div class="btn gris ib" data-go="noticias" data-in="r" style="--d:2">${I('noticias')}<span class="t s">NOTICIAS</span><div class="badge t xs">2</div></div>
  <div class="btn gris ib" data-go="amigos" data-in="r" style="--d:3">${I('amigos')}<span class="t s">AMIGOS</span></div>
  <div class="btn gris ib" data-go="festejos" data-in="r" style="--d:4">${I('estrella')}<span class="t s">FESTEJOS</span></div></div>
<div class="pan racha" data-in="r" style="--d:5"><div class="lbl t xs">RACHA DEL DÍA</div>
  <div class="n ok">${ICO.palomita}</div><div class="n ok">${ICO.palomita}</div><div class="n"><img src="a/i/moneda.webp"></div><div class="n"><img src="a/i/gema.webp"></div><div class="n brillo"><img src="a/i/regalo.webp"></div></div>
<div class="abajo">
  <div class="btn pase" data-go="tienda" data-in="u" style="--d:3"><svg class="tk" viewBox="0 0 170 92"><path d="M8 8h154v24a14 14 0 0 0 0 28v24H8V60a14 14 0 0 0 0-28z" fill="#ffd23a" stroke="#0a0d1c" stroke-width="6" stroke-linejoin="round"/><path d="M112 8h50v24a14 14 0 0 0 0 28v24h-50z" fill="#2f6bff" stroke="#0a0d1c" stroke-width="6" stroke-linejoin="round"/><path d="M137 26l6 13 14 1-11 9 4 14-13-8-12 8 4-14-11-9 14-1z" fill="#fff" stroke="#0a0d1c" stroke-width="4" stroke-linejoin="round"/><path d="M24 30h70M24 46h56M24 62h64" stroke="#c98a00" stroke-width="8" stroke-linecap="round"/></svg><span class="t s" style="font-size:24px;margin-top:6px">PASE TITÁN</span><div class="badge t xs">1</div></div>
  <div class="btn gris mis" data-in="u" style="--d:4" onclick="toast('Misiones')">${I('listo')}<span class="t s" style="font-size:22px">MISIONES</span></div>
  <div class="pan modo" data-in="u" style="--d:5" onclick="toast('Elegir arena')"><img src="a/ar/a7.webp"><div><div class="sub" style="font-size:16px;color:#ffcf6a">ARENA ACTUAL · NUEVO EVENTO EN 2 h 14 min</div><div class="t" style="font-size:40px;margin-top:6px">VOLCÁN</div><div class="t xs celeste" style="font-size:22px;margin-top:6px">PARTIDO 1 VS 1</div></div></div>
  <div class="btn jugar t brillo" data-go="buscar" data-in="r" style="--d:6">JUGAR</div>
</div>`,
entrar(el){LOBBY3D.montar(el.querySelector('#caja3d'),el.querySelector('#kr2d'));},salir(){LOBBY3D.parar();}};
window.ajBr=()=>{const k=window.HEROE||'turbo',a=+$('#rab').value,p=+$('#rpa').value;AJ[k]={abre:a,palma:p};$('#vab').textContent=a;$('#vpa').textContent=p;};
window.syncAj=()=>{const k=window.HEROE||'turbo',v=(window.AJ&&AJ[k])||{abre:14,palma:0};const r1=$('#rab'),r2=$('#rpa');if(!r1)return;r1.value=v.abre;r2.value=v.palma;$('#vab').textContent=v.abre;$('#vpa').textContent=v.palma;};
window.cambiaHeroe=(k,el)=>{window.HEROE=k;syncAj();$$('#s-lobby .elige div').forEach(d=>d.classList.toggle('on',d===el));const c=$('#carg');c.style.display='block';LOBBY3D.cambiar(k).finally(()=>c.style.display='none');};
window.saltar=()=>{const h=$('#heroe');h.classList.remove('salta');void h.offsetWidth;h.classList.add('salta');};
})();
