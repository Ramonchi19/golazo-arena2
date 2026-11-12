// Pruebas de balón suelto y jugadores en el camino (v229a). Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/test_balon.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('server/src/match.gen.js', 'utf8')
  .replace('import "../../assets/sim/ball.js";', 'import "' + process.cwd() + '/assets/sim/ball.js";')
  .replace('return {\n    setup, step, events,', 'return {\n    setup, step, events, pass, passAim, shoot, release,');
writeFileSync('/tmp/match.test2.mjs', src);
const { makeMatch } = await import('/tmp/match.test2.mjs');
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = pos => ({ id: 'lab', pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 } });
const squad = () => ({ gk: { card: card('POR'), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r), lvl: 1 })), slots: SLOTS });
let ok = true;
function setupM() {
  const M = makeMatch(); M.setup(squad(), squad()); for (let i = 0; i < 200 && M.pause > 0; i++) M.step(1 / 60);
  const P = M.players; for (const o of P) { o.x = o.team ? 28 : -28; o.z = (o.idx || 0) * 4 - 8; o.vx = o.vz = 0; }
  return { M, P, b: M.ball };
}
function hold(P, list) { for (const [o, x, z] of list) { o.x = x; o.z = z; o.vx = o.vz = 0; o.homeX = x; } }
function run(M, P, fixed, frames, stop) { for (let i = 0; i < frames; i++) { M.step(1 / 60); hold(P, fixed); if (stop && stop()) return i; } return frames; }
function check(name, cond, info) { ok = ok && cond; console.log((cond ? 'ok ' : 'MAL') + ' ' + name + (info ? ' | ' + info : '')); }
// 1) rival en la línea del pase se lo queda
{ const { M, P, b } = setupM(); const p = P[2], m = P[3], r = P[7];
  const F = [[m, 10, 0], [r, 5, 0]]; p.x = 0; p.z = 0; p.face = Math.PI / 2; Object.assign(b, { x: .5, y: .4, z: 0, vx: 0, vy: 0, vz: 0, owner: p, gk: null }); hold(P, F);
  M.pass(p, m); run(M, P, F, 90, () => b.owner && b.owner !== p);
  check('rival en la línea del pase se lo queda', b.owner === r, 'dueño: ' + (b.owner ? (b.owner === m ? 'compañero' : b.owner === r ? 'rival' : 'otro') : 'nadie')); }
// 2) compañero que no es el receptor lo deja pasar
{ const { M, P, b } = setupM(); const p = P[2], m = P[3], c = P[4];
  const F = [[m, 10, 0], [c, 5, 0]]; p.x = 0; p.z = 0; p.face = Math.PI / 2; Object.assign(b, { x: .5, y: .4, z: 0, vx: 0, vy: 0, vz: 0, owner: p, gk: null }); hold(P, F);
  M.pass(p, m); run(M, P, F, 90, () => b.owner && b.owner !== p);
  check('compañero en medio lo deja pasar al receptor', b.owner === m, 'dueño: ' + (b.owner === m ? 'receptor' : b.owner === c ? 'el de en medio' : 'otro/nadie')); }
// 3) tiro fuerte contra un defensa rebota (no lo agarra): el defensa se pone justo en la trayectoria real del tiro
{ const { M, P, b } = setupM(); const p = P[2], r = P[7];
  p.x = 12; p.z = 0; p.face = Math.PI / 2; Object.assign(b, { x: 12.5, y: .4, z: 0, vx: 0, vy: 0, vz: 0, owner: p, gk: null }); r.x = 28; r.z = 12;
  M.shoot(p, 1, null, { az: 0 }); for (let i = 0; i < 40 && (b.owner || Math.hypot(b.vx, b.vz) < 1 || b.x < 12.6); i++) M.step(1 / 60);
  b.cv = null;   // sin curva: así el defensa queda justo en la línea del tiro
  const l = Math.hypot(b.vx, b.vz), F = [[r, b.x + b.vx / l * 4, b.z + b.vz / l * 4]]; hold(P, F); const vx0 = b.vx; let reb = false;
  const sp0 = Math.hypot(b.vx, b.vz), vz0 = b.vz;
  run(M, P, F, 40, () => { const sp = Math.hypot(b.vx, b.vz), cosA = (b.vx * vx0 + b.vz * vz0) / ((sp || 1) * sp0); if (sp < sp0 * .5 || cosA < .87) reb = true; const dd = Math.hypot(b.x - r.x, b.z - r.z); if (!globalThis.MIN || dd < globalThis.MIN.d) globalThis.MIN = { d: dd, y: b.y }; return reb || b.owner === r; });   // rebote = se frena a menos de la mitad o se desvía más de 30°
  check('tiro fuerte contra un defensa rebota', reb && b.owner !== r, reb ? 'rebotó' : (b.owner === r ? 'lo agarró' : 'lo atravesó') + ' (lo más cerca: ' + globalThis.MIN.d.toFixed(2) + ' m de lado, a ' + globalThis.MIN.y.toFixed(2) + ' m de alto)'); }
// 4) balón suelto rápido: el que pasa por él se lo queda
{ const { M, P, b } = setupM(); const r = P[7];
  const F = [[r, 6, 0]]; Object.assign(b, { x: 0, y: .4, z: 0, vx: 16, vy: 0, vz: 0, owner: null, gk: null, passTo: null, isShot: false, lastTeam: 0 }); hold(P, F);
  run(M, P, F, 60, () => b.owner === r);
  check('balón suelto rápido (16 m/s): se lo queda el que está en el camino', b.owner === r); }
console.log(ok ? 'PASA' : 'FALLA');
