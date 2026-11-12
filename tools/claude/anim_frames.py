# Dibuja cuadros de una animación de un GLB con piel (skinning en numpy), para revisar poses sin three.js.
# Uso: python3 tools/claude/anim_frames.py modelo.glb salida.png t1 t2 t3 ...   (segundos)
# Cada cuadro sale dos veces: de frente (arriba) y de lado (abajo). Misma escala en todos para comparar alturas.
import sys, os, io, numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__)); import render as R

def q2m(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
def slerp(a, b, t):
    d = np.dot(a, b)
    if d < 0: b = -b; d = -d
    if d > .9995: r = a + (b - a) * t; return r / np.linalg.norm(r)
    th = np.arccos(d); return (np.sin((1-t)*th)*a + np.sin(t*th)*b) / np.sin(th)
def trs(n, T=None, Rq=None, S=None):
    m = np.eye(4)
    if 'matrix' in n: return np.array(n['matrix']).reshape(4, 4).T
    t = T if T is not None else np.array(n.get('translation', [0, 0, 0]))
    r = Rq if Rq is not None else np.array(n.get('rotation', [0, 0, 0, 1]))
    s = S if S is not None else np.array(n.get('scale', [1, 1, 1]))
    m[:3, :3] = q2m(r) * s; m[:3, 3] = t; return m

class Anim:
    def __init__(s, path, ai=0):
        s.js, s.bn = R.load(path); js = s.js; A = lambda i: R.acc(js, s.bn, i)
        s.par = {}
        for i, n in enumerate(js['nodes']):
            for c in n.get('children', []): s.par[c] = i
        s.ch = {}
        if js.get('animations'):
            a = js['animations'][ai]
            for c in a['channels']:
                sm = a['samplers'][c['sampler']]; s.ch[(c['target']['node'], c['target']['path'])] = (A(sm['input']).ravel(), A(sm['output']))
        s.dur = max((v[0][-1] for v in s.ch.values()), default=0)
        mi = next(i for i, n in enumerate(js['nodes']) if 'mesh' in n); s.mnode = mi
        pr = js['meshes'][js['nodes'][mi]['mesh']]['primitives'][0]
        s.P = A(pr['attributes']['POSITION']); s.F = A(pr['indices']).astype(int).reshape(-1, 3)
        s.U = A(pr['attributes']['TEXCOORD_0']) if 'TEXCOORD_0' in pr['attributes'] else np.zeros((len(s.P), 2))
        s.J = A(pr['attributes']['JOINTS_0']).astype(int); s.W = A(pr['attributes']['WEIGHTS_0'])
        sk = js['skins'][js['nodes'][mi].get('skin', 0)]; s.joints = sk['joints']; s.IBM = A(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
        s.tex = None
        try:
            im = js['images'][0]; bv = js['bufferViews'][im['bufferView']]; o = bv.get('byteOffset', 0)
            s.tex = np.asarray(Image.open(io.BytesIO(s.bn[o:o + bv['byteLength']])).convert('RGB').resize((512, 512))).astype(float) / 255
        except Exception: pass
    def sample(s, key, t, rot):
        ts, v = s.ch[key]
        if t <= ts[0]: return v[0]
        if t >= ts[-1]: return v[-1]
        k = np.searchsorted(ts, t) - 1; u = (t - ts[k]) / (ts[k+1] - ts[k])
        return slerp(v[k], v[k+1], u) if rot else v[k] * (1 - u) + v[k+1] * u
    def world(s, t):
        js = s.js; N = len(js['nodes']); G = [None] * N
        def g(i):
            if G[i] is not None: return G[i]
            n = js['nodes'][i]
            T = s.sample((i, 'translation'), t, False) if (i, 'translation') in s.ch else None
            Rq = s.sample((i, 'rotation'), t, True) if (i, 'rotation') in s.ch else None
            Sc = s.sample((i, 'scale'), t, False) if (i, 'scale') in s.ch else None
            L = trs(n, T, Rq, Sc); G[i] = (g(s.par[i]) @ L) if i in s.par else L; return G[i]
        for i in range(N): g(i)
        return G
    def verts(s, t):
        G = s.world(t); M = np.array([G[j] @ s.IBM[k] for k, j in enumerate(s.joints)])
        Ph = np.c_[s.P, np.ones(len(s.P))]; out = np.zeros((len(s.P), 3))
        for c in range(4):
            out += s.W[:, c:c+1] * np.einsum('nij,nj->ni', M[s.J[:, c]], Ph)[:, :3]
        return out

def draw(P, U, F, tex, yaw, c, ext, S=300):
    V = (P - c) @ R.rot(yaw, .12).T
    sx = (V[:, 0] / ext * .5 + .5) * S; sy = (.5 - V[:, 1] / ext * .5) * S; z = V[:, 2]
    img = np.ones((S, S, 3)); zb = np.full((S, S), -1e9); Ld = np.array([.4, .7, .6]); Ld /= np.linalg.norm(Ld)
    for a, b, cc in F:
        x0, y0, x1, y1, x2, y2 = sx[a], sy[a], sx[b], sy[b], sx[cc], sy[cc]
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9: continue
        n = np.cross(V[b] - V[a], V[cc] - V[a]); nl = np.linalg.norm(n)
        if nl == 0: continue
        sh = .45 + .55 * abs((n / nl) @ Ld)
        xmin = max(int(min(x0, x1, x2)), 0); xmax = min(int(max(x0, x1, x2)) + 1, S - 1); ymin = max(int(min(y0, y1, y2)), 0); ymax = min(int(max(y0, y1, y2)) + 1, S - 1)
        if xmin > xmax or ymin > ymax: continue
        xs, ys = np.meshgrid(np.arange(xmin, xmax + 1) + .5, np.arange(ymin, ymax + 1) + .5)
        w0 = ((y1 - y2) * (xs - x2) + (x2 - x1) * (ys - y2)) / den; w1 = ((y2 - y0) * (xs - x2) + (x0 - x2) * (ys - y2)) / den; w2 = 1 - w0 - w1
        m = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        if not m.any(): continue
        zz = w0 * z[a] + w1 * z[b] + w2 * z[cc]; yy = (ys - .5).astype(int); xx = (xs - .5).astype(int); sel = m & (zz > zb[yy, xx])
        if not sel.any(): continue
        if tex is not None:
            u = (w0 * U[a, 0] + w1 * U[b, 0] + w2 * U[cc, 0])[sel] % 1; v = (w0 * U[a, 1] + w1 * U[b, 1] + w2 * U[cc, 1])[sel] % 1
            col = tex[(v * 511).astype(int), (u * 511).astype(int)]
        else: col = np.full((sel.sum(), 3), .72)
        img[yy[sel], xx[sel]] = np.clip(col * sh, 0, 1); zb[yy[sel], xx[sel]] = zz[sel]
    return Image.fromarray((img * 255).astype(np.uint8))

if __name__ == '__main__':
    A = Anim(sys.argv[1]); out = sys.argv[2]; ts = [float(x) for x in sys.argv[3:]] or list(np.linspace(0, A.dur, 8))
    Vs = [A.verts(t) for t in ts]; allP = np.vstack(Vs)
    lo, hi = allP.min(0), allP.max(0); c = (lo + hi) / 2; ext = max(hi[1] - lo[1], hi[0] - lo[0], hi[2] - lo[2]) * .62
    S = 260; sheet = Image.new('RGB', (S * len(ts), S * 2 + 22), 'white'); d = ImageDraw.Draw(sheet)
    for k, (t, V) in enumerate(zip(ts, Vs)):
        cc = c.copy(); cc[0] = V[:, 0].mean(); cc[2] = V[:, 2].mean()   # sigue al personaje si se desplaza
        sheet.paste(draw(V, A.U, A.F, A.tex, 0, cc, ext, S), (k * S, 22)); sheet.paste(draw(V, A.U, A.F, A.tex, np.pi / 2, cc, ext, S), (k * S, 22 + S))
        d.text((k * S + 6, 4), f'{t:.2f} s', fill='black')
    sheet.save(out); print('listo', out, 'duración', round(A.dur, 2))
