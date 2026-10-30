"""Herramienta para hacer animaciones por código sobre personajes con esqueleto Mixamo (GLB).
- carga el GLB (nodos, piel, malla, textura)
- pose por dirección de huesos (aim) en espacio del mundo: y arriba, +z al frente del personaje
- piel en numpy para renderizar cuadros y revisar
- exporta las animaciones dentro del GLB (canales de rotación por hueso, traslación y escala de la cadera)"""
import json, struct, io, numpy as np
from PIL import Image

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

# ---------- cuaterniones (x,y,z,w) ----------
def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return np.array([aw*bx+ax*bw+ay*bz-az*by, aw*by-ax*bz+ay*bw+az*bx, aw*bz+ax*by-ay*bx+az*bw, aw*bw-ax*bx-ay*by-az*bz])
def qinv(q): return np.array([-q[0], -q[1], -q[2], q[3]]) / np.dot(q, q)
def qnorm(q): return q / np.linalg.norm(q)
def q2m(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
def m2q(m):
    t = np.trace(m)
    if t > 0:
        s = np.sqrt(t+1)*2; return qnorm(np.array([(m[2,1]-m[1,2])/s, (m[0,2]-m[2,0])/s, (m[1,0]-m[0,1])/s, .25*s]))
    i = np.argmax([m[0,0], m[1,1], m[2,2]])
    if i == 0:
        s = np.sqrt(1+m[0,0]-m[1,1]-m[2,2])*2; return qnorm(np.array([.25*s, (m[0,1]+m[1,0])/s, (m[0,2]+m[2,0])/s, (m[2,1]-m[1,2])/s]))
    if i == 1:
        s = np.sqrt(1+m[1,1]-m[0,0]-m[2,2])*2; return qnorm(np.array([(m[0,1]+m[1,0])/s, .25*s, (m[1,2]+m[2,1])/s, (m[0,2]-m[2,0])/s]))
    s = np.sqrt(1+m[2,2]-m[0,0]-m[1,1])*2; return qnorm(np.array([(m[0,2]+m[2,0])/s, (m[1,2]+m[2,1])/s, .25*s, (m[1,0]-m[0,1])/s]))
def qfrom(u, v):
    u = u/np.linalg.norm(u); v = v/np.linalg.norm(v); d = np.dot(u, v)
    if d < -0.999999:
        ax = np.cross([1, 0, 0], u)
        if np.linalg.norm(ax) < 1e-6: ax = np.cross([0, 1, 0], u)
        ax /= np.linalg.norm(ax); return np.array([ax[0], ax[1], ax[2], 0.])
    c = np.cross(u, v); return qnorm(np.array([c[0], c[1], c[2], 1+d]))
def qaxis(ax, ang):
    ax = np.asarray(ax, float); ax = ax/np.linalg.norm(ax); s = np.sin(ang/2); return np.array([ax[0]*s, ax[1]*s, ax[2]*s, np.cos(ang/2)])
def slerp(a, b, t):
    d = np.dot(a, b)
    if d < 0: b = -b; d = -d
    if d > .9995: return qnorm(a+(b-a)*t)
    th = np.arccos(d); return (np.sin((1-t)*th)*a+np.sin(t*th)*b)/np.sin(th)

class Rig:
    def __init__(self, path):
        b = open(path, 'rb').read(); o = 12; self.js = None; self.bin = None
        while o < len(b):
            cl, ct = struct.unpack('<II', b[o:o+8]); d = b[o+8:o+8+cl]
            if ct == 0x4E4F534A: self.js = json.loads(d)
            else: self.bin = d
            o += 8+cl
        js = self.js; self.nodes = js['nodes']; N = len(self.nodes)
        self.parent = [-1]*N
        for i, n in enumerate(self.nodes):
            for c in n.get('children', []): self.parent[c] = i
        self.T = [np.array(n.get('translation', [0, 0, 0]), float) for n in self.nodes]
        self.R = [np.array(n.get('rotation', [0, 0, 0, 1]), float) for n in self.nodes]
        self.S = [np.array(n.get('scale', [1, 1, 1]), float) for n in self.nodes]
        self.name = {n.get('name', ''): i for i, n in enumerate(self.nodes)}
        self.bone = {k.replace('mixamorig:', ''): v for k, v in self.name.items() if k.startswith('mixamorig')}
        sk = js['skins'][0]; self.joints = sk['joints']; self.ibm = self.acc(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
        mn = next(i for i, n in enumerate(self.nodes) if 'mesh' in n); pr = js['meshes'][self.nodes[mn]['mesh']]['primitives'][0]; at = pr['attributes']
        self.P = self.acc(at['POSITION']); self.UV = self.acc(at['TEXCOORD_0']) if 'TEXCOORD_0' in at else None
        self.J = self.acc(at['JOINTS_0']).astype(int); self.W = self.acc(at['WEIGHTS_0']); self.F = self.acc(pr['indices']).astype(int).reshape(-1, 3)
        self.tex = None
        if js.get('images'):
            im = js['images'][0]; bv = js['bufferViews'][im['bufferView']]; o = bv.get('byteOffset', 0)
            self.tex = np.asarray(Image.open(io.BytesIO(self.bin[o:o+bv['byteLength']])).convert('RGB').resize((512, 512)))/255.
        self.rest = ([t.copy() for t in self.T], [r.copy() for r in self.R], [s.copy() for s in self.S])
        self.order = []; seen = set()
        def visit(i):
            if i in seen: return
            if self.parent[i] >= 0: visit(self.parent[i])
            seen.add(i); self.order.append(i)
        for i in range(N): visit(i)
        self.update()
    def acc(self, i):
        a = self.js['accessors'][i]; bv = self.js['bufferViews'][a['bufferView']]
        off = bv.get('byteOffset', 0)+a.get('byteOffset', 0); dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
        arr = np.frombuffer(self.bin, dt, count=a['count']*n, offset=off).reshape(a['count'], n).astype(np.float64)
        if a.get('normalized') and dt.kind in 'iu': arr = arr/np.iinfo(dt).max
        return arr
    def reset(self):
        self.T = [t.copy() for t in self.rest[0]]; self.R = [r.copy() for r in self.rest[1]]; self.S = [s.copy() for s in self.rest[2]]; self.update()
    def local(self, i):
        m = np.eye(4); m[:3, :3] = q2m(qnorm(self.R[i]))*self.S[i]; m[:3, 3] = self.T[i]; return m
    def update(self):
        self.G = [None]*len(self.nodes)
        for i in self.order:
            p = self.parent[i]; self.G[i] = self.local(i) if p < 0 else self.G[p] @ self.local(i)
    def pos(self, b): return self.G[self.bone[b]][:3, 3].copy()
    def wrot(self, i):
        m = self.G[i][:3, :3]; m = m/np.linalg.norm(m, axis=0); return m2q(m)
    def aim(self, b, c, d):
        """gira el hueso b para que la dirección hacia su hijo c apunte a d (mundo)"""
        i = self.bone[b]; cur = self.pos(c)-self.pos(b)
        if np.linalg.norm(cur) < 1e-9: return
        q = qfrom(cur, np.asarray(d, float)); wq = self.wrot(i); p = self.parent[i]
        pq = self.wrot(p) if p >= 0 else np.array([0, 0, 0, 1.])
        self.R[i] = qnorm(qmul(qinv(pq), qmul(q, wq))); self.update()
    def turn(self, b, axis, ang):
        """gira el hueso b alrededor de un eje del mundo"""
        i = self.bone[b]; q = qaxis(axis, ang); wq = self.wrot(i); p = self.parent[i]
        pq = self.wrot(p) if p >= 0 else np.array([0, 0, 0, 1.])
        self.R[i] = qnorm(qmul(qinv(pq), qmul(q, wq))); self.update()
    def skin(self):
        M = np.stack([self.G[j] @ self.ibm[k] for k, j in enumerate(self.joints)])
        Ph = np.c_[self.P, np.ones(len(self.P))]; out = np.zeros((len(self.P), 3))
        for k in range(4):
            mk = M[self.J[:, k]]; out += self.W[:, k:k+1]*np.einsum('nij,nj->ni', mk, Ph)[:, :3]
        return out
    # --- foto rápida (sin perspectiva) ---
    def shot(self, yaw=0., pitch=.15, S=300, center=None, ext=None):
        P = self.skin(); c = P.mean(0) if center is None else center
        cy, sy = np.cos(yaw), np.sin(yaw); cp, sp = np.cos(pitch), np.sin(pitch)
        Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
        V = (P-c) @ (Rx @ Ry).T; e = ext or np.abs(V[:, :2]).max()*1.1
        sx = (V[:, 0]/e*.5+.5)*S; syy = (.5-V[:, 1]/e*.5)*S; z = V[:, 2]
        img = np.full((S, S, 3), .93); zb = np.full((S, S), -1e9); L = np.array([.4, .7, .6]); L /= np.linalg.norm(L)
        for a, b, cc in self.F:
            x0, y0, x1, y1, x2, y2 = sx[a], syy[a], sx[b], syy[b], sx[cc], syy[cc]
            den = (y1-y2)*(x0-x2)+(x2-x1)*(y0-y2)
            if abs(den) < 1e-9: continue
            xmin = max(int(min(x0, x1, x2)), 0); xmax = min(int(max(x0, x1, x2))+1, S-1); ymin = max(int(min(y0, y1, y2)), 0); ymax = min(int(max(y0, y1, y2))+1, S-1)
            if xmin > xmax or ymin > ymax: continue
            n = np.cross(V[b]-V[a], V[cc]-V[a]); nl = np.linalg.norm(n)
            if nl == 0: continue
            sh = .45+.55*abs(n@L)/nl
            xs, ys = np.meshgrid(np.arange(xmin, xmax+1)+.5, np.arange(ymin, ymax+1)+.5)
            w0 = ((y1-y2)*(xs-x2)+(x2-x1)*(ys-y2))/den; w1 = ((y2-y0)*(xs-x2)+(x0-x2)*(ys-y2))/den; w2 = 1-w0-w1
            m = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
            if not m.any(): continue
            zz = w0*z[a]+w1*z[b]+w2*z[cc]; yy = ys.astype(int); xx = xs.astype(int); sel = m & (zz > zb[yy, xx])
            if not sel.any(): continue
            if self.tex is not None and self.UV is not None:
                u = (w0*self.UV[a, 0]+w1*self.UV[b, 0]+w2*self.UV[cc, 0])[sel] % 1; v = (w0*self.UV[a, 1]+w1*self.UV[b, 1]+w2*self.UV[cc, 1])[sel] % 1
                col = self.tex[(v*511).astype(int), (u*511).astype(int)]
            else: col = np.full((sel.sum(), 3), .7)
            img[yy[sel], xx[sel]] = np.clip(col*sh, 0, 1); zb[yy[sel], xx[sel]] = zz[sel]
        return Image.fromarray((img*255).astype(np.uint8))

def write_glb(rig, clips, path):
    """clips: [(nombre, tiempos, {nodo: {'rotation':[q..],'translation':[..],'scale':[..]}})]"""
    js = json.loads(json.dumps(rig.js)); binb = bytearray(rig.bin)
    def add(arr, typ, mm=False):
        while len(binb) % 4: binb.append(0)
        d = np.asarray(arr, np.float32).tobytes(); js['bufferViews'].append({'buffer': 0, 'byteOffset': len(binb), 'byteLength': len(d)}); binb.extend(d)
        a = {'bufferView': len(js['bufferViews'])-1, 'componentType': 5126, 'count': len(arr), 'type': typ}
        if mm: a['min'] = [float(np.min(arr))]; a['max'] = [float(np.max(arr))]
        js['accessors'].append(a); return len(js['accessors'])-1
    js['animations'] = []
    for name, times, tracks in clips:
        ti = add(np.asarray(times, np.float32).reshape(-1, 1), 'SCALAR', True); ch = []; sm = []
        for node, tr in tracks.items():
            for path_, vals in tr.items():
                o = add(np.asarray(vals, np.float32), 'VEC4' if path_ == 'rotation' else 'VEC3'); sm.append({'input': ti, 'output': o, 'interpolation': 'LINEAR'})
                ch.append({'sampler': len(sm)-1, 'target': {'node': node, 'path': path_}})
        js['animations'].append({'name': name, 'channels': ch, 'samplers': sm})
    js['buffers'][0]['byteLength'] = len(binb)
    j = json.dumps(js, separators=(',', ':')).encode(); j += b' '*((4-len(j) % 4) % 4)
    while len(binb) % 4: binb.append(0)
    out = struct.pack('<4sII', b'glTF', 2, 12+8+len(j)+8+len(binb))+struct.pack('<II', len(j), 0x4E4F534A)+j+struct.pack('<II', len(binb), 0x004E4942)+bytes(binb)
    open(path, 'wb').write(out)
