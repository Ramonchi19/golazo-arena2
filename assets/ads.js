/* Titan Crashers · anuncios (v116)
   Todo es opcional: videos con recompensa que el jugador elige ver, un video con premio cada 5 partidos (solo si dice que sí)
   y anuncios nativos acomodados dentro de las pantallas, con los colores del juego. Nada de banners ni anuncios que salten solos.
   En la APK usa AdMob con los IDs reales. En la página web se muestra un anuncio simulado para probar sin teléfono. */
(function () {
  'use strict';
  // ===== INTERRUPTOR: true = anuncios de PRUEBA de Google (seguro para probar) · false = anuncios REALES (dinero) =====
  // La APK lee este mismo renglón para poner el ID de app de prueba o el real.
  const PRUEBA = true;
  const P = 'ca-app-pub-3351017803207592/';
  // videos con recompensa (una unidad por cada lugar, para ver en AdMob cuál rinde más)
  const RW = {
    pack: P + '9544282634',    // rw_acelerar_sobre
    gold2: P + '4417088193',   // rw_monedas_x2
    tro: P + '3104006524',     // rw_recuperar_copas
    coins: P + '2046075729',   // rw_monedas_gratis
    freep: P + '8419912385',   // rw_sobre_gratis
    free: P + '5793749045',    // rw_sobre_menos1h
    up: P + '4480667371',      // rw_mejora_descuento
    offer: P + '3585378949'    // rw_oferta_descuento
  };
  let RWI = P + '1268180679'; // int_cada_5_partidos (intersticial con recompensa, solo si el jugador acepta)
  // anuncios nativos por pantalla
  const NAT = {
    inicio: P + '8747960301', tienda: P + '3902827739', cartas: P + '7333052265',
    fin: P + '2787302597', ranking: P + '5846464796', perfil: P + '1146917866'
  };

  // IDs de prueba oficiales de Google (Android)
  if (PRUEBA) {
    const T = 'ca-app-pub-3940256099942544/';
    Object.keys(RW).forEach(k => RW[k] = T + '5224354917');                  // video con recompensa
    RWI = T + '5354046379';                                                   // intersticial con recompensa
    Object.keys(NAT).forEach(k => NAT[k] = T + (k === 'fin' ? '2247696110' : '1044960115')); // nativo (el chico sin video)
  }
  const C = window.Capacitor, native = !!(C && C.isNativePlatform && C.isNativePlatform());
  let AM = null, ready = false, canAds = true, initP = null;
  try { if (native) AM = (C.Plugins && C.Plugins.AdMob) || (C.registerPlugin && C.registerPlugin('AdMob')); } catch (e) {}
  // consentimiento de Google (UMP): en países donde se pide (Europa), sale el aviso de Google antes del primer anuncio
  function init() {
    if (!AM) return Promise.resolve();
    if (initP) return initP;
    initP = (async () => {
      try {
        let ci = await AM.requestConsentInfo();
        if (ci && ci.isConsentFormAvailable && ci.status === 'REQUIRED') ci = await AM.showConsentForm();
        canAds = !ci || ci.canRequestAds !== false;
      } catch (e) { console.warn('[ads] consent', e); }
      try { await AM.initialize(PRUEBA ? { initializeForTesting: true } : {}); ready = true; } catch (e) { console.warn('[ads] init', e); }
    })();
    return initP;
  }
  // se inicia un momento después de abrir para no frenar la carga
  setTimeout(init, 2500);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const muteGame = on => { try { if (typeof AC !== 'undefined' && AC) on ? AC.suspend() : AC.resume(); } catch (e) {} };

  // ---------- anuncio simulado (página web) ----------
  function fake(kind) {
    return new Promise(res => {
      const secs = 5, el = document.createElement('div');
      el.id = 'adSim';
      el.innerHTML = `<div class="ads-box"><small class="ads-tag">Anuncio simulado</small><div class="ads-vid"><span class="ads-play">▶</span><b class="ct">Video con recompensa</b><small>Aquí saldrá un anuncio de Google en la APK</small></div>
        <div class="ads-bar"><i></i></div><button class="btn g sm" id="adX" disabled>Espera ${secs} s</button>
        <button class="ads-skip" id="adQ">Salir sin premio</button></div>`;
      document.body.appendChild(el);
      const bar = el.querySelector('.ads-bar i'), btn = el.querySelector('#adX'), t0 = performance.now();
      let done = false;
      const tick = () => { if (done) return; const k = Math.min(1, (performance.now() - t0) / (secs * 1000)); bar.style.width = (k * 100) + '%';
        const left = Math.ceil(secs * (1 - k)); if (k < 1) { btn.textContent = 'Espera ' + left + ' s'; requestAnimationFrame(tick); }
        else { btn.disabled = false; btn.textContent = '¡Cobrar premio!'; } };
      requestAnimationFrame(tick);
      const end = ok => { done = true; el.classList.add('out'); setTimeout(() => el.remove(), 200); res(ok); };
      btn.onclick = () => end(true);
      el.querySelector('#adQ').onclick = () => end(false);
    });
  }

  // ---------- AdMob (APK) ----------
  // ev: prefijo de eventos; prep/show: métodos del plugin
  async function nativeRewarded(adId, ev, prep, show) {
    let got = false, closed = false; const hs = [];
    try {
      hs.push(await AM.addListener(ev + 'Reward', () => { got = true; }));
      hs.push(await AM.addListener(ev + 'Dismissed', () => { closed = true; }));
      hs.push(await AM.addListener(ev + 'FailedToShow', () => { closed = true; }));
    } catch (e) {}
    try {
      await AM[prep]({ adId, isTesting: PRUEBA });
      const r = await AM[show](); if (r && (r.amount != null || r.type)) got = true;
      for (let i = 0; i < 40 && !closed; i++) await wait(100);
    } catch (e) { console.warn('[ads] ' + prep, e); hs.forEach(h => { try { h.remove(); } catch (e) {} }); throw e; }
    hs.forEach(h => { try { h.remove(); } catch (e) {} });
    return got;
  }

  let busy = false;
  async function run(fn) {
    if (busy) return false; busy = true; muteGame(true);
    try { NATIVE.hold(true); } catch (e) {}
    try {
      if (native && AM) {
        await init();
        if (!canAds) { toastSafe('Los anuncios no están disponibles ahora'); return false; }
        try { return await fn(); } catch (e) { toastSafe('No hay video disponible ahora. Intenta en un rato'); return false; }
      }
      return await fake();
    } finally { busy = false; muteGame(false); try { NATIVE.hold(false); } catch (e) {} }
  }
  const toastSafe = m => { try { if (typeof toast === 'function') toast(m); } catch (e) {} };

  // ---------- anuncios nativos ----------
  // Cada pantalla tiene un hueco <div class="nat" data-nat="tienda"></div>. Google pinta su anuncio encima del hueco
  // (es una vista nativa sobre la página), así que se esconde cuando hay una ventana, un video o el partido encima.
  const NATIVE = (function () {
    const on = native && !!AM;
    const STYLE = {
      backgroundColor: '#0b3550', borderColor: '#3fd3e0', borderWidth: 2, cornerRadius: 16,
      headlineColor: '#ffffff', headlineFontSize: 16, bodyColor: '#bfe9f2', bodyFontSize: 13,
      callToActionBackgroundColor: '#ffd23f', callToActionTextColor: '#10223a', callToActionFontSize: 15
    };
    const feeds = new Map();   // lugar → { feed, el, failed }
    let holds = 0, paused = false, timer = 0, relayout = false;
    function topLayer() {
      // la capa de arriba manda: ventana > fin de partido > pantallas
      const m = document.getElementById('modal');
      if (m && !m.classList.contains('hide')) return m;
      if (document.getElementById('adSim')) return null;
      const end = document.getElementById('end');
      if (end && !end.classList.contains('hide')) return end;
      const meta = document.getElementById('meta');
      if (meta && meta.classList.contains('hide')) return null;
      const cf = document.getElementById('confirm');
      if (cf && !cf.classList.contains('hide')) return null;
      if (document.getElementById('po2')) return null;
      return document.getElementById('screens');
    }
    function visibleSlot() {
      const L = topLayer(); if (!L) return null;
      for (const el of L.querySelectorAll('.nat[data-nat]')) if (el.offsetParent !== null && !el.classList.contains('nat-off')) return el;
      return null;
    }
    async function setPaused(p) {
      if (p === paused) return; paused = p;
      for (const f of feeds.values()) { if (!f.feed) continue; try { p ? await f.feed.pause() : f.feed.resume(); } catch (e) {} }
    }
    async function feedFor(place) {
      let f = feeds.get(place);
      // si falló, se vuelve a intentar después de 3 minutos
      if (f && f.failed && Date.now() - f.t > 180e3) { feeds.delete(place); try { f.feed && await f.feed.destroy(); } catch (e) {} f = null; }
      if (f) return f;
      f = { feed: null, el: null, failed: false, place, t: Date.now() }; feeds.set(place, f);
      // como mucho dos activos: se borra el más viejo
      if (feeds.size > 2) { const [k, old] = feeds.entries().next().value; feeds.delete(k); try { old.feed && await old.feed.destroy(); } catch (e) {} }
      try {
        await init(); if (!canAds || !window.NativeAdFeed) throw new Error('sin anuncios');
        const small = place === 'fin';
        f.feed = await window.NativeAdFeed.create({ feedId: 'tc-' + place, adId: NAT[place], template: small ? 'small' : 'medium', style: STYLE, isTesting: PRUEBA });
        f.feed.addListener('nativeAdFailedToLoad', () => { f.failed = true; f.t = Date.now(); if (f.el) f.el.classList.add('nat-off'); });
        f.feed.addListener('nativeAdLoaded', () => { if (f.el) f.el.classList.add('nat-ok'); });
      } catch (e) { console.warn('[ads] nativo', place, e); f.failed = true; }
      return f;
    }
    let syncing = false;
    async function sync() {
      if (!on || syncing) return; syncing = true;
      try {
        if (holds > 0) { await setPaused(true); return; }
        const el = visibleSlot();
        if (!el) { await setPaused(true); return; }
        const place = el.dataset.nat; if (!NAT[place]) return;
        const f = await feedFor(place);
        if (f.failed) { el.classList.add('nat-off'); await setPaused(true); return; }
        // si la pantalla se volvió a dibujar, se regresa el mismo hueco para no pedir otro anuncio
        if (f.el && f.el !== el && !f.el.isConnected && !f.el.classList.contains('nat-off')) { el.replaceWith(f.el); relayout = true; return; }
        if (f.el !== el) {
          try { if (f.el) f.feed.detach(f.el); } catch (e) {}
          f.el = el; f.feed.attach('tc-' + place + '-1', el);
        }
        const wasPaused = paused;
        await setPaused(false);
        // solo se vuelve a medir cuando algo se movió sin desplazar (cambio de pantalla, animación de entrada)
        if (relayout && !wasPaused) { relayout = false; try { await f.feed.invalidateLayout(); } catch (e) {} }
        else relayout = false;
      } finally { syncing = false; }
    }
    // web: un recuadro de muestra con el mismo estilo para ver cómo queda
    function webMock(el) {
      if (el.dataset.mock) return; el.dataset.mock = 1;
      el.innerHTML = `<div class="nat-mock"><span class="nat-ad">Anuncio</span><div class="nat-row"><i class="nat-ic"></i><div><b>Nombre del anunciante</b><small>Texto del anuncio de Google, se adapta a los colores del juego</small></div></div>${el.classList.contains('nat-s') ? '' : '<div class="nat-media"></div>'}<span class="nat-cta">Instalar</span></div>`;
    }
    function scan() { if (on) return; document.querySelectorAll('.nat[data-nat]').forEach(webMock); }
    const kick = () => { if (timer) return; timer = setTimeout(() => { timer = 0; scan(); sync(); }, 300); };
    // revisa seguido: ventanas, sobres y partidos cambian lo que hay encima
    setInterval(() => { if (on) sync(); }, 1200);
    if (typeof MutationObserver !== 'undefined') {
      const mo = new MutationObserver(kick);
      const start = () => { const b = document.body; if (b) mo.observe(b, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); };
      if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
    }
    document.addEventListener('animationend', e => { if (e.target && e.target.classList && (e.target.classList.contains('screen') || e.target.closest('#modal,#end'))) { relayout = true; kick(); } }, true);
    return { kick, sync, hold(h) { holds = Math.max(0, holds + (h ? 1 : -1)); kick(); if (h && on) setPaused(true); } };
  })();

  const ADS = window.ADS = {
    native, prueba: PRUEBA,
    // video con recompensa: true solo si el jugador lo vio completo. place = clave del premio (pack, gold2, …)
    reward(place) { const id = RW[place] || RW.coins; return run(() => nativeRewarded(id, 'onRewardedVideoAd', 'prepareRewardVideoAd', 'showRewardVideoAd')); },
    // video con premio cada 5 partidos (solo después de que el jugador acepta)
    rewardInter() { return run(() => nativeRewarded(RWI, 'onRewardedInterstitialAd', 'prepareRewardInterstitialAd', 'showRewardInterstitialAd')); },
    // hueco de anuncio nativo para meter en el HTML de una pantalla
    slot(place, small) { return `<div class="nat-wrap"><div class="nat${small ? ' nat-s' : ''}" data-nat="${place}"></div></div>`; },
    natKick() { NATIVE.kick(); },
    // aviso de privacidad de Google (para el menú de ajustes)
    async privacy() { if (!AM) return false; try { await init(); await AM.showPrivacyOptionsForm(); return true; } catch (e) { return false; } }
  };
  // en Ajustes (solo en la APK): botón para cambiar el permiso de anuncios de Google
  if (native) window.addEventListener('load', () => {
    const orig = window.openSettings; if (typeof orig !== 'function') return;
    window.openSettings = function () {
      orig.apply(this, arguments);
      const p = document.querySelector('#modal .mpanel'); if (!p) return;
      const row = document.createElement('div'); row.className = 'set';
      row.innerHTML = '<div><b class="ct">Privacidad de anuncios</b><small>Elige cómo Google usa tus datos para anuncios</small></div><button class="btn b sm" id="advB">Abrir</button>';
      p.appendChild(row);
      row.querySelector('#advB').onclick = async () => { try { closeModal(); } catch (e) {} const ok = await ADS.privacy(); if (!ok) toastSafe('Aquí no hace falta cambiar nada'); };
    };
  });
})();
