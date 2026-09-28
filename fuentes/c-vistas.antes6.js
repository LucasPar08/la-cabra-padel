
/* ═══════════════════════════════════════════════════════════════
   PANTALLAS DEL CIRCUITO · CALENDARIO, TORNEO, PREMIOS Y CONTROLES
   ═══════════════════════════════════════════════════════════════ */
const GRUPOS_CAL = [
  ['🏛️ MAJORS Y FINALS', ['MJ','FIN']], ['💎 PREMIER PADEL P1', ['P1']], ['🎖️ PREMIER PADEL P2', ['P2']],
  ['🏅 FIP PLATINUM', ['FIP5']], ['🥈 FIP GOLD', ['FIP4']], ['🥉 FIP STAR', ['FIP3']], ['🎾 FIP RISE', ['FIP2']], ['🎾 FIP PROMISES', ['FIP1']],
];
const puedeEntrar = est => est.tipo === 'directo' || est.tipo === 'previa';

function filaTorneo(j, ev, est, nivel){
  const T = TIERS[ev.t], puede = puedeEntrar(est);
  let estado;
  if(est.tipo === 'jugado'){ const r = est.r; estado = `<b style="color:${r.campeon?'var(--gold)':'var(--text)'}">${r.campeon ? gx('🏆 CAMPEÓN','🏆 CAMPEONA') : '✅ ' + esc(r.ronda)} · +${r.pts} pts · ${money(r.plata)}</b>`; }
  else if(est.tipo === 'directo') estado = `<span style="color:var(--bien);font-weight:800">✔ Entras directo</span>${orden(ev.t) === nivel ? ' <span class="pill acc" style="margin-left:3px">⭐ A TU NIVEL</span>' : ''}`;
  else if(est.tipo === 'previa') estado = `<span style="color:var(--gold);font-weight:800">🌅 Entras por la previa</span>`;
  else estado = `<span style="color:${est.tipo==='bajo'||est.tipo==='lleno'?'var(--muted)':'var(--danger)'};font-weight:800">${est.tipo==='bajo'?'⬇️':est.tipo==='lleno'?'⏸️':est.tipo==='lesion'?'🩹':'🔒'} ${esc(est.txt)}</span>`;
  return `<button class="opt ${puede ? '' : est.tipo === 'jugado' ? 'hecho' : 'lock'}" onclick="abrirTorneo('${ev.id}')">
    <span class="ic">${ev.t==='MJ'?'🏛️':ev.t==='FIN'?'🏆':iconoTier(ev.t)}</span>
    <span style="flex:1;min-width:0">
      <span class="t">${esc(ev.nom)}${ev.pais && ev.pais === j.pais ? ' · 🏠' : ''}</span>
      <span class="d" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px">${marcaPista(ev.pista)}<span class="tier ${T.cls}">${etiquetaTier(ev.t)}</span><span>🏆 ${T.pts[0]} pts · ${money(T.prem)}</span></span>
      <span class="d" style="margin-top:5px">${estado}</span>
    </span>
    <span class="flecha">›</span>
  </button>`;
}
function calendarioHTML(j, tr){
  const lista = torneosDelTrimestre(), filtro = S.filtroCal || 'todos';
  const estados = lista.map(ev => ({ ev, est: estadoTorneo(j, ev) }));
  const jugables = estados.filter(x => puedeEntrar(x.est));
  const nivel = jugables.filter(x => x.est.tipo === 'directo').map(x => orden(x.ev.t)).sort((a,b)=>b-a)[0];
  const lleno = tr.jugados.length >= TORNEOS_POR_TRIMESTRE;
  let h = `<div class="card pad0"><div style="padding:13px 14px 4px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <div class="eyebrow">📅 TORNEOS DEL TRIMESTRE</div>
      <span class="pill ${lleno?'gold':'acc'}">${tr.jugados.length}/${TORNEOS_POR_TRIMESTRE} JUGADOS</span>
    </div>
    <p class="muted" style="margin:5px 0 9px">Todo el calendario de ${esc(S.cal[j.trimestre].tr.meses.toLowerCase())}. Elige hasta ${TORNEOS_POR_TRIMESTRE} torneos: los partidos se simulan y los momentos clave los decides tú, en la pista o en minijuegos.</p>
    <div class="tabs" style="margin-bottom:2px">
      <button class="${filtro==='todos'?'on':''}" onclick="S.filtroCal='todos';render()">TODOS · ${lista.length}</button>
      <button class="${filtro==='puedo'?'on':''}" onclick="S.filtroCal='puedo';render()">PUEDES JUGAR · ${jugables.length}</button>
    </div>
  </div><div style="padding:2px 14px 12px">`;
  let alguno = false;
  for(const [nom, tiers] of GRUPOS_CAL){
    const items = estados.filter(x => tiers.includes(x.ev.t) && (filtro === 'todos' || puedeEntrar(x.est) || x.est.tipo === 'jugado'));
    if(!items.length) continue;
    alguno = true;
    h += `<div class="grupo-cal">${nom}</div>` + items.map(x => filaTorneo(j, x.ev, x.est, nivel)).join('');
  }
  if(!alguno) h += `<p class="muted" style="margin:12px 2px 0">${lleno ? `Ya jugaste los ${TORNEOS_POR_TRIMESTRE} torneos de este trimestre.` : j.lesion ? 'Estás de baja: este trimestre toca recuperarse.' : 'No hay torneos a tu alcance este trimestre.'}</p>`;
  return h + leyendaPistas() + `</div></div>`;
}

/* ── TRIMESTRE (hub): el calendario completo ── */
function vTemporada(){
  const j = S.j, T = S.cal[j.trimestre].tr, tr = trimActual();
  const enLesion = j.lesion && j.lesionSem > 0, lleno = tr.jugados.length >= TORNEOS_POR_TRIMESTRE;
  const quedan = !tr.cerrado && torneosDelTrimestre().some(ev => puedeEntrar(estadoTorneo(j, ev)));
  let h = `<div class="fade">`;
  if(S.msgs && S.msgs.length){
    h += S.msgs.map(m=>`<div class="log ${m.tipo||''}">${m.txt}</div>`).join('');
    S.msgs = [];
  }
  h += `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div style="min-width:0">
        <div class="eyebrow">TEMPORADA ${j.anio} · ${T.nom}</div>
        <div class="title-lg" style="margin-top:3px">${T.ic} ${T.meses}</div>
      </div>
      <span class="pill acc" style="white-space:nowrap;flex:none">FECHA ${j.trimestre+1} DE ${TRIMESTRES_POR_ANIO}</span>
    </div>
    <div class="hr"></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.06em">
      <span>ENERGÍA</span><span class="tabular">${Math.round(j.energia)}%</span></div>
    <div class="meter" style="margin-top:4px"><i style="width:${j.energia}%;background:${j.energia>60?'var(--accent)':j.energia>32?'var(--alerta)':'var(--danger)'}"></i></div>
    <div style="display:flex;gap:12px;margin-top:9px;flex-wrap:wrap">
      <span class="muted"><b style="color:var(--text)">${j.edad}</b> años</span>
      <span class="muted">Forma <b style="color:${j.forma>=0?'var(--accent)':'var(--danger)'}">${j.forma>0?'+':''}${Math.round(j.forma)}</b></span>
      <span class="muted">Moral <b style="color:var(--text)">${Math.round(j.moral)}</b></span>
      <span class="muted">Racha <b style="color:var(--text)">${j.racha||0}</b></span>
    </div>
    ${j.animo && j.animo.n>0 ? `<div class="log ${j.animo.val>0?'gold':'bad'}" style="margin:10px 0 0">${textoAnimo(j)}</div>` : ''}
    ${(function(){ const d = puntosEnRiesgo(j); return d>0
      ? `<div class="log" style="margin:10px 0 0">🛡️ <b>Defiendes ${d} pts</b> este trimestre: es lo que se te vence del año pasado. Si no sumas, bajas.</div>` : ''; })()}
    ${enLesion?`<div class="log bad" style="margin:10px 0 0">🩹 <b>${esc(j.lesion)}</b> — te falta ${j.lesionSem} trimestre${j.lesionSem>1?'s':''} de baja.</div>`:''}
  </div>`;

  h += tarjetaPremios(j) + calendarioHTML(j, tr);

  if(tr.cerrado) h += `<button class="btn" onclick="pasarTrimestre()">SIGUIENTE TRIMESTRE</button><div style="height:11px"></div>`;
  else if(tr.jugados.length) h += `<button class="btn ${lleno || !quedan ? '' : 'ghost'}" onclick="cerrarTrimestre()">${lleno || !quedan ? 'CERRAR EL TRIMESTRE' : `TERMINAR EL TRIMESTRE AQUÍ · ${tr.jugados.length}/${TORNEOS_POR_TRIMESTRE}`}</button><div style="height:11px"></div>`;
  else if(enLesion) h += `<button class="btn" onclick="pasarTrimestre()">PASAR EL TRIMESTRE (RECUPERÁNDOME)</button><div style="height:11px"></div>`;
  else h += `<div class="card">
      <div class="eyebrow">O NO COMPETÍS ESTE TRIMESTRE</div>
      <div style="height:8px"></div>
      <button class="opt" onclick="trimestreEntreno()"><span class="ic">🏋️</span><span><span class="t">BLOQUE DE ENTRENAMIENTO</span><span class="d">+3 a una estadística · recuperas energía · pierdes ritmo</span></span></button>
      <button class="opt" onclick="trimestreQuimica()"><span class="ic">🤝</span><span><span class="t">CONCENTRACIÓN CON TU PAREJA</span><span class="d">+18 de química · algo de energía · pierdes ritmo</span></span></button>
      <button class="opt" onclick="trimestreDescanso()"><span class="ic">🛋️</span><span><span class="t">PARAR DEL TODO</span><span class="d">energía al 100% · +12 moral · pierdes bastante forma</span></span></button>
    </div>`;

  h += `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px">
      <div class="eyebrow">TU PAREJA</div>
      <button class="btn ghost sm" style="width:auto;padding:5px 11px;min-height:0" onclick="S.volverDe='temporada';S.mercadoTab='parejas';S.pantalla='mercado';render()">CAMBIAR</button>
    </div>
    ${tarjetaPareja(j)}
  </div>
  <button class="btn ghost" onclick="S.volverDe='temporada';S.mercadoTab='equipo';S.pantalla='mercado';render()">🛒 MERCADO · ${money(j.dinero)}</button>
  <div style="height:8px"></div>
  <div class="row">
    <button class="btn ghost sm" onclick="S.pantalla='perfil';render()">MI PERFIL</button>
    <button class="btn ghost sm" onclick="S.vitrinaTab='premios';S.pantalla='vitrina';render()">🏆 PREMIOS</button>
    <button class="btn ghost sm" onclick="S.volverComo='temporada';S.pantalla='como';render()">🎮 CONTROLES</button>
  </div>
  <div style="height:8px"></div>
  <div class="card mb0">
    <div class="eyebrow">TU SOMBRA</div>
    <div class="li" style="border:0;padding-bottom:0">
      ${fichaPais(paisDe(j).cod)}
      <div class="g"><b>${esc(j.rival.nombre)}</b><span>${j.rival.rank?'#'+j.rival.rank:'sin ranking'} · ${j.rival.titulos} títulos${j.rival.majors?` · ${j.rival.majors} Major${j.rival.majors>1?'s':''}`:''}</span></div>
      <span class="pill ${!j.ranking?'':(j.rival.rank&&j.ranking<j.rival.rank)?'acc':'mal'}">${!j.ranking?'—':(j.rival.rank&&j.ranking<j.rival.rank)?'VAS DELANTE':'VA DELANTE'}</span>
    </div>
  </div>
  </div>`;
  return h;
}

/* ── Premios: siempre a la vista ── */
function trofeoHTML(x){
  const nom = x.tier === 'MJ' ? x.nom.replace(' Major', '') : x.tier === 'FIN' ? 'FINALS' : etiquetaTier(x.tier);
  return `<div class="trofeo ${TIERS[x.tier] ? TIERS[x.tier].cls : 't-F'}" title="${esc(x.nom)}"><span>${x.tier==='MJ'?'🏆':iconoTier(x.tier)}</span><b>${esc(nom)}</b><small>T${x.a}</small></div>`;
}
function tarjetaPremios(j){
  const t = j.titulos, n = ks => t.filter(x => ks.includes(x.tier)).length;
  const grupos = [['🏛️','Major',['MJ']],['🎪','Finals',['FIN']],['💎','P1',['P1']],['🎖️','P2',['P2']],['🏅','Platinum',['FIP5']],['🥈','Gold',['FIP4']],['🥉','Star',['FIP3']],['🎾','Rise/Promises',['FIP1','FIP2']]]
    .filter(g => n(g[2]));
  const anio = t.filter(x => x.a === j.anio).length;
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div style="min-width:0"><div class="eyebrow">🏆 TUS PREMIOS</div>
        <div class="title-lg" style="margin-top:3px;color:var(--gold)">${money(j.premiosTotal||0)}</div>
        <div class="muted">Esta temporada: <b style="color:var(--text)">${money(j.premiosAnio||0)}</b> · ${anio} título${anio===1?'':'s'}</div></div>
      <span class="pill gold">${t.length} TÍTULO${t.length===1?'':'S'}</span>
    </div>
    ${t.length ? `<div class="vitrina">${t.slice(-8).reverse().map(trofeoHTML).join('')}</div>
      <div class="muted" style="margin-top:8px">${grupos.map(g=>`${g[0]} <b style="color:var(--text)">${n(g[2])}</b> ${g[1]}`).join(' · ')}</div>`
      : `<p class="muted" style="margin:8px 0 0">Todavía no tienes trofeos. El primero no se olvida nunca.</p>`}
    <div style="height:10px"></div>
    <button class="btn ghost sm" onclick="S.vitrinaTab='premios';S.pantalla='vitrina';render()">VER TODOS LOS PREMIOS</button>
  </div>`;
}
function premiosVitrinaHTML(j){
  const hist = (j.historialTorneos || []).slice().reverse();
  return `<div class="card">
    <div class="g2">
      <div><div class="eyebrow">EN TODA LA CARRERA</div><div class="title-lg" style="color:var(--gold)">${money(j.premiosTotal||0)}</div></div>
      <div><div class="eyebrow">ESTA TEMPORADA</div><div class="title-lg">${money(j.premiosAnio||0)}</div></div>
      <div><div class="eyebrow">TÍTULOS</div><div class="title-lg">${j.titulos.length}</div></div>
      <div><div class="eyebrow">FINALES PERDIDAS</div><div class="title-lg">${j.finales||0}</div></div>
    </div>
    <p class="muted" style="margin:8px 0 0">Premios ya descontada la mitad de tu pareja.</p>
  </div>
  <div class="card"><div class="eyebrow">TU VITRINA</div>
    ${j.titulos.length ? `<div class="vitrina">${j.titulos.slice().reverse().map(trofeoHTML).join('')}</div>` : '<p class="muted" style="margin:6px 0 0">Vacía. Por ahora.</p>'}
  </div>
  <div class="card"><div class="eyebrow">TORNEO A TORNEO</div><div style="height:4px"></div>
    ${hist.length ? hist.slice(0, 80).map(x => `<div class="li"><span class="tier ${TIERS[x.t].cls}">${etiquetaTier(x.t)}</span>
      <div class="g"><b>${x.campeon?'🏆 ':''}${esc(x.nom)}</b><span>Temporada ${x.a} · ${esc(x.ronda)} · +${x.pts} pts</span></div>
      <span class="pill ${x.campeon?'gold':x.plata>0?'acc':''}">${money(x.plata)}</span></div>`).join('')
      : '<p class="muted" style="margin:6px 0 0">Todavía no has jugado ningún torneo.</p>'}
  </div>`;
}

/* ── Un torneo por dentro ── */
function filasPremio(T){
  const factores = [1, .585, .32, .175, .098, .058, .034], nombres = ['', '🥈 Final', 'Semifinal', 'Cuartos'];
  let h = '';
  for(let k = 0; k < Math.min(T.rondas, 4); k++)
    h += `<div class="fila-premio ${k===0?'oro':''}"><span>${k===0 ? gx('🏆 Campeón','🏆 Campeona') : nombres[k]}</span><b>+${T.pts[Math.min(k, T.pts.length-1)] || 0} pts</b><b>${money(Math.round(T.prem*factores[k]))}</b></div>`;
  return h;
}
function confetiHTML(){
  const col = ['#DCF54A','#22D3A5','#F5C542','#7FD3F7','#F075C0'];
  let h = '';
  for(let i = 0; i < 26; i++) h += `<i style="left:${(i*37)%100}%;background:${col[i%5]};animation-delay:${(i%9)*.09}s"></i>`;
  return h;
}
function etapasHTML(to){
  const T = TIERS[to.ev.t], pasos = [], abrev = {R64:'R64', R32:'R32', OCTAVOS:'8VOS', CUARTOS:'4TOS', SEMIFINAL:'SEMI', FINAL:'FINAL', GRUPOS:'GRUPOS'};
  const hechos = to.previa ? (to.enPrevia ? to.kPrevia : RONDAS_PREVIA + to.ronda) : to.ronda;
  const perdio = to.fin && !to.fin.r.campeon;
  if(to.previa) for(let k = 0; k < RONDAS_PREVIA; k++) pasos.push('PREV ' + (k+1));
  for(let k = 0; k < T.rondas; k++) pasos.push(abrev[NOM_RONDA[T.rondas][k]] || NOM_RONDA[T.rondas][k]);
  return `<div class="etapas">${pasos.map((n, i) => `<div class="etapa ${i < hechos ? 'ok' : i === hechos ? (perdio ? 'ko' : to.fin ? '' : 'ahora') : ''}"><i></i><span>${n}</span></div>`).join('')}</div>`;
}
function segJuegos(){
  return `<div class="seg">${[2,3,4].map(n=>`<button class="${PREF.juegos===n?'on':''}" onclick="PREF.juegos=${n};guardarPref();render()">${n}</button>`).join('')}</div>`;
}
function fichaVivo(p){
  const v = p.vivo;
  return `<div class="fp">
    <div><span>Tus golpes</span><b>${v.golpes}</b></div>
    <div><span>Rally más largo</span><b>${v.rallyMax}</b></div>
    <div><span>Remates · por 3</span><b>${v.remates} · ${v.porTres}</b></div>
    <div><span>Golpes perfectos</span><b>${v.perfectos}</b></div>
  </div>`;
}
function rondaTexto(r){ return /^R\d/.test(r) ? 'ronda de ' + r.slice(1) : r.toLowerCase(); }
function vTorneo(){
  const j = S.j, to = S.torneo, ev = to ? to.ev : S.verTorneo;
  if(!ev){ S.pantalla = 'temporada'; return vTemporada(); }
  const T = TIERS[ev.t], grande = ev.t === 'MJ' || ev.t === 'FIN', mj = modoMinijuego(ev);
  let h = `<div class="fade">
  <div class="card" style="${grande ? 'background:linear-gradient(160deg,rgba(245,197,66,.14),transparent 62%);border-color:rgba(245,197,66,.28)' : ''}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div style="min-width:0">
        <span class="tier ${T.cls}">${etiquetaTier(ev.t)}</span>
        <div class="title-lg" style="margin:7px 0 2px">${ev.t==='MJ'?'🏛️ ':ev.t==='FIN'?'🏆 ':''}${esc(ev.nom)}</div>
        <div class="muted">${esc(ev.ciudad)}${ev.pais && ev.pais === j.pais ? ' · 🏠 en casa' : ''} · ${T.rondas} rondas${to && to.previa ? ' + previa' : ''}</div>
      </div>
      ${pastillaPista(ev.pista)}
    </div>
    ${to ? etapasHTML(to) : ''}
  </div>`;

  if(!to){
    const est = estadoTorneo(j, ev), tr = trimActual();
    h += `<div class="card"><div class="eyebrow">PREMIOS Y PUNTOS</div><div style="height:4px"></div>${filasPremio(T)}
      <p class="muted" style="margin:8px 0 0">Tu mitad del premio, ya descontada la de tu pareja.</p></div>`;
    if(puedeEntrar(est)){
      h += `<div class="card">
        <div class="eyebrow">INSCRIPCIÓN</div>
        <p class="sub" style="margin:6px 0 0">${est.tipo === 'previa'
          ? '🌅 <b>Entráis por la previa:</b> dos partidos antes del cuadro. Si perdéis uno, a casa con algo de dinero y medio punto.'
          : '✔ <b>Entráis directo al cuadro.</b>'}</p>
        <p class="muted" style="margin:8px 0 0">Los partidos se simulan y los <b style="color:var(--text)">momentos clave</b> los decides tú: en la pista, en una ráfaga, leyendo al rival o eligiendo camino.${mj === 'cuadro' ? ' En cuartos y semis, <b style="color:var(--gold)">el cuadro del Major</b>.' : ''} <b style="color:var(--gold)">La final, siempre en la pista.</b></p>
        <p class="muted" style="margin:6px 0 0">Torneo ${tr.jugados.length + 1} de ${TORNEOS_POR_TRIMESTRE} de este trimestre · energía ${Math.round(j.energia)}%${j.energia < 35 ? ' · <b style="color:var(--danger)">vas muy justo de piernas</b>' : ''}</p>
      </div>
      <button class="btn" onclick="inscribirse()">🎾 INSCRIBIRSE</button><div style="height:8px"></div>`;
    } else if(est.tipo === 'jugado'){
      const r = est.r;
      h += `<div class="log gold">${r.campeon ? gx('🏆 <b>Campeón</b>','🏆 <b>Campeona</b>') : '✅ <b>' + esc(r.ronda) + '</b>'} en este torneo · +${r.pts} pts · ${money(r.plata)}</div>`;
    } else h += `<div class="log bad">${est.tipo==='bajo'?'⬇️':est.tipo==='lesion'?'🩹':est.tipo==='lleno'?'⏸️':'🔒'} ${esc(est.txt)}</div>`;
    return h + `<button class="btn ghost" onclick="S.verTorneo=null;S.pantalla='temporada';render()">VOLVER AL CALENDARIO</button></div>`;
  }

  if(!to.fin){
    const opp = to.rival, rondaNom = nombreRondaActual(to), mini = minijuegoDeRonda(to), u = to.ultimo;
    const esFinal = !to.enPrevia && to.ronda === T.rondas-1;
    if(u && u.cuadro) h += `<div class="log gold">🏛️ <b>Cuadro superado:</b> cuartos y semifinal ganados. La final se juega en la pista.</div>`;
    else if(u) h += `<div class="log ${u.clave ? 'gold' : ''}">✅ <b>Ganasteis la ${esc(rondaTexto(u.ronda))}</b> ${u.sets.join(' ')}${u.clave ? (u.clave.forma === 'tiempo' ? ' · ⚡ con una ráfaga a tiempo' : u.clave.forma === 'leer' ? ' · 👀 leyéndoles el punto' : u.clave.forma === 'camino' ? ' · 🧩 eligiendo bien el camino' : u.clave.enVivo ? ' · 🎾 lo cerrasteis en la pista' : ' · 🔥 en el momento clave') : ''}. A por la siguiente.</div>`;
    if(mini === 'cuadro'){
      h += `<div class="card event-hero">
        <div class="eyebrow">MAJOR · CUARTOS DE FINAL</div>
        <div class="title-lg" style="margin:5px 0 6px">🏛️ El cuadro del Major</div>
        <p class="sub" style="margin:0">Cuartos y semifinal son un minijuego: <b>elige camino</b> y esquiva a la pareja que os saca. Si pasáis, la final se juega en la pista.</p>
      </div>
      <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarRonda()">🏛️ JUGAR EL CUADRO</button><div style="height:8px"></div>`;
    } else {
      const prob = probPartido(j, opp, ev), col = prob>=60?'var(--bien)':prob>=40?'var(--gold)':'var(--danger)';
      h += `<div class="card">
        <div class="eyebrow">${rondaNom}${to.enPrevia ? ' · CUADRO DE CLASIFICACIÓN' : ''}</div>
        <div style="height:8px"></div>
        <div class="mrow win"><span class="dot"></span><span class="nm">${fichaPais(j.cod)} ${esc(j.nombre)} / ${esc(j.pareja ? j.pareja.nombre : '—')}</span><span class="rk">${j.ranking ? '#'+j.ranking : '—'}</span></div>
        <div class="mrow"><span class="dot"></span><span class="nm">${fichaPais(opp.flag)} ${esc(opp.nombre)} / ${esc(opp.nombre2)}</span><span class="rk">#${opp.rank}</span></div>
        <p class="muted" style="margin:6px 0 0">Juegan a <b style="color:var(--text)">${esc(opp.arq.nom)}</b>${opp.arq.remate > 1.2 ? ' · cuidado con sus remates' : opp.arq.globo > 1.15 ? ' · te van a globear mucho' : ''}.</p>
        <div class="prob"><span class="barra"><i style="width:${prob}%"></i></span><span class="cifra" style="color:${col}">${prob}% de ganar</span></div>
        <div class="log gold" style="margin:11px 0 0">${to.enPrevia ? '🌅 La previa se simula, pero puede tocarte <b>elegir para clasificar</b>.' : esFinal ? '🎾 <b>La final se juega siempre en la pista</b>, aunque simules hasta ella.' : '🎲 Se simula el partido, pero <b>en cualquier ronda puede tocarte un momento clave</b>: en la pista, en una ráfaga, leyendo al rival o eligiendo camino. <b>Ese % es exacto, también en el momento clave.</b>'}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.06em;margin-top:11px"><span>TU ENERGÍA</span><span class="tabular">${Math.round(j.energia)}%</span></div>
        <div class="meter" style="margin-top:4px"><i style="width:${j.energia}%;background:${j.energia>60?'var(--accent)':j.energia>32?'var(--alerta)':'var(--danger)'}"></i></div>
      </div>
      <button class="btn" onclick="jugarRonda()">▶️ JUGAR ${rondaNom}</button><div style="height:8px"></div>`;
    }
    h += `<button class="btn ghost sm" onclick="simularHastaElFinal()">⏭️ SIMULAR HASTA LA FINAL</button>
      <p class="muted center" style="margin:6px 0 0">${mj === 'cuadro' ? 'El cuadro del Major y la final no se saltan: esos los juegas tú.' : 'La final no se salta: esa la juegas tú.'}</p>
      <div class="card" style="margin-top:11px">
        <div class="eyebrow">DIFICULTAD EN LA PISTA</div><div style="height:7px"></div>${segPref('dificultad', OPCIONES_DIF, true)}
        <p class="muted" style="margin:7px 0 10px">${difActual().d}</p>
        <button class="btn ghost sm" onclick="S.volverComo='torneo';S.pantalla='como';render()">🎮 CONTROLES</button>
      </div>
      <div class="card"><div class="eyebrow">PREMIOS Y PUNTOS</div><div style="height:4px"></div>${filasPremio(T)}</div>`;
    if(to.partidos.length) h += `<div class="card"><div class="eyebrow">VUESTRO CAMINO</div><div style="height:8px"></div>${to.partidos.slice().reverse().map(p => cardPartido(j, p)).join('')}</div>`;
    return h + `</div>`;
  }

  const f = to.fin, r = f.r, perdidos = to.partidos.filter(p => !p.gane).length, ganados = to.partidos.length - perdidos;
  const dRank = (f.rankAntes && j.ranking) ? f.rankAntes - j.ranking : 0;
  const titular = r.campeon ? gx('🏆 ¡CAMPEONES!','🏆 ¡CAMPEONAS!') : r.cayoEnPrevia ? '🌅 FUERA EN LA PREVIA'
    : to.lesionado ? '🩹 LESIÓN' : r.victorias === T.rondas-1 ? '🥈 FINALISTAS' : '😖 FUERA EN ' + r.ronda.toUpperCase();
  const texto = r.campeon ? textoTitulo(r)
    : r.cayoEnPrevia ? 'Dos partidos a las nueve de la mañana y a casa. Algo de dinero y medio punto de ranking.'
    : to.lesionado ? `Ganasteis, pero te lesionaste: <b>${esc(j.lesion || '')}</b>. Toca parar.`
    : r.victorias === T.rondas-1 ? 'Llegasteis a la final y se os escapó. Los puntos y el dinero quedan.'
    : r.victorias === 0 ? 'Primera ronda y a casa. El cuadro no perdona.'
    : `Caísteis en ${r.ronda.toLowerCase()}. Puntos y algo de dinero para seguir.`;
  h += `<div class="card ${r.campeon ? 'confeti' : ''}" style="${r.campeon ? 'background:linear-gradient(160deg,rgba(245,197,66,.2),transparent 65%);border-color:rgba(245,197,66,.45)' : ''}">
    ${r.campeon ? confetiHTML() : ''}
    <div class="eyebrow">${esc(ev.nom.toUpperCase())}</div>
    <div class="title-xl" style="margin:6px 0 8px">${titular}</div>
    <p class="sub" style="margin:0">${texto}</p>
    <div class="hr"></div>
    <div class="g2">
      <div><div class="eyebrow">PUNTOS</div><div class="title-lg" style="color:var(--accent)">+${r.pts}</div></div>
      <div><div class="eyebrow">PREMIO</div><div class="title-lg" style="color:var(--gold)">${money(r.plata)}</div></div>
      <div><div class="eyebrow">RANKING</div><div class="title-lg">${j.ranking ? '#'+j.ranking : '—'} ${dRank ? `<span style="font-size:12px;color:${dRank>0?'var(--accent)':'var(--danger)'}">${dRank>0?'▲':'▼'}${Math.abs(dRank)}</span>` : ''}</div></div>
      <div><div class="eyebrow">PARTIDOS</div><div class="title-lg">${ganados}-${perdidos}</div></div>
    </div>
  </div>`;
  if(r.campeon) h += `<div class="card"><div class="eyebrow">🏆 A LA VITRINA</div><div class="vitrina">${trofeoHTML({nom:ev.nom, tier:ev.t, a:j.anio})}</div>
    <p class="muted" style="margin:8px 0 0">Ya llevas <b style="color:var(--text)">${j.titulos.length}</b> título${j.titulos.length===1?'':'s'} y <b style="color:var(--gold)">${money(j.premiosTotal||0)}</b> en premios.</p></div>`;
  if(f.logros.length) h += `<div class="card"><div class="eyebrow">LOGROS DESBLOQUEADOS</div><div style="height:6px"></div>
    ${f.logros.map(l=>`<div class="ach"><span class="ic">${l.ic}</span><div><b>${nomLogro(l)}</b><span>${descLogro(l)}</span></div></div>`).join('')}</div>`;
  if(to.partidos.length) h += `<div class="card"><div class="eyebrow">VUESTRO CAMINO</div><div style="height:8px"></div>${to.partidos.slice().reverse().map(p => cardPartido(j, p)).join('')}</div>`;
  return h + `<button class="btn" onclick="salirTorneo()">VOLVER AL CALENDARIO</button></div>`;
}

/* ── El momento clave: se juega en la pista o se simula ── */
function vMomento(){
  const to = S.torneo, m = to && to.momento;
  if(!m){ S.pantalla = to ? 'torneo' : 'temporada'; return to ? vTorneo() : vTemporada(); }
  const opp = to.rival, e = m.eleccion;
  const titulo = m.forma === 'tiempo' ? '⚡ PUNTO CLAVE' : m.forma === 'leer' ? '👀 LEER AL RIVAL' : m.forma === 'camino' ? '🧩 ELIGE CAMINO' : m.tipo === 'punto' ? '🥇 PUNTO CLAVE' : '🔥 JUEGO CLAVE';
  let h = `<div class="fade">
  <div class="card" style="background:linear-gradient(160deg,rgba(245,197,66,.18),transparent 62%);border-color:rgba(245,197,66,.4)">
    <div class="eyebrow">${esc(nombreRondaActual(to))}${m.previa ? ' · PARA CLASIFICAR' : ''} · ${esc(to.ev.nom.toUpperCase())}</div>
    <div class="title-xl" style="margin:6px 0 8px">${titulo}</div>
    <p class="sub" style="margin:0">${m.sit}</p>
    ${m.forma === 'pista' ? `<div class="hr"></div>
    <div class="g2">
      <div><div class="eyebrow">${m.tipo === 'punto' ? 'MARCADOR' : 'EMPEZÁIS'}</div><div class="title-lg">${textoPuntos(m.inicio)}</div></div>
      <div><div class="eyebrow">SACA</div><div class="title-lg">${m.saca === 0 ? 'Vosotros' : 'Ellos'}</div></div>
    </div>
    ${m.tipo === 'juego' && !m.inicioFijo && m.inicio[0] !== m.inicio[1] ? `<p class="muted" style="margin:8px 0 0">${m.inicio[0] > m.inicio[1] ? 'Empezáis por delante: sois mejores que ellos.' : 'Empezáis por detrás: son mejores que vosotros.'}</p>` : ''}` : ''}
    <div class="hr"></div>
    <div class="mrow"><span class="nm">${fichaPais(opp.flag)} ${esc(opp.nombre)} / ${esc(opp.nombre2)}</span><span class="rk">#${opp.rank}</span></div>
    <p class="muted" style="margin:2px 0 0">Juegan a <b style="color:var(--text)">${esc(opp.arq.nom)}</b>.</p>
  </div>`;

  if(m.forma === 'pista'){
    const pr = probMomento(m), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';
    return h + `<div class="prob" style="margin:0 2px 12px"><span class="barra"><i style="width:${pr}%"></i></span><span class="cifra" style="color:${col}">${pr}% de ganar si lo simulas</span></div>
    <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarMomento()">🎾 JUGARLO EN LA PISTA</button><div style="height:8px"></div>
    <button class="btn ghost" onclick="simularMomento()">⏩ SIMULARLO</button>
    <p class="muted center" style="margin:10px 0 0">${m.tipo === 'punto' ? 'Un solo punto: quien lo gane, gana el partido.' : 'Gana quien llegue antes a 4 puntos. A 40-40, punto de oro.'}<br>Es el mismo % del torneo: simulado es exacto; jugándolo en la pista, depende de cómo juegues.<br>
      Dificultad <b style="color:var(--text)">${difActual().nom}</b> · <a href="#" style="color:var(--accent);font-weight:800" onclick="S.volverComo='momento';S.pantalla='como';render();return false">controles y dificultad</a></p>
    </div>`;
  }

  if(e){
    const siGana = m.previa ? (to.kPrevia >= RONDAS_PREVIA-1 ? '<b>¡Dentro del cuadro!</b> Clasificasteis.' : '<b>Seguís vivos en la previa.</b> Queda un partido para entrar.')
                 : m.esFinal ? '<b>¡El título es vuestro!</b>' : '<b>Partido vuestro.</b> A la siguiente ronda.';
    const siPierde = m.previa ? 'Os quedáis sin clasificar. A casa.' : m.esFinal ? 'Se llevan el título. Finalistas.' : 'Se llevan el partido. Fuera del torneo.';
    if(m.forma === 'camino') h += casillasHTML(m, true);
    if(m.forma === 'leer') h += leerHTML(m.leer);
    const cabecera = m.forma === 'leer' ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">👀 LEER AL RIVAL</div>${chipsLectura(m.leer)}</div>` : m.forma === 'tiempo'
      ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">⚡ RÁFAGA</div>${chipsRafaga(m.rafaga)}</div>`
      : `<div class="eyebrow">CAMINO ${e.i + 1}</div>`;
    return h + `<div class="card ${e.gana ? 'event-hero' : 'event-hero mal'}">
      ${cabecera}
      <div class="title-xl" style="margin:6px 0 8px">${e.gana ? (m.previa ? '✅ ¡CLASIFICÁIS!' : '✅ ¡LO GANASTEIS!') : '😖 SE OS ESCAPÓ'}</div>
      <p class="sub" style="margin:0">${e.texto}</p>
      <div class="hr"></div>
      <p class="sub" style="margin:0">${e.gana ? siGana : siPierde}</p>
    </div>
    <button class="btn" onclick="continuarMomento()">CONTINUAR</button></div>`;
  }

  { const pr = probMomento(m), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';
    h += `<div class="prob" style="margin:0 2px 4px"><span class="barra"><i style="width:${pr}%"></i></span><span class="cifra" style="color:${col}">${pr}% de ganar</span></div>
      <p class="muted" style="margin:0 2px 11px">${m.forma === 'leer' ? 'Es el mismo % del torneo: tapando la zona marcada, ganáis exactamente eso.' : m.forma === 'camino' ? 'Es el mismo % del torneo: elijáis la casilla que elijáis, pasáis exactamente con eso.' : 'Es el mismo % del torneo. Simulado es exacto; la zona verde está hecha para ese %, y con buen timing ganáis más.'}</p>`; }
  h += m.forma === 'tiempo' ? rafagaHTML(m.rafaga) : m.forma === 'leer' ? leerHTML(m.leer) : casillasHTML(m, false);
  return h + `<button class="btn ghost sm" onclick="simularMomento()">⏩ SIMULARLO</button></div>`;
}
/* Las casillas del camino: las mismas reglas que el cuadro de los Majors, para un solo partido */
function casillasHTML(m, revelar){
  const c = m.camino, fall = c.falladas;
  let h = `<div class="card"><div class="eyebrow">EL FINAL DEL TERCER SET</div><div style="height:9px"></div><div class="cuadro">`;
  for(let i = 0; i < c.casillas; i++){
    const mina = c.minas.indexOf(i) >= 0, yaFallada = fall.indexOf(i) >= 0;
    let cls = 'casilla', txt = '?';
    if(revelar){
      if(i === c.elegida){ cls += mina ? ' mala' : ' buena'; txt = mina ? '✖' : '✔'; }
      else { cls += ' revelada'; txt = mina ? '✖' : ''; }
    } else if(yaFallada){ cls += ' mala revelada'; txt = '✖'; }
    else { cls += ' activa'; if(c.pista === i){ cls += ' avisada'; txt = '❗'; } }
    h += `<button class="${cls}" ${!revelar && !yaFallada ? `onclick="elegirCaminoMomento(${i})"` : 'disabled'}>${txt}</button>`;
  }
  h += `</div>`;
  if(!revelar){
    const quedan = c.casillas - fall.length, avisoVivo = c.pista !== null && fall.indexOf(c.pista) < 0;
    const pc = Math.round(100*(c.obj != null ? c.obj : .5)), col = pc>=70?'var(--bien)':pc>=45?'var(--gold)':'var(--danger)';
    h += `<div class="prob" style="margin-top:9px"><span class="barra"><i style="width:${pc}%"></i></span><span class="cifra" style="color:${col}">${pc}% de pasar</span></div>
      <p class="muted" style="margin:7px 0 0">${quedan} caminos por probar. <b style="color:var(--text)">Elijáis el que elijáis${avisoVivo ? ' (menos el marcado, que os saca seguro)' : ''}, pasáis con el ${pc}% exacto</b>${c.vidas > 0 ? ' · 🛡️ tu psicólog@ os salva de un error' : ''}.</p>
      ${c.salvada ? `<div class="log gold" style="margin:8px 0 0">🛡️ <b>¡Bola de partido salvada!</b> Ese camino no era: elegid otro.</div>` : ''}
      ${avisoVivo ? `<div class="log" style="margin:8px 0 0">🧠 Tu <b>Mental (${Math.round(S.j.stats.mental)})</b> te avisa: por <b>ahí no</b>. Ese camino os saca del partido.</div>` : ''}`;
  }
  return h + `</div>`;
}

/* ── Cómo se juega, ajustes y partido rápido ── */
function guiaGolpes(compacta){
  const tactil = hayDOM && !matchMedia('(hover:hover) and (pointer:fine)').matches;
  const k = t => tactil ? '' : ` <kbd>${t}</kbd>`;
  const filas = [
    ['#DCF54A','🎾','GOLPE' + k(nombreTecla(teclasActuales().golpe)), 'Drive, volea o bandeja: sale solo según la altura de la bola. El golpe seguro.'],
    ['#FF9F43','💥','REMATE' + k(nombreTecla(teclasActuales().remate)), 'Bola alta cerca de la red: remate, y si es perfecto se va por 3. A media altura o desde atrás, víbora. Con la bola baja, un plano arriesgado.'],
    ['#7FD3F7','☂️','GLOBO' + k(nombreTecla(teclasActuales().globo)), 'Alto y al fondo. Para cuando los dos rivales están en la red.'],
    ['#E4F3EF','🪶','DEJADA' + k(nombreTecla(teclasActuales().dejada)), 'En la red, dejada corta. Desde el fondo, chiquita a los pies.'],
  ];
  let h = filas.map(f => `<div class="golpe-guia"><span class="bola" style="background:${f[0]}">${f[1]}</span><div><b>${f[2]}</b><span>${f[3]}</span></div></div>`).join('');
  if(!compacta) h += [
    ['🕹️','Moverte y apuntar', `${tactil ? (PREF.mano === 'zurdo' ? 'Joystick a la derecha' : 'Joystick a la izquierda') : '<kbd>WASD</kbd> o flechas'}. Si al pegar lo inclinas hacia un lado, la bola va hacia ese lado.`],
    ['⏱️','El momento justo', 'Pulsa un instante antes de que la bola entre en tu anillo. Cuando el anillo se pone dorado, la altura es ideal. ¡PERFECTO! es el mejor golpe.'],
    ['✨','El botón que brilla', 'Con la asistencia puesta se ilumina el golpe que conviene para la bola que viene.'],
    ['🧱','El cristal', 'La bola tiene que botar antes de tocar la pared. Después, espérala del cristal: la salida de pared también vale.'],
    ['📈','Tus estadísticas cuentan', 'Remate para remates y víboras, Globo, Bandeja, Volea para voleas y dejadas, Pared para los golpes de fondo, Físico para correr y Mental para el timing.'],
  ].map(f => `<div class="golpe-guia"><span class="bola" style="background:var(--card-bg-2)">${f[0]}</span><div><b>${f[1]}</b><span>${f[2]}</span></div></div>`).join('');
  return h;
}
const ACCIONES_TECLADO = [['golpe','🎾 Golpe'],['remate','💥 Remate'],['globo','☂️ Globo'],['dejada','🪶 Dejada'],['pausa','⏸️ Pausa']];
const OPCIONES_DIF = [['facil','FÁCIL'],['normal','NORMAL'],['dificil','DIFÍCIL']];
function segPref(k, ops, ancho){
  return `<div class="seg ${ancho ? 'ancho' : ''}">${ops.map(([v, n]) =>
    `<button class="${PREF[k]===v?'on':''}" ${ancho ? 'style="font-size:12px;letter-spacing:.05em"' : ''} onclick="PREF.${k}=${typeof v === 'string' ? `'${v}'` : v};guardarPref();render()">${n}</button>`).join('')}</div>`;
}
function tgPref(k){ return `<button class="tg ${PREF[k]?'on':''}" aria-pressed="${!!PREF[k]}" onclick="PREF.${k}=!PREF.${k};guardarPref();render()"><i></i></button>`; }
/* Cambiar una tecla: se toca la acción y la siguiente tecla queda asignada. Si otra acción ya la usaba, se intercambian */
if(hayDOM) addEventListener('keydown', e => {
  if(!S || !S.esperandoTecla) return;
  e.preventDefault(); e.stopPropagation();
  const acc = S.esperandoTecla;
  if(e.code === 'Escape'){ S.esperandoTecla = null; render(); return; }
  if(/^(Arrow|Key[WASD]$)/.test(e.code)){ S.avisoTecla = 'Esa tecla es para moverte. Elige otra.'; render(); return; }
  const t = teclasActuales(), otra = Object.keys(t).find(k => k !== acc && t[k] === e.code);
  if(otra) t[otra] = t[acc];
  t[acc] = e.code;
  PREF.teclas = t; S.esperandoTecla = null; S.avisoTecla = null;
  guardarPref(); render();
}, true);
function vComo(){
  const t = teclasActuales(), volver = S.volverComo || 'inicio';
  return `<div class="fade">
  <div class="card event-hero"><div class="eyebrow">🎮 CONTROLES</div>
    <div class="title-lg" style="margin:5px 0 4px">La pista, a tu manera</div>
    <p class="sub" style="margin:0">Cuando un momento clave se juega en la pista, mueves a tu jugador (el amarillo, «TÚ») y eliges el golpe.</p></div>

  <div class="card"><div class="eyebrow">DIFICULTAD EN LA PISTA</div><div style="height:7px"></div>
    ${segPref('dificultad', OPCIONES_DIF, true)}
    <p class="muted" style="margin:7px 0 0">${difActual().d}</p></div>

  <div class="card"><div class="eyebrow">📱 EN EL MÓVIL</div><div style="height:2px"></div>
    <div class="li"><div class="g"><b>Joystick</b><span>A qué lado lo quieres</span></div>${segPref('mano', [['diestro','IZQ.'],['zurdo','DER.']])}</div>
    <div class="li"><div class="g"><b>Tamaño de los botones</b></div>${segPref('tamBotones', [[.85,'S'],[1,'M'],[1.2,'L']])}</div>
    <div class="li"><div class="g"><b>Opacidad</b></div>${segPref('opacidad', [[1,'100%'],[.75,'75%'],[.5,'50%']])}</div>
    <div style="height:10px"></div>
    <button class="btn ghost sm" onclick="abrirEditorControles()">✋ MOVER LOS BOTONES A MI GUSTO</button>
    ${PREF.posBotones ? `<p class="muted" style="margin:7px 0 0">Tienes los botones colocados a tu gusto. <a href="#" style="color:var(--accent);font-weight:800" onclick="PREF.posBotones=null;guardarPref();render();return false">Volver a la posición de siempre</a></p>` : ''}
  </div>

  <div class="card"><div class="eyebrow">⌨️ EN EL ORDENADOR</div>
    <p class="muted" style="margin:4px 0 4px">Toca una acción y pulsa la tecla que quieras. Para moverte: <kbd>WASD</kbd> o flechas.</p>
    ${S.avisoTecla ? `<div class="log bad" style="margin:6px 0">${esc(S.avisoTecla)}</div>` : ''}
    ${ACCIONES_TECLADO.map(([k, n]) => `<div class="li"><div class="g"><b>${n}</b></div>
      <button class="btn ghost sm tecla ${S.esperandoTecla === k ? 'esperando' : ''}" style="width:auto;min-width:104px;min-height:40px" onclick="S.esperandoTecla='${k}';S.avisoTecla=null;render()">${S.esperandoTecla === k ? 'Pulsa una tecla…' : esc(nombreTecla(t[k]))}</button></div>`).join('')}
    <div style="height:8px"></div>
    <button class="btn ghost sm" onclick="PREF.teclas=Object.assign({},PREF_BASE.teclas);S.esperandoTecla=null;guardarPref();render()">↺ TECLAS DE SIEMPRE</button>
  </div>

  <div class="card"><div class="eyebrow">AYUDAS</div><div style="height:2px"></div>
    <div class="li"><div class="g"><b>Asistencia</b><span>Tu jugador va solo a la bola si no lo mueves y brilla el golpe que conviene.</span></div>${tgPref('asistencia')}</div>
    <div class="li"><div class="g"><b>Golpe automático</b><span>Si no pulsas nada, pega solo el golpe básico. Remate, globo y dejada siguen siendo tuyos.</span></div>${tgPref('golpeAuto')}</div>
    <div class="li"><div class="g"><b>Vibración</b><span>Un toque al pegar, en los móviles que lo permiten.</span></div>${tgPref('vibracion')}</div>
    <div class="li"><div class="g"><b>Sonido</b><span>Golpes, cristal y grada.</span></div>${tgPref('sonido')}</div>
  </div>

  <div class="card"><div class="eyebrow">LOS GOLPES</div><div style="height:2px"></div>${guiaGolpes(false)}</div>

  <div class="card"><div class="li" style="border:0;padding:0"><div class="g"><b>Partido rápido</b><span>Juegos para ganar</span></div>${segJuegos()}</div></div>
  <button class="btn" onclick="S.esperandoTecla=null;partidoRapido()">⚡ PROBAR EN UN PARTIDO RÁPIDO</button><div style="height:8px"></div>
  <button class="btn ghost" onclick="S.esperandoTecla=null;S.avisoTecla=null;S.pantalla='${volver}';render()">VOLVER</button></div>`;
}
function tarjetaPistaInicio(){
  return `<div class="card">
    <div class="eyebrow">🎾 LOS MOMENTOS CLAVE LOS DECIDES TÚ</div>
    <p class="sub" style="margin:6px 0 10px">Eliges cada torneo del calendario. Los partidos se simulan y los <b>momentos clave</b> los decides tú: en la pista (joystick y cuatro golpes), en una ráfaga, leyendo al rival o eligiendo camino. <b>Las finales, siempre en la pista.</b></p>
    <div class="row">
      <button class="btn sm" onclick="partidoRapido()">⚡ PARTIDO RÁPIDO</button>
      <button class="btn ghost sm" onclick="S.volverComo='inicio';S.pantalla='como';render()">🎮 CONTROLES</button>
    </div>
  </div>`;
}
function vFinRapido(){
  const r = S.rapido;
  if(!r){ S.pantalla = S.j ? 'temporada' : 'inicio'; return S.j ? vTemporada() : vInicio(); }
  const s = r.stats, volver = S.volverRapido && S.volverRapido !== 'finRapido' ? S.volverRapido : (S.j ? 'temporada' : 'inicio');
  return `<div class="fade">
  <div class="card ${r.gano?'event-hero':'event-hero mal'}">
    <div class="eyebrow">PARTIDO RÁPIDO</div>
    <div class="title-xl" style="margin:6px 0 8px">${r.gano?'✅ ¡GANASTEIS!':'😖 PERDISTEIS'}</div>
    <p class="sub" style="margin:0">${r.juegos[0]} – ${r.juegos[1]} en juegos${s.orosJ?` · ${s.orosG}/${s.orosJ} puntos de oro`:''}</p>
  </div>
  <div class="card"><div class="g2">
    <div><div class="eyebrow">TUS GOLPES</div><div class="title-lg">${s.golpes}</div></div>
    <div><div class="eyebrow">RALLY MÁS LARGO</div><div class="title-lg">${s.rallyMax}</div></div>
    <div><div class="eyebrow">REMATES</div><div class="title-lg">${s.remates}</div></div>
    <div><div class="eyebrow">POR 3</div><div class="title-lg">${s.porTres}</div></div>
    <div><div class="eyebrow">GLOBOS</div><div class="title-lg">${s.globos}</div></div>
    <div><div class="eyebrow">PERFECTOS</div><div class="title-lg">${s.perfectos}</div></div>
  </div></div>
  <button class="btn" onclick="partidoRapido()">REVANCHA</button><div style="height:8px"></div>
  <button class="btn ghost" onclick="S.rapido=null;S.pantalla='${volver}';render()">VOLVER</button>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   LA RÁFAGA
   El punto de oro sin opciones que elegir: se juega a golpes. Tres golpes
   seguidos y en cada uno un cursor que va y viene; hay que pararlo en la zona
   verde (en el centro dorado, golpe perfecto). Aciertas dos y el punto es
   vuestro. La zona crece con la estadística de cada golpe y con la
   dificultad; el cursor corre más cuanto mejores son los rivales.
   ═══════════════════════════════════════════════════════════════ */
const SERIES_RAFAGA = [
  [['🎾','RESTO','pared'], ['🏐','VOLEA','volea'], ['💥','REMATE','remate']],
  [['☂️','GLOBO','globo'], ['🍽️','BANDEJA','bandeja'], ['🐍','VÍBORA','remate']],
  [['🧱','SALIDA DE PARED','pared'], ['🎾','DRIVE','pared'], ['🏐','VOLEA','volea']],
  [['🪶','CHIQUITA','volea'], ['🏐','VOLEA','volea'], ['💥','REMATE','remate']],
];
const RAFAGA_BIEN = ['La bola salió de la pala justo cuando tenía que salir.', 'Tres golpes, tres decisiones rápidas. Se quedaron mirando.', 'Pegasteis a tiempo cuando más quemaba la bola.'];
const RAFAGA_MAL = ['Un golpe a destiempo y la bola se murió en la red.', 'Llegasteis tarde a la bola buena.', 'Os precipitasteis con la pala y se os fue larga.'];
function crearRafaga(j, edge, obj){
  const D = difActual(), s = j.stats, e = clamp(edge, -15, 15), sT = obj != null ? aciertoParaDosDeTres(obj) : null;
  const golpes = pick(SERIES_RAFAGA).map(([ic, nom, stat]) => {
    const extra = 0.05*clamp((s[stat] - 55)/40, -1, 1);
    /* en un torneo, la zona verde mide lo que hace falta para acertar 2 de 3 con el % del partido */
    const w = sT != null ? clamp(0.33*erfinv(Math.min(sT, .985)) + extra*.5, 0.06, 0.46) : clamp(0.17 + extra + D.rafaga + e*0.004, 0.1, 0.42);
    return { ic, nom, stat, w, centro: rnd(w/2 + 0.06, 1 - w/2 - 0.06), res:null, pos:null };
  });
  return { golpes, dur: sT != null ? clamp(1150 + 400*(obj - .5), 950, 1350) : clamp(1100 + e*14 + D.rafagaMs, 650, 1800), i:0, t0:0, bloqueoHasta:0, ultimo:null, fin:null, finAt:0 };
}
/* el cursor va y viene: tarda `dur` ms en cruzar la barra */
function posCursor(R, ahora){
  const t = Math.max(0, ahora - R.t0), x = (t % (2*R.dur)) / R.dur;
  return x <= 1 ? x : 2 - x;
}
function rafagaActiva(){
  if(!S) return null;
  if(S.pantalla === 'momento' && S.torneo && S.torneo.momento && S.torneo.momento.forma === 'tiempo') return S.torneo.momento.rafaga;
  if(S.pantalla === 'mundial' && S.mundial) return S.mundial.rafaga;
  return null;
}
let rafRafaga = 0;
/* Se llama después de pintar: mueve el cursor de la ráfaga que esté en pantalla */
function animarMinijuego(){
  const R = rafagaActiva();
  if(!hayDOM || !R || R.fin) return;
  cancelAnimationFrame(rafRafaga);
  if(!R.t0) R.t0 = Math.max(performance.now(), R.bloqueoHasta || 0);
  const paso = () => {
    const el = document.getElementById('cursorRafaga');
    if(!el || rafagaActiva() !== R || R.fin) return;
    el.style.left = (posCursor(R, performance.now())*100).toFixed(2) + '%';
    rafRafaga = requestAnimationFrame(paso);
  };
  rafRafaga = requestAnimationFrame(paso);
}
function pegarRafaga(posPrueba){
  const R = rafagaActiva(); if(!R || R.fin) return;
  const ahora = hayDOM ? performance.now() : 0, g = R.golpes[R.i];
  if(!g || (posPrueba == null && ahora < (R.bloqueoHasta || 0))) return;
  const pos = posPrueba != null ? posPrueba : posCursor(R, ahora), dist = Math.abs(pos - g.centro);
  g.pos = pos;
  g.res = dist <= g.w*.15 ? 'perfecto' : dist <= g.w/2 ? 'bien' : 'fuera';
  R.ultimo = R.i;
  const ok = R.golpes.filter(x => x.res === 'bien' || x.res === 'perfecto').length, mal = R.golpes.filter(x => x.res === 'fuera').length;
  Sonido.golpe(g.res === 'perfecto' ? 1 : g.res === 'bien' ? .6 : .15);
  if(hayDOM && PREF.vibracion && navigator.vibrate){ try{ navigator.vibrate(g.res === 'fuera' ? [30, 40, 30] : 15); }catch(e){} }
  if(ok >= 2 || mal >= 2){
    const perf = R.golpes.filter(x => x.res === 'perfecto').length, gana = ok >= 2;
    R.fin = { gana, perf }; R.finAt = ahora;
    const texto = gana ? pick(RAFAGA_BIEN) + (perf >= 2 ? ' ¡Y con dos golpes perfectos!' : '') : pick(RAFAGA_MAL);
    const m = S.torneo && S.torneo.momento;
    if(m && m.rafaga === R) m.eleccion = { i:-1, gana, texto };
    else if(S.mundial && S.mundial.rafaga === R) S.mundial.eleccion = { gana, texto };
  } else { R.i++; R.t0 = 0; R.bloqueoHasta = ahora + 450; }
  guardar(); render();
}
/* el toque que acaba la ráfaga no puede pulsar sin querer el botón que aparece debajo del dedo */
function rafagaRecienAcabada(R){ return hayDOM && R && R.finAt && performance.now() - R.finAt < 600; }
function chipsRafaga(R){
  return `<div class="chips-rafaga">${R.golpes.map((g, i) => {
    const cls = g.res || (i === R.i && !R.fin ? 'ahora' : '');
    const marca = g.res === 'perfecto' ? '⭐' : g.res === 'bien' ? '✅' : g.res === 'fuera' ? '❌' : '';
    return `<span class="chip ${cls}">${g.ic}${marca ? ' ' + marca : ''}</span>`;
  }).join('')}</div>`;
}
function rafagaHTML(R){
  const g = R.golpes[R.i], u = R.ultimo != null ? R.golpes[R.ultimo] : null;
  const tecla = hayDOM && matchMedia('(hover:hover) and (pointer:fine)').matches;
  const aviso = u ? (u.res === 'perfecto' ? `<b style="color:var(--gold)">⭐ ¡${u.nom} perfect${['VOLEA','BANDEJA','VÍBORA','SALIDA DE PARED','CHIQUITA'].includes(u.nom) ? 'a' : 'o'}!</b>` : u.res === 'bien' ? `<b style="color:var(--bien)">✅ ${u.nom} dentro.</b>` : `<b style="color:var(--danger)">❌ ${u.nom} fuera.</b>`) + ' Siguiente golpe.'
    : 'Aciertas <b>2 de 3</b> y el punto es vuestro.';
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">⚡ RÁFAGA · GOLPE ${R.i + 1} DE 3</div>${chipsRafaga(R)}</div>
    <div class="title-lg" style="margin:9px 0 2px">${g.ic} ${g.nom}</div>
    <p class="muted" style="margin:0 0 12px">${aviso}</p>
    <div class="barra-rafaga" onpointerdown="event.preventDefault();pegarRafaga()">
      <div class="zona" style="left:${((g.centro - g.w/2)*100).toFixed(1)}%;width:${(g.w*100).toFixed(1)}%"><i></i></div>
      <div class="cursor" id="cursorRafaga" style="left:0%"></div>
    </div>
    <button class="btn pegar" onpointerdown="event.preventDefault();pegarRafaga()">🎾 ¡PEGAR!</button>
    <p class="muted center" style="margin:8px 0 0">Para el cursor en la zona <b style="color:var(--bien)">verde</b>; en el centro <b style="color:var(--gold)">dorado</b>, golpe perfecto.${tecla ? ' También con <kbd>Espacio</kbd>.' : ''}</p>
  </div>`;
}
if(hayDOM) addEventListener('keydown', e => {
  if(!S || S.esperandoTecla || (e.code !== 'Space' && e.code !== 'Enter') || !rafagaActiva()) return;
  e.preventDefault();
  if(!e.repeat) pegarRafaga();
});

/* El Mundial de Selecciones también se decide a ráfaga, con tu país mirando */
function crearMundialRafaga(j){
  const p = paisDe(j), ev = { t:'MUN', nom:'Mundial de Selecciones', ciudad: pick(p.ciudades).n, pista: p.pista, pais:null };
  const opp = generarRival('P1', 4, 6);
  return { ev, opp, ronda: RONDAS_MUNDIAL[Math.min(j.mundialRonda || 0, 3)], rafaga: crearRafaga(j, ratingDupla(j, ev.pista, ev) - opp.rating + difActual().sim), eleccion:null };
}
function continuarMundial(){
  const j = S.j, mu = S.mundial; if(!mu || !mu.eleccion || rafagaRecienAcabada(mu.rafaga)) return;
  const gana = mu.eleccion.gana;
  j.orosJugados = (j.orosJugados||0) + 1;
  if(gana){ j.orosGanados = (j.orosGanados||0) + 1; j.moral = clamp(j.moral+9, 0, 100); j.forma = clamp(j.forma+2, -12, 12); }
  else { j.moral = clamp(j.moral-7, 0, 100); j.forma = clamp(j.forma-2, -12, 12); }
  S.mundial = null;
  S.duelo = { contexto:'mundial', resultado:{ gana } };
  cerrarDuelo();                        // lo que pasa con tu país, como siempre
}
function vMundial(){
  const j = S.j, mu = S.mundial;
  if(!mu){ S.pantalla = 'temporada'; return vTemporada(); }
  const e = mu.eleccion;
  const h = `<div class="fade">
  <div class="card" style="background:linear-gradient(160deg,rgba(245,197,66,.18),transparent 62%);border-color:rgba(245,197,66,.4)">
    <div class="eyebrow">🇺🇳 MUNDIAL DE SELECCIONES · ${mu.ronda.nom}</div>
    <div class="title-xl" style="margin:6px 0 8px">⚡ PUNTO POR TU PAÍS</div>
    <p class="sub" style="margin:0">Un set para cada pareja, 5-5 en el tercero y punto de oro. ${mu.ronda.d}</p>
    <div class="hr"></div>
    <div class="mrow"><span class="nm">${fichaPais(paisDe(j).cod)} ${esc(j.nombre)} / ${esc(j.pareja ? j.pareja.nombre : '—')}</span></div>
    <div class="mrow"><span class="nm">${fichaPais(mu.opp.flag)} ${esc(mu.opp.nombre)} / ${esc(mu.opp.nombre2)}</span><span class="rk">#${mu.opp.rank}</span></div>
  </div>`;
  if(!e) return h + rafagaHTML(mu.rafaga) + `</div>`;
  return h + `<div class="card ${e.gana ? 'event-hero' : 'event-hero mal'}">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">⚡ RÁFAGA</div>${chipsRafaga(mu.rafaga)}</div>
    <div class="title-xl" style="margin:6px 0 8px">${e.gana ? '🏅 ¡PUNTO PARA TU PAÍS!' : '😖 SE OS ESCAPÓ'}</div>
    <p class="sub" style="margin:0">${e.texto}</p>
  </div>
  <button class="btn" onclick="continuarMundial()">CONTINUAR</button></div>`;
}

/* ═══════════════════════════════════════════════════════════════
   LEER AL RIVAL
   Punto de oro y la bola la tienen ellos: ¿a dónde la van a mandar? Tapas
   izquierda, centro o derecha. Tres bolas y gana quien lea dos. Su estilo de
   juego dice a dónde suelen ir; con Mental alto ves los porcentajes y a veces
   pillas cómo se perfilan. Si sois mejores, alguna bola mal leída la sacáis.
   ═══════════════════════════════════════════════════════════════ */
const ZONAS_LEER = [['⬅️','IZQUIERDA','a la izquierda'], ['⬆️','CENTRO','al centro'], ['➡️','DERECHA','a la derecha']];
const LECTURA_ESTILO = {
  muro:     { w:[25,50,25], txt:'Globo y paciencia: casi todo al centro, esperando vuestro error.' },
  red:      { w:[42,16,42], txt:'Todo a la red: buscan las rejas, a los lados.' },
  potencia: { w:[52,18,30], txt:'Potencia y remate: van a por el revés, a la izquierda.' },
  zurda:    { w:[26,24,50], txt:'Zurd@ al drive: les sale solo hacia la derecha.' },
  joven:    { w:[40,20,40], txt:'Jóvenes sin miedo: se la juegan a las líneas.' },
  veterana: { w:[30,40,30], txt:'Oficio y colocación: al centro, entre los dos, y cambian mucho.' },
};
const LEER_BIEN = ['Les leísteis el punto entero: cada bola la teníais esperando.', 'Sabíais a dónde iba antes de que la pegaran. Se quedaron sin ideas.', 'Leísteis el patrón y cerrasteis con una volea al hueco.'];
const LEER_MAL = ['Os cambiaron el guion justo cuando lo teníais leído.', 'Os ganaron con la bola que no esperabais.', 'Adivinaron que ibais a adivinar.'];
function crearLectura(j, opp, edge, obj){
  const est = LECTURA_ESTILO[opp && opp.arq && opp.arq.id] || LECTURA_ESTILO.veterana, D = difActual();
  const lectura = clamp((j.stats.mental - 35)/50 + D.eleccion*2, 0, 1), e = clamp(edge, -15, 15);
  const bolas = [];
  let prev = -1;
  for(let b = 0; b < 3; b++){
    /* cada bola cambia un poco el plan, y rara vez repiten el lado de la anterior */
    let w = est.w.map((x, i) => x * rnd(.75, 1.25) * (i === prev ? .7 : 1));
    const suma = w.reduce((a, x) => a + x, 0);
    w = w.map(x => Math.round(100*x/suma));
    w[1] = 100 - w[0] - w[2];
    const u = Math.random()*100, dir = u < w[0] ? 0 : u < w[0] + w[1] ? 1 : 2;
    const chivato = Math.random() < .25 + .35*lectura ? (Math.random() < .8 ? dir : pick([0,1,2].filter(i => i !== dir))) : null;
    /* lo que se enseña es la probabilidad exacta de cada zona, contando lo que delata el perfil (acierta 8 de cada 10) */
    const post = chivato === null ? w.map(x => x/100) : (() => { const q = w.map((x, i) => x*(i === chivato ? .8 : .1)), t = q.reduce((a, x) => a + x, 0); return q.map(x => x/t); })();
    const mostrado = post.map(x => Math.round(100*x)); mostrado[1] = 100 - mostrado[0] - mostrado[2];
    const bola = { w, dir, chivato, post, mostrado };
    if(obj != null){
      /* tapando la zona marcada (la más probable), cada bola sale bien lo justo para ganar 2 de 3 con la probabilidad exacta del partido */
      const pc = Math.max.apply(null, post), sT = aciertoParaDosDeTres(obj);
      if(sT >= pc){ bola.escapa = 0; bola.salva = (sT - pc)/(1 - pc); } else { bola.salva = 0; bola.escapa = 1 - sT/pc; }
    }
    bolas.push(bola);
    prev = dir;
  }
  return { bolas, k:0, aciertos:0, fallos:0, hist:[], obj: obj != null ? obj : null, exacta: lectura >= .45, estilo: est.txt,
           salva: clamp(.14 + e*.02 + D.eleccion, 0, .5), escapa: clamp(.08 - e*.015, 0, .3), fin:null };
}
function leerZona(L, i){
  if(!L || L.fin || !(i >= 0 && i <= 2)) return null;
  const b = L.bolas[L.k], leida = i === b.dir, ok = leida ? Math.random() >= (b.escapa != null ? b.escapa : L.escapa) : Math.random() < (b.salva != null ? b.salva : L.salva);
  L.hist.push({ elegida:i, dir:b.dir, leida, ok });
  if(ok) L.aciertos++; else L.fallos++;
  L.k++;
  Sonido.golpe(ok ? .8 : .2);
  if(hayDOM && PREF.vibracion && navigator.vibrate){ try{ navigator.vibrate(ok ? 15 : [30, 40, 30]); }catch(err){} }
  if(L.aciertos >= 2 || L.fallos >= 2) L.fin = { gana: L.aciertos >= 2, texto: L.aciertos >= 2 ? pick(LEER_BIEN) : pick(LEER_MAL) };
  return L.fin;
}
function leerZonaMomento(i){
  const m = S.torneo && S.torneo.momento; if(!m || m.forma !== 'leer' || m.eleccion) return;
  const fin = leerZona(m.leer, i);
  if(fin) m.eleccion = { i, gana: fin.gana, texto: fin.texto };
  guardar(); render();
}
function textoBolaLeida(x){
  const z = ZONAS_LEER[x.dir][2];
  if(x.leida) return x.ok ? `✅ <b>La leísteis:</b> iba ${z} y la cerrasteis con una volea.` : `😬 La leísteis, pero os llegó con demasiado veneno ${z}.`;
  return x.ok ? `🍀 Os pillaron a contrapié (iba ${z})… y la sacasteis igual.` : `❌ Se fue ${z}. No llegasteis.`;
}
function chipsLectura(L){
  return `<div class="chips-rafaga">${[0,1,2].map(i => {
    const x = L.hist[i];
    return `<span class="chip ${x ? (x.ok ? 'bien' : 'fuera') : (i === L.k && !L.fin ? 'ahora' : '')}">👀${x ? ' ' + (x.ok ? '✅' : '❌') : ''}</span>`;
  }).join('')}</div>`;
}
function leerHTML(L){
  const b = L.bolas[Math.min(L.k, 2)], ult = L.hist[L.hist.length - 1];
  let h = `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="eyebrow">👀 LEER AL RIVAL · BOLA ${Math.min(L.k + 1, 3)} DE 3</div>${chipsLectura(L)}</div>
    <p class="muted" style="margin:7px 0 0">${L.estilo} <b style="color:var(--text)">Leéis 2 de 3 y el punto es vuestro.</b>${L.obj != null ? ` Tapando siempre la zona más probable ganáis el <b style="color:var(--text)">${Math.round(L.obj*100)}%</b> de las veces.` : ''}</p>`;
  if(ult) h += `<div class="log ${ult.ok ? '' : 'bad'}" style="margin:9px 0 0">${textoBolaLeida(ult)}</div>`;
  if(!L.fin){
    const vals = b.mostrado || b.w, maxW = Math.max.apply(null, vals);
    h += `<div class="zonas-leer">${ZONAS_LEER.map(([ic, nom], i) => `<button class="zleer ${vals[i] === maxW ? 'top' : ''}" onclick="leerZonaMomento(${i})">
        <span class="ic">${ic}</span><b>${nom}</b><small>${L.exacta ? vals[i] + '%' : vals[i] === maxW ? 'lo más probable' : '&nbsp;'}</small></button>`).join('')}</div>
      ${b.chivato !== null ? `<div class="log gold" style="margin:9px 0 0">👀 <b>Se perfilan para ir ${ZONAS_LEER[b.chivato][2]}.</b> ${L.exacta ? 'Ya está contado en los porcentajes.' : 'O eso parece.'}</div>` : ''}
      <p class="muted center" style="margin:8px 0 0">Toca la zona que vais a tapar.${L.exacta ? '' : ' Con más <b>Mental</b> verías los porcentajes.'}</p>`;
  }
  return h + `</div>`;
}
