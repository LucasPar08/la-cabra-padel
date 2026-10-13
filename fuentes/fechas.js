/* ¿Funciona la temporada por fechas? Un año semana a semana con "que elija el juego". Uso: node fechas.js nuevo.html [años] */
const fs = require('fs'), path = require('path');
const archivo = process.argv[2] || 'nuevo.html', ANIOS = +(process.argv[3] || 3);
const js = fs.readFileSync(path.join(__dirname, archivo), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {}; const el = () => ({ innerHTML:'', value:'Bot', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, trimActual, elegirPorMi, salirTorneo, simularHastaElFinal, simularMomento,
  pasarTrimestre, elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada, resolverDuelo, cerrarDuelo, vTemporada, vCalendario, vTorneo,
  semanaDelAnio, torneosDeLaSemana, recomendacionSemana, asegurarSemanas, S_CAL: () => S.cal, render };`);
const errores = []; const ok = (c, t) => { if(!c) errores.push(t); return c; };
document.querySelector('#fnom').value = 'Bot'; A.CFG.pais = 'AR'; A.crearYEmpezar();
const j = A.S.j;
/* 1) el calendario: cada torneo tiene semana, y casi todas las semanas tienen algo */
A.asegurarSemanas();
const porSemana = {};
A.S.cal.forEach((tri, q) => tri.giras.forEach(g => g.torneos.forEach(ev => { ok(ev.sem >= 1 && ev.sem <= 13, 'torneo sin semana'); const n = q*13 + ev.sem; porSemana[n] = (porSemana[n] || 0) + 1; })));
const conTorneo = Object.keys(porSemana).length;
ok(conTorneo >= 44, 'hay demasiadas semanas vacías: ' + conTorneo);
const fin = A.S.cal[3].giras.flatMap(g => g.torneos).find(ev => ev.t === 'FIN');
ok(fin && fin.sem === 13, 'las Finals no son la última semana');
console.log(`1) calendario: ${Object.values(porSemana).reduce((a,b)=>a+b,0)} torneos en ${conTorneo} de 52 semanas · Finals en la semana ${fin ? 39 + fin.sem : '?'}`);
/* 2) jugar años enteros, semana a semana */
const porAnio = {}; let semanas = 0, pasos = 0, energiaMin = 100;
while(j.anio <= ANIOS && pasos++ < 20000){
  const p = A.S.pantalla;
  try{
    if(p === 'temporada'){
      const antes = A.semanaDelAnio(j), anio = j.anio;
      A.vTemporada();
      if(A.elegirPorMi()){ porAnio[anio] = (porAnio[anio] || { t:0, d:0 }); porAnio[anio].t++; while(A.S.torneo && !A.S.torneo.fin){ if(A.S.pantalla === 'momento') A.simularMomento(); else A.simularHastaElFinal(); } A.vTorneo(); A.salirTorneo(); }
      else { porAnio[anio] = (porAnio[anio] || { t:0, d:0 }); porAnio[anio].d++; }
      semanas++; energiaMin = Math.min(energiaMin, j.energia);
    }
    else if(p === 'torneo'){ if(A.S.torneo && !A.S.torneo.fin) A.simularHastaElFinal(); else A.salirTorneo(); }
    else if(p === 'momento') A.simularMomento();
    else if(p === 'gira') A.pasarTrimestre();
    else if(p === 'evento'){ if(!A.S.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
    else if(p === 'finTemporada') A.irPretemporada();
    else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
    else if(p === 'duelo'){ if(A.S.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
    else if(p === 'retiro') break;
    else { errores.push('pantalla sin política: ' + p); break; }
  }catch(e){ errores.push(p + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); break; }
}
ok(A.vCalendario().includes('Sem '), 'el calendario del año no se pinta');
for(const a of Object.keys(porAnio)) console.log(`2) año ${a}: ${porAnio[a].t} torneos jugados y ${porAnio[a].d} semanas sin jugar · ranking final #${j.ranking}`);
console.log(`   energía mínima en todo el recorrido: ${Math.round(energiaMin)}% · títulos ${j.titulos.length}`);
ok(Object.values(porAnio).every(x => x.t >= 8 && x.t + x.d >= 40), 'un año no tiene sus semanas');
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
