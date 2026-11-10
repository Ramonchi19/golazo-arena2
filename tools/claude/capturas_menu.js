const {chromium}=require('playwright');
const STUB=`(function(){const h={get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k in t)return t[k];return P;},set(t,k,v){t[k]=v;return true;},apply(){return P;},construct(){return P;}};
function F(){};const P=new Proxy(F,h);window.THREE=P;})();`;
(async()=>{const b=await chromium.launch();const out='/tmp/claude-0/-home-claude/bc698779-c6f4-5cf3-a758-59e499658a8f/scratchpad/h_';
for(const [tag,w,h] of [['s22',915,412]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:true,hasTouch:true});
await p.route(/three(\.min)?\.js|examples\/js/,r=>r.fulfill({status:200,contentType:'text/javascript',body:r.request().url().includes('three.min')?STUB:''}));
const errs=[];p.on('pageerror',e=>errs.push(e.message+' @'+((e.stack||'').split('\n')[1]||'')));
await p.goto('http://localhost:8790/index.html');await p.waitForTimeout(7000);
await p.screenshot({path:out+tag+'_0.png'});
await p.evaluate(()=>{const b=document.getElementById('boot');if(b)b.remove();const s=document.getElementById('splash');if(s)s.remove();});
for(const s of ['battle','shop','squad','locker','rank']){try{await p.evaluate(s=>go(s),s);}catch(e){errs.push('go '+s+' '+e.message)}await p.waitForTimeout(900);await p.screenshot({path:out+tag+'_'+s+'.png'});}
try{await p.evaluate(()=>{go('squad');openCard(save.squad.f[0]);});await p.waitForTimeout(1200);await p.screenshot({path:out+tag+'_card.png'});}catch(e){errs.push('card '+e.message)}
console.log(tag,errs.slice(0,6).join('\n  '));await p.close();}
await b.close();})();
