import os, re
# Porcentajes exactos: el número que se ve es la probabilidad con la que se decide, y es el mismo en todas las pantallas.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)

def rep(s, a, b, nombre):
    c = s.count(a)
    assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:90])
    return s.replace(a, b)
def funcion(s, nombre, nuevo):
    a = s.index('function ' + nombre + '(')
    b = s.index('\n}\n', a) + 3
    return s[:a] + nuevo.strip('\n') + '\n' + s[b:]

# ── carrera ──
s = leer('c-carrera.js')
s = funcion(s, 'probPartido', r'''
/* La probabilidad de ganar el partido. Se calcula una vez por rival, se enseña redondeada y ESE número es el que decide */
function probPartido(j, opp, ev){
  if(opp._prob == null){
    let g = 0; const N = 300;
    for(let i = 0; i < N; i++) if(simularPartido(j, opp, ev, 0, TIERS[ev.t].rondas).gane) g++;
    opp._prob = clamp(Math.round(100*g/N), 1, 99);
  }
  return opp._prob;
}
/* Un partido simulado que acaba como ya se decidió: se repite hasta que sale ese resultado */
function simularConResultado(j, opp, ev, ronda, total, gana){
  let res = null;
  for(let k = 0; k < 400; k++){ res = simularPartido(j, opp, ev, ronda, total); if(res.gane === gana) return res; }
  /* si con esa diferencia de nivel casi nunca sale, se le da la vuelta al marcador del último */
  res.gane = gana;
  res.sets = res.sets.map(x => x.split('-').reverse().join('-'));
  res.oros = (res.oros || []).map(x => !x);
  if(res.red != null) res.red = 1 - res.red;
  const r = res.roturas; res.roturas = res.roturasContra; res.roturasContra = r;
  return res;
}''')
s = rep(s, "  const res = simularPartido(j, to.rival, to.ev, to.enPrevia ? 0 : to.ronda, T.rondas);",
        "  /* el % que se ve es la probabilidad exacta: primero se decide con él y después se simula un partido con ese resultado */\n"
        "  const res = simularConResultado(j, to.rival, to.ev, to.enPrevia ? 0 : to.ronda, T.rondas, Math.random() < probPartido(j, to.rival, to.ev)/100);", 'c-carrera.js')
s = rep(s, "const probObjetivo = to => clamp(probPartido(S.j, to.rival, to.ev)/100, .03, .97);",
        "const probObjetivo = to => probPartido(S.j, to.rival, to.ev)/100;          // el mismo número que se ve en el torneo, sin redondeos aparte", 'c-carrera.js')
s = funcion(s, 'crearCaminoMomento', r'''
function crearCaminoMomento(j, obj){
  /* Se pasa con la probabilidad exacta del partido, elijáis la casilla que elijáis: las parejas que os ganan se
     colocan al elegir. Lo que se ve (cuántas casillas y cuántas os sacan) se dibuja a partir de ese mismo %. */
  const casillas = obj >= .8 || obj <= .2 ? 6 : 5, nMinas = clamp(Math.round((1 - obj)*casillas), 1, casillas - 1);
  /* con Mental alto ves venir una casilla mala, igual que en el cuadro: esa os saca seguro */
  const probPista = clamp((j.stats.mental - 45) / 60, 0, 0.85);
  const pista = nMinas >= 2 && Math.random() < probPista ? ri(0, casillas - 1) : null;
  return { casillas, nMinas, obj, minas:[], pista, falladas:[], elegida:null, vidas: j.equipo.psico ? 1 : 0, salvada:false };
}''')
s = funcion(s, 'elegirCaminoMomento', r'''
function elegirCaminoMomento(i){
  const m = S.torneo && S.torneo.momento; if(!m || m.forma !== 'camino' || m.eleccion) return;
  const c = m.camino;
  if(i < 0 || i >= c.casillas || c.falladas.indexOf(i) >= 0) return;
  c.salvada = false;
  const gana = i !== c.pista && Math.random() < (c.obj != null ? c.obj : .5);
  if(!gana && c.vidas > 0){ c.vidas--; c.falladas.push(i); c.salvada = true; guardar(); render(); return; }
  c.elegida = i;
  c.minas = colocarMinas(c, i, gana);
  m.eleccion = { i, gana, texto: gana ? pick(CAMINO_BIEN) : pick(CAMINO_MAL) };
  guardar(); render();
}
/* al destapar: las falladas, la que visteis venir, la elegida si os sacó y el resto al azar hasta completar */
function colocarMinas(c, elegida, gana){
  const minas = c.falladas.slice();
  if(c.pista !== null && minas.indexOf(c.pista) < 0) minas.push(c.pista);
  if(!gana && minas.indexOf(elegida) < 0) minas.push(elegida);
  const libres = [...Array(c.casillas).keys()].filter(x => x !== elegida && minas.indexOf(x) < 0);
  while(minas.length < c.nMinas && libres.length) minas.push(libres.splice(ri(0, libres.length - 1), 1)[0]);
  return minas;
}''')
s = rep(s, "${m.camino.minas.length === 1 ? 'uno' : 'algunos'}", "${m.camino.nMinas === 1 ? 'uno' : 'algunos'}", 'c-carrera.js')
s = rep(s, "  if(m.prob == null) m.prob = Math.round(100*probJuego(m.pPunto, m.inicio[0], m.inicio[1]));",
        "  if(m.prob == null) m.prob = m.obj != null ? Math.round(m.obj*100) : Math.round(100*probJuego(m.pPunto, m.inicio[0], m.inicio[1]));", 'c-carrera.js')
s = funcion(s, 'simularMomento', r'''
function simularMomento(){
  const m = S.torneo && S.torneo.momento; if(!m) return;
  /* exactamente el % que se ve */
  resolverMomento(Math.random() < (m.obj != null ? m.obj : probJuego(m.pPunto, m.inicio[0], m.inicio[1])), false, null);
}''')
escribir('c-carrera.js', s)

# ── vistas ──
v = leer('c-vistas.js')
v, n = re.subn(r"    const minasVivas = c\.minas\.length - fall\.length.*?Elige\.</p>",
  "    const quedan = c.casillas - fall.length, avisoVivo = c.pista !== null && fall.indexOf(c.pista) < 0;\n"
  "    const pc = Math.round(100*(c.obj != null ? c.obj : .5)), col = pc>=70?'var(--bien)':pc>=45?'var(--gold)':'var(--danger)';\n"
  "    h += `<div class=\"prob\" style=\"margin-top:9px\"><span class=\"barra\"><i style=\"width:${pc}%\"></i></span><span class=\"cifra\" style=\"color:${col}\">${pc}% de pasar</span></div>\n"
  "      <p class=\"muted\" style=\"margin:7px 0 0\">${quedan} caminos por probar. <b style=\"color:var(--text)\">Elijáis el que elijáis${avisoVivo ? ' (menos el marcado, que os saca seguro)' : ''}, pasáis con el ${pc}% exacto</b>${c.vidas > 0 ? ' · 🛡️ tu psicólog@ os salva de un error' : ''}.</p>",
  v, flags=re.S)
assert n == 1, 'casillas: %d' % n
v = rep(v, "    const maxW = Math.max.apply(null, b.w);", "    const vals = b.mostrado || b.w, maxW = Math.max.apply(null, vals);", 'c-vistas.js')
v = rep(v, "${b.w[i] === maxW ? 'top' : ''}", "${vals[i] === maxW ? 'top' : ''}", 'c-vistas.js')
v = rep(v, "${L.exacta ? b.w[i] + '%' : b.w[i] === maxW ? 'lo más probable' : '&nbsp;'}", "${L.exacta ? vals[i] + '%' : vals[i] === maxW ? 'lo más probable' : '&nbsp;'}", 'c-vistas.js')
v = rep(v, "${L.exacta ? 'Casi siempre es verdad.' : 'O eso parece.'}", "${L.exacta ? 'Ya está contado en los porcentajes.' : 'O eso parece.'}", 'c-vistas.js')
v = rep(v, "    const bola = { w, dir, chivato };\n    if(obj != null){\n      /* tapando la zona más probable, cada bola sale bien lo justo para ganar 2 de 3 con la probabilidad del partido */\n      const pc = Math.max.apply(null, w)/100, sT = aciertoParaDosDeTres(obj);",
  "    /* lo que se enseña es la probabilidad exacta de cada zona, contando lo que delata el perfil (acierta 8 de cada 10) */\n"
  "    const post = chivato === null ? w.map(x => x/100) : (() => { const q = w.map((x, i) => x*(i === chivato ? .8 : .1)), t = q.reduce((a, x) => a + x, 0); return q.map(x => x/t); })();\n"
  "    const mostrado = post.map(x => Math.round(100*x)); mostrado[1] = 100 - mostrado[0] - mostrado[2];\n"
  "    const bola = { w, dir, chivato, post, mostrado };\n    if(obj != null){\n"
  "      /* tapando la zona marcada (la más probable), cada bola sale bien lo justo para ganar 2 de 3 con la probabilidad exacta del partido */\n"
  "      const pc = Math.max.apply(null, post), sT = aciertoParaDosDeTres(obj);", 'c-vistas.js')
v = rep(v, "  h += m.forma === 'tiempo' ? rafagaHTML(m.rafaga) : m.forma === 'leer' ? leerHTML(m.leer) : casillasHTML(m, false);",
  "  { const pr = probMomento(m), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';\n"
  "    h += `<div class=\"prob\" style=\"margin:0 2px 4px\"><span class=\"barra\"><i style=\"width:${pr}%\"></i></span><span class=\"cifra\" style=\"color:${col}\">${pr}% de ganar</span></div>\n"
  "      <p class=\"muted\" style=\"margin:0 2px 11px\">${m.forma === 'leer' ? 'Es el mismo % del torneo: tapando la zona marcada, ganáis exactamente eso.' : m.forma === 'camino' ? 'Es el mismo % del torneo: elijáis la casilla que elijáis, pasáis exactamente con eso.' : 'Es el mismo % del torneo. Simulado es exacto; la zona verde está hecha para ese %, y con buen timing ganáis más.'}</p>`; }\n"
  "  h += m.forma === 'tiempo' ? rafagaHTML(m.rafaga) : m.forma === 'leer' ? leerHTML(m.leer) : casillasHTML(m, false);", 'c-vistas.js')
v = rep(v, "'Gana quien llegue antes a 4 puntos. A 40-40, punto de oro.'}<br>",
  "'Gana quien llegue antes a 4 puntos. A 40-40, punto de oro.'}<br>Es el mismo % del torneo: simulado es exacto; jugándolo en la pista, depende de cómo juegues.<br>", 'c-vistas.js')
v = rep(v, "<b>Ese % también manda en el momento clave.</b>", "<b>Ese % es exacto, también en el momento clave.</b>", 'c-vistas.js')
escribir('c-vistas.js', v)

# ── pruebas: al leer, tapar la zona marcada ──
p = leer('prueba.js')
p = rep(p, "A.leerZonaMomento(b.chivato !== null ? b.chivato : b.w.indexOf(Math.max(...b.w)));",
        "A.leerZonaMomento((b.post || b.w).indexOf(Math.max(...(b.post || b.w))));", 'prueba.js')
escribir('prueba.js', p)
print('patch5: porcentajes exactos')
