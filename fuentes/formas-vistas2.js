function vMomento(){
  const to = S.torneo, m = to && to.momento;
  if(!m){ S.pantalla = to ? 'torneo' : 'temporada'; return to ? vTorneo() : vTemporada(); }
  const opp = to.rival, e = m.eleccion;
  const titulo = m.forma === 'tiempo' ? '⚡ PUNTO CLAVE' : m.forma === 'camino' ? '🧩 ELIGE CAMINO' : m.tipo === 'punto' ? '🥇 PUNTO CLAVE' : '🔥 JUEGO CLAVE';
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
    return h + `<div class="prob" style="margin:0 2px 12px"><span class="barra"><i style="width:${pr}%"></i></span><span class="cifra" style="color:${col}">${pr}% si lo simulas</span></div>
    <button class="btn" style="background:var(--gold);color:#2a1d00" onclick="jugarMomento()">🎾 JUGARLO EN LA PISTA</button><div style="height:8px"></div>
    <button class="btn ghost" onclick="simularMomento()">⏩ SIMULARLO</button>
    <p class="muted center" style="margin:10px 0 0">${m.tipo === 'punto' ? 'Un solo punto: quien lo gane, gana el partido.' : 'Gana quien llegue antes a 4 puntos. A 40-40, punto de oro.'}<br>
      Dificultad <b style="color:var(--text)">${difActual().nom}</b> · <a href="#" style="color:var(--accent);font-weight:800" onclick="S.volverComo='momento';S.pantalla='como';render();return false">controles y dificultad</a></p>
    </div>`;
  }

  if(e){
    const siGana = m.previa ? (to.kPrevia >= RONDAS_PREVIA-1 ? '<b>¡Dentro del cuadro!</b> Clasificasteis.' : '<b>Seguís vivos en la previa.</b> Queda un partido para entrar.')
                 : m.esFinal ? '<b>¡El título es vuestro!</b>' : '<b>Partido vuestro.</b> A la siguiente ronda.';
    const siPierde = m.previa ? 'Os quedáis sin clasificar. A casa.' : m.esFinal ? 'Se llevan el título. Finalistas.' : 'Se llevan el partido. Fuera del torneo.';
    if(m.forma === 'camino') h += casillasHTML(m, true);
    const cabecera = m.forma === 'tiempo'
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

  h += m.forma === 'tiempo' ? rafagaHTML(m.rafaga) : casillasHTML(m, false);
  return h + `<button class="btn ghost sm" onclick="simularMomento()">⏩ SIMULARLO</button></div>`;
}
