
/* ═══════════════════════════════════════════════════════════════
   EL EMBLEMA DE CADA SEDE
   La bandera del país de fondo y, encima, la silueta de lo más conocido
   de la ciudad: el Obelisco, la Giralda, la torre Eiffel, el Burj...
   ═══════════════════════════════════════════════════════════════ */
/* ── Banderas, dibujadas para cualquier tamaño ── */
const f2 = x => +x.toFixed(2);
const rectB = (x, y, w, h, c) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"/>`;
const circB = (x, y, r, c) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"/>`;
function bandasH(w, h, cols, pesos){
  pesos = pesos || cols.map(() => 1);
  const tot = pesos.reduce((a, b) => a + b, 0); let y = 0;
  return cols.map((c, i) => { const hh = h*pesos[i]/tot, r = rectB(0, y, w, hh + .4, c); y += hh; return r; }).join('');
}
function bandasV(w, h, cols, pesos){
  pesos = pesos || cols.map(() => 1);
  const tot = pesos.reduce((a, b) => a + b, 0); let x = 0;
  return cols.map((c, i) => { const ww = w*pesos[i]/tot, r = rectB(x, 0, ww + .4, h, c); x += ww; return r; }).join('');
}
const triB = (h, punta, c) => `<path d="M0 0L${f2(punta)} ${f2(h/2)}L0 ${f2(h)}Z" fill="${c}"/>`;
function estrellaB(x, y, r, c){
  let d = '';
  for(let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.42 : r; d += (i ? 'L' : 'M') + f2(x + Math.cos(a)*rr) + ' ' + f2(y + Math.sin(a)*rr); }
  return `<path d="${d}Z" fill="${c}"/>`;
}
function cruzNordica(w, h, c){ const t = h*.2, x = Math.min(w*.3, h*.55); return rectB(x, 0, t, h, c) + rectB(0, h/2 - t/2, w, t, c); }
function dentado(w, h, ancho, c){
  let d = `M0 0H${f2(ancho)}`; const n = 9, p = h/n;
  for(let i = 0; i < n; i++) d += `L${f2(ancho + Math.min(w*.06, h*.12))} ${f2((i + .5)*p)}L${f2(ancho)} ${f2((i + 1)*p)}`;
  return `<path d="${d}H0Z" fill="${c}"/>`;
}
const BANDERA = {
  AR: (w, h) => bandasH(w, h, ['#74ACDF','#FFFFFF','#74ACDF']) + circB(w/2, h/2, h*.1, '#F6B40E'),
  BO: (w, h) => bandasH(w, h, ['#D52B1E','#F9E300','#007934']),
  CL: (w, h) => { const c = Math.min(w/3, h/2); return rectB(0, 0, w, h/2, '#FFFFFF') + rectB(0, h/2, w, h/2, '#D52B1E') + rectB(0, 0, c, h/2, '#0039A6') + estrellaB(c/2, h/4, h*.1, '#FFFFFF'); },
  CO: (w, h) => bandasH(w, h, ['#FCD116','#003893','#CE1126'], [2,1,1]),
  CR: (w, h) => bandasH(w, h, ['#002B7F','#FFFFFF','#CE1126','#FFFFFF','#002B7F'], [1,1,2,1,1]),
  CU: (w, h) => { const p = Math.min(h*.87, w*.45); return bandasH(w, h, ['#002A8F','#FFFFFF','#002A8F','#FFFFFF','#002A8F']) + triB(h, p, '#CF142B') + estrellaB(p*.36, h/2, h*.11, '#FFFFFF'); },
  EC: (w, h) => bandasH(w, h, ['#FFDD00','#034EA2','#ED1C24'], [2,1,1]),
  SV: (w, h) => bandasH(w, h, ['#0F47AF','#FFFFFF','#0F47AF']),
  ES: (w, h) => bandasH(w, h, ['#AA151B','#F1BF00','#AA151B'], [1,2,1]),
  GQ: (w, h) => bandasH(w, h, ['#3E9A00','#FFFFFF','#E32118']) + triB(h, Math.min(h*.4, w*.25), '#0073CE'),
  GT: (w, h) => bandasV(w, h, ['#4997D0','#FFFFFF','#4997D0']),
  HN: (w, h) => bandasH(w, h, ['#0073CF','#FFFFFF','#0073CF']) + estrellaB(w/2, h/2, h*.08, '#0073CF'),
  MX: (w, h) => bandasV(w, h, ['#006847','#FFFFFF','#CE1126']) + circB(w/2, h/2, h*.1, '#8C6A2F'),
  NI: (w, h) => bandasH(w, h, ['#0067C6','#FFFFFF','#0067C6']) + `<path d="M${f2(w/2 - h*.09)} ${f2(h*.58)}L${f2(w/2)} ${f2(h*.42)}L${f2(w/2 + h*.09)} ${f2(h*.58)}Z" fill="#C8A94A"/>`,
  PA: (w, h) => rectB(0, 0, w, h, '#FFFFFF') + rectB(w/2, 0, w/2, h/2, '#D21034') + rectB(0, h/2, w/2, h/2, '#005293') + estrellaB(w/4, h/4, h*.1, '#005293') + estrellaB(w*.75, h*.75, h*.1, '#D21034'),
  PY: (w, h) => bandasH(w, h, ['#D52B1E','#FFFFFF','#0038A8']) + `<circle cx="${f2(w/2)}" cy="${f2(h/2)}" r="${f2(h*.08)}" fill="none" stroke="#1B7A3E" stroke-width="${f2(h*.025)}"/>`,
  PE: (w, h) => bandasV(w, h, ['#D91023','#FFFFFF','#D91023']),
  PR: (w, h) => { const p = Math.min(h*.87, w*.45); return bandasH(w, h, ['#ED0000','#FFFFFF','#ED0000','#FFFFFF','#ED0000']) + triB(h, p, '#0050F0') + estrellaB(p*.36, h/2, h*.11, '#FFFFFF'); },
  DO: (w, h) => { const t = h*.16, a = w/2 - t/2, b = h/2 - t/2; return rectB(0, 0, w, h, '#FFFFFF') + rectB(0, 0, a, b, '#002D62') + rectB(w/2 + t/2, 0, a, b, '#CE1126') + rectB(0, h/2 + t/2, a, b, '#CE1126') + rectB(w/2 + t/2, h/2 + t/2, a, b, '#002D62'); },
  UY: (w, h) => { const c = Math.min(w*.4, h*5/9); return bandasH(w, h, [...Array(9)].map((_, i) => i % 2 ? '#0038A8' : '#FFFFFF')) + rectB(0, 0, c, h*5/9, '#FFFFFF') + circB(c/2, h*5/18, h*.12, '#FCD116'); },
  VE: (w, h) => bandasH(w, h, ['#FFCC00','#00247D','#CF142B']) + [...Array(8)].map((_, i) => { const a = Math.PI*(1.15 + i*.1); return circB(w/2 + Math.cos(a)*h*.22, h*.66 + Math.sin(a)*h*.22, h*.025, '#FFFFFF'); }).join(''),
  QA: (w, h) => rectB(0, 0, w, h, '#8D1B3D') + dentado(w, h, w*.26, '#FFFFFF'),
  BH: (w, h) => rectB(0, 0, w, h, '#CE1126') + dentado(w, h, w*.26, '#FFFFFF'),
  AE: (w, h) => bandasH(w, h, ['#00732F','#FFFFFF','#1A1A1A']) + rectB(0, 0, w*.26, h, '#FF0000'),
  SA: (w, h) => { let d = `M${f2(w*.27)} ${f2(h*.4)}`; for(let i = 0; i < 9; i++) d += `q${f2(w*.0255)} ${f2(-h*.07)} ${f2(w*.051)} 0`; return rectB(0, 0, w, h, '#006C35') + `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="${f2(h*.025)}"/><path d="M${f2(w*.3)} ${f2(h*.6)}H${f2(w*.7)}l${f2(w*.03)} ${f2(-h*.03)}" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="${f2(h*.02)}"/>`; },
  KW: (w, h) => bandasH(w, h, ['#007A3D','#FFFFFF','#CE1126']) + `<path d="M0 0L${f2(h*.5)} ${f2(h/3)}V${f2(h*2/3)}L0 ${f2(h)}Z" fill="#1A1A1A"/>`,
  ID: (w, h) => bandasH(w, h, ['#CE1126','#FFFFFF']),
  SG: (w, h) => bandasH(w, h, ['#EF3340','#FFFFFF']) + circB(h*.3, h*.25, h*.14, '#FFFFFF') + circB(h*.35, h*.25, h*.13, '#EF3340'),
  TH: (w, h) => bandasH(w, h, ['#A51931','#F4F5F8','#2D2A4A','#F4F5F8','#A51931'], [1,1,2,1,1]),
  OM: (w, h) => rectB(0, 0, w, h, '#DB161B') + rectB(w*.26, 0, w*.74, h/3, '#FFFFFF') + rectB(w*.26, h*2/3, w*.74, h/3, '#008000'),
  US: (w, h) => bandasH(w, h, [...Array(13)].map((_, i) => i % 2 ? '#FFFFFF' : '#B22234')) + rectB(0, 0, w*.42, h*7/13, '#3C3B6E')
    + [...Array(12)].map((_, i) => circB(w*.42*((i % 4) + .5)/4, h*7/13*(Math.floor(i/4) + .5)/3, h*.02, '#FFFFFF')).join(''),
  CA: (w, h) => { const k = h/20; return bandasV(w, h, ['#D80621','#FFFFFF','#D80621'], [1,2,1]) + `<path transform="translate(${f2(w/2 - 15*k)} ${f2(h/2 - 10.4*k)}) scale(${f2(k)})" d="M15 4.5L16 6.6L17.4 6.1L17 9.2L18.6 7.9L19.2 9L20.5 8.8L19.8 11.2L20.6 11.6L17.2 14L17.5 15.2L15.3 14.9V17H14.7V14.9L12.5 15.2L12.8 14L9.4 11.6L10.2 11.2L9.5 8.8L10.8 9L11.4 7.9L13 9.2L12.6 6.1L14 6.6Z" fill="#D80621"/>`; },
  IT: (w, h) => bandasV(w, h, ['#009246','#FFFFFF','#CE2B37']),
  BR: (w, h) => rectB(0, 0, w, h, '#009C3B') + `<path d="M${f2(w*.08)} ${f2(h/2)}L${f2(w/2)} ${f2(h*.1)}L${f2(w*.92)} ${f2(h/2)}L${f2(w/2)} ${f2(h*.9)}Z" fill="#FFDF00"/>` + circB(w/2, h/2, Math.min(w, h)*.22, '#002776')
    + `<path d="M${f2(w/2 - Math.min(w, h)*.21)} ${f2(h/2 - h*.03)}Q${f2(w/2)} ${f2(h/2 - h*.12)} ${f2(w/2 + Math.min(w, h)*.21)} ${f2(h/2 + h*.04)}" fill="none" stroke="#FFFFFF" stroke-width="${f2(h*.035)}"/>`,
  DE: (w, h) => bandasH(w, h, ['#1A1A1A','#DD0000','#FFCE00']),
  FR: (w, h) => bandasV(w, h, ['#0055A4','#FFFFFF','#EF4135']),
  BE: (w, h) => bandasV(w, h, ['#1A1A1A','#FDDA24','#EF3340']),
  NL: (w, h) => bandasH(w, h, ['#AE1C28','#FFFFFF','#21468B']),
  DK: (w, h) => rectB(0, 0, w, h, '#C8102E') + cruzNordica(w, h, '#FFFFFF'),
  SE: (w, h) => rectB(0, 0, w, h, '#006AA7') + cruzNordica(w, h, '#FECC02'),
  PT: (w, h) => bandasV(w, h, ['#006600','#FF0000'], [2,3]) + `<circle cx="${f2(w*.4)}" cy="${f2(h/2)}" r="${f2(h*.18)}" fill="none" stroke="#FFCC00" stroke-width="${f2(h*.05)}"/>`,
  CH: (w, h) => rectB(0, 0, w, h, '#DA291C') + rectB(w/2 - h*.07, h*.2, h*.14, h*.6, '#FFFFFF') + rectB(w/2 - h*.3, h*.43, h*.6, h*.14, '#FFFFFF'),
  SK: (w, h) => bandasH(w, h, ['#FFFFFF','#0B4EA2','#EE1C25']) + `<path d="M${f2(w*.28 - h*.14)} ${f2(h*.25)}H${f2(w*.28 + h*.14)}V${f2(h*.6)}Q${f2(w*.28)} ${f2(h*.8)} ${f2(w*.28 - h*.14)} ${f2(h*.6)}Z" fill="#EE1C25" stroke="#FFFFFF" stroke-width="${f2(h*.02)}"/>`,
  HR: (w, h) => { const s = h*.09, x0 = w/2 - s*1.5, y0 = h*.3; let q = ''; for(let i = 0; i < 3; i++) for(let k = 0; k < 3; k++) q += rectB(x0 + k*s, y0 + i*s, s, s, (i + k) % 2 ? '#FFFFFF' : '#FF0000'); return bandasH(w, h, ['#FF0000','#FFFFFF','#171796']) + q; },
  CZ: (w, h) => bandasH(w, h, ['#FFFFFF','#D7141A']) + `<path d="M0 0L${f2(Math.min(w/2, h*.87))} ${f2(h/2)}L0 ${f2(h)}Z" fill="#11457E"/>`,
};
function fondoBandera(pais, w, h){
  return BANDERA[pais] ? BANDERA[pais](w, h) : rectB(0, 0, w, h, '#1B3A4B') + `<circle cx="${f2(w*.5)}" cy="${f2(h*.3)}" r="${f2(h*.6)}" fill="#2B5A70" fill-opacity=".6"/>`;
}

/* ── Monumentos, en una caja de 100 x 100 apoyados abajo ── */
const DET = s => `<g fill="#06121A" fill-opacity=".32" stroke="none">${s}</g>`;
const LUZ = s => `<g fill-opacity=".3" stroke="none">${s}</g>`;
const MAR = '<path d="M0 100Q25 94 50 100Q75 94 100 100Z" fill-opacity=".55"/>';
const MONUMENTO = {
  obelisco: '<path d="M45.5 100V26L50 8L54.5 26V100Z"/><rect x="36" y="95" width="28" height="5"/>' + DET('<rect x="48.6" y="40" width="2.8" height="4"/>'),
  eiffel: '<path d="M48.8 4H51.2L53 20L56 40L60 58L65 78L73 100H61Q56 86 50 86Q44 86 39 100H27L35 78L40 58L44 40L47 20Z"/><rect x="38" y="40" width="24" height="3.2"/><rect x="33" y="58" width="34" height="3.6"/>',
  coliseo: '<path d="M6 100V52Q30 43 60 46L94 56V100Z"/>' + DET([60, 79].map(y => [...Array(8)].map((_, i) => `<rect x="${11 + i*10}" y="${y}" width="6" height="${y === 60 ? 11 : 14}" rx="3"/>`).join('')).join('')),
  sagrada: '<path d="M20 100V62H80V100Z"/><path d="M26 64V32L31 8L36 32V64Z"/><path d="M39 64V24L44 2L49 24V64Z"/><path d="M51 64V24L56 2L61 24V64Z"/><path d="M64 64V32L69 8L74 32V64Z"/>'
    + DET('<rect x="30" y="36" width="2" height="8"/><rect x="43" y="30" width="2" height="8"/><rect x="55" y="30" width="2" height="8"/><rect x="68" y="36" width="2" height="8"/><path d="M44 100V82Q50 74 56 82V100Z"/>'),
  giralda: '<rect x="36" y="95" width="28" height="5"/><path d="M40 96V34H60V96Z"/><path d="M42.5 34V22H57.5V34Z"/><path d="M45.5 22V13H54.5V22Z"/><path d="M48 13V7L50 2L52 7V13Z"/>'
    + DET('<rect x="46" y="44" width="8" height="10" rx="4"/><rect x="46" y="64" width="8" height="10" rx="4"/><rect x="47" y="25" width="6" height="6" rx="3"/>'),
  alcala: '<path d="M8 100V58H92V100H80V82A6 6 0 0 0 68 82V100H57V78A7 7 0 0 0 43 78V100H32V82A6 6 0 0 0 20 82V100Z"/><rect x="6" y="53" width="88" height="5"/><path d="M36 53L50 42L64 53Z"/><rect x="46" y="34" width="8" height="9"/>'
    + DET('<rect x="14" y="62" width="4" height="12"/><rect x="82" y="62" width="4" height="12"/>'),
  kuwait: '<rect x="36.5" y="8" width="3.2" height="92"/><circle cx="38.1" cy="48" r="12.5"/><circle cx="38.1" cy="25" r="6.8"/><rect x="58" y="34" width="2.8" height="66"/><circle cx="59.4" cy="62" r="8.5"/><rect x="73" y="48" width="2.2" height="52"/>'
    + DET('<rect x="25.6" y="47" width="25" height="2"/>'),
  burj: '<path d="M47.4 100V62L48.4 40L49.4 16L50 0L50.6 16L51.6 40L52.6 62V100Z"/><path d="M41.5 100V74L47.4 64V100Z"/><path d="M58.5 100V70L52.6 58V100Z"/><path d="M35 100V86L41.5 80V100Z"/><path d="M65 100V84L58.5 78V100Z"/>',
  kingdom: '<path fill-rule="evenodd" d="M34 100C36 64 39 34 42 8H58C61 34 64 64 66 100ZM45.2 32C45.6 22 46.5 14 47.6 11H52.4C53.5 14 54.4 22 54.8 32Q50 27 45.2 32Z"/>',
  mezquita: '<rect x="24" y="76" width="52" height="24"/><path d="M29 77Q29 54 50 50Q71 54 71 77Z"/><rect x="49" y="40" width="2" height="11"/><circle cx="50" cy="37" r="2.6"/><rect x="80" y="30" width="7" height="70"/><path d="M79 31L83.5 18L88 31Z"/><rect x="13" y="30" width="7" height="70"/><path d="M12 31L16.5 18L21 31Z"/>'
    + DET('<path d="M45 100V88Q50 82 55 88V100Z"/><rect x="80" y="44" width="7" height="2"/><rect x="13" y="44" width="7" height="2"/>'),
  vela: '<path d="M26 100L33 10Q45 50 46 100Z"/><path d="M74 100L67 10Q55 50 54 100Z"/><rect x="40" y="34" width="20" height="3"/><rect x="41" y="52" width="18" height="3"/><rect x="42" y="70" width="16" height="3"/>',
  marina: '<rect x="25" y="34" width="11" height="66"/><rect x="44.5" y="34" width="11" height="66"/><rect x="64" y="34" width="11" height="66"/><path d="M16 29Q50 21 86 27L87 33Q50 28 16 35Z"/>',
  monas: '<rect x="16" y="92" width="68" height="8"/><path d="M32 92L39 78H61L68 92Z"/><path d="M46.5 78L47.8 26H52.2L53.5 78Z"/><path d="M45 26H55L53 20Q52.5 11 50 6Q47.5 11 47 20Z" fill="#F2C94C"/>',
  wat: '<path d="M28 100L37 78L41 56L45.5 30L50 4L54.5 30L59 56L63 78L72 100Z"/><rect x="24" y="96" width="52" height="4"/>'
    + DET('<rect x="37" y="76" width="26" height="2.4"/><rect x="41" y="55" width="18" height="2"/><rect x="45" y="31" width="10" height="1.6"/>'),
  libertad: '<path d="M36 100V86H64V100Z"/><path d="M41 86V76H59V86Z"/><path d="M44.5 76L46 44Q50 38 54 44L55.5 76Z"/><circle cx="50" cy="38" r="4.2"/><path d="M52.5 46L60 19L63.4 20.2L56.5 47Z"/><path d="M58.6 19.5L57.8 12.5H64.8L63.8 19.8Z" fill="#F2C94C"/><path d="M45.2 34.5L46 30L50 32.4L54 30L54.8 34.5Z"/>',
  willis: '<path d="M29 100V40H39V20H61V32H71V100Z"/><rect x="43.5" y="3" width="2.2" height="17"/><rect x="54.3" y="3" width="2.2" height="17"/>'
    + DET('<rect x="39" y="40" width="1.4" height="60"/><rect x="50" y="20" width="1.4" height="80"/><rect x="60.6" y="32" width="1.4" height="68"/>'),
  cn: '<path d="M46.6 100L48.4 52H51.6L53.4 100Z"/><path d="M41 50Q50 39 59 50Q50 58 41 50Z"/><path d="M46.5 44H53.5L52.4 34H47.6Z"/><rect x="49.3" y="3" width="1.4" height="32"/><rect x="36" y="96" width="28" height="4"/>',
  cohete: '<path d="M50 4Q58.5 16 58.5 40V78H41.5V40Q41.5 16 50 4Z"/><path d="M41.5 62L31 84V93L41.5 85Z"/><path d="M58.5 62L69 84V93L58.5 85Z"/><path d="M44.5 78H55.5L57.5 90H42.5Z"/>' + DET('<circle cx="50" cy="34" r="3.6"/>'),
  palmera: MAR + '<path d="M47.5 99Q45 70 53.5 36L57 37.4Q50 70 53 99Z"/><path d="M55 36Q40 24 22 34Q40 29 55 39Z"/><path d="M56 36Q71 22 88 31Q71 28 57 39Z"/><path d="M55 35Q50 16 35 11Q49 20 53.5 37Z"/><path d="M56.5 35Q64 15 79 13Q65 22 58 37Z"/><path d="M55 37Q44 44 38 60Q47 47 57 39Z"/><path d="M57 37Q68 44 72 58Q64 47 56 39Z"/>',
  faro: LUZ('<path d="M56 30L90 20V40Z"/><path d="M44 30L10 20V40Z"/>') + '<path d="M41.5 96L45 43H55L58.5 96Z"/><rect x="42.5" y="37" width="15" height="6"/><rect x="45" y="26" width="10" height="11" fill="#F2C94C"/><path d="M43.5 26L50 17L56.5 26Z"/><rect x="32" y="95" width="36" height="5"/>'
    + DET('<path d="M44.2 56H55.8L56.4 64H43.6Z"/><path d="M43.3 74H56.7L57.3 82H42.7Z"/>'),
  piramide: '<path d="M8 100H92L86 88H14Z"/><path d="M16 88H84L78 76H22Z"/><path d="M24 76H76L70 64H30Z"/><path d="M32 64H68L62 52H38Z"/><rect x="41" y="38" width="18" height="14"/><rect x="39" y="35" width="22" height="3.4"/>'
    + DET('<path d="M46 100V52H54V100Z"/><rect x="47" y="42" width="6" height="10"/>'),
  angel: '<rect x="32" y="92" width="36" height="8"/><rect x="39" y="84" width="22" height="8"/><path d="M46 84L47.2 28H52.8L54 84Z"/><rect x="43.5" y="24" width="13" height="4.4"/><path d="M50 24L43 12L48.6 15.6L50 6L51.4 15.6L57 12Z" fill="#F2C94C"/>',
  silla: '<path d="M0 100L14 78L27 52L39 30L47 48L54 42L62 20L74 46L86 70L100 100Z"/>',
  montanas: '<path d="M0 100L22 58L33 72L52 28L66 56L77 42L100 100Z" fill-opacity=".95"/><path d="M52 28L44.5 45L49.5 42L53.5 47L58.6 40.5Z"/><path d="M22 58L17.5 67L21.8 64.6L26 67.4Z"/><path d="M77 42L72.5 51L76.5 48.6L80.6 51.4Z"/>',
  volcan: '<path d="M2 100L38 42H62L98 100Z" fill-opacity=".95"/><path d="M38 42H62L56.5 52L50 47L43.5 52Z"/><path d="M45 36Q40 27 47 23Q46 14 53 15Q58 8 62.5 16Q70 16 67 24" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-opacity=".8"/>',
  cupula: '<rect x="12" y="80" width="76" height="20"/><rect x="28" y="67" width="44" height="13"/><path d="M33 68Q33 43 50 39Q67 43 67 68Z"/><rect x="47.8" y="27" width="4.4" height="12"/><path d="M46.5 28L50 19L53.5 28Z"/>'
    + DET([17, 25, 33, 41, 56, 64, 72, 80].map(x => `<rect x="${x}" y="84" width="3" height="16"/>`).join('') + '<rect x="33" y="60" width="34" height="1.6"/>'),
  salvo: '<rect x="30" y="56" width="40" height="44"/><rect x="37" y="40" width="26" height="16"/><rect x="41.5" y="28" width="17" height="12"/><path d="M43 28Q50 13 57 28Z"/><rect x="49" y="5" width="2" height="12"/>'
    + DET('<rect x="36" y="62" width="4" height="30"/><rect x="48" y="62" width="4" height="30"/><rect x="60" y="62" width="4" height="30"/><rect x="47" y="44" width="6" height="8"/>'),
  garita: '<path d="M0 100V82H100V100Z" fill-opacity=".6"/><rect x="37" y="52" width="26" height="30"/><rect x="33" y="47" width="34" height="5"/><path d="M37 47Q50 24 63 47Z"/><circle cx="50" cy="27" r="2.6"/>'
    + DET('<rect x="46.5" y="60" width="7" height="12" rx="3.5"/><rect x="10" y="86" width="80" height="1.6"/>'),
  catedral: '<rect x="19" y="44" width="17" height="56"/><rect x="64" y="44" width="17" height="56"/><path d="M19 45L27.5 25L36 45Z"/><path d="M64 45L72.5 25L81 45Z"/><rect x="36" y="60" width="28" height="40"/><path d="M33 61L50 46L67 61Z"/><rect x="26.5" y="17" width="2" height="9"/><rect x="71.5" y="17" width="2" height="9"/><rect x="24.5" y="19.5" width="6" height="1.8"/><rect x="69.5" y="19.5" width="6" height="1.8"/>'
    + DET('<path d="M44 100V84Q50 76 56 84V100Z"/><rect x="25" y="52" width="5" height="9" rx="2.5"/><rect x="70" y="52" width="5" height="9" rx="2.5"/><circle cx="50" cy="68" r="4"/>'),
  mitad: '<rect x="33" y="92" width="34" height="8"/><path d="M39.5 92L42 46H58L60.5 92Z"/><circle cx="50" cy="33" r="12.5" fill="#F2C94C"/><g fill="none" stroke="#06121A" stroke-opacity=".35" stroke-width="1.8"><path d="M37.5 33H62.5"/><ellipse cx="50" cy="33" rx="5" ry="12.5"/></g>',
  monserrate: '<path d="M0 100L28 46L45 32L60 38L100 100Z" fill-opacity=".8"/><rect x="41" y="20" width="11" height="12"/><path d="M40 20L46.5 11L53 20Z"/><rect x="45.8" y="3" width="1.4" height="8"/><rect x="43.6" y="5.6" width="5.8" height="1.4"/>',
  cristo: '<path d="M0 100Q30 72 50 68Q70 72 100 100Z" fill-opacity=".7"/><rect x="43" y="58" width="14" height="10"/><path d="M45.5 58L46.8 24H53.2L54.5 58Z"/><path d="M24 25.5H76V31H24Z"/><circle cx="50" cy="17.5" r="5.2"/>',
  bandera: '<rect x="14" y="86" width="72" height="14"/><rect x="41" y="30" width="18" height="56"/><path d="M39 31H61L57 24H43Z"/><rect x="49" y="3" width="2" height="21"/><path d="M51 4H67L65 8.5L67 13H51Z" fill="#74ACDF"/>' + DET('<rect x="46" y="38" width="8" height="40"/>'),
  guggenheim: '<path d="M5 100V72Q12 52 29 58Q33 36 50 42Q58 23 71 38Q85 33 87 56Q97 62 95 100Z"/><g fill="none" stroke="#06121A" stroke-opacity=".3" stroke-width="2"><path d="M29 58Q39 72 35 100"/><path d="M50 42Q60 62 56 100"/><path d="M71 38Q73 64 77 100"/></g>',
  artes: '<path d="M4 100Q12 58 56 48Q88 43 96 58V100Z"/><path d="M58 49Q43 30 66 16Q63 34 75 47Z"/><g fill="none" stroke="#06121A" stroke-opacity=".28" stroke-width="1.8"><path d="M20 100Q26 70 44 58"/><path d="M36 100Q40 74 58 60"/><path d="M52 100Q56 78 74 64"/><path d="M68 100Q72 82 88 70"/></g>',
  atomium: '<g fill="none" stroke="#FFFFFF" stroke-width="3"><path d="M50 13L27 36L50 59L73 36Z"/><path d="M50 13V59M27 36H73M50 59V88"/></g><circle cx="50" cy="13" r="7"/><circle cx="27" cy="36" r="7"/><circle cx="73" cy="36" r="7"/><circle cx="50" cy="36" r="7"/><circle cx="50" cy="59" r="7"/><circle cx="50" cy="88" r="6"/><path d="M40 100L46 90H54L60 100Z"/>',
  molino: '<path d="M39 100L43.5 50H56.5L61 100Z"/><path d="M41.5 51L50 40L58.5 51Z"/><g stroke="#FFFFFF" stroke-width="2.6"><path d="M50 44L22 16M50 44L78 16M50 44L22 72M50 44L78 72"/></g><path d="M22 16L28.5 10L39 20.5L32.5 27Z"/><path d="M78 16L71.5 10L61 20.5L67.5 27Z"/><path d="M22 72L28.5 78L39 67.5L32.5 61Z"/><path d="M78 72L71.5 78L61 67.5L67.5 61Z"/><circle cx="50" cy="44" r="3.2"/>'
    + DET('<path d="M46 100V88Q50 83 54 88V100Z"/>'),
  casas: '<path d="M3 100V58L13.5 45L24 58V100Z"/><path d="M26 100V50L36.5 37L47 50V100Z"/><path d="M49 100V56L59.5 43L70 56V100Z"/><path d="M72 100V47L83 34L94 47V100Z"/>'
    + DET([[9, 64], [15, 64], [9, 78], [15, 78], [32, 56], [38, 56], [32, 72], [38, 72], [55, 62], [61, 62], [55, 78], [61, 78], [78, 54], [85, 54], [78, 70], [85, 70]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="6"/>`).join('')),
  duomo: '<rect x="12" y="58" width="76" height="42"/><path d="M12 59L50 38L88 59Z"/><path d="M48.2 42V14L50 3L51.8 14V42Z"/>'
    + [[13, 34], [23, 38], [33, 40], [43, 40], [57, 40], [67, 40], [77, 38], [87, 34]].map(([x, t]) => `<path d="M${x - 1.6} 60V${t + 8}L${x} ${t}L${x + 1.6} ${t + 8}V60Z"/>`).join('')
    + DET('<path d="M45 100V84Q50 77 55 84V100Z"/><rect x="22" y="70" width="4" height="12" rx="2"/><rect x="74" y="70" width="4" height="12" rx="2"/>'),
  nuraghe: '<path d="M0 100Q22 92 44 100Z" fill-opacity=".6"/><path d="M26 100L34 40H66L74 100Z"/><rect x="31.5" y="35" width="37" height="5.5"/>'
    + DET('<path d="M45.5 100V84Q50 78 54.5 84V100Z"/><rect x="31" y="54" width="38" height="1.6"/><rect x="29.4" y="70" width="41.2" height="1.6"/>'),
  castillo: '<rect x="22" y="50" width="56" height="50"/><rect x="14" y="36" width="14" height="64"/><rect x="72" y="36" width="14" height="64"/><path d="M12.5 37L21 22L29.5 37Z"/><path d="M70.5 37L79 22L87.5 37Z"/>'
    + [22, 31, 40, 49, 58, 67].map(x => `<rect x="${x}" y="46" width="4" height="5"/>`).join('')
    + DET('<path d="M44 100V84Q50 76 56 84V100Z"/><rect x="18.5" y="48" width="5" height="8" rx="2.5"/><rect x="76.5" y="48" width="5" height="8" rx="2.5"/>'),
  puente: MAR + '<path d="M6 100V94Q50 -14 94 94V100H87V95Q50 -3 13 95V100Z"/><rect x="0" y="60" width="100" height="5"/>'
    + [[30.6, 50.5], [40.4, 42.6], [49.2, 40], [58, 42.6], [67.8, 50.5]].map(([x, y]) => `<rect x="${x}" y="${y}" width="1.6" height="${f2(60 - y)}"/>`).join(''),
  atirantado: MAR + '<rect x="0" y="66" width="100" height="4"/><path d="M25.5 100V18H30.5V100Z"/><path d="M69.5 100V18H74.5V100Z"/><g stroke="#FFFFFF" stroke-width="1.1" fill="none"><path d="M28 22L3 66M28 22L11 66M28 22L19 66M28 22L37 66M28 22L45 66M28 22L50 66M72 22L50 66M72 22L55 66M72 22L63 66M72 22L81 66M72 22L89 66M72 22L97 66"/></g>',
  barco: MAR + '<path d="M5 74H95L86 91H14Z"/><rect x="16" y="58" width="11" height="16"/><rect x="29" y="64" width="12" height="10" fill="#F2994A"/><rect x="43" y="64" width="12" height="10" fill="#56CCF2"/><rect x="57" y="64" width="12" height="10" fill="#F2994A"/><rect x="74" y="50" width="12" height="24"/><rect x="78" y="42" width="4" height="8"/>',
  mano: '<path d="M0 100Q50 91 100 100Z" fill-opacity=".6"/><path d="M16 99Q14 72 19 56Q23 51 26 57L28 97Z"/><path d="M33 98Q31 61 35 42Q39 37 42 43L42 97Z"/><path d="M49 97Q49 56 53 37Q57 32 60 38L58 97Z"/><path d="M65 97Q67 61 71 48Q75 43 78 49L72 97Z"/><path d="M77 99Q81 84 89 76Q94 75 92 81L86 99Z"/>',
  machu: '<path d="M22 100L38 44L49 26L58 36L67 58L100 100Z" fill-opacity=".85"/><path d="M0 100V86H30V80H46V74H58V100Z"/>'
    + DET('<rect x="4" y="90" width="22" height="1.4"/><rect x="32" y="84" width="12" height="1.4"/><rect x="48" y="78" width="8" height="1.4"/>'),
  antigua: '<path d="M18 100L50 36L82 100Z" fill-opacity=".45"/><path d="M12 100V66H88V100H63V87Q50 72 37 87V100Z"/><rect x="43" y="52" width="14" height="14"/><path d="M41 53L50 44L59 53Z"/><rect x="12" y="62" width="76" height="4"/>' + DET('<circle cx="50" cy="58" r="2.6"/>'),
  torre: '<rect x="36" y="95" width="28" height="5"/><rect x="41.5" y="32" width="17" height="64"/><rect x="39.5" y="28" width="21" height="4"/><path d="M41 28L50 6L59 28Z"/>'
    + DET('<circle cx="50" cy="42" r="4.4"/><rect x="47" y="58" width="6" height="10" rx="3"/><rect x="47" y="76" width="6" height="10" rx="3"/>'),
  rascacielos: '<rect x="8" y="56" width="15" height="44"/><rect x="25" y="32" width="16" height="68"/><rect x="43" y="12" width="14" height="88"/><rect x="59" y="40" width="15" height="60"/><rect x="76" y="60" width="16" height="40"/><rect x="49.2" y="4" width="1.6" height="9"/>',
};
const SEDE_MONUMENTO = {
  'Buenos Aires':'obelisco', 'Mar del Plata':'faro', 'Córdoba':'catedral', 'Rosario':'bandera', 'Mendoza':'montanas', 'Bariloche':'montanas',
  'La Paz':'montanas', 'Santa Cruz':'catedral', 'Cochabamba':'cristo', 'Sucre':'catedral',
  'Santiago':'montanas', 'Viña del Mar':'faro', 'Concepción':'puente', 'Antofagasta':'faro',
  'Bogotá':'monserrate', 'Medellín':'montanas', 'Cali':'cristo', 'Barranquilla':'atirantado',
  'San José':'volcan', 'Escazú':'montanas', 'Liberia':'volcan', 'Heredia':'catedral',
  'La Habana':'cupula', 'Varadero':'palmera', 'Santiago de Cuba':'garita', 'Cienfuegos':'cupula',
  'Quito':'mitad', 'Guayaquil':'faro', 'Cuenca':'catedral', 'Salinas':'palmera',
  'San Salvador':'volcan', 'Santa Ana':'catedral', 'La Libertad':'palmera', 'Sonsonate':'volcan',
  'Madrid':'alcala', 'Barcelona':'sagrada', 'Málaga':'faro', 'Valladolid':'catedral', 'Sevilla':'giralda', 'Zaragoza':'cupula',
  'Malabo':'volcan', 'Bata':'palmera', 'Mongomo':'catedral', 'Luba':'palmera',
  'Ciudad de Guatemala':'piramide', 'Antigua':'antigua', 'Quetzaltenango':'volcan', 'Escuintla':'volcan',
  'Tegucigalpa':'cristo', 'San Pedro Sula':'catedral', 'La Ceiba':'palmera', 'Comayagua':'catedral',
  'Acapulco':'palmera', 'Ciudad de México':'angel', 'Monterrey':'silla', 'Guadalajara':'catedral', 'Cancún':'piramide', 'Puebla':'catedral',
  'Managua':'volcan', 'León':'catedral', 'Granada':'catedral', 'Matagalpa':'montanas',
  'Ciudad de Panamá':'puente', 'David':'volcan', 'Boquete':'montanas', 'Colón':'barco',
  'Asunción':'cupula', 'Ciudad del Este':'puente', 'Encarnación':'palmera', 'Luque':'catedral',
  'Lima':'catedral', 'Cusco':'machu', 'Arequipa':'volcan', 'Trujillo':'catedral',
  'San Juan':'garita', 'Ponce':'catedral', 'Caguas':'montanas', 'Dorado':'palmera',
  'Santo Domingo':'catedral', 'Punta Cana':'palmera', 'La Vega':'catedral',
  'Montevideo':'salvo', 'Punta del Este':'mano', 'Salto':'catedral', 'Colonia':'faro',
  'Caracas':'montanas', 'Maracaibo':'atirantado', 'Valencia':'artes', 'Mérida':'montanas',
  'Vigo':'atirantado', 'Reus':'catedral', 'Getafe':'alcala', 'Alicante':'castillo', 'Bilbao':'guggenheim',
  'Coímbra':'torre', 'Módena':'torre', 'Rímini':'faro', 'Cascais':'faro', 'Tolosa':'cupula', 'Basilea':'catedral', 'Bratislava':'castillo', 'Zagreb':'catedral', 'Ostrava':'torre',
  'Roma':'coliseo', 'Milán':'duomo', 'Génova':'faro', 'Cerdeña':'nuraghe', 'París':'eiffel', 'Bruselas':'atomium', 'Rotterdam':'molino',
  'Copenhague':'casas', 'Gotemburgo':'casas', 'Oporto':'puente',
  'Doha':'mezquita', 'Dubái':'burj', 'Abu Dabi':'mezquita', 'Riad':'kingdom', 'Kuwait':'kuwait', 'Yakarta':'monas', 'Singapur':'marina', 'Bangkok':'wat', 'Manama':'vela', 'Mascate':'mezquita',
  'Miami':'palmera', 'Chicago':'willis', 'Nueva York':'libertad', 'Houston':'cohete', 'Los Ángeles':'palmera', 'San Diego':'palmera', 'Toronto':'cn', 'Austin':'cupula',
};
function monumentoDe(ev, pais){
  const c = ev && ev.ciudad;
  if(pais === 'DO' && c === 'Santiago') return 'obelisco';        // el Monumento a los Héroes
  if(pais === 'VE' && c === 'Valencia') return 'catedral';
  return SEDE_MONUMENTO[c] || 'rascacielos';
}
function monumentoSVG(ev, pais, x, y, k){
  return `<g transform="translate(${x} ${y}) scale(${k})" fill="#FFFFFF" stroke="#06121A" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke">${MONUMENTO[monumentoDe(ev, pais)]}</g>`;
}
let EMBLEMAS = 0;
const halo = id => `<radialGradient id="${id}" cx=".5" cy=".62" r=".5"><stop offset="0" stop-color="#06121A" stop-opacity=".5"/><stop offset="1" stop-color="#06121A" stop-opacity="0"/></radialGradient>`;
/* el cuadradito de la fila del calendario */
function emblemaSede(ev){
  const pais = paisSede(ev), n = ++EMBLEMAS;
  return `<span class="mini-emblema" title="${esc(ev.ciudad + (nombrePaisSede(pais) ? ', ' + nombrePaisSede(pais) : ''))}"><svg class="emblema" viewBox="0 0 100 100" aria-hidden="true">
    <defs><linearGradient id="emb${n}" x1="0" y1="0" x2="0" y2="1"><stop offset=".2" stop-color="#06121A" stop-opacity=".2"/><stop offset="1" stop-color="#06121A" stop-opacity=".62"/></linearGradient>${halo('emh' + n)}</defs>
    ${fondoBandera(pais, 100, 100)}<rect width="100" height="100" fill="url(#emb${n})"/><rect width="100" height="100" fill="url(#emh${n})"/>
    <rect y="93" width="100" height="7" style="fill:${colorCat(ev.t)}"/>
    ${monumentoSVG(ev, pais, 14, 21, .72)}
  </svg></span>`;
}
/* la cabecera del torneo: la bandera ondeando, el monumento de la ciudad y la sede */
function bannerMonumento(ev){
  const pais = paisSede(ev), np = nombrePaisSede(pais);
  return `<div class="banner-sede banner-mon" style="--cat:${colorCat(ev.t)}">
    <svg class="bandera" viewBox="0 0 360 144" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${fondoBandera(pais, 360, 144)}</svg><span class="banner-pliegues"></span>
    <svg class="banner-monumento" viewBox="0 0 100 100" aria-hidden="true"><defs>${halo('emh' + (++EMBLEMAS))}</defs><rect width="100" height="100" fill="url(#emh${EMBLEMAS})"/>${monumentoSVG(ev, pais, 0, 0, 1)}</svg>
    <span class="banner-lugar"><b>${esc(codCiudad(ev.ciudad, pais))}</b><span>${esc(ev.ciudad)}${np && np !== ev.ciudad ? ' · ' + esc(np) : ''}</span></span></div>`;
}
