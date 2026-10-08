// Wild Strikers · fila de búsqueda (lógica pura; index.js la conecta con WebSockets)
// Empareja por copas como Clash: empieza buscando ±100 y el rango se abre con el tiempo.
// Si nadie aparece en BOT_MS, se le da un bot de su nivel (el teléfono juega contra la IA).
export const BOT_MS = 18000;
export const rangeFor = ms => Math.min(800, 100 + Math.floor(ms / 1000) * 50);

export class LobbyCore {
  constructor(hooks) {
    this.h = hooks;           // { send(sock,obj), newMatch(a,b) -> Promise<id>, now() }
    this.q = [];              // [{ sock, info, since }]
  }
  now() { return this.h.now ? this.h.now() : Date.now(); }
  add(sock, info) {
    this.remove(sock);
    info.trophies = Math.max(0, info.trophies | 0);
    this.q.push({ sock, info, since: this.now() });
    this.h.send(sock, { t: 'buscando', rango: rangeFor(0) });
    this.match();
  }
  remove(sock) { this.q = this.q.filter(e => e.sock !== sock); }
  // se llama cada segundo
  tick() {
    const now = this.now();
    for (const e of this.q.slice()) {
      const ms = now - e.since;
      if (ms >= BOT_MS) { this.remove(e.sock); this.h.send(e.sock, { t: 'bot', copas: e.info.trophies }); continue; }
      this.h.send(e.sock, { t: 'buscando', rango: rangeFor(ms), seg: Math.floor(ms / 1000) });
    }
    this.match();
  }
  match() {
    const now = this.now();
    this.q.sort((a, b) => a.since - b.since);
    for (let i = 0; i < this.q.length; i++) {
      const a = this.q[i];
      let best = -1, bd = 1e9;
      for (let j = i + 1; j < this.q.length; j++) {
        const b = this.q[j], d = Math.abs(a.info.trophies - b.info.trophies);
        const lim = Math.max(rangeFor(now - a.since), rangeFor(now - b.since));
        if (d <= lim && d < bd) { bd = d; best = j; }
      }
      if (best >= 0) {
        const b = this.q[best];
        this.q.splice(best, 1); this.q.splice(i, 1); i--;
        this.pair(a, b);
      }
    }
  }
  async pair(a, b) {
    try {
      const id = await this.h.newMatch(a.info, b.info);
      this.h.send(a.sock, { t: 'rival', partido: id, equipo: 0, clave: a.info._key });
      this.h.send(b.sock, { t: 'rival', partido: id, equipo: 1, clave: b.info._key });
    } catch (e) {
      // si algo falla, los dos regresan a la fila
      this.add(a.sock, a.info); this.add(b.sock, b.info);
    }
  }
}
