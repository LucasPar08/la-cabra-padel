
/* ═══════════════════════════════════════════════════════════════
   MÁS CARRERA Y MÁS PISTA
   · El circuito con nombre: las 40 mejores parejas se repiten y guardan historial contigo.
   · Pareja para cada torneo, material (palas y zapatillas) y partidos enteros en la pista.
   · Salida de pista, apuntar el golpe, entrenamiento, tu jugador a tu gusto y ambiente.
   ═══════════════════════════════════════════════════════════════ */

/* ── El circuito con nombre ── */
function ptsDeRank(k){
  let lo = 1, hi = 13000;
  for(let i = 0; i < 40; i++){ const m = (lo + hi)/2; if((rankDePuntos(m) || 2000) > k) lo = m; else hi = m; }
  return Math.round(hi);
}
function nuevaParejaCircuito(rank){
  const d = duplaRival(rank);
  return { id:'c' + ri(100000, 999999), nombre:d.nombre, nombre2:d.nombre2, flag:d.flag, flag2:d.flag2, arq:d.arq, forma:rnd(-2, 2), titulos:0 };
}
function asegurarCircuito(j){
  if(!j) return [];
  if(!j.circuito || !j.circuito.length){
    j.circuito = [];
    for(let k = 1; k <= 40; k++){ const p = nuevaParejaCircuito(k); p.titulos = Math.max(0, Math.round((41 - k)/5 + rnd(-1, 2))); j.circuito.push(p); }
  }
  return j.circuito;
}
/* cada casilla del circuito ocupa un puesto del ranking, contando que vosotros también tenéis el vuestro */
function casillaDeRank(j, rank){ return j.ranking && rank > j.ranking ? rank - 1 : rank; }
function rivalDelCircuito(rank){
  const j = S ? S.j : null;
  if(!j || j.retirado || rank > 40) return duplaRival(rank);
  const pool = asegurarCircuito(j), p = pool[clamp(casillaDeRank(j, rank), 1, pool.length) - 1];
  return { id:p.id, nombre:p.nombre, nombre2:p.nombre2, flag:p.flag, flag2:p.flag2, arq:p.arq, rank, rating: ratingDeRank(rank) + p.forma };
}
function rivalesSinRepetir(t, rondas){
  const usados = new Set();
  return [...Array(rondas)].map((_, k) => {
    for(let i = 0; i < 12; i++){ const r = generarRival(t, k, rondas); if(!r.id || !usados.has(r.id)){ if(r.id) usados.add(r.id); return r; } }
    return duplaRival(generarRival(t, k, rondas).rank);
  });
}
/* cada trimestre el circuito se mueve: parejas en racha suben, otras bajan y alguna se separa */
function evolucionarCircuito(j){
  const pool = asegurarCircuito(j);
  for(const p of pool) p.forma = clamp(p.forma*.7 + rnd(-1.4, 1.4), -3, 3);
  for(let pasada = 0; pasada < 2; pasada++)
    for(let s = pool.length - 1; s > 0; s--)
      if(pool[s].forma - pool[s-1].forma > rnd(.8, 3.5)){ const t = pool[s]; pool[s] = pool[s-1]; pool[s-1] = t; }
  if(Math.random() < .35){ pool.splice(ri(24, pool.length - 1), 1); pool.push(nuevaParejaCircuito(40)); }
  if(Math.random() < .6) pool[0].titulos++;
  for(let s = 1; s < 10; s++) if(Math.random() < .12) pool[s].titulos++;
}
function anotarH2H(j, opp, gano){
  if(!j || !opp || !opp.id) return;
  const h = j.h2h = j.h2h || {}, e = h[opp.id] = h[opp.id] || { g:0, p:0, n: opp.nombre + ' / ' + opp.nombre2, flag: opp.flag };
  if(gano) e.g++; else e.p++;
  const p = (j.circuito || []).find(x => x.id === opp.id);
  if(p) p.forma = clamp(p.forma + (gano ? -.35 : .35), -3, 3);
}
function h2hDe(j, id){ return j && j.h2h && id ? j.h2h[id] || null : null; }
function rivalidades(j){
  return Object.keys(j.h2h || {}).map(id => Object.assign({ id }, j.h2h[id])).filter(e => e.g + e.p >= 2).sort((a, b) => (b.g + b.p) - (a.g + a.p)).slice(0, 3);
}
function vRanking(){
  const j = S.j; if(!j){ S.pantalla = 'inicio'; return vInicio(); }
  const pool = asegurarCircuito(j), riv = rivalidades(j), ids = new Set(riv.map(r => r.id)), pts = puntosActuales(j);
  const tu = rk => `<div class="rk-fila tu"><span class="rk-n">#${rk}</span><span class="rk-nm">${fichaPais(j.cod)} <b>${esc(j.nombre)} / ${esc(j.pareja ? j.pareja.nombre : '—')}</b><small>${rk > 20 ? `A ${Math.max(0, ptsDeRank(20) - pts)} pts del top 20` : 'Vosotros'}</small></span><span class="rk-pt">${pts} pts</span></div>`;
  let filas = '';
  for(let r = 1; r <= 20; r++){
    if(j.ranking === r){ filas += tu(r); continue; }
    const p = pool[casillaDeRank(j, r) - 1]; if(!p) continue;
    const e = h2hDe(j, p.id);
    filas += `<div class="rk-fila"><span class="rk-n">#${r}</span><span class="rk-nm">${fichaPais(p.flag)} ${esc(p.nombre)} / ${esc(p.nombre2)}${ids.has(p.id) ? ' <span class="rk-riv">⚔️ RIVALIDAD</span>' : ''}
      <small>${p.titulos} título${p.titulos === 1 ? '' : 's'} · juegan a ${esc(p.arq.nom)}${e ? ` · contra vosotros <b>${e.g}-${e.p}</b>` : ''}</small></span><span class="rk-pt">${ptsDeRank(r)} pts</span></div>`;
  }
  if(j.ranking && j.ranking > 20) filas += tu(j.ranking);
  return `<div class="fade">
  <div class="card event-hero"><div class="eyebrow">${ico('ranking')} RANKING MUNDIAL</div>
    <div class="title-lg" style="margin:5px 0 4px">Las 20 mejores parejas</div>
    <p class="sub" style="margin:0">Son siempre las mismas: os las iréis cruzando en los cuadros grandes y cada partido queda en el historial. ${j.ranking ? `Vosotros: <b>#${j.ranking}</b> con <b>${pts} pts</b>.` : 'Todavía no tenéis ranking.'}</p></div>
  <div class="card">${filas}${!j.ranking ? '<p class="muted" style="margin:8px 0 0">Suma puntos en los FIP para entrar en el ranking.</p>' : ''}</div>
  <div class="card"><div class="eyebrow">⚔️ VUESTRAS RIVALIDADES</div><div style="height:4px"></div>
    ${riv.length ? riv.map(r => `<div class="li"><div class="g"><b>${fichaPais(r.flag)} ${esc(r.n)}</b><span>${r.g + r.p} partidos entre vosotros</span></div><span class="pill ${r.g >= r.p ? 'acc' : 'mal'}">${r.g}-${r.p}</span></div>`).join('')
      : '<p class="muted" style="margin:4px 0 0">Cuando os crucéis varias veces con la misma pareja, aquí aparecerá vuestro historial.</p>'}
  </div>
  <button class="btn ghost" onclick="S.pantalla='temporada';render()">VOLVER</button></div>`;
}

/* ── Pareja para cada torneo ── */
function suplentesTrimestre(j){
  const tr = trimActual();
  if(!tr.suplentes){
    const base = escalar(rawJugador(j)), pos = posContraria(j.posicion);
    tr.suplentes = [
      Object.assign(nuevaPareja(base + rnd(3, 6), pick(NAC_RIV), pos, ri(24, 32)), { quimica: ri(32, 40), etiqueta:'más nivel, poca química' }),
      Object.assign(nuevaPareja(base + rnd(-2, 1), paisDe(j).cod, pos, ri(19, 27)), { quimica: ri(42, 50), etiqueta:'de tu país: os entendéis rápido' }),
    ];
  }
  return tr.suplentes;
}
function parejaElegida(j, ev){
  const k = ((trimActual().parejaTorneo || {})[ev.id]) || 0;
  return k > 0 ? suplentesTrimestre(j)[k - 1] : j.pareja;
}
function elegirParejaTorneo(id, k){ const tr = trimActual(); tr.parejaTorneo = tr.parejaTorneo || {}; tr.parejaTorneo[id] = k; guardar(); render(); }
function conPareja(j, p, fn){ const orig = j.pareja; j.pareja = p; try{ return fn(); } finally { j.pareja = orig; } }
function parejasTorneoHTML(j, ev, tipo){
  const k = ((trimActual().parejaTorneo || {})[ev.id]) || 0;
  const op = (p, i, t, d) => {
    const ch = conPareja(j, p, () => chanceTitulo(ev, chancesTorneo(j, ev, tipo), null));
    return `<button class="opt ${k === i ? 'on' : ''}" onclick="elegirParejaTorneo('${ev.id}', ${i})"><span class="ic">${i ? '🔁' : '🤝'}</span><span>
      <span class="t">${esc(p.nombre)} · nivel ${Number(p.nivel).toFixed(1)} · química ${Math.round(p.quimica)}</span>
      <span class="d">${t}${d ? ' · ' + d : ''} · 🏆 <b>${fmtChance(ch.titulo)}</b> de ganar el torneo</span></span></button>`;
  };
  return `<div class="card"><div class="eyebrow">🤝 ¿CON QUIÉN JUGÁIS ESTE TORNEO?</div><div style="height:8px"></div>
    ${j.pareja ? op(j.pareja, 0, 'Tu pareja de siempre', '') : ''}
    ${suplentesTrimestre(j).map((p, i) => op(p, i + 1, 'Solo este torneo', p.etiqueta)).join('')}
    <p class="muted" style="margin:6px 0 0">Si juegas con otra, tu pareja de siempre se queda en casa este torneo y lo nota un poco en la química.</p></div>`;
}

/* ── Material: palas y zapatillas ── */
const PALAS = [
  { id:'club',     ic:'🏓', nom:'Pala del club',             costo:0,     sim:0,   control:0,    potencia:0,   d:'La que te prestaron en el club.' },
  { id:'control',  ic:'🎯', nom:'Pala redonda de control',   costo:3500,  sim:.4,  control:.12,  potencia:0,   d:'Punto dulce grande: fallas menos defendiendo y en la volea.' },
  { id:'potencia', ic:'💥', nom:'Pala diamante de potencia', costo:6500,  sim:.5,  control:-.04, potencia:.08, d:'Remates más fuertes y más fáciles de sacar por 3.' },
  { id:'hibrida',  ic:'⚖️', nom:'Pala lágrima híbrida',      costo:12000, sim:.8,  control:.07,  potencia:.05, d:'Lo mejor de las dos: control y pegada.' },
  { id:'carbono',  ic:'🏆', nom:'Pala pro de carbono 18K',   costo:32000, sim:1.3, control:.12,  potencia:.09, d:'La que usan las parejas del top 10.' },
];
const ZAPAS = [
  { id:'basicas', ic:'👟', nom:'Zapatillas de siempre',       costo:0,    sim:0,  vel:0,   d:'Cumplen, pero resbalan en el césped.' },
  { id:'espiga',  ic:'👟', nom:'Suela de espiga para césped', costo:2500, sim:.3, vel:.25, d:'Agarre de verdad: arrancas antes.' },
  { id:'ligeras', ic:'⚡', nom:'Zapatillas pro ultraligeras',  costo:9000, sim:.6, vel:.45, d:'Llegas a bolas que antes eran imposibles.' },
];
function materialDe(j){
  if(!j) return null;
  if(!j.material) j.material = { pala:'club', zapas:'basicas', tengo:['club','basicas'] };
  return j.material;
}
function equipoMaterial(j){
  const m = materialDe(j);
  return { pala: (m && PALAS.find(x => x.id === m.pala)) || PALAS[0], zapas: (m && ZAPAS.find(x => x.id === m.zapas)) || ZAPAS[0] };
}
function bonoEquipo(j){ if(!j) return 0; const e = equipoMaterial(j); return e.pala.sim + e.zapas.sim; }
function aplicarMaterial(j, h){
  if(!j) return h;
  const e = equipoMaterial(j), c = e.pala.control || 0, pot = e.pala.potencia || 0;
  for(const k in h.multFalloTiro) h.multFalloTiro[k] *= 1 - c;
  h.umbralPorTres -= pot;
  h.multTTiro.remate = (h.multTTiro.remate || 1)*(1 - pot); h.multTTiro.vibora = (h.multTTiro.vibora || 1)*(1 - pot*.6);
  h.vel += e.zapas.vel || 0;
  return h;
}
function efectoMaterial(it){
  const x = [];
  if(it.control) x.push(`${it.control > 0 ? '−' : '+'}${Math.round(Math.abs(it.control)*100)}% de errores`);
  if(it.potencia) x.push(`+${Math.round(it.potencia*100)}% de pegada`);
  if(it.vel) x.push(`+${it.vel} m/s`);
  if(it.sim) x.push(`+${it.sim} de nivel en los partidos`);
  return x.join(' · ');
}
function comprarMaterial(id){
  const j = S.j, it = PALAS.concat(ZAPAS).find(x => x.id === id); if(!j || !it) return;
  const m = materialDe(j);
  if(!m.tengo.includes(id)){ if(j.dinero < it.costo) return; j.dinero -= it.costo; m.tengo.push(id); j.hist.push({ a:j.anio, t:`${it.ic} Material nuevo: ${it.nom}` }); }
  if(PALAS.some(x => x.id === id)) m.pala = id; else m.zapas = id;
  guardar(); render();
}
function materialHTML(j){
  const m = materialDe(j);
  const fila = it => {
    const tengo = m.tengo.includes(it.id), puesto = m.pala === it.id || m.zapas === it.id, puede = tengo || j.dinero >= it.costo, ef = efectoMaterial(it);
    return `<button class="opt ${puesto ? 'on' : ''}" ${puede && !puesto ? `onclick="comprarMaterial('${it.id}')"` : 'disabled'} ${!puede ? 'style="opacity:.45"' : ''}>
      <span class="ic">${it.ic}</span><span><span class="t">${it.nom}${puesto ? ' · EN USO' : tengo ? ' · USAR' : ' · ' + money(it.costo)}</span><span class="d">${it.d}${ef ? ' <b>' + ef + '</b>' : ''}</span></span></button>`;
  };
  return `<div class="card"><div class="eyebrow">🏓 PALAS</div><p class="muted" style="margin:5px 0 8px">Se compran una vez y son tuyas. Cambian cómo te salen los golpes en la pista y suben vuestro nivel en los partidos simulados (y, con él, tus porcentajes).</p>${PALAS.map(fila).join('')}</div>
  <div class="card"><div class="eyebrow">👟 ZAPATILLAS</div><div style="height:8px"></div>${ZAPAS.map(fila).join('')}</div>`;
}

/* ── El partido entero en la pista ── */
function probTieBreak(p){
  const q = 1 - p, iguales = p*p/(p*p + q*q), memo = {};
  const f = (a, b) => {
    if(a >= 7 && a - b >= 2) return 1; if(b >= 7 && b - a >= 2) return 0; if(a >= 6 && a === b) return iguales;
    const k = a + ',' + b; if(memo[k] == null) memo[k] = p*f(a + 1, b) + q*f(a, b + 1); return memo[k];
  };
  return f(0, 0);
}
function probSetFormato(p, N){
  const g = probJuego(p, 0, 0), tb = probTieBreak(p), memo = {};
  const f = (a, b) => {
    if(a >= N && a - b >= 2) return 1; if(b >= N && b - a >= 2) return 0; if(a === N && b === N) return tb;
    const k = a + ',' + b; if(memo[k] == null) memo[k] = g*f(a + 1, b) + (1 - g)*f(a, b + 1); return memo[k];
  };
  return f(0, 0);
}
function probPartidoFormato(p, N, sets){ const s = probSetFormato(p, N); return sets === 3 ? s*s*(3 - 2*s) : s; }
/* el punto que, jugado hasta el final con ese formato, da justo el % del partido (para "simular lo que queda") */
function pPuntoPartido(obj, N, sets){
  let lo = .02, hi = .98;
  for(let k = 0; k < 28; k++){ const m = (lo + hi)/2; if(probPartidoFormato(m, N, sets) < obj) lo = m; else hi = m; }
  return (lo + hi)/2;
}
function formatoCarrera(){ return { juegos: [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3, sets: PREF.sets === 3 ? 3 : 1 }; }
function jugarPartidoEnPista(){
  const j = S.j, to = S.torneo; if(!to || to.fin || to.momento || minijuegoDeRonda(to)) return;
  const T = TIERS[to.ev.t], obj = probPartido(j, to.rival, to.ev)/100, rondaNom = nombreRondaActual(to), f = formatoCarrera();
  const cfg = cfgPartidoCarrera(j, to.rival, to.ev, rondaNom);
  cfg.rival = paramsRivalPista(edgeDesdeProb(obj) + difActual().rival, to.rival.arq);
  cfg.juegos = f.juegos; cfg.sets = f.sets; cfg.pPunto = pPuntoPartido(obj, f.juegos, f.sets);
  cfg.titulo = rondaNom; cfg.avisoSub = `${formatoTexto(f.sets, f.juegos, true)}<br>${Math.round(obj*100)}% de ganar si lo simulas`;
  cfg.subtitulo = `${to.rival.nombre.split(' ')[0]} / ${to.rival.nombre2.split(' ')[0]} · ${formatoTexto(f.sets, f.juegos, true)}`;
  cfg.alTerminar = rp => {
    const res = simularConResultado(j, to.rival, to.ev, to.enPrevia ? 0 : to.ronda, T.rondas, rp.gano);
    res.ronda = rondaNom; if(to.enPrevia) res.previa = true;
    res.sets = (rp.sets && rp.sets.length ? rp.sets : [rp.juegos]).map(s => s[0] + '-' + s[1]);
    res.partidoEnPista = true; res.oros = [];
    if(!rp.simulado && rp.stats){
      const st = rp.stats;
      res.vivo = { golpes:st.golpes, rallyMax:st.rallyMax, porTres:st.porTres, remates:st.remates, globos:st.globos, dejadas:st.dejadas, perfectos:st.perfectos };
      const pi = j.pista = j.pista || { jugados:0, ganados:0, porTres:0, rallyMax:0, perfectos:0 };
      pi.jugados++; if(rp.gano) pi.ganados++; pi.porTres += st.porTres; pi.rallyMax = Math.max(pi.rallyMax, st.rallyMax); pi.perfectos += st.perfectos;
    }
    S.pantalla = 'torneo';
    aplicarPartido(res);
  };
  S.pantalla = 'torneo';
  iniciarPartidoPista(cfg);
}
function jugarBotonRonda(){
  const to = S.torneo;
  if(to && to.todoEnPista && !minijuegoDeRonda(to)) jugarPartidoEnPista(); else jugarRonda();
}

/* ── Apuntar el golpe: izquierda/derecha elige el lado (paralelo o cruzado según dónde estés), arriba = al fondo, abajo = corta ── */
function apuntarHumano(j, eje){
  const hayX = Math.abs(eje.x) > .3, hayY = Math.abs(eje.y) > .45;
  if(!hayX && !hayY) return null;
  const tx = hayX ? clamp(W/2 + eje.x*3.9, .9, W - .9) : null, prof = hayY ? (eje.y < 0 ? 1 : -1) : 0;
  let nombre = '';
  if(hayX) nombre = Math.abs(tx - W/2) < 1.2 ? 'AL MEDIO' : (tx > W/2) === (j.x > W/2) ? 'PARALELO' : 'CRUZADO';
  if(prof) nombre = (nombre ? nombre + ' · ' : '') + (prof > 0 ? 'AL FONDO' : 'CORTA');
  return { tx, prof, nombre };
}
function dibujarApunte(c){
  const a = P.apunte, yo = P.jug[0];
  const tx = a.tx != null ? a.tx : (yo.x < W/2 ? 7.2 : 2.8), ty = RED_Y - (a.prof > 0 ? 8.4 : a.prof < 0 ? 2.8 : 6);
  anilloSuelo(c, tx, ty, .55, 'rgba(244,246,248,.75)', 2);
  anilloSuelo(c, tx, ty, .16, 'rgba(244,246,248,.95)', 2);
}

/* ── Salida de pista: la bola que se va por el lateral se puede ir a buscar fuera, por la puerta ── */
function intentarSalida(b, recibe){
  if(!P || P.drill) return false;
  const lado = b.x < W/2 ? -1 : 1, puertaX = lado < 0 ? 0 : W, puertaY = recibe === 0 ? RED_Y + 1.3 : RED_Y - 1.3;
  const fx = puertaX + lado*1.7, fy = clamp(b.y, recibe === 0 ? RED_Y + .8 : 1.2, recibe === 0 ? L - 1.2 : RED_Y - .8);
  let mejor = null;
  for(const j of P.jug){
    if(j.lado !== recibe || j.inactivo) continue;
    const t = (Math.hypot(j.x - puertaX, j.y - puertaY) + Math.hypot(puertaX - fx, puertaY - fy))/Math.max(3, j.vel);
    if(!mejor || t < mejor.t) mejor = { j, t };
  }
  if(!mejor || mejor.t > 2.4) return false;
  const j = mejor.j, humano = j.humano && !P.humanoIA;
  P.salida = { id:j.id, fin: P.t + (humano ? 1.25 : .85), x:fx, y:fy, lado, recibe, pidio:false, margen: 2.4 - mejor.t, humano };
  P.estado = 'salida'; j.fuera = true; Input.accion = null;
  mostrarAviso('¡SALIDA DE PISTA!', humano ? '¡Corre fuera y pulsa GOLPE para devolverla!' : j.lado === 0 ? 'Tu pareja sale a buscarla' : 'Salen a buscarla', '#7FD3F7', humano ? 1.25 : .85);
  Sonido.grada(); P.fiesta = 1.2;
  return true;
}
function actualizarSalida(dt){
  const sa = P.salida, b = P.bola;
  for(const j of P.jug){
    if(j.inactivo) continue;
    if(j.id === sa.id) moverHacia(j, sa.x, sa.y, j.vel*1.15);
    else { const o = posicionBase(j); moverHacia(j, o.x, o.y, j.vel*.7); }
    aplicarMovimiento(j, dt);
    if(j.anim > 0) j.anim -= dt;
  }
  /* la bola cae fuera, por donde corre el que sale */
  const k = Math.min(1, dt*2.6);
  b.x += (sa.x + sa.lado*.3 - b.x)*k; b.y += (sa.y - b.y)*k; b.z = Math.max(.9, b.z - dt*2.2);
  if(sa.humano && Input.accion){ sa.pidio = true; Input.accion = null; }
  if(P.t >= sa.fin) resolverSalida();
}
function resolverSalida(){
  const sa = P.salida, j = P.jug[sa.id], b = P.bola;
  const p = sa.humano ? (sa.pidio ? clamp(.5 + sa.margen*.18 + (j.bonusCal || 0), .35, .85) : 0) : clamp(.22 + sa.margen*.22 + ((j.hab || .6) - .55), .1, .7);
  P.salida = null; P.estado = 'juego';
  if(Math.random() >= p){ b.viva = true; return terminar(1 - sa.recibe, '¡Por 3!', { porTres:true }); }
  j.x = sa.x; j.y = sa.y;
  Object.assign(b, { x: sa.x - sa.lado*.35, y: sa.y, z: 1, fueraPista: true, viva: true });
  golpear(j, 'globo', clamp(.55 + (j.hab || .6)*.3, .45, .9), sa.lado < 0 ? rnd(1.8, 4.2) : rnd(5.8, 8.2));
  b.fueraPista = true;
  if(j.lado === 0) P.stats.salidas = (P.stats.salidas || 0) + 1;
  Efectos.texto(j.x, j.y, '¡DEVUELTA DESDE FUERA!', '#7FD3F7'); Sonido.grada(); P.fiesta = 1.6;
}

/* ── Entrenamiento: diez bolas y un objetivo ── */
const DRILLS = {
  bandeja: { nom:'Bandeja', ic:'🎾', stat:'bandeja', objetivo:6, tipos:['bandeja'], como:'Te tiran globos: bandeja (GOLPE con la bola alta) que bote al fondo',
             bien:'Bandeja al fondo', pista:'GOLPE con la bola alta y que bote cerca del fondo', zona:{ y0:0, y1:4.2 } },
  vibora:  { nom:'Víbora', ic:'🐍', stat:'remate', objetivo:5, tipos:['vibora'], como:'REMATE a media altura, cortado y hacia un lateral',
             bien:'Víbora a la esquina', pista:'REMATE a media altura y hacia un lateral', zona:{ y0:0, y1:5.5, lados:true } },
  remate:  { nom:'Remate', ic:'💥', stat:'remate', objetivo:6, tipos:['remate'], como:'Te tiran globos cortos: REMATE con la bola bien alta y a fondo de pista',
             bien:'¡Remate!', pista:'REMATE con la bola por encima de la cabeza', zona:{ y0:3.4, y1:7.8 } },
  volea:   { nom:'Volea', ic:'🏐', stat:'volea', objetivo:6, tipos:['volea'], como:'En la red: GOLPE antes de que bote y al fondo',
             bien:'Volea profunda', pista:'Antes del bote y al fondo', zona:{ y0:0, y1:5 } },
  pared:   { nom:'Salida de pared', ic:'🧱', stat:'pared', objetivo:5, tipos:null, como:'Deja que la bola pegue en el cristal y pégale a la vuelta',
             bien:'Salida de pared', pista:'Espera a que salga del cristal', zona:{ y0:0, y1:RED_Y } },
  saque:   { nom:'Saque', ic:'🎯', stat:'mental', objetivo:7, tipos:null, como:'Saca cruzado y dentro del cuadro, alternando lados',
             bien:'Saque dentro', pista:'Cruzado y dentro del cuadro', zona:null },
};
/* en el entrenamiento, la asistencia te coloca para la bola que toca practicar (el botón y el momento los pones tú) */
function okDrill(s){
  const id = P.drill.id;
  if(id === 'bandeja') return s.botes === 0 && s.z >= 1.9 && s.z <= 2.6;
  if(id === 'vibora') return s.botes === 0 && s.z >= 1.3 && s.z <= 1.7;
  if(id === 'remate') return s.botes === 0 && s.z >= 2.05 && s.z <= 2.95;
  if(id === 'volea') return s.botes === 0 && s.z >= .6 && s.z <= 1.5;
  if(id === 'pared') return !!s.pared && s.botes >= 1 && s.z >= .3 && s.z <= 1.4;
  return s.botes >= 1 && s.z >= .2 && s.z <= 1.6;
}
function evaluarDrill(b){
  const d = P.drill, z = DRILLS[d.id].zona;
  if(d.id === 'saque') return !!b.saque && enCajaSaque(b);
  if(d.id === 'pared' && !b.salioDePared) return false;
  if(d.id === 'remate' && b.porTres) return true;        // un remate por tres es un acierto vaya donde vaya
  if(d.tipos && !d.tipos.includes(b.ultimoTiro)) return false;
  if(b.y < z.y0 || b.y > z.y1) return false;
  return !z.lados || b.x < 3 || b.x > W - 3;
}
function finDrill(ok, motivo){
  const d = P.drill, info = DRILLS[d.id];
  P.bola.viva = false;
  d.intentos++; if(ok) d.aciertos++;
  mostrarAviso(ok ? '¡BIEN!' : 'FALLO', ok ? info.bien : (motivo ? motivo + ' · ' : '') + info.pista, ok ? '#DCF54A' : '#FF8A7A', .9);
  Sonido.punto(ok); if(ok){ Efectos.texto(P.jug[0].x, P.jug[0].y, '+1', '#DCF54A'); P.fiesta = .8; }
  P.estado = 'drillPausa'; P.timer = .95;
  actualizarHUD();
  return 'fin';
}
function prepararDrill(){
  const d = P.drill, yo = P.jug[0], lan = P.jug[2];
  for(const j of P.jug){ j.vx = j.vy = 0; j.swing = 0; j.cd = 0; j.anim = 0; j.fuera = false; }
  yo.x = yo.carrilBase === 'izq' ? 2.7 : 7.3;
  yo.y = d.id === 'pared' ? 18.1 : d.id === 'saque' ? 17.4 : d.id === 'remate' ? 12.8 : 13.2;
  lan.x = W/2; lan.y = 2.6;
  P.rally = 0; P.prediccion = [];
  if(d.id === 'saque'){
    yo.x = d.intentos % 2 === 0 ? 7.3 : 2.7;
    lan.x = W - yo.x; lan.y = 1.9;
    P.saqueDe = 0; P.saqueN = 1; P.sacaAhora = 0;
    P.bola = Object.assign(nuevaBola(), { x: yo.x + .3, y: yo.y - .35, z: .5 });
    P.estado = 'saque'; P.timer = 2.6;
    mostrarAyuda('Saca: pulsa GOLPE');
  } else {
    P.bola = nuevaBola();
    lanzarDrill(d.id);
  }
  actualizarHUD();
}
function lanzarDrill(id){
  const b = P.bola, lan = P.jug[2], yo = P.jug[0];
  Object.assign(b, { x: lan.x, y: lan.y + .35, z: 1, viva:true, rastro:[] });
  const tx = clamp(yo.x + rnd(-.6, .6), 1, W - 1);
  const [ty, T] = id === 'bandeja' ? [rnd(17.6, 18.8), 1.9] : id === 'remate' ? [rnd(14.8, 16), 1.7] : id === 'vibora' ? [rnd(16.4, 17.6), 1.35] : id === 'volea' ? [rnd(14.6, 15.6), .95] : [rnd(15.8, 16.4), .9];
  const v = tiroHacia(b, tx, ty, T);
  Object.assign(b, { vx:v.vx, vy:v.vy, vz:v.vz, golpeo:1, botes:0, cruzo:false, saque:false, pared:false, porTres:false, fueraPista:false,
                     efecto: id === 'pared' ? 'liftado' : null, ultimoTiro: id === 'volea' || id === 'pared' ? 'drive' : 'globo', golpeador:2, tocoRed:false, letForzado:false });
  P.tGolpe = P.t; P.estado = 'juego';
  P.prediccion = predecirBola(b, 4);
  lan.anim = .22; Sonido.golpe(.6);
}
function dibujarZonaDrill(c){
  const d = P.drill, z = DRILLS[d.id].zona;
  c.fillStyle = 'rgba(220,245,74,.15)'; c.strokeStyle = 'rgba(220,245,74,.75)'; c.lineWidth = 2;
  const rect = (x0, y0, x1, y1) => { poli(c, [[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0]]); c.fill(); c.stroke(); };
  if(d.id === 'saque'){ const derecha = d.intentos % 2 === 0; rect(derecha ? 0 : W/2, RED_Y - LINEA_SAQUE, derecha ? W/2 : W, RED_Y); return; }
  if(z.lados){ rect(0, z.y0, 3, z.y1); rect(W - 3, z.y0, W, z.y1); } else rect(0, z.y0, W, z.y1);
}
function empezarEntreno(id){
  const d = DRILLS[id]; if(!d) return;
  const j = S.j && !S.j.retirado ? S.j : null, pos = j ? j.posicion : (PREF.posicion || 'reves');
  iniciarPartidoPista({
    humano: paramsHumanoPista(j), pareja: paramsParejaPista(j), rival: paramsRivalPista(0, ARQUETIPOS[0]),
    carril: pos === 'drive' ? 'der' : 'izq', juegos: 3, pPunto: .5, rapido: true,
    drill: { id, total: 10, objetivo: S.desafio && S.desafio.tipo === 'drill' && S.desafio.id === id ? S.desafio.obj : d.objetivo, tipos: d.tipos },
    escena: { tipo:'club', gente:.15, ciudad: j ? j.ciudad : '' }, equipos: ['ACIERTOS', 'FALLOS'],
    titulo: `${d.ic} ${d.nom.toUpperCase()}`, avisoSub: `${d.como}<br>Objetivo: ${d.objetivo} de 10`, subtitulo: d.como, rotulo: '',
    alTerminar: res => { S.entreno = res; premiarEntreno(res); if(S.desafio){ cerrarDesafio(res); return; } S.pantalla = 'finEntreno'; render(); },
  });
}
function premiarEntreno(res){
  const d = res.drill; if(!d) return;
  const info = DRILLS[d.id], rec = PREF.records = PREF.records || {};
  res.record = d.aciertos > (rec[d.id] || 0); rec[d.id] = Math.max(rec[d.id] || 0, d.aciertos); guardarPref();
  const j = S.j && !S.j.retirado ? S.j : null;
  res.premio = null;
  if(j && d.aciertos >= d.objetivo){
    const tr = trimActual(); tr.entrenos = tr.entrenos || {};
    if(tr.entrenos[d.id]) res.premio = 'Este trimestre ya sumaste con este ejercicio';
    else {
      tr.entrenos[d.id] = true;
      if(j.stats[info.stat] < Math.min(99, j.pot[info.stat] || 99)){ j.stats[info.stat]++; res.premio = `+1 de ${STAT_NOM[info.stat]} para tu carrera`; }
      else res.premio = `Ya estás en tu techo de ${STAT_NOM[info.stat]}`;
      guardar();
    }
  }
}
function abrirEntreno(desde){ S.volverEntreno = desde; S.pantalla = 'entreno'; render(); }
function vEntreno(){
  const rec = PREF.records || {}, j = S.j && !S.j.retirado ? S.j : null, tr = j ? trimActual() : null;
  return `<div class="fade">
  <div class="card event-hero"><div class="eyebrow">🎯 ENTRENAMIENTO</div>
    <div class="title-lg" style="margin:5px 0 4px">Diez bolas, un objetivo</div>
    <p class="sub" style="margin:0">Un lanzador te tira las bolas que tocan y la zona buena se ve en la pista. ${j ? 'Si cumples el objetivo, <b>+1 a esa estadística</b> (una vez por ejercicio y trimestre).' : 'Con una carrera empezada, cumplir el objetivo sube tus estadísticas.'}</p></div>
  ${Object.keys(DRILLS).map(id => { const d = DRILLS[id], hecho = tr && tr.entrenos && tr.entrenos[id];
    return `<button class="opt" onclick="empezarEntreno('${id}')"><span class="ic">${d.ic}</span><span><span class="t">${d.nom.toUpperCase()} · objetivo ${d.objetivo}/10${rec[id] != null ? ` · récord ${rec[id]}` : ''}${hecho ? ' · ✅' : ''}</span><span class="d">${d.como}${j ? ` · mejora ${STAT_NOM[d.stat]}` : ''}</span></span></button>`; }).join('')}
  <div style="height:8px"></div>
  <button class="btn ghost" onclick="S.pantalla=S.volverEntreno||'inicio';render()">VOLVER</button></div>`;
}
function vFinEntreno(){
  const r = S.entreno; if(!r || !r.drill){ S.pantalla = 'entreno'; return vEntreno(); }
  const d = r.drill, info = DRILLS[d.id], ok = d.aciertos >= d.objetivo;
  const estrellas = d.aciertos >= d.total - 1 ? 3 : ok ? 2 : d.aciertos >= Math.ceil(d.objetivo/2) ? 1 : 0;
  return `<div class="fade">
  <div class="card ${ok ? 'event-hero' : 'event-hero mal'}">
    <div class="eyebrow">${info.ic} ${info.nom.toUpperCase()}</div>
    <div class="title-xl" style="margin:6px 0 4px">${d.aciertos} de ${d.total}</div>
    <div class="estrellas">${'⭐'.repeat(estrellas)}${'☆'.repeat(3 - estrellas)}</div>
    <p class="sub" style="margin:6px 0 0">${ok ? '¡Objetivo cumplido!' : `Objetivo: ${d.objetivo}. Te faltaron ${d.objetivo - d.aciertos}.`}${r.record ? ' <b>Nuevo récord.</b>' : ''}</p>
    ${r.premio ? `<div class="log gold" style="margin:9px 0 0">💪 ${esc(r.premio)}</div>` : ''}
  </div>
  <button class="btn" onclick="empezarEntreno('${d.id}')">OTRA VEZ</button><div style="height:8px"></div>
  <button class="btn ghost" onclick="S.pantalla='entreno';render()">OTROS EJERCICIOS</button></div>`;
}

/* ── Tu jugador a tu gusto ── */
const COLORES_CAMISETA = ['#DCF54A','#22D3A5','#7FD3F7','#F5C542','#FF8A7A','#C792EA','#F4F6F8','#FF5EA8'];
const COLORES_PALA = ['#0F1C22','#E4572E','#2E86DE','#F5C542','#F4F6F8','#9B5DE5'];
function aspectoJugador(){ return Object.assign({ camiseta:'#DCF54A', pala:'#0F1C22', zurdo:false, diseno:'lisa', palaDiseno:'lisa', zapas:'#F4F6F8' }, PREF.aspecto || {}); }
const COLORES_ZAPAS = ['#F4F6F8','#1B1B1B','#DCF54A','#E4572E','#2E86DE','#F5C542'];
const DISENOS_CAMISETA = [['lisa','LISA'],['rayas','RAYAS'],['franja','FRANJA'],['bandera','BANDERA']];
const DISENOS_PALA = [['lisa','LISA'],['rayo','RAYO'],['aro','ARO'],['degradado','DEGRADADO']];
/* los colores de cada bandera, para la camiseta de tu país (y la de las selecciones del Mundial) */
const COLORES_BANDERA = {
  AR:['#74ACDF','#FFFFFF','#74ACDF'], BO:['#D52B1E','#F9E300','#007934'], CL:['#0039A6','#FFFFFF','#D52B1E'], CO:['#FCD116','#003893','#CE1126'], CR:['#002B7F','#FFFFFF','#CE1126'],
  CU:['#002A8F','#FFFFFF','#CF142B'], EC:['#FFDD00','#034EA2','#ED1C24'], SV:['#0F47AF','#FFFFFF','#0F47AF'], ES:['#AA151B','#F1BF00','#AA151B'], GQ:['#3E9A00','#FFFFFF','#E32118'],
  GT:['#4997D0','#FFFFFF','#4997D0'], HN:['#0073CF','#FFFFFF','#0073CF'], MX:['#006847','#FFFFFF','#CE1126'], NI:['#0067C6','#FFFFFF','#0067C6'], PA:['#D21034','#FFFFFF','#005293'],
  PY:['#D52B1E','#FFFFFF','#0038A8'], PE:['#D91023','#FFFFFF','#D91023'], PR:['#ED0000','#FFFFFF','#0050F0'], DO:['#002D62','#FFFFFF','#CE1126'], UY:['#FFFFFF','#0038A8','#FFFFFF'],
  VE:['#FFCC00','#00247D','#CF142B'], BR:['#009C3B','#FFDF00','#009C3B'], IT:['#009246','#FFFFFF','#CE2B37'], FR:['#0055A4','#FFFFFF','#EF4135'], PT:['#006600','#FF0000','#FF0000'],
  BE:['#1A1A1A','#FDDA24','#EF3340'], US:['#B22234','#FFFFFF','#3C3B6E'], NL:['#AE1C28','#FFFFFF','#21468B'], SE:['#006AA7','#FECC02','#006AA7'], DE:['#1A1A1A','#DD0000','#FFCE00'],
  QA:['#FFFFFF','#8D1B3D','#8D1B3D'],
};
function paisAspecto(){ return S && S.j && !S.j.retirado ? S.j.pais : (typeof CFG !== 'undefined' && CFG.pais) || 'AR'; }
function coloresBanda(a, pais){ return COLORES_BANDERA[pais || paisAspecto()] || COLORES_BANDERA.AR; }
function zurdoActual(){ const j = S && S.j && !S.j.retirado ? S.j : null; return j ? j.mano === 'Z' : !!aspectoJugador().zurdo; }
function elegirAspecto(k, v){ PREF.aspecto = Object.assign(aspectoJugador(), { [k]: v }); guardarPref(); render(); }
const segDiseno = (lista, k, a) => `<div class="seg seg-dis">${lista.map(([id, nom]) => `<button class="${a[k] === id ? 'on' : ''}" onclick="elegirAspecto('${k}','${id}')">${nom}</button>`).join('')}</div>`;
let FIG_ID = 0;
function figuraInterior(a, zurdo){
  const px = zurdo ? 13 : 59, hx = zurdo ? 22 : 50, id = 'fg' + (++FIG_ID), zap = a.zapas || '#F4F6F8', dis = a.diseno || 'lisa', pdis = a.palaDiseno || 'lisa';
  const clip = `<clipPath id="${id}c"><rect x="20" y="24" width="32" height="32" rx="9"/></clipPath>`;
  let camisa = `<rect x="20" y="24" width="32" height="32" rx="9" fill="${a.camiseta}"/>`;
  if(dis === 'bandera') camisa = `${clip}<g clip-path="url(#${id}c)">${(a.banda || coloresBanda(a)).map((c, i) => `<rect x="20" y="${(24 + i*32/3).toFixed(2)}" width="32" height="${(32/3 + .4).toFixed(2)}" fill="${c}"/>`).join('')}<rect x="38" y="24" width="14" height="32" fill="rgba(0,0,0,.1)"/></g>`;
  else if(dis === 'rayas') camisa += `${clip}<g clip-path="url(#${id}c)" fill="rgba(0,0,0,.22)"><rect x="23" y="24" width="4" height="32"/><rect x="34" y="24" width="4" height="32"/><rect x="45" y="24" width="4" height="32"/></g>`;
  else if(dis === 'franja') camisa += `${clip}<g clip-path="url(#${id}c)"><path d="M20 29L45 56H52V50L27 24H20Z" fill="rgba(255,255,255,.78)"/></g>`;
  else camisa += `<rect x="33" y="25" width="6" height="30" fill="rgba(0,0,0,.18)"/>`;
  const palaFill = pdis === 'degradado' ? `url(#${id}p)` : a.pala;
  const palaDef = pdis === 'degradado' ? `<linearGradient id="${id}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a.pala}"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>` : '';
  const palaExtra = pdis === 'rayo' ? `<path d="M${px - 2} 1.5L${px + 3} 7L${px - 1} 8.5L${px + 2.5} 15" fill="none" stroke="#FFFFFF" stroke-width="1.7" stroke-linejoin="round"/>`
    : pdis === 'aro' ? `<ellipse cx="${px}" cy="8" rx="5.3" ry="6.3" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.5"/>` : '';
  return `<defs>${palaDef}</defs><ellipse cx="36" cy="90" rx="18" ry="4" fill="rgba(0,0,0,.3)"/>
    <line x1="31" y1="58" x2="28" y2="86" stroke="#E6BF9A" stroke-width="6" stroke-linecap="round"/><line x1="41" y1="58" x2="44" y2="86" stroke="#E6BF9A" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="27" cy="88" rx="5.4" ry="2.8" fill="${zap}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/><ellipse cx="45" cy="88" rx="5.4" ry="2.8" fill="${zap}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>
    <rect x="23" y="52" width="26" height="12" rx="4" fill="#1B2733"/>
    ${camisa}
    <line x1="${zurdo ? 50 : 22}" y1="30" x2="${zurdo ? 56 : 16}" y2="48" stroke="#E6BF9A" stroke-width="5" stroke-linecap="round"/>
    <line x1="${hx}" y1="30" x2="${px}" y2="20" stroke="#E6BF9A" stroke-width="5" stroke-linecap="round"/>
    <line x1="${px}" y1="20" x2="${px}" y2="14" stroke="#0F1C22" stroke-width="3"/>
    <ellipse cx="${px}" cy="8" rx="9" ry="10" fill="${palaFill}" stroke="${a.camiseta}" stroke-width="2"/>${palaExtra}
    <circle cx="36" cy="14" r="9" fill="#E6BF9A"/><path d="M27 13 a9 9 0 0 1 18 0 z" fill="#0F2A22"/>`;
}
function figuraSVG(a, zurdo, attrs){
  return `<svg viewBox="0 -4 72 100" ${attrs || 'width="62" height="83"'} aria-hidden="true">${figuraInterior(a, zurdo)}</svg>`;
}
function aspectoHTML(){
  const a = aspectoJugador(), j = S.j && !S.j.retirado ? S.j : null, zurdo = zurdoActual();
  const muestras = (lista, k) => lista.map(c => `<button class="muestra ${a[k] === c ? 'on' : ''}" style="background:${c}" aria-label="Color ${c}" onclick="elegirAspecto('${k}','${c}')"></button>`).join('');
  return `<div class="card"><div class="eyebrow">${ico('perfil')} TU JUGADOR</div>
    <div style="display:flex;gap:12px;align-items:center;margin-top:6px">
      <div class="figura-prev">${figuraSVG(a, zurdo, 'width="86" height="115"')}</div>
      <div style="flex:1;min-width:0">
        <div class="asp-et">CAMISETA${a.diseno === 'bandera' ? ' · ' + esc((PAISES.find(p => p.id === paisAspecto()) || {}).nom || '') : ''}</div>${a.diseno === 'bandera' ? '' : `<div class="muestras">${muestras(COLORES_CAMISETA, 'camiseta')}</div>`}
        ${segDiseno(DISENOS_CAMISETA, 'diseno', a)}
      </div>
    </div>
    <div class="asp-et" style="margin-top:12px">PALA</div><div class="muestras">${muestras(COLORES_PALA, 'pala')}</div>${segDiseno(DISENOS_PALA, 'palaDiseno', a)}
    <div class="asp-et" style="margin-top:12px">ZAPATILLAS</div><div class="muestras">${muestras(COLORES_ZAPAS, 'zapas')}</div>
    <div class="li" style="margin-top:8px"><div class="g"><b>Mano</b><span>${j ? 'La de tu carrera' : 'Con qué mano llevas la pala'}</span></div>${j
      ? `<span class="pill">${zurdo ? 'ZURDO' : 'DIESTRO'}</span>`
      : `<div class="seg"><button class="${!zurdo ? 'on' : ''}" onclick="elegirAspecto('zurdo', false)">DIESTRO</button><button class="${zurdo ? 'on' : ''}" onclick="elegirAspecto('zurdo', true)">ZURDO</button></div>`}</div>
  </div>`;
}

