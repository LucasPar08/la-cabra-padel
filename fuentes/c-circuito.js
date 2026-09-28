
/* ═══════════════════════════════════════════════════════════════
   EL CIRCUITO JUEGA SOLO
   Las otras parejas no están quietas esperándote. Cada trimestre juegan su
   calendario, con las mismas tablas de puntos que tú y la misma ventana de
   resultados, y el ranking sale de ahí: quien gana sube y quien deja de ganar
   se cae. Por eso una pareja puede subir del 15 al 6 en año y medio, y un
   veterano que ya no gana se sale del top 10 solo.
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
/* Al empezar (o al abrir una carrera vieja) cada pareja arranca con los puntos
   que le tocan por su puesto, repartidos en el último año. */
function sembrarCircuito(pool, w){
  pool.forEach((p, i) => {
    const puesto = i + 1;
    if(p.nivel == null) p.nivel = ratingDeRank(puesto) + rnd(-.8, .8);
    if(!p.hist || !p.hist.length){
      p.hist = [];
      const trozo = Math.round(ptsDeRank(puesto)/8);
      for(let k = 0; k < 4; k++) for(let i2 = 0; i2 < 2; i2++) p.hist.push({ w: w - 3 + k, pts: trozo });
    }
    p.pts = puntosPareja(p, w);
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
function anotarTorneoPareja(p, puesto, t, T, w){
  const ganadas = rondasQueGana(nivelPareja(p, puesto), t, T);
  const pts = T.pts[Math.max(0, T.rondas - ganadas)] || 0;
  if(pts > 0) p.hist.push({ w, pts });
  if(ganadas >= T.rondas){ p.titulos = (p.titulos || 0) + 1; return true; }
  return false;
}

/* Nadie juega el calendario entero: cada pareja elige dos o tres torneos del
   trimestre, los más gordos a los que llega, igual que tú. */
function torneosDePareja(puesto, evs){
  const puede = evs.filter(ev => juegaTorneo(puesto, ev.t));
  puede.sort((a, b) => (orden(b.t) + rnd(-.7, .7)) - (orden(a.t) + rnd(-.7, .7)));
  /* los de arriba eligen; los de abajo persiguen puntos y juegan más */
  return puede.slice(0, puesto <= 24 ? ri(3, 4) : ri(4, 5));
}
/* El trimestre entero del circuito: todos juegan lo suyo y se recuentan puntos */
function simularTrimestreCircuito(j, pool, w, jugados){
  let evs = [];
  try{ evs = torneosDelTrimestre(); }catch(e){ evs = []; }
  const mios = new Set(jugados || []);
  evs = evs.filter(ev => !mios.has(ev.id) && TIERS[ev.t] && TIERS[ev.t].pts && TIERS[ev.t].pts[0]);
  pool.forEach((p, i) => {
    for(const ev of torneosDePareja(i + 1, evs)) anotarTorneoPareja(p, i + 1, ev.t, TIERS[ev.t], w);
  });
  /* la memoria no crece sin fin: sólo se guarda lo que aún cuenta */
  for(const p of pool){
    p.hist = (p.hist || []).filter(x => w - x.w < PESO_ANTIGUEDAD.length).slice(-40);
    p.pts = puntosPareja(p, w);
  }
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
