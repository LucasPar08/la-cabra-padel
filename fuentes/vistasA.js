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
        <p class="muted" style="margin:8px 0 0">Los partidos se simulan y los <b style="color:var(--text)">juegos y puntos clave</b> los juegas tú en la pista.${mj === 'cuadro' ? ' Desde cuartos, <b style="color:var(--gold)">el cuadro del Major</b>.' : mj === 'duelo' ? ' La final, <b style="color:var(--gold)">a punto de oro</b>.' : ''}</p>
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
    if(u) h += `<div class="log ${u.clave ? 'gold' : ''}">✅ <b>Ganasteis la ${esc(rondaTexto(u.ronda))}</b> ${u.sets.join(' ')}${u.clave ? (u.clave.enVivo ? ' · 🎾 lo cerrasteis en la pista' : ' · 🔥 en el momento clave') : ''}. A por la siguiente.</div>`;
    if(mini === 'cuadro'){
      h += `<div class="card event-hero">
        <div class="eyebrow">MAJOR · CUARTOS DE FINAL</div>
        <div class="title-lg" style="margin:5px 0 6px">🏛️ El cuadro del Major</div>
        <p class="sub" style="margin:0">Tres rondas hasta el título y cada una es un minijuego: <b>elige camino</b> y esquiva a la pareja que os saca.</p>
      </div>
      <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarRonda()">🏛️ JUGAR EL CUADRO</button><div style="height:8px"></div>`;
    } else if(mini === 'duelo'){
      h += `<div class="card event-hero">
        <div class="eyebrow">FINAL · ${esc(etiquetaTier(ev.t))}</div>
        <div class="title-lg" style="margin:5px 0 6px">🥇 Final a punto de oro</div>
        <p class="sub" style="margin:0">La final se decide en un <b>punto de oro</b>: eliges el golpe con la probabilidad a la vista.</p>
      </div>
      <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarRonda()">🥇 JUGAR EL PUNTO DE ORO</button><div style="height:8px"></div>`;
    } else {
      const prob = probPartido(j, opp, ev), col = prob>=60?'var(--bien)':prob>=40?'var(--gold)':'var(--danger)';
      h += `<div class="card">
        <div class="eyebrow">${rondaNom}${to.enPrevia ? ' · CUADRO DE CLASIFICACIÓN' : ''}</div>
        <div style="height:8px"></div>
        <div class="mrow win"><span class="dot"></span><span class="nm">${fichaPais(j.cod)} ${esc(j.nombre)} / ${esc(j.pareja ? j.pareja.nombre : '—')}</span><span class="rk">${j.ranking ? '#'+j.ranking : '—'}</span></div>
        <div class="mrow"><span class="dot"></span><span class="nm">${fichaPais(opp.flag)} ${esc(opp.nombre)} / ${esc(opp.nombre2)}</span><span class="rk">#${opp.rank}</span></div>
        <p class="muted" style="margin:6px 0 0">Juegan a <b style="color:var(--text)">${esc(opp.arq.nom)}</b>${opp.arq.remate > 1.2 ? ' · cuidado con sus remates' : opp.arq.globo > 1.15 ? ' · te van a globear mucho' : ''}.</p>
        <div class="prob"><span class="barra"><i style="width:${prob}%"></i></span><span class="cifra" style="color:${col}">${prob}% de ganar simulando</span></div>
        <div class="log gold" style="margin:11px 0 0">${to.enPrevia ? '🌅 La previa se simula entera.' : esFinal ? '🔥 <b>La final se decide en la pista:</b> te tocará el juego clave.' : '🔥 Se simula el partido. <b>Si se aprieta, te toca jugar el juego o el punto clave en la pista.</b>'}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.06em;margin-top:11px"><span>TU ENERGÍA</span><span class="tabular">${Math.round(j.energia)}%</span></div>
        <div class="meter" style="margin-top:4px"><i style="width:${j.energia}%;background:${j.energia>60?'var(--accent)':j.energia>32?'var(--alerta)':'var(--danger)'}"></i></div>
      </div>
      <button class="btn" onclick="jugarRonda()">▶️ JUGAR ${rondaNom}</button><div style="height:8px"></div>`;
    }
    h += `<button class="btn ghost sm" onclick="simularHastaElFinal()">⏭️ SIMULAR HASTA EL FINAL</button>
      ${mj ? `<p class="muted center" style="margin:6px 0 0">${mj === 'cuadro' ? 'El cuadro del Major' : 'El punto de oro de la final'} no se salta: ese lo juegas tú.</p>` : ''}
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
  const opp = to.rival, pr = probMomento(m), col = pr>=60?'var(--bien)':pr>=40?'var(--gold)':'var(--danger)';
  return `<div class="fade">
  <div class="card" style="background:linear-gradient(160deg,rgba(245,197,66,.18),transparent 62%);border-color:rgba(245,197,66,.4)">
    <div class="eyebrow">${esc(nombreRondaActual(to))} · ${esc(to.ev.nom.toUpperCase())}</div>
    <div class="title-xl" style="margin:6px 0 8px">${m.tipo === 'punto' ? '🥇 PUNTO CLAVE' : '🔥 JUEGO CLAVE'}</div>
    <p class="sub" style="margin:0">${m.sit}</p>
    <div class="hr"></div>
    <div class="g2">
      <div><div class="eyebrow">${m.tipo === 'punto' ? 'MARCADOR' : 'EMPEZÁIS'}</div><div class="title-lg">${textoPuntos(m.inicio)}</div></div>
      <div><div class="eyebrow">SACA</div><div class="title-lg">${m.saca === 0 ? 'Vosotros' : 'Ellos'}</div></div>
    </div>
    ${m.tipo === 'juego' && m.inicio[0] !== m.inicio[1] ? `<p class="muted" style="margin:8px 0 0">${m.inicio[0] > m.inicio[1] ? 'Empezáis por delante: sois mejores que ellos.' : 'Empezáis por detrás: son mejores que vosotros.'}</p>` : ''}
  </div>
  <div class="card">
    <div class="eyebrow">ENFRENTE</div>
    <div class="mrow" style="margin-top:7px"><span class="nm">${fichaPais(opp.flag)} ${esc(opp.nombre)} / ${esc(opp.nombre2)}</span><span class="rk">#${opp.rank}</span></div>
    <p class="muted" style="margin:4px 0 0">Juegan a <b style="color:var(--text)">${esc(opp.arq.nom)}</b>.</p>
    <div class="prob"><span class="barra"><i style="width:${pr}%"></i></span><span class="cifra" style="color:${col}">${pr}% si lo simulas</span></div>
  </div>
  <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarMomento()">🎾 JUGARLO EN LA PISTA</button><div style="height:8px"></div>
  <button class="btn ghost" onclick="simularMomento()">⏩ SIMULARLO</button>
  <p class="muted center" style="margin:10px 0 0">${m.tipo === 'punto' ? 'Un solo punto: quien lo gane, gana el partido.' : 'Gana quien llegue antes a 4 puntos. A 40-40, punto de oro.'}<br>
    Dificultad <b style="color:var(--text)">${difActual().nom}</b> · <a href="#" style="color:var(--accent);font-weight:800" onclick="S.volverComo='momento';S.pantalla='como';render();return false">controles y dificultad</a></p>
  </div>`;
}

/* ── Cómo se juega, ajustes y partido rápido ── */
