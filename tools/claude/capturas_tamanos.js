const {chromium}=require('playwright');
const STUB=require('fs').readFileSync(__dirname+'/hshot.js','utf8').match(/const STUB=`([\s\S]*?)`;/)[1];
const sizes=JSON.parse(process.argv[2]||'[["a",811,361]]'),scr=JSON.parse(process.argv[3]||'["battle"]');
(async()=>{const b=await chromium.launch();
for(const [tag,w,h] of sizes){const p=await b.newPage({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
await p.route(/three(\.min)?\.js|examples\/js/,r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('three.min')?STUB:''}));
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8790/index.html');await p.waitForTimeout(6500);
await p.evaluate(()=>{for(const id of ['boot','splash']){const e=document.getElementById(id);if(e)e.remove();}});
for(const s of scr){try{await p.evaluate(s.includes('(')?s:`go('${s}')`);}catch(e){errs.push(s+' '+e.message)}await p.waitForTimeout(900);await p.screenshot({path:__dirname+'/h3_'+tag+'_'+s.replace(/\W/g,'').slice(0,12)+'.png'});}
console.log(tag,errs.slice(0,5).join(' | '));await p.close();}
await b.close();})();
