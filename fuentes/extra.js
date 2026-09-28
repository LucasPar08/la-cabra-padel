/* Pruebas de lo nuevo: entrenamiento, salida de pista, partido entero en la pista, ranking con historial,
   pareja por torneo, material y que todas las pantallas se pinten */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.C = { salidas:0, devueltas:0 };
eval(js + `;global.A = { get S(){ return S; }, get P(){ return P; }, get PREF(){ return PREF; }, actualizar, empezarEntreno, partidoRapido, crearYEmpezar, torneosDelTrimestre, estadoTorneo,
  abrirTorneo, inscribirse, jugarBotonRonda, simularMomento, elegirCasilla, cerrarCuadro, salirTorneo, render, vRanking, vEntreno, vFinEntreno, vMercado, vComo, vTemporada, vTorneo,
  elegirParejaTorneo, suplentesTrimestre, comprarMaterial, probPartido, bonoEquipo, asegurarCircuito, rivalidades, STAT_KEYS, DRILLS, pPuntoPartido, probPartidoFormato };
const __is = intentarSalida; intentarSalida = function(b, r){ const x = __is(b, r); if(x) C.salidas++; return x; };
const __rs = resolverSalida; resolverSalida = function(){ const antes = P.estado; __rs(); if(P && P.estado === 'juego' && P.bola.viva && P.bola.fueraPista) C.devueltas++; };`);
const errores = [];
const correr = (max) => { let n = 0; while(A.P && n++ < max) A.actualizar(1/120); return !A.P; };
try{
  /* 1) entrenamiento: la máquina hace de ti */
  const lin = [];
  for(const id of Object.keys(A.DRILLS)){
    A.S.pantalla = 'entreno'; A.PREF.tutorial = true;
    A.empezarEntreno(id); A.P.humanoIA = true;
    if(!correr(120*400)) { errores.push('entrenamiento sin terminar: ' + id); continue; }
    const r = A.S.entreno; lin.push(`${id} ${r.drill.aciertos}/${r.drill.total}`);
    A.render();
  }
  console.log('1) entrenamiento (la máquina en tu lugar): ' + lin.join(' · '));
  /* 2) salida de pista en partidos rápidos */
  for(let i = 0; i < 12; i++){ A.S.pantalla = 'inicio'; Object.assign(A.PREF, { juegos:4, sets:1 }); A.partidoRapido(); A.P.humanoIA = true; if(!correr(120*3600)) errores.push('partido rápido sin terminar'); }
  console.log(`2) salidas de pista: ${C.salidas} intentos, ${C.devueltas} devueltas desde fuera`);
  /* 3) carrera: pareja suplente + todos los partidos en la pista */
  A.crearYEmpezar();
  const S = A.S, j = S.j;
  for(const k of A.STAT_KEYS) j.stats[k] = 66; j.dinero = 60000;
  const antes = A.probPartido(j, Object.assign({ rating: 60, arq: { nom:'x', remate:1, globo:1 } }), { t:'FIP2', pista:'indoor' });
  A.comprarMaterial('carbono'); A.comprarMaterial('ligeras');
  const despues = A.probPartido(j, Object.assign({ rating: 60, arq: { nom:'x', remate:1, globo:1 } }), { t:'FIP2', pista:'indoor' });
  console.log(`3a) material: bono +${A.bonoEquipo(j).toFixed(1)} de nivel · mismo rival: ${antes}% → ${despues}% · dinero ${j.dinero}`);
  const pareja = j.pareja.nombre, ev = A.torneosDelTrimestre().find(e => A.estadoTorneo(j, e).tipo === 'directo');
  A.abrirTorneo(ev.id); A.render();
  A.elegirParejaTorneo(ev.id, 1); A.render();
  const sup = A.suplentesTrimestre(j)[0].nombre;
  A.inscribirse();
  const durante = j.pareja.nombre;
  S.torneo.todoEnPista = true;
  let g = 0;
  while(S.torneo && !S.torneo.fin && g++ < 40){
    const p = S.pantalla;
    if(p === 'torneo'){ A.render(); A.jugarBotonRonda(); if(A.P){ A.P.humanoIA = true; if(!correr(120*3600)) errores.push('partido de carrera sin terminar'); } }
    else if(p === 'momento') A.simularMomento();
    else if(p === 'cuadro'){ const c = S.cuadro; if(c.terminado) A.cerrarCuadro(); else { const r = c.rondas[c.actual]; A.elegirCasilla([...Array(r.casillas).keys()].find(i => !(r.falladas||[]).includes(i) && i !== r.pista)); } }
    else { errores.push('pantalla inesperada ' + p); break; }
  }
  const to = S.torneo;
  console.log(`3b) torneo con pareja suplente: jugaste con ${durante === sup ? 'la suplente ✓' : 'OTRA ✗'} · al acabar vuelve ${j.pareja.nombre === pareja ? 'tu pareja ✓' : 'OTRA ✗'}`);
  console.log(`3c) partidos jugados enteros en la pista: ${to.partidos.filter(x => x.partidoEnPista).length}/${to.partidos.length} · marcadores ${to.partidos.map(x => x.sets.join(' ')).join(' | ')} · ${to.fin ? to.fin.r.ronda : 'SIN TERMINAR'}`);
  A.salirTorneo();
  /* 4) ranking con nombre e historial */
  const pool = A.asegurarCircuito(j), conId = to.partidos.filter(x => x.opp && x.opp.id).length;
  console.log(`4) circuito: ${pool.length} parejas con nombre · rivales del torneo con historial: ${conId} · parejas en el historial: ${Object.keys(j.h2h || {}).length}`);
  /* 5) pantallas */
  S.pantalla = 'ranking'; A.render(); A.vRanking();
  S.pantalla = 'entreno'; A.render();
  S.mercadoTab = 'material'; S.pantalla = 'mercado'; A.render();
  S.pantalla = 'como'; A.render();
  S.pantalla = 'temporada'; A.render();
  console.log('5) pantallas nuevas: se pintan sin errores');
  /* 6) el punto que da el % exacto en un partido entero */
  const pp = A.pPuntoPartido(.7, 4, 3);
  console.log(`6) partido entero a 70%: punto ${pp.toFixed(3)} → vuelve a dar ${(100*A.probPartidoFormato(pp, 4, 3)).toFixed(1)}%`);
}catch(e){ errores.push((e.stack || e.message).split('\n').slice(0, 4).join(' | ')); }
console.log(errores.length ? '⚠️ ' + errores.join('\n   ') : '✅ sin errores');
