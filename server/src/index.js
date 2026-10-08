// Wild Strikers · servidor de partidas
// v61: prueba de conexión. Cada "sala" es un Durable Object; los jugadores conectados
// se ven entre sí y miden el ping (ida y vuelta) contra el servidor.
import { DurableObject } from "cloudflare:workers";
import "../../assets/sim/ball.js"; // la misma física del balón que usa el juego
const SIM = globalThis.SIM;
import { makeMatch } from "./match.gen.js"; // jugadores, IA y porteros del juego (assets/sim/match.js)
import { LobbyCore } from "./lobby.js";
import { GameCore, GAME_TICK_MS } from "./game.js";

const VERSION = "v65-en-linea";
const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
});

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname === "/salud") {
      return json({ ok: true, juego: "Wild Strikers", version: VERSION, lugar: req.cf && req.cf.colo });
    }
    if (url.pathname === "/prueba-balon") {
      // tiro de prueba simulado en el servidor con la física del juego
      const ev = [], W = { ball: SIM.newBall(), players: [], zones: [], walls: [], score: [0, 0], energy: [5, 5],
        fx: new Proxy({}, { get: (_, k) => () => ev.push(k) }), onGoal: t => { ev.push("gol"); SIM.scoreGoal(W, t); } };
      Object.assign(W.ball, { x: 20, y: .4, z: 1, vx: 26, vy: 3, vz: 0 });
      let f = 0; for (; f < 180 && !W.score[0]; f++) SIM.ballFree(W, 1 / 60);
      return json({ ok: true, version: VERSION, marcador: W.score.join("-"), cuadros: f, eventos: [...new Set(ev)] });
    }
    if (url.pathname === "/prueba-partido") {
      // dos equipos de la IA juegan unos segundos dentro del servidor, con la lógica del juego
      const seg = Math.min(4, Math.max(1, +url.searchParams.get("seg") || 2));
      const slots = [{ x: -15, z: 0, r: "DEF" }, { x: -9, z: 0, r: "MED" }, { x: -3, z: -7, r: "DEL" }, { x: -3, z: 7, r: "DEL" }];
      const card = pos => ({ id: "x", pos, st: { vel: 70, tir: 70, pas: 70, reg: 70, def: 70, fis: 70, ref: 70, alc: 70, sal: 70 } });
      const sq = () => ({ gk: { card: card("POR"), lvl: 1 }, f: slots.map(s => ({ card: card(s.r), lvl: 1 })), slots });
      const M = makeMatch(); M.setup(sq(), sq());
      const poder = url.searchParams.get("poder"); // por ejemplo ?poder=bomba
      const t0 = Date.now(); let f = 0;
      for (; f < seg * 60 && M.state === "play"; f++) { if (poder && f === 30) M.castSpell(poder, 0, M.ball.x, M.ball.z); M.step(1 / 60); }
      const r = v => Math.round(v * 10) / 10;
      return json({ ok: true, version: VERSION, segundos: seg, cuadros: f, marcador: M.score.join("-"),
        poder: poder || null, balon: { x: r(M.ball.x), y: r(M.ball.y), z: r(M.ball.z) }, jugadores: M.players.map(p => ({ equipo: p.team, portero: !!p.gk, x: r(p.x), z: r(p.z), aturdido: p.stun > 0 })), ms: Date.now() - t0 });
    }
    if (url.pathname === "/fila") {
      if (req.headers.get("Upgrade") !== "websocket") return json({ error: "se esperaba websocket" }, 426);
      return env.FILA.get(env.FILA.idFromName("fila-global")).fetch(req);
    }
    if (url.pathname === "/partido") {
      if (req.headers.get("Upgrade") !== "websocket") return json({ error: "se esperaba websocket" }, 426);
      const id = (url.searchParams.get("id") || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
      if (!id) return json({ error: "falta id" }, 400);
      return env.PARTIDOS.get(env.PARTIDOS.idFromName("p:" + id)).fetch(req);
    }
    if (url.pathname === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return json({ error: "se esperaba websocket" }, 426);
      const sala = (url.searchParams.get("sala") || "PRUEBA").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "PRUEBA";
      const stub = env.ROOMS.get(env.ROOMS.idFromName("sala:" + sala));
      return stub.fetch(req);
    }
    return json({ error: "no existe" }, 404);
  }
};

export class Room extends DurableObject {
  async fetch(req) {
    const url = new URL(req.url);
    const name = (url.searchParams.get("nombre") || "Jugador").slice(0, 16);
    const avatar = (url.searchParams.get("av") || "⚽").slice(0, 8);
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    const id = crypto.randomUUID().slice(0, 8);
    server.serializeAttachment({ id, name, avatar, ping: null });
    server.send(JSON.stringify({ t: "hola", id, version: VERSION, lugar: req.cf && req.cf.colo }));
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }

  live(skip) {
    return this.ctx.getWebSockets().filter(ws => ws !== skip && ws.readyState === 1);
  }

  broadcast(skip) {
    const socks = this.live(skip);
    const msg = JSON.stringify({ t: "sala", jugadores: socks.map(ws => ws.deserializeAttachment()).filter(Boolean) });
    for (const ws of socks) { try { ws.send(msg); } catch (e) {} }
  }

  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw)); } catch (e) { return; }
    if (m.t === "ping") {
      ws.send(JSON.stringify({ t: "pong", c: m.c, s: Date.now() }));
    } else if (m.t === "miPing" && typeof m.ms === "number") {
      const a = ws.deserializeAttachment() || {};
      const changed = a.ping == null || Math.abs(a.ping - m.ms) >= 5;
      a.ping = Math.round(m.ms); ws.serializeAttachment(a);
      if (changed) this.broadcast();
    } else if (m.t === "toque") {
      // prueba de ida y vuelta entre dos teléfonos: uno toca y los demás lo ven
      const a = ws.deserializeAttachment() || {};
      const msg = JSON.stringify({ t: "toque", de: a.name, c: m.c });
      for (const o of this.ctx.getWebSockets()) if (o !== ws) { try { o.send(msg); } catch (e) {} }
    }
  }

  async webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch (e) {}
    this.broadcast(ws);
  }

  async webSocketError(ws) {
    this.broadcast(ws);
  }
}

// ======================= v65: FILA DE BÚSQUEDA =======================
const rid = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => (b % 36).toString(36)).join("");
export class Fila extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.core = new LobbyCore({
      send: (ws, o) => { try { ws.send(JSON.stringify(o)); } catch (e) {} },
      newMatch: async (a, b) => {
        const id = rid(12), keys = [rid(10), rid(10)];
        const stub = env.PARTIDOS.get(env.PARTIDOS.idFromName("p:" + id));
        const r = await stub.fetch("https://partido/crear", { method: "POST", body: JSON.stringify({ id, keys, players: [a, b] }) });
        if (!r.ok) throw new Error("no se pudo crear el partido");
        a._key = keys[0]; b._key = keys[1];
        return id;
      },
    });
    this.timer = null;
  }
  async fetch(req) {
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    server.addEventListener("message", ev => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.t === "buscar") {
        const info = { uid: String(m.uid || "").slice(0, 64), name: String(m.name || "Jugador").slice(0, 16), avatar: String(m.avatar || "⚽").slice(0, 8),
          country: String(m.country || "MX").slice(0, 3), trophies: m.trophies | 0, squad: m.squad || {}, deck: m.deck || [], plvl: m.plvl | 0, kit: m.kit || null };
        this.core.add(server, info); this.ensureTimer();
      } else if (m.t === "cancelar") this.core.remove(server);
    });
    const bye = () => this.core.remove(server);
    server.addEventListener("close", bye); server.addEventListener("error", bye);
    return new Response(null, { status: 101, webSocket: client });
  }
  ensureTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => { this.core.tick(); if (!this.core.q.length) { clearInterval(this.timer); this.timer = null; } }, 1000);
  }
}
// ======================= v65: SALA DE PARTIDO =======================
export class Partido extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.game = null; this.socks = [null, null]; this.timer = null; this.keys = null; }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/crear" && req.method === "POST") {
      if (this.game) return json({ error: "ya existe" }, 409);
      const info = await req.json();
      this.keys = info.keys;
      this.game = new GameCore({ id: info.id, players: info.players }, (t, o) => { const ws = this.socks[t]; if (ws) { try { ws.send(JSON.stringify(o)); } catch (e) {} } });
      this.timer = setInterval(() => this.tick(), GAME_TICK_MS);
      return json({ ok: true });
    }
    if (!this.game) return json({ error: "partido no existe" }, 404);
    const team = url.searchParams.get("equipo") === "1" ? 1 : 0;
    if (url.searchParams.get("clave") !== this.keys[team]) return json({ error: "clave incorrecta" }, 403);
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    if (this.socks[team]) { try { this.socks[team].close(4000, "otra conexión"); } catch (e) {} }
    this.socks[team] = server;
    server.addEventListener("message", ev => { let m; try { m = JSON.parse(ev.data); } catch (e) { return; } if (this.socks[team] === server) this.game.input(team, m); });
    const bye = () => { if (this.socks[team] === server) { this.socks[team] = null; this.game.leave(team); } };
    server.addEventListener("close", bye); server.addEventListener("error", bye);
    this.game.join(team);
    return new Response(null, { status: 101, webSocket: client });
  }
  tick() {
    if (!this.game) return;
    this.game.tick();
    if (this.game.phase === "fin" && !this.closing) {
      this.closing = true;
      setTimeout(() => { clearInterval(this.timer); this.timer = null; for (const ws of this.socks) { try { ws && ws.close(1000, "fin"); } catch (e) {} } }, 3000);
    }
  }
}
