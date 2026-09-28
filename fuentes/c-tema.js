
/* ═══════════════════════════════════════════════════════════════
   DOS TEMAS
   "Día de pista" (claro, el de siempre desde ahora) y el oscuro de antes.
   Todo el color de la interfaz sale de variables: cambiar de tema es cambiar
   un atributo en <html>. La pista, las banderas y las cartas no cambian.
   ═══════════════════════════════════════════════════════════════ */
const FAVICON_CLARO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233D4BFF'/%3E%3Crect x='14' y='11' width='36' height='42' rx='17' fill='%23C6F000'/%3E%3Ccircle cx='24' cy='24' r='2.6' fill='%233D4BFF'/%3E%3Ccircle cx='32' cy='24' r='2.6' fill='%233D4BFF'/%3E%3Ccircle cx='40' cy='24' r='2.6' fill='%233D4BFF'/%3E%3Ccircle cx='24' cy='33' r='2.6' fill='%233D4BFF'/%3E%3Ccircle cx='32' cy='33' r='2.6' fill='%233D4BFF'/%3E%3Ccircle cx='40' cy='33' r='2.6' fill='%233D4BFF'/%3E%3C/svg%3E";
function temaActual(){ return typeof PREF !== 'undefined' && PREF && PREF.tema === 'oscuro' ? 'oscuro' : 'claro'; }
function aplicarTema(){
  if(!hayDOM) return;
  const t = temaActual(), html = document.documentElement;
  if(html.getAttribute('data-tema') !== t) html.setAttribute('data-tema', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', t === 'claro' ? '#EEF1FF' : '#08191C');
  const link = document.querySelector('link[rel="icon"]');
  if(link){
    if(!link.dataset.oscuro) link.dataset.oscuro = link.getAttribute('href');
    const quiere = t === 'claro' ? FAVICON_CLARO : link.dataset.oscuro;
    if(link.getAttribute('href') !== quiere) link.setAttribute('href', quiere);
  }
}
function cambiarTema(t){
  PREF.tema = (t === 'claro' || t === 'oscuro') ? t : (temaActual() === 'claro' ? 'oscuro' : 'claro');
  guardarPref(); aplicarTema(); render();
}
/* el botón de arriba a la derecha: enseña el tema al que te lleva */
function botonTema(){
  const claro = temaActual() === 'claro';
  return `<button class="tema-top" onclick="cambiarTema()" aria-label="${claro ? 'Pasar al modo oscuro' : 'Pasar al modo claro'}">${ico(claro ? 'luna' : 'sol')}<span>${claro ? 'OSCURO' : 'CLARO'}</span></button>`;
}
/* y la tarjeta en Cómo se juega, con las dos opciones a la vista */
function temaHTML(){
  const t = temaActual();
  const opcion = (id, ic, nom, d) => `<button class="opt ${t === id ? 'on' : ''}" onclick="cambiarTema('${id}')"><span class="ic">${ico(ic)}</span><span><span class="t">${nom}</span><span class="d">${d}</span></span></button>`;
  return `<div class="card"><div class="eyebrow">${ico(t === 'claro' ? 'sol' : 'luna')} APARIENCIA</div><div style="height:8px"></div>
    <div class="g2">
      ${opcion('claro', 'sol', 'MODO CLARO', 'Día de pista: blanco, azul y rosa.')}
      ${opcion('oscuro', 'luna', 'MODO OSCURO', 'El de noche: verde pista y lima.')}
    </div>
    <p class="muted" style="margin:8px 0 0">También se cambia con el botón de arriba a la derecha.</p></div>`;
}
