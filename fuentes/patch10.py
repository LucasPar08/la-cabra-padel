import os
# Más probabilidades de ganar (+1,5 de nivel en la simulación y cuadro del Major más generoso) y el camino vuelve a
# perdonar un error como el cuadro de siempre (dos con psicólog@), sin dejar de ser exacto.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)
def rep(s, a, b, nombre):
    c = s.count(a); assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:90]); return s.replace(a, b)
s = leer('c-carrera.js')
s = rep(s, "sim:4,   eleccion:.12", "sim:5.5, eleccion:.16", 'c-carrera.js')
s = rep(s, "sim:2.5, eleccion:.08", "sim:4,   eleccion:.12", 'c-carrera.js')
s = rep(s, "sim:1,   eleccion:.02", "sim:2.5, eleccion:.06", 'c-carrera.js')
s = rep(s, "  const casillas = obj >= .8 || obj <= .2 ? 6 : 5, nMinas = clamp(Math.round((1 - obj)*casillas), 1, casillas - 1);\n",
        "  /* como en el cuadro de siempre, un error no os echa: una oportunidad más (dos con psicólog@). Cada intento sale lo justo\n"
        "     para que, contándolas, se pase con el % exacto */\n"
        "  const vidas = 1 + (j.equipo.psico ? 1 : 0), q = obj != null ? 1 - Math.pow(1 - obj, 1/(1 + vidas)) : null;\n"
        "  const casillas = 5, nMinas = clamp(Math.round((1 - (q != null ? q : .5))*casillas), 1, casillas - 1);\n", 'c-carrera.js')
s = rep(s, "  /* con psicólog@ hay una segunda oportunidad: cada intento sale lo justo para que, contándola, se pase con el % exacto */\n"
           "  const vidas = j.equipo.psico ? 1 : 0, q = obj != null ? 1 - Math.pow(1 - obj, 1/(1 + vidas)) : null;\n", "", 'c-carrera.js')
s = rep(s, "está la pareja que os gana. Si acertáis, ${premio}.`;",
        "está la pareja que os gana.${m.camino.vidas ? ` Podéis fallar ${m.camino.vidas === 1 ? 'una vez' : m.camino.vidas + ' veces'} sin quedar fuera.` : ''} Si acertáis, ${premio}.`;", 'c-carrera.js')
escribir('c-carrera.js', s)
v = leer('c-vistas.js')
v = rep(v, "'Ya usasteis la ayuda del psicólog@: este es el % que os queda, elijáis el camino que elijáis.'",
        "'Ese camino no era, pero seguís vivos: este es el % que os queda, elijáis el camino que elijáis.'", 'c-vistas.js')
v = rep(v, "exacto</b>${c.vidas > 0 ? ', contando que tu psicólog@ os salva de un error' : ''}.</p>",
        "exacto</b>${c.vidas > 0 ? `, contando ${c.vidas === 1 ? 'la oportunidad de más que os queda' : 'las ' + c.vidas + ' oportunidades de más que os quedan'}` : ''}.</p>", 'c-vistas.js')
escribir('c-vistas.js', v)
print('patch10: más probabilidades y el camino perdona un error')
