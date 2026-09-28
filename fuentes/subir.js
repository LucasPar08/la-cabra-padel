/* ¿Cuánto sube el % de ganar de un mismo partido con más ayuda en la simulación? */
const fs = require('fs');
const js = fs.readFileSync(process.argv[2], 'utf8').split('<script>')[1].split('</script>')[0];
const N = +(process.argv[3] || 3000), SIMS = (process.env.SIMS || '2,2.5,3').split(',').map(Number), NIVEL = +(process.env.NIVEL || 60);
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
eval(js + `;global.A = { get S(){ return S; }, crearYEmpezar, torneosDelTrimestre, estadoTorneo, abrirTorneo, inscribirse, simularPartido, TIERS, DIFICULTADES, STAT_KEYS };`);
A.crearYEmpezar();
const S = A.S, j = S.j;
for(const k of A.STAT_KEYS) j.stats[k] = NIVEL;
j.pareja.nivel = NIVEL - 2;
const ev = A.torneosDelTrimestre().find(e => A.estadoTorneo(j, e).tipo === 'directo');
A.abrirTorneo(ev.id); A.inscribirse();
const base = S.torneo.rival, R = A.TIERS[ev.t].rondas;
const tasa = (r, sim, n) => { A.DIFICULTADES.normal.sim = sim; const riv = Object.assign({}, base, { rating:r }); let g = 0; for(let i = 0; i < n; i++) if(A.simularPartido(j, riv, ev, 0, R).gane) g++; return g/n; };
const scan = []; for(let r = 25; r <= 110; r += 1) scan.push([r, tasa(r, 1.5, 500)]);
const logit = (p, k) => { const q = Math.min(.995, Math.max(.005, p)); return 1/(1 + (1 - q)/q*Math.exp(-k)); };
const pc = x => String(Math.round(100*x)).padStart(3) + '%';
console.log(`nivel ${NIVEL} · ahora | ${SIMS.map(x => ('sim ' + x).padEnd(7)).join('')}| logit+.3 logit+.45`);
for(const obj of [.05,.1,.2,.3,.4,.5,.6,.7,.8,.9,.95]){
  const r = scan.reduce((a, x) => Math.abs(x[1] - obj) < Math.abs(a[1] - obj) ? x : a)[0];
  const b = tasa(r, 1.5, N);
  console.log(`         ${pc(b)} | ${SIMS.map(s => pc(tasa(r, s, N)) + '   ').join('')}| ${pc(logit(b,.3))}    ${pc(logit(b,.45))}`);
}
