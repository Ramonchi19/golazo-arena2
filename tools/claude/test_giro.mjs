// Prueba del giro antes de patear (v228c). Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/test_giro.mjs
// (los compañeros quedan aturdidos para que no cuenten como receptores y el balón vaya hacia la flecha)
// Arma una copia de server/src/match.gen.js que también expone pass/passAim/shoot, pone a un jugador con el balón
// mirando hacia un lado y le pide pasar a distintos ángulos. Mide cuánto tarda en soltar el balón y hacia dónde mira al patear.
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('server/src/match.gen.js', 'utf8')
  .replace('import "../../assets/sim/ball.js";', 'import "' + process.cwd() + '/assets/sim/ball.js";')
  .replace('return {\n    setup, step, events,', 'return {\n    setup, step, events, pass, passAim, shoot,');
writeFileSync('/tmp/match.test.mjs', src);
const { makeMatch } = await import('/tmp/match.test.mjs');
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = pos => ({ id: 'lab', pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 } });
const squad = () => ({ gk: { card: card('POR'), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r), lvl: 1 })), slots: SLOTS });
const deg = r => Math.round(r * 180 / Math.PI);
let ok = true;
function caso(nombre, grados, esperaGiro) {
  const M = makeMatch(); M.setup(squad(), squad());
  for (let i = 0; i < 200 && M.pause > 0; i++) M.step(1 / 60);
  const P = M.players, p = P[2], b = M.ball;
  for (const o of P) if (o !== p) { o.x = o.team ? 25 : -25; if (!o.team) o.stun = 5; o.z = (o.idx || 0) * 3 - 6; }
  p.x = 0; p.z = 0; p.face = Math.PI / 2; p.vx = p.vz = 0;   // mira hacia +x
  Object.assign(b, { x: .5, y: .4, z: 0, vx: 0, vy: 0, vz: 0, owner: p, gk: null });
  const a = Math.PI / 2 + grados * Math.PI / 180, dir = { x: Math.sin(a), z: Math.cos(a) };
  M.passAim(p, null, dir);
  let t = 0, maxD = 0;
  while (b.owner === p && t < 1) { M.step(1 / 60); t += 1 / 60; for (const o of P) if (o !== p) { o.x = o.team ? 25 : -25; if (!o.team) o.stun = 5; } maxD = Math.max(maxD, Math.hypot(b.x - p.x, b.z - p.z)); }
  const sale = Math.atan2(b.vx, b.vz), err = Math.abs(((sale - a) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
  const giro = t > 0.2,   // v230a: sin giro sale tras la preparación del pase (KPREP.pase = 0.15 s); con giro, giro + preparación
   bien = giro === esperaGiro && b.owner !== p && err < .35 && maxD < 1.2;
  ok = ok && bien;
  console.log((bien ? 'ok ' : 'MAL') + ' ' + nombre.padEnd(28) + ' soltó a los ' + t.toFixed(2) + ' s (preparación 0.15) | mira al patear ' + deg(p.kickFace0 - Math.PI / 2) + '° | balón sale a ' + deg(sale - Math.PI / 2) + '° | balón máx ' + maxD.toFixed(2) + ' m del jugador');
}
caso('al frente (0°)', 0, false);
caso('de lado (60°)', 60, false);
caso('de lado (-80°)', -80, false);
caso('1/3 de vuelta (120°)', 120, true);
caso('1/3 de vuelta (-120°)', -120, true);
caso('media vuelta (180°)', 179, true);
console.log(ok ? 'PASA' : 'FALLA');
