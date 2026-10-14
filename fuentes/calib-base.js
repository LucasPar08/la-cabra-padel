/* ¿Cuánto cuesta cada categoría según el año de carrera? Título y primer partido, de mediana. Uso: node calib-base.js nuevo.html [carreras] */
const fs = require('fs'), path = require('path');
const js = fs.readFileSync(path.join(__dirname, process.argv[2] || 'nuevo.html'), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {}; const el = () => ({ innerHTML:'', value:'Bot', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, elegirPorMi, salirTorneo, simularHastaElFinal, simularMomento, pasarTrimestre, elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada, resolverDuelo, cerrarDuelo, vTemporada, vTorneo, cerrarCuadro, elegirCasilla, valorTorneo, torneosDelTrimestre, asegurarSemanas, TIERS };`);
const CARR = +(process.argv[3] || 12), TIPOS = ['CLUB','REG','NAC','FIP1','FIP2','FIP3'], datos = {};
function medir(j, k){
  const evs = A.torneosDelTrimestre();
  for(const t of TIPOS){
    const ev = evs.find(e => e.t === t); if(!ev) continue;
    const e0 = j.energia; j.energia = 90;
    const v = A.valorTorneo(j, ev, { tipo:'directo' });
    j.energia = e0;
    ((datos[k] = datos[k] || {})[t] = datos[k][t] || []).push(v);
  }
}
for(let c = 0; c < CARR; c++){
  document.querySelector('#fnom').value = 'Bot'; A.CFG.pais = ['AR','ES','MX','CL'][c % 4]; A.crearYEmpezar();
  const j = A.S.j; let pasos = 0, visto = {};
  A.asegurarSemanas(); medir(j, 'año 1');
  while(j.anio <= 4 && pasos++ < 20000){
    if(A.S.pantalla === 'temporada' && j.trimestre === 0 && (j.semana||1) === 1 && !visto[j.anio]){ visto[j.anio] = 1; if(j.anio > 1) medir(j, 'año ' + j.anio); }
    const p = A.S.pantalla;
    if(p === 'temporada'){ A.vTemporada(); if(A.elegirPorMi()){ for(let g = 0; A.S.torneo && !A.S.torneo.fin && g < 300; g++){ const q = A.S.pantalla; if(q === 'momento') A.simularMomento(); else if(q === 'cuadro'){ const cu = A.S.cuadro; if(cu.terminado) A.cerrarCuadro(); else { const r = cu.rondas[cu.actual]; A.elegirCasilla([...Array(r.casillas).keys()].find(i => !(r.falladas||[]).includes(i) && i !== r.pista)); } } else A.simularHastaElFinal(); } A.vTorneo(); A.salirTorneo(); } }
    else if(p === 'torneo'){ if(A.S.torneo && !A.S.torneo.fin) A.simularHastaElFinal(); else A.salirTorneo(); }
    else if(p === 'momento') A.simularMomento();
    else if(p === 'gira') A.pasarTrimestre();
    else if(p === 'evento'){ if(!A.S.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
    else if(p === 'finTemporada') A.irPretemporada();
    else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
    else if(p === 'duelo'){ if(A.S.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
    else break;
  }
}
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length/2)], pc = x => Math.round(100*x) + '%';
for(const k of Object.keys(datos)) console.log(k.padEnd(6) + TIPOS.map(t => datos[k][t] ? `${t.padEnd(4)} título ${pc(med(datos[k][t].map(v => v.titulo))).padStart(4)} · 1º ${pc(med(datos[k][t].map(v => v.primera))).padStart(4)}` : '').join(' | '));
