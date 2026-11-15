// ===== PERSONAJES · NUEVO PERSONAJE · CAMINO DE TROFEOS =====
(function(){
const css=`
#s-personajes .fondo{--bg:linear-gradient(160deg,#2a7bff,#1846d8)}
#s-personajes .dest{position:absolute;left:30px;top:140px;width:470px;height:730px;border:3px solid var(--ink);border-radius:20px;overflow:hidden;background:radial-gradient(circle at 50% 60%,#d58bff,#8b2be0 50%,#4a12a0);box-shadow:0 9px 0 var(--ink);transform:rotate(-1.5deg)}
#s-personajes .dest::before{content:'';position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 65%,rgba(255,255,255,.09) 0 7deg,transparent 7deg 20deg);animation:gira 60s linear infinite}
#s-personajes .dest .tt{position:absolute;left:24px;top:20px;font-size:46px;z-index:2}
#s-personajes .dest .pb{position:absolute;left:24px;right:24px;top:132px;height:46px;border:3px solid var(--ink);border-radius:12px;background:#1a0b40;z-index:2;overflow:hidden}
#s-personajes .dest .pb i{position:absolute;inset:0;width:38%;background:linear-gradient(#5ce1ff,#1f9bff);box-shadow:inset 0 4px 0 rgba(255,255,255,.4)}
#s-personajes .dest .pb span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px}
#s-personajes .dest .ya{position:absolute;left:0;right:0;bottom:0;height:120px;border-top:5px solid var(--ink);background:linear-gradient(#2ff0b8,#10c48d);box-shadow:inset 0 -8px 0 #0a8a62;display:flex;align-items:center;justify-content:center;gap:10px;font-size:48px;z-index:3}
#s-personajes .dest .ya img{width:64px}
#s-personajes .hs{position:absolute;left:530px;right:0;top:130px;bottom:20px}
#s-personajes .track{gap:22px;padding:20px 60px 20px 10px;height:100%}
#s-personajes .col{display:grid;grid-template-rows:repeat(3,1fr);gap:20px;flex:none}
#s-personajes .sec{position:absolute;top:-6px;font-size:30px;white-space:nowrap}
#s-personajes .pc{position:relative;width:236px;height:220px;border:3.5px solid var(--ink);border-radius:16px;overflow:hidden;cursor:pointer;background:var(--rc2);box-shadow:0 7px 0 var(--ink);transition:transform .12s}
#s-personajes .pc:active{transform:scale(.95)}
#s-personajes .pc .pie{position:absolute;left:0;right:0;bottom:0;height:52px;background:linear-gradient(transparent,rgba(5,8,30,.92) 40%);display:flex;align-items:flex-end;padding:0 10px 8px;font-size:28px}
#s-personajes .pc .nv{position:absolute;right:8px;top:8px;width:46px;height:46px;border-radius:50%;border:3px solid var(--ink);background:radial-gradient(circle at 35% 30%,#d58bff,#8b2be0 70%);display:flex;align-items:center;justify-content:center;font-size:24px;z-index:2}
#s-personajes .pc .rb{position:absolute;left:0;top:0;bottom:0;width:10px;background:var(--rc);z-index:2}
#s-personajes .pc .tro{position:absolute;left:12px;top:10px;display:flex;align-items:center;gap:4px;font-size:22px;z-index:2;padding:2px 10px 2px 4px;background:rgba(5,8,30,.75);border-radius:8px}
#s-personajes .pc .tro img{width:30px;height:30px}
#s-personajes .pc .cu{position:absolute;inset:0;overflow:hidden;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.45),transparent 60%)}
#s-personajes .pc .cu img{position:absolute;left:50%;top:auto;bottom:-140px;transform:translateX(-50%);filter:drop-shadow(0 4px 0 rgba(0,0,0,.25))}
#s-personajes .pc.lock>div:first-child{filter:grayscale(.85) brightness(.55)}
#s-personajes .pc.lock .cand{position:absolute;left:10px;top:8px;width:52px;height:52px;z-index:2}
#s-personajes .pc.lock .pr{position:absolute;right:8px;bottom:8px;display:flex;align-items:center;gap:4px;font-size:26px;z-index:2}
#s-personajes .pc.lock .pr img{width:34px}
#s-nuevo .fondo{--bg:radial-gradient(circle at 30% 55%,#d58bff,#8b2be0 40%,#3a0a80 100%);--motivo:url(a/corona.png)}
#s-nuevo .rayos{position:absolute;left:420px;top:520px;width:2400px;height:2400px;margin:-1200px 0 0 -1200px;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.16) 0 7deg,transparent 7deg 18deg);animation:gira 30s linear infinite}
#s-nuevo .halo{position:absolute;left:120px;top:220px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.75),rgba(255,220,255,.0) 65%);animation:halo 2.2s ease-in-out infinite}
@keyframes halo{50%{transform:scale(1.08);opacity:.8}}
#s-nuevo .fx{position:absolute;inset:0;background:#fff;animation:destello .9s ease-out both;z-index:9;pointer-events:none}
@keyframes destello{0%{opacity:1}100%{opacity:0}}
#s-nuevo .pj{position:absolute;left:420px;bottom:60px;width:0;display:flex;justify-content:center}
#s-nuevo .pj img{position:absolute;left:0;margin-left:-50%;bottom:0;height:660px;animation:aparece 1s cubic-bezier(.2,1.6,.4,1) .25s both;filter:drop-shadow(0 12px 0 rgba(0,0,0,.3))}
@keyframes aparece{0%{transform:scale(.2) translateY(200px);opacity:0}60%{opacity:1}100%{transform:none}}
#s-nuevo .info{position:absolute;left:905px;right:60px;top:170px}
#s-nuevo .rar{display:inline-flex;transform:skewX(-10deg);border:3px solid var(--ink);box-shadow:0 5px 0 var(--ink)}
#s-nuevo .rar span{padding:10px 22px;font-size:34px}
#s-nuevo .nom{font-size:150px;margin-top:20px;transform:skewX(-4deg);--sw:14px;--sd:10px}
#s-nuevo .desc{font-size:40px;margin-top:22px;color:var(--oro);line-height:1.2}
#s-nuevo .stats{display:flex;gap:16px;margin-top:30px}
#s-nuevo .stat{width:140px;padding:14px 0;text-align:center}
#s-nuevo .stat img{width:58px;margin:0 auto 6px}
#s-nuevo .stat .v{font-size:40px}
#s-nuevo .cont{position:absolute;right:60px;bottom:50px;width:360px;height:110px;font-size:44px}
#s-nuevo .conf{position:absolute;width:16px;height:28px;border:3px solid var(--ink);border-radius:4px;animation:cae var(--t) linear infinite;animation-delay:var(--dl);z-index:8}
@keyframes cae{0%{transform:translate(0,-80px) rotate(0)}100%{transform:translate(var(--x),1000px) rotate(720deg)}}
#s-camino .fondo{--bg:linear-gradient(180deg,#5fd0ff 0%,#2a8bff 50%,#1d5ae0 100%);--motivo:none}
#s-camino .nube{position:absolute;height:60px;border-radius:40px;background:#fff;opacity:.85;box-shadow:40px -24px 0 6px #fff,90px 0 0 0 #fff}
#s-camino .hs{position:absolute;left:0;right:0;top:110px;bottom:120px}
#s-camino .track{height:100%;position:relative}
#s-camino .mundo{position:relative;height:100%;width:4200px}
#s-camino .via{position:absolute;left:0;right:0;top:390px;height:64px;background:linear-gradient(#ffdf6a,#ffb21a);border-top:6px solid var(--ink);border-bottom:6px solid var(--ink);box-shadow:0 10px 0 rgba(0,0,0,.25)}
#s-camino .via i{position:absolute;left:0;top:0;bottom:0;width:var(--p);background:linear-gradient(#ff8a3c,#ff5a1a);box-shadow:inset 0 5px 0 rgba(255,255,255,.35)}
#s-camino .pasto{position:absolute;left:0;right:0;top:470px;bottom:0;background:linear-gradient(#58d04a,#2fa82a);border-top:6px solid var(--ink)}
#s-camino .pasto::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 120px,transparent 120px 240px)}
#s-camino .nodo{position:absolute;top:258px;width:150px;margin-left:-75px;text-align:center}
#s-camino .nodo .bola{width:130px;height:130px;margin:0 auto;border-radius:50%;border:3px solid var(--ink);background:radial-gradient(circle at 35% 30%,#ffffff,#d8e4ff 60%,#9fb6ff);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 0 var(--ink)}
#s-camino .nodo .bola img{width:96px;height:96px}
#s-camino .nodo .base{width:110px;height:44px;margin:24px auto 0;border-radius:50%;border:3.5px solid var(--ink);background:linear-gradient(#ffe25a,#ffbe1a);display:flex;align-items:center;justify-content:center;font-size:24px}
#s-camino .nodo.ok .bola{filter:saturate(.5)}#s-camino .nodo.ok .ck{position:absolute;left:70px;top:60px;width:80px}
#s-camino .nodo .lb{position:absolute;left:50%;top:-74px;transform:translateX(-50%) skewX(-8deg);padding:8px 16px;background:linear-gradient(#5fd6ff,#1f8bff);border:3px solid var(--ink);border-radius:10px;font-size:22px;white-space:nowrap;box-shadow:0 5px 0 var(--ink)}
#s-camino .nodo .recl{position:absolute;left:50%;top:222px;width:200px;height:70px;margin-left:-100px;font-size:28px;animation:latido 1.2s ease-in-out infinite}
#s-camino .arena{position:absolute;top:-6px;width:330px;margin-left:-165px;text-align:center}
#s-camino .arena img{width:330px;filter:drop-shadow(0 18px 10px rgba(0,0,0,.35));animation:flota 6s ease-in-out infinite}
#s-camino .arena .t{font-size:30px;margin-top:-30px}
#s-camino .yo{position:absolute;top:350px;width:110px;height:110px;margin-left:-55px;border:3px solid var(--ink);border-radius:50%;overflow:hidden;background:#1d3fc0;box-shadow:0 0 0 6px #fff,0 8px 0 6px var(--ink);z-index:3}
#s-camino .yo img{width:100%}
#s-camino .sig{position:absolute;right:30px;bottom:18px;width:470px;height:170px;display:flex;align-items:center;gap:16px;padding:0 20px;z-index:4;background:linear-gradient(120deg,#3a2aa8,#1d1670);transform:skewX(-6deg)}
#s-camino .sig>*{transform:skewX(6deg)}
#s-camino .sig img{width:160px;margin-top:-40px;filter:drop-shadow(0 8px 6px rgba(0,0,0,.5))}
#s-camino .chips{position:absolute;left:30px;bottom:24px;display:flex;gap:10px;z-index:4}
#s-camino .chips .c{width:92px;height:92px;border:3px solid var(--ink);border-radius:50%;overflow:hidden;background:#1d3fc0;box-shadow:0 5px 0 var(--ink)}
#s-camino .chips .c img{width:100%;height:100%;object-fit:cover}
#s-camino .chips .c.no img{filter:grayscale(1) brightness(.5)}
#s-camino .chips .c.sel{box-shadow:0 0 0 5px #ffd23a,0 5px 0 5px var(--ink)}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const tarjeta=(p,i)=>{const mio=MIOS.includes(p.id);return `<div class="pc r-${p.r} ${mio?'':'lock'}" data-in="s" style="--d:${Math.min(i,14)}" onclick="verTitan('${p.id}')">
 <div class="cu"><img src="${cuerpo(p.id)}" style="height:${Math.round(330*(ESTATURA[p.id]||1))}px"></div><div class="rb"></div>
 ${mio?`<div class="tro t xs"><img src="a/i/trofeo.webp">${[78,12,8,5,0][MIOS.indexOf(p.id)]}</div><div class="nv t xs">${[5,2,1,1,1][MIOS.indexOf(p.id)]}</div>`:`<div class="cand">${ICO.candado}</div><div class="pr t s"><img src="a/i/gema.webp">${{comun:29,rara:79,epica:169,legendaria:349}[p.r]}</div>`}
 <div class="pie t s">${p.n.toUpperCase()}</div></div>`;};
PANT.personajes={html:()=>{const mios=PJ.filter(p=>MIOS.includes(p.id)),otros=PJ.filter(p=>!MIOS.includes(p.id));const cols=[];const todos=[...mios,...otros];
 for(let i=0;i<todos.length;i+=3)cols.push(todos.slice(i,i+3));
 return `<div class="fondo"></div>${header('TITANES',{mid:'<div class="t s celeste" style="font-size:28px;margin-left:20px;margin-top:8px" data-in="d">5 / 27</div>'})}
<div class="dest" data-in="l"><div class="tt t">DESBLOQUEO<br>ESPECIAL</div><div class="pb"><i></i><span class="t xs">38 / 100 FICHAS</span></div>
 <img src="${cuerpo('reina')}" style="position:absolute;left:10px;bottom:110px;height:430px;filter:drop-shadow(0 8px 0 rgba(0,0,0,.3))">
 <img src="${cuerpo('nebula')}" style="position:absolute;left:190px;bottom:110px;height:450px;filter:drop-shadow(0 8px 0 rgba(0,0,0,.3))">
 <div class="ya t" onclick="nuevoPJ('nebula')"><span class="t xs" style="font-size:22px">YA:</span><img src="a/i/gema.webp">349</div></div>
<div class="hs"><div class="track">${cols.map((c,i)=>`<div class="col">${c.map((p,j)=>tarjeta(p,i*3+j)).join('')}</div>`).join('')}</div></div>`;}};
window.nuevoPJ=id=>{window.PJNUEVO=id;ir('nuevo');};
PANT.nuevo={html:()=>{const p=PJI[window.PJNUEVO||'leon'];const col={comun:['#9fd0ff','#3f7fd0','#1a3f86'],rara:['#7dffb5','#1fc16b','#0b6a3a'],epica:['#d58bff','#8b2be0','#3a0a80'],legendaria:['#ffe27a','#ffa51a','#a85200']}[p.r];
 return `<div class="fondo" style="--bg:radial-gradient(circle at 30% 55%,${col[0]},${col[1]} 40%,${col[2]} 100%)"></div><div class="rayos"></div><div class="halo"></div>
 ${Array.from({length:28},(_,i)=>`<i class="conf" style="left:${Math.random()*1600}px;top:0;background:${['#ffd23a','#5fe33a','#ff4b3e','#5fc8ff','#fff','#b04dff'][i%6]};--t:${2.5+Math.random()*2.5}s;--dl:-${Math.random()*4}s;--x:${(Math.random()-.5)*300}px"></i>`).join('')}
 <div class="pj"><img src="${cuerpo(p.id)}"></div>
 <div class="info"><div class="t s" style="font-size:36px;color:#fff;--d:4" data-in="f" >¡NUEVO TITÁN!</div>
  <div class="rar" data-in="l" style="--d:6"><span class="t s" style="background:linear-gradient(#5fe33a,#25b51c)">${p.pos}</span><span class="t s" style="background:var(--ink);color:var(--${p.r})">${RARN[p.r]}</span></div>
  <div class="nom t" data-in="s" style="--d:8">${p.n.toUpperCase()}</div>
  <div class="desc t s" data-in="u" style="--d:10">${p.t}.</div>
  <div class="stats">${[['velocidad',78],['fuerza',86],['super-tiro',90]].map(([k,v],i)=>`<div class="pan stat" data-in="u" style="--d:${12+i}">${I(k)}<div class="v t" data-count="${v}" data-delay="900">${v}</div></div>`).join('')}</div></div>
 <div class="btn azul cont t" data-go="personajes" data-in="u" style="--d:16">CONTINUAR</div><div class="fx"></div>`;}};
// camino de trofeos
const PREM=[[20,'moneda','x50'],[40,'gema','x10'],[60,'regalo','SOBRE'],[100,'moneda','x100'],[140,'super-tiro','PODER'],[200,'gema','x20'],[250,'regalo','SOBRE'],[350,'moneda','x200'],[450,'gema','x30'],[550,'regalo','SOBRE ÉPICO'],[700,'moneda','x300'],[850,'gema','x50'],[1000,'regalo','LEGENDARIO']];
const X=t=>t<=0?200:200+Math.sqrt(t)*112;
PANT.camino={html:()=>`<div class="fondo"></div>${header('CAMINO DE TROFEOS',{mid:`<div class="t" style="font-size:40px;display:flex;align-items:center;gap:6px;margin-left:16px" data-in="d"><img src="a/i/trofeo.webp" style="width:56px">78</div>`})}
<div class="hs" data-start="0"><div class="track"><div class="mundo">${[[120,40,140],[900,70,110],[1500,20,160],[2300,60,130],[3100,30,150],[3800,70,120]].map(([x,y,w])=>`<i class="nube" style="left:${x}px;top:${y}px;width:${w}px"></i>`).join('')}
 <div class="pasto"></div><div class="via" style="--p:${X(78)}px"><i></i></div>
 ${ARENAS.slice(0,5).map(([a,n,t],i)=>`<div class="arena" style="left:${i?X(t):420}px;top:-24px;--d:${i}" data-in="d"><img src="a/ar/${a}.webp"><div class="t s">${n.toUpperCase()}</div></div>`).join('')}
 ${PREM.map(([t,ic,l],i)=>`<div class="nodo ${t<=40?'ok':''}" style="left:${X(t)}px;--d:${i+2}" data-in="s"><div class="lb t xs">${l}</div><div class="bola">${I(ic)}</div>${t<=40?`<div class="ck">${ICO.palomita}</div>`:''}<div class="base t xs">${t}</div>${t===60?'<div class="btn recl t s" onclick="event.stopPropagation();toast(\'¡Reclamado!\')">RECLAMAR</div>':''}</div>`).join('')}
 <div class="yo" style="left:${X(78)}px">${I('avatar-leon')}</div>
</div></div></div>
<div class="chips">${ARENAS.map(([a],i)=>`<div class="c ${i===0?'sel':''} ${i>0?'no':''}" data-in="u" style="--d:${i}"><img src="a/ar/${a}.webp"></div>`).join('')}</div>
<div class="pan sig" data-in="r" style="--d:4"><img src="a/ar/a1.webp"><div><div class="sub" style="font-size:18px;color:#ffcf6a">SIGUIENTE ARENA</div><div class="t" style="font-size:34px;margin-top:6px">BOSQUE<br>ENCANTADO</div><div class="t s celeste" style="font-size:24px;margin-top:6px">300 TROFEOS</div></div></div>`};
})();
