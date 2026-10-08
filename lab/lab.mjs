// Wild Strikers · laboratorio de medición (v67)
// Corre la lógica real del partido (server/src/match.gen.js) sin gráficos y mide tiros, porteros y partidos.
// Uso:  node lab/lab.mjs [todo|tiro|super|especiales|partidos] [--json salida.json]
import { makeMatch } from '../server/src/match.gen.js';
import { writeFileSync } from 'node:fs';

const L = 32, GW = 4.8, GH = 3.3, BR = .4, G = 24;
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = (pos, st) => ({ id: 'lab', pos, st: Object.assign({ vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 }, st) });
const squad = (fieldSt, gkSt) => ({ gk: { card: card('POR', gkSt), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r, fieldSt), lvl: 1 })), slots: SLOTS });
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
const OUT = {};

// ---------- un partido de prueba con el tirador del equipo azul y el portero rojo ----------
function arena(shooterSt, keeperSt) {
  const M = makeMatch(); M.setup(squad(shooterSt, { ref: 70, alc: 70, sal: 70 }), squad({}, keeperSt));
  const P = M.players, k = P[5], sh = P[4];
  for (const p of P) if (p !== k && p !== sh) { p.x = -27; p.z = (p.team ? 1 : -1) * 13; p.homeX = p.x; }
  for (let i = 0; i < 120 && M.pause > 0; i++) M.step(1 / 60);   // se salta la pausa del saque inicial
  for (const p of P) if (p !== k && p !== sh) { p.x = -27; p.z = (p.team ? 1 : -1) * 13; }
  return { M, P, k, sh, b: M.ball };
}
// el tirador lleva el balón en (bx,bz) y el portero tiene 1 s para acomodarse
function settle(A, bx, bz) {
  const { M, sh, b } = A;
  sh.x = bx - .6; sh.z = bz; sh.face = Math.atan2(L - bx, -bz * 0);
  Object.assign(b, { x: bx, y: BR, z: bz, vx: 0, vy: 0, vz: 0, owner: sh, gk: null });
  for (let i = 0; i < 60; i++) { sh.x = bx - .6; sh.z = bz; sh.vx = sh.vz = 0; b.x = bx; b.z = bz; b.owner = sh; M.step(1 / 60); }
}
// sigue el balón hasta que se decide
function follow(A, maxF = 260) {
  const { M, k, b } = A, g0 = M.score[0];
  let r = { out: 'nada', dive: false, alert: false, tipo: null };
  for (let i = 0; i < maxF; i++) {
    M.step(1 / 60); if (k.alert) r.alert = true; if (k.dive > 0) r.dive = true;
    if (M.score[0] > g0) { r.out = 'gol'; break; }
    if (b.gk === k) { r.out = 'atrapada'; break; }
    if (b.lastTeam === 1 && b.x > L - 16) { r.out = 'desviada'; break; }
    if (b.x > L + .8 || Math.abs(b.z) > 16.5) { r.out = 'fuera'; break; }
  }
  return r;
}
// cómo iba el tiro justo al salir: a dónde llega a la línea, a qué altura, cuánto tarda y qué tan lejos del portero
function shotInfo(A) {
  const { b, k } = A;
  const t = (L - b.x) / Math.max(.1, b.vx), g = b.super ? G * .15 : G;
  const zl = b.z + b.vz * t, yl = Math.max(BR, b.y + b.vy * t - .5 * g * t * t);
  const tk = (k.x - b.x) / Math.max(.1, b.vx), zk = b.z + b.vz * tk;
  return { caido: k.stun > 0 || k.down > 0, tLinea: t, zLinea: zl, yLinea: yl, aPuerta: Math.abs(zl) < GW - BR && yl < GH - BR, lat: Math.abs(zk - k.z), tPortero: tk, vel: Math.hypot(b.vx, b.vy, b.vz) };
}
const band = (v, cuts, names) => { for (let i = 0; i < cuts.length; i++) if (v < cuts[i]) return names[i]; return names[names.length - 1]; };

// ---------- 1) campo de tiro con el disparo real del juego ----------
function campoDeTiro() {
  const combos = [
    ['tirador 50 vs portero 75', { tir: 50 }, { ref: 75, alc: 75, sal: 75 }],
    ['tirador 75 vs portero 75', { tir: 75 }, { ref: 75, alc: 75, sal: 75 }],
    ['tirador 90 vs portero 75', { tir: 90 }, { ref: 75, alc: 75, sal: 75 }],
    ['tirador 75 vs portero 60', { tir: 75 }, { ref: 60, alc: 60, sal: 60 }],
    ['tirador 75 vs portero 95', { tir: 75 }, { ref: 95, alc: 95, sal: 95 }],
  ];
  const rows = [];
  for (const [name, sst, kst] of combos) {
    const all = [];
    for (const dist of [8, 12, 16, 22, 30]) for (const ang of [0, 25, 45]) for (const az of [-4.2, -2.5, -1, 0, 1, 2.5, 4.2]) for (const pw of [.5, .75, .85, .95]) for (let rep = 0; rep < 2; rep++) {
      const a = ang * Math.PI / 180 * (rep ? -1 : 1), bx = L - dist * Math.cos(a), bz = dist * Math.sin(a);
      if (Math.abs(bz) > 13) continue;
      const A = arena(sst, kst); settle(A, bx, bz);
      A.M.shoot(A.sh, pw, null, { az }); const info = shotInfo(A); const r = follow(A);
      all.push(Object.assign({ dist, ang, az, pw }, info, r));
    }
    const on = all.filter(s => s.aPuerta);
    const goles = on.filter(s => s.out === 'gol');
    // matriz: qué tan lejos del portero pasa × cuánto tiempo tiene
    const M = {};
    for (const s of on) { const key = band(s.lat, [1, 2, 3], ['<1 m', '1–2 m', '2–3 m', '3+ m']) + ' | ' + band(s.tPortero, [.35, .6], ['<0.35 s', '0.35–0.6 s', '>0.6 s']);
      (M[key] = M[key] || { n: 0, g: 0 }).n++; if (s.out === 'gol') M[key].g++; }
    const sinIntento = goles.filter(s => !s.dive && s.lat > 1).length;
    const react = .30 - kst.ref * .0019, reach = (.62 + kst.alc * .003) + (1.45 + kst.alc * .009);
    const por = {}; for (const s of goles) { const w = s.caido ? 'el portero ya estaba en el piso (salida fallida)' : s.tPortero < react + .08 ? 'sin tiempo para reaccionar' : s.lat > reach + .1 ? 'fuera de su alcance' : s.yLinea > 2.6 ? 'muy alta' : !s.dive && s.lat > 1 ? 'alcanzable pero no se tiró' : 'alcanzable, se tiró y no llegó'; por[w] = (por[w] || 0) + 1; }
    rows.push({ name, tiros: all.length, aPuerta: on.length, goles: goles.length, atrapadas: on.filter(s => s.out === 'atrapada').length,
      desviadas: on.filter(s => s.out === 'desviada').length, por, fueraDeLosQueIbanAdentro: on.filter(s => s.out === 'fuera').length, golesSinTirarse: sinIntento, matriz: M,
      punteria: pct(on.length, all.length) });
  }
  console.log('\n=== CAMPO DE TIRO (disparo real del juego) ===');
  for (const r of rows) {
    console.log(`\n${r.name}: ${r.tiros} tiros · a puerta ${r.punteria} · de los que iban a puerta: gol ${pct(r.goles, r.aPuerta)}, atrapadas ${pct(r.atrapadas, r.aPuerta)}, desviadas ${pct(r.desviadas, r.aPuerta)} · goles sin que se tirara (a más de 1 m): ${r.golesSinTirarse}`);
    console.log('   motivo de los goles:', JSON.stringify(r.por));
    const keys = Object.keys(r.matriz).sort();
    for (const k of keys) console.log(`   pasa a ${k.padEnd(22)} → gol ${pct(r.matriz[k].g, r.matriz[k].n).padStart(4)} (${r.matriz[k].n})`);
  }
  OUT.tiro = rows;
}

// ---------- 2) súper tiro por distancia ----------
function superTiro() {
  console.log('\n=== SÚPER TIRO ===');
  const rows = [];
  for (const dist of [10, 18, 26, 35, 50, 62]) {
    let g = 0, N = 30;
    for (let n = 0; n < N; n++) { const A = arena({ tir: 80 }, { ref: 80, alc: 80, sal: 80 }); settle(A, L - dist, (n % 5 - 2) * 1.5);
      A.sh._cineGo = true; A.M.shoot(A.sh, 1, null, { az: (n % 7 - 3) * 1.2 }); if (follow(A).out === 'gol') g++; }
    rows.push({ dist, gol: g / N }); console.log(`  desde ${String(dist).padStart(2)} m: gol ${pct(g, N)}`);
  }
  OUT.super = rows;
}

// ---------- 3) situaciones especiales ----------
function especiales() {
  console.log('\n=== SITUACIONES ESPECIALES ===');
  const run = (name, N, prep) => { let g = 0, s = 0, react = 0;
    for (let n = 0; n < N; n++) { const A = arena({ tir: 75 }, { ref: 75, alc: 75, sal: 75 }); prep(A, n); const r = follow(A); if (r.out === 'gol') g++; if (r.out === 'atrapada' || r.out === 'desviada') s++; if (r.dive || r.alert) react++; }
    console.log(`  ${name.padEnd(42)} gol ${pct(g, N).padStart(4)} · parada ${pct(s, N).padStart(4)} · reaccionó ${pct(react, N)}`); return { name, gol: g / N, parada: s / N }; };
  const free = (A, o) => { const { b, sh } = A; sh.x = -20; Object.assign(b, { owner: null, gk: null, lastTeam: 0, tried: [false, false], super: false }, o); };
  const rows = [];
  rows.push(run('Globito con el portero adelantado (6 m)', 30, (A, n) => { A.k.x = L - 6; A.k.z = 0; const t = 1.0, x0 = L - 15, zt = -3 + n % 7; free(A, { x: x0, y: .4, z: 0, vx: (L + .3 - x0) / t, vz: zt / t, vy: (2.2 - .4 + .5 * G * t * t) / t }); }));
  // rebote: el balón sale del área y pega en un rival que estaba enfrente: cambia de dirección hacia la portería sin patada
  rows.push(run('Globito con el portero a 3 m', 30, (A, n) => { A.k.x = L - 3; A.k.z = 0; const t = 1.3, x0 = L - 15, zt = -3 + n % 7; free(A, { x: x0, y: .4, z: 0, vx: (L + .3 - x0) / t, vz: zt / t, vy: (2.4 - .4 + .5 * G * t * t) / t }); }));
  rows.push(run('Rebote que pega en un rival y va al arco', 30, (A, n) => { free(A, { x: L - 6, y: .6, z: (n % 5) - 2, vx: -8, vy: 1, vz: 0, tried: [false, true] });
    for (let i = 0; i < 8; i++) A.M.step(1 / 60); Object.assign(A.b, { vx: 18, vz: ((n % 3) - 1) * 2.5, vy: 1.5 }); }));
  rows.push(run('Tiro centrado y lento (siempre atajable)', 30, (A, n) => { settle(A, L - 18, 0); A.M.shoot(A.sh, .5, null, { az: (n % 3 - 1) * .4 }); }));
  rows.push(run('Mano a mano a 6 m', 30, (A, n) => { settle(A, L - 6, (n % 5 - 2)); A.M.shoot(A.sh, .8, null, { az: (n % 2 ? 1 : -1) * 3 }); }));
  rows.push(run('Remate de cabeza a centro (a 7 m)', 30, (A, n) => { const z = -3 + n % 7; free(A, { x: L - 7.3, y: 1.9, z, vx: 0, vy: -1, vz: 0 }); A.sh.x = L - 7; A.sh.z = z; A.M.tryVolley(A.sh); }));
  rows.push(run('Tiro desde ángulo cerrado (banda, 8 m)', 30, (A, n) => { settle(A, L - 4, 9 * (n % 2 ? 1 : -1)); A.M.shoot(A.sh, .8, null, { az: (n % 2 ? 1 : -1) * (n % 3) * 1.5 }); }));
  OUT.especiales = rows;
}

// ---------- 4) partidos completos IA contra IA ----------
function partidos(N = 12) {
  console.log('\n=== PARTIDOS COMPLETOS (IA contra IA) ===');
  const res = [];
  for (let n = 0; n < N; n++) {
    const M = makeMatch(); M.setup(squad({}, { ref: 75, alc: 75, sal: 75 }), squad({}, { ref: 75, alc: 75, sal: 75 })); M.setAI0(true); M.setNoCards(true);
    let f = 0, tiros = 0, sup = 0, lastShot = null;
    while (M.state === 'play' && f < 60 * 400) { M.step(1 / 60); f++; const b = M.ball;
      if (b.isShot && b !== lastShot && !b.owner && !b.gk && Math.hypot(b.vx, b.vz) > 12) { if (!b._lab) { b._lab = 1; tiros++; if (b.super) sup++; } }
      if (b.owner || b.gk) b._lab = 0; }
    res.push({ goles: M.score[0] + M.score[1], marcador: M.score.join('-'), tiros, sup });
  }
  const tot = res.reduce((a, r) => a + r.goles, 0);
  console.log('  marcadores:', res.map(r => r.marcador).join('  '));
  console.log(`  goles por partido: ${(tot / N).toFixed(1)} · tiros por partido: ${(res.reduce((a, r) => a + r.tiros, 0) / N).toFixed(1)} · súper tiros por partido: ${(res.reduce((a, r) => a + r.sup, 0) / N).toFixed(1)}`);
  OUT.partidos = res;
}

export { arena, settle, follow, shotInfo };
const what = process.argv[2] || 'todo';
if (process.argv[1] && !process.argv[1].endsWith('lab.mjs')) { /* importado */ } else {
const t0 = Date.now();
if (what === 'todo' || what === 'tiro') campoDeTiro();
if (what === 'todo' || what === 'super') superTiro();
if (what === 'todo' || what === 'especiales') especiales();
if (what === 'todo' || what === 'partidos') partidos();
const j = process.argv.indexOf('--json'); if (j > 0) writeFileSync(process.argv[j + 1], JSON.stringify(OUT, null, 1));
console.log(`\n(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
