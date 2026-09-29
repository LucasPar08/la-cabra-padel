import sys
# Décima pasada: el circuito juega su trimestre de verdad (antes casi nunca se
# movía: pasarTrimestre borraba el trimestre antes de que se enterara), tu puesto
# sale de la misma lista que el de las demás parejas, las noticias del circuito,
# quién tienes alrededor en el ranking y la oferta de una estrella.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── 1) el circuito juega al cerrarse cada trimestre, pase lo que pase en el tuyo ──
rep("""  if(S.j && S.j.ranking === 1) S.j.trimN1 = (S.j.trimN1 || 0) + 1;      // fechas aguantando en lo más alto
  mundialPendiente();""",
"""  if(S.j && S.j.ranking === 1) S.j.trimN1 = (S.j.trimN1 || 0) + 1;      // fechas aguantando en lo más alto
  cerrarCircuitoTrimestre(S.j);          // las demás parejas juegan su trimestre
  mundialPendiente();""")
rep("    if(S.trim) evolucionarCircuito(j);          // el circuito se mueve de un trimestre al otro\n", "")
# un circuito recién hecho ya viene con sus puntos: no hay que volver a repartirlos
rep("  if(j.circuito[0] && j.circuito[0].pts == null) sembrarCircuito(j.circuito, j.anio*TRIMESTRES_POR_ANIO + j.trimestre);",
    "  if(j.circuito[0] && j.circuito[0].pts == null){ sembrarCircuito(j.circuito, j.anio*TRIMESTRES_POR_ANIO + j.trimestre); if(j.circuitoW == null) j.circuitoW = j.anio*TRIMESTRES_POR_ANIO + j.trimestre - 1; }")

# ── 2) los puntos que se ven en el ranking son los de la tabla para cada puesto:
#       tu puesto sale de ahí, así la lista siempre cuadra con tus puntos. El orden
#       de las parejas, sus títulos y las noticias salen de lo que juegan. ──
rep("<span class=\"rk-pt\">${p.pts != null ? p.pts : ptsDeRank(r)} pts</span>", "<span class=\"rk-pt\">${ptsDeRank(r)} pts</span>")

# ── 3) las noticias, al empezar el trimestre siguiente ──
rep("h += idoloTemporadaHTML(j) + mundialAvisoHTML(j) + desafioHTML() + tarjetaPremios(j) + calendarioHTML(j, tr);",
    "h += idoloTemporadaHTML(j) + mundialAvisoHTML(j) + noticiasHTML(j) + desafioHTML() + tarjetaPremios(j) + calendarioHTML(j, tr);")

# ── 4) el ranking: el texto nuevo y quién tienes alrededor ──
rep("Son siempre las mismas: os las iréis cruzando en los cuadros grandes y cada partido queda en el historial.",
    "Juegan su propio calendario y suben o bajan según lo que ganan. Os las iréis cruzando en los cuadros grandes y cada partido queda en el historial.")
rep("""${pieReal}</div>""", """${pieReal}</div>
  ${alrededorHTML(j)}""")

# ── 5) la estrella: aparece en el mercado si estás arriba, y al ficharla su pareja se queda sola ──
rep("""    out.push(c);
  }
  return out;
}
function puedeFichar(j, c){""",
"""    out.push(c);
  }
  const estrella = candidataEstrella(j);
  if(estrella) out.unshift(estrella);
  return out;
}
function puedeFichar(j, c){""")
rep("""  if(j.pareja) j.parejasHist.push({nombre:j.pareja.nombre, anios:j.pareja.anios, motivo:'la dejaste tú'});
  j.pareja = c;""",
"""  if(j.pareja) j.parejasHist.push({nombre:j.pareja.nombre, anios:j.pareja.anios, motivo:'la dejaste tú'});
  j.pareja = c;
  if(c.estrella) ficharEstrella(j, c);""")

open(p, 'w', encoding='utf-8').write(s)
print('circuito de verdad, noticias, alrededor y estrella')
