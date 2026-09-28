/* Formatos del partido rápido (3/4/6 juegos · 1 o 3 sets) y posiciones fijas: la máquina juega los cuatro puestos */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const N = +(process.argv[3] || 6);
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.C = { australiana:0, sacesTuyos:0 };
eval(js + `;global.A = { get S(){ return S; }, get P(){ return P; }, get PREF(){ return PREF; }, partidoRapido, actualizar };
const __ps = prepararSaque; prepararSaque = function(r){ const x = __ps(r); const s = P.jug[P.saqueDe]; if(s.humano && !r){ C.sacesTuyos++; if(s.x > 5) C.australiana++; } return x; };`);
let malos = 0, total = 0, tbs = 0, carrilMal = 0, enSuLado = 0, muestras = 0;
for(const pos of ['reves', 'drive']) for(const juegos of [3, 4, 6]) for(const sets of [1, 3]){
  const marcas = [];
  for(let i = 0; i < N; i++){
    A.S.pantalla = 'inicio'; Object.assign(A.PREF, { juegos, sets, posicion: pos, tutorial:true });
    A.partidoRapido(); const P = A.P; P.humanoIA = true;
    for(const k of [2,3]) Object.assign(P.jug[k], { hab:P.jug[1].hab, vel:P.jug[1].vel, reaccion:P.jug[1].reaccion, alcance:P.jug[1].alcance, multFallo:P.jug[1].multFallo });
    const yo = P.jug[0], base = pos === 'drive' ? 'der' : 'izq';
    let pasos = 0;
    while(A.P && pasos++ < 120*20000){
      A.actualizar(1/120);
      if(!A.P) break;
      if(yo.carril !== base) carrilMal++;
      if(A.P.estado === 'juego' && A.P.t - A.P.tGolpe > 1.2 && pasos % 12 === 0){ muestras++; if((yo.x < 5) === (base === 'izq')) enSuLado++; }
    }
    const r = A.S.rapido; total++;
    const G = r.sets.map(s => s.slice()), ganaSets = [0,0];
    let ok = true;
    for(const [a, b] of G){
      const mx = Math.max(a, b), mn = Math.min(a, b);
      if(!((mx === juegos && mn <= juegos - 2) || (mx === juegos + 1 && (mn === juegos - 1 || mn === juegos)))) ok = false;
      if(mx === juegos + 1 && mn === juegos) tbs++;
      ganaSets[a > b ? 0 : 1]++;
    }
    const necesita = sets === 3 ? 2 : 1;
    if(Math.max(...ganaSets) !== necesita || (ganaSets[0] > ganaSets[1]) !== r.gano) ok = false;
    if(!ok){ malos++; console.log('  ⚠️ marcador raro:', JSON.stringify(G), r.gano); }
    marcas.push(G.map(s => s.join('-')).join(' '));
  }
  console.log(`${pos.padEnd(6)} ${juegos} juegos · ${sets === 3 ? 'mejor de 3' : '1 set    '} → ${marcas.join(' | ')}`);
}
console.log(`\n${total} partidos · marcadores válidos: ${total - malos}/${total} · sets decididos en tie-break: ${tbs}`);
console.log(`posición: el carril cambió ${carrilMal} veces · en pleno punto estabas en tu lado el ${(100*enSuLado/muestras).toFixed(1)}% del tiempo`);
console.log(`saques tuyos: ${C.sacesTuyos} · desde el otro lado (con tu pareja en la red de su lado): ${C.australiana}`);
