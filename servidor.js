/* Servidor mínimo para jugar a LA CABRA · Pádel en local.
   Uso: node servidor.js                 → el juego actual (juego/)
        node servidor.js versiones/v2    → cualquier otra carpeta del repo */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const RAIZ   = path.resolve(__dirname, process.argv[2] || 'juego');
const PUERTO = +(process.env.PUERTO || 8793);
const TIPOS  = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
                 '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' };

http.createServer((req, res) => {
  let ruta = decodeURIComponent(req.url.split('?')[0]);
  if (ruta === '/' || ruta === '') ruta = '/index.html';
  const archivo = path.join(RAIZ, path.normalize(ruta));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end('403'); }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(datos);
  });
}).listen(PUERTO, () => console.log('🏓 LA CABRA · Pádel → http://localhost:' + PUERTO + '  (' + path.relative(__dirname, RAIZ) + ')'));
