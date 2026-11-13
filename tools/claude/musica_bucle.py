# v233: convierte una pieza de música (ElevenLabs) en un bucle sin corte audible: busca el tempo, escoge un tramo de N compases
# cuyo final empata con su inicio (forma de onda y energía), y empalma con un fundido cruzado corto. Sale .ogg estéreo 44.1 kHz y
# normalizado a ~-16 LUFS. Imprime el largo exacto del bucle (para MUS.len en index.html).
# Uso: python3 tools/claude/musica_bucle.py entrada.mp3 salida.ogg
import sys, subprocess, numpy as np
SR = 44100
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def onset_env(m, hop=512):
    fr = len(m) // hop; e = np.array([np.sum(m[i*hop:(i+1)*hop]**2) for i in range(fr)]); e = np.log1p(e * 100); d = np.maximum(0, np.diff(e, prepend=e[0])); return d, hop
def tempo(m):
    d, hop = onset_env(m); d = d - d.mean(); ac = np.correlate(d, d, 'full')[len(d)-1:]; fps = SR / hop
    lo, hi = int(fps * 60 / 200), int(fps * 60 / 70); k = lo + np.argmax(ac[lo:hi]); return 60 * fps / k
def main(src, out):
    x = load(src); m = x.mean(1); n = len(m); bpm = tempo(m); beat = 60 / bpm; bar = 4 * beat
    print(f'tempo ~{bpm:.1f} BPM, compás {bar:.3f} s')
    a0 = int(min(2 * bar, 3.0) * SR)   # salta la entrada
    # v233: busca el final en todo el rango (24 s o más) sin depender del tempo: empate de ritmo (envolvente, 3 s) y de onda (0.2 s)
    d, hop = onset_env(m); fps = SR / hop; L3 = int(3 * fps); ia = a0 // hop; A3 = d[ia:ia+L3]; A3 = (A3 - A3.mean()) / (A3.std() + 1e-9)
    cands = []
    for ib in range(ia + int(24 * fps), len(d) - L3 - int(1 * fps)):
        B3 = d[ib:ib+L3]; B3 = (B3 - B3.mean()) / (B3.std() + 1e-9); cands.append((float(np.dot(A3, B3) / L3), ib))
    cands.sort(reverse=True); W = int(.2 * SR); best = None
    for cr, ib in cands[:25]:
        for off in range(-hop, hop + 1, 8):
            b = ib * hop + off; a = a0
            if b + W > n: continue
            A = m[a:a+W]; Bv = m[b:b+W]; c = float(np.dot(A, Bv) / (np.linalg.norm(A) * np.linalg.norm(Bv) + 1e-9))
            ea = np.sqrt((m[a-W:a]**2).mean()); eb = np.sqrt((m[b-W:b]**2).mean()); pen = abs(np.log((ea + 1e-6) / (eb + 1e-6)))
            sc = cr + c - .5 * pen
            if best is None or sc > best[0]: best = (sc, a, b, round((b - a) / SR / bar, 2), c)
    sc, a, b, nb, c = best; N = int(.06 * SR)
    y = x[a:b].copy(); f = np.linspace(0, 1, N)[:, None]; y[-N:] = y[-N:] * (1 - f) + x[a-N:a] * f
    print(f'bucle: {nb} compases aprox, {len(y)/SR:.4f} s, empate {c:.3f}')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(SR), '-f', 'f32le', '-'], input=y.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    z = np.frombuffer(raw, np.float32).reshape(-1, 2)[:len(y)]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libvorbis', '-q:a', '5', out], input=z.tobytes(), check=True)
    print(f'LARGO {len(z)/SR:.5f}')
main(*sys.argv[1:])
