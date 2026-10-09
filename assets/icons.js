/* Titan Crashers · íconos propios (v85), estilo inspirado en Brawl Stars: contorno oscuro grueso, sombra abajo y brillo.
   ICON(nombre, tamaño) devuelve un <svg>. Todos se dibujan en una caja de 64x64. */
(function () {
  'use strict';
  const O = '#10152a';                       // color del contorno y de la sombra
  const S = 'stroke="' + O + '" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';
  const s3 = 'stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const hi = d => `<path d="${d}" fill="#fff" opacity=".45"/>`;   // brillo (no lleva sombra)
  const B = {
    coin: `<circle cx="32" cy="32" r="24" fill="#ffbe1a" ${S}/><circle cx="32" cy="32" r="16" fill="#ffd84a" ${s3}/><path d="M32 22l7 5-3 8h-8l-3-8z" fill="#e89a00" ${s3}/>@@${hi('M17 26a16 16 0 0 1 13-12l1 4a12 12 0 0 0-10 9z')}`,
    gem: `<path d="M20 10h24l12 14-24 32L8 24z" fill="#2fb4ff" ${S}/><path d="M8 24h48M20 10l-2 14 14 32 14-32-2-14M18 24l14-14 14 14" fill="none" ${s3}/><path d="M20 10h24l12 14H8z" fill="#9cf0ff" opacity=".75"/>@@${hi('M14 22l8-9h6l-8 9z')}`,
    trophy: `<path d="M18 12c-8 0-12 4-11 10s7 10 14 10M46 12c8 0 12 4 11 10s-7 10-14 10" fill="none" ${S}/><path d="M17 8h30v14c0 12-7 19-15 19s-15-7-15-19z" fill="#ffc21a" ${S}/><rect x="27" y="40" width="10" height="8" fill="#e89a00" ${S}/><rect x="17" y="48" width="30" height="9" rx="2" fill="#8a4dff" ${S}/>@@${hi('M21 12h5v12c0 5 2 9 5 11-5-1-10-6-10-12z')}`,
    shop: `<rect x="12" y="26" width="40" height="30" rx="3" fill="#ffe6b8" ${S}/><path d="M8 14h48l-3 14H11z" fill="#ff4d5e" ${S}/><path d="M20 14l-2 14M32 14v14M44 14l2 14" stroke="#fff" stroke-width="5"/><path d="M8 14h48l-3 14H11z" fill="none" ${S}/><rect x="26" y="38" width="12" height="18" rx="2" fill="#2f7bff" ${S}/><rect x="15" y="34" width="8" height="8" rx="1" fill="#7fd0ff" ${s3}/><rect x="41" y="34" width="8" height="8" rx="1" fill="#7fd0ff" ${s3}/>`,
    cards: `<rect x="8" y="14" width="26" height="36" rx="4" fill="#8a4dff" transform="rotate(-14 21 32)" ${S}/><rect x="26" y="10" width="28" height="40" rx="4" fill="#2f7bff" transform="rotate(10 40 30)" ${S}/><path d="M41 21l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#ffd84a" transform="rotate(10 40 30)" ${s3}/>@@${hi('M30 13l8 1-1 6-8-1z')}`,
    ball: `<circle cx="32" cy="32" r="24" fill="#fff" ${S}/><path d="M32 22l9 6-3 10H26l-3-10z" fill="#1b2140" ${s3}/><path d="M32 8v14M41 28l13-4M38 38l7 12M26 38l-7 12M23 28l-13-4" fill="none" ${s3}/><path d="M12 22l-2 8 5 4M52 22l2 8-5 4M24 52l8 4 8-4M28 8l4-1 4 1" fill="#1b2140" ${s3}/>`,
    battle: `<path d="M18 46L50 14M46 46L14 14" stroke="${O}" stroke-width="11" stroke-linecap="round"/><path d="M18 46L50 14M46 46L14 14" stroke="#e6edf7" stroke-width="5.5" stroke-linecap="round"/><path d="M13 39l12 12M51 39L39 51" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M13 39l12 12M51 39L39 51" stroke="#ffb020" stroke-width="5" stroke-linecap="round"/><path d="M17 49l-7 7M47 49l7 7" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M17 49l-7 7M47 49l7 7" stroke="#a0582a" stroke-width="5" stroke-linecap="round"/>`,
    shirt: `<path d="M22 8l-14 8 5 14 7-3v29h24V27l7 3 5-14-14-8c-1 5-5 8-10 8s-9-3-10-8z" fill="#2f7bff" ${S}/><path d="M22 8c1 5 5 8 10 8s9-3 10-8" fill="none" stroke="#fff" stroke-width="4"/><path d="M22 8c1 5 5 8 10 8s9-3 10-8" fill="none" ${s3}/><path d="M29 30v18M35 30v18" stroke="#fff" stroke-width="3" opacity=".8"/>@@${hi('M24 30v20h4V28z')}`,
    medal: `<path d="M18 6h10l8 20h-10zM46 6H36l-8 20h10z" fill="#ff4d5e" ${S}/><path d="M36 6h10l-8 20h-10z" fill="#2f7bff" ${S}/><circle cx="32" cy="40" r="16" fill="#ffc21a" ${S}/><path d="M32 31l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#fff3b0" ${s3}/>`,
    news: `<path d="M10 12h38v40H16c-4 0-6-2-6-6z" fill="#f2f4f8" ${S}/><path d="M48 22h6v24c0 4-2 6-6 6" fill="#cfd6e4" ${S}/><rect x="16" y="18" width="14" height="12" fill="#ff4d5e" ${s3}/><path d="M34 20h9M34 27h9M16 36h27M16 43h27" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
    menu: `<rect x="10" y="12" width="44" height="9" rx="4.5" fill="#fff" ${s3}/><rect x="10" y="27.5" width="44" height="9" rx="4.5" fill="#fff" ${s3}/><rect x="10" y="43" width="44" height="9" rx="4.5" fill="#fff" ${s3}/>`,
    stadium: `<ellipse cx="32" cy="38" rx="27" ry="17" fill="#8a5a2b" ${S}/><ellipse cx="32" cy="35" rx="21" ry="11" fill="#3ccf5a" ${S}/><path d="M32 24v22M11 35h42" stroke="#fff" stroke-width="2.5" opacity=".9"/><ellipse cx="32" cy="35" rx="5" ry="3" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M14 22l2-10M50 22l-2-10" stroke="${O}" stroke-width="4" stroke-linecap="round"/><circle cx="16" cy="11" r="4" fill="#ffe14d" ${s3}/><circle cx="48" cy="11" r="4" fill="#ffe14d" ${s3}/>`,
    help: `<path d="M8 14c0-4 3-7 7-7h34c4 0 7 3 7 7v22c0 4-3 7-7 7H30l-12 11v-11h-3c-4 0-7-3-7-7z" fill="#2f9bff" ${S}/><path d="M25 19c0-4 3-6 7-6s7 2 7 6-3 5-5 6-2 2-2 4" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M25 19c0-4 3-6 7-6s7 2 7 6-3 5-5 6-2 2-2 4" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><circle cx="32" cy="36" r="4" fill="#fff" ${s3}/>`,
    tv: `<path d="M24 6l8 9 8-9" fill="none" ${S}/><rect x="6" y="15" width="52" height="38" rx="7" fill="#8a4dff" ${S}/><rect x="12" y="21" width="32" height="26" rx="5" fill="#3ccf5a" ${s3}/><circle cx="28" cy="34" r="6" fill="#fff" ${s3}/><circle cx="51" cy="27" r="3.5" fill="#ffd84a" ${s3}/><circle cx="51" cy="39" r="3.5" fill="#ffd84a" ${s3}/>`,
    star: `<path d="M32 6l8 16 18 3-13 12 3 18-16-9-16 9 3-18L6 25l18-3z" fill="#ffc21a" ${S}/>@@${hi('M30 14l-4 10-9 2 7 6z')}`,
    win: `<circle cx="32" cy="32" r="24" fill="#3ccf5a" ${S}/><path d="M20 33l8 8 16-17" fill="none" stroke="${O}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 33l8 8 16-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    loss: `<circle cx="32" cy="32" r="24" fill="#ff4d5e" ${S}/><path d="M23 23l18 18M41 23L23 41" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M23 23l18 18M41 23L23 41" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
    draw: `<circle cx="32" cy="32" r="24" fill="#9aa6c4" ${S}/><path d="M21 26h22M21 38h22" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M21 26h22M21 38h22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
    chart: `<rect x="8" y="8" width="48" height="48" rx="8" fill="#1f3f86" ${S}/><rect x="16" y="34" width="8" height="14" fill="#ff4d5e" ${s3}/><rect x="28" y="24" width="8" height="24" fill="#ffd84a" ${s3}/><rect x="40" y="16" width="8" height="32" fill="#3ccf5a" ${s3}/>`,
    net: `<path d="M8 50V14h48v36" fill="#dfe8f6" ${S}/><path d="M8 26h48M8 38h48M20 14v36M32 14v36M44 14v36" stroke="#8b9ab8" stroke-width="2.5"/><path d="M8 50V14h48v36" fill="none" stroke="#fff" stroke-width="5"/><path d="M8 50V14h48v36" fill="none" ${s3}/><circle cx="40" cy="42" r="9" fill="#fff" ${s3}/><path d="M40 38l3 2-1 4h-4l-1-4z" fill="#1b2140"/>`,
    flag: `<path d="M14 8v50" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M14 8v50" stroke="#cfd8e8" stroke-width="3" stroke-linecap="round"/><path d="M16 10h34l-6 10 6 10H16z" fill="#3ccf5a" ${S}/>`,
    gear: `<path d="M28 6h8l2 7 6 3 6-4 6 6-4 6 3 6 7 2v8l-7 2-3 6 4 6-6 6-6-4-6 3-2 7h-8l-2-7-6-3-6 4-6-6 4-6-3-6-7-2v-8l7-2 3-6-4-6 6-6 6 4 6-3z" fill="#9aa6c4" ${S}/><circle cx="32" cy="32" r="9" fill="#1f3f86" ${S}/>`,
    back: `<path d="M38 10L14 32l24 22V40h14V24H38z" fill="#ffd84a" ${S}/>@@${hi('M34 18L22 30h4z')}`,
    close: `<path d="M18 18l28 28M46 18L18 46" stroke="${O}" stroke-width="13" stroke-linecap="round"/><path d="M18 18l28 28M46 18L18 46" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
    plus: `<path d="M32 14v36M14 32h36" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M32 14v36M14 32h36" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
    info: `<circle cx="32" cy="32" r="24" fill="#2f7bff" ${S}/><circle cx="32" cy="19" r="4.5" fill="#fff" ${s3}/><path d="M32 29v17" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M32 29v17" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
    lock: `<path d="M20 28v-7a12 12 0 0 1 24 0v7" fill="none" stroke="${O}" stroke-width="10"/><path d="M20 28v-7a12 12 0 0 1 24 0v7" fill="none" stroke="#cfd8e8" stroke-width="4"/><rect x="12" y="28" width="40" height="28" rx="5" fill="#ffc21a" ${S}/><circle cx="32" cy="40" r="4" fill="${O}"/><path d="M32 42v7" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`,
    clock: `<circle cx="32" cy="34" r="23" fill="#fff" ${S}/><path d="M32 20v14l9 6" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M24 6h16" stroke="${O}" stroke-width="6" stroke-linecap="round"/>`,
    gift: `<rect x="10" y="26" width="44" height="30" rx="3" fill="#8a4dff" ${S}/><rect x="6" y="18" width="52" height="11" rx="3" fill="#b07aff" ${S}/><path d="M32 18v38" stroke="#ffd84a" stroke-width="7"/><path d="M32 18v38" fill="none" ${s3} stroke-width="0"/><path d="M32 18c-6-10-16-10-14-3 1 4 8 4 14 3zM32 18c6-10 16-10 14-3-1 4-8 4-14 3z" fill="#ffd84a" ${s3}/>`,
    friends: `<circle cx="22" cy="22" r="10" fill="#ffd84a" ${S}/><path d="M6 54c0-12 7-18 16-18s16 6 16 18z" fill="#2f7bff" ${S}/><circle cx="44" cy="24" r="9" fill="#ff9f43" ${S}/><path d="M34 54c0-10 4-16 10-16s14 6 14 16z" fill="#ff4d5e" ${S}/>`,
    xp: `<path d="M32 6l20 12v28L32 58 12 46V18z" fill="#2f9bff" ${S}/><path d="M32 18l5 9 10 2-7 7 2 10-10-5-10 5 2-10-7-7 10-2z" fill="#fff" ${s3}/>`,
  };
  const cache = {};
  function svgOf(n) {
    if (cache[n]) return cache[n];
    const b = B[n]; if (!b) return '';
    const [body, glow] = b.split('@@');
    const shadow = body.replace(/fill="(?!none)[^"]*"/g, 'fill="' + O + '"').replace(/stroke="(?!none)[^"]*"/g, 'stroke="' + O + '"').replace(/opacity="[^"]*"/g, '');
    return (cache[n] = `<g transform="translate(0 2.6)" opacity=".7">${shadow}</g>${body}${glow || ''}`);
  }
  window.ICON = function (n, size, cls) {
    const s = size || 28;
    return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="-2 -2 68 70" width="${s}" height="${s}" aria-hidden="true">${svgOf(n)}</svg>`;
  };
  window.ICON_NAMES = Object.keys(B);
})();
