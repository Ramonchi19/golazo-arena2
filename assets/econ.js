/* Titan Crashers · economía (v79)
   El MISMO código corre en el juego (sin cuenta / sin servidor) y en el servidor (con cuenta).
   Con cuenta, el servidor es el que decide: monedas, gemas, cartas, sobres, copas y el ciclo de sobres.
   Aquí no hay nada de pantalla: solo reglas. D = datos del juego (cartas, sobres, precios), E = la cartera del jugador. */
(function (root) {
  'use strict';
  const H = 3600e3, RORD = ['comun', 'rara', 'epica', 'legendaria'];
  // campos de la partida guardada que son "dinero" (solo el servidor los cambia cuando hay cuenta)
  const EK = ['gold', 'gems', 'xp', 'lvl', 'trophies', 'maxTrophies', 'wins', 'losses', 'draws', 'gf', 'ga', 'players', 'powers', 'kits', 'boots', 'packs', 'freeAt', 'cyc', 'name', 'nameN'];
  const UNLOCK_H = { bronce: 1, plata: 3, oro: 8, leyenda: 24, legendario: 24 };
  const FREE_H = 4;
  const SHOP = { bronce: ['gold', 150], plata: ['gold', 400], oro: ['gems', 80], leyenda: ['gems', 250], legendario: ['gems', 500] };

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function lg(D, t) { let i = 0; D.LEAGUES.forEach((l, k) => { if (t >= l.min) i = k; }); return i; }
  const xpNeed = l => 100 + l * 50;
  function addXp(E, n) { E.xp += n; let up = 0; while (E.xp >= xpNeed(E.lvl)) { E.xp -= xpNeed(E.lvl); E.lvl++; E.gems += 5; up++; } return up; }
  const winGold = i => 20 + i * 10;

  // ---- ciclo de sobres por victoria: 240 de plata/oro (184 + 56) + leyenda cada 80 y legendario cada 140 ----
  const _seq = {};
  function cycleSeq(seed) {
    if (_seq[seed]) return _seq[seed];
    const r = rng(seed >>> 0), oro = new Set(), k = 56;
    for (let i = 0; i < k; i++) { let p = Math.floor(i * 240 / k + r() * 3.5) % 240; while (oro.has(p)) p = (p + 1) % 240; oro.add(p); }
    const seq = []; for (let i = 0; i < 240; i++) seq.push(oro.has(i) ? 'oro' : 'plata');
    return (_seq[seed] = seq);
  }
  function cycleAt(c, n, pos, pend) { if (n % 140 === 0) return 'legendario'; if (n % 80 === 0 || pend) return 'leyenda'; return cycleSeq(c.seed)[pos % 240]; }
  function nextPacks(c, cnt) { const out = []; let pos = c.pos, n = c.n, pend = !!c.pend;
    for (let i = 0; i < cnt; i++) { n++; const t = cycleAt(c, n, pos, pend && n % 140 !== 0); if (t === 'leyenda') pend = false; else if (n % 140 === 0 && n % 80 === 0) pend = true; if (t === 'plata' || t === 'oro') pos++; out.push(t); }
    return out; }
  function untilKind(c, kind) { let pos = c.pos, n = c.n, pend = !!c.pend;
    for (let i = 1; i <= 600; i++) { n++; const t = cycleAt(c, n, pos, pend && n % 140 !== 0); if (t === 'leyenda') pend = false; else if (n % 140 === 0 && n % 80 === 0) pend = true; if (t === 'plata' || t === 'oro') pos++; if (t === kind) return i; }
    return 0; }
  function awardCycle(E) { const i = E.packs.indexOf(null); if (i < 0) return null;   // espacios llenos: no hay sobre y el ciclo no avanza
    const c = E.cyc; c.n++; const t = cycleAt(c, c.n, c.pos, c.pend && c.n % 140 !== 0);
    if (t === 'leyenda') c.pend = false; else if (c.n % 140 === 0 && c.n % 80 === 0) c.pend = true; if (t === 'plata' || t === 'oro') c.pos = (c.pos + 1) % 240;
    E.packs[i] = { t, at: 0 }; return t; }
  function packState(p, now) { if (!p) return 'vacio'; if (!p.at) return 'cerrado'; return now >= p.at ? 'listo' : 'abriendo'; }
  function gemsToOpen(p, now) { const left = p.at ? Math.max(0, p.at - now) : UNLOCK_H[p.t] * H; return Math.max(1, Math.ceil(left / 60000 / 12)); }

  // ---- sobres ----
  const rarOfId = (D, id) => D.CARDS[id] ? D.CARDS[id].rar : (D.PBY[id] || {}).rar;   // igual que needOf() del juego
  function needOf(D, id, lvl) { const r = rarOfId(D, id) || 'comun'; return (D.COPIES_BY_RAR[r] || D.COPIES_BY_RAR.comun)[lvl] || D.LVL_COPIES[lvl]; }
  function packItems(D, E, type) { const P = D.PACKS[type] || D.PACKS.bronce; if (P.only) return 1; return P.items + Math.floor(lg(D, E.trophies) * P.items * .12); }
  function roll(D, E, type, R) {
    const P0 = D.PACKS[type] || D.PACKS.bronce, pool = D.POOL, n = packItems(D, E, type), rars = [];
    if (P0.only) rars.push(P0.only);
    else { if (P0.gL || R() < P0.pL) rars.push('legendaria'); if (P0.gE || R() < P0.pE) rars.push('epica'); if (P0.gR) rars.push('rara'); while (rars.length < n) rars.push(R() < D.RARE_PER_CARD ? 'rara' : 'comun'); }
    const got = {};   // ojo: hay ids repetidos entre jugadores y poderes (p. ej. "turbo"), por eso se guarda el tipo
    for (const rar of rars) { let opts = pool.filter(p => p.rar === rar); if (!opts.length) opts = pool; const pk = opts[Math.floor(R() * opts.length)], key = pk.k + ':' + pk.id; got[key] = got[key] || { pk, n: 0 }; got[key].n++; }
    const items = Object.values(got).map(({ pk, n }) => ({ kind: pk.k, id: pk.id, n, rar: pk.rar, isNew: !(pk.k === 'power' ? E.powers[pk.id] : E.players[pk.id]) }));
    for (const it of items) { const T = it.kind === 'power' ? E.powers : E.players; if (!T[it.id]) T[it.id] = { lvl: 1, copies: it.n - 1 }; else T[it.id].copies += it.n; }
    items.sort((a, b) => RORD.indexOf(b.rar) - RORD.indexOf(a.rar));
    const g = P0.gold, gold = Math.round((g[0] + R() * (g[1] - g[0])) * (1 + lg(D, E.trophies) * .2)); E.gold += gold;
    return { items, gold };
  }

  // ---- nombre del jugador (v91): lo escribe el jugador, no se toma de Google; se puede cambiar una sola vez ----
  const BAD = ['puta','puto','pendej','verga','chinga','mierda','culer','culo','pinche','joto','marica','maricon','zorra','cabron','coger','pene','vagina','sexo','nazi','hitler','fuck','shit','bitch','nigg','dick','pussy','cunt','whore','porn','idiot','imbecil','estupid','retrasad','mamon','panocha','ojete','perra','malparid','gonorrea','hijueputa'];
  const nameKey = n => String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  function cleanName(n) {
    n = String(n == null ? '' : n).replace(/\s+/g, ' ').trim();
    if (n.length < 3) return { err: 'El nombre necesita al menos 3 letras' };
    if (n.length > 16) return { err: 'Máximo 16 letras' };
    if (!/^[\p{L}\p{N} _.\-]+$/u.test(n)) return { err: 'Solo letras, números, espacio, punto, guion y guion bajo' };
    if (nameKey(n).length < 3) return { err: 'El nombre necesita al menos 3 letras' };
    const k = nameKey(n).replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't');
    if (BAD.some(w => k.includes(w))) return { err: 'Ese nombre no está permitido' };
    if (/^jugador\d*$/.test(k)) return { err: 'Escoge un nombre propio' };
    return { name: n };
  }
  // ---- acciones: cada una revisa que se pueda y cambia la cartera. {err} si no se puede ----
  const ok = out => ({ ok: true, out: out || {} }), err = e => ({ err: e });
  const has = (o, k) => typeof k === 'string' && k.length < 40 && o != null && Object.prototype.hasOwnProperty.call(o, k);   // nada de "__proto__" ni ids inventados
  const int = (v, a, b) => Math.max(a, Math.min(b, Math.floor(+v || 0)));
  function act(D, E, a, ctx) {
    const now = ctx.now, R = ctx.R;
    switch (a && a.t) {
      case 'get': return ok();
      case 'name': {
        const c = cleanName(a.n); if (c.err) return err(c.err);
        if (E.name && nameKey(E.name) === nameKey(c.name) && E.name === c.name) return err('Ese ya es tu nombre');
        if (E.name && (E.nameN || 0) >= 1) return err('Ya usaste tu cambio de nombre');
        if (E.name) E.nameN = (E.nameN || 0) + 1;
        E.name = c.name; return ok({ name: c.name, nameN: E.nameN || 0 });
      }
      case 'match': {
        const A = int(a.a, 0, 30), B = int(a.b, 0, 30), res = A > B ? 'win' : A < B ? 'loss' : 'draw', li = lg(D, E.trophies);
        let dt = res === 'win' ? Math.round(28 + R() * 5) : res === 'loss' ? -Math.round(22 + R() * 5) : 0;
        const before = E.trophies; E.trophies = Math.max(0, E.trophies + dt); dt = E.trophies - before; E.maxTrophies = Math.max(E.maxTrophies, E.trophies);
        E[res === 'win' ? 'wins' : res === 'loss' ? 'losses' : 'draws']++; if (!a.forfeit) { E.gf += A; E.ga += B; }
        const gold = res === 'win' ? winGold(li) : res === 'draw' ? 5 : 0; E.gold += gold;
        const xp = res === 'win' ? 30 : res === 'draw' ? 15 : 10, lu = addXp(E, xp);
        const pack = res === 'win' ? awardCycle(E) : null;
        return ok({ res, dt, gold, xp, lu, pack, li, nl: lg(D, E.trophies) });
      }
      case 'unlock': {
        const i = int(a.i, 0, 3), p = E.packs[i]; if (!p || !has(UNLOCK_H, p.t)) return err('No hay sobre ahí');
        if (p.at) return err('Ese sobre ya se está abriendo');
        if (E.packs.some((q, j) => j !== i && q && q.at && now < q.at)) return err('Ya hay otro sobre abriéndose');
        p.at = now + UNLOCK_H[p.t] * H; return ok({ i, at: p.at });
      }
      case 'open': {
        const i = int(a.i, 0, 3), p = E.packs[i]; if (!p || !has(UNLOCK_H, p.t)) return err('No hay sobre ahí');
        if (packState(p, now) !== 'listo') return err('Todavía no se abre');
        E.packs[i] = null; return ok({ t: p.t, roll: roll(D, E, p.t, R) });
      }
      case 'skip': {
        const i = int(a.i, 0, 3), p = E.packs[i]; if (!p || !has(UNLOCK_H, p.t)) return err('No hay sobre ahí');
        const g = gemsToOpen(p, now); if (E.gems < g) return err('Te faltan gemas');
        E.gems -= g; E.packs[i] = null; return ok({ t: p.t, gems: g, roll: roll(D, E, p.t, R) });
      }
      case 'free': {
        if (now < (E.freeAt || 0)) return err('El sobre gratis todavía no está listo');
        E.freeAt = now + FREE_H * H; return ok({ t: 'bronce', roll: roll(D, E, 'bronce', R) });
      }
      case 'buyPack': {
        if (!has(SHOP, a.p) || !has(D.PACKS, a.p)) return err('Ese sobre no existe');
        const s = SHOP[a.p];
        if (E[s[0]] < s[1]) return err('No te alcanza');
        E[s[0]] -= s[1]; return ok({ t: a.p, roll: roll(D, E, a.p, R) });
      }
      case 'buyCos': {
        const T = a.k === 'kit' ? D.KITS : a.k === 'boots' ? D.BOOTS : null; if (!T || !has(T, a.id)) return err('No existe');
        const o = T[a.id], own = a.k === 'kit' ? E.kits : E.boots;
        if (has(own, a.id)) return ok({ had: 1 });
        if (o.pack) return err('Solo sale en sobres');
        const cur = o.gems ? 'gems' : 'gold', pr = o.gems || o.cost || 0; if (E[cur] < pr) return err('No te alcanza');
        E[cur] -= pr; own[a.id] = 1; return ok({});
      }
      case 'upgrade': {
        const T = a.k === 'power' ? E.powers : E.players; if (!has(a.k === 'power' ? D.CARDS : D.PBY, a.id) || !has(T, a.id)) return err('No tienes esa carta');
        const o = T[a.id];
        if (o.lvl >= D.MAXLVL) return err('Ya está al nivel máximo');
        const need = needOf(D, a.id, o.lvl), cost = D.LVL_GOLD[o.lvl];
        if (o.copies < need) return err('Te faltan cartas'); if (E.gold < cost) return err('Te faltan monedas');
        E.gold -= cost; o.copies -= need; o.lvl++; const lu = addXp(E, 20); return ok({ lvl: o.lvl, lu });
      }
    }
    return err('Acción desconocida');
  }

  // ---- datos: se arman igual en el juego y en el servidor ----
  function data(G) {
    const pick = (T, keys) => Object.fromEntries(Object.entries(T).map(([k, o]) => [k, Object.fromEntries(keys.filter(x => o[x] != null).map(x => [x, o[x]]))]));
    const PBY = Object.fromEntries(G.PLAYERS.map(p => [p.id, { rar: p.rar }])), CARDS = pick(G.CARDS, ['rar']);
    return {
      PBY, CARDS, LEAGUES: G.LEAGUES.map(l => ({ min: l.min })), PACKS: JSON.parse(JSON.stringify(G.PACKS)), RARE_PER_CARD: G.RARE_PER_CARD,
      KITS: pick(G.KITS, ['rar', 'gems', 'cost', 'pack']), BOOTS: pick(G.BOOTS, ['rar', 'gems', 'cost', 'pack']),
      LVL_GOLD: G.LVL_GOLD.slice(), LVL_COPIES: G.LVL_COPIES.slice(), COPIES_BY_RAR: JSON.parse(JSON.stringify(G.COPIES_BY_RAR)), MAXLVL: G.MAXLVL,
      POOL: [...G.PLAYERS.map(p => ({ id: p.id, rar: p.rar, k: 'player' })), ...Object.keys(G.CARDS).map(k => ({ id: k, rar: G.CARDS[k].rar, k: 'power' }))]
    };
  }

  // ---- cartera a partir de una partida guardada (limpia, con topes; se usa una sola vez al pasar al servidor) ----
  // lim: topes extra (copas, nivel, victorias) que vienen de lo que ya validaban las reglas viejas
  function fromSave(D, s, now, R, lim) {
    s = (s && typeof s === 'object') ? s : {}; lim = lim || {};
    const n = (v, a, b, d) => { if (v == null || v === '') return d; v = Math.floor(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };
    const cards = (src, ids) => { const o = {}; for (const id of ids) { const c = has(src, id) ? src[id] : null; o[id] = c && typeof c === 'object' ? { lvl: n(c.lvl, 1, D.MAXLVL, 1), copies: n(c.copies, 0, 3000, 0) } : { lvl: 1, copies: 0 }; } return o; };
    const owned = (src, T, def) => { const o = { [def]: 1 }; if (src && typeof src === 'object') for (const k of Object.keys(src)) if (has(T, k) && src[k] && !T[k].pack) o[k] = 1; return o; };
    const packs = [0, 1, 2, 3].map(i => { const p = Array.isArray(s.packs) ? s.packs[i] : null; const t = p && (typeof p === 'string' ? p : p.t);
      if (!has(D.PACKS, t) || !has(UNLOCK_H, t)) return null; const at = n(p.at, 0, now + UNLOCK_H[t] * H, 0);
      return { t, at: at && at < now ? now : at }; });   // un sobre "ya listo" de antes queda listo, no antes
    const c = (s.cyc && typeof s.cyc === 'object') ? s.cyc : {};
    const lvl = n(s.lvl, 1, lim.lvl != null ? Math.max(1, lim.lvl) : 200, 1), tro = n(s.trophies, 0, lim.trophies != null ? lim.trophies : 8000, 0);
    const E = {
      gold: n(s.gold, 0, 100000, 0), gems: n(s.gems, 0, 5000, 50), xp: n(s.xp, 0, xpNeed(lvl) - 1, 0), lvl,
      trophies: tro, maxTrophies: 0, wins: n(s.wins, 0, lim.wins != null ? lim.wins : 1e6, 0), losses: n(s.losses, 0, 1e6, 0), draws: n(s.draws, 0, 1e6, 0),
      gf: n(s.gf, 0, 1e7, 0), ga: n(s.ga, 0, 1e7, 0),
      players: cards(s.players, Object.keys(D.PBY)), powers: cards(s.powers, Object.keys(D.CARDS)),
      kits: owned(s.kits, D.KITS, 'clasico'), boots: owned(s.boots, D.BOOTS, 'negro'), packs,
      freeAt: n(s.freeAt, 0, now + FREE_H * H, 0),
      cyc: { pos: n(c.pos, 0, 239, Math.floor(R() * 240)), n: n(c.n, 0, 1e7, 0), seed: n(c.seed, 0, 2 ** 31, Math.floor(R() * 1e9)), pend: !!c.pend }
    };
    E.maxTrophies = Math.max(E.trophies, n(s.maxTrophies, 0, lim.maxTrophies != null ? lim.maxTrophies : 8000, 0));
    E.name = ''; E.nameN = 0;   // el nombre lo escoge el jugador (no se pasa el de antes ni el de Google)
    return E;
  }
  // ¿la cartera está sana? (números enteros, nada raro). El servidor no guarda nada que no pase esto
  function sane(D, E) {
    if (typeof E.name !== 'string' || E.name.length > 16 || !(Number.isInteger(E.nameN) && E.nameN >= 0 && E.nameN < 100)) return false;
    const okN = v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 1e13;
    for (const k of ['gold', 'gems', 'xp', 'lvl', 'trophies', 'maxTrophies', 'wins', 'losses', 'draws', 'gf', 'ga', 'freeAt']) if (!okN(E[k])) return false;
    for (const [T, src] of [[E.players, D.PBY], [E.powers, D.CARDS]]) for (const k of Object.keys(T)) { const c = T[k]; if (!has(src, k) || !c || !okN(c.lvl) || !okN(c.copies)) return false; }
    for (const [T, src] of [[E.kits, D.KITS], [E.boots, D.BOOTS]]) for (const k of Object.keys(T)) if (!has(src, k)) return false;
    if (!Array.isArray(E.packs) || E.packs.length !== 4) return false;
    for (const p of E.packs) if (p !== null && (!p || !has(UNLOCK_H, p.t) || !okN(p.at))) return false;
    const c = E.cyc; if (!c || !okN(c.pos) || !okN(c.n) || !okN(c.seed)) return false;
    return true;
  }
  const pickE = s => { const o = {}; for (const k of EK) o[k] = s[k]; return JSON.parse(JSON.stringify(o)); };

  root.ECON = { nameKey, cleanName, EK, UNLOCK_H, FREE_H, SHOP, H, rng, lg, xpNeed, addXp, winGold, cycleSeq, cycleAt, nextPacks, untilKind, awardCycle, packState, gemsToOpen, needOf, packItems, roll, act, data, fromSave, sane, pickE };
})(typeof window !== 'undefined' ? window : globalThis);
