/* junta los volcados de medir.js: node juntar.js a.json b.json ... */
const F = process.argv.slice(2).flatMap(f => JSON.parse(require('fs').readFileSync(f, 'utf8')));
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length/2)]; };
const pg = F.reduce((a, f) => a + f.pg, 0), pp = F.reduce((a, f) => a + f.pp, 0);
console.log(`${F.length} carreras · nº1 ${F.filter(f => f.mejor === 1).length}/${F.length} (${(15*F.filter(f => f.mejor === 1).length/F.length).toFixed(1)} de 15) · primer título temp ${med(F.map(f => f.primero || 99))} · ganados ${(100*pg/(pg+pp)).toFixed(0)}% · mejor puesto med #${med(F.map(f => f.mejor))} · top 10 ${F.filter(f => f.mejor <= 10).length}/${F.length} · títulos med ${med(F.map(f => f.tit))}`);
