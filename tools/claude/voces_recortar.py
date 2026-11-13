# v233: recorta los sonidos de voz de ElevenLabs para el juego: se queda SOLO con el golpe de voz más fuerte (un solo sonido, nada de dos partes),
# le quita el silencio de antes y después, ataque inmediato, cola corta con desvanecido, volumen parejo y lo guarda como .ogg mono 44.1 kHz.
# Uso: python3 tools/claude/voces_recortar.py carpeta_con_mp3 id_personaje [destino=assets/voices2]
#   carpeta/<sonido>.mp3 → destino/<id>_<sonido>.ogg   (sonidos: shot super jump steal lost hit fall slide)
import sys, os, subprocess, numpy as np
SR = 44100
MAXD = {'super': 1.1, 'fall': .9, 'lost': .8, 'steal': .8}   # tope de duración (s); los demás .7
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def env(x, w=441):
    k = np.ones(w) / w; return np.sqrt(np.convolve(x * x, k, 'same'))
def cut(x, name):
    e = env(x); pk = e.max()
    if pk <= 0: return x[:SR // 10]
    on = e > pk * .12
    # trozos con voz (se juntan huecos de menos de 60 ms)
    segs = []; i = 0; n = len(on)
    while i < n:
        if on[i]:
            j = i
            g = int((.16 if name == 'steal' else .06) * SR)   # la risa (je-je) cuenta como un solo sonido
            while j < n and (on[j] or (j + g < n and on[j:j + g].any())): j += 1
            segs.append((i, j)); i = j
        else: i += 1
    a, b = max(segs, key=lambda s: e[s[0]:s[1]].sum())   # el golpe de voz más fuerte
    # v233c: la cola se deja apagar sola (hasta que baja a ~2 % del pico, sin meterse en otro sonido) y luego un desvanecido suave
    lim = min(n, a + int(MAXD.get(name, .7) * SR)); nb = b
    while nb < lim and e[nb] > pk * .02: nb += 1
    a = max(0, a - int(.012 * SR)); b = min(lim, nb + int(.03 * SR))
    y = x[a:b].copy(); f = min(len(y) // 2, int(.12 * SR)); y[-f:] *= np.linspace(1, 0, f) ** 1.5; y[:int(.004 * SR)] *= np.linspace(0, 1, int(.004 * SR))
    return y / (np.abs(y).max() or 1) * .89
def main(src, pid, dst='assets/voices2'):
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.endswith('.mp3'): continue
        name = f[:-4]; y = cut(load(os.path.join(src, f)), name); out = os.path.join(dst, f'{pid}_{name}.ogg')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libvorbis', '-q:a', '4', out], input=y.astype(np.float32).tobytes(), check=True)
        print(f'{out}: {len(y) / SR:.2f} s')
main(*sys.argv[1:])
