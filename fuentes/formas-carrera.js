/* Qué forma toma el momento clave. Se van mezclando y nunca salen tres iguales seguidas:
     · pista  → lo juegas en la pista (juego o punto de oro)
     · golpe  → eliges el golpe del punto de oro, con la probabilidad de cada uno a la vista
     · camino → eliges camino entre casillas, como en el cuadro de los Majors
   En la previa siempre se elige: es donde se ve si clasificáis o no. */
function elegirForma(j, to){
  const hist = j.formasRecientes = j.formasRecientes || [];
  let ops = to.enPrevia ? ['golpe','camino'] : ['pista','pista','golpe','golpe','camino'];
  const n = hist.length;
  if(n >= 2 && hist[n-1] === hist[n-2]){ const quedan = ops.filter(f => f !== hist[n-1]); if(quedan.length) ops = quedan; }
  const f = pick(ops);
  hist.push(f); if(hist.length > 6) hist.shift();
  return f;
}
const BONO_DIF_ELECCION = { facil:.06, normal:.03, dificil:0 };
function crearCaminoMomento(j, edge){
  const objetivo = clamp(0.62 + edge*0.05 + (BONO_DIF_ELECCION[PREF.dificultad] || 0), 0.40, 0.88);
  let casillas = 4, nMinas = 2, mejorDif = Infinity;
  for(let c = 4; c <= 6; c++) for(let m = 1; m <= 3; m++){
    if(c - m < 1) continue;
    const dif = Math.abs((c - m)/c - objetivo);
    if(dif < mejorDif){ mejorDif = dif; casillas = c; nMinas = m; }
  }
  const minas = [];
  while(minas.length < nMinas){ const x = ri(0, casillas-1); if(minas.indexOf(x) < 0) minas.push(x); }
  /* con Mental alto ves venir uno de los caminos malos, igual que en el cuadro */
  const probPista = clamp((j.stats.mental - 45) / 60, 0, 0.85);
  const pista = (nMinas >= 2 && Math.random() < probPista) ? minas[ri(0, minas.length-1)] : null;
  return { casillas, minas, pista, falladas:[], elegida:null, vidas: j.equipo.psico ? 1 : 0, salvada:false };
}
function crearMomento(j, to, res, esFinal){
  const edge = edgeDupla(j, to.rival, to.ev), forma = elegirForma(j, to);
  const saca = Math.random() < .5 ? 0 : 1, titulo = esFinal ? ' y el título' : '';
  const premio = to.enPrevia ? (to.kPrevia >= RONDAS_PREVIA-1 ? 'entráis al cuadro' : 'pasáis a la segunda ronda de la previa') : 'el partido' + titulo + ' es vuestro';
  const m = { forma, esFinal, previa: !!to.enPrevia, saca, res, edge, juegos:[5,5], eleccion:null, pPunto: perfilDupla(j, to.rival, to.ev, j.energia).p };
  if(forma === 'golpe'){
    const st = j.stats, cand = ['remate','volea','pared','globo','bandeja'].sort((a,b) => st[b] - st[a]);
    m.tipo = 'punto'; m.inicio = [3,3];
    m.esc = pick(cand.slice(0, 3));
    m.pBase = clamp(0.56 + (ratingDupla(j, to.ev.pista, to.ev) - to.rival.rating)*0.04 + (BONO_DIF_ELECCION[PREF.dificultad] || 0), 0.28, 0.90);
    m.sit = `${to.enPrevia ? 'Previa. ' : ''}Tercer set, 5-5 y 40-40: <b>punto de oro</b>. Si lo ganáis, ${premio}. Tú eliges el golpe.`;
  } else if(forma === 'camino'){
    m.tipo = 'camino'; m.inicio = inicioMomento(edge);
    m.camino = crearCaminoMomento(j, edge);
    m.sit = `${to.enPrevia ? 'Previa. ' : ''}Tercer set, 5-5. <b>Elegid cómo jugar el final:</b> cada casilla es un camino y detrás de ${m.camino.minas.length === 1 ? 'uno' : 'algunos'} está la pareja que os gana. Si acertáis, ${premio}.`;
  } else if(esFinal || Math.random() < .62){
    m.tipo = 'juego'; m.inicio = inicioMomento(edge);
    m.sit = `Tercer set, 5-5 y ${saca === 0 ? 'sacáis vosotros' : 'sacan ellos'}. <b>Este juego decide el partido${titulo}.</b>`;
  } else {
    m.tipo = 'punto'; m.inicio = [3,3];
    m.sit = `Tercer set, 5-5 y 40-40. <b>Punto de oro:</b> quien lo gane se lleva el partido${titulo}.`;
  }
  return m;
}
/* Elegir el golpe: el punto de oro de siempre, con las mismas probabilidades que se ven en pantalla */
function elegirGolpeMomento(i){
  const j = S.j, m = S.torneo && S.torneo.momento; if(!m || m.forma !== 'golpe' || m.eleccion) return;
  const escena = ESCENARIOS[m.esc], o = escena.ops[i]; if(!o) return;
  const pr = probsGolpe(j, { pBase:m.pBase }, o), u = Math.random();
  let gana, texto;
  if(u < pr.gan){ gana = true; texto = o.txtGan; }
  else if(u < pr.gan + pr.err){ gana = false; texto = o.txtErr; }
  else { gana = Math.random() < clamp(m.pBase + (o.delta||0), 0.05, 0.95); texto = escena.sigue + ' ' + (gana ? escena.gana : escena.pierde); }
  if(gana && o.salida){ j.salidasPista = (j.salidasPista||0) + 1; j.hist.push({a:j.anio, t:'🚪 Punto de oro ganado saliendo de la pista'}); }
  m.eleccion = { i, gana, texto };
  guardar(); render();
}
/* Elegir camino: las casillas del cuadro, para un solo partido */
const CAMINO_BIEN = ['Aguantasteis su mejor momento, os pusisteis 6-5 y cerrasteis con una bandeja al rincón. <b>Partido vuestro.</b>',
  'Globo profundo, subida a la red y dos voleas seguidas. Se les apagó la luz. <b>Partido vuestro.</b>',
  'Fuisteis a por el revés del más flojo y ahí se rompió todo. <b>Partido vuestro.</b>'];
const CAMINO_MAL = ['Por ahí os estaban esperando: dos remates por tres seguidos y se acabó. <b>Partido suyo.</b>',
  'Os quisisteis quedar en la red y os pasaron por arriba tres veces. <b>Partido suyo.</b>',
  'Se os fue la cabeza en el 5-6 y regalasteis el juego. <b>Partido suyo.</b>'];
function elegirCaminoMomento(i){
  const m = S.torneo && S.torneo.momento; if(!m || m.forma !== 'camino' || m.eleccion) return;
  const c = m.camino;
  if(i < 0 || i >= c.casillas || c.falladas.indexOf(i) >= 0) return;
  c.salvada = false;
  if(c.minas.indexOf(i) >= 0 && c.vidas > 0){ c.vidas--; c.falladas.push(i); c.salvada = true; guardar(); render(); return; }
  c.elegida = i;
  const gana = c.minas.indexOf(i) < 0;
  m.eleccion = { i, gana, texto: gana ? pick(CAMINO_BIEN) : pick(CAMINO_MAL) };
  guardar(); render();
}
function continuarMomento(){
  const m = S.torneo && S.torneo.momento; if(!m || !m.eleccion) return;
  resolverMomento(m.eleccion.gana, false, null, m.forma);
}
