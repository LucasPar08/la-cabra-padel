/* ¿El modo El Ídolo funciona? Las dos formas de empezar, la dureza extra, las metas y la tabla.
   Uso: node idolo.js nuevo.html */
const fs = require('fs'), path = require('path');
const D = __dirname, archivo = process.argv[2] || 'nuevo.html';
const js = fs.readFileSync(path.join(D, archivo), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {};
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, empezarIdolo, arrancarIdolo, cerrarIdolo, puntajeIdolo, leerIdolos, vIdolo, idoloHTML,
  idoloTemporadaHTML, vRetiro, difActual, rankDePuntos, probPartido, ptsDeRank, METAS_IDOLO, IDOLO_DUREZA, STAT_KEYS, ARQUETIPOS, duplaRival, calcularLegado, render, vTemporada, ratingDupla };`);
const errores = [], ok = (c, t) => { if(!c) errores.push(t); return c; };
const crear = (nombre, pais) => { document.querySelector('#fnom').value = nombre; A.CFG.pais = pais; A.crearYEmpezar(); return A.S.j; };
/* 1) carrera normal: la dificultad nueva */
const jN = crear('Normal Pérez', 'AR');
const dN = A.difActual();
ok(jN.modo === 'normal' && dN.sim === 5.8, 'la carrera normal no tiene la dificultad nueva: ' + dN.sim);
const rival = Object.assign(A.duplaRival(25), { arq: A.ARQUETIPOS[0] });   /* el nivel se fija abajo: así se mide la dificultad, no la suerte del sorteo */
const mideProb = (j) => { let t = 0; for(let i = 0; i < 6; i++) t += A.probPartido(j, Object.assign({}, rival, { _prob:null }), ev); return Math.round(t/6); };
const ev = { t:'P2', nom:'x', ciudad:'Madrid', pista:'indoor' };
for(const k of A.STAT_KEYS) jN.stats[k] = 80;
rival.rating = A.ratingDupla(jN, ev.pista, ev) + 6;    /* una pareja que te queda grande: ahí se nota la dificultad */
const probNormal = mideProb(jN);
console.log(`1) carrera normal: ventaja al simular ${dN.sim} · contra una pareja de tu nivel ganas el ${probNormal}%`);
/* 2) El Ídolo desde abajo: más duro */
A.empezarIdolo('abajo');
const jI = crear('Ídolo Abajo', 'AR');
const dI = A.difActual();
ok(jI.modo === 'idolo' && jI.idoloInicio === 'abajo', 'no quedó en modo Ídolo');
ok(Math.abs(dI.sim - (dN.sim - A.IDOLO_DUREZA.sim)) < 1e-9 && dI.rival === dN.rival - A.IDOLO_DUREZA.rival && Object.keys(dI.ayuda).length === 0, 'el Ídolo no endurece la dificultad');
for(const k of A.STAT_KEYS) jI.stats[k] = 80;
jI.pareja = jN.pareja;
const probIdolo = mideProb(jI);
ok(probIdolo <= probNormal - 3, `en el Ídolo no cuesta bastante más ganar (${probIdolo}% vs ${probNormal}%)`);
/* el ranking: los mismos puntos valen menos */
const pts = 4000;
A.S.j = jN; const rN = A.rankDePuntos(pts); A.S.j = jI; const rI = A.rankDePuntos(pts);
ok(rI > rN, `con los mismos puntos el Ídolo no queda más abajo (#${rI} vs #${rN})`);
console.log(`2) Ídolo desde abajo: ventaja ${dI.sim} · contra esa misma pareja ganas el ${probIdolo}% · ${pts} puntos son #${rI} (en normal #${rN})`);
/* 3) El Ídolo como estrella */
A.empezarIdolo('estrella');
const jE = crear('Estrella Gómez', 'ES');
ok(jE.modo === 'idolo' && jE.idoloInicio === 'estrella', 'no quedó como estrella');
ok(jE.edad === 24 && jE.ranking && jE.ranking <= 14, `no arranca como top 10 con 24 años (#${jE.ranking}, ${jE.edad} años)`);
ok(jE.titulos.length === 0 && jE.pareja && jE.pareja.nivel > 80, 'la estrella no arranca con vitrina vacía y buena pareja');
console.log(`3) Ídolo estrella: ${jE.edad} años · #${jE.ranking} · nivel medio ${Math.round(A.STAT_KEYS.reduce((a,k)=>a+jE.stats[k],0)/A.STAT_KEYS.length)} · pareja nivel ${jE.pareja.nivel.toFixed(1)}`);
/* 4) metas y puntaje */
jE.titulos = [{tier:'MJ',a:1},{tier:'MJ',a:2},{tier:'MJ',a:3},{tier:'P1',a:3},{tier:'FIN',a:4}];
jE.trimN1 = 9; jE.mundialCopas = 1; jE.anio = 13; jE.mejorRank = 1; jE.pg = 400;
const p = A.puntajeIdolo(jE);
ok(p.metas >= 4 && p.pts > A.calcularLegado(jE).pts, 'las metas no suman al puntaje');
console.log(`4) metas cumplidas ${p.metas}/${A.METAS_IDOLO.length} · puntaje ${p.pts} (legado ${p.legado}) · ${p.rango}`);
/* 5) la tabla de las mejores carreras */
A.cerrarIdolo(jE);
let tabla = A.leerIdolos();
ok(tabla.length === 1 && tabla[0].nombre === 'Estrella Gómez' && tabla[0].pts === p.pts, 'no entró en la tabla');
A.cerrarIdolo(jE); ok(A.leerIdolos().length === 1, 'entra dos veces la misma carrera');
for(let i = 0; i < 12; i++){ const x = Object.assign({}, jE, { nombre:'Otro ' + i, titulos:[], trimN1:i, mundialCopas:0, idoloGuardado:false, pg:i*10, anio:5 }); A.cerrarIdolo(x); }
tabla = A.leerIdolos();
ok(tabla.length === 10 && tabla[0].pts >= tabla[9].pts, 'la tabla no guarda las 10 mejores ordenadas');
console.log(`5) tabla: ${tabla.length} carreras, la mejor ${tabla[0].nombre} con ${tabla[0].pts} pts`);
/* 6) las pantallas */
A.S.j = jE; A.S.pantalla = 'idolo';
ok(A.vIdolo().includes('HAZTE LEYENDA') && A.idoloHTML().includes('EL ÍDOLO'), 'la pantalla del Ídolo no se pinta');
ok(A.idoloTemporadaHTML(jE).includes('metas de leyenda'), 'la tarjeta en la temporada no se pinta');
ok(A.idoloTemporadaHTML(jN) === '', 'la tarjeta del Ídolo aparece en una carrera normal');
A.S.legado = A.calcularLegado(jE); jE.retirado = true;
ok(A.vRetiro().includes('PUNTOS') && A.vRetiro().includes('LAS MEJORES CARRERAS'), 'el retiro no muestra la marca de Ídolo');
console.log('6) pantallas: modo, tarjeta en la temporada y retiro con la tabla ✓');
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
