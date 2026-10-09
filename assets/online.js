/* v60 · Titan Crashers en línea (fase 1) · v79: la economía la decide el servidor
   Cuentas con Google y correo, progreso guardado en Firestore (players/{uid}) y ranking real.
   Si Firebase no carga (sin internet), el juego sigue funcionando con el guardado del teléfono. */
(function(){
'use strict';
const CFG={apiKey:"AIzaSyBydPAhUyHTn9I1OzVsaw8k45m4Pucn0l8",authDomain:"pong2-74a2pv.firebaseapp.com",databaseURL:"https://pong2-74a2pv-default-rtdb.firebaseio.com",projectId:"pong2-74a2pv",storageBucket:"pong2-74a2pv.appspot.com",messagingSenderId:"148757338908",appId:"1:148757338908:web:06a85a56513ab51d19b8d9"};
const SDK='https://www.gstatic.com/firebasejs/10.12.2/';
const COL='players';
const NET=window.NET={state:'cargando',user:null,offline:false,bootDone:false};
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
let auth=null,db=null,FV=null,authKnown=false,syncT=null,lastUp=null,uploading=false,again=false;

// ---------- utilidades ----------
const h=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const say=t=>{try{toast(t);}catch(e){}};
function loadScript(src,ms){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=false;
  const t=setTimeout(()=>rej(new Error('tiempo')),ms||15000);s.onload=()=>{clearTimeout(t);res();};s.onerror=()=>{clearTimeout(t);rej(new Error('red'));};document.head.appendChild(s);});}
const ERR={
  'auth/invalid-email':'Ese correo no es válido.',
  'auth/missing-password':'Escribe tu contraseña.',
  'auth/weak-password':'La contraseña necesita al menos 6 caracteres.',
  'auth/email-already-in-use':'Ese correo ya tiene cuenta. Usa “Entrar”.',
  'auth/user-not-found':'No hay cuenta con ese correo. Usa “Crear cuenta”.',
  'auth/wrong-password':'Contraseña incorrecta.',
  'auth/invalid-credential':'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials':'Correo o contraseña incorrectos.',
  'auth/too-many-requests':'Demasiados intentos. Espera un momento.',
  'auth/network-request-failed':'Sin conexión. Revisa tu internet.',
  'auth/popup-closed-by-user':'Cerraste la ventana de Google.',
  'auth/cancelled-popup-request':'Cerraste la ventana de Google.',
  'auth/unauthorized-domain':'Este sitio no está autorizado en Firebase (Dominios autorizados).',
  'auth/operation-not-allowed':'Ese método de entrada no está activado en Firebase.',
  'permission-denied':'El servidor rechazó el guardado.',
  'unavailable':'Sin conexión con el servidor.'
};
const errTxt=e=>ERR[e&&e.code]||((e&&e.message)?String(e.message).replace(/^Firebase:\s*/,''):'Algo salió mal.');

// ---------- estilos de la pantalla de entrada ----------
const css=document.createElement('style');css.textContent=`
#login{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;background:radial-gradient(ellipse at 50% 30%,rgba(120,180,255,.35),rgba(120,180,255,0) 60%),repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 2px,transparent 2px 46px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 2px,transparent 2px 46px),linear-gradient(#2f66d6,#1b3f9e);overflow-y:auto}
#login.hide{display:none}
#login .lg-box{width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:14px}
#login .lg-logo{font-family:"Lilita One","Arial Rounded MT Bold",system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;line-height:.86;margin-bottom:4px}
#login .lg-logo b{font-weight:400;font-size:clamp(52px,17vw,96px);background:linear-gradient(#fff6b8 0,#ffd23a 45%,#f39a12 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:5px #3a1d00;paint-order:stroke fill;filter:drop-shadow(0 5px 0 #3a1d00)}
#login .lg-logo i{font-style:normal;margin-top:6px;font-size:clamp(24px,8vw,44px);letter-spacing:6px;padding:3px 18px 5px 24px;background:linear-gradient(#3d7bff,#1f4cc4);border:4px solid #0b1a3d;border-radius:12px;-webkit-text-stroke:3px #0b1a3d;paint-order:stroke fill;box-shadow:0 5px 0 #0b1a3d;transform:rotate(-2deg);color:#fff}
#login .mpanel{width:100%;max-width:360px;padding:16px 14px;text-align:center}
#login .lg-sub{font-family:system-ui,sans-serif;font-size:13px;color:#d6e2ff;margin:0 0 12px}
#login .btn{width:100%;margin:0 0 10px}
#login .btn.gg{background:#fff;color:#1f2a44;-webkit-text-stroke:0}
#login .btn.gg svg{width:22px;height:22px;flex:none}
#login form{display:flex;flex-direction:column;gap:8px;margin:2px 0 6px;text-align:left}
#login input{width:100%;font-family:system-ui,sans-serif;font-size:16px;padding:11px 12px;border-radius:11px;border:3px solid #0a1636;background:#0f2659;color:#fff;box-sizing:border-box}
#login input::placeholder{color:#8ea6dd}
#login .lg-row{display:flex;gap:8px}#login .lg-row .btn{margin:0}
#login .lg-link{background:none;border:0;color:#ffe066;font-family:system-ui,sans-serif;font-size:13px;text-decoration:underline;padding:6px;cursor:pointer}
#login .lg-msg{min-height:1.2em;font-family:system-ui,sans-serif;font-size:13px;color:#ffd0d4;margin:4px 0 0}
#login .lg-msg.ok{color:#b9ffcf}
#login .lg-or{display:flex;align-items:center;gap:8px;font-family:system-ui,sans-serif;font-size:12px;color:#b8c8f0;margin:2px 0 10px}
#login .lg-or:before,#login .lg-or:after{content:'';flex:1;height:2px;background:rgba(255,255,255,.18);border-radius:2px}
#login .lg-wait{display:flex;flex-direction:column;align-items:center;gap:10px;font-size:18px;padding:8px 0}
#login .lg-wait .sp{font-size:40px;animation:lgSpin 1s linear infinite}
@keyframes lgSpin{to{transform:rotate(360deg)}}
.set .acc{font-family:system-ui,sans-serif;font-size:12px;color:var(--muted,#b8c8f0);word-break:break-all}
`;document.head.appendChild(css);

const G_ICON='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

// ---------- pantalla de entrada ----------
let ov=null,mode='inicio';
function overlay(){if(ov)return ov;ov=document.createElement('div');ov.id='login';ov.className='hide';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Entrar a Titan Crashers');document.body.appendChild(ov);return ov;}
function frame(inner){overlay().innerHTML=`<div class="lg-box"><div class="lg-logo"><img src="assets/ui/logo.webp?v=78" alt="Titan Crashers" style="width:min(78vw,380px);height:auto;filter:drop-shadow(0 6px 10px rgba(0,0,30,.45))" onerror="this.src='assets/ui/logo.png?v=78'"></div><div class="mpanel">${inner}</div></div>`;ov.classList.remove('hide');}
function hideLogin(){if(ov)ov.classList.add('hide');setTimeout(()=>{try{needName();}catch(e){}},500);}
function msg(t,ok){const m=ov&&ov.querySelector('.lg-msg');if(m){m.textContent=t||'';m.classList.toggle('ok',!!ok);}}
function busy(on){if(!ov)return;ov.querySelectorAll('button,input').forEach(b=>b.disabled=!!on);}

function showWait(t){frame(`<div class="lg-wait ct"><span class="sp">⚽</span>${h(t)}</div>`);}
function showStart(){mode='inicio';
  frame(`<p class="lg-sub">Entra para guardar tus copas, cartas y aparecer en el ranking.</p>
   ${isNative?'':`<button class="btn gg ct" id="lgG">${G_ICON}<span>Continuar con Google</span></button><div class="lg-or">o</div>`}
   <button class="btn b ct" id="lgMail">✉️ Entrar con correo</button>
   ${isNative?'<p class="lg-sub" style="margin-top:4px">La entrada con Google llegará pronto a la app. Por ahora usa tu correo.</p>':''}
   <p class="lg-msg"></p>`);
  const g=document.getElementById('lgG');if(g)g.onclick=google;
  document.getElementById('lgMail').onclick=()=>showMail('entrar');}
function showMail(m){mode=m;const reg=m==='crear';
  frame(`<div class="mtitle ct">${reg?'Crear cuenta':'Entrar con correo'}</div>
   <form id="lgF" novalidate>
     <input id="lgE" type="email" inputmode="email" autocomplete="email" placeholder="Correo" required>
     <input id="lgP" type="password" autocomplete="${reg?'new-password':'current-password'}" placeholder="Contraseña${reg?' (mínimo 6)':''}" required>
     ${reg?'<input id="lgP2" type="password" autocomplete="new-password" placeholder="Repite la contraseña" required>':''}
     <button class="btn ${reg?'g':'y'} ct" type="submit" style="margin-top:4px">${reg?'Crear cuenta':'Entrar'}</button>
   </form>
   <p class="lg-msg"></p>
   ${reg?'<button class="lg-link" id="lgSw">Ya tengo cuenta</button>':'<button class="lg-link" id="lgSw">Crear una cuenta nueva</button><br><button class="lg-link" id="lgRs">¿Olvidaste tu contraseña?</button>'}
   <br><button class="lg-link" id="lgBk">← Volver</button>`);
  const E=document.getElementById('lgE');setTimeout(()=>{try{E.focus();}catch(e){}},50);
  document.getElementById('lgF').onsubmit=ev=>{ev.preventDefault();mailGo(reg);};
  document.getElementById('lgSw').onclick=()=>showMail(reg?'entrar':'crear');
  document.getElementById('lgBk').onclick=showStart;
  const rs=document.getElementById('lgRs');if(rs)rs.onclick=resetPass;}
function showOffline(why){mode='offline';
  frame(`<div class="mtitle ct">Sin conexión</div><p class="lg-sub">${h(why||'No se pudo conectar con el servidor.')} Puedes jugar sin conexión; tu progreso se queda en este teléfono.</p>
   <button class="btn y ct" id="lgR">🔄 Reintentar</button><button class="btn b ct" id="lgOff">Jugar sin conexión</button>`);
  document.getElementById('lgR').onclick=()=>{showWait('Conectando…');start();};
  document.getElementById('lgOff').onclick=()=>{NET.offline=true;NET.state='offline';hideLogin();};}

async function google(){if(!auth)return;msg('');busy(true);
  const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await auth.signInWithPopup(p);}
  catch(e){if(e&&(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')){try{await auth.signInWithRedirect(p);return;}catch(e2){e=e2;}}
    busy(false);msg(errTxt(e));}}
async function mailGo(reg){const E=document.getElementById('lgE').value.trim(),P=document.getElementById('lgP').value;
  if(!/^\S+@\S+\.\S+$/.test(E)){msg('Escribe un correo válido.');return;}
  if(P.length<6){msg('La contraseña necesita al menos 6 caracteres.');return;}
  if(reg){const P2=document.getElementById('lgP2').value;if(P!==P2){msg('Las contraseñas no coinciden.');return;}}
  busy(true);msg('');
  try{if(reg)await auth.createUserWithEmailAndPassword(E,P);else await auth.signInWithEmailAndPassword(E,P);}
  catch(e){busy(false);msg(errTxt(e));}}
async function resetPass(){const E=document.getElementById('lgE').value.trim();
  if(!/^\S+@\S+\.\S+$/.test(E)){msg('Escribe tu correo arriba y vuelve a tocar aquí.');return;}
  busy(true);try{auth.languageCode='es';await auth.sendPasswordResetEmail(E);msg('Te mandamos un correo para cambiar tu contraseña.',true);}catch(e){msg(errTxt(e));}busy(false);}

// ---------- v79: economía en el servidor ----------
// Con cuenta, monedas, gemas, cartas, sobres y copas los cambia SOLO el servidor (Cloudflare). El teléfono pide y el servidor responde.
const HTTP=(window.WS_SERVER||'wss://wild-strikers.ramoncas0234.workers.dev').replace(/^ws/,'http');
const ECON_KEY='tc_econ_on';
NET.econOn=(()=>{try{return localStorage.getItem(ECON_KEY)==='1';}catch(e){return false;}})();
NET.econCall=async function(a){if(!NET.user)throw new Error('Necesitas tu cuenta');
  let tok;try{tok=await NET.user.getIdToken();}catch(e){throw new Error('Sin conexión');}
  let r,j=null;const ac=new AbortController(),to=setTimeout(()=>ac.abort(),12000);
  try{r=await fetch(HTTP+'/econ',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tok},body:JSON.stringify(a),signal:ac.signal});}catch(e){clearTimeout(to);throw new Error('Sin conexión con el servidor');}
  clearTimeout(to);
  try{j=await r.json();}catch(e){}
  if(!j)throw new Error('El servidor no respondió');
  if(j.off){NET.econOn=false;try{localStorage.setItem(ECON_KEY,'0');}catch(e){}throw new Error('El servidor todavía no guarda la economía');}
  return j;};
// al entrar: el servidor manda la cartera (cuentas de antes: la pasa una vez desde la nube; cuentas nuevas: empiezan de cero)
async function econLogin(){
  try{const j=await NET.econCall({t:'get'});
    if(j.E){NET.econOn=true;try{localStorage.setItem(ECON_KEY,'1');}catch(e){}if(j.now)window.SRV_DT=j.now-Date.now();applyE(j.E);orig.call(window);}
  }catch(e){console.warn('[econ]',e.message);}}

// ---------- progreso en la nube ----------
const score=s=>s?((s.maxTrophies||0)*3+(s.wins||0)*5+(s.losses||0)+(s.lvl||1)*20):0;
function clean(s){const o=JSON.parse(JSON.stringify(s));delete o.owner;return o;}
function docData(){const s=save;
  if(NET.econOn){const sv=clean(s);for(const k of ECON.EK)sv[k]=FV.delete();   // se borra la economía vieja de la nube (ahora la tiene el servidor)
    return{avatar:String(s.avatar||'⚽').slice(0,8),color:String(s.color||'#2f7bff').slice(0,9),country:String(s.country||'MX').slice(0,3),save:sv,updatedAt:FV.serverTimestamp()};}
  return{name:String(s.name||'Jugador').slice(0,16),avatar:String(s.avatar||'⚽').slice(0,8),color:String(s.color||'#2f7bff').slice(0,9),country:String(s.country||'MX').slice(0,3),
  trophies:Math.max(0,Math.floor(s.trophies||0)),maxTrophies:Math.max(0,Math.floor(s.maxTrophies||0)),lvl:Math.max(1,Math.floor(s.lvl||1)),
  wins:Math.floor(s.wins||0),losses:Math.floor(s.losses||0),draws:Math.floor(s.draws||0),save:clean(s),updatedAt:FV.serverTimestamp()};}
async function upload(){if(!NET.user||!db)return;if(uploading){again=true;return;}uploading=true;
  const ref=db.collection(COL).doc(NET.user.uid),d=docData();
  if(!NET.econOn&&lastUp&&d.trophies>lastUp.trophies)d.matchAt=FV.serverTimestamp();
  try{await ref.set(d,{merge:true});lastUp={trophies:d.trophies};NET.state='sync';}
  catch(e){console.warn('[online] guardado rechazado',e);
    if(e&&e.code==='permission-denied'&&!NET.econOn){ // copas fuera de rango: se respeta lo que tiene la nube
      try{const snap=await ref.get();if(snap.exists){const c=snap.data();save.trophies=c.trophies;save.maxTrophies=c.maxTrophies;lastUp={trophies:c.trophies};orig.call(window);await ref.set(docData(),{merge:true});}}catch(e2){}
    }}
  uploading=false;if(again){again=false;upload();}}
function queue(){if(!NET.user)return;clearTimeout(syncT);syncT=setTimeout(upload,1500);}
const orig=window.persist;
window.persist=function(){try{save.savedAt=Date.now();}catch(e){}orig.apply(this,arguments);queue();};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&syncT){clearTimeout(syncT);syncT=null;upload();}});

async function onLogin(u){NET.user=u;NET.offline=false;NET.state='sync';showWait('Cargando tu progreso…');
  const ref=db.collection(COL).doc(u.uid);let snap=null;
  try{snap=await ref.get();}catch(e){console.warn('[online] no se pudo leer',e);showOffline(errTxt(e));return;}
  const local=save;let pick;
  if(snap.exists&&snap.data().save){const cloud=snap.data().save;
    if(local.owner===u.uid)pick=(local.savedAt||0)>(cloud.savedAt||0)?local:cloud;   // mismo dueño: gana lo más reciente
    else if(!local.owner&&score(local)>score(cloud))pick=local;                        // progreso sin cuenta mayor que la nube
    else pick=cloud;
    lastUp={trophies:snap.data().trophies||0};
  }else{pick=(local.owner&&local.owner!==u.uid)?defSave():local;lastUp=null;}
  if(NET.econOn&&pick!==local&&local.owner===u.uid){pick=JSON.parse(JSON.stringify(pick));for(const k of ECON.EK)if(local[k]!==undefined)pick[k]=local[k];}   // v79: la nube ya no guarda la economía en save (la tiene el servidor)
  let s;try{s=migrate(JSON.parse(JSON.stringify(pick)));}catch(e){s=migrate(defSave());}
  s.owner=u.uid;
  // v91: ya no se usa el nombre de Google: el jugador escribe el suyo
  window.save=s;
  await econLogin();
  try{orig.call(window);applySettings();renderTab();}catch(e){console.warn(e);}
  await upload();
  hideLogin();if(snap.exists&&save.name)say('¡Hola, '+save.name+'!');else say('Cuenta lista. ¡A jugar!');}

function decide(){if(!NET.bootDone)return;
  if(NET.state==='sinred'){showOffline();return;}
  if(!authKnown){showWait('Conectando…');return;}
  if(!NET.user&&!NET.offline)showStart();}

async function start(){
  try{
    if(!window.firebase||!firebase.auth){
      await loadScript(SDK+'firebase-app-compat.js');
      await loadScript(SDK+'firebase-auth-compat.js');
      await loadScript(SDK+'firebase-firestore-compat.js');
    }
    if(!firebase.apps.length)firebase.initializeApp(CFG);
    auth=firebase.auth();db=firebase.firestore();FV=firebase.firestore.FieldValue;auth.languageCode='es';
    NET.state='listo';
    try{await auth.getRedirectResult();}catch(e){console.warn('[online] redirect',e);}
    auth.onAuthStateChanged(u=>{authKnown=true;
      if(u){if(!NET.user||NET.user.uid!==u.uid)onLogin(u);}
      else{NET.user=null;lastUp=null;decide();}});
  }catch(e){console.warn('[online] Firebase no cargó',e);NET.state='sinred';decide();}
}

// ---------- llamado desde la pantalla de carga ----------
NET.afterBoot=function(){NET.bootDone=true;decide();};if(window.BOOT_DONE)NET.bootDone=true;
NET.signOut=async function(){if(!auth)return;clearTimeout(syncT);try{await upload();}catch(e){}await auth.signOut();say('Sesión cerrada');};
NET.login=function(){NET.offline=false;if(NET.state==='sinred'){showWait('Conectando…');start();}else showStart();};

// ---------- ranking real ----------
let rankCache={},rankBusy=false;
function rowHTML(x,i){const L=LEAGUES[leagueIdx(x.trophies||0)];return `<div class="rrow ${x.me?'me':''}"><span class="pos ct">${i}</span><span class="av">${h(x.avatar||'⚽')}</span><span class="nm ct">${h(x.name||'Jugador')}<small>${flag(x.country||'MX')} ${L.ic} ${h(L.n)}</small></span><span class="tr ct">🏆 ${x.trophies||0}</span></div>`;}
window.renderRank=function(){const el=document.getElementById('sc-rank');if(!el)return;
  const tab=rankTab==='local'?'local':'global',key=tab+(tab==='local'?save.country:'');
  const me={name:save.name,avatar:save.avatar,country:save.country,trophies:save.trophies,me:true};
  const head=`<div class="tabs"><button class="tab ${tab==='global'?'on':''}" data-t="global"><b>🌍 Global</b></button><button class="tab ${tab==='local'?'on':''}" data-t="local"><b>${flag(save.country)} Local</b></button></div>`;
  const bind=()=>el.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{rankTab=b.dataset.t;renderRank();});
  if(!NET.user||!db){el.innerHTML=head+`<div class="rk">${rowHTML(me,'—')}</div><p class="note">${NET.offline||NET.state==='sinred'?'El ranking necesita conexión.':'Entra con tu cuenta para aparecer en el ranking.'}</p>${NET.user?'':'<div style="text-align:center"><button class="btn y sm" id="rkIn">Entrar</button></div>'}`;
    bind();const b=document.getElementById('rkIn');if(b)b.onclick=NET.login;return;}
  const draw=(list,err)=>{if(metaTab!=='rank')return;
    let html='';if(err)html=`<p class="note">${h(err)}</p>`;
    else{const i=list.findIndex(x=>x.id===NET.user.uid);const L=list.map(x=>Object.assign({},x,x.id===NET.user.uid?me:{}));
      html=`<div class="rk">${i<0?rowHTML(me,'50+'):''}${L.map((x,k)=>rowHTML(x,k+1)).join('')||''}</div>${L.length?'':'<p class="note">Todavía no hay nadie aquí. ¡Sé el primero!</p>'}`;}
    el.innerHTML=head+html+`<p class="note">${tab==='local'?'Jugadores de tu país · cambia tu país en tu perfil.':'Los 50 mejores del mundo.'}</p>`;bind();};
  const c=rankCache[key];if(c&&Date.now()-c.t<30000){draw(c.list);return;}
  el.innerHTML=head+`<div class="lg-wait ct" style="display:flex;justify-content:center;padding:30px 0;font-size:16px">Cargando ranking…</div>`;bind();
  if(rankBusy)return;rankBusy=true;
  let q=db.collection(COL);if(tab==='local')q=q.where('country','==',save.country);q=q.orderBy('trophies','desc').limit(50);
  q.get().then(s=>{const list=s.docs.map(d=>Object.assign({id:d.id},d.data()));rankCache[key]={t:Date.now(),list};rankBusy=false;draw(list);})
   .catch(e=>{rankBusy=false;console.warn('[online] ranking',e);
     draw(null,e&&e.code==='failed-precondition'?'Falta crear el índice del ranking local en Firebase.':'No se pudo cargar el ranking. '+errTxt(e));});};

// ---------- cuenta en Configuración ----------
const origSettings=window.openSettings;
window.openSettings=function(){origSettings.apply(this,arguments);const p=document.querySelector('#modal .mpanel')||document.querySelector('.mpanel');if(!p)return;
  const row=document.createElement('div');row.className='set';
  if(NET.user){const who=NET.user.email||NET.user.displayName||'Cuenta';
    row.innerHTML=`<div><b class="ct">Cuenta</b><small class="acc">${h(who)} · progreso guardado en la nube</small></div><button class="btn r sm" id="soB">Salir</button>`;}
  else row.innerHTML=`<div><b class="ct">Cuenta</b><small class="acc">${NET.offline?'Jugando sin conexión':'Sin iniciar sesión'}</small></div><button class="btn y sm" id="siB">Entrar</button>`;
  const first=p.querySelector('.set');if(first)p.insertBefore(row,first);else p.appendChild(row);
  const pr=document.createElement('div');pr.className='set';pr.innerHTML='<div><b class="ct">Prueba de conexión</b><small>Mide el ping con el servidor de partidas</small></div><button class="btn b sm" id="pgB">Probar</button>';
  row.after(pr);document.getElementById('pgB').onclick=()=>{try{closeModal();}catch(e){}NET.pingTest();};
  const so=document.getElementById('soB');if(so)so.onclick=()=>askConfirm('¿Cerrar sesión?','Tu progreso queda guardado en tu cuenta.',()=>{try{closeModal();}catch(e){}NET.signOut();});
  const si=document.getElementById('siB');if(si)si.onclick=()=>{try{closeModal();}catch(e){}NET.login();};};

// ---------- v61: prueba de conexión con el servidor de partidas (Cloudflare) ----------
const SERVER=window.WS_SERVER||'wss://wild-strikers.ramoncas0234.workers.dev';
NET.server=SERVER;
let pws=null,pT=null,pings=[],pState={};
function qual(ms){return ms==null?['—','#b8c8f0']:ms<=80?['Excelente','#7dffa8']:ms<=150?['Buena','#d8ff7d']:ms<=250?['Regular','#ffd27d']:['Mala','#ff8a8a'];}
function pRender(){const el=document.getElementById('pgBody');if(!el)return;
  const n=pings.length,avg=n?Math.round(pings.reduce((a,b)=>a+b,0)/n):null,mn=n?Math.round(Math.min(...pings)):null,mx=n?Math.round(Math.max(...pings)):null,q=qual(avg);
  const J=(pState.jugadores||[]).map(j=>`<div class="rrow ${j.id===pState.id?'me':''}"><span class="pos ct">${j.id===pState.id?'Tú':''}</span><span class="av">${h(j.avatar)}</span><span class="nm ct">${h(j.name)}</span><span class="tr ct" style="color:${qual(j.ping)[1]}">${j.ping==null?'…':j.ping+' ms'}</span></div>`).join('');
  el.innerHTML=`<div class="pf-grid" style="grid-template-columns:repeat(3,1fr)"><div class="pfs"><span>📶</span><b class="ct" style="color:${q[1]}">${avg==null?'—':avg+' ms'}</b><small>Promedio · ${q[0]}</small></div><div class="pfs"><span>⬇️</span><b class="ct">${mn==null?'—':mn+' ms'}</b><small>Mejor</small></div><div class="pfs"><span>⬆️</span><b class="ct">${mx==null?'—':mx+' ms'}</b><small>Peor</small></div></div>
   <p class="note">${pws&&pws.readyState===1?'Conectado'+(pState.lugar?' al centro de datos <b>'+h(pState.lugar)+'</b>':'')+(pState.version?' · '+h(pState.version):''):pState.err?h(pState.err):'Conectando…'}</p>
   <div class="mtitle ct" style="font-size:16px;margin:6px 0">En la sala ${h(pState.sala||'')} (${(pState.jugadores||[]).length})</div><div class="rk">${J||'<p class="note">Nadie todavía.</p>'}</div>`;}
function pStop(){clearInterval(pT);pT=null;if(pws){try{pws.close();}catch(e){}pws=null;}}
function pStart(sala){pStop();pings=[];pState={sala};pRender();
  const q=new URLSearchParams({sala,nombre:save.name||'Jugador',av:save.avatar||'⚽'});
  try{pws=new WebSocket(SERVER+'/ws?'+q);}catch(e){pState.err='No se pudo abrir la conexión.';pRender();return;}
  pws.onopen=()=>{pT=setInterval(()=>{if(pws&&pws.readyState===1)pws.send(JSON.stringify({t:'ping',c:performance.now()}));},500);};
  let k=0;
  pws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data);}catch(e){return;}
    if(m.t==='hola'){pState.id=m.id;pState.lugar=m.lugar;pState.version=m.version;}
    else if(m.t==='pong'){pings.push(performance.now()-m.c);if(pings.length>20)pings.shift();if(++k%4===0){const a=pings.reduce((x,y)=>x+y,0)/pings.length;pws.send(JSON.stringify({t:'miPing',ms:a}));}}
    else if(m.t==='sala'){pState.jugadores=m.jugadores;}
    else if(m.t==='toque'){say('👋 ¡Toque de '+m.de+'!');try{sfx('whistle');}catch(e){}try{navigator.vibrate&&navigator.vibrate(80);}catch(e){}}
    pRender();};
  pws.onclose=()=>{clearInterval(pT);if(!pState.err)pState.err='Desconectado.';pRender();};
  pws.onerror=()=>{pState.err='No se pudo conectar con el servidor. ¿Ya se publicó en Cloudflare?';pRender();};}
NET.pingTest=function(){
  showModal(`<div class="mpanel ep"><button class="mclose ct" id="mx">✕</button><div class="mtitle ct">Prueba de conexión</div>
   <p class="desc" style="margin-top:0">Abre esta pantalla en dos teléfonos con la misma sala para que se vean.</p>
   <div style="display:flex;gap:8px;align-items:center"><input id="pgS" maxlength="12" value="PRUEBA" autocomplete="off" style="flex:1;text-transform:uppercase"><button class="btn y sm" id="pgGo" style="margin:0">Entrar</button></div>
   <div id="pgBody" style="margin-top:10px"></div>
   <div class="acts"><button class="btn b" id="pgT">👋 Mandar toque</button></div></div>`);
  const close=()=>{pStop();closeModal();};
  document.getElementById('mx').onclick=close;
  const go=()=>{const v=document.getElementById('pgS').value.toUpperCase().replace(/[^A-Z0-9]/g,'')||'PRUEBA';document.getElementById('pgS').value=v;pStart(v);};
  document.getElementById('pgGo').onclick=go;
  document.getElementById('pgT').onclick=()=>{if(pws&&pws.readyState===1){pws.send(JSON.stringify({t:'toque',c:Date.now()}));say('Toque enviado');}else say('Primero conéctate');};
  go();};
// cerrar la prueba si se cierra el modal tocando afuera
document.addEventListener('click',e=>{if(pws&&e.target&&e.target.id==='modal')pStop();},true);

start();
})();
