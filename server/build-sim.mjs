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
const data = readFileSync(join(root, 'assets/sim/data.js'), 'utf8');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const pa = html.indexOf('const P=('), pb = html.indexOf('const PBY=', pa);
if (pa < 0 || pb < 0) throw new Error('no encontré PLAYERS en index.html');
writeFileSync(join(here, 'src/cards.gen.js'), '// ARCHIVO GENERADO por server/build-sim.mjs a partir de index.html (cartas de jugadores). No editar.\n' +
  html.slice(pa, pb) + 'export const PBY = Object.fromEntries(PLAYERS.map(p => [p.id, p]));\n');

const out = `// ARCHIVO GENERADO por server/build-sim.mjs a partir de assets/sim/match.js. No editar a mano.
import "../../assets/sim/ball.js";

export function makeMatch(opts = {}) {
  const SIM = globalThis.SIM;
  const { L, HW, GW, GH, BR, GRAV, RUN } = SIM.C;
  const CHAR_SCALE = 1.12, SUPER_COST = 3, MATCH_T = 120, X2T = 45, OT_T = 45;
// ======================= assets/sim/data.js =======================
${data}
// ===================================================================

  // ---- estado del partido (en el juego son variables globales) ----
  let players = [], user = null, ball = SIM.newBall(), score = [0, 0], energy = [5, 5], time = MATCH_T, overtime = false, otTime = OT_T;
  let pause = 0, pauseCb = null, state = 'play', D = DIFF[opts.dif || 'normal'], hitstop = 0, shakeAmt = 0, superNext = [false, false];
  let shield = [0, 0], pressT = 0, T = 0, aiT = 2, traps = [], zones = [], walls = [], effects = [];
  let cine = null, qte = null, slowT = 0, goalCam = 0, fenceFlash = 0, lastKickPow = 0, ballSq = 0, skyFlash = 0, x2said = false;
  let hands = [[], []], queues = [[], []];
  const plvl = opts.plvl || [1, 1];
  const spellLvl = (team, k) => plvl[team] || 1;
  const joy = { id: null, x: 0, y: 0 };
  const events = [];

  // ---- lo visual y el sonido no existen en el servidor ----
  const NO = () => {};
  const sfx = NO, burst = NO, part = NO, dust = NO, popText = NO, showBig = NO, ringFx = NO, vib = NO, pwElectro = NO,
    crowdShot = NO, zapFx = NO, shotScar = NO, spinBallMesh = NO, netCollide = NO, bigSave = NO, startQTE = NO,
    tone = NO, targetFx = NO, stormCloud = NO, iceSpikes = NO, mudBubbles = NO, shieldDome = NO, turboTrails = NO, superAura = NO,
    burnFx = NO, boltFxLines = NO, puffFx = NO, smokeFx = NO, blastFx = NO, craterFx = NO, decalFx = NO, fxFn = NO,
    renderCards = NO, reactUpdate = NO, ballInNet = NO, audio = NO,
    vxRemove = NO, vxAdd = NO, vxGlove = NO, vxGloveAfter = NO, vxTornado = NO, vxMeteor = NO, vxWallUp = NO, vxBarrelRoll = NO,
    vxZone = NO, vxPeelAnim = NO, vxBomb = NO;
  const vxMud = () => null, vxWallMesh = () => null, vxBarrelMesh = () => null, vxIceZone = () => null, vxGloveMesh = () => null,
    vxTornadoMesh = () => null, vxMeteorMesh = () => null, vxMeteorWarn = () => null, vxPeel = () => null;
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

  function setup(sq0, sq1, decks) {
    players = [];
    for (const [team, sq] of [[0, sq0], [1, sq1]]) {
      players.push(newPlayerState(team, true, 0, sq.gk.card, sq.gk.lvl));
      sq.f.forEach((o, i) => players.push(newPlayerState(team, false, i, o.card, o.lvl, sq.slots[i])));
    }
    ball = SIM.newBall(); score = [0, 0]; energy = [5, 5]; time = opts.matchT || MATCH_T; overtime = false; otTime = opts.otT || OT_T; state = 'play';
    superNext = [false, false]; shield = [0, 0]; pressT = 0; aiT = 2; x2said = false; hitstop = 0; effects = []; traps = []; zones = []; walls = [];
    for (const t of [0, 1]) { const d = shuffle(((decks && decks[t]) || Object.keys(CARDS).slice(0, 6)).slice()); hands[t] = d.slice(0, 4); queues[t] = d.slice(4); }
    kickoff(0);
  }
  // un paso del partido: es la misma función update() del juego
  function step(dt) { if (state !== 'play') return; T += dt; update(dt); }
  return {
    setup, step, events,
    get ball() { return ball; }, get players() { return players; }, get score() { return score; },
    get time() { return time; }, get state() { return state; }, get pause() { return pause; },
    get energy() { return energy; }, get hands() { return hands; }, get effects() { return effects; },
    get overtime() { return overtime; },
    playCard: (team, i, x, z) => playCard(team, i, x, z), castSpell: (k, team, x, z) => castSpell(k, team, x, z),
    // ---- partido en línea: los dos equipos son humanos ----
    setHumans(h) { H1 = !!h; if (H1 && !user1) user1 = fieldOf(1)[0] || null; },
    setJoy(t, x, y) { const J = joyFor(t); J.x = x; J.y = y; },
    btnDown: (t, k) => simBtnDown(t, k), btnUp: (t, k) => simBtnUp(t, k),
    cast(t, k, x, z) { const c = CARDS[k]; if (!c || state !== 'play' || energy[t] < c.cost) return false; energy[t] -= c.cost; castSpell(k, t, clamp(x, -L, L), clamp(z, -HW, HW)); return true; }
  };
}
`;
writeFileSync(join(here, 'src/match.gen.js'), out);
console.log('server/src/match.gen.js listo (' + out.length + ' bytes)');
