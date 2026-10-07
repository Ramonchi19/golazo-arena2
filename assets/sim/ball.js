/* Wild Strikers · simulación del partido (parte 1: balón, física y goles)
   Este archivo no usa gráficos ni sonido: corre igual en el navegador y en el servidor.
   Todo lo visual (polvo, chispas, sonidos, letreros) se pide por medio de W.fx, que en el
   servidor no hace nada. */
(function (G) {
  'use strict';
  const SIM = G.SIM || (G.SIM = {});

  // Medidas de la cancha y del balón (iguales en cliente y servidor)
  const C = SIM.C = { L: 32, HW: 16, GW: 4.8, GH: 3.3, BR: .40, GRAV: 24, RUN: 8.2 };
  const { L, HW, GW, GH, BR, GRAV, RUN } = C;
  const clamp = SIM.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  SIM.rand = (a, b) => a + Math.random() * (b - a);

  const NOFX = new Proxy({}, { get: () => () => {} });
  const fxOf = W => W.fx || NOFX;

  SIM.newBall = () => ({ x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, owner: null, gk: null, super: false,
    lastTeam: -1, passTo: null, cross: false, tried: [false, false] });

  SIM.resetBall = b => Object.assign(b, { x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, owner: null, gk: null, super: false,
    passTo: null, cross: false, tried: [false, false], lastTeam: -1 });

  // Dónde cae el balón a la altura h (por defecto la cabeza, 1.2)
  SIM.landing = (b, h) => {
    const a = GRAV / 2, bb = b.vy, c = b.y - (h == null ? 1.2 : h), disc = bb * bb + 4 * a * c;
    if (disc < 0) return { x: b.x, z: b.z, t: 0 };
    const t = (bb + Math.sqrt(disc)) / (2 * a);
    return { x: b.x + b.vx * t, z: b.z + b.vz * t, t };
  };
  SIM.landT = b => { const a = GRAV / 2, bb = b.vy, c = b.y - BR, d = bb * bb + 4 * a * c; return d < 0 ? 0 : (bb + Math.sqrt(d)) / (2 * a); };

  // Balón pegado al pie del jugador que lo conduce
  SIM.ballCarried = (W, dt) => {
    const ball = W.ball, p = ball.owner, sp = Math.hypot(p.vx, p.vz), fx = Math.sin(p.face), fz = Math.cos(p.face);
    const fr = Math.max(0, 1 - 1.25 * dt); ball.vx *= fr; ball.vz *= fr;
    p.touchT = (p.touchT || 0) - dt;
    const footX = p.x + fx * .45, footZ = p.z + fz * .45, dfoot = Math.hypot(ball.x - footX, ball.z - footZ);
    if (dfoot < .5 && p.touchT <= 0) {
      const I = p.intent;
      if (I) {
        const fdot = fx * I.x + fz * I.z, tgt = Math.min(p.intentSp || RUN, RUN * 1.4) * p.spdMul * (p.star > 0 ? 1.35 : 1);
        if (fdot > .35) {
          const along = p.vx * I.x + p.vz * I.z, v = Math.min(tgt, Math.max(0, along) + 2.6) * (1.1 + .02 * Math.max(0, along)) * (1.95 - (p.dribMul || 1));
          ball.vx = I.x * Math.max(2, v); ball.vz = I.z * Math.max(2, v); p.touchT = clamp(.4 - sp * .025, .2, .4);
        } else { ball.vx = I.x * 2.6; ball.vz = I.z * 2.6; p.touchT = .3; p.noCol = .35; p.touchVis = .22; }
      } else { ball.vx = p.vx * .55; ball.vz = p.vz * .55; p.touchT = .1; }
    }
    // el balón no atraviesa al jugador: rebota en su cuerpo
    p.noCol = (p.noCol || 0) - dt; const bx = ball.x - p.x, bz = ball.z - p.z, bd = Math.hypot(bx, bz);
    if (p.noCol <= 0 && bd < .38 && bd > .001) {
      const nx = bx / bd, nz = bz / bd, vn = (ball.vx - p.vx) * nx + (ball.vz - p.vz) * nz;
      ball.x = p.x + nx * .38; ball.z = p.z + nz * .38;
      if (vn < 0) { ball.vx -= vn * nx * 1.05; ball.vz -= vn * nz * 1.05; }
    }
    ball.x += ball.vx * dt; ball.z += ball.vz * dt; ball.y = BR; ball.vy = 0;
    if (Math.abs(ball.z) > HW - BR) { ball.z = Math.sign(ball.z) * (HW - BR); ball.vz *= -.5; }
    if (Math.abs(ball.x) > L - BR) { ball.x = Math.sign(ball.x) * (L - BR); ball.vx *= -.5; }
    if (Math.hypot(ball.x - p.x, ball.z - p.z) > 3.2) { ball.owner = null; ball.lastTeam = p.team; ball.passTo = null; ball.tried = [false, false]; p.pcd = .3; }
  };

  // Balón suelto: gravedad, rebotes, fricción, bandas, postes y goles
  SIM.ballFree = (W, dt) => {
    const ball = W.ball, F = fxOf(W);
    const g = ball.super ? GRAV * .15 : GRAV;
    ball.vy -= g * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.z += ball.vz * dt;
    if (ball.y < BR) {
      ball.y = BR;
      if (ball.vy < -2.5) { F.squash(Math.min(.12, -ball.vy * .009)); ball.vy = -ball.vy * .55; if (ball.vy > 3) F.bounce(ball.x, ball.z); }
      else ball.vy = 0;
    }
    const onG = ball.y <= BR + .01, hs = Math.hypot(ball.vx, ball.vz);
    let fr = onG ? 1.05 : .1;
    if (onG) for (const z of (W.zones || [])) { if (z.kind === 'lodo' && Math.hypot(ball.x - z.x, ball.z - z.z) < z.r) { fr = 4.5; break; } }
    ball.vx *= Math.max(0, 1 - fr * dt); ball.vz *= Math.max(0, 1 - fr * dt);
    if (onG) { ball.cross = false; if (hs < 8) ball.super = false; }
    if (ball.super) {
      F.superTrail(ball);
      for (const u of W.players) {
        if (u.gk || u.team === ball.lastTeam || u.stun > 0 || u.star > 0) continue;
        if (Math.hypot(u.x - ball.x, u.z - ball.z) < .8 && ball.y < 2.1) {
          const l = hs || 1; if (W.knock) W.knock(u, ball.vx / l, ball.vz / l, 11, 1.1);
          F.runOver(u); ball.vx *= .85; ball.vz *= .85;
        }
      }
    }
    if (ball.z > HW - BR) { ball.z = HW - BR; ball.vz = -Math.abs(ball.vz) * .75; if (hs > 10) F.zap(ball.x, ball.y, HW); }
    if (ball.z < -HW + BR) { ball.z = -HW + BR; ball.vz = Math.abs(ball.vz) * .75; if (hs > 10) F.zap(ball.x, ball.y, -HW); }
    for (const s of [1, -1]) {
      const xs = ball.x * s;
      if (xs > L - BR) {
        const inMouth = Math.abs(ball.z) < GW - BR && ball.y < GH - BR;
        if (xs > L + .05 && inMouth || xs > L + .3 && Math.abs(ball.z) < GW && ball.y < GH) {
          if (xs > L + .7 && W.onGoal) W.onGoal(s === 1 ? 0 : 1);
          if (Math.abs(ball.z) > GW - BR) { ball.z = Math.sign(ball.z) * (GW - BR); ball.vz *= -.3; }
          if (ball.y > GH - BR) { ball.y = GH - BR; ball.vy = -Math.abs(ball.vy) * .3; }
        } else if (xs < L + .3 && !inMouth) {
          const nearPost = Math.abs(Math.abs(ball.z) - GW) < .5 && ball.y < GH + .3, nearBar = Math.abs(ball.z) < GW + .3 && Math.abs(ball.y - GH) < .5;
          ball.x = s * (L - BR); ball.vx = -ball.vx * (nearPost || nearBar ? .7 : .6);
          if (nearPost || nearBar) { F.post(ball, nearBar); ball.tried = [false, false]; }
          else if (hs > 10) F.wide(s * L, ball);
        }
      }
    }
  };

  // Muros (poder "Muro"): el balón rebota en ellos
  SIM.ballWalls = W => {
    const ball = W.ball, F = fxOf(W);
    for (const w of (W.walls || [])) {
      if (w.up < .6 || ball.y > w.h + BR) continue;
      const hx = w.th / 2 + BR, hz = w.len / 2 + BR;
      if (Math.abs(ball.x - w.x) < hx && Math.abs(ball.z - w.z) < hz) {
        const s = Math.sign(ball.x - w.x - ball.vx * .02) || 1; ball.x = w.x + s * hx;
        if (ball.vx * s < 0) ball.vx = -ball.vx * .55;
        if (Math.abs(ball.vx) > 4) F.sfx('bounce');
        if (ball.owner) { const o = ball.owner; ball.owner = null; ball.lastTeam = o.team; o.pcd = .3; }
      }
    }
  };

  // Marcador: lo que cambia en el partido cuando entra un gol (los festejos los pone W.fx)
  SIM.scoreGoal = (W, team) => {
    W.score[team]++;
    for (const p of W.players) { p.stun = 0; p.slip = 0; p.spinT = 0; p.elecT = 0; }
    W.energy[1 - team] = Math.min(10, W.energy[1 - team] + 2);
    W.ball.vx *= .92; W.ball.vz *= .92; W.ball.super = false;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SIM;
})(typeof globalThis !== 'undefined' ? globalThis : this);
