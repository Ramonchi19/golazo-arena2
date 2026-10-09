// Titan Crashers · cartera de cada jugador (v79)
// Un Durable Object por cuenta. Aquí viven monedas, gemas, cartas, sobres, copas y el ciclo de sobres.
// El teléfono pide una acción ("abrir sobre", "comprar", "terminó el partido") y aquí se decide con las reglas de assets/econ.js.
// Lo que queda se copia a Firestore (players/{uid}: econ, copas, nivel…) para el ranking y para verlo en la consola.
import { DurableObject } from "cloudflare:workers";
import { ECON, ED } from "./econ.gen.js";

const MIN_MATCH_MS = 110000;  // una victoria o empate solo cuenta si el partido empezó hace casi 2 minutos (dura 2 min)
const MAX_WINS_HOUR = 25;     // nadie gana más de 25 partidos de verdad en una hora
const R = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;

// ---------- base64 ----------
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const b64u = s => { s = s.replace(/-/g, "+").replace(/_/g, "/"); return b64(s + "=".repeat((4 - s.length % 4) % 4)); };
const u8b64u = u => { let s = ""; const a = new Uint8Array(u); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const strb64u = s => u8b64u(new TextEncoder().encode(s));
const dec = s => JSON.parse(new TextDecoder().decode(b64u(s)));

// ---------- cuenta de servicio de Firebase (secreto FIREBASE_SA) ----------
let SA = null;
function sa(env) { if (!SA) SA = JSON.parse(env.FIREBASE_SA); return SA; }
export function econReady(env) { try { return !!(env.FIREBASE_SA && sa(env).private_key && sa(env).client_email); } catch (e) { return false; } }

// ---------- quién es: token de Firebase Auth firmado por Google ----------
let KEYS = null, KEYS_AT = 0;
async function googleKeys(force) {
  if (KEYS && (!force || Date.now() - KEYS_AT < 60e3) && Date.now() - KEYS_AT < 3600e3) return KEYS;   // como mucho una recarga forzada por minuto
  const r = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  const j = await r.json(), out = {};
  for (const k of j.keys || []) out[k.kid] = await crypto.subtle.importKey("jwk", k, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  KEYS = out; KEYS_AT = Date.now(); return KEYS;
}
export async function uidFrom(req, env) {
  const m = /^Bearer\s+(.+)$/.exec(req.headers.get("authorization") || ""); if (!m) return null;
  const [h, p, s] = m[1].split("."); if (!h || !p || !s) return null;
  let H, P; try { H = dec(h); P = dec(p); } catch (e) { return null; }
  if (H.alg !== "RS256") return null;
  let k = (await googleKeys())[H.kid]; if (!k) k = (await googleKeys(true))[H.kid]; if (!k) return null;
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", k, b64u(s), new TextEncoder().encode(h + "." + p)); if (!ok) return null;
  const pid = sa(env).project_id, now = Date.now() / 1000;
  if (P.aud !== pid || P.iss !== "https://securetoken.google.com/" + pid || !(P.exp > now - 30) || P.iat > now + 300 || !P.sub || P.sub.length > 128) return null;
  return P.sub;
}

// ---------- Firestore con la cuenta de servicio ----------
let TOK = null;
async function saToken(env) {
  if (TOK && TOK.exp > Date.now() + 60e3) return TOK.t;
  const S = sa(env), now = Math.floor(Date.now() / 1000);
  const head = strb64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = strb64u(JSON.stringify({ iss: S.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const pem = S.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey("pkcs8", b64(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head + "." + claim));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + head + "." + claim + "." + u8b64u(sig) });
  const j = await r.json(); if (!j.access_token) throw new Error("no hubo token de la cuenta de servicio: " + JSON.stringify(j).slice(0, 200));
  TOK = { t: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 }; return TOK.t;
}
const fsUrl = (env, uid) => `https://firestore.googleapis.com/v1/projects/${sa(env).project_id}/databases/(default)/documents/players/${encodeURIComponent(uid)}`;
function enc(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
}
function decV(v) {
  if (!v || "nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return +v.integerValue;
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decV);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decV(x)]));
  return null;
}
async function fsRead(env, uid) {
  const r = await fetch(fsUrl(env, uid), { headers: { authorization: "Bearer " + await saToken(env) } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("firestore lectura " + r.status);
  const j = await r.json(); return decV({ mapValue: { fields: j.fields || {} } });
}
async function fsPatch(env, uid, fields, remove) {
  const mask = [...Object.keys(fields), ...(remove || [])].map(k => "updateMask.fieldPaths=" + encodeURIComponent(k)).join("&");
  const r = await fetch(fsUrl(env, uid) + "?" + mask, { method: "PATCH", headers: { authorization: "Bearer " + await saToken(env), "content-type": "application/json" },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, enc(v)])) }) });
  if (!r.ok) throw new Error("firestore escritura " + r.status + " " + (await r.text()).slice(0, 200));
}

// v91: nombres únicos. names/{clave} = {uid}. Se crea solo si no existe (o si ya es de este jugador)
const nmUrl = (env, key) => `https://firestore.googleapis.com/v1/projects/${sa(env).project_id}/databases/(default)/documents/names`;
async function claimName(env, uid, key) {
  const r = await fetch(nmUrl(env) + "?documentId=" + encodeURIComponent(key), { method: "POST", headers: { authorization: "Bearer " + await saToken(env), "content-type": "application/json" },
    body: JSON.stringify({ fields: { uid: enc(uid) } }) });
  if (r.ok) return true;
  if (r.status === 409) { const g = await fetch(nmUrl(env) + "/" + encodeURIComponent(key), { headers: { authorization: "Bearer " + await saToken(env) } });
    if (g.ok) { const j = await g.json(); return decV((j.fields || {}).uid) === uid; } return false; }
  throw new Error("firestore nombre " + r.status);
}
async function freeName(env, key) { try { await fetch(nmUrl(env) + "/" + encodeURIComponent(key), { method: "DELETE", headers: { authorization: "Bearer " + await saToken(env) } }); } catch (e) {} }
// lo que se manda al teléfono (sin datos internos del servidor)
const pub = E => { const o = Object.assign({}, E); delete o.mt; delete o.wh; delete o.adj; return o; };
// cambios a mano desde la consola de Firebase: escribe en players/{uid} un mapa "ajuste" (por ejemplo ajuste: {gold: 5000, gems: 300, n: 1}).
// Se aplica una sola vez cuando el jugador entra; para volver a aplicarlo cambia cualquier valor (por ejemplo n: 2).
const ADJ = ["gold", "gems", "trophies", "maxTrophies", "xp", "lvl"];
function applyAdj(E, adj) { let n = 0; for (const k of ADJ) if (adj && typeof adj[k] === "number" && isFinite(adj[k])) { E[k] = Math.max(0, Math.floor(adj[k])); n++; } if (n) E.maxTrophies = Math.max(E.maxTrophies, E.trophies); return n; }

export class Cartera extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.E = null; this.q = Promise.resolve(); }
  // una cosa a la vez por jugador (acciones y copia a Firestore): si llegan dos juntas, la segunda espera
  run(fn) { const p = this.q.then(fn); this.q = p.catch(() => {}); return p; }
  async fetch(req) {
    const uid = req.headers.get("x-uid"); let a = null;
    try { a = await req.json(); } catch (e) {}
    const out = await this.run(() => this.handle(uid, a)).catch(e => ({ err: "Error del servidor", detalle: String(e && e.message || e).slice(0, 200) }));
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
  }
  async handle(uid, a) {
    if (!a || typeof a !== "object" || Array.isArray(a) || typeof a.t !== "string") return { err: "Petición no válida" };
    const now = Date.now(), st = this.ctx.storage;
    if (!this.E) this.E = await st.get("E");
    // se trabaja sobre una copia: si algo sale mal, lo guardado no cambia
    let E = this.E ? structuredClone(this.E) : null, fresh = false;
    if (!E || a.t === "get") {
      let doc = null;
      try { doc = await fsRead(this.env, uid); } catch (e) { if (!E) return { err: "No se pudo leer tu cuenta. Intenta de nuevo." }; }
      if (!E) {
        if (doc && doc.econ && doc.econ.cyc) E = Object.assign(ECON.fromSave(ED, {}, now, R), doc.econ);   // copia que escribió este mismo servidor
        else if (doc && doc.save && doc.trophies != null)   // cuenta de antes (v78 o menos): se pasa su partida una sola vez, con topes
          E = ECON.fromSave(ED, doc.save, now, R, { trophies: doc.trophies, maxTrophies: doc.maxTrophies, wins: doc.wins, lvl: doc.lvl });
        else E = ECON.fromSave(ED, {}, now, R);   // cuenta nueva: empieza de cero (lo del teléfono no se cree)
        fresh = true;
      }
      if (doc && doc.ajuste && typeof doc.ajuste === "object") { const key = JSON.stringify(doc.ajuste).slice(0, 500); if (key !== E.adj) { applyAdj(E, doc.ajuste); E.adj = key; fresh = true; } }
    }
    const save = async X => { if (!ECON.sane(ED, X)) throw new Error("cartera inválida"); this.E = X; await st.put("E", X); await st.put("uid", uid); await this.later(); };
    if (fresh) await save(E);                       // lo cargado/importado/ajustado queda guardado antes de cualquier acción
    const reply = r => ({ ...r, E: pub(this.E), now });
    if (a.t === "get") return reply({ ok: true, out: {} });
    E = structuredClone(this.E);
    if (a.t === "start") { E.mt = now; await save(E); return reply({ ok: true, out: {} }); }
    if (a.t === "match" && !E.mt) return reply({ err: "Ese partido no contó (no empezó en el servidor)" });
    const oldName = E.name, mt = E.mt, r = ECON.act(ED, E, a, { now, R });
    if (r.err) return reply({ err: r.err });         // nada cambia
    if (a.t === "name") {
      const k = ECON.nameKey(E.name), ok = await claimName(this.env, uid, k).catch(() => null);
      if (ok === null) return reply({ err: "No se pudo revisar el nombre. Intenta de nuevo." });
      if (!ok) return reply({ err: "Ese nombre ya lo tiene otro jugador" });
      if (oldName && ECON.nameKey(oldName) !== k) await freeName(this.env, ECON.nameKey(oldName));
    }
    if (a.t === "match") {
      const res = r.out.res, wh = (E.wh || []).filter(t => now - t < 3600e3);
      const bad = res !== "loss" && now - mt < MIN_MATCH_MS ? "Ese partido no contó (fue demasiado corto)"
        : res === "win" && wh.length >= MAX_WINS_HOUR ? "Demasiadas victorias seguidas: descansa un rato" : null;
      if (bad) { const X = structuredClone(this.E); delete X.mt; await save(X); return reply({ err: bad }); }   // no se da nada y el inicio ya se usó
      if (res === "win") wh.push(now);
      E.wh = wh; delete E.mt;
    }
    await save(E);
    return reply({ ok: true, out: r.out });
  }
  // la copia en Firestore se escribe un momento después (si hay varias acciones seguidas, se escribe una vez)
  async later() { await this.ctx.storage.setAlarm(Date.now() + 1500); }
  async alarm() { await this.run(() => this.mirror()); }
  async mirror() {
    const E = this.E || await this.ctx.storage.get("E"), uid = await this.ctx.storage.get("uid"); if (!E || !uid) return;
    try { await fsPatch(this.env, uid, { econ: pub(E), ...(E.name ? { name: E.name } : {}), trophies: E.trophies, maxTrophies: E.maxTrophies, lvl: E.lvl, wins: E.wins, losses: E.losses, draws: E.draws }); }
    catch (e) { console.log("[cartera] " + e.message); await this.ctx.storage.setAlarm(Date.now() + 30000); }
  }
}
