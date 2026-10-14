import sys
# Duodécima pasada: los torneos de abajo (club, regional y nacional) y cada torneo
# de la semana con lo que te cuesta: fácil, a tu nivel, exigente o muy difícil.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── 1) el calendario de cada año trae los torneos de tu país ──
rep("  return TRIMESTRES.map((tr,i)=>({ idx:i, tr, giras: asignarSemanas(tr.giras.map(g=>concretarGira(g, j))) }));",
    "  return TRIMESTRES.map((tr,i)=>({ idx:i, tr, giras: asignarSemanas(tr.giras.map(g=>concretarGira(g, j))).concat([giraBase(j, i)]) }));")
# el mismo open regional puede volver otra semana: se distinguen por la semana
rep("""    const clave = ev.t + '|' + ev.nom;
    if(vistos.has(clave)) return;""", """    const clave = ev.t + '|' + ev.nom + (ev.base ? '|' + ev.sem : '');
    if(vistos.has(clave)) return;""")

# ── 2) la escalera empieza más abajo ──
rep("function orden(t){ return ['FIP1','FIP2','FIP3','FIP4','FIP5','P2','P1','MJ','FIN'].indexOf(t); }",
    "function orden(t){ return ['CLUB','REG','NAC','FIP1','FIP2','FIP3','FIP4','FIP5','P2','P1','MJ','FIN'].indexOf(t); }")
rep("""  return ({FIP1:'PROMISES', FIP2:'RISE',""", """  return ({CLUB:'CLUB', REG:'REGIONAL', NAC:'NACIONAL', FIP1:'PROMISES', FIP2:'RISE',""")
rep("""  return ({FIP1:'🎾',FIP2:'🎾',""", """  return ({CLUB:'🎾',REG:'🎾',NAC:'🎾',FIP1:'🎾',FIP2:'🎾',""")
rep("const COLOR_CAT = { FIP1:'var(--cat-fip)',", "const COLOR_CAT = { CLUB:'var(--cat-fip)', REG:'var(--cat-fip)', NAC:'var(--cat-fip)', FIP1:'var(--cat-fip)',")
rep("""                   5:['R32','OCTAVOS','CUARTOS','SEMIFINAL','FINAL'],""", """                   5:['R32','OCTAVOS','CUARTOS','SEMIFINAL','FINAL'],
                   4:['OCTAVOS','CUARTOS','SEMIFINAL','FINAL'],""")
rep("""['FIP RISE', ['FIP2']], ['FIP PROMISES', ['FIP1']],""", """['FIP RISE', ['FIP2']], ['FIP PROMISES', ['FIP1']], ['AMATEUR', ['NAC','REG','CLUB']],""")
rep("""  if(ev.pais) return ev.pais;
  if(CIUDAD_PAIS[ev.ciudad])""", """  if(ev.pais) return ev.pais;
  if(ev.sedePais) return ev.sedePais;
  if(CIUDAD_PAIS[ev.ciudad])""")

# ── 3) los rivales de abajo no tienen ranking FIP ──
rep("""  const tabla = rangos[tier] || rangos.FIP1;
  const rg = tabla[Math.min(ronda, tabla.length-1)];""", """  if(RANGOS_BASE[tier]){ const t = RANGOS_BASE[tier], rg = t[Math.min(ronda, t.length-1)]; return duplaAmateur(ri(rg[0], rg[1])); }
  const tabla = rangos[tier] || rangos.FIP1;
  const rg = tabla[Math.min(ronda, tabla.length-1)];""")
s = s.replace("function etiquetaTier(t){", "const rkTxt = o => o && o.rank > 2000 ? 'sin ranking' : '#' + (o && o.rank || '—');\nfunction etiquetaTier(t){", 1)
rep("""<span class="rk">#${p.opp.rank}</span>""", """<span class="rk">${rkTxt(p.opp)}</span>""")
rep("""· #${r.opp.rank}${r.opp.arq""", """· ${rkTxt(r.opp)}${r.opp.arq""")
rep("""<span class="rk">#${d.opp.rank}</span>""", """<span class="rk">${rkTxt(d.opp)}</span>""")
rep("""<span class="muted">#${riv.rank}</span>""", """<span class="muted">${rkTxt(riv)}</span>""")
rep("""<span class="rk">#${opp.rank}</span>""", """<span class="rk">${rkTxt(opp)}</span>""", 2)
rep("""<small>#${riv.rank}</small>""", """<small>${rkTxt(riv)}</small>""")

# ── 4) quién puede jugarlos: con ranking de arriba, ya no ──
rep("""function torneoDemasiadoBajo(j, ev){
  if(!j.ranking) return false;""", """function torneoDemasiadoBajo(j, ev){
  if(!j.ranking) return false;
  if(esBase(ev.t)) return j.ranking <= TOPE_BASE[ev.t];""")

# ── 5) un título de club no es un título FIP: va aparte ──
rep("""  if(r.campeon){
    j.titulos.push({nom:ev.nom, tier:ev.t,""", """  if(esBase(ev.t)){
    if(r.campeon){
      j.titulosBase = (j.titulosBase || 0) + 1;
      j.moral = clamp(j.moral+4,0,100);
      j.fama += 1;
      if(ev.t === 'NAC' || j.titulosBase === 1) j.hist.push({a:j.anio, t:`🏆 ${gx('Campeón','Campeona')}: ${esc(ev.nom)}`});
    }
  } else if(r.campeon){
    j.titulos.push({nom:ev.nom, tier:ev.t,""")
rep("""  const logros = chequearLogros(j, { perfecto: r.campeon && r.perfecto, remontada: r.remontada });
  to.fin = { r, rankAntes, logros };""", """  const logros = chequearLogros(j, esBase(ev.t) ? {} : { perfecto: r.campeon && r.perfecto, remontada: r.remontada });
  to.fin = { r, rankAntes, logros };""")
rep("""      : `<p class="muted" style="margin:8px 0 0">Todavía no tienes trofeos. El primero no se olvida nunca.</p>`}""",
    """      : `<p class="muted" style="margin:8px 0 0">${j.titulosBase ? `Todavía no tienes títulos FIP, pero ya ganaste <b style="color:var(--text)">${j.titulosBase}</b> torneo${j.titulosBase === 1 ? '' : 's'} en tu país.` : 'Todavía no tienes trofeos. El primero no se olvida nunca.'}</p>`}""")
rep("""      <div class="muted" style="margin-top:8px">${grupos.map(g=>`${g[0]} <b style="color:var(--text)">${n(g[2])}</b> ${g[1]}`).join(' · ')}</div>`""",
    """      <div class="muted" style="margin-top:8px">${grupos.map(g=>`${g[0]} <b style="color:var(--text)">${n(g[2])}</b> ${g[1]}`).join(' · ')}${j.titulosBase ? ` · 🎾 <b style="color:var(--text)">${j.titulosBase}</b> en tu país` : ''}</div>`""")

# ── 6) una semana de club cansa menos ──
rep("    S.j.energia = clamp(S.j.energia - DESGASTE_SEMANA_TORNEO, 0, 100);",
    "    S.j.energia = clamp(S.j.energia - (r && esBase(r.t) ? DESGASTE_SEMANA_BASE : DESGASTE_SEMANA_TORNEO), 0, 100);")

# ── 7) el circuito de las 40 parejas no juega los torneos de club ──
rep("  evs = (evs || []).filter(ev => TIERS[ev.t] && TIERS[ev.t].pts && TIERS[ev.t].pts[0]);",
    "  evs = (evs || []).filter(ev => TIERS[ev.t] && !TIERS[ev.t].base && TIERS[ev.t].pts && TIERS[ev.t].pts[0]);")

# ── 8) ganar en el club da confianza, pero no como ganarle a uno con ranking ──
rep("""    j.forma = clamp(j.forma + (opp.rank < (j.ranking||3000) ? 1.6 : 0.7), -12, 12);
    j.moral = clamp(j.moral + 2, 0, 100);""", """    j.forma = clamp(j.forma + (esBase(to.ev.t) ? .4 : opp.rank < (j.ranking||3000) ? 1.6 : 0.7), -12, 12);
    j.moral = clamp(j.moral + (esBase(to.ev.t) ? 1 : 2), 0, 100);""")

# ── 9) la energía, más tranquila: los partidos cansan la mitad y la previa menos ──
rep("""    energia -= Math.max(2.0, costo);""", """    energia -= Math.max(1.0, costo*.5);         // más tranquilo: se puede jugar casi todas las semanas""")
rep("        e = clamp(suma/N - (p.previa ? 7 : 0), 0, 100);", "        e = clamp(suma/N - (p.previa ? 3 : 0), 0, 100);")
rep("  j.energia = clamp(res.energia - (to.enPrevia ? 7 : 0), 0, 100);", "  j.energia = clamp(res.energia - (to.enPrevia ? 3 : 0), 0, 100);")

open(p, 'w', encoding='utf-8').write(s)
print('torneos de abajo')
