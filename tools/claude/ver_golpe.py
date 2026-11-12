# Dibuja el esqueleto (palitos) de una patada en varios cuadros alrededor del golpe, con el balón donde medir_golpes.py dice que pega.
# Uso: python3 tools/claude/ver_golpe.py libreria clip salida.png        (ej.: anims_atl pass_r /tmp/x.png)
import sys, json, numpy as np
from PIL import Image, ImageDraw
exec(open(__file__.replace('ver_golpe.py', 'medir_golpes.py')).read().split("def measure(lib):")[0])
lib, nm, out = sys.argv[1:4]
j, bn = load(f'assets/{lib}.glb'); names = [n['name'] for n in j['nodes']]; meta = json.load(open(f'assets/{lib}.json'))
par = {}
for i, n in enumerate(mj['nodes']):
    for c in n.get('children', []): par[mj['nodes'][c].get('name')] = n.get('name')
def acc(i):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
    o = bv.get('byteOffset', 0)+a.get('byteOffset', 0); return np.frombuffer(bn, np.float32, a['count']*n, o).reshape(a['count'], n)
a = [x for x in j['animations'] if x['name'] == nm][0]; R = {}; HT = None
for c in a['channels']:
    s = a['samplers'][c['sampler']]; nn = names[c['target']['node']]
    if c['target']['path'] == 'rotation': R[nn] = (acc(s['input']).ravel(), acc(s['output']))
    elif nn == 'Hips': HT = (acc(s['input']).ravel(), acc(s['output']))
def rot(n, t):
    if n not in R: return np.array([0, 0, 0, 1.])
    ts, v = R[n]
    if t <= ts[0]: return v[0]
    if t >= ts[-1]: return v[-1]
    k = np.searchsorted(ts, t)-1; return slerp(v[k], v[k+1], (t-ts[k])/(ts[k+1]-ts[k]))
BONES = [b for b in R if b in off and b != 'Hips']
def pose(t):
    P = {'Hips': np.array([0, hip0*np.interp(t, HT[0], HT[1][:, 1])/100 if HT is not None else hip0, 0.])}; Q = {'Hips': rot('Hips', t)}
    def g(b):
        if b in P: return
        p = par.get(b)
        if p not in P: g(p)
        P[b] = P[p] + qrot(Q[p], off[b]); Q[b] = qmul(Q[p], rot(b, t))
    for b in BONES:
        if par.get(b) in off or par.get(b) == 'Hips': g(b)
    return {k: (v - np.array([0, toe0, 0]))/HH for k, v in P.items()}
m = meta[nm]; hT = m['hitT']; hit = np.array(m['hit']); BRr = .40/ (2.45*.45)   # radio del balón en alturas de cadera (aprox.)
ts = [hT-.2, hT-.12, hT-.06, hT, hT+.06, hT+.12]
S = 220; img = Image.new('RGB', (S*len(ts), S*2+20), 'white'); d = ImageDraw.Draw(img)
for k, t in enumerate(ts):
    P = pose(max(0, t))
    for row, (ax, ay) in enumerate([(2, 1), (0, 1)]):   # de lado (adelante → derecha) y de frente
        ox, oy = k*S + S//2, 20 + row*S + int(S*.85); sc = S*.32
        pt = lambda v: (ox + v[ax]*sc*(1 if ax == 2 else -1), oy - v[ay]*sc)
        d.line([(k*S+5, oy), (k*S+S-5, oy)], fill=(160, 200, 160))
        for b, v in P.items():
            p = par.get(b)
            if p in P: d.line([pt(P[p]), pt(v)], fill=(200, 40, 40) if 'Right' in b else (40, 80, 220) if 'Left' in b else (60, 60, 60), width=3)
        c = pt([hit[0], hit[1]+BRr*.0, hit[2]]); r = BRr*sc
        d.ellipse([c[0]-r, c[1]-r-r, c[0]+r, c[1]+r-r], outline=(0, 0, 0), width=2)
    d.text((k*S+6, 3), f'{t-hT:+.2f} s' + ('  GOLPE' if abs(t-hT) < 1e-6 else ''), fill='black')
img.save(out); print('listo', out)
