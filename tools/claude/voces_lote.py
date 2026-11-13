# v233: de un diseño de voz de ElevenLabs (3 muestras, cada una dice los 8 sonidos dos veces) saca los sonidos de un personaje:
# baja las 3 muestras, escoge la que mejor queda con su tamaño (pequeño = la más aguda, grande = la más grave, mediano = la de en medio)
# entre las que se parten limpio en 16 golpes, la parte y recorta cada sonido (voces_recortar.py) en assets/voices2/<id>_<sonido>.ogg.
# Uso (desde la raíz): python3 tools/claude/voces_lote.py <id> <peq|med|gra> url0 url1 url2
import sys, os, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import importlib.util
def mod(n):
    s = importlib.util.spec_from_file_location(n, os.path.join(os.path.dirname(__file__), n + '.py')); m = importlib.util.module_from_spec(s)
    src = open(s.origin).read().replace("if __name__ == '__main__'", 'if 0').replace('\nmain(*sys.argv[1:])', ''); exec(compile(src, s.origin, 'exec'), m.__dict__); return m
P = mod('voces_partir'); R = mod('voces_recortar'); SR = 44100
def f0(x):   # tono medio (Hz) de las partes con voz
    fr = int(.04 * SR); out = []
    for i in range(0, len(x) - fr, fr):
        w = x[i:i + fr]
        if np.sqrt((w * w).mean()) < .03: continue
        c = np.correlate(w, w, 'full')[fr - 1:]; lo, hi = SR // 500, SR // 70; k = lo + np.argmax(c[lo:hi])
        if c[k] > .3 * c[0]: out.append(SR / k)
    return float(np.median(out)) if out else 0
def main(pid, size, *urls):
    d = f'/home/claude/voces/dis/{pid}'; os.makedirs(d, exist_ok=True); ok = []
    for i, u in enumerate(urls):
        p = f'{d}/p{i}.mp3'
        if not os.path.exists(p): subprocess.run(['curl', '-sS', '-m', '40', '-o', p, u], check=True)
        if P.split(p, None, write=False): ok.append((f0(P.load(p)), i, p))
    if not ok: print('ninguna muestra se partió en 16'); sys.exit(1)
    ok.sort(); pick = ok[-1] if size == 'peq' else ok[0] if size == 'gra' else ok[len(ok) // 2]
    print('tonos', [(round(a), i) for a, i, _ in ok], '→ muestra', pick[1])
    P.split(pick[2], f'{d}/cortes'); src = f'{d}/sel'; os.makedirs(src, exist_ok=True)
    for n in P.ORDER: os.replace(f'{d}/cortes/{n}.mp3', f'{src}/{n}.mp3')
    R.main(src, pid, 'assets/voices2'); open(f'{d}/escogida.txt', 'w').write(str(pick[1]))
main(*sys.argv[1:])
