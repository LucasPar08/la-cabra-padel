/* ¿En qué torneos y en qué rondas te cruzas con los de verdad? */
const fs=require('fs');
const js=fs.readFileSync(process.argv[2],'utf8').split('<script>')[1].split('</script>')[0];
const store={}; const el=()=>({innerHTML:'',value:'Bot',hidden:true,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return el();}});
const cache={};
global.document={querySelector:s=>cache[s]||(cache[s]=el()),querySelectorAll:()=>[],documentElement:{scrollTop:0},body:{offsetHeight:0,classList:{add(){},remove(){}}},addEventListener(){}};
global.window={scrollY:0,scrollTo(){}};
global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=()=>{};
eval(js+`;global.A={get S(){return S;},get CFG(){return CFG;},crearYEmpezar,generarRival,TIERS,nomTier};`);
document.querySelector('#fnom').value='Bot'; A.CFG.pais='AR'; A.crearYEmpezar();
const N=2000;
for(const t of ['FIP1','FIP3','FIP5','P2','P1','MJ','FIN']){
  const rondas=A.TIERS[t].rondas, fila=[];
  for(let r=0;r<rondas;r++){
    let reales=0;
    for(let i=0;i<N;i++){ const x=A.generarRival(t,r,rondas); if(x.id && String(x.id)[0]==='r') reales++; }
    fila.push(Math.round(100*reales/N)+'%');
  }
  console.log(`${t.padEnd(5)} ${A.nomTier(t).padEnd(22)} por ronda: ${fila.join(' · ')}`);
}
