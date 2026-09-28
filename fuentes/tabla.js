/* ¿La tabla "tus chances, ronda a ronda" dice la verdad? Se abre un torneo, se guarda su tabla y se juega ESE MISMO
   torneo miles de veces (todo simulado: rondas, momentos clave y el cuadro del Major eligiendo caminos al azar).
   Ronda a ronda se compara lo que decía la tabla con lo que pasó.
   Uso: TIER=MJ PREVIA=1 NIVEL=70 node tabla.js nuevo.html 3000 */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const N = +(process.argv[3] || 2000), TIER = process.env.TIER || 'FIP2', PREVIA = !!+(process.env.PREVIA || 0), NIVEL = +(process.env.NIVEL || 65);
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
eval(js + `;global.A = { get S(){ return S; }, crearYEmpezar, torneosDelTrimestre, estadoTorneo, inscribirse, jugarRonda, simularMomento, elegirCasilla, cerrarCuadro,
  chanceTitulo, probPartido, vTorneo, STAT_KEYS, TIERS, NOM_RONDA };`);

A.crearYEmpezar();
const S = A.S, j = S.j;
for(const k of A.STAT_KEYS) j.stats[k] = NIVEL;
j.pareja.nivel = NIVEL - 2;
j.edad = 24;                                   // con 19 o menos el ranking cuenta la mitad y se entra directo
j.ranking = PREVIA ? A.TIERS[TIER].acc*3 : Math.max(1, Math.round(A.TIERS[TIER].acc/2));
const ev = Object.assign({}, A.torneosDelTrimestre()[0], { t: TIER, id: 'prueba-' + TIER, nom: 'Torneo de prueba' });
S.verTorneo = ev; S.pantalla = 'torneo';
const est = A.estadoTorneo(j, ev);
const t0 = Date.now(); A.vTorneo(); const ms = Date.now() - t0;            // al mirarlo se sortea y se calculan las chances
A.inscribirse();
if(!S.torneo){ console.log('no se pudo inscribir:', JSON.stringify(est)); process.exit(1); }
const tabla = A.chanceTitulo(S.torneo.ev, S.torneo.sorteo, null);
const snap = JSON.stringify(S);
const cuenta = tabla.pasos.map(() => ({ llego:0, gano:0 }));
let titulos = 0, errores = 0, distintos = 0, lesiones = 0;
for(let t = 0; t < N; t++){
  const nuevo = JSON.parse(snap);
  for(const k of Object.keys(S)) delete S[k];
  Object.assign(S, nuevo); S.silencio = true;
  for(let g = 0; g < 300 && S.torneo && !S.torneo.fin; g++){
    const to = S.torneo, p = S.pantalla;
    if(p === 'torneo'){
      const i = A.chanceTitulo(to.ev, to.sorteo, to).hechos;
      if(!tabla.pasos[i].cuadroMJ && A.probPartido(S.j, to.rival, to.ev) !== Math.round(100*tabla.pr[i])) distintos++;
      A.jugarRonda();
    } else if(p === 'momento') A.simularMomento();
    else if(p === 'cuadro'){
      const c = S.cuadro;
      if(c.terminado) A.cerrarCuadro();
      else { const r = c.rondas[c.actual], libres = [...Array(r.casillas).keys()].filter(i => !(r.falladas || []).includes(i) && i !== r.pista); A.elegirCasilla(libres[Math.floor(Math.random()*libres.length)]); }
    } else { errores++; break; }
  }
  const to = S.torneo;
  if(!to || !to.fin){ errores++; continue; }
  const ch = A.chanceTitulo(to.ev, to.sorteo, to), campeon = !!to.fin.r.campeon, ganadas = campeon ? ch.pasos.length : ch.hechos;
  if(to.lesionado) lesiones++;
  for(let i = 0; i < ch.pasos.length; i++){
    if(i < ganadas){ cuenta[i].llego++; cuenta[i].gano++; }
    else if(i === ganadas && !campeon && !to.lesionado) cuenta[i].llego++;
  }
  if(campeon) titulos++;
}
const T = A.TIERS[TIER], pc = x => (100*x).toFixed(1) + '%';
console.log(`${TIER}${PREVIA ? ' con previa' : ''} · nivel ${NIVEL} · el mismo torneo ${N} veces · la tabla tardó ${ms} ms en calcularse`);
tabla.pasos.forEach((p, i) => {
  const nom = p.previa ? 'PREV ' + (p.k + 1) : A.NOM_RONDA[T.rondas][p.k] + (p.cuadroMJ ? ' (cuadro)' : '');
  const x = cuenta[i];
  console.log(`  ${nom.padEnd(20)} tabla ${pc(tabla.pr[i]).padStart(6)} → real ${x.llego ? pc(x.gano/x.llego).padStart(6) : '     —'}  (${x.gano}/${x.llego})`);
});
const iFinal = tabla.pasos.findIndex(p => p.final);
console.log(`  llegar a la final: tabla ${pc(tabla.final)} → real ${pc(cuenta[iFinal].llego/N)} · ganar el torneo: tabla ${pc(tabla.titulo)} → real ${pc(titulos/N)}${lesiones ? ` · ${lesiones} lesiones` : ''}`);
console.log(distintos ? `⚠️ ${distintos} rondas con un % distinto al de la tabla` : '✅ cada ronda se decidió con el % exacto de la tabla');
console.log(errores ? `⚠️ ${errores} torneos con errores` : '✅ sin errores');
