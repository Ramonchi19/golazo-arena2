// Estadísticas de partidos IA contra IA con la lógica real (server/src/match.gen.js). v229a
// Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/stats_partido.mjs [partidos=20]
import { makeMatch } from '../../server/src/match.gen.js';
const N = +(process.argv[2] || 20);
const SLOTS = [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }];
const card = pos => ({ id: 'lab', pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 75, alc: 75, sal: 75 } });
const squad = () => ({ gk: { card: card('POR'), lvl: 1 }, f: SLOTS.map(s => ({ card: card(s.r), lvl: 1 })), slots: SLOTS });
const S = { goles: 0, tiros: 0, pases: 0, pasesOk: 0, pasesRobados: 0, pasesSueltos: 0, robos: 0, suelto: 0, sueltoN: 0, jugado: 0, cambios: 0 };
let seed = 12345; Math.random = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);   // misma suerte en cada corrida
for (let n = 0; n < N; n++) {
  const M = makeMatch(); M.setup(squad(), squad()); M.setAI0(true); M.setNoCards(true);
  let f = 0, prevOwner = null, pass = null, looseT = 0, lastTeam = null, shotSeen = false;
  while (M.state === 'play' && f < 60 * 400) {
    M.step(1 / 60); f++; const b = M.ball, o = b.owner || b.gk;
    if (M.pause > 0) { prevOwner = null; pass = null; looseT = 0; continue; }
    S.jugado += 1 / 60;
    if (b.isShot && !b.owner && !b.gk) { if (!shotSeen) { shotSeen = true; S.tiros++; } } else if (o) shotSeen = false;
    if (prevOwner && !o && !b.isShot) { if (b.passTo) { S.pases++; pass = { from: prevOwner, to: b.passTo }; } }
    if (!o) { looseT += 1 / 60; }
    if (o && !prevOwner) {
      if (pass) { if (o === pass.to) S.pasesOk++; else if (o.team !== pass.from.team) S.pasesRobados++; else S.pasesSueltos++; pass = null; }
      if (looseT > 0) { S.suelto += looseT; S.sueltoN++; }
      looseT = 0;
      if (lastTeam !== null && o.team !== lastTeam) S.cambios++;
      lastTeam = o.team;
    }
    if (o && prevOwner && o !== prevOwner && o.team !== prevOwner.team) { S.robos++; S.cambios++; lastTeam = o.team; }
    prevOwner = o;
  }
  S.goles += M.score[0] + M.score[1];
}
const p = (a, b) => b ? (100 * a / b).toFixed(0) + '%' : '—';
console.log(`${N} partidos · goles/partido ${(S.goles / N).toFixed(1)} · tiros/partido ${(S.tiros / N).toFixed(1)}`);
console.log(`pases/partido ${(S.pases / N).toFixed(1)} · llegan ${p(S.pasesOk, S.pases)} · los roba el rival ${p(S.pasesRobados, S.pases)} · otro compañero ${p(S.pasesSueltos, S.pases)}`);
console.log(`robos a quien lo lleva/partido ${(S.robos / N).toFixed(1)} · cambios de posesión/partido ${(S.cambios / N).toFixed(1)} · balón suelto promedio ${(S.suelto / Math.max(1, S.sueltoN)).toFixed(2)} s`);
