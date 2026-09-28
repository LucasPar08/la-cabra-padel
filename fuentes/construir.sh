#!/bin/sh
# Monta el juego desde las fuentes: la base (v1.html), los módulos c-*.js / c-*.css
# y las pasadas de parches, en orden. Deja el resultado en juego/index.html.
# Uso (desde la raíz del repo): sh fuentes/construir.sh
set -e
cd "$(dirname "$0")"
cp v1.html nuevo.html
for p in patch.py patch2.py patch2b.py patch2c.py patch2d.py patch2e.py patch2f.py patch2g.py patch2h.py; do
  python3 "$p" nuevo.html > /dev/null
done
cp nuevo.html ../juego/index.html
echo "Juego montado en juego/index.html"
