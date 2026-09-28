import os
# Exactitud fina: el camino con psicólog@ y simular un minijuego a medias dan justo el % que se ve.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)

def rep(s, a, b, nombre):
    c = s.count(a)
    assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:90])
    return s.replace(a, b)

# ── carrera ──
s = leer('c-carrera.js')
s = rep(s, "  const pista = nMinas >= 2 && Math.random() < probPista ? ri(0, casillas - 1) : null;\n"
           "  return { casillas, nMinas, obj, minas:[], pista, falladas:[], elegida:null, vidas: j.equipo.psico ? 1 : 0, salvada:false };",
        "  const pista = nMinas >= 2 && Math.random() < probPista ? ri(0, casillas - 1) : null;\n"
        "  /* con psicólog@ hay una segunda oportunidad: cada intento sale lo justo para que, contándola, se pase con el % exacto */\n"
        "  const vidas = j.equipo.psico ? 1 : 0, q = obj != null ? 1 - Math.pow(1 - obj, 1/(1 + vidas)) : null;\n"
        "  return { casillas, nMinas, obj, q, minas:[], pista, falladas:[], elegida:null, vidas, salvada:false };", 'c-carrera.js')
s = rep(s, "  const gana = i !== c.pista && Math.random() < (c.obj != null ? c.obj : .5);",
        "  const gana = i !== c.pista && Math.random() < (c.q != null ? c.q : c.obj != null ? c.obj : .5);", 'c-carrera.js')
PROB_MOMENTO = ("function probMomento(m){\n"
                "  if(m.prob == null) m.prob = m.obj != null ? Math.round(m.obj*100) : Math.round(100*probJuego(m.pPunto, m.inicio[0], m.inicio[1]));\n"
                "  return m.prob;\n}\n")
s = rep(s, PROB_MOMENTO, PROB_MOMENTO + r'''/* ganar 2 de 3 cuando ya lleváis `bien` aciertos y `mal` fallos, acertando cada una con probabilidad s */
function probDosDeTres(s, bien, mal){ return bien >= 2 ? 1 : mal >= 2 ? 0 : s*probDosDeTres(s, bien + 1, mal) + (1 - s)*probDosDeTres(s, bien, mal + 1); }
const momentoEmpezado = m => m.forma === 'leer' ? !!(m.leer && m.leer.k > 0) : m.forma === 'tiempo' ? !!(m.rafaga && m.rafaga.golpes.some(g => g.res))
  : m.forma === 'camino' ? !!(m.camino && m.camino.falladas.length) : false;
/* La probabilidad de ganar AHORA, con lo que ya se jugó del minijuego. Antes de empezar es la del torneo; a mitad,
   la que queda. Simular a mitad se decide con esta: no da ni más ni menos de lo que toca */
function probActualMomento(m){
  if(m.obj == null) return probJuego(m.pPunto, m.inicio[0], m.inicio[1]);
  if(m.forma === 'leer' && m.leer) return probDosDeTres(aciertoParaDosDeTres(m.obj), m.leer.aciertos, m.leer.fallos);
  if(m.forma === 'tiempo' && m.rafaga){
    const g = m.rafaga.golpes;
    return probDosDeTres(aciertoParaDosDeTres(m.obj), g.filter(x => x.res === 'bien' || x.res === 'perfecto').length, g.filter(x => x.res === 'fuera').length);
  }
  if(m.forma === 'camino' && m.camino && m.camino.q != null) return 1 - Math.pow(1 - m.camino.q, 1 + m.camino.vidas);
  return m.obj;
}
''', 'c-carrera.js')
s = rep(s, "  /* exactamente el % que se ve */\n  resolverMomento(Math.random() < (m.obj != null ? m.obj : probJuego(m.pPunto, m.inicio[0], m.inicio[1])), false, null);",
        "  /* exactamente el % que se ve: el del torneo, o el que queda si el minijuego ya había empezado */\n  resolverMomento(Math.random() < probActualMomento(m), false, null);", 'c-carrera.js')
escribir('c-carrera.js', s)

# ── vistas ──
v = leer('c-vistas.js')
v = rep(v, "  { const pr = probMomento(m), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';\n"
           "    h += `<div class=\"prob\" style=\"margin:0 2px 4px\"><span class=\"barra\"><i style=\"width:${pr}%\"></i></span><span class=\"cifra\" style=\"color:${col}\">${pr}% de ganar</span></div>\n"
           "      <p class=\"muted\" style=\"margin:0 2px 11px\">${m.forma === 'leer' ?",
        "  { const empezado = momentoEmpezado(m), pr = empezado ? Math.round(100*probActualMomento(m)) : probMomento(m), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';\n"
        "    h += `<div class=\"prob\" style=\"margin:0 2px 4px\"><span class=\"barra\"><i style=\"width:${pr}%\"></i></span><span class=\"cifra\" style=\"color:${col}\">${pr}% de ganar${empezado ? ' ahora' : ''}</span></div>\n"
        "      <p class=\"muted\" style=\"margin:0 2px 11px\">${empezado ? (m.forma === 'camino' ? 'Ya usasteis la ayuda del psicólog@: este es el % que os queda, elijáis el camino que elijáis.'"
        " : 'Con lo que lleváis, este es el % que os queda' + (m.forma === 'leer' ? ' tapando la zona marcada' : '') + '. Si lo simuláis ahora, se decide con él.')"
        " : m.forma === 'leer' ?", 'c-vistas.js')
v = rep(v, "    const pc = Math.round(100*(c.obj != null ? c.obj : .5)), col =",
        "    const pc = Math.round(100*(c.obj != null ? probActualMomento(m) : .5)), col =", 'c-vistas.js')
v = rep(v, "exacto</b>${c.vidas > 0 ? ' · 🛡️ tu psicólog@ os salva de un error' : ''}.</p>",
        "exacto</b>${c.vidas > 0 ? ', contando que tu psicólog@ os salva de un error 🛡️' : ''}.</p>", 'c-vistas.js')
escribir('c-vistas.js', v)
print('patch6: camino con psicólog@ y simular a mitad, exactos')
