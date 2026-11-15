// ===== TIENDA (carrusel por secciones) + DETALLE DE OFERTA (titán en 3D) =====
(function(){
const css=`
#s-tienda .fondo{--bg:linear-gradient(180deg,#5fe6ff 0%,#38b8ff 28%,#3d8bff 62%,#6a5cff 100%);--motivo:url(a/corona.png)}
#s-tienda .fondo::after{background:radial-gradient(ellipse 60% 40% at 55% 30%,rgba(255,255,255,.35),transparent 70%)!important}
#s-tienda .menu{position:absolute;left:0;top:118px;bottom:0;width:320px;padding:22px 0 0 0;display:flex;flex-direction:column;gap:14px;background:linear-gradient(90deg,rgba(6,10,36,.78),rgba(6,10,36,.35));clip-path:polygon(0 0,100% 0,88% 100%,0 100%);z-index:3}
#s-tienda .op{width:286px;height:78px;margin-left:-10px;font-size:24px;justify-content:flex-start;padding-left:30px;border-radius:0 14px 14px 0;--c1:#56679f;--c2:#3c4a83;--c3:#202a58;transform:skewX(-8deg);transition:width .2s}
#s-tienda .op>*{transform:skewX(8deg)}#s-tienda .op img{width:56px;height:56px;position:absolute;right:14px;top:6px;transform:skewX(8deg)}
#s-tienda .op.sel{--c1:#ffe25a;--c2:#ffbe1a;--c3:#c27a00;width:306px}
#s-tienda .op .tag{left:auto;right:-24px;top:-14px;font-size:14px}
#s-tienda .hs{position:absolute;left:280px;right:0;top:122px;bottom:26px;padding-left:40px}
#s-tienda .track{gap:46px;padding:0 120px 0 30px;height:100%}
#s-tienda .sec{display:flex;flex-direction:column;height:100%;flex:none}
#s-tienda .sti{height:52px;display:flex;align-items:center;font-size:30px;padding-left:6px;letter-spacing:1px;opacity:.95}
#s-tienda .cards{flex:1;display:flex;gap:26px;padding-bottom:24px}
#s-tienda .of{position:relative;flex:none;height:100%;border:3.5px solid var(--ink);border-radius:20px;overflow:hidden;box-shadow:0 9px 0 var(--ink),0 18px 30px rgba(0,0,0,.35);transform:skewX(-3deg);cursor:pointer}
#s-tienda .of:active{transform:skewX(-3deg) scale(.985)}
#s-tienda .of .cab{position:absolute;left:0;right:0;top:0;height:70px;display:flex;align-items:center;justify-content:center;font-size:40px;z-index:2}
#s-tienda .of .reloj{position:absolute;left:18px;top:68px;padding:6px 14px;background:var(--ink);border-radius:0 0 10px 10px;font-size:19px;color:#cfd8ff;z-index:3;display:flex;gap:6px;align-items:center}
#s-tienda .of .reloj img{width:22px}
#s-tienda .precio{position:absolute;left:0;right:0;bottom:0;height:104px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:48px;border-top:5px solid var(--ink);background:linear-gradient(#2ff0b8,#10c48d);box-shadow:inset 0 5px 0 rgba(255,255,255,.4),inset 0 -8px 0 #0a8a62;z-index:3}
#s-tienda .precio,#s-tienda .pk .pp{overflow:hidden}
#s-tienda .precio::after,#s-tienda .pk .pp::after{display:none;content:'';position:absolute;top:-20%;left:-60%;width:30%;height:140%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:brillo 3.6s ease-in-out infinite;pointer-events:none}
#s-tienda .pk .pp{position:relative}
#s-tienda .precio s,#s-oferta .comprar s{position:relative;display:inline-flex;align-items:center;gap:4px;font-size:32px;color:#e8fff6;text-decoration:none;--sw:5px;--sd:3px;margin-right:6px}
#s-tienda .precio s img,#s-oferta .comprar s img{width:28px!important}
#s-tienda .precio s::after,#s-oferta .comprar s::after{content:'';position:absolute;left:-4px;right:-4px;top:46%;height:4px;background:#ff2d2d;border-radius:3px;box-shadow:0 0 0 1.5px var(--ink);transform:rotate(-10deg)}
#s-tienda .precio img{width:56px}
#s-tienda .desc{position:absolute;right:18px;bottom:116px;padding:8px 14px;border:3px solid var(--ink);border-radius:12px;background:linear-gradient(#b880ff,#7b3cff);font-size:32px;transform:rotate(-6deg);z-index:4;box-shadow:0 5px 0 var(--ink);animation:latido 1.4s ease-in-out infinite}
#s-tienda .nuevo{position:absolute;right:14px;top:14px;z-index:4}
#s-tienda .flota{position:absolute;filter:drop-shadow(0 6px 0 rgba(0,0,0,.35));animation:flotaG 3s ease-in-out infinite}
#s-tienda .nombre{position:absolute;padding:6px 14px;border:3px solid var(--ink);border-radius:10px;font-size:26px;transform:skewX(-8deg);z-index:3}
#s-tienda .rayo{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 60%,rgba(255,255,255,.09) 0 8deg,transparent 8deg 22deg);animation:gira 40s linear infinite;transform-origin:50% 60%}
#s-tienda .grid{display:grid;grid-template-columns:repeat(3,200px);grid-template-rows:1fr 1fr;gap:18px;height:100%}
#s-tienda .pk{position:relative;border:3.5px solid var(--ink);border-radius:18px;overflow:hidden;box-shadow:0 7px 0 var(--ink);cursor:pointer;display:flex;flex-direction:column}
#s-tienda .pk.g{background:radial-gradient(circle at 50% 62%,#9fe7ff 0,#3a9bff 38%,#1d4fd6 72%,#13308f)}
#s-tienda .pk.m{background:radial-gradient(circle at 50% 62%,#e4b8ff 0,#a35cff 38%,#6a2bd6 72%,#3d1690)}
#s-tienda .pk .cn{flex:1;position:relative}
#s-tienda .pk .cn img{position:absolute;filter:drop-shadow(0 4px 0 rgba(0,0,0,.35))}
#s-tienda .pk .cn img.mt{left:50%;bottom:22px;width:var(--w);max-height:84%;object-fit:contain;object-position:50% 100%;transform:translateX(-50%);filter:drop-shadow(0 6px 0 rgba(0,0,0,.3));transition:transform .2s}
#s-tienda .pk:active .cn img.mt{transform:translateX(-50%) scale(1.06)}
#s-tienda .pk .cn::before{content:'';position:absolute;left:12%;right:12%;bottom:18px;height:22px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.35),transparent 70%)}
#s-tienda .pk .cn::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 60%,rgba(255,255,255,.35),transparent 55%);pointer-events:none}
#s-tienda .pk .q{position:absolute;right:10px;top:6px;font-size:36px;z-index:2}
#s-tienda .pk .ex{position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:15px;color:#fff6c0;z-index:2}
#s-tienda .pk .pp{height:62px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:28px;border-top:4px solid var(--ink);background:linear-gradient(#2ff0b8,#10c48d);box-shadow:inset 0 4px 0 rgba(255,255,255,.4),inset 0 -6px 0 #0a8a62}
#s-tienda .pk .pp img{width:34px}
#s-tienda .pk .tg{position:absolute;left:-4px;bottom:94px;padding:3px 10px;border:3px solid var(--ink);border-radius:0 8px 8px 0;font-size:15px;z-index:3}
#s-tienda .tg.rojo{background:linear-gradient(#ff6b55,#ef3428)}#s-tienda .tg.verde{background:linear-gradient(#7cf04a,#3fcb27)}
#s-tienda .xp{width:300px;background:linear-gradient(170deg,#3a6bff,#1a2f9a)}
#s-tienda .cod{width:340px;background:linear-gradient(170deg,#2a3a9a,#141c5a)}
#s-oferta .fondo{--bg:linear-gradient(180deg,#4fd0ff 0%,#b98cff 38%,#ff7ac8 64%,#ffb46a 100%);--motivo:none}
#s-oferta .sol{position:absolute;left:520px;top:220px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,#fff6b0,#ffd25a 45%,rgba(255,180,80,0) 70%);opacity:.85}
#s-oferta .piso{position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(#3a2a8a,#1a0f4a);border-top:6px solid #ff9adf}
#s-oferta .ciudad{position:absolute;left:0;right:0;bottom:200px;height:180px;background:repeating-linear-gradient(90deg,rgba(90,40,160,.45) 0 60px,rgba(120,60,190,.45) 60px 100px,transparent 100px 130px);-webkit-mask:linear-gradient(transparent,#000 30%)}
#s-oferta .reloj{position:absolute;left:150px;top:28px;padding:8px 18px;background:var(--ink);border-radius:12px;font-size:24px;display:flex;align-items:center;gap:8px;z-index:5}
#s-oferta .reloj img{width:30px}
#s-oferta .izq{position:absolute;left:40px;top:120px;width:470px}
#s-oferta .placa{display:inline-block;padding:8px 30px 10px 22px;border:3px solid var(--ink);border-radius:12px;transform:skewX(-8deg);box-shadow:0 8px 0 var(--ink);background:linear-gradient(#ff5a4a,#d81e1e)}
#s-oferta .placa>*{transform:skewX(8deg)}
#s-oferta .placa .nm{font-size:60px;line-height:1;--sw:10px;--sd:7px}
#s-oferta .sub{display:inline-block;margin:10px 0 0 30px;padding:4px 16px;background:linear-gradient(#ffe25a,#ffb21a);color:var(--ink);border:3px solid var(--ink);border-radius:8px;font-size:22px;transform:skewX(-8deg);text-shadow:none;-webkit-text-stroke:0;box-shadow:0 4px 0 var(--ink)}
#s-oferta .lst{margin-top:22px;font-size:24px;line-height:1.45;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5)}
#s-oferta .lst b{color:#ffe25a}
#s-oferta .cen{position:absolute;top:96px;height:700px}
#s-oferta .cen canvas{position:absolute;left:0;top:0;cursor:grab}
#s-oferta .cen .previo{position:absolute;left:50%;bottom:40px;height:560px;transform:translateX(-50%)}
#s-oferta .sombra{position:absolute;left:20%;right:20%;bottom:40px;height:46px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),transparent 70%)}
#s-oferta .inc{position:absolute;right:40px;top:104px;text-align:right;z-index:4}
#s-oferta .inc .tt{font-size:24px;margin-bottom:8px}
#s-oferta .inc .row{display:flex;flex-direction:column;gap:12px;align-items:flex-end}
#s-oferta .it{position:relative;width:118px;height:132px;border:3.5px solid var(--ink);border-radius:14px;overflow:hidden;background:linear-gradient(#5fa8ff,#1f5bff);box-shadow:0 6px 0 var(--ink);animation:bote 2.6s ease-in-out infinite}
#s-oferta .it img.ic{position:absolute;left:50%;top:44%;width:80px;transform:translate(-50%,-50%);filter:drop-shadow(0 4px 0 rgba(0,0,0,.35))}
#s-oferta .it .l{position:absolute;left:0;right:0;bottom:0;height:34px;background:var(--ink);display:flex;align-items:center;justify-content:center;font-size:17px}
#s-oferta .bots{position:absolute;left:40px;right:40px;bottom:30px;display:flex;justify-content:space-between;align-items:flex-end;z-index:5}
#s-oferta .comprar{width:380px;height:118px;font-size:52px;gap:14px}
#s-oferta .comprar img{width:58px}
#s-oferta .dto{position:absolute;right:-16px;top:-34px;padding:6px 14px;border:3px solid var(--ink);border-radius:12px;background:linear-gradient(#b880ff,#7b3cff);font-size:30px;transform:rotate(8deg);box-shadow:0 5px 0 var(--ink);animation:latido 1.4s ease-in-out infinite}
#s-oferta .toca{position:absolute;left:0;right:0;top:96px;text-align:center;font-size:18px;opacity:.85;z-index:4}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
// ---------- ofertas (datos de prueba) ----------
const OF={
 especial:{t:'OFERTA ESPECIAL',sub:'2 TITANES LEGENDARIOS',tit:['malabares','zurdito'],its:[['t','malabares'],['t','zurdito'],['gema',300]],p:'$59.00',a:'$99.00',d:'-40%',r:'23 d 2 h',
   lst:'¡Los reyes del regate llegan juntos!<br>Esta oferta incluye:<br>– Titán <b>Ginga</b> (legendario)<br>– Titán <b>Simún</b> (legendario)<br>– <b>300 gemas</b>'},
 reina:{t:'REINA',sub:'TITÁN LEGENDARIO · NUEVA',tit:['reina'],its:[['t','reina'],['ficha',100],['moneda',500]],p:'$149.00',r:'21 d 3 h',nuevo:1,
   lst:'Reina del hielo. Congela la cancha y deja a los rivales resbalando.<br>Esta oferta incluye:<br>– Titán <b>Reina</b><br>– <b>100 fichas</b> de Reina<br>– <b>500 monedas</b>'},
 pase:{t:'PASE TITÁN',sub:'TEMPORADA 1 · TORMENTA',tit:['turbo','nebula'],its:[['t','turbo'],['t','nebula'],['gema',100],['sobre',10]],p:'$55.00',r:'21 d 3 h',
   lst:'¡La mejor oferta de la temporada!<br>Desbloquea al instante:<br>– Titán <b>Volt</b> y <b>Nébula</b><br>– <b>100 gemas</b> y <b>10 sobres</b><br>– Recompensas extra en cada nivel'},
 sangre:{t:'AZAZEL',sub:'TITÁN COMÚN',tit:['sangre'],its:[['t','sangre'],['ficha',40]],p:'gema:79',r:'2 d 5 h',lst:'Demonio de fuego. Llegó del inframundo solo para jugar futbol.<br>Incluye:<br>– Titán <b>Azazel</b><br>– <b>40 fichas</b>'},
 perro:{t:'FENRIR',sub:'TITÁN COMÚN',tit:['perro'],its:[['t','perro'],['ficha',40]],p:'gema:79',r:'2 d 5 h',lst:'Hombre lobo. De día es tranquilo… de noche, otra historia.<br>Incluye:<br>– Titán <b>Fenrir</b><br>– <b>40 fichas</b>'},
 valkiria:{t:'VALKIRIA',sub:'TITÁN ÉPICO',tit:['valkiria'],its:[['t','valkiria'],['ficha',60]],p:'gema:199',a:'gema:249',d:'-20%',r:'5 d 1 h',lst:'Guerrera del norte. Pelea por su equipo como si fuera la última batalla.<br>Incluye:<br>– Titán <b>Valkiria</b><br>– <b>60 fichas</b>'}
};
const ICN={gema:'a/i/gema.webp',moneda:'a/i/moneda.webp',ficha:'a/i/energia.webp',sobre:'a/i/cartas.webp'};
const NIT={gema:'GEMAS',moneda:'MONEDAS',ficha:'FICHAS',sobre:'SOBRES'};
const precioH=p=>/^gema:/.test(p)?`<img src="a/i/gema.webp">${p.slice(5)}`:/^moneda:/.test(p)?`<img src="a/i/moneda.webp">${p.slice(7)}`:p;
const t3=(id,pos,h)=>{const w=Math.round(h*.78),Q=Math.min(2,(devicePixelRatio||1)*(typeof SC!=='undefined'?SC:1));return `<div class="t3" data-id="${id}" style="position:absolute;${pos};width:${w}px;height:${h}px"><img class="previo" src="${cuerpo(id)}" style="position:absolute;left:50%;bottom:0;height:${Math.round(h*.77*(ESTATURA[id]||1))}px;transform:translateX(-50%);filter:drop-shadow(0 8px 0 rgba(0,0,0,.25))"><canvas width="${Math.round(w*Q)}" height="${Math.round(h*Q)}" style="position:absolute;left:0;top:0;width:${w}px;height:${h}px"></canvas></div>`;};
const reloj=r=>`<div class="reloj t xs">${I('reloj')}${r}</div>`;
const sombra='filter:drop-shadow(0 8px 0 rgba(0,0,0,.3))';
function tarjOf(k,w,bg,inner){const o=OF[k];return `<div class="of" style="width:${w}px;background:${bg}" onclick="verOferta('${k}')">${inner}<div class="precio t">${o.a?`<s>${precioH(o.a)}</s>`:''}${precioH(o.p)}</div>${o.d?`<div class="desc t s">${o.d}</div>`:''}${o.nuevo?`<div class="tag nuevo t xs">NUEVO</div>`:''}</div>`;}
function titanCard(k){const conD=!!OF[k].d;const o=OF[k],id=o.tit[0],p=PJI[id],c={comun:'#3f7fd0',rara:'#1fc16b',epica:'#8b2be0',legendaria:'#ffa51a'}[p.r];
  return tarjOf(k,330,`radial-gradient(circle at 50% 66%,#fff6c0 0,rgba(255,220,140,.9) 18%,transparent 50%),linear-gradient(180deg,${c},color-mix(in srgb,${c} 55%,#ff6fc8))`,`<div class="cab t" style="font-size:34px">${p.n.toUpperCase()}</div>${reloj(o.r)}
   ${t3(id,'left:50%;bottom:100px;transform:translateX(-50%)',560)}
   <div class="nombre t xs" style="left:16px;bottom:${conD?150:120}px;background:linear-gradient(#5a6aa3,#3e4d86)">${o.sub.split('·')[0].trim()}</div>`);}
const pk=(cls,q,imgs,precio,tg,ex)=>`<div class="pk ${cls}" onclick="comprarPack('${q}','${cls}','${precio}','${(imgs.match(/src="([^"]+)"/)||[])[1]||''}')">${tg?`<div class="tg ${tg[1]} t xs">${tg[0]}</div>`:''}<div class="q t">${q}</div><div class="cn">${imgs}${ex?`<div class="ex t xs">${ex}</div>`:''}</div><div class="pp t">${precioH(precio)}</div></div>`;
// montones 3D renderizados (tools/claude/montones.py con gema.glb y moneda.glb)
const montonG=n=>`<img class="mt" src="a/pk/g${n}.webp" style="--w:${[0,70,84,92,96,98,100][n]}%">`;
const montonM=n=>Array.from({length:n},(_,i)=>`<img src="a/i/moneda.webp" style="width:${66+n*4}px;left:${50+((i*41)%70)-n*3}px;top:${34+((i*19)%36)+i*4}px">`).join('');   // provisional hasta tener monedas 3D nuevas
const SECS=[['dest','DESTACADO','estrella','GRATIS'],['tit','TITANES','avatar-leon'],['sob','SOBRES Y PODERES','cartas','NUEVO'],['gem','GEMAS','gema'],['mon','MONEDAS','moneda'],['ext','EXTRAS','experiencia']];
PANT.tienda={html:()=>`<div class="fondo"></div>${header('TIENDA')}
<div class="menu">${SECS.map((s,i)=>`<div class="btn op ${i?'':'sel'} t s" data-sec="${s[0]}" data-in="l" style="--d:${i+1}" onclick="irSec('${s[0]}')"><span>${s[1].split(' ')[0]}</span>${I(s[2])}${s[3]?`<div class="tag ${s[3]==='GRATIS'?'verde':''} t xs">${s[3]}</div>`:''}</div>`).join('')}</div>
<div class="hs" data-pad="0"><div class="track">
<div class="sec" id="sec-dest"><div class="sti t">DESTACADO</div><div class="cards">
 <div class="of" style="width:300px;background:radial-gradient(circle at 50% 40%,#fff3a8,#ffcf3a 40%,#ff9d1a)" onclick="regalo(this)"><div class="rayo"></div><div class="cab t">REGALO</div>${reloj('7 h 22 min')}
  <img class="flota" src="a/i/moneda.webp" style="left:45px;top:120px;width:200px"><div class="t" style="position:absolute;left:0;right:0;top:360px;text-align:center;font-size:60px">x100</div>
  <div class="tag verde t s" style="left:18px;top:110px;font-size:20px">DIARIO</div><div class="precio t" id="regp">GRATIS</div></div>
 ${tarjOf('pase',700,'radial-gradient(circle at 50% 70%,#fff4a0 0,#ffb35a 22%,#ff6fc8 48%,#a65cff 75%,#6a3cff)',`<div class="rayo"></div>
  <div class="cab t" style="justify-content:flex-start;padding-left:30px;font-size:54px;top:12px">PASE TITÁN</div>
  ${t3('turbo','left:60px;bottom:96px',560)}${t3('nebula','left:280px;bottom:96px',560)}
  <div class="nombre t s" style="left:140px;bottom:130px;background:linear-gradient(#ffd24a,#ff9d00)">VOLT</div><div class="nombre t s" style="left:380px;bottom:130px;background:linear-gradient(#a874ff,#5b22d6)">NÉBULA</div>
  <img class="flota" src="a/fl/g1.webp" style="left:30px;top:150px;width:110px;--r:-12deg"><img class="flota" src="a/i/moneda.webp" style="right:30px;top:100px;width:120px;animation-delay:-1s;--r:14deg">
  <img class="flota" src="a/i/cartas.webp" style="right:40px;top:280px;width:110px;animation-delay:-2s;--r:8deg"><img class="flota" src="a/fl/t.webp" style="left:26px;top:330px;width:100px;animation-delay:-1.5s">
  <div class="t amarillo" style="position:absolute;right:28px;top:26px;font-size:24px;text-align:right;line-height:1.1">¡LA MEJOR OFERTA<br>DE LA TEMPORADA!</div>`)}
 ${tarjOf('especial',600,'linear-gradient(180deg,#4fd8ff,#8f7bff 45%,#ff7ac8)',`<div class="cab t">OFERTA ESPECIAL</div>${reloj(OF.especial.r)}
  <div style="position:absolute;left:0;right:0;top:70px;bottom:0;background:radial-gradient(circle at 50% 72%,#fff6b0 0,#ffcf5a 16%,#ff8ad0 40%,rgba(160,110,255,0) 70%)"></div>
  ${t3('malabares','left:0px;bottom:96px',560)}${t3('zurdito','left:230px;bottom:96px',560)}
  <div class="nombre t s" style="left:40px;bottom:130px;background:linear-gradient(#ffd24a,#ff9d00)">GINGA</div><div class="nombre t s" style="left:320px;bottom:130px;background:linear-gradient(#ffd24a,#ff9d00)">SIMÚN</div>
  <div class="t amarillo" style="position:absolute;right:28px;top:100px;font-size:26px;text-align:right">2 LEGENDARIOS<br>+ 300 GEMAS</div>`)}
 ${tarjOf('reina',420,'radial-gradient(circle at 50% 70%,#ffffff 0,#c8f2ff 22%,#6fc8ff 50%,#4a7bff 80%)',`<div class="rayo"></div><div class="cab t">¡NUEVA TITÁN!</div>${reloj(OF.reina.r)}
  ${t3('reina','left:50%;bottom:96px;transform:translateX(-50%)',580)}
  <div class="nombre t s" style="left:24px;bottom:130px;background:linear-gradient(#ffd24a,#ff9d00)">REINA</div>`)}
</div></div>
<div class="sec" id="sec-tit"><div class="sti t">TITANES</div><div class="cards">${['sangre','perro','valkiria'].map(titanCard).join('')}</div></div>
<div class="sec" id="sec-sob"><div class="sti t">SOBRES Y PODERES</div><div class="cards">
 <div class="of" style="width:400px;background:linear-gradient(180deg,#1a8a5a,#0b4a3a)" onclick="comprarPack('x5 SOBRES','sob','gema:149')"><div class="cab t">SOBRES</div>${reloj('4 d 2 h')}
  ${[0,1,2].map(i=>`<div class="flota" style="left:${60+i*80}px;top:${140+i*26}px;width:140px;height:196px;--r:${(i-1)*10}deg;animation-delay:-${i}s;border:3.5px solid #0a0d1c;border-radius:14px;background:linear-gradient(160deg,#ffd23a,#ff8a00);box-shadow:inset 0 0 0 6px rgba(255,255,255,.35)"><img src="a/logo.webp" style="width:120px;margin:56px auto 0"></div>`).join('')}
  <div class="t" style="position:absolute;left:0;right:0;bottom:126px;text-align:center;font-size:52px">x5</div><div class="precio t">${precioH('gema:149')}</div><div class="desc t s">-31%</div></div>
 <div class="of" style="width:380px;background:linear-gradient(180deg,#2a2f8a,#141a5a)" onclick="comprarPack('RAYO x10','pod','moneda:500')"><div class="cab t">PODER</div>${reloj('4 d 2 h')}
  <img src="a/pw/rayo.webp" style="position:absolute;left:50px;top:110px;width:280px;border:4px solid #0a0d1c;border-radius:18px;transform:rotate(-5deg);box-shadow:0 8px 0 #0a0d1c">
  <div class="nombre t s" style="left:110px;bottom:130px;background:linear-gradient(#45e08a,#14a85a)">RAYO x10</div><div class="precio t">${precioH('moneda:500')}</div></div>
</div></div>
<div class="sec" id="sec-gem"><div class="sti t">LOTES DE GEMAS</div><div class="cards"><div class="grid">
 ${pk('g','30',montonG(1),'$12.00')}${pk('g','80',montonG(2),'$29.00',null,'+5 extra')}${pk('g','170',montonG(3),'$59.00',['POPULAR','rojo'],'+15 extra')}
 ${pk('g','360',montonG(4),'$119.00',null,'+40 extra')}${pk('g','950',montonG(5),'$299.00',null,'+150 extra')}${pk('g','2000',montonG(6),'$589.00',['MEJOR VALOR','verde'],'+400 extra')}
</div></div></div>
<div class="sec" id="sec-mon"><div class="sti t">LOTES DE MONEDAS</div><div class="cards"><div class="grid" style="grid-template-columns:repeat(2,200px)">
 ${pk('m','150',montonM(2),'gema:20')}${pk('m','400',montonM(3),'gema:50',null,'+30 extra')}${pk('m','1200',montonM(4),'gema:140',['POPULAR','rojo'],'+150 extra')}${pk('m','2600',montonM(5),'gema:280',null,'+400 extra')}
</div></div></div>
<div class="sec" id="sec-ext"><div class="sti t">EXTRAS</div><div class="cards">
 <div class="of xp" onclick="comprarPack('DUPLICADOR DE XP','xp','gema:25')"><div class="cab t" style="font-size:30px">DUPLICADOR DE XP</div>
  <div class="flota t" style="left:50px;top:120px;width:190px;height:190px;border:4px solid #0a0d1c;border-radius:24px;background:linear-gradient(#fff,#cfe0ff);color:#0a0d1c;display:flex;align-items:center;justify-content:center;font-size:76px;-webkit-text-stroke:0;text-shadow:none;transform:rotate(-6deg)">XP<span style="color:#1f5bff;font-size:52px">x2</span></div>
  <div class="t s" style="position:absolute;left:20px;right:20px;top:340px;font-size:20px;text-align:center;line-height:1.3">Duplica los próximos 1,000 puntos de XP que ganes con las misiones.</div><div class="precio t">${precioH('gema:25')}</div></div>
 <div class="of cod" onclick="codigoCreador()"><div class="cab t" style="font-size:28px">APOYA A UN CREADOR</div>
  <div class="flota t" style="left:110px;top:120px;width:120px;height:120px;border:4px solid #0a0d1c;border-radius:24px;background:#fff;color:#1f5bff;display:flex;align-items:center;justify-content:center;font-size:80px;-webkit-text-stroke:0;text-shadow:none">C</div>
  <div class="t s" style="position:absolute;left:20px;right:20px;top:270px;font-size:20px;text-align:center;line-height:1.3">Apoya a tu creador de contenido favorito cuando hagas compras escribiendo su código.</div>
  <div class="precio t" style="background:linear-gradient(#5fa8ff,#1f5bff);box-shadow:inset 0 5px 0 rgba(255,255,255,.4),inset 0 -8px 0 #0d2f9c;font-size:32px">ESCRIBIR CÓDIGO</div></div>
</div></div><div style="flex:none;width:60px"></div>
</div></div>`,
entrar(el){const box=el.querySelector('.hs');if(!box)return;
  const cajas=[...el.querySelectorAll('.t3')],ids=[...new Set(cajas.map(c=>c.dataset.id))];
  Promise.all(ids.map(id=>VS3D.cargar(id,'l').catch(()=>null))).then(()=>{if(actual!=='tienda')return;
    VS3D.tarjetas(cajas.map(c=>({cv:c.querySelector('canvas'),id:c.dataset.id,tipo:'l',enc:'cuerpo'})));VS3D.arrancar();
    cajas.forEach(c=>{const im=c.querySelector('.previo');if(im)im.style.display='none';});});const secs=[...el.querySelectorAll('.sec')];
  box._on=x=>{let cur=secs[0].id;for(const s of secs)if(s.offsetLeft+x<300)cur=s.id;const k=cur.slice(4);el.querySelectorAll('.op').forEach(o=>o.classList.toggle('sel',o.dataset.sec===k));};},salir(){VS3D.parar();}};
window.irSec=k=>{const el=$('#s-tienda'),box=el&&el.querySelector('.hs'),s=el&&el.querySelector('#sec-'+k);if(box&&box._mover&&s)box._mover(-(s.offsetLeft-10));};
window.regalo=c=>{const p=c.querySelector('#regp');if(p.dataset.ya){toast('Vuelve mañana por otro regalo');return;}p.dataset.ya=1;p.textContent='¡RECLAMADO!';p.style.background='linear-gradient(#8a93b8,#5e6890)';
  celebra('¡REGALO DIARIO!',[{img:'a/i/moneda.webp',n:'x100'}]);};
window.comprarPack=(q,cls,precio,im2)=>{const real=/^\$/.test(precio);const img=im2||{g:'a/i/gema.webp',m:'a/i/moneda.webp',sob:'a/i/cartas.webp',pod:'a/pw/rayo.webp',xp:'a/i/experiencia.webp'}[cls]||'a/i/regalo.webp';
  ventana(`<h2 class="t">¿COMPRAR?</h2><div class="fl"><img src="${img}" style="${/\/pk\//.test(img)?'width:300px;animation:none':''}"></div><p style="font-size:34px" class="t">${q}${/^\d/.test(q)?(cls==='g'?' GEMAS':' MONEDAS'):''}</p>
   <div class="btn verde t s brillo" style="width:320px;height:90px;font-size:40px;margin:0 auto;gap:8px" onclick="this.closest('.velo').remove();celebra('¡COMPRA LISTA!',[{img:'${img}',n:'${q}'}])">${precioH(precio)}</div>
   ${real?'<p style="font-size:16px;opacity:.7;margin-top:14px">Prototipo: no se cobra nada.</p>':''}`,{ancho:620});};
window.codigoCreador=()=>ventana(`<h2 class="t">CÓDIGO DE CREADOR</h2><p>Escribe el código de tu creador favorito. Una parte de tus compras será para apoyarlo.</p>
 <div style="margin:0 auto 20px;width:420px;height:76px;border:3.5px solid #0a0d1c;border-radius:14px;background:#fff;color:#0a0d1c;display:flex;align-items:center;padding:0 18px;font-size:30px" class="t">LACASCARITA</div>
 <div class="btn verde t s" style="width:280px;height:80px;font-size:34px;margin:0 auto" onclick="this.closest('.velo').remove();toast('¡Gracias por apoyar a tu creador!')">APOYAR</div>`,{ancho:640});
// ---------- DETALLE DE OFERTA ----------
const CAPS={leon:[['a/m/a_leon_lobby1.glb.txt',3.05]],turbo:[['a/m/a_turbo_lobby1.glb.txt']]};
window.verOferta=k=>{window.OFERTA=k;ir('oferta');};
PANT.oferta={html:()=>{const o=OF[window.OFERTA||'especial'],n=o.tit.length,Q=Math.min(2,(devicePixelRatio||1)*SC),w=n>1?440:620,x0=n>1?470:500;
  return `<div class="fondo"></div><div class="sol"></div><div class="ciudad"></div><div class="piso"></div>${header('')}${reloj(o.r)}
<div class="izq"><div data-in="l"><div class="placa"><div class="nm t">${o.t}</div></div></div><div data-in="l" style="--d:1"><span class="sub t xs">${o.sub}</span></div><div class="lst" data-in="l" style="--d:2">${o.lst}</div></div>
${o.tit.map((id,i)=>`<div class="cen" style="left:${x0+i*(w-60)}px;width:${w}px"><div class="sombra"></div><img class="previo" src="${cuerpo(id)}"><canvas class="c3" data-i="${i}" width="${Math.round(w*Q)}" height="${Math.round(700*Q)}" style="width:${w}px;height:700px"></canvas></div>`).join('')}
<div class="inc" data-in="r"><div class="tt t s">INCLUIDO</div><div class="row">${o.its.map(([t,v],i)=>t==='t'?`<div class="it" style="animation-delay:-${i*.4}s;background:linear-gradient(#ffd24a,#ff8a1a)">${retrato(v)}<div class="l t xs">${PJI[v].n.toUpperCase()}</div></div>`:`<div class="it" style="animation-delay:-${i*.4}s"><img class="ic" src="${ICN[t]}"><div class="l t xs">${v} ${NIT[t]}</div></div>`).join('')}</div></div>
<div class="toca t xs">Arrastra para girar · toca para verlo en acción</div>
<div class="bots"><div class="btn azul t s" style="width:220px;height:92px;font-size:36px" data-in="u" onclick="verTitan('${o.tit[0]}')">PROBAR</div>
 <div style="position:relative" data-in="u"><div class="btn verde comprar t brillo" onclick="comprarOferta()">${o.a?`<s>${precioH(o.a)}</s>`:''}${precioH(o.p)}</div>${o.d?`<div class="dto t s">${o.d}</div>`:''}</div></div>`;},
entrar(el){const o=OF[window.OFERTA||'especial'],cvs=[...el.querySelectorAll('.c3')];
  Promise.all(o.tit.map(id=>VS3D.cargar(id,'u'))).then(()=>{if(actual!=='oferta')return;
    VS3D.tarjetas(o.tit.map((id,i)=>({cv:cvs[i],id,tipo:'u',enc:'cuerpo',efecto:true,girar:true,presenta:true})));VS3D.arrancar();
    el.querySelectorAll('.previo').forEach(p=>p.style.display='none');
    // los capitanes hacen su acción al entrar
    o.tit.forEach((id,i)=>{if(CAPS[id])setTimeout(()=>actual==='oferta'&&VS3D.accion(i,CAPS[id][0][0],CAPS[id][0][1]),1500);});}).catch(e=>console.warn(e));
  cvs.forEach((cv,i)=>{let s=0;cv.addEventListener('pointerdown',e=>{s=e.clientX+e.clientY;});cv.addEventListener('pointerup',e=>{if(Math.abs(e.clientX+e.clientY-s)<8){const id=o.tit[i];if(CAPS[id])VS3D.accion(i,CAPS[id][0][0],CAPS[id][0][1]);else VS3D.presenta(i);}});});},
salir(){VS3D.parar();}};
window.comprarOferta=()=>{const o=OF[window.OFERTA||'especial'];
  ventana(`<h2 class="t">${o.t}</h2><div class="fl">${o.tit.map(id=>`<img src="${cuerpo(id)}" style="width:150px;height:200px;object-fit:contain">`).join('')}</div><p>${o.its.map(([t,v])=>t==='t'?PJI[v].n:`${v} ${NIT[t].toLowerCase()}`).join(' · ')}</p>
   <div class="btn verde t s brillo" style="width:340px;height:92px;font-size:42px;margin:0 auto;gap:10px" onclick="this.closest('.velo').remove();celebra('¡ES TUYO!',${JSON.stringify(o.its.map(([t,v])=>t==='t'?{img:cuerpo(v),n:PJI[v].n.toUpperCase()}:{img:ICN[t],n:v+' '+NIT[t]})).replace(/"/g,'&quot;')})">${precioH(o.p)}</div>
   ${/^\$/.test(o.p)?'<p style="font-size:16px;opacity:.7;margin-top:14px">Prototipo: no se cobra nada.</p>':''}`,{ancho:720});};
})();
