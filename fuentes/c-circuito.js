
/* ═══════════════════════════════════════════════════════════════
   EL CIRCUITO JUEGA SOLO
   Las otras parejas no están quietas esperándote. Al cerrarse cada trimestre
   juegan su calendario, con las mismas tablas de puntos que tú y la misma
   ventana de resultados, y el ranking sale de ahí: quien gana sube y quien deja
   de ganar se cae. Lo que pasó se cuenta en las noticias. Los puntos que se
   ven en el ranking son los de la tabla para cada puesto, los mismos con los
   que se mide el tuyo: así la lista siempre cuadra.
   ═══════════════════════════════════════════════════════════════ */

/* Qué torneos juega cada pareja según su puesto. Los de arriba no van a un FIP,
   y los del 25 para abajo no entran en todos los grandes. */
function juegaTorneo(puesto, t){
  if(t === 'FIN')  return puesto <= 8;
  if(t === 'MJ')   return Math.random() < (puesto <= 24 ? .94 : .82);
  if(t === 'P1')   return Math.random() < (puesto <= 24 ? .90 : .86);
  if(t === 'P2')   return Math.random() < (puesto <= 10 ? .30 : puesto <= 24 ? .62 : .82);
  if(t === 'FIP5') return Math.random() < (puesto <= 14 ? .02 : puesto <= 26 ? .10 : .26);
  if(t === 'FIP4') return puesto > 30 && Math.random() < .08;
  return false;                       // los FIP pequeños no son para el top 40
}
/* El nivel de una pareja es suyo, no de la casilla que ocupa */
function nivelPareja(p, puesto){
  if(p.nivel == null) p.nivel = ratingDeRank(puesto) + rnd(-.8, .8);
  return p.nivel + (p.forma || 0);
}
/* Sus puntos se cuentan igual que los tuyos: los diez mejores resultados de
   los últimos seis trimestres, y los dos más viejos pesan menos. */
function puntosPareja(p, w){
  const vig = [];
  for(const x of p.hist || []){ const peso = PESO_ANTIGUEDAD[w - x.w]; if(peso) vig.push(x.pts*peso); }
  vig.sort((a, b) => b - a);
  return Math.round(vig.slice(0, RESULTADOS_QUE_CUENTAN).reduce((a, b) => a + b, 0));
}
const wDe = j => j.anio*TRIMESTRES_POR_ANIO + j.trimestre;
/* los puntos de la tabla para un puesto, sin el recorte del Ídolo (ése es sólo tuyo) */
const ptsTabla = puesto => Math.round(ptsDeRank(puesto) / (typeof esIdolo === 'function' && esIdolo() ? IDOLO_DUREZA.escala : 1));
/* Al empezar (o al arreglar una carrera vieja) cada pareja arranca con los
   puntos que le tocan por su puesto, repartidos en los tres últimos trimestres. */
function sembrarCircuito(pool, ref, forzar){
  pool.forEach((p, i) => {
    const puesto = i + 1;
    if(p.nivel == null) p.nivel = ratingDeRank(puesto) + rnd(-.8, .8);
    if(forzar || !p.hist || !p.hist.length){
      p.hist = [];
      const trozo = Math.round(ptsTabla(puesto)/8);
      for(let k = 0; k < 8; k++) p.hist.push({ w: ref - 1 - (k % 3), pts: trozo });
    }
    p.pts = puntosPareja(p, ref);
  });
}
/* Un torneo suyo: cuántas rondas aguantan contra el cuadro de esa categoría */
function rondasQueGana(nivel, t, T){
  let r = 0;
  for(; r < T.rondas; r++){
    const riv = generarRival(t, r, T.rondas);
    if(Math.random() >= probRatings(nivel, riv.rating)) break;
  }
  return r;
}
/* Nadie juega el calendario entero: cada pareja elige tres o cuatro torneos
   del trimestre, los más gordos a los que llega, igual que tú. */
function torneosDePareja(puesto, evs){
  const puede = evs.filter(ev => juegaTorneo(puesto, ev.t));
  puede.sort((a, b) => (orden(b.t) + rnd(-.7, .7)) - (orden(a.t) + rnd(-.7, .7)));
  /* los de arriba eligen; los de abajo persiguen puntos y juegan más */
  return puede.slice(0, puesto <= 24 ? ri(3, 4) : ri(4, 5));
}
/* El trimestre del circuito, torneo a torneo. Cada pareja aguanta lo que aguanta
   contra el cuadro, y luego se pone orden como en un cuadro de verdad: un solo
   campeón, como mucho dos en la final, cuatro en semis... Así en las noticias
   nunca hay dos campeones del mismo torneo. */
function simularTrimestreCircuito(j, pool, w, jugados, evs){
  const mios = new Set(jugados || []);
  evs = (evs || []).filter(ev => !mios.has(ev.id) && TIERS[ev.t] && TIERS[ev.t].pts && TIERS[ev.t].pts[0]);
  const inscritos = new Map();
  pool.forEach((p, i) => {
    for(const ev of torneosDePareja(i + 1, evs)){
      if(!inscritos.has(ev.id)) inscritos.set(ev.id, []);
      inscritos.get(ev.id).push({ p, puesto: i + 1 });
    }
  });
  const resultados = [];
  for(const ev of evs){
    const lista = inscritos.get(ev.id);
    if(!lista) continue;
    const T = TIERS[ev.t];
    for(const x of lista){ x.ganadas = rondasQueGana(nivelPareja(x.p, x.puesto), ev.t, T); x.azar = Math.random(); }
    lista.sort((a, b) => b.ganadas - a.ganadas || a.azar - b.azar);
    lista.forEach((x, k) => {
      x.ganadas = Math.min(x.ganadas, T.rondas - Math.ceil(Math.log2(k + 1)));
      const pts = T.pts[Math.max(0, T.rondas - x.ganadas)] || 0;
      if(pts > 0) x.p.hist.push({ w, pts });
      if(x.ganadas >= T.rondas) x.p.titulos = (x.p.titulos || 0) + 1;
    });
    resultados.push({ ev, campeon: lista[0].ganadas >= T.rondas ? lista[0].p : null,
                      finalista: lista[1] && lista[1].ganadas >= T.rondas - 1 ? lista[1].p : null });
  }
  return resultados;
}
/* Y el nivel se mueve despacio: se mejora, se aguanta y se cae. Tira un poco
   hacia el nivel que se le supone a su puesto; si no, el que sube por suerte
   se queda arriba para siempre y el circuito acaba siendo imbatible. */
function moverNivelCircuito(pool){
  pool.forEach((p, i) => {
    p.forma = clamp((p.forma || 0)*.7 + rnd(-1.2, 1.2), -3, 3);
    const suyo = p.nivel == null ? ratingDeRank(i + 1) : p.nivel;
    p.nivel = clamp(suyo*.9 + ratingDeRank(i + 1)*.1 + rnd(-.5, .5), ratingDeRank(90), ratingDeRank(1) + 1.2);
  });
}

/* ── El cierre del trimestre del circuito: se llama al pasar de trimestre, una
      sola vez por trimestre, pase lo que pase en el tuyo (torneos, entreno,
      lesión). Los puntos quedan contados para el trimestre que empieza, que es
      cuando se mira tu ranking. ── */
function cerrarCircuitoTrimestre(j){
  if(!j || j.retirado) return;
  const w = wDe(j);
  if(j.circuitoW === w) return;
  const pool = asegurarCircuito(j);
  if(!pool.length) return;
  if(j.circuitoW == null) sembrarCircuito(pool, w, true);        // carrera de antes del arreglo: se reparte de nuevo
  j.circuitoW = w;
  const antes = pool.slice(0, 20).map(p => p.id), numero1 = pool[0].id;
  let evs = [];
  try{ evs = torneosDelTrimestre(); }catch(e){ evs = []; }
  const jugados = S.trim && S.trim.clave === j.anio + '-' + j.trimestre ? S.trim.jugados : [];
  moverNivelCircuito(pool);
  const res = simularTrimestreCircuito(j, pool, w, jugados, evs);
  for(const p of pool){
    p.hist = (p.hist || []).filter(x => w + 1 - x.w < PESO_ANTIGUEDAD.length).slice(-40);
    p.pts = puntosPareja(p, w + 1);
  }
  pool.sort((a, b) => (b.pts || 0) - (a.pts || 0));
  /* relevo abajo: alguien deja el circuito y entra una pareja nueva con los puntos de su puesto */
  if(Math.random() < .3){
    pool.splice(ri(28, pool.length - 1), 1);
    const nueva = nuevaParejaCircuito(40, pool), puesto = ri(30, 40);
    nueva.nivel = ratingDeRank(puesto) + rnd(-.5, .5);
    nueva.hist = [];
    const trozo = Math.round(ptsTabla(puesto)/8);
    for(let k = 0; k < 8; k++) nueva.hist.push({ w: w - (k % 3), pts: trozo });
    nueva.pts = puntosPareja(nueva, w + 1);
    pool.push(nueva);
    pool.sort((a, b) => (b.pts || 0) - (a.pts || 0));
  }
  j.noticias = hacerNoticias(j, pool, res, antes, numero1, w);
}

/* ── Las noticias del trimestre ── */
const nomCorto = p => `${esc(apellidoDe(p.nombre))} / ${esc(apellidoDe(p.nombre2))}`;
function apellidoDe(n){ const x = String(n || '').trim().split(' '); return x.length > 2 && /^(di|de|del|dal|van|la)$/i.test(x[x.length - 2]) ? x.slice(-2).join(' ') : x[x.length - 1]; }
function hacerNoticias(j, pool, res, antes, numero1, w){
  const items = [];
  if(j.noticiasFichaje){ items.push(...j.noticiasFichaje); j.noticiasFichaje = null; }
  const rivales = new Set((typeof rivalidades === 'function' ? rivalidades(j) : []).map(r => r.id));
  /* los títulos grandes; si no hubo, los P2 */
  const grandes = res.filter(r => r.campeon && ['FIN','MJ','P1'].includes(r.ev.t)).sort((a, b) => orden(b.ev.t) - orden(a.ev.t));
  const lista = grandes.length ? grandes : res.filter(r => r.campeon && r.ev.t === 'P2');
  for(const r of lista.slice(0, 3)){
    const que = r.ev.t === 'FIN' ? 'las Finals' : 'el ' + esc(r.ev.nom);
    const rival = rivales.has(r.campeon.id);
    items.push({ ic: rival ? '⚔️' : '🏆', txt: `${rival ? 'Tus rivales ' : ''}<b>${nomCorto(r.campeon)}</b> ganan ${que}${r.finalista ? ` contra ${nomCorto(r.finalista)}` : ''}.` });
  }
  /* el número 1 */
  if(pool[0] && pool[0].id !== numero1) items.push({ ic:'👑', txt:`<b>${nomCorto(pool[0])}</b>, nuevo número 1 del mundo.` });
  /* quién sube y quién cae en el top 20 (con tu casilla contada) */
  const tuyo = pos => pos + (j.ranking && j.ranking <= pos ? 1 : 0);
  let sube = null, cae = null;
  pool.forEach((p, i) => {
    const a = antes.indexOf(p.id);
    if(a < 0) return;
    const d = a - i;
    if(i < 20 && d >= 3 && (!sube || d > sube.d)) sube = { p, d, de: tuyo(a + 1), a: tuyo(i + 1) };
    if(-d >= 3 && (!cae || -d > cae.d)) cae = { p, d: -d, de: tuyo(a + 1), a: tuyo(i + 1) };
  });
  if(sube) items.push({ ic:'📈', txt:`<b>${nomCorto(sube.p)}</b> suben del #${sube.de} al #${sube.a}.` });
  if(cae)  items.push({ ic:'📉', txt:`<b>${nomCorto(cae.p)}</b> caen del #${cae.de} al #${cae.a}.` });
  return { w, anio: j.anio, trimestre: j.trimestre, items: items.slice(0, 6) };
}
function noticiasHTML(j){
  const n = j && j.noticias;
  if(!n || !n.items || !n.items.length || n.w !== wDe(j) - 1) return '';
  return `<div class="card"><div class="eyebrow">📰 EL CIRCUITO, EL TRIMESTRE PASADO</div><div style="height:4px"></div>
    ${n.items.map(x => `<div class="li"><span class="ic" style="font-size:17px;width:22px;text-align:center">${x.ic}</span><div class="g"><span style="color:var(--text);font-size:14px;line-height:1.45">${x.txt}</span></div></div>`).join('')}
    <button class="btn ghost sm" style="margin-top:9px" onclick="S.pantalla='ranking';render()">${ico('ranking')} VER EL RANKING</button></div>`;
}

/* ── En el ranking: quién tienes justo delante y detrás, y cuánto te falta ── */
function alrededorHTML(j){
  const r = j && j.ranking;
  if(!r || r <= 20) return '';
  const pool = asegurarCircuito(j), pts = puntosActuales(j);
  const faltan = rr => Math.max(1, ptsDeRank(rr) - pts + 1);
  if(r > pool.length + 1){
    const ult = pool[pool.length - 1];
    return `<div class="card"><div class="eyebrow">${ico('ranking')} A TU ALREDEDOR</div>
      <p class="sub" style="margin:6px 0 0">Estás en el <b>#${r}</b> con ${pts} pts. Para entrar en el top 40 te faltan <b>${faltan(40)} pts</b>. Ahí están ${fichaPais(ult.flag)} <b>${esc(ult.nombre)} / ${esc(ult.nombre2)}</b>.</p></div>`;
  }
  const fila = rr => {
    if(rr === r) return `<div class="rk-fila tu"><span class="rk-n">#${rr}</span><span class="rk-nm">${fichaPais(j.cod)} <b>${esc(j.nombre)} / ${esc(j.pareja ? j.pareja.nombre : '—')}</b><small>Vosotros</small></span><span class="rk-pt">${pts} pts</span></div>`;
    const p = pool[casillaDeRank(j, rr) - 1];
    if(!p) return '';
    return `<div class="rk-fila"><span class="rk-n">#${rr}</span><span class="rk-nm">${fichaPais(p.flag)} ${esc(p.nombre)} / ${p.flag2 && p.flag2 !== p.flag ? fichaPais(p.flag2) + ' ' : ''}${esc(p.nombre2)}<small>${p.titulos || 0} título${p.titulos === 1 ? '' : 's'}</small></span><span class="rk-pt">${ptsDeRank(rr)} pts</span></div>`;
  };
  const arriba = pool[casillaDeRank(j, r - 1) - 1];
  return `<div class="card"><div class="eyebrow">${ico('ranking')} A TU ALREDEDOR</div><div style="height:4px"></div>
    ${[r - 2, r - 1, r, r + 1, r + 2].filter(x => x >= 1).map(fila).join('')}
    ${arriba ? `<p class="muted" style="margin:9px 0 0">Para pasar a <b style="color:var(--text)">${esc(arriba.nombre)} / ${esc(arriba.nombre2)}</b> (#${r - 1}) te faltan <b style="color:var(--text)">${faltan(r - 1)} pts</b>.</p>` : ''}</div>`;
}

/* ── Jugar con una estrella: si estás arriba, alguien del top te llama.
      Deja a su pareja y ella busca otra. ── */
function candidataEstrella(j){
  if(!j || !j.ranking || j.ranking > 12 || typeof REALES === 'undefined') return null;
  if(Math.random() > .6) return null;
  const pool = asegurarCircuito(j), R = realesDe();
  /* nadie deja el número 1 para irse con el 12: te llaman los que andan cerca de ti */
  const desde = Math.max(0, j.ranking - 7), hasta = Math.min(pool.length, j.ranking + 6);
  const opciones = pool.slice(desde, hasta).filter(p => p.real);
  if(!opciones.length) return null;
  const par = pick(opciones), puesto = pool.indexOf(par) + 1, quiere = posContraria(j.posicion);
  const datos = [];
  for(const x of R.parejas) for(const pl of [x.a, x.b]) if(pl[0] === par.nombre || pl[0] === par.nombre2) datos.push(pl);
  if(!datos.length) return null;
  const el = datos.find(pl => pl[2] === quiere) || pick(datos);
  const otro = el[0] === par.nombre ? par.nombre2 : par.nombre;
  const nivel = clamp(ratingDeRank(puesto) + rnd(.5, 2), 60, 97);
  const encajan = Object.keys(ESTILOS).filter(e => ROL_ESTILO[e] !== ROL_ESTILO[j.estilo]);
  const c = nuevaPareja(nivel, el[1], quiere, el[3], pick(encajan.length ? encajan : Object.keys(ESTILOS)));
  Object.assign(c, { nombre: el[0], flag: el[1], edad: el[3], apodo: null, real: true, etq: 'ESTRELLA DEL CIRCUITO' });
  c.quimicaInicial = ri(30, 42);
  c.prima = Math.round(1.4 * (2000 + Math.pow(Math.max(0, nivel - 45), 2.4)*38));
  c.exigeRank = Math.max(3, puesto + 3);
  c.estrella = { par: par.id, companero: otro, puesto };
  return c;
}
function ficharEstrella(j, c){
  const pool = asegurarCircuito(j), par = pool.find(p => p.id === c.estrella.par);
  if(!par) return;
  const libre = jugadorRealLibre(null, null, 80, null);
  const nuevo = libre || { nombre: pick(nombresDePila()) + ' ' + pick(NOM_B), flag: pick(NAC_RIV) };
  if(par.nombre === c.nombre){ par.nombre = par.nombre2; par.flag = par.flag2; }
  par.nombre2 = nuevo.nombre; par.flag2 = nuevo.flag;
  par.nivel = (par.nivel == null ? ratingDeRank(c.estrella.puesto) : par.nivel) - 1.8;   // la pareja nueva todavía no rinde
  j.noticiasFichaje = [{ ic:'💔', txt:`<b>${esc(c.nombre)}</b> deja a <b>${esc(c.estrella.companero)}</b> para jugar contigo. ${esc(c.estrella.companero)} sigue con <b>${esc(nuevo.nombre)}</b>.` }];
}
