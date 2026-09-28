
/* ═══════════════════════════════════════════════════════════════
   EFECTOS · DIBUJO · MARCADOR
   ═══════════════════════════════════════════════════════════════ */
const Efectos = {
  particulas:[], shake:0,
  reset(){ this.particulas = []; this.shake = 0; },
  golpe(x, y, tipo, cal){
    const z = P && P.bola ? P.bola.z : .9, fuerte = tipo === 'remate' || tipo === 'vibora' || tipo === 'plano', n = fuerte ? 16 : 6;
    for(let i = 0; i < n; i++) this.particulas.push({ x, y, z, vx:rnd(-2.5,2.5), vy:rnd(-2.5,2.5), vida:.35, max:.35, color: fuerte ? '#F5C542' : '#DCF54A' });
    this.particulas.push({ x, y, z, pared:true, anillo:true, vida:.25, max:.25, r0:.15, r1: fuerte ? 1.1 : .6, color: fuerte ? '#F5C542' : 'rgba(255,255,255,.7)' });
    if(fuerte) this.sacudir(6);
  },
  bote(x, y){ this.particulas.push({ x, y, anillo:true, vida:.3, max:.3, r0:.1, r1:.6, color:'rgba(255,255,255,.55)' }); },
  cristal(x, y, z){ this.particulas.push({ x, y, z: z == null ? 1 : z, pared:true, anillo:true, vida:.4, max:.4, r0:.15, r1:.8, color:'#7FD3F7' }); this.sacudir(2); },
  reja(x, y, z){ this.particulas.push({ x, y, z: z == null ? 1 : z, pared:true, anillo:true, vida:.35, max:.35, r0:.1, r1:.55, color:'#C9D3DC' }); this.sacudir(1); },
  sacudir(m){ this.shake = Math.max(this.shake, m); },
  confeti(){ for(let i = 0; i < 40; i++) this.particulas.push({ x:rnd(1,9), y:rnd(11,19), z:rnd(.8,2.2), vx:rnd(-1.5,1.5), vy:rnd(-3,-.5), vida:rnd(.7,1.2), max:1.2, color:pick(['#DCF54A','#22D3A5','#F5C542','#7FD3F7']) }); },
  texto(x, y, t, color){ this.particulas.push({ x, y, texto:t, vida:.85, max:.85, color }); },
  actualizar(dt){
    for(const p of this.particulas){ p.vida -= dt; if(!p.anillo && !p.texto){ p.x += p.vx*dt; p.y += p.vy*dt; } }
    this.particulas = this.particulas.filter(p => p.vida > 0);
    this.shake *= Math.pow(.02, dt);
  },
};

/* ── La cámara ──
   Como en la tele: detrás y por encima de tu fondo, con perspectiva (lo de lejos se ve más pequeño y los
   cristales y la malla se levantan). También se puede ver desde arriba, como antes.
   proy(x, y, z) → [X, Y, s]: el punto en pantalla y cuántos píxeles mide un metro a esa distancia. */
let CV = null, CX = null, DPR = 1, VISTA = 'tv', CAM = null, FONDO = null, ESC = 20, OX = 0, OY = 0;
const ANG_TV = 52*Math.PI/180, ANG_TV_MIN = 40*Math.PI/180, DIST_TV = 27;
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
    /* la cámara baja en pantallas anchas: así la pista llena el ancho y no queda todo pared */
    const caja = ang => {
      CAM = { cos:Math.cos(ang), sin:Math.sin(ang), yc: 10.6 + DIST_TV*Math.cos(ang), hc: DIST_TV*Math.sin(ang), F:1, cx:0, cy:0 };
      const pts = [[-.5,0,ALT_FONDO+1],[W+.5,0,ALT_FONDO+1],[-.3,L,0],[W+.3,L,0],[-.3,L,PARED],[W+.3,L,PARED]].map(p => proyTV(p[0], p[1], p[2]));
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      return { x0:Math.min(...xs), x1:Math.max(...xs), y0:Math.min(...ys), y1:Math.max(...ys) };
    };
    let mejor = null;
    for(let g = ANG_TV; g >= ANG_TV_MIN - 1e-6; g -= Math.PI/180){
      const b = caja(g), F = Math.min((w - 12)/(b.x1 - b.x0), Ha/(b.y1 - b.y0));
      if(!mejor || F > mejor.F + 1e-4) mejor = { g, F };
    }
    const b = caja(mejor.g);
    CAM.F = mejor.F;
    CAM.cx = (w - (b.x0 + b.x1)*CAM.F)/2; CAM.cy = arriba + (Ha - (b.y0 + b.y1)*CAM.F)/2;
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
    /* reflejos de los focos en el cristal */
    const qs = [proy(a[0], a[1], z0), proy(b[0], b[1], z0), proy(b[0], b[1], z1), proy(a[0], a[1], z1)], xs = qs.map(q => q[0]), ys = qs.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = Math.max(3, (x1 - x0)*.06);
    for(const f of [.2, .58]){ c.beginPath(); c.moveTo(x0 + (x1 - x0)*f, y1); c.lineTo(x0 + (x1 - x0)*(f + .22), y0); c.stroke(); }
    c.restore();
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
  publicoAnimado(c);
  ledMarcador(c);
  if(P.drill) dibujarZonaDrill(c);
  if(P.apunte && P.estado === 'juego') dibujarApunte(c);
  c.save();
  const s = Efectos.shake; if(s > .3) c.translate(rnd(-s, s)*.7, rnd(-s, s)*.7);
  /* de lejos a cerca: lo que está detrás de la red, la red y lo de delante */
  const cosas = P.jug.filter(j => !j.inactivo).map(j => ({ y:j.y, pinta: () => dibujarFigura(c, j) })).concat([{ y:P.bola.y + .01, pinta: () => dibujarBola(c) }]).sort((a, b) => a.y - b.y);
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

function textoPuntos(p){ return p[0] >= 3 && p[1] >= 3 ? '40-40' : NOM_PUNTO[Math.min(3, p[0])] + '-' + NOM_PUNTO[Math.min(3, p[1])]; }
function actualizarHUD(){
  if(!hayDOM || !P) return;
  $('#nomYo').textContent = P.equipos[0]; $('#nomEl').textContent = P.equipos[1];
  const sets = P.marcadorSets || [];
  $('#setsYo').innerHTML = sets.map(s => `<i class="${s[0] > s[1] ? 'g' : ''}">${s[0]}</i>`).join('');
  $('#setsEl').innerHTML = sets.map(s => `<i class="${s[1] > s[0] ? 'g' : ''}">${s[1]}</i>`).join('');
  if(P.drill){
    const d = P.drill;
    $('#jgYo').textContent = d.aciertos; $('#jgEl').textContent = d.intentos - d.aciertos; $('#ptYo').textContent = '✓'; $('#ptEl').textContent = '✗';
    $('#sacaYo').classList.remove('on'); $('#sacaEl').classList.remove('on');
    const rot = $('#rotuloP'); rot.textContent = `🎯 ${DRILLS[d.id].nom.toUpperCase()} · ${Math.min(d.intentos + 1, d.total)}/${d.total} · OBJETIVO ${d.objetivo}`; rot.style.display = 'block';
    return;
  }
  $('#jgYo').textContent = P.juegos[0]; $('#jgEl').textContent = P.juegos[1];
  $('#ptYo').textContent = P.tb ? P.puntos[0] : NOM_PUNTO[Math.min(P.puntos[0], 3)]; $('#ptEl').textContent = P.tb ? P.puntos[1] : NOM_PUNTO[Math.min(P.puntos[1], 3)];
  const saca = P.sacaAhora != null ? P.sacaAhora : P.sacaLado;
  $('#sacaYo').classList.toggle('on', saca === 0); $('#sacaEl').classList.toggle('on', saca === 1);
  const rot = $('#rotuloP'), esOro = !P.tb && P.puntos[0] === 3 && P.puntos[1] === 3;
  const txt = [P.cfg.rotulo, !P.momento && P.setsGanar === 2 ? `SET ${P.marcadorSets.length + 1} · ${P.setsG[0]}-${P.setsG[1]}` : '', P.tb ? 'TIE-BREAK' : esOro ? 'PUNTO DE ORO' : '', P.saqueN === 2 && P.estado === 'saque' ? '2º SAQUE' : ''].filter(Boolean).join(' · ');
  rot.textContent = txt;
  rot.style.display = txt && P.estado !== 'fin' ? 'block' : 'none';
}
let avisoTimer = null;
function mostrarAviso(t, sub, color, dur){
  if(!hayDOM) return;
  const a = $('#avisoP');
  a.innerHTML = `<span style="color:${color || '#fff'}">${t}</span>${sub ? `<small>${sub}</small>` : ''}`;
  a.classList.add('on'); clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => a.classList.remove('on'), (dur || 1.2)*1000);
}
function mostrarAyuda(t){ if(!hayDOM) return; const e = $('#ayudaP'); e.hidden = !t; if(t) e.textContent = t; }

/* ═══════════════════════════════════════════════════════════════
   EL PARTIDO EN LA PISTA
   Dos formatos: un partido corto a pocos juegos (el partido rápido) o un
   MOMENTO CLAVE de la carrera, un juego o un punto que decide el partido.
   Al terminar avisa a quien lo pidió con el resultado.
   ═══════════════════════════════════════════════════════════════ */
const ERRORES_PUNTO = ['A la red', 'No pasa la red', 'Fuera', 'Pared directa', 'Pared en su campo', 'Falta de saque', 'Doble falta', 'Reja directa', 'Saque a la reja'];
function crearJugador(id, lado, carril, humano, cfg){
  return Object.assign({ id, lado, carril, carrilBase:carril, humano, x: carril === 'izq' ? 2.7 : 7.3, y: lado === 0 ? 17.5 : 2.5, vx:0, vy:0,
    vel:5, alcance:1.3, hab:.6, reaccion:.18, agresivo:.5, globeador:.35, swing:0, cd:0, anim:0, pedido:'golpe', ultimoMov:-9, color:'#fff' }, cfg);
}
function iniciarPartidoPista(cfg){
  const carril = cfg.carril || 'izq', otro = carril === 'izq' ? 'der' : 'izq', H = cfg.humano, M = cfg.momento || null;
  P = { cfg, momento:M, finMomento:null, escena: cfg.escena || { tipo:'pabellon', gente:.8, ciudad:'' }, equipos: cfg.equipos || ['TÚ', 'RIVALES'], estado:'saque', t:0, tGolpe:0, timer:0, lento:0, juegosGanar: [3,4,6].includes(cfg.juegos) ? cfg.juegos : 3, setsGanar: cfg.sets === 3 ? 2 : 1, setsG:[0,0], marcadorSets:[],
        nJuego: M ? (M.juegos || [5,5])[0] + (M.juegos || [5,5])[1] : 0, set: !M, tb:false, tbSaca:0, acabado:false, saqueN:1, sacaAhora:null,
        puntos: M ? M.inicio.slice() : [0,0], juegos: M ? (M.juegos || [5,5]).slice() : [0,0], sacaLado: M ? M.saca : (Math.random() < .5 ? 0 : 1),
        saqueDe:0, saqueX:5, rally:0, prediccion:[], pausa:false, humanoIA: !!cfg.humanoIA, bola: nuevaBola(), sug:null, tSug:-1, puntosJugados:0,
        stats:{ golpes:0, globos:0, remates:0, bandejas:0, dejadas:0, paredes:0, porTres:0, rallyMax:0, orosJ:0, orosG:0, perfectos:0, puntosG:0, puntosJ:0,
                golpesPareja:0, erroresPareja:0, erroresTuyos:0 },
        jug:[
          crearJugador(0, 0, carril, true,  Object.assign({ color: aspectoJugador().camiseta, colorPala: aspectoJugador().pala, zurdo: zurdoActual(), diseno: aspectoJugador().diseno, palaDiseno: aspectoJugador().palaDiseno, zapas: aspectoJugador().zapas, banda: coloresBanda(aspectoJugador()) }, H, { alcance: H.alcance + (PREF.asistencia ? .1 : 0) })),
          crearJugador(1, 0, otro, false,   Object.assign({ color:'#9BE36B' }, cfg.pareja)),
          crearJugador(2, 1, 'izq', false,  Object.assign({ alcance:1.15, color:'#FF8A7A' }, cfg.rival)),
          crearJugador(3, 1, 'der', false,  Object.assign({ alcance:1.15, color:'#FFB29E' }, cfg.rival)),
        ] };
  Efectos.reset();
  if(cfg.drill){ P.drill = Object.assign({ intentos:0, aciertos:0 }, cfg.drill); P.jug[1].inactivo = true; P.jug[3].inactivo = true; P.jug[2].noGolpea = true; }
  if(hayDOM){ mostrarJuego(); mostrarAviso(cfg.titulo || '¡A JUGAR!', cfg.avisoSub || esc(cfg.subtitulo || ''), M ? '#F5C542' : '#FF8A7A', M ? 2.3 : 1.9); }
  if(P.drill){ P.estado = 'drillPausa'; P.timer = 1.7; actualizarHUD(); } else prepararSaque();
}
function prepararSaque(repite){
  if(!repite) P.saqueN = 1;
  /* quién saca: por juegos; en el tie-break, uno el primero y luego de dos en dos */
  const n = P.puntos[0] + P.puntos[1];
  let lado = P.sacaLado, idx = Math.floor(P.nJuego / 2) % 2;             // el turno de saque sigue de un set al otro
  if(P.tb){ const k = Math.floor((n + 1)/2); lado = k % 2 === 0 ? P.tbSaca : 1 - P.tbSaca; idx = (Math.floor(P.nJuego / 2) + Math.floor(k/2)) % 2; }
  const equipo = P.jug.filter(j => j.lado === lado), servidor = equipo[idx];
  /* se saca cruzado y alternando lado (el primer punto, desde la derecha). Cada uno conserva SIEMPRE su posición, drive
     o revés: si le toca sacar desde el otro lado, saca desde ahí y vuelve al suyo; su pareja le espera en la red, en su lado */
  const derecha = n % 2 === 0, xSaque = (lado === 0) === derecha ? 7.3 : 2.7, xResto = W - xSaque;
  for(const j of P.jug) j.carril = j.carrilBase;
  P.saqueDe = servidor.id; P.sacaAhora = lado;
  for(const j of P.jug){
    j.x = j === servidor ? xSaque : j.carril === 'izq' ? 2.7 : 7.3;
    if(j.lado === lado) j.y = j === servidor ? (lado === 0 ? 17.4 : 2.6) : (lado === 0 ? 12.8 : 7.2);
    else j.y = Math.abs(j.x - xResto) < 1 ? (j.lado === 0 ? 18.1 : 1.9) : (j.lado === 0 ? 15.6 : 4.4);   // resta al fondo; su pareja, más adelante
    j.vx = j.vy = 0; j.swing = 0; j.cd = 0; j.anim = 0; j.fuera = false;
  }
  P.bola = Object.assign(nuevaBola(), { x:servidor.x + (lado === 0 ? .3 : -.3), y:servidor.y + (lado === 0 ? -.35 : .35), z:.5 });
  P.estado = 'saque'; P.rally = 0; P.prediccion = [];
  P.timer = servidor.humano && !P.humanoIA ? 2.2 : .8;
  actualizarHUD();
  const teclaGolpe = hayDOM && matchMedia('(hover:hover) and (pointer:fine)').matches ? ' (' + nombreTecla(teclasActuales().golpe) + ')' : '';
  mostrarAyuda(servidor.humano && !P.humanoIA ? (P.saqueN === 2 ? 'Segundo saque: pulsa GOLPE' : 'Te toca sacar: pulsa GOLPE') + teclaGolpe
                                              : (P.puntosJugados < 6 && !PREF.tutorial ? consejo() : ''));
}
function consejo(){
  return ['Muévete y pulsa GOLPE justo antes de que la bola llegue a tu anillo',
          'Bola alta cerca de la red: REMATE. Si sale perfecto, ¡por 3 o por 4!',
          'Si los dos rivales están en la red: GLOBO por encima',
          'Cuidado con la malla del lateral: frena la bola y la desvía',
          'Si están atrás y tú en la red: DEJADA',
          'Bandeja y víbora van cortadas: botan bajo y mueren en el cristal'][P.puntosJugados % 6];
}
function finPunto(ganador, motivo, extra){
  if(P.drill){ finDrill(false, ganador === 1 && !ERRORES_PUNTO.includes(motivo) ? 'No llegaste' : motivo); return; }
  P.ultimoGanador = ganador;            // para que festejen
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
    if(a >= 7 && a - o >= 2){
      P.juegos[ganador]++; P.tb = false; P.puntos = [0, 0]; P.nJuego++;
      P.sacaLado = 1 - P.tbSaca;                // el set siguiente lo empieza sacando quien restó primero en el tie-break
      sub = cerrarSet(ganador);
    } else sub = `TIE-BREAK · ${P.puntos[0]}-${P.puntos[1]}`;
  } else if(P.puntos[ganador] >= 4){
    P.juegos[ganador]++; P.puntos = [0, 0]; P.sacaLado = 1 - P.sacaLado; P.nJuego++;
    const a = P.juegos[ganador], o = P.juegos[1 - ganador], N = P.juegosGanar;
    sub = `JUEGO PARA ${yo ? 'VOSOTROS' : 'ELLOS'} · ${P.juegos[0]}-${P.juegos[1]}`;
    if(a >= N && a - o >= 2) sub = cerrarSet(ganador);
    else if(a === N && o === N){ P.tb = true; P.tbSaca = P.sacaLado; sub = `${N}-${N} · ¡TIE-BREAK A 7!`; }
  }
  mostrarAviso(motivo, sub, yo ? '#DCF54A' : '#FF8A7A', PAUSA_PUNTO);
  mostrarAyuda('');
  Sonido.punto(yo);
  /* el público: aplaude los puntos buenos y los peloteos largos, y se viene arriba al final */
  if(P.finMomento !== null || P.acabado){ Sonido.ovacion(); P.fiesta = 2.6; }
  else if(extra.porTres || oro || P.rally >= 9 || /Por|Dejada|Remate|Víbora|Ace/.test(motivo) || sub.startsWith('SET')){ Sonido.grada(); P.fiesta = 1.5; }
  if(!P.momento && !P.acabado && (P.puntosJugados % 6 === 0 || sub.startsWith('SET'))) setTimeout(mostrarEstadistica, 700);   // datos de la tele entre puntos
  Efectos.sacudir(extra.porTres ? 12 : 3);
  if(yo && (/Por|Dejada|Remate|Víbora|Doble bote|Ace/.test(motivo) || P.finMomento === 0)){ P.lento = .45; Efectos.confeti(); }
  actualizarHUD();
}
/* Set terminado: si alguien llega a los sets que hacen falta se acaba el partido; si no, empieza otro */
function cerrarSet(ganador){
  const yo = ganador === 0, marcador = P.juegos.slice();
  P.marcadorSets.push(marcador); P.setsG[ganador]++;
  if(P.setsG[ganador] >= P.setsGanar){ P.acabado = true; return yo ? '¡PARTIDO PARA VOSOTROS!' : 'SE ACABÓ'; }
  P.juegos = [0, 0];
  return `SET PARA ${yo ? 'VOSOTROS' : 'ELLOS'} · ${marcador[0]}-${marcador[1]} · SETS ${P.setsG[0]}-${P.setsG[1]}`;
}
function formatoTexto(sets, juegos, corto){
  if(corto) return `${sets === 3 ? 'al mejor de 3 sets' : '1 set'} a ${juegos} juegos`;
  return `${sets === 3 ? 'Al mejor de 3 sets' : 'A 1 set'} de ${juegos} juegos, con 2 de ventaja y tie-break a 7 si llegáis a ${juegos}-${juegos}`;
}
function marcadorPartido(){
  return P.marcadorSets.map(s => s.join('-')).concat([P.juegos.join('-') + (P.tb ? ` (TB ${P.puntos[0]}-${P.puntos[1]})` : '')]).join(' · ');
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
function actualizar(dt){
  if(!P || P.pausa || P.estado === 'fin') return;
  P.t += dt; if(P.timer > 0) P.timer -= dt; if(P.fiesta > 0) P.fiesta -= dt;
  if(P.estado === 'punto' || P.estado === 'falta' || P.estado === 'drillPausa'){
    Input.accion = null;
    for(const j of P.jug){ j.vx *= .9; j.vy *= .9; aplicarMovimiento(j, dt); if(j.anim > 0) j.anim -= dt; }
    if(P.timer <= 0){
      if(P.estado === 'drillPausa'){ if(P.drill.intentos >= P.drill.total) terminarPartidoPista(); else prepararDrill(); }
      else if(P.estado === 'falta') prepararSaque(true);
      else if(P.momento) (P.finMomento !== null ? terminarPartidoPista : prepararSaque)();
      else if(P.acabado) terminarPartidoPista();
      else prepararSaque();
    }
  } else if(P.estado === 'saque'){
    const s = P.jug[P.saqueDe];
    P.bola.z = .08 + Math.abs(Math.sin(P.t*4.4))*.62;           // bota la bola antes de sacar, como manda el reglamento
    if(s.humano && !P.humanoIA){ if(Input.accion || P.timer <= 0){ Input.accion = null; mostrarAyuda(''); sacar(s, .8 + .2*Math.random()); } }
    else if(P.timer <= 0){ mostrarAyuda(''); sacar(s, clamp(s.hab + .15 + gauss()*.08, .3, 1)); }
  } else if(P.estado === 'salida'){
    actualizarSalida(dt);
  } else {
    for(const j of P.jug) if(!j.inactivo) (j.humano ? actualizarHumano : actualizarIA)(j, dt);
    actualizarBola(dt);
  }
  Efectos.actualizar(dt);
}
let ULTIMA_PISTA = null;     // las cifras del último partido en la pista
function terminarPartidoPista(){
  P.estado = 'fin'; ULTIMA_PISTA = P.stats;
  const res = { gano: P.drill ? P.drill.aciertos >= P.drill.objetivo : P.momento ? P.finMomento === 0 : P.setsG[0] > P.setsG[1], drill: P.drill ? Object.assign({}, P.drill) : null, sets: P.marcadorSets.slice(), juegos: P.juegos.slice(), puntos: P.puntos.slice(), stats: P.stats, simulado:false };
  const cb = P.cfg.alTerminar;
  if(!P.humanoIA && P.puntosJugados >= 3 && !PREF.tutorial){ PREF.tutorial = true; guardarPref(); }
  P = null;
  ocultarJuego();
  if(cb) cb(res);
}
/* Desde la pausa: lo que queda se decide con la misma probabilidad que la simulación */
function simularRestoPista(){
  if(!P) return;
  const pr = P.cfg.pPunto || .5, pu = P.puntos.slice(), jg = P.juegos.slice(), N = P.juegosGanar, st = P.stats, cb = P.cfg.alTerminar, M = P.momento;
  let gano, sets = [];
  if(M){ for(let g = 0; pu[0] < 4 && pu[1] < 4 && g < 50; g++){ if(Math.random() < pr) pu[0]++; else pu[1]++; } gano = pu[0] >= 4; }
  else {
    let tb = P.tb, fin = P.acabado;
    const sg = P.setsG.slice();
    sets = P.marcadorSets.slice();
    for(let g = 0; !fin && g < 6000; g++){
      if(Math.random() < pr) pu[0]++; else pu[1]++;
      const w = pu[0] > pu[1] ? 0 : 1;
      let setGanado = false;
      if(tb){ if(pu[w] < 7 || pu[w] - pu[1-w] < 2) continue; jg[w]++; tb = false; setGanado = true; }
      else { if(pu[w] < 4) continue; jg[w]++; const a = jg[w], o = jg[1-w]; if(a >= N && a - o >= 2) setGanado = true; else if(a === N && o === N) tb = true; }
      pu[0] = pu[1] = 0;
      if(setGanado){ sets.push(jg.slice()); sg[w]++; if(sg[w] >= P.setsGanar) fin = true; else jg[0] = jg[1] = 0; }
    }
    gano = sg[0] > sg[1];
  }
  P = null; if(hayDOM) $('#pausaP').hidden = true; ocultarJuego();
  if(cb) cb({ gano, sets, juegos: jg, puntos: pu, stats: st, simulado:true });
}

/* ── El bucle: física a 120 Hz, dibujo a lo que dé la pantalla ── */
let ultimoTs = 0, acumulado = 0;
function bucle(ts){
  if(!P || $('#juego').hidden) return;
  const dt = Math.min(.05, ultimoTs ? (ts - ultimoTs)/1000 : 0); ultimoTs = ts;
  if(!P.pausa){ if(P.lento > 0) P.lento -= dt; acumulado += dt; while(P && acumulado >= 1/120){ actualizar(P.lento > 0 ? 1/120*.35 : 1/120); acumulado -= 1/120; } }
  if(!P) return;
  dibujar();
  requestAnimationFrame(bucle);
}
function alternarPausa(){
  if(!P || P.estado === 'fin' || $('#juego').hidden) return;
  P.pausa = !P.pausa;
  const caja = $('#pausaP');
  caja.hidden = !P.pausa;
  if(P.pausa) caja.querySelector('.caja').innerHTML = `<div class="card">
      <div class="eyebrow">PAUSA${P.cfg.rotulo ? ' · ' + esc(P.cfg.rotulo) : ''}</div>
      <div class="title-xl" style="margin:6px 0 4px">${P.drill ? P.drill.aciertos + ' de ' + P.drill.intentos : P.momento ? textoPuntos(P.puntos) : marcadorPartido()}</div>
      <p class="muted" style="margin:0">${P.drill ? DRILLS[P.drill.id].como : P.momento ? 'Primero en llegar a 4 puntos se lleva el partido' : formatoTexto(P.setsGanar === 2 ? 3 : 1, P.juegosGanar)} · ${esc(P.cfg.subtitulo || '')}</p></div>
    <button class="btn" onclick="alternarPausa()">SEGUIR JUGANDO</button><div style="height:8px"></div>
    ${P.cfg.rapido ? '<button class="btn ghost" onclick="salirPista()">SALIR</button>'
                   : '<button class="btn ghost" onclick="simularRestoPista()">⏩ SIMULAR LO QUE QUEDA</button>'}
    <div class="card" style="margin-top:10px">${guiaGolpes(true)}</div>`;
}
function salirPista(){
  const eraEntreno = !!(P && P.drill);
  if(P) P.pausa = false;
  P = null; $('#pausaP').hidden = true; ocultarJuego();
  S.pantalla = eraEntreno ? 'entreno' : S.volverRapido || (S.j ? 'temporada' : 'inicio'); render();
}
let controlesListos = false;
function mostrarJuego(){
  if(!hayDOM) return;
  if(!controlesListos){ prepararControles(); controlesListos = true; }
  $('#juego').hidden = false; enPista(true);
  $('#pausaP').hidden = true; $('#editorP').hidden = true; $('#juego').classList.remove('editando');
  $('#hudP').style.visibility = ''; $('#bPausaP').hidden = false;
  $('#teclasP').innerHTML = textoTeclas();
  Input.accion = null; Input.ax = Input.ay = 0; Input.teclas.clear(); Input.joyId = null; $('#joyKnobP').style.transform = '';
  aplicarDisenoControles(); ajustarLienzo(); ultimoTs = 0; acumulado = 0; requestAnimationFrame(bucle);
}
function ocultarJuego(){
  if(!hayDOM) return;
  $('#juego').hidden = true; enPista(false);
  $('#avisoP').classList.remove('on'); mostrarAyuda('');
  const sp = $('#statP'); if(sp){ sp.classList.remove('on'); sp.hidden = true; }
  for(const b of document.querySelectorAll('#controlesP .accion')) b.classList.remove('sugerido', 'pulsado');
}

/* ═══════════════════════════════════════════════════════════════
   CONTROLES A TU GUSTO
   Lado del joystick, tamaño, transparencia y, si quieres, cada botón donde
   te quede cómodo: se arrastran sobre la pista y se guardan en el dispositivo.
   ═══════════════════════════════════════════════════════════════ */
const BASE_CONTROLES = { golpe:{r:18, b:12, t:98, f:13.5, i:24}, remate:{r:22, b:122, t:74, f:10.5, i:19}, globo:{r:126, b:6, t:72, f:10.5, i:19},
                         dejada:{r:110, b:94, t:64, f:9.5, i:16}, joy:{r:18, b:14, t:128} };
const EDITOR = { activo:false, arrastre:null };
function elementoControl(k){ return k === 'joy' ? $('#joyP') : $('#controlesP [data-accion="' + k + '"]'); }
function textoTeclas(){
  const t = teclasActuales(), k = c => `<kbd>${esc(nombreTecla(c))}</kbd>`;
  return `Mover <kbd>WASD</kbd> · Golpe ${k(t.golpe)} · Remate ${k(t.remate)} · Globo ${k(t.globo)} · Dejada ${k(t.dejada)} · Pausa ${k(t.pausa)}`;
}
function aplicarDisenoControles(){
  if(!hayDOM) return;
  const s = Math.min((PREF.tamBotones || 1) * Math.min(1, innerWidth/390), (innerWidth - 12)/344), zurdo = PREF.mano === 'zurdo', pos = PREF.posBotones;
  for(const k of Object.keys(BASE_CONTROLES)){
    const el = elementoControl(k), B = BASE_CONTROLES[k], t = Math.round(B.t*s), st = el.style;
    st.width = st.height = t + 'px';
    st.opacity = PREF.opacidad || 1;
    if(pos && pos[k]){
      st.left = `calc(${(pos[k].x*100).toFixed(2)}% - ${t/2}px)`; st.top = `calc(${(pos[k].y*100).toFixed(2)}% - ${t/2}px)`;
      st.right = st.bottom = 'auto';
    } else {
      const lado = (k === 'joy') !== zurdo ? 'left' : 'right';
      st[lado] = Math.round(B.r*s) + 'px'; st[lado === 'left' ? 'right' : 'left'] = 'auto'; st.top = 'auto';
      st.bottom = `calc(max(16px, env(safe-area-inset-bottom)) + ${Math.round(B.b*s)}px)`;
    }
    if(k !== 'joy'){ st.fontSize = (B.f*s).toFixed(1) + 'px'; el.querySelector('i').style.fontSize = Math.round(B.i*s) + 'px'; }
  }
  const knob = $('#joyKnobP'), kt = Math.round(54*s);
  knob.style.width = knob.style.height = kt + 'px'; knob.style.margin = `-${kt/2}px 0 0 -${kt/2}px`;
}
function posicionesActuales(){
  const out = {};
  for(const k of Object.keys(BASE_CONTROLES)){ const r = elementoControl(k).getBoundingClientRect(); out[k] = { x:(r.left + r.width/2)/innerWidth, y:(r.top + r.height/2)/innerHeight }; }
  return out;
}
function prepararArrastreEditor(){
  for(const k of Object.keys(BASE_CONTROLES)){
    const el = elementoControl(k);
    el.addEventListener('pointerdown', e => {
      if(!EDITOR.activo) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if(!PREF.posBotones) PREF.posBotones = posicionesActuales();
      EDITOR.arrastre = { k, id:e.pointerId, dx:e.clientX - (r.left + r.width/2), dy:e.clientY - (r.top + r.height/2) };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      const a = EDITOR.arrastre;
      if(!EDITOR.activo || !a || a.id !== e.pointerId) return;
      const t = el.offsetWidth;
      PREF.posBotones[k] = { x: clamp(e.clientX - a.dx, t/2 + 4, innerWidth - t/2 - 4)/innerWidth, y: clamp(e.clientY - a.dy, t/2 + 180, innerHeight - t/2 - 4)/innerHeight };
      aplicarDisenoControles();
    });
    const soltar = e => { if(EDITOR.arrastre && EDITOR.arrastre.id === e.pointerId){ EDITOR.arrastre = null; guardarPref(); } };
    el.addEventListener('pointerup', soltar); el.addEventListener('pointercancel', soltar);
  }
}
function dibujarFondoEditor(){
  if(!CX) return;
  CX.setTransform(DPR, 0, 0, DPR, 0, 0);
  if(!FONDO) pintarFondo();
  CX.drawImage(FONDO, 0, 0, innerWidth, innerHeight); dibujarRed(CX); dibujarCristalCercano(CX);
}
function abrirEditorControles(){
  if(!hayDOM) return;
  if(!controlesListos){ prepararControles(); controlesListos = true; }
  EDITOR.activo = true;
  $('#juego').hidden = false; $('#juego').classList.add('editando'); enPista(true);
  $('#hudP').style.visibility = 'hidden'; $('#bPausaP').hidden = true; $('#rotuloP').style.display = 'none'; $('#pausaP').hidden = true;
  $('#avisoP').classList.remove('on'); mostrarAyuda('');
  aplicarDisenoControles(); ajustarLienzo(); dibujarFondoEditor(); pintarEditor();
}
function pintarEditor(){
  const e = $('#editorP'); e.hidden = false;
  const tam = [[.85,'S'],[1,'M'],[1.2,'L']].map(([v, n]) => `<button class="${PREF.tamBotones===v?'on':''}" onclick="PREF.tamBotones=${v};guardarPref();aplicarDisenoControles();pintarEditor()">${n}</button>`).join('');
  e.querySelector('.caja').innerHTML = `<div class="card" style="margin:0">
    <div class="eyebrow">✋ MUEVE LOS CONTROLES</div>
    <p class="muted" style="margin:4px 0 8px">Arrastra el joystick y cada botón a donde te quede cómodo. Se guarda solo.</p>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b style="font-size:13px">Tamaño</b><div class="seg">${tam}</div></div>
    <div class="row" style="margin-top:9px"><button class="btn ghost sm" onclick="PREF.posBotones=null;guardarPref();aplicarDisenoControles()">RESTABLECER</button><button class="btn sm" onclick="cerrarEditorControles()">LISTO</button></div>
  </div>`;
}
function cerrarEditorControles(){
  EDITOR.activo = false; EDITOR.arrastre = null; guardarPref();
  $('#editorP').hidden = true; $('#juego').classList.remove('editando');
  $('#hudP').style.visibility = ''; $('#bPausaP').hidden = false;
  ocultarJuego(); render();
}
