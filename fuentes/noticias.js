/* ¿Las noticias del circuito dicen quién ganó de verdad? Los torneos que jugaste tú
   respetan tu resultado: si ganaste, el campeón eres tú; si perdiste la final, ganó quien
   te ganó; y nunca sale otra pareja ganando un torneo que ganaste. Uso: node noticias.js nuevo.html [carreras] [años] */
const fs = require('fs'), path = require('path');
const archivo = process.argv[2] || 'nuevo.html', CARRERAS = +(process.argv[3] || 2), ANIOS = +(process.argv[4] || 4);
const js = fs.readFileSync(path.join(__dirname, archivo), 'utf8').split('<script>')[1].split('</script>')[0];
const store = {}; const el = () => ({ innerHTML:'', value:'Bot', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, YO, TIERS, crearYEmpezar, trimActual, elegirPorMi, salirTorneo, simularHastaElFinal, simularMomento,
  pasarTrimestre, elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada, resolverDuelo, cerrarDuelo, vTemporada, vTorneo, cerrarCuadro, elegirCasilla,
  asegurarCircuito, torneosDelTrimestre, simularTrimestreCircuito, hacerNoticias, wDe };
  const __sim = simularTrimestreCircuito;
  simularTrimestreCircuito = function(j, pool, w, jugados, evs){ const res = __sim(j, pool, w, jugados, evs); global.ULTIMO = { jugados: (jugados || []).slice(), res }; return res; };`);
const errores = []; const ok = (c, t) => { if(!c && errores.length < 12) errores.push(t); return c; };
const que = ev => ev.t === 'FIN' ? 'las Finals' : 'el ' + ev.nom;
const nombre = p => p ? (p.yo ? 'TÚ' : p.nombre + ' / ' + p.nombre2) : '—';
/* un torneo entero, con los minijuegos que salgan por el camino */
function jugarTorneo(){
  for(let g = 0; A.S.torneo && !A.S.torneo.fin; g++){
    if(g > 300) throw new Error('torneo sin terminar en ' + A.S.pantalla);
    const p = A.S.pantalla;
    if(p === 'momento') A.simularMomento();
    else if(p === 'cuadro'){ const c = A.S.cuadro; if(c.terminado) A.cerrarCuadro(); else { const r = c.rondas[c.actual], libres = [...Array(r.casillas).keys()].filter(i => !(r.falladas||[]).includes(i) && i !== r.pista); A.elegirCasilla(libres[0]); } }
    else if(p === 'duelo'){ if(A.S.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
    else A.simularHastaElFinal();
  }
}

/* 1) a mano: un Major del trimestre con cada resultado posible */
document.querySelector('#fnom').value = 'Bot'; A.CFG.pais = 'AR'; A.crearYEmpezar();
{
  const j = A.S.j, pool = A.asegurarCircuito(j), w = A.wDe(j);
  let evs = []; for(let q = 0; q < 4 && !evs.some(ev => ev.t === 'MJ' || ev.t === 'P1'); q++){ j.trimestre = q; evs = A.torneosDelTrimestre(); }
  const ev = evs.find(ev => ev.t === 'MJ') || evs.find(ev => ev.t === 'P1'), R = A.TIERS[ev.t].rondas;
  const casos = [
    { txt:'ganas la final al nº 1',          mio:{ id:ev.id, t:ev.t, nom:ev.nom, campeon:true,  rondas:R,   rival:pool[0].id } },
    { txt:'ganas la final a una pareja de fuera', mio:{ id:ev.id, t:ev.t, nom:ev.nom, campeon:true, rondas:R, rival:null, rivalNom:['Ana Pérez','Eva Gil'] } },
    { txt:'pierdes la final con el nº 3',    mio:{ id:ev.id, t:ev.t, nom:ev.nom, campeon:false, rondas:R-1, rival:pool[2].id } },
    { txt:'pierdes la final con una de fuera', mio:{ id:ev.id, t:ev.t, nom:ev.nom, campeon:false, rondas:R-1, rival:null, rivalNom:['Ana Pérez','Eva Gil'] } },
    { txt:'pierdes en semis con el nº 8',    mio:{ id:ev.id, t:ev.t, nom:ev.nom, campeon:false, rondas:R-2, rival:pool[7].id } },
    { txt:'caes en la previa',               mio:{ id:ev.id, t:ev.t, nom:ev.nom, campeon:false, rondas:-1, rival:null, cayoEnPrevia:true } },
  ];
  for(const c of casos) for(let k = 0; k < 40; k++){
    const copia = JSON.parse(JSON.stringify(pool)), r = A.simularTrimestreCircuito(j, copia, w, [c.mio], evs).find(x => x.ev.id === ev.id);
    const rival = c.mio.rival ? copia.find(p => p.id === c.mio.rival) : null;
    if(c.mio.campeon){
      ok(r && r.campeon === A.YO, `${c.txt}: el campeón sale ${nombre(r && r.campeon)}`);
      ok(r && (rival ? r.finalista === rival : r.finalista && r.finalista.nombre === 'Ana Pérez'), `${c.txt}: el finalista sale ${nombre(r && r.finalista)}`);
      ok(!copia.some(p => p.titulos > (pool.find(x => x.id === p.id) || {}).titulos && (p.hist || []).some(h => h.w === w && h.pts >= A.TIERS[ev.t].pts[0])), `${c.txt}: otra pareja suma el título`);
    } else if(c.mio.rondas === R - 1){
      ok(r && (rival ? r.campeon === rival : r.campeon && r.campeon.nombre === 'Ana Pérez'), `${c.txt}: el campeón sale ${nombre(r && r.campeon)}`);
      ok(r && r.finalista === A.YO, `${c.txt}: el finalista sale ${nombre(r && r.finalista)}`);
    } else if(c.mio.rondas === R - 2){
      ok(!r || (r.campeon !== A.YO && r.finalista !== A.YO), `${c.txt}: sales en la final`);
      ok(!r || !r.campeon || r.campeon === rival || r.finalista === rival || r.finalista === null || r.campeon.id !== undefined, `${c.txt}: incoherente`);
      ok(rival && rival.hist.some(h => h.w === w && h.pts >= A.TIERS[ev.t].pts[1]), `${c.txt}: quien te ganó no llega a la final`);
    } else ok(!r || (r.campeon !== A.YO && r.finalista !== A.YO), `${c.txt}: sales en la final`);
  }
  const copia = JSON.parse(JSON.stringify(pool)), res = A.simularTrimestreCircuito(j, copia, w, [casos[0].mio], evs);
  const items = A.hacerNoticias(j, copia, res, copia.slice(0, 20).map(p => p.id), copia[0].id, w).items.map(x => x.txt);
  ok(items[0] && items[0].includes('Ganáis ' + que(ev)), 'la noticia de tu título no sale la primera: ' + items[0]);
  ok(!items.some(t => t.includes('ganan ' + que(ev))), 'otra pareja sale ganando tu torneo');
  console.log(`1) a mano, ${ev.nom}: ${casos.length} casos × 40 · noticia: "${(items[0] || '').replace(/<[^>]+>/g, '')}"`);
  j.trimestre = 0;
}

/* 2) carreras de verdad, semana a semana: en cada cierre de trimestre se miran tus torneos */
let titulos = 0, finales = 0, perdidos = 0, cierres = 0;
for(let c = 0; c < CARRERAS; c++){
  document.querySelector('#fnom').value = 'Bot'; A.CFG.pais = 'AR'; A.CFG.dif = 'facil'; A.crearYEmpezar();
  const j = A.S.j;
  let pasos = 0;
  while(j.anio <= ANIOS && pasos++ < 30000){
    for(const k in j.stats) j.stats[k] = Math.max(j.stats[k], 92);           // un jugador muy bueno, para que gane cosas grandes
    const p = A.S.pantalla;
    global.ULTIMO = null;
    try{
      if(p === 'temporada'){ A.vTemporada(); if(A.elegirPorMi()){ jugarTorneo(); A.vTorneo(); A.salirTorneo(); } }
      else if(['torneo','momento','cuadro'].includes(p)){ jugarTorneo(); A.salirTorneo(); }
      else if(p === 'gira') A.pasarTrimestre();
      else if(p === 'evento'){ if(!A.S.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
      else if(p === 'finTemporada') A.irPretemporada();
      else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
      else if(p === 'duelo'){ if(A.S.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
      else if(p === 'retiro') break;
      else { errores.push('pantalla sin política: ' + p); break; }
    }catch(e){ errores.push(p + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); break; }
    if(!global.ULTIMO) continue;
    cierres++;
    const { jugados, res } = global.ULTIMO, items = ((j.noticias || {}).items || []).map(x => x.txt);
    for(const m of jugados){
      const r = res.find(x => x.ev.id === m.id); if(!r) continue;
      const R = A.TIERS[m.t].rondas, ev = r.ev;
      if(m.campeon){
        titulos++;
        ok(r.campeon === A.YO, `${ev.nom}: lo ganaste y el campeón sale ${nombre(r.campeon)}`);
        ok(items.some(t => t.includes('Ganáis ' + que(ev))), `${ev.nom}: lo ganaste y no sale en las noticias`);
        ok(!items.some(t => t.includes('ganan ' + que(ev))), `${ev.nom}: lo ganaste y las noticias dan otro campeón`);
      } else if(m.rondas === R - 1){
        finales++;
        ok(r.campeon && r.campeon !== A.YO && r.finalista === A.YO, `${ev.nom}: perdiste la final y sale ${nombre(r.campeon)} contra ${nombre(r.finalista)}`);
        if(m.rival) ok(r.campeon && r.campeon.id === m.rival, `${ev.nom}: perdiste la final y el campeón no es quien te ganó`);
      } else {
        perdidos++;
        ok(r.campeon !== A.YO && r.finalista !== A.YO, `${ev.nom}: no llegaste a la final y sales en ella`);
      }
    }
  }
}
console.log(`2) ${CARRERAS} carreras · ${cierres} cierres de trimestre · revisados ${titulos} títulos tuyos, ${finales} finales perdidas y ${perdidos} torneos perdidos antes`);
ok(titulos >= 3, 'casi no hubo títulos que revisar: ' + titulos);
console.log(errores.length ? '❌ ' + errores.join('\n   ') : '✅ las noticias dicen quién ganó de verdad');
process.exit(errores.length ? 1 : 0);
