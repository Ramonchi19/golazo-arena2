// Prueba de la v228b. Uso (desde la raíz del repo): node tools/claude/test_espejo.js
const fs=require('fs');const html=fs.readFileSync('index.html','utf8');
const grab=re=>html.match(re)[0];
const src=[/const KICK_L=.*\n/,/function mirrorBone[^\n]*\n/,/function mirrorClip[\s\S]*?\n  return new THREE\.AnimationClip\(name,c\.duration,tr\);\}\n/,/function mirrorMeta[^\n]*\n/,/function addMirrors[^\n]*\n/].map(grab).join('');
const THREE={AnimationClip:function(n,d,t){this.name=n;this.duration=d;this.tracks=t;}};
eval(src.replace(/^const /gm,'var '));
function glb(p){const b=fs.readFileSync(p);const L=b.readUInt32LE(12);const j=JSON.parse(b.slice(20,20+L));const bl=b.readUInt32LE(20+L);const bin=b.slice(28+L,28+L+bl);return{j,bin};}
function clips(p){const {j,bin}=glb(p);const names=j.nodes.map(n=>n.name);const acc=i=>{const a=j.accessors[i],bv=j.bufferViews[a.bufferView],n={SCALAR:1,VEC3:3,VEC4:4}[a.type],o=(bv.byteOffset||0)+(a.byteOffset||0);return new Float32Array(bin.buffer.slice(bin.byteOffset+o,bin.byteOffset+o+a.count*n*4));};
  const out={};for(const a of j.animations){out[a.name]={name:a.name,duration:1,tracks:a.channels.map(c=>{const s=a.samplers[c.sampler];const t={name:names[c.target.node]+'.'+(c.target.path==='rotation'?'quaternion':'position'),times:acc(s.input),values:acc(s.output)};t.clone=function(){return{name:this.name,times:this.times,values:Float32Array.from(this.values),clone:this.clone};};return t;})};}return out;}
let worst=0;
for(const g of ['','_peq','_med','_gra','_atl']){const C=clips('assets/anims'+g+'.glb');const meta=JSON.parse(fs.readFileSync('assets/anims'+g+'.json'));
  const M=mirrorClip(C.pass_r,'x');const byName={};for(const t of C.pass_l.tracks)byName[t.name]=t;let e=0;
  for(const t of M.tracks){const r=byName[t.name];if(!r)throw 'falta '+t.name;const q=t.name.endsWith('quaternion');for(let i=0;i<t.values.length;i+=q?4:3){let d=0,d2=0;for(let k=0;k<(q?4:3);k++){d=Math.max(d,Math.abs(t.values[i+k]-r.values[i+k]));d2=Math.max(d2,Math.abs(t.values[i+k]+r.values[i+k]));}e=Math.max(e,q?Math.min(d,d2):d);}}
  const lib={};for(const k of KICK_L)if(C[k])lib[k]=C[k];addMirrors(lib,meta);
  console.log((g||'base').padEnd(5),'espejo(pass_r) vs pass_l: error',e.toFixed(6),'| zurdas creadas:',Object.keys(lib).filter(k=>k.endsWith('_L')).join(','),'| meta ok:',KICK_L.filter(k=>lib[k]).every(k=>meta[k+'_L']&&meta[k+'_L'].key===meta[k].key));worst=Math.max(worst,e);}
console.log(worst<1e-6?'PASA':'FALLA');
