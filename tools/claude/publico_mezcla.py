# v233: mezcla varios bucles de público (ElevenLabs, loop=true) en camas de estadio parejas y sin corte (assets/sfx/amb1..4.ogg).
# Cada cama: todos los bucles sumados con distinto peso y desfase circular (girar un bucle no le mete corte), nivel parejo
# (se aplanan las subidas y bajadas con una envolvente circular), un poco más abierto en estéreo, y al mismo volumen que el ambiente viejo.
# Uso: python3 tools/claude/publico_mezcla.py salida_dir referencia.ogg L1.mp3 L2.mp3 ...
import sys, os, subprocess, numpy as np
SR = 44100
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def rms(x): return float(np.sqrt((x ** 2).mean()))
def circ_smooth(v, w):
    k = np.ones(w) / w; p = np.concatenate([v[-w:], v, v[:w]]); return np.convolve(p, k, 'same')[w:-w]
def main(out, ref, *srcs):
    os.makedirs(out, exist_ok=True)
    L = [load(s) for s in srcs]; n = min(len(x) for x in L); L = [x[:n] / (rms(x[:n]) + 1e-9) for x in L]
    # el mp3 trae relleno y el bucle no empata perfecto: se cierra cada uno con un fundido cruzado circular de 0.3 s
    F = int(.3 * SR); f = np.linspace(0, 1, F)[:, None]
    def close(x):
        y = x[:-F].copy(); y[:F] = x[:F] * f + x[-F:] * (1 - f); return y
    L = [close(x) for x in L]; n = len(L[0])
    for i, x in enumerate(L):
        j = np.abs(x[0] - x[-1]).max(); print(f'{os.path.basename(srcs[i])}: salto en el empalme tras cerrarlo {j:.3f}')
    target = rms(load(ref)); rng = np.random.default_rng(7)
    for v in range(4):
        w = rng.uniform(.6, 1.0, len(L)); w[v % len(L)] = 1.25   # cada cama tiene un protagonista distinto
        y = np.zeros((n, 2), np.float32)
        for x, g in zip(L, w): y += np.roll(x, int(rng.uniform(0, n)), axis=0) * g
        # nivel parejo: envolvente de 0.8 s circular, se lleva hacia su promedio (deja 25 % del movimiento natural)
        e = np.sqrt(circ_smooth((y ** 2).mean(1), int(.8 * SR))) + 1e-6; g = (e.mean() / e) ** .75; y *= g[:, None]
        # un poco más abierto en estéreo
        mid = (y[:, 0] + y[:, 1]) / 2; side = (y[:, 0] - y[:, 1]) / 2 * 1.25; y = np.stack([mid + side, mid - side], 1)
        y *= target / rms(y); pk = np.abs(y).max()
        if pk > .95: y *= .95 / pk
        p = os.path.join(out, f'amb{v + 1}.ogg')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libvorbis', '-q:a', '4', p], input=y.astype(np.float32).tobytes(), check=True)
        e2 = np.sqrt(circ_smooth((y ** 2).mean(1), int(.5 * SR))); print(f'{p}: {n / SR:.2f} s, variación de nivel {20 * np.log10(e2.max() / e2.min()):.1f} dB, empalme {np.abs(y[0] - y[-1]).max():.3f}')
main(*sys.argv[1:])
