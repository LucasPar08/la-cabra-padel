/* Más pruebas: entrenamiento con un jugador que pulsa bien, salida de pista forzada, historial con los top 40 y efecto del material */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.C = { salidas:0, devueltas:0, perdidas:0 };
eval(js + `;global.A = { get S(){ return S; }, get P(){ return P; }, get PREF(){ return PREF; }, Input, alcanzable, actualizar, empezarEntreno, partidoRapido, crearYEmpezar, torneosDelTrimestre,
  estadoTorneo, inscribirse, jugarRonda, simularMomento, elegirCasilla, cerrarCuadro, salirTorneo, render, comprarMaterial, probPartido, ratingDupla, rivalidades, STAT_KEYS, ARQUETIPOS };
const __is = intentarSalida; intentarSalida = function(b, r){ const x = __is(b, r); if(x) C.salidas++; return x; };
const __rs = resolverSalida; resolverSalida = function(){ __rs(); if(P && P.estado === 'juego' && P.bola.viva) C.devueltas++; else C.perdidas++; };`);
const errores = [];
try{
  /* 1) entrenamiento con la asistencia y un jugador que pulsa el botón que toca en el momento justo */
  const lin = [];
  for(const id of ['bandeja', 'remate', 'vibora', 'volea', 'pared', 'saque']){
    let tot = 0;
    for(let rep = 0; rep < 3; rep++){
      A.S.pantalla = 'entreno'; Object.assign(A.PREF, { tutorial:true, asistencia:true });
      A.empezarEntreno(id);
      let n = 0;
      while(A.P && n++ < 120*400){
        const P = A.P, yo = P.jug[0], b = P.bola;
        if(P.estado === 'saque') A.Input.accion = 'golpe';
        else if(P.estado === 'juego' && yo.swing <= 0 && A.alcanzable(yo)){
          const quiere = id === 'bandeja' ? b.z > 1.7 : id === 'remate' ? b.z > 1.9 : id === 'vibora' ? (b.z > 1.25 && b.z <= 1.75) : id === 'volea' ? b.botes === 0 : id === 'pared' ? (b.pared && b.botes >= 1) : true;
          if(quiere) A.Input.accion = id === 'vibora' || id === 'remate' ? 'remate' : 'golpe';
        }
        A.actualizar(1/120);
      }
      if(A.P){ errores.push('entrenamiento sin terminar ' + id); break; }
      tot += A.S.entreno.drill.aciertos;
    }
    lin.push(`${id} ${(tot/3).toFixed(1)}/10`);
  }
  console.log('1) entrenamiento, jugador que pulsa bien (media de 3): ' + lin.join(' · '));
  /* 2) salida de pista forzada: bola que bota y se va por el lateral, con tu pareja cerca de la puerta */
  for(let i = 0; i < 40; i++){
    A.S.pantalla = 'inicio'; A.partidoRapido(); const P = A.P; P.humanoIA = true; P.estado = 'juego';
    Object.assign(P.bola, { x:.9, y:14.2, z:3.2, vx:-7, vy:.6, vz:2, golpeo:1, botes:1, cruzo:true, viva:true, saque:false, porTres:true, golpeador:2 });
    P.jug[1].x = 2 + Math.random()*2; P.jug[1].y = 12 + Math.random()*3; P.jug[0].x = 7; P.jug[0].y = 17;
    let n = 0; const puntos = P.puntosJugados;
    while(A.P && n++ < 120*30 && A.P.puntosJugados === puntos) A.actualizar(1/120);
    if(A.P && A.P.puntosJugados === puntos) errores.push('la salida no terminó el punto');
    while(A.P) A.actualizar(1/120), n++;
  }
  console.log(`2) salida de pista forzada (40 bolas): ${C.salidas} salidas · ${C.devueltas} devueltas desde fuera · ${C.perdidas} no llegaron`);
  /* 3) historial con las parejas top: un P1 con ranking 12 */
  A.crearYEmpezar();
  const S = A.S, j = S.j;
  for(const k of A.STAT_KEYS) j.stats[k] = 84; j.ranking = 12; j.edad = 25;
  for(let t = 0; t < 3; t++){
    const ev = Object.assign({}, A.torneosDelTrimestre()[0], { t:'P1', id:'p1-' + t, nom:'P1 de prueba ' + t });
    S.verTorneo = ev; S.pantalla = 'torneo'; S.torneo = null; A.render(); A.inscribirse();
    let g = 0;
    while(S.torneo && !S.torneo.fin && g++ < 40){ if(S.pantalla === 'torneo') A.jugarRonda(); else if(S.pantalla === 'momento') A.simularMomento(); else break; }
    A.salirTorneo(); S.trim.jugados = [];
  }
  const h = Object.values(j.h2h || {});
  console.log(`3) historial: ${h.length} parejas top con historial · ${h.reduce((a, e) => a + e.g + e.p, 0)} partidos · rivalidades: ${A.rivalidades(j).map(r => r.n + ' ' + r.g + '-' + r.p).join(', ') || 'todavía ninguna'}`);
  S.pantalla = 'ranking'; A.render();
  /* 4) material contra una pareja de vuestro nivel */
  j.dinero = 60000;
  const ev = { t:'FIP2', pista:'indoor' }, igual = () => ({ rating: A.ratingDupla(j, 'indoor', ev), arq: A.ARQUETIPOS[0] });
  const antes = A.probPartido(j, igual(), ev);
  A.comprarMaterial('carbono'); A.comprarMaterial('ligeras');
  const despues = A.probPartido(j, Object.assign(igual(), { rating: igual().rating - 1.9 }), ev);
  console.log(`4) material: contra una pareja de vuestro nivel, ${antes}% sin material → ${despues}% con pala de carbono y zapatillas pro`);
}catch(e){ errores.push((e.stack || e.message).split('\n').slice(0, 4).join(' | ')); }
console.log(errores.length ? '⚠️ ' + errores.join('\n   ') : '✅ sin errores');
