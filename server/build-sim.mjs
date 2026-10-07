// Arma server/src/match.gen.js a partir de assets/sim/match.js (la lógica del partido del juego).
// En el navegador match.js usa las variables globales del juego; aquí se envuelve en una función
// que declara esas variables y cambia los efectos visuales/sonoros por funciones vacías.
// Uso:  node server/build-sim.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const match = readFileSync(join(root, 'assets/sim/match.js'), 'utf8');

const out = `// ARCHIVO GENERADO por server/build-sim.mjs a partir de assets/sim/match.js. No editar a mano.
import "../../assets/sim/ball.js";

export function makeMatch(opts = {}) {
  const SIM = globalThis.SIM;
  const { L, HW, GW, GH, BR, GRAV, RUN } = SIM.C;
  const CHAR_SCALE = 1.12, SUPER_COST = 3, MATCH_T = 120, X2T = 45, OT_T = 45;
  const rand = SIM.rand, clamp = SIM.clamp;
  const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const dirOf = t => t === 0 ? 1 : -1;
  const DIFF = { easy: { ai: .75, keep: .85, think: 1.5, tack: .6 }, normal: { ai: 1, keep: 1, think: 1, tack: 1 }, hard: { ai: 1.25, keep: 1.1, think: .65, tack: 1.35 } };
  const HITS = ['¡PUM!', '¡ZAS!', '¡CRACK!', '¡BAM!', '¡TRAS!'];

  // ---- estado del partido (en el juego son variables globales) ----
  let players = [], user = null, ball = SIM.newBall(), score = [0, 0], energy = [5, 5], time = MATCH_T, overtime = false, otTime = OT_T;
  let pause = 0, pauseCb = null, state = 'play', D = DIFF[opts.dif || 'normal'], hitstop = 0, shakeAmt = 0, superNext = [false, false];
  let shield = [0, 0], pressT = 0, T = 0, aiT = 2, traps = [], zones = [], walls = [], effects = [];
  let cine = null, qte = null, slowT = 0, goalCam = 0, fenceFlash = 0, lastKickPow = 0, ballSq = 0;
  const joy = { id: null, x: 0, y: 0 };
  const events = [];

  // ---- lo visual y el sonido no existen en el servidor ----
  const NO = () => {};
  const sfx = NO, burst = NO, part = NO, dust = NO, popText = NO, showBig = NO, ringFx = NO, vib = NO, pwElectro = NO,
    crowdShot = NO, zapFx = NO, shotScar = NO, spinBallMesh = NO, netCollide = NO, bigSave = NO, startQTE = NO;
  const fb = () => false, psfx = () => false, handPos = () => null;
  // sin cinemática: el súper tiro sale de inmediato
  const startCine = (p, args) => { if (ball.owner === p && state === 'play') { p._cineGo = true; shoot.apply(null, args); } };
  function dangerCheck() {}
  function landing() { return SIM.landing(ball); }
  function ballLandT() { return SIM.landT(ball); }
  function wallBall() { SIM.ballWalls(SIMW); }
  const SIMW = { get ball() { return ball; }, get players() { return players; }, get zones() { return zones; }, get walls() { return walls; },
    get score() { return score; }, get energy() { return energy; }, fx: null,
    knock: (o, dx, dz, pw, st) => knock(o, dx, dz, pw, st), onGoal: t => goal(t) };

  function goal(team) {
    if (pause > 0) return;
    SIM.scoreGoal(SIMW, team); events.push({ t: 'gol', team, score: score.slice() });
    pause = 2.3; pauseCb = () => { if (overtime) endGame(); else kickoff(1 - team); };
  }
  function endGame() { state = 'fin'; events.push({ t: 'fin', score: score.slice() }); }

// ======================= assets/sim/match.js =======================
${match}
// ===================================================================

  function setup(sq0, sq1) {
    players = [];
    for (const [team, sq] of [[0, sq0], [1, sq1]]) {
      players.push(newPlayerState(team, true, 0, sq.gk.card, sq.gk.lvl));
      sq.f.forEach((o, i) => players.push(newPlayerState(team, false, i, o.card, o.lvl, sq.slots[i])));
    }
    ball = SIM.newBall(); score = [0, 0]; energy = [5, 5]; time = MATCH_T; overtime = false; otTime = OT_T; state = 'play';
    kickoff(0);
  }
  // un paso del partido (sin poderes todavía: llegan en la parte 3)
  function step(dt) {
    if (state !== 'play') return;
    T += dt;
    if (pause > 0) { pause -= dt; if (pause <= 0 && pauseCb) { const cb = pauseCb; pauseCb = null; cb(); } return; }
    if (!overtime) { time -= dt; if (time <= 0) { time = 0; if (score[0] === score[1]) { overtime = true; otTime = OT_T; pause = 1.8; pauseCb = () => kickoff(Math.random() < .5 ? 0 : 1); return; } endGame(); return; } }
    else { otTime -= dt; if (otTime <= 0) { endGame(); return; } }
    pressT -= dt; shield[0] -= dt; shield[1] -= dt;
    updateControl();
    for (const p of players) { updatePlayer(p, dt); runQueue(p, dt); }
    contestBall(dt); separate(); updateBall(dt);
  }
  return {
    setup, step, events,
    get ball() { return ball; }, get players() { return players; }, get score() { return score; },
    get time() { return time; }, get state() { return state; }, get pause() { return pause; }
  };
}
`;
writeFileSync(join(here, 'src/match.gen.js'), out);
console.log('server/src/match.gen.js listo (' + out.length + ' bytes)');
