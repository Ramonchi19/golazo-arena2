// ===== dentro del juego: las pantallas del prototipo con los datos reales del jugador =====
// (se cambia el HTML ya armado de cada pantalla; fuera del juego no hace nada)
(function(){
if(!window.J)return;
const css=`
#s-lobby .sobres .n{flex-direction:column;gap:0;cursor:pointer;position:relative}
#s-lobby .sobres .n img{width:38px;height:38px}
#s-lobby .sobres .n small{font-size:13px;line-height:1;margin-top:1px;white-space:nowrap}
#s-lobby .sobres .n.vacio{background:rgba(0,0,0,.35);opacity:.7;cursor:default}
#s-lobby .sobres .n.listo{background:linear-gradient(#6af04a,#2bb51c);animation:latido 1.1s ease-in-out infinite}
#s-lobby .sobres .n.abriendo{background:linear-gradient(#ffb43a,#e07a00)}
#s-lobby .sobres .n.plata{background:linear-gradient(#cfd8e8,#7d8aa6)}#s-lobby .sobres .n.oro{background:linear-gradient(#ffe25a,#e0a000)}#s-lobby .sobres .n.leyenda{background:linear-gradient(#d58bff,#7b2be0)}
#s-personajes .pc .capj{position:absolute;left:8px;top:8px;width:46px;height:46px;z-index:3;filter:drop-shadow(0 3px 0 rgba(0,0,0,.5))}
#s-personajes .pc .pr.sob{font-size:20px}
#s-titan .desc b{color:#ffd23a}
#s-victoria .marc .go{white-space:nowrap}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const parche=(id,fn)=>{const P=PANT[id];if(!P)return;const h=P.html;P.html=()=>{JUEGO_SYNC();const t=document.createElement('template');t.innerHTML=h();try{fn(t.content);}catch(e){console.warn('parche '+id,e);}return t.innerHTML;};};
const q=(r,s)=>r.querySelector(s),qa=(r,s)=>[...r.querySelectorAll(s)];
const txt=(el,v)=>{if(el)el.textContent=v;};
const fmt=n=>(+n||0).toLocaleString('es-MX');
const ARCH_AR=['a0','a1','a2','a3','a4','a5','a7','a7','a8'];

// ---------- LOBBY ----------
function sobresHTML(){const P=J.packs();return `<div class="lbl t xs">SOBRES</div>`+P.map((p,i)=>!p?`<div class="n vacio"><small class="t xs">LIBRE</small></div>`
  :`<div class="n ${p.st==='listo'?'listo':p.st==='abriendo'?'abriendo':p.t}" onclick="J.sobre(${i})"><img src="a/i/regalo.webp"><small class="t xs">${p.st==='listo'?'¡ABRIR!':p.st==='abriendo'?p.left:'ABRIR'}</small></div>`).join('');}
window.pintaSobres=()=>{const r=$('#s-lobby .sobres');if(r)r.innerHTML=sobresHTML();};
parche('lobby',d=>{const i=JINFO;
  qa(d,'.elige,#capb,.badge,.tag').forEach(e=>e.remove());
  const pl=q(d,'.heroe .placa');if(pl){pl.querySelector('.tro').innerHTML=`<img src="a/i/trofeo.webp">${i.tr}`;txt(pl.querySelector('.nv'),i.lvl);}
  const pf=q(d,'.perfil');if(pf){txt(pf.querySelector('.t.s'),i.name.toUpperCase());const x=pf.querySelector('.xp i');if(x)x.style.width=Math.round(Math.min(1,i.xp/i.xpNeed)*100)+'%';}
  const cm=q(d,'.camino');if(cm){const n=cm.querySelector('[data-count]');n.dataset.count=i.tr;n.textContent=i.tr;const b=cm.querySelector('.barra i');
    if(b)b.style.width=Math.round(i.ligaSig?Math.min(1,(i.tr-i.ligaMin)/(i.ligaSig-i.ligaMin))*100:100)+'%';}
  const ra=q(d,'.racha');if(ra){ra.className='pan racha sobres';ra.innerHTML=sobresHTML();}
  const md=q(d,'.modo');if(md){md.removeAttribute('onclick');md.dataset.go='camino';const im=md.querySelector('img');if(im)im.src=`a/ar/${ARCH_AR[i.arena]||'a0'}.webp`;
    const s=md.querySelectorAll('div > div');if(s[0])s[0].textContent='ARENA '+(i.arena+1)+' · '+i.liga.toUpperCase();if(s[1])s[1].textContent=i.arenaN.toUpperCase();if(s[2])s[2].textContent='PARTIDO 1 VS 1';}
  const mi=q(d,'.mis');if(mi){mi.removeAttribute('onclick');mi.dataset.go='equipo';mi.innerHTML=`${I('cartas')}<span class="t s" style="font-size:22px">EQUIPO</span>`;}
  const kr=q(d,'#kr2d');if(kr)kr.src=cuerpo(window.HEROE);
});

{const e=PANT.lobby.entrar;PANT.lobby.entrar=el=>{e(el);if(window.LOBBY_ID&&LOBBY_ID!==window.HEROE){const c=$('#carg');if(c)c.style.display='block';LOBBY3D.cambiar(window.HEROE).finally(()=>{if(c)c.style.display='none';});}};}

// ---------- TITANES (colección) ----------
parche('personajes',d=>{const i=JINFO,own=MIOS.length;
  const c=q(d,'.top .celeste');txt(c,own+' / '+PJ.length);
  const de=q(d,'.dest');if(de){qa(de,'.pb,.ya').forEach(e=>e.remove());const t=de.querySelector('.tt');if(t)t.innerHTML='TU<br>CAPITÁN';
    const ims=de.querySelectorAll(':scope > img');ims.forEach((im,k)=>{if(k)im.remove();else{im.src=cuerpo(window.HEROE);im.style.left='40px';im.style.height=Math.round(470*(ESTATURA[window.HEROE]||1))+'px';}});
    de.insertAdjacentHTML('beforeend',`<div class="t" style="position:absolute;left:0;right:0;bottom:120px;text-align:center;font-size:44px;z-index:2">${(PJI[window.HEROE]||{n:''}).n.toUpperCase()}</div>
      <div class="btn azul t s" data-go="equipo" style="position:absolute;left:60px;right:60px;bottom:24px;height:80px;font-size:30px;z-index:2">MI EQUIPO</div>`);}
  qa(d,'.pc').forEach(pc=>{const m=/verTitan\('([^']+)'\)/.exec(pc.getAttribute('onclick')||'');if(!m)return;const id=m[1],o=i.own[id];
    const tr=pc.querySelector('.tro');if(tr)tr.remove();
    if(o){txt(pc.querySelector('.nv'),o.lvl);if(i.squad.includes(id)&&id===window.HEROE)pc.insertAdjacentHTML('beforeend','<img class="capj" src="a/i/capitan.webp">');}
    else{const p=pc.querySelector('.pr');if(p){p.className='pr sob t s';p.innerHTML='<img src="a/i/regalo.webp">SOBRES';}}});
});

// ---------- DETALLE DEL TITÁN ----------
const ICS={vel:'velocidad',tir:'super-tiro',pas:'balon',reg:'energia',def:'defensa',fis:'fuerza',ref:'portero',alc:'portero',sal:'fuerza'};
const ELIGE={POR:['ref','alc','sal','vel'],DEF:['def','fis','vel','pas'],MED:['vel','pas','tir','reg'],DEL:['vel','tir','reg','fis']};
parche('titan',d=>{const id=window.TITAN||'leon',T=J.titan(id),p=PJI[id];if(!T)return;
  qa(d,'.izq .tro,.habs,.gira').forEach(e=>e.remove());
  const de=q(d,'.desc');if(de)de.innerHTML=`${T.estilo}${T.fuerte?`<br><b>Fuerte:</b> ${T.fuerte}`:''}${T.debil?`<br><b>Débil:</b> ${T.debil}`:''}`;
  const mn=q(d,'.mini');if(mn)qa(mn,'.btn').forEach((b,k)=>{if(k)b.remove();});
  const bo=q(d,'.izq .bots');if(bo)bo.innerHTML=!T.own?`<div class="btn mej no t s" style="width:360px">CONSÍGUELO EN SOBRES</div>`
    :T.cap?`<div class="btn t s" style="width:360px;gap:8px;pointer-events:none"><img src="a/i/capitan.webp" style="width:44px">TU CAPITÁN</div>`
    :T.enEquipo?`<div class="btn t s" style="width:360px" onclick="capJ('${id}')">HACER CAPITÁN</div>`
    :`<div class="btn azul t s" style="width:360px" onclick="J.alEquipo('${id}')">PONER EN MI EQUIPO</div>`;
  const fz=q(d,'.fz');if(fz){txt(fz.querySelector('#tnv'),T.lvl);const tt=fz.querySelectorAll('.tt span');txt(tt[0],'NIVEL');txt(tt[1],'MÁX. '+T.max);
    const sg=fz.querySelector('.seg');if(sg)sg.innerHTML=Array.from({length:T.max},(_,k)=>`<i class="${k<T.lvl?'on':''}"></i>`).join('');}
  const S=Object.fromEntries(T.stats.map(s=>[s.c,s])),sel=(ELIGE[T.pos]||ELIGE.MED).filter(k=>S[k]);
  const sb=q(d,'.st');if(sb)sb.innerHTML=sel.map((k,j)=>{const s=S[k];return `<div class="f" data-in="r" style="--d:${2+j}"><img src="a/i/${ICS[k]}.webp"><span class="k t xs">${s.k}</span><span class="v t">${s.v}</span>${T.own&&s.n!=null&&s.n>s.v?`<span class="mas t xs">+${s.n-s.v}</span>`:''}</div>`;}).join('');
  const mj=q(d,'.der .mej');if(mj){const box=mj.parentNode,pf=Math.min(1,T.copies/Math.max(1,T.need)),puede=T.own&&T.lvl<T.max&&T.copies>=T.need&&T.gold>=T.cost;
    box.innerHTML=(!T.own?`<div class="btn mej no t">BLOQUEADO</div>`:T.lvl>=T.max?`<div class="btn mej no t">NIVEL MÁXIMO</div>`
      :`<div class="btn ${puede?'verde':'mej no'} mej t" onclick="${puede?`mejoraJ('${id}')`:`toast('${T.copies<T.need?`Te faltan ${T.need-T.copies} fichas de ${p.n}`:'Te faltan monedas'}')`}"><span>MEJORAR</span><span class="cs t xs"><span><img src="a/i/energia.webp">${Math.min(T.copies,T.need)}/${T.need}</span><span><img src="a/i/moneda.webp">${fmt(T.cost)}</span></span></div>`)
      +`<div class="btn azul info t xs" onclick="infoFichas()">?</div>`;
    const bar=q(d,'.pf');if(bar){if(T.own&&T.lvl<T.max){bar.querySelector('.barra i').style.width=Math.round(pf*100)+'%';txt(bar.querySelector('.barra span'),T.copies+' / '+T.need+' FICHAS');}else bar.remove();}}
});
const reabre=()=>{if(actual){const a=actual;actual=null;ir(a,{sinWipe:true});}};
window.capJ=id=>{if(J.capitan(id)){JUEGO_SYNC();toast(`¡${PJI[id].n} es tu capitán!`);J.sonido('tap');reabre();}};
window.mejoraJ=id=>{const el=$('#s-titan');if(!el||el.dataset.mj)return;el.dataset.mj=1;
  J.mejorar(id).then(()=>{const T=J.titan(id),nv=el.querySelector('#tnv');J.sonido('carta');
    if(nv){nv.textContent=T.lvl;nv.classList.remove('pop');void nv.offsetWidth;nv.classList.add('pop');
      const r=nv.getBoundingClientRect(),rs=el.getBoundingClientRect(),k=1/SC;
      for(let i=0;i<22;i++){const c=document.createElement('i');c.className='chispa';const a=Math.random()*6.28,dd=80+Math.random()*120;
        c.style.cssText=`left:${(r.left-rs.left)*k+48}px;top:${(r.top-rs.top)*k+48}px;--x:${Math.cos(a)*dd}px;--y:${Math.sin(a)*dd}px`;el.appendChild(c);setTimeout(()=>c.remove(),950);}}
    try{VS3D.presenta(0);}catch(e){}toast(`¡${PJI[id].n} subió a nivel ${T.lvl}!`);
    setTimeout(()=>{if(actual==='titan'&&window.TITAN===id)reabre();},1500);})
  .catch(e=>{delete el.dataset.mj;toast((e&&e.message)||'No se pudo');});};
window.infoFichas=()=>ventana(`<h2 class="t">FICHAS Y MONEDAS</h2>
 <p>Consigue <b style="color:#d6a8ff">fichas</b> de cada titán abriendo sobres y en la tienda. Junta las fichas que pide y paga con <b style="color:#ffd23a">monedas</b> para subirlo de nivel: mejores estadísticas en la cancha.</p>
 <div class="btn verde t s" style="width:260px;height:80px;font-size:34px;margin:0 auto" onclick="this.closest('.velo').remove()">¡VALE!</div>`);

document.addEventListener('pointerdown',e=>{if(e.target.closest('.btn,[data-go],.pc,.n'))J.sonido('tap');},true);
// ---------- el juego avisa que algo cambió (monedas, sobres, nivel…) ----------
window.JUEGO_CAMBIO=()=>{const i=JUEGO_SYNC();if(!i)return;
  $$('.jgold').forEach(e=>{e.textContent=i.gold;e.dataset.count=i.gold;});$$('.jgem').forEach(e=>e.textContent=i.gems);
  if(actual==='lobby')pintaSobres();};
// los tiempos de los sobres que se están abriendo
setInterval(()=>{if(actual==='lobby'&&document.visibilityState!=='hidden'&&$('#s-lobby .sobres .abriendo'))pintaSobres();},1000);
})();
