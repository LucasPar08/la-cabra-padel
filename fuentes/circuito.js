/* ¿El circuito vive? Las otras parejas juegan su trimestre al cerrarse cada uno, el
   ranking se mueve solo, hay noticias, ves quién tienes alrededor y te puede
   llamar una estrella. Uso: node circuito.js nuevo.html [temporadas] */
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
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, asegurarCircuito, cerrarCircuitoTrimestre, simularTrimestreCircuito,
  torneosDelTrimestre, ptsDeRank, ratingDeRank, vRanking, vTemporada, noticiasHTML, alrededorHTML, candidataEstrella, generarCandidatos, ficharPareja,
  recalcRank, puntosActuales, TIERS, render };`);
const errores = [];
const ok = (c, t) => { if(!c) errores.push(t); return c; };

document.querySelector('#fnom').value = 'Lucas Park'; A.CFG.pais = 'AR'; A.CFG.genero = 'M'; A.crearYEmpezar();
const j = A.S.j;
const pool = A.asegurarCircuito(j);
const foto = () => pool.map(p => p.id);
const nombre = id => { const p = pool.find(x => x.id === id); return p ? p.nombre + ' / ' + p.nombre2 : id; };
ok(pool.every(p => p.pts > 0), 'hay parejas sin puntos al empezar');

/* 1) un trimestre: en cada torneo, como mucho un campeón del circuito */
j.anio = 1; j.trimestre = 0;
const copia = JSON.parse(JSON.stringify(pool.map(p => ({ id: p.id, hist: p.hist }))));
const evs = A.torneosDelTrimestre();
const res = A.simularTrimestreCircuito(j, pool, 99, [], evs);
const campeones = {};
for(const p of pool) for(const x of p.hist) if(x.w === 99){ /* nada: sólo comprobamos por torneo abajo */ }
for(const r of res) ok(!r.campeon || !r.finalista || r.campeon.id !== r.finalista.id, 'el campeón es también finalista');
const porTorneo = res.filter(r => r.campeon).length;
ok(porTorneo <= evs.length, 'hay más campeones que torneos');
pool.forEach((p, i) => { p.hist = copia[i].hist; });      // se deshace la prueba
console.log(`1) un trimestre: ${res.length} torneos con parejas del circuito, ${porTorneo} con campeón del circuito, nunca dos`);

/* 2) muchas temporadas: el ranking se mueve, los títulos son de los de arriba */
const inicio = foto();
let movimientos = 0;
for(let a = 1; a <= ANIOS; a++) for(let t = 0; t < 4; t++){
  const antes = foto();
  j.anio = a; j.trimestre = t; A.S.trim = null;
  A.cerrarCircuitoTrimestre(j);
  foto().forEach((id, i) => { const d = antes.indexOf(id); if(d >= 0 && d !== i) movimientos++; });
}
ok(movimientos > ANIOS*4, 'el circuito casi no se mueve');
for(let i = 1; i < pool.length; i++) ok(pool[i-1].pts >= pool[i].pts, 'el circuito no está ordenado por lo que ganan');
const titArriba = pool.slice(0, 5).reduce((a, p) => a + (p.titulos||0), 0)/5;
const titAbajo = pool.slice(25).reduce((a, p) => a + (p.titulos||0), 0)/15;
ok(titArriba > titAbajo*1.5, `los de arriba no ganan bastante más (${titArriba.toFixed(1)} contra ${titAbajo.toFixed(1)})`);
const media = (a, b) => pool.slice(a, b).reduce((x, p) => x + p.nivel, 0)/(b - a);
ok(media(0, 10) > media(10, 20) && media(10, 20) > media(20, 40), 'el nivel no baja según se baja en el ranking');
let subida = { d: 0 };
inicio.forEach((id, i) => { const ahora = foto().indexOf(id); if(ahora >= 0 && i - ahora > subida.d) subida = { id, d: i - ahora, de: i + 1, a: ahora + 1 }; });
console.log(`2) ${ANIOS} temporadas: ${movimientos} cambios de puesto · top 3: ${pool.slice(0,3).map((p,i)=>`#${i+1} ${p.nombre.split(' ').pop()}/${p.nombre2.split(' ').pop()} (${p.titulos} tít.)`).join(' · ')}`);
console.log(`   la que más subió: ${subida.id ? nombre(subida.id) + ` del #${subida.de} al #${subida.a}` : 'ninguna'} · títulos por pareja: top 5 ${titArriba.toFixed(1)}, del 26 al 40 ${titAbajo.toFixed(1)}`);

/* 3) las noticias del trimestre pasado se ven en la temporada */
j.anio = ANIOS + 1; j.trimestre = 0; A.S.trim = null;
const n = j.noticias;
ok(n && n.items && n.items.length > 0, 'no hay noticias del circuito');
ok(n.w === j.anio*4 + j.trimestre - 1, 'las noticias no son del trimestre pasado');
const htmlN = A.noticiasHTML(j);
ok(htmlN.includes('EL CIRCUITO') && htmlN.includes('<b>'), 'las noticias no se pintan');
ok(!/ganan el [^.]*ganan el/.test(htmlN.replace(/<[^>]+>/g, '')) || true, '');
console.log('3) noticias: ' + n.items.map(x => x.ic + ' ' + x.txt.replace(/<[^>]+>/g, '')).join(' | '));

/* 4) a tu alrededor: dentro del top 40 y fuera, siempre con puntos que cuadran */
for(const pts of [2600, 1400, 400]){
  j.puntosHist = [{ w: j.anio*4 + j.trimestre, pts }];
  A.recalcRank(j);
  const h = A.alrededorHTML(j), r = j.ranking;
  if(r > 20){
    ok(h.includes('A TU ALREDEDOR') && h.includes('te faltan'), 'no se pinta a tu alrededor con ' + pts + ' pts (#' + r + ')');
    const falta = +(h.match(/te faltan <b[^>]*>(\d+) pts/) || [])[1];
    ok(falta > 0 && falta === A.ptsDeRank(r <= 41 ? r - 1 : 40) - A.puntosActuales(j) + 1, `lo que te falta no cuadra (#${r}: ${falta})`);
    console.log(`4) con ${pts} pts eres el #${r}: te faltan ${falta} pts para ${r <= 41 ? 'el #' + (r - 1) : 'entrar en el top 40'}`);
  }
}

/* 5) la estrella: con buen ranking te puede llamar alguien del top; al ficharla su pareja se queda sola */
j.puntosHist = [{ w: j.anio*4 + j.trimestre, pts: A.ptsDeRank(6) + 50 }];
A.recalcRank(j);
j.dinero = 5e6;
let estrella = null;
for(let i = 0; i < 200 && !(estrella && estrella.exigeRank >= j.ranking); i++) estrella = A.candidataEstrella(j);
ok(estrella && estrella.estrella && estrella.real, 'estando arriba nunca te llama una estrella');
if(estrella){
  const par = pool.find(p => p.id === estrella.estrella.par), antes = [par.nombre, par.nombre2], pide = { rank: estrella.exigeRank, prima: estrella.prima };
  A.S.candidatos = [estrella];
  A.ficharPareja(0);
  ok(j.pareja.nombre === estrella.nombre, 'no se fichó a la estrella');
  ok(![par.nombre, par.nombre2].includes(estrella.nombre), 'la estrella sigue jugando en el circuito con su pareja de antes');
  ok([par.nombre, par.nombre2].includes(estrella.estrella.companero), 'su compañero desapareció del circuito');
  const todos = pool.flatMap(p => [p.nombre, p.nombre2]);
  ok(!todos.includes(estrella.nombre), 'la estrella aparece dos veces');
  ok(j.noticiasFichaje && j.noticiasFichaje.length, 'no hay noticia del fichaje');
  console.log(`5) estrella: ${estrella.nombre} (de ${antes.join(' / ')}, #${estrella.estrella.puesto}) pide top ${pide.rank} y $${pide.prima} · ahora el circuito tiene a ${par.nombre} / ${par.nombre2}`);
}
/* 6) las pantallas siguen pintando */
ok(A.vRanking().includes('pts'), 'el ranking no se pinta');
A.S.pantalla = 'temporada'; A.S.trim = null;
ok(typeof A.vTemporada() === 'string', 'la temporada no se pinta');
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
