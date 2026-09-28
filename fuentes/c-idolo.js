
/* ═══════════════════════════════════════════════════════════════
   EL ÍDOLO
   El modo para hacer una de las grandes carreras de la historia. Todo es más
   duro que en la carrera normal: rivales, ranking, crecimiento y ayudas. Se
   puede empezar de dos formas: desde abajo, con 17 años, o ya siendo una
   estrella del top 10 con 24. Al retirarte, tu carrera entra en la tabla.
   ═══════════════════════════════════════════════════════════════ */
const IDOLOS_KEY = 'cabra_padel_idolos', MAX_IDOLOS = 10;
const esIdolo = () => !!(typeof S !== 'undefined' && S && S.j && S.j.modo === 'idolo');
/* lo que endurece el modo, además de la dificultad que tengas puesta */
const IDOLO_DUREZA = { sim: 1.6, eleccion: .04, rival: 3, escala: 1.08, tasa: .88, libres: 1 };

/* ── Las metas de leyenda ── */
const METAS_IDOLO = [
  { id:'tit',  ic:'trofeo',   n:12, nom:'12 títulos',            d:'Doce torneos ganados en toda la carrera.',        v: j => j.titulos.length },
  { id:'mj',   ic:'estrella', n:3,  nom:'3 Majors',              d:'Los cuatro grandes del año son otra cosa.',       v: j => j.titulos.filter(t => t.tier === 'MJ').length },
  { id:'p1',   ic:'ranking',  n:5,  nom:'5 Premier P1 o Finals', d:'Los torneos más gordos después de los Majors.',   v: j => j.titulos.filter(t => t.tier === 'P1' || t.tier === 'FIN').length },
  { id:'n1',   ic:'pelota',   n:8,  nom:'8 fechas de nº 1',      d:'Aguantar en lo más alto, no solo llegar.',        v: j => j.trimN1 || 0 },
  { id:'mun',  ic:'llaves',   n:1,  nom:'1 Mundial',             d:'Levantar el Mundial con tu selección.',           v: j => j.mundialCopas || 0 },
  { id:'anos', ic:'calendario', n:12, nom:'12 temporadas',       d:'Vivir del pádel una carrera entera.',             v: j => j.anio },
];
const metaHecha = (m, j) => m.v(j) >= m.n;
function puntajeIdolo(j){
  const l = calcularLegado(j);
  const metas = METAS_IDOLO.filter(m => metaHecha(m, j)).length;
  return { pts: Math.round(l.pts + metas*12), rango: l.rango, txt: l.txt, metas, legado: l.pts };
}

/* ── La tabla de tus mejores carreras (en este dispositivo) ── */
function leerIdolos(){
  try{ const x = JSON.parse(localStorage.getItem(IDOLOS_KEY) || 'null'); if(Array.isArray(x)) return x; }catch(e){}
  return [];
}
function guardarIdolo(j){
  if(!j || j.modo !== 'idolo') return null;
  const p = puntajeIdolo(j);
  const ficha = { nombre: j.nombre, pais: j.pais, pts: p.pts, rango: p.rango, metas: p.metas, inicio: j.idoloInicio || 'abajo',
                  tit: j.titulos.length, mj: j.titulos.filter(t => t.tier === 'MJ').length, mun: j.mundialCopas || 0,
                  n1: j.trimN1 || 0, mejor: j.mejorRank || null, anios: j.anio, cuando: Date.now() };
  const lista = leerIdolos().concat([ficha]).sort((a, b) => b.pts - a.pts).slice(0, MAX_IDOLOS);
  try{ localStorage.setItem(IDOLOS_KEY, JSON.stringify(lista)); }catch(e){}
  return { ficha, puesto: lista.indexOf(ficha) + 1, lista };
}

/* ── Empezar una carrera de Ídolo ── */
function empezarIdolo(inicio){
  CFG.modo = 'idolo'; CFG.idoloInicio = inicio === 'estrella' ? 'estrella' : 'abajo';
  CFG.error = null;
  if(listaCarreras().length >= MAX_CARRERAS){ S.avisoCarreras = `Ya tienes ${MAX_CARRERAS} carreras guardadas: borra alguna para empezar otra.`; abrirCarreras('idolo'); return; }
  irCrear();
}
/* lo llama crearYEmpezar al final: ajusta la carrera según el modo elegido */
function arrancarIdolo(){
  const j = S.j; if(!j || CFG.modo !== 'idolo') { if(j) j.modo = j.modo || 'normal'; CFG.modo = null; return; }
  j.modo = 'idolo'; j.idoloInicio = CFG.idoloInicio || 'abajo'; j.trimN1 = 0;
  CFG.modo = null;
  if(j.idoloInicio !== 'estrella'){
    S.msgs = [{ tipo:'gold', txt:`🐐 <b>Modo Ídolo.</b> Empiezas como todos, pero aquí no regalan nada: rivales más duros, ranking más lento y ninguna ayuda. Al retirarte, tu carrera entra en la tabla de las mejores.` }].concat(S.msgs || []);
    return;
  }
  /* ya eres una estrella: 24 años, top 10 y una pareja de las buenas */
  j.edad = 24;
  for(const k of STAT_KEYS){ j.pot[k] = clamp(Math.max(j.pot[k], 86 + ri(-2, 4)), 60, 99); j.stats[k] = clamp(Math.round(j.pot[k] - ri(3, 8)), 40, 99); }
  j.dinero = 90000;
  const pts = ptsDeRank(8) + ri(0, 250);
  j.puntosHist = [];
  for(let t = 0; t < 4; t++) j.puntosHist.push({ w: j.anio*4 + t - 3, pts: Math.round(pts/4) });
  recalcRank(j);
  j.mejorRank = j.ranking;
  if(j.pareja){ j.pareja.nivel = clamp(ratingDeRank(ri(6, 16)), 40, 95); j.pareja.quimica = 62; j.pareja.nombre = j.pareja.nombre; }
  S.msgs = [{ tipo:'gold', txt:`🐐 <b>Modo Ídolo · ya eres una estrella.</b> Tienes 24 años y estás ${j.ranking ? 'el <b>#' + j.ranking + '</b> del mundo' : 'en el top 10'}, pero la vitrina está vacía. Ahora empieza lo difícil: ganar y quedarte arriba.` },
             { txt:`🤝 Juegas con <b>${esc(nomPareja(j.pareja))}</b>, de los mejores del circuito. La química se construye con victorias.` }];
}
/* al retirarte, la carrera entra en la tabla */
function cerrarIdolo(j){
  if(!j || j.modo !== 'idolo' || j.idoloGuardado) return;
  j.idoloGuardado = true;
  const r = guardarIdolo(j);
  if(r) S.idoloPuesto = r.puesto;
}

/* ── Pantallas ── */
function abrirIdolo(){ S.volverIdolo = S.pantalla; S.pantalla = 'idolo'; render(); if(hayDOM) window.scrollTo(0, 0); }
function idoloHTML(){
  const lista = leerIdolos(), mejor = lista[0];
  return `<div class="card idolo-card">
    <div class="des-top"><div class="eyebrow">${ico('estrella')} EL ÍDOLO</div>${mejor ? `<span class="idolo-rec">${mejor.pts} pts</span>` : ''}</div>
    <div class="idolo-tit">Una de las mejores carreras de la historia</div>
    <p class="muted" style="margin:4px 0 0">El modo difícil de verdad: rivales más duros, ranking más lento y ninguna ayuda. Empiezas desde abajo o ya como estrella, y al retirarte tu carrera entra en la tabla.</p>
    <div style="height:10px"></div>
    <button class="btn" onclick="abrirIdolo()">${ico('estrella')} JUGAR EL ÍDOLO</button>
  </div>`;
}
function vIdolo(){
  const lista = leerIdolos(), j = S.j && !S.j.retirado ? S.j : null;
  const volver = S.volverIdolo && S.volverIdolo !== 'idolo' ? S.volverIdolo : (j ? 'temporada' : 'inicio');
  return `<div class="fade">
  <div class="card idolo-hero">
    <div class="eyebrow">${ico('estrella')} EL ÍDOLO</div>
    <div class="title-xl" style="margin:6px 0 8px">HAZTE LEYENDA</div>
    <p class="sub" style="margin:0">Una carrera en el modo más duro del juego. Los rivales pegan más, el ranking sube más lento, creces más despacio y no hay ayudas en los torneos pequeños. Cuando te retires, se cuenta lo que hiciste y tu carrera entra en la tabla.</p>
  </div>
  <div class="card">
    <div class="eyebrow">${ico('diana')} LAS METAS DE LEYENDA</div><div style="height:8px"></div>
    ${METAS_IDOLO.map(m => `<div class="meta-idolo"><span class="meta-ic">${ico(m.ic)}</span><div class="g"><b>${m.nom}</b><span>${m.d}</span></div><b class="meta-n">${m.n}</b></div>`).join('')}
    <p class="muted" style="margin:9px 0 0">Cada meta cumplida suma 12 puntos a tu marca final.</p>
  </div>
  <div class="card">
    <div class="eyebrow">${ico('carpeta')} EMPEZAR UNA CARRERA DE ÍDOLO</div><div style="height:9px"></div>
    <button class="opt" onclick="empezarIdolo('abajo')"><span class="ic">${ico('pelota')}</span><span><span class="t">DESDE ABAJO</span><span class="d">17 años, sin ranking y con una pala prestada. El camino largo.</span></span></button>
    <button class="opt" onclick="empezarIdolo('estrella')"><span class="ic">${ico('estrella')}</span><span><span class="t">YA ERES UNA ESTRELLA</span><span class="d">24 años, top 10 y una gran pareja, pero la vitrina vacía. A ganarlo todo.</span></span></button>
  </div>
  ${tablaIdolosHTML(lista)}
  ${volverAtras(() => { S.pantalla = volver; })}</div>`;
}
function tablaIdolosHTML(lista){
  if(!lista.length) return `<div class="card"><div class="eyebrow">${ico('trofeo')} LAS MEJORES CARRERAS</div><p class="muted" style="margin:8px 0 0">Todavía no hay ninguna. La primera que termines abre la tabla.</p></div>`;
  return `<div class="card"><div class="eyebrow">${ico('trofeo')} LAS MEJORES CARRERAS</div><div style="height:8px"></div>
    ${lista.map((x, i) => `<div class="idolo-fila ${i === 0 ? 'primera' : ''}">
      <span class="idolo-pos">${i + 1}</span>
      <span class="band-circ" style="width:26px;height:26px"><svg viewBox="0 0 100 100" aria-hidden="true">${fondoBandera(x.pais, 100, 100)}</svg></span>
      <div class="g"><b>${esc(x.nombre)}</b><span>${esc(x.rango)} · ${x.tit} título${x.tit === 1 ? '' : 's'}${x.mj ? ' · ' + x.mj + ' Major' + (x.mj === 1 ? '' : 's') : ''}${x.mun ? ' · ' + x.mun + ' Mundial' + (x.mun === 1 ? '' : 'es') : ''} · mejor #${x.mejor || '—'}${x.inicio === 'estrella' ? ' · estrella' : ''}</span></div>
      <b class="idolo-pts">${x.pts}</b></div>`).join('')}</div>`;
}
/* la tarjeta que se ve en la temporada mientras juegas una carrera de Ídolo */
function idoloTemporadaHTML(j){
  if(!j || j.modo !== 'idolo') return '';
  const p = puntajeIdolo(j), hechas = METAS_IDOLO.filter(m => metaHecha(m, j));
  return `<div class="card idolo-card">
    <div class="des-top"><div class="eyebrow">${ico('estrella')} EL ÍDOLO · ${esc(p.rango)}</div><span class="idolo-rec">${p.pts} pts</span></div>
    <div class="metas-mini">${METAS_IDOLO.map(m => { const v = Math.min(m.v(j), m.n), hecho = v >= m.n;
      return `<div class="meta-mini ${hecho ? 'ok' : ''}" title="${esc(m.nom)}"><span>${ico(m.ic)}</span><b>${m.v(j)}/${m.n}</b></div>`; }).join('')}</div>
    <p class="muted" style="margin:8px 0 0">${hechas.length} de ${METAS_IDOLO.length} metas de leyenda${j.idoloInicio === 'estrella' ? ' · empezaste como estrella' : ''}.</p>
  </div>`;
}
