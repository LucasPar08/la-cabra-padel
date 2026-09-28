import sys
# Segunda pasada sobre el archivo ya parcheado: momentos clave y minijuegos de siempre dentro del torneo
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, 'esperaba %d y hay %d: %s' % (n, c, a[:90])
    s = s.replace(a, b)

# pantalla del momento clave
rep("  else if(p==='finRapido')    html += vFinRapido();",
    "  else if(p==='finRapido')    html += vFinRapido();\n  else if(p==='momento')      html += vMomento();")
# ficha de partido: se ve qué se decidió en un momento clave
rep("${p.vivo?' · 🎾 EN LA PISTA':''}",
    "${p.clave ? (p.clave.forma==='tiempo' ? ' · ⚡ RÁFAGA' : p.clave.forma==='leer' ? ' · 👀 PUNTO LEÍDO' : p.clave.forma==='camino' ? ' · 🧩 CAMINO ELEGIDO' : (p.clave.tipo==='punto' ? ' · 🥇 PUNTO CLAVE' : ' · 🔥 JUEGO CLAVE') + (p.clave.enVivo ? ' EN LA PISTA' : '')) : ''}")
# el cuadro del Major y el punto de oro de la final siguen existiendo: al acabar, cierran el torneo en curso
rep("  j.energia = clamp(j.energia - jugados*6, 0, 100);\n  const r = cerrarFichaTorneo(c.ev, victorias, p.partidos, p.perfecto && c.gano, p.remontada, false);",
    "  j.energia = clamp(j.energia - jugados*6, 0, 100);\n  if(S.torneo){ S.cuadro = null; return finMinijuegoTorneo(victorias, c.gano); }\n  const r = cerrarFichaTorneo(c.ev, victorias, p.partidos, p.perfecto && c.gano, p.remontada, false);")
rep("  j.energia = clamp(j.energia-7, 0, 100);\n  const r = cerrarFichaTorneo(d.ev, victorias, p.partidos, p.perfecto && res.gana, p.remontada, false);",
    "  j.energia = clamp(j.energia-7, 0, 100);\n  if(S.torneo){ S.duelo = null; return finMinijuegoTorneo(victorias, res.gana); }\n  const r = cerrarFichaTorneo(d.ev, victorias, p.partidos, p.perfecto && res.gana, p.remontada, false);")

# en la ficha de partido, el nombre del rival no se come el marcador
rep("<span class=\"rk\">#${p.opp.rank}${p.opp.arq?' · '+esc(p.opp.arq.nom):''}</span>", "<span class=\"rk\">#${p.opp.rank}</span>")

# dificultad: la simulación y los minijuegos de siempre también se ablandan según la que elijas
rep("  const miR = ratingDupla(j, ev.pista, ev) - fatiga;", "  const miR = ratingDupla(j, ev.pista, ev) - fatiga + difActual().sim;")
rep("    const objetivo = clamp(0.62 + (miR - opp.rating)*0.05, 0.40, 0.88);", "    const objetivo = clamp(0.62 + (miR - opp.rating)*0.05 + difActual().eleccion, 0.45, 0.9);")
rep("  const pBase = clamp(0.56 + (miR - opp.rating)*0.04, 0.28, 0.90);", "  const pBase = clamp(0.56 + (miR - opp.rating)*0.04 + difActual().eleccion, 0.32, 0.92);")

# la ráfaga reemplaza al punto de oro de elegir golpe: también en el Mundial, y su cursor se mueve después de pintar
rep("  else if(p==='momento')      html += vMomento();", "  else if(p==='momento')      html += vMomento();\n  else if(p==='mundial')      html += vMundial();")
rep("  animarDado();\n}\n/* Se llama después de pintar.", "  animarDado();\n  animarMinijuego();\n}\n/* Se llama después de pintar.")
rep("    S.duelo = crearDueloMundial(S.j);\n    S.pantalla = 'duelo';", "    S.mundial = crearMundialRafaga(S.j);\n    S.pantalla = 'mundial';")

# el cuadro del Major en el circuito jugable: cuartos y semifinal; la final se juega en la pista
rep("  for(let k = T.rondas-3; k < T.rondas; k++){", "  for(let k = T.rondas-3; k < (S.torneo ? T.rondas-1 : T.rondas); k++){")
rep("  const victorias = (T.rondas-3) + (c.gano ? 3 : c.actual);", "  const victorias = (T.rondas-3) + (c.gano ? c.rondas.length : c.actual);")
rep("  const jugados = c.gano ? 3 : c.actual + 1;", "  const jugados = c.gano ? c.rondas.length : c.actual + 1;")
rep("  j.pg += (c.gano ? 3 : c.actual);\n  j.pgAnio = (j.pgAnio||0) + (c.gano ? 3 : c.actual);", "  j.pg += (c.gano ? c.rondas.length : c.actual);\n  j.pgAnio = (j.pgAnio||0) + (c.gano ? c.rondas.length : c.actual);")
rep("  else j.racha = (j.racha||0) + 3;", "  else j.racha = (j.racha||0) + c.rondas.length;")
rep("Tres partidos para el título. <b>Cada casilla es un partido</b>", "${c.rondas.length === 3 ? 'Tres partidos para el título.' : 'Cuartos y semifinal: si pasáis, <b>la final se juega en la pista</b>.'} <b>Cada casilla es un partido</b>")
rep("${c.gano?gx('🏆 ¡CAMPEÓN!','🏆 ¡CAMPEONA!'):'😖 SE ACABÓ'}", "${c.gano ? (c.rondas.length < 3 ? '🎾 ¡A LA FINAL!' : gx('🏆 ¡CAMPEÓN!','🏆 ¡CAMPEONA!')) : '😖 SE ACABÓ'}")
rep("${c.gano\n        ? `Ganasteis <b>", "${c.gano\n        ? c.rondas.length < 3 ? 'Estáis en la final del Major. <b>La final se juega en la pista.</b>' : `Ganasteis <b>")

# el % de pasar cada ronda del cuadro es exacto: cuenta las bolas de partido que os quedan
rep("      const pc = Math.round(100 * clamp(seguros/elegibles, 0, 1));", "      const pc = Math.round(100 * pasarRondaCuadro(r, c.vidas).reduce((a, x) => a + x, 0));   // exacto, con las bolas de partido que os quedan")
rep("de partido en la recámara`:''}. Elige.</p>`;", "de partido en la recámara, ya contadas en el %`:''}. Elige.</p>`;")

# ranking: entre el tope de la tabla (9500) y 13000 puntos no había tramo y se caía al puesto 2000
rep("  if(pts>=13000) return 1;", "  if(pts>=TABLA_RK[0][0]) return 1;          // por encima del tope de la tabla, número 1")
# las partidas guardadas con ese error se corrigen solas al abrir el juego
rep("  try{ const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }",
    "  try{ const raw = localStorage.getItem(SAVE_KEY); const s = raw ? JSON.parse(raw) : null; if(s && s.j && s.j.puntosHist && !s.j.retirado) recalcRank(s.j); return s; }catch(e){ return null; }")

# partidas guardadas al cerrar la temporada (trimestre 4) rompían "Continuar": se pasa a la pretemporada sin repetir el cierre
rep("  if(j.retirado) S.legado = calcularLegado(j);\n  S.msgs = [];\n  render();\n}",
    "  if(j.retirado) S.legado = calcularLegado(j);\n  S.msgs = [];\n"
    "  /* guardada al cerrar la temporada (trimestre 4): empieza la siguiente sin repetir el cierre */\n"
    "  if(!j.retirado && j.trimestre >= TRIMESTRES_POR_ANIO){ irPretemporada(); return; }\n"
    "  /* guardada en la pretemporada: se vuelve a ella para no perder los puntos por repartir */\n"
    "  if(!j.retirado && d.pantalla === 'pretemporada' && d.pre){ S.pre = d.pre; S.pantalla = 'pretemporada'; }\n"
    "  render();\n}")

# pantallas nuevas: ranking y entrenamiento
rep("  else if(p==='mundial')      html += vMundial();", "  else if(p==='mundial')      html += vMundial();\n  else if(p==='ranking')      html += vRanking();\n  else if(p==='entreno')      html += vEntreno();\n  else if(p==='finEntreno')   html += vFinEntreno();")
# el circuito con nombre: las 40 mejores parejas se repiten
rep("  return duplaRival(ri(rg[0], rg[1]));", "  return rivalDelCircuito(ri(rg[0], rg[1]));")
# el material suma nivel
rep("  if(tieneMejora(j,'video')) r += 1.2;", "  if(tieneMejora(j,'video')) r += 1.2;\n  r += bonoEquipo(j);")
# mercado: pestaña de material
rep("onclick=\"S.mercadoTab='vida';render()\">VIDA</button>", "onclick=\"S.mercadoTab='vida';render()\">VIDA</button>\n    <button class=\"${tab==='material'?'on':''}\" onclick=\"S.mercadoTab='material';render()\">MATERIAL</button>")
rep("  if(tab === 'equipo'){\n    const sig = NIVELES_ENTRENADOR", "  if(tab === 'material') h += materialHTML(j);\n\n  if(tab === 'equipo'){\n    const sig = NIVELES_ENTRENADOR")
# historial también en el cuadro del Major
rep("  if(S.torneo){ S.cuadro = null; return finMinijuegoTorneo(victorias, c.gano); }",
    "  c.rondas.forEach((r, k) => { if(k < c.actual || c.gano) anotarH2H(j, r.opp, true); else if(k === c.actual) anotarH2H(j, r.opp, false); });\n  if(S.torneo){ S.cuadro = null; return finMinijuegoTorneo(victorias, c.gano); }")
# ficha: partido jugado entero en la pista
rep("${p.clave ? (p.clave.forma==='tiempo'", "${p.partidoEnPista ? ' · 🎾 PARTIDO EN LA PISTA' : p.clave ? (p.clave.forma==='tiempo'")

open(p, 'w', encoding='utf-8').write(s)
print('segunda pasada aplicada')
