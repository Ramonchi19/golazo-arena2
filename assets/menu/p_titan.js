// ===== DETALLE DE TITÁN: 3D girable, fuerza, estadísticas, súper, habilidades, mejorar =====
(function(){
const css=`
#s-titan .fondo{--bg:var(--fondoT);--motivo:url(a/balon.png)}
#s-titan .velo2{position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,rgba(255,255,255,.28),transparent 45%);pointer-events:none}
#s-titan .izq{position:absolute;left:34px;top:122px;width:500px;bottom:24px}
#s-titan .placa{position:relative;display:inline-block;padding:10px 34px 14px 26px;border:3px solid var(--ink);border-radius:14px;background:linear-gradient(var(--c1),var(--c2));transform:skewX(-8deg);box-shadow:0 8px 0 var(--ink)}
#s-titan .placa>*{transform:skewX(8deg)}
#s-titan .placa .nm{font-size:66px;line-height:1;--sw:10px;--sd:7px}
#s-titan .placa .ti{position:absolute;left:18px;bottom:-30px;padding:4px 14px;background:var(--ink);border-radius:8px;font-size:20px;color:#cfd8ff;white-space:nowrap}
#s-titan .rar{display:inline-block;margin:44px 0 0 6px;padding:5px 14px;border:3px solid var(--ink);border-radius:10px;font-size:20px;background:linear-gradient(var(--c1),var(--c2));box-shadow:0 4px 0 var(--ink)}
#s-titan .pos{display:inline-flex;align-items:center;gap:8px;margin-left:10px;padding:5px 14px;border:3px solid var(--ink);border-radius:10px;font-size:20px;background:#1d2a6a;box-shadow:0 4px 0 var(--ink)}
#s-titan .pos img{width:30px}
#s-titan .tro{margin-top:18px;display:flex;align-items:center;gap:10px;width:380px}
#s-titan .tro img{width:52px;filter:drop-shadow(0 4px 0 rgba(0,0,0,.35))}
#s-titan .barra{flex:1;height:34px;border:3.5px solid var(--ink);border-radius:12px;background:#151d4a;position:relative;overflow:hidden;box-shadow:0 4px 0 var(--ink)}
#s-titan .barra i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#ffe25a,#ffb21a);box-shadow:inset 0 4px 0 rgba(255,255,255,.45)}
#s-titan .barra span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px}
#s-titan .desc{margin-top:18px;font-size:23px;line-height:1.32;color:#eef3ff;text-shadow:0 2px 0 rgba(0,0,0,.45);width:470px}
#s-titan .mini{position:absolute;left:0;bottom:120px;display:flex;gap:14px}
#s-titan .mini .btn{width:86px;height:76px;padding:10px}
#s-titan .mini .btn img,#s-titan .mini .btn svg{width:50px;height:50px}
#s-titan .bots{position:absolute;left:0;bottom:0;display:flex;gap:14px}
#s-titan .bots .btn{height:96px;font-size:36px}#s-titan .bots .btn img{width:52px;height:52px;object-fit:contain}
#s-titan .cen{position:absolute;left:520px;top:110px;width:560px;height:780px}
#s-titan .cen canvas{position:absolute;left:0;top:0;cursor:grab}
#s-titan .cen .previo{position:absolute;left:50%;bottom:40px;height:620px;transform:translateX(-50%)}
#s-titan .sombra{position:absolute;left:130px;right:130px;bottom:42px;height:50px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),transparent 70%)}
#s-titan .flecha{position:absolute;top:380px;width:84px;height:110px;padding:14px;z-index:4}
#s-titan .flecha svg{width:100%;height:100%}
#s-titan .flecha.i{left:530px}#s-titan .flecha.d{left:966px}#s-titan .flecha.i svg{transform:scaleX(-1)}
#s-titan .gira{position:absolute;left:560px;bottom:34px;width:480px;text-align:center;font-size:18px;opacity:.85}
#s-titan .der{position:absolute;right:30px;top:122px;width:500px}
#s-titan .habs{display:flex;justify-content:flex-end;gap:16px;margin-bottom:16px}
#s-titan .hab{position:relative;width:96px;height:96px;border:3.5px solid var(--ink);border-radius:50%;background:radial-gradient(circle at 40% 35%,#6a7bc8,#2a3576);box-shadow:0 6px 0 var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer}
#s-titan .hab svg{width:46px;height:46px}
#s-titan .hab .nv{position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);padding:2px 10px;background:var(--ink);border-radius:8px;font-size:16px;white-space:nowrap}
#s-titan .hab.si{background:radial-gradient(circle at 40% 35%,#ffe27a,#ff9d1a)}
#s-titan .fz{display:flex;align-items:center;gap:14px;padding:16px 18px}
#s-titan .nivel{flex:none;width:96px;height:96px;border:3px solid var(--ink);border-radius:50%;background:radial-gradient(circle at 40% 35%,#d58bff,#7b2be0);display:flex;align-items:center;justify-content:center;font-size:56px;box-shadow:0 6px 0 var(--ink)}
#s-titan .nivel.pop{animation:pum .6s ease-out}
#s-titan .fz .tt{display:flex;justify-content:space-between;font-size:26px;margin-bottom:8px}
#s-titan .seg{display:flex;gap:4px}
#s-titan .seg i{flex:1;height:22px;border:3px solid var(--ink);border-radius:5px;background:#1b2350}
#s-titan .seg i.on{background:linear-gradient(#e2a6ff,#9a45ff);box-shadow:inset 0 3px 0 rgba(255,255,255,.4)}
#s-titan .st{margin-top:14px;display:flex;flex-direction:column;gap:10px}
#s-titan .st .f{display:flex;align-items:center;gap:12px;padding:10px 16px;border:3px solid var(--ink);border-radius:14px;background:rgba(10,13,28,.55);font-size:24px}
#s-titan .st .f img{width:42px;height:42px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}
#s-titan .st .f .k{flex:1;font-size:20px;color:#b8c6ff}
#s-titan .st .f .v{font-size:30px}
#s-titan .st .f .mas{margin-left:10px;font-size:22px;color:#8dff5c}
#s-titan .st .f.su{cursor:pointer;background:linear-gradient(90deg,rgba(255,180,30,.35),rgba(10,13,28,.55))}
#s-titan .vels{display:flex;gap:4px}#s-titan .vels i{width:22px;height:16px;border:3px solid var(--ink);border-radius:4px;background:#1b2350}#s-titan .vels i.on{background:#7cf04a}
#s-titan .mej{position:relative;margin-top:16px;width:100%;height:118px;flex-direction:column;font-size:34px;gap:2px}
#s-titan .mej .cs{display:flex;gap:22px;font-size:26px;align-items:center}#s-titan .mej .cs>span{display:flex;align-items:center;gap:6px}
#s-titan .mej .cs img{width:34px;display:block}
#s-titan .mej.no{--c1:#8a93b8;--c2:#5e6890;--c3:#373e5e}
#s-titan .pf{margin-top:10px;display:flex;align-items:center;gap:10px}
#s-titan .pf img{width:44px}
#s-titan .pf .barra i{background:linear-gradient(#c9a6ff,#8a4dff)}
#s-titan .info{position:absolute;right:-6px;top:-16px;width:56px;height:56px;padding:8px;border-radius:50%;z-index:3}
#s-titan .chispa{position:absolute;width:18px;height:18px;border-radius:50%;background:radial-gradient(#fff,#ffd23a 40%,transparent 70%);pointer-events:none;animation:chis .9s ease-out forwards}
@keyframes chis{to{transform:translate(var(--x),var(--y)) scale(.2);opacity:0}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const COL={comun:['#9fd0ff','#3f7fd0','linear-gradient(160deg,#5fb0ff,#2a6bd8 50%,#123a8a)'],rara:['#7dffb5','#1fc16b','linear-gradient(160deg,#4fe39a,#18a85e 50%,#0a5a34)'],
  epica:['#d58bff','#8b2be0','linear-gradient(160deg,#c47bff,#7b2be0 50%,#3a0a80)'],legendaria:['#ffe27a','#ffa51a','linear-gradient(160deg,#ffd45a,#ff8a1a 50%,#a83a00)']};
const RN={comun:'COMÚN',rara:'RARO',epica:'ÉPICO',legendaria:'LEGENDARIO'};
const CAPS={leon:[['a/m/a_leon_lobby1.glb.txt',3.05],['a/m/a_leon_lobby2.glb.txt']],turbo:[['a/m/a_turbo_lobby1.glb.txt']]};
const FL='<svg viewBox="0 0 60 80"><path d="M14 8 46 40 14 72" fill="none" stroke="#0a0d1c" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8 46 40 14 72" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CAND='<svg viewBox="0 0 60 60"><path d="M18 26v-7a12 12 0 0 1 24 0v7" fill="none" stroke="#0a0d1c" stroke-width="12"/><path d="M18 26v-7a12 12 0 0 1 24 0v7" fill="none" stroke="#dfe6ff" stroke-width="5"/><rect x="11" y="25" width="38" height="28" rx="7" fill="#dfe6ff" stroke="#0a0d1c" stroke-width="5"/></svg>';
let accI=0;
function q(){return Math.min(2,(devicePixelRatio||1)*(typeof SC!=='undefined'?SC:1));}
const fmt=n=>n.toLocaleString('es-MX');
window.verTitan=id=>{window.TITAN=id;if(actual==='titan'){const a=actual;actual=null;ir(a,{sinWipe:true});}else ir('titan');};
PANT.titan={html:()=>{const id=window.TITAN||'leon',d=TITAN_DATOS(id),p=d.p,c=COL[p.r],mio=MIOS.includes(id),n=d.n,Q=q();
  const max=n>=d.max,pf=Math.min(1,d.tengoF/Math.max(1,d.fichas)),puede=mio&&!max&&d.tengoF>=d.fichas;
  return `<div class="fondo" style="--fondoT:${c[2]}"></div><div class="velo2"></div>
${header('',{mid:`<div class="t s" style="font-size:26px;margin-left:16px;margin-top:6px;opacity:.9" data-in="d">${PJ.findIndex(x=>x.id===id)+1} / ${PJ.length}</div>`})}
<div class="izq">
 <div data-in="l"><div class="placa" style="--c1:${c[0]};--c2:${c[1]}"><div class="nm t">${p.n.toUpperCase()}</div><div class="ti t xs">${p.t.toUpperCase()}</div></div></div>
 <div data-in="l" style="--d:1"><span class="rar t xs" style="--c1:${c[0]};--c2:${c[1]}">${RN[p.r]}</span><span class="pos t xs">${I(p.pos==='POR'?'portero':p.pos==='DEF'?'defensa':p.pos==='MED'?'velocidad':'super-tiro')}${d.pos}</span></div>
 <div class="tro" data-in="l" style="--d:2"><img src="a/i/trofeo.webp"><div class="barra"><i style="width:${Math.round(d.trofeos/250*100)}%"></i><span class="t xs">${d.trofeos} / 250</span></div></div>
 <div class="desc" data-in="l" style="--d:3">${d.desc}</div>
 <div class="mini" data-in="u" style="--d:4"><div class="btn gris" onclick="ventana('<h2 class=&quot;t&quot;>${p.n.toUpperCase()}</h2><p>${d.desc}</p>')">${I('info')}</div><div class="btn gris" onclick="toast('Reacciones: próximamente')">${I('chat')}</div><div class="btn gris" onclick="toast('Aspectos: próximamente')">${I('editar')}</div></div>
 <div class="bots" data-in="u" style="--d:5">${mio?`<div class="btn t s brillo" style="width:300px" onclick="window.HEROE='${id}';toast('¡${p.n} es tu titán!')">SELECCIONAR</div>`:`<div class="btn morado t s brillo" style="width:300px;gap:8px" onclick="nuevoPJ('${id}')">${I('gema')}349</div>`}
  <div class="btn azul t s" style="width:170px" onclick="toast('Campo de prueba: próximamente')">PROBAR</div></div>
</div>
<div class="cen"><div class="sombra"></div><img class="previo" src="${cuerpo(id)}"><canvas class="c3" width="${Math.round(560*Q)}" height="${Math.round(780*Q)}" style="width:560px;height:780px"></canvas></div>
<div class="btn gris flecha i" onclick="pasaTitan(-1)">${FL}</div><div class="btn gris flecha d" onclick="pasaTitan(1)">${FL}</div>
<div class="gira t xs">Arrastra para girar · toca para verlo en acción</div>
<div class="der">
 <div class="habs" data-in="r">${d.hab.map((h,i)=>`<div class="hab ${n>=h.nv?'si':''}" onclick="ventana('<h2 class=&quot;t&quot;>${h.n.toUpperCase()}</h2><p>${h.d.trim()}</p><p style=&quot;color:#ffd23a&quot;>Se desbloquea en FUERZA ${h.nv}</p>')">${n>=h.nv?I(i?'estrella':'energia'):CAND}<div class="nv t xs">NV ${h.nv}</div></div>`).join('')}</div>
 <div class="pan fz" data-in="r" style="--d:1"><div class="nivel t" id="tnv">${n}</div><div style="flex:1"><div class="tt t s"><span>FUERZA</span><span style="color:#d6a8ff">MÁX. ${d.max}</span></div><div class="seg">${Array.from({length:d.max},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</div></div></div>
 <div class="st">
  <div class="f" data-in="r" style="--d:2"><img src="a/i/fuerza.webp"><span class="k t xs">SALUD</span><span class="v t" id="tsal">${fmt(d.salud(n))}</span>${max?'':`<span class="mas t xs">+${fmt(d.salud(n+1)-d.salud(n))}</span>`}</div>
  <div class="f" data-in="r" style="--d:3"><img src="a/i/super-tiro.webp"><span class="k t xs">TIRO</span><span class="v t" id="ttir">${fmt(d.tiro(n))}</span>${max?'':`<span class="mas t xs">+${fmt(d.tiro(n+1)-d.tiro(n))}</span>`}</div>
  <div class="f" data-in="r" style="--d:4"><img src="a/i/velocidad.webp"><span class="k t xs">VELOCIDAD</span><span class="v t" style="font-size:24px;margin-right:10px">${d.vel}</span><span class="vels">${[1,2,3].map(i=>`<i class="${i<=d.vel_n?'on':''}"></i>`).join('')}</span></div>
  <div class="f su" data-in="r" style="--d:5" onclick="ventana('<h2 class=&quot;t amarillo&quot;>${d.super}</h2><p>${d.superD}</p>')"><img src="a/i/energia.webp"><span class="k t xs">SÚPER</span><span class="v t" style="font-size:24px">${d.super}</span></div>
 </div>
 <div style="position:relative;--d:6" data-in="u">
  ${mio?(max?`<div class="btn mej no t">FUERZA MÁXIMA</div>`:`<div class="btn ${puede?'verde brillo':'mej no'} mej t" onclick="${puede?'mejoraTitan()':`toast('Te faltan ${d.fichas-d.tengoF} fichas de ${p.n}')`}"><span>MEJORAR</span><span class="cs t xs"><span><img src="a/i/energia.webp">${Math.min(d.tengoF,d.fichas)}/${d.fichas}</span><span><img src="a/i/moneda.webp">${fmt(d.costo)}</span></span></div>`):`<div class="btn mej no t">BLOQUEADO</div>`}
  <div class="btn azul info t xs" onclick="infoFichas()">?</div>
 </div>
 ${mio&&!max?`<div class="pf" data-in="u" style="--d:7"><img src="a/i/energia.webp"><div class="barra"><i style="width:${Math.round(pf*100)}%"></i><span class="t xs">${d.tengoF} / ${d.fichas} FICHAS</span></div></div>`:''}
</div>`;},
entrar(el){const id=window.TITAN||'leon',cv=el.querySelector('.c3');accI=0;
  VS3D.cargar(id,'u').then(()=>{if(actual!=='titan'||window.TITAN!==id)return;
    VS3D.tarjetas([{cv,id,tipo:'u',enc:'cuerpo',efecto:true,girar:true,presenta:true}]);VS3D.arrancar();el.querySelector('.previo').style.display='none';}).catch(e=>console.warn(e));
  // toque sin arrastrar = verlo en acción
  let dx=0,x0=0;cv.addEventListener('pointerdown',e=>{x0=e.clientX+e.clientY;dx=0;});
  cv.addEventListener('pointerup',e=>{dx=Math.abs(e.clientX+e.clientY-x0);if(dx<8)enAccion(id);});},
salir(){VS3D.parar();}};
function enAccion(id){const L=CAPS[id];if(L){const a=L[accI++%L.length];VS3D.accion(0,a[0],a[1]);}else VS3D.presenta(0);}
window.pasaTitan=k=>{const i=PJ.findIndex(x=>x.id===(window.TITAN||'leon'));verTitan(PJ[(i+k+PJ.length)%PJ.length].id);};
window.mejoraTitan=()=>{const id=window.TITAN,d=TITAN_DATOS(id);if(d.n>=d.max)return;
  TITAN_NIVEL[id]=d.n+1;const el=$('#s-titan');if(!el)return;
  // chispas desde el nivel y conteo de estadísticas
  const nv=el.querySelector('#tnv');nv.textContent=d.n+1;nv.classList.remove('pop');void nv.offsetWidth;nv.classList.add('pop');
  const r=nv.getBoundingClientRect(),rs=el.getBoundingClientRect(),k=1/SC;
  for(let i=0;i<22;i++){const c=document.createElement('i');c.className='chispa';const a=Math.random()*6.28,dd=80+Math.random()*120;
    c.style.cssText=`left:${(r.left-rs.left)*k+48}px;top:${(r.top-rs.top)*k+48}px;--x:${Math.cos(a)*dd}px;--y:${Math.sin(a)*dd}px`;el.appendChild(c);setTimeout(()=>c.remove(),950);}
  const s=el.querySelector('#tsal'),t=el.querySelector('#ttir');
  if(s){s.dataset.from=d.salud(d.n);s.dataset.count=d.salud(d.n+1);s.dataset.sep=1;s.dataset.delay=0;contar(s);}
  if(t){t.dataset.from=d.tiro(d.n);t.dataset.count=d.tiro(d.n+1);t.dataset.sep=1;t.dataset.delay=0;contar(t);}
  VS3D.presenta(0);toast(`¡${d.p.n} subió a FUERZA ${d.n+1}!`);
  setTimeout(()=>{if(actual==='titan'&&window.TITAN===id){const a=actual;actual=null;ir(a,{sinWipe:true});}},1600);};
window.infoFichas=()=>ventana(`<h2 class="t">FICHAS Y MONEDAS</h2>
 <div class="fl"><img src="a/i/energia.webp"><span class="fle t">+</span><img src="a/i/moneda.webp" style="animation-delay:-.6s"><span class="fle t">➜</span><div class="nivel t" style="width:110px;height:110px;border:4px solid #0a0d1c;border-radius:50%;background:radial-gradient(circle at 40% 35%,#d58bff,#7b2be0);display:flex;align-items:center;justify-content:center;font-size:60px;box-shadow:0 6px 0 #0a0d1c">+1</div></div>
 <p>Consigue <b style="color:#d6a8ff">fichas</b> de cada titán en sobres, el Pase Titán y la tienda. Junta las fichas que pide y paga con <b style="color:#ffd23a">monedas</b> para subirle la FUERZA: más salud, tiros más fuertes y nuevas habilidades.</p>
 <div class="btn verde t s" style="width:260px;height:80px;font-size:34px;margin:0 auto" onclick="this.closest('.velo').remove()">¡VALE!</div>`);
})();
