# Sonidos de menu y avisos hechos con codigo, estilo arcade caricatura (brillante, marimba, campanitas, pops).
# Uso: python3 sfx_sintetizar.py carpeta_salida
import sys, os, subprocess, numpy as np
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else 'sint'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t(d): return np.arange(int(d*SR))/SR
def hz(n): return 440*2**((n-69)/12)          # nota midi -> Hz
def env(d, a=.003, r=None, k=8.0):
    x = t(d); e = np.minimum(1, x/max(a,1e-4)) * np.exp(-k*x)
    if r: e *= np.clip((d-x)/r, 0, 1)
    return e
def mix(*parts):
    n = max(int((o)*SR)+len(p) for o,p in parts); y = np.zeros(n)
    for o,p in parts: s=int(o*SR); y[s:s+len(p)] += p
    return y
def marimba(n, d=.35, v=1.0):
    f=hz(n); x=t(d)
    s = np.sin(2*np.pi*f*x) + .35*np.sin(2*np.pi*f*4*x)*np.exp(-30*x) + .15*np.sin(2*np.pi*f*10*x)*np.exp(-60*x)
    return v*s*env(d,.002,.02,9)
def bell(n, d=.6, v=1.0, k=5.0):
    f=hz(n); x=t(d)
    s = np.sin(2*np.pi*f*x + 1.8*np.exp(-6*x)*np.sin(2*np.pi*f*3.5*x)) + .25*np.sin(2*np.pi*f*2.76*x)*np.exp(-9*x)
    return v*s*env(d,.002,.03,k)
def pluck(n, d=.25, v=1.0):
    f=hz(n); x=t(d); s=sum(np.sin(2*np.pi*f*h*x)/h**1.3*np.exp(-(5+h*4)*x) for h in range(1,7))
    return v*s*env(d,.001,.02,6)
def square(n, d, v=1.0, duty=.5):
    f=hz(n); x=t(d); ph=(f*x)%1; s=np.where(ph<duty,1.,-1.)
    return v*lp(s, 2500)*env(d,.003,.02,4)
def pop(f0, f1, d=.07, v=1.0):
    x=t(d); f=f1+(f0-f1)*np.exp(-x*40); ph=2*np.cumsum(np.pi*f)/SR
    return v*np.sin(ph)*env(d,.001,.01,25)
def noise(d): return rng.standard_normal(int(d*SR))
def lp(x, fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); z=0.
    for i in range(len(x)): z=(1-a)*x[i]+a*z; y[i]=z
    return y
def bp_sweep(x, f0, f1, q=4.0):
    # filtro pasa-banda que barre de f0 a f1 (state variable)
    n=len(x); y=np.zeros(n); lo=bd=0.
    fs=np.geomspace(f0,f1,n)
    for i in range(n):
        f=2*np.sin(np.pi*fs[i]/SR); hi=x[i]-lo-bd/q; bd+=f*hi; lo+=f*bd; y[i]=bd
    return y
def whoosh(d, f0, f1, v=1.0):
    x=t(d); e=np.sin(np.pi*np.clip(x/d,0,1))**2
    return v*bp_sweep(noise(d), f0, f1, 2.5)*e*.6
def reverb(y, mix_=.18, dec=.35):
    n=int(dec*SR*2); ir=rng.standard_normal(n)*np.exp(-np.arange(n)/SR/dec*5); ir=lp(ir,6000); ir/=np.sqrt((ir**2).sum())
    w=np.convolve(y, ir); y2=np.concatenate([y,np.zeros(len(w)-len(y))])
    return y2+mix_*w
def fin(y, dst, gain=.85, rv=.18, dec=.35, loop=False):
    if rv and not loop: y=reverb(y, rv, dec)
    if not loop:
        # cortar cola muda
        a=np.abs(y); last=np.where(a>a.max()*.004)[0][-1]; y=y[:last+int(.02*SR)]
        f=min(int(.03*SR),len(y)//4); y[-f:]*=np.linspace(1,0,f)
    y=y/np.abs(y).max()*gain
    subprocess.run(['ffmpeg','-v','error','-y','-f','f64le','-ar',str(SR),'-ac','1','-i','-','-c:a','libvorbis','-q:a','6',f'{OUT}/{dst}.ogg'],input=y.astype(np.float64).tobytes(),check=True)
    print(dst, f'{len(y)/SR:.2f}s')

C5,D5,E5,F5,G5,A5,B5,C6=72,74,76,77,79,81,83,84

# --- menu ---
fin(mix((0,pop(1100,520,.06)),(0,.25*marimba(C6+7,.12))), 'ui_boton', rv=.08)
fin(mix((0,whoosh(.12,1500,5000,.5)),(.02,marimba(G5,.2,.8))), 'ui_pestana', rv=.1)
fin(mix((0,whoosh(.18,600,4000,.6)),(0,marimba(C5,.2,.7)),(.07,marimba(G5,.3,.8))), 'ui_abrir')
fin(mix((0,whoosh(.18,4000,600,.6)),(0,marimba(G5,.2,.7)),(.07,marimba(C5,.3,.8))), 'ui_cerrar')
fin(mix((0,square(43,.09,.8,.3)),(.12,square(41,.16,.8,.3))), 'ui_no', rv=.08)
fin(mix((0,pop(2600,1800,.03,.8)),(0,.5*bell(C6+12,.12,1,25))), 'carta_tic', rv=.05)
fin(mix((0,whoosh(.2,800,6000,1.0)),(.12,pop(900,300,.08,.8))), 'carta_lanzar', rv=.12)
fin(mix((0,square(52,.07,.6,.25)),(.08,square(47,.07,.6,.25)),(0,pop(300,120,.12,.6))), 'carta_sinenergia', rv=.08)
fin(mix((0,pluck(C5,.2)),(.05,pluck(G5,.25))), 'equipo_tomar', rv=.1)
fin(mix((0,pop(1500,700,.04)),(.06,pop(1800,900,.05)),(.06,marimba(E5+12,.25,.6))), 'equipo_meter', rv=.1)
fin(mix((0,pop(700,1500,.05)),(.04,pluck(G5,.15,.7)),(.09,pluck(C5,.2,.7))), 'equipo_sacar', rv=.1)
# sobre tiembla: traqueteo creciente
d=1.2; x=t(d); rat=noise(d)*(0.5+0.5*np.sign(np.sin(2*np.pi*(14+10*x/d)*x)))*np.minimum(1,x/d*1.5)
rum=np.sin(2*np.pi*70*x)*.5*x/d
fin(lp(rat,3500)*.6+rum, 'sobre_tiembla', rv=.1)
fin(mix((0,bell(E5+12,.7)),(0,.5*marimba(C5,.3))), 'carta_normal')
fin(mix((0,bell(C6,.4)),(.08,bell(E5+12,.4)),(.16,bell(G5+12,.8))), 'carta_rara', rv=.25)
leg=[(i*.06,bell(n,1.2,.8,3.5)) for i,n in enumerate([C6,E5+12,G5+12,C6+12,E5+24])]
sh=whoosh(1.4,3000,9000,.5)
fin(mix((0,pop(400,90,.25,1.2)),(0,sh),*leg), 'carta_legendaria', rv=.35, dec=.6)
fin(mix((0,marimba(G5,.15)),(.09,marimba(C6,.15)),(.18,bell(E5+12,.5)),(.18,bell(G5+12,.5,.6))), 'carta_nueva', rv=.25)
fan=[(0,square(C5,.12,.5,.25)),(.13,square(E5,.12,.5,.25)),(.26,square(G5,.12,.5,.25)),(.39,square(C6,.5,.6,.25))]
fin(mix(*fan,(.39,bell(C6+12,1.0,.6,3)),(.39,bell(G5+12,1.0,.4,3))), 'recompensa', rv=.3, dec=.5)
fin(mix((0,bell(B5+12,.12,1,20)),(.08,bell(E5+24,.7,1,5))), 'comprar', rv=.2)
fin(mix((0,bell(B5+12,.1,1,22)),(.07,bell(E5+24,.5,1,6))), 'moneda', rv=.15)
fin(mix(*[(i*.05,marimba(n,.25,.8)) for i,n in enumerate([C5,E5,G5,C6,E5+12])],(.25,whoosh(.5,2000,8000,.4)),(.25,bell(G5+12,.8,.5))), 'nivel', rv=.25)
fin(mix(*[(i*.07,marimba(C5+i*2,.12,.7)) for i in range(8)]), 'trofeos_suben', rv=.1)
fin(mix(*[(i*.07,marimba(C6-i*2,.12,.7)) for i in range(8)]), 'trofeos_bajan', rv=.1)
lg=[(0,square(G5-12,.1,.5,.3)),(.11,square(G5-12,.1,.5,.3)),(.22,square(C5,.6,.6,.3)),(.22,bell(C6,1.2,.6,3)),(.22,bell(E5+12,1.2,.5,3)),(.22,bell(G5+12,1.2,.5,3)),(.2,whoosh(1.0,2000,9000,.4))]
fin(mix((0.2,pop(300,70,.3,1.0)),*lg), 'liga', rv=.35, dec=.6)
fin(mix((0,whoosh(.35,1500,8000,.7)),(.1,bell(G5+12,.4,.7)),(.18,bell(C6+12,.6,.7))), 'pase_avanza', rv=.25)
fin(mix((0,square(G5,.08,.7,.3)),(.1,square(C6,.25,.8,.3)),(.1,bell(C6+12,.6,.5))), 'rival_encontrado', rv=.2)
fin(mix((0,whoosh(.35,500,6000,.8)),(.3,pop(220,45,.5,1.4)),(.3,lp(noise(.4),1200)*env(.4,.001,.05,10)*.8)), 'versus', rv=.3, dec=.5)
fin(mix((0,pop(800,300,.1,1.0)),(0,square(C5,.25,.5,.3)),(0,square(G5,.25,.4,.3)),(0,bell(C6,.5,.5))), 'ui_jugar', rv=.15)
fin(mix((0,square(G5-12,.22,.6,.4)),(.24,square(F5-12,.22,.6,.4)),(.48,square(E5-12,.5,.6,.4))), 'res_derrota', rv=.2)
fin(mix((0,pop(500,250,.08,.6)),(.05,square(E5,.1,.5,.4)),(.16,square(C5,.1,.5,.4)),(.27,square(G5-12,.3,.5,.4))), 'gol_contra', rv=.15)
fin(mix((0,bell(C6+12,.4,.8,8)),(0,pop(3000,1500,.04,.6)),(0,whoosh(.25,3000,9000,.4))), 'carga_llena', rv=.2)

# --- bucles (periodicos exactos, sin corte) ---
L=2.0; x=t(L)
tk=np.zeros(len(x))
for i in range(4):
    s=int(i*.5*SR); b=bell(G5+12 if i%2==0 else E5+12,.3,.6,14); np.add.at(tk,(s+np.arange(len(b)))%len(tk),b)
fin(tk+.15*np.sin(2*np.pi*130.5*x)*(.5+.5*np.sin(2*np.pi*.5*x)), 'buscando_bucle', loop=True, gain=.6)
# carga: zumbido de energia que gira + chispitas hacia adentro, periodo exacto de 2 s
L=2.0; N=int(L*SR); x=t(L+.2); base=hz(45)
hum=sum(np.sin(2*np.pi*(base*h)*x + h*np.sin(2*np.pi*.5*x))/h for h in (1,2,3,5))
wob=.6+.4*np.sin(2*np.pi*4*x)
sp=np.zeros(len(x)); 

for k in range(16):
    s=int(k*L/16*SR); b=bell(84+int(rng.integers(0,12)),.08,.25,40); e=min(len(b),len(sp)-s); sp[s:s+e]+=b[:e]
air=bp_sweep(noise(L+.2),4000,1500,2)*.15
y=lp(hum,1800)*wob*.5+sp+air
n=int(.2*SR); w=np.linspace(0,1,n); o=y[:N].copy(); o[:n]=y[:n]*w+y[N:N+n]*(1-w)  # cruce circular
fin(o, 'carga_bucle', loop=True, gain=.6)
