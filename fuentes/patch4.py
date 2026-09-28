import os
# El % de ganar que se ve en el torneo manda también en los momentos clave.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()

def cambiar(nombre, pares):
    s = leer(nombre)
    for a, b in pares:
        c = s.count(a)
        assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:90])
        s = s.replace(a, b)
    open(os.path.join(D, nombre), 'w', encoding='utf-8').write(s)

AYUDAS = r'''/* ── La probabilidad que ves es la de verdad ──
   El % de ganar del torneo manda también en el momento clave: la ventaja con
   la que empezáis, las casillas buenas, lo grande que es la zona verde y lo que
   pesa cada bola bien leída salen de ese mismo número. Simulado, se gana
   exactamente ese porcentaje; jugado, depende de lo bien que lo hagas. */
function probJuego(p, a, b){ return a >= 4 ? 1 : b >= 4 ? 0 : p*probJuego(p, a+1, b) + (1-p)*probJuego(p, a, b+1); }
function pPuntoParaJuego(obj, inicio){
  let lo = .005, hi = .995;
  for(let k = 0; k < 30; k++){ const mid = (lo + hi)/2; if(probJuego(mid, inicio[0], inicio[1]) < obj) lo = mid; else hi = mid; }
  return (lo + hi)/2;
}
/* acierto por intento que hace falta para ganar 2 de 3 con probabilidad obj */
function aciertoParaDosDeTres(obj){
  let lo = 0, hi = 1;
  for(let k = 0; k < 30; k++){ const s = (lo + hi)/2; if(s*s*(3 - 2*s) < obj) lo = s; else hi = s; }
  return (lo + hi)/2;
}
function erfinv(x){
  const a = 0.147, l = Math.log(1 - x*x), t = 2/(Math.PI*a) + l/2;
  return Math.sign(x) * Math.sqrt(Math.sqrt(t*t - l/a) - t);
}
const probObjetivo = to => clamp(probPartido(S.j, to.rival, to.ev)/100, .03, .97);
const inicioDesdeProb = p => p >= .85 ? [2,0] : p >= .7 ? [1,0] : p >= .42 ? [0,0] : p >= .28 ? [0,1] : [0,2];
const edgeDesdeProb = p => (p - .5)*40;

/* ── Los momentos clave ── */'''

cambiar('c-carrera.js', [
  ("/* ── Los momentos clave ── */", AYUDAS),
  ("function crearCaminoMomento(j, edge){\n  const objetivo = clamp(0.62 + edge*0.05 + difActual().eleccion, 0.5, 0.9);\n  let casillas = 4, nMinas = 2, mejorDif = Infinity;\n  for(let c = 4; c <= 6; c++) for(let m = 1; m <= 3; m++){",
   "function crearCaminoMomento(j, obj){\n  const objetivo = clamp(obj, 0.25, 0.9);            // la parte de casillas buenas es el % del partido\n  let casillas = 4, nMinas = 2, mejorDif = Infinity;\n  for(let c = 4; c <= 8; c++) for(let m = 1; m <= 3; m++){"),
  ("  const edge = edgeDupla(j, to.rival, to.ev), forma = formaForzada || elegirForma(j, to);",
   "  const edge = edgeDupla(j, to.rival, to.ev), forma = formaForzada || elegirForma(j, to), obj = probObjetivo(to);"),
  ("  const m = { forma, esFinal, previa: !!to.enPrevia, saca, res, edge, juegos:[5,5], eleccion:null, pPunto: perfilDupla(j, to.rival, to.ev, j.energia).p };",
   "  const m = { forma, esFinal, previa: !!to.enPrevia, saca, res, edge, obj, juegos:[5,5], eleccion:null };"),
  ("    m.rafaga = crearRafaga(j, edge);", "    m.rafaga = crearRafaga(j, edge, obj);"),
  ("    m.leer = crearLectura(j, to.rival, edge);", "    m.leer = crearLectura(j, to.rival, edge, obj);"),
  ("    m.tipo = 'camino'; m.inicio = inicioMomento(edge);\n    m.camino = crearCaminoMomento(j, edge);",
   "    m.tipo = 'camino'; m.inicio = inicioDesdeProb(obj);\n    m.camino = crearCaminoMomento(j, obj);"),
  ("    const opciones = SITUACIONES_PISTA.map((x, i) => i).filter(i => i !== j.situacionReciente), k = pick(opciones), sit = SITUACIONES_PISTA[k];",
   "    /* con un % muy alto o muy bajo no tiene sentido empezar con una bola de partido o un punto de oro */\n"
   "    const opciones = SITUACIONES_PISTA.map((x, i) => i).filter(i => i !== j.situacionReciente && (!SITUACIONES_PISTA[i].inicio || (obj >= .3 && obj <= .8))), k = pick(opciones), sit = SITUACIONES_PISTA[k];"),
  ("    m.inicio = sit.inicio ? sit.inicio.slice() : inicioMomento(edge);", "    m.inicio = sit.inicio ? sit.inicio.slice() : inicioDesdeProb(obj);"),
  ("    m.sit = sit.txt(esFinal, m.saca);\n  }\n  return m;\n}",
   "    m.sit = sit.txt(esFinal, m.saca);\n  }\n  m.pPunto = pPuntoParaJuego(obj, m.inicio);      // simulado desde ese marcador, se gana justo el % del partido\n  return m;\n}"),
  ("  if(m.prob == null){\n    let g = 0; const N = 1500;\n    for(let i = 0; i < N; i++){ const s = m.inicio.slice(); while(s[0] < 4 && s[1] < 4){ if(Math.random() < m.pPunto) s[0]++; else s[1]++; } if(s[0] >= 4) g++; }\n    m.prob = Math.round(100*g/N);\n  }",
   "  if(m.prob == null) m.prob = Math.round(100*probJuego(m.pPunto, m.inicio[0], m.inicio[1]));"),
  ("  const cfg = cfgPartidoCarrera(j, to.rival, to.ev, rotulo);\n",
   "  const cfg = cfgPartidoCarrera(j, to.rival, to.ev, rotulo);\n"
   "  if(m.obj != null) cfg.rival = paramsRivalPista(edgeDesdeProb(m.obj) + difActual().rival, to.rival.arq);   // rivales tan buenos como dice el %\n"),
])

cambiar('c-vistas.js', [
  ("${prob}% de ganar simulando</span>", "${prob}% de ganar</span>"),
  ("leyendo al rival o eligiendo camino.'}", "leyendo al rival o eligiendo camino. <b>Ese % también manda en el momento clave.</b>'}"),
  ("${pr}% si lo simulas</span>", "${pr}% de ganar si lo simulas</span>"),
  ("function crearLectura(j, opp, edge){", "function crearLectura(j, opp, edge, obj){"),
  ("    bolas.push({ w, dir, chivato });",
   "    const bola = { w, dir, chivato };\n"
   "    if(obj != null){\n"
   "      /* tapando la zona más probable, cada bola sale bien lo justo para ganar 2 de 3 con la probabilidad del partido */\n"
   "      const pc = Math.max.apply(null, w)/100, sT = aciertoParaDosDeTres(obj);\n"
   "      if(sT >= pc){ bola.escapa = 0; bola.salva = (sT - pc)/(1 - pc); } else { bola.salva = 0; bola.escapa = 1 - sT/pc; }\n"
   "    }\n"
   "    bolas.push(bola);"),
  ("  return { bolas, k:0, aciertos:0, fallos:0, hist:[], exacta: lectura >= .45, estilo: est.txt,",
   "  return { bolas, k:0, aciertos:0, fallos:0, hist:[], obj: obj != null ? obj : null, exacta: lectura >= .45, estilo: est.txt,"),
  ("ok = leida ? Math.random() >= L.escapa : Math.random() < L.salva;",
   "ok = leida ? Math.random() >= (b.escapa != null ? b.escapa : L.escapa) : Math.random() < (b.salva != null ? b.salva : L.salva);"),
  ("${L.estilo} <b style=\"color:var(--text)\">Leéis 2 de 3 y el punto es vuestro.</b>",
   "${L.estilo} <b style=\"color:var(--text)\">Leéis 2 de 3 y el punto es vuestro.</b>${L.obj != null ? ` Tapando siempre la zona más probable ganáis el <b style=\"color:var(--text)\">${Math.round(L.obj*100)}%</b> de las veces.` : ''}"),
  ("function crearRafaga(j, edge){\n  const D = difActual(), s = j.stats, e = clamp(edge, -15, 15);\n  const golpes = pick(SERIES_RAFAGA).map(([ic, nom, stat]) => {\n    const w = clamp(0.17 + 0.05*clamp((s[stat] - 55)/40, -1, 1) + D.rafaga + e*0.004, 0.1, 0.42);",
   "function crearRafaga(j, edge, obj){\n  const D = difActual(), s = j.stats, e = clamp(edge, -15, 15), sT = obj != null ? aciertoParaDosDeTres(obj) : null;\n  const golpes = pick(SERIES_RAFAGA).map(([ic, nom, stat]) => {\n"
   "    const extra = 0.05*clamp((s[stat] - 55)/40, -1, 1);\n"
   "    /* en un torneo, la zona verde mide lo que hace falta para acertar 2 de 3 con el % del partido */\n"
   "    const w = sT != null ? clamp(0.33*erfinv(Math.min(sT, .985)) + extra*.5, 0.06, 0.46) : clamp(0.17 + extra + D.rafaga + e*0.004, 0.1, 0.42);"),
  ("  return { golpes, dur: clamp(1100 + e*14 + D.rafagaMs, 650, 1800),",
   "  return { golpes, dur: sT != null ? clamp(1150 + 400*(obj - .5), 950, 1350) : clamp(1100 + e*14 + D.rafagaMs, 650, 1800),"),
])

cambiar('prueba.js', [
  ("A.pegarRafaga(Math.min(1, Math.max(0, g.centro + gaussP()*0.11)));", "A.pegarRafaga(Math.min(1, Math.max(0, g.centro + gaussP()*0.12)));"),
])
print('patch4: el % del partido manda en los momentos clave')
