const {chromium}=require('playwright');
const STUB=require('fs').readFileSync(__dirname+'/hshot.js','utf8').match(/const STUB=`([\s\S]*?)`;/)[1];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:915,height:412},isMobile:true,hasTouch:true});
await p.route(/three(\.min)?\.js|examples\/js/,r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('three.min')?STUB:''}));
const errs=[];p.on('pageerror',e=>errs.push('ERR '+e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' ')));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+' '+m.text().slice(0,200));});
p.on('response',r=>{if(r.status()>=400)errs.push('HTTP '+r.status()+' '+r.url().slice(0,140));});p.on('requestfailed',r=>errs.push('FAIL '+r.url().slice(0,120)));
await p.goto('http://localhost:8790/index.html');await p.waitForTimeout(6000);
errs.push('--- start spectate');
try{await p.evaluate(()=>{for(const id of ['boot','splash']){const e=document.getElementById(id);if(e)e.remove();}startSpectate();});}catch(e){errs.push('eval '+e.message)}
await p.waitForTimeout(6000);
await p.screenshot({path:__dirname+'/m_spec.png'});
console.log(errs.slice(0,40).join('\n'));await b.close();})();
