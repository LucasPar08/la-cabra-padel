/* ¿Quién falla y cómo? Partidos rápidos con la máquina en los cuatro puestos */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const N = +(process.argv[3] || 20);
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.E = { puntos:0, por:{}, golpes:{} };
eval(js + `;global.A = { get S(){ return S; }, get P(){ return P; }, get PREF(){ return PREF; }, partidoRapido, actualizar };
const __fp = finPunto; finPunto = function(g, m, e){ E.puntos++; const q = P.bola.golpeador; if(q != null && ERRORES_PUNTO.includes(m) && P.jug[q].lado !== g){ const k = q + ' ' + m; E.por[k] = (E.por[k] || 0) + 1; } return __fp(g, m, e); };
const __go = golpear; golpear = function(j, t, c, x){ E.golpes[j.id] = (E.golpes[j.id] || 0) + 1; return __go(j, t, c, x); };`);
for(let i = 0; i < N; i++){
  A.S.pantalla = 'inicio'; A.PREF.juegos = 4; A.PREF.tutorial = true;
  A.partidoRapido(); A.P.humanoIA = true;
  let pasos = 0; while(A.P && pasos++ < 120*7200) A.actualizar(1/120);
}
const nom = ['tú (máquina)', 'tu pareja', 'rival 1', 'rival 2'];
for(const id of [0, 1]){
  const tipos = Object.keys(E.por).filter(k => k.startsWith(id + ' '));
  const tot = tipos.reduce((a, k) => a + E.por[k], 0);
  console.log(`  ${nom[id].padEnd(13)} ${(10*tot/E.puntos).toFixed(2)} errores cada 10 puntos · ${(100*tot/(E.golpes[id]||1)).toFixed(1)}% de sus golpes · ${tipos.sort((a,b)=>E.por[b]-E.por[a]).map(k => k.slice(2) + ' ' + E.por[k]).join(', ')}`);
}
console.log(`  puntos: ${E.puntos} · golpes por punto: ${((E.golpes[0]+E.golpes[1]+E.golpes[2]+E.golpes[3])/E.puntos).toFixed(1)}`);
