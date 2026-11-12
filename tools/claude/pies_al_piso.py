# v231: sube o baja la cadera de cada cuadro para que el pie más bajo quede justo en el piso (el horneado de animaciones de otro
# esqueleto deja los pies hundidos o flotando). Reescribe la pista de cadera en el mismo .glb.
# Uso (desde la raíz): python3 tools/claude/pies_al_piso.py assets/anims_extra.glb [clip ...]   (sin clips: todos los que no estén en el aire)
import sys, json, struct, numpy as np
exec(open(__file__.replace('pies_al_piso.py', 'medir_golpes.py')).read().split("def measure(lib):")[0])
args = sys.argv[1:]; CONST = set(a[8:] for a in args if a.startswith('--const='))   # v232: --const=clip → un solo ajuste para todo el clip (saltos: que no se coma el brinco)
args = [a for a in args if not a.startswith('--const=')]; path = args[0]; only = set(args[1:]) | CONST
raw = bytearray(open(path, 'rb').read()); L = struct.unpack('<I', raw[12:16])[0]; j = json.loads(raw[20:20+L]); bstart = 28+L
names = [n['name'] for n in j['nodes']]
def acc(i, write=None):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
    o = bstart + bv.get('byteOffset', 0) + a.get('byteOffset', 0); arr = np.frombuffer(bytes(raw[o:o+a['count']*n*4]), np.float32).reshape(a['count'], n).copy()
    if write is not None: raw[o:o+a['count']*n*4] = np.asarray(write, np.float32).tobytes()
    return arr
for a in j['animations']:
    if only and a['name'] not in only: continue
    R = {}; HT = None; hti = None
    for c in a['channels']:
        s = a['samplers'][c['sampler']]; nn = names[c['target']['node']]
        if c['target']['path'] == 'rotation': R[nn] = (acc(s['input']).ravel(), acc(s['output']))
        elif nn == 'Hips': HT = (acc(s['input']).ravel(), acc(s['output'])); hti = s['output']
    ts, H = HT; fixed = H.copy(); worst = 0
    for i, t in enumerate(ts):
        def rot(n):
            tt, v = R[n]; k = min(len(tt)-2, max(0, np.searchsorted(tt, t)-1)); return slerp(v[k], v[k+1], np.clip((t-tt[k])/(tt[k+1]-tt[k]), 0, 1))
        low = 1e9
        for side in ('Left', 'Right'):
            q = rot('Hips'); p = np.array([0, hip0*H[i, 1]/100, 0.])
            for b in CH[side][1:]: p = p + qrot(q, off[b]); q = qmul(q, rot(b))
            low = min(low, p[1]-toe0)
        fixed[i, 1] = H[i, 1] - low/hip0*100; worst = max(worst, abs(low/HH))
    if a['name'] in CONST: fixed[:, 1] = H[:, 1] + (fixed[0, 1] - H[0, 1] + fixed[-1, 1] - H[-1, 1]) / 2
    acc(hti, fixed); print(f"{a['name']}: corregido (el pie llegaba a estar {worst:.3f} alturas de cadera fuera del piso)")
open(path, 'wb').write(bytes(raw))
