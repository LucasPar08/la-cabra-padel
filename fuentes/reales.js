/* ¿El circuito de verdad está donde tiene que estar? Ranking, cuadros, pareja y que nadie salga dos veces.
   Uso: node reales.js nuevo.html */
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
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, asegurarCircuito, rivalDelCircuito, generarRival, evolucionarCircuito,
  vRanking, nuevaPareja, jugadorRealLibre, REALES, RANKING_FECHA, nuevaParejaCircuito, duplaRival, migrarCircuitoReal, escalar, rawJugador, trimActual, render };`);
const errores = [];
const ok = (c, t) => { if(!c) errores.push(t); return c; };

function carrera(gen){
  A.CFG.genero = gen; A.CFG.pais = 'AR';
  document.querySelector('#fnom').value = 'Lucas Park';
  A.crearYEmpezar();
  return A.S.j;
}
/* 1) el masculino: las parejas de verdad, en su puesto */
let j = carrera('M');
let pool = A.asegurarCircuito(j);
ok(pool[0].nombre === 'Arturo Coello' && pool[0].nombre2 === 'Agustín Tapia', 'el nº1 no es Coello/Tapia: ' + pool[0].nombre + '/' + pool[0].nombre2);
ok(pool[1].nombre === 'Alejandro Galán' && pool[1].nombre2 === 'Federico Chingotto', 'el nº2 no es Galán/Chingotto');
ok(pool[0].titulos === 8 && pool[0].flag === 'ESP' && pool[0].flag2 === 'ARG', 'la pareja nº1 no lleva sus títulos y sus países');
ok(pool.filter(p => p.real).length === 20, 'no hay 20 parejas reales: ' + pool.filter(p => p.real).length);
console.log(`1) masculino: ${pool.slice(0, 5).map((p, i) => `#${i+1} ${p.nombre}/${p.nombre2}`).join(' · ')}`);
/* 2) nadie sale dos veces */
const nombres = pool.flatMap(p => [p.nombre, p.nombre2]);
ok(new Set(nombres).size === nombres.length, 'hay jugadores repetidos en el circuito');
/* 3) los cuadros grandes te cruzan con ellos */
const cruces = new Set();
for(let i = 0; i < 400; i++){ const r = A.generarRival('MJ', 5, 7); if(r.id && r.id[0] === 'r') cruces.add(r.nombre + '/' + r.nombre2); }
ok(cruces.size >= 3, 'en los Majors no salen las parejas reales: ' + cruces.size);
console.log(`2) en la final de un Major te cruzas con: ${[...cruces].slice(0, 4).join(' · ')}`);
/* 4) el femenino */
j = carrera('F');
pool = A.asegurarCircuito(j);
ok(pool[0].nombre === 'Gemma Triay' && pool[0].nombre2 === 'Delfi Brea', 'el nº1 femenino no es Triay/Brea');
ok(pool.filter(p => p.real).length === 15, 'no hay 15 parejas reales en el femenino: ' + pool.filter(p => p.real).length);
const nomF = pool.flatMap(p => [p.nombre, p.nombre2]);
ok(new Set(nomF).size === nomF.length, 'hay jugadoras repetidas en el circuito femenino');
console.log(`3) femenino: ${pool.slice(0, 4).map((p, i) => `#${i+1} ${p.nombre}/${p.nombre2}`).join(' · ')}`);
/* 5) buscar pareja: de club cuando eres de club, del circuito cuando ya estás dentro */
j = carrera('M');
const deClub = [...Array(20)].map(() => A.nuevaPareja(52, 'ARG', 'drive', 24));
ok(deClub.every(p => !p.real), 'te ofrecen jugadores del circuito siendo de club');
const dentro = [...Array(30)].map(() => A.nuevaPareja(74, null, 'drive', 29));
const reales = dentro.filter(p => p.real);
ok(reales.length > 0, 'nunca te ofrecen un jugador de verdad');
ok(reales.every(p => !A.asegurarCircuito(j).some(c => c.nombre === p.nombre || c.nombre2 === p.nombre)), 'te ofrecen a alguien que ya juega en el circuito');
console.log(`4) pareja: de club ${deClub[0].nombre} · del circuito ${[...new Set(reales.map(p => p.nombre))].slice(0, 3).join(', ')}`);
/* 6) el circuito se mueve con los años y no se rompe */
for(let t = 0; t < 40; t++) A.evolucionarCircuito(j);
pool = A.asegurarCircuito(j);
const n2 = pool.flatMap(p => [p.nombre, p.nombre2]);
ok(pool.length === 40 && new Set(n2).size === n2.length, 'tras diez años el circuito tiene repetidos o se descuadró');
ok(pool.some(p => p.real), 'tras diez años no queda ninguna pareja real');
console.log(`5) diez años después: ${pool.filter(p => p.real).length} parejas reales siguen en el top 40, nº1 ${pool[0].nombre}/${pool[0].nombre2}`);
/* 7) una carrera guardada antes de esto recibe el circuito real al retomarla */
j = carrera('M');
j.circuito = [];
for(let k = 1; k <= 40; k++){ const d = A.duplaRival(k); j.circuito.push({ id:'c' + k, nombre:d.nombre, nombre2:d.nombre2, flag:d.flag, flag2:d.flag2, arq:d.arq, forma:1.5, titulos:3 }); }
const antes = j.circuito[0].nombre;
pool = A.asegurarCircuito(j);
ok(pool[0].real && pool[0].nombre === 'Arturo Coello' && pool.filter(p => p.real).length === 20, 'la carrera vieja no recibe el circuito real');
ok(pool[0].forma === 1.5, 'la migración pierde la forma que llevaba la casilla');
ok(pool.filter(p => !p.real).length === 20, 'la migración se lleva por delante a las parejas del juego');
console.log(`7) carrera vieja: el nº1 pasa de ${antes} a ${pool[0].nombre} y entran 20 parejas de verdad`);
/* 7) la pantalla del ranking lo cuenta */
j.ranking = 12;
const html = A.vRanking();
ok(html.includes('Arturo Coello') && html.includes(A.RANKING_FECHA), 'el ranking no muestra el circuito real ni de cuándo es');
console.log(`6) ranking en pantalla: nombres reales y fecha (${A.RANKING_FECHA}) ✓`);
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
