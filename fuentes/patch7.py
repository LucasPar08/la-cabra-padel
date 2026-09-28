import os
# Los porcentajes de ganar, un poco más altos: +1 de nivel de dupla en la simulación, en las tres dificultades.
# Medido con subir.js: un partido de 38% pasa a ~50%, 47% → ~59%, 75% → ~83%, 84% → ~91%, 91% → ~95%.
D = os.path.dirname(os.path.abspath(__file__))
f = os.path.join(D, 'c-carrera.js')
s = open(f, encoding='utf-8').read()
for a, b in [("rival:12, cal:.1,  alcance:.16, sim:3,   eleccion:.12", "rival:12, cal:.1,  alcance:.16, sim:4,   eleccion:.12"),
             ("rival:8,  cal:.07, alcance:.1,  sim:1.5, eleccion:.08", "rival:8,  cal:.07, alcance:.1,  sim:2.5, eleccion:.08"),
             ("rival:0,  cal:.02, alcance:.03, sim:0,   eleccion:.02", "rival:0,  cal:.02, alcance:.03, sim:1,   eleccion:.02")]:
    assert s.count(a) == 1, 'FALTA: ' + a
    s = s.replace(a, b)
open(f, 'w', encoding='utf-8').write(s)
print('patch7: porcentajes de ganar un poco más altos')
