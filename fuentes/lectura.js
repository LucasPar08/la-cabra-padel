
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
function crearLectura(j, opp, edge){
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
    bolas.push({ w, dir, chivato });
    prev = dir;
  }
  return { bolas, k:0, aciertos:0, fallos:0, hist:[], exacta: lectura >= .45, estilo: est.txt,
           salva: clamp(.14 + e*.02 + D.eleccion, 0, .5), escapa: clamp(.08 - e*.015, 0, .3), fin:null };
}
function leerZona(L, i){
  if(!L || L.fin || !(i >= 0 && i <= 2)) return null;
  const b = L.bolas[L.k], leida = i === b.dir, ok = leida ? Math.random() >= L.escapa : Math.random() < L.salva;
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
    <p class="muted" style="margin:7px 0 0">${L.estilo} <b style="color:var(--text)">Leéis 2 de 3 y el punto es vuestro.</b></p>`;
  if(ult) h += `<div class="log ${ult.ok ? '' : 'bad'}" style="margin:9px 0 0">${textoBolaLeida(ult)}</div>`;
  if(!L.fin){
    const maxW = Math.max.apply(null, b.w);
    h += `<div class="zonas-leer">${ZONAS_LEER.map(([ic, nom], i) => `<button class="zleer ${b.w[i] === maxW ? 'top' : ''}" onclick="leerZonaMomento(${i})">
        <span class="ic">${ic}</span><b>${nom}</b><small>${L.exacta ? b.w[i] + '%' : b.w[i] === maxW ? 'lo más probable' : '&nbsp;'}</small></button>`).join('')}</div>
      ${b.chivato !== null ? `<div class="log gold" style="margin:9px 0 0">👀 <b>Se perfilan para ir ${ZONAS_LEER[b.chivato][2]}.</b> ${L.exacta ? 'Casi siempre es verdad.' : 'O eso parece.'}</div>` : ''}
      <p class="muted center" style="margin:8px 0 0">Toca la zona que vais a tapar.${L.exacta ? '' : ' Con más <b>Mental</b> verías los porcentajes.'}</p>`;
  }
  return h + `</div>`;
}
