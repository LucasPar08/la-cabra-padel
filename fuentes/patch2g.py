import sys
# Octava pasada sobre el archivo montado (código de la v1): el circuito deja de
# moverse por corazonadas y pasa a moverse por puntos. Las otras parejas juegan
# sus torneos cada trimestre y el ranking sale de lo que ganan.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── el circuito se mueve por resultados ──
rep("""function evolucionarCircuito(j){
  const pool = asegurarCircuito(j);
  for(const p of pool) p.forma = clamp(p.forma*.7 + rnd(-1.4, 1.4), -3, 3);
  for(let pasada = 0; pasada < 2; pasada++)
    for(let s = pool.length - 1; s > 0; s--)
      if(pool[s].forma - pool[s-1].forma > rnd(.8, 3.5)){ const t = pool[s]; pool[s] = pool[s-1]; pool[s-1] = t; }
  if(Math.random() < .35){ pool.splice(ri(24, pool.length - 1), 1); pool.push(nuevaParejaCircuito(40, pool)); }
  if(Math.random() < .6) pool[0].titulos++;
  for(let s = 1; s < 10; s++) if(Math.random() < .12) pool[s].titulos++;
}""",
"""/* el circuito juega su trimestre al cerrarse cada uno: ver cerrarCircuitoTrimestre */
function evolucionarCircuito(j){ cerrarCircuitoTrimestre(j); }""")

# ── el nivel de cada pareja es suyo, no el de la casilla que ocupa ──
rep("  return { id:p.id, nombre:p.nombre, nombre2:p.nombre2, flag:p.flag, flag2:p.flag2, arq:p.arq, rank, rating: ratingDeRank(rank) + p.forma };",
    "  return { id:p.id, nombre:p.nombre, nombre2:p.nombre2, flag:p.flag, flag2:p.flag2, arq:p.arq, rank,\n           rating: p.nivel != null ? p.nivel + (p.forma || 0) : ratingDeRank(rank) + p.forma };")

# ── al crear o migrar el circuito, cada pareja arranca con sus puntos ──
rep("""  else if(migrarCircuitoReal(j)) guardar();      /* carrera vieja: entran los de verdad */
  return j.circuito;""",
"""  else if(migrarCircuitoReal(j)) guardar();      /* carrera vieja: entran los de verdad */
  if(j.circuito[0] && j.circuito[0].pts == null) sembrarCircuito(j.circuito, j.anio*TRIMESTRES_POR_ANIO + j.trimestre);
  return j.circuito;""")

# ── en el ranking se ven sus puntos de verdad ──
rep("""<span class="rk-pt">${ptsDeRank(r)} pts</span></div>`;""",
    """<span class="rk-pt">${p.pts != null ? p.pts : ptsDeRank(r)} pts</span></div>`;""")

open(p, 'w', encoding='utf-8').write(s)
print('el circuito juega solo')
