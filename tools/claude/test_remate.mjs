// v232: remate de primera / en el aire. Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/test_remate.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('server/src/match.gen.js', 'utf8')
  .replace('import "../../assets/sim/ball.js";', 'import "' + process.cwd() + '/assets/sim/ball.js";')
  .replace('return {\n    setup, step, events,', 'return {\n    setup, step, events, pass, centro,');
writeFileSync('/tmp/match.test_rem.mjs', src);
const { makeMatch } = await import('/tmp/match.test_rem.mjs');
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = pos => ({ id: 'lab', pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 } });
const squad = () => ({ gk: { card: card('POR'), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r), lvl: 1 })), slots: SLOTS });
let ok = true; const check = (n, c, i) => { ok = ok && c; console.log((c ? 'ok ' : 'MAL') + ' ' + n + (i ? ' | ' + i : '')); };
function caso(nombre, px, pz, ax, az, how, espera, alt) {
  const M = makeMatch(); M.setup(squad(), squad()); M.setNoCards(true); for (let i = 0; i < 200 && M.pause > 0; i++) M.step(1 / 60);
  const P = M.players; for (const o of P) { if (o.gk) continue; o.x = o.team ? -30 : -28; o.z = (o.idx || 0) * 5 - 10; o.vx = o.vz = 0; }
  const p = P[2], A = P[3], b = M.ball; p.x = px; p.z = pz; A.x = ax; A.z = az; A.vx = A.vz = 0; p.face = Math.atan2(ax - px, az - pz);
  Object.assign(b, { x: px + Math.sin(p.face) * .5, y: .4, z: pz + Math.cos(p.face) * .5, vx: 0, vy: 0, vz: 0, owner: p, gk: null });
  M[how](p, A); for (let i = 0; i < 60 && b.owner === p; i++) { M.step(1 / 60); A.vx = A.vz = 0; }
  if (b.owner) { check(nombre, false, 'no salió el pase'); return; }
  for (let i = 0; i < (alt || 6); i++) M.step(1 / 60);
  M.btnDown(0, 'a'); M.btnUp(0, 'a'); const K0 = A.remK ? Object.assign({}, A.remK) : null;
  let t = 0, kinds = new Set(), shot = null;
  while (t < 2.5) { M.step(1 / 60); t += 1 / 60; if (A.remK) kinds.add(A.remK.kind); if (b.isShot && b.lastTeam === 0 && !shot) { shot = { t, y: b.y, vx: b.vx, d: Math.hypot(b.x - A.x, b.z - A.z) }; break; } if (b.owner) break; }
  const info = 'leyó: ' + (K0 ? K0.kind + ' en ' + K0.dur.toFixed(2) + ' s a ' + K0.y.toFixed(2) + ' m' : 'nada') + ' | remates: ' + [...kinds].join(',') + ' | ' + (shot ? 'tiró a los ' + shot.t.toFixed(2) + ' s, balón a ' + shot.y.toFixed(2) + ' m, a ' + shot.d.toFixed(2) + ' m del cuerpo, vx ' + shot.vx.toFixed(1) : b.owner ? 'lo agarró ' + (b.owner === A ? 'él' : 'otro') : 'no tiró');
  check(nombre, !!K0 && !!shot && shot.vx > 5 && (!espera || espera.includes(K0.kind)), info);
}
caso('pase raso al área, tiro mientras viene → de primera', 10, 0, 20, 6, 'pass', ['primera']);
caso('pase raso de lado → de primera', 18, -10, 22, 4, 'pass', ['primera']);
caso('centro desde la banda → en el aire', 18, -13, 25, 2, 'centro', ['cabezazo', 'volea', 'tijera', 'chilena']);
caso('centro desde la banda (otra vez, altura al azar)', 20, 13, 24, -1, 'centro', ['cabezazo', 'volea', 'tijera', 'chilena']);
caso('centro desde la banda (otra vez)', 22, -12, 26, 0, 'centro', ['cabezazo', 'volea', 'tijera', 'chilena']);
caso('pase de regreso desde la línea de fondo (viene de frente) → de primera', 29, 6, 20, 1, 'pass', ['primera']);
console.log(ok ? 'TODO BIEN' : 'HAY FALLAS'); process.exit(ok ? 0 : 1);
