// Wild Strikers · servidor de partidas
// v61: prueba de conexión. Cada "sala" es un Durable Object; los jugadores conectados
// se ven entre sí y miden el ping (ida y vuelta) contra el servidor.
import { DurableObject } from "cloudflare:workers";

const VERSION = "v61-ping";
const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
});

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname === "/salud") {
      return json({ ok: true, juego: "Wild Strikers", version: VERSION, lugar: req.cf && req.cf.colo });
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
