/* ¿El Mundial de Selecciones funciona? Sorteo, rondas, premios, cada dos años y que el % que se ve sea el real.
   Uso: node mundial.js nuevo.html [N] */
const fs = require('fs'), path = require('path');
const D = __dirname, archivo = process.argv[2] || 'nuevo.html', N = +(process.argv[3] || 300);
const js = fs.readFileSync(path.join(D, archivo), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {};
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, abrirMundial, simularMiPartidoMundial, siguienteRondaMundial, vMundialSel, mundialAvisoHTML,
  chanceTituloMundial, chanceEliminatoria, crearMundial, trimActual, pasarTrimestre, vTemporada, STAT_KEYS, elimActual, SELECCIONES, render, guardar, cargar, continuarPartida };`);
const errores = [];
const ok = (c, t) => { if(!c) errores.push(t); return c; };
document.querySelector('#fnom').value = 'Lucas Park'; A.CFG.pais = 'AR'; A.crearYEmpezar();
const j = A.S.j;
for(const k of A.STAT_KEYS) j.stats[k] = 80;
j.ranking = 12; j.anio = 2; j.trimestre = 3;

/* 1) el aviso y la pantalla */
ok(A.mundialAvisoHTML(j).includes('MUNDIAL DE SELECCIONES'), 'no sale el aviso grande en el trimestre del Mundial');
j.trimestre = 1; ok(A.mundialAvisoHTML(j).includes('ESTE AÑO HAY MUNDIAL'), 'no avisa antes del Mundial'); j.trimestre = 3;
j.anio = 3; ok(A.mundialAvisoHTML(j) === '', 'sale el Mundial en un año impar'); j.anio = 2;
A.abrirMundial();
const mu = A.trimActual().mundial;
ok(mu && mu.cuadro.length === 16 && new Set(mu.cuadro).size === 16 && mu.cuadro.includes('AR'), 'el cuadro no tiene 16 selecciones distintas con la tuya');
ok(mu.rivales.length === 4 && mu.elims.length === 4, 'no hay cuatro rondas');
ok(A.S.pantalla === 'mundialSel' && A.vMundialSel().includes('EL CUADRO'), 'la pantalla del Mundial no se pinta');
console.log(`1) Mundial de ${mu.sede}: ${mu.cuadro.join(' ')} · juegas en la pareja ${mu.slot + 1} · rivales ${mu.rivales.join(' → ')}`);
/* 2) que el % de campeón sea el producto de las eliminatorias */
const ch = A.chanceTituloMundial(mu), prod = mu.elims.reduce((a, e) => a*A.chanceEliminatoria(e), 1);
ok(Math.abs(ch - prod) < 1e-9, 'el % de campeón no es el producto de las eliminatorias');
console.log(`2) chances por ronda: ${mu.elims.map(e => Math.round(100*A.chanceEliminatoria(e)) + '%').join(' · ')} · campeón ${Math.round(100*ch)}%`);
/* 3) jugarlo entero, simulado */
let g = 0;
while(!mu.fin && g++ < 20){ const e = A.elimActual(mu); if(!e.fin) A.simularMiPartidoMundial(); else A.siguienteRondaMundial(); }
ok(!!mu.fin, 'el Mundial no terminó');
ok((j.mundiales || []).length === 1 && j.mundiales[0].a === 2, 'no quedó apuntado en tu carrera');
ok(A.vMundialSel().length > 1000 && A.mundialAvisoHTML(j).includes('MUNDIAL DE'), 'la pantalla del final no se pinta');
console.log(`3) resultado: ${mu.fin.texto} · premio $${mu.fin.plata} · eliminatorias ${mu.hist.map(h => h.riv + ' ' + h.marcador).join(', ')}`);
/* 4) se guarda y se recupera a medias */
A.guardar(); const raw = JSON.parse(store.cabra_padel_v1);
ok(raw.trim && raw.trim.mundial && raw.trim.mundial.fin, 'el Mundial no se guarda con la partida');
/* 5) cada dos años: al pasar el trimestre sin jugarlo, se simula y queda apuntado */
j.anio = 4; j.trimestre = 3; A.S.trim = null; A.trimActual();
A.pasarTrimestre();
ok((j.mundiales || []).some(m => m.a === 4), 'el Mundial del año 4 no se jugó al pasar el trimestre');
console.log(`5) año 4 (pasando el trimestre sin entrar): ${(j.mundiales.find(m => m.a === 4) || {}).res}`);
/* 6) ¿el % de campeón que se ve se cumple? */
let suma = 0, campeones = 0, sumaR1 = 0, pasaR1 = 0;
for(let i = 0; i < N; i++){
  j.anio = 2; j.trimestre = 3; j.mundiales = [];
  const m = A.crearMundial(j), c = A.chanceTituloMundial(m);
  A.trimActual().mundial = m;
  suma += c; sumaR1 += A.chanceEliminatoria(m.elims[0]);
  let k = 0;
  while(!m.fin && k++ < 20){ const e = A.elimActual(m); if(!e.fin) A.simularMiPartidoMundial(); else A.siguienteRondaMundial(); }
  if(m.fin.campeon) campeones++;
  if(m.hist[0] && m.hist[0].gane) pasaR1++;
}
const vis = 100*suma/N, real = 100*campeones/N, vis1 = 100*sumaR1/N, real1 = 100*pasaR1/N;
console.log(`6) ${N} Mundiales: campeón se veía ${vis.toFixed(1)}% y salió ${real.toFixed(1)}% · octavos se veía ${vis1.toFixed(1)}% y salió ${real1.toFixed(1)}%`);
const tol = 3*Math.sqrt(Math.max(.01, vis/100*(1 - vis/100))/N)*100 + 1;
ok(Math.abs(vis - real) <= tol, `el % de campeón no se cumple (${vis.toFixed(1)} vs ${real.toFixed(1)})`);
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
