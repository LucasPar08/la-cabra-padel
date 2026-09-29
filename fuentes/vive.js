/* ¿Se mueve el circuito en una carrera jugada de verdad (no llamando a la función a mano)? */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const store = {}; const el = () => ({ innerHTML:'', value:'Bot', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, asegurarCircuito, trimActual, torneosDelTrimestre, estadoTorneo, abrirTorneo, inscribirse, simularHastaElFinal, salirTorneo, cerrarTrimestre, pasarTrimestre, trimestreEntreno, simularMomento, elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada, resolverDuelo, cerrarDuelo, continuarMundial, vMundial, pegarRafaga };
  const __ev = cerrarCircuitoTrimestre; cerrarCircuitoTrimestre = function(j){ const w = j.circuitoW; const r = __ev(j); if(j.circuitoW !== w) global.LLAMADAS = (global.LLAMADAS||0) + 1; return r; };`);
document.querySelector('#fnom').value = 'Bot'; A.CFG.pais = 'AR'; A.crearYEmpezar();
const j = A.S.j, foto = () => A.asegurarCircuito(j).slice(0, 5).map(p => p.nombre.split(' ').pop() + ' ' + p.pts).join(' · ');
console.log('al empezar:  ' + foto());
for(let q = 0; q < 60 && j.anio < 5; q++){
  let n = 0;
  while(n++ < 60){
    const p = A.S.pantalla, tr = A.trimActual();
    if(p === 'temporada'){
      const libres = A.torneosDelTrimestre().filter(ev => ['directo','previa'].includes(A.estadoTorneo(j, ev).tipo) && !tr.jugados.includes(ev.id));
      if(libres.length && tr.jugados.length < 2){ A.abrirTorneo(libres[0].id); A.inscribirse(); }
      else if(tr.jugados.length){ A.cerrarTrimestre(); }
      else { A.trimestreEntreno(); break; }
    } else if(p === 'torneo'){ if(A.S.torneo && !A.S.torneo.fin) A.simularHastaElFinal(); else A.salirTorneo(); }
    else if(p === 'momento') A.simularMomento();
    else if(p === 'gira'){ A.pasarTrimestre(); break; }
    else if(p === 'evento'){ if(!A.S.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
    else if(p === 'finTemporada') A.irPretemporada();
    else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
    else if(p === 'duelo'){ if(A.S.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
    else { console.log('pantalla sin política: ' + p); break; }
  }
}
console.log('tras 8 trimestres jugados: ' + foto());
console.log('ranking tuyo: #' + j.ranking + ' con ' + (function(){ try{ return A.S.j && A.S.j.ranking; }catch(e){ return '?'; } })() + ' · noticias: ' + JSON.stringify((j.noticias||{}).items||[]).slice(0,300)); console.log('veces que se movió el circuito: ' + (global.LLAMADAS || 0) + ' · trimestre ' + j.anio + '-' + j.trimestre + ' · pantalla ' + A.S.pantalla);
