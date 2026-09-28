
/* ═══════════════════════════════════════════════════════════════
   EL DESAFÍO DEL DÍA
   Uno por día, el mismo para todos ese día. Si lo cumples, plata para tu
   carrera y un día más de racha. Se puede reintentar hasta conseguirlo.
   ═══════════════════════════════════════════════════════════════ */
const fechaTexto = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const hoyTexto = () => fechaTexto(new Date());
const ayerTexto = () => { const d = new Date(); d.setDate(d.getDate() - 1); return fechaTexto(d); };
function estadoDesafio(){ return Object.assign({ f:null, racha:0, mejor:0, total:0 }, PREF.desafio || {}); }
const desafioHecho = () => estadoDesafio().f === hoyTexto();
const rachaSiGana = () => { const st = estadoDesafio(); return st.f === ayerTexto() ? st.racha + 1 : 1; };
const premioDesafio = racha => 2500 + 500*Math.min(Math.max(racha, 1), 6);
function desafioDeHoy(){
  const f = hoyTexto();
  return conSemilla('desafio|' + f, () => {
    const tipo = pick(['drill', 'drill', 'rival', 'limpio']);
    if(tipo === 'drill'){
      const id = pick(Object.keys(DRILLS)), obj = Math.min(9, DRILLS[id].objetivo + 2);
      return { f, tipo, id, obj, ic:'diana', tit:`${DRILLS[id].nom}: ${obj} de 10`, d:`En el entrenamiento de ${DRILLS[id].nom.toLowerCase()}, acierta ${obj} de las 10 bolas.` };
    }
    if(tipo === 'rival'){
      const k = Math.floor(Math.random()*ARQUETIPOS.length);
      return { f, tipo, k, ic:'trofeo', tit:'Gánale a una pareja top', d:`Partido a 4 juegos contra una pareja más fuerte de lo normal que juega a ${ARQUETIPOS[k].nom}.` };
    }
    return { f, tipo, ic:'estrella', tit:'Partido perfecto', d:'Gana un partido a 3 juegos sin ceder ni un juego: 3-0.' };
  });
}
function jugarDesafio(){
  if(desafioHecho()) return;
  const d = desafioDeHoy();
  S.desafio = d; S.volverDesafio = S.pantalla === 'desafio' ? (S.volverDesafio || 'inicio') : S.pantalla;
  if(d.tipo === 'drill'){ empezarEntreno(d.id); return; }
  const j = S.j && !S.j.retirado ? S.j : null, pos = j ? j.posicion : (PREF.posicion || 'reves');
  iniciarPartidoPista({
    humano: paramsHumanoPista(j), pareja: paramsParejaPista(j),
    rival: paramsRivalPista(difActual().rival + (d.tipo === 'rival' ? 1.3 : 0), ARQUETIPOS[d.k] || ARQUETIPOS[0]),
    carril: pos === 'drive' ? 'der' : 'izq', juegos: d.tipo === 'rival' ? 4 : 3, sets: 1, pPunto: .5, rapido: true,
    escena: { tipo:'pabellon', gente:.9, ciudad:'' }, equipos: [j ? nombreEquipo(j.nombre, j.pareja ? j.pareja.nombre : 'Pareja') : 'TÚ / PAREJA', 'DESAFÍO'],
    titulo: 'DESAFÍO DEL DÍA', subtitulo: d.d, avisoSub: d.d, rotulo: 'DESAFÍO DEL DÍA',
    alTerminar: res => cerrarDesafio(res),
  });
}
function cerrarDesafio(res){
  const d = S.desafio; S.desafio = null;
  if(!d) return;
  let ok = false;
  if(d.tipo === 'drill') ok = !!(res.drill && res.drill.aciertos >= d.obj);
  else if(d.tipo === 'rival') ok = !!res.gano;
  else { const s0 = (res.sets && res.sets[0]) || res.juegos; ok = !!res.gano && !!s0 && s0[1] === 0; }
  let premio = 0;
  if(ok && !desafioHecho()){
    const st = estadoDesafio(), racha = rachaSiGana();
    Object.assign(st, { f: hoyTexto(), racha, mejor: Math.max(st.mejor, racha), total: st.total + 1 });
    PREF.desafio = st; guardarPref();
    const j = S.j && !S.j.retirado ? S.j : null;
    if(j){ premio = premioDesafio(racha); j.dinero += premio; guardar(); }
  }
  S.desafioRes = { d, ok, premio, res };
  S.pantalla = 'desafio'; render();
}
/* ── La tarjeta, en la portada y en la temporada ── */
function desafioHTML(){
  if(typeof DRILLS === 'undefined') return '';
  const d = desafioDeHoy(), st = estadoDesafio(), hecho = desafioHecho(), j = S.j && !S.j.retirado ? S.j : null;
  const racha = hecho ? st.racha : (st.f === ayerTexto() ? st.racha : 0);
  return `<div class="card desafio ${hecho ? 'hecho' : ''}">
    <div class="des-top"><div class="eyebrow">${ico('calendario')} DESAFÍO DEL DÍA</div><span class="des-racha" title="Días seguidos">${ico('rayo')} ${racha} día${racha === 1 ? '' : 's'}</span></div>
    <div class="des-cuerpo"><span class="des-ico">${ico(d.ic)}</span><div style="min-width:0"><div class="des-tit">${esc(d.tit)}</div><p class="muted" style="margin:2px 0 0">${esc(d.d)}</p></div></div>
    ${hecho ? `<div class="des-ok">${ico('escudo')} Cumplido hoy. Mañana, otro.</div>`
      : `<div class="des-pie"><span class="des-premio">${j ? `Premio: <b>${money(premioDesafio(rachaSiGana()))}</b>` : 'Suma a tu racha'}</span><button class="btn sm" onclick="jugarDesafio()">${ico('jugar')} JUGAR</button></div>`}
  </div>`;
}
function vDesafio(){
  const r = S.desafioRes; if(!r){ S.pantalla = 'inicio'; return vInicio(); }
  const st = estadoDesafio(), volver = S.volverDesafio && !['desafio','finEntreno','finRapido'].includes(S.volverDesafio) ? S.volverDesafio : (S.j ? 'temporada' : 'inicio');
  return `<div class="fade">
  <div class="card ${r.ok ? 'event-hero' : 'event-hero mal'}">
    <div class="eyebrow">${ico('calendario')} DESAFÍO DEL DÍA</div>
    <div class="title-xl" style="margin:6px 0 6px">${r.ok ? '¡DESAFÍO CUMPLIDO!' : 'ESTA VEZ NO'}</div>
    <p class="sub" style="margin:0">${esc(r.d.tit)}. ${r.ok ? (r.premio ? `Cobras <b>${money(r.premio)}</b> para tu carrera.` : '') + ` Racha: <b>${st.racha} día${st.racha === 1 ? '' : 's'}</b> (tu mejor: ${st.mejor}).` : 'Puedes intentarlo otra vez: el desafío dura todo el día.'}</p>
  </div>
  ${r.ok ? '' : `<button class="btn" onclick="jugarDesafio()">${ico('jugar')} OTRA VEZ</button><div style="height:8px"></div>`}
  ${volverAtras(() => { S.desafioRes = null; S.pantalla = volver; })}</div>`;
}
