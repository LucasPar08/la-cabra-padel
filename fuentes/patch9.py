import os
# Tus chances, ronda a ronda: el torneo se sortea entero al abrirlo y cada ronda tiene su % exacto, el mismo que
# después la decide. Todos los minijuegos enseñan su %: el cuadro del Major (con las bolas de partido), leer al rival
# siempre con números y el Mundial.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)

def rep(s, a, b, nombre):
    c = s.count(a)
    assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:90])
    return s.replace(a, b)

# ── carrera ──
SORTEO = r'''/* ── El cuadro entero, sorteado de antemano ──
   Al abrir un torneo se sortea todo el camino: la pareja de cada ronda y vuestro % exacto contra cada una,
   con las piernas con las que llegaríais a esa ronda. Esos mismos números son los que deciden después, ronda a
   ronda (simulada, con momento clave o con minijuego). En un Major, cuartos y semis son el cuadro de casillas y
   su % sale exacto de sus caminos y de vuestras bolas de partido. */
function semillaDe(txt){ let h = 2166136261; for(let i = 0; i < txt.length; i++){ h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) || 1; }
/* con los mismos datos, el mismo número: el % no baila cada vez que miras el torneo */
function conSemilla(txt, fn){
  const r0 = Math.random; let s = semillaDe(txt);
  Math.random = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s/4294967296; };
  try{ return fn(); } finally { Math.random = r0; }
}
const fmtChance = x => x > 0 && x < .005 ? '<1%' : Math.round(100*x) + '%';
function claveChances(j){
  return [PREF.dificultad || 'normal', Math.round(j.energia), Math.round(j.forma || 0), j.equipo.psico ? 1 : 0,
          STAT_KEYS.map(k => Math.round(j.stats[k])).join('.'), j.pareja ? Math.round(j.pareja.nivel) + '.' + Math.round(j.pareja.quimica) : '-'].join('|');
}
function sorteoTorneo(ev, tipo){
  const tr = trimActual(), T = TIERS[ev.t];
  tr.sorteos = tr.sorteos || {};
  let so = tr.sorteos[ev.id];
  if(!so || so.tipo !== tipo || so.t !== ev.t)
    so = tr.sorteos[ev.id] = { tipo, t: ev.t, sal: String(Math.random()).slice(2, 10),
      previa: tipo === 'previa' ? [...Array(RONDAS_PREVIA)].map(() => rivalDePrevia(ev)) : [],
      cuadro: [...Array(T.rondas)].map((_, k) => generarRival(ev.t, k, T.rondas)), mj:null, probs:null, clave:null, dif:null };
  return so;
}
function pasosTorneo(ev, so){
  const T = TIERS[ev.t], esMJ = modoMinijuego(ev) === 'cuadro', pasos = [];
  so.previa.forEach((r, k) => pasos.push({ previa:true, k }));
  for(let k = 0; k < T.rondas; k++) pasos.push({ previa:false, k, cuadroMJ: esMJ && (k === T.rondas-3 || k === T.rondas-2), final: k === T.rondas-1 });
  return pasos;
}
/* El % de cada ronda desde `desde`, en orden: cada partido gasta piernas y el siguiente se juega con lo que quede */
function calcularChances(j, ev, so, desde){
  const T = TIERS[ev.t], ayuda = (difActual().ayuda || {})[ev.t] || 0, N = 300, e0 = j.energia, pasos = pasosTorneo(ev, so), dif = PREF.dificultad || 'normal';
  const antes = so.probs || { previa:[], cuadro:[], mj:null }, probs = { previa: antes.previa.slice(), cuadro: antes.cuadro.slice(), mj: antes.mj };
  let e = e0;
  try{
    pasos.forEach((p, i) => {
      if(i < desde) return;
      if(p.cuadroMJ){
        if(p.k === T.rondas-3){ so.mj = cuadroMajorPrevio(j, ev, so); probs.mj = probsCuadroMajor(so.mj.rondas, 1 + (j.equipo.psico ? 1 : 0)); }
        probs.cuadro[p.k] = null;
        if(p.k === T.rondas-2) e = clamp(e - 12, 0, 100);            // el cuadro gasta 6 de energía por partido
        return;
      }
      const rival = (p.previa ? so.previa : so.cuadro)[p.k];
      (p.previa ? probs.previa : probs.cuadro)[p.k] = conSemilla(so.sal + '|' + i + '|' + Math.round(e) + '|' + dif, () => {
        const opp = Object.assign({}, rival, { rating: rival.rating - ayuda });
        j.energia = e;
        let g = 0, suma = 0;
        for(let n = 0; n < N; n++){ const res = simularPartido(j, opp, ev, p.previa ? 0 : p.k, T.rondas); if(res.gane) g++; suma += res.energia; }
        e = clamp(suma/N - (p.previa ? 7 : 0), 0, 100);
        return clamp(Math.round(100*g/N), 1, 99);
      });
    });
  } finally { j.energia = e0; }
  so.probs = probs; so.dif = dif;
  return so;
}
/* Al mirar un torneo: el sorteo y sus chances (se recalculan solo si cambió algo vuestro: energía, nivel, dificultad…) */
function chancesTorneo(j, ev, tipo){
  const so = sorteoTorneo(ev, tipo), clave = claveChances(j);
  if(!so.probs || so.clave !== clave){ calcularChances(j, ev, so, 0); so.clave = clave; guardar(); }
  return so;
}
/* Si cambiáis la dificultad a mitad de torneo, se recalcula lo que queda (la ronda que toca incluida) */
function actualizarChancesEnCurso(j, to){
  const so = to.sorteo;
  if(!so || !so.probs || to.fin || to.momento || so.dif === (PREF.dificultad || 'normal')) return;
  calcularChances(j, to.ev, so, chanceTitulo(to.ev, so, to).hechos);
  const k = to.enPrevia ? to.kPrevia : to.ronda, base = (to.enPrevia ? so.previa : so.cuadro)[k], p = (to.enPrevia ? so.probs.previa : so.probs.cuadro)[k];
  if(base && to.rival && p != null){ to.rival.rating = base.rating - ((difActual().ayuda || {})[to.ev.t] || 0); to.rival._prob = p; }
  guardar();
}
/* Lo que dice la tabla: el % de cada ronda, el de llegar a la final y el de ganar el torneo desde donde estáis */
function chanceTitulo(ev, so, to){
  const T = TIERS[ev.t], P = so.probs, pasos = pasosTorneo(ev, so);
  const hechos = to ? (to.previa ? (to.enPrevia ? to.kPrevia : RONDAS_PREVIA + to.ronda) : to.ronda) : 0;
  const pr = pasos.map(p => p.cuadroMJ ? (P.mj ? P.mj[p.k === T.rondas-3 ? 0 : 1] : 0) : ((p.previa ? P.previa : P.cuadro)[p.k] || 0)/100);
  let acum = 1, final = 1, primera = null;
  pasos.forEach((p, i) => { if(i < hechos) return; if(primera === null) primera = pr[i]; if(p.final) final = acum; acum *= pr[i]; });
  return { pasos, pr, hechos, primera: primera || 0, final, titulo: acum };
}
/* Cuartos y semis de un Major, sorteados con las mismas reglas del cuadro de siempre */
function cuadroMajorPrevio(j, ev, so){
  const T = TIERS[ev.t], miR = ratingDupla(j, ev.pista, ev), D = difActual();
  return conSemilla(so.sal + '|mj|' + (PREF.dificultad || 'normal'), () => ({ rondas: [T.rondas-3, T.rondas-2].map(k => {
    const opp = so.cuadro[k];
    const objetivo = clamp(0.62 + (miR - opp.rating)*0.05 + D.eleccion, 0.45, 0.9);
    let casillas = 4, nMinas = 2, mejorDif = Infinity;
    for(let c = 4; c <= 6; c++) for(let m = 1; m <= 3; m++){
      if(c - m < 1) continue;
      const dif = Math.abs((c - m)/c - objetivo);
      if(dif < mejorDif){ mejorDif = dif; casillas = c; nMinas = m; }
    }
    const minas = [];
    while(minas.length < nMinas){ const x = ri(0, casillas-1); if(minas.indexOf(x) < 0) minas.push(x); }
    const probPista = clamp((j.stats.mental - 45) / 60, 0, 0.85);
    const pista = nMinas >= 2 && Math.random() < probPista ? minas[ri(0, minas.length-1)] : null;
    return { nom: k === T.rondas-2 ? 'SEMIFINAL' : 'CUARTOS', opp, casillas, minas, pista, elegida:null };
  }) }));
}
function cuadroDesdeSorteo(j, to, parcial){
  const vidas = 1 + (j.equipo.psico ? 1 : 0);
  return { ev: to.ev, parcial, rondas: JSON.parse(JSON.stringify(to.sorteo.mj.rondas)), actual:0, terminado:false, gano:false, vidas, vidasIniciales: vidas, salvada:false };
}
/* Chance exacta de pasar una ronda del cuadro con `vidas` bolas de partido: cuánto se pasa quedando con 0, 1, 2… vidas.
   Cualquier camino sin marcar tiene las mismas papeletas, así que no importa cuál elijáis */
function pasarRondaCuadro(r, vidas){
  const fall = r.falladas || [], avisoVivo = r.pista != null && fall.indexOf(r.pista) < 0;
  const f = (c, m, v) => {
    const out = new Array(vidas + 1).fill(0);
    if(c <= 0) return out;
    out[v] += (c - m)/c;
    if(m > 0 && v > 0) f(c - 1, m - 1, v - 1).forEach((x, i) => out[i] += (m/c)*x);
    return out;
  };
  return f(r.casillas - fall.length - (avisoVivo ? 1 : 0), r.minas.length - fall.length - (avisoVivo ? 1 : 0), vidas);
}
function probsCuadroMajor(rondas, vidas){
  const a = pasarRondaCuadro(rondas[0], vidas), pA = a.reduce((s, x) => s + x, 0);
  const pB = a.reduce((s, x, v) => s + x*pasarRondaCuadro(rondas[1], v).reduce((t, y) => t + y, 0), 0);
  return [pA, pA > 0 ? pB/pA : 0];                  // cuartos, y semis si llegáis
}
'''
s = leer('c-carrera.js')
s = rep(s, "/* El minijuego de siempre: el cuadro de un Major en cuartos y semifinal (la final se juega en la pista) */",
        SORTEO + "/* El minijuego de siempre: el cuadro de un Major en cuartos y semifinal (la final se juega en la pista) */", 'c-carrera.js')
s = rep(s, "  if(j.edad <= 19 && ['P2','P1','MJ','FIN'].indexOf(ev.t) >= 0) logro(j, 'premier_teen');\n"
           "  S.torneo = { ev, previa: est.tipo === 'previa', enPrevia: est.tipo === 'previa', kPrevia:0, ronda:0, partidos:[], rival:null,\n"
           "               ultimo:null, momento:null, perfecto:true, remontada:false, lesionado:false, fin:null };",
        "  if(j.edad <= 19 && ['P2','P1','MJ','FIN'].indexOf(ev.t) >= 0) logro(j, 'premier_teen');\n"
        "  /* el sorteo que visteis, con sus %, es el que se juega */\n"
        "  const so = chancesTorneo(j, ev, est.tipo);\n"
        "  S.torneo = { ev, previa: est.tipo === 'previa', enPrevia: est.tipo === 'previa', kPrevia:0, ronda:0, partidos:[], rival:null,\n"
        "               ultimo:null, momento:null, perfecto:true, remontada:false, lesionado:false, fin:null, sorteo: JSON.parse(JSON.stringify(so)) };\n"
        "  delete trimActual().sorteos[ev.id];", 'c-carrera.js')
s = rep(s, "function nuevoRivalTorneo(){\n  const to = S.torneo, T = TIERS[to.ev.t];\n"
           "  to.rival = to.enPrevia ? rivalDePrevia(to.ev) : generarRival(to.ev.t, to.ronda, T.rondas);\n"
           "  /* en los torneos pequeños los rivales aprietan menos: el primer título tiene que llegar pronto */\n"
           "  to.rival.rating -= (difActual().ayuda || {})[to.ev.t] || 0;\n}",
        "function nuevoRivalTorneo(){\n  const to = S.torneo, T = TIERS[to.ev.t], so = to.sorteo, k = to.enPrevia ? to.kPrevia : to.ronda;\n"
        "  /* en los torneos pequeños los rivales aprietan menos: el primer título tiene que llegar pronto */\n"
        "  const ayuda = (difActual().ayuda || {})[to.ev.t] || 0;\n"
        "  /* la pareja y su % ya salieron en el sorteo del torneo */\n"
        "  const base = so && (to.enPrevia ? so.previa : so.cuadro)[k];\n"
        "  if(base){\n"
        "    const p = so.probs && (to.enPrevia ? so.probs.previa : so.probs.cuadro)[k];\n"
        "    to.rival = Object.assign(JSON.parse(JSON.stringify(base)), { rating: base.rating - ayuda, _prob: p != null ? p : null });\n"
        "    return;\n  }\n"
        "  to.rival = to.enPrevia ? rivalDePrevia(to.ev) : generarRival(to.ev.t, to.ronda, T.rondas);\n"
        "  to.rival.rating -= ayuda;\n}", 'c-carrera.js')
s = rep(s, "  if(mini === 'cuadro'){ S.cuadro = crearCuadro(j, to.ev, parcial);",
        "  if(mini === 'cuadro'){ S.cuadro = to.sorteo && to.sorteo.mj ? cuadroDesdeSorteo(j, to, parcial) : crearCuadro(j, to.ev, parcial);", 'c-carrera.js')
escribir('c-carrera.js', s)

# ── vistas ──
TABLA = r'''/* Tus chances, ronda a ronda: los mismos % que después deciden cada partido */
function chancesHTML(ev, so, to){
  const T = TIERS[ev.t], ch = chanceTitulo(ev, so, to), esMJ = modoMinijuego(ev) === 'cuadro';
  const abrev = {R64:'R64', R32:'R32', OCTAVOS:'8VOS', CUARTOS:'4TOS', SEMIFINAL:'SEMI', FINAL:'FINAL', GRUPOS:'GRUPOS'};
  const apellido = n => esc(String(n).split(' ').slice(-1)[0]);
  const filas = ch.pasos.map((p, i) => {
    const nom = p.previa ? 'PREV ' + (p.k + 1) : (abrev[NOM_RONDA[T.rondas][p.k]] || NOM_RONDA[T.rondas][p.k]);
    const hecha = i < ch.hechos, ahora = !!to && i === ch.hechos, pc = Math.round(100*ch.pr[i]);
    const col = pc>=60?'var(--bien)':pc>=40?'var(--gold)':'var(--danger)';
    const riv = p.cuadroMJ ? null : (p.previa ? so.previa : so.cuadro)[p.k];
    const quien = p.cuadroMJ ? '🏛️ cuadro: elegís camino' : `${apellido(riv.nombre)} / ${apellido(riv.nombre2)} <span class="muted">#${riv.rank}</span>${p.final ? ' · 🎾 pista' : ''}`;
    return `<div class="chance ${hecha ? 'hecha' : ahora ? 'ahora' : ''}">
      <span class="ch-nom">${ahora ? '▶ ' : ''}${nom}</span><span class="ch-riv">${quien}</span>
      <span class="ch-pc" style="color:${hecha ? 'var(--bien)' : col}">${hecha ? '✅' : fmtChance(ch.pr[i])}</span>
      ${hecha ? '' : `<span class="ch-barra"><i style="width:${pc}%"></i></span>`}
    </div>`;
  }).join('');
  return `<div class="card">
    <div class="eyebrow">📊 TUS CHANCES, RONDA A RONDA</div>
    <p class="muted" style="margin:6px 0 4px">Cada % es exacto y es el que decide esa ronda, se juegue como se juegue: simulada, con momento clave o con minijuego.${esMJ ? ' En el cuadro del Major ya cuenta vuestras bolas de partido.' : ''}</p>
    <div class="chances">${filas}</div>
    <div class="hr"></div>
    <div class="g2">
      <div><div class="eyebrow">LLEGAR A LA FINAL</div><div class="title-lg">${fmtChance(ch.final)}</div></div>
      <div><div class="eyebrow">GANAR EL TORNEO</div><div class="title-lg" style="color:var(--gold)">${fmtChance(ch.titulo)}</div></div>
    </div>
    <p class="muted" style="margin:8px 0 0">🎾 La final se juega en la pista: su % es simulándola; jugándola, depende de cómo juegues.</p>
  </div>`;
}
'''
v = leer('c-vistas.js')
v = rep(v, "function vTorneo(){", TABLA + "function vTorneo(){", 'c-vistas.js')
# antes de inscribirse: el resumen junto al botón y la tabla debajo
v = rep(v, "    if(puedeEntrar(est)){\n      h += `<div class=\"card\">\n        <div class=\"eyebrow\">INSCRIPCIÓN</div>",
        "    if(puedeEntrar(est)){\n      const so = chancesTorneo(j, ev, est.tipo), tit = chanceTitulo(ev, so, null);\n"
        "      h += `<div class=\"card\">\n        <div class=\"eyebrow\">INSCRIPCIÓN</div>\n"
        "        <div class=\"log gold\" style=\"margin:8px 0 0\">📊 <b>${fmtChance(tit.primera)}</b> de ganar la primera ronda · <b>${fmtChance(tit.titulo)}</b> de ganar el torneo. Ronda a ronda, más abajo.</div>", 'c-vistas.js')
v = rep(v, "      <button class=\"btn\" onclick=\"inscribirse()\">🎾 INSCRIBIRSE</button><div style=\"height:8px\"></div>`;",
        "      <button class=\"btn\" onclick=\"inscribirse()\">🎾 INSCRIBIRSE</button><div style=\"height:8px\"></div>`;\n      h += chancesHTML(ev, so, null);", 'c-vistas.js')
# en pleno torneo
v = rep(v, "    const opp = to.rival, rondaNom = nombreRondaActual(to), mini = minijuegoDeRonda(to), u = to.ultimo;",
        "    actualizarChancesEnCurso(j, to);\n    const opp = to.rival, rondaNom = nombreRondaActual(to), mini = minijuegoDeRonda(to), u = to.ultimo;", 'c-vistas.js')
v = rep(v, "Si pasáis, la final se juega en la pista.</p>\n      </div>",
        "Si pasáis, la final se juega en la pista.</p>\n"
        "        ${to.sorteo && to.sorteo.probs && to.sorteo.probs.mj ? `<p class=\"muted\" style=\"margin:8px 0 0\">📊 Pasar cuartos: <b style=\"color:var(--text)\">${fmtChance(to.sorteo.probs.mj[0])}</b> · semis, si llegáis: <b style=\"color:var(--text)\">${fmtChance(to.sorteo.probs.mj[1])}</b>. Ya cuenta vuestras bolas de partido.</p>` : ''}\n"
        "      </div>", 'c-vistas.js')
v = rep(v, "'La final no se salta: esa la juegas tú.'}</p>\n      <div class=\"card\" style=\"margin-top:11px\">",
        "'La final no se salta: esa la juegas tú.'}</p>\n"
        "      ${to.sorteo && to.sorteo.probs ? '<div style=\"height:11px\"></div>' + chancesHTML(ev, to.sorteo, to) : ''}\n"
        "      <div class=\"card\" style=\"margin-top:11px\">", 'c-vistas.js')
# leer al rival: siempre con números
v = rep(v, "<small>${L.exacta ? vals[i] + '%' : vals[i] === maxW ? 'lo más probable' : '&nbsp;'}</small>", "<small>${vals[i]}%</small>", 'c-vistas.js')
v = rep(v, "${L.exacta ? 'Ya está contado en los porcentajes.' : 'O eso parece.'}", "Ya está contado en los porcentajes.", 'c-vistas.js')
v = rep(v, "Toca la zona que vais a tapar.${L.exacta ? '' : ' Con más <b>Mental</b> verías los porcentajes.'}</p>", "Toca la zona que vais a tapar.</p>", 'c-vistas.js')
# el Mundial: su % a la vista
v = rep(v, "function rafagaRecienAcabada(R){ return hayDOM && R && R.finAt && performance.now() - R.finAt < 600; }",
        "function rafagaRecienAcabada(R){ return hayDOM && R && R.finAt && performance.now() - R.finAt < 600; }\n"
        "/* lo que gana alguien con un timing normal (para el cursor a ±0,12 del centro, como en las pruebas): el % del Mundial */\n"
        "function erfAprox(x){ const s = Math.sign(x), t = 1/(1 + .3275911*Math.abs(x)); return s*(1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - .284496736)*t + .254829592)*t*Math.exp(-x*x)); }\n"
        "function probRafagaNormal(R){\n"
        "  const p = R.golpes.map(g => erfAprox((g.w/2)/(0.12*Math.SQRT2)));\n"
        "  const sigue = (i, bien, mal) => bien >= 2 ? 1 : mal >= 2 || i >= R.golpes.length ? 0\n"
        "    : R.golpes[i].res ? sigue(i + 1, bien + (R.golpes[i].res === 'fuera' ? 0 : 1), mal + (R.golpes[i].res === 'fuera' ? 1 : 0))\n"
        "    : p[i]*sigue(i + 1, bien + 1, mal) + (1 - p[i])*sigue(i + 1, bien, mal + 1);\n"
        "  return sigue(0, 0, 0);\n}", 'c-vistas.js')
v = rep(v, "  if(!e) return h + rafagaHTML(mu.rafaga) + `</div>`;",
        "  if(!e){\n"
        "    const R = mu.rafaga, pr = Math.round(100*probRafagaNormal(R)), empezado = R.golpes.some(g => g.res), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';\n"
        "    return h + `<div class=\"prob\" style=\"margin:0 2px 4px\"><span class=\"barra\"><i style=\"width:${pr}%\"></i></span><span class=\"cifra\" style=\"color:${col}\">${pr}% de ganar${empezado ? ' ahora' : ''}</span></div>\n"
        "      <p class=\"muted\" style=\"margin:0 2px 11px\">Con un timing normal. La zona verde es más grande cuanto mejores seáis que ellos; si paráis el cursor más centrado, ganáis más.</p>` + rafagaHTML(R) + `</div>`;\n"
        "  }", 'c-vistas.js')
escribir('c-vistas.js', v)

# ── estilos ──
css = leer('c-css.txt')
css += '''
/* tus chances, ronda a ronda */
.chances .chance{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:4px 9px;padding:8px 0;border-top:1px solid var(--border)}
.chances .chance:first-child{border-top:0}
.chance .ch-nom{font-size:11px;font-weight:800;letter-spacing:.06em;color:var(--muted);min-width:54px}
.chance .ch-riv{font-size:12.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chance .ch-pc{font-size:13.5px;font-weight:800;font-variant-numeric:tabular-nums;text-align:right}
.chance .ch-barra{grid-column:1 / 4;height:4px;border-radius:99px;overflow:hidden;background:rgba(255,107,107,.28)}
.chance .ch-barra i{display:block;height:100%;background:var(--bien)}
.chance.ahora .ch-nom{color:var(--gold)}
.chance.hecha{opacity:.55}
'''
escribir('c-css.txt', css)

# ── el cuadro del Major (código de la v1, en la segunda pasada): % exacto con las bolas de partido ──
p2 = leer('patch2.py')
FIN = "open(p, 'w', encoding='utf-8').write(s)\nprint('segunda pasada aplicada')"
assert p2.count(FIN) == 1
p2 = p2.replace(FIN, '''# el % de pasar cada ronda del cuadro es exacto: cuenta las bolas de partido que os quedan
rep("      const pc = Math.round(100 * clamp(seguros/elegibles, 0, 1));", "      const pc = Math.round(100 * pasarRondaCuadro(r, c.vidas).reduce((a, x) => a + x, 0));   // exacto, con las bolas de partido que os quedan")
rep("de partido en la recámara`:''}. Elige.</p>`;", "de partido en la recámara, ya contadas en el %`:''}. Elige.</p>`;")

''' + FIN)
escribir('patch2.py', p2)
print('patch9: chances ronda a ronda y % en todos los minijuegos')
