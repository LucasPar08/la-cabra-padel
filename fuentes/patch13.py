import os
# Apuntar el golpe, salida de pista, entrenamiento, ranking con nombre e historial, pareja por torneo, material,
# partidos enteros en la pista, tu jugador a tu gusto y ambiente de pabellón (el código nuevo está en c-extra.js).
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)
def rep(s, a, b, nombre):
    c = s.count(a); assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:110]); return s.replace(a, b)
def tramo(s, desde, hasta, nuevo, nombre):
    a = s.index(desde); b = s.index(hasta, a)
    return s[:a] + nuevo + s[b:]

# ═════════════ motor 1 ═════════════
m1 = leer('c-motor1.js')
m1 = rep(m1, "posicion:'reves', tutorial:false,", "posicion:'reves', aspecto:{ camiseta:'#DCF54A', pala:'#0F1C22', zurdo:false }, records:{}, tutorial:false,", 'm1')
m1 = rep(m1, "function leerPref(){ try{ return Object.assign({}, PREF_BASE, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); }catch(e){ return Object.assign({}, PREF_BASE); } }",
         "function leerPref(){\n  let p;\n  try{ p = Object.assign({}, PREF_BASE, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); }catch(e){ p = Object.assign({}, PREF_BASE); }\n"
         "  p.aspecto = Object.assign({}, PREF_BASE.aspecto, p.aspecto || {}); p.records = Object.assign({}, p.records || {});\n  return p;\n}", 'm1')
m1 = rep(m1, "  return {\n    desbloquear: listo,",
         "  /* aplausos de verdad: cientos de palmadas cortas repartidas en el tiempo */\n"
         "  function aplausos(dur, fuerza){\n"
         "    const c = listo(); if(!c) return;\n"
         "    const n = Math.floor(c.sampleRate*dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);\n"
         "    for(let k = 0, palmadas = Math.floor(dur*140*fuerza); k < palmadas; k++){\n"
         "      const t0 = Math.floor(Math.random()*n*.9), largo = Math.floor(c.sampleRate*(.006 + Math.random()*.012)), amp = .25 + Math.random()*.75;\n"
         "      for(let i = 0; i < largo && t0 + i < n; i++) d[t0 + i] += (Math.random()*2 - 1)*amp*Math.exp(-i/(largo*.28));\n"
         "    }\n"
         "    for(let i = 0; i < n; i++) d[i] *= Math.min(1, i/(n*.06))*Math.min(1, (n - i)/(n*.4));\n"
         "    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();\n"
         "    s.buffer = buf; fl.type = 'highpass'; fl.frequency.value = 650; g.gain.value = .22*fuerza;\n"
         "    s.connect(fl).connect(g).connect(c.destination); s.start();\n"
         "  }\n"
         "  return {\n    desbloquear: listo,", 'm1')
m1 = rep(m1, "    grada:  () => ruido(1.0, 650, .22),",
         "    grada:  () => aplausos(1.5, .8),\n"
         "    ovacion:() => { aplausos(2.8, 1.1); tono(220, .6, 'sawtooth', .02, 200); },\n"
         "    fanfarria: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => { tono(f, .24, 'triangle', .12); tono(f/2, .24, 'sine', .05); }, i*150)),", 'm1')
m1 = rep(m1, "    const r = sim ? simBote(b) : regla(b, 'bote'); if(r) return r;\n  }\n  if(b.x < R_BOLA || b.x > W - R_BOLA){",
         "    const r = sim ? simBote(b) : regla(b, 'bote'); if(r) return r;\n  }\n"
         "  /* devuelta desde fuera de la pista: no choca con la malla hasta que vuelve a entrar por encima */\n"
         "  if(b.fueraPista){ if(b.x > R_BOLA && b.x < W - R_BOLA && b.y > R_BOLA && b.y < L - R_BOLA) b.fueraPista = false; else return null; }\n"
         "  if(b.x < R_BOLA || b.x > W - R_BOLA){", 'm1')
m1 = rep(m1, "    b.botes++;\n    if(b.saque && b.botes === 1){",
         "    b.botes++;\n    if(P.drill && pega === 0 && b.botes === 1) return finDrill(evaluarDrill(b));     // entrenamiento: se mira dónde bota tu golpe\n"
         "    if(b.saque && b.botes === 1){", 'm1')
m1 = rep(m1, "    if(b.cruzo && b.botes >= 1 && ladoDe(b.y) === recibe) return terminar(pega, extra === 'fondo' ? '¡Por 4!' : '¡Por 3!', {porTres:true});",
         "    if(b.cruzo && b.botes >= 1 && ladoDe(b.y) === recibe){\n"
         "      if(extra !== 'fondo' && intentarSalida(b, recibe)) return 'salida';     // por el lateral se puede salir a buscarla\n"
         "      return terminar(pega, extra === 'fondo' ? '¡Por 4!' : '¡Por 3!', {porTres:true});\n    }", 'm1')
m1 = rep(m1, "  if(b.saque && ganador !== b.golpeo && FALTAS_SAQUE.includes(motivo)){",
         "  if(!P.drill && b.saque && ganador !== b.golpeo && FALTAS_SAQUE.includes(motivo)){", 'm1')
escribir('c-motor1.js', m1)

# ═════════════ motor 2 ═════════════
m2 = leer('c-motor2.js')
m2 = rep(m2, "function golpear(j, tipo, calidad, apuntarX){", "function golpear(j, tipo, calidad, apuntarX, prof){", 'm2')
m2 = rep(m2, "  let d = clamp(rnd(T.dist[0], T.dist[1]) + gauss()*disp*.5, .8, 9.5);",
         "  /* con el joystick se elige la profundidad: arriba, al fondo; abajo, corta */\n"
         "  const largo = prof > 0 && tipo !== 'dejada' && tipo !== 'chiquita' ? T.dist[1] + .5 : prof < 0 ? Math.max(1.2, T.dist[0] - 1) : rnd(T.dist[0], T.dist[1]);\n"
         "  let d = clamp(largo + gauss()*disp*.5, .8, 9.5);", 'm2')
m2 = rep(m2, "  const pFallo = clamp((.02 + Math.pow(1 - calidad, 2) * .4) * mf * (RIESGO_TIRO[tipo] || 1), .015, .55);",
         "  const aLaLinea = apuntarX != null && Math.abs(apuntarX - W/2) > 3.4 ? 1.25 : 1;          // apuntar pegado a la pared arriesga más\n"
         "  const pFallo = clamp((.02 + Math.pow(1 - calidad, 2) * .4) * mf * (RIESGO_TIRO[tipo] || 1) * aLaLinea, .015, .55);", 'm2')
m2 = rep(m2, "efecto: EFECTO_TIRO[tipo] || null, tocoRed:false,", "efecto: EFECTO_TIRO[tipo] || null, tocoRed:false, salioDePared: dePared,", 'm2')
m2 = rep(m2, "function aplicarMovimiento(j, dt){\n  j.x = clamp(j.x + j.vx*dt, .35, W - .35);\n",
         "function aplicarMovimiento(j, dt){\n  const m = j.fuera ? 2.4 : 0;                     // en una salida de pista se corre por fuera\n"
         "  j.x = clamp(j.x + j.vx*dt, .35 - m, W - .35 + m);\n", 'm2')
m2 = rep(m2, "  j.y = clamp(j.y + j.vy*dt, j.lado === 0 ? RED_Y + .45 : .35, j.lado === 0 ? L - .35 : RED_Y - .45);\n}",
         "  j.y = clamp(j.y + j.vy*dt, j.lado === 0 ? RED_Y + .45 : .35, j.lado === 0 ? L - .35 : RED_Y - .45);\n"
         "  if(j.fuera && j.x > .35 && j.x < W - .35 && P && P.estado !== 'salida') j.fuera = false;\n}", 'm2')
m2 = rep(m2, "  const eje = ejeMovimiento(), mov = Math.hypot(eje.x, eje.y) > .12;\n",
         "  const eje = ejeMovimiento(), mov = Math.hypot(eje.x, eje.y) > .12;\n"
         "  P.apunte = alcanzable(j) || j.swing > 0 ? apuntarHumano(j, eje) : null;       // la diana que se ve en la pista\n", 'm2')
m2 = rep(m2, "      golpear(j, tipo, cal, Math.abs(eje.x) > .3 ? 5 + eje.x*3.7 : null);",
         "      const ap = apuntarHumano(j, eje);\n      golpear(j, tipo, cal, ap ? ap.tx : null, ap ? ap.prof : 0);", 'm2')
m2 = rep(m2, "      else if(tipo !== 'drive' && tipo !== 'volea') Efectos.texto(j.x, j.y - .9, NOMBRE_GOLPE[tipo], COLOR_GOLPE[tipo]);",
         "      else if(tipo !== 'drive' && tipo !== 'volea') Efectos.texto(j.x, j.y - .9, NOMBRE_GOLPE[tipo], COLOR_GOLPE[tipo]);\n"
         "      else if(ap && ap.nombre) Efectos.texto(j.x, j.y - .9, ap.nombre, '#F4F6F8');", 'm2')
m2 = rep(m2, "  const comp = P.jug.find(o => o.lado === j.lado && o.id !== j.id);\n",
         "  const comp = P.jug.find(o => o.lado === j.lado && o.id !== j.id);\n  if(!comp || comp.inactivo) return true;\n", 'm2')
m2 = rep(m2, "  if(j.cd <= 0 && alcanzable(j)) decidirIA(j);", "  if(j.cd <= 0 && !j.noGolpea && alcanzable(j)) decidirIA(j);", 'm2')
escribir('c-motor2.js', m2)

# ═════════════ motor 3 ═════════════
m3 = leer('c-motor3.js')
m3 = rep(m3, "crearJugador(0, 0, carril, true,  Object.assign({ color:'#DCF54A' }, H,",
         "crearJugador(0, 0, carril, true,  Object.assign({ color: aspectoJugador().camiseta, colorPala: aspectoJugador().pala, zurdo: zurdoActual() }, H,", 'm3')
m3 = rep(m3, "  Efectos.reset();\n  if(hayDOM){ mostrarJuego();",
         "  Efectos.reset();\n"
         "  if(cfg.drill){ P.drill = Object.assign({ intentos:0, aciertos:0 }, cfg.drill); P.jug[1].inactivo = true; P.jug[3].inactivo = true; P.jug[2].noGolpea = true; }\n"
         "  if(hayDOM){ mostrarJuego();", 'm3')
m3 = rep(m3, "M ? 2.3 : 1.9); }\n  prepararSaque();\n}",
         "M ? 2.3 : 1.9); }\n  if(P.drill){ P.estado = 'drillPausa'; P.timer = 1.7; actualizarHUD(); } else prepararSaque();\n}", 'm3')
m3 = rep(m3, "    j.vx = j.vy = 0; j.swing = 0; j.cd = 0; j.anim = 0;\n  }\n  P.bola = Object.assign(nuevaBola(), { x:servidor.x",
         "    j.vx = j.vy = 0; j.swing = 0; j.cd = 0; j.anim = 0; j.fuera = false;\n  }\n  P.bola = Object.assign(nuevaBola(), { x:servidor.x", 'm3')
m3 = rep(m3, "function finPunto(ganador, motivo, extra){\n",
         "function finPunto(ganador, motivo, extra){\n"
         "  if(P.drill){ finDrill(false, ganador === 1 && !ERRORES_PUNTO.includes(motivo) ? 'No llegaste' : motivo); return; }\n", 'm3')
m3 = rep(m3, "  Sonido.punto(yo); if(extra.porTres || oro || P.finMomento !== null || P.acabado) Sonido.grada();",
         "  Sonido.punto(yo);\n"
         "  /* el público: aplaude los puntos buenos y los peloteos largos, y se viene arriba al final */\n"
         "  if(P.finMomento !== null || P.acabado){ Sonido.ovacion(); P.fiesta = 2.6; }\n"
         "  else if(extra.porTres || oro || P.rally >= 9 || /Por|Dejada|Remate|Víbora|Ace/.test(motivo) || sub.startsWith('SET')){ Sonido.grada(); P.fiesta = 1.5; }", 'm3')
m3 = tramo(m3, "function actualizar(dt){", "let ULTIMA_PISTA", r'''function actualizar(dt){
  if(!P || P.pausa || P.estado === 'fin') return;
  P.t += dt; if(P.timer > 0) P.timer -= dt; if(P.fiesta > 0) P.fiesta -= dt;
  if(P.estado === 'punto' || P.estado === 'falta' || P.estado === 'drillPausa'){
    Input.accion = null;
    for(const j of P.jug){ j.vx *= .9; j.vy *= .9; aplicarMovimiento(j, dt); if(j.anim > 0) j.anim -= dt; }
    if(P.timer <= 0){
      if(P.estado === 'drillPausa'){ if(P.drill.intentos >= P.drill.total) terminarPartidoPista(); else prepararDrill(); }
      else if(P.estado === 'falta') prepararSaque(true);
      else if(P.momento) (P.finMomento !== null ? terminarPartidoPista : prepararSaque)();
      else if(P.acabado) terminarPartidoPista();
      else prepararSaque();
    }
  } else if(P.estado === 'saque'){
    const s = P.jug[P.saqueDe];
    P.bola.z = .08 + Math.abs(Math.sin(P.t*4.4))*.62;           // bota la bola antes de sacar, como manda el reglamento
    if(s.humano && !P.humanoIA){ if(Input.accion || P.timer <= 0){ Input.accion = null; mostrarAyuda(''); sacar(s, .8 + .2*Math.random()); } }
    else if(P.timer <= 0){ mostrarAyuda(''); sacar(s, clamp(s.hab + .15 + gauss()*.08, .3, 1)); }
  } else if(P.estado === 'salida'){
    actualizarSalida(dt);
  } else {
    for(const j of P.jug) if(!j.inactivo) (j.humano ? actualizarHumano : actualizarIA)(j, dt);
    actualizarBola(dt);
  }
  Efectos.actualizar(dt);
}
''', 'm3')
m3 = rep(m3, "  if(!FONDO) pintarFondo();\n  c.drawImage(FONDO, 0, 0, innerWidth, innerHeight);\n",
         "  if(!FONDO) pintarFondo();\n  c.drawImage(FONDO, 0, 0, innerWidth, innerHeight);\n"
         "  publicoAnimado(c);\n  if(P.drill) dibujarZonaDrill(c);\n  if(P.apunte && P.estado === 'juego') dibujarApunte(c);\n", 'm3')
m3 = rep(m3, "  const cosas = P.jug.map(j => ({ y:j.y, pinta: () => dibujarFigura(c, j) }))",
         "  const cosas = P.jug.filter(j => !j.inactivo).map(j => ({ y:j.y, pinta: () => dibujarFigura(c, j) }))", 'm3')
m3 = rep(m3, "  const lado = j.lado === 0 ? 1 : -1, golpe = j.anim > 0 ? 1 - j.anim/.22 : 0;",
         "  const lado = (j.lado === 0 ? 1 : -1)*(j.zurdo ? -1 : 1), golpe = j.anim > 0 ? 1 - j.anim/.22 : 0;", 'm3')
m3 = rep(m3, "  c.fillStyle = '#0F1C22'; c.beginPath(); c.ellipse(px + lado*Math.cos(ang)*s*.12",
         "  c.fillStyle = j.colorPala || '#0F1C22'; c.beginPath(); c.ellipse(px + lado*Math.cos(ang)*s*.12", 'm3')
m3 = rep(m3, "function actualizarHUD(){\n  if(!hayDOM || !P) return;\n",
         "function actualizarHUD(){\n  if(!hayDOM || !P) return;\n"
         "  if(P.drill){\n"
         "    const d = P.drill;\n"
         "    $('#jgYo').textContent = d.aciertos; $('#jgEl').textContent = d.intentos - d.aciertos; $('#ptYo').textContent = '✓'; $('#ptEl').textContent = '✗';\n"
         "    $('#sacaYo').classList.remove('on'); $('#sacaEl').classList.remove('on');\n"
         "    const rot = $('#rotuloP'); rot.textContent = `🎯 ${DRILLS[d.id].nom.toUpperCase()} · ${Math.min(d.intentos + 1, d.total)}/${d.total} · OBJETIVO ${d.objetivo}`; rot.style.display = 'block';\n"
         "    return;\n  }\n", 'm3')
m3 = rep(m3, "const res = { gano: P.momento ? P.finMomento === 0 : P.setsG[0] > P.setsG[1], sets:",
         "const res = { gano: P.drill ? P.drill.aciertos >= P.drill.objetivo : P.momento ? P.finMomento === 0 : P.setsG[0] > P.setsG[1], drill: P.drill ? Object.assign({}, P.drill) : null, sets:", 'm3')
m3 = rep(m3, "function salirPista(){\n  if(P) P.pausa = false;\n  P = null; $('#pausaP').hidden = true; ocultarJuego();\n  S.pantalla = S.volverRapido || (S.j ? 'temporada' : 'inicio'); render();",
         "function salirPista(){\n  const eraEntreno = !!(P && P.drill);\n  if(P) P.pausa = false;\n  P = null; $('#pausaP').hidden = true; ocultarJuego();\n"
         "  S.pantalla = eraEntreno ? 'entreno' : S.volverRapido || (S.j ? 'temporada' : 'inicio'); render();", 'm3')
m3 = rep(m3, "${P.momento ? textoPuntos(P.puntos) : marcadorPartido()}", "${P.drill ? P.drill.aciertos + ' de ' + P.drill.intentos : P.momento ? textoPuntos(P.puntos) : marcadorPartido()}", 'm3')
m3 = rep(m3, "${P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : formatoTexto(",
         "${P.drill ? DRILLS[P.drill.id].como : P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : formatoTexto(", 'm3')
escribir('c-motor3.js', m3)

# ═════════════ carrera ═════════════
c = leer('c-carrera.js')
c = rep(c, "  return {\n    vel: (5 + .35*rel('fisico'))", "  return aplicarMaterial(j, {\n    vel: (5 + .35*rel('fisico'))", 'c')
c = rep(c, "    hab: .62 + .05*rel('mental'), reaccion: .16,\n  };\n}", "    hab: .62 + .05*rel('mental'), reaccion: .16,\n  });\n}", 'c')
c = rep(c, "  if(!S.trim || S.trim.clave !== clave)\n    S.trim = { clave,", "  if(!S.trim || S.trim.clave !== clave){\n    if(S.trim) evolucionarCircuito(j);          // el circuito se mueve de un trimestre al otro\n    S.trim = { clave,", 'c')
c = rep(c, "cerrado:false };\n  return S.trim;", "cerrado:false };\n  }\n  return S.trim;", 'c')
c = rep(c, "j.pareja ? Math.round(j.pareja.nivel) + '.' + Math.round(j.pareja.quimica) : '-'].join('|');",
        "j.pareja ? j.pareja.nombre + '.' + Math.round(j.pareja.nivel) + '.' + Math.round(j.pareja.quimica) : '-', j.material ? j.material.pala + '.' + j.material.zapas : 'club'].join('|');", 'c')
c = rep(c, "  if(!so.probs || so.clave !== clave){ calcularChances(j, ev, so, 0); so.clave = clave; guardar(); }",
        "  if(!so.probs || so.clave !== clave){\n"
        "    so.cache = so.cache || {};                    // una tabla por pareja/material: cambiar de opción no recalcula\n"
        "    const guardada = so.cache[clave];\n"
        "    if(guardada){ so.probs = guardada.probs; so.mj = guardada.mj; so.dif = guardada.dif; }\n"
        "    else { calcularChances(j, ev, so, 0); so.cache[clave] = { probs: so.probs, mj: so.mj, dif: so.dif }; }\n"
        "    so.clave = clave; guardar();\n  }", 'c')
c = rep(c, "      cuadro: [...Array(T.rondas)].map((_, k) => generarRival(ev.t, k, T.rondas)), mj:null,", "      cuadro: rivalesSinRepetir(ev.t, T.rondas), mj:null,", 'c')
c = rep(c, "  const so = chancesTorneo(j, ev, est.tipo);\n",
        "  const habitual = j.pareja, elegida = parejaElegida(j, ev);      // con la pareja elegida para este torneo\n"
        "  if(elegida !== habitual) j.pareja = elegida;\n"
        "  const so = chancesTorneo(j, ev, est.tipo), copia = JSON.parse(JSON.stringify(so));\n  delete copia.cache;\n", 'c')
c = rep(c, "sorteo: JSON.parse(JSON.stringify(so)) };", "sorteo: copia,\n               cambioPareja: elegida !== habitual, parejaHabitual: elegida !== habitual ? habitual : null };", 'c')
c = rep(c, "  to.partidos.push(res); to.ultimo = res;\n", "  to.partidos.push(res); to.ultimo = res;\n  anotarH2H(j, opp, res.gane);\n", 'c')
c = rep(c, "  to.fin = { r, rankAntes, logros };\n  if(!S.silencio){ guardar(); render(); }",
        "  to.fin = { r, rankAntes, logros };\n"
        "  /* vuelve tu pareja de siempre (y se nota un poco que se quedó en casa) */\n"
        "  if(to.cambioPareja){ j.pareja = to.parejaHabitual; if(j.pareja) j.pareja.quimica = clamp(j.pareja.quimica - 3, 0, 100); to.cambioPareja = false; }\n"
        "  if(r.campeon && !S.silencio){ Sonido.fanfarria(); Sonido.ovacion(); }\n"
        "  if(!S.silencio){ guardar(); render(); }", 'c')
escribir('c-carrera.js', c)

# ═════════════ vistas ═════════════
v = leer('c-vistas.js')
v = rep(v, "🎮 CONTROLES</button>\n  </div>\n  <div style=\"height:8px\"></div>\n  <div class=\"card mb0\">",
        "🎮 CONTROLES</button>\n  </div>\n  <div style=\"height:8px\"></div>\n"
        "  <div class=\"row\">\n"
        "    <button class=\"btn ghost sm\" onclick=\"S.pantalla='ranking';render()\">🏆 RANKING</button>\n"
        "    <button class=\"btn ghost sm\" onclick=\"abrirEntreno('temporada')\">🎯 ENTRENAR</button>\n"
        "    <button class=\"btn ghost sm\" onclick=\"S.volverDe='temporada';S.mercadoTab='material';S.pantalla='mercado';render()\">🏓 MATERIAL</button>\n"
        "  </div>\n  <div style=\"height:8px\"></div>\n  <div class=\"card mb0\">", 'v')
v = rep(v, "🎮 CONTROLES</button>\n    </div>\n  </div>\n  ${formatoPartidoHTML()}",
        "🎮 CONTROLES</button>\n      <button class=\"btn ghost sm\" onclick=\"abrirEntreno('inicio')\">🎯 ENTRENAR</button>\n    </div>\n  </div>\n  ${formatoPartidoHTML()}", 'v')
v = rep(v, "mueves a tu jugador (el amarillo, «TÚ») y eliges el golpe.</p></div>",
        "mueves a tu jugador (el que lleva «TÚ» encima), eliges el golpe y, al pegar, adónde va con el joystick.</p></div>\n\n  ${aspectoHTML()}", 'v')
v = rep(v, "  <button class=\"btn\" onclick=\"S.esperandoTecla=null;partidoRapido()\">⚡ PROBAR EN UN PARTIDO RÁPIDO</button><div style=\"height:8px\"></div>",
        "  <button class=\"btn\" onclick=\"S.esperandoTecla=null;partidoRapido()\">⚡ PROBAR EN UN PARTIDO RÁPIDO</button><div style=\"height:8px\"></div>\n"
        "  <button class=\"btn ghost\" onclick=\"S.esperandoTecla=null;abrirEntreno('como')\">🎯 ENTRENAMIENTO</button><div style=\"height:8px\"></div>", 'v')
v = rep(v, "🎾 FORMATO DEL PARTIDO RÁPIDO", "🎾 FORMATO DE LOS PARTIDOS EN LA PISTA", 'v')
v = rep(v, "todo el partido.</p>", "todo el partido. Vale para el partido rápido y para los partidos enteros de la carrera.</p>", 'v')
a = v.index("  const filas = ["); b = v.index("];\n", a) + 3
v = v[:b] + "  filas.push(['#F4F6F8','🕹️','APUNTAR', 'Al pegar, inclina el joystick: a un lado (paralelo o cruzado), arriba (al fondo) o abajo (corta). Una diana te marca adónde va.']);\n" + v[b:]
v = rep(v, "      const so = chancesTorneo(j, ev, est.tipo), tit = chanceTitulo(ev, so, null);\n",
        "      const parejasHTML = parejasTorneoHTML(j, ev, est.tipo);\n"
        "      const so = conPareja(j, parejaElegida(j, ev), () => chancesTorneo(j, ev, est.tipo)), tit = chanceTitulo(ev, so, null);\n"
        "      h += parejasHTML;\n", 'v')
v = rep(v, "' · te van a globear mucho' : ''}.</p>",
        "' · te van a globear mucho' : ''}.${h2hDe(j, opp.id) ? ` <b style=\"color:var(--text)\">⚔️ Historial: ${h2hDe(j, opp.id).g}-${h2hDe(j, opp.id).p}</b>` : opp.id ? ' Primera vez contra ellos.' : ''}</p>", 'v')
v = rep(v, "      <button class=\"btn\" onclick=\"jugarRonda()\">▶️ JUGAR ${rondaNom}</button><div style=\"height:8px\"></div>`;",
        "      <button class=\"btn\" onclick=\"jugarBotonRonda()\">${to.todoEnPista ? '🎾 JUGAR EN LA PISTA · ' : '▶️ JUGAR '}${rondaNom}</button><div style=\"height:8px\"></div>\n"
        "      <button class=\"btn ghost sm\" onclick=\"${to.todoEnPista ? 'jugarRonda()' : 'jugarPartidoEnPista()'}\">${to.todoEnPista ? '⏩ SIMULAR ESTE PARTIDO' : '🎾 JUGAR ESTE PARTIDO ENTERO EN LA PISTA'}</button>\n"
        "      <div class=\"li\" style=\"border:0;padding:9px 2px 6px\"><div class=\"g\"><b>Todos mis partidos en la pista</b><span>${formatoTexto(formatoCarrera().sets, formatoCarrera().juegos, true)} · el formato se cambia en Controles</span></div>"
        "<button class=\"tg ${to.todoEnPista ? 'on' : ''}\" aria-pressed=\"${!!to.todoEnPista}\" onclick=\"S.torneo.todoEnPista=!S.torneo.todoEnPista;guardar();render()\"><i></i></button></div>`;", 'v')
v = rep(v, "${u.clave ? (u.clave.forma === 'tiempo'", "${u.partidoEnPista ? ' · 🎾 jugado entero en la pista' : u.clave ? (u.clave.forma === 'tiempo'", 'v')
v = rep(v, "    <div class=\"title-xl\" style=\"margin:6px 0 8px\">${titular}</div>",
        "    ${r.campeon ? '<div class=\"trofeo-grande\">🏆</div>' : ''}\n    <div class=\"title-xl\" style=\"margin:6px 0 8px\">${titular}</div>", 'v')
escribir('c-vistas.js', v)

# ═════════════ estilos ═════════════
css = leer('c-css.txt') + '''
/* ranking */
.rk-fila{display:grid;grid-template-columns:38px 1fr auto;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--border)}
.card > .rk-fila:first-child{border-top:0}
.rk-fila .rk-n{font-weight:900;color:var(--muted);font-variant-numeric:tabular-nums}
.rk-fila .rk-nm{min-width:0;font-size:13px}
.rk-fila .rk-nm small{display:block;color:var(--muted);font-size:11px;margin-top:2px}
.rk-fila .rk-pt{font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}
.rk-fila.tu{background:rgba(220,245,74,.08);border-radius:10px;padding:8px 6px;border-top-color:transparent}
.rk-fila.tu .rk-n{color:var(--pelota)}
.rk-riv{display:inline-block;font-size:9px;font-weight:900;letter-spacing:.06em;color:#FF8A7A;border:1px solid rgba(255,138,122,.5);border-radius:6px;padding:0 5px;margin-left:3px;vertical-align:1px}
/* tu jugador */
.muestras{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.muestra{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.22);padding:0;cursor:pointer}
.muestra.on{border-color:#fff;box-shadow:0 0 0 2px var(--accent)}
.figura-prev{background:rgba(42,100,184,.35);border-radius:14px;padding:6px 8px;flex:none}
/* entrenamiento y celebraciones */
.estrellas{font-size:30px;letter-spacing:4px}
.trofeo-grande{font-size:76px;text-align:center;line-height:1;margin:6px 0 4px;animation:levantar 1.1s cubic-bezier(.2,1.4,.4,1) both,brillo 2.4s ease-in-out 1.1s infinite}
@keyframes levantar{0%{transform:translateY(40px) scale(.4) rotate(-12deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes brillo{0%,100%{filter:drop-shadow(0 0 0 rgba(245,197,66,0))}50%{filter:drop-shadow(0 0 18px rgba(245,197,66,.85))}}
@media (prefers-reduced-motion:reduce){.trofeo-grande{animation:none}}
'''
escribir('c-css.txt', css)

# ═════════════ montaje ═════════════
p1 = leer('patch.py')
p1 = rep(p1, "leer('c-carrera.js') + leer('c-vistas.js')", "leer('c-carrera.js') + leer('c-vistas.js') + leer('c-extra.js')", 'patch.py')
escribir('patch.py', p1)
p2 = leer('patch2.py')
FIN = "open(p, 'w', encoding='utf-8').write(s)\nprint('segunda pasada aplicada')"
assert p2.count(FIN) == 1 and 'rivalDelCircuito' not in p2
p2 = p2.replace(FIN, '''# pantallas nuevas: ranking y entrenamiento
rep("  else if(p==='mundial')      html += vMundial();", "  else if(p==='mundial')      html += vMundial();\\n  else if(p==='ranking')      html += vRanking();\\n  else if(p==='entreno')      html += vEntreno();\\n  else if(p==='finEntreno')   html += vFinEntreno();")
# el circuito con nombre: las 40 mejores parejas se repiten
rep("  return duplaRival(ri(rg[0], rg[1]));", "  return rivalDelCircuito(ri(rg[0], rg[1]));")
# el material suma nivel
rep("  if(tieneMejora(j,'video')) r += 1.2;", "  if(tieneMejora(j,'video')) r += 1.2;\\n  r += bonoEquipo(j);")
# mercado: pestaña de material
rep("onclick=\\"S.mercadoTab='vida';render()\\">VIDA</button>", "onclick=\\"S.mercadoTab='vida';render()\\">VIDA</button>\\n    <button class=\\"${tab==='material'?'on':''}\\" onclick=\\"S.mercadoTab='material';render()\\">MATERIAL</button>")
rep("  if(tab === 'equipo'){\\n    const sig = NIVELES_ENTRENADOR", "  if(tab === 'material') h += materialHTML(j);\\n\\n  if(tab === 'equipo'){\\n    const sig = NIVELES_ENTRENADOR")
# historial también en el cuadro del Major
rep("  if(S.torneo){ S.cuadro = null; return finMinijuegoTorneo(victorias, c.gano); }",
    "  c.rondas.forEach((r, k) => { if(k < c.actual || c.gano) anotarH2H(j, r.opp, true); else if(k === c.actual) anotarH2H(j, r.opp, false); });\\n  if(S.torneo){ S.cuadro = null; return finMinijuegoTorneo(victorias, c.gano); }")
# ficha: partido jugado entero en la pista
rep("${p.clave ? (p.clave.forma==='tiempo'", "${p.partidoEnPista ? ' · 🎾 PARTIDO EN LA PISTA' : p.clave ? (p.clave.forma==='tiempo'")

''' + FIN)
escribir('patch2.py', p2)
print('patch13: más carrera y más pista')
