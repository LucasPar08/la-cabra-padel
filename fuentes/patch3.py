import os, re
# Tercera ronda de cambios en las fuentes: Leer al rival como forma nueva (junto a la Ráfaga)
# y todas las finales en la pista (el cuadro del Major queda para cuartos y semifinal).
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()

def cambiar(nombre, pares):
    s = leer(nombre)
    for a, b in pares:
        c = s.count(a)
        assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:90])
        s = s.replace(a, b)
    open(os.path.join(D, nombre), 'w', encoding='utf-8').write(s)

# ── carrera ──
cambiar('c-carrera.js', [
  ("   el PUNTO CLAVE en la pista. Los Majors y las finales de P1 y Finals\n   mantienen sus minijuegos de siempre: el cuadro y el punto de oro.",
   "   el PUNTO CLAVE (en la pista o en un minijuego). Los Majors mantienen su\n   cuadro en cuartos y semis, y todas las finales se juegan en la pista."),
  ("/* Los minijuegos de siempre: el cuadro desde cuartos de un Major y el punto de oro en la final de un P1 o las Finals */",
   "/* El minijuego de siempre: el cuadro de un Major en cuartos y semifinal (la final se juega en la pista) */"),
  ("  if(m === 'duelo' && to.ronda === T.rondas-1) return 'duelo';\n", ""),
  ("  if(mini === 'duelo'){\n    /* la final de un P1 o de las Finals se juega siempre a ráfaga */\n"
   "    const fin = simularPartido(j, to.rival, to.ev, to.ronda, T.rondas); fin.ronda = nombreRondaActual(to);\n"
   "    to.momento = crearMomento(j, to, fin, true, 'tiempo'); S.pantalla = 'momento';\n"
   "    if(!S.silencio){ guardar(); render(); } return;\n  }\n", ""),
  ("  /* En cualquier ronda puede tocar un momento clave (en la final, siempre): en la pista o eligiendo */\n"
   "  if(!S.sinMomentos && (esFinal || Math.random() < (to.enPrevia ? PROB_MOMENTO_PREVIA : PROB_MOMENTO))){\n"
   "    to.momento = crearMomento(j, to, res, esFinal);",
   "  /* En cualquier ronda puede tocar un momento clave. La final, siempre, y se juega en la pista (aunque simules hasta ella) */\n"
   "  if(esFinal || (!S.sinMomentos && Math.random() < (to.enPrevia ? PROB_MOMENTO_PREVIA : PROB_MOMENTO))){\n"
   "    to.momento = crearMomento(j, to, res, esFinal, esFinal ? 'pista' : null);"),
  ("/* Todo simulado hasta el final del torneo: los momentos clave también. Los minijuegos no se saltan */",
   "/* Todo simulado hasta la final: los momentos clave también. El cuadro del Major y la final no se saltan */"),
  ("     · tiempo → la ráfaga: tres golpes a tiempo para ganar el punto de oro\n",
   "     · tiempo → la ráfaga: tres golpes a tiempo para ganar el punto de oro\n     · leer   → leer al rival: adivinar a dónde van sus tres bolas\n"),
  ("  let ops = to.enPrevia ? ['tiempo','camino'] : ['pista','pista','tiempo','tiempo','camino'];",
   "  let ops = to.enPrevia ? ['tiempo','leer','camino'] : ['pista','pista','tiempo','leer','camino'];"),
  ("  } else if(forma === 'camino'){",
   "  } else if(forma === 'leer'){\n    m.tipo = 'punto'; m.inicio = [3,3];\n    m.leer = crearLectura(j, to.rival, edge);\n"
   "    m.sit = `${to.enPrevia ? 'Previa. ' : ''}Tercer set, 5-5 y 40-40: <b>punto de oro</b> y la bola la tienen ellos. Si les leéis el punto, ${premio}.`;\n"
   "  } else if(forma === 'camino'){"),
  ("  S.pantalla = 'torneo';\n  cerrarTorneoActual();\n}",
   "  S.pantalla = 'torneo';\n  /* superar el cuadro del Major lleva a la final, que se juega en la pista */\n"
   "  if(gano && to.ronda < TIERS[to.ev.t].rondas){ to.ultimo = { cuadro:true, gane:true, sets:[], ronda:'SEMIFINAL' }; nuevoRivalTorneo(); guardar(); render(); return; }\n"
   "  cerrarTorneoActual();\n}"),
  ("elegidos = claves.filter(x => x.clave.forma === 'tiempo' || x.clave.forma === 'camino').length;",
   "elegidos = claves.filter(x => ['tiempo','leer','camino'].includes(x.clave.forma)).length;"),
])

# ── vistas ──
v = leer('c-vistas.js')
a = v.index("    } else if(mini === 'duelo'){")
b = v.index("    } else {\n      const prob = probPartido(", a)
v = v[:a] + v[b:]
open(os.path.join(D, 'c-vistas.js'), 'w', encoding='utf-8').write(v)
cambiar('c-vistas.js', [
  ("los decides tú: en la pista, en una ráfaga o eligiendo camino.${mj === 'cuadro' ? ' Desde cuartos, <b style=\"color:var(--gold)\">el cuadro del Major</b>.' : mj === 'duelo' ? ' La final, <b style=\"color:var(--gold)\">a punto de oro</b>.' : ''}",
   "los decides tú: en la pista, en una ráfaga, leyendo al rival o eligiendo camino.${mj === 'cuadro' ? ' En cuartos y semis, <b style=\"color:var(--gold)\">el cuadro del Major</b>.' : ''} <b style=\"color:var(--gold)\">La final, siempre en la pista.</b>"),
  ("    if(u) h += `<div class=\"log ${u.clave ? 'gold' : ''}\">",
   "    if(u && u.cuadro) h += `<div class=\"log gold\">🏛️ <b>Cuadro superado:</b> cuartos y semifinal ganados. La final se juega en la pista.</div>`;\n    else if(u) h += `<div class=\"log ${u.clave ? 'gold' : ''}\">"),
  ("u.clave.forma === 'tiempo' ? ' · ⚡ con una ráfaga a tiempo' : u.clave.forma === 'camino'",
   "u.clave.forma === 'tiempo' ? ' · ⚡ con una ráfaga a tiempo' : u.clave.forma === 'leer' ? ' · 👀 leyéndoles el punto' : u.clave.forma === 'camino'"),
  ("Tres rondas hasta el título y cada una es un minijuego: <b>elige camino</b> y esquiva a la pareja que os saca.",
   "Cuartos y semifinal son un minijuego: <b>elige camino</b> y esquiva a la pareja que os saca. Si pasáis, la final se juega en la pista."),
  ("esFinal ? '🔥 <b>La final siempre tiene momento clave:</b> en la pista o en un minijuego.'",
   "esFinal ? '🎾 <b>La final se juega siempre en la pista</b>, aunque simules hasta ella.'"),
  ("momento clave</b>: en la pista, en una ráfaga o eligiendo camino.'}",
   "momento clave</b>: en la pista, en una ráfaga, leyendo al rival o eligiendo camino.'}"),
  ("⏭️ SIMULAR HASTA EL FINAL</button>\n      ${mj ? `<p class=\"muted center\" style=\"margin:6px 0 0\">${mj === 'cuadro' ? 'El cuadro del Major' : 'El punto de oro de la final'} no se salta: ese lo juegas tú.</p>` : ''}",
   "⏭️ SIMULAR HASTA LA FINAL</button>\n      <p class=\"muted center\" style=\"margin:6px 0 0\">${mj === 'cuadro' ? 'El cuadro del Major y la final' : 'La final'} no se saltan: esos los juegas tú.</p>"),
  ("const titulo = m.forma === 'tiempo' ? '⚡ PUNTO CLAVE' : m.forma === 'camino'",
   "const titulo = m.forma === 'tiempo' ? '⚡ PUNTO CLAVE' : m.forma === 'leer' ? '👀 LEER AL RIVAL' : m.forma === 'camino'"),
  ("    if(m.forma === 'camino') h += casillasHTML(m, true);\n    const cabecera = m.forma === 'tiempo'",
   "    if(m.forma === 'camino') h += casillasHTML(m, true);\n    if(m.forma === 'leer') h += leerHTML(m.leer);\n"
   "    const cabecera = m.forma === 'leer' ? `<div style=\"display:flex;justify-content:space-between;align-items:center;gap:8px\"><div class=\"eyebrow\">👀 LEER AL RIVAL</div>${chipsLectura(m.leer)}</div>` : m.forma === 'tiempo'"),
  ("  h += m.forma === 'tiempo' ? rafagaHTML(m.rafaga) : casillasHTML(m, false);",
   "  h += m.forma === 'tiempo' ? rafagaHTML(m.rafaga) : m.forma === 'leer' ? leerHTML(m.leer) : casillasHTML(m, false);"),
])
v = leer('c-vistas.js')
v, n = re.subn(r'<p class="sub" style="margin:6px 0 10px">Eliges cada torneo del calendario\..*?</p>',
               '<p class="sub" style="margin:6px 0 10px">Eliges cada torneo del calendario. Los partidos se simulan y los <b>momentos clave</b> los decides tú: en la pista (joystick y cuatro golpes), en una ráfaga, leyendo al rival o eligiendo camino. <b>Las finales, siempre en la pista.</b></p>', v, flags=re.S)
assert n == 1, 'texto de inicio: %d' % n
if 'function crearLectura' not in v: v += leer('lectura.js')
open(os.path.join(D, 'c-vistas.js'), 'w', encoding='utf-8').write(v)

# ── estilos del minijuego nuevo ──
css = leer('c-css.txt')
if '.zonas-leer' not in css:
    css += '''
/* ── leer al rival ── */
.zonas-leer{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}
.zleer{min-height:104px;border-radius:13px;border:2px solid rgba(255,255,255,.14);background:linear-gradient(180deg,#1F6E57,#17594A);color:#fff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 4px;font-weight:900;touch-action:manipulation;transition:transform .08s}
.zleer:active{transform:scale(.96)}
.zleer .ic{font-size:24px;line-height:1}
.zleer b{font-size:11.5px;letter-spacing:.06em}
.zleer small{font-size:12px;font-weight:900;color:#DCF54A}
.zleer.top{border-color:rgba(220,245,74,.55)}
'''
    open(os.path.join(D, 'c-css.txt'), 'w', encoding='utf-8').write(css)

# ── segunda pasada (sobre la versión publicada): etiqueta y cuadro del Major de dos rondas ──
cambiar('patch2.py', [
  ("p.clave.forma==='tiempo' ? ' · ⚡ RÁFAGA' : p.clave.forma==='camino'", "p.clave.forma==='tiempo' ? ' · ⚡ RÁFAGA' : p.clave.forma==='leer' ? ' · 👀 PUNTO LEÍDO' : p.clave.forma==='camino'"),
  ("open(p, 'w', encoding='utf-8').write(s)", r'''# el cuadro del Major en el circuito jugable: cuartos y semifinal; la final se juega en la pista
rep("  for(let k = T.rondas-3; k < T.rondas; k++){", "  for(let k = T.rondas-3; k < (S.torneo ? T.rondas-1 : T.rondas); k++){")
rep("  const victorias = (T.rondas-3) + (c.gano ? 3 : c.actual);", "  const victorias = (T.rondas-3) + (c.gano ? c.rondas.length : c.actual);")
rep("  const jugados = c.gano ? 3 : c.actual + 1;", "  const jugados = c.gano ? c.rondas.length : c.actual + 1;")
rep("  j.pg += (c.gano ? 3 : c.actual);\n  j.pgAnio = (j.pgAnio||0) + (c.gano ? 3 : c.actual);", "  j.pg += (c.gano ? c.rondas.length : c.actual);\n  j.pgAnio = (j.pgAnio||0) + (c.gano ? c.rondas.length : c.actual);")
rep("  else j.racha = (j.racha||0) + 3;", "  else j.racha = (j.racha||0) + c.rondas.length;")
rep("Tres partidos para el título. <b>Cada casilla es un partido</b>", "${c.rondas.length === 3 ? 'Tres partidos para el título.' : 'Cuartos y semifinal: si pasáis, <b>la final se juega en la pista</b>.'} <b>Cada casilla es un partido</b>")
rep("${c.gano?gx('🏆 ¡CAMPEÓN!','🏆 ¡CAMPEONA!'):'😖 SE ACABÓ'}", "${c.gano ? (c.rondas.length < 3 ? '🎾 ¡A LA FINAL!' : gx('🏆 ¡CAMPEÓN!','🏆 ¡CAMPEONA!')) : '😖 SE ACABÓ'}")
rep("${c.gano\n        ? `Ganasteis <b>", "${c.gano\n        ? c.rondas.length < 3 ? 'Estáis en la final del Major. <b>La final se juega en la pista.</b>' : `Ganasteis <b>")

open(p, 'w', encoding='utf-8').write(s)'''),
])

# ── pruebas: leer al rival, finales en la pista y cuadro de dos rondas ──
cambiar('prueba.js', [
  ("elegirCaminoMomento, continuarMomento,", "elegirCaminoMomento, continuarMomento, leerZonaMomento,"),
  ("      else if(m.forma === 'camino'){",
   "      else if(m.forma === 'leer'){\n"
   "        for(let k = 0; k < 4 && !m.eleccion; k++){ const L = m.leer, b = L.bolas[L.k]; A.leerZonaMomento(b.chivato !== null ? b.chivato : b.w.indexOf(Math.max(...b.w))); A.vMomento(); }\n"
   "        if(!m.eleccion){ errores.push('leer al rival no resolvió'); return; }\n"
   "        A.continuarMomento(); anotar();\n      }\n"
   "      else if(m.forma === 'camino'){"),
  ("      fm.n++;\n", "      fm.n++;\n      if(m.esFinal && m.forma !== 'pista') errores.push('final sin pista: ' + m.forma);\n"),
  ("      if(c.terminado){ cuenta.cuadros++; A.cerrarCuadro(); }", "      if(c.terminado){ cuenta.cuadros++; if(c.rondas.length !== 2) errores.push('cuadro de ' + c.rondas.length + ' rondas'); A.cerrarCuadro(); }"),
])
print('patch3: leer al rival, finales en la pista y cuadro de dos rondas')
