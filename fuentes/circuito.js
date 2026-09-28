/* ¿El circuito vive? Las otras parejas juegan, suman puntos y el ranking se mueve solo.
   Uso: node circuito.js nuevo.html [temporadas] */
const fs = require('fs'), path = require('path');
const D = __dirname, archivo = process.argv[2] || 'nuevo.html', ANIOS = +(process.argv[3] || 10);
const js = fs.readFileSync(path.join(D, archivo), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {};
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, asegurarCircuito, evolucionarCircuito, trimActual,
  ptsDeRank, rankDePuntos, puntosPareja, ratingDeRank, vRanking, TRIMESTRES_POR_ANIO, render };`);
const errores = [];
const ok = (c, t) => { if(!c) errores.push(t); return c; };

document.querySelector('#fnom').value = 'Lucas Park'; A.CFG.pais = 'AR'; A.CFG.genero = 'M'; A.crearYEmpezar();
const j = A.S.j;
const pool = A.asegurarCircuito(j);
const puesto = nom => pool.findIndex(p => p.nombre === nom) + 1;
const foto = () => pool.map(p => p.nombre + ' / ' + p.nombre2);
const inicio = foto();
ok(pool.every(p => p.pts > 0), 'hay parejas sin puntos al empezar');
console.log(`inicio: #1 ${pool[0].nombre} (${pool[0].pts} pts) · #10 ${pool[9].pts} · #20 ${pool[19].pts} · #40 ${pool[39].pts}`);

/* que los puntos de cada puesto se parezcan a los que hacen falta para ese puesto:
   si no, tu ranking y el suyo estarían en escalas distintas */
const desvio = () => [1, 5, 10, 20, 40].map(r => {
  const real = pool[r-1].pts, teorico = A.ptsDeRank(r);
  return `#${r}: ${real} (tabla ${teorico}, ${real > teorico ? '+' : ''}${Math.round(100*(real-teorico)/teorico)}%)`;
}).join(' · ');
console.log('al empezar  ' + desvio());

let movimientos = 0, subidaMax = { n:'', d:0 }, bajadaMax = { n:'', d:0 };
for(let a = 0; a < ANIOS; a++){
  for(let t = 0; t < 4; t++){
    const antes = foto();
    j.trimestre = t; j.anio = a + 1;
    A.evolucionarCircuito(j);
    const despues = foto();
    despues.forEach((n, i) => { const d = antes.indexOf(n); if(d >= 0 && d !== i) movimientos++; });
  }
}
const fin = foto();
inicio.forEach((n, i) => {
  const ahora = fin.indexOf(n);
  if(ahora < 0) return;
  const d = i - ahora;
  if(d > subidaMax.d) subidaMax = { n, d, de: i+1, a: ahora+1 };
  if(-d > bajadaMax.d) bajadaMax = { n, d:-d, de: i+1, a: ahora+1 };
});
console.log(`tras ${ANIOS} temporadas  ` + desvio());
console.log(`  top 5 ahora: ${fin.slice(0,5).map((n,i)=>`#${i+1} ${n} (${pool[i].pts} pts, ${pool[i].titulos} títulos)`).join(' · ')}`);
console.log(`  la que más subió: ${subidaMax.n} del #${subidaMax.de} al #${subidaMax.a} · la que más bajó: ${bajadaMax.n} del #${bajadaMax.de} al #${bajadaMax.a}`);
console.log(`  cambios de puesto en total: ${movimientos}`);

/* 1) el ranking se mueve de verdad */
ok(movimientos > ANIOS*4, 'el circuito casi no se mueve');
ok(subidaMax.d >= 3, 'nadie sube puestos de verdad');
/* 2) los puntos siguen en la misma escala que los tuyos */
for(const r of [1, 5, 10, 20]){
  const real = pool[r-1].pts, teorico = A.ptsDeRank(r);
  ok(real > teorico*0.5 && real < teorico*1.9, `los puntos del #${r} se han ido de escala: ${real} contra ${teorico}`);
}
/* 3) el orden por puntos es el orden del ranking */
for(let i = 1; i < pool.length; i++) ok(pool[i-1].pts >= pool[i].pts, 'el ranking no está ordenado por puntos');
/* 4) los títulos los ganan los de arriba */
const titArriba = pool.slice(0, 5).reduce((a, p) => a + (p.titulos||0), 0)/5;
const titAbajo = pool.slice(25).reduce((a, p) => a + (p.titulos||0), 0)/15;
ok(titArriba > titAbajo*1.5, `los de arriba no ganan bastante más que los de abajo (${titArriba.toFixed(1)} contra ${titAbajo.toFixed(1)} por pareja)`);
console.log(`  títulos por pareja: los cinco primeros ${titArriba.toFixed(1)} de media, del 26 al 40 ${titAbajo.toFixed(1)}`);
/* 5) el nivel de cada pareja encaja con el puesto que ocupa: si no, los rivales
   que te tocan no se parecerían a lo que dice el ranking */
const niveles = [1, 5, 10, 20].map(r => ({ r, nivel: pool[r-1].nivel, teorico: A.ratingDeRank(r) }));
console.log('  nivel por puesto: ' + niveles.map(x => `#${x.r} ${x.nivel.toFixed(1)} (teórico ${x.teorico.toFixed(1)})`).join(' · '));
for(const x of niveles) ok(Math.abs(x.nivel - x.teorico) < 4, `el nivel del #${x.r} no encaja con su puesto (${x.nivel.toFixed(1)} contra ${x.teorico.toFixed(1)})`);
const media = (a, b2) => pool.slice(a, b2).reduce((x, p) => x + p.nivel, 0)/(b2 - a);
ok(media(0, 10) > media(10, 20) && media(10, 20) > media(20, 40), 'el nivel no baja según se baja en el ranking');
console.log(`  nivel medio: top 10 ${media(0,10).toFixed(1)} · 11-20 ${media(10,20).toFixed(1)} · 21-40 ${media(20,40).toFixed(1)}`);

/* 5) la pantalla del ranking sigue pintando */
j.ranking = 12;
ok(A.vRanking().includes('pts'), 'el ranking no se pinta');
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
