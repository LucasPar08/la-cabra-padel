import sys
# Tercera pasada sobre el archivo montado (código de la v1): portada, carta y gráficos en el perfil,
# iconos y números animados arriba, y la animación de números después de pintar.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b):
    global s
    c = s.count(a)
    assert c == 1, 'esperaba 1 y hay %d: %s' % (c, a[:100])
    s = s.replace(a, b)

# arriba: iconos y números que cuentan
rep("""      <div><span>RANKING</span><b>${j.ranking?'#'+j.ranking:'—'}</b></div>
      <div><span>PUNTOS</span><b class="tabular">${puntosActuales(j)}</b></div>
      <div><span>TÍTULOS</span><b>🏆 ${j.titulos.length}</b></div>
      <div><span>BOLSILLO</span><b>${money(j.dinero)}</b></div>""",
"""      <div><span>${ico('ranking')}RANKING</span><b>${j.ranking?'#'+j.ranking:'—'}</b></div>
      <div><span>${ico('estrella')}PUNTOS</span><b class="tabular" data-num="${puntosActuales(j)}" data-clave="top-pts">${puntosActuales(j)}</b></div>
      <div><span>${ico('trofeo')}TÍTULOS</span><b data-num="${j.titulos.length}" data-clave="top-tit">${j.titulos.length}</b></div>
      <div><span>${ico('dinero')}BOLSILLO</span><b data-num="${j.dinero}" data-fmt="money" data-clave="top-dinero">${money(j.dinero)}</b></div>""")
# iconos propios para el tipo de pista (se piden al pintar, cuando los iconos ya existen)
rep("const PISTA_ICONO = {indoor:'🏟️', exterior:'☀️', altura:'🏔️'};",
    "const PISTA_ICONO = { get indoor(){ return ico('techo'); }, get exterior(){ return ico('sol'); }, get altura(){ return ico('montana'); } };")
# después de pintar: los números cuentan y el cuadro se coloca en la ronda que toca
rep("  animarDado();\n  animarMinijuego();\n}", "  animarDado();\n  animarMinijuego();\n  animarNumeros();\n}")
# portada
rep("  const save = cargar();\n  return `<div class=\"fade\">\n  <div class=\"card\" style=\"background:linear-gradient(165deg",
    "  const save = cargar();\n  return `<div class=\"fade\">\n  ${heroInicioHTML(save)}\n  <div class=\"card\" style=\"background:linear-gradient(165deg")
# perfil: carta de jugador y gráficos de la carrera
rep("  <div class=\"card\">\n    <div class=\"eyebrow\">TU PAREJA</div><div style=\"height:8px\"></div>\n    ${tarjetaPareja(j)}",
    "  <div class=\"card\"><div class=\"eyebrow\">${ico('perfil')} TU CARTA</div><div style=\"height:8px\"></div>${cartaJugadorHTML(j)}</div>\n\n  ${graficosCarreraHTML(j)}\n\n"
    "  <div class=\"card\">\n    <div class=\"eyebrow\">TU PAREJA</div><div style=\"height:8px\"></div>\n    ${tarjetaPareja(j)}")

open(p, 'w', encoding='utf-8').write(s)
print('tercera pasada aplicada')
