import os
# Cada uno en su posición siempre (drive o revés), aunque saque desde el otro lado; partido rápido en sets de 3, 4 o 6
# juegos (dos de ventaja y tie-break a 7) y a 1 set o al mejor de 3.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)
def rep(s, a, b, nombre):
    c = s.count(a); assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:100]); return s.replace(a, b)

m1 = leer('c-motor1.js')
m1 = rep(m1, "PREF_BASE = { asistencia:true, sonido:true, juegos:3,", "PREF_BASE = { asistencia:true, sonido:true, juegos:3, sets:1, posicion:'reves',", 'm1')
escribir('c-motor1.js', m1)

m3 = leer('c-motor3.js')
m3 = rep(m3, "juegosGanar: cfg.juegos || 3, set: (cfg.juegos || 3) >= 6 && !M, tb:false,",
         "juegosGanar: [3,4,6].includes(cfg.juegos) ? cfg.juegos : 3, setsGanar: cfg.sets === 3 ? 2 : 1, setsG:[0,0], marcadorSets:[],\n"
         "        nJuego: M ? (M.juegos || [5,5])[0] + (M.juegos || [5,5])[1] : 0, set: !M, tb:false,", 'm3')
# posiciones fijas
m3 = rep(m3, "  let lado = P.sacaLado, idx = Math.floor((P.juegos[0] + P.juegos[1]) / 2) % 2;\n"
             "  if(P.tb){ const k = Math.floor((n + 1)/2); lado = k % 2 === 0 ? P.tbSaca : 1 - P.tbSaca; idx = Math.floor(k/2) % 2; }\n"
             "  const equipo = P.jug.filter(j => j.lado === lado), servidor = equipo[idx], companero = equipo[1 - idx];\n"
             "  /* se saca cruzado y alternando lado (el primer punto, desde la derecha): el que saca y su pareja se cruzan */\n"
             "  const derecha = n % 2 === 0, xSaque = (lado === 0) === derecha ? 7.3 : 2.7, xResto = W - xSaque;\n"
             "  servidor.carril = xSaque > W/2 ? 'der' : 'izq'; companero.carril = xSaque > W/2 ? 'izq' : 'der';\n"
             "  for(const j of P.jug) if(j.lado !== lado) j.carril = j.carrilBase;\n",
         "  let lado = P.sacaLado, idx = Math.floor(P.nJuego / 2) % 2;             // el turno de saque sigue de un set al otro\n"
         "  if(P.tb){ const k = Math.floor((n + 1)/2); lado = k % 2 === 0 ? P.tbSaca : 1 - P.tbSaca; idx = (Math.floor(P.nJuego / 2) + Math.floor(k/2)) % 2; }\n"
         "  const equipo = P.jug.filter(j => j.lado === lado), servidor = equipo[idx];\n"
         "  /* se saca cruzado y alternando lado (el primer punto, desde la derecha). Cada uno conserva SIEMPRE su posición, drive\n"
         "     o revés: si le toca sacar desde el otro lado, saca desde ahí y vuelve al suyo; su pareja le espera en la red, en su lado */\n"
         "  const derecha = n % 2 === 0, xSaque = (lado === 0) === derecha ? 7.3 : 2.7, xResto = W - xSaque;\n"
         "  for(const j of P.jug) j.carril = j.carrilBase;\n", 'm3')
m3 = rep(m3, "  for(const j of P.jug){\n    j.x = j.carril === 'izq' ? 2.7 : 7.3;\n    if(j.lado === lado) j.y =",
         "  for(const j of P.jug){\n    j.x = j === servidor ? xSaque : j.carril === 'izq' ? 2.7 : 7.3;\n    if(j.lado === lado) j.y =", 'm3')
# sets
m3 = rep(m3, "  } else if(P.tb){\n    const a = P.puntos[ganador], o = P.puntos[1 - ganador];\n"
             "    if(a >= 7 && a - o >= 2){ P.juegos[ganador]++; P.tb = false; P.acabado = true; sub = yo ? '¡SET Y PARTIDO!' : 'SE ACABÓ'; }\n"
             "    else sub = `TIE-BREAK · ${P.puntos[0]}-${P.puntos[1]}`;\n"
             "  } else if(P.puntos[ganador] >= 4){\n"
             "    P.juegos[ganador]++; P.puntos = [0, 0]; P.sacaLado = 1 - P.sacaLado;\n"
             "    const a = P.juegos[ganador], o = P.juegos[1 - ganador];\n"
             "    sub = `JUEGO PARA ${yo ? 'VOSOTROS' : 'ELLOS'} · ${P.juegos[0]}-${P.juegos[1]}`;\n"
             "    if(P.set){\n"
             "      if((a >= 6 && a - o >= 2) || a >= 7){ P.acabado = true; sub = yo ? '¡SET Y PARTIDO!' : 'SE ACABÓ'; }\n"
             "      else if(a === 6 && o === 6){ P.tb = true; P.tbSaca = P.sacaLado; sub = '6-6 · ¡TIE-BREAK A 7!'; }\n"
             "    } else if(a >= P.juegosGanar){ P.acabado = true; sub = yo ? '¡PARTIDO!' : 'SE ACABÓ'; }\n"
             "  }\n",
         "  } else if(P.tb){\n    const a = P.puntos[ganador], o = P.puntos[1 - ganador];\n"
         "    if(a >= 7 && a - o >= 2){\n"
         "      P.juegos[ganador]++; P.tb = false; P.puntos = [0, 0]; P.nJuego++;\n"
         "      P.sacaLado = 1 - P.tbSaca;                // el set siguiente lo empieza sacando quien restó primero en el tie-break\n"
         "      sub = cerrarSet(ganador);\n"
         "    } else sub = `TIE-BREAK · ${P.puntos[0]}-${P.puntos[1]}`;\n"
         "  } else if(P.puntos[ganador] >= 4){\n"
         "    P.juegos[ganador]++; P.puntos = [0, 0]; P.sacaLado = 1 - P.sacaLado; P.nJuego++;\n"
         "    const a = P.juegos[ganador], o = P.juegos[1 - ganador], N = P.juegosGanar;\n"
         "    sub = `JUEGO PARA ${yo ? 'VOSOTROS' : 'ELLOS'} · ${P.juegos[0]}-${P.juegos[1]}`;\n"
         "    if(a >= N && a - o >= 2) sub = cerrarSet(ganador);\n"
         "    else if(a === N && o === N){ P.tb = true; P.tbSaca = P.sacaLado; sub = `${N}-${N} · ¡TIE-BREAK A 7!`; }\n"
         "  }\n", 'm3')
m3 = rep(m3, "/* Falta en el primer saque:",
         "/* Set terminado: si alguien llega a los sets que hacen falta se acaba el partido; si no, empieza otro */\n"
         "function cerrarSet(ganador){\n"
         "  const yo = ganador === 0, marcador = P.juegos.slice();\n"
         "  P.marcadorSets.push(marcador); P.setsG[ganador]++;\n"
         "  if(P.setsG[ganador] >= P.setsGanar){ P.acabado = true; return yo ? '¡PARTIDO PARA VOSOTROS!' : 'SE ACABÓ'; }\n"
         "  P.juegos = [0, 0];\n"
         "  return `SET PARA ${yo ? 'VOSOTROS' : 'ELLOS'} · ${marcador[0]}-${marcador[1]} · SETS ${P.setsG[0]}-${P.setsG[1]}`;\n"
         "}\n"
         "function formatoTexto(sets, juegos, corto){\n"
         "  if(corto) return `${sets === 3 ? 'al mejor de 3 sets' : '1 set'} a ${juegos} juegos`;\n"
         "  return `${sets === 3 ? 'Al mejor de 3 sets' : 'A 1 set'} de ${juegos} juegos, con 2 de ventaja y tie-break a 7 si llegáis a ${juegos}-${juegos}`;\n"
         "}\n"
         "function marcadorPartido(){\n"
         "  return P.marcadorSets.map(s => s.join('-')).concat([P.juegos.join('-') + (P.tb ? ` (TB ${P.puntos[0]}-${P.puntos[1]})` : '')]).join(' · ');\n"
         "}\n"
         "/* Falta en el primer saque:", 'm3')
m3 = rep(m3, "const res = { gano: P.momento ? P.finMomento === 0 : P.juegos[0] > P.juegos[1], juegos: P.juegos.slice(),",
         "const res = { gano: P.momento ? P.finMomento === 0 : P.setsG[0] > P.setsG[1], sets: P.marcadorSets.slice(), juegos: P.juegos.slice(),", 'm3')
m3 = rep(m3, "  let gano;\n", "  let gano, sets = [];\n", 'm3')
m3 = rep(m3, "  else {\n    let tb = P.tb, fin = P.acabado;\n    for(let g = 0; !fin && g < 2000; g++){\n      if(Math.random() < pr) pu[0]++; else pu[1]++;\n"
             "      const w = pu[0] > pu[1] ? 0 : 1;\n"
             "      if(tb){ if(pu[w] >= 7 && pu[w] - pu[1-w] >= 2){ jg[w]++; fin = true; } continue; }\n"
             "      if(pu[w] < 4) continue;\n"
             "      jg[w]++; pu[0] = pu[1] = 0;\n"
             "      if(P.set){ const a = jg[w], o = jg[1-w]; if((a >= 6 && a - o >= 2) || a >= 7) fin = true; else if(a === 6 && o === 6) tb = true; }\n"
             "      else if(jg[w] >= N) fin = true;\n    }\n    gano = jg[0] > jg[1];\n  }",
         "  else {\n    let tb = P.tb, fin = P.acabado;\n    const sg = P.setsG.slice();\n    sets = P.marcadorSets.slice();\n"
         "    for(let g = 0; !fin && g < 6000; g++){\n      if(Math.random() < pr) pu[0]++; else pu[1]++;\n"
         "      const w = pu[0] > pu[1] ? 0 : 1;\n"
         "      let setGanado = false;\n"
         "      if(tb){ if(pu[w] < 7 || pu[w] - pu[1-w] < 2) continue; jg[w]++; tb = false; setGanado = true; }\n"
         "      else { if(pu[w] < 4) continue; jg[w]++; const a = jg[w], o = jg[1-w]; if(a >= N && a - o >= 2) setGanado = true; else if(a === N && o === N) tb = true; }\n"
         "      pu[0] = pu[1] = 0;\n"
         "      if(setGanado){ sets.push(jg.slice()); sg[w]++; if(sg[w] >= P.setsGanar) fin = true; else jg[0] = jg[1] = 0; }\n"
         "    }\n    gano = sg[0] > sg[1];\n  }", 'm3')
m3 = rep(m3, "cb({ gano, juegos: jg, puntos: pu, stats: st, simulado:true });", "cb({ gano, sets, juegos: jg, puntos: pu, stats: st, simulado:true });", 'm3')
m3 = rep(m3, "${P.momento ? textoPuntos(P.puntos) : P.juegos[0] + ' – ' + P.juegos[1] + (P.tb ? ' · TB ' + P.puntos[0] + '-' + P.puntos[1] : '')}",
         "${P.momento ? textoPuntos(P.puntos) : marcadorPartido()}", 'm3')
m3 = rep(m3, "${P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : P.set ? 'Un set a 6 juegos, con tie-break a 7 si llegáis a 6-6' : 'A ' + P.juegosGanar + ' juegos'}",
         "${P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : formatoTexto(P.setsGanar === 2 ? 3 : 1, P.juegosGanar)}", 'm3')
m3 = rep(m3, "  const txt = [P.cfg.rotulo, P.tb ? 'TIE-BREAK'",
         "  const txt = [P.cfg.rotulo, !P.momento && P.setsGanar === 2 ? `SET ${P.marcadorSets.length + 1} · ${P.setsG[0]}-${P.setsG[1]}` : '', P.tb ? 'TIE-BREAK'", 'm3')
escribir('c-motor3.js', m3)

c = leer('c-carrera.js')
c = rep(c, "  const j = S.j && !S.j.retirado ? S.j : null, arq = pick(ARQUETIPOS);\n  iniciarPartidoPista({",
        "  const j = S.j && !S.j.retirado ? S.j : null, arq = pick(ARQUETIPOS);\n"
        "  const juegos = [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3, sets = PREF.sets === 3 ? 3 : 1, posicion = j ? j.posicion : (PREF.posicion || 'reves');\n"
        "  iniciarPartidoPista({", 'c')
c = rep(c, "    carril: j && j.posicion === 'drive' ? 'der' : 'izq', juegos: PREF.juegos || 3, pPunto: .5, rapido: true,\n"
           "    titulo: 'PARTIDO RÁPIDO', subtitulo: `${(PREF.juegos || 3) >= 6 ? 'un set con tie-break' : 'a ' + (PREF.juegos || 3) + ' juegos'} · juegan a ${arq.nom}`, rotulo: '',",
        "    carril: posicion === 'drive' ? 'der' : 'izq', juegos, sets, pPunto: .5, rapido: true,\n"
        "    titulo: 'PARTIDO RÁPIDO', subtitulo: `${formatoTexto(sets, juegos, true)} · juegan a ${arq.nom}`, rotulo: '',", 'c')
escribir('c-carrera.js', c)

v = leer('c-vistas.js')
a = v.index('function segJuegos(){'); b = v.index('\n}\n', a) + 3
v = v[:a] + r'''function segJuegos(){
  const actual = [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3;
  return `<div class="seg">${[3,4,6].map(n => `<button class="${actual === n ? 'on' : ''}" onclick="PREF.juegos=${n};guardarPref();render()">${n}</button>`).join('')}</div>`;
}
function segSets(){
  const actual = PREF.sets === 3 ? 3 : 1;
  return `<div class="seg">${[[1,'1 SET'],[3,'MEJOR DE 3']].map(([n, t]) => `<button class="${actual === n ? 'on' : ''}" onclick="PREF.sets=${n};guardarPref();render()">${t}</button>`).join('')}</div>`;
}
/* El formato del partido rápido: juegos por set, cuántos sets y tu posición */
function formatoPartidoHTML(){
  const j = S.j && !S.j.retirado ? S.j : null, sets = PREF.sets === 3 ? 3 : 1, juegos = [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3;
  const pos = j ? j.posicion : (PREF.posicion || 'reves');
  return `<div class="card"><div class="eyebrow">🎾 FORMATO DEL PARTIDO RÁPIDO</div><div style="height:2px"></div>
    <div class="li"><div class="g"><b>Juegos por set</b><span>Con 2 de ventaja; a ${juegos}-${juegos}, tie-break a 7</span></div>${segJuegos()}</div>
    <div class="li"><div class="g"><b>Sets</b><span>${sets === 3 ? 'Gana quien se lleve 2 sets' : 'Un solo set'}</span></div>${segSets()}</div>
    <div class="li"><div class="g"><b>Tu posición</b><span>${j ? 'La de tu carrera' : 'Siempre juegas en tu lado, también cuando sacas desde el otro'}</span></div>${j
      ? `<span class="pill">${pos === 'drive' ? 'DRIVE' : 'REVÉS'}</span>` : segPref('posicion', [['drive','DRIVE'],['reves','REVÉS']])}</div>
    <p class="muted" style="margin:8px 0 0">${formatoTexto(sets, juegos)}. Jugáis ${pos === 'drive' ? 'de <b style="color:var(--text)">drive</b> (lado derecho)' : 'de <b style="color:var(--text)">revés</b> (lado izquierdo)'} todo el partido.</p>
  </div>`;
}
''' + v[b:]
v = rep(v, "  <div class=\"card\"><div class=\"li\" style=\"border:0;padding:0\"><div class=\"g\"><b>Partido rápido</b><span>A cuántos juegos, o un set entero con tie-break</span></div>${segJuegos()}</div></div>",
        "  ${formatoPartidoHTML()}", 'v')
v = rep(v, "      <button class=\"btn ghost sm\" onclick=\"S.volverComo='inicio';S.pantalla='como';render()\">🎮 CONTROLES</button>\n    </div>\n  </div>`;\n}",
        "      <button class=\"btn ghost sm\" onclick=\"S.volverComo='inicio';S.pantalla='como';render()\">🎮 CONTROLES</button>\n    </div>\n  </div>\n  ${formatoPartidoHTML()}`;\n}", 'v')
v = rep(v, "<p class=\"sub\" style=\"margin:0\">${r.juegos[0]} – ${r.juegos[1]} en juegos${s.orosJ?` · ${s.orosG}/${s.orosJ} puntos de oro`:''}</p>",
        "<p class=\"sub\" style=\"margin:0\">${(r.sets && r.sets.length ? r.sets : [r.juegos]).map(x => x[0] + '-' + x[1]).join(' · ')}${r.sets && r.sets.length > 1 ? ' en sets' : ''}${s.orosJ?` · ${s.orosG}/${s.orosJ} puntos de oro`:''}</p>", 'v')
v = rep(v, "<div><div class=\"eyebrow\">POR 3</div><div class=\"title-lg\">${s.porTres}</div></div>",
        "<div><div class=\"eyebrow\">POR 3 · POR 4</div><div class=\"title-lg\">${s.porTres}</div></div>", 'v')
v = rep(v, "  <button class=\"btn\" onclick=\"partidoRapido()\">REVANCHA</button><div style=\"height:8px\"></div>",
        "  ${formatoPartidoHTML()}\n  <button class=\"btn\" onclick=\"partidoRapido()\">REVANCHA</button><div style=\"height:8px\"></div>", 'v')
escribir('c-vistas.js', v)
print('patch12: posiciones fijas y sets a 3, 4 o 6 juegos, a 1 o 3 sets')
