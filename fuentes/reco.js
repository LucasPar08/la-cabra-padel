const fs=require('fs');const js=fs.readFileSync('nuevo.html','utf8').split('<script>')[1].split('</script>')[0];
const store={};const el=()=>({innerHTML:'',value:'Bot',hidden:true,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return el();}});const cache={};
global.document={querySelector:s=>cache[s]||(cache[s]=el()),querySelectorAll:()=>[],documentElement:{scrollTop:0},body:{offsetHeight:0,classList:{add(){},remove(){}}},addEventListener(){}};
global.window={scrollY:0,scrollTo(){}};global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=()=>{};
eval(js+`;global.A={get S(){return S;},get CFG(){return CFG;},crearYEmpezar,recomendacionSemana,torneosDeLaSemana,estadoTorneo,valorTorneo};`);
document.querySelector('#fnom').value='Bot';A.CFG.pais='AR';A.crearYEmpezar();const j=A.S.j;
for(const s of [1,2,3,4,6]){ j.semana=s; const r=A.recomendacionSemana(j); console.log('semana '+s+': '+A.torneosDeLaSemana(j).map(ev=>{const e=A.estadoTorneo(j,ev); return ev.nom+' ['+e.tipo+(e.tipo==='directo'||e.tipo==='previa'?' · sube '+Math.round(A.valorTorneo(j,ev,e).sube):'')+']';}).join(' | ')+'  →  '+(r.tipo==='torneo'?r.ev.nom:r.tipo)); }
