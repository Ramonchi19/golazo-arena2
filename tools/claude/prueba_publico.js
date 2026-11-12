// Prueba de los avisos del público (v228a). Uso: node prueba_publico.js ok|sin_gente|sin_datos|traba
// Necesita el servidor: python3 -m http.server 8790 desde la raíz del repo.
const {chromium}=require('playwright');
const {STUB}=require(__dirname+'/hshot.js');
const mode=process.argv[2]||'ok';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:915,height:412},isMobile:true,hasTouch:true});
await p.route(/three(\.min)?\.js|examples\/js/,r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('three.min')?STUB:''}));
if(mode==='sin_gente')await p.route(/arenas\/gente\.js/,r=>r.fulfill({status:404,body:''}));
if(mode==='sin_datos')await p.route(/gente\/gente\.json/,r=>r.fulfill({status:404,body:''}));
const errs=[];p.on('pageerror',e=>errs.push('ERR '+e.message));
await p.goto('http://localhost:8790/index.html');await p.waitForTimeout(5000);
await p.evaluate(()=>{for(const id of ['boot','splash']){const e=document.getElementById(id);if(e)e.remove();}startSpectate();});
await p.waitForFunction(()=>typeof ARENA_MOD!=='undefined'&&ARENA_MOD,null,{timeout:15000}).catch(()=>{});
// con el THREE de mentira los modelos de las gradas nunca cargan: se meten 40 lugares falsos
await p.evaluate(()=>{for(let i=0;i<40;i++)ARENA_MOD.seats.push({x:i,y:1,z:20,ry:0});});
if(mode==='traba')await p.waitForFunction(()=>window.HONGOS!==undefined,null,{timeout:5000}).catch(()=>{});
for(let i=0;i<12;i++){await p.waitForTimeout(3000);
  if(mode==='traba')await p.evaluate(()=>{try{if(HONGOS&&HONGOS.ready&&!HONGOS._rot){HONGOS._rot=1;HONGOS.update=()=>{throw new Error('prueba');};}}catch(e){}});
}
const r=await p.evaluate(()=>({arena:ARENA_MOD&&ARENA_MOD._n,seats:ARENA_MOD&&ARENA_MOD.seats&&ARENA_MOD.seats.length,hongos:typeof HONGOS==='undefined'?'?':HONGOS?{ready:HONGOS.ready,count:HONGOS.count,error:HONGOS.error}:null,caja:(document.getElementById('dbgErr')||{}).innerText||''}));
console.log(mode,JSON.stringify(r),errs.join(' | '));await b.close();})();
