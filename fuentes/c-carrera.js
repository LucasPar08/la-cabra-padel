
/* ═══════════════════════════════════════════════════════════════
   EL CIRCUITO JUGABLE
   Cada trimestre se ven TODOS los torneos del calendario, sueltos. Eliges
   los que quieras (hasta tres) y el cuadro avanza ronda a ronda: los
   partidos se simulan, pero cuando uno se aprieta te toca jugar el JUEGO o
   el PUNTO CLAVE (en la pista o en un minijuego). Los Majors mantienen su
   cuadro en cuartos y semis, y todas las finales se juegan en la pista.
   ═══════════════════════════════════════════════════════════════ */
const TORNEOS_POR_TRIMESTRE = 3;
const PROB_MOMENTO = .55, PROB_MOMENTO_PREVIA = .5;     // en cada ronda, la probabilidad de que toque un momento clave

const DIFICULTADES = {
  facil:   { nom:'Fácil',   rival:12, cal:.1,  alcance:.16, sim:5.5, eleccion:.16, ayuda:{FIP1:12, FIP2:10, FIP3:6, FIP4:3}, rafaga:.1, rafagaMs:400, d:'Lo más fácil: rivales lentos, más caminos buenos y más partidos ganados.' },
  normal:  { nom:'Normal',  rival:8,  cal:.07, alcance:.1,  sim:4,   eleccion:.12, ayuda:{FIP1:9, FIP2:7, FIP3:4, FIP4:2}, rafaga:.06, rafagaMs:220, d:'Asequible: si juegas con cabeza, ganas torneos.' },
  dificil: { nom:'Difícil', rival:0,  cal:.02, alcance:.03, sim:2.5, eleccion:.06, ayuda:{}, rafaga:.01, rafagaMs:0, d:'Como el circuito de verdad: cada título cuesta muchísimo.' },
};
const difActual = () => DIFICULTADES[PREF.dificultad] || DIFICULTADES.normal;

/* ── De la carrera a la pista ──
   Tus estadísticas no te hacen más rápido que todo el circuito: deciden qué
   golpes te salen mejor que el resto. Lo difícil lo pone la diferencia de
   nivel con la pareja rival (la misma que usa la simulación) y la dificultad. */
function paramsHumanoPista(j){
  const s = j ? j.stats : null, D = difActual();
  const media = s ? STAT_KEYS.reduce((a,k)=>a+s[k], 0)/STAT_KEYS.length : 0;
  const rel = k => s ? clamp((s[k] - media)/22, -1, 1) : 0;
  const e = j ? clamp(j.energia, 0, 100) : 100, cansancio = e < 45 ? (45 - e)/45 : 0, lesion = j && j.lesion ? 1 : 0;
  const fallo = k => clamp(1 - .28*rel(k), .72, 1.28);
  return aplicarMaterial(j, {
    vel: (5 + .35*rel('fisico')) * (1 - .12*cansancio - .1*lesion),
    alcance: 1.24 + D.alcance + .05*rel('volea') + .05*rel('pared'),
    bonusCal: .04 + D.cal + .05*rel('mental') - .06*cansancio,
    multFalloTiro: { drive:fallo('pared'), plano:fallo('pared'), volea:fallo('volea'), dejada:fallo('volea'), chiquita:fallo('volea'),
                     globo:fallo('globo'), bandeja:fallo('bandeja'), vibora:fallo('remate'), remate:fallo('remate'), saque:fallo('mental') },
    multTTiro: { remate:1 - .1*rel('remate'), vibora:1 - .08*rel('remate'), drive:1 - .06*rel('pared'), plano:1 - .06*rel('pared') },
    umbralPorTres: .8 - .07*rel('remate'),
    bonusPared: .05 + .05*rel('pared'),
    hab: .62 + .05*rel('mental'), reaccion: .16,
  });
}
/* Tu pareja juega con cabeza: falla poco y llega a casi todo. Su nivel y la química la hacen aún mejor */
function paramsParejaPista(j){
  const p = j && j.pareja;
  if(!p) return { vel:4.6, alcance:1.2, hab:.72, reaccion:.16, multFallo:.62, agresivo:.55, globeador:.35 };
  const rel = clamp((p.nivel - escalar(rawJugador(j))) / 12, -1, 1), q = (p.quimica - 50)/50;
  return { vel: 4.65 + .25*rel, alcance: 1.2 + .04*rel, hab: clamp(.76 + .06*rel + .04*q, .6, .9), reaccion: clamp(.15 - .02*rel - .01*q, .1, .22),
           multFallo: clamp(.58 - .08*rel - .05*q, .4, .75),
           agresivo: p.estilo === 'rematador' ? .7 : p.estilo === 'voleador' ? .6 : .45,
           globeador: p.estilo === 'tactico' ? .5 : p.estilo === 'paredista' ? .45 : .32 };
}
/* edge = vuestro nivel de dupla menos el suyo. Negativo: son mejores */
function paramsRivalPista(edge, arq){
  const e = clamp(edge, -25, 25);
  return { vel: clamp(4.35 - .045*e, 3.5, 5.3), alcance: 1.15, hab: clamp(.56 - .018*e, .28, .88), reaccion: clamp(.2 + .008*e, .1, .34),
           agresivo: clamp(.5*(arq ? arq.remate : 1), .3, .75), globeador: clamp(.35*(arq ? arq.globo : 1), .22, .5) };
}
function edgeDupla(j, opp, ev){
  const fatiga = Math.max(0, 58 - j.energia) * 0.09;
  return ratingDupla(j, ev.pista, ev) - fatiga - opp.rating;
}
function cfgPartidoCarrera(j, opp, ev, rotulo){
  const edge = edgeDupla(j, opp, ev);
  return {
    humano: paramsHumanoPista(j), pareja: paramsParejaPista(j), rival: paramsRivalPista(edge + difActual().rival, opp.arq),
    carril: j.posicion === 'drive' ? 'der' : 'izq', juegos: PREF.juegos || 3, edge,
    pPunto: perfilDupla(j, opp, ev, j.energia).p, humanoIA: !!S.pruebaIA,
    escena: escenaDe(ev), equipos: [nombreEquipo(j.nombre, j.pareja ? j.pareja.nombre : 'Pareja'), nombreEquipo(opp.nombre, opp.nombre2)],
    titulo: `${opp.nombre.split(' ')[0]} / ${opp.nombre2.split(' ')[0]}`,
    subtitulo: `juegan a ${opp.arq ? opp.arq.nom : 'todo'}`, rotulo,
  };
}

/* ── El calendario del trimestre ── */
function torneosDelTrimestre(){
  const tri = S.cal[S.j.trimestre], out = [], vistos = new Set();
  tri.giras.forEach((g, gi) => g.torneos.forEach((ev, ti) => {
    const clave = ev.t + '|' + ev.nom;
    if(vistos.has(clave)) return;
    vistos.add(clave);
    out.push(Object.assign({}, ev, { id: gi + '-' + ti, gira: g.nom }));
  }));
  return out.sort((a,b) => orden(b.t) - orden(a.t) || a.nom.localeCompare(b.nom));
}
function trimActual(){
  const j = S.j, clave = j.anio + '-' + j.trimestre;
  if(!S.trim || S.trim.clave !== clave){
    if(S.trim) evolucionarCircuito(j);          // el circuito se mueve de un trimestre al otro
    anotarRankingTrimestre(j);
    S.trim = { clave, jugados:[], resultados:[], rankAntes:j.ranking, pts:0, plata:0, vic:0, der:0, perfecto:false, remontada:false, cerrado:false };
  }
  return S.trim;
}
/* Como en el circuito de verdad: con ranking de Premier no te dejan jugar un Promises */
function torneoDemasiadoBajo(j, ev){
  if(!j.ranking) return false;
  if(ev.t === 'FIP1' || ev.t === 'FIP2') return j.ranking <= 150;
  if(ev.t === 'FIP3' || ev.t === 'FIP4') return j.ranking <= 80;
  if(ev.t === 'FIP5') return j.ranking <= 35;
  return false;
}
function estadoTorneo(j, ev){
  const tr = trimActual(), hecho = tr.jugados.find(x => x.id === ev.id);
  if(hecho) return { tipo:'jugado', r:hecho };
  if(tr.cerrado) return { tipo:'lleno', txt:'Trimestre cerrado' };
  if(torneoDemasiadoBajo(j, ev)) return { tipo:'bajo', txt:'Ya estás por encima de este torneo' };
  const e = entradaTorneo(j, ev);
  if(!e){
    const acc = TIERS[ev.t].acc;
    return { tipo:'cerrado', txt: ev.t === 'FIN' ? 'Solo juegan las 8 mejores parejas' : `Necesitas top ${acc*4} (previa) o top ${acc} (directo)` };
  }
  if(j.lesion && j.lesionSem > 0) return { tipo:'lesion', txt:'Estás de baja' };
  if(tr.jugados.length >= TORNEOS_POR_TRIMESTRE) return { tipo:'lleno', txt:`Ya jugaste ${TORNEOS_POR_TRIMESTRE} torneos este trimestre` };
  return { tipo:e };
}

/* ── Un torneo, ronda a ronda ── */
function abrirTorneo(id){
  const ev = torneosDelTrimestre().find(x => x.id === id);
  if(!ev) return;
  S.verTorneo = ev; S.pantalla = 'torneo'; render();
}
function inscribirse(){
  const j = S.j, ev = S.verTorneo; if(!ev || S.torneo) return;
  const est = estadoTorneo(j, ev);
  if(est.tipo !== 'directo' && est.tipo !== 'previa') return;
  if(j.edad <= 19 && ['P2','P1','MJ','FIN'].indexOf(ev.t) >= 0) logro(j, 'premier_teen');
  /* el sorteo que visteis, con sus %, es el que se juega */
  const habitual = j.pareja, elegida = parejaElegida(j, ev);      // con la pareja elegida para este torneo
  if(elegida !== habitual) j.pareja = elegida;
  const so = chancesTorneo(j, ev, est.tipo), copia = JSON.parse(JSON.stringify(so));
  delete copia.cache;
  S.torneo = { ev, previa: est.tipo === 'previa', enPrevia: est.tipo === 'previa', kPrevia:0, ronda:0, partidos:[], rival:null,
               ultimo:null, momento:null, perfecto:true, remontada:false, lesionado:false, fin:null, sorteo: copia,
               cambioPareja: elegida !== habitual, parejaHabitual: elegida !== habitual ? habitual : null };
  delete trimActual().sorteos[ev.id];
  nuevoRivalTorneo();
  guardar(); render();
}
function nuevoRivalTorneo(){
  const to = S.torneo, T = TIERS[to.ev.t], so = to.sorteo, k = to.enPrevia ? to.kPrevia : to.ronda;
  /* en los torneos pequeños los rivales aprietan menos: el primer título tiene que llegar pronto */
  const ayuda = (difActual().ayuda || {})[to.ev.t] || 0;
  /* la pareja y su % ya salieron en el sorteo del torneo */
  const base = so && (to.enPrevia ? so.previa : so.cuadro)[k];
  if(base){
    const p = so.probs && (to.enPrevia ? so.probs.previa : so.probs.cuadro)[k];
    to.rival = Object.assign(JSON.parse(JSON.stringify(base)), { rating: base.rating - ayuda, _prob: p != null ? p : null });
    return;
  }
  to.rival = to.enPrevia ? rivalDePrevia(to.ev) : generarRival(to.ev.t, to.ronda, T.rondas);
  to.rival.rating -= ayuda;
}
function nombreRondaActual(to){
  return to.enPrevia ? (to.kPrevia === 0 ? '1ª DE PREVIA' : '2ª DE PREVIA') : NOM_RONDA[TIERS[to.ev.t].rondas][to.ronda];
}
/* Lo que diría la simulación: se calcula una vez por rival */
/* La probabilidad de ganar el partido. Se calcula una vez por rival, se enseña redondeada y ESE número es el que decide */
function probPartido(j, opp, ev){
  if(opp._prob == null){
    let g = 0; const N = 300;
    for(let i = 0; i < N; i++) if(simularPartido(j, opp, ev, 0, TIERS[ev.t].rondas).gane) g++;
    opp._prob = clamp(Math.round(100*g/N), 1, 99);
  }
  return opp._prob;
}
/* Un partido simulado que acaba como ya se decidió: se repite hasta que sale ese resultado */
function simularConResultado(j, opp, ev, ronda, total, gana){
  let res = null;
  for(let k = 0; k < 400; k++){ res = simularPartido(j, opp, ev, ronda, total); if(res.gane === gana) return res; }
  /* si con esa diferencia de nivel casi nunca sale, se le da la vuelta al marcador del último */
  res.gane = gana;
  res.sets = res.sets.map(x => x.split('-').reverse().join('-'));
  res.oros = (res.oros || []).map(x => !x);
  if(res.red != null) res.red = 1 - res.red;
  const r = res.roturas; res.roturas = res.roturasContra; res.roturasContra = r;
  return res;
}
/* ── El cuadro entero, sorteado de antemano ──
   Al abrir un torneo se sortea todo el camino: la pareja de cada ronda y vuestro % exacto contra cada una,
   con las piernas con las que llegaríais a esa ronda. Esos mismos números son los que deciden después, ronda a
   ronda (simulada, con momento clave o con minijuego). En un Major, cuartos y semis son el cuadro de casillas y
   su % sale exacto de sus caminos y de vuestras bolas de partido. */
function semillaDe(txt){ let h = 2166136261; for(let i = 0; i < txt.length; i++){ h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) || 1; }
/* con los mismos datos, el mismo número: el % no baila cada vez que miras el torneo */
function conSemilla(txt, fn){
  const r0 = Math.random; let s = semillaDe(txt);
  Math.random = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s/4294967296; };
  try{ return fn(); } finally { Math.random = r0; }
}
const fmtChance = x => x > 0 && x < .005 ? '<1%' : Math.round(100*x) + '%';
function claveChances(j){
  return [PREF.dificultad || 'normal', Math.round(j.energia), Math.round(j.forma || 0), j.equipo.psico ? 1 : 0,
          STAT_KEYS.map(k => Math.round(j.stats[k])).join('.'), j.pareja ? j.pareja.nombre + '.' + Math.round(j.pareja.nivel) + '.' + Math.round(j.pareja.quimica) : '-', j.material ? j.material.pala + '.' + j.material.zapas : 'club'].join('|');
}
function sorteoTorneo(ev, tipo){
  const tr = trimActual(), T = TIERS[ev.t];
  tr.sorteos = tr.sorteos || {};
  let so = tr.sorteos[ev.id];
  if(!so || so.tipo !== tipo || so.t !== ev.t)
    so = tr.sorteos[ev.id] = { tipo, t: ev.t, sal: String(Math.random()).slice(2, 10),
      previa: tipo === 'previa' ? [...Array(RONDAS_PREVIA)].map(() => rivalDePrevia(ev)) : [],
      cuadro: rivalesSinRepetir(ev.t, T.rondas), mj:null, probs:null, clave:null, dif:null };
  return so;
}
function pasosTorneo(ev, so){
  const T = TIERS[ev.t], esMJ = modoMinijuego(ev) === 'cuadro', pasos = [];
  so.previa.forEach((r, k) => pasos.push({ previa:true, k }));
  for(let k = 0; k < T.rondas; k++) pasos.push({ previa:false, k, cuadroMJ: esMJ && (k === T.rondas-3 || k === T.rondas-2), final: k === T.rondas-1 });
  return pasos;
}
/* El % de cada ronda desde `desde`, en orden: cada partido gasta piernas y el siguiente se juega con lo que quede */
function calcularChances(j, ev, so, desde){
  const T = TIERS[ev.t], ayuda = (difActual().ayuda || {})[ev.t] || 0, N = 300, e0 = j.energia, pasos = pasosTorneo(ev, so), dif = PREF.dificultad || 'normal';
  const antes = so.probs || { previa:[], cuadro:[], mj:null }, probs = { previa: antes.previa.slice(), cuadro: antes.cuadro.slice(), mj: antes.mj };
  let e = e0;
  try{
    pasos.forEach((p, i) => {
      if(i < desde) return;
      if(p.cuadroMJ){
        if(p.k === T.rondas-3){ so.mj = cuadroMajorPrevio(j, ev, so); probs.mj = probsCuadroMajor(so.mj.rondas, 1 + (j.equipo.psico ? 1 : 0)); }
        probs.cuadro[p.k] = null;
        if(p.k === T.rondas-2) e = clamp(e - 12, 0, 100);            // el cuadro gasta 6 de energía por partido
        return;
      }
      const rival = (p.previa ? so.previa : so.cuadro)[p.k];
      (p.previa ? probs.previa : probs.cuadro)[p.k] = conSemilla(so.sal + '|' + i + '|' + Math.round(e) + '|' + dif, () => {
        const opp = Object.assign({}, rival, { rating: rival.rating - ayuda });
        j.energia = e;
        let g = 0, suma = 0;
        for(let n = 0; n < N; n++){ const res = simularPartido(j, opp, ev, p.previa ? 0 : p.k, T.rondas); if(res.gane) g++; suma += res.energia; }
        e = clamp(suma/N - (p.previa ? 7 : 0), 0, 100);
        return clamp(Math.round(100*g/N), 1, 99);
      });
    });
  } finally { j.energia = e0; }
  so.probs = probs; so.dif = dif;
  return so;
}
/* Al mirar un torneo: el sorteo y sus chances (se recalculan solo si cambió algo vuestro: energía, nivel, dificultad…) */
function chancesTorneo(j, ev, tipo){
  const so = sorteoTorneo(ev, tipo), clave = claveChances(j);
  if(!so.probs || so.clave !== clave){
    so.cache = so.cache || {};                    // una tabla por pareja/material: cambiar de opción no recalcula
    const guardada = so.cache[clave];
    if(guardada){ so.probs = guardada.probs; so.mj = guardada.mj; so.dif = guardada.dif; }
    else { calcularChances(j, ev, so, 0); so.cache[clave] = { probs: so.probs, mj: so.mj, dif: so.dif }; }
    so.clave = clave; guardar();
  }
  return so;
}
/* Si cambiáis la dificultad a mitad de torneo, se recalcula lo que queda (la ronda que toca incluida) */
function actualizarChancesEnCurso(j, to){
  const so = to.sorteo;
  if(!so || !so.probs || to.fin || to.momento || so.dif === (PREF.dificultad || 'normal')) return;
  calcularChances(j, to.ev, so, chanceTitulo(to.ev, so, to).hechos);
  const k = to.enPrevia ? to.kPrevia : to.ronda, base = (to.enPrevia ? so.previa : so.cuadro)[k], p = (to.enPrevia ? so.probs.previa : so.probs.cuadro)[k];
  if(base && to.rival && p != null){ to.rival.rating = base.rating - ((difActual().ayuda || {})[to.ev.t] || 0); to.rival._prob = p; }
  guardar();
}
/* Lo que dice la tabla: el % de cada ronda, el de llegar a la final y el de ganar el torneo desde donde estáis */
function chanceTitulo(ev, so, to){
  const T = TIERS[ev.t], P = so.probs, pasos = pasosTorneo(ev, so);
  const hechos = to ? (to.previa ? (to.enPrevia ? to.kPrevia : RONDAS_PREVIA + to.ronda) : to.ronda) : 0;
  const pr = pasos.map(p => p.cuadroMJ ? (P.mj ? P.mj[p.k === T.rondas-3 ? 0 : 1] : 0) : ((p.previa ? P.previa : P.cuadro)[p.k] || 0)/100);
  let acum = 1, final = 1, primera = null;
  pasos.forEach((p, i) => { if(i < hechos) return; if(primera === null) primera = pr[i]; if(p.final) final = acum; acum *= pr[i]; });
  return { pasos, pr, hechos, primera: primera || 0, final, titulo: acum };
}
/* Cuartos y semis de un Major, sorteados con las mismas reglas del cuadro de siempre */
function cuadroMajorPrevio(j, ev, so){
  const T = TIERS[ev.t], miR = ratingDupla(j, ev.pista, ev), D = difActual();
  return conSemilla(so.sal + '|mj|' + (PREF.dificultad || 'normal'), () => ({ rondas: [T.rondas-3, T.rondas-2].map(k => {
    const opp = so.cuadro[k];
    const objetivo = clamp(0.62 + (miR - opp.rating)*0.05 + D.eleccion, 0.45, 0.9);
    let casillas = 4, nMinas = 2, mejorDif = Infinity;
    for(let c = 4; c <= 6; c++) for(let m = 1; m <= 3; m++){
      if(c - m < 1) continue;
      const dif = Math.abs((c - m)/c - objetivo);
      if(dif < mejorDif){ mejorDif = dif; casillas = c; nMinas = m; }
    }
    const minas = [];
    while(minas.length < nMinas){ const x = ri(0, casillas-1); if(minas.indexOf(x) < 0) minas.push(x); }
    const probPista = clamp((j.stats.mental - 45) / 60, 0, 0.85);
    const pista = nMinas >= 2 && Math.random() < probPista ? minas[ri(0, minas.length-1)] : null;
    return { nom: k === T.rondas-2 ? 'SEMIFINAL' : 'CUARTOS', opp, casillas, minas, pista, elegida:null };
  }) }));
}
function cuadroDesdeSorteo(j, to, parcial){
  const vidas = 1 + (j.equipo.psico ? 1 : 0);
  return { ev: to.ev, parcial, rondas: JSON.parse(JSON.stringify(to.sorteo.mj.rondas)), actual:0, terminado:false, gano:false, vidas, vidasIniciales: vidas, salvada:false };
}
/* Chance exacta de pasar una ronda del cuadro con `vidas` bolas de partido: cuánto se pasa quedando con 0, 1, 2… vidas.
   Cualquier camino sin marcar tiene las mismas papeletas, así que no importa cuál elijáis */
function pasarRondaCuadro(r, vidas){
  const fall = r.falladas || [], avisoVivo = r.pista != null && fall.indexOf(r.pista) < 0;
  const f = (c, m, v) => {
    const out = new Array(vidas + 1).fill(0);
    if(c <= 0) return out;
    out[v] += (c - m)/c;
    if(m > 0 && v > 0) f(c - 1, m - 1, v - 1).forEach((x, i) => out[i] += (m/c)*x);
    return out;
  };
  return f(r.casillas - fall.length - (avisoVivo ? 1 : 0), r.minas.length - fall.length - (avisoVivo ? 1 : 0), vidas);
}
function probsCuadroMajor(rondas, vidas){
  const a = pasarRondaCuadro(rondas[0], vidas), pA = a.reduce((s, x) => s + x, 0);
  const pB = a.reduce((s, x, v) => s + x*pasarRondaCuadro(rondas[1], v).reduce((t, y) => t + y, 0), 0);
  return [pA, pA > 0 ? pB/pA : 0];                  // cuartos, y semis si llegáis
}
/* El minijuego de siempre: el cuadro de un Major en cuartos y semifinal (la final se juega en la pista) */
function minijuegoDeRonda(to){
  if(!to || to.enPrevia) return null;
  const T = TIERS[to.ev.t], m = modoMinijuego(to.ev);
  if(m === 'cuadro' && to.ronda === T.rondas-3) return 'cuadro';
  return null;
}
function jugarRonda(){
  const j = S.j, to = S.torneo; if(!to || to.fin || to.momento) return;
  const T = TIERS[to.ev.t], mini = minijuegoDeRonda(to), parcial = { partidos:to.partidos, perfecto:to.perfecto, remontada:to.remontada };
  if(mini === 'cuadro'){ S.cuadro = to.sorteo && to.sorteo.mj ? cuadroDesdeSorteo(j, to, parcial) : crearCuadro(j, to.ev, parcial); S.pantalla = 'cuadro'; if(!S.silencio){ guardar(); render(); } return; }
  /* el % que se ve es la probabilidad exacta: primero se decide con él y después se simula un partido con ese resultado */
  const res = simularConResultado(j, to.rival, to.ev, to.enPrevia ? 0 : to.ronda, T.rondas, Math.random() < probPartido(j, to.rival, to.ev)/100);
  res.ronda = nombreRondaActual(to);
  if(to.enPrevia) res.previa = true;
  const esFinal = !to.enPrevia && to.ronda === T.rondas-1;
  /* En cualquier ronda puede tocar un momento clave. La final, siempre, y se juega en la pista (aunque simules hasta ella) */
  if(esFinal || (!S.sinMomentos && Math.random() < (to.enPrevia ? PROB_MOMENTO_PREVIA : PROB_MOMENTO))){
    to.momento = crearMomento(j, to, res, esFinal, esFinal ? 'pista' : null);
    S.pantalla = 'momento';
    if(!S.silencio){ guardar(); render(); }
    return;
  }
  aplicarPartido(res);
}
/* Todo simulado hasta la final: los momentos clave también. El cuadro del Major y la final no se saltan */
function simularHastaElFinal(){
  S.silencio = true; S.sinMomentos = true;
  for(let g = 0; S.torneo && !S.torneo.fin && !S.torneo.momento && S.pantalla === 'torneo' && g < 20; g++) jugarRonda();
  S.silencio = false; S.sinMomentos = false;
  guardar(); render();
}

/* ── La probabilidad que ves es la de verdad ──
   El % de ganar del torneo manda también en el momento clave: la ventaja con
   la que empezáis, las casillas buenas, lo grande que es la zona verde y lo que
   pesa cada bola bien leída salen de ese mismo número. Simulado, se gana
   exactamente ese porcentaje; jugado, depende de lo bien que lo hagas. */
function probJuego(p, a, b){ return a >= 4 ? 1 : b >= 4 ? 0 : p*probJuego(p, a+1, b) + (1-p)*probJuego(p, a, b+1); }
function pPuntoParaJuego(obj, inicio){
  let lo = .005, hi = .995;
  for(let k = 0; k < 30; k++){ const mid = (lo + hi)/2; if(probJuego(mid, inicio[0], inicio[1]) < obj) lo = mid; else hi = mid; }
  return (lo + hi)/2;
}
/* acierto por intento que hace falta para ganar 2 de 3 con probabilidad obj */
function aciertoParaDosDeTres(obj){
  let lo = 0, hi = 1;
  for(let k = 0; k < 30; k++){ const s = (lo + hi)/2; if(s*s*(3 - 2*s) < obj) lo = s; else hi = s; }
  return (lo + hi)/2;
}
function erfinv(x){
  const a = 0.147, l = Math.log(1 - x*x), t = 2/(Math.PI*a) + l/2;
  return Math.sign(x) * Math.sqrt(Math.sqrt(t*t - l/a) - t);
}
const probObjetivo = to => probPartido(S.j, to.rival, to.ev)/100;          // el mismo número que se ve en el torneo, sin redondeos aparte
const inicioDesdeProb = p => p >= .85 ? [2,0] : p >= .7 ? [1,0] : p >= .42 ? [0,0] : p >= .28 ? [0,1] : [0,2];
const edgeDesdeProb = p => (p - .5)*40;

/* ── Los momentos clave ── */
function inicioMomento(edge){
  const e = edge + difActual().rival*.5;
  return e >= 9 ? [2,0] : e >= 4 ? [1,0] : e >= -4 ? [0,0] : e >= -9 ? [0,1] : [0,2];
}
/* Qué forma toma el momento clave. Se van mezclando y nunca se repite la misma dos veces seguidas:
     · pista  → lo juegas en la pista (juego o punto de oro)
     · tiempo → la ráfaga: tres golpes a tiempo para ganar el punto de oro
     · leer   → leer al rival: adivinar a dónde van sus tres bolas
     · camino → eliges camino entre casillas, como en el cuadro de los Majors
   En la previa siempre se elige: es donde se ve si clasificáis o no. */
function elegirForma(j, to){
  const hist = j.formasRecientes = j.formasRecientes || [];
  let ops = to.enPrevia ? ['tiempo','leer','camino'] : ['pista','pista','tiempo','leer','camino'];
  const n = hist.length;
  if(n >= 1){ const quedan = ops.filter(f => f !== hist[n-1]); if(quedan.length) ops = quedan; }
  const f = pick(ops);
  hist.push(f); if(hist.length > 6) hist.shift();
  return f;
}
function crearCaminoMomento(j, obj){
  /* Se pasa con la probabilidad exacta del partido, elijáis la casilla que elijáis: las parejas que os ganan se
     colocan al elegir. Lo que se ve (cuántas casillas y cuántas os sacan) se dibuja a partir de ese mismo %. */
  /* como en el cuadro de siempre, un error no os echa: una oportunidad más (dos con psicólog@). Cada intento sale lo justo
     para que, contándolas, se pase con el % exacto */
  const vidas = 1 + (j.equipo.psico ? 1 : 0), q = obj != null ? 1 - Math.pow(1 - obj, 1/(1 + vidas)) : null;
  const casillas = 5, nMinas = clamp(Math.round((1 - (q != null ? q : .5))*casillas), 1, casillas - 1);
  /* con Mental alto ves venir una casilla mala, igual que en el cuadro: esa os saca seguro */
  const probPista = clamp((j.stats.mental - 45) / 60, 0, 0.85);
  const pista = nMinas >= 2 && Math.random() < probPista ? ri(0, casillas - 1) : null;
  return { casillas, nMinas, obj, q, minas:[], pista, falladas:[], elegida:null, vidas, salvada:false };
}
/* En la pista, la situación también cambia de un momento a otro (y nunca repite la anterior) */
const SITUACIONES_PISTA = [
  { tipo:'juego', juegos:[5,5], inicio:null,  saca:null, txt:(f, s) => `Tercer set, 5-5 y ${s === 0 ? 'sacáis vosotros' : 'sacan ellos'}. <b>Este juego decide el partido${f ? ' y el título' : ''}.</b>` },
  { tipo:'juego', juegos:[6,5], inicio:null,  saca:0,    txt:f => `Tercer set, 6-5 y <b>sacáis para ganar el partido${f ? ' y el título' : ''}.</b> Cerradlo aquí.` },
  { tipo:'juego', juegos:[5,4], inicio:[3,2], saca:0,    txt:f => `Tercer set, 5-4 y 40-30: <b>bola de ${f ? 'título' : 'partido'} a favor.</b> Si se escapa, todavía queda el punto de oro.` },
  { tipo:'punto', juegos:[5,5], inicio:[3,3], saca:null, txt:f => `Tercer set, 5-5 y 40-40. <b>Punto de oro:</b> quien lo gane se lleva el partido${f ? ' y el título' : ''}.` },
];
function crearMomento(j, to, res, esFinal, formaForzada){
  const edge = edgeDupla(j, to.rival, to.ev), forma = formaForzada || elegirForma(j, to), obj = probObjetivo(to);
  const saca = Math.random() < .5 ? 0 : 1, titulo = esFinal ? ' y el título' : '';
  const premio = to.enPrevia ? (to.kPrevia >= RONDAS_PREVIA-1 ? 'entráis al cuadro' : 'pasáis a la segunda ronda de la previa') : esFinal ? 'el partido y el título son vuestros' : 'el partido es vuestro';
  const m = { forma, esFinal, previa: !!to.enPrevia, saca, res, edge, obj, juegos:[5,5], eleccion:null };
  if(forma === 'tiempo'){
    m.tipo = 'punto'; m.inicio = [3,3];
    m.rafaga = crearRafaga(j, edge, obj);
    m.sit = `${to.enPrevia ? 'Previa. ' : ''}Tercer set, 5-5 y 40-40: <b>punto de oro</b>. Se juega a ráfaga: tres golpes, y si acertáis dos, ${premio}.`;
  } else if(forma === 'leer'){
    m.tipo = 'punto'; m.inicio = [3,3];
    m.leer = crearLectura(j, to.rival, edge, obj);
    m.sit = `${to.enPrevia ? 'Previa. ' : ''}Tercer set, 5-5 y 40-40: <b>punto de oro</b> y la bola la tienen ellos. Si les leéis el punto, ${premio}.`;
  } else if(forma === 'camino'){
    m.tipo = 'camino'; m.inicio = inicioDesdeProb(obj);
    m.camino = crearCaminoMomento(j, obj);
    m.sit = `${to.enPrevia ? 'Previa. ' : ''}Tercer set, 5-5. <b>Elegid cómo jugar el final:</b> cada casilla es un camino y detrás de ${m.camino.nMinas === 1 ? 'uno' : 'algunos'} está la pareja que os gana.${m.camino.vidas ? ` Podéis fallar ${m.camino.vidas === 1 ? 'una vez' : m.camino.vidas + ' veces'} sin quedar fuera.` : ''} Si acertáis, ${premio}.`;
  } else {
    /* con un % muy alto o muy bajo no tiene sentido empezar con una bola de partido o un punto de oro */
    const opciones = SITUACIONES_PISTA.map((x, i) => i).filter(i => i !== j.situacionReciente && (!SITUACIONES_PISTA[i].inicio || (obj >= .3 && obj <= .8))), k = pick(opciones), sit = SITUACIONES_PISTA[k];
    j.situacionReciente = k;
    m.tipo = sit.tipo; m.juegos = sit.juegos.slice(); m.inicioFijo = !!sit.inicio;
    m.inicio = sit.inicio ? sit.inicio.slice() : inicioDesdeProb(obj);
    if(sit.saca !== null) m.saca = sit.saca;
    m.sit = sit.txt(esFinal, m.saca);
  }
  m.pPunto = pPuntoParaJuego(obj, m.inicio);      // simulado desde ese marcador, se gana justo el % del partido
  return m;
}
/* Elegir camino: las casillas del cuadro, para un solo partido */
const CAMINO_BIEN = ['Aguantasteis su mejor momento, os pusisteis 6-5 y cerrasteis con una bandeja al rincón.',
  'Globo profundo, subida a la red y dos voleas seguidas. Se les apagó la luz.',
  'Fuisteis a por el revés del más flojo y ahí se rompió todo.'];
const CAMINO_MAL = ['Por ahí os estaban esperando: dos remates por tres seguidos y se acabó.',
  'Os quisisteis quedar en la red y os pasaron por arriba tres veces.',
  'Se os fue la cabeza en el 5-6 y regalasteis el juego.'];
function elegirCaminoMomento(i){
  const m = S.torneo && S.torneo.momento; if(!m || m.forma !== 'camino' || m.eleccion) return;
  const c = m.camino;
  if(i < 0 || i >= c.casillas || c.falladas.indexOf(i) >= 0) return;
  c.salvada = false;
  const gana = i !== c.pista && Math.random() < (c.q != null ? c.q : c.obj != null ? c.obj : .5);
  if(!gana && c.vidas > 0){ c.vidas--; c.falladas.push(i); c.salvada = true; guardar(); render(); return; }
  c.elegida = i;
  c.minas = colocarMinas(c, i, gana);
  m.eleccion = { i, gana, texto: gana ? pick(CAMINO_BIEN) : pick(CAMINO_MAL) };
  guardar(); render();
}
/* al destapar: las falladas, la que visteis venir, la elegida si os sacó y el resto al azar hasta completar */
function colocarMinas(c, elegida, gana){
  const minas = c.falladas.slice();
  if(c.pista !== null && minas.indexOf(c.pista) < 0) minas.push(c.pista);
  if(!gana && minas.indexOf(elegida) < 0) minas.push(elegida);
  const libres = [...Array(c.casillas).keys()].filter(x => x !== elegida && minas.indexOf(x) < 0);
  while(minas.length < c.nMinas && libres.length) minas.push(libres.splice(ri(0, libres.length - 1), 1)[0]);
  return minas;
}
function continuarMomento(){
  const m = S.torneo && S.torneo.momento; if(!m || !m.eleccion || rafagaRecienAcabada(m.rafaga)) return;
  resolverMomento(m.eleccion.gana, false, null, m.forma);
}
function probMomento(m){
  if(m.prob == null) m.prob = m.obj != null ? Math.round(m.obj*100) : Math.round(100*probJuego(m.pPunto, m.inicio[0], m.inicio[1]));
  return m.prob;
}
/* ganar 2 de 3 cuando ya lleváis `bien` aciertos y `mal` fallos, acertando cada una con probabilidad s */
function probDosDeTres(s, bien, mal){ return bien >= 2 ? 1 : mal >= 2 ? 0 : s*probDosDeTres(s, bien + 1, mal) + (1 - s)*probDosDeTres(s, bien, mal + 1); }
const momentoEmpezado = m => m.forma === 'leer' ? !!(m.leer && m.leer.k > 0) : m.forma === 'tiempo' ? !!(m.rafaga && m.rafaga.golpes.some(g => g.res))
  : m.forma === 'camino' ? !!(m.camino && m.camino.falladas.length) : false;
/* La probabilidad de ganar AHORA, con lo que ya se jugó del minijuego. Antes de empezar es la del torneo; a mitad,
   la que queda. Simular a mitad se decide con esta: no da ni más ni menos de lo que toca */
function probActualMomento(m){
  if(m.obj == null) return probJuego(m.pPunto, m.inicio[0], m.inicio[1]);
  if(m.forma === 'leer' && m.leer) return probDosDeTres(aciertoParaDosDeTres(m.obj), m.leer.aciertos, m.leer.fallos);
  if(m.forma === 'tiempo' && m.rafaga){
    const g = m.rafaga.golpes;
    return probDosDeTres(aciertoParaDosDeTres(m.obj), g.filter(x => x.res === 'bien' || x.res === 'perfecto').length, g.filter(x => x.res === 'fuera').length);
  }
  if(m.forma === 'camino' && m.camino && m.camino.q != null) return 1 - Math.pow(1 - m.camino.q, 1 + m.camino.vidas);
  return m.obj;
}
function jugarMomento(){
  const j = S.j, to = S.torneo, m = to && to.momento; if(!m) return;
  const rotulo = m.tipo === 'punto' ? 'PUNTO CLAVE' : 'JUEGO CLAVE';
  const cfg = cfgPartidoCarrera(j, to.rival, to.ev, rotulo);
  if(m.obj != null) cfg.rival = paramsRivalPista(edgeDesdeProb(m.obj) + difActual().rival, to.rival.arq);   // rivales tan buenos como dice el %
  cfg.momento = { inicio:m.inicio, saca:m.saca, juegos:m.juegos };
  cfg.pPunto = m.pPunto;
  cfg.titulo = rotulo;
  cfg.avisoSub = m.tipo === 'punto' ? 'un punto y se acaba' : `empezáis ${textoPuntos(m.inicio)}<br>primero a 4 puntos`;
  cfg.subtitulo = `${to.rival.nombre.split(' ')[0]} / ${to.rival.nombre2.split(' ')[0]} · juegan a ${to.rival.arq.nom}`;
  cfg.alTerminar = rp => resolverMomento(rp.gano, !rp.simulado, rp.stats);
  S.pantalla = 'momento';
  iniciarPartidoPista(cfg);
}
function simularMomento(){
  const m = S.torneo && S.torneo.momento; if(!m) return;
  /* exactamente el % que se ve: el del torneo, o el que queda si el minijuego ya había empezado */
  resolverMomento(Math.random() < probActualMomento(m), false, null);
}
/* Un set para cada pareja y el tercero, el que se decidió en el momento clave */
function setsConClave(sets, gano){
  const gana = s => { const p = s.split('-').map(Number); return p[0] > p[1]; };
  const s1 = sets[0] || '6-4';
  let s2 = sets[1] || '4-6';
  if(gana(s1) === gana(s2)) s2 = s2.split('-').reverse().join('-');
  return [s1, s2, gano ? pick(['7-5','7-6']) : pick(['5-7','6-7'])];          // se decidió a partir del 5-5
}
function resolverMomento(gano, enVivo, st, forma){
  const j = S.j, to = S.torneo, m = to && to.momento; if(!m) return;
  const res = m.res;
  res.gane = gano;
  res.sets = setsConClave(res.sets, gano);
  res.clave = { tipo:m.tipo, enVivo, gano, forma: forma || (enVivo ? 'pista' : null) };
  if(m.tipo === 'punto') res.oros = (res.oros || []).concat([gano]);
  if(enVivo && st){
    res.vivo = { golpes:st.golpes, rallyMax:st.rallyMax, porTres:st.porTres, remates:st.remates, globos:st.globos, dejadas:st.dejadas, perfectos:st.perfectos };
    const pi = j.pista = j.pista || { jugados:0, ganados:0, porTres:0, rallyMax:0, perfectos:0 };
    pi.jugados++; if(gano) pi.ganados++; pi.porTres += st.porTres; pi.rallyMax = Math.max(pi.rallyMax, st.rallyMax); pi.perfectos += st.perfectos;
  }
  to.momento = null;
  S.pantalla = 'torneo';
  aplicarPartido(res);
}
/* Lo llaman el cuadro y el punto de oro de siempre cuando se acaban */
function finMinijuegoTorneo(victorias, gano){
  const to = S.torneo; if(!to) return;
  to.perfecto = to.perfecto && gano;
  to.ronda = victorias;
  S.pantalla = 'torneo';
  /* superar el cuadro del Major lleva a la final, que se juega en la pista */
  if(gano && to.ronda < TIERS[to.ev.t].rondas){ to.ultimo = { cuadro:true, gane:true, sets:[], ronda:'SEMIFINAL' }; nuevoRivalTorneo(); guardar(); render(); return; }
  cerrarTorneoActual();
}

function lesionar(j){
  j.lesion = pick(['Rotura de fibras en el gemelo','Esguince de tobillo','Sobrecarga lumbar','Epicondilitis','Fascitis plantar','Tendinitis del hombro']);
  j.lesionSem = ri(1,2);
}
function aplicarPartido(res){
  const j = S.j, to = S.torneo, T = TIERS[to.ev.t], opp = to.rival;
  j.pj++;
  j.orosJugados = (j.orosJugados||0) + (res.oros||[]).length;
  j.orosGanados = (j.orosGanados||0) + (res.oros||[]).filter(Boolean).length;
  j.salidasPista = (j.salidasPista||0) + (res.salidas||0);
  if(!to.enPrevia && res.red != null){ j.puntosRed = (j.puntosRed||0) + Math.round(res.red*(res.puntos||0)); j.puntosTot = (j.puntosTot||0) + (res.puntos||0); }
  j.energia = clamp(res.energia - (to.enPrevia ? 7 : 0), 0, 100);
  to.partidos.push(res); to.ultimo = res;
  anotarH2H(j, opp, res.gane);
  let fin = false;
  if(res.gane){
    j.pg++; j.pgAnio = (j.pgAnio||0)+1; j.racha = (j.racha||0)+1;
    j.forma = clamp(j.forma + (opp.rank < (j.ranking||3000) ? 1.6 : 0.7), -12, 12);
    j.moral = clamp(j.moral + 2, 0, 100);
    if(to.enPrevia){ to.kPrevia++; if(to.kPrevia >= RONDAS_PREVIA) to.enPrevia = false; }
    else {
      const sets = res.sets.map(s => s.split('-').map(Number));
      if(sets.some(p => p[0] < p[1])) to.perfecto = false;
      if(sets.length === 3 && sets[0][0] < sets[0][1]) to.remontada = true;
      to.ronda++;
    }
    if(res.lesionEnPartido && !j.lesion){ lesionar(j); to.lesionado = true; fin = true; }
    else if(!to.enPrevia && to.ronda >= T.rondas) fin = true;
    else nuevoRivalTorneo();
  } else {
    j.pp++; j.ppAnio = (j.ppAnio||0)+1; j.racha = 0;
    j.forma = clamp(j.forma - (to.enPrevia ? 1.2 : 1.8), -12, 12);
    j.moral = clamp(j.moral - (to.enPrevia ? 2 : 3), 0, 100);
    to.perfecto = false;
    fin = true;
  }
  if(fin) return cerrarTorneoActual();
  if(!S.silencio){ guardar(); render(); }
}
function cerrarTorneoActual(){
  const j = S.j, to = S.torneo, T = TIERS[to.ev.t], ev = to.ev;
  let r;
  if(to.previa && to.enPrevia){
    /* Caer en la previa no es irse con las manos vacías: algo de dinero y medio punto */
    r = cerrarFichaTorneo(ev, 0, to.partidos, false, false, false);
    r.cayoEnPrevia = true;
    r.pts = Math.max(1, Math.round(T.pts[T.pts.length-2] * 0.5));
    r.plata = Math.round(T.prem*0.012);
    r.ronda = 'Previa';
  } else r = cerrarFichaTorneo(ev, to.ronda, to.partidos, to.perfecto && to.ronda >= T.rondas, to.remontada, to.lesionado);
  const rankAntes = j.ranking;
  if(r.pts > 0) j.puntosHist.push({ w: j.anio*TRIMESTRES_POR_ANIO + j.trimestre, pts: r.pts });
  j.dinero += r.plata;
  j.premiosTotal = (j.premiosTotal||0) + r.plata;
  j.premiosAnio = (j.premiosAnio||0) + r.plata;
  recalcRank(j);
  const tr = trimActual();
  S.enGira = tr; anotarTorneo(r); S.enGira = null;          // títulos, historial, moral y fama: como siempre
  tr.jugados.push({ id:ev.id, nom:ev.nom, t:ev.t, ronda:r.ronda, campeon:r.campeon, pts:r.pts, plata:r.plata, cayoEnPrevia:!!r.cayoEnPrevia });
  j.historialTorneos = j.historialTorneos || [];
  j.historialTorneos.push({ a:j.anio, tri:j.trimestre, nom:ev.nom, t:ev.t, ciudad:ev.ciudad, ronda:r.ronda, campeon:r.campeon, pts:r.pts, plata:r.plata });
  if(j.historialTorneos.length > 400) j.historialTorneos.shift();
  const logros = chequearLogros(j, { perfecto: r.campeon && r.perfecto, remontada: r.remontada });
  to.fin = { r, rankAntes, logros };
  anotarRankingTrimestre(j);
  /* vuelve tu pareja de siempre (y se nota un poco que se quedó en casa) */
  if(to.cambioPareja){ j.pareja = to.parejaHabitual; if(j.pareja) j.pareja.quimica = clamp(j.pareja.quimica - 3, 0, 100); to.cambioPareja = false; }
  if(r.campeon && !S.silencio){ Sonido.fanfarria(); Sonido.ovacion(); }
  if(!S.silencio){ guardar(); render(); }
}
function salirTorneo(){
  S.torneo = null; S.verTorneo = null; S.pantalla = 'temporada';
  guardar(); render();
}

/* ── Cerrar el trimestre: el resumen de siempre, con lo que elegiste jugar ── */
function textoTitulo(r){
  const t = r.ev.t;
  let s = t==='MJ' ? `Ganasteis un <b>Major</b>. ${paisDe(S.j).nom} entero os vio levantar ese trofeo.` :
          t==='FIN' ? `Ganasteis las <b>Premier Padel Finals</b>. Sois la mejor pareja del año.` :
          t==='P1' ? `Un <b>P1</b>. Ya jugáis de tú a tú con las mejores parejas del mundo.` :
          t==='P2' ? `Título <b>Premier Padel</b>. Vuestro nombre queda en el cuadro grande.` :
          t==='FIP5' ? `Título <b>Platinum</b>. Es el escalón que abre la puerta del Premier.` :
          `Trofeo en el FIP. Poco dinero, pero puntos que suman.`;
  if(r.perfecto) s += ' Y sin ceder un set.';
  return s;
}
function cerrarTrimestre(){
  const j = S.j, st = trimActual();
  if(!st.jugados.length || st.cerrado) return;
  st.cerrado = true;
  const resultados = st.resultados;
  let dq = 0;
  if(j.pareja){
    dq = clamp(Math.round(st.vic*1.6 - st.der*2.4 + (resultados.some(r=>r.campeon) ? 9 : 0)), -16, 16);
    moverQuimica(j, dq);
    j.pareja.trimestres = (j.pareja.trimestres||0) + 1;
  }
  const notas = [], todos = resultados.reduce((a,r)=>a.concat(r.partidos), []);
  const sim = todos.filter(x => x.red != null && x.puntos), claves = todos.filter(x => x.clave), vivos = claves.filter(x => x.clave.enVivo);
  if(sim.length){
    const pts = sim.reduce((a,x)=>a+x.puntos, 0), pc = Math.round(100*sim.reduce((a,x)=>a+x.red*x.puntos, 0)/pts);
    notas.push({tipo: pc>=52?'':'bad', txt:`🕸️ <b>La red fue vuestra el ${pc}%</b> de los puntos. ` +
      (pc>=58 ? 'Jugasteis casi siempre desde arriba: así se gana en pádel.' : pc>=48 ? 'Se repartió. Los partidos se decidieron en detalles.' : 'Os pasasteis el trimestre defendiendo. Con el globo se recupera la red.')});
  }
  if(claves.length){
    const g = claves.filter(x => x.gane).length, porTres = vivos.reduce((a,x)=>a+((x.vivo && x.vivo.porTres)||0), 0), elegidos = claves.filter(x => ['tiempo','leer','camino'].includes(x.clave.forma)).length;
    notas.push({tipo:'gold', txt:`🔥 <b>${claves.length} momento${claves.length>1?'s':''} clave</b>, ${g} ganado${g===1?'':'s'}` +
      (vivos.length ? ` · 🎾 ${vivos.length} en la pista${porTres?` (💥 ${porTres} por 3)`:''}` : '') + (elegidos ? ` · ⚡ ${elegidos} en minijuegos` : '') + '.'});
  }
  if(j.lesion) notas.push({tipo:'bad', txt:`🩹 Se os cortó el trimestre: <b>${esc(j.lesion)}</b>.`});
  if(j.pareja && j.pareja.quimica < 25) notas.push({tipo:'bad', txt:`💢 <b>Esto se rompe.</b> ${esc(j.pareja.nombre)} apenas te habla en los cambios de lado. O lo arregláis, o cambias de pareja antes de que lo haga ${gx('él','ella')}.`});
  const logros = chequearLogros(j, {perfecto: st.perfecto, remontada: st.remontada});
  const mejor = resultados.slice().sort((a,b)=>pesoResultado(b)-pesoResultado(a))[0];
  const titulos = resultados.filter(r=>r.campeon);
  const ganados = todos.filter(x=>x.gane).length, perdidos = todos.length - ganados;
  let titulo, texto;
  if(titulos.length > 1){ titulo = `${titulos.length} TÍTULOS EN EL TRIMESTRE`; texto = `Arrasasteis: ${titulos.map(r=>esc(r.ev.ciudad)).join(', ')}. Un trimestre de esos se recuerda.`; }
  else if(mejor.campeon){ titulo = `${gx('¡CAMPEÓN','¡CAMPEONA')} EN ${mejor.ev.ciudad.toUpperCase()}!`; texto = textoTitulo(mejor); }
  else if(mejor.victorias === TIERS[mejor.ev.t].rondas-1){ titulo = `FINALISTAS EN ${mejor.ev.ciudad.toUpperCase()}`; texto = 'Llegasteis a la final y se os escapó. Los puntos y el dinero quedan.'; }
  else if(ganados === 0){ titulo = 'TRIMESTRE PARA OLVIDAR'; texto = `${resultados.length} torneo${resultados.length>1?'s':''}, ninguna victoria. Aviones, hoteles y a casa. Así empieza casi todo el mundo.`; }
  else if(st.vic === 0){ titulo = 'TODO EL VIAJE PARA LA PREVIA'; texto = 'Partidos ganados en la previa y ni un cuadro final. Levantarte a las siete para jugar a las nueve.'; }
  else { titulo = `LO MEJOR: ${mejor.ronda.toUpperCase()} EN ${mejor.ev.ciudad.toUpperCase()}`; texto = 'Trimestre desparejo, pero os lleváis ritmo de partido y algo de ranking.'; }
  const T = S.cal[j.trimestre].tr;
  S.gira = { gira:{ nom:T.nom, pista:mejor.ev.pista }, resultados, pts:st.pts, plata:st.plata, vic:st.vic, titulo, texto,
             pg:ganados, pp:perdidos, deltaRank: (st.rankAntes && j.ranking) ? st.rankAntes - j.ranking : 0,
             logros, notas, campeon: titulos.length > 0, dQuimica: dq };
  S.pantalla = 'gira';
  guardar(); render();
}

/* ── Partido rápido, fuera de la carrera o para probar los controles ── */
function partidoRapido(){
  if(S.pantalla !== 'finRapido') S.volverRapido = S.pantalla;
  const j = S.j && !S.j.retirado ? S.j : null, arq = pick(ARQUETIPOS);
  const rivales = duplaRival(ri(30, 400));
  const juegos = [3,4,6].includes(PREF.juegos) ? PREF.juegos : 3, sets = PREF.sets === 3 ? 3 : 1, posicion = j ? j.posicion : (PREF.posicion || 'reves');
  iniciarPartidoPista({
    humano: paramsHumanoPista(j), pareja: paramsParejaPista(j), rival: paramsRivalPista(difActual().rival, arq),
    carril: posicion === 'drive' ? 'der' : 'izq', juegos, sets, pPunto: .5, rapido: true,
    escena: { tipo: pick(['pabellon','exterior','club']), gente: rnd(.45, 1), ciudad: j ? j.ciudad : 'Madrid' },
    equipos: [j ? nombreEquipo(j.nombre, j.pareja ? j.pareja.nombre : 'Pareja') : 'TÚ / PAREJA', nombreEquipo(rivales.nombre, rivales.nombre2)],
    titulo: 'PARTIDO RÁPIDO', subtitulo: `${formatoTexto(sets, juegos, true)} · juegan a ${arq.nom}`, rotulo: '',
    alTerminar: res => { S.rapido = res; S.pantalla = 'finRapido'; render(); },
  });
}
