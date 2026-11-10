# Herramientas de Claude (para retomar en un chat nuevo)
Se corren desde la raíz del repo; las que usan Python necesitan numpy, pillow y scipy.
- render.py — renderer de GLB en Python puro (numpy + PIL), para ver modelos sin three.js.
- capturas_menu.js / capturas_tamanos.js / prueba_partido.js — Playwright: abren index.html servido con `python3 -m http.server 8790` desde la raíz del repo, con un THREE de mentira (el sandbox no puede bajar three.js). Sirven para ver menús y atrapar errores de JS, NO para ver el 3D. capturas_tamanos.js: `node capturas_tamanos.js '[["s22",915,412]]' '["battle","shop"]'`.
- iconos_quitar_fondo.py — quita el fondo blanco de los íconos (flood fill desde la orilla), recorta y deja 256x256 webp. HOLES = íconos con huecos cerrados que deben quedar transparentes; TH = umbral por ícono (tundra 8).
- cartas_quitar_fondo.py — igual para las cartas (_c 450x598 y _s 625x900).
- kragor_* — modelo HD de Kragor: kragor_pelo.py pinta pelo dentro de la corona (componentes: 16 pelo, 21 cabeza, 22 corona), kragor_hd_armar.py le pasa esqueleto+animación del modelo con rig (pesos por los 6 vértices más cercanos) y arma 4K y 2K, kragor_pose_check.py hace skinning en numpy para revisar, kragor_vista_previa.html es la página de prueba (los GLB van como .glb.txt base64).
