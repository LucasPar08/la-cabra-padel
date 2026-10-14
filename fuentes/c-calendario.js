
/* ═══════════════════════════════════════════════════════════════
   LA TEMPORADA POR FECHAS
   Un año de verdad: 52 semanas y cada torneo en su fecha. Cada semana hay
   uno, dos o tres torneos a la vez, de categorías distintas, y juegas uno
   como mucho: el que te deje tu ranking. O descansas, o entrenas. Si
   quieres, el juego te dice cuál te conviene, o lo elige él todas las semanas.
   Por dentro el año sigue partido en cuatro bloques de trece semanas: ahí se
   cuentan los puntos, se mueve el circuito y llega el balance.
   ═══════════════════════════════════════════════════════════════ */
const SEMANAS_TRIMESTRE = 13;

/* ── Los torneos de abajo ──
   Antes del FIP está el pádel de cada país: el torneo del club, el open regional
   y el circuito nacional. Ahí empieza todo el mundo. Dan pocos puntos pero se
   pueden ganar, y cuando tu ranking ya está por encima, no te dejan entrar. */
Object.assign(TIERS, {
  CLUB:{nom:'TORNEO DE CLUB',    cls:'t-F', pts:[3,2,1,0,0],    prem:300,  rondas:4, acc:9999, base:true},
  REG: {nom:'OPEN REGIONAL',     cls:'t-F', pts:[5,3,2,1,0,0],  prem:700,  rondas:5, acc:9999, base:true},
  NAC: {nom:'CIRCUITO NACIONAL', cls:'t-F', pts:[8,5,3,2,1,0],  prem:1500, rondas:5, acc:9999, base:true},
});
const esBase = t => !!(TIERS[t] && TIERS[t].base);
/* con este ranking ya no te dejan jugarlos */
const TOPE_BASE = { CLUB:1400, REG:900, NAC:600 };
/* los rivales no tienen ranking FIP: el puesto es el que tendrían, sólo para medir su nivel */
const RANGOS_BASE = {
  CLUB:[[3200,5000],[2600,4000],[2200,3400],[1800,2900]],
  REG: [[2600,4200],[2200,3400],[1800,2900],[1500,2400],[1300,2000]],
  NAC: [[2000,3200],[1600,2500],[1350,2150],[1150,1850],[1000,1600]],
};
const ratingAmateur = rk => 99 - 12.6*Math.log10(rk + 1);         // la misma escala que el ranking, sin el tope del 2000
function duplaAmateur(rk){
  const d = duplaRival(rk);
  d.rating += ratingAmateur(rk) - ratingDeRank(rk);
  return d;
}
/* una semana de club cansa menos: duermes en casa */
const DESGASTE_SEMANA_BASE = 2;
const CLUBES_BASE = ['Club Náutico','Club de Campo','Club Atlético','Polideportivo Municipal','Club Social','Club Deportivo',
  'Club de Tenis y Pádel','Pádel Center','Club Universitario','Country Club','Club del Parque','Club Ferroviario','Club Hípico'];
/* cada semana: un torneo de club en tu ciudad y un open regional; cada dos, una etapa del circuito nacional */
function giraBase(j, tri){
  const pais = paisDe(j), ciudades = pais.ciudades.map(c => c.n), pista = pistaDeCasa(j), torneos = [];
  const casa = j.ciudad || ciudades[0], c0 = ri(0, CLUBES_BASE.length - 1);
  const sede = s => ({ pista, pais: null, sedePais: pais.id, sem: s, base: true });
  for(let s = 1; s <= SEMANAS_TRIMESTRE; s++){
    const reg = ciudades[(s + tri) % ciudades.length];
    torneos.push(Object.assign({ t:'CLUB', nom:`Torneo del ${CLUBES_BASE[(c0 + s) % CLUBES_BASE.length]}`, ciudad: casa }, sede(s)));
    torneos.push(Object.assign({ t:'REG', nom:`Open Regional de ${reg}`, ciudad: reg }, sede(s)));
    if(s % 2 === 0){
      const nac = ciudades[(s/2 + tri*2) % ciudades.length];
      torneos.push(Object.assign({ t:'NAC', nom:`Circuito Nacional · Etapa ${tri*6 + s/2}`, ciudad: nac }, sede(s)));
    }
  }
  return { id:'base', base:true, nom:'El pádel de tu país', ic:'🎾', reg:'co', pista, d:'Torneos de club, opens regionales y el circuito nacional.', torneos };
}
/* una semana de torneo cansa aunque pierdas pronto: viaje, hotel, entrenar en pista ajena.
   Se cobra al terminar el torneo, para que los % que viste al entrar sean los de verdad. */
const DESGASTE_SEMANA_TORNEO = 3;
const ANIO_BASE = 2026;                         // la temporada 1 es la de 2027
const MESES_CORTOS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESES_LARGOS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
/* contra quién te toca en cada ronda (el mismo cuadro que usa el sorteo) */
const RANGOS_RIVAL = {
  ...RANGOS_BASE,
  FIP1:[[900,2000],[700,1700],[520,1300],[400,1000],[300,760]],
  FIP2:[[600,1500],[470,1200],[360,900],[280,680],[200,500]],
  FIP3:[[250,700],[200,550],[155,420],[115,300],[75,200]],
  FIP4:[[200,560],[160,430],[125,330],[90,235],[58,160]],
  FIP5:[[150,430],[120,330],[92,250],[66,175],[42,118]],
  P2:  [[60,200],[46,150],[33,100],[20,62],[9,36]],
  P1:  [[38,130],[29,92],[20,62],[11,38],[5,20],[1,10]],
  MJ:  [[40,175],[30,110],[22,72],[14,48],[8,29],[3,15],[1,8]],
  FIN: [[1,8],[1,7],[1,5]],
};

/* ── Cada torneo, en su semana. Las giras grandes del Premier van seguidas
      (semanas 2-4, 6-8 y 10-12 del bloque); los FIP se reparten de cuatro en
      cuatro para que cada semana haya algo para cada nivel. Las Finals, en la
      última semana del año. ── */
function asignarSemanas(giras){
  let premier = 0, fip = 0;
  const desfases = [1, 3, 2, 4];
  for(const g of giras){
    const esPremier = g.torneos.some(ev => ['P2','P1','MJ','FIN'].includes(ev.t));
    const ini = esPremier ? [2, 6, 10][premier++ % 3] : desfases[fip++ % 4];
    g.torneos.forEach((ev, k) => { ev.sem = ev.t === 'FIN' ? SEMANAS_TRIMESTRE : Math.min(SEMANAS_TRIMESTRE - 1, esPremier ? ini + k : ini + 4*k); });
  }
  return giras;
}
function asegurarSemanas(){
  if(!S.cal) return;
  S.cal.forEach((tri, i) => {
    const giras = tri.giras.filter(g => !g.base);
    if(giras.some(g => g.torneos.some(ev => ev.sem == null))) asignarSemanas(giras);
    if(S.j && !tri.giras.some(g => g.base)) tri.giras.push(giraBase(S.j, i));
  });
}
function semanaActual(j){ if(!(j.semana >= 1)) j.semana = 1; return j.semana; }
const semanaDelAnio = (j, sem, tri) => (tri == null ? j.trimestre : tri)*SEMANAS_TRIMESTRE + (sem || semanaActual(j));
const anioCalendario = j => ANIO_BASE + j.anio;
/* la semana n del año: de lunes a domingo */
function diasSemana(j, n){
  const d = new Date(anioCalendario(j), 0, 1);
  while(d.getDay() !== 1) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + (n - 1)*7);
  const f = new Date(d); f.setDate(f.getDate() + 6);
  return { ini: d, fin: f };
}
function fechaSemCorta(j, n){
  const { ini, fin } = diasSemana(j, n);
  return ini.getMonth() === fin.getMonth() ? `${ini.getDate()}–${fin.getDate()} ${MESES_CORTOS[fin.getMonth()]}`
    : `${ini.getDate()} ${MESES_CORTOS[ini.getMonth()]}–${fin.getDate()} ${MESES_CORTOS[fin.getMonth()]}`;
}
function fechaSemLarga(j, n){
  const { ini, fin } = diasSemana(j, n);
  return ini.getMonth() === fin.getMonth() ? `${ini.getDate()} al ${fin.getDate()} de ${MESES_LARGOS[fin.getMonth()]}`
    : `${ini.getDate()} de ${MESES_LARGOS[ini.getMonth()]} al ${fin.getDate()} de ${MESES_LARGOS[fin.getMonth()]}`;
}
function torneosDeLaSemana(j, sem){ asegurarSemanas(); const s = sem || semanaActual(j); return torneosDelTrimestre().filter(ev => ev.sem === s); }

/* ── Lo que vale un torneo para ti: los puntos que puedes esperar sacar.
      Se juega de verdad, en simulación, contra el rival típico de cada ronda
      de esa categoría: los mismos partidos que luego se juegan, sin fórmulas. ── */
const PARTIDOS_VALOR = 60;
function probRonda(j, ev, rank, ronda, total){
  const D = difActual(), opp = Object.assign(duplaRival(rank), { rating: (esBase(ev.t) ? ratingAmateur(rank) : ratingDeRank(rank)) - ((D.ayuda || {})[ev.t] || 0), arq: ARQUETIPOS[3] });
  let g = 0;
  for(let i = 0; i < PARTIDOS_VALOR; i++) if(simularPartido(j, opp, ev, ronda, total).gane) g++;
  return g / PARTIDOS_VALOR;
}
/* el décimo mejor resultado que te cuenta hoy: un resultado peor no te sube nada */
function umbralResultados(j){
  const w = j.anio*TRIMESTRES_POR_ANIO + j.trimestre, vig = [];
  for(const x of j.puntosHist || []){ const peso = PESO_ANTIGUEDAD[w - x.w]; if(peso) vig.push(x.pts*peso); }
  vig.sort((a, b) => b - a);
  return vig.length < RESULTADOS_QUE_CUENTAN ? 0 : vig[RESULTADOS_QUE_CUENTAN - 1];
}
const VALORES = new Map();
function valorTorneo(j, ev, est){
  const T = TIERS[ev.t], tabla = RANGOS_RIVAL[ev.t] || RANGOS_RIVAL.FIP1;
  const clave = ['valor', ev.t, ev.nom, semanaDelAnio(j), claveChances(j), est && est.tipo, umbralResultados(j), PREF.dificultad || 'normal'].join('|');
  if(VALORES.has(clave)) return VALORES.get(clave);
  if(VALORES.size > 400) VALORES.clear();
  const v = conSemilla(clave, () => {
    const umbral = umbralResultados(j), suma = x => Math.max(0, x - umbral);
    let llegar = 1, esperado = 0, sube = 0, primera = null;
    if(est && est.tipo === 'previa'){
      const acc = T.acc === 9999 ? 1200 : T.acc, rk = Math.round(acc*1.9);
      const pp = Math.max(1, Math.round((T.pts[T.pts.length - 2] || 0)*0.2));      // sólo si ganas algún partido de la previa
      for(let k = 0; k < RONDAS_PREVIA; k++){
        const q = probRonda(j, ev, rk, 0, T.rondas);
        if(primera === null) primera = q;
        if(k >= 1){ esperado += llegar*(1 - q)*pp; sube += llegar*(1 - q)*suma(pp); }
        llegar *= q;
      }
    }
    for(let r = 0; r < T.rondas; r++){
      const rg = tabla[Math.min(r, tabla.length - 1)];
      const q = probRonda(j, ev, Math.round(Math.sqrt(rg[0]*rg[1])), r, T.rondas);
      if(primera === null) primera = q;
      esperado += llegar*(1 - q)*(T.pts[T.rondas - r] || 0);
      sube += llegar*(1 - q)*suma(T.pts[T.rondas - r] || 0);
      llegar *= q;
      if(llegar < .002) break;
    }
    return { pts: esperado + llegar*T.pts[0], sube: sube + llegar*suma(T.pts[0]), titulo: llegar, primera };
  });
  VALORES.set(clave, v);
  return v;
}
/* qué tal te queda un torneo: fácil si lo sueles ganar; si no, por lo que cuesta pasar el primer partido */
function nivelTorneo(j, ev, est){
  const v = valorTorneo(j, ev, est), q = v.primera;
  return v.titulo >= .5 ? { k:'facil', txt:'FÁCIL PARA TI', cls:'' } : q >= .5 ? { k:'nivel', txt:'A TU NIVEL', cls:'acc' }
       : q >= .3 ? { k:'exigente', txt:'EXIGENTE', cls:'gold' } : { k:'dificil', txt:'MUY DIFÍCIL', cls:'mal' };
}
/* ── Lo que te conviene esta semana: el torneo que más puntos te puede dar,
      o descansar si estás sin energía y no es un torneo grande ── */
function recomendacionSemana(j){
  if(j.lesion && j.lesionSem > 0) return { tipo:'baja', txt:'Estás de baja: toca recuperarse.' };
  const evs = torneosDeLaSemana(j).map(ev => ({ ev, est: estadoTorneo(j, ev) })).filter(x => puedeEntrar(x.est));
  const parar = j.energia >= 60 ? { tipo:'entreno', txt:'Entrena: una semana en el club puede subirte una estadística.' }
                                : { tipo:'descanso', txt:'Descansa y recupera energía para lo que viene.' };
  if(!evs.length) return Object.assign(parar, { txt:'Esta semana no hay ningún torneo a tu alcance. ' + parar.txt });
  for(const x of evs) x.valor = valorTorneo(j, x.ev, x.est);
  evs.sort((a, b) => b.valor.sube - a.valor.sube || b.valor.pts - a.valor.pts);
  const mejor = evs[0], grande = ['MJ','FIN','P1'].includes(mejor.ev.t);
  if(j.energia < 25 || (j.energia < 45 && !grande))
    return { tipo:'descanso', txt:`Estás al ${Math.round(j.energia)}% de energía: mejor descansar y llegar fresc${ga()} a la siguiente.`, mejor };
  if(mejor.valor.sube < .2 && !grande)
    return Object.assign(parar, { txt:'Ninguno de estos torneos te sube el ranking: con lo que puedes sacar no mejoras tus 10 mejores resultados. ' + parar.txt, mejor });
  const sube = Math.round(mejor.valor.sube);
  return { tipo:'torneo', ev: mejor.ev, est: mejor.est, valor: mejor.valor,
           txt: `${mejor.est.tipo === 'previa' ? 'Entras por la previa, pero es' : 'Es'} donde más te puede subir el ranking${sube >= 1 ? `: unos <b>${sube} pts</b> de media` : ''}.` };
}

/* ── Lo que haces cada semana ── */
function anotarSemana(j, txt){
  const n = semanaDelAnio(j);
  j.semanas = j.semanas && j.semanas.anio === j.anio ? j.semanas : { anio: j.anio, s: {} };
  j.semanas.s[n] = txt;
}
function elegirPorMi(){                              // "que elija el juego"
  const j = S.j, r = recomendacionSemana(j);
  if(r.tipo === 'torneo'){ abrirTorneo(r.ev.id); inscribirse(); return true; }
  if(r.tipo === 'entreno'){ entrenarSemana(); return false; }
  descansarSemana(r.tipo === 'baja');
  return false;
}
function descansarSemana(deBaja){
  const j = S.j;
  const rec = 20 + j.stats.fisico/12 + (j.equipo.fisio ? 4 : 0) + (j.equipo.preparador ? 3 : 0) + (tieneMejora(j, 'altura') ? 2 : 0);
  j.energia = clamp(j.energia + rec, 0, 100);
  j.moral = clamp(j.moral + 1, 0, 100);
  j.forma = clamp(j.forma - .4, -12, 12);
  anotarSemana(j, deBaja ? '🩹 De baja' : '🛋️ Descanso');
  avanzarSemana();
}
function entrenarSemana(){
  const j = S.j;
  j.energia = clamp(j.energia + 9, 0, 100);
  j.forma = clamp(j.forma - .2, -12, 12);
  const posibles = STAT_KEYS.filter(k => j.stats[k] < j.pot[k]);
  let txt = '🏋️ Semana de entrenamiento';
  if(posibles.length && Math.random() < .3){
    const k = pick(posibles);
    j.stats[k] = clamp(j.stats[k] + 1, 10, j.pot[k]);
    txt += ` · +1 ${STAT_NOM[k]}`;
    S.msgs = (S.msgs || []).concat([{ txt: `🏋️ Una semana en el club de ${esc(j.ciudad)}: <b>+1 ${STAT_NOM[k]}</b>.` }]);
  }
  anotarSemana(j, txt);
  avanzarSemana();
}
/* pasa la semana: la baja se cuenta por semanas y al acabar el bloque llega el balance */
function avanzarSemana(){
  const j = S.j;
  if(j.lesion && j.lesionSem > 0){
    if(j.bajaSemanas == null) j.bajaSemanas = j.lesionSem*6;
    j.bajaSemanas--;
    if(j.bajaSemanas <= 0){ j.lesion = null; j.lesionSem = 0; j.bajaSemanas = null; S.msgs = (S.msgs || []).concat([{ txt:'✅ Te han dado el alta. De vuelta a la pista.' }]); }
  }
  j.semana = semanaActual(j) + 1;
  if(j.semana > SEMANAS_TRIMESTRE){
    const tr = trimActual();
    if(tr.jugados.length && !tr.cerrado){ cerrarTrimestre(); return; }
    pasarTrimestre(); return;
  }
  S.pantalla = 'temporada';
  /* en modo automático, las semanas sin nada que te convenga pasan solas */
  if(j.calAuto){
    const r = recomendacionSemana(j);
    if(r.tipo !== 'torneo' && !S.enCadena){
      S.enCadena = true;
      try{ if(r.tipo === 'entreno') entrenarSemana(); else descansarSemana(r.tipo === 'baja'); } finally { S.enCadena = false; }
      return;
    }
  }
  guardar(); render();
}
function cambiarCalAuto(){ S.j.calAuto = !S.j.calAuto; guardar(); render(); }

/* ── La tarjeta de la semana ── */
function semanaHTML(j, tr){
  const sem = semanaActual(j), n = semanaDelAnio(j), evs = torneosDeLaSemana(j);
  const r = recomendacionSemana(j), enBaja = r.tipo === 'baja';
  const estados = evs.map(ev => {
    const est = estadoTorneo(j, ev), x = { ev, est, conviene: r.tipo === 'torneo' && r.ev.id === ev.id };
    if(puedeEntrar(est)) x.nivel = nivelTorneo(j, ev, est);
    return x;
  });
  /* a la vista, lo que puedes jugar sin que sea una locura; lo demás, plegado (lo de abajo que ya no te toca, ni eso) */
  const visible = x => x.conviene || x.est.tipo === 'jugado' || (x.nivel && x.nivel.k !== 'dificil');
  const fila = x => {
    let f = filaTorneo(j, x.ev, x.est, -99);
    const chips = (x.conviene ? `<span class="pill te-conviene">${ico('estrella')} TE CONVIENE</span> ` : '')
                + (x.nivel ? `<span class="pill ${x.nivel.cls}">${x.nivel.txt}</span> ` : '');
    if(chips) f = f.replace('<span class="d" style="margin-top:5px">', `<span class="d" style="margin-top:5px">${chips}`);
    return f;
  };
  const primero = (a, b) => (b.conviene - a.conviene) || orden(b.ev.t) - orden(a.ev.t);
  const principales = estados.filter(visible).sort(primero);
  const otros = estados.filter(x => !visible(x) && !(x.est.tipo === 'bajo' && esBase(x.ev.t))).sort(primero);
  const filas = principales.map(fila).join('') + (otros.length ? `<details class="desp"><summary>${otros.length === 1 ? 'Otro torneo' : `Otros ${otros.length} torneos`} esta semana, fuera de tu nivel</summary>${otros.map(fila).join('')}</details>` : '');
  const principal = enBaja ? `<button class="btn" onclick="descansarSemana(true)">${ico('avanzar')} PASAR LA SEMANA (RECUPERÁNDOME)</button>`
    : r.tipo === 'torneo' ? `<button class="btn" onclick="elegirPorMi()">${ico('jugar')} ${j.calAuto ? 'JUGAR · ' + esc(r.ev.nom).toUpperCase() : 'QUE ELIJA EL JUEGO'}</button>`
    : r.tipo === 'entreno' ? `<button class="btn" onclick="entrenarSemana()">🏋️ ENTRENAR ESTA SEMANA</button>`
    : `<button class="btn" onclick="descansarSemana()">${ico('avanzar')} DESCANSAR ESTA SEMANA</button>`;
  return `<div class="card semana-card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <div class="eyebrow">${ico('calendario')} ESTA SEMANA</div>
      <span class="pill acc">SEMANA ${n} DE 52</span>
    </div>
    <div class="title-lg" style="margin:4px 0 2px">Del ${fechaSemLarga(j, n)}</div>
    ${evs.length ? `<p class="muted" style="margin:2px 0 9px">${principales.length ? (principales.length === 1 ? 'Este es el torneo de tu nivel' : 'Estos son los torneos de tu nivel') + ' esta semana. Juegas uno como mucho.' : 'Esta semana no hay ningún torneo a tu nivel.'}</p>${filas}`
      : `<p class="muted" style="margin:4px 0 0">Esta semana no hay torneos en el calendario.</p>`}
    <div class="log" style="margin:10px 0 9px">${r.tipo === 'torneo' ? `⭐ <b>Te conviene: ${esc(r.ev.nom)}</b>. ${r.txt}` : (r.tipo === 'baja' ? '🩹 ' : r.tipo === 'entreno' ? '🏋️ ' : '🛋️ ') + r.txt}</div>
    ${principal}
    ${enBaja ? '' : `<div class="row" style="margin-top:8px">
      <button class="btn ghost sm" onclick="descansarSemana()">🛋️ DESCANSAR</button>
      <button class="btn ghost sm" onclick="entrenarSemana()">🏋️ ENTRENAR</button>
    </div>`}
    <button class="cal-auto ${j.calAuto ? 'on' : ''}" onclick="cambiarCalAuto()"><span class="cal-sw"></span><span><b>Que el juego elija todas las semanas</b><small>${j.calAuto ? 'Cada semana te deja anotad${ga()} en el torneo que más te conviene; las semanas sin torneo para ti pasan solas.' : 'Si lo activas, cada semana te deja el torneo elegido y las semanas vacías pasan solas.'}</small></span></button>
  </div>`;
}
/* ── Lo que viene ── */
function proximasHTML(j){
  const sem = semanaActual(j), filas = [];
  for(let s = sem + 1; s <= Math.min(SEMANAS_TRIMESTRE, sem + 4); s++){
    const evs = torneosDeLaSemana(j, s).filter(ev => !(esBase(ev.t) && torneoDemasiadoBajo(j, ev))), n = semanaDelAnio(j, s);
    const chips = evs.length ? evs.map(ev => {
      const e = entradaTorneo(j, ev), bajo = torneoDemasiadoBajo(j, ev);
      const cls = bajo ? 'muted' : e === 'directo' ? 'ok' : e === 'previa' ? 'previa' : 'no';
      return `<span class="chip-fecha ${cls}" onclick="abrirTorneo('${ev.id}')"><span class="tier ${TIERS[ev.t].cls}">${etiquetaTier(ev.t)}</span>${esc(ev.ciudad || ev.nom)}</span>`;
    }).join('') : '<span class="muted" style="font-size:13px">Sin torneos</span>';
    filas.push(`<div class="prox-fila"><div class="prox-fecha"><b>Sem ${n}</b><small>${fechaSemCorta(j, n)}</small></div><div class="prox-chips">${chips}</div></div>`);
  }
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <div class="eyebrow">${ico('calendario')} PRÓXIMAS FECHAS</div>
      <button class="btn ghost sm" style="width:auto;padding:5px 11px;min-height:0" onclick="S.pantalla='calendario';render()">TODO EL AÑO</button></div>
    <div style="height:6px"></div>
    ${filas.length ? filas.join('') : '<p class="muted" style="margin:4px 0 0">Es la última semana del bloque: después llega el balance.</p>'}
    <p class="muted" style="margin:8px 0 0;font-size:12px"><span class="pto-cal ok"></span> entras directo · <span class="pto-cal previa"></span> por la previa · <span class="pto-cal no"></span> todavía no te alcanza</p></div>`;
}
/* ── El año entero, mes a mes ── */
function vCalendario(){
  const j = S.j; if(!j){ S.pantalla = 'inicio'; return vInicio(); }
  asegurarSemanas();
  const hoy = semanaDelAnio(j), hechas = (j.semanas && j.semanas.anio === j.anio) ? j.semanas.s : {};
  let h = `<div class="fade"><div class="card event-hero"><div class="eyebrow">${ico('calendario')} CALENDARIO ${anioCalendario(j)}</div>
    <div class="title-lg" style="margin:5px 0 4px">El año, semana a semana</div>
    <p class="sub" style="margin:0">Cada torneo tiene su fecha. Estás en la <b>semana ${hoy}</b>.</p></div>`;
  let mesActual = -1, bloque = '';
  for(let tri = 0; tri < TRIMESTRES_POR_ANIO; tri++){
    const giras = S.cal[tri] ? S.cal[tri].giras : [];
    for(let s = 1; s <= SEMANAS_TRIMESTRE; s++){
      const n = tri*SEMANAS_TRIMESTRE + s, mes = diasSemana(j, n).ini.getMonth();
      if(mes !== mesActual){ if(bloque) h += bloque + '</div>'; bloque = `<div class="card"><div class="eyebrow">${MESES_LARGOS[mes].toUpperCase()}</div><div style="height:4px"></div>`; mesActual = mes; }
      const evs = [], vistos = new Set();
      giras.forEach(g => g.torneos.forEach(ev => { if(ev.sem === s && !vistos.has(ev.t + ev.nom) && !(esBase(ev.t) && torneoDemasiadoBajo(j, ev))){ vistos.add(ev.t + ev.nom); evs.push(ev); } }));
      const pasada = n < hoy, actual = n === hoy;
      const lo = hechas[n] ? `<span class="cal-hecho">${hechas[n]}</span>` : '';
      bloque += `<div class="cal-fila ${actual ? 'hoy' : pasada ? 'pasada' : ''}"><div class="prox-fecha"><b>Sem ${n}</b><small>${fechaSemCorta(j, n)}</small></div><div class="prox-chips">${
        lo || (evs.length ? evs.map(ev => `<span class="chip-fecha ${tri === j.trimestre && !pasada ? (torneoDemasiadoBajo(j, ev) ? 'muted' : entradaTorneo(j, ev) === 'directo' ? 'ok' : entradaTorneo(j, ev) === 'previa' ? 'previa' : 'no') : 'muted'}"><span class="tier ${TIERS[ev.t].cls}">${etiquetaTier(ev.t)}</span>${esc(ev.ciudad || ev.nom)}</span>`).join('') : '<span class="muted" style="font-size:13px">Sin torneos</span>')
      }</div></div>`;
    }
  }
  h += bloque + `</div>${volverAtras(() => { S.pantalla = 'temporada'; })}</div>`;
  return h;
}
