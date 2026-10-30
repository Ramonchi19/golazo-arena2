import sys, json, struct, io, os
import numpy as np
from PIL import Image, ImageDraw

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def load(p):
    b = open(p, 'rb').read()
    o = 12; js = bn = None
    while o < len(b):
        cl, ct = struct.unpack('<II', b[o:o + 8]); d = b[o + 8:o + 8 + cl]
        if ct == 0x4E4F534A: js = json.loads(d)
        else: bn = d
        o += 8 + cl
    return js, bn


def acc(js, bn, i):
    a = js['accessors'][i]; bv = js['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
    stride = bv.get('byteStride', 0)
    if stride and stride != dt.itemsize * n:
        raw = np.frombuffer(bn, np.uint8, count=stride * (a['count'] - 1) + dt.itemsize * n, offset=off)
        arr = np.stack([np.frombuffer(raw[k * stride:k * stride + dt.itemsize * n].tobytes(), dt) for k in range(a['count'])])
    else:
        arr = np.frombuffer(bn, dt, count=a['count'] * n, offset=off).reshape(a['count'], n)
    arr = arr.astype(np.float64)
    if a.get('normalized'):
        arr = arr / np.iinfo(dt).max
    return arr


def mesh(p):
    js, bn = load(p)
    tex = None
    if js.get('images'):
        im = js['images'][0]; bv = js['bufferViews'][im['bufferView']]
        o = bv.get('byteOffset', 0)
        tex = np.asarray(Image.open(io.BytesIO(bn[o:o + bv['byteLength']])).convert('RGB').resize((512, 512))).astype(np.float64) / 255
    P = []; U = []; F = []; base = 0
    for m in js['meshes']:
        for pr in m['primitives']:
            pos = acc(js, bn, pr['attributes']['POSITION'])
            uv = acc(js, bn, pr['attributes']['TEXCOORD_0']) if 'TEXCOORD_0' in pr['attributes'] else np.zeros((len(pos), 2))
            idx = acc(js, bn, pr['indices']).astype(np.int64).reshape(-1, 3) if 'indices' in pr else np.arange(len(pos)).reshape(-1, 3)
            P.append(pos); U.append(uv); F.append(idx + base); base += len(pos)
    return np.vstack(P), np.vstack(U), np.vstack(F), tex


def rot(yaw, pitch):
    cy, sy = np.cos(yaw), np.sin(yaw); cp, sp = np.cos(pitch), np.sin(pitch)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
    return Rx @ Ry


def render(P, U, F, tex, yaw, pitch, S=360):
    c = (P.min(0) + P.max(0)) / 2
    V = (P - c) @ rot(yaw, pitch).T
    ext = np.abs(V[:, :2]).max() * 1.1
    sx = (V[:, 0] / ext * 0.5 + 0.5) * S
    sy = (0.5 - V[:, 1] / ext * 0.5) * S
    z = V[:, 2]
    img = np.ones((S, S, 3)); zb = np.full((S, S), -1e9)
    L = np.array([0.4, 0.7, 0.6]); L /= np.linalg.norm(L)
    for f in F:
        a, b, cc = f
        x0, y0, x1, y1, x2, y2 = sx[a], sy[a], sx[b], sy[b], sx[cc], sy[cc]
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9: continue
        n = np.cross(V[b] - V[a], V[cc] - V[a]); nl = np.linalg.norm(n)
        if nl == 0: continue
        n /= nl
        sh = 0.45 + 0.55 * abs(n @ L)
        xmin = max(int(min(x0, x1, x2)), 0); xmax = min(int(max(x0, x1, x2)) + 1, S - 1)
        ymin = max(int(min(y0, y1, y2)), 0); ymax = min(int(max(y0, y1, y2)) + 1, S - 1)
        if xmin > xmax or ymin > ymax: continue
        xs, ys = np.meshgrid(np.arange(xmin, xmax + 1) + 0.5, np.arange(ymin, ymax + 1) + 0.5)
        w0 = ((y1 - y2) * (xs - x2) + (x2 - x1) * (ys - y2)) / den
        w1 = ((y2 - y0) * (xs - x2) + (x0 - x2) * (ys - y2)) / den
        w2 = 1 - w0 - w1
        m = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        if not m.any(): continue
        zz = w0 * z[a] + w1 * z[b] + w2 * z[cc]
        yy = (ys - 0.5).astype(int); xx = (xs - 0.5).astype(int)
        sel = m & (zz > zb[yy, xx])
        if not sel.any(): continue
        if tex is not None:
            u = (w0 * U[a, 0] + w1 * U[b, 0] + w2 * U[cc, 0])[sel] % 1
            v = (w0 * U[a, 1] + w1 * U[b, 1] + w2 * U[cc, 1])[sel] % 1
            col = tex[(v * 511).astype(int), (u * 511).astype(int)]
        else:
            col = np.full((sel.sum(), 3), 0.7)
        img[yy[sel], xx[sel]] = np.clip(col * sh, 0, 1)
        zb[yy[sel], xx[sel]] = zz[sel]
    return Image.fromarray((img * 255).astype(np.uint8))


if __name__ == '__main__':
    out = sys.argv[1]; files = sys.argv[2:]
    views = [(0.6, 0.45, '3/4'), (0, 1.45, 'arriba'), (0, 0.0, 'frente')]
    S = 300
    sheet = Image.new('RGB', (S * len(views), (S + 22) * len(files)), 'white')
    d = ImageDraw.Draw(sheet)
    for i, p in enumerate(files):
        P, U, F, tex = mesh(p)
        for j, (yw, pt, lab) in enumerate(views):
            sheet.paste(render(P, U, F, tex, yw, pt, S), (j * S, i * (S + 22) + 22))
        d.text((6, i * (S + 22) + 5), os.path.basename(p), fill='black')
    sheet.save(out)
