/* Partidos rápidos con la máquina en los cuatro puestos: ¿terminan, y cómo acaban los puntos? */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const N = +(process.argv[3] || 10);
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.MOT = {};
eval(js + `;global.A = { get S(){ return S; }, get P(){ return P; }, get PREF(){ return PREF; }, partidoRapido, actualizar };
const __fp = finPunto; finPunto = function(g, m, e){ MOT[m] = (MOT[m] || 0) + 1; MOT.__t = P.t; return __fp(g, m, e); };
const __fs = faltaSaque; faltaSaque = function(m){ MOT['· falta en el 1er saque'] = (MOT['· falta en el 1er saque'] || 0) + 1; return __fs(m); };
const __rs = repetirSaque; repetirSaque = function(){ MOT['· let'] = (MOT['· let'] || 0) + 1; return __rs(); };`);
let errores = 0;
for(const juegos of [6]){
  global.MOT = {};
  const marcas = []; let tb = 0, t = 0;
  for(let i = 0; i < N; i++){
    A.S.pantalla = 'inicio'; A.PREF.juegos = juegos; A.PREF.tutorial = true;
    A.partidoRapido(); A.P.humanoIA = true; for(const k of [2,3]) Object.assign(A.P.jug[k], { hab:A.P.jug[1].hab, vel:A.P.jug[1].vel, reaccion:A.P.jug[1].reaccion, alcance:A.P.jug[1].alcance, multFallo:A.P.jug[1].multFallo });
    let pasos = 0; while(A.P && pasos++ < 120*7200) A.actualizar(1/120);
    if(A.P){ errores++; console.log('⚠️ partido sin terminar'); break; }
    const r = A.S.rapido; marcas.push(r.juegos.join('-')); if(r.juegos.includes(7) && r.juegos.includes(6)) tb++;
    t += MOT.__t || 0;
  }
  const tot = Object.keys(MOT).filter(k => !k.startsWith('·') && k !== '__t').reduce((a, k) => a + MOT[k], 0);
  console.log(`\n${juegos >= 6 ? 'SET CON TIE-BREAK' : 'A ' + juegos + ' JUEGOS'} · ${N} partidos · ${Math.round(t/N/60)} min de media · ${tot} puntos${juegos >= 6 ? ` · ${tb} con tie-break` : ''}`);
  console.log('  marcadores: ' + marcas.join(' · '));
  console.log('  cómo acaban los puntos: ' + Object.keys(MOT).filter(k => k !== '__t').sort((a, b) => MOT[b] - MOT[a]).map(k => `${k} ${MOT[k]}`).join(' · '));
}
console.log(errores ? '⚠️ errores' : '\n✅ todos los partidos terminaron');
