#!/bin/sh
# 40 carreras en 4 procesos: sh medir40.sh archivo.html etiqueta
for k in 0 1 2 3; do DESDE=$((k*10)) VOLCAR=/tmp/m-$2-$k.json node medir.js $1 10 > /dev/null 2>&1 & done; wait
node juntar.js /tmp/m-$2-0.json /tmp/m-$2-1.json /tmp/m-$2-2.json /tmp/m-$2-3.json
