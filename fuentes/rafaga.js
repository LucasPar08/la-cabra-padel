
/* ═══════════════════════════════════════════════════════════════
   LA RÁFAGA
   El punto de oro sin opciones que elegir: se juega a golpes. Tres golpes
   seguidos y en cada uno un cursor que va y viene; hay que pararlo en la zona
   verde (en el centro dorado, golpe perfecto). Aciertas dos y el punto es
   vuestro. La zona crece con la estadística de cada golpe y con la
   dificultad; el cursor corre más cuanto mejores son los rivales.
   ═══════════════════════════════════════════════════════════════ */
const SERIES_RAFAGA = [
  [['🎾','RESTO','pared'], ['🏐','VOLEA','volea'], ['💥','REMATE','remate']],
  [['☂️','GLOBO','globo'], ['🍽️','BANDEJA','bandeja'], ['🐍','VÍBORA','remate']],
  [['🧱','SALIDA DE PARED','pared'], ['🎾','DRIVE','pared'], ['🏐','VOLEA','volea']],
  [['🪶','CHIQUITA','volea'], ['🏐','VOLEA','volea'], ['💥','REMATE','remate']],
];
const RAFAGA_BIEN = ['La bola salió de la pala justo cuando tenía que salir.', 'Tres golpes, tres decisiones rápidas. Se quedaron mirando.', 'Pegasteis a tiempo cuando más quemaba la bola.'];
const RAFAGA_MAL = ['Un golpe a destiempo y la bola se murió en la red.', 'Llegasteis tarde a la bola buena.', 'Os precipitasteis con la pala y se os fue larga.'];
function crearRafaga(j, edge){
  const D = difActual(), s = j.stats, e = clamp(edge, -15, 15);
  const golpes = pick(SERIES_RAFAGA).map(([ic, nom, stat]) => {
    const w = clamp(0.17 + 0.05*clamp((s[stat] - 55)/40, -1, 1) + D.rafaga + e*0.004, 0.1, 0.42);
    return { ic, nom, stat, w, centro: rnd(w/2 + 0.06, 1 - w/2 - 0.06), res:null, pos:null };
  });
  return { golpes, dur: clamp(1100 + e*14 + D.rafagaMs, 650, 1800), i:0, t0:0, bloqueoHasta:0, ultimo:null, fin:null, finAt:0 };
}
/* el cursor va y viene: tarda `dur` ms en cruzar la barra */
function posCursor(R, ahora){
  const t = Math.max(0, ahora - R.t0), x = (t % (2*R.dur)) / R.dur;
  return x <= 1 ? x : 2 - x;
}
function rafagaActiva(){
  if(!S) return null;
  if(S.pantalla === 'momento' && S.torneo && S.torneo.momento && S.torneo.momento.forma === 'tiempo') return S.torneo.momento.rafaga;
  if(S.pantalla === 'mundial' && S.mundial) return S.mundial.rafaga;
  return null;
}
let rafRafaga = 0;
/* Se llama después de pintar: mueve el cursor de la ráfaga que esté en pantalla */
function animarMinijuego(){
  const R = rafagaActiva();
  if(!hayDOM || !R || R.fin) return;
  cancelAnimationFrame(rafRafaga);
  if(!R.t0) R.t0 = Math.max(performance.now(), R.bloqueoHasta || 0);
  const paso = () => {
    const el = document.getElementById('cursorRafaga');
    if(!el || rafagaActiva() !== R || R.fin) return;
    el.style.left = (posCursor(R, performance.now())*100).toFixed(2) + '%';
    rafRafaga = requestAnimationFrame(paso);
  };
  rafRafaga = requestAnimationFrame(paso);
}
function pegarRafaga(posPrueba){
  const R = rafagaActiva(); if(!R || R.fin) return;
  const ahora = hayDOM ? performance.now() : 0, g = R.golpes[R.i];
  if(!g || (posPrueba == null && ahora < (R.bloqueoHasta || 0))) return;
  const pos = posPrueba != null ? posPrueba : posCursor(R, ahora), dist = Math.abs(pos - g.centro);
  g.pos = pos;
  g.res = dist <= g.w*.15 ? 'perfecto' : dist <= g.w/2 ? 'bien' : 'fuera';
  R.ultimo = R.i;
  const ok = R.golpes.filter(x => x.res === 'bien' || x.res === 'perfecto').length, mal = R.golpes.filter(x => x.res === 'fuera').length;
  Sonido.golpe(g.res === 'perfecto' ? 1 : g.res === 'bien' ? .6 : .15);
  if(hayDOM && PREF.vibracion && navigator.vibrate){ try{ navigator.vibrate(g.res === 'fuera' ? [30, 40, 30] : 15); }catch(e){} }
  if(ok >= 2 || mal >= 2){
    const perf = R.golpes.filter(x => x.res === 'perfecto').length, gana = ok >= 2;
    R.fin = { gana, perf }; R.finAt = ahora;
    const texto = gana ? pick(RAFAGA_BIEN) + (perf >= 2 ? ' ¡Y con dos golpes perfectos!' : '') : pick(RAFAGA_MAL);
    const m = S.torneo && S.torneo.momento;
    if(m && m.rafaga === R) m.eleccion = { i:-1, gana, texto };
    else if(S.mundial && S.mundial.rafaga === R) S.mundial.eleccion = { gana, texto };
  } else { R.i++; R.t0 = 0; R.bloqueoHasta = ahora + 450; }
  guardar(); render();
}
/* el toque que acaba la ráfaga no puede pulsar sin querer el botón que aparece debajo del dedo */
function rafagaRecienAcabada(R){ return hayDOM && R && R.finAt && performance.now() - R.finAt < 600; }
function chipsRafaga(R){
  return `<div class="chips-rafaga">${R.golpes.map((g, i) => {
    const cls = g.res || (i === R.i && !R.fin ? 'ahora' : '');
    const marca = g.res === 'perfecto' ? '⭐' : g.res === 'bien' ? '✅' : g.res === 'fuera' ? '❌' : '';
    return `<span class="chip ${cls}">${g.ic}${marca ? ' ' + marca : ''}</span>`;
  }).join('')}</div>`;
}
function rafagaHTML(R){
  const g = R.golpes[R.i], u = R.ultimo != null ? R.golpes[R.ultimo] : null;
  const tecla = hayDOM && matchMedia('(hover:hover) and (pointer:fine)').matches;
  const aviso = u ? (u.res === 'perfecto' ? `<b style="color:var(--gold)">⭐ ¡${u.nom} perfecto!</b>` : u.res === 'bien' ? `<b style="color:var(--bien)">✅ ${u.nom} dentro.</b>` : `<b style="color:var(--danger)">❌ ${u.nom} fuera.</b>`) + ' Siguiente golpe.'
    : 'Aciertas <b>2 de 3</b> y el punto es vuestro.';
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">⚡ RÁFAGA · GOLPE ${R.i + 1} DE 3</div>${chipsRafaga(R)}</div>
    <div class="title-lg" style="margin:9px 0 2px">${g.ic} ${g.nom}</div>
    <p class="muted" style="margin:0 0 12px">${aviso}</p>
    <div class="barra-rafaga" onpointerdown="event.preventDefault();pegarRafaga()">
      <div class="zona" style="left:${((g.centro - g.w/2)*100).toFixed(1)}%;width:${(g.w*100).toFixed(1)}%"><i></i></div>
      <div class="cursor" id="cursorRafaga" style="left:0%"></div>
    </div>
    <button class="btn pegar" onpointerdown="event.preventDefault();pegarRafaga()">🎾 ¡PEGAR!</button>
    <p class="muted center" style="margin:8px 0 0">Para el cursor en la zona <b style="color:var(--bien)">verde</b>; en el centro <b style="color:var(--gold)">dorado</b>, golpe perfecto.${tecla ? ' También con <kbd>Espacio</kbd>.' : ''}</p>
  </div>`;
}
if(hayDOM) addEventListener('keydown', e => {
  if(!S || S.esperandoTecla || (e.code !== 'Space' && e.code !== 'Enter') || !rafagaActiva()) return;
  e.preventDefault();
  if(!e.repeat) pegarRafaga();
});

/* El Mundial de Selecciones también se decide a ráfaga, con tu país mirando */
function crearMundialRafaga(j){
  const p = paisDe(j), ev = { t:'MUN', nom:'Mundial de Selecciones', ciudad: pick(p.ciudades).n, pista: p.pista, pais:null };
  const opp = generarRival('P1', 4, 6);
  return { ev, opp, ronda: RONDAS_MUNDIAL[Math.min(j.mundialRonda || 0, 3)], rafaga: crearRafaga(j, ratingDupla(j, ev.pista, ev) - opp.rating + difActual().sim), eleccion:null };
}
function continuarMundial(){
  const j = S.j, mu = S.mundial; if(!mu || !mu.eleccion || rafagaRecienAcabada(mu.rafaga)) return;
  const gana = mu.eleccion.gana;
  j.orosJugados = (j.orosJugados||0) + 1;
  if(gana){ j.orosGanados = (j.orosGanados||0) + 1; j.moral = clamp(j.moral+9, 0, 100); j.forma = clamp(j.forma+2, -12, 12); }
  else { j.moral = clamp(j.moral-7, 0, 100); j.forma = clamp(j.forma-2, -12, 12); }
  S.mundial = null;
  S.duelo = { contexto:'mundial', resultado:{ gana } };
  cerrarDuelo();                        // lo que pasa con tu país, como siempre
}
function vMundial(){
  const j = S.j, mu = S.mundial;
  if(!mu){ S.pantalla = 'temporada'; return vTemporada(); }
  const e = mu.eleccion;
  const h = `<div class="fade">
  <div class="card" style="background:linear-gradient(160deg,rgba(245,197,66,.18),transparent 62%);border-color:rgba(245,197,66,.4)">
    <div class="eyebrow">🇺🇳 MUNDIAL DE SELECCIONES · ${mu.ronda.nom}</div>
    <div class="title-xl" style="margin:6px 0 8px">⚡ PUNTO POR TU PAÍS</div>
    <p class="sub" style="margin:0">Un set para cada pareja, 5-5 en el tercero y punto de oro. ${mu.ronda.d}</p>
    <div class="hr"></div>
    <div class="mrow"><span class="nm">${fichaPais(paisDe(j).cod)} ${esc(j.nombre)} / ${esc(j.pareja ? j.pareja.nombre : '—')}</span></div>
    <div class="mrow"><span class="nm">${fichaPais(mu.opp.flag)} ${esc(mu.opp.nombre)} / ${esc(mu.opp.nombre2)}</span><span class="rk">#${mu.opp.rank}</span></div>
  </div>`;
  if(!e) return h + rafagaHTML(mu.rafaga) + `</div>`;
  return h + `<div class="card ${e.gana ? 'event-hero' : 'event-hero mal'}">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">⚡ RÁFAGA</div>${chipsRafaga(mu.rafaga)}</div>
    <div class="title-xl" style="margin:6px 0 8px">${e.gana ? '🏅 ¡PUNTO PARA TU PAÍS!' : '😖 SE OS ESCAPÓ'}</div>
    <p class="sub" style="margin:0">${e.texto}</p>
  </div>
  <button class="btn" onclick="continuarMundial()">CONTINUAR</button></div>`;
}
