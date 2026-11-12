# v231: hornea animaciones nuevas (cualquier esqueleto, p. ej. Mixamo) al esqueleto del juego y arma assets/anims_extra.glb + .json
# Uso (desde /home/claude/anwork): python3 tools/hornear_extra.py /home/claude/repo/assets/anims_extra
# Cada entrada: (nombre en el juego, archivo en nuevo/an, desde, hasta, opciones)   loop=1 → la última pose se iguala a la primera
import sys; sys.path.insert(0, 'tools')
from buildlib import *
EXTRA = [('reposo', 'reposo', 0.0, 3.95, {'loop': 1, 'lento': 1.6}),   # v232b: el usuario lo quiere más lento (brazos menos rápidos)
         # v232: remates (golpe medido con tools/claude/medir_remates.py; hitT = instante del golpe dentro del recorte)
         ('r_volea', 'volea', 0.3, 2.9, {'hitT': 1.205, 'part': 'foot', 'foot': 'r', 'hit': [0.11, 1.09, 0.81], 'push': 10}),
         ('r_volea_corr', 'volea_corr', 0.4, 3.4, {'hitT': 1.941, 'part': 'foot', 'foot': 'r', 'hit': [-0.35, 0.97, 0.81], 'push': 10}),
         ('r_tijera', 'tijera_corr', 0.8, 3.4, {'hitT': 1.24, 'part': 'foot', 'foot': 'r', 'hit': [-0.69, 1.06, 0.77], 'push': 24, 'air': 1}),
         ('r_cabezazo', 'cabezazo', 0.0, 1.8, {'hitT': 1.004, 'part': 'head', 'hit': [-0.05, 1.81, 0.12], 'push': -18, 'air': 1})]
REPO = '/home/claude/repo'
COPIAR = [('r_chilena', 'bicycle', {'hitT': 1.033, 'part': 'foot', 'air': 1})]
def _load(p):
    import struct; d = open(p, 'rb').read(); L = struct.unpack('<I', d[12:16])[0]; return json.loads(d[20:20+L]), d[28+L:]
def main(out):
    b = B(); js = b.js; js['nodes'] = [{'name': n} for n in names]; js['scenes'] = [{'nodes': list(range(len(names)))}]; js['scene'] = 0
    nid = {n: i for i, n in enumerate(names)}; anims = []; meta = {'_hips': [0, 100, 0]}
    for name, f, a, c, o in EXTRA:
        s = Src(f'nuevo/an/{f}.glb'); ts, rot, hip = bake(s, a, c, False)
        if o.get('loop'):
            for k in rot: rot[k][-1] = rot[k][0]
            hip[-1] = hip[0]
        hip[:, 0] -= hip[0, 0]; hip[:, 2] -= hip[0, 2]   # sin avance de lado/adelante (el juego mueve al personaje)
        ts = np.asarray(ts, np.float32) * o.get('lento', 1)
        ti = b.add(np.asarray(ts, np.float32).reshape(-1, 1), 'SCALAR', mm=True); ch = []; sm = []
        for k, v in rot.items():
            oo = b.add(np.asarray(v, np.float32), 'VEC4'); sm.append({'input': ti, 'output': oo, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sm)-1, 'target': {'node': nid[k], 'path': 'rotation'}})
        hp = np.asarray(hip)*100+[0, 100, 0]; oo = b.add(hp.astype(np.float32), 'VEC3'); sm.append({'input': ti, 'output': oo, 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sm)-1, 'target': {'node': nid['Hips'], 'path': 'translation'}})
        anims.append({'name': name, 'channels': ch, 'samplers': sm}); meta[name] = {'dur': round(float(ts[-1]), 3), 'loop': int(o.get('loop', 0))}
        for k in ('hitT', 'part', 'foot', 'hit', 'push', 'air'):
            if k in o: meta[name][k] = o[k]
        print(name, 'dur', meta[name]['dur'], 'cuadros', len(ts), 'cadera alto min/max', round(float(hip[:, 1].min()), 3), round(float(hip[:, 1].max()), 3))
    # v232: copias de clips que ya existen en assets/anims.glb (mismo esqueleto), para que la página de prueba no cargue esa librería entera
    for name, src, o in COPIAR:
        sj, sb = _load(f'{REPO}/assets/anims.glb'); sn = [n['name'] for n in sj['nodes']]; a = [x for x in sj['animations'] if x['name'] == src][0]; sm = []; ch = []
        def acc(i):
            ac = sj['accessors'][i]; bv = sj['bufferViews'][ac['bufferView']]; k = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[ac['type']]
            off = bv.get('byteOffset', 0) + ac.get('byteOffset', 0); return np.frombuffer(sb, np.float32, ac['count']*k, off).reshape(ac['count'], k), ac['type']
        for c in a['channels']:
            nn = sn[c['target']['node']]
            if nn not in nid: continue
            s0 = a['samplers'][c['sampler']]; ti, _ = acc(s0['input']); vo, ty = acc(s0['output'])
            sm.append({'input': b.add(ti.copy(), 'SCALAR', mm=True), 'output': b.add(vo.copy(), ty), 'interpolation': s0.get('interpolation', 'LINEAR')}); ch.append({'sampler': len(sm)-1, 'target': {'node': nid[nn], 'path': c['target']['path']}})
        anims.append({'name': name, 'channels': ch, 'samplers': sm}); m0 = json.load(open(f'{REPO}/assets/anims.json'))[src]; meta[name] = dict({'dur': m0['dur'], 'loop': 0}, **o); print(name, '← anims.glb', src)
    js['animations'] = anims; open(out+'.glb', 'wb').write(glb_bytes(js, b.bin)); json.dump(meta, open(out+'.json', 'w'), separators=(',', ':'))
main(sys.argv[1])
