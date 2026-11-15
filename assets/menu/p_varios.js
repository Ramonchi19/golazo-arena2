// ===== NOTICIAS · AJUSTES · RANKING · FESTEJOS =====
(function(){
const css=`
#s-noticias .fondo{--bg:linear-gradient(160deg,#6a3aff,#3a1ac0 60%,#26108a)}
#s-noticias .tabs{position:absolute;left:300px;top:20px;display:flex;gap:10px;z-index:6}
#s-noticias .tb{height:70px;padding:0 28px;font-size:28px;transform:skewX(-8deg)}#s-noticias .tb>*{transform:skewX(8deg)}
#s-noticias .car{position:absolute;left:60px;top:140px;width:960px;height:480px;border:3px solid var(--ink);border-radius:20px;overflow:hidden;box-shadow:0 9px 0 var(--ink)}
#s-noticias .sl{position:absolute;inset:0;opacity:0;transition:opacity .5s,transform .6s;transform:scale(1.04)}
#s-noticias .sl.on{opacity:1;transform:none}
#s-noticias .sl .cap{position:absolute;left:50%;bottom:44px;transform:translateX(-50%) skewX(-6deg);padding:14px 30px;background:linear-gradient(#ffe25a,#ffbe1a);border:3.5px solid var(--ink);border-radius:14px;font-size:40px;white-space:nowrap;box-shadow:inset 0 -7px 0 #c27a00,0 6px 0 var(--ink)}
#s-noticias .dots{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:8px;z-index:3}
#s-noticias .dots i{width:40px;height:10px;border-radius:5px;background:rgba(255,255,255,.4)}#s-noticias .dots i.on{background:#fff}
#s-noticias .lado{position:absolute;left:1060px;right:60px;top:140px;height:480px;overflow:hidden}
#s-noticias .lado .img{height:270px;position:relative;overflow:hidden;border-bottom:5px solid var(--ink)}
#s-noticias .nc{position:absolute;top:660px;height:220px;display:flex;overflow:hidden}
#s-noticias .nc .img{width:200px;position:relative;overflow:hidden;border-right:5px solid var(--ink)}
#s-noticias .cat{font-size:20px;color:#d58bff}
#s-ajustes .fondo{--bg:linear-gradient(160deg,#2a7bff,#1846d8)}
#s-ajustes .zona{position:absolute;left:160px;right:160px;top:150px}
#s-ajustes .sl{display:flex;align-items:center;gap:22px;margin-bottom:34px}
#s-ajustes .sl .ic{width:96px;height:96px;transform:rotate(45deg);border:3.5px solid var(--ink);border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 0 var(--ink)}
#s-ajustes .sl .ic img,#s-ajustes .sl .ic svg{width:70px;transform:rotate(-45deg)}
#s-ajustes .riel{flex:1;height:80px;position:relative;border-radius:14px}
#s-ajustes .riel .lb{position:absolute;left:0;right:0;top:-40px;text-align:center;font-size:30px}
#s-ajustes .riel .lleno{position:absolute;left:0;top:0;bottom:0;width:var(--v);border-radius:14px;background:linear-gradient(#7cf04a,#3fcb27);box-shadow:inset 0 -7px 0 #178a10,inset 0 3px 0 rgba(255,255,255,.5)}
#s-ajustes .riel .per{position:absolute;top:-8px;left:calc(var(--v) - 90px);width:180px;height:96px}
#s-ajustes .riel .per svg{width:96px}
#s-ajustes .opts{display:grid;grid-template-columns:repeat(5,1fr);gap:24px;margin-top:40px}
#s-ajustes .opts .btn{height:108px;font-size:28px;text-align:center;line-height:1.1;padding:0 10px}
#s-ajustes .opts .lbl{grid-column:span 1;text-align:center;font-size:24px;color:#cfe0ff;margin-bottom:-14px}
#s-ajustes .sw.gfx div{font-size:20px}
#s-ajustes .sw{display:flex;border:3px solid var(--ink);border-radius:14px;overflow:hidden;height:80px;box-shadow:0 6px 0 var(--ink)}
#s-ajustes .sw div{flex:1;display:flex;align-items:center;justify-content:center;font-size:32px;background:#2a376b;cursor:pointer}
#s-ajustes .sw div.on{background:linear-gradient(#7cf04a,#3fcb27);box-shadow:inset 0 -6px 0 #178a10}
#s-ranking .fondo{--bg:linear-gradient(160deg,#4a8bff,#1f5bff 50%,#1638c0)}
#s-ranking .izq{position:absolute;left:40px;top:140px;width:520px}
#s-ranking .seg{display:flex;transform:skewX(-8deg);margin-bottom:26px}
#s-ranking .seg .btn{flex:1;height:96px;font-size:32px;border-radius:0}
#s-ranking .seg .btn:first-child{border-radius:14px 0 0 14px}#s-ranking .seg .btn:last-child{border-radius:0 14px 14px 0}
#s-ranking .seg .btn>*{transform:skewX(8deg)}
#s-ranking .seg img{width:56px;height:56px}
#s-ranking .lista{position:absolute;left:600px;right:40px;top:130px;bottom:24px;padding:14px;overflow:hidden}
#s-ranking .row{height:88px;margin-bottom:10px;display:flex;align-items:center;gap:16px;padding:0 20px 0 10px;border:3px solid var(--ink);border-radius:14px;background:linear-gradient(#5a6aa3,#46558f);box-shadow:inset 0 -6px 0 rgba(0,0,0,.25),0 5px 0 rgba(0,0,0,.4)}
#s-ranking .pos{width:66px;height:66px;display:flex;align-items:center;justify-content:center;font-size:34px}
#s-ranking .med{border:3px solid var(--ink);border-radius:50%;box-shadow:inset 0 -5px 0 rgba(0,0,0,.25)}
#s-ranking .av{width:68px;height:68px;border:3px solid var(--ink);border-radius:12px;overflow:hidden;position:relative;background:#1d3fc0}
#s-ranking .n{flex:1}#s-ranking .n .t{font-size:30px}#s-ranking .n .c{font-size:19px;color:#cfe0ff;margin-top:4px}
#s-ranking .tr{display:flex;align-items:center;gap:8px;font-size:34px;width:220px;justify-content:flex-end}
#s-ranking .tr img{width:48px}
#s-ranking .yo{position:absolute;left:14px;right:14px;bottom:14px;background:linear-gradient(#ffb04a,#ff7a1a);box-shadow:inset 0 -7px 0 #b84a00,0 -10px 30px rgba(0,0,0,.4)}
#s-festejos .fondo{--bg:linear-gradient(160deg,#2a7bff,#1846d8)}
#s-festejos .izq{position:absolute;left:50px;top:150px;width:700px}
#s-festejos .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
#s-festejos .ra{height:150px;border-radius:18px;background:rgba(255,255,255,.12);border:4px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer}
#s-festejos .ra.sel{border:5px solid #fff;background:rgba(5,10,40,.45)}
#s-festejos .ra svg{width:120px;height:120px;filter:drop-shadow(0 6px 0 rgba(0,0,0,.35));transition:transform .2s}
#s-festejos .ra:active svg{transform:scale(1.2) rotate(-8deg)}
#s-festejos .der{position:absolute;left:800px;right:50px;top:140px;bottom:30px;padding:18px}
#s-festejos .cats{display:flex;gap:10px;padding:10px;background:var(--ink);border-radius:14px;margin-bottom:18px}
#s-festejos .cats div{width:80px;height:70px;border-radius:12px;display:flex;align-items:center;justify-content:center}
#s-festejos .cats div.on{background:linear-gradient(#3d8bff,#1f5bff)}
#s-festejos .cats svg{width:54px;height:54px}
#s-festejos .hdr{height:50px;border-radius:10px;background:rgba(5,10,40,.4);display:flex;align-items:center;padding:0 16px;font-size:28px;margin:14px 0}
#s-festejos .g2{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
#s-festejos .g2 svg{width:100px;height:100px;margin:0 auto;filter:drop-shadow(0 5px 0 rgba(0,0,0,.35))}
#s-festejos .g2 .lk{position:relative}#s-festejos .g2 .lk svg{filter:grayscale(1) brightness(.6)}
#s-festejos .g2 .lk i{position:absolute;right:6px;bottom:0;width:40px;height:40px}
#s-festejos .g2 .lk i svg{width:40px;height:40px;filter:none}
#s-festejos .pre{position:absolute;left:50px;bottom:40px;width:700px;height:200px;display:flex;align-items:center;gap:20px;padding:0 20px}
#s-festejos .pre img{height:250px;margin-top:-90px}
#s-festejos .burb{position:relative;padding:14px;background:#fff;border:3.5px solid var(--ink);border-radius:20px;animation:latido 1.4s ease-in-out infinite}
#s-festejos .burb svg{width:110px;height:110px}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
// balón con cara (reacciones propias)
window.CARA=(tipo,col='#fff')=>{const ojos={feliz:'<path d="M37 47q5-7 10 0M63 47q5-7 10 0" stroke="#0a0d1c" stroke-width="5" fill="none" stroke-linecap="round"/>',
 triste:'<circle cx="42" cy="48" r="5" fill="#0a0d1c"/><circle cx="68" cy="48" r="5" fill="#0a0d1c"/><path d="M34 40l14-4M76 40l-14-4" stroke="#0a0d1c" stroke-width="5" stroke-linecap="round"/><path d="M40 82q15 8 30 0" stroke="#0a0d1c" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(180 55 80)"/><path d="M72 56q4 10 0 14q-4-4 0-14" fill="#5fc8ff" stroke="#0a0d1c" stroke-width="3"/>',
 enojado:'<path d="M32 38l18 8M78 38l-18 8" stroke="#0a0d1c" stroke-width="6" stroke-linecap="round"/><circle cx="43" cy="52" r="5" fill="#0a0d1c"/><circle cx="67" cy="52" r="5" fill="#0a0d1c"/><rect x="38" y="68" width="34" height="14" rx="4" fill="#fff" stroke="#0a0d1c" stroke-width="5"/><path d="M47 68v14M55 68v14M63 68v14" stroke="#0a0d1c" stroke-width="3"/>',
 risa:'<path d="M35 46q7-8 13 0M62 46q7-8 13 0" stroke="#0a0d1c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 62h42q-4 24-21 24t-21-24z" fill="#8a1a1a" stroke="#0a0d1c" stroke-width="5" stroke-linejoin="round"/><path d="M45 79q10-6 20 0" fill="#ff7a7a"/>',
 guino:'<circle cx="43" cy="49" r="6" fill="#0a0d1c"/><path d="M62 49h14" stroke="#0a0d1c" stroke-width="6" stroke-linecap="round"/><path d="M40 68q15 12 30 0" stroke="#0a0d1c" stroke-width="5" fill="none" stroke-linecap="round"/>',
 lentes:'<path d="M28 44h54" stroke="#0a0d1c" stroke-width="5"/><rect x="31" y="42" width="22" height="14" rx="5" fill="#0a0d1c"/><rect x="57" y="42" width="22" height="14" rx="5" fill="#0a0d1c"/><path d="M42 72q13 6 26-2" stroke="#0a0d1c" stroke-width="5" fill="none" stroke-linecap="round"/>',
 wow:'<circle cx="43" cy="47" r="7" fill="#fff" stroke="#0a0d1c" stroke-width="4"/><circle cx="67" cy="47" r="7" fill="#fff" stroke="#0a0d1c" stroke-width="4"/><circle cx="43" cy="48" r="3" fill="#0a0d1c"/><circle cx="67" cy="48" r="3" fill="#0a0d1c"/><ellipse cx="55" cy="75" rx="8" ry="10" fill="#8a1a1a" stroke="#0a0d1c" stroke-width="5"/>',
 gol:'<path d="M35 46q7-8 13 0M62 46q7-8 13 0" stroke="#0a0d1c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M38 62h34q-3 18-17 18t-17-18z" fill="#8a1a1a" stroke="#0a0d1c" stroke-width="5"/><path d="M90 20l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#ffd23a" stroke="#0a0d1c" stroke-width="3"/>'}[tipo];
 return `<svg viewBox="0 0 110 110"><circle cx="55" cy="58" r="44" fill="${col}" stroke="#0a0d1c" stroke-width="6"/><path d="M55 18l9 7-3 10H49l-3-10zM18 50l8-4 7 6-2 10-9 2zM92 50l-8-4-7 6 2 10 9 2z" fill="#22284a" opacity=".22"/>${ojos}</svg>`;};
const NOT=[['a7','¡TEMPORADA DEL VOLCÁN!','leon'],['a3','LLEGA LA PLAYA PIRATA','cazador'],['a5','NUEVA LEGENDARIA: REINA','reina']];
let tmr=0;
PANT.noticias={html:()=>`<div class="fondo"></div>${header('',{sinDinero:true})}
<div class="tabs" data-in="d"><div class="btn tb t s"><span>NOVEDADES</span></div><div class="btn gris tb t s"><span>CREADORES</span></div><div class="btn gris tb t s"><span>TORNEOS</span><div class="tag t xs" style="right:-20px;top:-18px">NUEVO</div></div></div>
<div class="car" data-in="l">${NOT.map(([a,c,p],i)=>`<div class="sl ${i?'':'on'}" style="background:radial-gradient(circle at 70% 40%,#ffcf6a,#ff6a3a 40%,#5a1a8a)">
 <div style="position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 70% 45%,rgba(255,255,255,.1) 0 7deg,transparent 7deg 20deg)"></div>
 <img src="a/ar/${a}.webp" style="position:absolute;right:30px;top:20px;width:430px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.4))">
 <img src="${cuerpo(p)}" style="position:absolute;left:120px;bottom:-60px;height:540px;filter:drop-shadow(0 8px 0 rgba(0,0,0,.3))">
 <div class="cap t">${c}</div></div>`).join('')}<div class="dots">${NOT.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div></div>
<div class="pan lado" data-in="r" style="--d:2"><div class="img" style="background:linear-gradient(160deg,#5fe33a,#1a8a3a)"><img src="a/logo.webp" style="position:absolute;left:50%;top:50%;width:330px;transform:translate(-50%,-50%) rotate(-4deg)"><div class="tag oro t xs" style="right:12px;top:12px">NUEVO</div></div>
 <div style="padding:18px 22px"><div style="display:flex;justify-content:space-between"><span class="cat t xs" style="color:#ffcf3a">ACTUALIZACIÓN</span><span class="sub">HACE 2 DÍAS</span></div><div class="t s" style="font-size:34px;margin-top:12px;line-height:1.1">NOTAS DE LA VERSIÓN 2.3</div></div></div>
${[['a5','COMUNIDAD','¡VOTA POR LA PRÓXIMA ARENA!','nebula',60],['a1','VIDEO','CORTO: EL ORIGEN DE KRAGOR','vikingo',600]].map(([a,c,t,p,x],i)=>`<div class="pan nc" style="left:${x}px;width:500px;--d:${3+i}" data-in="u" ><div class="img" style="background:radial-gradient(circle,#7fd0ff,#2a5bd0)"><img src="${retrato?'a/c/'+p+'.webp':''}" style="width:100%;height:100%;object-fit:cover;object-position:50% 0"></div><div style="padding:18px"><div class="cat t xs">${c}</div><div class="t s" style="font-size:30px;margin-top:10px;line-height:1.1">${t}</div></div></div>`).join('')}
<div style="position:absolute;left:1150px;top:680px;text-align:center;--d:5" data-in="u" ><div class="t" style="font-size:44px">SÍGUENOS</div><div style="display:flex;gap:16px;margin-top:18px">${['▶','◎','✕'].map(s=>`<div class="btn azul t" style="width:96px;height:96px;border-radius:50%;font-size:40px">${s}</div>`).join('')}</div></div>`,
entrar(el){let k=0;clearInterval(tmr);tmr=setInterval(()=>{const s=el.querySelectorAll('.sl'),d=el.querySelectorAll('.dots i');if(!s.length)return;s[k].classList.remove('on');d[k].classList.remove('on');k=(k+1)%s.length;s[k].classList.add('on');d[k].classList.add('on');},3200);},
salir(){clearInterval(tmr);}};
PANT.ajustes={html:()=>`<div class="fondo"></div>${header('AJUSTES',{sinDinero:true})}
<div class="zona">
 ${[['sonido','EFECTOS DE SONIDO','80%'],['nota','MÚSICA','62%']].map(([ic,l,v],i)=>`<div class="sl" data-in="l" style="--d:${i}"><div class="ic">${ic==='nota'?ICO.nota:I(ic)}</div><div class="riel hueco" style="--v:${v}"><div class="lb t s">${l}</div><div class="lleno"></div><div class="btn verde per">${ICO.flechas}</div></div></div>`).join('')}
 <div class="opts">
  ${[['VIBRACIÓN',1],['SOMBRAS',1],['MODO ZURDO',0],['MEDIDOR FPS',0]].map(([l,on],i)=>`<div data-in="u" style="--d:${2+i}"><div class="lbl t xs" style="margin-bottom:10px">${l}</div><div class="sw t s" onclick="this.querySelectorAll('div').forEach(d=>d.classList.toggle('on'))"><div class="${on?'on':''}">SÍ</div><div class="${on?'':'on'}">NO</div></div></div>`).join('')}
  <div data-in="u" style="--d:6"><div class="lbl t xs" style="margin-bottom:10px">GRÁFICOS</div><div class="sw t xs gfx" onclick="event.target.parentNode.querySelectorAll('div').forEach(d=>d.classList.toggle('on',d===event.target))"><div>BAJA</div><div>MEDIA</div><div class="on">ALTA</div></div></div>
  ${['IDIOMA<br>ESPAÑOL','CONTROLES','CÓMO JUGAR','AYUDA Y<br>SOPORTE','CRÉDITOS','PRIVACIDAD','CONDICIONES','PRUEBA DE<br>CONEXIÓN','CUENTA<br>GOOGLE ✓','CERRAR<br>SESIÓN'].map((l,i)=>`<div class="btn ${i===9?'rojo':'azul'} t s" data-in="u" style="--d:${7+i}">${l}</div>`).join('')}
 </div></div>`};
PANT.ranking={html:()=>`<div class="fondo"></div>${header('RANKING')}
<div class="izq"><div class="seg" data-in="l"><div class="btn t s"><img src="a/i/balon.webp"><span>MUNDIAL</span></div><div class="btn gris t s"><span>MÉXICO</span><span style="font-size:40px">🇲🇽</span></div></div>
 <div class="seg" data-in="l" style="--d:1"><div class="btn t xs" style="font-size:26px">TROFEOS</div><div class="btn gris t xs" style="font-size:26px">CLUBES</div><div class="btn gris t xs" style="font-size:26px">TITANES</div></div>
 <div class="pan" style="padding:24px;margin-top:20px;text-align:center;--d:2" data-in="l" ><div class="sub" style="font-size:22px">TEMPORADA TERMINA EN</div><div class="t amarillo" style="font-size:54px;margin-top:10px">12 d 4 h</div><img src="a/i/trofeo.webp" style="width:170px;margin:16px auto 0;filter:drop-shadow(0 8px 0 rgba(0,0,0,.35))"><div class="t s" style="font-size:26px;margin-top:8px">TOP 100 = TROFEO DORADO</div></div></div>
<div class="pan osc lista" data-in="r">${RANK.slice(0,6).map(([n,f,c,t,p],i)=>`<div class="row" data-in="r" style="--d:${i+1}"><div class="pos t ${i<3?'med':''}" style="${i<3?`background:radial-gradient(circle at 35% 30%,${['#fff3a0,#ffc21a','#ffffff,#b8c6dd','#ffd0a0,#d77a2a'][i]})`:''}">${i+1}</div>
 <div class="av">${retrato(p)}</div><div class="n"><div class="t s">${n} <span style="font-size:24px">${f}</span></div><div class="c t xs">${c.toUpperCase()}</div></div><div class="tr t">${I('trofeo')}${t.toLocaleString('es-MX')}</div></div>`).join('')}
 <div class="row yo" data-in="u" style="--d:12"><div class="pos t">—</div><div class="av">${retrato('leon')}</div><div class="n"><div class="t s">LOVEGORDAS 🇲🇽</div><div class="c t xs" style="color:#fff4d0">SIN CLUB</div></div><div class="tr t">${I('trofeo')}78</div></div></div>`};
const SET=['feliz','triste','enojado','risa','gol','guino','lentes','wow'];
PANT.festejos={html:()=>`<div class="fondo"></div>${header('FESTEJOS',{mid:'<div class="t s celeste" style="font-size:28px;margin-left:16px;margin-top:8px" data-in="d">KRAGOR</div>'})}
<div class="izq"><div class="t s" style="font-size:28px;margin-bottom:14px" data-in="l">EQUIPADOS · TOCA PARA PROBAR</div><div class="grid">${SET.map((c,i)=>`<div class="ra ${i?'':'sel'}" data-in="s" style="--d:${i}" onclick="probar('${c}')">${CARA(c)}</div>`).join('')}</div></div>
<div class="pan pre" data-in="u" style="--d:9"><img src="${cuerpo('leon')}"><div class="burb" id="burb">${CARA('feliz')}</div><div class="t s" style="font-size:26px;flex:1">ASÍ LO VEN<br>TUS RIVALES</div></div>
<div class="pan osc der" data-in="r"><div class="cats">${['feliz','triste','enojado','gol'].map((c,i)=>`<div class="${i?'':'on'}">${CARA(c,i===2?'#ff8a7a':i===1?'#9fd0ff':'#fff')}</div>`).join('')}</div>
 <div class="hdr t s">ALEGRÍA</div><div class="g2">${['feliz','risa','gol','guino','lentes'].map((c,i)=>`<div class="${i>2?'lk':''}" data-in="s" style="--d:${i+3}">${CARA(c,'#ffd84a')}${i>2?`<i>${ICO.candado}</i>`:''}</div>`).join('')}</div>
 <div class="hdr t s">TRISTEZA</div><div class="g2">${['triste','wow','triste','wow','triste'].map((c,i)=>`<div class="${i>1?'lk':''}" data-in="s" style="--d:${i+8}">${CARA(c,'#7fc8ff')}${i>1?`<i>${ICO.candado}</i>`:''}</div>`).join('')}</div>
 <div class="hdr t s">ENOJO</div><div class="g2">${['enojado','enojado','wow'].map((c,i)=>`<div class="${i>0?'lk':''}" data-in="s" style="--d:${i+13}">${CARA(c,'#ff7a6a')}${i>0?`<i>${ICO.candado}</i>`:''}</div>`).join('')}</div></div>`};
window.probar=c=>{const b=$('#burb');b.innerHTML=CARA(c);b.style.animation='none';void b.offsetWidth;b.style.animation='';};
})();
