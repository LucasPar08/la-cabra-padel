/* ¿Se pueden guardar, cambiar, editar y borrar varias carreras?
   Uso: node carreras.js nuevo.html */
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
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, irCrear, continuarPartida, guardar, render, listaCarreras, idCarreraActiva,
  jugarCarrera, guardarCopia, guardarEdicion, borrarCarrera, nuevaCarreraLista, guardarAhora, soltarCarrera, asegurarCarreras, vCarreras, pasarTrimestre,
  CARRERAS_KEY, CARRERA_PREF, MAX_CARRERAS, SAVE_KEY };`);
const errores = [];
const ok = (cond, txt) => { if(!cond) errores.push(txt); return cond; };
const crear = (nombre, pais) => { document.querySelector('#fnom').value = nombre; A.CFG.pais = pais; A.CFG.ciudad = null; A.irCrear(); A.CFG.ciudad = (A.S.j ? null : null); A.CFG.pais = pais; A.CFG.ciudad = undefined; A.crearYEmpezar(); };

/* 1) dos carreras, cada una en su hueco */
document.querySelector('#fnom').value = 'Lucas Park'; A.CFG.pais = 'AR'; A.crearYEmpezar();
const idA = A.S.j.idCarrera;
A.S.j.dinero = 12345; A.guardar();
ok(A.listaCarreras().length === 1, 'la primera carrera no quedó en la lista');
ok(A.idCarreraActiva() === idA, 'la carrera activa no es la primera');

document.querySelector('#fnom').value = 'Ana Torres'; A.CFG.pais = 'ES'; A.crearYEmpezar();
const idB = A.S.j.idCarrera;
A.S.j.dinero = 777; A.guardar();
let lista = A.listaCarreras();
ok(lista.length === 2, 'no hay dos carreras guardadas: ' + lista.length);
ok(idA !== idB, 'las dos carreras comparten hueco');
ok(A.idCarreraActiva() === idB, 'la activa no es la segunda');
console.log('1) dos carreras: ' + lista.map(c => `${c.nombre} (${c.resumen.pais}, ${c.resumen.jugador})`).join(' · '));

/* 2) volver a la primera sin perder la segunda */
A.jugarCarrera(idA);
ok(A.S.j && A.S.j.nombre === 'Lucas Park', 'no volvió a la primera carrera');
ok(A.S.j.dinero === 12345, 'la primera carrera no conserva su dinero');
const guardadoB = JSON.parse(store[A.CARRERA_PREF + idB] || 'null');
ok(guardadoB && guardadoB.j.nombre === 'Ana Torres' && guardadoB.j.dinero === 777, 'la segunda carrera se perdió al cambiar');
console.log('2) cambiar de carrera: juegas con ' + A.S.j.nombre + ' y la otra sigue guardada con ' + (guardadoB ? guardadoB.j.nombre : '—'));

/* 3) guardar una copia */
A.guardarCopia();
lista = A.listaCarreras();
ok(lista.length === 3, 'la copia no se guardó: ' + lista.length);
ok(A.idCarreraActiva() === idA, 'la copia cambió la carrera en juego');
const copia = lista.find(c => c.copia);
ok(copia && copia.resumen.jugador === 'Lucas Park', 'la copia no es de la carrera en juego');
console.log('3) copia: ' + (copia ? copia.nombre : 'ninguna'));

/* 4) editar nombres */
document.querySelector('#ecNom').value = 'Camino al top 1';
document.querySelector('#ecJug').value = 'Lucas Parque';
A.guardarEdicion(idA);
lista = A.listaCarreras();
const edit = lista.find(c => c.id === idA);
ok(edit && edit.nombre === 'Camino al top 1', 'no cambió el nombre de la carrera');
ok(edit && edit.resumen.jugador === 'Lucas Parque', 'no cambió el nombre del jugador en la lista');
ok(A.S.j.nombre === 'Lucas Parque', 'no cambió el nombre del jugador en la partida');
ok(JSON.parse(store[A.SAVE_KEY]).j.nombre === 'Lucas Parque', 'el nombre nuevo no se guardó');
console.log('4) editar: ' + edit.nombre + ' · ' + edit.resumen.jugador);

/* 5) borrar la copia y borrar la carrera en juego */
A.borrarCarrera(copia.id);
lista = A.listaCarreras();
ok(lista.length === 2 && !store[A.CARRERA_PREF + copia.id], 'la copia no se borró');
A.borrarCarrera(idA);
lista = A.listaCarreras();
ok(lista.length === 1 && lista[0].id === idB, 'no quedó solo la otra carrera');
ok(!A.S.j, 'sigue cargada una carrera borrada');
ok(!store[A.SAVE_KEY], 'la carrera borrada sigue siendo la activa');
console.log('5) borrar: queda ' + lista[0].nombre + ' · sin carrera cargada ✓');

/* 6) el tope de carreras */
for(let i = 0; A.listaCarreras().length < A.MAX_CARRERAS && i < 20; i++){ document.querySelector('#fnom').value = 'Prueba ' + i; A.CFG.pais = 'MX'; A.crearYEmpezar(); }
ok(A.listaCarreras().length === A.MAX_CARRERAS, 'no se llenó la lista: ' + A.listaCarreras().length);
A.S.pantalla = 'carreras'; A.nuevaCarreraLista();
ok(A.S.pantalla === 'carreras', 'deja empezar otra carrera con la lista llena');
console.log('6) tope: ' + A.listaCarreras().length + ' carreras y avisa en vez de dejar empezar otra');

/* 7) una partida de la versión de Vercel entra en la lista */
for(const k of Object.keys(store)) delete store[k];
const saves = fs.readdirSync(path.join(D, 'saves-v1')).filter(f => f.endsWith('.json'));
store[A.SAVE_KEY] = fs.readFileSync(path.join(D, 'saves-v1', saves[0]), 'utf8');
lista = A.listaCarreras();
ok(lista.length === 1, 'la partida vieja no entró en la lista');
A.continuarPartida();
ok(A.S.j && A.S.j.idCarrera && A.listaCarreras().length === 1, 'la partida vieja no se puede seguir jugando');
console.log('7) partida vieja (' + saves[0] + '): entra como "' + lista[0].nombre + '" y se sigue jugando ✓');

/* 8) cuánto ocupa cada carrera */
A.guardar();
const tam = Object.keys(store).filter(k => k.startsWith(A.CARRERA_PREF)).map(k => store[k].length);
console.log('8) tamaño de cada carrera: ' + tam.map(t => (t/1024).toFixed(0) + ' kB').join(' · ') + ` (tope del navegador ~5000 kB para ${A.MAX_CARRERAS} carreras)`);

/* 9) la pantalla se pinta */
A.S.pantalla = 'carreras'; const html = A.vCarreras();
ok(html.includes('MIS CARRERAS') && html.includes('GUARDAR'), 'la pantalla de carreras no se pinta');
console.log('9) pantalla de carreras: ' + html.length + ' caracteres, se pinta ✓');

console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
