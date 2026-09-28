/* Pruebas sin pantalla del circuito jugable: carreras completas eligiendo torneo a torneo, momentos clave
   (simulados o jugados en la pista por la máquina en tu lugar) y los minijuegos de siempre.
   Uso: node prueba.js archivo.html [carreras]  ·  VIVOS=n para jugar n momentos clave en la pista */
const fs = require('fs');
/* mismas semillas para todas las variantes: así se comparan de verdad */
global.__seed = s => { let a = s >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const archivo = process.argv[2], N = +(process.argv[3] || 12), VIVOS = +(process.env.VIVOS || 0);
const js = fs.readFileSync(archivo, 'utf8').split('<script>')[1].split('</script>')[0];
const el = () => ({ innerHTML:'', value:'Bot Prueba', hidden:true, textContent:'', style:{}, classList:{ add(){}, remove(){}, toggle(){} }, querySelector(){ return el(); } });
const cache = {};
global.document = { querySelector: s => cache[s] || (cache[s] = el()), querySelectorAll: () => [], documentElement:{ scrollTop:0 },
                    body:{ offsetHeight:0, classList:{ add(){}, remove(){} } }, addEventListener(){} };
global.window = { scrollY:0, scrollTo(){} };
eval(js + `;global.A = { get S(){ return S; }, get CFG(){ return CFG; }, get P(){ return P; }, get ULTIMA(){ return ULTIMA_PISTA; }, get PREF(){ return PREF; },
  crearYEmpezar, trimestreEntreno, pasarTrimestre, elegirEvento, cerrarEvento, resolverDuelo, cerrarDuelo, irPretemporada, repartirAuto, empezarTemporada,
  calcularLegado, orden, ESTILOS, elegirCasilla, cerrarCuadro, probsGolpe, render, vCuadro, vDuelo,
  torneosDelTrimestre, estadoTorneo, abrirTorneo, inscribirse, jugarRonda, simularHastaElFinal, jugarMomento, simularMomento, probMomento,
  salirTorneo, cerrarTrimestre, trimActual, actualizar, vTorneo, vTemporada, vMomento, vComo, vFinRapido, partidoRapido, elegirCaminoMomento, continuarMomento, leerZonaMomento, minijuegoDeRonda, probPartido, pegarRafaga, continuarMundial, vMundial };`);

const errores = [], vivos = { n:0, seg:0, cubos:{}, puntos:0, errPareja:0, errTuyos:0, golpesPareja:0 }, cuenta = { momentos:0, cuadros:0, duelos:0, formas:{} };
const gaussP = () => { let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const ronda = { cubos:{} }, cuboP = p => p < 50 ? 'a) menos de 50%' : p < 70 ? 'b) 50-69%' : p < 85 ? 'c) 70-84%' : 'd) 85% o más';
function anotarRonda(pend){ const r = A.S.torneo && A.S.torneo.partidos[pend.antes]; if(!r) return; const c = ronda.cubos[pend.cubo] = ronda.cubos[pend.cubo] || {n:0,g:0,sum:0,mom:0}; c.n++; if(r.gane) c.g++; c.sum += pend.p; if(r.clave) c.mom++; }
const cubo = e => e < -10 ? 'a) <-10' : e < -4 ? 'b) -10..-4' : e < 4 ? 'c) -4..4' : e < 10 ? 'd) 4..10' : 'e) >10';

function torneoBot(){
  let pend = null;
  for(let g = 0; g < 80 && A.S.torneo && !A.S.torneo.fin; g++){
    const S = A.S, p = S.pantalla, j = S.j;
    if(pend && S.torneo.partidos.length > pend.antes){ anotarRonda(pend); pend = null; }
    if(p === 'torneo'){ A.vTorneo(); if(Math.random() < .1){ pend = null; A.simularHastaElFinal(); } else { if(!A.minijuegoDeRonda(S.torneo)){ const pp = A.probPartido(j, S.torneo.rival, S.torneo.ev); pend = { p:pp, cubo:cuboP(pp), antes:S.torneo.partidos.length }; } A.jugarRonda(); } }
    else if(p === 'momento'){
      A.vMomento(); cuenta.momentos++;
      const m = S.torneo.momento, antesM = S.torneo.partidos.length, fm = cuenta.formas[m.forma] = cuenta.formas[m.forma] || { n:0, g:0, sim:0, obj:0 };
      fm.obj += m.obj != null ? m.obj*100 : A.probPartido(j, S.torneo.rival, S.torneo.ev);
      fm.n++;
      if(m.esFinal && m.forma !== 'pista') errores.push('final sin pista: ' + m.forma);
      const anotar = () => { const r = S.torneo.partidos[antesM]; if(!r || !r.clave) errores.push('momento ' + m.forma + ' sin anotar'); else if(r.gane) fm.g++; };
      if(m.forma !== 'pista' && Math.random() < .15){ fm.sim++; A.simularMomento(); anotar(); }
      else if(m.forma === 'tiempo'){
        for(let k = 0; k < 4 && !m.eleccion; k++){ const R = m.rafaga, g = R.golpes[R.i]; A.pegarRafaga(Math.min(1, Math.max(0, g.centro + gaussP()*0.12))); A.vMomento(); }
        if(!m.eleccion){ errores.push('la ráfaga no resolvió'); return; }
        A.continuarMomento(); anotar();
      }
      else if(m.forma === 'leer'){
        for(let k = 0; k < 4 && !m.eleccion; k++){ const L = m.leer, b = L.bolas[L.k]; A.leerZonaMomento((b.post || b.w).indexOf(Math.max(...(b.post || b.w)))); A.vMomento(); }
        if(!m.eleccion){ errores.push('leer al rival no resolvió'); return; }
        A.continuarMomento(); anotar();
      }
      else if(m.forma === 'camino'){
        for(let k = 0; k < 10 && !m.eleccion; k++){
          const c = m.camino, libres = [...Array(c.casillas).keys()].filter(i => !c.falladas.includes(i) && i !== c.pista);
          A.elegirCaminoMomento(libres[Math.floor(Math.random()*libres.length)]); A.vMomento();
        }
        if(!m.eleccion){ errores.push('elegir camino no resolvió'); return; }
        A.continuarMomento(); anotar();
      }
      else if(vivos.n < VIVOS){
        const edge = m.edge + ({facil:9, normal:4, dificil:-2})[A.PREF.dificultad]*.0, prob = A.probMomento(m), antes = S.torneo.partidos.length;
        S.pruebaIA = true; A.jugarMomento(); S.pruebaIA = false;
        let pasos = 0;
        while(A.P && pasos++ < 120*900) A.actualizar(1/120);
        if(A.P){ errores.push('momento en vivo sin terminar'); return; }
        const res = S.torneo.partidos[antes];
        if(!res || !res.clave || !res.clave.enVivo){ errores.push('el momento en vivo no quedó anotado'); return; }
        const st = A.ULTIMA;
        vivos.n++; vivos.seg += pasos/120; vivos.puntos += st.puntosJ; vivos.errPareja += st.erroresPareja; vivos.errTuyos += st.erroresTuyos; vivos.golpesPareja += st.golpesPareja;
        const c = vivos.cubos[cubo(edge)] = vivos.cubos[cubo(edge)] || { n:0, g:0, sim:0 };
        c.n++; if(res.gane) c.g++; c.sim += prob; anotar();
      } else { A.simularMomento(); anotar(); }
    }
    else if(p === 'cuadro'){
      const c = S.cuadro; A.vCuadro();
      if(c.terminado){ cuenta.cuadros++; if(c.rondas.length !== 2) errores.push('cuadro de ' + c.rondas.length + ' rondas'); A.cerrarCuadro(); }
      else { const r = c.rondas[c.actual], libres = [...Array(r.casillas).keys()].filter(i => !(r.falladas||[]).includes(i) && i !== r.pista); A.elegirCasilla(libres[Math.floor(Math.random()*libres.length)]); }
    }
    else if(p === 'duelo'){
      const d = S.duelo; A.vDuelo();
      if(d.resultado){ cuenta.duelos++; A.cerrarDuelo(); } else { const pr = d.esc.ops.map(o => A.probsGolpe(j, d, o).total); A.resolverDuelo(pr.indexOf(Math.max(...pr))); }
    }
    else { errores.push('pantalla inesperada dentro del torneo: ' + p); return; }
  }
  if(pend && A.S.torneo && A.S.torneo.partidos.length > pend.antes) anotarRonda(pend);
  if(A.S.torneo && !A.S.torneo.fin) errores.push('torneo sin terminar');
}

function carrera(){
  A.CFG.estilo = Object.keys(A.ESTILOS)[Math.floor(Math.random()*4)];
  A.CFG.posicion = Math.random() < .5 ? 'reves' : 'drive';
  A.crearYEmpezar();
  for(let pasos = 0; pasos < 60000; pasos++){
    const S = A.S, p = S.pantalla, j = S.j;
    if(p === 'retiro') break;
    try{
      if(p === 'temporada'){
        const tr = A.trimActual();
        if(tr.cerrado){ A.pasarTrimestre(); continue; }
        const lista = A.torneosDelTrimestre().map(ev => ({ ev, est:A.estadoTorneo(j, ev) })).filter(x => x.est.tipo === 'directo' || x.est.tipo === 'previa');
        if(lista.length){
          lista.sort((a,b) => (b.est.tipo === 'directo') - (a.est.tipo === 'directo') || A.orden(b.ev.t) - A.orden(a.ev.t));
          A.abrirTorneo(lista[0].ev.id); A.vTorneo(); A.inscribirse();
          torneoBot(); A.vTorneo(); A.salirTorneo(); A.vTemporada();
        }
        else if(tr.jugados.length) A.cerrarTrimestre();
        else if(j.lesion && j.lesionSem > 0) A.pasarTrimestre();
        else A.trimestreEntreno();
      }
      else if(p === 'mundial'){ const mu = S.mundial; A.vMundial(); if(mu.eleccion){ cuenta.mundiales = (cuenta.mundiales||0) + 1; A.continuarMundial(); } else { const g = mu.rafaga.golpes[mu.rafaga.i]; A.pegarRafaga(Math.min(1, Math.max(0, g.centro + gaussP()*0.12))); } }
      else if(p === 'duelo'){ const d = S.duelo; if(d.resultado) A.cerrarDuelo(); else A.resolverDuelo(0); }
      else if(p === 'gira') A.pasarTrimestre();
      else if(p === 'evento'){ if(!S.eventoRes) A.elegirEvento(0); else A.cerrarEvento(); }
      else if(p === 'finTemporada') A.irPretemporada();
      else if(p === 'pretemporada'){ A.repartirAuto(); A.empezarTemporada(); }
      else throw new Error('pantalla sin política: ' + p);
    }catch(e){ errores.push(p + ': ' + (e.stack || e.message).split('\n').slice(0,3).join(' | ')); break; }
  }
  const j = A.S.j, n = t => j.titulos.filter(x => x.tier === t).length;
  return { tit:j.titulos.length, mj:n('MJ'), p1:n('P1') + n('FIN'), mejor:j.mejorRank || 2000, leg:A.calcularLegado(j).rango, premios:j.premiosTotal || 0, pg:j.pg, pp:j.pp, anios:j.anio, primero: j.titulos.length ? j.titulos[0].a : null, t3: j.titulos.filter(t => t.a <= 3).length, t1: j.titulos.filter(t => t.a <= 1).length };
}

/* un partido rápido de punta a punta, sin tocar nada (la pareja juega sola) */
try{
  A.S.pantalla = 'inicio'; A.partidoRapido();
  let pasos = 0; while(A.P && pasos++ < 120*1500) A.actualizar(1/120);
  if(A.P) errores.push('partido rápido sin terminar'); else { if(A.S.pantalla !== 'finRapido') errores.push('el partido rápido no llevó al resultado'); A.vFinRapido(); }
  A.S.volverComo = 'inicio'; A.vComo();
}catch(e){ errores.push('partido rápido: ' + e.message); }

const F = [];
for(let i = 0; i < N; i++){ __seed(1000 + i*7919); F.push(carrera()); }
const med = a => { const s = a.slice().sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };
const leg = {}; F.forEach(f => leg[f.leg] = (leg[f.leg]||0) + 1);
console.log(`CIRCUITO con momentos clave · ${N} carreras · dificultad ${A.PREF.dificultad}`);
console.log(`  títulos med ${med(F.map(f=>f.tit))} (máx ${Math.max(...F.map(f=>f.tit))}) · Majors med ${med(F.map(f=>f.mj))} (máx ${Math.max(...F.map(f=>f.mj))}) · P1+Finals med ${med(F.map(f=>f.p1))}`);
console.log(`  mejor ranking med #${med(F.map(f=>f.mejor))} · top 10: ${F.filter(f=>f.mejor<=10).length}/${N} · número 1: ${F.filter(f=>f.mejor===1).length}/${N} · partidos ganados ${Math.round(100*F.reduce((a,f)=>a+f.pg,0)/F.reduce((a,f)=>a+f.pg+f.pp,0))}%`);
console.log(`  legados ${JSON.stringify(leg)}`);
const conTit = F.filter(f => f.primero); console.log(`  primer título: temporada med ${conTit.length ? med(conTit.map(f=>f.primero)) : '-'} (${N - conTit.length} sin títulos) · títulos en la temporada 1 med ${med(F.map(f=>f.t1))} · en las 3 primeras med ${med(F.map(f=>f.t3))}`);
console.log(`  por carrera: ${(cuenta.momentos/N).toFixed(0)} momentos clave · ${(cuenta.cuadros/N).toFixed(1)} cuadros de Major · ${(cuenta.duelos/N).toFixed(1)} puntos de oro de final`);
console.log('  formas de los momentos: ' + Object.keys(cuenta.formas).map(k => { const f = cuenta.formas[k]; return `${k} ${f.n} (${Math.round(100*f.g/f.n)}% ganados con ${Math.round(f.obj/f.n)}% mostrado de media${f.sim ? ', ' + f.sim + ' simulados' : ''})`; }).join(' · '));
if(vivos.n){
  console.log(`── ${vivos.n} momentos clave jugados en la pista por la máquina · ${(vivos.seg/vivos.n).toFixed(0)} s de media`);
  console.log(`  errores de tu pareja: ${(10*vivos.errPareja/vivos.puntos).toFixed(2)} cada 10 puntos (${(100*vivos.errPareja/Math.max(1,vivos.golpesPareja)).toFixed(1)}% de sus golpes) · errores del jugador: ${(10*vivos.errTuyos/vivos.puntos).toFixed(2)} cada 10 puntos`);
  for(const k of Object.keys(vivos.cubos).sort()){ const c = vivos.cubos[k]; console.log(`  nivel ${k}: ${c.g}/${c.n} ganados en la pista (${Math.round(100*c.g/c.n)}%) · simulando ${Math.round(c.sim/c.n)}%`); }
}
console.log('── ¿SE CUMPLE EL % QUE SE VE EN EL TORNEO? ──');
for(const k of Object.keys(ronda.cubos).sort()){ const c = ronda.cubos[k]; console.log(`  mostraba ${k}: ganó el ${Math.round(100*c.g/c.n)}% de ${c.n} partidos (media mostrada ${Math.round(c.sum/c.n)}% · con momento clave el ${Math.round(100*c.mom/c.n)}%)`); }
console.log(errores.length ? '⚠️ ' + errores.slice(0, 6).join('\n   ') : '✅ sin errores');
process.exit(0);

/* resumen corto contra los objetivos: nº1, primer título, % ganados, mejor puesto */
const pg = F.reduce((a,f)=>a+f.pg,0), pp = F.reduce((a,f)=>a+f.pp,0), n1 = F.filter(f=>f.mejor===1).length;
const conT = F.filter(f=>f.primero), prim = conT.length ? med(conT.map(f=>f.primero)) : 99;
const primMed = (() => { const s2 = F.map(f => f.primero || 99).sort((a,b)=>a-b); return s2[Math.floor(s2.length/2)]; })();
console.log(`OBJ ${process.argv[2]} · nº1 ${(15*n1/N).toFixed(1)}/15 (${n1}/${N}) · primer título temp ${primMed} (con títulos ${prim}) · ganados ${(100*pg/(pg+pp)).toFixed(1)}% · mejor puesto med #${med(F.map(f=>f.mejor))} · top10 ${F.filter(f=>f.mejor<=10).length}/${N} · títulos med ${med(F.map(f=>f.tit))}`);
