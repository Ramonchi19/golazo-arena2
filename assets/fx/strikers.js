// =====================================================================
// v231: efectos estilo Strikers (lo usan el juego y la página de prueba, así lo que se prueba es lo mismo).
// Lo que se ve "inteligente" en Strikers viene sobre todo de anunciar lo que va a pasar y de que todos reaccionen a eso:
//  1. Aro de destino: en cuanto sale un pase o centro, un aro marca dónde va a quedar el balón (o dónde lo recibe el compañero).
//  2. Aro de posesión bajo el que lleva el balón, del color de su equipo (cambia al instante cuando lo pierde).
//  3. Flechas de barrida en el piso hacia donde va la entrada.
//  4. Estelas gruesas del color del equipo: balón en pases y tiros, jugador al barrer o acelerar.
//  5. Destello al golpear el balón.
//  6. Vida: la cabeza sigue al balón, rebote suave al esperar, aplastado y estirado al caer, recibir golpes o recibir el balón.
//  7. Imán de recepción: el último metro, el balón se ve llegando al pie del que recibe.
// Uso: const FX = GZ_STRIKERS({scene, teamColor:[0x2f7bff,0xff3b4e], ballR, getRoot(p), getHead(p), getNeck(p), ballTrail:true|false})
//      FX.setColors([c0, c1])   ← colores de los uniformes del partido
//      FX.update(dt, {T, players, ball, user, state})   ← después de animar a los personajes y antes de dibujar
//      FX.magnet(p, out) → Vector3 | null              ← dónde dibujar el balón el último metro antes de que lo reciba
// Ajustes: GZ_STRIKERS.CFG (tamaños, colores, tiempos).
// =====================================================================
(function () {
const CFG = {
  destino: { r: .9, grosor: .16, pulso: .1, alto: .05 },
  posesion: { r: .78, grosor: .14, alto: .045, pop: .35 },
  flechas: { n: 3, sep: .9, largo: .55, ancho: .5 },
  estela: { balon: 14, jugador: 12, velBalon: 9, velJugador: 8.5, anchoBalon: .34, anchoJugador: .55 },
  destello: { dur: .16, tam: 1.4 },
  cabeza: { yaw: 1.05, pitch: .45, vel: 10 },
  vida: { rebote: .022, aplasta: .16, dur: .2 },
  iman: { dist: 1.6 },
};
function ringGeo(THREE, r, w) { return new THREE.RingGeometry(r - w, r, 40); }
function flat(THREE, mesh) { mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 3; mesh.frustumCulled = false; return mesh; }
const angD = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

window.GZ_STRIKERS = function (o) {
  const THREE = window.THREE, scene = o.scene, TC = (o.teamColor || [0x2f7bff, 0xff3b4e]).map(c => new THREE.Color(c)), BRv = o.ballR || .27;
  const add = THREE.AdditiveBlending;
  const mat = (c, op, blend) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: blend || THREE.NormalBlending });
  // ---- 1) aro de destino ----
  const dest = flat(THREE, new THREE.Mesh(ringGeo(THREE, CFG.destino.r, CFG.destino.grosor), mat(0xffffff, .9)));
  const destIn = flat(THREE, new THREE.Mesh(new THREE.CircleGeometry(CFG.destino.r * .55, 32), mat(0xffffff, .22)));
  dest.visible = destIn.visible = false; scene.add(dest); scene.add(destIn);
  // ---- 2) aro de posesión ----
  const pos = flat(THREE, new THREE.Mesh(ringGeo(THREE, CFG.posesion.r, CFG.posesion.grosor), mat(0xffffff, .95)));
  const posIn = flat(THREE, new THREE.Mesh(new THREE.CircleGeometry(CFG.posesion.r - CFG.posesion.grosor, 32), mat(0xffffff, .28)));
  pos.visible = posIn.visible = false; scene.add(pos); scene.add(posIn);
  // ---- 3) flechas de barrida ----
  const chevShape = new THREE.Shape(); { const a = CFG.flechas.ancho, l = CFG.flechas.largo; chevShape.moveTo(-a, 0); chevShape.lineTo(0, l); chevShape.lineTo(a, 0); chevShape.lineTo(a * .62, 0); chevShape.lineTo(0, l * .55); chevShape.lineTo(-a * .62, 0); chevShape.closePath(); }
  const chevGeo = new THREE.ShapeGeometry(chevShape), chevPool = [];
  function chevron() { const m = flat(THREE, new THREE.Mesh(chevGeo, mat(0xffffff, .85))); m.visible = false; scene.add(m); chevPool.push(m); return m; }
  // ---- 4) estelas (cinta de puntos) ----
  function ribbon(n, blend) {
    const g = new THREE.BufferGeometry(), P = new Float32Array(n * 2 * 3), A = new Float32Array(n * 2), I = [];
    for (let i = 0; i < n - 1; i++) { const a = i * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('alpha', new THREE.BufferAttribute(A, 1)); g.setIndex(I);
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: blend || add, uniforms: { col: { value: new THREE.Color(1, 1, 1) }, op: { value: 1 } },
      vertexShader: 'attribute float alpha;varying float vA;void main(){vA=alpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform vec3 col;uniform float op;varying float vA;void main(){gl_FragColor=vec4(col*(1.+vA*.6),vA*op);}' });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.visible = false; scene.add(mesh);
    return { mesh, pts: [], n, P, A, g, m };
  }
  function ribbonUpdate(R, head, width, upY, col, alive, dt) {
    if (alive) { R.pts.unshift({ x: head.x, y: head.y, z: head.z }); if (R.pts.length > R.n) R.pts.pop(); R.fade = 1; }
    else { R.fade = (R.fade || 0) - dt * 5; if (R.pts.length) R.pts.pop(); }
    if (R.pts.length < 2 || R.fade <= 0) { R.mesh.visible = false; if (R.fade <= 0) R.pts.length = 0; return; }
    R.mesh.visible = true; R.m.uniforms.col.value.copy(col); R.m.uniforms.op.value = clamp(R.fade, 0, 1);
    const n = R.pts.length;
    for (let i = 0; i < R.n; i++) {
      const p = R.pts[Math.min(i, n - 1)], q = R.pts[Math.min(i + 1, n - 1)] || p;
      let dx = p.x - q.x, dz = p.z - q.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const k = i / (R.n - 1), w = width * (1 - k * .85) * .5;
      const nx = upY ? 0 : -dz * w, nz = upY ? 0 : dx * w, ny = upY ? w : 0;
      R.P.set([p.x + nx, p.y + ny, p.z + nz, p.x - nx, p.y - ny, p.z - nz], i * 6);
      const a = i < n ? (1 - k) * (1 - k) : 0; R.A[i * 2] = R.A[i * 2 + 1] = a;
    }
    R.g.attributes.position.needsUpdate = true; R.g.attributes.alpha.needsUpdate = true;
  }
  const ballTrail = ribbon(CFG.estela.balon), ballTrailV = ribbon(CFG.estela.balon), ptrails = new Map();
  // ---- 5) destello ----
  const flashTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,250,210,.9)'); r.addColorStop(.6, 'rgba(255,220,120,.25)'); r.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 18, 64 + Math.sin(a) * 18); g.lineTo(64 + Math.cos(a) * 60, 64 + Math.sin(a) * 60); g.stroke(); }
    return new THREE.CanvasTexture(c); })();
  const flashes = [];
  function flash(x, y, z, big, col) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color: col || 0xffffff, transparent: true, depthWrite: false, blending: add }));
    s.position.set(x, y, z); s.renderOrder = 6; scene.add(s);
    const ring = flat(THREE, new THREE.Mesh(ringGeo(THREE, 1, .12), mat(col || 0xffffff, .9, add))); ring.position.set(x, .07, z); scene.add(ring);
    flashes.push({ s, ring, t: 0, big: big ? 1.6 : 1 });
  }
  // ---- estado por jugador ----
  const ST = new Map(); const st = p => { let s = ST.get(p); if (!s) { s = { hy: 0, hp: 0, sq: 0, sqT: 9, fly: 0, stun: 0, own: false, kick: 0, ph: Math.random() * 6 }; ST.set(p, s); } return s; };
  let lastOwner = null, posPop = 0, destA = 0, lastBallOwnerT = 0;
  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpQ3 = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), Xa = new THREE.Vector3(1, 0, 0);
  const SIM = window.SIM;
  // dónde va a quedar el balón (el mismo cálculo que usa la lógica)
  function target(ball) {
    const hs = Math.hypot(ball.vx, ball.vz);
    const r = ball.passTo;
    if (r && ball.cross && r.crossSpot) return { x: r.crossSpot.x, z: r.crossSpot.z, team: r.team };
    if (ball.y > .7 || ball.vy > 2) { if (SIM && SIM.landing) { const l = SIM.landing(ball); if (l) return { x: l.x, z: l.z, team: ball.lastTeam }; } }
    if (hs < 1.5) return null;
    const ux = ball.vx / hs, uz = ball.vz / hs, stop = hs / 1.05;
    if (r) { const s = clamp((r.x - ball.x) * ux + (r.z - ball.z) * uz, .5, stop); return { x: ball.x + ux * s, z: ball.z + uz * s, team: r.team }; }
    return { x: ball.x + ux * stop, z: ball.z + uz * stop, team: ball.lastTeam };
  }
  const C = {
    update(dt, S) {
      const { T, players, ball, state } = S; const play = state === 'play' || state == null;
      const owner = ball.owner || ball.gk || null;
      // --- 1) aro de destino ---
      let tg = null; if (play && !owner && !ball.isShot && (ball.passTo || ball.cross || Math.hypot(ball.vx, ball.vz) > 6)) tg = target(ball);
      destA += ((tg ? 1 : 0) - destA) * Math.min(1, dt * (tg ? 14 : 8));
      if (tg) { dest.position.set(tg.x, CFG.destino.alto, tg.z); destIn.position.set(tg.x, CFG.destino.alto - .005, tg.z); const c = TC[tg.team === 1 ? 1 : 0]; dest.material.color.copy(c); destIn.material.color.copy(c); }
      dest.visible = destIn.visible = destA > .02; dest.material.opacity = .95 * destA; destIn.material.opacity = .25 * destA;
      const pul = 1 + Math.sin(T * 9) * CFG.destino.pulso; dest.scale.setScalar(pul * (.6 + .4 * destA)); destIn.scale.setScalar(pul);
      // --- 2) aro de posesión ---
      if (owner !== lastOwner) { posPop = 1; if (owner) st(owner).sq = CFG.vida.aplasta * .6, st(owner).sqT = 0; lastOwner = owner; }
      posPop = Math.max(0, posPop - dt * 4);
      if (owner && play) { const c = TC[owner.team === 1 ? 1 : 0]; pos.visible = posIn.visible = true; pos.position.set(owner.x, CFG.posesion.alto, owner.z); posIn.position.set(owner.x, CFG.posesion.alto - .005, owner.z);
        pos.material.color.copy(c); posIn.material.color.copy(c); const sc = 1 + CFG.posesion.pop * sm(posPop) + Math.sin(T * 7) * .03; pos.scale.setScalar(sc); posIn.scale.setScalar(sc); }
      else pos.visible = posIn.visible = false;
      // --- 3) flechas de barrida ---
      let ci = 0;
      for (const p of players) {
        const sliding = p.act === 'slide' || p.act === 'tackle' || (p.tChg > 0 && p.tChg < 5);
        if (!sliding || !play) continue;
        const d = p.actDir && p.act ? p.actDir : { x: Math.sin(p.face), z: Math.cos(p.face) }, a = Math.atan2(d.x, d.z), c = TC[p.team === 1 ? 1 : 0];
        for (let k = 0; k < CFG.flechas.n; k++) {
          const m = chevPool[ci] || chevron(); ci++; m.visible = true; m.material.color.copy(c);
          const off = .9 + k * CFG.flechas.sep + ((T * 3) % 1) * .25; m.position.set(p.x + d.x * off, .06, p.z + d.z * off); m.rotation.z = a; m.material.opacity = .85 * (1 - k / (CFG.flechas.n + 1));
        }
      }
      for (; ci < chevPool.length; ci++) chevPool[ci].visible = false;
      // --- 4) estelas ---
      const hsB = Math.hypot(ball.vx, ball.vz), bc = TC[ball.lastTeam === 1 ? 1 : 0], bAlive = play && !owner && hsB > CFG.estela.velBalon;
      tmpV.set(ball.x, Math.max(BRv, ball.y - (o.ballDrop || 0)), ball.z);
      if (o.ballTrail !== false) {   // el juego ya tiene su estela de balón (ballFx): ahí se apaga esta
        ribbonUpdate(ballTrail, tmpV, CFG.estela.anchoBalon * (ball.isShot ? 1.5 : 1), false, bc, bAlive, dt);
        ribbonUpdate(ballTrailV, tmpV, CFG.estela.anchoBalon * (ball.isShot ? 1.3 : .8), true, bc, bAlive, dt); }
      for (const p of players) {
        let R = ptrails.get(p); const sp = Math.hypot(p.vx, p.vz), dash = p.act === 'slide' || p.act === 'tackle' || (p.burst > 0 && sp > 6) || sp > CFG.estela.velJugador;
        if (!R) { if (!dash) continue; R = ribbon(CFG.estela.jugador); ptrails.set(p, R); }
        tmpV.set(p.x, .55, p.z); ribbonUpdate(R, tmpV, CFG.estela.anchoJugador, true, TC[p.team === 1 ? 1 : 0], play && dash, dt);
      }
      // --- 5) destello al golpear ---
      for (const p of players) { const s = st(p); const k = p.kickT > 0; if (k && !s.kick && play) { flash(ball.x, Math.max(BRv, ball.y), ball.z, ball.isShot || ball.super, ball.super ? 0xffd23a : 0xffffff); s.sq = -CFG.vida.aplasta * .7; s.sqT = 0; } s.kick = k; }
      for (let i = flashes.length - 1; i >= 0; i--) { const f = flashes[i]; f.t += dt; const u = f.t / CFG.destello.dur;
        if (u >= 1) { scene.remove(f.s); scene.remove(f.ring); f.s.material.dispose(); f.ring.material.dispose(); flashes.splice(i, 1); continue; }
        f.s.scale.setScalar(CFG.destello.tam * f.big * (.5 + u)); f.s.material.opacity = 1 - u; f.ring.scale.setScalar(.4 + u * 1.8 * f.big); f.ring.material.opacity = .9 * (1 - u); }
      // --- 6) vida: cabeza al balón, rebote, aplastado ---
      for (const p of players) {
        const s = st(p), root = o.getRoot && o.getRoot(p); if (!root) continue;
        // eventos que aplastan o estiran
        const fly = p.flyY || 0; if (s.fly > .3 && fly <= .02) { s.sq = CFG.vida.aplasta; s.sqT = 0; } s.fly = fly;
        const stun = p.stun > 0; if (stun && !s.stun) { s.sq = CFG.vida.aplasta * 1.2; s.sqT = 0; } s.stun = stun;
        s.sqT += dt; const e = s.sqT < CFG.vida.dur ? s.sq * Math.sin(Math.PI * s.sqT / CFG.vida.dur) * (1 - s.sqT / CFG.vida.dur * .5) : 0;
        const sp = Math.hypot(p.vx, p.vz), idle = sp < .6 && !(p.kickT > 0) && !p.windK && !stun;
        const bob = idle ? Math.abs(Math.sin(T * 5.5 + s.ph)) * CFG.vida.rebote : 0;
        root.scale.set(1 + e * .5, 1 - e, 1 + e * .5); root.position.y += bob;   // se suma: el juego pone la altura de saltos y caídas en cada cuadro
        // cabeza (y cuello) hacia el balón, sin pasarse del límite
        const head = o.getHead && o.getHead(p); if (!head || !head.parent || stun) { s.hy *= .8; s.hp *= .8; continue; }
        const lk = (p === ball.owner) ? null : ball;   // el que lleva el balón mira al frente (ya lo trae en los pies)
        let wy = 0, wp = 0;
        if (lk) { const by = root.rotation.y, dx = lk.x - p.x, dz = lk.z - p.z, dist = Math.hypot(dx, dz) || 1;
          wy = clamp(angD(Math.atan2(dx, dz), by), -CFG.cabeza.yaw, CFG.cabeza.yaw); wp = clamp(Math.atan2((lk.y || .3) - 1.9, dist), -CFG.cabeza.pitch, CFG.cabeza.pitch * .6);
          if (Math.abs(angD(Math.atan2(dx, dz), by)) > 2.4) wy *= .4; }   // si está detrás, gira poco (no se tuerce)
        const k = Math.min(1, dt * CFG.cabeza.vel); s.hy += (wy - s.hy) * k; s.hp += (wp - s.hp) * k;
        const neck = o.getNeck && o.getNeck(p);
        for (const [b, w] of neck ? [[neck, .45], [head, .55]] : [[head, 1]]) {
          b.updateMatrixWorld(true); b.getWorldQuaternion(tmpQ);
          tmpQ2.setFromAxisAngle(Y, s.hy * w); tmpV.set(Math.cos(root.rotation.y), 0, -Math.sin(root.rotation.y)); tmpQ3.setFromAxisAngle(tmpV, -s.hp * w);
          tmpQ.premultiply(tmpQ3).premultiply(tmpQ2);
          b.parent.getWorldQuaternion(tmpQ2); b.quaternion.copy(tmpQ2.invert().multiply(tmpQ));
        }
      }
    },
    // 7) imán: el último tramo antes de recibir, el balón se dibuja llegando al pie del receptor
    magnet(p, out) {
      const ball = arguments[2]; if (!ball || ball.owner || ball.gk || ball.passTo !== p || ball.cross || ball.y > .9) return null;
      const d = Math.hypot(ball.x - p.x, ball.z - p.z); if (d > CFG.iman.dist) return null;
      const fx = Math.sin(p.face), fz = Math.cos(p.face), w = sm(1 - d / CFG.iman.dist);
      out.set(p.x + fx * (BRv + .35), BRv, p.z + fz * (BRv + .35)); out.w = w; return out;
    },
    setColors(c) { if (c && c[0] != null && c[1] != null) { TC[0].set(c[0]); TC[1].set(c[1]); } },
    dispose() { for (const m of [dest, destIn, pos, posIn, ballTrail.mesh, ballTrailV.mesh, ...chevPool]) scene.remove(m); for (const R of ptrails.values()) scene.remove(R.mesh); },
  };
  return C;
};
window.GZ_STRIKERS.CFG = CFG;
})();
