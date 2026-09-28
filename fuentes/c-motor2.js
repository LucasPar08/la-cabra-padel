
/* ═══════════════════════════════════════════════════════════════
   LOS GOLPES · TU JUGADOR · LA MÁQUINA
   ═══════════════════════════════════════════════════════════════ */
/* dist = metros desde la red hasta donde bota la bola en el otro campo */
const TIROS = {
  saque:   {T:1.05, dist:[4.2,6.4]},
  drive:   {T:0.82, dist:[5.8,8.8]},
  plano:   {T:0.60, dist:[6.4,9.0]},
  volea:   {T:0.62, dist:[3.8,7.4]},
  globo:   {T:1.95, dist:[7.9,9.4]},
  remate:  {T:0.36, dist:[2.6,5.2]},
  vibora:  {T:0.52, dist:[5.2,8.4]},
  bandeja: {T:0.80, dist:[5.6,8.2]},
  dejada:  {T:0.95, dist:[0.9,2.3]},
  chiquita:{T:0.80, dist:[2.8,4.6]},
};
/* Lo que arriesga cada golpe por sí mismo, además de lo bien que lo pegues */
const RIESGO_TIRO = { plano:1.35, remate:1.12, vibora:1.05, dejada:1.2, chiquita:1.05 };
/* El efecto de cada golpe: cortado (bota bajo y muere en el cristal), liftado (bota y corre) o la víbora, que se abre */
const EFECTO_TIRO = { saque:'corte', bandeja:'corte', volea:'corte', dejada:'corte', chiquita:'corte', vibora:'lateral', drive:'liftado', globo:'liftado' };
const NOMBRE_GOLPE = { remate:'REMATE', vibora:'VÍBORA', bandeja:'BANDEJA', globo:'GLOBO', dejada:'DEJADA', chiquita:'CHIQUITA', plano:'PLANO', volea:'VOLEA', drive:'DRIVE' };
const PERFECTO_GOLPE = { remate:'¡REMATE PERFECTO!', vibora:'¡VÍBORA PERFECTA!', bandeja:'¡BANDEJA PERFECTA!', globo:'¡GLOBO PERFECTO!', dejada:'¡DEJADA PERFECTA!',
                         chiquita:'¡CHIQUITA PERFECTA!', plano:'¡PLANO PERFECTO!', volea:'¡VOLEA PERFECTA!', drive:'¡PERFECTO!' };
const COLOR_GOLPE = { remate:'#FF9F43', vibora:'#FF9F43', plano:'#FF9F43', globo:'#7FD3F7', dejada:'#E4F3EF', chiquita:'#E4F3EF', bandeja:'#DCF54A', volea:'#DCF54A', drive:'#DCF54A' };

function tiroHacia(b, tx, ty, T){ return { vx:(tx-b.x)/T, vy:(ty-b.y)/T, vz:(-b.z)/T + .5*G*T }; }
function pasaRed(b, v, margen){
  if(Math.abs(v.vy) < 1e-4) return false;
  const tn = (RED_Y - b.y) / v.vy; if(tn <= 0) return true;
  return b.z + v.vz*tn - .5*G*tn*tn >= RED_ALT + margen;
}
function golpear(j, tipo, calidad, apuntarX, prof){
  const b = P.bola, T = TIROS[tipo];
  /* Dos cosas distintas: la dispersión normal (dónde bota dentro de la pista) y
     el FALLO, que es explícito. Cuanto peor el contacto, más probable fallar: a
     la red, larga contra el cristal o ancha contra la pared. */
  const disp = (1 - calidad) * .9 + .1;
  /* con el joystick se elige la profundidad: arriba, al fondo; abajo, corta */
  const largo = prof > 0 && tipo !== 'dejada' && tipo !== 'chiquita' ? T.dist[1] + .5 : prof < 0 ? Math.max(1.2, T.dist[0] - 1) : rnd(T.dist[0], T.dist[1]);
  let d = clamp(largo + gauss()*disp*.5, .8, 9.5);
  let tx = apuntarX != null ? apuntarX : (j.x < 5 ? rnd(6.2, 8.8) : rnd(1.2, 3.8));
  tx = clamp(tx + gauss()*disp*.7, .5, W - .5);
  const mf = (j.multFalloTiro && j.multFalloTiro[tipo]) || j.multFallo || 1;
  const aLaLinea = apuntarX != null && Math.abs(apuntarX - W/2) > 3.4 ? 1.25 : 1;          // apuntar pegado a la pared arriesga más
  const pFallo = clamp((.02 + Math.pow(1 - calidad, 2) * .4) * mf * (RIESGO_TIRO[tipo] || 1) * aLaLinea, .015, .55);
  let fallo = Math.random() < pFallo ? pick(['red','larga','ancha','larga']) : null;
  if(tipo === 'saque'){
    /* el primer saque se arriesga más; el segundo entra casi siempre */
    const pF = clamp((P.saqueN === 2 ? .03 : .11) * (1.35 - calidad) * mf, .008, .3);
    fallo = Math.random() < pF ? pick(['red','largo','largo','cruce']) : null;
    if(fallo === 'largo') d = rnd(7.15, 8.2);
    if(fallo === 'cruce') tx = P.saqueX < W/2 ? rnd(3.3, 4.6) : rnd(5.4, 6.7);
  }
  if((tipo === 'dejada' || tipo === 'chiquita') && fallo === 'larga') fallo = 'red';   // la dejada que sale mal muere en la red
  if(fallo === 'larga') d = rnd(10.3, 11.4);
  if(fallo === 'ancha') tx = Math.random() < .5 ? rnd(-.8, -.3) : rnd(W + .3, W + .8);
  const ty = j.lado === 0 ? RED_Y - d : RED_Y + d;
  const mt = (j.multTTiro && j.multTTiro[tipo]) || j.multT || 1;
  let TT = T.T * (1.15 - .3*calidad) * mt, v = tiroHacia(b, tx, ty, TT);
  for(let k = 0; k < 14 && !pasaRed(b, v, .12); k++){ TT *= 1.08; v = tiroHacia(b, tx, ty, TT); }
  if(fallo === 'red') v.vz *= .5;
  const dePared = b.pared && b.botes >= 1;
  Object.assign(b, { vx:v.vx, vy:v.vy, vz:v.vz, golpeo:j.lado, botes:0, cruzo:false, saque:tipo==='saque', pared:false, efecto: EFECTO_TIRO[tipo] || null, tocoRed:false, salioDePared: dePared,
                     letForzado: tipo === 'saque' && !fallo && Math.random() < .03,
                     porTres: tipo==='remate' && calidad >= (j.umbralPorTres || .78), ultimoTiro:tipo, golpeador:j.id });
  P.tGolpe = P.t; P.rally++;
  P.prediccion = predecirBola(b, 4);
  /* Nadie lee la bola perfecta: cuanto más rápida y peor el que defiende, más
     se equivoca al principio. Así hay bolas que no llegan y golpes ganadores. */
  for(const o of P.jug) if(o.lado !== j.lado && !o.humano){
    const e = (1 - o.hab)*2.2 + clamp((Math.hypot(v.vx, v.vy) - 9)/9, 0, 1.2);
    o.lectura = { dx:gauss()*e, dy:gauss()*e*.8, t0:P.t };
  }
  j.anim = .22; j.cd = .18; j.ultimoTiro = tipo;
  if(j.id === 1) P.stats.golpesPareja++;
  if(j.humano && hayDOM && PREF.vibracion && navigator.vibrate){ try{ navigator.vibrate(tipo === 'remate' || tipo === 'plano' ? 28 : 12); }catch(e){} }
  if(j.humano){
    const st = P.stats; st.golpes++;
    if(tipo === 'globo') st.globos++;
    if(tipo === 'remate' || tipo === 'vibora') st.remates++;
    if(tipo === 'dejada' || tipo === 'chiquita') st.dejadas++;
    if(tipo === 'bandeja') st.bandejas++;
    if(dePared) st.paredes++;
  }
  Efectos.golpe(b.x, b.y, tipo, calidad);
  Sonido.golpe(tipo === 'remate' || tipo === 'plano' ? 1 : calidad*.75);
}
function alcanzable(j){
  const b = P.bola;
  if(P.estado !== 'juego' || !b.viva || b.golpeo === null || b.golpeo === j.lado) return false;
  if(!b.cruzo || ladoDe(b.y) !== j.lado || (b.saque && b.botes === 0)) return false;
  return Math.hypot(b.x - j.x, b.y - j.y) <= j.alcance && b.z <= 2.9;
}
function moverHacia(j, tx, ty, vel){
  const dx = tx - j.x, dy = ty - j.y, d = Math.hypot(dx, dy);
  if(d < .05){ j.vx *= .6; j.vy *= .6; return; }
  const s = Math.min(vel, d*6); j.vx = dx/d*s; j.vy = dy/d*s;
}
function aplicarMovimiento(j, dt){
  const m = j.fuera ? 2.4 : 0;                     // en una salida de pista se corre por fuera
  j.x = clamp(j.x + j.vx*dt, .35 - m, W - .35 + m);
  j.y = clamp(j.y + j.vy*dt, j.lado === 0 ? RED_Y + .45 : .35, j.lado === 0 ? L - .35 : RED_Y - .45);
  if(j.fuera && j.x > .35 && j.x < W - .35 && P && P.estado !== 'salida') j.fuera = false;
}

/* ── Tu jugador ──
   El botón decide la intención y la bola decide el golpe que sale. */
function tipoHumano(j, accion){
  const b = P.bola, cercaRed = Math.abs(j.y - RED_Y) < 5.2;
  if(accion === 'globo') return 'globo';
  if(accion === 'dejada') return (cercaRed || b.botes === 0) ? 'dejada' : 'chiquita';
  if(accion === 'remate'){
    if(b.z > 1.75 && cercaRed) return 'remate';
    if(b.z > 1.2) return 'vibora';
    return 'plano';
  }
  if(b.z > 1.65) return 'bandeja';
  if(b.botes === 0) return 'volea';
  return 'drive';
}
function actualizarHumano(j, dt){
  if(P.humanoIA) return actualizarIA(j, dt);          // para las pruebas automáticas
  const eje = ejeMovimiento(), mov = Math.hypot(eje.x, eje.y) > .12;
  P.apunte = alcanzable(j) || j.swing > 0 ? apuntarHumano(j, eje) : null;       // la diana que se ve en la pista
  if(mov){ j.vx = eje.x*j.vel; j.vy = eje.y*j.vel; j.ultimoMov = P.t; }
  else if(PREF.asistencia && P.t - (j.ultimoMov || -9) > .2){ const o = objetivoJugador(j); moverHacia(j, o.x, o.y, j.vel*.92); }
  else { j.vx *= .75; j.vy *= .75; }
  aplicarMovimiento(j, dt);
  if(Input.accion){
    if(j.swing <= 0) j.swing = DUR_SWING;
    j.pedido = Input.accion;                 // cambiar de idea dentro de la ventana también vale
    Input.accion = null;
  }
  /* Golpe automático: si no pulsas nada, sale el golpe básico; los especiales siguen siendo tuyos */
  if(PREF.golpeAuto && j.swing <= 0 && alcanzable(j) && P.t - (j.tAuto || -9) > .3 && (P.bola.z < 1.45 || P.bola.z > 1.7)){
    j.swing = DUR_SWING*.78; j.pedido = 'golpe'; j.tAuto = P.t;
  }
  if(j.swing > 0){
    if(alcanzable(j)){
      const b = P.bola, prog = 1 - j.swing/DUR_SWING, d = Math.hypot(b.x - j.x, b.y - j.y);
      const dificultad = clamp((Math.hypot(b.vx, b.vy) - 9)/16, 0, .25);
      const tipo = tipoHumano(j, j.pedido), dePared = b.pared && b.botes >= 1 && tipo !== 'bandeja';
      let cal = (1 - Math.abs(prog - .4)/.6) * (1 - .3*clamp(d/j.alcance, 0, 1)) + .15 + (j.bonusCal || 0) - dificultad;
      if(dePared) cal += j.bonusPared || 0;
      cal = clamp(cal, .15, 1);
      const ap = apuntarHumano(j, eje);
      golpear(j, tipo, cal, ap ? ap.tx : null, ap ? ap.prof : 0);
      if(cal >= .88){ P.stats.perfectos++; Efectos.texto(j.x, j.y - .9, dePared ? '¡SALIDA PERFECTA!' : PERFECTO_GOLPE[tipo], '#F5C542'); }
      else if(dePared) Efectos.texto(j.x, j.y - .9, 'SALIDA DE PARED', '#7FD3F7');
      else if(tipo !== 'drive' && tipo !== 'volea') Efectos.texto(j.x, j.y - .9, NOMBRE_GOLPE[tipo], COLOR_GOLPE[tipo]);
      else if(ap && ap.nombre) Efectos.texto(j.x, j.y - .9, ap.nombre, '#F4F6F8');
      j.swing = 0;
    } else j.swing -= dt;
  }
  if(j.anim > 0) j.anim -= dt;
  sugerirBoton(j);
}
/* Con la asistencia puesta, brilla el botón que conviene para la bola que viene */
function sugerencia(j){
  const b = P.bola;
  if(P.estado !== 'juego' || !b.viva || b.golpeo === null || b.golpeo === j.lado) return null;
  const pasado = P.t - P.tGolpe;
  let mejor = null, dMin = 3.5;
  for(const s of P.prediccion){
    if(s.t < pasado || ladoDe(s.y) !== j.lado || !s.cruzo || (s.saque && s.botes === 0) || s.z > 2.9) continue;
    if(s.botes === 0 && Math.abs(s.y - RED_Y) > 5.5) continue;
    const d = Math.hypot(s.x - j.x, s.y - j.y);
    if(d < dMin){ dMin = d; mejor = s; }
  }
  if(!mejor) return null;
  const enRed = P.jug.filter(o => o.lado !== j.lado && Math.abs(o.y - RED_Y) < 4.3).length, cercaRed = Math.abs(j.y - RED_Y) < 5.2;
  if(mejor.z > 1.75 && cercaRed) return 'remate';
  if(enRed === 2 && !cercaRed) return 'globo';
  if(enRed === 0 && cercaRed) return 'dejada';
  return 'golpe';
}
function sugerirBoton(j){
  if(!hayDOM || P.t - P.tSug < .1) return;
  P.tSug = P.t;
  const sg = PREF.asistencia ? sugerencia(j) : null;
  if(sg === P.sug) return;
  P.sug = sg;
  for(const el of document.querySelectorAll('#controlesP .accion')) el.classList.toggle('sugerido', el.dataset.accion === sg);
}

/* ── La máquina: tu pareja y los rivales ── */
function esMiBola(j, s){
  const comp = P.jug.find(o => o.lado === j.lado && o.id !== j.id);
  if(!comp || comp.inactivo) return true;
  if(j.carril === 'izq' ? s.x >= 5.4 : s.x < 4.6) return false;
  if(s.x >= 4.6 && s.x < 5.4) return Math.hypot(s.x-j.x, s.y-j.y) <= Math.hypot(s.x-comp.x, s.y-comp.y);
  return true;
}
function objetivoJugador(j){
  const b = P.bola;
  if(P.estado === 'juego' && b.viva && b.golpeo !== null && b.golpeo !== j.lado && P.t - P.tGolpe >= (j.humano ? 0 : j.reaccion)){
    const pasado = P.t - P.tGolpe, ajuste = j.lado === 0 ? .3 : -.3;
    let reserva = null;
    for(const s of P.prediccion){
      if(s.t < pasado || ladoDe(s.y) !== j.lado || !s.cruzo || (s.saque && s.botes === 0)) continue;
      const ok = P.drill && j.humano ? okDrill(s) : s.botes >= 1 ? (s.z >= .2 && s.z <= 1.6) : (s.z >= .6 && s.z <= 2.3 && Math.abs(s.y - RED_Y) < 5.5);
      if(!ok || !esMiBola(j, s)) continue;
      if(!reserva) reserva = s;
      if(Math.hypot(s.x - j.x, s.y - j.y) / j.vel <= s.t - pasado + .06) return conLectura(j, s, ajuste);
    }
    if(reserva) return conLectura(j, reserva, ajuste);
  }
  return posicionBase(j);
}
function conLectura(j, s, ajuste){
  const L0 = j.lectura;
  if(!L0 || j.humano) return {x:s.x, y:s.y + ajuste, va:true};
  const k = clamp(1 - (P.t - L0.t0) / (s.t + .001) * .7, .3, 1);   // el error se corrige al acercarse la bola
  return {x:s.x + L0.dx*k, y:s.y + ajuste + L0.dy*k, va:true};
}
function posicionBase(j){
  const b = P.bola, x = j.carril === 'izq' ? 2.7 : 7.3;
  let arriba = P.estado === 'juego' && b.viva && b.golpeo === j.lado;
  if(P.estado === 'juego' && b.viva && b.golpeo !== null && b.golpeo !== j.lado && ['globo','remate','vibora'].includes(b.ultimoTiro)) arriba = false;
  return { x, y: arriba ? (j.lado === 0 ? 12.7 : 7.3) : (j.lado === 0 ? 17.5 : 2.5), va:false };
}
function actualizarIA(j, dt){
  const o = objetivoJugador(j);
  moverHacia(j, o.x, o.y, j.vel * (o.va ? 1 : .7));
  aplicarMovimiento(j, dt);
  if(j.cd > 0) j.cd -= dt;
  if(j.anim > 0) j.anim -= dt;
  if(P.estado === 'saque' && P.saqueDe === j.id){ if(P.timer <= 0) sacar(j, clamp(j.hab + .15 + gauss()*.08, .3, 1)); return; }
  if(j.cd <= 0 && !j.noGolpea && alcanzable(j)) decidirIA(j);
}
function decidirIA(j){
  const b = P.bola, rivales = P.jug.filter(o => o.lado !== j.lado);
  const enRed = rivales.filter(o => Math.abs(o.y - RED_Y) < 4.3).length, cercaRed = Math.abs(j.y - RED_Y) < 5;
  let tipo;
  if(b.z > 1.7) tipo = cercaRed && Math.random() < j.agresivo ? (b.z > 2 ? 'remate' : 'vibora') : (Math.random() < .3 ? 'vibora' : 'bandeja');
  else if(enRed >= 1 && Math.random() < j.globeador) tipo = 'globo';
  else if(b.botes === 0) tipo = 'volea';
  else if(enRed === 0 && cercaRed && Math.random() < .22) tipo = 'dejada';
  else if(enRed === 2 && !cercaRed && Math.random() < .18) tipo = 'chiquita';
  else tipo = 'drive';
  const cerca = rivales.slice().sort((p,q) => Math.abs(p.x - b.x) - Math.abs(q.x - b.x))[0];
  /* Devolver un remate o una bola muy baja o muy alta cuesta más */
  const dificultad = clamp((Math.hypot(b.vx, b.vy) - 8)/14, 0, .35) + (b.z > 2.3 || b.z < .25 ? .12 : 0);
  golpear(j, tipo, clamp(j.hab + gauss()*.12 - dificultad, .12, .97), cerca.x < 5 ? rnd(6.2, 8.9) : rnd(1.1, 3.8));
}
function sacar(j, calidad){
  const b = P.bola;
  Object.assign(b, { x:j.x, y:j.y + (j.lado === 0 ? -.35 : .35), z:.9, viva:true, rastro:[] });
  P.saqueX = j.x; P.estado = 'juego';
  golpear(j, 'saque', calidad, j.x < 5 ? rnd(6.2, 8.6) : rnd(1.4, 3.8));
}
