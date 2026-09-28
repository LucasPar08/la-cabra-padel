import os
# Pádel más realista: cámara de tele con perspectiva, pista azul con cristal y malla, jugadores de cuerpo entero,
# segundo saque y let, saque alternando lado, malla que frena la bola, efectos (cortado / liftado / víbora),
# por 3 (lateral) y por 4 (fondo, 4 m) y set completo con tie-break en el partido rápido.
D = os.path.dirname(os.path.abspath(__file__))
leer = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
escribir = lambda n, s: open(os.path.join(D, n), 'w', encoding='utf-8').write(s)
def rep(s, a, b, nombre):
    c = s.count(a); assert c == 1, 'FALTA en %s (%d): %s' % (nombre, c, a[:100]); return s.replace(a, b)
def tramo(s, desde, hasta, nuevo, nombre):
    a = s.index(desde); b = s.index(hasta, a)
    return s[:a] + nuevo + s[b:]

# ═════════════ motor 1: la bola y las reglas ═════════════
m1 = leer('c-motor1.js')
m1 = rep(m1, "const W = 10, L = 20, RED_Y = 10, RED_ALT = 0.92, PARED = 3.0, LINEA_SAQUE = 6.95;",
         "const W = 10, L = 20, RED_Y = 10, RED_ALT = 0.92, PARED = 3.0, LINEA_SAQUE = 6.95;\n"
         "const ALT_FONDO = 4.0, REJA_Y0 = 4, REJA_Y1 = 16;   // fondo: 3 m de cristal + 1 m de malla · laterales: cristal junto a los fondos, malla en el centro", 'm1')
m1 = rep(m1, "const REST_SUELO = 0.62, REST_PARED = 0.7, ROCE = 0.86, R_BOLA = 0.1;",
         "const REST_SUELO = 0.62, REST_PARED = 0.7, REST_REJA = 0.38, ROCE = 0.86, R_BOLA = 0.1;", 'm1')
m1 = rep(m1, "dificultad:'normal', mano:'diestro',", "dificultad:'normal', vista:'tv', mano:'diestro',", 'm1')
m1 = rep(m1, "    red:    () => tono(140, .13, 'square', .07, 85),",
         "    red:    () => tono(140, .13, 'square', .07, 85),\n    reja:   () => { ruido(.1, 380, .24); tono(90, .1, 'square', .05); },", 'm1')
m1 = rep(m1, "   Suelo antes que pared, un solo bote por lado, la red y el cristal. Si una\n"
             "   bola bota y sale por encima del cristal, es punto del que la pegó: por 3\n"
             "   (fondo) o por 4 (lateral).",
         "   Suelo antes que pared, un solo bote por lado, la red, el cristal y la malla.\n"
         "   Si una bola bota y sale de la pista, es punto del que la pegó: por 3 (por\n"
         "   encima del lateral, 3 m) o por 4 (por encima del fondo, 4 m).", 'm1')
m1 = rep(m1, "saque:false, porTres:false, ultimoTiro:null, golpeador:null, pared:false, rastro:[] };",
         "saque:false, porTres:false, ultimoTiro:null, golpeador:null, pared:false, rastro:[], efecto:null, tocoRed:false, letForzado:false };", 'm1')
m1 = tramo(m1, "/* Un paso de física.", "function simBote(b){", r'''/* Un paso de física. Con `sim` no se aplican reglas: sirve para predecir */
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
''', 'm1')
m1 = tramo(m1, "function regla(b, ev, extra){", "/* Adónde va a ir la bola", r'''function regla(b, ev, extra){
  const pega = b.golpeo; if(pega === null) return null;
  const recibe = 1 - pega;
  if(ev === 'red'){ Sonido.red(); return terminar(recibe, 'A la red'); }
  if(ev === 'bote'){
    if(!b.cruzo) return terminar(recibe, 'No pasa la red');
    if(ladoDe(b.y) === pega) return terminar(pega, 'No la devuelven');
    b.botes++;
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
    if(b.cruzo && b.botes >= 1 && ladoDe(b.y) === recibe) return terminar(pega, extra === 'fondo' ? '¡Por 4!' : '¡Por 3!', {porTres:true});
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
  if(b.saque && ganador !== b.golpeo && FALTAS_SAQUE.includes(motivo)){
    if(P.saqueN !== 2){ faltaSaque(motivo); return 'fin'; }
    motivo = 'Doble falta';
  }
  finPunto(ganador, motivo, extra || {});
  return 'fin';
}

''', 'm1')
m1 = rep(m1, "function predecirBola(b, maxT){\n  const c = Object.assign({}, b, {rastro:null}), out = [], dt = 1/60;\n  for(let t = dt; t <= maxT; t += dt){\n    const r = pasoBola(c, dt, true);\n    out.push({ t, x:c.x",
         "function predecirBola(b, maxT, t0){\n  const c = Object.assign({}, b, {rastro:null}), out = [], dt = 1/60;\n  for(let t = dt; t <= maxT; t += dt){\n    const r = pasoBola(c, dt, true);\n    out.push({ t:(t0 || 0) + t, x:c.x", 'm1')
escribir('c-motor1.js', m1)

# ═════════════ motor 2: los golpes ═════════════
m2 = leer('c-motor2.js')
m2 = rep(m2, "const RIESGO_TIRO = { plano:1.35, remate:1.12, vibora:1.05, dejada:1.2, chiquita:1.05 };",
         "const RIESGO_TIRO = { plano:1.35, remate:1.12, vibora:1.05, dejada:1.2, chiquita:1.05 };\n"
         "/* El efecto de cada golpe: cortado (bota bajo y muere en el cristal), liftado (bota y corre) o la víbora, que se abre */\n"
         "const EFECTO_TIRO = { saque:'corte', bandeja:'corte', volea:'corte', dejada:'corte', chiquita:'corte', vibora:'lateral', drive:'liftado', globo:'liftado' };", 'm2')
m2 = rep(m2, "  if(tipo === 'saque' && fallo) fallo = Math.random() < .4 ? 'red' : null;\n",
         "  if(tipo === 'saque'){\n"
         "    /* el primer saque se arriesga más; el segundo entra casi siempre */\n"
         "    const pF = clamp((P.saqueN === 2 ? .03 : .11) * (1.35 - calidad) * mf, .008, .3);\n"
         "    fallo = Math.random() < pF ? pick(['red','largo','largo','cruce']) : null;\n"
         "    if(fallo === 'largo') d = rnd(7.15, 8.2);\n"
         "    if(fallo === 'cruce') tx = P.saqueX < W/2 ? rnd(3.3, 4.6) : rnd(5.4, 6.7);\n"
         "  }\n", 'm2')
m2 = rep(m2, "golpeo:j.lado, botes:0, cruzo:false, saque:tipo==='saque', pared:false,",
         "golpeo:j.lado, botes:0, cruzo:false, saque:tipo==='saque', pared:false, efecto: EFECTO_TIRO[tipo] || null, tocoRed:false,\n"
         "                     letForzado: tipo === 'saque' && !fallo && Math.random() < .03,", 'm2')
escribir('c-motor2.js', m2)

# ═════════════ motor 3: cámara, dibujo y partido ═════════════
m3 = leer('c-motor3.js')
m3 = rep(m3, "  golpe(x, y, tipo, cal){\n    const fuerte = tipo === 'remate' || tipo === 'vibora' || tipo === 'plano', n = fuerte ? 16 : 6;\n"
             "    for(let i = 0; i < n; i++) this.particulas.push({ x, y, vx:rnd(-2.5,2.5), vy:rnd(-2.5,2.5), vida:.35, max:.35, color: fuerte ? '#F5C542' : '#DCF54A' });\n"
             "    this.particulas.push({ x, y, anillo:true, vida:.25, max:.25, r0:.3, r1: fuerte ? 1.6 : .9, color: fuerte ? '#F5C542' : 'rgba(255,255,255,.7)' });",
         "  golpe(x, y, tipo, cal){\n    const z = P && P.bola ? P.bola.z : .9, fuerte = tipo === 'remate' || tipo === 'vibora' || tipo === 'plano', n = fuerte ? 16 : 6;\n"
         "    for(let i = 0; i < n; i++) this.particulas.push({ x, y, z, vx:rnd(-2.5,2.5), vy:rnd(-2.5,2.5), vida:.35, max:.35, color: fuerte ? '#F5C542' : '#DCF54A' });\n"
         "    this.particulas.push({ x, y, z, pared:true, anillo:true, vida:.25, max:.25, r0:.15, r1: fuerte ? 1.1 : .6, color: fuerte ? '#F5C542' : 'rgba(255,255,255,.7)' });", 'm3')
m3 = rep(m3, "  cristal(x, y){ this.particulas.push({ x, y, anillo:true, vida:.4, max:.4, r0:.2, r1:1.1, color:'#7FD3F7' }); this.sacudir(2); },",
         "  cristal(x, y, z){ this.particulas.push({ x, y, z: z == null ? 1 : z, pared:true, anillo:true, vida:.4, max:.4, r0:.15, r1:.8, color:'#7FD3F7' }); this.sacudir(2); },\n"
         "  reja(x, y, z){ this.particulas.push({ x, y, z: z == null ? 1 : z, pared:true, anillo:true, vida:.35, max:.35, r0:.1, r1:.55, color:'#C9D3DC' }); this.sacudir(1); },", 'm3')
m3 = rep(m3, "this.particulas.push({ x:rnd(1,9), y:rnd(11,19), vx:", "this.particulas.push({ x:rnd(1,9), y:rnd(11,19), z:rnd(.8,2.2), vx:", 'm3')

DIBUJO = r'''/* ── La cámara ──
   Como en la tele: detrás y por encima de tu fondo, con perspectiva (lo de lejos se ve más pequeño y los
   cristales y la malla se levantan). También se puede ver desde arriba, como antes.
   proy(x, y, z) → [X, Y, s]: el punto en pantalla y cuántos píxeles mide un metro a esa distancia. */
let CV = null, CX = null, DPR = 1, VISTA = 'tv', CAM = null, FONDO = null, ESC = 20, OX = 0, OY = 0;
const ANG_TV = 52*Math.PI/180, DIST_TV = 27;
function proyTV(x, y, z){
  const dy = CAM.yc - y, dz = CAM.hc - z, d = Math.max(.5, dy*CAM.cos + dz*CAM.sin), u = dy*CAM.sin - dz*CAM.cos, s = CAM.F/d;
  return [CAM.cx + (x - W/2)*s, CAM.cy - u*s, s];
}
function proy(x, y, z){
  z = z || 0;
  return VISTA === 'tv' ? proyTV(x, y, z) : [OX + x*ESC, OY + y*ESC - z*ESC*.55, ESC];
}
function ajustarLienzo(){
  if(!hayDOM) return;
  CV = $('#lienzo'); CX = CV.getContext('2d');
  DPR = Math.min(2, window.devicePixelRatio || 1);
  const w = innerWidth, h = innerHeight;
  CV.width = Math.round(w*DPR); CV.height = Math.round(h*DPR);
  const tactil = !matchMedia('(hover:hover) and (pointer:fine)').matches;
  const arriba = 64, abajo = tactil && !PREF.posBotones ? Math.round(232*(PREF.tamBotones || 1)) : tactil ? 150 : 44, Ha = h - arriba - abajo;
  VISTA = PREF.vista === 'arriba' ? 'arriba' : 'tv';
  if(VISTA === 'tv'){
    CAM = { cos:Math.cos(ANG_TV), sin:Math.sin(ANG_TV), yc: 10.6 + DIST_TV*Math.cos(ANG_TV), hc: DIST_TV*Math.sin(ANG_TV), F:1, cx:0, cy:0 };
    const pts = [[-.5,0,ALT_FONDO+1],[W+.5,0,ALT_FONDO+1],[-.3,L,0],[W+.3,L,0],[-.3,L,PARED],[W+.3,L,PARED]].map(p => proyTV(p[0], p[1], p[2]));
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    CAM.F = Math.min((w - 12)/(x1 - x0), Ha/(y1 - y0));
    CAM.cx = (w - (x0 + x1)*CAM.F)/2; CAM.cy = arriba + (Ha - (y0 + y1)*CAM.F)/2;
  } else {
    const m = .7;
    ESC = Math.min((w - 20) / (W + m*2), Ha / (L + m*2));
    OX = (w - W*ESC) / 2; OY = arriba + (Ha - L*ESC) / 2;
  }
  FONDO = null;                       // el decorado se vuelve a pintar con el tamaño nuevo
}
function poli(c, pts){ c.beginPath(); pts.forEach((p, i) => { const q = proy(p[0], p[1], p[2]); if(i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.closePath(); }
function lineaP(c, a, b){ const p = proy(a[0], a[1], a[2]), q = proy(b[0], b[1], b[2]); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
function anilloSuelo(c, x, y, r, color, ancho){
  c.beginPath();
  for(let i = 0; i <= 28; i++){ const a = i/28*Math.PI*2, q = proy(x + Math.cos(a)*r, y + Math.sin(a)*r, 0); if(i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }
  c.strokeStyle = color; c.lineWidth = ancho; c.stroke();
}
function rrect(c, x, y, w, h, r){
  r = Math.max(0, Math.min(r, w/2, h/2));
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/* ── El decorado: pabellón, césped azul, líneas, cristales y malla. Se pinta una vez y se reutiliza ── */
function dibujarPared(c, a, b, z0, z1, tipo){
  poli(c, [[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]]);
  if(tipo === 'cristal'){
    c.fillStyle = 'rgba(160,215,255,.09)'; c.fill();
    c.strokeStyle = 'rgba(200,235,255,.5)'; c.lineWidth = 1.2; c.stroke();
    return;
  }
  c.fillStyle = 'rgba(10,18,26,.30)'; c.fill();
  c.save(); c.clip();
  c.strokeStyle = 'rgba(205,215,225,.22)'; c.lineWidth = 1;
  const largo = Math.hypot(b[0] - a[0], b[1] - a[1]), alto = z1 - z0, en = u => [a[0] + (b[0] - a[0])*u/largo, a[1] + (b[1] - a[1])*u/largo];
  for(let u = -alto; u <= largo + alto; u += .32){
    const p = en(u), q = en(u + alto);
    lineaP(c, [p[0], p[1], z0], [q[0], q[1], z1]);
    lineaP(c, [q[0], q[1], z0], [p[0], p[1], z1]);
  }
  c.restore();
  poli(c, [[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]]);
  c.strokeStyle = 'rgba(140,150,160,.85)'; c.lineWidth = 1.6; c.stroke();
}
function dibujarDecorado(c){
  const w = innerWidth, h = innerHeight, tv = VISTA === 'tv';
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0B1A2C'); g.addColorStop(.6, '#07121D'); g.addColorStop(1, '#03080D');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  if(tv){
    /* la grada detrás del fondo y los focos del pabellón */
    const yA = proy(W/2, -4, 8)[1], yB = proy(W/2, -.2, ALT_FONDO + 1)[1];
    for(let i = 0; i < 260; i++){
      c.fillStyle = pick(['rgba(255,255,255,.16)','rgba(220,245,74,.18)','rgba(255,138,122,.16)','rgba(127,211,247,.16)']);
      c.fillRect(Math.random()*w, yA + Math.random()*Math.max(0, yB - yA), 2.2, 2.2);
    }
    const foco = c.createRadialGradient(w/2, yA, 10, w/2, yA, w*.9); foco.addColorStop(0, 'rgba(255,255,255,.10)'); foco.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = foco; c.fillRect(0, 0, w, h);
    /* la pantalla LED encima del cristal del fondo */
    poli(c, [[-.5,-.05,ALT_FONDO+.12],[W+.5,-.05,ALT_FONDO+.12],[W+.5,-.05,ALT_FONDO+.9],[-.5,-.05,ALT_FONDO+.9]]);
    c.fillStyle = '#0D2C52'; c.fill(); c.strokeStyle = 'rgba(127,211,247,.5)'; c.lineWidth = 1; c.stroke();
    const q = proy(W/2, -.05, ALT_FONDO + .5);
    c.fillStyle = '#DCF54A'; c.font = `900 ${Math.max(9, q[2]*.42)}px Inter, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('LA CABRA · PÁDEL TOUR', q[0], q[1]); c.textBaseline = 'alphabetic';
  }
  /* el suelo de alrededor y el césped azul, con sus franjas */
  poli(c, [[-1.3,-.4,0],[W+1.3,-.4,0],[W+1.3,L+1.2,0],[-1.3,L+1.2,0]]); c.fillStyle = '#10335E'; c.fill();
  poli(c, [[0,0,0],[W,0,0],[W,L,0],[0,L,0]]); c.fillStyle = '#2A64B8'; c.fill();
  for(let k = 0; k < L; k += 2){ poli(c, [[0,k,0],[W,k,0],[W,k+1,0],[0,k+1,0]]); c.fillStyle = 'rgba(255,255,255,.035)'; c.fill(); }
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = Math.max(1.4, proy(W/2, RED_Y, 0)[2]*.055);
  lineaP(c, [0, RED_Y - LINEA_SAQUE, 0], [W, RED_Y - LINEA_SAQUE, 0]); lineaP(c, [0, RED_Y + LINEA_SAQUE, 0], [W, RED_Y + LINEA_SAQUE, 0]);
  lineaP(c, [W/2, RED_Y - LINEA_SAQUE, 0], [W/2, RED_Y + LINEA_SAQUE, 0]);
  if(!tv){
    /* desde arriba: el marco de cristal de siempre, con la malla marcada en el centro de los laterales */
    const m = .7;
    c.fillStyle = 'rgba(127,211,247,.10)';
    c.fillRect(OX - m*ESC, OY - m*ESC, (W + m*2)*ESC, m*ESC); c.fillRect(OX - m*ESC, OY + L*ESC, (W + m*2)*ESC, m*ESC);
    c.fillRect(OX - m*ESC, OY, m*ESC, L*ESC); c.fillRect(OX + W*ESC, OY, m*ESC, L*ESC);
    c.fillStyle = 'rgba(200,210,220,.18)';
    for(const x0 of [OX - m*ESC, OX + W*ESC]) for(let y = REJA_Y0; y < REJA_Y1; y += .5) c.fillRect(x0, OY + y*ESC, m*ESC, .2*ESC);
    c.strokeStyle = 'rgba(170,225,255,.6)'; c.lineWidth = Math.max(2.5, ESC*.12); c.strokeRect(OX, OY, W*ESC, L*ESC);
    return;
  }
  /* el fondo de enfrente: 3 m de cristal y 1 m de malla; los laterales: cristal junto a los fondos y malla en el centro */
  dibujarPared(c, [0,0], [W,0], 0, PARED, 'cristal'); dibujarPared(c, [0,0], [W,0], PARED, ALT_FONDO, 'reja');
  for(const x of [0, W]){
    dibujarPared(c, [x,0], [x,REJA_Y0], 0, PARED, 'cristal');
    dibujarPared(c, [x,REJA_Y0], [x,REJA_Y1], 0, PARED, 'reja');
    dibujarPared(c, [x,REJA_Y1], [x,L], 0, PARED, 'cristal');
  }
}
function pintarFondo(){
  FONDO = document.createElement('canvas');
  FONDO.width = CV.width; FONDO.height = CV.height;
  const c = FONDO.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
  dibujarDecorado(c);
}
function dibujarRed(c){
  poli(c, [[-.1,RED_Y,0],[W+.1,RED_Y,0],[W+.1,RED_Y,RED_ALT],[-.1,RED_Y,RED_ALT]]);
  c.fillStyle = 'rgba(8,14,20,.42)'; c.fill();
  c.strokeStyle = 'rgba(255,255,255,.13)'; c.lineWidth = 1;
  for(let x = .3; x < W; x += .3) lineaP(c, [x, RED_Y, 0], [x, RED_Y, RED_ALT]);
  for(let z = .18; z < RED_ALT; z += .18) lineaP(c, [0, RED_Y, z], [W, RED_Y, z]);
  const s = proy(W/2, RED_Y, RED_ALT)[2];
  c.strokeStyle = '#F2F6F8'; c.lineWidth = Math.max(2, s*.07); lineaP(c, [0, RED_Y, RED_ALT], [W, RED_Y, RED_ALT]);
  c.strokeStyle = '#27343A'; c.lineWidth = Math.max(3, s*.11);
  lineaP(c, [-.12, RED_Y, 0], [-.12, RED_Y, RED_ALT + .06]); lineaP(c, [W + .12, RED_Y, 0], [W + .12, RED_Y, RED_ALT + .06]);
}
function dibujarCristalCercano(c){
  if(VISTA !== 'tv') return;
  poli(c, [[0,L,0],[W,L,0],[W,L,PARED],[0,L,PARED]]);
  c.fillStyle = 'rgba(160,215,255,.045)'; c.fill();
  c.strokeStyle = 'rgba(200,235,255,.42)'; c.lineWidth = 2; c.stroke();
}
/* Los jugadores, de cuerpo entero: piernas que corren, camiseta del equipo, brazo y pala que se mueven al pegar */
function dibujarFigura(c, j){
  const tv = VISTA === 'tv', pie = proy(j.x, j.y, 0), s = pie[2];
  const cadera = proy(j.x, j.y, .9), hombro = proy(j.x, j.y, 1.38), cabeza = proy(j.x, j.y, 1.66);
  c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.ellipse(pie[0], pie[1], s*.4, s*.4*(tv ? .42 : .6), 0, 0, Math.PI*2); c.fill();
  if(j.humano && alcanzable(j)){
    const dulce = P.bola.z > .45 && P.bola.z < 1.5;
    anilloSuelo(c, j.x, j.y, j.alcance*(dulce ? 1 + .04*Math.sin(P.t*30) : 1), dulce ? '#F5C542' : 'rgba(220,245,74,.9)', dulce ? 4 : 2.5);
  }
  const f = Math.hypot(j.vx, j.vy) > .4 ? Math.sin(P.t*15 + j.id) : 0;
  const pieA = proy(j.x - .13 + f*.1, j.y + f*.16, 0), pieB = proy(j.x + .13 - f*.1, j.y - f*.16, 0);
  c.lineCap = 'round'; c.strokeStyle = '#E6BF9A'; c.lineWidth = Math.max(2, s*.1);
  c.beginPath(); c.moveTo(cadera[0] - s*.08, cadera[1]); c.lineTo(pieA[0], pieA[1]); c.moveTo(cadera[0] + s*.08, cadera[1]); c.lineTo(pieB[0], pieB[1]); c.stroke();
  c.fillStyle = '#F4F6F8';
  for(const p of [pieA, pieB]){ c.beginPath(); c.ellipse(p[0], p[1], Math.max(1.5, s*.08), Math.max(1, s*.05), 0, 0, Math.PI*2); c.fill(); }
  const ancho = s*.44;
  c.fillStyle = '#1B2733'; rrect(c, cadera[0] - ancho*.46, cadera[1] - s*.14, ancho*.92, s*.26, s*.06); c.fill();
  c.fillStyle = j.color; rrect(c, hombro[0] - ancho/2, hombro[1] - s*.05, ancho, cadera[1] - hombro[1] + s*.02, s*.12); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1; c.stroke();
  /* la pala, en su mano derecha: de espaldas a cámara queda a la derecha; de frente, a la izquierda */
  const lado = j.lado === 0 ? 1 : -1, golpe = j.anim > 0 ? 1 - j.anim/.22 : 0;
  const ang = golpe > 0 ? .7 - golpe*2.9 : j.swing > 0 ? .75 : -.35;
  const hx = hombro[0] + lado*ancho*.46, hy = hombro[1] + s*.02, largo = s*.46;
  const mx = hx + lado*Math.cos(ang)*largo, my = hy + Math.sin(ang)*largo;
  c.strokeStyle = '#E6BF9A'; c.lineWidth = Math.max(2, s*.09); c.beginPath(); c.moveTo(hx, hy); c.lineTo(mx, my); c.stroke();
  const px = mx + lado*Math.cos(ang)*s*.2, py = my + Math.sin(ang)*s*.2;
  c.strokeStyle = '#0F1C22'; c.lineWidth = Math.max(2, s*.06); c.beginPath(); c.moveTo(mx, my); c.lineTo(px, py); c.stroke();
  c.fillStyle = '#0F1C22'; c.beginPath(); c.ellipse(px + lado*Math.cos(ang)*s*.12, py + Math.sin(ang)*s*.12, Math.max(3, s*.16), Math.max(2.5, s*.13), ang, 0, Math.PI*2); c.fill();
  c.strokeStyle = j.color; c.lineWidth = 1.5; c.stroke();
  const rc = Math.max(3, s*.13);
  c.fillStyle = '#E6BF9A'; c.beginPath(); c.arc(cabeza[0], cabeza[1], rc, 0, Math.PI*2); c.fill();
  c.fillStyle = j.lado === 0 ? '#0F2A22' : '#3A1414'; c.beginPath(); c.arc(cabeza[0], cabeza[1] - rc*.15, rc*1.02, Math.PI*1.05, Math.PI*1.95); c.fill();
  if(j.humano){
    c.fillStyle = '#DCF54A'; c.font = `900 ${Math.max(10, s*.36)}px Inter, system-ui, sans-serif`; c.textAlign = 'center';
    c.fillText('TÚ', cabeza[0], cabeza[1] - rc - 4);
  }
}
function dibujarBola(c){
  const b = P.bola; if(!b) return;
  if(P.estado === 'juego' && b.golpeo === 1 && PREF.asistencia){
    const cae = P.prediccion.find(s => s.botes >= 1 && s.t > P.t - P.tGolpe);
    if(cae && ladoDe(cae.y) === 0) anilloSuelo(c, cae.x, cae.y, .42, 'rgba(220,245,74,.5)', 2);
  }
  const sb = proy(b.x, b.y, 0);
  c.fillStyle = `rgba(0,0,0,${clamp(.4 - b.z*.08, .08, .4)})`;
  c.beginPath(); c.ellipse(sb[0], sb[1], Math.max(3, sb[2]*.14), Math.max(2, sb[2]*.14*(VISTA === 'tv' ? .45 : .6)), 0, 0, Math.PI*2); c.fill();
  b.rastro.forEach((p, i) => { const q = proy(p.x, p.y, p.z); c.fillStyle = `rgba(220,245,74,${(i/b.rastro.length)*.28})`; c.beginPath(); c.arc(q[0], q[1], Math.max(2, q[2]*.09), 0, Math.PI*2); c.fill(); });
  const q = proy(b.x, b.y, b.z), r = Math.max(4, q[2]*.15);
  const gr = c.createRadialGradient(q[0] - r*.35, q[1] - r*.35, r*.1, q[0], q[1], r);
  gr.addColorStop(0, '#FBFFD0'); gr.addColorStop(.55, b.porTres ? '#FFE27A' : '#DCF54A'); gr.addColorStop(1, b.porTres ? '#C9A12E' : '#8FA82A');
  c.fillStyle = gr; c.beginPath(); c.arc(q[0], q[1], r, 0, Math.PI*2); c.fill();
}
function dibujar(){
  if(!hayDOM || !CX || !P) return;
  const c = CX;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  if(!FONDO) pintarFondo();
  c.drawImage(FONDO, 0, 0, innerWidth, innerHeight);
  c.save();
  const s = Efectos.shake; if(s > .3) c.translate(rnd(-s, s)*.7, rnd(-s, s)*.7);
  /* de lejos a cerca: lo que está detrás de la red, la red y lo de delante */
  const cosas = P.jug.map(j => ({ y:j.y, pinta: () => dibujarFigura(c, j) })).concat([{ y:P.bola.y + .01, pinta: () => dibujarBola(c) }]).sort((a, b) => a.y - b.y);
  for(const o of cosas) if(o.y < RED_Y) o.pinta();
  dibujarRed(c);
  for(const o of cosas) if(o.y >= RED_Y) o.pinta();
  dibujarCristalCercano(c);
  for(const p of Efectos.particulas){
    const a = p.vida / p.max;
    c.globalAlpha = a;
    if(p.texto){ const q = proy(p.x, p.y, 2.2); c.fillStyle = p.color; c.font = `900 ${Math.max(13, q[2]*.55)}px Inter, system-ui, sans-serif`; c.textAlign = 'center'; c.fillText(p.texto, q[0], q[1] - (1-a)*24); continue; }
    if(p.anillo){
      if(p.pared){ const q = proy(p.x, p.y, p.z); c.strokeStyle = p.color; c.lineWidth = 2.5; c.beginPath(); c.arc(q[0], q[1], (p.r0 + (p.r1 - p.r0)*(1 - a))*q[2], 0, Math.PI*2); c.stroke(); }
      else anilloSuelo(c, p.x, p.y, p.r0 + (p.r1 - p.r0)*(1 - a), p.color, 2.5);
    } else { const q = proy(p.x, p.y, p.z != null ? p.z : .6); c.fillStyle = p.color; c.beginPath(); c.arc(q[0], q[1], Math.max(1.5, q[2]*.07), 0, Math.PI*2); c.fill(); }
  }
  c.globalAlpha = 1;
  c.restore();
}
'''
m3 = tramo(m3, "let CV = null, CX = null, ESC = 20, OX = 0, OY = 0, DPR = 1;", "\nfunction textoPuntos(", DIBUJO, 'm3')
m3 = tramo(m3, "function actualizarHUD(){", "let avisoTimer = null;", r'''function actualizarHUD(){
  if(!hayDOM || !P) return;
  $('#jgYo').textContent = P.juegos[0]; $('#jgEl').textContent = P.juegos[1];
  $('#ptYo').textContent = P.tb ? P.puntos[0] : NOM_PUNTO[Math.min(P.puntos[0], 3)]; $('#ptEl').textContent = P.tb ? P.puntos[1] : NOM_PUNTO[Math.min(P.puntos[1], 3)];
  const saca = P.sacaAhora != null ? P.sacaAhora : P.sacaLado;
  $('#sacaYo').classList.toggle('on', saca === 0); $('#sacaEl').classList.toggle('on', saca === 1);
  const rot = $('#rotuloP'), esOro = !P.tb && P.puntos[0] === 3 && P.puntos[1] === 3;
  const txt = [P.cfg.rotulo, P.tb ? 'TIE-BREAK' : esOro ? 'PUNTO DE ORO' : '', P.saqueN === 2 && P.estado === 'saque' ? '2º SAQUE' : ''].filter(Boolean).join(' · ');
  rot.textContent = txt;
  rot.style.display = txt && P.estado !== 'fin' ? 'block' : 'none';
}
''', 'm3')
m3 = rep(m3, "const ERRORES_PUNTO = ['A la red', 'No pasa la red', 'Fuera', 'Pared directa', 'Pared en su campo', 'Falta de saque'];",
         "const ERRORES_PUNTO = ['A la red', 'No pasa la red', 'Fuera', 'Pared directa', 'Pared en su campo', 'Falta de saque', 'Doble falta', 'Reja directa', 'Saque a la reja'];", 'm3')
m3 = rep(m3, "  return Object.assign({ id, lado, carril, humano,", "  return Object.assign({ id, lado, carril, carrilBase:carril, humano,", 'm3')
m3 = rep(m3, "juegosGanar: cfg.juegos || 3,\n", "juegosGanar: cfg.juegos || 3, set: (cfg.juegos || 3) >= 6 && !M, tb:false, tbSaca:0, acabado:false, saqueN:1, sacaAhora:null,\n", 'm3')
m3 = tramo(m3, "function prepararSaque(){", "function consejo(){", r'''function prepararSaque(repite){
  if(!repite) P.saqueN = 1;
  /* quién saca: por juegos; en el tie-break, uno el primero y luego de dos en dos */
  const n = P.puntos[0] + P.puntos[1];
  let lado = P.sacaLado, idx = Math.floor((P.juegos[0] + P.juegos[1]) / 2) % 2;
  if(P.tb){ const k = Math.floor((n + 1)/2); lado = k % 2 === 0 ? P.tbSaca : 1 - P.tbSaca; idx = Math.floor(k/2) % 2; }
  const equipo = P.jug.filter(j => j.lado === lado), servidor = equipo[idx], companero = equipo[1 - idx];
  /* se saca cruzado y alternando lado (el primer punto, desde la derecha): el que saca y su pareja se cruzan */
  const derecha = n % 2 === 0, xSaque = (lado === 0) === derecha ? 7.3 : 2.7, xResto = W - xSaque;
  servidor.carril = xSaque > W/2 ? 'der' : 'izq'; companero.carril = xSaque > W/2 ? 'izq' : 'der';
  for(const j of P.jug) if(j.lado !== lado) j.carril = j.carrilBase;
  P.saqueDe = servidor.id; P.sacaAhora = lado;
  for(const j of P.jug){
    j.x = j.carril === 'izq' ? 2.7 : 7.3;
    if(j.lado === lado) j.y = j === servidor ? (lado === 0 ? 17.4 : 2.6) : (lado === 0 ? 12.8 : 7.2);
    else j.y = Math.abs(j.x - xResto) < 1 ? (j.lado === 0 ? 18.1 : 1.9) : (j.lado === 0 ? 15.6 : 4.4);   // resta al fondo; su pareja, más adelante
    j.vx = j.vy = 0; j.swing = 0; j.cd = 0; j.anim = 0;
  }
  P.bola = Object.assign(nuevaBola(), { x:servidor.x + (lado === 0 ? .3 : -.3), y:servidor.y + (lado === 0 ? -.35 : .35), z:.5 });
  P.estado = 'saque'; P.rally = 0; P.prediccion = [];
  P.timer = servidor.humano && !P.humanoIA ? 2.2 : .8;
  actualizarHUD();
  const teclaGolpe = hayDOM && matchMedia('(hover:hover) and (pointer:fine)').matches ? ' (' + nombreTecla(teclasActuales().golpe) + ')' : '';
  mostrarAyuda(servidor.humano && !P.humanoIA ? (P.saqueN === 2 ? 'Segundo saque: pulsa GOLPE' : 'Te toca sacar: pulsa GOLPE') + teclaGolpe
                                              : (P.puntosJugados < 6 && !PREF.tutorial ? consejo() : ''));
}
''', 'm3')
m3 = tramo(m3, "function consejo(){", "function finPunto(", r'''function consejo(){
  return ['Muévete y pulsa GOLPE justo antes de que la bola llegue a tu anillo',
          'Bola alta cerca de la red: REMATE. Si sale perfecto, ¡por 3 o por 4!',
          'Si los dos rivales están en la red: GLOBO por encima',
          'Cuidado con la malla del lateral: frena la bola y la desvía',
          'Si están atrás y tú en la red: DEJADA',
          'Bandeja y víbora van cortadas: botan bajo y mueren en el cristal'][P.puntosJugados % 6];
}
''', 'm3')
m3 = tramo(m3, "function finPunto(", "function actualizar(", r'''function finPunto(ganador, motivo, extra){
  const yo = ganador === 0, oro = !P.tb && P.puntos[0] === 3 && P.puntos[1] === 3, st = P.stats, g = P.bola.golpeador;
  P.estado = 'punto'; P.timer = PAUSA_PUNTO; P.puntosJugados++;
  st.rallyMax = Math.max(st.rallyMax, P.rally); st.puntosJ++; if(yo) st.puntosG++;
  if(g != null && ERRORES_PUNTO.includes(motivo) && P.jug[g].lado !== ganador){ if(g === 1) st.erroresPareja++; if(g === 0) st.erroresTuyos++; }
  if(extra.porTres && yo) st.porTres++;
  if(oro){ st.orosJ++; if(yo) st.orosG++; }
  P.puntos[ganador]++;
  let sub = oro ? 'PUNTO DE ORO' : '';
  if(P.momento){
    if(P.puntos[ganador] >= 4){ P.finMomento = ganador; sub = yo ? '¡EL PARTIDO ES VUESTRO!' : 'SE ESCAPA EL PARTIDO'; }
    else sub = textoPuntos(P.puntos);
  } else if(P.tb){
    const a = P.puntos[ganador], o = P.puntos[1 - ganador];
    if(a >= 7 && a - o >= 2){ P.juegos[ganador]++; P.tb = false; P.acabado = true; sub = yo ? '¡SET Y PARTIDO!' : 'SE ACABÓ'; }
    else sub = `TIE-BREAK · ${P.puntos[0]}-${P.puntos[1]}`;
  } else if(P.puntos[ganador] >= 4){
    P.juegos[ganador]++; P.puntos = [0, 0]; P.sacaLado = 1 - P.sacaLado;
    const a = P.juegos[ganador], o = P.juegos[1 - ganador];
    sub = `JUEGO PARA ${yo ? 'VOSOTROS' : 'ELLOS'} · ${P.juegos[0]}-${P.juegos[1]}`;
    if(P.set){
      if((a >= 6 && a - o >= 2) || a >= 7){ P.acabado = true; sub = yo ? '¡SET Y PARTIDO!' : 'SE ACABÓ'; }
      else if(a === 6 && o === 6){ P.tb = true; P.tbSaca = P.sacaLado; sub = '6-6 · ¡TIE-BREAK A 7!'; }
    } else if(a >= P.juegosGanar){ P.acabado = true; sub = yo ? '¡PARTIDO!' : 'SE ACABÓ'; }
  }
  mostrarAviso(motivo, sub, yo ? '#DCF54A' : '#FF8A7A', PAUSA_PUNTO);
  mostrarAyuda('');
  Sonido.punto(yo); if(extra.porTres || oro || P.finMomento !== null || P.acabado) Sonido.grada();
  Efectos.sacudir(extra.porTres ? 12 : 3);
  if(yo && (/Por|Dejada|Remate|Víbora|Doble bote|Ace/.test(motivo) || P.finMomento === 0)){ P.lento = .45; Efectos.confeti(); }
  actualizarHUD();
}
/* Falta en el primer saque: se saca otra vez, con el segundo. El saque que toca la red y entra es let: se repite igual */
function faltaSaque(motivo){
  P.estado = 'falta'; P.timer = .95; P.saqueN = 2;
  if(P.jug[P.saqueDe] && P.jug[P.saqueDe].humano) P.stats.faltas = (P.stats.faltas || 0) + 1;
  mostrarAviso('FALTA', (motivo === 'Falta de saque' ? 'Fuera del cuadro' : motivo) + ' · segundo saque', '#F5C542', .95);
  mostrarAyuda('');
  actualizarHUD();
}
function repetirSaque(){
  P.bola.viva = false;
  P.estado = 'falta'; P.timer = .85;
  mostrarAviso('LET', 'Tocó la red y entró: se repite el saque', '#7FD3F7', .85);
  return 'fin';
}
''', 'm3')
m3 = tramo(m3, "function actualizar(dt){", "let ULTIMA_PISTA", r'''function actualizar(dt){
  if(!P || P.pausa || P.estado === 'fin') return;
  P.t += dt; if(P.timer > 0) P.timer -= dt;
  if(P.estado === 'punto' || P.estado === 'falta'){
    Input.accion = null;
    for(const j of P.jug){ j.vx *= .9; j.vy *= .9; aplicarMovimiento(j, dt); if(j.anim > 0) j.anim -= dt; }
    if(P.timer <= 0){
      if(P.estado === 'falta') prepararSaque(true);
      else if(P.momento) (P.finMomento !== null ? terminarPartidoPista : prepararSaque)();
      else if(P.acabado) terminarPartidoPista();
      else prepararSaque();
    }
  } else if(P.estado === 'saque'){
    const s = P.jug[P.saqueDe];
    P.bola.z = .08 + Math.abs(Math.sin(P.t*4.4))*.62;           // bota la bola antes de sacar, como manda el reglamento
    if(s.humano && !P.humanoIA){ if(Input.accion || P.timer <= 0){ Input.accion = null; mostrarAyuda(''); sacar(s, .8 + .2*Math.random()); } }
    else if(P.timer <= 0){ mostrarAyuda(''); sacar(s, clamp(s.hab + .15 + gauss()*.08, .3, 1)); }
  } else {
    for(const j of P.jug) (j.humano ? actualizarHumano : actualizarIA)(j, dt);
    actualizarBola(dt);
  }
  Efectos.actualizar(dt);
}
''', 'm3')
m3 = rep(m3, "  else {\n    for(let g = 0; jg[0] < N && jg[1] < N && g < 500; g++){\n      if(Math.random() < pr) pu[0]++; else pu[1]++;\n"
             "      if(pu[0] >= 4 || pu[1] >= 4){ jg[pu[0] >= 4 ? 0 : 1]++; pu[0] = pu[1] = 0; }\n    }\n    gano = jg[0] > jg[1];\n  }",
         "  else {\n    let tb = P.tb, fin = P.acabado;\n    for(let g = 0; !fin && g < 2000; g++){\n      if(Math.random() < pr) pu[0]++; else pu[1]++;\n"
         "      const w = pu[0] > pu[1] ? 0 : 1;\n"
         "      if(tb){ if(pu[w] >= 7 && pu[w] - pu[1-w] >= 2){ jg[w]++; fin = true; } continue; }\n"
         "      if(pu[w] < 4) continue;\n"
         "      jg[w]++; pu[0] = pu[1] = 0;\n"
         "      if(P.set){ const a = jg[w], o = jg[1-w]; if((a >= 6 && a - o >= 2) || a >= 7) fin = true; else if(a === 6 && o === 6) tb = true; }\n"
         "      else if(jg[w] >= N) fin = true;\n    }\n    gano = jg[0] > jg[1];\n  }", 'm3')
m3 = rep(m3, "${P.momento ? textoPuntos(P.puntos) : P.juegos[0] + ' – ' + P.juegos[1]}",
         "${P.momento ? textoPuntos(P.puntos) : P.juegos[0] + ' – ' + P.juegos[1] + (P.tb ? ' · TB ' + P.puntos[0] + '-' + P.puntos[1] : '')}", 'm3')
m3 = rep(m3, "${P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : 'A ' + P.juegosGanar + ' juegos'}",
         "${P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : P.set ? 'Un set a 6 juegos, con tie-break a 7 si llegáis a 6-6' : 'A ' + P.juegosGanar + ' juegos'}", 'm3')
m3 = rep(m3, "  CX.setTransform(DPR, 0, 0, DPR, 0, 0); CX.fillStyle = '#051012'; CX.fillRect(0, 0, innerWidth, innerHeight);\n  dibujarPista(CX);",
         "  CX.setTransform(DPR, 0, 0, DPR, 0, 0);\n  if(!FONDO) pintarFondo();\n  CX.drawImage(FONDO, 0, 0, innerWidth, innerHeight); dibujarRed(CX); dibujarCristalCercano(CX);", 'm3')
escribir('c-motor3.js', m3)

# ═════════════ vistas y carrera ═════════════
v = leer('c-vistas.js')
v = tramo(v, "function segJuegos(){", "\n}\n", "function segJuegos(){\n"
          "  return `<div class=\"seg\">${[[2,'2'],[3,'3'],[4,'4'],[6,'SET']].map(([n, t])=>`<button class=\"${PREF.juegos===n?'on':''}\" onclick=\"PREF.juegos=${n};guardarPref();render()\">${t}</button>`).join('')}</div>`;", 'v')
v = rep(v, "    <p class=\"muted\" style=\"margin:7px 0 0\">${difActual().d}</p></div>\n\n  <div class=\"card\"><div class=\"eyebrow\">📱 EN EL MÓVIL</div>",
        "    <p class=\"muted\" style=\"margin:7px 0 0\">${difActual().d}</p></div>\n\n"
        "  <div class=\"card\"><div class=\"eyebrow\">📺 VISTA DE LA PISTA</div><div style=\"height:7px\"></div>\n"
        "    ${segPref('vista', [['tv','COMO EN LA TELE'],['arriba','DESDE ARRIBA']], true)}\n"
        "    <p class=\"muted\" style=\"margin:7px 0 0\">${PREF.vista === 'arriba' ? 'La de siempre: toda la pista de un vistazo.' : 'Cámara detrás de tu fondo, con perspectiva, pista azul, cristales y malla. La más realista.'}</p></div>\n\n"
        "  <div class=\"card\"><div class=\"eyebrow\">📏 REGLAS COMO EN EL CIRCUITO</div>\n"
        "    <p class=\"muted\" style=\"margin:4px 0 0\">Se saca por debajo de la cintura, cruzado y alternando lado en cada punto: el que saca y su pareja se cambian. Con la primera falta hay <b style=\"color:var(--text)\">segundo saque</b>; si la bola toca la red y entra, es <b style=\"color:var(--text)\">let</b>. "
        "Lo cortado (bandeja, víbora, volea) bota bajo y muere en el cristal; lo liftado corre. La <b style=\"color:var(--text)\">malla</b> del centro de los laterales frena la bola y la desvía. "
        "Remate que sale por el lateral: <b style=\"color:var(--text)\">por 3</b>; por encima del fondo (4 m): <b style=\"color:var(--text)\">por 4</b>. En el partido rápido puedes jugar un <b style=\"color:var(--text)\">set entero con tie-break</b>.</p></div>\n\n"
        "  <div class=\"card\"><div class=\"eyebrow\">📱 EN EL MÓVIL</div>", 'v')
v = rep(v, "<b>Partido rápido</b><span>Juegos para ganar</span>", "<b>Partido rápido</b><span>A cuántos juegos, o un set entero con tie-break</span>", 'v')
v = rep(v, "si es perfecto se va por 3.", "si es perfecto se va por 3 (lateral) o por 4 (fondo).", 'v')
escribir('c-vistas.js', v)

c = leer('c-carrera.js')
c = rep(c, "subtitulo: `a ${PREF.juegos || 3} juegos · juegan a ${arq.nom}`",
        "subtitulo: `${(PREF.juegos || 3) >= 6 ? 'un set con tie-break' : 'a ' + (PREF.juegos || 3) + ' juegos'} · juegan a ${arq.nom}`", 'c')
escribir('c-carrera.js', c)
print('patch11: pádel más realista')
