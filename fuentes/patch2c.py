import sys
# Cuarta pasada sobre el archivo montado (código de la v1): las carreras guardadas.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b):
    global s
    c = s.count(a)
    assert c == 1, 'esperaba 1 y hay %d: %s' % (c, a[:90])
    s = s.replace(a, b)

def tramo(desde, hasta, nuevo):
    global s
    assert s.count(desde) == 1 and s.count(hasta) == 1, 'tramo no único: %s' % desde[:90]
    a = s.index(desde); b = s.index(hasta, a) + len(hasta)
    s = s[:a] + nuevo + s[b:]

# guardar: además del hueco de siempre, la carrera va a su propio hueco
rep("""function guardar(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify({j:S.j, cal:S.cal, trim:S.trim, torneo:S.torneo})); }catch(e){}""",
"""function guardar(){
  try{
    if(S.j && !S.j.idCarrera) S.j.idCarrera = nuevoIdCarrera();
    const txt = JSON.stringify({j:S.j, cal:S.cal, trim:S.trim, torneo:S.torneo});
    localStorage.setItem(SAVE_KEY, txt);
    guardarEnCarrera(S.j, txt);          // y a la lista de MIS CARRERAS
  }catch(e){}""")

# la pantalla nueva
rep("  else if(p==='finEntreno')   html += vFinEntreno();",
    "  else if(p==='finEntreno')   html += vFinEntreno();\n  else if(p==='carreras')     html += vCarreras();")

# la portada: continuar, mis carreras y empezar otra sin borrar la anterior
tramo("  ${save && save.j ? `<button class=\"btn\" onclick=\"continuarPartida()\">CONTINUAR:",
      ": `<button class=\"btn\" onclick=\"irCrear()\">EMPEZAR MI CARRERA</button>`}",
"""  ${save && save.j ? `<button class="btn" onclick="continuarPartida()">CONTINUAR: ${esc(String(save.j.nombre).toUpperCase())} · ${save.j.ranking?'#'+save.j.ranking:'SIN RANKING'}</button>`
          : `<button class="btn" onclick="irCrear()">EMPEZAR MI CARRERA</button>`}
  <div style="height:8px"></div>
  <div class="row">
    <button class="btn ghost sm" onclick="abrirCarreras('inicio')">${ico('carpeta')} MIS CARRERAS · ${listaCarreras().length}</button>
    ${save && save.j ? `<button class="btn ghost sm" onclick="nuevaCarreraLista()">${ico('mas')} NUEVA CARRERA</button>` : ''}
  </div>""")

# empezar una carrera nueva sin perder la de antes
rep("""  CFG.error = null;
  CFG.nombre = n;
  const j = nuevoJugador(CFG);""",
"""  CFG.error = null;
  CFG.nombre = n;
  asegurarCarreras();                    // la carrera que había queda guardada en su hueco
  const j = nuevoJugador(CFG);
  j.idCarrera = nuevoIdCarrera();""")

# continuar: las partidas viejas entran en la lista
rep("function continuarPartida(){\n  const d = cargar();", "function continuarPartida(){\n  asegurarCarreras();\n  const d = cargar();")

# al retirarte, la carrera queda en la lista
rep("""<button class="btn sm" onclick="borrarSave();S.j=null;S.pantalla='inicio';render()">EMPEZAR OTRA CARRERA</button>""",
    """<button class="btn sm" onclick="soltarCarrera()">EMPEZAR OTRA CARRERA</button>""")

open(p, 'w', encoding='utf-8').write(s)
print('cuarta pasada aplicada')

# ── el cuadro del Major con el estilo nuevo (código de la v1) ──
s = open(p, encoding='utf-8').read()
rep("""  <div class="card" style="background:linear-gradient(160deg,rgba(245,197,66,.14),transparent 62%);border-color:rgba(245,197,66,.28)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div style="min-width:0">
        <div class="eyebrow">MAJOR · CUARTOS DE FINAL</div>
        <div class="title-lg" style="margin:5px 0 4px">${esc(c.ev.nom)}</div>
      </div>
      ${pastillaPista(c.ev.pista)}
    </div>""",
"""  <div class="card momento-cab">
    <div class="momento-top">${emblemaSede(c.ev)}<div style="min-width:0;flex:1"><div class="eyebrow">MAJOR · CUARTOS DE FINAL</div><div class="momento-ev">${esc(c.ev.nom)}</div></div>${pastillaPista(c.ev.pista)}</div>
    <div class="momento-tit">${ico('camino')}<span>EL CUADRO</span></div>""")
rep("""      <span style="font-size:20px">${c.vidas>0?'🛡️':'💀'}</span>""",
    """      <span class="vida-ico ${c.vidas>0?'':'sin'}">${ico('escudo')}</span>""")
rep("""      h += `<div class="prob" style="margin-top:9px">
        <span class="barra"><i style="width:${pc}%"></i></span>
        <span class="cifra" style="color:${col}">${pc}% de pasar</span>
      </div>""", """      h += `<div style="height:11px"></div>${probTV(pc, 'de pasar')}""")
rep("""${c.vidas>0?` · 🛡️ ${c.vidas} bola""", """${c.vidas>0?` · ${ico('escudo')} ${c.vidas} bola""")
rep("""      if(avisoVivo) h += `<div class="log" style="margin:8px 0 0">🧠 Tu <b>Mental""", """      if(avisoVivo) h += `<div class="log" style="margin:8px 0 0">${ico('mente')} Tu <b>Mental""")
rep("""${c.gano ? (c.rondas.length < 3 ? '🎾 ¡A LA FINAL!' : gx('🏆 ¡CAMPEÓN!','🏆 ¡CAMPEONA!')) : '😖 SE ACABÓ'}""",
    """${c.gano ? (c.rondas.length < 3 ? '¡A LA FINAL!' : gx('¡CAMPEÓN!','¡CAMPEONA!')) : 'SE ACABÓ'}""")
open(p, 'w', encoding='utf-8').write(s)
print('cuadro del Major con estilo nuevo')

# ── el Mundial de Selecciones: su pantalla, el evento viejo fuera y el cierre del trimestre ──
s = open(p, encoding='utf-8').read()
rep("  else if(p==='carreras')     html += vCarreras();", "  else if(p==='carreras')     html += vCarreras();\n  else if(p==='mundialSel')   html += vMundialSel();")
rep("{id:'mundial_convocatoria', peso:6, repetible:true, cond:j=>j.ranking && j.ranking<=200 && j.anio>=2,",
    "{id:'mundial_convocatoria', peso:6, repetible:true, cond:j=>false,          // ahora el Mundial es un torneo cada dos años")
rep("function pasarTrimestre(){\n  const j = S.j;\n", "function pasarTrimestre(){\n  mundialPendiente();                    // el Mundial no se queda a medias\n  const j = S.j;\n")
open(p, 'w', encoding='utf-8').write(s)
print('mundial conectado')

# ── el desafío del día: en la portada y su pantalla ──
s = open(p, encoding='utf-8').read()
rep("  else if(p==='mundialSel')   html += vMundialSel();", "  else if(p==='mundialSel')   html += vMundialSel();\n  else if(p==='desafio')      html += vDesafio();")
rep("  ${heroInicioHTML(save)}\n", "  ${heroInicioHTML(save)}\n  ${desafioHTML()}\n")
open(p, 'w', encoding='utf-8').write(s)
print('desafío conectado')

# ── más dificultad en todo el modo carrera, y el modo El Ídolo ──
s = open(p, encoding='utf-8').read()
rep("""  facil:   { nom:'Fácil',   rival:12, cal:.1,  alcance:.16, sim:5.5, eleccion:.16, ayuda:{FIP1:12, FIP2:10, FIP3:6, FIP4:3}, rafaga:.1, rafagaMs:400, d:'Lo más fácil: rivales lentos, más caminos buenos y más partidos ganados.' },
  normal:  { nom:'Normal',  rival:8,  cal:.07, alcance:.1,  sim:4,   eleccion:.12, ayuda:{FIP1:9, FIP2:7, FIP3:4, FIP4:2}, rafaga:.06, rafagaMs:220, d:'Asequible: si juegas con cabeza, ganas torneos.' },
  dificil: { nom:'Difícil', rival:0,  cal:.02, alcance:.03, sim:2.5, eleccion:.06, ayuda:{}, rafaga:.01, rafagaMs:0, d:'Como el circuito de verdad: cada título cuesta muchísimo.' },""",
"""  facil:   { nom:'Fácil',   rival:12, cal:.1,  alcance:.16, sim:7.5, eleccion:.17, ayuda:{FIP1:5, FIP2:3.5, FIP3:2, FIP4:1}, rafaga:.1, rafagaMs:400, d:'Lo más llevadero: rivales lentos, más caminos buenos y más partidos ganados.' },
  normal:  { nom:'Normal',  rival:8,  cal:.07, alcance:.1,  sim:5.8, eleccion:.142, ayuda:{FIP1:1.35, FIP2:.7, FIP3:0, FIP4:0}, rafaga:.06, rafagaMs:220, d:'Exigente: de joven se sufre, el primer título tarda y el número 1 es de unos pocos.' },
  dificil: { nom:'Difícil', rival:0,  cal:.02, alcance:.03, sim:3.8, eleccion:.09, ayuda:{}, rafaga:.01, rafagaMs:0, d:'Como el circuito de verdad: cada título es una hazaña.' },""")
rep("const difActual = () => DIFICULTADES[PREF.dificultad] || DIFICULTADES.normal;",
"""let DIF_CACHE = { k:null, v:null };
function difActual(){
  const base = DIFICULTADES[PREF.dificultad] ? PREF.dificultad : 'normal', idolo = esIdolo(), k = base + (idolo ? '|idolo' : '');
  if(DIF_CACHE.k === k) return DIF_CACHE.v;
  const D = DIFICULTADES[base];
  /* en El Ídolo todo aprieta un punto más: menos ventaja al simular, rivales más duros y cero ayudas */
  const v = idolo ? Object.assign({}, D, { nom: D.nom + ' · Ídolo', sim: D.sim - IDOLO_DUREZA.sim, eleccion: Math.max(0, D.eleccion - IDOLO_DUREZA.eleccion),
                                           rival: Math.max(0, D.rival - IDOLO_DUREZA.rival), ayuda: {} }) : D;
  DIF_CACHE = { k, v };
  return v;
}""")
# el ranking: la cima está más lejos (y más todavía en El Ídolo)
rep("  if(edad<20) return (-1.2 + (edad-17)*0.4) * (1 - prec);",
    "  if(edad<21) return (-3.1 + (edad-17)*0.8) * (1 - prec);   /* de 17 a 20 se sufre de verdad */")
rep("const ESCALA_RK = 1.0;", "const ESCALA_RK = 1.34;")
rep("  pts = pts / ESCALA_RK;", "  pts = pts / (ESCALA_RK * (esIdolo() ? IDOLO_DUREZA.escala : 1));")
# se crece más despacio
rep("  let tasa = j.edad<=20 ? .11 : j.edad<=23 ? .12 : j.edad<=27 ? .10 : j.edad<=31 ? .06 : 0;",
    "  let tasa = j.edad<=20 ? .05 : j.edad<=23 ? .135 : j.edad<=27 ? .115 : j.edad<=31 ? .07 : 0;\n  if(j.modo === 'idolo') tasa *= IDOLO_DUREZA.tasa;")
rep("  let libres = j.edad<=20 ? 10 : j.edad<=24 ? 8 : j.edad<=29 ? 6 : 4;",
    "  let libres = j.edad<=20 ? 3 : j.edad<=24 ? 9 : j.edad<=29 ? 7 : 4;\n  if(j.modo === 'idolo') libres = Math.max(2, libres - IDOLO_DUREZA.libres);")
# fechas como número 1, para las metas de leyenda
rep("function pasarTrimestre(){\n  mundialPendiente();", "function pasarTrimestre(){\n  if(S.j && S.j.ranking === 1) S.j.trimN1 = (S.j.trimN1 || 0) + 1;      // fechas aguantando en lo más alto\n  mundialPendiente();")
# el modo se aplica al crear la carrera y se guarda al retirarte
rep("  S.pantalla = 'temporada';\n  guardar(); render();\n}\n\nfunction continuarPartida(){", "  S.pantalla = 'temporada';\n  arrancarIdolo();\n  guardar(); render();\n}\n\nfunction continuarPartida(){")
rep("    retiro = true; j.retirado = true;", "    retiro = true; j.retirado = true; cerrarIdolo(j);")
rep("  if(j.retirado) S.legado = calcularLegado(j);", "  if(j.retirado){ S.legado = calcularLegado(j); cerrarIdolo(j); }")
# la pantalla del Ídolo y su tarjeta en la portada
rep("  else if(p==='desafio')      html += vDesafio();", "  else if(p==='desafio')      html += vDesafio();\n  else if(p==='idolo')        html += vIdolo();")
rep("  ${desafioHTML()}\n", "  ${desafioHTML()}\n  ${idoloHTML()}\n")
# al retirarte: tu marca de Ídolo y la tabla
rep("""function vRetiro(){
  const j = S.j, L = S.legado || calcularLegado(j);
  const g = agruparTitulos(j.titulos);
  return `<div class="fade">""",
"""function vRetiro(){
  const j = S.j, L = S.legado || calcularLegado(j);
  const g = agruparTitulos(j.titulos);
  const idolo = j.modo === 'idolo' ? (function(){ const p = puntajeIdolo(j), lista = leerIdolos();
    return `<div class="card idolo-hero">
      <div class="des-top"><div class="eyebrow">${ico('estrella')} EL ÍDOLO</div>${S.idoloPuesto ? `<span class="idolo-rec">#${S.idoloPuesto} de tus carreras</span>` : ''}</div>
      <div class="title-xl" style="margin:6px 0 4px">${p.pts} PUNTOS</div>
      <p class="sub" style="margin:0">${p.metas} de ${METAS_IDOLO.length} metas de leyenda cumplidas.</p>
    </div>` + tablaIdolosHTML(lista); })() : '';
  return `<div class="fade">${idolo}""")
open(p, 'w', encoding='utf-8').write(s)
print('dificultad + modo Ídolo')
