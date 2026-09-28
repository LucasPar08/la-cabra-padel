function vMomento(){
  const j = S.j, to = S.torneo, m = to && to.momento;
  if(!m){ S.pantalla = to ? 'torneo' : 'temporada'; return to ? vTorneo() : vTemporada(); }
  const opp = to.rival, e = m.eleccion;
  const titulo = m.forma === 'golpe' ? '🎯 PUNTO CLAVE' : m.forma === 'camino' ? '🧩 ELIGE CAMINO' : m.tipo === 'punto' ? '🥇 PUNTO CLAVE' : '🔥 JUEGO CLAVE';
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
    ${m.tipo === 'juego' && m.inicio[0] !== m.inicio[1] ? `<p class="muted" style="margin:8px 0 0">${m.inicio[0] > m.inicio[1] ? 'Empezáis por delante: sois mejores que ellos.' : 'Empezáis por detrás: son mejores que vosotros.'}</p>` : ''}` : ''}
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
    return h + `<div class="card ${e.gana ? 'event-hero' : 'event-hero mal'}">
      <div class="eyebrow">${m.forma === 'golpe' ? esc(ESCENARIOS[m.esc].ops[e.i].nom) : 'CAMINO ' + (e.i + 1)}</div>
      <div class="title-xl" style="margin:6px 0 8px">${e.gana ? (m.previa ? '✅ ¡CLASIFICÁIS!' : '✅ ¡LO GANASTEIS!') : '😖 SE OS ESCAPÓ'}</div>
      <p class="sub" style="margin:0">${e.texto}</p>
      <div class="hr"></div>
      <p class="sub" style="margin:0">${e.gana ? siGana : siPierde}</p>
    </div>
    <button class="btn" onclick="continuarMomento()">CONTINUAR</button></div>`;
  }

  if(m.forma === 'golpe'){
    const escena = ESCENARIOS[m.esc], d = { pBase:m.pBase };
    const probs = escena.ops.map(o => probsGolpe(j, d, o).total), mejor = probs.indexOf(Math.max.apply(null, probs)), lee = j.stats.mental >= 62;
    h += `<div class="card">
      <div style="display:flex;align-items:center;gap:9px">
        <span style="font-size:22px">${escena.ic}</span>
        <div><div style="font-weight:800;font-size:15px">${escena.tit}</div><div class="muted">${escena.ctx}</div></div>
      </div>
      <div class="hr"></div>
      <div class="eyebrow">${escena.preg}</div>
      <div style="height:9px"></div>
      ${escena.ops.map((o, i) => {
        const v = Math.round(j.stats[o.usa]), fuerte = v >= 72, pr = probsGolpe(j, d, o), pc = Math.round(pr.total*100);
        const col = pc>=60?'var(--bien)':pc>=45?'var(--gold)':'var(--danger)';
        return `<button class="opt ${(lee && i === mejor) ? 'on' : ''}" onclick="elegirGolpeMomento(${i})">
          <span class="ic">${o.ic}</span>
          <span style="flex:1;min-width:0">
            <span class="t">${o.nom}${(lee && i === mejor) ? ' <span class="pill acc" style="margin-left:4px">⭐ TU GOLPE</span>' : ''}</span>
            <span class="d">${o.d}</span>
            <span class="d" style="margin-top:4px;color:${fuerte ? 'var(--accent)' : 'var(--muted)'}">🏓 Depende de tu <b>${STAT_NOM[o.usa].toUpperCase()} (${v})</b>${fuerte ? ' — es de lo mejor que tienes' : ''}</span>
            <span class="prob"><span class="barra"><i style="width:${pc}%"></i></span><span class="cifra" style="color:${col}">${pc}% de ganar el punto</span></span>
          </span>
        </button>`;
      }).join('')}
      <p class="muted" style="margin:8px 0 0">${lee ? 'Tu <b>Mental (' + Math.round(j.stats.mental) + ')</b> te deja leer el punto: ya sabes cuál es tu golpe.' : 'Con más <b>Mental</b> sabrías cuál te conviene. Por ahora, intuición.'}</p>
    </div>`;
  } else h += casillasHTML(m, false);
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
    const minasVivas = c.minas.length - fall.length, quedan = c.casillas - fall.length;
    const avisoVivo = c.pista !== null && fall.indexOf(c.pista) < 0, elegibles = Math.max(1, quedan - (avisoVivo ? 1 : 0));
    const pc = Math.round(100*clamp((quedan - minasVivas)/elegibles, 0, 1)), col = pc>=70?'var(--bien)':pc>=45?'var(--gold)':'var(--danger)';
    h += `<div class="prob" style="margin-top:9px"><span class="barra"><i style="width:${pc}%"></i></span><span class="cifra" style="color:${col}">${pc}% de pasar</span></div>
      <p class="muted" style="margin:7px 0 0">${quedan} caminos por probar, ${minasVivas === 1 ? 'uno os elimina' : minasVivas + ' os eliminan'}${avisoVivo ? ' (uno ya lo has visto venir)' : ''}${c.vidas > 0 ? ' · 🛡️ tu psicólog@ os salva de un error' : ''}. Elige.</p>
      ${c.salvada ? `<div class="log gold" style="margin:8px 0 0">🛡️ <b>¡Bola de partido salvada!</b> Ese camino no era: elegid otro.</div>` : ''}
      ${avisoVivo ? `<div class="log" style="margin:8px 0 0">🧠 Tu <b>Mental (${Math.round(S.j.stats.mental)})</b> te avisa: por <b>ahí no</b>. Ese camino os saca del partido.</div>` : ''}`;
  }
  return h + `</div>`;
}

/* ── Cómo se juega, ajustes y partido rápido ── */
