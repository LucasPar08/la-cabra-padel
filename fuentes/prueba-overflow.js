const puppeteer = require('puppeteer-core');
const espera = ms => new Promise(r => setTimeout(r, ms));
const PAG = process.argv[2] || 'prueba.html';
(async () => {
  const b = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new'});
  const pg = await b.newPage(); await pg.emulate(puppeteer.KnownDevices['iPhone 13']);
  const cdp = await pg.createCDPSession();
  const err = []; pg.on('pageerror', e => err.push(e.message));
  await pg.goto('http://localhost:8793/' + PAG, {waitUntil:'networkidle0'}); await pg.evaluate(() => localStorage.clear()); await pg.reload({waitUntil:'networkidle0'});
  const estado = () => pg.evaluate(() => { const j = document.getElementById('juego').getBoundingClientRect();
    return { scrollY: Math.round(window.scrollY), zoom: +(window.visualViewport ? visualViewport.scale : 1).toFixed(2), top: Math.round(j.top), alto: Math.round(j.height), vh: innerHeight, bloqueada: document.documentElement.classList.contains('bloqueada'),
             meta: document.querySelector('meta[name=viewport]').content }; });
  /* una carrera con un torneo abierto: la página es larga y está desplazada hacia abajo */
  await pg.evaluate(() => { PREF.tutorial = true; guardarPref(); irCrear(); document.querySelector('#fnom').value = 'Lucas Park'; CFG.pais = 'AR'; CFG.ciudad = ciudadesDe('AR')[0].n; crearYEmpezar();
    S.pantalla = 'temporada'; render(); });
  await espera(600);
  await pg.evaluate(() => window.scrollTo(0, 900)); await espera(400);
  const antes = await estado();
  /* empieza un partido en la pista */
  await pg.evaluate(() => { partidoRapido(); P.humanoIA = true; });
  await espera(1200);
  const jugando = await estado();
  /* 1) arrastrar el dedo por la pista (donde antes se movía la página) */
  const drag = async (x0, y0, x1, y1) => {
    await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x:x0, y:y0 }] });
    for(let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:x0 + (x1 - x0)*k/8, y:y0 + (y1 - y0)*k/8 }] });
    await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
  };
  await drag(195, 200, 195, 650); await drag(195, 650, 195, 100); await espera(400);
  const trasArrastre = await estado();
  /* 2) pellizcar para hacer zoom, y dos dedos a la vez (joystick + botón) */
  try{ await cdp.send('Input.synthesizePinchGesture', { x:195, y:420, scaleFactor:2.4, relativeSpeed:900, gestureSourceType:'touch' }); }catch(e){ err.push('pinch: ' + e.message); }
  await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x:70, y:720, id:1 }, { x:330, y:760, id:2 }] });
  for(let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:70 - k*6, y:720 - k*8, id:1 }, { x:330 + k*6, y:760 + k*8, id:2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
  /* 3) doble toque rápido sobre un botón */
  for(let k = 0; k < 2; k++){ await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x:330, y:780 }] }); await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] }); await espera(60); }
  await espera(600);
  const trasZoom = await estado();
  await pg.screenshot({ path: __dirname + '/fotos/overflow-jugando.png' });
  /* 4) salir del partido: la página vuelve donde estaba y se puede volver a hacer zoom */
  await pg.evaluate(() => { const j = document.getElementById('juego'); window.__salida = null; const f = ocultarJuego; P = null; f(); });
  await espera(500);
  const despues = await estado();
  const ok = antes.scrollY > 0 && jugando.bloqueada && jugando.top === 0 && jugando.alto === jugando.vh && trasArrastre.top === 0 && trasZoom.zoom === 1 && trasZoom.top === 0
    && !despues.bloqueada && despues.scrollY === antes.scrollY && !despues.meta.includes('maximum-scale');
  console.log('antes de jugar  ', JSON.stringify(antes));
  console.log('jugando         ', JSON.stringify(jugando));
  console.log('tras arrastrar  ', JSON.stringify(trasArrastre));
  console.log('tras zoom/2dedos', JSON.stringify(trasZoom));
  console.log('al salir        ', JSON.stringify(despues));
  console.log(err.length ? 'ERRORES: ' + err.join(' | ') : 'sin errores de página');
  console.log(ok ? '✅ la pista no se mueve ni se agranda, y al salir todo vuelve' : '❌ algo se movió');
  await b.close(); process.exit(ok ? 0 : 1);
})().catch(e => { console.error('FALLO', e.message); process.exit(1); });
