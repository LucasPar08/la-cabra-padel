
/* ═══════════════════════════════════════════════════════════════
   LA PISTA EN VIVO
   Cualquier partido del calendario se puede jugar de verdad: 2 contra 2 y
   visto desde arriba. La pista mide 10×20 m como la de verdad: tu pareja
   abajo, la rival arriba, red en y = 10 y cristal alrededor. La bola vive en
   3D (x, y y la altura z) y respeta las reglas del pádel: bote en el suelo
   antes de la pared, un bote por lado y punto de oro.

   Cuatro golpes: GOLPE (drive, volea o bandeja según la bola), REMATE,
   GLOBO y DEJADA. Tus estadísticas de la carrera deciden qué golpes te
   salen mejor; lo difícil del partido lo pone la diferencia de nivel con la
   pareja rival, la misma que usa la simulación.
   ═══════════════════════════════════════════════════════════════ */
const hayDOM = typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined';
const W = 10, L = 20, RED_Y = 10, RED_ALT = 0.92, PARED = 3.0, LINEA_SAQUE = 6.95;
const ALT_FONDO = 4.0, REJA_Y0 = 4, REJA_Y1 = 16;   // fondo: 3 m de cristal + 1 m de malla · laterales: cristal junto a los fondos, malla en el centro
const G = 10.5;              // gravedad un pelín más alta que la real: juego más vivo
const REST_SUELO = 0.62, REST_PARED = 0.7, REST_REJA = 0.38, ROCE = 0.86, R_BOLA = 0.1;
const DUR_SWING = 0.34;      // ventana del golpe: generosa para el móvil
const PAUSA_PUNTO = 1.05;
const NOM_PUNTO = ['0','15','30','40'];
function gauss(){ let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random(); return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v); }

/* Ajustes de la pista: se guardan en el dispositivo, aparte de la carrera */
const PREF_KEY = 'cabra_circuito_pref_v1';
const PREF_BASE = { asistencia:true, sonido:true, juegos:3, sets:1, posicion:'reves', aspecto:{ camiseta:'#DCF54A', pala:'#0F1C22', zurdo:false }, records:{}, tutorial:false, dificultad:'normal', vista:'tv', mano:'diestro', tamBotones:1, opacidad:1,
                    posBotones:null, golpeAuto:false, vibracion:true, teclas:{ golpe:'KeyJ', remate:'KeyL', globo:'KeyK', dejada:'KeyI', pausa:'KeyP' } };
function leerPref(){
  let p;
  try{ p = Object.assign({}, PREF_BASE, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); }catch(e){ p = Object.assign({}, PREF_BASE); }
  p.aspecto = Object.assign({}, PREF_BASE.aspecto, p.aspecto || {}); p.records = Object.assign({}, p.records || {});
  return p;
}
let PREF = leerPref();
function guardarPref(){ try{ localStorage.setItem(PREF_KEY, JSON.stringify(PREF)); }catch(e){} }

/* ── Sonido sintetizado: sin archivos, nada que cargar ── */
const Sonido = (() => {
  let ctx = null;
  function listo(){
    if(!PREF.sonido || !hayDOM) return null;
    if(!ctx){ const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null; ctx = new AC(); }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tono(f, dur, tipo, vol, f2){
    const c = listo(); if(!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t);
    if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol || .2, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .03);
  }
  function ruido(dur, frec, vol){
    const c = listo(); if(!c) return;
    const n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for(let i = 0; i < n; i++) d[i] = (Math.random()*2 - 1) * (1 - i/n);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; fl.type = 'bandpass'; fl.frequency.value = frec; fl.Q.value = 1.1; g.gain.value = vol;
    s.connect(fl).connect(g).connect(c.destination); s.start();
  }
  /* aplausos de verdad: cientos de palmadas cortas repartidas en el tiempo */
  function aplausos(dur, fuerza){
    const c = listo(); if(!c) return;
    const n = Math.floor(c.sampleRate*dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for(let k = 0, palmadas = Math.floor(dur*140*fuerza); k < palmadas; k++){
      const t0 = Math.floor(Math.random()*n*.9), largo = Math.floor(c.sampleRate*(.006 + Math.random()*.012)), amp = .25 + Math.random()*.75;
      for(let i = 0; i < largo && t0 + i < n; i++) d[t0 + i] += (Math.random()*2 - 1)*amp*Math.exp(-i/(largo*.28));
    }
    for(let i = 0; i < n; i++) d[i] *= Math.min(1, i/(n*.06))*Math.min(1, (n - i)/(n*.4));
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; fl.type = 'highpass'; fl.frequency.value = 650; g.gain.value = .22*fuerza;
    s.connect(fl).connect(g).connect(c.destination); s.start();
  }
  return {
    desbloquear: listo,
    golpe:  p => { ruido(.045, 1900, .25 + .35*p); tono(200 + 160*p, .07, 'triangle', .16); },
    bote:   () => tono(110, .07, 'sine', .2, 70),
    cristal:() => { tono(1320, .11, 'sine', .07); tono(2240, .08, 'sine', .045); },
    red:    () => tono(140, .13, 'square', .07, 85),
    reja:   () => { ruido(.1, 380, .24); tono(90, .1, 'square', .05); },
    punto:  gana => { tono(gana ? 523 : 330, .12, 'triangle', .14); setTimeout(()=>tono(gana ? 784 : 247, .18, 'triangle', .14), 115); },
    grada:  () => aplausos(1.5, .8),
    ovacion:() => { aplausos(2.8, 1.1); tono(220, .6, 'sawtooth', .02, 200); },
    fanfarria: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => { tono(f, .24, 'triangle', .12); tono(f/2, .24, 'sine', .05); }, i*150)),
  };
})();

/* ── Controles: joystick y cuatro botones en el móvil, teclado en el ordenador ── */
const Input = { ax:0, ay:0, accion:null, teclas:new Set(), joyId:null };
function teclasActuales(){ return Object.assign({}, PREF_BASE.teclas, PREF.teclas); }
function accionDeTecla(code){
  const t = teclasActuales();
  for(const k of ['golpe','remate','globo','dejada']) if(t[k] === code) return k;
  return code === 'Space' && !Object.values(t).includes('Space') ? 'golpe' : null;
}
function nombreTecla(code){
  if(!code) return '—';
  if(code === 'Space') return 'Espacio';
  if(/^Key/.test(code)) return code.slice(3);
  if(/^Digit/.test(code)) return code.slice(5);
  return ({ShiftLeft:'Shift', ShiftRight:'Shift der.', ControlLeft:'Ctrl', ControlRight:'Ctrl der.', AltLeft:'Alt', Enter:'Enter', Tab:'Tab', Backspace:'Borrar',
           Semicolon:'Ñ', Comma:',', Period:'.', Slash:'-', Quote:'´', BracketLeft:'`', BracketRight:'+', Backslash:'ç'})[code] || code;
}
function ejeMovimiento(){
  const t = Input.teclas;
  let x = Input.ax, y = Input.ay;
  if(!x && !y){
    x = (t.has('ArrowRight')||t.has('KeyD') ? 1 : 0) - (t.has('ArrowLeft')||t.has('KeyA') ? 1 : 0);
    y = (t.has('ArrowDown')||t.has('KeyS') ? 1 : 0) - (t.has('ArrowUp')||t.has('KeyW') ? 1 : 0);
  }
  const m = Math.hypot(x, y); if(m > 1){ x /= m; y /= m; }
  return {x, y};
}
function prepararControles(){
  if(!hayDOM) return;
  addEventListener('keydown', e => {
    if(!P || $('#juego').hidden) return;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    if(e.repeat) return;
    Input.teclas.add(e.code);
    Sonido.desbloquear();
    const acc = accionDeTecla(e.code);
    if(acc) Input.accion = acc;
    if(e.code === teclasActuales().pausa || e.code === 'Escape') alternarPausa();
  });
  addEventListener('keyup', e => Input.teclas.delete(e.code));
  addEventListener('blur', () => Input.teclas.clear());
  addEventListener('resize', () => { if($('#juego').hidden) return; ajustarLienzo(); aplicarDisenoControles(); if(EDITOR.activo) dibujarFondoEditor(); });
  document.addEventListener('visibilitychange', () => { if(document.hidden && P && !P.pausa && P.estado !== 'fin') alternarPausa(); });
  const joy = $('#joyP'), knob = $('#joyKnobP');
  const moverJoy = e => {
    const r = joy.getBoundingClientRect(), R = r.width/2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const m = Math.hypot(dx, dy); if(m > R){ dx *= R/m; dy *= R/m; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    const mag = Math.hypot(dx, dy) / R;
    Input.ax = mag < .16 ? 0 : dx/R; Input.ay = mag < .16 ? 0 : dy/R;
  };
  joy.addEventListener('pointerdown', e => { if(EDITOR.activo) return; e.preventDefault(); Sonido.desbloquear(); Input.joyId = e.pointerId; joy.setPointerCapture(e.pointerId); moverJoy(e); });
  joy.addEventListener('pointermove', e => { if(!EDITOR.activo && e.pointerId === Input.joyId) moverJoy(e); });
  const soltar = e => { if(e.pointerId !== Input.joyId) return; Input.joyId = null; Input.ax = Input.ay = 0; knob.style.transform = ''; };
  joy.addEventListener('pointerup', soltar); joy.addEventListener('pointercancel', soltar);
  for(const b of document.querySelectorAll('#controlesP .accion')){
    b.addEventListener('pointerdown', e => { if(EDITOR.activo) return; e.preventDefault(); Sonido.desbloquear(); Input.accion = b.dataset.accion; b.classList.add('pulsado'); });
    const fin = () => b.classList.remove('pulsado');
    b.addEventListener('pointerup', fin); b.addEventListener('pointercancel', fin); b.addEventListener('pointerleave', fin);
  }
  prepararArrastreEditor();
  $('#bPausaP').addEventListener('click', alternarPausa);
  $('#juego').addEventListener('contextmenu', e => e.preventDefault());
}

/* ═══════════════════════════════════════════════════════════════
   LA BOLA Y LAS REGLAS
   Suelo antes que pared, un solo bote por lado, la red, el cristal y la malla.
   Si una bola bota y sale de la pista, es punto del que la pegó: por 3 (por
   encima del lateral, 3 m) o por 4 (por encima del fondo, 4 m).
   ═══════════════════════════════════════════════════════════════ */
let P = null;   // el partido en curso

function nuevaBola(){
  return { x:5, y:15, z:.9, vx:0, vy:0, vz:0, botes:0, golpeo:null, cruzo:false, viva:true,
           saque:false, porTres:false, ultimoTiro:null, golpeador:null, pared:false, rastro:[], efecto:null, tocoRed:false, letForzado:false };
}
function ladoDe(y){ return y >= RED_Y ? 0 : 1; }   // 0 = vosotros (abajo) · 1 = ellos (arriba)

/* Un paso de física. Con `sim` no se aplican reglas: sirve para predecir */
function pasoBola(b, dt, sim){
  const py = b.y;
  b.vz -= G*dt;
  b.x += b.vx*dt; b.y += b.vy*dt; b.z += b.vz*dt;
  if(b.golpeo !== null && !b.cruzo && (py >= RED_Y) !== (b.y >= RED_Y)){
    if(b.z < RED_ALT){
      if(sim) return 'red';
      b.y = py; b.vy *= -.15; b.vx *= .3;
      return regla(b, 'red');
    }
    b.cruzo = true;
    /* el saque que roza la cinta y entra es let */
    if(b.saque && (b.z < RED_ALT + .07 || b.letForzado)){ b.tocoRed = true; b.vy *= .86; if(!sim) Sonido.red(); }
  }
  if(b.z <= 0 && b.vz < 0){
    b.z = 0; b.vz = -b.vz*REST_SUELO; b.vx *= ROCE; b.vy *= ROCE;
    const r = sim ? simBote(b) : regla(b, 'bote'); if(r) return r;
  }
  /* devuelta desde fuera de la pista: no choca con la malla hasta que vuelve a entrar por encima */
  if(b.fueraPista){ if(b.x > R_BOLA && b.x < W - R_BOLA && b.y > R_BOLA && b.y < L - R_BOLA) b.fueraPista = false; else return null; }
  if(b.x < R_BOLA || b.x > W - R_BOLA){
    if(b.z > PARED) return sim ? 'fuera' : regla(b, 'fuera', 'lateral');
    const reja = b.y > REJA_Y0 && b.y < REJA_Y1;
    b.x = clamp(b.x, R_BOLA, W - R_BOLA); b.vx = -b.vx*(reja ? REST_REJA : restPared(b));
    if(reja) rebotarReja(b, sim, 'x');
    const r = sim ? simPared(b) : regla(b, 'pared', reja ? 'reja' : 'cristal'); if(r) return r;
  }
  if(b.y < R_BOLA || b.y > L - R_BOLA){
    if(b.z > ALT_FONDO) return sim ? 'fuera' : regla(b, 'fuera', 'fondo');
    const reja = b.z > PARED;
    b.y = clamp(b.y, R_BOLA, L - R_BOLA); b.vy = -b.vy*(reja ? REST_REJA : restPared(b));
    if(reja) rebotarReja(b, sim, 'y');
    const r = sim ? simPared(b) : regla(b, 'pared', reja ? 'reja' : 'cristal'); if(r) return r;
  }
  return null;
}
/* la bola cortada sale muerta del cristal */
function restPared(b){ return REST_PARED * (b.efecto === 'corte' ? .8 : 1); }
/* la malla no devuelve la bola limpia: la frena y la desvía (al predecir, sin azar) */
function rebotarReja(b, sim, eje){
  b.vz *= .6;
  if(sim) return;
  b.vx += gauss()*.7; b.vy += gauss()*.7; b.vz += gauss()*.4;
  if(eje === 'x') b.vx = b.x < W/2 ? Math.abs(b.vx) : -Math.abs(b.vx);
  else b.vy = b.y < L/2 ? Math.abs(b.vy) : -Math.abs(b.vy);
}
/* Al botar manda el efecto: el remate perfecto sale de la pista, lo cortado bota bajo, lo liftado corre
   y la víbora se abre hacia el lateral */
function reboteRemate(b){
  if(b.botes !== 1) return;
  if(b.porTres){
    if(Math.abs(b.x - W/2) > 2.4){                       // por 3: por encima de la malla del lateral
      const lat = Math.max(.4, b.x < W/2 ? b.x : W - b.x), vxl = 9, t = lat/vxl;
      b.vx = (b.x < W/2 ? -1 : 1)*vxl; b.vz = (PARED + .6 + .5*G*t*t)/t; b.vy *= .6;
    } else {                                              // por 4: por encima del fondo
      const hasta = Math.max(.8, b.vy > 0 ? L - b.y : b.y), vy = Math.max(6, Math.abs(b.vy)*.7), t = hasta/vy;
      b.vy = Math.sign(b.vy || -1)*vy; b.vz = (ALT_FONDO + .6 + .5*G*t*t)/t;
    }
    return;
  }
  if(b.efecto === 'corte'){ b.vz *= .8; b.vx *= .92; b.vy *= .92; }
  else if(b.efecto === 'liftado'){ b.vz *= 1.07; b.vx *= 1.04; b.vy *= 1.04; }
  else if(b.efecto === 'lateral'){ b.vz *= .72; b.vx += (b.x < W/2 ? -1 : 1)*1.3; }
}
function simBote(b){
  if(!b.cruzo) return 'corta';
  if(ladoDe(b.y) === b.golpeo) return 'vuelve';
  b.botes++; reboteRemate(b);
  return b.botes >= 2 ? 'dobleBote' : null;
}
function simPared(b){ if(!b.cruzo || b.botes === 0) return 'paredDirecta'; b.pared = true; return null; }

function enCajaSaque(b){
  const rec = 1 - b.golpeo;
  const fondo = rec === 1 ? (b.y >= RED_Y - LINEA_SAQUE - .15 && b.y <= RED_Y) : (b.y <= RED_Y + LINEA_SAQUE + .15 && b.y >= RED_Y);
  const cruzado = P.saqueX < 5 ? b.x >= 4.85 : b.x <= 5.15;
  return fondo && cruzado;
}
function motivoDobleBote(b){
  if(b.ultimoTiro === 'dejada' || b.ultimoTiro === 'chiquita') return '¡Dejada!';
  if(b.ultimoTiro === 'vibora') return '¡Víbora ganadora!';
  if(b.ultimoTiro === 'remate' || b.ultimoTiro === 'plano') return '¡Remate ganador!';
  return 'Doble bote';
}
function regla(b, ev, extra){
  const pega = b.golpeo; if(pega === null) return null;
  const recibe = 1 - pega;
  if(ev === 'red'){ Sonido.red(); return terminar(recibe, 'A la red'); }
  if(ev === 'bote'){
    if(!b.cruzo) return terminar(recibe, 'No pasa la red');
    if(ladoDe(b.y) === pega) return terminar(pega, 'No la devuelven');
    b.botes++;
    if(P.drill && pega === 0 && b.botes === 1) return finDrill(evaluarDrill(b));     // entrenamiento: se mira dónde bota tu golpe
    if(b.saque && b.botes === 1){
      if(!enCajaSaque(b)) return terminar(recibe, 'Falta de saque');
      if(b.tocoRed) return repetirSaque();
    }
    reboteRemate(b);
    if(b.botes >= 2) return terminar(pega, b.saque ? '¡Ace!' : motivoDobleBote(b));
    Sonido.bote(); Efectos.bote(b.x, b.y);
    return null;
  }
  if(ev === 'pared'){
    if(!b.cruzo) return terminar(recibe, 'Pared en su campo');
    if(b.botes === 0) return terminar(recibe, extra === 'reja' ? 'Reja directa' : 'Pared directa');
    if(b.saque && extra === 'reja') return terminar(recibe, 'Saque a la reja');
    b.pared = true;                                  // ya se puede sacar de la pared
    if(extra === 'reja'){ Sonido.reja(); Efectos.reja(b.x, b.y, b.z); P.prediccion = predecirBola(b, 3, P.t - P.tGolpe); }
    else { Sonido.cristal(); Efectos.cristal(b.x, b.y, b.z); }
    return null;
  }
  if(ev === 'fuera'){
    if(b.cruzo && b.botes >= 1 && ladoDe(b.y) === recibe){
      if(extra !== 'fondo' && intentarSalida(b, recibe)) return 'salida';     // por el lateral se puede salir a buscarla
      return terminar(pega, extra === 'fondo' ? '¡Por 4!' : '¡Por 3!', {porTres:true});
    }
    return terminar(recibe, 'Fuera');
  }
  return null;
}
/* En el saque, cualquier error es falta: con la primera hay segundo saque; con la segunda, doble falta */
const FALTAS_SAQUE = ['A la red', 'No pasa la red', 'Falta de saque', 'Pared en su campo', 'Pared directa', 'Reja directa', 'Saque a la reja', 'Fuera'];
function terminar(ganador, motivo, extra){
  const b = P.bola;
  if(!b.viva) return 'fin';
  b.viva = false;
  if(!P.drill && b.saque && ganador !== b.golpeo && FALTAS_SAQUE.includes(motivo)){
    if(P.saqueN !== 2){ faltaSaque(motivo); return 'fin'; }
    motivo = 'Doble falta';
  }
  finPunto(ganador, motivo, extra || {});
  return 'fin';
}

/* Adónde va a ir la bola: la usan la máquina, la asistencia y las sugerencias */
function predecirBola(b, maxT, t0){
  const c = Object.assign({}, b, {rastro:null}), out = [], dt = 1/60;
  for(let t = dt; t <= maxT; t += dt){
    const r = pasoBola(c, dt, true);
    out.push({ t:(t0 || 0) + t, x:c.x, y:c.y, z:c.z, botes:c.botes, cruzo:c.cruzo, saque:c.saque, pared:c.pared });
    if(r) break;
  }
  return out;
}
function actualizarBola(dt){
  const b = P.bola; if(!b.viva || P.estado !== 'juego') return;
  for(let i = 0; i < 3; i++) if(pasoBola(b, dt/3, false)) break;
  b.rastro.push({x:b.x, y:b.y, z:b.z}); if(b.rastro.length > 9) b.rastro.shift();
  /* red de seguridad: una bola que no se decide en 7 s es del que la pegó */
  if(b.viva && P.t - P.tGolpe > 7) terminar(b.golpeo === null ? 1 : b.golpeo, 'Bola muerta');
}
