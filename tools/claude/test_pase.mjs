// Pruebas del pase con toque y despejes (v229b) y del pase cargado (v229c). Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/test_pase.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('server/src/match.gen.js', 'utf8')
  .replace('import "../../assets/sim/ball.js";', 'import "' + process.cwd() + '/assets/sim/ball.js";')
  .replace('return {\n    setup, step, events,', 'return {\n    setup, step, events, pass, passAim, crossAim, pickMate,');
writeFileSync('/tmp/match.test3.mjs', src);
const { makeMatch } = await import('/tmp/match.test3.mjs');
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = pos => ({ id: 'lab', pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 } });
const squad = () => ({ gk: { card: card('POR'), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r), lvl: 1 })), slots: SLOTS });
let ok = true;
const rad = g => g * Math.PI / 180;
// el jugador mira hacia +x (portería rival). "g grados a la derecha" = girando hacia -z
const at = (p, g, dist) => ({ x: p.x + Math.cos(rad(g)) * dist, z: p.z - Math.sin(rad(g)) * dist });
const dirG = g => ({ x: Math.cos(rad(g)), z: -Math.sin(rad(g)) });
function setupM(px = 0) {
  const M = makeMatch(); M.setup(squad(), squad()); for (let i = 0; i < 200 && M.pause > 0; i++) M.step(1 / 60);
  const P = M.players; for (const o of P) { o.x = o.team ? 30 : -30; o.z = (o.idx || 0) * 5 - 10; o.vx = o.vz = 0; }
  const p = P[2]; p.x = px; p.z = 0; p.face = Math.PI / 2; Object.assign(M.ball, { x: px + .5, y: .4, z: 0, vx: 0, vy: 0, vz: 0, owner: p, gk: null });
  return { M, P, p, b: M.ball };
}
function check(name, cond, info) { ok = ok && cond; console.log((cond ? 'ok ' : 'MAL') + ' ' + name + (info ? ' | ' + info : '')); }
const who = (r, A, B) => r === A ? 'A' : r === B ? 'B' : r ? 'otro' : 'nadie';
{ const { M, P, p } = setupM(); const A = P[3], B = P[4]; Object.assign(A, at(p, 50, 6)); Object.assign(B, at(p, 80, 16));
  check('tu ejemplo: flecha 35° der, A 50° cerca, B 80° lejos, toque', M.pickMate(p, dirG(35), null) === A, 'va a ' + who(M.pickMate(p, dirG(35), null), A, B));
  check('tu ejemplo pero cargado al máximo: sigue yendo a A (manda la dirección)', M.pickMate(p, dirG(35), 1) === A, 'va a ' + who(M.pickMate(p, dirG(35), 1), A, B)); }
{ const { M, P, p } = setupM(); const A = P[3], B = P[4]; Object.assign(A, at(p, 30, 6)); Object.assign(B, at(p, 36, 18));
  check('dos casi en la misma línea, toque → el más cercano', M.pickMate(p, dirG(33), null) === A, 'va a ' + who(M.pickMate(p, dirG(33), null), A, B));
  check('dos casi en la misma línea, cargado poco → el cercano', M.pickMate(p, dirG(33), .05) === A, 'va a ' + who(M.pickMate(p, dirG(33), .05), A, B));
  check('dos casi en la misma línea, cargado mucho → el lejano', M.pickMate(p, dirG(33), .6) === B, 'va a ' + who(M.pickMate(p, dirG(33), .6), A, B)); }
{ const { M, P, p } = setupM(); const A = P[3]; Object.assign(A, at(p, 120, 8));
  check('nadie en 60° de la flecha → nadie', M.pickMate(p, dirG(0), null) === null); }
{ const { M, P, p, b } = setupM(5); const A = P[3]; Object.assign(A, at(p, 120, 8));
  M.passAim(p, null, dirG(0)); for (let i = 0; i < 20 && b.owner; i++) M.step(1 / 60);
  check('toque sin nadie (media cancha) → al vacío', b.passTo !== A && !b.owner, 'receptor: ' + (b.passTo === A ? 'A' : b.passTo ? 'otro' : 'nadie')); }
{ const { M, P, p, b } = setupM(-24); const A = P[3]; Object.assign(A, at(p, 120, 8));
  M.passAim(p, null, dirG(0)); for (let i = 0; i < 30 && b.owner; i++) M.step(1 / 60);
  check('despeje con toque desde tu área sin nadie en la flecha → a un compañero', !!b.passTo && b.passTo.team === p.team, 'receptor: ' + (b.passTo ? (b.passTo === A ? 'A' : 'compañero') : 'nadie')); }
{ const { M, P, p, b } = setupM(); const A = P[3]; Object.assign(A, at(p, 20, 12));
  M.passAim(p, null, dirG(20)); let t = 0; while (t < 2 && b.owner !== A) { M.step(1 / 60); t += 1 / 60; A.vx = A.vz = 0; }
  check('toque a un compañero: llega limpio', b.owner === A, 'tardó ' + t.toFixed(2) + ' s'); }
// ---- pase cargado (v229c): fuerza = distancia que pides; se compara con la distancia real al compañero ----
const pwFor = want => (want - 6) / 22;   // KPASS.dMin=6, dMax=28
function cargado(nombre, l, r, espera) {
  const { M, P, p, b } = setupM(); M.setAI0(true); const A = P[3]; Object.assign(A, at(p, 0, l)); A.vx = A.vz = 0;   // equipo con IA: el receptor se mueve solo
  M.passAim(p, pwFor(l * r), dirG(0)); for (let i = 0; i < 60 && b.owner === p; i++) { M.step(1 / 60); A.x = l; A.z = 0; A.vx = A.vz = 0; p.x = 0; p.z = 0; }   // v230a: espera la preparación del golpe
  const recv0 = b.passTo; let t = 0, toque = false, paso = false, minD = 99;
  while (t < 3 && !b.owner) { M.step(1 / 60); t += 1 / 60; p.x = 0; p.z = 0; p.vx = p.vz = 0;   // el que pasa se queda quieto
    if (t < .6) { A.x = l; A.z = 0; A.vx = A.vz = 0; } if (b.x > A.x + 1) paso = true; minD = Math.min(minD, Math.hypot(b.x - A.x, b.z - A.z)); if (recv0 && !b.owner && b.passTo === null && minD < 1.2) toque = true; }
  const res = { receptor: recv0 === A ? 'A' : recv0 ? 'otro' : 'nadie', dueño: b.owner === A ? 'A' : b.owner ? 'otro' : 'nadie', toque, paso, t: t.toFixed(2) };
  const bien = espera(res); check(nombre, bien, JSON.stringify(res));
}
cargado('fuerza justa (×1.0) → llega limpio', 12, 1.0, r => r.receptor === 'A' && r.dueño === 'A' && !r.toque);
cargado('un poco fuerte (×1.35) → mal control', 12, 1.35, r => r.receptor === 'A' && r.toque);
cargado('te pasas (×2) → a la nada, sin receptor', 12, 2.0, r => r.receptor === 'nadie' && r.paso);
cargado('un poco débil (×0.6) → tiene que regresar por él', 20, .6, r => r.receptor === 'A' && r.dueño === 'A' && +r.t > .9);
cargado('muy débil (×0.3) → se queda corto y suelto', 20, .3, r => r.receptor === 'nadie' && !r.paso);
console.log(ok ? 'PASA' : 'FALLA');
