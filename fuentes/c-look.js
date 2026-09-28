
/* ═══════════════════════════════════════════════════════════════
   COMO EN LA TELE
   En la pista: jugadores con cuerpo y gestos, luces de pabellón, tres escenarios
   (pabellón, exterior y club), público con banderas, videomarcador y marcador de
   televisión. En los menús: iconos propios, colores por categoría, una postal para
   cada ciudad, portada, carta de jugador, cuadro en llaves, gráficos de carrera y
   animaciones.
   ═══════════════════════════════════════════════════════════════ */

/* ── Iconos propios ── */
const ICO = {
  atras: '<path d="M15 5l-7 7 7 7"/>',
  luna: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  trofeo: '<path d="M7 4h10v3a5 5 0 0 1-10 0z"/><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M12 12v4M9 20h6M10 16h4v4h-4z"/>',
  pala: '<ellipse cx="10" cy="9" rx="6" ry="7"/><path d="M14.2 14.2l6 6"/><circle cx="8" cy="7" r=".7"/><circle cx="11.5" cy="7.5" r=".7"/><circle cx="8.5" cy="10.5" r=".7"/><circle cx="11.5" cy="11" r=".7"/>',
  pelota: '<circle cx="12" cy="12" r="8"/><path d="M5.6 7.2c2.9 2.2 2.9 7.4 0 9.6M18.4 7.2c-2.9 2.2-2.9 7.4 0 9.6"/>',
  calendario: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  ranking: '<path d="M4 20v-7h5v7M9.5 20V8h5v12M15 20v-9h5v9"/>',
  dinero: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9v6M17.5 9v6"/>',
  diana: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2"/>',
  mando: '<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".9"/><circle cx="17.5" cy="13.5" r=".9"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  grafico: '<path d="M4 20h16M6 16l4-5 3 3 5-7"/>',
  llaves: '<path d="M3 5h5v4H3zM3 15h5v4H3zM8 7h3v10H8M11 12h3M14 10h7v4h-7z"/>',
  estrella: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  carrito: '<path d="M3 4h2l2.2 10.5h10.3L20 7H6.3"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  jugar: '<path d="M8 5l11 7-11 7z"/>',
  rayo: '<path d="M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6z"/>',
  ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  camino: '<path d="M12 21.5V14M12 14L6.5 8.5M12 14l5.5-5.5M6.5 8.5V3.5M17.5 8.5V3.5"/><circle cx="6.5" cy="3.5" r=".6"/><circle cx="17.5" cy="3.5" r=".6"/>',
  escudo: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.1-7.5 9.5-4.3-1.4-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  mente: '<path d="M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 7 17.5a3 3 0 0 0 5 1.5V6a2.6 2.6 0 0 0-2.5-1.5zM14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2 3 3 0 0 1-2.5 4.8 3 3 0 0 1-5 1.5"/>',
  avanzar: '<path d="M4 6.5l7.5 5.5L4 17.5zM12.5 6.5L20 12l-7.5 5.5z"/>',
  pluma: '<path d="M20 4c-7.5 0-12.5 4.5-13.8 12.3L4.5 20M6.3 16.3c5-.2 9-3.2 10.2-8M9.2 12.2h5.3"/>',
  globo: '<path d="M3.5 19c2.5-9 14.5-10.5 17-1.5"/><circle cx="17.5" cy="6.5" r="2.2"/>',
  pared: '<path d="M4.5 20V4M4.5 8h6M4.5 13h6M4.5 18h6M15 6.5l5 5.5-5 5.5"/>',
  carpeta: '<path d="M3 8a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  guardar: '<path d="M5 4h10.5L20 8.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v5h7M8 20v-5.5h8V20"/>',
  copiar: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M16 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5"/>',
  mas: '<path d="M12 5.5v13M5.5 12h13"/>',
  lapiz: '<path d="M4.5 19.5l1-4.2L15.8 5l3.2 3.2L8.7 18.5z"/><path d="M14 6.8l3.2 3.2"/>',
  papelera: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7"/><path d="M10.5 11v5M13.5 11v5"/>',
  techo: '<path d="M3 11c0-3.3 4-5.5 9-5.5s9 2.2 9 5.5v8H3z"/><path d="M3 13.5h18M8.5 19v-3h7v3"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  montana: '<path d="M2.5 19l6.5-11 4 6 2.5-3.5 6 8.5z"/><path d="M7.3 10.9l1.7 1.2 1.6-1.3"/>',
};
const ICO_RELLENO = ['estrella', 'jugar', 'avanzar'];
function ico(n){ return `<svg class="ico${ICO_RELLENO.includes(n) ? ' relleno' : ''}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICO[n] || ''}</svg>`; }
const COLOR_CAT = { FIP1:'var(--cat-fip)', FIP2:'var(--cat-fip)', FIP3:'var(--cat-star)', FIP4:'var(--cat-star)', FIP5:'var(--cat-star)', P2:'var(--cat-plat)', P1:'var(--cat-p1)', MJ:'var(--cat-major)', FIN:'var(--cat-major)', MUN:'var(--cat-major)' };
function colorCat(t){ return COLOR_CAT[t] || 'var(--accent)'; }
function iconoCat(t){ return t === 'MJ' || t === 'FIN' ? 'trofeo' : ['P2','P1'].includes(t) ? 'estrella' : 'pelota'; }
function apellido(n){ return String(n || '').trim().split(' ').slice(-1)[0].toUpperCase(); }
function nombreEquipo(a, b){ return `${apellido(a)} / ${apellido(b)}`; }
function hexRGB(h){ const m = String(h).replace('#', ''), n = parseInt(m.length === 3 ? m.split('').map(x => x + x).join('') : m, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function aclarar(h, k){ const [r, g, b] = hexRGB(h); return `rgb(${Math.round(r + (255 - r)*k)},${Math.round(g + (255 - g)*k)},${Math.round(b + (255 - b)*k)})`; }
function oscurecer(h, k){ const [r, g, b] = hexRGB(h); return `rgb(${Math.round(r*(1 - k))},${Math.round(g*(1 - k))},${Math.round(b*(1 - k))})`; }

/* ── La sede de cada torneo: la bandera del país, el código de la ciudad y el color de la categoría ── */
const franjasH = cols => cols.map((c, i) => `<rect y="${(20*i/cols.length).toFixed(3)}" width="30" height="${(20/cols.length + .05).toFixed(3)}" fill="${c}"/>`).join('');
const franjasV = cols => cols.map((c, i) => `<rect x="${(30*i/cols.length).toFixed(3)}" width="${(30/cols.length + .05).toFixed(3)}" height="20" fill="${c}"/>`).join('');
function estrellaSVG(cx, cy, r, col){
  let d = '';
  for(let k = 0; k < 10; k++){ const a = -Math.PI/2 + k*Math.PI/5, rr = k % 2 ? r*.42 : r; d += (k ? 'L' : 'M') + (cx + Math.cos(a)*rr).toFixed(2) + ' ' + (cy + Math.sin(a)*rr).toFixed(2); }
  return `<path d="${d}Z" fill="${col}"/>`;
}
function solSVG(cx, cy, r){
  let rayos = '';
  for(let k = 0; k < 16; k++){ const a = k*Math.PI/8; rayos += `M${(cx + Math.cos(a)*r*1.1).toFixed(2)} ${(cy + Math.sin(a)*r*1.1).toFixed(2)}L${(cx + Math.cos(a)*r*1.75).toFixed(2)} ${(cy + Math.sin(a)*r*1.75).toFixed(2)}`; }
  return `<path d="${rayos}" stroke="#F6B40E" stroke-width=".6"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#F6B40E"/>`;
}
function sierraSVG(x, n, col){
  let d = `M0 0H${x}`;
  for(let k = 0; k < n; k++) d += `L${x + 3} ${(20*(k + .5)/n).toFixed(2)}L${x} ${(20*(k + 1)/n).toFixed(2)}`;
  return `<path d="${d}H0Z" fill="${col}"/>`;
}
const BANDERAS_SVG = {
  AR: () => franjasH(['#74ACDF','#FFFFFF','#74ACDF']) + solSVG(15, 10, 1.7),
  BO: () => franjasH(['#D52B1E','#F9E300','#007934']),
  CL: () => `<rect width="30" height="20" fill="#D52B1E"/><rect width="30" height="10" fill="#FFFFFF"/><rect width="10" height="10" fill="#0039A6"/>` + estrellaSVG(5, 5, 2.6, '#FFFFFF'),
  CO: () => `<rect width="30" height="20" fill="#CE1126"/><rect width="30" height="15" fill="#003893"/><rect width="30" height="10" fill="#FCD116"/>`,
  CR: () => franjasH(['#002B7F','#FFFFFF','#CE1126','#CE1126','#FFFFFF','#002B7F']),
  CU: () => franjasH(['#002A8F','#FFFFFF','#002A8F','#FFFFFF','#002A8F']) + `<path d="M0 0L14 10L0 20Z" fill="#CF142B"/>` + estrellaSVG(4.7, 10, 2.6, '#FFFFFF'),
  EC: () => `<rect width="30" height="20" fill="#ED1C24"/><rect width="30" height="15" fill="#034EA2"/><rect width="30" height="10" fill="#FFD100"/><ellipse cx="15" cy="10" rx="2.2" ry="2.8" fill="#6B8E3D" stroke="#8C6A3B" stroke-width=".6"/>`,
  SV: () => franjasH(['#0F47AF','#FFFFFF','#0F47AF']) + `<circle cx="15" cy="10" r="2" fill="none" stroke="#D4A937" stroke-width=".7"/>`,
  ES: () => `<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/><rect x="6.5" y="7.2" width="4" height="5.2" rx="1.2" fill="#AA151B" stroke="#C8A24A" stroke-width=".5"/>`,
  GQ: () => franjasH(['#3E9A00','#FFFFFF','#E32118']) + `<path d="M0 0L7.5 10L0 20Z" fill="#0073CE"/>`,
  GT: () => franjasV(['#4997D0','#FFFFFF','#4997D0']) + `<circle cx="15" cy="10" r="2.4" fill="none" stroke="#6C9A3A" stroke-width=".8"/>`,
  HN: () => franjasH(['#0073CF','#FFFFFF','#0073CF']) + [[15,10],[11.5,8.6],[11.5,11.4],[18.5,8.6],[18.5,11.4]].map(([x, y]) => estrellaSVG(x, y, 1, '#0073CF')).join(''),
  MX: () => franjasV(['#006847','#FFFFFF','#CE1126']) + `<circle cx="15" cy="10" r="2.3" fill="#8C5A2B"/><path d="M12.8 11.2q2.2 2.4 4.4 0" stroke="#006847" stroke-width=".7" fill="none"/>`,
  NI: () => franjasH(['#0067C6','#FFFFFF','#0067C6']) + `<path d="M15 8.2L17 11.6H13Z" fill="none" stroke="#C8A24A" stroke-width=".6"/>`,
  PA: () => `<rect width="30" height="20" fill="#FFFFFF"/><rect x="15" width="15" height="10" fill="#D21034"/><rect y="10" width="15" height="10" fill="#005293"/>` + estrellaSVG(7.5, 5, 2.2, '#005293') + estrellaSVG(22.5, 15, 2.2, '#D21034'),
  PY: () => franjasH(['#D52B1E','#FFFFFF','#0038A8']) + `<circle cx="15" cy="10" r="1.9" fill="#FFFFFF" stroke="#E0B000" stroke-width=".6"/>`,
  PE: () => franjasV(['#D91023','#FFFFFF','#D91023']),
  PR: () => franjasH(['#ED0000','#FFFFFF','#ED0000','#FFFFFF','#ED0000']) + `<path d="M0 0L14 10L0 20Z" fill="#0050F0"/>` + estrellaSVG(4.7, 10, 2.6, '#FFFFFF'),
  DO: () => `<rect width="30" height="20" fill="#FFFFFF"/><rect width="13" height="8" fill="#002D62"/><rect x="17" width="13" height="8" fill="#CE1126"/><rect y="12" width="13" height="8" fill="#CE1126"/><rect x="17" y="12" width="13" height="8" fill="#002D62"/><circle cx="15" cy="10" r="1.3" fill="#1B7A3C"/>`,
  UY: () => franjasH(['#FFFFFF','#0038A8','#FFFFFF','#0038A8','#FFFFFF','#0038A8','#FFFFFF','#0038A8','#FFFFFF']) + `<rect width="11" height="11.2" fill="#FFFFFF"/>` + solSVG(5.5, 5.6, 1.9),
  VE: () => franjasH(['#FFCC00','#00247D','#CF142B']) + [...Array(8)].map((_, k) => { const a = Math.PI*(1.15 + k*.1); return estrellaSVG(15 + Math.cos(a)*5, 12.4 + Math.sin(a)*5, .6, '#FFFFFF'); }).join(''),
  AE: () => franjasH(['#00732F','#FFFFFF','#000000']) + `<rect width="8" height="20" fill="#FF0000"/>`,
  BE: () => franjasV(['#000000','#FDDA24','#EF3340']),
  IT: () => franjasV(['#009246','#FFFFFF','#CE2B37']),
  US: () => [...Array(13)].map((_, k) => `<rect y="${(k*20/13).toFixed(2)}" width="30" height="${(20/13 + .05).toFixed(2)}" fill="${k % 2 ? '#FFFFFF' : '#B22234'}"/>`).join('')
            + `<rect width="12" height="10.77" fill="#3C3B6E"/>` + [...Array(12)].map((_, k) => `<circle cx="${(1.6 + (k % 4)*2.9).toFixed(1)}" cy="${(1.8 + Math.floor(k/4)*3.4).toFixed(1)}" r=".55" fill="#FFFFFF"/>`).join(''),
  CA: () => `<rect width="30" height="20" fill="#FFFFFF"/><rect width="7.5" height="20" fill="#D52B1E"/><rect x="22.5" width="7.5" height="20" fill="#D52B1E"/><path d="M15 4.5L16 6.6L17.4 6.1L17 9.2L18.6 7.9L19.2 9L20.5 8.8L19.8 11.2L20.6 11.6L17.2 14L17.5 15.2L15.3 14.9V17H14.7V14.9L12.5 15.2L12.8 14L9.4 11.6L10.2 11.2L9.5 8.8L10.8 9L11.4 7.9L13 9.2L12.6 6.1L14 6.6Z" fill="#D52B1E"/>`,
  DK: () => `<rect width="30" height="20" fill="#C8102E"/><rect x="9" width="3" height="20" fill="#FFFFFF"/><rect y="8.5" width="30" height="3" fill="#FFFFFF"/>`,
  QA: () => `<rect width="30" height="20" fill="#8A1538"/>` + sierraSVG(8, 9, '#FFFFFF'),
  SE: () => `<rect width="30" height="20" fill="#006AA7"/><rect x="9" width="3.4" height="20" fill="#FECC02"/><rect y="8.3" width="30" height="3.4" fill="#FECC02"/>`,
  KW: () => franjasH(['#007A3D','#FFFFFF','#CE1126']) + `<path d="M0 0L7 6.67V13.33L0 20Z" fill="#000000"/>`,
  PT: () => `<rect width="30" height="20" fill="#FF0000"/><rect width="12" height="20" fill="#006600"/><circle cx="12" cy="10" r="3.3" fill="none" stroke="#FFE000" stroke-width="1"/><rect x="10.6" y="8.3" width="2.8" height="3.4" rx=".8" fill="#FFFFFF" stroke="#FF0000" stroke-width=".5"/>`,
  FR: () => franjasV(['#0055A4','#FFFFFF','#EF4135']),
  SA: () => `<rect width="30" height="20" fill="#006C35"/><path d="M8 8.6q1.5-2 3 0t3 0t3 0t3 0t3 0" stroke="#FFFFFF" stroke-width=".9" fill="none"/><path d="M8.5 13.6H21.5l1.2-.8" stroke="#FFFFFF" stroke-width=".8" fill="none"/>`,
  NL: () => franjasH(['#AE1C28','#FFFFFF','#21468B']),
  SG: () => franjasH(['#EF3340','#FFFFFF']) + `<circle cx="6" cy="5" r="3" fill="#FFFFFF"/><circle cx="7.2" cy="5" r="2.8" fill="#EF3340"/>` + [[9.6,3.2],[11.4,4.4],[10.8,6.4],[8.5,6.4],[7.9,4.4]].map(([x, y]) => estrellaSVG(x, y, .55, '#FFFFFF')).join(''),
  ID: () => franjasH(['#FF0000','#FFFFFF']),
  CH: () => `<rect width="30" height="20" fill="#DA291C"/><rect x="13" y="4" width="4" height="12" fill="#FFFFFF"/><rect x="9" y="8" width="12" height="4" fill="#FFFFFF"/>`,
  SK: () => franjasH(['#FFFFFF','#0B4EA2','#EE1C25']) + `<path d="M7 5.5H14V11.5Q14 15 10.5 16.5Q7 15 7 11.5Z" fill="#EE1C25" stroke="#FFFFFF" stroke-width=".6"/><path d="M10.5 7V14M8.8 8.8H12.2M8.3 10.8H12.7" stroke="#FFFFFF" stroke-width=".7"/><path d="M7.3 13.2Q9 11.8 10.5 13Q12 11.8 13.7 13.2L13.2 14.3Q10.5 16.4 7.8 14.3Z" fill="#0B4EA2"/>`,
  HR: () => franjasH(['#FF0000','#FFFFFF','#171796']) + `<rect x="12.6" y="6" width="4.8" height="6" fill="#FFFFFF" stroke="#171796" stroke-width=".4"/>`
            + [...Array(12)].map((_, k) => (Math.floor(k/3) + k % 3) % 2 ? '' : `<rect x="${(12.6 + (k % 3)*1.6).toFixed(1)}" y="${(6 + Math.floor(k/3)*1.5).toFixed(1)}" width="1.6" height="1.5" fill="#FF0000"/>`).join(''),
  CZ: () => `<rect width="30" height="20" fill="#D7141A"/><rect width="30" height="10" fill="#FFFFFF"/><path d="M0 0L15 10L0 20Z" fill="#11457E"/>`,
  TH: () => franjasH(['#A51931','#F4F5F8','#2D2A4A','#2D2A4A','#F4F5F8','#A51931']),
  BH: () => `<rect width="30" height="20" fill="#CE1126"/>` + sierraSVG(7.5, 5, '#FFFFFF'),
  OM: () => `<rect width="30" height="20" fill="#DB161B"/><rect x="8" width="22" height="6.67" fill="#FFFFFF"/><rect x="8" y="13.33" width="22" height="6.67" fill="#008000"/><path d="M2.5 2.5L5.5 5.5M5.5 2.5L2.5 5.5M4 2V6" stroke="#FFFFFF" stroke-width=".7"/>`,
};
const PAISES_SEDE = { AE:'Emiratos Árabes', BE:'Bélgica', IT:'Italia', US:'Estados Unidos', CA:'Canadá', DK:'Dinamarca', QA:'Catar', SE:'Suecia', KW:'Kuwait', PT:'Portugal',
                      FR:'Francia', SA:'Arabia Saudí', NL:'Países Bajos', SG:'Singapur', ID:'Indonesia', CH:'Suiza', SK:'Eslovaquia', HR:'Croacia', CZ:'Chequia', TH:'Tailandia', BH:'Baréin', OM:'Omán' };
const CIUDAD_PAIS = {
  'Abu Dabi':'AE', 'Dubái':'AE', 'Doha':'QA', 'Riad':'SA', 'Kuwait':'KW', 'Yakarta':'ID', 'Singapur':'SG', 'Bangkok':'TH', 'Manama':'BH', 'Mascate':'OM',
  'Acapulco':'MX', 'Cancún':'MX', 'Monterrey':'MX', 'Guadalajara':'MX', 'Ciudad de México':'MX',
  'Alicante':'ES', 'Barcelona':'ES', 'Bilbao':'ES', 'Getafe':'ES', 'Madrid':'ES', 'Málaga':'ES', 'Sevilla':'ES', 'Valencia':'ES', 'Vigo':'ES', 'Reus':'ES',
  'Bruselas':'BE', 'Cerdeña':'IT', 'Génova':'IT', 'Milán':'IT', 'Roma':'IT', 'Módena':'IT', 'Rímini':'IT', 'París':'FR', 'Tolosa':'FR', 'Rotterdam':'NL',
  'Copenhague':'DK', 'Gotemburgo':'SE', 'Oporto':'PT', 'Coímbra':'PT', 'Cascais':'PT', 'Basilea':'CH', 'Bratislava':'SK', 'Zagreb':'HR', 'Ostrava':'CZ',
  'Chicago':'US', 'Miami':'US', 'Nueva York':'US', 'Houston':'US', 'Los Ángeles':'US', 'San Diego':'US', 'Austin':'US', 'Toronto':'CA',
  'Buenos Aires':'AR', 'Mar del Plata':'AR', 'Córdoba':'AR', 'Rosario':'AR', 'Santiago':'CL', 'Lima':'PE', 'Asunción':'PY', 'Montevideo':'UY', 'Quito':'EC', 'Guayaquil':'EC',
  'San José':'CR', 'Ciudad de Panamá':'PA', 'Santo Domingo':'DO', 'San Juan':'PR', 'Ciudad de Guatemala':'GT',
};
const COD_CIUDAD = {
  'Abu Dabi':'AUH', 'Dubái':'DXB', 'Doha':'DOH', 'Riad':'RUH', 'Kuwait':'KWI', 'Yakarta':'JKT', 'Singapur':'SIN', 'Bangkok':'BKK', 'Manama':'BAH', 'Mascate':'MCT',
  'Acapulco':'ACA', 'Cancún':'CUN', 'Monterrey':'MTY', 'Guadalajara':'GDL', 'Ciudad de México':'CDMX', 'Puebla':'PBC',
  'Alicante':'ALC', 'Barcelona':'BCN', 'Bilbao':'BIO', 'Getafe':'GTF', 'Madrid':'MAD', 'Málaga':'AGP', 'Sevilla':'SVQ', 'Valencia':'VLC', 'Vigo':'VGO', 'Reus':'REU', 'Valladolid':'VLL', 'Zaragoza':'ZAZ',
  'Bruselas':'BRU', 'Cerdeña':'CAG', 'Génova':'GOA', 'Milán':'MIL', 'Roma':'ROM', 'Módena':'MOD', 'Rímini':'RMI', 'París':'PAR', 'Tolosa':'TLS', 'Rotterdam':'RTM',
  'Copenhague':'CPH', 'Gotemburgo':'GOT', 'Oporto':'OPO', 'Coímbra':'COI', 'Cascais':'CAS', 'Basilea':'BSL', 'Bratislava':'BTS', 'Zagreb':'ZAG', 'Ostrava':'OSR',
  'Chicago':'CHI', 'Miami':'MIA', 'Nueva York':'NYC', 'Houston':'HOU', 'Los Ángeles':'LAX', 'San Diego':'SAN', 'Austin':'AUS', 'Toronto':'YTO',
  'Buenos Aires':'BUE', 'Mar del Plata':'MDQ', 'Córdoba':'COR', 'Rosario':'ROS', 'Mendoza':'MDZ', 'Bariloche':'BRC', 'Santiago':'SCL', 'Lima':'LIM', 'Asunción':'ASU',
  'Montevideo':'MVD', 'Quito':'UIO', 'Guayaquil':'GYE', 'San José':'SJO', 'Ciudad de Panamá':'PTY', 'Santo Domingo':'SDQ', 'San Juan':'SJU', 'Ciudad de Guatemala':'GUA',
  'La Paz':'LPB', 'Santa Cruz':'VVI', 'Bogotá':'BOG', 'Medellín':'MDE', 'Cali':'CLO', 'Barranquilla':'BAQ', 'La Habana':'HAV', 'San Salvador':'SAL', 'Tegucigalpa':'TGU',
  'San Pedro Sula':'SAP', 'Managua':'MGA', 'Caracas':'CCS', 'Maracaibo':'MAR', 'Punta del Este':'PDP', 'Punta Cana':'PUJ', 'Cusco':'CUZ', 'Arequipa':'AQP', 'Malabo':'SSG',
  'DO|Santiago':'STI', 'VE|Valencia':'VLN',
};
function paisSede(ev){
  if(!ev) return null;
  if(ev.pais) return ev.pais;
  if(CIUDAD_PAIS[ev.ciudad]) return CIUDAD_PAIS[ev.ciudad];
  const p = PAISES.find(x => (x.ciudades || []).some(c => c.n === ev.ciudad));
  return p ? p.id : null;
}
function nombrePaisSede(id){ const p = PAISES.find(x => x.id === id); return p ? p.nom : PAISES_SEDE[id] || ''; }
function codCiudad(c, pais){
  if(COD_CIUDAD[pais + '|' + c]) return COD_CIUDAD[pais + '|' + c];
  if(COD_CIUDAD[c]) return COD_CIUDAD[c];
  return String(c || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || '—';
}
function banderaSVG(p){
  const f = BANDERAS_SVG[p];
  return `<svg class="bandera" viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${f ? f() : '<rect width="30" height="20" fill="#1C4A52"/>'}</svg>`;
}
/* la ficha de cada torneo en el calendario */
function fichaSede(ev){
  const p = paisSede(ev);
  return `<span class="ficha-sede" style="--cat:${colorCat(ev.t)}" title="${esc(ev.ciudad + (nombrePaisSede(p) ? ', ' + nombrePaisSede(p) : ''))}">${banderaSVG(p)}<b>${esc(codCiudad(ev.ciudad, p))}</b><i>${ico(iconoCat(ev.t))}</i></span>`;
}
/* la cabecera del torneo: la bandera ondeando, el emblema de la categoría y la sede */
function bannerSede(ev){
  const p = paisSede(ev), np = nombrePaisSede(p);
  return `<div class="banner-sede" style="--cat:${colorCat(ev.t)}">${banderaSVG(p)}<span class="banner-pliegues"></span>
    <span class="banner-emblema">${ico(iconoCat(ev.t))}</span>
    <span class="banner-lugar"><b>${esc(codCiudad(ev.ciudad, p))}</b><span>${esc(ev.ciudad)}${np && np !== ev.ciudad ? ' · ' + esc(np) : ''}</span></span></div>`;
}

/* ── Escenarios: pabellón (Premier y FIP grandes), exterior y club de barrio ── */
function escenaDe(ev){
  if(!ev) return { tipo:'pabellon', gente:.8, ciudad:'' };
  const grande = ['P2','P1','MJ','FIN','MUN'].includes(ev.t), media = ['FIP3','FIP4','FIP5'].includes(ev.t);
  const tipo = ev.pista === 'exterior' || ev.pista === 'altura' ? 'exterior' : grande || media ? 'pabellon' : 'club';
  return { tipo, gente: grande ? 1 : media ? .55 : .3, ciudad: ev.ciudad || '' };
}
const CESPED = { pabellon:'#2A64B8', exterior:'#2E8A5E', club:'#2B7896' };
let DECOR = { publico:[] };
function dibujarDecorado(c){
  const w = innerWidth, h = innerHeight, tv = VISTA === 'tv', es = (P && P.escena) || { tipo:'pabellon', gente:.8, ciudad:'' }, tipo = es.tipo;
  DECOR = { publico:[] };
  if(tipo === 'exterior') cieloExterior(c, w, h, tv);
  else if(tipo === 'club') fondoClub(c, w, h, tv, es.ciudad);
  else fondoPabellon(c, w, h);
  if(tv){
    gradas(c, es);
    if(tipo !== 'club'){
      poli(c, [[-.5,-.05,ALT_FONDO+.12],[W+.5,-.05,ALT_FONDO+.12],[W+.5,-.05,ALT_FONDO+.9],[-.5,-.05,ALT_FONDO+.9]]);
      c.fillStyle = '#0D2C52'; c.fill(); c.strokeStyle = 'rgba(127,211,247,.5)'; c.lineWidth = 1; c.stroke();
      const q = proy(W/2, -.05, ALT_FONDO + .5);
      c.fillStyle = '#DCF54A'; c.font = `900 ${Math.max(9, q[2]*.44)}px Inter, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('LA CABRA · PÁDEL TOUR', q[0], q[1]); c.textBaseline = 'alphabetic';
    }
  }
  /* el suelo de alrededor y el césped, con sus franjas */
  poli(c, [[-1.3,-.4,0],[W+1.3,-.4,0],[W+1.3,L+1.2,0],[-1.3,L+1.2,0]]); c.fillStyle = tipo === 'exterior' ? '#8A949A' : tipo === 'club' ? '#23262F' : '#10335E'; c.fill();
  poli(c, [[0,0,0],[W,0,0],[W,L,0],[0,L,0]]); c.fillStyle = CESPED[tipo]; c.fill();
  for(let k = 0; k < L; k += 2){ poli(c, [[0,k,0],[W,k,0],[W,k+1,0],[0,k+1,0]]); c.fillStyle = 'rgba(255,255,255,.035)'; c.fill(); }
  c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = Math.max(1.4, proy(W/2, RED_Y, 0)[2]*.055);
  lineaP(c, [0, RED_Y - LINEA_SAQUE, 0], [W, RED_Y - LINEA_SAQUE, 0]); lineaP(c, [0, RED_Y + LINEA_SAQUE, 0], [W, RED_Y + LINEA_SAQUE, 0]);
  lineaP(c, [W/2, RED_Y - LINEA_SAQUE, 0], [W/2, RED_Y + LINEA_SAQUE, 0]);
  lucesPista(c, tipo);
  if(!tv){
    const m = .7;
    c.fillStyle = 'rgba(127,211,247,.10)';
    c.fillRect(OX - m*ESC, OY - m*ESC, (W + m*2)*ESC, m*ESC); c.fillRect(OX - m*ESC, OY + L*ESC, (W + m*2)*ESC, m*ESC);
    c.fillRect(OX - m*ESC, OY, m*ESC, L*ESC); c.fillRect(OX + W*ESC, OY, m*ESC, L*ESC);
    c.fillStyle = 'rgba(200,210,220,.18)';
    for(const x0 of [OX - m*ESC, OX + W*ESC]) for(let y = REJA_Y0; y < REJA_Y1; y += .5) c.fillRect(x0, OY + y*ESC, m*ESC, .2*ESC);
    c.strokeStyle = 'rgba(170,225,255,.6)'; c.lineWidth = Math.max(2.5, ESC*.12); c.strokeRect(OX, OY, W*ESC, L*ESC);
    return;
  }
  dibujarPared(c, [0,0], [W,0], 0, PARED, 'cristal'); dibujarPared(c, [0,0], [W,0], PARED, ALT_FONDO, 'reja');
  for(const x of [0, W]){
    dibujarPared(c, [x,0], [x,REJA_Y0], 0, PARED, 'cristal');
    dibujarPared(c, [x,REJA_Y0], [x,REJA_Y1], 0, PARED, 'reja');
    dibujarPared(c, [x,REJA_Y1], [x,L], 0, PARED, 'cristal');
  }
  /* el foco en la pista: los bordes se van a negro (se nota en pantallas anchas) */
  const vg = c.createRadialGradient(w/2, h*.46, Math.min(w, h)*.34, w/2, h*.46, Math.max(w, h)*.6);
  vg.addColorStop(0, 'rgba(3,9,13,0)'); vg.addColorStop(1, 'rgba(3,9,13,.62)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
  /* debajo de la pista, más oscuro para que los botones se lean bien */
  const yC = proy(W/2, L + 1.2, 0)[1], gv = c.createLinearGradient(0, yC, 0, h);
  gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = gv; c.fillRect(0, yC, w, h - yC);
}
/* los focos iluminan el césped (en exterior, el sol) */
function lucesPista(c, tipo){
  c.save();
  poli(c, [[0,0,0],[W,0,0],[W,L,0],[0,L,0]]); c.clip();
  c.globalCompositeOperation = 'lighter';
  if(tipo === 'exterior'){
    const a = proy(W, 0, 0), b = proy(0, L, 0), g = c.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, 'rgba(255,240,200,.18)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = g; c.fillRect(0, 0, innerWidth, innerHeight);
  } else {
    for(const [x, y] of [[1.6,3.2],[W-1.6,3.2],[1.6,L-3.2],[W-1.6,L-3.2],[W/2,RED_Y]]){
      const q = proy(x, y, 0), r = q[2]*(tipo === 'club' ? 3.3 : 4.4), g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], r);
      g.addColorStop(0, `rgba(255,255,240,${tipo === 'club' ? .09 : .13})`); g.addColorStop(1, 'rgba(255,255,240,0)');
      c.fillStyle = g; c.fillRect(q[0] - r, q[1] - r, r*2, r*2);
    }
  }
  c.restore();
}
function fondoPabellon(c, w, h){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0B1A2C'); g.addColorStop(.6, '#07121D'); g.addColorStop(1, '#03080D');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for(let i = 0; i < 7; i++){
    const x = w*(.08 + i*.14), y = 14 + (i % 2)*6, gg = c.createRadialGradient(x, y, 1, x, y, 36);
    gg.addColorStop(0, 'rgba(255,255,245,.95)'); gg.addColorStop(.14, 'rgba(255,255,245,.35)'); gg.addColorStop(1, 'rgba(255,255,245,0)');
    c.fillStyle = gg; c.fillRect(x - 36, y - 36, 72, 72);
  }
  const f = c.createRadialGradient(w/2, h*.25, 10, w/2, h*.25, w*.95); f.addColorStop(0, 'rgba(255,255,255,.08)'); f.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = f; c.fillRect(0, 0, w, h);
}
function cieloExterior(c, w, h, tv){
  const g = c.createLinearGradient(0, 0, 0, h*.55); g.addColorStop(0, '#3C8BD9'); g.addColorStop(1, '#BFE3FA');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const sx = w*.84, sy = h*.07, sg = c.createRadialGradient(sx, sy, 4, sx, sy, w*.32);
  sg.addColorStop(0, 'rgba(255,250,215,1)'); sg.addColorStop(.1, 'rgba(255,240,180,.85)'); sg.addColorStop(1, 'rgba(255,240,180,0)');
  c.fillStyle = sg; c.fillRect(0, 0, w, h*.6);
  c.fillStyle = 'rgba(255,255,255,.78)';
  for(let i = 0; i < 5; i++){ const x = Math.random()*w, y = h*(.03 + Math.random()*.1), r = 9 + Math.random()*14; for(let k = 0; k < 4; k++){ c.beginPath(); c.arc(x + k*r*.8, y + (k % 2)*r*.2, r*(1 - k*.12), 0, Math.PI*2); c.fill(); } }
  const yh = tv ? proy(W/2, -7, 0)[1] : h*.08;
  /* lomas al fondo */
  c.fillStyle = 'rgba(116,146,176,.45)';
  c.beginPath(); c.moveTo(0, yh + 2);
  for(let x = 0; x <= w; x += w/7) c.lineTo(x, yh - 8 - Math.abs(Math.sin(x/w*3.4))*20);
  c.lineTo(w, yh + 2); c.closePath(); c.fill();
  c.fillStyle = '#6FA36B'; c.fillRect(0, yh, w, h - yh);
  /* el césped, cortado a bandas */
  let yb = yh, paso = 5;
  for(let k = 0; yb < h; k++){ if(k % 2){ c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(0, yb, w, paso); } yb += paso; paso *= 1.2; }
  c.fillStyle = '#2F6B3F';
  for(let x = -10; x < w + 20; x += 13 + Math.random()*10){ const r = 11 + Math.random()*14; c.beginPath(); c.arc(x, yh - r*.45, r, 0, Math.PI*2); c.fill(); }
  /* árboles a los lados: enmarcan la pista en pantallas anchas */
  if(w > 860) for(const [fx, alto] of [[.04, 150], [.135, 104], [.87, 116], [.96, 160]]) arbolFondo(c, w*fx, yh + alto*.16, alto);
}
function arbolFondo(c, x, y, alto){
  c.fillStyle = '#33241A'; c.fillRect(x - alto*.035, y - alto*.34, alto*.07, alto*.36);
  c.fillStyle = '#2C5E38';
  for(const [dx, dy, r] of [[0,-.62,.29],[-.2,-.46,.23],[.2,-.46,.23],[0,-.34,.25]]){ c.beginPath(); c.arc(x + dx*alto, y + dy*alto, r*alto, 0, Math.PI*2); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.07)';
  for(const [dx, dy, r] of [[-.1,-.68,.16],[.12,-.5,.12]]){ c.beginPath(); c.arc(x + dx*alto, y + dy*alto, r*alto, 0, Math.PI*2); c.fill(); }
}
function fondoClub(c, w, h, tv, ciudad){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2A2233'); g.addColorStop(1, '#141019');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  if(!tv) return;
  const y0 = proy(W/2, -2.5, 6.6)[1], y1 = proy(W/2, -.3, 0)[1];
  for(let y = y0, f = 0; y < y1; y += 9, f++) for(let x = (f % 2)*-10; x < w; x += 20){ c.fillStyle = Math.random() < .5 ? '#4A2F2A' : '#5A3A31'; c.fillRect(x + 1, y + 1, 18, 7); }
  const gp = c.createLinearGradient(0, y0, 0, y1); gp.addColorStop(0, 'rgba(6,10,16,.55)'); gp.addColorStop(1, 'rgba(6,10,16,0)');
  c.fillStyle = gp; c.fillRect(0, y0, w, y1 - y0);
  for(const fx of [.22, .78]){
    const x = w*fx, y = y0 + 5, gg = c.createRadialGradient(x, y, 2, x, y, 90);
    gg.addColorStop(0, 'rgba(235,245,255,.3)'); gg.addColorStop(1, 'rgba(235,245,255,0)');
    c.fillStyle = gg; c.fillRect(x - 90, y - 90, 180, 180);
    c.fillStyle = 'rgba(240,248,255,.95)'; c.fillRect(x - 32, y, 64, 4);
  }
  /* carteles en la pared: en pantallas anchas los lados no quedan vacíos */
  if(w > 860){
    const bw = Math.min(170, w*.12), bh = Math.max(46, (y1 - y0)*.52), yb = y0 + (y1 - y0)*.2;
    for(const bx of [w*.11, w*.89]){
      c.fillStyle = 'rgba(10,17,24,.88)'; c.fillRect(bx - bw/2, yb, bw, bh);
      c.fillStyle = '#DCF54A'; c.fillRect(bx - bw/2, yb, bw, Math.max(3, bh*.13));
      c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(bx - bw*.4, yb + bh*.34, bw*.8, Math.max(2, bh*.08));
      c.fillStyle = 'rgba(255,255,255,.11)'; c.fillRect(bx - bw*.4, yb + bh*.56, bw*.5, Math.max(2, bh*.07));
      c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1; c.strokeRect(bx - bw/2, yb, bw, bh);
    }
  }
  poli(c, [[1.2,-.05,ALT_FONDO+.15],[W-1.2,-.05,ALT_FONDO+.15],[W-1.2,-.05,ALT_FONDO+.9],[1.2,-.05,ALT_FONDO+.9]]);
  c.fillStyle = '#F4F0E6'; c.fill();
  const q = proy(W/2, -.05, ALT_FONDO + .52);
  c.fillStyle = '#1B3A5C'; c.font = `900 ${Math.max(8, q[2]*.36)}px Inter, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(('CLUB DE PÁDEL ' + (ciudad || '')).toUpperCase(), q[0], q[1]); c.textBaseline = 'alphabetic';
}
/* ── La grada: un tendido con escalones, pasillos, barandilla y gente distinta en
   cada asiento. En el club, una terraza asomada a la pista ── */
const CAMISETAS_PUBLICO = ['#E4572E','#2E86DE','#F5C542','#F4F6F8','#22D3A5','#C792EA','#FF8A7A','#1B2733','#DCF54A','#7FD3F7','#B5651D','#E8E1D3'];
const PIELES = ['#F1D2B3','#E6BF9A','#C99A74','#A9763F','#8D5A3B','#6B4227'];
const PELOS = ['#2B1B12','#151013','#4A3423','#6B4A2A','#8C6A4A','#D8C48A','#9A9A9A'];
const BANDERAS = [['#74ACDF','#FFFFFF','#74ACDF'],['#AA151B','#F1BF00','#AA151B'],['#009246','#FFFFFF','#CE2B37'],['#0055A4','#FFFFFF','#EF4135'],
                  ['#006847','#FFFFFF','#CE1126'],['#FFFFFF','#0038A8','#FFFFFF'],['#009C3B','#FFDF00','#009C3B'],['#D52B1E','#FFFFFF','#D52B1E']];
function crearPersona(x, y, tam, a){
  return { x, y, tam, a, col: pick(CAMISETAS_PUBLICO), piel: pick(PIELES), pelo: pick(PELOS), gorra: Math.random() < .22, f: Math.random()*6.3 };
}
/* una persona: hombros, cuello, cabeza y pelo (o gorra). Con los brazos arriba si festeja */
function personaGrada(c, p, salto, brazos){
  const t = p.tam, y = p.y - salto;
  if(p.tope != null){ c.save(); c.beginPath(); c.rect(0, 0, innerWidth, p.tope); c.clip(); }
  if(p.a != null && p.a < 1) c.globalAlpha = p.a;
  if(brazos){
    c.strokeStyle = p.piel; c.lineWidth = Math.max(1, t*.3); c.lineCap = 'round';
    c.beginPath(); c.moveTo(p.x - t*.68, y - t*.85); c.lineTo(p.x - t*1.1, y - t*2.15);
    c.moveTo(p.x + t*.68, y - t*.85); c.lineTo(p.x + t*1.1, y - t*2.15); c.stroke();
  }
  c.fillStyle = p.col;
  c.beginPath();
  c.moveTo(p.x - t, y + t*.12);
  c.quadraticCurveTo(p.x - t*.96, y - t*.9, p.x - t*.36, y - t*1.1);
  c.lineTo(p.x + t*.36, y - t*1.1);
  c.quadraticCurveTo(p.x + t*.96, y - t*.9, p.x + t, y + t*.12);
  c.closePath(); c.fill();
  c.fillStyle = p.piel;
  c.fillRect(p.x - t*.18, y - t*1.3, t*.36, t*.3);
  c.beginPath(); c.arc(p.x, y - t*1.6, t*.5, 0, Math.PI*2); c.fill();
  c.fillStyle = p.pelo;
  c.beginPath();
  if(p.gorra){ c.arc(p.x, y - t*1.66, t*.52, Math.PI, Math.PI*2); c.fill(); c.fillRect(p.x - t*.1, y - t*1.76, t*.86, Math.max(1, t*.13)); }
  else { c.arc(p.x, y - t*1.68, t*.5, Math.PI*.9, Math.PI*2.1); c.fill(); }
  c.globalAlpha = 1;
  if(p.tope != null) c.restore();
}
function bandera(c, x, y, ancho){
  const b = pick(BANDERAS), alto = ancho*.6, horiz = Math.random() < .5;
  c.strokeStyle = 'rgba(214,230,240,.8)'; c.lineWidth = Math.max(1, ancho*.07);
  c.beginPath(); c.moveTo(x, y + alto*2); c.lineTo(x, y); c.stroke();
  b.forEach((col, i) => { c.fillStyle = col; if(horiz) c.fillRect(x, y + i*alto/3, ancho, alto/3 + .5); else c.fillRect(x + i*ancho/3, y, ancho/3 + .5, alto); });
}
function gradas(c, es){
  const w = innerWidth, sF = proy(W/2, -3, 0)[2];
  const yBase = proy(W/2, -.3, ALT_FONDO + 1)[1], yTop = Math.max(-16, proy(W/2, -4.5, 8.6)[1]);
  if(yBase - yTop < 14) return;
  const px0 = proy(0, 0, 0)[0], px1 = proy(W, 0, 0)[0], ancho = px1 - px0;
  const tam = Math.max(2.8, Math.min(7.6, sF*.33));
  if(es.tipo === 'club') return terrazaClub(c, es, Math.max(0, px0 - ancho*.24), Math.min(w, px1 + ancho*.24), yBase, tam);
  const gx0 = es.tipo === 'pabellon' ? 0 : Math.max(0, px0 - ancho*.36);
  const gx1 = es.tipo === 'pabellon' ? w : Math.min(w, px1 + ancho*.36);
  tendido(c, es, gx0, gx1, yBase, yTop, tam);
}
function tendido(c, es, gx0, gx1, yBase, yTop, tam){
  const gw = gx1 - gx0, exterior = es.tipo === 'exterior';
  /* los escalones, de la primera fila hacia arriba */
  const filas = []; let y = yBase - tam*1.6, t = tam, paso = t*2.5;
  for(let f = 0; f < (exterior ? 4 : 40) && y - paso > yTop; f++){ filas.push({ y, t }); y -= paso; t *= .94; paso = t*2.5; }
  if(!filas.length) return;
  const yArriba = y;
  const gF = c.createLinearGradient(0, yArriba, 0, yBase);
  if(exterior){ gF.addColorStop(0, '#5F6870'); gF.addColorStop(1, '#8A949C'); }
  else { gF.addColorStop(0, '#07111B'); gF.addColorStop(1, '#122438'); }
  c.fillStyle = gF; c.fillRect(gx0, yArriba, gw, yBase - yArriba);
  const pasillos = [], nPas = Math.max(0, Math.round(gw/240));
  for(let k = 1; k <= nPas; k++) pasillos.push(gx0 + gw*k/(nPas + 1));
  /* de atrás hacia adelante: escalón, gente y el borde del escalón por delante */
  for(let f = filas.length - 1; f >= 0; f--){
    const fila = filas[f], prof = f/Math.max(1, filas.length - 1), tt = fila.t, alpha = 1 - prof*.34;
    c.fillStyle = exterior ? `rgba(24,30,34,${(.08 + prof*.2).toFixed(3)})` : `rgba(4,10,18,${(.14 + prof*.32).toFixed(3)})`;
    c.fillRect(gx0, fila.y - tt*2.2, gw, tt*2.2);
    const paso2 = tt*2.35;
    for(let x = gx0 + paso2*(.5 + (f % 2)*.35); x < gx1 - tt*.6; x += paso2){
      if(pasillos.some(px => Math.abs(x - px) < tt*1.7)) continue;               // el pasillo, libre
      if(Math.random() > es.gente*(1 - prof*.12)) continue;                      // asientos vacíos
      const p = crearPersona(x + rnd(-.25, .25)*tt, fila.y + tt*.3 + rnd(-.1, .1)*tt, tt*rnd(.9, 1.1), alpha);
      if(f <= 1 && DECOR.publico.length < 60 && Math.random() < .45) DECOR.publico.push(p); else personaGrada(c, p, 0, false);
      if(Math.random() < .03*es.gente) bandera(c, x + tt, fila.y - tt*3.6, tt*2.3);
    }
    c.fillStyle = exterior ? 'rgba(238,246,250,.45)' : 'rgba(150,190,220,.26)';
    c.fillRect(gx0, fila.y + tt*.1, gw, Math.max(1, tt*.2));
    c.fillStyle = 'rgba(0,0,0,.42)';
    c.fillRect(gx0, fila.y + tt*.3, gw, Math.max(1, tt*.42));
  }
  c.fillStyle = exterior ? 'rgba(32,38,42,.4)' : 'rgba(6,14,22,.55)';
  for(const px of pasillos) c.fillRect(px - tam*.85, yArriba, tam*1.7, yBase - yArriba);
  /* la valla de delante y la estructura */
  const yv = yBase - tam*1.6;
  if(exterior){
    c.fillStyle = '#98A2AA'; c.fillRect(gx0, yv, gw, tam*1.45);
    c.fillStyle = 'rgba(255,255,255,.32)'; c.fillRect(gx0, yv, gw, Math.max(1, tam*.2));
    c.fillStyle = 'rgba(12,18,22,.5)'; c.fillRect(gx0, yv + tam*1.45, gw, Math.max(1, tam*.5));
    c.fillStyle = '#4C555C';
    for(let x = gx0 + tam*2.5; x < gx1 - tam; x += tam*7) c.fillRect(x, yv + tam*1.8, Math.max(1.5, tam*.32), tam*2.6);
    c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(gx0, yv + tam*4.2, gw, tam*.8);
    c.fillStyle = '#5F6870'; c.fillRect(gx0 - tam*.55, yArriba, tam*.6, yBase - yArriba); c.fillRect(gx1 - tam*.05, yArriba, tam*.6, yBase - yArriba);
  } else {
    c.fillStyle = '#0A1826'; c.fillRect(gx0, yv, gw, tam*1.45);
    c.fillStyle = 'rgba(127,211,247,.28)'; c.fillRect(gx0, yv + tam*.5, gw, Math.max(1, tam*.24));
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(gx0, yv + tam*1.45, gw, Math.max(1, tam*.45));
  }
}
function terrazaClub(c, es, gx0, gx1, yBase, tam){
  const gw = gx1 - gx0, t = tam*1.12, yPar = yBase - t*1.7, alto = t*4.6, yTecho = yPar - alto;
  /* el hueco del balcón, con la luz cálida del club */
  const g = c.createLinearGradient(0, yTecho, 0, yPar);
  g.addColorStop(0, 'rgba(9,12,16,.92)'); g.addColorStop(.5, 'rgba(30,24,20,.6)'); g.addColorStop(1, 'rgba(48,38,30,.3)');
  c.fillStyle = g; c.fillRect(gx0, yTecho, gw, alto);
  c.fillStyle = 'rgba(255,226,170,.55)'; c.fillRect(gx0 + t, yTecho + t*.25, gw - t*2, Math.max(1, t*.16));
  const luz = c.createLinearGradient(0, yTecho, 0, yPar);
  luz.addColorStop(0, 'rgba(255,212,150,.24)'); luz.addColorStop(1, 'rgba(255,212,150,0)');
  c.fillStyle = luz; c.fillRect(gx0, yTecho, gw, alto);
  /* la gente asomada */
  let x = gx0 + t*2.2;
  while(x < gx1 - t*2.2){
    if(Math.random() < .75){
      const n = 1 + Math.floor(Math.random()*3);
      for(let k = 0; k < n; k++){
        const p = crearPersona(x + k*t*1.75, yPar + t*.55, t*rnd(.92, 1.08), 1);
        if(DECOR.publico.length < 22 && Math.random() < .5) DECOR.publico.push(p); else personaGrada(c, p, 0, false);
      }
      if(Math.random() < .3) bandera(c, x - t*.9, yPar - t*2.6, t*2);
      x += n*t*1.75 + t*rnd(1.4, 3.6);
    } else x += t*rnd(1.8, 4);
  }
  /* la baranda de cristal, con pasamanos */
  c.fillStyle = 'rgba(150,205,240,.13)'; c.fillRect(gx0, yPar, gw, t*1.7);
  c.strokeStyle = 'rgba(200,230,245,.3)'; c.lineWidth = 1;
  for(let px = gx0 + t*2.6; px < gx1 - t; px += t*2.6){ c.beginPath(); c.moveTo(px, yPar); c.lineTo(px, yPar + t*1.7); c.stroke(); }
  c.fillStyle = '#8A96A0'; c.fillRect(gx0, yPar, gw, Math.max(1.5, t*.22));
  c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(gx0, yPar, gw, Math.max(1, t*.09));
  c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(gx0, yPar + t*1.7, gw, Math.max(1, t*.5));
  /* los extremos del balcón y un par de plantas */
  c.fillStyle = '#0D1520';
  c.fillRect(gx0 - t*.5, yTecho, t*1, alto + t*1.7);
  c.fillRect(gx1 - t*.5, yTecho, t*1, alto + t*1.7);
  for(const px of [gx0 + t*1.4, gx1 - t*1.4]) planta(c, px, yPar + t*.2, t*2.6);
}
function planta(c, x, y, alto){
  c.fillStyle = '#2B313A'; c.fillRect(x - alto*.17, y - alto*.34, alto*.34, alto*.34);
  c.fillStyle = '#27633C';
  for(const [dx, dy, r] of [[0,-.6,.23],[-.17,-.45,.18],[.17,-.45,.18]]){ c.beginPath(); c.arc(x + dx*alto, y + dy*alto, r*alto, 0, Math.PI*2); c.fill(); }
}
function publicoAnimado(c){
  if(VISTA !== 'tv' || !P || !DECOR.publico.length) return;
  const fiesta = Math.min(1, Math.max(0, P.fiesta || 0));
  for(const p of DECOR.publico){
    const salta = fiesta > 0 && p.f % 1 < .78;
    personaGrada(c, p, salta ? Math.abs(Math.sin(P.t*9 + p.f))*p.tam*1.1*fiesta : 0, salta);
    if(salta && Math.random() < .004*fiesta){ c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(p.x, p.y - p.tam*2.3, p.tam*1.1, 0, Math.PI*2); c.fill(); }
  }
}
/* el videomarcador: la pantalla del fondo alterna el logo y el resultado */
function ledMarcador(c){
  if(VISTA !== 'tv' || !P || P.drill || !P.escena || P.escena.tipo === 'club' || Math.floor(P.t/4) % 2 === 0) return;
  const a = proy(-.5, -.05, ALT_FONDO + .12), b = proy(W + .5, -.05, ALT_FONDO + .9), q = proy(W/2, -.05, ALT_FONDO + .5);
  c.fillStyle = '#081B33'; c.fillRect(a[0] + 1, b[1] + 1, b[0] - a[0] - 2, a[1] - b[1] - 2);
  const pts = P.tb ? P.puntos.join('-') : NOM_PUNTO[Math.min(P.puntos[0], 3)] + '-' + NOM_PUNTO[Math.min(P.puntos[1], 3)];   // igual que el marcador
  const txt = `${P.equipos[0]}   ${P.juegos[0]}-${P.juegos[1]}   ${pts}   ${P.equipos[1]}`;
  let tam = Math.max(8, q[2]*.4);
  c.font = `900 ${tam}px Inter, system-ui, sans-serif`;
  while(tam > 6 && c.measureText(txt).width > (b[0] - a[0])*.94){ tam -= .5; c.font = `900 ${tam}px Inter, system-ui, sans-serif`; }
  c.fillStyle = '#FFE27A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, q[0], q[1]); c.textBaseline = 'alphabetic';
}

/* ── Los jugadores, de cuerpo entero ──
   Piernas con rodilla, los dos brazos, un gesto para cada golpe (bandeja y remate por arriba, con salto en el
   remate; drive de costado; globo de abajo arriba; saque por debajo) y el puño arriba al ganar el punto */
function sombrasFigura(c, pie, s, salto){
  const tv = VISTA === 'tv', tipo = P && P.escena ? P.escena.tipo : 'pabellon', k = 1 - Math.min(.55, salto);
  if(tipo === 'exterior'){
    c.fillStyle = `rgba(0,0,0,${.3*k})`; c.beginPath(); c.ellipse(pie[0] - s*.5, pie[1] + s*.04, s*.95, s*.19, -.22, 0, Math.PI*2); c.fill();
  } else for(const [ox, oy] of [[-.3, .05], [.3, .05], [0, .12]]){
    c.fillStyle = `rgba(0,0,0,${.12*k})`; c.beginPath(); c.ellipse(pie[0] + ox*s, pie[1] + oy*s, s*.42, s*.42*(tv ? .38 : .55), 0, 0, Math.PI*2); c.fill();
  }
  c.fillStyle = `rgba(0,0,0,${.3*k})`; c.beginPath(); c.ellipse(pie[0], pie[1], s*.26, s*.26*(tv ? .38 : .55), 0, 0, Math.PI*2); c.fill();
}
function dibujarFigura(c, j){
  const tv = VISTA === 'tv', pie = proy(j.x, j.y, 0), s = pie[2], t = P.t;
  const golpe = j.anim > 0 ? 1 - j.anim/.22 : 0, tipo = j.ultimoTiro || 'drive';
  const porArriba = tipo === 'remate' || tipo === 'vibora' || tipo === 'bandeja';
  const festeja = P.estado === 'punto' && P.ultimoGanador === j.lado;
  const salto = (golpe > 0 && tipo === 'remate' ? Math.sin(golpe*Math.PI)*.38 : 0) + (festeja ? Math.abs(Math.sin(t*9 + j.id))*.16 : 0);
  sombrasFigura(c, pie, s, salto);
  if(j.humano && alcanzable(j)){
    const dulce = P.bola.z > .45 && P.bola.z < 1.5;
    anilloSuelo(c, j.x, j.y, j.alcance*(dulce ? 1 + .04*Math.sin(t*30) : 1), dulce ? '#F5C542' : 'rgba(220,245,74,.9)', dulce ? 4 : 2.5);
  }
  const alt = z => proy(j.x, j.y, z + salto);
  const cadera = alt(.92), hombro = alt(1.4), cabeza = alt(1.67), ancho = s*.44;
  const corre = Math.hypot(j.vx, j.vy) > .4, f = corre ? Math.sin(t*15 + j.id) : 0;
  const piel = '#E6BF9A', pielOsc = '#C99A74';
  c.lineCap = 'round'; c.lineJoin = 'round';
  const pierna = (lado, fase) => {
    const pp = proy(j.x + lado*.13 + fase*.1, j.y - fase*.18, Math.max(0, salto - .05) + (corre ? Math.max(0, -fase)*.08 : 0));
    const hx = cadera[0] + lado*s*.09, hy = cadera[1], kx = (hx + pp[0])/2 + lado*s*.03, ky = (hy + pp[1])/2 - (salto > .05 ? s*.1 : s*.02);
    c.strokeStyle = pielOsc; c.lineWidth = Math.max(2, s*.12);
    c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(pp[0], pp[1] - s*.05); c.stroke();
    c.strokeStyle = '#F4F6F8'; c.lineWidth = Math.max(1.5, s*.1); c.beginPath(); c.moveTo(pp[0], pp[1] - s*.14); c.lineTo(pp[0], pp[1] - s*.05); c.stroke();
    c.fillStyle = j.zapas || '#F4F6F8'; c.beginPath(); c.ellipse(pp[0] + lado*s*.02, pp[1] - s*.02, Math.max(2, s*.1), Math.max(1.5, s*.055), 0, 0, Math.PI*2); c.fill();
    if(j.zapas && j.zapas !== '#F4F6F8'){ c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; c.stroke(); }
    c.fillStyle = j.color; c.fillRect(pp[0] - s*.07, pp[1] - s*.035, s*.14, Math.max(1, s*.018));
  };
  pierna(-1, f); pierna(1, -f);
  c.fillStyle = '#1B2733'; rrect(c, cadera[0] - ancho*.46, cadera[1] - s*.15, ancho*.92, s*.27, s*.06); c.fill();
  const gT = c.createLinearGradient(hombro[0] - ancho/2, hombro[1], hombro[0] + ancho/2, cadera[1]);
  gT.addColorStop(0, aclarar(j.color, .28)); gT.addColorStop(.55, j.color); gT.addColorStop(1, oscurecer(j.color, .3));
  c.fillStyle = gT; rrect(c, hombro[0] - ancho/2, hombro[1] - s*.05, ancho, cadera[1] - hombro[1] + s*.03, s*.12); c.fill();
  /* el diseño de la camiseta: rayas, franja o la bandera de tu país */
  const tX = hombro[0] - ancho/2, tY = hombro[1] - s*.05, tW = ancho, tH = cadera[1] - hombro[1] + s*.03;
  if(j.diseno && j.diseno !== 'lisa'){
    c.save(); rrect(c, tX, tY, tW, tH, s*.12); c.clip();
    if(j.diseno === 'bandera' && j.banda){ j.banda.forEach((col, i) => { c.fillStyle = col; c.fillRect(tX, tY + i*tH/3, tW, tH/3 + 1); }); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(tX + tW*.58, tY, tW*.42, tH); }
    else if(j.diseno === 'rayas'){ c.fillStyle = 'rgba(0,0,0,.24)'; for(let k = 0; k < 3; k++) c.fillRect(tX + tW*(.1 + k*.32), tY, tW*.13, tH); }
    else if(j.diseno === 'franja'){ c.fillStyle = 'rgba(255,255,255,.78)'; c.beginPath(); c.moveTo(tX, tY + tH*.14); c.lineTo(tX + tW*.8, tY + tH); c.lineTo(tX + tW, tY + tH); c.lineTo(tX + tW, tY + tH*.82); c.lineTo(tX + tW*.22, tY); c.lineTo(tX, tY); c.closePath(); c.fill(); }
    c.restore();
  }
  if(j.diseno !== 'bandera'){ c.fillStyle = oscurecer(j.color, .38); c.fillRect(hombro[0] - ancho*.07, hombro[1] - s*.01, ancho*.14, (cadera[1] - hombro[1])*.88); }
  /* los brazos: el de la pala hace el gesto del golpe; el otro acompaña o festeja */
  const lado = (j.lado === 0 ? 1 : -1)*(j.zurdo ? -1 : 1);
  let angP = -.35;
  if(festeja) angP = -1.25;
  else if(golpe > 0) angP = porArriba ? -2.5 + golpe*3.1 : tipo === 'globo' ? 1.3 - golpe*3.2 : tipo === 'saque' ? 1.5 - golpe*2.1 : .95 - golpe*2.6;
  else if(j.swing > 0) angP = P.bola && P.bola.z > 1.6 ? -2.4 : .95;
  let angO = 1.25 + f*.6;
  if(festeja) angO = -1.75 + Math.sin(t*14)*.15;
  else if(golpe > 0 && porArriba) angO = -1.9;
  const brazo = (sx, sy, ang, sgn, largo, conPala) => {
    const codo = [sx + sgn*Math.cos(ang - .3)*largo*.5, sy + Math.sin(ang - .3)*largo*.5];
    const mano = [codo[0] + sgn*Math.cos(ang)*largo*.5, codo[1] + Math.sin(ang)*largo*.5];
    c.strokeStyle = piel; c.lineWidth = Math.max(2, s*.09);
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(codo[0], codo[1]); c.lineTo(mano[0], mano[1]); c.stroke();
    if(conPala){
      const px = mano[0] + sgn*Math.cos(ang)*s*.18, py = mano[1] + Math.sin(ang)*s*.18;
      c.strokeStyle = '#0F1C22'; c.lineWidth = Math.max(2, s*.06); c.beginPath(); c.moveTo(mano[0], mano[1]); c.lineTo(px, py); c.stroke();
      const cx = px + sgn*Math.cos(ang)*s*.13, cy = py + Math.sin(ang)*s*.13, rp = Math.max(3, s*.16);
      const gp = c.createRadialGradient(cx - rp*.3, cy - rp*.3, 1, cx, cy, rp*1.2);
      gp.addColorStop(0, aclarar(j.colorPala || '#0F1C22', .4)); gp.addColorStop(1, j.colorPala || '#0F1C22');
      c.fillStyle = gp; c.beginPath(); c.ellipse(cx, cy, rp, Math.max(2.5, s*.13), sgn*ang, 0, Math.PI*2); c.fill();
      c.strokeStyle = j.color; c.lineWidth = 1.5; c.stroke();
      const ry2 = Math.max(2.5, s*.13);
      if(j.palaDiseno === 'rayo'){ c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = Math.max(1, s*.03); c.beginPath(); c.moveTo(cx - rp*.3, cy - ry2*.75); c.lineTo(cx + rp*.25, cy - ry2*.05); c.lineTo(cx - rp*.15, cy + ry2*.05); c.lineTo(cx + rp*.3, cy + ry2*.75); c.stroke(); }
      else if(j.palaDiseno === 'aro'){ c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1, s*.025); c.beginPath(); c.ellipse(cx, cy, rp*.6, ry2*.6, sgn*ang, 0, Math.PI*2); c.stroke(); }
      else if(j.palaDiseno === 'degradado'){ const g2 = c.createLinearGradient(cx - rp, cy - ry2, cx + rp, cy + ry2); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(255,255,255,.6)'); c.fillStyle = g2; c.beginPath(); c.ellipse(cx, cy, rp, ry2, sgn*ang, 0, Math.PI*2); c.fill(); }
    } else if(festeja){ c.fillStyle = piel; c.beginPath(); c.arc(mano[0], mano[1], Math.max(1.5, s*.05), 0, Math.PI*2); c.fill(); }
  };
  const sh = hombro[1] + s*.02;
  brazo(hombro[0] - lado*ancho*.46, sh, angO, -lado, s*.45, false);
  brazo(hombro[0] + lado*ancho*.46, sh, angP, lado, s*.5, true);
  const rc = Math.max(3, s*.13), gC = c.createRadialGradient(cabeza[0] - rc*.3, cabeza[1] - rc*.3, rc*.2, cabeza[0], cabeza[1], rc);
  gC.addColorStop(0, aclarar(piel, .15)); gC.addColorStop(1, pielOsc);
  c.fillStyle = gC; c.beginPath(); c.arc(cabeza[0], cabeza[1], rc, 0, Math.PI*2); c.fill();
  if(j.lado === 0 && tv){ c.fillStyle = '#2B1B12'; c.beginPath(); c.arc(cabeza[0], cabeza[1] - rc*.05, rc*.98, Math.PI*.95, Math.PI*2.05); c.fill(); }   // de espaldas: el pelo
  else { c.fillStyle = '#1B1B1B'; c.beginPath(); c.arc(cabeza[0] - rc*.35, cabeza[1] + rc*.05, Math.max(.8, rc*.12), 0, Math.PI*2); c.arc(cabeza[0] + rc*.35, cabeza[1] + rc*.05, Math.max(.8, rc*.12), 0, Math.PI*2); c.fill(); }
  c.fillStyle = oscurecer(j.color, .2); c.beginPath(); c.arc(cabeza[0], cabeza[1] - rc*.2, rc*1.03, Math.PI*1.02, Math.PI*1.98); c.fill();
  if(j.humano){ c.fillStyle = '#DCF54A'; c.font = `900 ${Math.max(11, s*.4)}px Inter, system-ui, sans-serif`; c.textAlign = 'center'; c.fillText('TÚ', cabeza[0], cabeza[1] - rc - 5); }
}

/* ── Marcador de televisión: datos del partido entre puntos ── */
function mostrarEstadistica(){
  if(!hayDOM || !P || P.drill) return;
  const st = P.stats, el = $('#statP'); if(!el) return;
  const datos = [['PUNTOS', `${st.puntosG}-${st.puntosJ - st.puntosG}`], ['RALLY MÁX.', st.rallyMax], ['PERFECTOS', st.perfectos]];
  if(st.porTres) datos.push(['POR 3 / 4', st.porTres]);
  el.innerHTML = `<b>${esc(P.equipos[0])}</b>` + datos.map(([k, v]) => `<span><small>${k}</small>${v}</span>`).join('');
  el.hidden = false; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(mostrarEstadistica.t);
  mostrarEstadistica.t = setTimeout(() => { el.classList.remove('on'); setTimeout(() => { el.hidden = true; }, 320); }, 2600);
}

/* ── Portada ── */
function escenaPortadaSVG(a){
  const publico = [...Array(66)].map((_, i) => `<circle cx="${(i*53) % 360 + 4}" cy="${44 + (i % 4)*8}" r="2.6" fill="${CAMISETAS_PUBLICO[i % CAMISETAS_PUBLICO.length]}"/>`).join('');
  const focos = [...Array(8)].map((_, i) => `<circle cx="${22 + i*45}" cy="${13 + (i % 2)*5}" r="2.6" fill="#FFF8DC"/><circle cx="${22 + i*45}" cy="${13 + (i % 2)*5}" r="16" fill="url(#pHalo)"/>`).join('');
  const rival = (x, y, col) => `<g transform="translate(${x} ${y}) scale(.42)">${figuraInterior({ camiseta:col, pala:'#0F1C22' }, true)}</g>`;
  return `<svg viewBox="0 0 360 230" class="portada" aria-hidden="true">
    <defs>
      <linearGradient id="pFondo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1A2C"/><stop offset="1" stop-color="#10335E"/></linearGradient>
      <linearGradient id="pCesped" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2459A6"/><stop offset="1" stop-color="#3274CC"/></linearGradient>
      <radialGradient id="pHalo"><stop offset="0" stop-color="#FFF8DC" stop-opacity=".6"/><stop offset=".35" stop-color="#FFF8DC" stop-opacity=".18"/><stop offset="1" stop-color="#FFF8DC" stop-opacity="0"/></radialGradient>
      <radialGradient id="pFoco" cx=".5" cy=".35" r=".65"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="360" height="230" fill="url(#pFondo)"/>${focos}<g opacity=".6">${publico}</g>
    <rect x="96" y="70" width="168" height="9" rx="1" fill="#0D2C52" stroke="rgba(127,211,247,.5)"/>
    <text x="180" y="77.5" text-anchor="middle" class="portada-led">LA CABRA · PÁDEL TOUR</text>
    <path d="M100 84 H260 L334 228 H26 Z" fill="url(#pCesped)"/><path d="M100 84 H260 L334 228 H26 Z" fill="url(#pFoco)"/>
    <path d="M100 84 V58 H260 V84" fill="rgba(160,215,255,.1)" stroke="rgba(200,235,255,.55)"/>
    <path d="M100 58 L60 150 V176 M260 58 L300 150 V176" fill="none" stroke="rgba(200,235,255,.35)"/>
    <path d="M100 84 L26 228 M260 84 L334 228" stroke="rgba(200,235,255,.5)" stroke-width="2"/>
    <path d="M89 106 H271 M49 184 H311 M180 106 V184" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/>
    <rect x="62" y="138" width="236" height="10" fill="rgba(8,14,20,.45)"/><path d="M60 138 H300" stroke="#F2F6F8" stroke-width="2.6"/>
    ${rival(130, 88, '#FF8A7A')}${rival(208, 92, '#FFB29E')}
    <g transform="translate(222 150) scale(.82)">${figuraInterior({ camiseta:'#9BE36B', pala:'#0F1C22' }, false)}</g>
    <g transform="translate(116 132) scale(1.12)">${figuraInterior(a, false)}</g>
    <ellipse cx="190" cy="176" rx="7" ry="2.5" fill="rgba(0,0,0,.35)"><animate attributeName="cx" values="150;230;150" dur="2.8s" repeatCount="indefinite"/></ellipse>
    <circle r="5.5" fill="#DCF54A" stroke="rgba(0,0,0,.3)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M150 150 Q190 40 230 110 Q190 30 150 150"/></circle>
  </svg>`;
}
function heroInicioHTML(save){
  const hay = save && save.j;
  return `<div class="hero-inicio">
    ${escenaPortadaSVG(aspectoJugador())}
    <div class="hero-texto">
      <div class="hero-logo"><span>LA CABRA</span><b>PÁDEL</b></div>
      <p>Del club de barrio al Premier Padel. Tu carrera, tus torneos y tus puntos en la pista.</p>
      <button class="btn btn-jugar" onclick="${hay ? 'continuarPartida()' : 'irCrear()'}">${ico('jugar')}${hay ? 'SEGUIR JUGANDO' : 'JUGAR'}</button>
      ${hay ? `<div class="hero-save">${esc(save.j.nombre)} · ${save.j.ranking ? '#' + save.j.ranking : 'sin ranking'} · ${(save.j.titulos || []).length} títulos</div>` : ''}
    </div>
  </div>`;
}

/* ── Carta de jugador ── */
const ABREV_STAT = { volea:'VOL', bandeja:'BAN', remate:'REM', pared:'PAR', globo:'GLO', fisico:'FÍS', mental:'MEN' };
function mediaJugador(j){ return Math.round(escalar(rawJugador(j))); }
function cartaJugadorHTML(j){
  const media = mediaJugador(j), clase = j.ranking === 1 ? 'cabra' : media >= 80 ? 'oro' : media >= 66 ? 'plata' : 'bronce';
  const a = aspectoJugador();
  return `<div class="carta-wrap">
    <div class="carta ${clase}">
      <div class="carta-brillo"></div>
      <div class="carta-top"><div class="carta-media" data-num="${media}" data-clave="carta-media" data-desde0="1">${media}</div><div class="carta-pos">${j.posicion === 'drive' ? 'DRI' : 'REV'}</div><div class="carta-pais">${esc(paisDe(j).cod)}</div></div>
      <div class="carta-avatar">${figuraSVG(a, j.mano === 'Z', 'width="104" height="139"')}</div>
      <div class="carta-nombre">${esc(apellido(j.nombre))}</div>
      <div class="carta-stats">${STAT_KEYS.map(k => `<span><b>${Math.round(j.stats[k])}</b>${ABREV_STAT[k]}</span>`).join('')}</div>
      <div class="carta-pie">${j.ranking ? '#' + j.ranking : 'SIN RANKING'} · ${j.titulos.length} TÍTULO${j.titulos.length === 1 ? '' : 'S'}</div>
    </div>
    <div class="radar-caja">${radarHTML(j)}<p class="muted">Relleno: tu nivel hoy<br>Discontinua: tu techo</p></div>
  </div>`;
}
function radarHTML(j){
  const n = STAT_KEYS.length, R = 58, cx = 80, cy = 80;
  const punto = (i, v) => { const a = -Math.PI/2 + i*2*Math.PI/n, r = R*v/99; return [cx + Math.cos(a)*r, cy + Math.sin(a)*r]; };
  const poli2 = vals => vals.map((v, i) => punto(i, v).map(x => x.toFixed(1)).join(',')).join(' ');
  const act = STAT_KEYS.map(k => j.stats[k]), pot = STAT_KEYS.map(k => j.pot[k]);
  return `<svg class="radar" viewBox="0 0 160 160" role="img" aria-label="Tus estadísticas: ${STAT_KEYS.map(k => STAT_NOM[k] + ' ' + Math.round(j.stats[k])).join(', ')}">
    ${[.25, .5, .75, 1].map(f => `<polygon points="${poli2(STAT_KEYS.map(() => 99*f))}" fill="none" stroke="rgba(174,202,197,.16)"/>`).join('')}
    ${STAT_KEYS.map((k, i) => { const [x, y] = punto(i, 99), [lx, ly] = punto(i, 120); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(174,202,197,.14)"/><text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="middle" class="radar-et">${ABREV_STAT[k]}</text>`; }).join('')}
    <polygon points="${poli2(pot)}" fill="none" stroke="#AECAC5" stroke-dasharray="3 3" stroke-width="1.2"/>
    <polygon points="${poli2(act)}" fill="rgba(39,160,106,.35)" stroke="#27A06A" stroke-width="2"/>
    ${act.map((v, i) => { const [x, y] = punto(i, v); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#27A06A" stroke="#0E2A2E" stroke-width="2"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="transparent" data-tip="${STAT_NOM[STAT_KEYS[i]]}: ${Math.round(v)} · techo ${Math.round(pot[i])}"/>`; }).join('')}
  </svg>`;
}

/* ── Gráficos de tu carrera ── */
function anotarRankingTrimestre(j){
  if(!j) return;
  const w = j.anio*4 + j.trimestre, h = j.histRank = j.histRank || [];
  if(!h.length || h[h.length - 1].w !== w) h.push({ w, r: j.ranking || null });
  else h[h.length - 1].r = j.ranking || null;
  if(h.length > 160) h.shift();
}
function graficosCarreraHTML(j){
  return `<div class="card"><div class="eyebrow">${ico('grafico')} TU CARRERA EN GRÁFICOS</div>${graficoRanking(j)}${graficoTitulos(j)}${graficoH2H(j)}</div>`;
}
const nomTrim = w => `año ${Math.floor(w/4)} · T${(w % 4) + 1}`;
function graficoRanking(j){
  let datos = (j.histRank || []).filter(d => d.r);
  if(datos.length < 2) datos = (j.rankFin || []).map((r, i) => ({ w: (i + 1)*4 + 3, r })).filter(d => d.r).concat(datos);
  if(datos.length < 2) return `<div class="graf"><div class="graf-tit">Tu ranking</div><p class="muted" style="margin:2px 0 0">Juega un par de trimestres y aquí verás cómo subes.</p></div>`;
  const Wd = 320, Hd = 150, m = { l:36, r:12, t:14, b:22 };
  const ys = r => m.t + Math.log10(Math.max(1, r))/Math.log10(2000)*(Hd - m.t - m.b);
  const x0 = datos[0].w, x1 = datos[datos.length - 1].w, xs = w => m.l + (x1 === x0 ? 0 : (w - x0)/(x1 - x0))*(Wd - m.l - m.r);
  const ruta = datos.map((d, i) => `${i ? 'L' : 'M'}${xs(d.w).toFixed(1)} ${ys(d.r).toFixed(1)}`).join(' ');
  const ult = datos[datos.length - 1], mejor = datos.reduce((a, d) => d.r < a.r ? d : a);
  return `<div class="graf"><div class="graf-tit">Tu ranking <small>el nº 1, arriba</small></div>
    <svg viewBox="0 0 ${Wd} ${Hd}" class="graf-svg" role="img" aria-label="Tu ranking: de #${datos[0].r} a #${ult.r}; el mejor, #${mejor.r}">
      ${[1, 10, 100, 1000].map(r => `<line x1="${m.l}" x2="${Wd - m.r}" y1="${ys(r).toFixed(1)}" y2="${ys(r).toFixed(1)}" class="graf-grid"/><text x="${m.l - 6}" y="${(ys(r) + 3).toFixed(1)}" text-anchor="end" class="graf-eje">#${r}</text>`).join('')}
      <path d="${ruta}" fill="none" stroke="#27A06A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${xs(ult.w).toFixed(1)}" cy="${ys(ult.r).toFixed(1)}" r="4.5" fill="#27A06A" stroke="#0E2A2E" stroke-width="2"/>
      <text x="${xs(ult.w).toFixed(1)}" y="${(ys(ult.r) - 9).toFixed(1)}" text-anchor="end" class="graf-val">#${ult.r}</text>
      ${datos.map(d => `<circle cx="${xs(d.w).toFixed(1)}" cy="${ys(d.r).toFixed(1)}" r="9" fill="transparent" data-tip="${nomTrim(d.w)}: #${d.r}"/>`).join('')}
      <text x="${m.l}" y="${Hd - 6}" class="graf-eje">${nomTrim(x0)}</text><text x="${Wd - m.r}" y="${Hd - 6}" text-anchor="end" class="graf-eje">${nomTrim(x1)}</text>
    </svg>
    <details class="graf-tabla"><summary>Ver en tabla</summary><table>${datos.slice().reverse().map(d => `<tr><td>${nomTrim(d.w)}</td><td>#${d.r}</td></tr>`).join('')}</table></details></div>`;
}
/* barra con la punta redondeada y la base recta, apoyada en el eje */
const barraPunta = (x, y, w, h, r) => { r = Math.min(r, w/2, h); return `M${x.toFixed(1)} ${(y + h).toFixed(1)}V${(y + r).toFixed(1)}Q${x.toFixed(1)} ${y.toFixed(1)} ${(x + r).toFixed(1)} ${y.toFixed(1)}H${(x + w - r).toFixed(1)}Q${(x + w).toFixed(1)} ${y.toFixed(1)} ${(x + w).toFixed(1)} ${(y + r).toFixed(1)}V${(y + h).toFixed(1)}Z`; };
const GRUPOS_TIT = [['FIP', t => /^FIP/.test(t), '#27A06A'], ['PREMIER', t => t === 'P2' || t === 'P1', '#3A83D6'], ['MAJOR Y FINALS', t => t === 'MJ' || t === 'FIN', '#B8860B']];
function graficoTitulos(j){
  if(!j.titulos.length) return `<div class="graf"><div class="graf-tit">Títulos por temporada</div><p class="muted" style="margin:2px 0 0">Tu primer título aparecerá aquí.</p></div>`;
  const anios = []; for(let a = 1; a <= j.anio; a++) anios.push(a);
  const datos = anios.map(a => GRUPOS_TIT.map(([, f]) => j.titulos.filter(t => t.a === a && f(t.tier)).length));
  const max = Math.max(1, ...datos.map(d => d.reduce((x, y) => x + y, 0)));
  const Wd = 320, Hd = 150, m = { l:10, r:10, t:16, b:22 }, n = anios.length, hueco = (Wd - m.l - m.r)/n, ancho = Math.max(4, Math.min(26, hueco - 4));
  const xs = i => m.l + (i + .5)*hueco, hy = v => v/max*(Hd - m.t - m.b);
  let barras = '';
  datos.forEach((d, i) => {
    let y = Hd - m.b; const tot = d.reduce((x, v) => x + v, 0), arriba = d.reduce((k, v, g) => v ? g : k, -1);
    d.forEach((v, g) => {
      if(!v) return; const hh = hy(v); y -= hh;
      const alto = Math.max(1, hh - 2), tip = `data-tip="Año ${anios[i]} · ${GRUPOS_TIT[g][0]}: ${v}"`;
      barras += g === arriba ? `<path d="${barraPunta(xs(i) - ancho/2, y + 1, ancho, alto, 4)}" fill="${GRUPOS_TIT[g][2]}" ${tip}/>`
        : `<rect x="${(xs(i) - ancho/2).toFixed(1)}" y="${(y + 1).toFixed(1)}" width="${ancho.toFixed(1)}" height="${alto.toFixed(1)}" fill="${GRUPOS_TIT[g][2]}" ${tip}/>`;
    });
    if(tot) barras += `<text x="${xs(i).toFixed(1)}" y="${(Hd - m.b - hy(tot) - 4).toFixed(1)}" text-anchor="middle" class="graf-val">${tot}</text>`;
  });
  const cada = Math.ceil(n/12);
  const etiquetas = anios.map((a, i) => i % cada === 0 ? `<text x="${xs(i).toFixed(1)}" y="${Hd - 7}" text-anchor="middle" class="graf-eje">${a}</text>` : '').join('');
  return `<div class="graf"><div class="graf-tit">Títulos por temporada</div>
    <div class="graf-leyenda">${GRUPOS_TIT.map(([nom, , col]) => `<span><i style="background:${col}"></i>${nom}</span>`).join('')}</div>
    <svg viewBox="0 0 ${Wd} ${Hd}" class="graf-svg" role="img" aria-label="Títulos por temporada: ${j.titulos.length} en total">${barras}<line x1="${m.l}" x2="${Wd - m.r}" y1="${Hd - m.b}" y2="${Hd - m.b}" class="graf-grid"/>${etiquetas}</svg>
    <details class="graf-tabla"><summary>Ver en tabla</summary><table><tr><th>Año</th>${GRUPOS_TIT.map(g => `<th>${g[0]}</th>`).join('')}</tr>${datos.map((d, i) => `<tr><td>${anios[i]}</td>${d.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</table></details></div>`;
}
function graficoH2H(j){
  const top = Object.keys(j.h2h || {}).map(id => Object.assign({ id }, j.h2h[id])).sort((a, b) => (b.g + b.p) - (a.g + a.p)).slice(0, 5);
  if(!top.length) return `<div class="graf"><div class="graf-tit">Contra las mejores parejas</div><p class="muted" style="margin:2px 0 0">Cuando juegues contra el top 40, aquí verás tu historial.</p></div>`;
  const max = Math.max(1, ...top.map(e => Math.max(e.g, e.p))), Wd = 320, fila = 36, Hd = top.length*fila + 6, cx = 170, largo = v => v/max*120;
  return `<div class="graf"><div class="graf-tit">Contra las mejores parejas</div>
    <div class="graf-leyenda"><span><i style="background:#C05493"></i>PERDIDOS</span><span><i style="background:#3A83D6"></i>GANADOS</span></div>
    <svg viewBox="0 0 ${Wd} ${Hd}" class="graf-svg" role="img" aria-label="Historial contra las parejas top">
      ${top.map((e, i) => { const y = 2 + i*fila;
        return `<text x="2" y="${y + 12}" class="graf-nom">${esc(e.n.length > 30 ? e.n.slice(0, 29) + '…' : e.n)}</text>
          <text x="${Wd - 2}" y="${y + 12}" text-anchor="end" class="graf-val">${e.g}-${e.p}</text>
          ${e.p ? `<rect x="${(cx - largo(e.p)).toFixed(1)}" y="${y + 18}" width="${Math.max(2, largo(e.p) - 1).toFixed(1)}" height="10" rx="4" fill="#C05493" data-tip="${esc(e.n)}: ${e.p} perdido${e.p === 1 ? '' : 's'}"/>` : ''}
          ${e.g ? `<rect x="${cx + 1}" y="${y + 18}" width="${Math.max(2, largo(e.g) - 1).toFixed(1)}" height="10" rx="4" fill="#3A83D6" data-tip="${esc(e.n)}: ${e.g} ganado${e.g === 1 ? '' : 's'}"/>` : ''}`; }).join('')}
      <line x1="${cx}" x2="${cx}" y1="0" y2="${Hd}" class="graf-grid"/>
    </svg>
    <details class="graf-tabla"><summary>Ver en tabla</summary><table><tr><th>Pareja</th><th>Ganados</th><th>Perdidos</th></tr>${top.map(e => `<tr><td>${esc(e.n)}</td><td>${e.g}</td><td>${e.p}</td></tr>`).join('')}</table></details></div>`;
}
/* la etiqueta de los gráficos: al pasar el dedo o el ratón por una barra o un punto */
function prepararTooltips(){
  if(!hayDOM || prepararTooltips.hecho) return;
  prepararTooltips.hecho = true;
  const tip = document.createElement('div'); tip.id = 'tipGraf'; tip.hidden = true; document.body.appendChild(tip);
  const mostrar = e => {
    const el = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
    if(!el){ tip.hidden = true; return; }
    tip.textContent = el.getAttribute('data-tip'); tip.hidden = false;
    tip.style.left = Math.min(innerWidth - 60, Math.max(60, e.clientX)) + 'px'; tip.style.top = (e.clientY - 14) + 'px';
  };
  document.addEventListener('pointerover', mostrar); document.addEventListener('pointerdown', mostrar);
  addEventListener('scroll', () => { tip.hidden = true; }, true);
}

/* ── El cuadro del torneo, en llaves ── */
const ABREV_LLAVE = { R64:'R64', R32:'R32', OCTAVOS:'OCTAVOS', CUARTOS:'CUARTOS', SEMIFINAL:'SEMIS', FINAL:'FINAL', GRUPOS:'GRUPOS', PREVIA:'1ª RONDA' };
function llavesHTML(ev, so, to){
  const T = TIERS[ev.t], ch = chanceTitulo(ev, so, to), j = S.j;
  const pPrev = to ? to.partidos.filter(x => x.previa) : [], pMain = to ? to.partidos.filter(x => !x.previa) : [];
  const yo = nombreEquipo(j.nombre, j.pareja ? j.pareja.nombre : '—');
  let kMain = 0;
  const cols = ch.pasos.map((p, i) => {
    const nom = p.previa ? 'PREVIA ' + (p.k + 1) : (ABREV_LLAVE[NOM_RONDA[T.rondas][p.k]] || NOM_RONDA[T.rondas][p.k]);
    const partido = p.previa ? pPrev[p.k] : p.cuadroMJ ? null : pMain[kMain++];
    const riv = p.cuadroMJ ? null : (p.previa ? so.previa : so.cuadro)[p.k];
    const hecho = !!to && i < ch.hechos, ahora = !!to && !to.fin && i === ch.hechos, cayo = !!to && !!to.fin && !to.fin.r.campeon && i === ch.hechos;
    const despues = !!to && !!to.fin && !to.fin.r.campeon && i > ch.hechos;   // rondas que ya no se juegan
    const estado = hecho ? `<b class="ll-ok">${partido ? partido.sets.join(' ') : '✓'}</b>` : cayo ? `<b class="ll-ko">${partido ? partido.sets.join(' ') : '✗'}</b>` : despues ? '<b class="muted">—</b>' : `<b>${fmtChance(ch.pr[i])}</b>`;
    const rival = p.cuadroMJ ? 'Cuadro del Major' : `${nombreEquipo(riv.nombre, riv.nombre2)} <small>#${riv.rank}</small>`;
    const otro = p.final ? '' : conSemilla(so.sal + '|otro|' + i, () => {
      const a = duplaRival(ri(15, 700)), b = duplaRival(ri(15, 700));
      return `<div class="llave-caja otra"><div>${nombreEquipo(a.nombre, a.nombre2)}</div><div>${nombreEquipo(b.nombre, b.nombre2)}</div></div>`;
    });
    return `<div class="llave-col ${ahora ? 'actual' : ''}"><div class="ll-ronda">${nom}</div>
      <div class="llave-caja tuya ${hecho ? 'hecha' : ''} ${ahora ? 'ahora' : ''} ${cayo ? 'cayo' : ''} ${despues ? 'apagada' : ''}"><div class="ll-yo">${esc(yo)}</div><div class="ll-riv">${rival}</div><div class="ll-est">${estado}</div></div>
      ${otro}</div>`;
  }).join('');
  const campeon = !!(to && to.fin && to.fin.r.campeon), fuera = !!(to && to.fin && !campeon);
  return `<div class="card"><div class="eyebrow">${ico('llaves')} EL CUADRO${to ? '' : ' QUE OS ESPERA'}</div>
    <div class="llaves">${cols}<div class="llave-col ${campeon ? 'actual' : ''}"><div class="ll-ronda">CAMPEONES</div>
      <div class="llave-caja tuya ${campeon ? 'hecha campeon' : ''} ${fuera ? 'apagada' : ''}">${campeon ? `<div class="ll-copa">${ico('trofeo')}</div><div class="ll-yo">${esc(yo)}</div>` : fuera ? '<div class="ll-riv">Otra vez será</div><div class="ll-est"><b class="muted">—</b></div>' : `<div class="ll-riv">¿Vosotros?</div><div class="ll-est"><b>${fmtChance(ch.titulo)}</b></div>`}</div></div></div>
    <p class="muted" style="margin:6px 0 0">Desliza para ver todas las rondas. En gris, otros partidos del cuadro.</p></div>`;
}

/* ── Números que cuentan hasta su valor, y lo que hay que preparar después de pintar ── */
const NUMEROS_VISTOS = {};
function animarNumeros(){
  if(!hayDOM) return;
  prepararTooltips();
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const el of document.querySelectorAll('[data-num]')){
    const v = +el.getAttribute('data-num'), k = el.getAttribute('data-clave') || '';
    const antes = k in NUMEROS_VISTOS ? NUMEROS_VISTOS[k] : el.hasAttribute('data-desde0') ? 0 : v;
    NUMEROS_VISTOS[k] = v;
    if(reducir || antes === v || !isFinite(v)) continue;
    const fmt = el.getAttribute('data-fmt'), pre = el.getAttribute('data-pre') || '', t0 = performance.now(), dur = 800;
    const pinta = x => { el.textContent = pre + (fmt === 'money' ? money(Math.round(x)) : Math.round(x)); };
    const paso = ahora => { const p = Math.min(1, (ahora - t0)/dur), e = 1 - Math.pow(1 - p, 3); pinta(antes + (v - antes)*e); if(p < 1 && el.isConnected) requestAnimationFrame(paso); };
    pinta(antes); requestAnimationFrame(paso);
  }
  for(const el of document.querySelectorAll('.llaves:not([data-visto])')){
    el.setAttribute('data-visto', '1');
    const a = el.querySelector('.llave-col.actual');
    if(a) el.scrollLeft = Math.max(0, a.offsetLeft - el.offsetLeft - 24);
  }
}


/* ═══ Los minijuegos con el estilo nuevo ═══ */
function icoGolpe(nom){
  const n = String(nom || '').toUpperCase();
  return ico(n.includes('CHIQUITA') || n.includes('DEJADA') ? 'pluma' : n.includes('REMATE') || n.includes('VÍBORA') ? 'rayo'
    : n.includes('BANDEJA') ? 'pala' : n.includes('GLOBO') ? 'globo' : n.includes('PARED') ? 'pared' : 'pelota');
}
/* la probabilidad como en la tele: vosotros a la izquierda, ellos a la derecha */
function probTV(pr, txt){
  pr = Math.max(0, Math.min(100, Math.round(pr)));
  return `<div class="prob-tv"><div class="pt-fila"><span class="pt-yo">VOSOTROS <b>${pr}%</b>${txt ? ' <small>' + txt + '</small>' : ''}</span><span class="pt-el"><b>${100 - pr}%</b> ELLOS</span></div>
    <div class="pt-barra"><i style="width:${pr}%"></i></div></div>`;
}
/* leer al rival: su campo visto desde el vuestro, con los tres carriles para tapar */
function pistaLeerHTML(vals, maxW){
  const riv = (x, y, col) => `<g transform="translate(${x} ${y}) scale(.3)">${figuraInterior({ camiseta: col, pala:'#0F1C22' }, false)}</g>`;
  return `<div class="pista-leer">
    <svg viewBox="0 0 300 180" aria-hidden="true">
      <defs><linearGradient id="plC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B557E"/><stop offset="1" stop-color="#2E78AE"/></linearGradient></defs>
      <rect width="300" height="180" fill="#0A1822"/>
      <path d="M58 22H242V6H58Z" fill="rgba(160,215,255,.12)" stroke="rgba(200,235,255,.4)"/>
      <path d="M58 22H242L284 168H16Z" fill="url(#plC)"/>
      <path d="M58 22H242L284 168H16Z" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2"/>
      <path d="M45 67H255M150 67V168" stroke="rgba(255,255,255,.8)" stroke-width="2"/>
      ${riv(96, 25, '#FF8A7A')}${riv(182, 29, '#FFB29E')}
      <rect x="8" y="163" width="284" height="14" fill="rgba(8,14,20,.55)"/><path d="M8 163H292" stroke="#F2F6F8" stroke-width="3"/>
    </svg>
    <div class="carriles">${ZONAS_LEER.map(([ic, nom], i) => `<button class="zleer2 ${vals[i] === maxW ? 'top' : ''}" onclick="leerZonaMomento(${i})"><b>${nom}</b><small>${vals[i]}%</small></button>`).join('')}</div>
  </div>`;
}


/* ═══ En el móvil, mientras juegas: la página de atrás no se mueve y no se hace zoom ═══
   Safari del iPhone ignora el overflow:hidden del body y el touch-action cuando hay dos
   dedos a la vez (joystick + botón) o toques muy seguidos: el juego se corría y se agrandaba. */
const BLOQUEO = { activo:false, y:0, meta:null };
function enPista(si){
  if(!hayDOM) return;
  document.body.classList.toggle('en-pista', si);
  if(BLOQUEO.activo === si) return;
  BLOQUEO.activo = si;
  const html = document.documentElement, meta = document.querySelector('meta[name="viewport"]');
  if(si){
    BLOQUEO.y = window.scrollY || html.scrollTop || 0;
    document.body.style.top = -BLOQUEO.y + 'px';
    html.classList.add('bloqueada');
    /* quita el zoom que hubiera y no deja hacerlo durante el partido */
    if(meta){ BLOQUEO.meta = meta.getAttribute('content'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'); }
  } else {
    html.classList.remove('bloqueada'); document.body.style.top = '';
    window.scrollTo(0, BLOQUEO.y);
    if(meta && BLOQUEO.meta) meta.setAttribute('content', BLOQUEO.meta);   // en los menús se puede volver a hacer zoom
  }
}
if(hayDOM){
  const bloqueada = () => document.documentElement.classList.contains('bloqueada');
  const noZoom = e => { if(bloqueada()) e.preventDefault(); };
  for(const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, noZoom, { passive:false });
  document.addEventListener('dblclick', noZoom, { passive:false });
  document.addEventListener('touchmove', e => { if(bloqueada() && (e.touches.length > 1 || (e.scale && e.scale !== 1))) e.preventDefault(); }, { passive:false });
  /* si cambia lo que se ve (la barra de Safari, girar el móvil), la pista se recoloca */
  const recolocar = () => { const jg = document.getElementById('juego'); if(jg && !jg.hidden && typeof ajustarLienzo === 'function'){ ajustarLienzo(); aplicarDisenoControles(); } };
  if(window.visualViewport) visualViewport.addEventListener('resize', recolocar);
  addEventListener('orientationchange', () => setTimeout(recolocar, 350));
}
