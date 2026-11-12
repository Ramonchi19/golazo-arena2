# Revisa que assets/sim/match.js no declare un nombre que index.html también declara (en el navegador comparten variables globales:
# un nombre repetido rompe TODO el juego al cargar, y en Node no se nota). Uso (desde la raíz): python3 tools/claude/choques_nombres.py
import re, sys
m = open('assets/sim/match.js', encoding='utf-8').read(); h = open('index.html', encoding='utf-8').read()
def decl(s):
    out = set(re.findall(r'(?m)^(?:let|const|var|function|async function)\s+([A-Za-z_$][\w$]*)', s))
    for line in re.findall(r'(?m)^(?:let|const|var)\s+(.*)$', s):
        out |= set(re.findall(r'(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=', line))
    return out - {'false', 'true'}
both = sorted(decl(m) & decl(h))
print('nombres declarados en los dos:', both or 'ninguno'); sys.exit(1 if both else 0)
