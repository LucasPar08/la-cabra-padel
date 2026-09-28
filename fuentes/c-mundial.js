
/* ═══════════════════════════════════════════════════════════════
   EL MUNDIAL DE SELECCIONES
   Cada dos años (las temporadas pares), en el último trimestre. Dieciséis
   selecciones y eliminatorias a tres partidos: pasa la que gane dos. Tú
   juegas tu partido con tu pareja; los otros dos, tus compañeros. Como en
   los torneos, el cuadro entero se sortea al empezar y cada % es exacto.
   ═══════════════════════════════════════════════════════════════ */
const SELECCIONES = {
  ES:['España','ESP',97], AR:['Argentina','ARG',95], BR:['Brasil','BRA',82], IT:['Italia','ITA',79], FR:['Francia','FRA',77], PT:['Portugal','POR',76],
  MX:['México','MEX',75], CL:['Chile','CHI',74], PY:['Paraguay','PAR',72], UY:['Uruguay','URU',70], BE:['Bélgica','BEL',69], US:['Estados Unidos','USA',68],
  NL:['Países Bajos','NED',67], SE:['Suecia','SWE',66], DE:['Alemania','GER',64], CO:['Colombia','COL',63], QA:['Catar','QAT',62], EC:['Ecuador','ECU',58],
  VE:['Venezuela','VEN',57], PE:['Perú','PER',56], CR:['Costa Rica','CRC',55], PA:['Panamá','PAN',54], PR:['Puerto Rico','PUR',53], DO:['República Dominicana','DOM',52],
  BO:['Bolivia','BOL',51], GT:['Guatemala','GUA',50], SV:['El Salvador','ESA',48], HN:['Honduras','HON',47], NI:['Nicaragua','NCA',46], CU:['Cuba','CUB',45], GQ:['Guinea Ecuatorial','GEQ',40],
};
const SEDES_MUNDIAL = [['Doha','QA'], ['Madrid','ES'], ['Buenos Aires','AR'], ['Dubái','AE'], ['París','FR'], ['Ciudad de México','MX'], ['Roma','IT'], ['Asunción','PY']];
const RONDAS_MUN = ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];
const PREMIO_MUN = [1000, 3000, 6000, 12000, 25000];          // según hasta dónde llegues (el último, campeones)
const SIEMBRA16 = [1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11];
const nomSel = id => (SELECCIONES[id] || [id])[0];
const codSel = id => (SELECCIONES[id] || [0, id])[1];
const hayMundial = anio => anio >= 2 && anio % 2 === 0;
const TRIM_MUNDIAL = 3;                                          // octubre · diciembre
/* el nivel de cada pareja de una selección: la 1, la 2 y la 3 */
function rankParejaSel(id, k){ const f = (SELECCIONES[id] || [0, 0, 50])[2]; return Math.max(1, Math.round(Math.pow(10, (100 - f)/22)*[1, 2.6, 5.5][k])); }
const ratingParejaSel = (id, k) => ratingDeRank(rankParejaSel(id, k));
const probRatings = (a, b) => 1/(1 + Math.exp(-(a - b)/4.2));
const probEliminatoria = (p1, p2, p3) => p1*p2 + p1*p3 + p2*p3 - 2*p1*p2*p3;
function evMundial(mu){ return { t:'P1', nom:'Mundial de Selecciones', ciudad: mu.sede, pista:'indoor', pais: mu.sedePais, mundial:true }; }
function parejaSel(id, k){
  const o = duplaRival(rankParejaSel(id, k));
  o.flag = codSel(id); o.rating = ratingParejaSel(id, k) + rnd(-1, 1);
  return o;
}
/* ── Sorteo: las 16, el cuadro y los ganadores de todo lo que no es tuyo ── */
function crearMundial(j){
  const ed = j.anio/2, [sede, sedePais] = SEDES_MUNDIAL[(ed - 1) % SEDES_MUNDIAL.length], mio = j.pais;
  let ids = Object.keys(SELECCIONES).filter(id => id !== mio).sort((a, b) => SELECCIONES[b][2] - SELECCIONES[a][2]).slice(0, 15);
  ids.push(mio); ids.sort((a, b) => SELECCIONES[b][2] - SELECCIONES[a][2]);
  const cuadro = SIEMBRA16.map(s => ids[s - 1]);
  /* tu selección: tu pareja ocupa el sitio que le toca por nivel */
  const ev0 = { t:'P1', nom:'Mundial de Selecciones', ciudad: sede, pista:'indoor', pais: sedePais };
  const miNivel = ratingDupla(j, 'indoor', ev0);
  const slot = [0, 1, 2].filter(k => ratingParejaSel(mio, k) > miNivel).length > 1 ? 2 : ratingParejaSel(mio, 0) > miNivel ? 1 : 0;
  const pares = [0, 1, 2].map(k => { if(k === slot) return { yo:true }; const o = duplaRival(rankParejaSel(mio, k)); return { nombre:o.nombre, nombre2:o.nombre2, rating: ratingParejaSel(mio, k) }; });
  /* se sortea todo lo que no es tuyo: así cada rival de tu camino (y cada %) se sabe desde el principio */
  const rivales = [], arbol = []; let ronda = cuadro;
  for(let r = 0; r < 4; r++){
    const sig = [];
    for(let i = 0; i < ronda.length; i += 2){
      const a = ronda[i], b = ronda[i + 1];
      if(a === mio || b === mio){ rivales.push(a === mio ? b : a); sig.push(mio); }
      else sig.push(Math.random() < probSelecciones(a, b) ? a : b);
    }
    arbol.push(sig); ronda = sig;
  }
  const ev = { t:'P1', nom:'Mundial de Selecciones', ciudad: sede, pista:'indoor', pais: sedePais, mundial:true };
  const elims = rivales.map((riv, r) => ({ k: r, riv, fin: null, partidos: [0, 1, 2].map(k => {
    const opp = parejaSel(riv, k);
    if(k === slot) return { yo:true, opp, p: probPartido(j, opp, ev)/100, res:null };
    return { yo:false, opp, nuestra: pares[k], p: probRatings(pares[k].rating, opp.rating), res:null };
  }) }));
  return { a: j.anio, ed, sede, sedePais, mio, cuadro, rivales, arbol, elims, slot, pares, ronda:0, fin:null, hist:[], partidosGanados:0 };
}
const elimActual = mu => mu.elims[Math.min(mu.ronda, 3)];
/* dos selecciones que no son la tuya: la eliminatoria, con el nivel de sus tres parejas */
function probSelecciones(a, b){ const p = [0, 1, 2].map(k => probRatings(ratingParejaSel(a, k), ratingParejaSel(b, k))); return probEliminatoria(p[0], p[1], p[2]); }
/* los ganadores que se ven en el cuadro: cada ronda se destapa cuando se juega */
function ganadoresMundial(mu){
  const out = [], visible = r => !!mu.fin || r < mu.ronda || (r === mu.ronda && !!elimActual(mu).fin);
  let ronda = mu.cuadro;
  for(let r = 0; r < 4; r++){
    const sig = [];
    for(let i = 0; i < ronda.length; i += 2){
      const a = ronda[i], b = ronda[i + 1];
      let g = null;
      if(a != null && b != null && visible(r)){
        if(a === mu.mio || b === mu.mio){ const h = mu.hist.find(x => x.r === r); g = h ? (h.gane ? mu.mio : (a === mu.mio ? b : a)) : null; }
        else { const pre = mu.arbol[r][i/2]; g = pre === a || pre === b ? pre : ganadorOculto(mu, r, a, b); }
      }
      sig.push(g);
    }
    out.push(sig); ronda = sig;
  }
  return out;
}
/* las eliminatorias ajenas se deciden al sortear; para enseñarlas basta con repetir la misma cuenta, fija por semilla */
function ganadorOculto(mu, r, a, b){ return conSemilla(`${mu.a}|${r}|${a}|${b}`, () => Math.random() < probSelecciones(a, b) ? a : b); }
function chanceEliminatoria(e){ const p = e.partidos.map(x => x.res ? (x.res.gane ? 1 : 0) : x.p); return probEliminatoria(p[0], p[1], p[2]); }
function chanceTituloMundial(mu){
  if(mu.fin) return mu.fin.campeon ? 1 : 0;
  let acc = 1;
  for(let r = mu.ronda; r < 4; r++) acc *= chanceEliminatoria(mu.elims[r]);     // cada eliminatoria, con el % que se verá al jugarla
  return acc;
}
/* ── Acciones ── */
function abrirMundial(){
  const j = S.j, tr = trimActual();
  if(!tr.mundial) tr.mundial = crearMundial(j);
  S.pantalla = 'mundialSel'; guardar(); render();
}
function simularMiPartidoMundial(){
  const mu = trimActual().mundial, e = mu && elimActual(mu); if(!e || e.fin || mu.fin) return;
  const x = e.partidos[mu.slot]; if(x.res) return;
  resolverMiPartidoMundial(Math.random() < x.p, null);
}
function jugarMiPartidoMundial(){
  const j = S.j, mu = trimActual().mundial, e = mu && elimActual(mu); if(!e || e.fin || mu.fin) return;
  const x = e.partidos[mu.slot]; if(x.res) return;
  const ev = evMundial(mu), f = formatoCarrera(), rotulo = `MUNDIAL · ${RONDAS_MUN[mu.ronda]}`;
  const cfg = cfgPartidoCarrera(j, x.opp, ev, rotulo);
  cfg.rival = paramsRivalPista(edgeDesdeProb(x.p) + difActual().rival, x.opp.arq);
  cfg.juegos = f.juegos; cfg.sets = f.sets; cfg.pPunto = pPuntoPartido(x.p, f.juegos, f.sets);
  cfg.escena = { tipo:'pabellon', gente:1, ciudad: mu.sede };
  /* con la camiseta de la selección: las dos parejas salen con los colores de su bandera */
  const bMia = COLORES_BANDERA[mu.mio] || COLORES_BANDERA.AR, bRiv = COLORES_BANDERA[e.riv] || ['#FF8A7A','#FFFFFF','#FF8A7A'];
  const colorDe = b => b.find(c => c !== '#FFFFFF') || b[0];
  cfg.humano = Object.assign({}, cfg.humano, { color: colorDe(bMia), diseno:'bandera', banda: bMia });
  cfg.pareja = Object.assign({}, cfg.pareja, { color: colorDe(bMia), diseno:'bandera', banda: bMia });
  cfg.rival = Object.assign({}, cfg.rival, { color: colorDe(bRiv), diseno:'bandera', banda: bRiv });
  cfg.equipos = [`${codSel(mu.mio)} ${apellido(j.nombre)}/${apellido(j.pareja ? j.pareja.nombre : 'Pareja')}`, `${codSel(e.riv)} ${apellido(x.opp.nombre)}/${apellido(x.opp.nombre2)}`];
  cfg.titulo = `${nomSel(mu.mio).toUpperCase()} – ${nomSel(e.riv).toUpperCase()}`;
  cfg.subtitulo = `Mundial de Selecciones · ${RONDAS_MUN[mu.ronda].toLowerCase()} · ${formatoTexto(f.sets, f.juegos, true)}`;
  cfg.avisoSub = `${nomSel(mu.mio)} contra ${nomSel(e.riv)}<br>${Math.round(x.p*100)}% de ganar si lo simulas`;
  cfg.alTerminar = rp => {
    const sets = (rp.sets && rp.sets.length ? rp.sets : [rp.juegos]).map(s => s[0] + '-' + s[1]);
    S.pantalla = 'mundialSel';
    resolverMiPartidoMundial(rp.gano, sets);
  };
  S.pantalla = 'mundialSel';
  iniciarPartidoPista(cfg);
}
/* un marcador creíble para un partido ya decidido */
function marcadorMun(gane){ const a = pick(['6-3','6-4','7-5','6-2','7-6']); const s = [a]; if(Math.random() < .35) s.push(pick(['4-6','3-6','5-7'])), s.push(pick(['6-4','7-5','6-3'])); else s.push(pick(['6-4','6-3','7-5'])); return gane ? s : s.map(x => x.split('-').reverse().join('-')); }
function resolverMiPartidoMundial(gane, sets, silencio){
  const j = S.j, mu = trimActual().mundial, e = elimActual(mu), x = e.partidos[mu.slot];
  x.res = { gane, sets: sets || marcadorMun(gane), enPista: !!sets };
  j.energia = clamp(j.energia - 5, 0, 100);
  if(gane){ mu.partidosGanados++; j.mundial = (j.mundial || 0) + 1; }
  /* los otros dos partidos, con su % exacto */
  for(const y of e.partidos) if(!y.res) { const g = Math.random() < y.p; y.res = { gane: g, sets: marcadorMun(g) }; }
  const nuestros = e.partidos.filter(y => y.res.gane).length;
  e.fin = { gane: nuestros >= 2, marcador: `${nuestros}-${3 - nuestros}` };
  mu.hist.push({ r: mu.ronda, riv: e.riv, marcador: e.fin.marcador, gane: e.fin.gane });
  if(!e.fin.gane) cerrarMundial(mu, false);
  else if(mu.ronda === 3) cerrarMundial(mu, true);
  if(!silencio){ guardar(); render(); }
}
function siguienteRondaMundial(){
  const mu = trimActual().mundial; if(!mu || mu.fin || !elimActual(mu).fin) return;
  mu.ronda++;
  guardar(); render(); if(hayDOM) window.scrollTo(0, 0);
}
function cerrarMundial(mu, campeon){
  const j = S.j, llegada = campeon ? 4 : mu.ronda;
  mu.fin = { campeon, llegada, texto: campeon ? 'CAMPEONES DEL MUNDO' : llegada === 3 ? 'SUBCAMPEONES' : llegada === 2 ? 'SEMIFINALISTAS' : llegada === 1 ? 'CUARTOS DE FINAL' : 'OCTAVOS DE FINAL' };
  const plata = PREMIO_MUN[llegada]; j.dinero += plata; mu.fin.plata = plata;
  j.moral = clamp((j.moral || 50) + (campeon ? 15 : llegada >= 2 ? 6 : 0), 0, 100);
  j.mundiales = j.mundiales || [];
  j.mundiales.push({ a: mu.a, sede: mu.sede, sedePais: mu.sedePais, res: mu.fin.texto, campeon });
  if(campeon){ j.mundialCopas = (j.mundialCopas || 0) + 1; chequearLogros(j, { mundialCopa:true }); }
  else chequearLogros(j, {});
}
function salirMundial(){ S.pantalla = 'temporada'; render(); if(hayDOM) window.scrollTo(0, 0); }

/* ── En la temporada: el aviso del Mundial ── */
function mundialAvisoHTML(j){
  if(!j || !hayMundial(j.anio)) return '';
  const ed = j.anio/2, [sede, sedePais] = SEDES_MUNDIAL[(ed - 1) % SEDES_MUNDIAL.length];
  const yaJugado = (j.mundiales || []).find(m => m.a === j.anio);
  if(j.trimestre < TRIM_MUNDIAL) return `<div class="card mun-aviso"><div class="mun-aviso-f">${banderaCirculo(j.pais)}<div><div class="eyebrow">${ico('trofeo')} ESTE AÑO HAY MUNDIAL</div><div class="mun-aviso-t">${esc(sede)} · octubre a diciembre</div><p class="muted" style="margin:2px 0 0">Tu selección te espera en el último trimestre. Sube en el ranking y juegas en la pareja 1.</p></div></div></div>`;
  if(j.trimestre > TRIM_MUNDIAL) return '';
  const mu = trimActual().mundial;
  if(yaJugado) return `<div class="card mun-aviso"><div class="mun-aviso-f">${banderaCirculo(j.pais)}<div><div class="eyebrow">${ico('trofeo')} MUNDIAL DE ${esc(sede.toUpperCase())}</div><div class="mun-aviso-t" style="color:${yaJugado.campeon ? 'var(--gold)' : 'var(--text)'}">${esc(nomSel(j.pais))}: ${esc(yaJugado.res.toLowerCase())}</div></div></div>
    <div style="height:8px"></div><button class="btn ghost sm" onclick="abrirMundial()">VER EL CUADRO</button></div>`;
  return `<div class="card mun-grande">
    ${bannerMonumento({ t:'MJ', ciudad: sede, pais: sedePais })}
    <div class="eyebrow">${ico('trofeo')} MUNDIAL DE SELECCIONES · EDICIÓN ${ed}</div>
    <div class="mun-titulo">${banderaCirculo(j.pais)}<span>Juegas con ${esc(nomSel(j.pais))}</span></div>
    <p class="sub" style="margin:4px 0 10px">Dieciséis selecciones y eliminatorias a tres partidos: pasa la que gane dos. Tú juegas el tuyo; tus compañeros, los otros dos. No cuenta como torneo del trimestre.</p>
    <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="abrirMundial()">${ico('trofeo')} ${mu ? 'SEGUIR EN EL MUNDIAL' : 'IR AL MUNDIAL'}</button></div>`;
}
function banderaCirculo(id, t){ t = t || 36; return `<span class="band-circ" style="width:${t}px;height:${t}px"><svg viewBox="0 0 100 100" aria-hidden="true">${fondoBandera(id, 100, 100)}</svg></span>`; }

/* ── La pantalla del Mundial ── */
function vMundialSel(){
  const j = S.j, tr = trimActual(), mu = tr && tr.mundial;
  if(!mu){ S.pantalla = 'temporada'; return vTemporada(); }
  const e = elimActual(mu), ganadores = ganadoresMundial(mu);
  let h = `<div class="fade">
  <div class="card mun-grande">${bannerMonumento({ t:'MJ', ciudad: mu.sede, pais: mu.sedePais })}
    <div class="eyebrow">${ico('trofeo')} MUNDIAL DE SELECCIONES · EDICIÓN ${mu.ed}</div>
    <div class="mun-titulo">${banderaCirculo(mu.mio, 42)}<span>${esc(nomSel(mu.mio))}</span></div>
    ${mu.fin ? '' : `<div style="height:8px"></div>${probTV(Math.round(100*chanceTituloMundial(mu)), 'de ser campeones')}`}
  </div>`;
  /* tu selección */
  h += `<div class="card"><div class="eyebrow">${ico('perfil')} TU SELECCIÓN</div><div style="height:6px"></div>
    ${mu.pares.map((p, k) => `<div class="mun-par ${p.yo ? 'yo' : ''}"><span class="mun-num">${k + 1}</span><div class="g"><b>${p.yo ? esc(j.nombre) + ' / ' + esc(j.pareja ? j.pareja.nombre : '—') : esc(p.nombre) + ' / ' + esc(p.nombre2)}</b><span>${p.yo ? 'Tu pareja · juegas tú' : 'Pareja ' + (k + 1) + ' de ' + esc(nomSel(mu.mio))}</span></div></div>`).join('')}</div>`;
  /* la eliminatoria */
  if(e){
    const riv = e.riv, ch = Math.round(100*chanceEliminatoria(e));
    h += `<div class="card mun-elim">
      <div class="eyebrow">${RONDAS_MUN[e.k]}</div>
      <div class="mun-vs"><div>${banderaCirculo(mu.mio, 40)}<b>${codSel(mu.mio)}</b></div><div class="mun-marc">${e.fin ? e.fin.marcador : 'VS'}</div><div>${banderaCirculo(riv, 40)}<b>${codSel(riv)}</b></div></div>
      ${e.fin ? '' : probTV(ch, 'de pasar')}
      ${e.partidos.map((x, k) => {
        const nuestros = x.yo ? `${esc(apellido(j.nombre))} / ${esc(apellido(j.pareja ? j.pareja.nombre : ''))}` : `${esc(apellido(x.nuestra.nombre))} / ${esc(apellido(x.nuestra.nombre2))}`;
        const est = x.res ? `<b class="${x.res.gane ? 'll-ok' : 'll-ko'}">${x.res.sets.join(' ')}</b>` : `<b>${Math.round(x.p*100)}%</b>`;
        return `<div class="mun-partido ${x.yo ? 'yo' : ''} ${x.res ? (x.res.gane ? 'gano' : 'perdio') : ''}" style="animation-delay:${x.res && !x.yo ? .25 + k*.35 : 0}s">
          <span class="mun-num">${k + 1}</span><div class="g"><b>${nuestros}${x.yo ? ' <small>TÚ</small>' : ''}</b><span>vs ${esc(apellido(x.opp.nombre))} / ${esc(apellido(x.opp.nombre2))} · #${x.opp.rank}</span></div>${est}</div>`;
      }).join('')}
      ${e.fin ? `<div class="log ${e.fin.gane ? 'gold' : 'bad'}" style="margin:10px 0 0">${e.fin.gane ? `<b>${esc(nomSel(mu.mio))} gana ${e.fin.marcador}.</b> ${mu.ronda === 3 ? '¡Campeones del mundo!' : 'A ' + RONDAS_MUN[mu.ronda + 1].toLowerCase() + '.'}` : `<b>${esc(nomSel(riv))} gana ${e.fin.marcador.split('-').reverse().join('-')}.</b> ${esc(nomSel(mu.mio))} se despide del Mundial.`}</div>` : ''}
    </div>`;
    if(!e.fin) h += `<button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarMiPartidoMundial()">${ico('pelota')} JUGAR MI PARTIDO EN LA PISTA</button><div style="height:8px"></div>
      <button class="btn ghost" onclick="simularMiPartidoMundial()">${ico('avanzar')} SIMULAR MI PARTIDO</button>
      <p class="muted center" style="margin:8px 0 12px">Tu partido: ${Math.round(e.partidos[mu.slot].p*100)}% si lo simulas. Los otros dos se juegan a la vez con su %.</p>`;
    else if(!mu.fin) h += `<button class="btn" onclick="siguienteRondaMundial()">${ico('jugar')} A ${RONDAS_MUN[mu.ronda + 1]}</button><div style="height:12px"></div>`;
  }
  if(mu.fin){
    h += `<div class="card ${mu.fin.campeon ? 'event-hero' : ''} mun-fin">
      ${mu.fin.campeon ? `<div class="mun-copa">${ico('trofeo')}</div>` : ''}
      <div class="title-xl" style="margin:4px 0 6px">${mu.fin.texto}</div>
      <p class="sub" style="margin:0">${mu.fin.campeon ? `${esc(nomSel(mu.mio))} levanta el Mundial de ${esc(mu.sede)}. Este no se olvida nunca.` : `${esc(nomSel(mu.mio))} llegó a ${mu.fin.texto.toLowerCase()} en ${esc(mu.sede)}.`} Premio: <b>${money(mu.fin.plata)}</b>. El próximo, en dos años.</p>
    </div>`;
  }
  h += cuadroMundialHTML(mu, ganadores);
  return h + `<button class="btn ghost" onclick="salirMundial()">VOLVER A LA TEMPORADA</button></div>`;
}
/* el cuadro de las dieciséis, en llaves */
function cuadroMundialHTML(mu, ganadores){
  const col = (lista, r) => {
    const cajas = [];
    for(let i = 0; i < lista.length; i += 2){
      const a = lista[i], b = lista[i + 1], g = ganadores[r][i/2], mia = a === mu.mio || b === mu.mio;
      const eq = id => id ? `<div class="mc-eq ${g && g === id ? 'gana' : g ? 'pierde' : ''} ${id === mu.mio ? 'mio' : ''}">${banderaCirculo(id, 16)}<span>${codSel(id)}</span></div>` : `<div class="mc-eq vacio"><span>—</span></div>`;
      cajas.push(`<div class="mc-caja ${mia ? 'mia' : ''}">${eq(a)}${eq(b)}</div>`);
    }
    return `<div class="llave-col ${r === mu.ronda && !mu.fin ? 'actual' : ''}"><div class="ll-ronda">${RONDAS_MUN[r]}</div>${cajas.join('')}</div>`;
  };
  let h = '', lista = mu.cuadro;
  for(let r = 0; r < 4; r++){ h += col(lista, r); lista = ganadores[r]; }
  const camp = ganadores[3][0];
  h += `<div class="llave-col"><div class="ll-ronda">CAMPEÓN</div><div class="mc-caja ${camp === mu.mio ? 'mia campeon' : ''}">${camp ? `<div class="mc-eq gana">${banderaCirculo(camp, 22)}<span>${esc(nomSel(camp))}</span></div>` : '<div class="mc-eq vacio"><span>¿?</span></div>'}</div></div>`;
  return `<div class="card"><div class="eyebrow">${ico('llaves')} EL CUADRO</div><div class="llaves mun-llaves">${h}</div>
    <p class="muted" style="margin:6px 0 0">Desliza para ver todas las rondas. ${esc(nomSel(mu.mio))}, resaltada.</p></div>`;
}

/* si se pasa el trimestre sin terminar el Mundial, lo que queda se juega simulado (con los mismos %) */
function mundialPendiente(){
  const j = S.j; if(!j || !hayMundial(j.anio) || j.trimestre !== TRIM_MUNDIAL) return;
  if((j.mundiales || []).some(m => m.a === j.anio)) return;
  const tr = trimActual(); if(!tr) return;
  if(!tr.mundial) tr.mundial = crearMundial(j);
  const mu = tr.mundial;
  for(let g = 0; !mu.fin && g < 12; g++){
    const e = elimActual(mu);
    if(!e.fin) resolverMiPartidoMundial(Math.random() < e.partidos[mu.slot].p, null, true);
    else mu.ronda++;
  }
  S.msgs = (S.msgs || []).concat([{ tipo: mu.fin.campeon ? 'gold' : '', txt: `<b>Mundial de ${esc(mu.sede)}:</b> ${esc(nomSel(mu.mio))}, ${mu.fin.texto.toLowerCase()}.` }]);
}
