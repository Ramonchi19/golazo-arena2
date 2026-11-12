// Pruebas del golpe sincronizado (v230a). Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/test_golpe.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('server/src/match.gen.js', 'utf8').replace('import "../../assets/sim/ball.js";', 'import "' + process.cwd() + '/assets/sim/ball.js";');
writeFileSync('/tmp/match.test5.mjs', src);
const { makeMatch } = await import('/tmp/match.test5.mjs');
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = (pos, id = 'lab') => ({ id, pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 } });
const squad = id => ({ gk: { card: card('POR'), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r, id), lvl: 1 })), slots: SLOTS });
const deg = r => Math.round(r * 180 / Math.PI);
let ok = true; const check = (n, c, i) => { ok = ok && c; console.log((c ? 'ok ' : 'MAL') + ' ' + n + (i ? ' | ' + i : '')); };
function setup(id) {
  const M = makeMatch(); M.setup(squad(id), squad()); for (let i = 0; i < 200 && M.pause > 0; i++) M.step(1 / 60);
  const P = M.players, p = M.ctrl[0], b = M.ball; for (const o of P) if (o !== p) { o.x = o.team ? 30 : -30; o.z = (o.idx || 0) * 5 - 10; }
  p.x = 0; p.z = 0; p.face = Math.PI / 2; p.vx = p.vz = 0; Object.assign(b, { x: .5, y: .4, z: 0, vx: 0, vy: 0, vz: 0, owner: p, gk: null }); return { M, P, p, b };
}
// joystick: dirección del mundo {x,z} → J (la simulación usa dir = {x:-J.y, z:J.x})
const joy = (M, x, z) => M.setJoy(0, z, -x);
// 1) toque de pase al frente: el balón no sale antes de la preparación (0.15 s) y sale en ese cuadro; la cara no se mueve
{ const { M, p, b } = setup(); const mate = M.players.find(o => o.team === 0 && !o.gk && o !== p); mate.x = 10; mate.z = 0;
  joy(M, 1, 0); M.btnDown(0, 'b'); M.step(1 / 60); M.btnUp(0, 'b');
  let t = 0, faces = [], suelta = null; while (t < 1) { M.step(1 / 60); t += 1 / 60; mate.x = 10; mate.z = 0; if (p.windK || p.kickT > 0) faces.push(p.face); if (suelta === null && b.owner !== p) suelta = t; if (suelta !== null && !(p.kickT > 0)) break; }
  check('toque de pase: el balón sale tras la preparación', suelta !== null && suelta >= .14 && suelta <= .2, 'salió a los ' + (suelta || 0).toFixed(3) + ' s (preparación 0.15)');
  const spread = Math.max(...faces) - Math.min(...faces); check('la cara no se mueve durante preparación y patada', spread < .05, 'variación ' + deg(spread) + '°'); }
// 2) corriendo hacia +x, apunta y carga un pase 70° a su IZQUIERDA (mirando a +x su izquierda es -z; mientras carga el cuerpo gira): debe salir con la ZURDA
{ const { M, p, b } = setup(); const mate = M.players.find(o => o.team === 0 && !o.gk && o !== p); mate.x = 4; mate.z = -11;
  joy(M, 1, 0); for (let i = 0; i < 15; i++) M.step(1 / 60);
  M.btnDown(0, 'b'); joy(M, Math.cos(-1.2), Math.sin(-1.2)); for (let i = 0; i < 30; i++) M.step(1 / 60);   // carga 0.5 s apuntando a su izquierda (-z)
  const caraAlSoltar = p.face; M.btnUp(0, 'b'); for (let i = 0; i < 40 && b.owner === p; i++) M.step(1 / 60);
  check('pase cargado a su izquierda → zurda (aunque al cargar ya giró)', p.kickFoot === 'l', 'pie ' + p.kickFoot + ' · cara al soltar ' + deg(caraAlSoltar) + '° (empezó en 90°)'); }
// 3) lo mismo a su DERECHA → derecha; y al frente con un zurdo (Simún) → zurda
{ const { M, p, b } = setup(); joy(M, 1, 0); for (let i = 0; i < 15; i++) M.step(1 / 60);
  M.btnDown(0, 'b'); joy(M, Math.cos(1.2), Math.sin(1.2)); for (let i = 0; i < 30; i++) M.step(1 / 60); M.btnUp(0, 'b'); for (let i = 0; i < 40 && b.owner === p; i++) M.step(1 / 60);
  check('pase cargado a su derecha (+z) → derecha', p.kickFoot === 'r', 'pie ' + p.kickFoot); }
{ const { M, p, b } = setup('zurdito'); joy(M, 1, 0); M.btnDown(0, 'a'); M.step(1 / 60); M.btnUp(0, 'a'); for (let i = 0; i < 40 && b.owner === p; i++) M.step(1 / 60);
  check('Simún tira al frente → zurda', p.kickFoot === 'l', 'pie ' + p.kickFoot); }
// 4) tiro: el balón sale a los 0.24 s y durante la patada (kickT) la cara sigue hacia la portería
{ const { M, p, b } = setup(); joy(M, 0, 0); M.btnDown(0, 'a'); M.step(1 / 60); M.btnUp(0, 'a');
  let t = 0, suelta = null, f0 = null, maxd = 0; while (t < .8) { M.step(1 / 60); t += 1 / 60; if (suelta === null && b.owner !== p) { suelta = t; f0 = p.face; } if (f0 !== null && p.kickT > 0) maxd = Math.max(maxd, Math.abs(p.face - f0)); }
  check('tiro: sale a los 0.24 s', suelta !== null && Math.abs(suelta - .24) < .04, 'salió a los ' + (suelta || 0).toFixed(3) + ' s');
  check('tiro: no se voltea durante la patada', maxd < .02, 'giró ' + deg(maxd) + '° mientras pateaba'); }
console.log(ok ? 'PASA' : 'FALLA');
