# Recorta silencio de efectos de ElevenLabs: inicio al primer golpe, final cuando cae al 1.5% del pico.
# Uso: python3 sfx_recortar.py entrada.mp3 salida.ogg [maxseg] [bucle]
import sys, subprocess, numpy as np
src, dst = sys.argv[1], sys.argv[2]
maxd = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
loop = len(sys.argv) > 4 and sys.argv[4] == 'bucle'
SR = 44100
raw = subprocess.run(['ffmpeg','-v','error','-i',src,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(raw, np.float32).copy()
if loop:
    # bucle sin corte: cruce circular de 0.3 s
    n = int(.3*SR); x = x[int(.05*SR):]
    head, body = x[:n], x[n:]
    w = np.linspace(0,1,n,dtype=np.float32)
    body[-n:] = body[-n:]*(1-w) + head*w
    y = body
else:
    win = int(.01*SR)
    env = np.sqrt(np.convolve(x*x, np.ones(win)/win, 'same'))
    pk = env.max()
    on = np.where(env > pk*0.03)[0]
    a = max(0, on[0] - int(.008*SR))
    loud = np.where(env > pk*0.015)[0]
    b = min(len(x), loud[-1] + int(.06*SR))
    b = min(b, a + int(maxd*SR))
    y = x[a:b].copy()
    f = min(int(.05*SR), len(y)//3)
    y[-f:] *= np.linspace(1,0,f)**2
    fi = int(.003*SR); y[:fi] *= np.linspace(0,1,fi)
y = y / (np.abs(y).max()+1e-9) * 0.89
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libvorbis','-q:a','5',dst],input=y.astype(np.float32).tobytes(),check=True)
print(f"{dst} {len(y)/SR:.2f}s")
