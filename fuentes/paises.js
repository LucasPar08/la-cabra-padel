/* ¿Da igual de qué país seas? Mismas estadísticas al empezar, misma pista elegida y los mismos torneos en casa.
   Uso: node paises.js nuevo.html */
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
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, crearYEmpezar, nuevoJugador, cambiarPais, PAISES, STAT_KEYS, ESTILOS,
  generarTemporada, paisDe, vCrear, bonoEstilo, ciudadesDe, render };`);
const errores = [];
const ok = (c, t) => { if(!c) errores.push(t); return c; };
const semilla = v => { Math.random = () => v; };
const real = Math.random;

/* 1) con las mismas decisiones, dos jugadores de países distintos salen iguales */
const base = { nombre:'Bot', genero:'M', mano:'D', posicion:'reves', estilo:'rematador', pistaFav:'indoor' };
const fichas = {};
for(const p of A.PAISES){
  semilla(0.5);
  const j = A.nuevoJugador(Object.assign({}, base, { pais: p.id, ciudad: A.ciudadesDe(p.id)[0].n }));
  fichas[p.id] = A.STAT_KEYS.map(k => j.stats[k]).join('-');
}
Math.random = real;
const distintos = [...new Set(Object.values(fichas))];
ok(distintos.length === 1, 'los países no empiezan iguales: ' + distintos.length + ' arranques distintos');
console.log(`1) ${A.PAISES.length} países, mismas decisiones → mismas estadísticas: ${distintos[0]}`);

/* 2) el bono de salida lo da el estilo, y es el mismo para todos los estilos */
const sumas = Object.keys(A.ESTILOS).map(k => Object.values(A.bonoEstilo(A.ESTILOS[k])).reduce((a, b) => a + b, 0));
ok(new Set(sumas).size === 1 && sumas[0] === 3, 'los estilos no reparten los mismos puntos: ' + sumas.join(','));
console.log(`2) cada estilo reparte ${sumas[0]} puntos, ni uno más`);

/* 3) elegir país ya no te pisa la pista favorita */
A.CFG.pistaFav = 'exterior';
A.cambiarPais('ES'); ok(A.CFG.pistaFav === 'exterior', 'España te cambió la pista a indoor');
A.cambiarPais('AR'); ok(A.CFG.pistaFav === 'exterior', 'Argentina te cambió la pista');
A.CFG.pistaFav = 'altura'; A.cambiarPais('SE' in {} ? 'SE' : 'MX');
ok(A.CFG.pistaFav === 'altura', 'cambiar de país te pisó la pista de altura');
console.log('3) cambias de país y tu pista favorita no se toca');

/* 4) la gira de casa se juega en TU pista, y todos tienen los mismos torneos en casa */
const casas = {};
for(const p of ['ES', 'AR', 'GQ', 'NI']){
  for(const pf of ['indoor', 'exterior']){
    A.CFG.pais = p; A.CFG.ciudad = A.ciudadesDe(p)[0].n; A.CFG.pistaFav = pf;
    document.querySelector('#fnom').value = 'Bot ' + p;
    A.crearYEmpezar();
    const j = A.S.j, cal = A.generarTemporada(j);
    const enCasa = [], pistas = new Set();
    for(const tri of cal) for(const g of tri.giras) for(const ev of g.torneos){
      if(ev.pais === j.pais){ enCasa.push(ev); pistas.add(ev.pista); }
    }
    casas[p + '/' + pf] = { n: enCasa.length, pistas: [...pistas].join(',') };
    ok(pistas.size <= 1 && (!pistas.size || [...pistas][0] === pf), `la gira de casa de ${p} no se juega en tu pista (${[...pistas].join(',')})`);
  }
}
const cuentas = [...new Set(Object.values(casas).map(x => x.n))];
ok(cuentas.length === 1, 'unos juegan más veces en casa que otros: ' + JSON.stringify(casas));
console.log(`4) todos juegan ${cuentas[0]} torneos en casa por temporada, y en la pista que eligieron`);

/* 5) la pantalla de crear ya no vende ventajas de país */
A.CFG.pais = 'ES'; A.CFG.ciudad = A.ciudadesDe('ES')[0].n;
const html = A.vCrear();
ok(html.includes('no te da ni te quita nivel'), 'la pantalla no aclara que el país no da ventaja');
ok(html.includes('Pista favorita'), 'ya no se puede elegir la pista');
console.log('5) en la pantalla de crear: pista favorita a mano y aviso de que el país no suma');
console.log(errores.length ? '❌ ' + errores.join(' | ') : '✅ sin errores');
process.exit(errores.length ? 1 : 0);
