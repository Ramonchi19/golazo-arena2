#!/bin/sh
# Arma la página de prueba de pases/giro/zurda (v229) en /home/claude/demo_out para publicarla como artifact.
# Usa la lógica real del partido (server/src/match.gen.js) con unas funciones extra expuestas y los modelos/animaciones reales.
set -e
cd "$(dirname "$0")/../../.."
node server/build-sim.mjs >/dev/null
O=/home/claude/demo_out; rm -rf $O; mkdir -p $O/sim $O/models $O/anims $O/fx
cp tools/claude/demo/index.html $O/index.html
mkdir -p $O/fx && cp assets/fx/strikers.js $O/fx/strikers.js
cp assets/sim/ball.js $O/sim/ball.js
sed -e 's#import "../../assets/sim/ball.js";#import "./ball.js";#' \
    -e 's#popText = NO,#popText = (...a) => globalThis.POP \&\& globalThis.POP(...a),#' \
    -e 's#    setup, step, events,#    setup, step, events, pickMate, passOutcome, passDist, crossDist,#' \
    server/src/match.gen.js > $O/sim/match.sim.js
grep -q "globalThis.POP" $O/sim/match.sim.js && grep -q "pickMate, passOutcome" $O/sim/match.sim.js
cp assets/models/leon.glb assets/models/zurdito.glb $O/models/
cp assets/anims_atl.glb assets/anims_atl.json assets/anims_med.glb assets/anims_med.json assets/anims_extra.glb assets/anims_extra.json $O/anims/
for f in $O/models/*.glb $O/anims/*.glb; do base64 -w0 "$f" > "$f.txt"; rm "$f"; done   # el servidor de artifacts no sirve .glb
echo "listo: $O"; du -sh $O
