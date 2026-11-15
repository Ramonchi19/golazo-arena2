// ===== núcleo: escala, navegación con barrido, scroll arrastrable, contadores =====
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ST=$('#stage');let ROT=false,SC=1;
function fit(){const W=innerWidth,H=innerHeight;ROT=H>W*1.05;const w=ROT?H:W,h=ROT?W:H;SC=Math.min(w/1600,h/900);
  const ox=(w-1600*SC)/2,oy=(h-900*SC)/2;
  ST.style.transform=ROT?`translate(${W}px,0) rotate(90deg) translate(${ox}px,${oy}px) scale(${SC})`:`translate(${ox}px,${oy}px) scale(${SC})`;}
addEventListener('resize',fit);fit();

const ICO={
 nota:'<svg viewBox="0 0 60 60"><path d="M24 44V14l26-6v30" fill="none" stroke="#0a0d1c" stroke-width="11" stroke-linejoin="round"/><path d="M24 44V14l26-6v30" fill="none" stroke="#ffd23a" stroke-width="5" stroke-linejoin="round"/><ellipse cx="17" cy="45" rx="10" ry="8" fill="#ffd23a" stroke="#0a0d1c" stroke-width="5"/><ellipse cx="43" cy="39" rx="10" ry="8" fill="#ffd23a" stroke="#0a0d1c" stroke-width="5"/></svg>',
 flechas:'<svg viewBox="0 0 80 40"><path d="M26 6 8 20l18 14zM54 6l18 14-18 14z" fill="#fff" stroke="#0a0d1c" stroke-width="5" stroke-linejoin="round"/></svg>',
 atras:'<svg viewBox="0 0 60 60"><path d="M36 12 18 30l18 18" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 casa:'<svg viewBox="0 0 60 60"><path d="M10 30 30 12l20 18M16 25v23h28V25" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 menu:'<svg viewBox="0 0 60 60"><path d="M12 17h36M12 30h36M12 43h36" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>',
 candado:'<svg viewBox="0 0 60 60"><path d="M18 26v-7a12 12 0 0 1 24 0v7" fill="none" stroke="#0a0d1c" stroke-width="13"/><path d="M18 26v-7a12 12 0 0 1 24 0v7" fill="none" stroke="#e8eefc" stroke-width="6"/><rect x="11" y="25" width="38" height="29" rx="7" fill="#ffd23a" stroke="#0a0d1c" stroke-width="5"/><circle cx="30" cy="38" r="4" fill="#0a0d1c"/></svg>',
 lapiz:'<svg viewBox="0 0 60 60"><path d="M12 48l3-12 25-25 9 9-25 25z" fill="#fff" stroke="#0a0d1c" stroke-width="5" stroke-linejoin="round"/></svg>',
 cruz:'<svg viewBox="0 0 60 60"><path d="M16 16l28 28M44 16 16 44" stroke="#0a0d1c" stroke-width="16" stroke-linecap="round"/><path d="M16 16l28 28M44 16 16 44" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>',
 palomita:'<svg viewBox="0 0 60 60"><path d="M12 31l12 12 24-26" fill="none" stroke="#0a0d1c" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 31l12 12 24-26" fill="none" stroke="#8dff5c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const I=n=>`<img src="a/i/${n}.webp" alt="">`;
function cur(){const i=window.JINFO,g=i?i.gold:12480,m=i?i.gems:245;return `<div class="dinero" data-in="d">
  <div class="cur"><img src="a/i/moneda.webp"><span class="t s jgold" data-count="${g}">${g}</span></div>
  <div class="cur" ${window.J?'data-go="tienda"':''}><img src="a/i/gema.webp"><span class="t s jgem">${m}</span><b class="mas t xs">+</b></div></div>`;}
function header(titulo,opt={}){return `<div class="top">
  <div class="btn back" data-go="back" data-in="l">${ICO.atras}</div>
  <div class="titulo t xl" data-in="l" style="--d:1">${titulo}</div>${opt.mid||''}
  ${opt.sinDinero?'<div style="margin-left:auto"></div>':cur()}
  <div class="btn home" data-go="lobby" data-in="r">${ICO.casa}</div></div>`;}

// ---------- navegación ----------
const PANT={};let actual=null;const pila=[];
Object.defineProperty(window,"ACTUAL",{get:()=>actual});
function ir(id,{sinWipe=false,atras=false,forzar=false}={}){
  if(id==='back'){pila.pop();id=pila.pop()||'lobby';}
  if(id===actual&&!forzar)return;if(!PANT[id])id='lobby';
  const cambia=()=>{const prev=actual&&$('#s-'+actual);if(prev){prev.classList.remove('on');PANT[actual]?.salir?.();}
    let el=$('#s-'+id);if(!el){el=document.createElement('section');el.className='scr';el.id='s-'+id;ST.insertBefore(el,$('#wipe'));}
    el.innerHTML=PANT[id].html();void el.offsetWidth;el.classList.add('on');actual=id;pila.push(id);
    PANT[id].entrar?.(el);montar(el);};
  if(sinWipe||!actual){cambia();return;}
  const w=$('#wipe');w.classList.remove('go');void w.offsetWidth;w.classList.add('go');setTimeout(cambia,300);
}
// en el juego, algunas pantallas son las de siempre (tienda, ranking, ajustes…) y JUGAR busca rival de verdad
const RUTAS_JUEGO=['tienda','ranking','ajustes','perfil','noticias','camino','buscar','equipo','vestidor','ayuda'];
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(!g||ARR.moved)return;const d=g.dataset.go;
  if(window.J){if(RUTAS_JUEGO.includes(d)){J.ruta(d);return;}if(d==='amigos'||d==='festejos'){toast('Próximamente');return;}}
  ir(d);});
// presionar: que se aplaste aunque el dedo sea rápido
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn');if(b){b.classList.add('pr');setTimeout(()=>b.classList.remove('pr'),140);}});

// ---------- contadores que suben ----------
function contar(el){const fin=+el.dataset.count,ini=+(el.dataset.from||0),dur=+(el.dataset.dur||900),t0=performance.now()+(+(el.dataset.delay||250));
  const fmt=v=>el.dataset.sep?v.toLocaleString('es-MX'):String(v);el.textContent=fmt(ini);
  (function f(t){const u=Math.min(1,Math.max(0,(t-t0)/dur)),k=1-Math.pow(1-u,3);el.textContent=fmt(Math.round(ini+(fin-ini)*k));if(u<1)requestAnimationFrame(f);})(performance.now());}

// ---------- scroll horizontal arrastrable (funciona también con la pantalla girada) ----------
const ARR={moved:false};
function arrastre(box){const tr=box.querySelector('.track');let x=0,v=0,act=false,lx=0,lt=0,raf=0,sx=0;
  const lim=()=>Math.min(0,box.clientWidth-tr.scrollWidth-(+box.dataset.pad||0));
  const pos=e=>ROT?e.clientY/SC:e.clientX/SC;
  const set=nx=>{x=nx;tr.style.transform=`translateX(${x}px)`;if(box._on)box._on(x);};
  box._pos=()=>x;box._lim=lim;
  box._mover=obj=>{cancelAnimationFrame(raf);const L=lim(),fin=Math.max(L,Math.min(0,obj)),x0=x,t0=performance.now();(function f(t){const u=Math.min(1,(t-t0)/450),k=1-Math.pow(1-u,3);set(x0+(fin-x0)*k);if(u<1)raf=requestAnimationFrame(f);})(t0);};
  box.addEventListener('pointerdown',e=>{act=true;ARR.moved=false;sx=lx=pos(e);lt=performance.now();v=0;cancelAnimationFrame(raf);});
  addEventListener('pointermove',e=>{if(!act)return;const p=pos(e),t=performance.now();const dx=p-lx;if(Math.abs(p-sx)>8)ARR.moved=true;
    let nx=x+dx;const L=lim();if(nx>0)nx=x+dx*.35;if(nx<L)nx=x+dx*.35;set(nx);v=dx/Math.max(1,t-lt)*16;lx=p;lt=t;});
  addEventListener('pointerup',()=>{if(!act)return;act=false;setTimeout(()=>ARR.moved=false,30);
    (function f(){const L=lim();v*=.94;let nx=x+v;if(nx>0){nx=x*.82;v=0}else if(nx<L){nx=L+(x-L)*.82;v=0}set(nx);if(Math.abs(v)>.2||x>.5||x<L-.5)raf=requestAnimationFrame(f);})();});
  if(box.dataset.start)set(Math.max(lim(),-(+box.dataset.start)));}

function montar(el){el.querySelectorAll('[data-count]').forEach(contar);el.querySelectorAll('.hs').forEach(arrastre);}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1600);}

// helpers de arte
const retrato=(id,w,h,extra='')=>{const z=ZOOM[id]||1;return `<div style="position:absolute;inset:0;overflow:hidden;${extra}"><img src="a/c/${id}.webp" style="width:100%;height:100%;object-fit:cover;object-position:${POSC[id]||'50% 0'};transform:scale(${z});transform-origin:50% 8%"></div>`;};
const cuerpo=id=>`a/s/${id}.webp`,cuerpoR=id=>`a/sr/${id}.webp`;
window.POSC={hongo:'50% 38%',duende:'50% 12%',goblin:'50% 10%'};

// ---------- ventana emergente (explicaciones, confirmaciones) ----------
function ventana(html,{ancho=760,cerrar=true}={}){const sc=$('.scr.on')||ST;const w=document.createElement('div');w.className='velo';
  w.innerHTML=`<div class="vent pan" style="width:${ancho}px">${cerrar?`<div class="btn rojo vx" onclick="this.closest('.velo').remove()">${ICO.cruz}</div>`:''}${html}</div>`;
  w.addEventListener('click',e=>{if(e.target===w)w.remove();});sc.appendChild(w);return w;}
// ---------- celebración de compra ----------
function celebra(titulo,items){const w=ventana(`<div class="cel"><div class="rayosC"></div><div class="t amarillo ct">${titulo}</div>
  <div class="its">${items.map((it,i)=>`<div class="ci" style="--d:${i}"><img src="${it.img}"><div class="t s">${it.n}</div></div>`).join('')}</div>
  <div class="btn verde t s brillo" style="width:300px;height:84px;font-size:36px;margin:20px auto 0" onclick="this.closest('.velo').remove()">¡GENIAL!</div></div>`,{ancho:900,cerrar:false});
  w.classList.add('celV');
  for(let i=0;i<40;i++){const c=document.createElement('i');c.className='confeti';c.style.cssText=`left:${Math.random()*100}%;background:hsl(${Math.random()*360},90%,60%);animation-delay:${Math.random()*.6}s;animation-duration:${1.6+Math.random()*1.4}s;transform:rotate(${Math.random()*360}deg)`;w.appendChild(c);}
  return w;}
// ---------- mano guía con globo ----------
function guia(sel,texto,{dx=0,dy=0,lado=false}={}){const sc=$('.scr.on');const el=sc&&sc.querySelector(sel);if(!el)return;
  const r=el.getBoundingClientRect(),rs=sc.getBoundingClientRect(),k=1/SC;
  let x=(r.left+r.width/2-rs.left)*k,y=(r.top+r.height/2-rs.top)*k;if(ROT){x=(r.top+r.height/2-rs.top)*k;y=(rs.right-r.right+r.width/2)*k;}
  const g=document.createElement('div');g.className='guia';g.style.left=(x+dx)+'px';g.style.top=(y+dy)+'px';
  g.innerHTML=`<div class="globo t xs">${texto}</div><div class="mano">👆</div>`;if(lado)g.classList.add('lado');g.onclick=()=>g.remove();sc.appendChild(g);
  el.addEventListener('click',()=>g.remove(),{once:true});return g;}
