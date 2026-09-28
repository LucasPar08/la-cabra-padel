/* ¿El desafío del día funciona? Los tres tipos, el premio, la racha y el reintento.
   Uso: node desafio.js nuevo.html */
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
eval(js + `;global.A = { get S(){ return S; }, get P(){ return P; }, get PREF(){ return PREF; }, get CFG(){ return CFG; }, crearYEmpezar, desafioDeHoy, jugarDesafio, cerrarDesafio, desafioHTML, vDesafio,
  estadoDesafio, hoyTexto, ayerTexto, premioDesafio, actualizar, render, vInicio, vTemporada, aspectoHTML, figuraSVG, aspectoJugador };`);
const errores = [];
const ok = (c, t) => { if(!c) errores.push(t); return c; };
/* 1) el desafío de hoy es siempre el mismo */
const d1 = A.desafioDeHoy(), d2 = A.desafioDeHoy();
ok(JSON.stringify(d1) === JSON.stringify(d2), 'el desafío cambia dentro del mismo día');
console.log(`1) hoy (${A.hoyTexto()}): ${d1.tipo} · ${d1.tit}`);
/* 2) sin carrera: se juega de verdad (la máquina en tu lugar) y vuelve a su pantalla */
A.S.pantalla = 'inicio';
ok(A.desafioHTML().includes('DESAFÍO DEL DÍA'), 'la tarjeta no se pinta');
A.jugarDesafio(); A.P.humanoIA = true;
let n = 0; while(A.P && n++ < 120*3600) A.actualizar(1/120);
ok(!A.P && A.S.pantalla === 'desafio', 'al terminar no va a la pantalla del desafío');
ok(A.vDesafio().includes('DESAFÍO DEL DÍA'), 'la pantalla del desafío no se pinta');
console.log(`2) jugado por la máquina: ${A.S.desafioRes.ok ? 'cumplido' : 'no cumplido'} · racha ${A.estadoDesafio().racha}`);
/* 3) con carrera: premio y racha, para los tres tipos */
document.querySelector('#fnom').value = 'Lucas Park'; A.CFG.pais = 'AR'; A.crearYEmpezar();
const j = A.S.j;
const tipos = [{ tipo:'drill', id:'bandeja', obj:8, tit:'x', d:'x' }, { tipo:'rival', k:0, tit:'x', d:'x' }, { tipo:'limpio', tit:'x', d:'x' }];
const resOk = { drill: { drill:{ aciertos:9 } }, rival: { gano:true }, limpio: { gano:true, sets:[[3,0]] } };
const resMal = { drill: { drill:{ aciertos:7 } }, rival: { gano:false }, limpio: { gano:true, sets:[[3,1]] } };
for(const d of tipos){
  A.PREF.desafio = null;
  A.S.desafio = d; A.cerrarDesafio(d.tipo === 'drill' ? { drill:{ aciertos:7 } } : resMal[d.tipo]);
  ok(!A.S.desafioRes.ok, 'da por cumplido un desafío fallado: ' + d.tipo);
  const antes = j.dinero;
  A.S.desafio = d; A.cerrarDesafio(d.tipo === 'drill' ? { drill:{ aciertos:9 } } : resOk[d.tipo]);
  ok(A.S.desafioRes.ok && j.dinero === antes + A.premioDesafio(1), 'no paga el premio al cumplir: ' + d.tipo);
}
console.log(`3) los tres tipos: fallado no paga, cumplido paga ${A.premioDesafio(1)}`);
/* 4) racha: si lo cumpliste ayer, sube; no se cobra dos veces el mismo día */
A.PREF.desafio = { f: A.ayerTexto(), racha: 3, mejor: 3, total: 3 };
let antes = j.dinero; A.S.desafio = tipos[1]; A.cerrarDesafio({ gano:true });
ok(A.estadoDesafio().racha === 4 && j.dinero === antes + A.premioDesafio(4), 'la racha no sube o no paga según la racha');
antes = j.dinero; A.S.desafio = tipos[1]; A.cerrarDesafio({ gano:true });
ok(j.dinero === antes && A.estadoDesafio().racha === 4, 'se cobra dos veces el mismo día');
A.PREF.desafio = { f: '2000-1-1', racha: 9, mejor: 9, total: 9 };
A.S.desafio = tipos[1]; A.cerrarDesafio({ gano:true });
ok(A.estadoDesafio().racha === 1 && A.estadoDesafio().mejor === 9, 'la racha no vuelve a 1 tras saltarse días');
console.log(`4) racha: 3 → 4 con premio ${A.premioDesafio(4)} · sin cobrar dos veces · tras saltarse días vuelve a 1`);
/* 5) las pantallas con todo lo nuevo se pintan */
A.S.pantalla = 'temporada';
ok(A.vTemporada().includes('DESAFÍO DEL DÍA'), 'la temporada no muestra el desafío');
for(const dis of ['lisa', 'rayas', 'franja', 'bandera']) for(const pd of ['lisa', 'rayo', 'aro', 'degradado']){
  A.PREF.aspecto = Object.assign(A.aspectoJugador(), { diseno: dis, palaDiseno: pd, zapas:'#E4572E' });
  const svg = A.figuraSVG(A.aspectoJugador(), false);
  ok(svg.includes('#E4572E') && (dis !== 'bandera' || svg.includes('#74ACDF')), 'la figura no lleva el diseño: ' + dis + '/' + pd);
}
ok(A.aspectoHTML().includes('ZAPATILLAS') && A.aspectoHTML().includes('BANDERA'), 'la pantalla de tu jugador no ofrece los diseños');
console.log('5) temporada con desafío · 16 combinaciones de camiseta y pala · zapatillas de color · camiseta con la bandera de Argentina');
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
