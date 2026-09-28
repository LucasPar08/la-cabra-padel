import os
# Como en la tele: conecta c-look.js / c-look.css con el motor, la carrera, las vistas y el montaje.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)
def rep(s, a, b, nombre):
    c = s.count(a); assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:110]); return s.replace(a, b)
def cortar(s, desde, hasta, nombre, nuevo=''):
    a = s.index(desde); b = s.index(hasta, a) if hasta else len(s)
    return s[:a] + nuevo + s[b:]

# ── motor 3: el decorado y los jugadores pasan a c-look.js ──
m3 = leer('c-motor3.js')
m3 = cortar(m3, "function dibujarDecorado(c){", "function pintarFondo(){", 'm3')
m3 = cortar(m3, "/* Los jugadores, de cuerpo entero: piernas que corren", "function dibujarBola(c){", 'm3')
m3 = rep(m3, "  if(tipo === 'cristal'){\n    c.fillStyle = 'rgba(160,215,255,.09)'; c.fill();\n    c.strokeStyle = 'rgba(200,235,255,.5)'; c.lineWidth = 1.2; c.stroke();\n    return;\n  }",
         "  if(tipo === 'cristal'){\n    c.fillStyle = 'rgba(160,215,255,.09)'; c.fill();\n    c.strokeStyle = 'rgba(200,235,255,.5)'; c.lineWidth = 1.2; c.stroke();\n"
         "    /* reflejos de los focos en el cristal */\n"
         "    const qs = [proy(a[0], a[1], z0), proy(b[0], b[1], z0), proy(b[0], b[1], z1), proy(a[0], a[1], z1)], xs = qs.map(q => q[0]), ys = qs.map(q => q[1]);\n"
         "    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);\n"
         "    c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = Math.max(3, (x1 - x0)*.06);\n"
         "    for(const f of [.2, .58]){ c.beginPath(); c.moveTo(x0 + (x1 - x0)*f, y1); c.lineTo(x0 + (x1 - x0)*(f + .22), y0); c.stroke(); }\n"
         "    c.restore();\n    return;\n  }", 'm3')
m3 = rep(m3, "  P = { cfg, momento:M, finMomento:null,",
         "  P = { cfg, momento:M, finMomento:null, escena: cfg.escena || { tipo:'pabellon', gente:.8, ciudad:'' }, equipos: cfg.equipos || ['TÚ', 'RIVALES'],", 'm3')
m3 = rep(m3, "  if(P.drill){ finDrill(false, ganador === 1 && !ERRORES_PUNTO.includes(motivo) ? 'No llegaste' : motivo); return; }\n",
         "  if(P.drill){ finDrill(false, ganador === 1 && !ERRORES_PUNTO.includes(motivo) ? 'No llegaste' : motivo); return; }\n  P.ultimoGanador = ganador;            // para que festejen\n", 'm3')
m3 = rep(m3, "|| sub.startsWith('SET')){ Sonido.grada(); P.fiesta = 1.5; }",
         "|| sub.startsWith('SET')){ Sonido.grada(); P.fiesta = 1.5; }\n"
         "  if(!P.momento && !P.acabado && (P.puntosJugados % 6 === 0 || sub.startsWith('SET'))) setTimeout(mostrarEstadistica, 700);   // datos de la tele entre puntos", 'm3')
m3 = rep(m3, "  publicoAnimado(c);\n", "  publicoAnimado(c);\n  ledMarcador(c);\n", 'm3')
m3 = rep(m3, "  if(P.drill){\n    const d = P.drill;\n",
         "  $('#nomYo').textContent = P.equipos[0]; $('#nomEl').textContent = P.equipos[1];\n"
         "  const sets = P.marcadorSets || [];\n"
         "  $('#setsYo').innerHTML = sets.map(s => `<i class=\"${s[0] > s[1] ? 'g' : ''}\">${s[0]}</i>`).join('');\n"
         "  $('#setsEl').innerHTML = sets.map(s => `<i class=\"${s[1] > s[0] ? 'g' : ''}\">${s[1]}</i>`).join('');\n"
         "  if(P.drill){\n    const d = P.drill;\n", 'm3')
m3 = rep(m3, "  $('#avisoP').classList.remove('on'); mostrarAyuda('');\n  for(const b",
         "  $('#avisoP').classList.remove('on'); mostrarAyuda('');\n  const sp = $('#statP'); if(sp){ sp.classList.remove('on'); sp.hidden = true; }\n  for(const b", 'm3')
escribir('c-motor3.js', m3)

# ── extra: la figura se reutiliza en la portada y la carta; el público pasa a c-look.js ──
e = leer('c-extra.js')
e = cortar(e, "function figuraSVG(a, zurdo){", "function aspectoHTML(){", 'extra', r'''function figuraInterior(a, zurdo){
  const px = zurdo ? 13 : 59, hx = zurdo ? 22 : 50;
  return `<ellipse cx="36" cy="90" rx="18" ry="4" fill="rgba(0,0,0,.3)"/>
    <line x1="31" y1="58" x2="28" y2="86" stroke="#E6BF9A" stroke-width="6" stroke-linecap="round"/><line x1="41" y1="58" x2="44" y2="86" stroke="#E6BF9A" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="27" cy="88" rx="5" ry="2.6" fill="#F4F6F8"/><ellipse cx="45" cy="88" rx="5" ry="2.6" fill="#F4F6F8"/>
    <rect x="23" y="52" width="26" height="12" rx="4" fill="#1B2733"/>
    <rect x="20" y="24" width="32" height="32" rx="9" fill="${a.camiseta}"/><rect x="33" y="25" width="6" height="30" fill="rgba(0,0,0,.18)"/>
    <line x1="${zurdo ? 50 : 22}" y1="30" x2="${zurdo ? 56 : 16}" y2="48" stroke="#E6BF9A" stroke-width="5" stroke-linecap="round"/>
    <line x1="${hx}" y1="30" x2="${px}" y2="20" stroke="#E6BF9A" stroke-width="5" stroke-linecap="round"/>
    <line x1="${px}" y1="20" x2="${px}" y2="14" stroke="#0F1C22" stroke-width="3"/>
    <ellipse cx="${px}" cy="8" rx="9" ry="10" fill="${a.pala}" stroke="${a.camiseta}" stroke-width="2"/>
    <circle cx="36" cy="14" r="9" fill="#E6BF9A"/><path d="M27 13 a9 9 0 0 1 18 0 z" fill="#0F2A22"/>`;
}
function figuraSVG(a, zurdo, attrs){
  return `<svg viewBox="0 0 72 96" ${attrs || 'width="62" height="83"'} aria-hidden="true">${figuraInterior(a, zurdo)}</svg>`;
}
''')
e = cortar(e, "/* ── El pabellón: público que se viene arriba en los puntos buenos ── */", None, 'extra')
e = rep(e, "    drill: { id, total: 10, objetivo: d.objetivo, tipos: d.tipos },",
        "    drill: { id, total: 10, objetivo: d.objetivo, tipos: d.tipos },\n    escena: { tipo:'club', gente:.15, ciudad: j ? j.ciudad : '' }, equipos: ['ACIERTOS', 'FALLOS'],", 'extra')
e = rep(e, "<div class=\"eyebrow\">🏆 RANKING MUNDIAL</div>", "<div class=\"eyebrow\">${ico('ranking')} RANKING MUNDIAL</div>", 'extra')
escribir('c-extra.js', e)

# ── carrera: escenario y nombres para la tele, y el ranking de cada trimestre para los gráficos ──
c = leer('c-carrera.js')
c = rep(c, "    pPunto: perfilDupla(j, opp, ev, j.energia).p, humanoIA: !!S.pruebaIA,",
        "    pPunto: perfilDupla(j, opp, ev, j.energia).p, humanoIA: !!S.pruebaIA,\n"
        "    escena: escenaDe(ev), equipos: [nombreEquipo(j.nombre, j.pareja ? j.pareja.nombre : 'Pareja'), nombreEquipo(opp.nombre, opp.nombre2)],", 'c')
c = rep(c, "  const juegos = [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3, sets = PREF.sets === 3 ? 3 : 1,",
        "  const rivales = duplaRival(ri(30, 400));\n  const juegos = [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3, sets = PREF.sets === 3 ? 3 : 1,", 'c')
c = rep(c, "    carril: posicion === 'drive' ? 'der' : 'izq', juegos, sets, pPunto: .5, rapido: true,",
        "    carril: posicion === 'drive' ? 'der' : 'izq', juegos, sets, pPunto: .5, rapido: true,\n"
        "    escena: { tipo: pick(['pabellon','exterior','club']), gente: rnd(.45, 1), ciudad: j ? j.ciudad : 'Madrid' },\n"
        "    equipos: [j ? nombreEquipo(j.nombre, j.pareja ? j.pareja.nombre : 'Pareja') : 'TÚ / PAREJA', nombreEquipo(rivales.nombre, rivales.nombre2)],", 'c')
c = rep(c, "    if(S.trim) evolucionarCircuito(j);          // el circuito se mueve de un trimestre al otro\n",
        "    if(S.trim) evolucionarCircuito(j);          // el circuito se mueve de un trimestre al otro\n    anotarRankingTrimestre(j);\n", 'c')
c = rep(c, "  to.fin = { r, rankAntes, logros };\n", "  to.fin = { r, rankAntes, logros };\n  anotarRankingTrimestre(j);\n", 'c')
escribir('c-carrera.js', c)

# ── vistas ──
v = leer('c-vistas.js')
v = rep(v, "  return `<button class=\"opt ${puede ? '' : est.tipo === 'jugado' ? 'hecho' : 'lock'}\" onclick=\"abrirTorneo('${ev.id}')\">\n    <span class=\"ic\">${ev.t==='MJ'?'🏛️':ev.t==='FIN'?'🏆':iconoTier(ev.t)}</span>",
        "  return `<button class=\"opt fila-cat ${puede ? '' : est.tipo === 'jugado' ? 'hecho' : 'lock'}\" style=\"--cat:${colorCat(ev.t)}\" onclick=\"abrirTorneo('${ev.id}')\">\n"
        "    <span class=\"mini-postal\" style=\"--cat:${colorCat(ev.t)}\">${postalCiudad(ev.ciudad, ev.pista, ev.t, 90)}<i>${ico(iconoCat(ev.t))}</i></span>", 'v')
v = rep(v, "  <div class=\"card\" style=\"${grande ? 'background:linear-gradient(160deg,rgba(245,197,66,.14),transparent 62%);border-color:rgba(245,197,66,.28)' : ''}\">\n    <div style=\"display:flex;justify-content:space-between;align-items:flex-start;gap:8px\">\n      <div style=\"min-width:0\">\n        <span class=\"tier ${T.cls}\">",
        "  <div class=\"card cab-torneo\" style=\"--cat:${colorCat(ev.t)}\">${postalCiudad(ev.ciudad, ev.pista, ev.t, 120)}\n    <div style=\"display:flex;justify-content:space-between;align-items:flex-start;gap:8px\">\n      <div style=\"min-width:0\">\n        <span class=\"tier ${T.cls}\">", 'v')
v = rep(v, "      h += chancesHTML(ev, so, null);", "      h += llavesHTML(ev, so, null) + chancesHTML(ev, so, null);", 'v')
v = rep(v, "'<div style=\"height:11px\"></div>' + chancesHTML(ev, to.sorteo, to)", "'<div style=\"height:11px\"></div>' + llavesHTML(ev, to.sorteo, to) + chancesHTML(ev, to.sorteo, to)", 'v')
v = rep(v, "  if(to.partidos.length) h += `<div class=\"card\"><div class=\"eyebrow\">VUESTRO CAMINO</div><div style=\"height:8px\"></div>${to.partidos.slice().reverse().map(p => cardPartido(j, p)).join('')}</div>`;\n  return h + `<button class=\"btn\" onclick=\"salirTorneo()\">",
        "  if(to.sorteo && to.sorteo.probs) h += llavesHTML(ev, to.sorteo, to);\n"
        "  if(to.partidos.length) h += `<div class=\"card\"><div class=\"eyebrow\">VUESTRO CAMINO</div><div style=\"height:8px\"></div>${to.partidos.slice().reverse().map(p => cardPartido(j, p)).join('')}</div>`;\n  return h + `<button class=\"btn\" onclick=\"salirTorneo()\">", 'v')
v = rep(v, "<div class=\"title-lg\" style=\"color:var(--accent)\">+${r.pts}</div>",
        "<div class=\"title-lg\" style=\"color:var(--accent)\" data-num=\"${r.pts}\" data-pre=\"+\" data-desde0=\"1\" data-clave=\"fin-pts-${ev.id}-${j.anio}-${j.trimestre}\">+${r.pts}</div>", 'v')
v = rep(v, "<div class=\"title-lg\" style=\"color:var(--gold)\">${money(r.plata)}</div>",
        "<div class=\"title-lg\" style=\"color:var(--gold)\" data-num=\"${r.plata}\" data-fmt=\"money\" data-desde0=\"1\" data-clave=\"fin-plata-${ev.id}-${j.anio}-${j.trimestre}\">${money(r.plata)}</div>", 'v')
for a, b in [
    ("onclick=\"S.pantalla='perfil';render()\">MI PERFIL</button>", "onclick=\"S.pantalla='perfil';render()\">${ico('perfil')} MI PERFIL</button>"),
    ("onclick=\"S.vitrinaTab='premios';S.pantalla='vitrina';render()\">🏆 PREMIOS</button>", "onclick=\"S.vitrinaTab='premios';S.pantalla='vitrina';render()\">${ico('trofeo')} PREMIOS</button>"),
    ("onclick=\"S.volverComo='temporada';S.pantalla='como';render()\">🎮 CONTROLES</button>", "onclick=\"S.volverComo='temporada';S.pantalla='como';render()\">${ico('mando')} CONTROLES</button>"),
    ("onclick=\"S.pantalla='ranking';render()\">🏆 RANKING</button>", "onclick=\"S.pantalla='ranking';render()\">${ico('ranking')} RANKING</button>"),
    ("onclick=\"abrirEntreno('temporada')\">🎯 ENTRENAR</button>", "onclick=\"abrirEntreno('temporada')\">${ico('diana')} ENTRENAR</button>"),
    ("render()\">🏓 MATERIAL</button>", "render()\">${ico('pala')} MATERIAL</button>"),
    ("render()\">🛒 MERCADO · ${money(j.dinero)}</button>", "render()\">${ico('carrito')} MERCADO · ${money(j.dinero)}</button>"),
    ("onclick=\"partidoRapido()\">⚡ PARTIDO RÁPIDO</button>", "onclick=\"partidoRapido()\">${ico('pelota')} PARTIDO RÁPIDO</button>"),
    ("onclick=\"S.volverComo='inicio';S.pantalla='como';render()\">🎮 CONTROLES</button>", "onclick=\"S.volverComo='inicio';S.pantalla='como';render()\">${ico('mando')} CONTROLES</button>"),
    ("onclick=\"abrirEntreno('inicio')\">🎯 ENTRENAR</button>", "onclick=\"abrirEntreno('inicio')\">${ico('diana')} ENTRENAR</button>"),
    ("<div class=\"eyebrow\">📅 TORNEOS DEL TRIMESTRE</div>", "<div class=\"eyebrow\">${ico('calendario')} TORNEOS DEL TRIMESTRE</div>"),
    ("<div class=\"eyebrow\">📊 TUS CHANCES, RONDA A RONDA</div>", "<div class=\"eyebrow\">${ico('grafico')} TUS CHANCES, RONDA A RONDA</div>"),
]:
    v = rep(v, a, b, 'v')
escribir('c-vistas.js', v)

# ── el marcador de la tele ──
h = leer('c-html.txt')
h = rep(h, '''  <div id="hudP">
    <div class="eq yo"><span class="saca" id="sacaYo"></span><span class="nm">TÚ</span><span class="jg" id="jgYo">0</span><span class="pt" id="ptYo">0</span></div>
    <div class="eq el"><span class="pt" id="ptEl">0</span><span class="jg" id="jgEl">0</span><span class="nm">ELLOS</span><span class="saca" id="sacaEl"></span></div>
  </div>''', '''  <div id="hudP" class="marcador-tv">
    <div class="mt-fila yo"><span class="saca" id="sacaYo"></span><span class="mt-nom" id="nomYo">TÚ</span><span class="mt-sets" id="setsYo"></span><span class="jg" id="jgYo">0</span><span class="pt" id="ptYo">0</span></div>
    <div class="mt-fila el"><span class="saca" id="sacaEl"></span><span class="mt-nom" id="nomEl">ELLOS</span><span class="mt-sets" id="setsEl"></span><span class="jg" id="jgEl">0</span><span class="pt" id="ptEl">0</span></div>
  </div>
  <div id="statP" hidden></div>''', 'c-html')
escribir('c-html.txt', h)

# ── montaje: el código y los estilos nuevos, y la letra deportiva ──
p1 = leer('patch.py')
p1 = rep(p1, "leer('c-vistas.js') + leer('c-extra.js')", "leer('c-vistas.js') + leer('c-extra.js') + leer('c-look.js')", 'patch.py')
p1 = rep(p1, "rep('</style>', leer('c-css.txt') + '</style>')",
         "rep('</style>', leer('c-css.txt') + leer('c-look.css') + '</style>')\n"
         "rep('<style>', '<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>'\n"
         "    '<link href=\"https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&display=swap\" rel=\"stylesheet\">\\n<style>')", 'patch.py')
escribir('patch.py', p1)
print('patch15: como en la tele')
