/* ¿Las partidas guardadas con la versión que estaba en Vercel abren y se juegan en la nueva?
   Genera partidas con la v1 en distintos momentos y cada una se continúa con la versión nueva (proceso aparte).
   Uso: node migracion.js */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const D = __dirname, SAVES = path.join(D, 'saves-v1'), modo = process.argv[2] || 'todo';

function montar(archivo, guardado){
  const js = fs.readFileSync(path.join(D, archivo), 'utf8').split('<script>')[1].split('</script>')[0];
  const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
  const cache = {}, store = {};
  if(guardado) store.cabra_padel_v1 = guardado;
  global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 }, body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
  global.window = { scrollY:0, scrollTo(){} };
  global.localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => {};
  return { js, store };
}
const casillaLibre = r => [...Array(r.casillas).keys()].filter(i => !(r.falladas || []).includes(i) && i !== r.pista)[0];

function correrV1(){
  const { js, store } = montar('v1.html', null);
  eval(js + `;global.A = { get S(){ return S; }, crearYEmpezar, hacerGira, pasarTrimestre, elegirCasilla, cerrarCuadro, resolverDuelo, cerrarDuelo,
    elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada };`);
  fs.mkdirSync(SAVES, { recursive:true });
  A.crearYEmpezar();
  const vistas = {};
  let n = 0;
  for(let paso = 0; paso < 6000 && n < 16; paso++){
    const s = A.S, p = s.pantalla, j = s.j;
    if(store.cabra_padel_v1 && (vistas[p] || 0) < 3 && Math.random() < .5){
      vistas[p] = (vistas[p] || 0) + 1;
      fs.writeFileSync(path.join(SAVES, String(n++).padStart(2, '0') + '-' + p + '-año' + j.anio + '.json'), store.cabra_padel_v1);
    }
    if(p === 'retiro') break;
    if(p === 'temporada'){ const giras = s.cal[j.trimestre].giras; let hecho = false; for(let i = giras.length - 1; i >= 0 && !hecho; i--){ A.hacerGira(i); hecho = A.S.pantalla !== 'temporada'; } if(!hecho) A.pasarTrimestre(); }
    else if(p === 'gira') A.pasarTrimestre();
    else if(p === 'cuadro'){ const c = s.cuadro; if(c.terminado) A.cerrarCuadro(); else A.elegirCasilla(casillaLibre(c.rondas[c.actual])); }
    else if(p === 'duelo'){ if(s.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
    else if(p === 'evento'){ if(!s.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
    else if(p === 'finTemporada') A.irPretemporada();
    else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
    else throw new Error('v1: pantalla sin política ' + p);
  }
  console.log(`v1: ${n} partidas guardadas en momentos distintos`);
}

function continuarNuevo(archivo){
  const { js } = montar('nuevo.html', fs.readFileSync(archivo, 'utf8'));
  eval(js + `;global.A = { get S(){ return S; }, continuarPartida, render, trimActual, torneosDelTrimestre, estadoTorneo, abrirTorneo, inscribirse, jugarRonda,
    simularMomento, elegirCasilla, cerrarCuadro, resolverDuelo, cerrarDuelo, elegirEvento, cerrarEvento, irPretemporada, repartirAuto, empezarTemporada,
    pasarTrimestre, cerrarTrimestre, salirTorneo, trimestreEntreno, continuarMundial, pegarRafaga, orden };`);
  A.continuarPartida(); A.render();
  const j0 = A.S.j, inicio = `${A.S.pantalla} · año ${j0.anio} T${j0.trimestre + 1} · #${j0.ranking || '—'}`;
  let trimestres = 0, torneos = 0, w0 = j0.anio*4 + j0.trimestre, p = '';
  try{
    for(let paso = 0; paso < 30000 && trimestres < 8; paso++){
      const s = A.S, j = s.j; p = s.pantalla;
      if(p === 'retiro') break;
      if(p === 'temporada'){
        const tr = A.trimActual();
        if(tr.cerrado){ A.pasarTrimestre(); }
        else {
          const lista = A.torneosDelTrimestre().map(ev => ({ ev, est: A.estadoTorneo(j, ev) })).filter(x => x.est.tipo === 'directo' || x.est.tipo === 'previa')
            .sort((a, b) => (b.est.tipo === 'directo') - (a.est.tipo === 'directo') || A.orden(b.ev.t) - A.orden(a.ev.t));
          if(lista.length){ A.abrirTorneo(lista[0].ev.id); A.render(); A.inscribirse(); }
          else if(tr.jugados.length) A.cerrarTrimestre();
          else if(j.lesion && j.lesionSem > 0) A.pasarTrimestre();
          else A.trimestreEntreno();
        }
      }
      else if(p === 'torneo'){ if(s.torneo && !s.torneo.fin) A.jugarRonda(); else if(s.torneo){ A.salirTorneo(); torneos++; } else { s.pantalla = 'temporada'; } }
      else if(p === 'momento') A.simularMomento();
      else if(p === 'cuadro'){ const c = s.cuadro; if(c.terminado) A.cerrarCuadro(); else A.elegirCasilla(casillaLibre(c.rondas[c.actual])); }
      else if(p === 'mundial'){ const mu = s.mundial; if(mu.eleccion) A.continuarMundial(); else A.pegarRafaga(mu.rafaga.golpes[mu.rafaga.i].centro); }
      else if(p === 'duelo'){ if(s.duelo.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
      else if(p === 'gira') A.pasarTrimestre();
      else if(p === 'evento'){ if(!s.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
      else if(p === 'finTemporada') A.irPretemporada();
      else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
      else throw new Error('pantalla sin política: ' + p);
      A.render();
      const w = A.S.j.anio*4 + A.S.j.trimestre; if(w !== w0){ trimestres++; w0 = w; }
    }
  }catch(e){ console.log(`⚠️ abre en ${inicio}, pero falla en "${p}": ${(e.stack || e.message).split('\n').slice(0, 3).join(' | ')}`); process.exit(0); }
  console.log(`✅ abre en ${inicio} → ${trimestres} trimestres y ${torneos} torneos jugados, ahora #${A.S.j.ranking || '—'}`);
}

if(modo === 'v1') correrV1();
else if(modo === 'nuevo') continuarNuevo(process.argv[3]);
else {
  execFileSync('node', [__filename, 'v1'], { stdio:'inherit' });
  for(const f of fs.readdirSync(SAVES).filter(x => x.endsWith('.json')).sort()){
    try{ console.log(f.padEnd(30), execFileSync('node', [__filename, 'nuevo', path.join(SAVES, f)], { encoding:'utf8' }).trim().split('\n').pop()); }
    catch(e){ console.log(f.padEnd(30), '⚠️ ERROR', String(e.stderr || e.message).split('\n').slice(0, 4).join(' | ')); }
  }
}
