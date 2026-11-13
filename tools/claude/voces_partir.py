# v233: parte una muestra de diseño de voz de ElevenLabs que dice los 8 sonidos dos veces seguidas
# ("¡Hah! ¡Raaah! ¡Hup! ¡Heh! ¡Grrh! ¡Ugh! ¡Oof! ¡Hyah!" ×2) en sus 16 golpes de voz y guarda cada uno con su nombre.
# Uso: python3 tools/claude/voces_partir.py muestra.mp3 carpeta_salida     → salida/<sonido>.mp3 y <sonido>2.mp3 (2ª vuelta)
# Si no salen exactamente 16 golpes, avisa y no escribe nada (hay que escoger otra muestra).
import sys, os, subprocess, numpy as np
SR = 44100; ORDER = ['shot', 'super', 'jump', 'steal', 'lost', 'hit', 'fall', 'slide']
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def segments(x, gap=.16, thr=.06):
    w = 441; e = np.sqrt(np.convolve(x * x, np.ones(w) / w, 'same')); on = e > e.max() * thr; G = int(gap * SR); segs = []; i = 0; n = len(on)
    while i < n:
        if on[i]:
            j = i; last = i
            while j < n and j - last < G:
                if on[j]: last = j
                j += 1
            segs.append((i, last)); i = j
        else: i += 1
    return [s for s in segs if s[1] - s[0] > .05 * SR]
def split(src, out, write=True):
    x = load(src)
    for gap in (.16, .12, .22, .09, .3):
        for thr in (.06, .04, .1):
            S = segments(x, gap, thr)
            if len(S) == 16: break
        if len(S) == 16: break
    if len(S) != 16: print(f'{src}: {len(S)} golpes (se esperaban 16)'); return False
    if write:
        os.makedirs(out, exist_ok=True)
        for k, (a, b) in enumerate(S):
            nxt = S[k + 1][0] if k + 1 < len(S) else len(x)   # v233c: cola completa hasta (casi) el siguiente sonido, sin cortarlo a la mitad
            a = max(0, a - int(.03 * SR)); b = min(nxt - int(.02 * SR), b + int(.35 * SR)); nm = ORDER[k % 8] + ('2' if k >= 8 else '')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-q:a', '2', os.path.join(out, nm + '.mp3')], input=x[a:b].tobytes(), check=True)
    print(f'{src}: 16 golpes ok'); return True
if __name__ == '__main__': split(sys.argv[1], sys.argv[2])
