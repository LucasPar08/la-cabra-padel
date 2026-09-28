/* Prueba de exactitud: para rivales que muestran distintos %, se juega la MISMA ronda miles de veces
   (con momentos clave de cualquier forma) y se compara lo que se ganó con el % que se veía.
   MITAD=1 → los minijuegos se empiezan (una bola, un golpe, un camino) y se simulan a medias · PSICO=1 → con psicólog@ */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const N = +(process.argv[3] || 4000), MITAD = !!+(process.env.MITAD || 0), PSICO = !!+(process.env.PSICO || 0);
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
eval(js + `;global.A = { get S(){ return S; }, crearYEmpezar, torneosDelTrimestre, estadoTorneo, abrirTorneo, inscribirse, jugarRonda, simularMomento,
  leerZonaMomento, elegirCaminoMomento, continuarMomento, probPartido, pegarRafaga, STAT_KEYS };`);
const gaussP = () => { let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };

A.crearYEmpezar();
const S = A.S, j = S.j;
for(const k of A.STAT_KEYS) j.stats[k] = 60;
j.pareja.nivel = 58;
if(PSICO) j.equipo.psico = true;
const ev = A.torneosDelTrimestre().find(e => A.estadoTorneo(j, e).tipo === 'directo');
A.abrirTorneo(ev.id); A.inscribirse();
const base = JSON.parse(JSON.stringify(S.torneo));
const jBase = JSON.parse(JSON.stringify(j));

/* rivales que dan porcentajes repartidos de punta a punta */
const objetivos = [5, 20, 35, 50, 65, 80, 90, 97], casos = [];
for(const obj of objetivos){
  let mejor = null;
  for(let r = 35; r <= 100; r += 0.5){
    const riv = Object.assign(JSON.parse(JSON.stringify(base.rival)), { rating: r, _prob: null });
    const p = A.probPartido(j, riv, base.ev);
    if(!mejor || Math.abs(p - obj) < Math.abs(mejor._prob - obj)) mejor = riv;
  }
  if(!casos.some(c => c._prob === mejor._prob)) casos.push(mejor);
}

console.log(`modo: ${MITAD ? 'minijuegos empezados y simulados a medias' : 'minijuegos completos (pista y ráfaga simuladas)'}${PSICO ? ' · con psicólog@' : ''}`);
S.silencio = true;
for(const riv of casos){
  const cuenta = { total:[0,0], sin:[0,0], pista:[0,0], leer:[0,0], camino:[0,0], tiempo:[0,0] };
  for(let t = 0; t < N; t++){
    Object.assign(S.j, JSON.parse(JSON.stringify(jBase)));
    S.torneo = JSON.parse(JSON.stringify(base));
    S.torneo.rival = JSON.parse(JSON.stringify(riv));
    S.pantalla = 'torneo';
    A.jugarRonda();
    const m = S.torneo.momento, forma = m ? m.forma : 'sin';
    if(m){
      if(forma === 'leer'){ for(let k = 0; k < (MITAD ? 1 : 4) && !m.eleccion; k++){ const b = m.leer.bolas[m.leer.k]; A.leerZonaMomento(b.post.indexOf(Math.max(...b.post))); } }
      else if(forma === 'camino'){ for(let k = 0; k < (MITAD ? 1 : 6) && !m.eleccion; k++){ const c = m.camino, libres = [...Array(c.casillas).keys()].filter(i => !c.falladas.includes(i) && i !== c.pista); A.elegirCaminoMomento(libres[Math.floor(Math.random()*libres.length)]); } }
      else if(forma === 'tiempo' && MITAD){ const R = m.rafaga, g = R.golpes[R.i]; A.pegarRafaga(Math.min(1, Math.max(0, g.centro + gaussP()*0.12))); }
      if(m.eleccion) A.continuarMomento(); else A.simularMomento();      // lo que quede (o pista y ráfaga enteras), simulado
    }
    const r = S.torneo.partidos[0], g = r && r.gane ? 1 : 0;
    cuenta.total[0] += g; cuenta.total[1]++;
    cuenta[forma][0] += g; cuenta[forma][1]++;
  }
  const pc = x => x[1] ? (100*x[0]/x[1]).toFixed(1) + '%' : '—';
  console.log(`mostraba ${riv._prob}% → ganó ${pc(cuenta.total)} de ${N} · sin momento ${pc(cuenta.sin)} · pista ${pc(cuenta.pista)} · leer ${pc(cuenta.leer)} · camino ${pc(cuenta.camino)} · ráfaga ${pc(cuenta.tiempo)}`);
}
