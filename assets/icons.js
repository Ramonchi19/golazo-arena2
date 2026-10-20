/* Titan Crashers · íconos propios (v156-157): estilo facetado como las insignias de Clash —
   sin contorno negro, caras planas con luz arriba-izquierda y sombra abajo-derecha, canto en relieve (abajo-izquierda) y brillo blanco.
   ICON(nombre, tamaño) devuelve un <svg>. Todo se dibuja en una caja de 64x64. */
(function () {
  'use strict';
  // materiales: [luz, base, medio, oscuro, canto]
  const MT = {
    gold: ['#ffe066', '#ffb400', '#f58a0c', '#e35a00', '#6b3810'],
    blue: ['#8cc2ff', '#448aff', '#2f6fe8', '#1048a8', '#0b2a66'],
    red: ['#ff9a8f', '#f5434f', '#d92a3f', '#a8172f', '#4f0c1a'],
    green: ['#a8f27a', '#4cc93c', '#2fa832', '#1c7a26', '#0b3f17'],
    purple: ['#cfa6ff', '#9257ff', '#7438e6', '#5320b8', '#26105e'],
    white: ['#ffffff', '#eef3fa', '#d3dceb', '#a7b3cb', '#3a4566'],
    grey: ['#d8e0ee', '#a9b6cc', '#8a98b2', '#66748f', '#2a3350'],
    dark: ['#5c6c90', '#36456e', '#2a3860', '#1c2848', '#0a1230'],
    cyan: ['#d6fdff', '#62e8ff', '#2cc2ee', '#1489cc', '#0a3a6e'],
    orange: ['#ffc58a', '#ff8a2a', '#f06a12', '#c84a00', '#5e2306'],
    brown: ['#d9a06a', '#a8692e', '#8a521e', '#673a12', '#331a06'],
    teal: ['#a9fff2', '#2fd8c8', '#19b5aa', '#0d8a84', '#063e42'],
  };
  const DX = -2.6, DY = 3.4, STEPS = 5;     // hacia dónde sale el canto (relieve)
  const f = (d, c, extra) => `<path d="${d}" fill="${c}"${extra || ''}/>`;
  const pts = a => 'M' + a.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';
  // canto: la silueta repetida corrida hacia abajo-izquierda (se ve como un bloque grueso)
  function ext(d, col) { let s = ''; for (let i = STEPS; i >= 1; i--) { const k = i / STEPS; s += `<path d="${d}" fill="${col}" transform="translate(${(DX * k).toFixed(2)} ${(DY * k).toFixed(2)})"/>`; } return s; }
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  // media luna/semicírculo: la mitad de abajo-derecha de un círculo (cara en sombra)
  function halfDisc(cx, cy, r, ang) { const a = ang == null ? -Math.PI / 4 : ang, x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a), x2 = cx - r * Math.cos(a), y2 = cy - r * Math.sin(a); return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`; }
  function ring(cx, cy, r, ri, ang) {   // aro en dos caras (luz arriba-izq / sombra abajo-der)
    const a = ang == null ? -Math.PI / 4 : ang, c = Math.cos(a), s = Math.sin(a);
    const P = (R, k) => [(cx + k * R * c).toFixed(2), (cy + k * R * s).toFixed(2)];
    const [ax, ay] = P(r, 1), [bx, by] = P(r, -1), [cx2, cy2] = P(ri, -1), [dx, dy] = P(ri, 1);
    return {
      dark: `M${ax} ${ay}A${r} ${r} 0 0 1 ${bx} ${by}L${cx2} ${cy2}A${ri} ${ri} 0 0 0 ${dx} ${dy}Z`,
      lite: `M${bx} ${by}A${r} ${r} 0 0 1 ${ax} ${ay}L${dx} ${dy}A${ri} ${ri} 0 0 0 ${cx2} ${cy2}Z`,
    };
  }
  // insignia redonda con aro biselado (moneda, ok, info…)
  function badge(cx, cy, r, m, inner) { const M = MT[m], ri = r * .76, R = ring(cx, cy, r, ri);
    return ext(circ(cx, cy, r), M[4]) + f(circ(cx, cy, r), M[1]) + f(R.lite, M[0]) + f(R.dark, M[3]) + f(circ(cx, cy, ri), inner || M[1]) + f(halfDisc(cx, cy, ri, Math.PI * .25 - Math.PI / 2 + .3), inner ? 'rgba(0,0,0,.12)' : M[2]); }
  // polígono con biselado: cada lado hacia adentro con su cara (luz arriba-izq, sombra abajo-der)
  function bevel(P, m, w, faceCol) { const M = MT[m], n = P.length;
    let cx = 0, cy = 0; P.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= n; cy /= n;
    const I = P.map(p => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy); return [p[0] - dx / l * w * 1.15, p[1] - dy / l * w * 1.15]; });
    let s = ext(pts(P), M[4]) + f(pts(P), M[1]);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, ex = P[j][0] - P[i][0], ey = P[j][1] - P[i][1], nx = ey, ny = -ex, dot = (nx * -0.7071 + ny * -0.7071) / Math.hypot(nx, ny);
      const col = dot > .35 ? M[0] : dot > -.2 ? M[1] : dot > -.75 ? M[2] : M[3]; s += f(pts([P[i], P[j], I[j], I[i]]), col); }
    return s + f(pts(I), faceCol || M[1]);
  }
  // bloque simple: silueta + canto + cara clara + cara oscura (dadas)
  const blk = (d, m, lite, dark) => { const M = MT[m]; return ext(d, M[4]) + f(d, M[1]) + (lite ? f(lite, M[0]) : '') + (dark ? f(dark, M[3]) : ''); };
  const shine = (x, y, w, h) => f(`M${x} ${y + h}L${x + h * .6} ${y}h${w}l${-h * .6} ${h}z`, '#fff', ' opacity=".85"');
  function starPts(cx, cy, R, r, n) { const a = []; n = n || 5; for (let i = 0; i < n * 2; i++) { const t = -Math.PI / 2 + i * Math.PI / n, k = i % 2 ? r : R; a.push([cx + k * Math.cos(t), cy + k * Math.sin(t)]); } return a; }
  // estrella facetada: cada punta partida en cara clara y cara oscura
  function star(cx, cy, R, r, m, noExt) { const M = MT[m], P = starPts(cx, cy, R, r); let s = noExt ? '' : ext(pts(P), M[4]);
    for (let i = 0; i < 10; i++) { const a = P[i], b = P[(i + 1) % 10], tip = i % 2 === 0 ? a : b, ang = Math.atan2(tip[1] - cy, tip[0] - cx);
      const lit = Math.cos(ang + Math.PI * .75); s += f(pts([[cx, cy], a, b]), i % 2 === 0 ? (lit > .2 ? M[0] : M[1]) : (lit > .2 ? M[1] : M[2])); }
    return s; }
  function gearPts(cx, cy, R, r, n) { const a = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, w = Math.PI / n * .55;
    a.push([cx + r * Math.cos(t - w * 1.6), cy + r * Math.sin(t - w * 1.6)], [cx + R * Math.cos(t - w), cy + R * Math.sin(t - w)], [cx + R * Math.cos(t + w), cy + R * Math.sin(t + w)], [cx + r * Math.cos(t + w * 1.6), cy + r * Math.sin(t + w * 1.6)]); } return a; }
  const G = MT.gold, W = MT.white, B2 = MT.blue, R2 = MT.red, GR = MT.green, P2 = MT.purple, D2 = MT.dark;
  // balón: blanco con parches oscuros y media cara en sombra
  function ballG(cx, cy, r) { const k = r / 22;
    const pent = (x, y, s, rot) => pts(Array.from({ length: 5 }, (_, i) => { const t = rot + i * Math.PI * 2 / 5; return [x + s * Math.cos(t), y + s * Math.sin(t)]; }));
    return ext(circ(cx, cy, r), W[4]) + f(circ(cx, cy, r), W[1]) + f(halfDisc(cx, cy, r), W[2]) + f(pent(cx, cy - 1 * k, 7 * k, -Math.PI / 2), D2[1]) +
      f(pent(cx - 15 * k, cy + 4 * k, 4.5 * k, -Math.PI / 2 + .6), D2[1]) + f(pent(cx + 15 * k, cy + 4 * k, 4.5 * k, -Math.PI / 2 - .6), D2[2]) + f(pent(cx - 8 * k, cy + 17 * k, 4.2 * k, .2), D2[2]) + f(pent(cx + 8 * k, cy + 17 * k, 4.2 * k, -.2), D2[2]) +
      f(pent(cx, cy - 20 * k, 3.5 * k, Math.PI / 2), D2[1]) + shine(cx - 14 * k, cy - 14 * k, 6 * k, 3.5 * k); }
  const B = {
    coin: badge(33, 31, 25, 'gold') + f(pts([[33, 18], [44, 31], [33, 44], [22, 31]]), G[3]) + f(pts([[33, 18], [44, 31], [33, 31]]), G[0]) + f(pts([[33, 18], [22, 31], [33, 31]]), '#fff7c2') + f(pts([[22, 31], [33, 44], [33, 31]]), G[2]) + shine(17, 13, 6, 4),
    gem: (() => { const M = MT.cyan, P = [[18, 12], [46, 12], [58, 25], [32, 56], [6, 25]];
      return ext(pts(P), M[4]) + f(pts([[18, 12], [46, 12], [40, 25], [24, 25]]), M[0]) + f(pts([[18, 12], [24, 25], [6, 25]]), M[1]) + f(pts([[46, 12], [58, 25], [40, 25]]), M[2]) +
        f(pts([[6, 25], [24, 25], [32, 56]]), M[1]) + f(pts([[24, 25], [40, 25], [32, 56]]), M[2]) + f(pts([[40, 25], [58, 25], [32, 56]]), M[3]) + shine(21, 14, 7, 4); })(),
    trophy: (() => { const cup = 'M14 8h36v12c0 13-8 21-18 21S14 33 14 20z';
      return ext('M8 12h10v10c-6 0-10-4-10-10zM56 12H46v10c6 0 10-4 10-10z', G[4]) + f('M8 12h10v4H12c0 3 2 5 6 5v3c-6 0-10-5-10-12z', G[2]) + f('M56 12H46v4h6c0 3-2 5-6 5v3c6 0 10-5 10-12z', G[3]) +
        ext(cup, G[4]) + f(cup, G[1]) + f('M14 8h10v12c0 10 3 17 8 21-10 0-18-8-18-21z', G[0]) + f('M40 8h10v12c0 13-8 21-18 21 5-4 8-11 8-21z', G[2]) +
        blk('M27 40h10v8H27z', 'gold', 'M27 40h4v8h-4z', 'M34 40h3v8h-3z') + blk('M17 48h30v8H17z', 'purple', 'M17 48h30v3H17z', 'M17 54h30v2H17z') + shine(17, 10, 4, 6); })(),
    xp: bevel([[32, 4], [56, 18], [56, 46], [32, 60], [8, 46], [8, 18]], 'blue', 6) + star(32, 33, 15, 6.5, 'white', true),
    medal: blk('M18 4h10l8 20h-10z', 'red', 'M18 4h4l8 20h-4z', null) + blk('M46 4H36l-8 20h10z', 'blue', null, 'M46 4h-4l-8 20h4z') + badge(32, 39, 18, 'gold') + star(32, 40, 9, 4, 'gold', true),
    star: star(32, 33, 28, 12, 'gold') + shine(22, 18, 5, 3),
    win: badge(32, 31, 26, 'green') + ext('M18 31l5-5 6 6 13-13 5 5-18 18z', GR[4]) + f('M18 31l5-5 6 6 13-13 5 5-18 18z', '#fff') + f('M29 32l13-13 5 5-18 18z', W[2]),
    loss: badge(32, 31, 26, 'red') + ext('M20 24l5-5 7 7 7-7 5 5-7 7 7 7-5 5-7-7-7 7-5-5 7-7z', R2[4]) + f('M20 24l5-5 7 7 7-7 5 5-7 7 7 7-5 5-7-7-7 7-5-5 7-7z', '#fff') + f('M32 33l7 7 5-5-7-7z', W[2]),
    draw: badge(32, 31, 26, 'grey') + blk('M19 22h26v7H19z', 'white', null, 'M19 27h26v2H19z') + blk('M19 34h26v7H19z', 'white', null, 'M19 39h26v2H19z'),
    info: badge(32, 31, 26, 'blue') + blk(circ(32, 19, 4.5), 'white') + blk('M27 26h9v19h-9z', 'white', null, 'M33 26h3v19h-3z'),
    help: (() => { const d = 'M10 8h44a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H30l-12 11v-11h-8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z';
      return ext(d, B2[4]) + f(d, B2[1]) + f('M10 8h44a4 4 0 0 1 4 4v3H6v-3a4 4 0 0 1 4-4z', B2[0]) + f('M58 36v6a4 4 0 0 1-4 4H30l-12 11v-11h-8a4 4 0 0 1-4-4v-6z', B2[2]) +
        ext('M24 22c0-6 4-9 9-9s9 3 9 8c0 6-7 6-7 11h-6c0-8 7-8 7-11 0-2-1-3-3-3s-3 1-3 4z', B2[4]) + f('M24 22c0-6 4-9 9-9s9 3 9 8c0 6-7 6-7 11h-6c0-8 7-8 7-11 0-2-1-3-3-3s-3 1-3 4z', '#fff') + f(circ(32, 39, 3.6), '#fff') + shine(10, 10, 6, 3); })(),
    lock: blk('M18 28v-8a14 14 0 0 1 28 0v8h-6v-8a8 8 0 0 0-16 0v8z', 'grey', 'M18 28v-8a14 14 0 0 1 6-11.5v4A8 8 0 0 0 24 20v8z', null) + bevel([[12, 28], [52, 28], [52, 58], [12, 58]], 'gold', 4.5) + blk(circ(32, 40, 4.5) + 'M30 42h4v8h-4z', 'brown'),
    clock: badge(32, 34, 26, 'white') + blk('M26 2h12v6H26z', 'grey', 'M26 2h12v2H26z', null) + f('M30 34V18h4v16z', D2[1]) + f('M30.6 32.4l2.8-2.8 9 9-2.8 2.8z', D2[2]) + f(circ(32, 34, 3), R2[1]),
    gift: blk('M10 28h44v30H10z', 'purple', 'M10 28h8v30h-8z', 'M46 28h8v30h-8z') + blk('M6 18h52v12H6z', 'purple', 'M6 18h52v4H6z', null) + f('M28 18h8v40h-8z', G[1]) + f('M33 18h3v40h-3z', G[2]) +
      blk('M32 18c-7-12-18-11-15-3 2 4 9 4 15 3z', 'gold', null, null) + blk('M32 18c7-12 18-11 15-3-2 4-9 4-15 3z', 'gold', null, null),
    friends: blk(circ(22, 20, 9), 'gold', halfDisc(22, 20, 9, Math.PI * .75), null) + blk('M6 56c0-12 7-18 16-18s16 6 16 18z', 'blue', 'M6 56c0-12 7-18 16-18v18z', null) +
      blk(circ(45, 22, 8), 'orange', halfDisc(45, 22, 8, Math.PI * .75), null) + blk('M33 56c0-10 5-16 12-16s13 6 13 16z', 'red', 'M33 56c0-10 5-16 12-16v16z', null),
    menu: [10, 26, 42].map(y => blk(`M8 ${y}h48v10H8z`, 'white', `M8 ${y}h48v3H8z`, `M8 ${y + 8}h48v2H8z`)).join(''),
    close: ext('M10 18l8-8 14 14 14-14 8 8-14 14 14 14-8 8-14-14-14 14-8-8 14-14z', W[4]) + f('M10 18l8-8 14 14 14-14 8 8-14 14 14 14-8 8-14-14-14 14-8-8 14-14z', W[1]) + f('M32 24l14-14 8 8-14 14z', W[0]) + f('M32 40l14 14 8-8-14-14z', W[2]) + f('M18 54l14-14-6-6-14 14z', W[3]),
    plus: ext('M26 8h12v18h18v12H38v18H26V38H8V26h18z', W[4]) + f('M26 8h12v18h18v12H38v18H26V38H8V26h18z', W[1]) + f('M26 8h12v4H26zM8 26h18v4H8zM38 26h18v4H38z', W[0]) + f('M38 34h18v4H38zM26 52h12v4H26z', W[2]),
    back: ext('M28 8L6 32l22 24V42h28V22H28z', G[4]) + f('M28 8L6 32l22 24V42h28V22H28z', G[1]) + f('M28 8L6 32h8l14-15zM28 22h28v6H28z', G[0]) + f('M6 32l22 24V48L14 32zM28 38h28v4H28z', G[3]),
    shirt: (() => { const d = 'M22 6l10 5 10-5 18 10-6 13-7-3v32H17V26l-7 3-6-13z';
      return ext(d, B2[4]) + f(d, B2[1]) + f('M22 6l10 5v47H17V26l-7 3-6-13z', B2[0]) + f('M42 6l18 10-6 13-7-3v32h-7V11z', B2[2]) + f('M38 26h9v32h-9z', B2[3]) +
        f('M22 6l10 5 10-5-3-1-7 3-7-3z', '#fff') + f('M26 22h4v22h-4zM34 22h4v22h-4z', '#fff', ' opacity=".9"'); })(),
    news: blk('M10 8h40v48H10z', 'white', 'M10 8h40v4H10z', 'M44 8h6v48h-6z') + blk('M50 18h6v38h-6z', 'grey') + blk('M16 16h14v12H16z', 'red', 'M16 16h14v3H16z', null) +
      f('M34 17h10v3H34zM34 24h10v3H34zM16 34h28v3H16zM16 41h28v3H16zM16 48h20v3H16z', D2[2]),
    cards: blk('M8 16l20-6 8 34-20 6z', 'purple', 'M8 16l20-6 1 4-20 6z', 'M28 10l8 34-4 1-8-34z') + bevel([[26, 10], [54, 14], [50, 56], [22, 52]], 'blue', 4) + star(38, 33, 10, 4.5, 'gold', true),
    cards2: blk('M6 18l16-6 10 34-16 6z', 'purple', 'M6 18l16-6 1 4-16 6z', null) + blk('M58 18l-16-6-10 34 16 6z', 'orange', null, 'M58 18l-16-6-1 4 16 6z') + bevel([[20, 6], [44, 6], [44, 54], [20, 54]], 'blue', 4) + star(32, 30, 10, 4.5, 'gold', true),
    ball: ballG(32, 31, 26),
    home2: ballG(28, 34, 22) + ext('M36 2h18L44 22h12L28 62l8-28H26z', G[4]) + f('M36 2h18L44 22h12L28 62l8-28H26z', G[1]) + f('M36 2h8L34 26h-8z', G[0]) + f('M44 22h12L28 62l6-21z', G[2]),
    cart: (() => { const bk = 'M12 24h48l-6 22H18z';
      return ext('M2 14h10l4 10', W[4]) + f('M2 12h11l5 12h-4l-4-8H2z', W[2]) + ballG(38, 13, 11) + f(circ(22, 18, 6.5), G[1]) + f(halfDisc(22, 18, 6.5), G[2]) +
        ext(bk, R2[4]) + f(bk, R2[1]) + f('M12 24h48l-1 4H13z', R2[0]) + f('M54 46H18l-1-4h38z', R2[3]) + f('M24 28h3v14h-3zM35 28h3v14h-3zM46 28h3v14h-3z', R2[3]) +
        blk('M16 46h40v5H16z', 'grey') + blk(circ(22, 56, 5), 'dark', halfDisc(22, 56, 5, Math.PI * .75), null) + blk(circ(50, 56, 5), 'dark', halfDisc(50, 56, 5, Math.PI * .75), null); })(),
    shop: (() => { const M = MT.red;
      return blk('M10 28h44v28H10z', 'white', 'M10 28h6v28h-6z', 'M48 28h6v28h-6z') + ext('M6 10h52l2 16H4z', M[4]) +
        [0, 1, 2, 3, 4].map(i => f(`M${6 + i * 10.4} 10h10.4l${i < 2 ? -0.6 : 0.6} 16H${4 + i * 11.2}z`, i % 2 ? '#fff' : M[1])).join('') + f('M4 24h56v4H4z', M[3]) +
        blk('M26 38h12v18H26z', 'blue', 'M26 38h12v3H26z', 'M35 38h3v18h-3z') + blk('M14 34h8v8h-8zM42 34h8v8h-8z', 'cyan'); })(),
    battle: (() => { const bl = (flip) => { const s = flip ? -1 : 1, X = x => 32 + s * (x - 32), d = a => pts(a.map(p => [X(p[0]), p[1]]));
        return ext(d([[8, 6], [14, 6], [44, 40], [40, 44]]), W[4]) + f(d([[8, 6], [14, 6], [44, 40], [40, 44]]), W[1]) + f(d([[8, 6], [14, 6], [42, 38]]), flip ? W[2] : W[0]) +
          blk(d([[34, 44], [44, 34], [48, 38], [38, 48]]), 'gold') + blk(d([[44, 44], [48, 48], [54, 58], [50, 60], [42, 50]]), 'brown'); };
      return bl(false) + bl(true); })(),
    tv: blk('M18 6l14 10 14-10 3 3-15 11h-4L15 9z', 'grey') + bevel([[6, 18], [58, 18], [58, 56], [6, 56]], 'purple', 4.5, P2[3]) + blk('M12 24h32v26H12z', 'green', 'M12 24h32v4H12z', 'M40 24h4v26h-4z') + blk(circ(51, 30, 3) + circ(51, 42, 3), 'gold'),
    chart: bevel([[6, 6], [58, 6], [58, 58], [6, 58]], 'dark', 4.5) + blk('M14 38h8v12h-8z', 'red', 'M14 38h3v12h-3z', null) + blk('M28 28h8v22h-8z', 'gold', 'M28 28h3v22h-3z', null) + blk('M42 16h8v34h-8z', 'green', 'M42 16h3v34h-3z', null),
    net: blk('M6 10h52v6H6z', 'white', 'M6 10h52v2H6z', null) + blk('M6 10h6v46H6zM52 10h6v46h-6z', 'white', null, 'M10 10h2v46h-2zM56 10h2v46h-2z') +
      f('M12 16h40v40H12z', 'rgba(255,255,255,.18)') + f('M12 24h40v1.6H12zM12 32h40v1.6H12zM12 40h40v1.6H12zM12 48h40v1.6H12zM20 16h1.6v40H20zM28 16h1.6v40H28zM36 16h1.6v40H36zM44 16h1.6v40H44z', 'rgba(255,255,255,.75)') + ballG(40, 44, 10),
    flag: blk('M8 4h6v56H8z', 'white', 'M8 4h2v56H8z', null) + ext('M14 8h34l-8 10 8 10H14z', GR[4]) + f('M14 8h34l-8 10 8 10H14z', GR[1]) + f('M14 8h34l-3 4H14z', GR[0]) + f('M40 18l8 10H14v-4h28z', GR[3]),
    gear: (() => { const P = gearPts(32, 31, 27, 20, 8), M = MT.grey;
      return ext(pts(P), M[4]) + f(pts(P), M[1]) + f(halfDisc(32, 31, 27), M[2]) + f(circ(32, 31, 20), M[1]) + f(halfDisc(32, 31, 20, Math.PI * .75), M[0]) + f(circ(32, 31, 9), D2[2]) + f(halfDisc(32, 31, 9), D2[3]); })(),
    stadium: (() => { const o = 'M4 32c0-11 12-18 28-18s28 7 28 18-12 18-28 18S4 43 4 32z', i = 'M13 32c0-6 8-10 19-10s19 4 19 10-8 10-19 10-19-4-19-10z';
      return ext(o, MT.orange[4]) + f(o, MT.orange[1]) + f('M4 32c0-11 12-18 28-18s28 7 28 18H51c0-6-8-10-19-10s-19 4-19 10z', MT.orange[0]) + f(i, GR[1]) + f('M32 22c11 0 19 4 19 10s-8 10-19 10z', GR[2]) +
        f('M31 22h2v20h-2z', '#fff', ' opacity=".85"') + blk('M10 6h3v14h-3zM51 6h3v14h-3z', 'grey') + blk(circ(11.5, 6, 3) + circ(52.5, 6, 3), 'gold'); })(),
  };

  // ---- v157: avatares (mismo estilo facetado) ----
  const eye = (x, y, r, c) => f(circ(x, y, r), c || '#10152a') + f(circ(x - r * .35, y - r * .35, r * .35), '#fff');
  // cara de animal low-poly: P = puntos de la silueta; la mitad izquierda clara, la derecha oscura
  function face(P, m, cx) { const M = MT[m]; const L = P.filter(p => p[0] <= cx + .01), R = P.filter(p => p[0] >= cx - .01);
    return ext(pts(P), M[4]) + f(pts(P), M[1]) + f(pts([[cx, P.reduce((a, p) => Math.min(a, p[1]), 99)], ...R.filter(p => p[0] > cx), [cx, P.reduce((a, p) => Math.max(a, p[1]), 0)]]), M[2]); }
  Object.assign(B, {
    av_cool: (() => { const M = MT.gold; return badge(32, 32, 26, 'gold', M[1]) + f('M12 24h40v4l-3 9c-1 3-4 4-8 4h-2c-4 0-6-2-7-5l-1-3h-2l-1 3c-1 3-3 5-7 5h-2c-4 0-7-1-8-4l-3-9z', '#10152a') + f('M16 27h10l-1 6h-7zM38 27h10l-2 6h-7z', '#3a4a7a') + f('M22 46c6 4 14 4 20 0', 'none', ' stroke="#6b3810" stroke-width="3.5" stroke-linecap="round"'); })(),
    av_lion: (() => { const mane = pts(starPts(32, 32, 29, 22, 12)), M = MT.orange, Y = MT.gold;
      return ext(mane, M[4]) + f(mane, M[1]) + f(halfDisc(32, 32, 29), M[3]) + f(circ(32, 34, 18), Y[1]) + f(halfDisc(32, 34, 18), Y[2]) + f(circ(18, 18, 5) + circ(46, 18, 5), Y[2]) +
        eye(25, 30, 3) + eye(39, 30, 3) + f(pts([[28, 37], [36, 37], [32, 42]]), '#5a2a10') + f('M26 45c3 3 9 3 12 0', 'none', ' stroke="#5a2a10" stroke-width="2.5" stroke-linecap="round"') + shine(14, 10, 5, 3); })(),
    av_tiger: (() => { const M = MT.orange, P = [[10, 8], [22, 14], [42, 14], [54, 8], [58, 30], [50, 50], [32, 58], [14, 50], [6, 30]];
      return face(P, 'orange', 32) + f('M24 46l8 8 8-8z', '#fff') + f('M10 26l8 2-8 3zM54 26l-8 2 8 3zM28 15l4 8 4-8zM8 36l9 1-8 3zM56 36l-9 1 8 3z', '#10152a') + f('M13 11l6 4-5 3zM51 11l-6 4 5 3z', '#ffd4b0') +
        eye(24, 32, 3.4, '#1c7a26') + eye(40, 32, 3.4, '#1c7a26') + f(pts([[28, 40], [36, 40], [32, 45]]), '#5a2a10'); })(),
    av_eagle: (() => { const W = MT.white, Br = MT.brown, P = [[16, 10], [48, 10], [56, 30], [48, 54], [16, 54], [8, 30]];
      return ext(pts(P), Br[4]) + f(pts(P), Br[1]) + f(pts([[32, 10], [48, 10], [56, 30], [48, 54], [32, 54]]), Br[2]) + f(pts([[16, 10], [48, 10], [52, 22], [32, 30], [12, 22]]), W[1]) + f(pts([[32, 10], [48, 10], [52, 22], [32, 30]]), W[2]) +
        eye(24, 24, 3.5, '#10152a') + eye(40, 24, 3.5, '#10152a') + f('M10 18l14 4M54 18l-14 4', 'none', ' stroke="#10152a" stroke-width="3" stroke-linecap="round"') +
        ext(pts([[26, 30], [38, 30], [36, 42], [32, 50], [28, 42]]), MT.gold[4]) + f(pts([[26, 30], [38, 30], [36, 42], [32, 50], [28, 42]]), MT.gold[1]) + f(pts([[32, 30], [38, 30], [36, 42], [32, 50]]), MT.gold[2]); })(),
    av_wolf: (() => { const P = [[8, 4], [24, 16], [40, 16], [56, 4], [56, 32], [44, 50], [32, 58], [20, 50], [8, 32]];
      return face(P, 'grey', 32) + f(pts([[12, 10], [22, 17], [14, 22]]), '#ffc2c8') + f(pts([[52, 10], [42, 17], [50, 22]]), '#e8a0a8') + f(pts([[20, 40], [44, 40], [32, 58]]), MT.white[1]) + f(pts([[32, 40], [44, 40], [32, 58]]), MT.white[2]) +
        eye(24, 31, 3.2, '#e8a000') + eye(40, 31, 3.2, '#e8a000') + f(pts([[28, 44], [36, 44], [32, 49]]), '#10152a'); })(),
    av_fire: (() => { const o = 'M32 2c4 10 16 14 18 28 2 14-7 28-18 28S12 46 14 32c1-7 5-10 7-16 3 5 3 9 6 11 1-10 2-18 5-25z', i = 'M32 26c3 6 10 9 10 18 0 7-5 12-10 12s-10-5-10-12c0-5 3-7 4-10 2 3 3 4 4 5 0-5 1-9 2-13z';
      return ext(o, MT.red[4]) + f(o, MT.red[1]) + f('M32 2c4 10 16 14 18 28 2 14-7 28-18 28z', MT.red[2]) + f(i, MT.orange[1]) + f('M32 26c3 6 10 9 10 18 0 7-5 12-10 12z', MT.orange[2]) + f('M32 40c2 4 5 5 5 9 0 3-2 5-5 5s-5-2-5-5c0-3 3-5 5-9z', MT.gold[0]); })(),
    av_crown: (() => { const d = 'M6 18l14 12 12-20 12 20 14-12-6 32H12z', G = MT.gold;
      return ext(d, G[4]) + f(d, G[1]) + f('M6 18l14 12 12-20v40H12z', G[0]) + f('M44 30l14-12-6 32H32V10z', G[2]) + blk('M10 46h44v10H10z', 'gold', 'M10 46h44v3H10z', 'M10 53h44v3H10z') +
        f(pts([[32, 30], [37, 36], [32, 42], [27, 36]]), MT.red[1]) + f(pts([[32, 30], [37, 36], [32, 36]]), MT.red[0]) + f(circ(32, 9, 3.5) + circ(6, 16, 3) + circ(58, 16, 3), MT.cyan[1]); })(),
    av_robot: blk('M30 2h4v8h-4z', 'grey') + blk(circ(32, 4, 3.5), 'red') + bevel([[10, 12], [54, 12], [54, 52], [10, 52]], 'grey', 5) + blk('M16 20h32v14H16z', 'dark') + f(circ(24, 27, 4) + circ(40, 27, 4), MT.cyan[1]) + f(circ(23, 26, 1.6) + circ(39, 26, 1.6), '#fff') +
      f('M18 40h28v6H18z', MT.dark[2]) + f('M21 41h3v4h-3zM27 41h3v4h-3zM33 41h3v4h-3zM39 41h3v4h-3z', MT.white[1]) + blk('M4 24h6v14H4zM54 24h6v14h-6z', 'grey'),
    av_alien: (() => { const d = 'M32 4c15 0 26 10 26 24 0 16-14 30-26 30S6 44 6 28C6 14 17 4 32 4z';
      return ext(d, MT.green[4]) + f(d, MT.green[1]) + f('M32 4c15 0 26 10 26 24 0 16-14 30-26 30z', MT.green[2]) + f('M12 26c5-2 12 1 15 7 2 5-4 8-9 6s-9-8-6-13zM52 26c-5-2-12 1-15 7-2 5 4 8 9 6s9-8 6-13z', '#10152a') +
        f('M15 29c2 0 4 1 5 3', 'none', ' stroke="#fff" stroke-width="2" stroke-linecap="round"') + f('M27 48h10', 'none', ' stroke="#0b3f17" stroke-width="3" stroke-linecap="round"') + shine(16, 9, 5, 3); })(),
    av_frog: (() => { const G2 = MT.green, d = 'M6 34c0-10 10-16 26-16s26 6 26 16-10 20-26 20S6 44 6 34z';
      return blk(circ(17, 18, 9), 'green', halfDisc(17, 18, 9, Math.PI * .75), null) + blk(circ(47, 18, 9), 'green', halfDisc(47, 18, 9, Math.PI * .75), null) + ext(d, G2[4]) + f(d, G2[1]) + f('M32 18c16 0 26 6 26 16s-10 20-26 20z', G2[2]) +
        f(circ(17, 18, 5) + circ(47, 18, 5), '#fff') + f(circ(18, 19, 2.6) + circ(48, 19, 2.6), '#10152a') + f('M16 38c8 7 24 7 32 0', 'none', ' stroke="#0b3f17" stroke-width="3.5" stroke-linecap="round"') + f(circ(13, 36, 3) + circ(51, 36, 3), '#ff9aa8', ' opacity=".8"'); })(),
    av_shark: (() => { const M = MT.blue, d = 'M4 38c6-14 18-22 32-22 4-8 8-12 14-14-1 6-2 10-2 16 6 4 10 10 12 20-10 10-24 16-36 16-10 0-16-6-20-16z';
      return ext(d, M[4]) + f(d, M[1]) + f('M36 16c4-8 8-12 14-14-1 6-2 10-2 16z', M[2]) + f('M4 38c8 12 20 12 36 10 8-1 14-4 20-10-10 10-24 16-36 16-10 0-16-6-20-16z', MT.white[1]) +
        f('M14 44l3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5', 'none', ' stroke="#fff" stroke-width="2.4" stroke-linejoin="round"') + f('M10 42l46-3', 'none', ' stroke="#10152a" stroke-width="2.4" stroke-linecap="round"') + eye(24, 32, 3.2) + f('M44 28l2 6M48 26l2 6', 'none', ' stroke="' + M[3] + '" stroke-width="2.2" stroke-linecap="round"'); })(),
    av_dragon: (() => { const M = MT.red, d = 'M12 20l10 2 6-14 4 10 4-10 6 14 10-2-4 12 8 6-10 4-4 14H22l-4-14-10-4 8-6z';
      return ext(d, M[4]) + f(d, M[1]) + f('M32 18l4-10 6 14 10-2-4 12 8 6-10 4-4 14H32z', M[2]) + f('M22 44h20l-3 10H25z', MT.gold[1]) + f('M32 44h10l-3 10h-7z', MT.gold[2]) +
        eye(25, 30, 3.4, '#e8a000') + eye(39, 30, 3.4, '#e8a000') + f(circ(28, 47, 1.6) + circ(36, 47, 1.6), '#6b3810') + f(pts([[20, 22], [24, 12], [26, 22]]) + pts([[44, 22], [40, 12], [38, 22]]), MT.gold[0]); })(),
    av_ninja: (() => { const D = MT.dark; return badge(32, 32, 26, 'dark', D[1]) + f('M10 25h44v12H10z', '#f2c9a0') + f('M32 25h22v12H32z', '#d9a87a') + eye(24, 31, 3.2) + eye(40, 31, 3.2) +
        f('M18 26l12 3M46 26l-12 3', 'none', ' stroke="#10152a" stroke-width="2.6" stroke-linecap="round"') + f('M50 18l12-6-4 10 6 4-12 2z', MT.red[1]) + f('M10 18h44v5H10z', MT.red[1]) + f('M10 18h44v2H10z', MT.red[0]); })(),
    av_cap: (() => { const M = MT.red, d = 'M8 38c0-16 10-26 24-26s24 10 24 26z';
      return ext(d, M[4]) + f(d, M[1]) + f('M32 12c14 0 24 10 24 26H32z', M[2]) + f('M30 12h4v26h-4z', M[0]) + f(circ(32, 12, 3.5), M[3]) +
        ext('M4 38h54c4 0 4 8 0 8H4c-2-2-2-6 0-8z', MT.white[4]) + f('M4 38h54c4 0 4 8 0 8H4c-2-2-2-6 0-8z', MT.white[1]) + f('M4 42h56v4H4z', MT.white[2]) + blk('M22 22h20v10H22z', 'white', 'M22 22h20v3H22z', null) + shine(14, 18, 5, 3); })(),
  });
  // emoji del avatar → ícono
  window.AV_ICON = { '⚽': 'ball', '😎': 'av_cool', '🦁': 'av_lion', '🐯': 'av_tiger', '🦅': 'av_eagle', '🐺': 'av_wolf', '🔥': 'av_fire', '⭐': 'star', '👑': 'av_crown', '🤖': 'av_robot', '👽': 'av_alien', '🐸': 'av_frog', '🦈': 'av_shark', '🐉': 'av_dragon', '🥷': 'av_ninja', '🧢': 'av_cap' };
  const cache = {};
  function svgOf(n) { return cache[n] || (cache[n] = B[n] || ''); }
  window.ICON = function (n, size, cls) {
    const s = size || 28;
    return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="-2 -2 68 70" width="${s}" height="${s}" aria-hidden="true">${svgOf(n)}</svg>`;
  };
  window.ICON_NAMES = Object.keys(B);
})();
