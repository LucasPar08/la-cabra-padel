import sys
# Séptima pasada sobre el archivo montado (código de la v1): el país deja de dar
# ventaja. Ni pista impuesta ni estadísticas de regalo: se elige todo a mano y
# todo el mundo empieza igual, sea de España o de Nicaragua.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── 1) elegir país ya no te cambia la pista favorita ──
rep("""function cambiarPais(id){
  CFG.pais = id;
  CFG.ciudad = ciudadesDe(id)[0].n;
  CFG.pistaFav = paisPorId(id).pista;
  render();
}""",
"""function cambiarPais(id){
  CFG.pais = id;
  CFG.ciudad = ciudadesDe(id)[0].n;
  render();          /* la pista favorita es tuya, no de tu país */
}""")

# ── 2) los puntos de salida los da tu estilo, no la ciudad donde naciste ──
rep("""function nuevoJugador(cfg){
  const est = ESTILOS[cfg.estilo];""",
"""/* Los tres puntos que antes regalaba la ciudad ahora los da el estilo que
   eliges. Van al segundo, al cuarto y al sexto golpe en importancia para ese
   estilo: son tres puntos de verdad, pero no colocados en lo que más suma, que
   sería empezar más fuerte que antes. Todo el mundo empieza igual. */
function bonoEstilo(est){
  const orden = STAT_KEYS.slice().sort((a, b) => est.pesos[b] - est.pesos[a]);
  const b = {};
  for(const i of [1, 3, 5]) b[orden[i]] = 1;
  return b;
}
function nuevoJugador(cfg){
  const est = ESTILOS[cfg.estilo];""")
rep("  for(const k of STAT_KEYS) stats[k] = est.base[k] + (ciu.bono[k]||0) + (posBono[k]||0) + ri(-2,2) + ventaja + 8;",
    "  const bonoEst = bonoEstilo(est);\n  for(const k of STAT_KEYS) stats[k] = est.base[k] + (bonoEst[k]||0) + (posBono[k]||0) + ri(-2,2) + ventaja + 8;")
rep("  for(const k of STAT_KEYS) prev[k] = est.base[k] + (c.bono[k]||0) + (posBono[k]||0) + 8;",
    "  const bonoEst = bonoEstilo(est);\n  for(const k of STAT_KEYS) prev[k] = est.base[k] + (bonoEst[k]||0) + (posBono[k]||0) + 8;")

# ── 3) la pantalla de crear: fuera la pista del país y fuera los bonos de ciudad ──
rep("""      ${fichaPais(pais.cod)}
      ${pastillaPista(pais.pista)}
      <span class="muted" style="flex:1;min-width:0">${esc(pais.d)}</span>""",
"""      ${fichaPais(pais.cod)}
      <span class="muted" style="flex:1;min-width:0">${esc(pais.d)}</span>""")
rep("""    <p class="muted" style="margin:7px 0 0">${esc(c.n)} · ${c.alt} — ${esc(c.d)}</p>
    <div style="margin-top:6px">${Object.keys(c.bono).map(k=>
      `<span class="pill acc" style="margin:0 4px 0 0">+${c.bono[k]} ${STAT_NOM[k]}</span>`).join('')}</div>""",
"""    <p class="muted" style="margin:7px 0 0">${esc(c.n)} · ${c.alt} — ${esc(c.d)}</p>
    <p class="muted" style="margin:6px 0 0;font-size:12px">De dónde seas no te da ni te quita nivel: todas las carreras empiezan igual.</p>""")

# los puntos de salida se ven donde se eligen: en el estilo
rep("""        <span class="d" style="margin-top:4px">Mejor en ${pastillaPista(mejor)}</span></span>""",
"""        <span class="d" style="margin-top:4px">Mejor en ${pastillaPista(mejor)}</span>
        <span class="d" style="margin-top:4px">${Object.keys(bonoEstilo(e)).map(x=>`<span class="pill acc" style="margin:0 4px 0 0">+${bonoEstilo(e)[x]} ${STAT_NOM[x]}</span>`).join('')}</span></span>""")
rep("""    <label class="f">Pista favorita</label>""",
"""    <label class="f">Pista favorita</label>
    <p class="muted" style="margin:0 0 6px;font-size:12px">La eliges tú. Los torneos de tu tierra se juegan en esta pista, y en ella vales <b>+0,6 de nivel</b>.</p>""")

# ── 4) en casa se juega en tu pista, y el empujón de jugar en casa es igual para todos ──
rep("""    return { t, nom: nomTier(t) + ' de ' + c, ciudad:c,
             pista: enCasa ? miPais.pista : g.pista,
             pais: casa.includes(c) ? miPais.id : null };""",
"""    return { t, nom: nomTier(t) + ' de ' + c, ciudad:c,
             pista: enCasa ? pistaDeCasa(j) : g.pista,
             /* sólo la gira de tu tierra cuenta como casa: así el de un país con
                muchos torneos no juega más veces en casa que los demás */
             pais: enCasa ? miPais.id : null };""")
rep("  return Object.assign({}, g, {nom, d, pista: enCasa ? miPais.pista : g.pista, torneos});",
    "  return Object.assign({}, g, {nom, d, pista: enCasa ? pistaDeCasa(j) : g.pista, torneos});")
rep("""function concretarGira(g, j){""",
"""/* La pista de tu gira de casa: la que elegiste. Las carreras viejas, guardadas
   antes de esto, siguen con la que les puso su país. */
function pistaDeCasa(j){ return (j && j.pistaFav) || paisDe(j).pista; }
function concretarGira(g, j){""")

open(p, 'w', encoding='utf-8').write(s)
print('el país ya no da ventaja')
