# v230a: para cada patada de las librerías (anims*.glb) mide el golpe y lo guarda en su .json:
#   hit  = [x, y, z] dónde está el empeine en el instante del golpe (meta.key), en alturas de cadera, respecto al punto del piso bajo la cadera
#          (x + = a la izquierda del personaje, y = altura, z + = adelante)
#   push = hacia dónde se mueve el pie en ese instante, en grados (0 = al frente, + = hacia su izquierda)
#   hitT = instante real del golpe: el pie que patea va más rápido hacia adelante estando abajo (el 'key' viejo de las librerías de grupo estaba mal)
# Esqueleto de referencia: assets/models/zurdito.glb (reposo sin giros, igual que todos los personajes del juego).
# Uso (desde la raíz): python3 tools/claude/medir_golpes.py [--escribir]
import json, struct, sys, numpy as np
def load(p):
    b = open(p, 'rb').read(); L = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20+L]); bl = struct.unpack('<I', b[20+L:24+L])[0]; return j, b[28+L:28+L+bl]
def qrot(q, v): x, y, z, w = q; u = np.array([x, y, z]); return v + 2*np.cross(u, np.cross(u, v) + w*v)
def qmul(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1*x2+x1*w2+y1*z2-z1*y2, w1*y2-x1*z2+y1*w2+z1*x2, w1*z2+x1*y2-y1*x2+z1*w2, w1*w2-x1*x2-y1*y2-z1*z2])
def slerp(a, b, t):
    if np.dot(a, b) < 0: b = -b
    d = min(1, np.dot(a, b))
    if d > .9995: r = a+(b-a)*t; return r/np.linalg.norm(r)
    th = np.arccos(d); return (np.sin((1-t)*th)*a + np.sin(t*th)*b)/np.sin(th)
mj, _ = load('assets/models/zurdito.glb'); off = {n.get('name'): np.array(n.get('translation', [0, 0, 0])) for n in mj['nodes']}
CH = {s: ['Hips', s+'UpLeg', s+'Leg', s+'Foot', s+'ToeBase'] for s in ('Left', 'Right')}
hip0 = off['Hips'][1]; toe0 = hip0 + sum(off[b][1] for b in CH['Right'][1:]); HH = hip0 - toe0   # altura de cadera en reposo
KICKS = ['pass_r', 'pass_l', 'shoot_run', 'chip', 'penalty', 'shoot_power', 'shoot_quick', 'kick', 'gk_dropkick']
def measure(lib):
    j, bn = load(f'assets/{lib}.glb'); names = [n['name'] for n in j['nodes']]; meta = json.load(open(f'assets/{lib}.json'))
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
        o = bv.get('byteOffset', 0)+a.get('byteOffset', 0); return np.frombuffer(bn, np.float32, a['count']*n, o).reshape(a['count'], n)
    out = {}
    for a in j['animations']:
        nm = a['name']
        if nm not in KICKS or 'key' not in meta.get(nm, {}): continue
        R = {}; tm = None; HT = None
        for c in a['channels']:
            s = a['samplers'][c['sampler']]; nn = names[c['target']['node']]
            if c['target']['path'] == 'rotation': R[nn] = (acc(s['input']).ravel(), acc(s['output']))
            elif nn == 'Hips': HT = (acc(s['input']).ravel(), acc(s['output']))
        def rot(n, t):
            ts, v = R[n]
            if t <= ts[0]: return v[0]
            if t >= ts[-1]: return v[-1]
            k = np.searchsorted(ts, t)-1; return slerp(v[k], v[k+1], (t-ts[k])/(ts[k+1]-ts[k]))
        def hipy(t):
            if HT is None: return hip0
            return hip0*np.interp(t, HT[0], HT[1][:, 1])/100
        def foot(side, t):   # empeine = mitad entre tobillo y punta, respecto al piso bajo la cadera
            q = rot('Hips', t); p = np.array([0, hipy(t), 0.]); pts = {}
            for b in CH[side][1:]:
                p = p + qrot(q, off[b]); q = qmul(q, rot(b, t)); pts[b] = p.copy()
            return (pts[side+'Foot'] + pts[side+'ToeBase'])/2 - np.array([0, toe0, 0])
        key = meta[nm]['key']; dt = 1/240; dur = meta[nm].get('dur', key+.5)
        # golpe real (v230a): el instante en que el pie que patea va más rápido HACIA ADELANTE estando abajo (empeine a menos de 0.35 alturas de cadera).
        # (el 'key' viejo de las librerías de grupo caía con la pierna arriba o armándose: el balón salía a destiempo)
        ts = np.arange(.03, dur*.8, 1/120); best = None   # sin los primeros cuadros ni el último 20 % (ahí ya empieza a correr otra vez)
        side = 'Left' if nm.endswith('_l') else 'Right'   # todas las originales son con la derecha; pass_l es su espejo
        tback = ts[int(np.argmin([foot(side, t)[2] for t in ts]))]   # el golpe viene después de armar la pierna (pie en su punto más atrás)
        for t in ts[ts > tback]:
            h = foot(side, t)
            if h[1]/HH > .35 or h[2]/HH < -.05: continue   # abajo y ya adelante del cuerpo (no el paso de apoyo ni el armado)
            vz = (foot(side, t+dt)-foot(side, t-dt))[2]/(2*dt)/HH
            if best is None or vz > best[0]: best = (vz, side, t)
        vz, side, hitT = best
        v = foot(side, hitT+dt)-foot(side, hitT-dt); h = foot(side, hitT)
        out[nm] = dict(foot=side[0].lower(), key=key, peak=round(float(hitT), 3), hitT=round(float(hitT), 3), vz=round(float(vz), 1),
                       push=round(float(np.degrees(np.arctan2(v[0], v[2]))), 1), hit=[round(float(x/HH), 3) for x in h])
    return out, meta
write = '--escribir' in sys.argv
for lib in ['anims', 'anims_peq', 'anims_med', 'anims_gra', 'anims_atl']:
    out, meta = measure(lib)
    print('==', lib)
    for nm, o in out.items():
        print(f"  {nm:12s} pie {o['foot']}  key viejo {o['key']:.3f}s → golpe real {o['hitT']:.3f}s (vel adelante {o['vz']:.1f})  empuje {o['push']:+6.1f}°  empeine x{o['hit'][0]:+.2f} y{o['hit'][1]:+.2f} z{o['hit'][2]:+.2f}")
        meta[nm]['hitT'] = o['hitT']; meta[nm]['push'] = o['push']; meta[nm]['hit'] = o['hit']; meta[nm]['foot'] = o['foot']
    if write: json.dump(meta, open(f'assets/{lib}.json', 'w'), separators=(',', ':'))
print('escrito' if write else '(solo medición; --escribir para guardarlo)')
