import sys
# Quinta pasada sobre el archivo montado (código de la v1): el circuito de verdad.
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# ── el pool del circuito sale de las parejas reales ──
rep("""function nuevaParejaCircuito(rank){
  const d = duplaRival(rank);
  return { id:'c' + ri(100000, 999999), nombre:d.nombre, nombre2:d.nombre2, flag:d.flag, flag2:d.flag2, arq:d.arq, forma:rnd(-2, 2), titulos:0 };
}""",
"""function nuevaParejaCircuito(rank, pool){
  const r = parejaRealCircuito(rank, pool);
  if(r) return r;
  const hay = new Set();
  for(const p of pool || []){ hay.add(p.nombre); hay.add(p.nombre2); }
  let d = duplaRival(rank);
  for(let i = 0; i < 12 && (hay.has(d.nombre) || hay.has(d.nombre2) || d.nombre === d.nombre2); i++) d = duplaRival(rank);
  return { id:'c' + ri(100000, 999999), nombre:d.nombre, nombre2:d.nombre2, flag:d.flag, flag2:d.flag2, arq:d.arq, forma:rnd(-2, 2), titulos:0 };
}""")
rep("    for(let k = 1; k <= 40; k++){ const p = nuevaParejaCircuito(k); p.titulos = Math.max(0, Math.round((41 - k)/5 + rnd(-1, 2))); j.circuito.push(p); }",
    "    for(let k = 1; k <= 40; k++){ const p = nuevaParejaCircuito(k, j.circuito); if(!p.real) p.titulos = Math.max(0, Math.round((41 - k)/5 + rnd(-1, 2))); j.circuito.push(p); }")
rep("pool.push(nuevaParejaCircuito(40));", "pool.push(nuevaParejaCircuito(40, pool));")
# las carreras de antes del circuito real lo reciben al retomarlas
rep("""  }
  return j.circuito;
}
/* cada casilla del circuito ocupa un puesto del ranking""",
"""  }
  else if(migrarCircuitoReal(j)) guardar();      /* carrera vieja: entran los de verdad */
  return j.circuito;
}
/* cada casilla del circuito ocupa un puesto del ranking""")


# ── cuando buscas pareja, te la ofrecen del circuito de verdad ──
rep("""function nuevaPareja(nivel, cod, pos, edad, estilo){
  nivel = clamp(nivel, 38, 95);
  if(!estilo) estilo = pick(Object.keys(ESTILOS));
  return {
    estilo,
    nombre: pick(nombresDePila()) + ' ' + pick(NOM_B),
    apodo: Math.random()<0.35 ? pick(APODOS) : null,
    flag: cod || pick(NAC_RIV),
    pos: pos || pick(['drive','reves']),
    nivel: Math.round(nivel*10)/10,
    edad: edad || ri(19, 31),""",
"""function nuevaPareja(nivel, cod, pos, edad, estilo){
  nivel = clamp(nivel, 38, 95);
  if(!estilo) estilo = pick(Object.keys(ESTILOS));
  const real = typeof jugadorRealLibre === 'function' ? jugadorRealLibre(cod, pos, nivel, edad) : null;
  return {
    estilo,
    nombre: real ? real.nombre : pick(nombresDePila()) + ' ' + pick(NOM_B),
    apodo: real ? null : (Math.random()<0.35 ? pick(APODOS) : null),
    real: !!real,
    flag: real ? real.flag : (cod || pick(NAC_RIV)),
    pos: pos || pick(['drive','reves']),
    nivel: Math.round(nivel*10)/10,
    edad: real ? real.edad : (edad || ri(19, 31)),""")

# ── que se vea de dónde salen los nombres ──
rep("""  return `<div class="fade">
  <div class="card event-hero"><div class="eyebrow">${ico('ranking')} RANKING MUNDIAL</div>
    <div class="title-lg" style="margin:5px 0 4px">Las 20 mejores parejas</div>""",
"""  const pieReal = `<p class="muted" style="margin:9px 0 0;font-size:12px">Jugadores y parejas de verdad del Premier Padel ${esF() ? 'femenino' : 'masculino'}: las parejas del cuadro del París Major y el ranking FIP del ${RANKING_FECHA}, con los títulos que llevan en 2026. Del puesto 21 para abajo, parejas del juego.</p>`;
  return `<div class="fade">
  <div class="card event-hero"><div class="eyebrow">${ico('ranking')} RANKING MUNDIAL</div>
    <div class="title-lg" style="margin:5px 0 4px">Las 20 mejores parejas</div>""")
rep("""  <div class="card">${filas}${!j.ranking ? '<p class="muted" style="margin:8px 0 0">Suma puntos en los FIP para entrar en el ranking.</p>' : ''}</div>""",
"""  <div class="card">${filas}${!j.ranking ? '<p class="muted" style="margin:8px 0 0">Suma puntos en los FIP para entrar en el ranking.</p>' : ''}${pieReal}</div>""")

# ── las parejas mixtas llevan las dos banderas ──
rep("""    filas += `<div class="rk-fila"><span class="rk-n">#${r}</span><span class="rk-nm">${fichaPais(p.flag)} ${esc(p.nombre)} / ${esc(p.nombre2)}""",
"""    filas += `<div class="rk-fila"><span class="rk-n">#${r}</span><span class="rk-nm">${fichaPais(p.flag)} ${esc(p.nombre)} / ${p.flag2 && p.flag2 !== p.flag ? fichaPais(p.flag2) + ' ' : ''}${esc(p.nombre2)}""")

open(p, 'w', encoding='utf-8').write(s)
print('circuito real conectado')
