import sys, re
# Sexta pasada sobre el archivo montado (código de la v1): portada ordenada y
# el botón de volver arriba a la izquierda, en vez de al final del todo.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── 1) el motorcito del volver: cada pantalla dice adónde se vuelve ──
rep("""function topbar(){
  const j = S.j;
  let h = `<div class="topbar"><div class="brand"><span class="pala"></span><b>LA CABRA</b><small>PÁDEL</small></div>`;""",
"""/* Las pantallas que se pueden cerrar llaman a volverAtras() con lo que haya que
   hacer al volver. La cabecera pinta entonces el botón de arriba a la izquierda,
   y así no hay que bajar hasta el final para salir. */
let ATRAS_FN = null;
function volverAtras(fn){ ATRAS_FN = fn; return ''; }
function irAtras(){ const f = ATRAS_FN; if(!f) return; ATRAS_FN = null; f(); render(); }
function topbar(){
  const j = S.j;
  let h = `<div class="topbar">${ATRAS_FN ? `<button class="volver-top" onclick="irAtras()">${ico('atras')}<span>VOLVER</span></button>` : ''}<div class="brand"><span class="pala"></span><b>LA CABRA</b><small>PÁDEL</small></div>`;""")

# la cabecera se pinta después de la pantalla, que es quien dice si hay vuelta
rep("""  const scrollAntes = window.scrollY || document.documentElement.scrollTop || 0;
  let html = topbar();""",
"""  const scrollAntes = window.scrollY || document.documentElement.scrollTop || 0;
  ATRAS_FN = null;
  let html = '';""")
rep("""  const app = $('#app');
  app.classList.toggle('sin-entrada', misma);""",
"""  html = topbar() + html;
  const app = $('#app');
  app.classList.toggle('sin-entrada', misma);""")

# ── 2) fuera los botones de volver del final ──
rep("""  <button class="btn ghost" onclick="S.pantalla='inicio';render()">VOLVER</button>""",
    """  ${volverAtras(() => { S.pantalla = 'inicio'; })}""")                                    # crear
rep("""  h += `<button class="btn" onclick="S.pantalla='${volver}';render()">VOLVER</button></div>`;""",
    """  h += `${volverAtras(() => { S.pantalla = volver; })}</div>`;""")                          # mercado
rep("""  <button class="btn ghost" onclick="S.pantalla='temporada';render()">VOLVER</button>\n""",
    """  ${volverAtras(() => { S.pantalla = 'temporada'; })}\n""")                                 # perfil
rep("""  h += `<button class="btn ghost" onclick="S.pantalla='${j.retirado?'retiro':'temporada'}';render()">VOLVER</button></div>`;""",
    """  h += `${volverAtras(() => { S.pantalla = j.retirado ? 'retiro' : 'temporada'; })}</div>`;""")  # vitrina
rep("""  <button class="btn ghost" onclick="S.esperandoTecla=null;S.avisoTecla=null;S.pantalla='${volver}';render()">VOLVER</button></div>`;""",
    """  ${volverAtras(() => { S.esperandoTecla = null; S.avisoTecla = null; S.pantalla = volver; })}</div>`;""")  # como
rep("""  <button class="btn ghost" onclick="S.rapido=null;S.pantalla='${volver}';render()">VOLVER</button>""",
    """  ${volverAtras(() => { S.rapido = null; S.pantalla = volver; })}""")                       # finRapido
rep("""  <button class="btn ghost" onclick="S.pantalla='temporada';render()">VOLVER</button></div>`;""",
    """  ${volverAtras(() => { S.pantalla = S.j && S.j.retirado ? 'retiro' : 'temporada'; })}</div>`;""")  # ranking
rep("""  <button class="btn ghost" onclick="S.pantalla=S.volverEntreno||'inicio';render()">VOLVER</button></div>`;""",
    """  ${volverAtras(() => { S.pantalla = S.volverEntreno || 'inicio'; })}</div>`;""")           # entreno
rep("""  return h + `<button class="btn ghost" onclick="S.verTorneo=null;S.pantalla='temporada';render()">VOLVER AL CALENDARIO</button></div>`;""",
    """  return h + `${volverAtras(() => { S.verTorneo = null; S.pantalla = 'temporada'; })}</div>`;""")   # torneo ya jugado

# ── 3) la portada, ordenada ──
i = s.index('function vInicio(){')
fin = s.index('\n/* ── CREAR JUGADOR ──', i)
nueva = """function vInicio(){
  const save = cargar(), hay = !!(save && save.j), n = listaCarreras().length;
  const acc = (fn, ic, t, d) => `<button class="acceso" onclick="${fn}">${ico(ic)}<b>${t}</b><span>${d}</span></button>`;
  const escalera = [['t-F','FIP PROMISES · RISE','Cuatro pistas, dos árbitros y cero dinero'],
     ['t-S','FIP STAR · GOLD · PLATINUM','Aquí se decide quién vive del pádel'],
     ['t-P','PREMIER PADEL P2','El circuito grande empieza de verdad'],
     ['t-1','PREMIER PADEL P1','Doce por año. Público, cámaras y dinero'],
     ['t-M','LOS CUATRO MAJORS','Doha · Roma · París · Acapulco — y las Finals']]
    .map(([c,nom,d])=>`<div class="li"><span class="tier ${c}">${etiquetaTier(({'t-F':'FIP2','t-S':'FIP5','t-P':'P2','t-1':'P1','t-M':'MJ'})[c])}</span><div class="g"><b>${nom}</b><span>${d}</span></div></div>`).join('');
  const distinto = [['🕸️','Manda quien tiene la red','Se gana arriba. Cada punto se simula golpe a golpe: la bandeja conserva la red y el globo te la devuelve.'],
     ['🤝','Se juega de dos en dos','Tu pareja vale el 42% del nivel de la dupla. Y puede dejarte.'],
     ['🧩','Uno cierra, otro sostiene','Dos rematadores se pisan. Una pareja peor que encaje rinde más que una mejor que no.'],
     ['⬅️','Drive o revés','El del revés define, el del drive construye. Es para toda la carrera.'],
     ['🥇','Punto de oro','En el deuce no hay ventajas: un punto, y el que resta elige lado.'],
     ['🌅','La previa','Si no entras por ranking, dos partidos el mismo día antes de pisar el cuadro.'],
     ['🚪','Salir de la pista','Por la puerta, a devolverla desde la calle. Por tres y por cuatro metros.'],
     ['🏔️','Indoor, exterior y altura','Por encima de 2.000 metros la bola no baja y el globo deja de existir.']]
    .map(([e,t,d])=>`<div class="li"><span class="ic" style="font-size:18px;width:24px;text-align:center">${e}</span><div class="g"><b>${t}</b><span>${d}</span></div></div>`).join('');
  return `<div class="fade">
  ${heroInicioHTML(save)}
  <div class="acciones">
    ${acc("abrirCarreras('inicio')", 'carpeta', 'MIS CARRERAS', n ? `${n} guardada${n === 1 ? '' : 's'}` : 'Guarda y retoma')}
    ${acc('partidoRapido()', 'pelota', 'PARTIDO RÁPIDO', 'Un partido y ya')}
    ${acc("abrirEntreno('inicio')", 'diana', 'ENTRENAR', 'Seis ejercicios')}
    ${acc("S.volverComo='inicio';S.pantalla='como';render()", 'mando', 'CÓMO SE JUEGA', 'Controles y reglas')}
    ${hay ? acc('nuevaCarreraLista()', 'mas', 'NUEVA CARRERA', 'Otra vez desde abajo') : ''}
  </div>
  ${desafioHTML()}
  ${idoloHTML()}
  <div class="card">
    <div class="eyebrow">MODO CARRERA · 21 PAÍSES</div>
    <div class="title-lg" style="margin:6px 0 7px">DEL CLUB DE BARRIO<br>AL PREMIER PADEL</div>
    <p class="sub" style="margin:0">Eliges tu país, empiezas con una pala prestada en los <b>FIP Promises</b> y peleas cada punto del ranking hasta la final de un <b>Major</b>. Los momentos clave los juegas tú en la pista; el resto se simula.</p>
    <details class="desp"><summary>La escalera del circuito</summary><div class="desp-c">${escalera}</div></details>
    <details class="desp"><summary>Lo que hace distinto al pádel</summary><div class="desp-c">${distinto}</div></details>
  </div>
  <p class="muted center" style="margin-top:12px">Se guarda en este dispositivo. El dinero va y viene; la cabra queda 🐐</p>
  </div>`;
}
"""
s = s[:i] + nueva + s[fin+1:]

open(p, 'w', encoding='utf-8').write(s)
print('portada ordenada y volver arriba')
