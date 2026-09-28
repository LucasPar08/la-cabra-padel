import sys, os, re
D = os.path.dirname(os.path.abspath(__file__))
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, 'esperaba %d y hay %d: %s' % (n, c, a[:90])
    s = s.replace(a, b)

# cabecera
rep('buscas pareja y decides qué gira hacer cada trimestre:', 'buscas pareja, eliges cada torneo del calendario y juegas los partidos en la pista:')
# estilos y la pista en vivo
rep('</style>', leer('c-css.txt') + leer('c-look.css') + '</style>')
rep('<div id="app"></div>', '<div id="app"></div>' + leer('c-html.txt'))

# el hub del trimestre de antes (giras) se sustituye por el calendario completo
a = s.index('function vTemporada(){'); b = s.index('/* ── RESULTADO DE LA GIRA ── */')
s = s[:a] + s[b:]

# el código nuevo, antes del arranque
motor = leer('c-motor1.js') + leer('c-motor2.js') + leer('c-motor3.js') + leer('c-carrera.js') + leer('c-vistas.js') + leer('c-extra.js') + leer('c-look.js') + leer('c-emblemas.js') + leer('c-carreras.js') + leer('c-mundial.js') + leer('c-desafio.js') + leer('c-idolo.js') + leer('c-reales.js') + leer('c-circuito.js') + leer('c-tema.js')
rep('/* ─────────── ARRANQUE ─────────── */', motor + '\n/* ─────────── ARRANQUE ─────────── */')
rep("S = { pantalla:'inicio', j:null, cal:null, msgs:[], pantallaPrevia:null };",
    "S = { pantalla:'inicio', j:null, cal:null, msgs:[], pantallaPrevia:null, trim:null, torneo:null };")

# pantallas nuevas
rep("  else if(p==='retiro')       html += vRetiro();",
    "  else if(p==='retiro')       html += vRetiro();\n  else if(p==='torneo')       html += vTorneo();\n  else if(p==='como')         html += vComo();\n  else if(p==='finRapido')    html += vFinRapido();")
# los títulos siempre arriba
rep('<div><span>EDAD</span><b>${j.edad}</b></div>', '<div><span>TÍTULOS</span><b>🏆 ${j.titulos.length}</b></div>')
# guardar también el trimestre y el torneo en curso
rep('JSON.stringify({j:S.j, cal:S.cal})', 'JSON.stringify({j:S.j, cal:S.cal, trim:S.trim, torneo:S.torneo})')
rep("  S.j = j; S.cal = d.cal || generarTemporada(j);\n  S.pantalla = j.retirado ? 'retiro' : 'temporada';",
    "  S.j = j; S.cal = d.cal || generarTemporada(j);\n  j.historialTorneos = j.historialTorneos || [];\n"
    "  S.trim = d.trim || null; S.torneo = d.torneo && !d.torneo.fin ? d.torneo : null; S.verTorneo = S.torneo ? S.torneo.ev : null;\n"
    "  S.pantalla = j.retirado ? 'retiro' : S.torneo ? 'torneo' : 'temporada';")
rep("  S.j = j;\n  S.cal = generarTemporada(j);",
    "  j.historialTorneos = [];\n  S.j = j;\n  S.cal = generarTemporada(j);\n  S.trim = null; S.torneo = null; S.verTorneo = null;")
rep("function pasarTrimestre(){\n  const j = S.j;",
    "function pasarTrimestre(){\n  const j = S.j;\n  S.trim = null; S.torneo = null; S.verTorneo = null;")
# el resumen del trimestre reutiliza la pantalla de la gira
rep('EL PARTIDO DE LA GIRA · ', 'EL PARTIDO DEL TRIMESTRE · ')
# ficha de partido: los jugados en la pista enseñan sus números
rep("<div class=\"rd\">${p.ronda}${p.previa?' · CUADRO DE CLASIFICACIÓN':''}</div>",
    "<div class=\"rd\">${p.ronda}${p.previa?' · CUADRO DE CLASIFICACIÓN':''}${p.vivo?' · 🎾 EN LA PISTA':''}</div>")
rep('${p.puntos ? `<div class="fp">', '${p.vivo ? fichaVivo(p) : p.puntos && p.red != null ? `<div class="fp">')
# vitrina con pestaña de premios
rep("const tab = S.vitrinaTab || 'titulos';", "const tab = S.vitrinaTab || 'premios';")
rep("    <button class=\"${tab==='titulos'?'on':''}\" onclick=\"S.vitrinaTab='titulos';render()\">TÍTULOS</button>",
    "    <button class=\"${tab==='premios'?'on':''}\" onclick=\"S.vitrinaTab='premios';render()\">PREMIOS</button>\n"
    "    <button class=\"${tab==='titulos'?'on':''}\" onclick=\"S.vitrinaTab='titulos';render()\">TÍTULOS</button>")
rep("  if(tab === 'titulos'){", "  if(tab === 'premios') h += premiosVitrinaHTML(j);\n\n  if(tab === 'titulos'){")
# inicio: la pista a la vista
rep('  <div class="card">\n    <div class="eyebrow">LA ESCALERA</div>', '  ${tarjetaPistaInicio()}\n\n  <div class="card">\n    <div class="eyebrow">LA ESCALERA</div>')
# perfil: partidos en la pista
rep('    <div class="li"><div class="g"><b>Premios en toda la carrera</b><span>Ya descontada la mitad de tu pareja</span></div><span class="pill acc">${money(j.premiosTotal||0)}</span></div>',
    '    <div class="li"><div class="g"><b>Premios en toda la carrera</b><span>Ya descontada la mitad de tu pareja</span></div><span class="pill acc">${money(j.premiosTotal||0)}</span></div>\n'
    '    ${j.pista ? `<div class="li"><div class="g"><b>Partidos jugados en la pista</b><span>${j.pista.ganados} ganados · ${j.pista.porTres} por 3 · rally más largo ${j.pista.rallyMax}</span></div><span class="pill gold">${j.pista.jugados}</span></div>` : \'\'}')

open(p, 'w', encoding='utf-8').write(s)

# nombres repetidos a nivel superior = error de sintaxis seguro
js = s.split('<script>')[1].split('</script>')[0]
vistos, rep2 = set(), set()
for m in re.finditer(r'^(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*))', js, re.M):
    n = m.group(1) or m.group(2)
    if n in vistos: rep2.add(n)
    vistos.add(n)
print('repetidos:', sorted(rep2) or 'ninguno')
print('parche aplicado ·', s.count('\n'), 'líneas')
