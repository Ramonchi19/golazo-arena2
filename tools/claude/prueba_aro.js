// Prueba del aro del pase cargado (v229c) en el navegador con el THREE de mentira.
// Uso: python3 -m http.server 8790 (desde la raíz) y luego: node prueba_aro.js
const {chromium}=require('playwright');const {STUB}=require(__dirname+'/hshot.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:915,height:412}});
await p.route(/three(\.min)?\.js|examples\/js/,r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('three.min')?STUB:''}));
const errs=[];p.on('pageerror',e=>errs.push('ERR '+e.message));
await p.goto('http://localhost:8790/index.html');await p.waitForTimeout(5000);
await p.evaluate(()=>{for(const id of ['boot','splash']){const e=document.getElementById(id);if(e)e.remove();}startSpectate();});
await p.waitForFunction(()=>typeof state!=='undefined'&&state==='play'&&players.length>0,null,{timeout:20000}).catch(()=>{});   // el partido espera hasta 8 s a los modelos
const info=await p.evaluate(()=>({jugadores:typeof players!=='undefined'?players.length:-1,aro:typeof aimRing!=='undefined'&&!!aimRing,state}));
console.log(JSON.stringify(info));
const r=await p.evaluate(()=>{const out=[];if(!players.length)return ['sin jugadores'];
  const u=players.find(q=>!q.gk&&q.team===0),mates=players.filter(q=>!q.gk&&q.team===0&&q!==u);
  user=u;u.x=0;u.z=0;mates.forEach((m,i)=>{m.x=-25;m.z=i*3;});mates[0].x=12;mates[0].z=0;
  for(const pw of [.27,.46,.82,.05]){drawAimRing({type:'pass',t:1,power:pw,dir:{x:1,z:0}});out.push('fuerza '+pw+' → aro '+(aimRing.visible?'sí':'no')+' ('+passOutcome(12,passDist(pw))+')');}
  drawAimRing({type:'pass',t:.05,power:0,dir:{x:1,z:0}});out.push('toque → aro '+(aimRing.visible?'sí':'no'));
  drawAimRing(null);out.push('sin puntería → aro '+(aimRing.visible?'sí':'no'));return out;});
console.log(r.join('\n'));console.log(errs.join('\n')||'sin errores de JS');await b.close();})();
