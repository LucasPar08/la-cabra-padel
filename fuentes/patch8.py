import os
# Pulido: el escudo del psicólog@ dejaba un hueco antes del punto final.
D = os.path.dirname(os.path.abspath(__file__))
f = os.path.join(D, 'c-vistas.js')
s = open(f, encoding='utf-8').read()
a = "', contando que tu psicólog@ os salva de un error 🛡️'"
assert s.count(a) == 1, 'FALTA: ' + a
s = s.replace(a, "', contando que tu psicólog@ os salva de un error'")
open(f, 'w', encoding='utf-8').write(s)
print('patch8: texto del psicólog@ pulido')
