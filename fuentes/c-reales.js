
/* ═══════════════════════════════════════════════════════════════
   EL CIRCUITO DE VERDAD
   Los jugadores del Premier Padel, con el ranking FIP del 21 de septiembre
   de 2026, y las parejas tal y como salieron en el cuadro del París Major del
   13 de septiembre (las diez primeras del masculino y las diez del femenino).
   De ahí hasta el veinte se completan emparejando por ranking al resto del top
   40 real. Del 21 para abajo, parejas inventadas, como siempre.
   Los títulos son los que lleva cada pareja en la temporada 2026.
   ═══════════════════════════════════════════════════════════════ */
const RANKING_FECHA = '21 de septiembre de 2026';
const arqDe = id => ARQUETIPOS.find(a => a.id === id) || ARQUETIPOS[0];
/* cada jugador: [nombre, país, lado ('drive', 'reves' o null), edad] */
const REALES = {
  M: {
    parejas: [
      { a:['Arturo Coello','ESP','reves',24],    b:['Agustín Tapia','ARG','drive',27],     arq:'potencia', tit:8 },
      { a:['Alejandro Galán','ESP','reves',30],  b:['Federico Chingotto','ARG','drive',30],arq:'red',      tit:6 },
      { a:['Juan Lebrón','ESP','reves',31],      b:['Leo Augsburger','ARG','drive',24],    arq:'potencia', tit:1 },
      { a:['Franco Stupaczuk','ARG','reves',30], b:['Jon Sanz','ESP','drive',26],          arq:'potencia', tit:0 },
      { a:['Coki Nieto','ESP','reves',31],       b:['Mike Yanguas','ESP','drive',26],      arq:'red',      tit:0 },
      { a:['Martín Di Nenno','ARG','reves',28],  b:['Paquito Navarro','ESP','drive',36],   arq:'muro',     tit:0 },
      { a:['Javi Leal','ESP','reves',28],        b:['Fran Guerrero','ESP','drive',27],     arq:'joven',    tit:0 },
      { a:['Momo González','ESP','reves',29],    b:['Lucas Campagnolo','BRA','drive',30],  arq:'muro',     tit:0 },
      { a:['Edu Alonso','ESP','reves',27],       b:['Aimar Goñi','ESP','drive',24],        arq:'joven',    tit:0 },
      { a:['Álex Ruiz','ESP','reves',30],        b:['Javi García','ESP','drive',27],       arq:'red',      tit:0 },
      { a:['Juan Tello','ARG',null,31],          b:['Javi Garrido','ESP',null,29],         arq:'muro',     tit:0 },
      { a:['Lucas Bergamini','BRA',null,27],     b:['Juanlu Esbrí','ESP',null,25],         arq:'joven',    tit:0 },
      { a:['Jairo Bautista','ESP',null,26],      b:['Maxi Arce','ARG',null,25],            arq:'potencia', tit:0 },
      { a:['Sanyo Gutiérrez','ARG','drive',38],  b:['Gonzalo Alfonso','ARG','reves',26],   arq:'zurda',    tit:0 },
      { a:['Álex Arroyo','ESP',null,26],         b:['José Jiménez','ESP',null,28],         arq:'red',      tit:0 },
      { a:['Iñigo Jofre','UAE',null,29],         b:['Álex Chozas','ARG',null,25],          arq:'muro',     tit:0 },
      { a:['Tolito Aguirre','ARG',null,27],      b:['David Gala','ESP',null,26],           arq:'potencia', tit:0 },
      { a:['Valentín Libaak','ARG',null,22],     b:['Javi Barahona','ESP',null,27],        arq:'joven',    tit:0 },
      { a:['Maxi Sánchez','ARG',null,38],        b:['Pol Hernández','ESP',null,24],        arq:'veterana', tit:0 },
      { a:['Guillermo Collado','ESP',null,26],   b:['Pablo García','ESP',null,27],         arq:'red',      tit:0 },
    ],
    /* los que andan sueltos: pueden acabar de pareja tuya */
    libres: [
      ['Pablo Cardona','ESP',null,25], ['Manu Castaño','ESP',null,28], ['Víctor Ruiz','ESP',null,34],
      ['Lucho Capra','ARG',null,33], ['Fede Mouriño','URU',null,28], ['Agustín Gutiérrez','ARG',null,30],
      ['Juan Cruz Belluati','ARG',null,29], ['Ramiro Moyano','ARG',null,33], ['Miguel Lamperti','ARG','reves',42],
    ],
  },
  F: {
    parejas: [
      { a:['Gemma Triay','ESP','reves',30],      b:['Delfi Brea','ARG','drive',26],        arq:'red',      tit:5 },
      { a:['Bea González','ESP','reves',25],     b:['Paula Josemaría','ESP','drive',29],   arq:'red',      tit:6 },
      { a:['Ari Sánchez','ESP','reves',28],      b:['Andrea Ustero','ESP','drive',22],     arq:'muro',     tit:3 },
      { a:['Claudia Fernández','ESP','reves',22],b:['Martina Calvo','ESP','drive',22],     arq:'joven',    tit:1 },
      { a:['Marta Ortega','ESP','reves',31],     b:['Sofía Araujo','POR','drive',30],      arq:'red',      tit:0 },
      { a:['Tamara Icardo','ESP','reves',33],    b:['Claudia Jensen','ARG','drive',25],    arq:'muro',     tit:1 },
      { a:['Ale Salazar','ESP','reves',38],      b:['Aranza Osoro','ARG','drive',31],      arq:'veterana', tit:0 },
      { a:['Marina Guinart','ESP','reves',23],   b:['Ale Alonso','ESP','drive',24],        arq:'muro',     tit:0 },
      { a:['Patty Llaguno','ESP','reves',40],    b:['Carolina Orsi','ITA','drive',27],     arq:'veterana', tit:0 },
      { a:['Vero Virseda','ESP','reves',33],     b:['Martina Fassio','ARG','drive',25],    arq:'red',      tit:0 },
      { a:['Icíar Montes','ESP',null,28],        b:['Marta Barrera','ESP',null,26],        arq:'joven',    tit:0 },
      { a:['Carmen Goenaga','ESP',null,27],      b:['Vicky Iglesias','ESP',null,32],       arq:'red',      tit:0 },
      { a:['Bea Caldera','ESP',null,26],         b:['Lorena Rufo','ESP',null,28],          arq:'muro',     tit:0 },
      { a:['Nuria Rodríguez','ESP',null,25],     b:['Raquel Eugenio','ESP',null,24],       arq:'joven',    tit:0 },
      { a:['Jessica Castelló','ESP',null,34],    b:['Lucía Sainz','ESP',null,40],          arq:'veterana', tit:0 },
    ],
    libres: [
      ['Giulia Dal Pozzo','ITA',null,24], ['Virginia Riera','ARG',null,31], ['Bárbara Las Heras','ESP',null,29],
      ['Julieta Bidahorria','ARG',null,26], ['Ana Catarina Nogueira','POR',null,30], ['Lucía Martínez','ESP',null,26],
      ['Marta Talaván','ESP',null,30],
    ],
  },
};
const realesDe = () => REALES[esF() ? 'F' : 'M'];
const idPareja = i => 'r' + (esF() ? 'f' : 'm') + i;

/* ── El circuito: las parejas de verdad ocupan los primeros puestos ── */
function parejaRealCircuito(rank, pool){
  const R = realesDe(), usados = new Set((pool || []).map(p => p.id));
  let i = rank - 1;
  if(!(R.parejas[i] && !usados.has(idPareja(i)))){          // ese puesto ya está cogido: la primera libre
    i = R.parejas.findIndex((p, k) => !usados.has(idPareja(k)));
    if(i < 0) return null;
  }
  const p = R.parejas[i];
  return { id: idPareja(i), nombre: p.a[0], nombre2: p.b[0], flag: p.a[1], flag2: p.b[1],
           arq: arqDe(p.arq), forma: rnd(-2, 2), titulos: p.tit, real: true };
}
/* Las carreras empezadas antes de que existiera el circuito real guardaron su
   top 40 inventado y se lo quedaban para siempre. Al retomarlas, las parejas de
   verdad ocupan los primeros puestos: cada casilla conserva la forma que
   llevaba y entra con los títulos que tiene esa pareja en 2026. */
function migrarCircuitoReal(j){
  if(!j || !j.circuito || !j.circuito.length) return false;
  if(j.circuito.some(p => p.real)) return false;
  const R = realesDe();
  for(let i = 0; i < R.parejas.length && i < j.circuito.length; i++){
    const p = R.parejas[i], viejo = j.circuito[i] || {};
    j.circuito[i] = { id: idPareja(i), nombre: p.a[0], nombre2: p.b[0], flag: p.a[1], flag2: p.b[1],
                      arq: arqDe(p.arq), forma: viejo.forma || 0, titulos: p.tit, real: true };
  }
  return true;
}

/* Los que andan sueltos, para cuando buscas pareja. Sólo aparecen cuando ya
   estás en el circuito de verdad (de club para abajo, la gente es de club) y
   cuando la edad que te ofrecen es la suya: si te buscan una promesa de 19,
   no te van a poner a un veterano de 40. */
const REALES_DADOS = [];
function jugadorRealLibre(cod, pos, nivel, edad){
  if(!(nivel >= 62)) return null;
  const R = realesDe(), usados = new Set(REALES_DADOS);
  const j = typeof S !== 'undefined' && S ? S.j : null;
  for(const p of (j && j.circuito) || []){ usados.add(p.nombre); usados.add(p.nombre2); }
  if(j && j.pareja) usados.add(j.pareja.nombre);
  let libres = R.libres.filter(x => !usados.has(x[0]) && (!pos || !x[2] || x[2] === pos));
  libres = edad ? libres.filter(x => Math.abs(x[3] - edad) <= 4) : libres.filter(x => x[3] <= 34);
  if(!libres.length) return null;
  const delPais = cod ? libres.filter(x => x[1] === cod) : [];
  const x = pick(delPais.length ? delPais : libres);
  REALES_DADOS.push(x[0]);
  if(REALES_DADOS.length > 6) REALES_DADOS.shift();
  return { nombre: x[0], flag: x[1], edad: x[3] };
}
