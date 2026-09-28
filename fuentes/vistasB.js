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
    <p class="sub" style="margin:0">Los juegos y puntos clave se juegan en la pista: mueves a tu jugador (el amarillo, «TÚ») y eliges el golpe.</p></div>

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
    <div class="eyebrow">🎾 LOS PUNTOS CLAVE SE JUEGAN EN LA PISTA</div>
    <p class="sub" style="margin:6px 0 10px">Eliges cada torneo del calendario. Los partidos se simulan, pero los <b>juegos y puntos clave</b> los juegas tú: joystick y cuatro golpes (golpe, remate, globo y dejada). Y los minijuegos de los Majors y las finales siguen ahí.</p>
    <div class="row">
      <button class="btn sm" onclick="partidoRapido()">⚡ PARTIDO RÁPIDO</button>
      <button class="btn ghost sm" onclick="S.volverComo='inicio';S.pantalla='como';render()">🎮 CONTROLES</button>
    </div>
  </div>`;
}
