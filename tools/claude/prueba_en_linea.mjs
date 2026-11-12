// Partido en línea simulado con el código real del servidor (server/src/game.js + match.gen.js). v229d
// Dos "teléfonos" de mentira mueven el joystick y aprietan pase / tiro / centro (toques y cargados) al azar.
// Uso (desde la raíz): node server/build-sim.mjs && node tools/claude/prueba_en_linea.mjs
import { GameCore } from '../../server/src/game.js';
let clock = 0; const msgs = [0, 0], tipos = {};
const send = (t, o) => { msgs[t]++; tipos[o.t] = (tipos[o.t] || 0) + 1; };
const pl = () => ({ uid: 'x', name: 'prueba', squad: {}, deck: [], plvl: 1 });
const G = new GameCore({ id: 'prueba', players: [pl(), pl()] }, send, { now: () => clock, matchT: 60 });
G.join(0); G.join(1); G.input(0, { t: 'listo' }); G.input(1, { t: 'listo' });
let errores = 0, n = 0, held = [null, null];
for (; n < 60 * 20 * 3 && G.phase !== 'fin' && !G.result; n++) {
  clock += 50;
  try {
    for (const t of [0, 1]) {
      G.input(t, { t: 'in', j: [Math.sin(n / 30 + t * 2), Math.cos(n / 23 + t)] });
      if (n % 37 === t * 5) { const k = 'abc'[(n / 37 | 0) % 3]; G.input(t, { t: 'b', k, d: 1 }); held[t] = { k, at: n + (n % 3 === 0 ? 1 : 12) }; }   // a veces toque, a veces cargado
      if (held[t] && n >= held[t].at) { G.input(t, { t: 'b', k: held[t].k, d: 0 }); held[t] = null; }
    }
    G.tick();
  } catch (e) { errores++; if (errores < 4) console.log('ERROR', e.message, e.stack.split('\n')[1]); }
}
console.log('ticks', n, '· fase', G.phase, '· marcador', G.M.score.join('-'), '· mensajes', msgs.join('/'), '· tipos', JSON.stringify(tipos));
console.log(errores ? 'FALLA (' + errores + ' errores)' : 'PASA');
