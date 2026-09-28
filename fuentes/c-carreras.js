
/* ═══════════════════════════════════════════════════════════════
   MIS CARRERAS
   Cada carrera vive en su propio hueco de este dispositivo y se guarda sola
   mientras juegas. Desde aquí cambias de carrera, guardas una copia, cambias
   los nombres o borras la que ya no quieras.
   ═══════════════════════════════════════════════════════════════ */
const CARRERAS_KEY = 'cabra_padel_carreras', CARRERA_PREF = 'cabra_padel_carrera_', MAX_CARRERAS = 12;
function leerCarreras(){
  try{ const x = JSON.parse(localStorage.getItem(CARRERAS_KEY) || 'null'); if(x && Array.isArray(x.lista)) return x; }catch(e){}
  return { lista: [] };
}
function escribirCarreras(idx){ try{ localStorage.setItem(CARRERAS_KEY, JSON.stringify(idx)); return true; }catch(e){ return false; } }
function nuevoIdCarrera(){ return 'c' + Date.now().toString(36) + Math.floor(Math.random()*46656).toString(36); }
function resumenCarrera(j){
  return { jugador: j.nombre, pais: j.pais, edad: j.edad, anio: j.anio, ranking: j.ranking || null,
           titulos: (j.titulos || []).length, retirado: !!j.retirado };
}
/* lo llama guardar(): la carrera que estás jugando, a su hueco */
function guardarEnCarrera(j, txt){
  if(!j || !j.idCarrera) return;
  try{
    localStorage.setItem(CARRERA_PREF + j.idCarrera, txt);
    const idx = leerCarreras();
    let c = idx.lista.find(x => x.id === j.idCarrera);
    if(!c){ c = { id: j.idCarrera, nombre: j.nombre, creada: Date.now() }; idx.lista.unshift(c); }
    c.guardada = Date.now(); c.resumen = resumenCarrera(j); idx.activa = j.idCarrera;
    escribirCarreras(idx);
  }catch(e){}
}
/* partidas de antes de que existieran los huecos: la carrera suelta pasa a la lista */
function asegurarCarreras(){
  try{
    const raw = localStorage.getItem(SAVE_KEY); if(!raw) return;
    const d = JSON.parse(raw); if(!d || !d.j) return;
    const idx = leerCarreras();
    if(d.j.idCarrera && idx.lista.some(x => x.id === d.j.idCarrera)) return;
    const id = d.j.idCarrera || nuevoIdCarrera();
    d.j.idCarrera = id;
    if(S.j && !S.j.idCarrera) S.j.idCarrera = id;      // la misma carrera, si la estás jugando
    const txt = JSON.stringify(d);
    localStorage.setItem(SAVE_KEY, txt);
    guardarEnCarrera(d.j, txt);
  }catch(e){}
}
function listaCarreras(){ asegurarCarreras(); return leerCarreras().lista; }
function idCarreraActiva(){ try{ const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return d && d.j ? d.j.idCarrera || null : null; }catch(e){ return null; } }
function haceCuanto(t){
  if(!t) return 'hace un rato';
  const s = (Date.now() - t)/1000, d = new Date(t), hoy = new Date();
  const hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if(s < 60) return 'recién';
  if(s < 3600) return `hace ${Math.floor(s/60)} min`;
  if(d.toDateString() === hoy.toDateString()) return 'hoy, ' + hh;
  return `${d.getDate()}/${d.getMonth() + 1}, ${hh}`;
}
const fechaCorta = t => { const d = new Date(t); return `${d.getDate()}/${d.getMonth() + 1}`; };

/* ── Acciones ── */
function abrirCarreras(desde){ S.volverCarreras = desde || S.pantalla; S.pidiendo = null; S.pantalla = 'carreras'; render(); }
function jugarCarrera(id){
  let raw = null;
  try{ raw = localStorage.getItem(CARRERA_PREF + id); }catch(e){}
  if(!raw){ S.avisoCarreras = 'Esa carrera ya no está guardada en este dispositivo.'; render(); return; }
  if(S.j && S.j.idCarrera && S.j.idCarrera !== id) guardar();      // lo que llevabas queda en su hueco
  try{ localStorage.setItem(SAVE_KEY, raw); }catch(e){}
  S.pidiendo = null; S.avisoCarreras = null;
  continuarPartida();
}
function guardarAhora(){ if(!S.j) return; guardar(); S.avisoCarreras = 'Carrera guardada.'; render(); }
function guardarCopia(){
  if(!S.j) return;
  guardar();
  const idx = leerCarreras();
  if(idx.lista.length >= MAX_CARRERAS){ S.avisoCarreras = `Ya tienes ${MAX_CARRERAS} carreras: borra alguna para guardar otra copia.`; render(); return; }
  const orig = idx.lista.find(x => x.id === S.j.idCarrera), id = nuevoIdCarrera();
  try{
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    d.j.idCarrera = id;
    localStorage.setItem(CARRERA_PREF + id, JSON.stringify(d));
    idx.lista.splice(Math.max(0, idx.lista.indexOf(orig) + 1), 0,
      { id, nombre: `${orig ? orig.nombre : S.j.nombre} · copia ${fechaCorta(Date.now())}`, creada: Date.now(), guardada: Date.now(), resumen: resumenCarrera(d.j), copia: true });
    if(!escribirCarreras(idx)) throw 0;
    S.avisoCarreras = 'Copia guardada. Sigues jugando la carrera de siempre.';
  }catch(e){
    try{ localStorage.removeItem(CARRERA_PREF + id); }catch(_){}
    S.avisoCarreras = 'No queda sitio en este dispositivo para otra copia.';
  }
  render();
}
function guardarEdicion(id){
  const val = (sel, max) => { try{ const e = $(sel); return e && typeof e.value === 'string' ? e.value.trim().slice(0, max) : ''; }catch(err){ return ''; } };
  const nom = val('#ecNom', 32), jug = val('#ecJug', 26);
  if(nom.length < 1 || jug.length < 2){ S.avisoCarreras = 'Ponle un nombre a la carrera y al jugador (dos letras como mínimo).'; render(); return; }
  const idx = leerCarreras(), c = idx.lista.find(x => x.id === id);
  if(!c){ S.avisoCarreras = 'Esa carrera ya no está.'; render(); return; }
  c.nombre = nom;
  try{
    const raw = localStorage.getItem(CARRERA_PREF + id);
    if(raw){
      const d = JSON.parse(raw); d.j.nombre = jug;
      const txt = JSON.stringify(d);
      localStorage.setItem(CARRERA_PREF + id, txt);
      c.resumen = resumenCarrera(d.j);
      if(idCarreraActiva() === id) localStorage.setItem(SAVE_KEY, txt);
    }
  }catch(e){}
  if(S.j && S.j.idCarrera === id) S.j.nombre = jug;
  escribirCarreras(idx);
  S.pidiendo = null; S.avisoCarreras = 'Cambios guardados.';
  render();
}
function borrarCarrera(id){
  const idx = leerCarreras(), c = idx.lista.find(x => x.id === id);
  idx.lista = idx.lista.filter(x => x.id !== id);
  if(idx.activa === id) idx.activa = null;
  try{ localStorage.removeItem(CARRERA_PREF + id); }catch(e){}
  if(idCarreraActiva() === id) borrarSave();
  if(S.j && S.j.idCarrera === id){
    S.j = null; S.cal = null; S.trim = null; S.torneo = null; S.verTorneo = null; S.legado = null;
    S.pantalla = 'carreras';                 // sin carrera no hay temporada que pintar
  }
  escribirCarreras(idx);
  S.pidiendo = null; S.avisoCarreras = `Carrera borrada${c ? ': ' + c.nombre : ''}.`;
  render();
}
function nuevaCarreraLista(){
  if(listaCarreras().length >= MAX_CARRERAS){ S.avisoCarreras = `Ya tienes ${MAX_CARRERAS} carreras guardadas: borra alguna para empezar otra.`; abrirCarreras(S.pantalla); return; }
  CFG.error = null; irCrear();
}
/* al retirarte: la carrera queda guardada en su hueco y sueltas el mando */
function soltarCarrera(){ guardar(); borrarSave(); S.j = null; S.torneo = null; S.verTorneo = null; S.pantalla = 'inicio'; render(); }

/* ── La pantalla ── */
function vCarreras(){
  const lista = listaCarreras(), activa = idCarreraActiva(), aviso = S.avisoCarreras, pid = S.pidiendo || '';
  S.avisoCarreras = null;
  const volver = S.j ? (S.volverCarreras && S.volverCarreras !== 'carreras' ? S.volverCarreras : 'temporada') : 'inicio';
  return `<div class="fade">
  <div class="card">
    <div class="eyebrow">${ico('carpeta')} MIS CARRERAS · ${lista.length}/${MAX_CARRERAS}</div>
    <div class="title-lg" style="margin:5px 0 4px">Tus partidas guardadas</div>
    <p class="sub" style="margin:0">Cada carrera se guarda sola mientras juegas. Aquí cambias de carrera, guardas una copia antes de un torneo grande, cambias los nombres o borras la que ya no quieras.</p>
    ${aviso ? `<div class="log ${/No queda|ya no|mínimo/.test(aviso) ? 'bad' : 'gold'}" style="margin:10px 0 0">${esc(aviso)}</div>` : ''}
    ${S.j ? `<div style="height:10px"></div><div class="row">
      <button class="btn sm" onclick="guardarAhora()">${ico('guardar')} GUARDAR AHORA</button>
      <button class="btn ghost sm" onclick="guardarCopia()">${ico('copiar')} GUARDAR UNA COPIA</button></div>` : ''}
  </div>
  ${lista.length ? lista.map(c => tarjetaCarrera(c, c.id === activa, pid)).join('')
    : `<div class="card"><p class="muted" style="margin:0">Todavía no tienes ninguna carrera guardada. Empieza una y se guardará sola.</p></div>`}
  <button class="btn" onclick="nuevaCarreraLista()">${ico('mas')} NUEVA CARRERA</button>
  <div style="height:8px"></div>
  ${volverAtras(() => { S.pantalla = volver; })}
  <p class="muted center" style="margin-top:12px">Todo se guarda en este dispositivo: si borras los datos del navegador, se van con ellos.</p>
  </div>`;
}
function tarjetaCarrera(c, activa, pid){
  const r = c.resumen || {}, p = r.pais ? paisPorId(r.pais) : null;
  const datos = [p ? p.nom : '', r.edad ? r.edad + ' años' : '', r.anio ? 'temporada ' + r.anio : '',
                 r.ranking ? '#' + r.ranking : 'sin ranking', `${r.titulos || 0} título${r.titulos === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
  const estado = r.retirado ? '<span class="pill mal">RETIRADA</span>' : activa ? '<span class="pill acc">EN JUEGO</span>' : '';
  let acciones;
  if(pid === 'editar:' + c.id) acciones = `<div class="carrera-edit">
      <label>NOMBRE DE LA CARRERA<input type="text" id="ecNom" maxlength="32" value="${esc(c.nombre)}"></label>
      <label>NOMBRE DEL JUGADOR<input type="text" id="ecJug" maxlength="26" value="${esc(r.jugador || '')}"></label>
    </div>
    <div class="row"><button class="btn sm" onclick="guardarEdicion('${c.id}')">GUARDAR CAMBIOS</button>
      <button class="btn ghost sm" onclick="S.pidiendo=null;render()">CANCELAR</button></div>`;
  else if(pid === 'borrar:' + c.id) acciones = `<div class="log bad" style="margin:0 0 9px">Se borra <b>${esc(c.nombre)}</b> y no se puede recuperar.</div>
    <div class="row"><button class="btn danger sm" onclick="borrarCarrera('${c.id}')">SÍ, BORRARLA</button>
      <button class="btn ghost sm" onclick="S.pidiendo=null;render()">CANCELAR</button></div>`;
  else acciones = `<div class="row">
      <button class="btn sm" onclick="jugarCarrera('${c.id}')">${ico('jugar')} ${activa && S.j ? 'SEGUIR' : 'JUGAR'}</button>
      <button class="btn ghost sm" onclick="S.pidiendo='editar:${c.id}';render()">${ico('lapiz')} EDITAR</button>
      <button class="btn ghost sm" onclick="S.pidiendo='borrar:${c.id}';render()">${ico('papelera')} BORRAR</button></div>`;
  return `<div class="card carrera ${activa ? 'activa' : ''}">
    <div class="carrera-cab">
      <span class="carrera-bandera"><svg viewBox="0 0 100 100" aria-hidden="true">${fondoBandera(r.pais, 100, 100)}</svg></span>
      <div class="carrera-info"><b>${esc(c.nombre)}</b><span>${c.nombre === r.jugador ? '' : esc(r.jugador || '') + (datos ? ' · ' : '')}${datos}</span><small>Guardada ${haceCuanto(c.guardada)}</small></div>
      ${estado}
    </div>
    ${acciones}</div>`;
}
