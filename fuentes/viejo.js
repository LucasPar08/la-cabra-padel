/* ¿Una carrera guardada antes del cambio ve a los jugadores reales? */
const fs=require('fs'), path=require('path');
const js=fs.readFileSync(path.join(__dirname||'.', process.argv[2]),'utf8').split('<script>')[1].split('</script>')[0];
const store={}; const el=()=>({innerHTML:'',value:'Bot',hidden:true,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return el();}});
const cache={};
global.document={querySelector:s=>cache[s]||(cache[s]=el()),querySelectorAll:()=>[],documentElement:{scrollTop:0},body:{offsetHeight:0,classList:{add(){},remove(){}}},addEventListener(){}};
global.window={scrollY:0,scrollTo(){}};
global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=()=>{};
eval(js+`;global.A={get S(){return S;},get CFG(){return CFG;},crearYEmpezar,asegurarCircuito,guardar,cargar,continuarPartida,duplaRival,nuevaParejaCircuito,generarRival,render};`);
document.querySelector('#fnom').value='Bot'; A.CFG.pais='AR'; A.crearYEmpezar();
const j=A.S.j;
/* simulo una carrera vieja: circuito inventado, como el que quedó guardado */
j.circuito = [];
for(let k=1;k<=40;k++){ const d=A.duplaRival(k); j.circuito.push({id:'c'+k, nombre:d.nombre, nombre2:d.nombre2, flag:d.flag, flag2:d.flag2, arq:d.arq, forma:0, titulos:3}); }
A.guardar();
/* y la vuelvo a abrir, como quien sigue jugando */
A.S.j=null; A.cargar(); A.continuarPartida();
const pool=A.asegurarCircuito(A.S.j);
console.log('top 5 al retomar la carrera vieja:');
pool.slice(0,5).forEach((p,i)=>console.log(`  #${i+1} ${p.nombre} / ${p.nombre2}${p.real?'   (real)':''}`));
console.log('parejas reales en el circuito: ' + pool.filter(p=>p.real).length + ' de 40');
