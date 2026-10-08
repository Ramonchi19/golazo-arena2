// Wild Strikers · sala de partido en línea (lógica pura; index.js la conecta con WebSockets)
// El servidor manda: corre update() del juego a 60 Hz con los controles de los dos teléfonos.
// Cada jugador ve el partido como si fuera el equipo azul (0): al equipo rojo (1) se le manda todo en espejo.
import { makeMatch } from "./match.gen.js";
import { PBY } from "./cards.gen.js";

const STEP = 1 / 60, TICK_MS = 1000 / 30;           // 2 pasos por tick → 60 Hz de simulación, 30 fotos por segundo
const r2 = v => Math.round(v * 100) / 100;
const POWERS = ["bomba", "cascara", "rayo", "hielo", "turbo", "escudo", "superbalon", "punetazo", "tornado", "meteorito", "lodo", "muro", "barril"];
const FORMS = {
  diamante: [{ x: -16, z: 0, r: 'DEF' }, { x: -9, z: -8, r: 'MED' }, { x: -9, z: 8, r: 'MED' }, { x: -3, z: 0, r: 'DEL' }],
  cuadrado: [{ x: -15, z: -6, r: 'DEF' }, { x: -15, z: 6, r: 'DEF' }, { x: -4, z: -6, r: 'DEL' }, { x: -4, z: 6, r: 'DEL' }],
  ataque: [{ x: -15, z: 0, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: -7, r: 'DEL' }, { x: -3, z: 7, r: 'DEL' }],
  cerrojo: [{ x: -16, z: -6, r: 'DEF' }, { x: -16, z: 6, r: 'DEF' }, { x: -9, z: 0, r: 'MED' }, { x: -3, z: 0, r: 'DEL' }],
  muro: [{ x: -16, z: -8, r: 'DEF' }, { x: -17, z: 0, r: 'DEF' }, { x: -16, z: 8, r: 'DEF' }, { x: -3, z: 0, r: 'DEL' }],
};
const ACT = { slide: 1, body: 2 };

// Plantilla que manda el teléfono → cartas del servidor (no se confía en las estadísticas que mande el cliente)
export function cleanSquad(sq) {
  sq = sq || {};
  const lv = v => Math.max(1, Math.min(5, (v | 0) || 1));
  const card = (id, pos) => PBY[id] || Object.values(PBY).find(c => c.pos === pos) || null;
  const form = FORMS[sq.form] ? sq.form : 'ataque';
  const f = (Array.isArray(sq.f) ? sq.f : []).slice(0, 4);
  while (f.length < 4) f.push({});
  return {
    form, slots: FORMS[form],
    gk: { card: card(sq.gk && sq.gk.id, 'POR'), lvl: lv(sq.gk && sq.gk.lvl) },
    f: f.map((o, i) => ({ card: card(o && o.id, FORMS[form][i].r), lvl: lv(o && o.lvl) })),
  };
}
export function cleanDeck(d) {
  const ok = (Array.isArray(d) ? d : []).filter(k => POWERS.includes(k));
  return ok.length >= 4 ? ok.slice(0, 8) : ["bomba", "cascara", "rayo", "turbo"];
}

export class GameCore {
  // info = { id, players: [ {uid,name,avatar,country,trophies,squad,deck,plvl,kit}, {...} ] }
  constructor(info, send, opts = {}) {
    this.id = info.id; this.info = info; this.send = send;   // send(team, obj)
    this.now = opts.now || (() => Date.now());
    this.M = makeMatch({ plvl: info.players.map(p => Math.max(1, Math.min(5, p.plvl | 0 || 1))), human1: true, matchT: opts.matchT, otT: opts.otT });
    this.M.setup(cleanSquad(info.players[0].squad), cleanSquad(info.players[1].squad), info.players.map(p => cleanDeck(p.deck)));
    this.M.setHumans(true);
    this.decks = info.players.map(p => cleanDeck(p.deck));
    this.joined = [false, false]; this.phase = 'espera'; this.tickN = 0; this.created = this.now();
    this.startAt = 0; this.goneAt = [0, 0]; this.result = null;
  }
  // ---- espejo para el equipo rojo ----
  mir(team, x) { return team === 1 ? -x : x; }
  join(team) {
    this.joined[team] = true; this.goneAt[team] = 0;
    const me = this.info.players[team], rv = this.info.players[1 - team];
    this.send(team, { t: 'sala', id: this.id, equipo: team, yo: pub(me), rival: pub(rv), fase: this.phase });
    if (this.phase === 'espera' && this.joined[0] && this.joined[1]) { this.phase = 'cuenta'; this.startAt = this.now() + 3000; this.both({ t: 'cuenta', ms: 3000 }); }
    if (this.phase === 'juego') this.send(team, this.snap(team));
  }
  leave(team) { this.joined[team] = false; this.goneAt[team] = this.now(); this.send(1 - team, { t: 'rivalSeFue' }); }
  both(o) { this.send(0, o); this.send(1, o); }
  input(team, m) {
    if (this.phase !== 'juego') return;
    const M = this.M;
    if (m.t === 'in' && Array.isArray(m.j)) {
      const x = Math.max(-1, Math.min(1, +m.j[0] || 0)), y = Math.max(-1, Math.min(1, +m.j[1] || 0));
      M.setJoy(team, team === 1 ? -x : x, team === 1 ? -y : y);
      this.send(1 - team, { t: 'ri', j: [r2(-x), r2(-y)] }); // el rival, visto desde el otro lado
    } else if (m.t === 'b' && 'abc'.includes(m.k)) {
      if (m.d) M.btnDown(team, m.k); else M.btnUp(team, m.k);
      this.send(1 - team, { t: 'rb', k: m.k, d: m.d ? 1 : 0 });
    } else if (m.t === 'c' && POWERS.includes(m.k) && this.decks[team].includes(m.k)) {
      const x = Math.max(-32, Math.min(32, +m.x || 0)), z = Math.max(-16, Math.min(16, +m.z || 0));
      const wx = team === 1 ? -x : x, wz = team === 1 ? -z : z;
      if (M.cast(team, m.k, wx, wz)) this.send(1 - team, { t: 'rc', k: m.k, x: -x, z: -z });
      else this.send(team, { t: 'cNo', k: m.k });
    }
  }
  // ---- reloj del servidor (se llama cada TICK_MS) ----
  tick() {
    const now = this.now();
    if (this.phase === 'espera') {
      if (now - this.created > 20000) { const w = this.joined[0] ? 0 : this.joined[1] ? 1 : -1; this.finish(w, 'rival_no_llego'); }
      return;
    }
    if (this.phase === 'cuenta') { if (now >= this.startAt) { this.phase = 'juego'; this.both({ t: 'inicio' }); } return; }
    if (this.phase !== 'juego') return;
    for (const t of [0, 1]) if (!this.joined[t] && this.goneAt[t] && now - this.goneAt[t] > 12000) { this.finish(1 - t, 'abandono'); return; }
    const M = this.M;
    const before = M.score.slice();
    M.step(STEP); M.step(STEP); this.tickN++;
    for (const ev of M.events.splice(0)) {
      if (ev.t === 'gol') for (const t of [0, 1]) this.send(t, { t: 'gol', equipo: t === 1 ? 1 - ev.team : ev.team, sc: t === 1 ? [ev.score[1], ev.score[0]] : ev.score.slice() });
    }
    for (const t of [0, 1]) if (this.joined[t]) this.send(t, this.snap(t));
    if (M.state !== 'play') { const s = M.score; this.finish(s[0] > s[1] ? 0 : s[1] > s[0] ? 1 : -1, 'tiempo'); }
  }
  finish(winner, why) {
    if (this.phase === 'fin') return;
    this.phase = 'fin'; const s = this.M.score;
    this.result = { winner, why, score: s.slice() };
    for (const t of [0, 1]) this.send(t, { t: 'fin', gana: winner < 0 ? null : winner === t, motivo: why, sc: t === 1 ? [s[1], s[0]] : s.slice() });
  }
  // ---- foto del partido desde el punto de vista de 'team' ----
  snap(team) {
    const M = this.M, b = M.ball, P = M.players, s = team === 1 ? -1 : 1;
    const order = team === 1 ? P.slice(5).concat(P.slice(0, 5)) : P;
    const idx = p => p ? order.indexOf(p) : -1;
    return {
      t: 's', k: this.tickN, tm: r2(M.time), ot: M.overtime ? 1 : 0, ps: r2(Math.max(0, M.pause)),
      sc: team === 1 ? [M.score[1], M.score[0]] : M.score.slice(), en: r2(M.energy[team]),
      b: [r2(b.x * s), r2(b.y), r2(b.z * s), r2(b.vx * s), r2(b.vy), r2(b.vz * s), idx(b.owner), idx(b.gk), b.super ? 1 : 0],
      p: order.map(p => [r2(p.x * s), r2(p.z * s), r2(p.vx * s), r2(p.vz * s), r2(team === 1 ? p.face + Math.PI : p.face),
        r2(Math.max(0, p.stun)), ACT[p.act] || 0, r2(p.flyY || 0), r2(Math.max(0, p.star || 0))]),
    };
  }
}
function pub(p) { return { name: p.name, avatar: p.avatar, country: p.country, trophies: p.trophies, squad: p.squad, kit: p.kit || null, deck: p.deck }; }
export const GAME_TICK_MS = TICK_MS;
