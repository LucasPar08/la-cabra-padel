import sys
# Undécima pasada: la temporada por fechas. 52 semanas, cada torneo en su semana,
# uno por semana como mucho, y el juego te dice cuál te conviene (o lo elige él).
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── 1) cada torneo, en su semana ──
rep("  return TRIMESTRES.map((tr,i)=>({ idx:i, tr, giras: tr.giras.map(g=>concretarGira(g, j)) }));",
    "  return TRIMESTRES.map((tr,i)=>({ idx:i, tr, giras: asignarSemanas(tr.giras.map(g=>concretarGira(g, j))) }));")

# ── 2) sólo se entra en los torneos de esta semana (antes: hasta 3 por trimestre) ──
rep("  if(tr.jugados.length >= TORNEOS_POR_TRIMESTRE) return { tipo:'lleno', txt:`Ya jugaste ${TORNEOS_POR_TRIMESTRE} torneos este trimestre` };",
    """  asegurarSemanas();
  if(ev.sem != null && ev.sem !== semanaActual(j))
    return { tipo:'otra', txt: ev.sem < semanaActual(j) ? 'Ya se jugó' : `Se juega la semana ${semanaDelAnio(j, ev.sem)} (${fechaSemCorta(j, semanaDelAnio(j, ev.sem))})` };""")
rep("""  else estado = `<span style="color:${est.tipo==='bajo'||est.tipo==='lleno'?'var(--muted)':'var(--danger)'};font-weight:800">${est.tipo==='bajo'?'⬇️':est.tipo==='lleno'?'⏸️':est.tipo==='lesion'?'🩹':'🔒'} ${esc(est.txt)}</span>`;""",
    """  else estado = `<span style="color:${est.tipo==='bajo'||est.tipo==='lleno'||est.tipo==='otra'?'var(--muted)':'var(--danger)'};font-weight:800">${est.tipo==='bajo'?'⬇️':est.tipo==='lleno'?'⏸️':est.tipo==='otra'?'📅':est.tipo==='lesion'?'🩹':'🔒'} ${esc(est.txt)}</span>`;""")

# ── 3) al terminar un torneo se pasa a la semana siguiente ──
rep("""function salirTorneo(){
  S.torneo = null; S.verTorneo = null; S.pantalla = 'temporada';
  guardar(); render();
}""",
"""function salirTorneo(){
  const jugado = S.torneo && S.torneo.fin;
  S.torneo = null; S.verTorneo = null; S.pantalla = 'temporada';
  if(jugado && S.j){
    const tr = trimActual(), r = tr.jugados[tr.jugados.length - 1];
    if(r) anotarSemana(S.j, `${r.campeon ? '🏆' : '🎾'} ${r.nom} · ${r.campeon ? (esF() ? 'campeonas' : 'campeones') : r.ronda}`);
    S.j.energia = clamp(S.j.energia - DESGASTE_SEMANA_TORNEO, 0, 100);
    avanzarSemana(); return;
  }
  guardar(); render();
}""")

# ── 4) el bloque de trece semanas: la energía ya se recupera semana a semana y
#       las bajas se cuentan por semanas ──
rep("""  const rec = 34 + j.stats.fisico/8 + (j.equipo.fisio?12:0) + (j.equipo.preparador?10:0)
            + (tieneMejora(j,'altura')?10:0) + energiaExtraLujos(j);""",
"""  const rec = 4 + (tieneMejora(j,'altura')?6:0) + energiaExtraLujos(j);      // el resto ya se recupera semana a semana""")
rep("""  if(j.lesionSem > 0){ j.lesionSem--; if(j.lesionSem<=0){ j.lesion=null; S.msgs=[{txt:'✅ Te han dado el alta. De vuelta a la pista.'}]; } }
  j.trimestre++;""",
"""  j.trimestre++; j.semana = 1;""")
# la pretemporada es un descanso de verdad: se empieza el año con la energía llena
rep("""  j.anio++; j.trimestre = 0;
  j.mejoras = [];""", """  j.anio++; j.trimestre = 0; j.semana = 1; j.energia = 100;
  j.mejoras = [];""")

# ── 5) la pantalla de la temporada: la semana, lo que viene y el año entero ──
rep("""        <div class="eyebrow">TEMPORADA ${j.anio} · ${T.nom}</div>""",
    """        <div class="eyebrow">TEMPORADA ${anioCalendario(j)} · AÑO ${j.anio} DE TU CARRERA</div>""")
rep("""      <span class="pill acc" style="white-space:nowrap;flex:none">FECHA ${j.trimestre+1} DE ${TRIMESTRES_POR_ANIO}</span>""",
    """      <span class="pill acc" style="white-space:nowrap;flex:none">SEMANA ${semanaDelAnio(j)}/52</span>""")
rep("""te falta ${j.lesionSem} trimestre${j.lesionSem>1?'s':''} de baja.""",
    """te ${(j.bajaSemanas != null ? j.bajaSemanas : j.lesionSem*6) === 1 ? 'falta 1 semana' : 'faltan ' + (j.bajaSemanas != null ? j.bajaSemanas : j.lesionSem*6) + ' semanas'} de baja.""")
rep("""🛡️ <b>Defiendes ${d} pts</b> este trimestre""", """🛡️ <b>Defiendes ${d} pts</b> en estas semanas""")
rep("h += idoloTemporadaHTML(j) + mundialAvisoHTML(j) + noticiasHTML(j) + desafioHTML() + tarjetaPremios(j) + calendarioHTML(j, tr);",
    "h += noticiasHTML(j) + mundialAvisoHTML(j) + (tr.cerrado ? '' : semanaHTML(j, tr) + proximasHTML(j)) + idoloTemporadaHTML(j) + desafioHTML() + tarjetaPremios(j);")
i = s.index("  if(tr.cerrado) h += `<button class=\"btn\" onclick=\"pasarTrimestre()\">SIGUIENTE TRIMESTRE</button>")
k = s.index("""  h += `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px">
      <div class="eyebrow">TU PAREJA</div>""", i)
s = s[:i] + """  if(tr.cerrado) h += `<button class="btn" onclick="pasarTrimestre()">${ico('avanzar')} SEGUIR CON LA TEMPORADA</button><div style="height:11px"></div>`;

""" + s[k:]

# ── 6) la pantalla del año ──
rep("  else if(p==='idolo')        html += vIdolo();", "  else if(p==='idolo')        html += vIdolo();\n  else if(p==='calendario')   html += vCalendario();")

# ── perder en la previa ya no da casi lo mismo que ganar un FIP pequeño ──
rep("    r.pts = Math.max(1, Math.round(T.pts[T.pts.length-2] * 0.5));",
    "    r.pts = to.kPrevia >= 1 ? Math.max(1, Math.round(T.pts[T.pts.length-2] * 0.2)) : 0;   // perder el primero de la previa no da puntos")

open(p, 'w', encoding='utf-8').write(s)
print('temporada por fechas')
