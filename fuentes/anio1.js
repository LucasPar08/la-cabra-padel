/* El primer año de N carreras de bot: qué juegan, qué ganan y cómo acaban. Uso: node anio1.js archivo.html [carreras] [años] */
const fs = require('fs'), path = require('path');
const js = fs.readFileSync(path.resolve(process.argv[2]), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {}; const el = () => ({ innerHTML:'', value:'Bot', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, elegirPorMi, salirTorneo, simularHastaElFinal, simularMomento, pasarTrimestre, elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada, resolverDuelo, cerrarDuelo, vTemporada, vTorneo, cerrarCuadro, elegirCasilla, ratingDupla };`);
const N = +(process.argv[3] || 20), ANIOS = +(process.argv[4] || 1), tot = { tiers:{}, tit:{}, rk:[], nivel:[], forma:[], titulo1:[] };
for(let c = 0; c < N; c++){
  document.querySelector('#fnom').value = 'Bot'; A.CFG.pais = ['AR','ES','MX','CL'][c % 4]; A.crearYEmpezar();
  const j = A.S.j; let pasos = 0;
  while(j.anio <= ANIOS && pasos++ < 20000){
    const p = A.S.pantalla;
    if(p === 'temporada'){ A.vTemporada(); if(A.elegirPorMi()){ const t = A.S.torneo.ev.t; tot.tiers[t] = (tot.tiers[t] || 0) + 1;
        for(let g = 0; A.S.torneo && !A.S.torneo.fin && g < 300; g++){ const q = A.S.pantalla; if(q === 'momento') A.simularMomento(); else if(q === 'cuadro'){ const cu = A.S.cuadro; if(cu.terminado) A.cerrarCuadro(); else { const rr = cu.rondas[cu.actual]; A.elegirCasilla([...Array(rr.casillas).keys()].find(i => !(rr.falladas||[]).includes(i) && i !== rr.pista)); } } else A.simularHastaElFinal(); }
        const f = A.S.torneo && A.S.torneo.fin; if(f && f.r.campeon){ tot.tit[t] = (tot.tit[t] || 0) + 1; if(!['CLUB','REG','NAC'].includes(t) && j.titulos.length === 1) tot.titulo1.push(`${t} a${j.anio} s${j.trimestre*13 + j.semana} forma ${j.forma.toFixed(1)} moral ${Math.round(j.moral)}`); }
        A.vTorneo(); A.salirTorneo(); } }
    else if(p === 'torneo'){ if(A.S.torneo && !A.S.torneo.fin) A.simularHastaElFinal(); else A.salirTorneo(); }
    else if(p === 'momento') A.simularMomento();
    else if(p === 'gira') A.pasarTrimestre();
    else if(p === 'evento'){ if(!A.S.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
    else if(p === 'finTemporada') A.irPretemporada();
    else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
    else if(p === 'duelo'){ if(A.S.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
    else break;
  }
  tot.rk.push(j.ranking || 3000); tot.nivel.push(A.ratingDupla(j, 'exterior', {})); tot.forma.push(j.forma);
}
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length/2)];
console.log(`${N} carreras, ${ANIOS} año(s) · jugados por categoría ${JSON.stringify(tot.tiers)} · títulos ${JSON.stringify(tot.tit)}`);
console.log(`ranking mediano #${med(tot.rk)} · nivel dupla mediano ${med(tot.nivel).toFixed(1)} · forma mediana ${med(tot.forma).toFixed(1)}`);
console.log('primeros títulos FIP: ' + tot.titulo1.join(' | '));
