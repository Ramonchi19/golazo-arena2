// Prueba la página de demo (tools/claude/demo) con el THREE de mentira y teclas simuladas.
// Uso: tools/claude/demo/armar.sh; (cd /home/claude/demo_out && python3 -m http.server 8791 &); node tools/claude/demo/prueba_demo.js
const {chromium}=require('playwright');const {STUB}=require(__dirname+'/../hshot.js');
const EXTRA=`;THREE.GLTFLoader=function(){};THREE.GLTFLoader.prototype.load=function(u,cb){setTimeout(()=>cb({scene:new THREE.Group(),animations:[]}),10);};THREE.GLTFLoader.prototype.parse=function(b,p,cb){window.__glbBytes=(window.__glbBytes||0)+b.byteLength;setTimeout(()=>cb({scene:new THREE.Group(),animations:[]}),10);};THREE.SkeletonUtils={clone:o=>new THREE.Group()};`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:560}});
await p.route(/three(\.min)?\.js|examples\/js/,r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('three.min')?STUB+EXTRA:''}));
const errs=[];p.on('pageerror',e=>errs.push('ERR '+e.message+' | '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text());});
await p.goto('http://localhost:8791/index.html');await p.waitForFunction(()=>window.__M&&window.__M().pause<=0,null,{timeout:20000});   // espera a que termine la pausa del saque
await p.evaluate(()=>{const M=window.__M();window.__kicks=[];setInterval(()=>{for(const q of M.players){if(q.kickT>0&&!q.__k){q.__k=1;__kicks.push({team:q.team,pow:q.kickPow,rem:M.ball.isShot&&!q.aim?1:0,passTo:!!M.ball.passTo,cross:!!M.ball.cross,shot:!!M.ball.isShot});}if(!(q.kickT>0))q.__k=0;}},5);});
const step=async(nombre,fn)=>{await p.waitForFunction(()=>window.__M().pause<=0,null,{timeout:20000});await p.keyboard.press('r');await p.waitForTimeout(150);await p.evaluate(()=>{__kicks=[];});await fn();await p.waitForTimeout(500);
  const k=await p.evaluate(()=>__kicks.filter(x=>x.team===0));console.log(nombre.padEnd(30),k.length?k.map(x=>(x.shot?'TIRO':x.cross?'centro':'pase')+(x.rem?'':'')).join(' → '):'sin patada');};
const hold=async(key,ms)=>{await p.keyboard.down(key);await p.waitForTimeout(ms);await p.keyboard.up(key);};
await step('J toque (pase)',()=>hold('j',40));
await step('J cargado (pase)',()=>hold('j',600));
await step('K toque (centro)',()=>hold('k',40));
await step('K cargado (centro)',()=>hold('k',700));
await step('J y luego L (remate)',async()=>{await hold('j',40);await p.waitForTimeout(60);await hold('l',40);await p.waitForTimeout(1200);});
await step('K y luego L (remate aéreo)',async()=>{await hold('k',40);await p.waitForTimeout(450);await hold('l',40);await p.waitForTimeout(1500);});
await step('L toque (tiro)',()=>hold('l',40));
await step('L cargado (tiro)',()=>hold('l',700));
const log=await p.evaluate(()=>[...document.querySelectorAll('#log div')].map(d=>d.textContent));
console.log('rivales en la cancha:',await p.evaluate(()=>window.__M().players.filter(q=>q.team===1&&Math.abs(q.z)<16.5).length),'· modo solo:',await p.evaluate(()=>window.__solo()));console.log('bytes de glb decodificados:',await p.evaluate(()=>window.__glbBytes));console.log('registro:',log.join(' | '));console.log(errs.slice(0,8).join('\n')||'sin errores de JS');await b.close();})();
