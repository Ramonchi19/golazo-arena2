#!/bin/bash
# Copia el juego a www/ y descarga three.js y la fuente para que funcione sin internet
set -e
rm -rf www && mkdir -p www/vendor
cp index.html www/ && cp -r assets www/
cd www
for u in $(grep -o 'https://cdn[^"]*\.js' index.html); do
  f="vendor/$(basename "$u")"
  curl -sSfL "$u" -o "$f"
  sed -i "s#$u#$f#" index.html
done
# fuente Lilita One local
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
curl -sSfL -A "$UA" "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" -o vendor/fonts.css
i=0
for fu in $(grep -o 'https://fonts.gstatic.com[^)]*' vendor/fonts.css); do
  i=$((i+1)); curl -sSfL "$fu" -o "vendor/lilita$i.woff2"; sed -i "s#$fu#lilita$i.woff2#" vendor/fonts.css
done
sed -i 's#https://fonts.googleapis.com/css2?family=Lilita+One&amp;display=swap#vendor/fonts.css#; s#https://fonts.googleapis.com/css2?family=Lilita+One&display=swap#vendor/fonts.css#' index.html
sed -i '/rel="preconnect"/d' index.html
echo "Externos que quedan:"; grep -o 'https://[^"]*' index.html || echo "ninguno"
