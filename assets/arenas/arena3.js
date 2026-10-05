window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[3]=function(G){

const L=32,HW=16,GW=4.5,GH=2.9,B=HW+1.0,E=L+1.2;
// ===== paleta del pueblo: tarde dorada, piedra clara, tejas rojas =====
const PAL={leaf:['#6fa83e','#5f9a38','#7db446'],grass:'#7ea43e',bark:'#7a5236',barkDark:'#5e3f2a',wood:'#b07a4c',woodDark:'#8a5a38',
  woodInner:'#e6cfa4',stone:['#bfb3a0','#b2a693','#c9bead'],dirt:'#a08a6c',red:'#d9483f',tan:'#d8b98a',yellow:'#f2c14e',purple:'#9a7bd6',
  white:'#f4efe4',moss:'#6c9a38',topGrass:'#d2c6ad',face:'#a89c88',water:'#5fb3c8',glow:'#ffd27a',cobble:'#cdbfa5'};
const KMAP={leafsGreen:'leaf',leafsDark:'leaf',grass:'grass',woodBark:'bark',woodBarkDark:'barkDark',wood:'wood',woodDark:'woodDark',woodInner:'woodInner',
  stone:'stone',dirt:'dirt',colorRed:'red',colorRedDark:'red',colorTan:'tan',colorYellow:'yellow',colorPurple:'purple'};
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;

const renderer=G.renderer;

const scene=G.root,REAL=G.scene;REAL.background=new THREE.Color('#f3d2a6');REAL.fog=new THREE.Fog('#f0cfa8',80,180);
const camera=G.camera;
const hemi=new THREE.HemisphereLight(0xfff0dc,0x7a6a50,.47);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffd9a0,.62);sun.position.set(-16,42,22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-50,right:50,top:36,bottom:-36,near:8,far:120});sun.shadow.bias=-.0004;sun.shadow.normalBias=.045;scene.add(sun);
const U={uTime:{value:0},uWind:{value:1}};

// ===== materiales "plastilina" con viento =====
const matCache={};
function flat(hex,sway){const k=hex+(sway||0);if(matCache[k])return matCache[k];
  const m=new THREE.MeshLambertMaterial({color:hex,flatShading:true});
  if(sway){m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uWind=U.uWind;
    sh.vertexShader='uniform float uTime,uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 wp0=modelMatrix*vec4(position,1.);float hh=max(0.,position.y);
      float sw=sin(uTime*1.3+wp0.x*.3+wp0.z*.2)*.6+sin(uTime*2.4+wp0.x*.7)*.25;
      transformed.x+=sw*hh*hh*${(+sway).toFixed(3)}*uWind;transformed.z+=sw*hh*hh*${(+sway*.6).toFixed(3)}*uWind;`);};
    m.customProgramCacheKey=()=>'sway'+sway;}
  return matCache[k]=m;}
const mesh=(geo,hex,sway)=>{const m=new THREE.Mesh(geo,flat(hex,sway));m.castShadow=true;m.receiveShadow=true;return m;};
const add=(m,x,y,z,ry)=>{m.position.set(x,y||0,z);if(ry)m.rotation.y=ry;m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(m);return m;};

// ===== texturas suaves para brillos =====
function radTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,inner);r.addColorStop(.35,inner.replace(/[\d.]+\)$/,'0.45)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
const GLOW=radTex('rgba(255,214,130,1)','rgba(255,180,80,0)');const FLY=radTex('rgba(220,255,140,1)','rgba(160,255,90,0)');
function vGrad(top,bot){const c=document.createElement('canvas');c.width=8;c.height=128;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,0,128);r.addColorStop(0,top);r.addColorStop(1,bot);g.fillStyle=r;g.fillRect(0,0,8,128);return new THREE.CanvasTexture(c);}

// ===== cancha: verde más profundo con musgo y hojas caídas =====
function fieldTex(){const PX=24,W=72*PX,H=48*PX,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX,q=4;
  for(let x=-36,i=0;x<36;x+=q,i++)for(let z=-24,j=0;z<24;z+=q,j++){g.fillStyle=(i+j)%2?'#a4b552':'#91a847';g.fillRect(X(x),Z(z),q*PX+1,q*PX+1);}
  for(let k=0;k<140;k++){const x=Math.random()*W,y=Math.random()*H,r=20+Math.random()*90,gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,Math.random()<.6?'rgba(40,80,30,.10)':'rgba(220,230,150,.06)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  const id=g.getImageData(0,0,W,H),d=id.data;for(let k=0;k<d.length;k+=4){const n=(Math.random()-.5)*6;d[k]+=n;d[k+1]+=n*1.1;d[k+2]+=n*.8;}g.putImageData(id,0,0);
  // hojas caídas: más en las orillas
  const LC=['#c9822f','#d9a441','#a8652a','#b8b04a'];
  for(let k=0;k<0;k++){const edge=Math.random()<.7;let x=Math.random()*W,y=edge?(Math.random()<.5?Math.random()*PX*9:H-Math.random()*PX*9):Math.random()*H;
    g.save();g.translate(x,y);g.rotate(Math.random()*6.28);g.fillStyle=pickC(LC);g.globalAlpha=.55+Math.random()*.3;g.beginPath();g.ellipse(0,0,PX*.22,PX*.11,0,0,7);g.fill();g.restore();}
  g.globalAlpha=1;g.strokeStyle='rgba(236,232,210,.88)';g.lineWidth=PX*.22;
  g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX);g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
  g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();
  for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-11),9*PX,22*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const field=new THREE.Mesh(new THREE.PlaneGeometry(72,48),new THREE.MeshLambertMaterial({map:fieldTex(),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
field.rotation.x=-Math.PI/2;field.receiveShadow=true;scene.add(field);
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#7fa242';g.fillRect(0,0,S,S);
  for(let i=0;i<300;i++){g.fillStyle=pickC(['rgba(120,160,60,.35)','rgba(150,170,70,.3)']);g.beginPath();g.arc(Math.random()*S,Math.random()*S,4+Math.random()*20,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=-.15;m.receiveShadow=true;scene.add(m);})();

// ===== modelos =====
const loader=new THREE.GLTFLoader(),KB={};
const loadK=n=>new Promise(res=>loader.load('assets/env/'+n+'.glb',g=>{KB[n]=g.scene;res();},undefined,()=>{console.warn('falta',n);res();}));
const PLATS=[];
function heightAt(x,z){let h=0;for(const p of PLATS)if(Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2)h=Math.max(h,p.h);return h;}
function kenney(n,scale,x,z,ry,opt){opt=opt||{};const src=KB[n];if(!src)return null;const o=src.clone(true);
  o.traverse(c=>{if(c.isMesh){const key=KMAP[c.material.name];
    if(key||!c.material.map){const col=key?pickC(PAL[key]):'#'+c.material.color.getHexString();c.material=flat(col,(key==='leaf'||key==='grass')?(opt.sway||0):0);}
    c.castShadow=!opt.noShadow;c.receiveShadow=true;}});
  let sc=scale*(opt.var?1+(Math.random()-.5)*opt.var:1);
  if(opt.h){const bb=new THREE.Box3().setFromObject(o);sc=opt.h/Math.max(.01,bb.max.y-bb.min.y)*(opt.var?1+(Math.random()-.5)*opt.var:1);}
  o.scale.setScalar(sc);o.position.set(x,0,z);o.rotation.y=ry==null?Math.random()*6.28:ry;o.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(o);o.position.y=(opt.y!=null?opt.y:heightAt(x,z))-bb.min.y;scene.add(o);return o;}
function plateau(x,z,w,d,h,stone){const src=KB[stone?'cliff_block_stone':'cliff_block_rock'];if(!src)return;const o=src.clone(true);
  o.traverse(c=>{if(c.isMesh){const key=KMAP[c.material.name];c.material=flat(key==='grass'?PAL.topGrass:key==='stone'?pickC(PAL.stone):PAL.face);c.castShadow=true;c.receiveShadow=true;}});
  o.scale.set(w,h,d);o.position.set(x,0,z);scene.add(o);PLATS.push({x,z,w,d,h});}

// ===== piezas propias del bosque =====
const mushrooms=[],glows=[],pools=[];
function giantTrunk(x,z){const g=new THREE.Group(),y=heightAt(x,z),r=1.3+Math.random()*.4,H=16+Math.random()*3;
  const t=mesh(new THREE.CylinderGeometry(r,r*1.25,H,9),PAL.barkDark);t.position.y=H/2;g.add(t);
  const flare=mesh(new THREE.CylinderGeometry(r*1.25,r*2.1,1.8,9),PAL.barkDark);flare.position.y=.9;g.add(flare);
  for(let i=0;i<3;i++){const b=mesh(new THREE.CylinderGeometry(.25,.45,3.5,6),PAL.barkDark);b.position.set(Math.cos(i*2.1)*r*1.3,H*.55+i*2.2,Math.sin(i*2.1)*r*1.3);b.rotation.z=Math.cos(i*2.1)*.9;b.rotation.x=-Math.sin(i*2.1)*.9;g.add(b);}
  for(let i=0;i<3;i++){const c=mesh(new THREE.IcosahedronGeometry(4+Math.random()*1.5,0),pickC(PAL.leaf),.004);c.position.set((Math.random()-.5)*4,H+Math.random()*2,(Math.random()-.5)*4);c.scale.y=.7;g.add(c);}
  for(let i=0;i<4;i++){const m=mesh(new THREE.CylinderGeometry(.5,.5,.12,8),PAL.moss);m.position.set(Math.cos(i*1.6)*r*1.05,2+i*1.4,Math.sin(i*1.6)*r*1.05);m.rotation.z=Math.PI/2;m.rotation.y=-i*1.6;g.add(m);}
  g.position.set(x,y,z);scene.add(g);
  // raíces que bajan por la orilla hasta el pasto (sin pisar la línea)
  const s=Math.sign(z);
  for(let i=0;i<3;i++){const ox=(i-1)*1.4+(Math.random()-.5)*.6;
    const pts=[new THREE.Vector3(x+ox*.6,y+.4,z-s*r*.9),new THREE.Vector3(x+ox,heightAt(x+ox,s*(B+1.2))+.15,s*(B+1.3)),new THREE.Vector3(x+ox*1.4,.9,s*(B+.25)),new THREE.Vector3(x+ox*1.8,.08,s*(HW+.7))];
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.22-.04*i,6),flat(PAL.bark));tube.castShadow=true;tube.receiveShadow=true;scene.add(tube);}
}
function giantMushroom(x,z,S){const g=new THREE.Group();
  const st=mesh(new THREE.CylinderGeometry(.75*S,1.05*S,4.2*S,8),'#efe6d2');st.position.y=2.1*S;g.add(st);
  const ring=mesh(new THREE.CylinderGeometry(1.1*S,.9*S,.3*S,8),'#e4d7bd');ring.position.y=3.1*S;g.add(ring);
  const cap=mesh(new THREE.SphereGeometry(3*S,10,6,0,Math.PI*2,0,Math.PI/2),PAL.red);cap.scale.y=.6;cap.position.y=4.1*S;g.add(cap);
  const under=mesh(new THREE.CylinderGeometry(3*S,.9*S,.45*S,10),'#f2d6b0');under.position.y=4.0*S;g.add(under);
  for(let i=0;i<9;i++){const a=i*2.4,rr=(i%3+1)*.75*S,d=mesh(new THREE.SphereGeometry(.38*S,6,4),PAL.white);const yy=Math.sqrt(Math.max(0,9*S*S-rr*rr))*.6;d.position.set(Math.cos(a)*rr,4.1*S+yy-.05,Math.sin(a)*rr);d.scale.y=.45;g.add(d);}
  g.position.set(x,heightAt(x,z),z);scene.add(g);mushrooms.push(g);return g;}
// v29: el brillo sale del centro de la lámpara (la parte que cuelga del brazo del poste)
function lampHead(o){let best=null;o.updateMatrixWorld(true);o.traverse(c=>{if(!c.isMesh||best)return;const p=c.geometry.attributes.position;let zmax=-1e9;
    for(let i=0;i<p.count;i++)zmax=Math.max(zmax,p.getZ(i));const v=new THREE.Vector3(),acc=new THREE.Vector3();let n=0,ymin=1e9,ymax=-1e9;
    for(let i=0;i<p.count;i++)if(p.getZ(i)>zmax-.16){v.set(p.getX(i),p.getY(i),p.getZ(i));acc.add(v);n++;ymin=Math.min(ymin,v.y);ymax=Math.max(ymax,v.y);}
    if(n){acc.multiplyScalar(1/n);acc.y=(ymin+ymax)/2;best=acc.applyMatrix4(c.matrixWorld);}});return best;}
function lamp(x,z,h){const o=kenney('gy-lightpost-single',1,x,z,Math.random()*6,{h:h||3.4});if(!o)return;
  const head=lampHead(o);if(head)addGlow(head,1.9);}
function lanternOnRock(x,z){const r=kenney('gy-rocks',1,x,z,null,{h:.9,y:0});const y=r?new THREE.Box3().setFromObject(r).max.y:0;
  const l=kenney('gy-lantern-candle',1,x,z,null,{h:.8,y});if(l){const bb=new THREE.Box3().setFromObject(l);addGlow(new THREE.Vector3(x,(bb.min.y+bb.max.y)/2,z),1.4);}}
function addGlow(p,size){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:PAL.glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));
  sp.position.copy(p);sp.scale.setScalar(size);scene.add(sp);glows.push({sp,base:size,ph:Math.random()*6});
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(size*2.6,size*2.6),new THREE.MeshBasicMaterial({map:GLOW,color:'#ffcf80',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.35}));
  pool.rotation.x=-Math.PI/2;pool.position.set(p.x,heightAt(p.x,p.z)+.06,p.z);scene.add(pool);pools.push({m:pool,ph:Math.random()*6});}
// río con agua que corre (detrás de la portería de arriba)
let waterTex=null;
function stream(x,z1,z2,w){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle=PAL.water;g.fillRect(0,0,64,256);
  for(let i=0;i<70;i++){g.strokeStyle='rgba(255,255,255,'+(.15+Math.random()*.25)+')';g.lineWidth=1+Math.random()*2;const y=Math.random()*256,x0=Math.random()*64;g.beginPath();g.moveTo(x0,y);g.lineTo(x0+6+Math.random()*14,y+2);g.stroke();}
  waterTex=new THREE.CanvasTexture(c);waterTex.wrapS=waterTex.wrapT=THREE.RepeatWrapping;waterTex.repeat.set(1,(z2-z1)/6);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,z2-z1),new THREE.MeshLambertMaterial({map:waterTex,transparent:true,opacity:.92}));m.rotation.x=-Math.PI/2;m.position.set(x,.04,(z1+z2)/2);m.receiveShadow=true;scene.add(m);
  const bank=new THREE.Mesh(new THREE.PlaneGeometry(w+1.4,z2-z1),new THREE.MeshLambertMaterial({color:'#4f3c2a'}));bank.rotation.x=-Math.PI/2;bank.position.set(x,.02,(z1+z2)/2);scene.add(bank);}
// rayos de luz entre los árboles y neblina
const rays=[],mists=[];
function ray(x,z,h,rot){const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,h),new THREE.MeshBasicMaterial({map:vGrad('rgba(255,240,190,0)','rgba(255,236,170,1)'),transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  m.position.set(x,h/2,z);m.rotation.set(0,rot||0,.32);scene.add(m);rays.push({m,ph:Math.random()*6});}
function mist(x,z,w,rot){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,1.6),new THREE.MeshBasicMaterial({map:vGrad('rgba(235,245,235,0)','rgba(235,245,235,1)'),transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));
  m.position.set(x,.75,z);m.rotation.y=rot||0;scene.add(m);mists.push({m,ph:Math.random()*6});}
// luciérnagas, hojas y pájaros
const fireflies=[],leaves=[];let treeTops=[];
function makeFirefly(){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FLY,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(.55);
  const top=Math.random()<.35;const u={cx:top?L+6+Math.random()*10:(Math.random()-.5)*2*(L+6),cz:top?(Math.random()-.5)*20:(Math.random()<.5?-1:1)*(B+.5+Math.random()*5),r:.6+Math.random()*1.6,sp:.25+Math.random()*.4,ph:Math.random()*6};
  u.base=heightAt(u.cx,u.cz)+.6+Math.random()*1.8;sp.userData=u;scene.add(sp);fireflies.push(sp);}
function makeLeaf(){const m=new THREE.Mesh(new THREE.PlaneGeometry(.24,.16),new THREE.MeshLambertMaterial({color:pickC(['#c9822f','#d9a441','#4b8a40','#a8652a']),side:THREE.DoubleSide}));m.visible=false;scene.add(m);leaves.push(m);m.userData={life:0};}

// ===== piezas del pueblo =====
const T_='town/';
function cobblePlane(x1,x2,z1,z2){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#b8a98e';g.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=32)for(let x=((y/32)%2)*16-16;x<256;x+=32){g.fillStyle=pickC(['#c4b59a','#d6c9b0','#bcad93','#cbbda3']);g.beginPath();if(g.roundRect)g.roundRect(x+2,y+2,28,28,7);else g.rect(x+2,y+2,28,28);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set((x2-x1)/4,(z2-z1)/4);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,z2-z1),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set((x1+x2)/2,.012,(z1+z2)/2);m.receiveShadow=true;scene.add(m);}
function piece(n,cx,cy,cz,S,rot){const src=KB[T_+n];if(!src)return null;const o=src.clone(true);o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  o.scale.setScalar(S);o.position.set(cx,cy,cz);o.rotation.y=rot||0;scene.add(o);return o;}
const smokes=[];
// casa de 1 cuadro (3.4 m): 4 paredes por piso + techo; el primer muro (k=0) es el frente con la puerta
function house(x,z,face,floors,wood){const S=3.4,y0=heightAt(x,z),W=wood?'wall-wood':'wall';
  for(let f=0;f<floors;f++)for(let k=0;k<4;k++){let n=W;
    if(k===0)n=f===0?W+'-door':pickC([W+'-window-shutters',W+'-window-round']);else if(Math.random()<.65)n=pickC([W+'-window-shutters',W+'-window-round',W]);
    piece(n,x,y0+f*S,z,S,face+k*Math.PI/2);
    for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]])if(k===0)piece(wood?'pillar-wood':'pillar-stone',x+a*S*.5,y0+f*S,z+b*S*.5,S,0);}
  piece(Math.random()<.5?'roof-point':'roof-high-point',x,y0+floors*S,z,S,face);
  if(Math.random()<.55){piece('chimney',x,y0+floors*S,z,S,face+Math.PI*(Math.random()<.5?.5:-.5));smokes.push({x:x+(Math.random()-.5)*1.2,y:y0+floors*S+3,z:z+(Math.random()-.5)*1.2});}}
function clothMat2(col){const m=new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uWind=U.uWind;sh.vertexShader='uniform float uTime,uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float k=clamp(1.-uv.y,0.,1.);transformed.z+=(sin(uTime*2.4+position.x*3.+uv.y*3.)*.14*k)*uWind;`);};m.customProgramCacheKey=()=>'cloth2';return m;}
function laundry(x1,z1,x2,z2,y){const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push(new THREE.Vector3(x1+(x2-x1)*t,y-Math.sin(t*Math.PI)*.5,z1+(z2-z1)*t));}
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.02,4),flat('#f4efe4')));
  const cols=['#e0564a','#f4efe4','#5fa0d8','#f2c14e','#7fbf6a'];
  for(let i=1;i<6;i++){const t=i/6,p=new THREE.Vector3(x1+(x2-x1)*t,y-Math.sin(t*Math.PI)*.5,z1+(z2-z1)*t);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(.7,.85,4,6),clothMat2(pickC(cols)));m.position.set(p.x,p.y-.45,p.z);m.rotation.y=-Math.atan2(z2-z1,x2-x1);m.castShadow=true;scene.add(m);}}
const mills=[];
function windmill(x,z,e){const S=3.4,y0=heightAt(x,z),face=e>0?Math.PI:0;for(let f=0;f<3;f++)for(let k=0;k<4;k++)piece(f===0&&k===0?'wall-door':(k%2?'wall-window-round':'wall'),x,y0+f*S,z,S,face+k*Math.PI/2);
  piece('roof-high-point',x,y0+3*S,z,S,face);const m=piece('windmill',x-e*S*.62,y0+2.55*S,z,S*1.15,0);if(m)mills.push(m);
  flagOn(x,y0+3*S+2.6,z);}
function cat(x,z,y,col){const g=new THREE.Group();col=col||pickC(['#e08a3a','#3a3a3a','#d9d2c4','#8a8a8a']);
  const body=ball(.3,col,1,1,1.5);body.position.y=.32;g.add(body);const head=ball(.22,col);head.position.set(0,.62,.34);g.add(head);
  for(const s of [-1,1]){const e=mesh(new THREE.ConeGeometry(.08,.18,4),col);e.position.set(s*.12,.82,.32);g.add(e);const eye=ball(.04,'#2a5a2a');eye.position.set(s*.08,.66,.53);g.add(eye);}
  const tail=new THREE.Group();tail.position.set(0,.36,-.42);g.add(tail);for(let i=0;i<5;i++){const t=ball(.06,col);t.position.set(0,i*.12,-i*.04);tail.add(t);}
  const y0=y!=null?y:heightAt(x,z);g.position.set(x,y0,z);g.rotation.y=Math.random()*6.28;scene.add(g);
  critters.push({g,tail,head,y0,upd(c,dt,T,gk){c.tail.rotation.z=Math.sin(T*2.2+c.g.position.x)*.5;c.tail.rotation.x=-.3+Math.sin(T*1.3)*.15;c.head.rotation.y=Math.sin(T*.7+c.g.position.z)*.5;
    c.g.position.y=c.y0+(gk>0?Math.abs(Math.sin(T*10))*.35*gk:0);}});}
function pigeon(x,z){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const col=pickC(['#9aa0aa','#8a909a','#b0b4bc']);
  const body=ball(.16,col,1,.9,1.4);body.position.y=.18;b.add(body);const head=ball(.09,'#6f7a8a');head.position.set(0,.32,.2);b.add(head);
  const beak=mesh(new THREE.ConeGeometry(.025,.07,4),'#e8a33a');beak.rotation.x=Math.PI/2;beak.position.set(0,.31,.3);b.add(beak);
  const wings=[];for(const s of [-1,1]){const w=ball(.1,col,.35,.8,1.4);w.position.set(s*.13,.2,-.02);b.add(w);wings.push(w);}
  const y0=heightAt(x,z);g.position.set(x,y0,z);g.rotation.y=Math.random()*6.28;scene.add(g);
  critters.push({g,head,wings,x0:x,z0:z,y0,fly:0,t:Math.random()*2,upd(c,dt,T,gk){if(gk>.95&&c.fly<=0)c.fly=5;
    if(c.fly>0){c.fly-=dt;const k=c.fly>2.5?(5-c.fly)/2.5:c.fly/2.5;c.g.position.set(c.x0+Math.sin(T*.8+c.x0)*4*k,c.y0+k*7,c.z0+Math.cos(T*.8+c.z0)*4*k);
      const f=Math.sin(T*30)*.9;c.wings[0].rotation.z=f;c.wings[1].rotation.z=-f;}
    else{c.g.position.set(c.x0,c.y0,c.z0);c.wings[0].rotation.z=c.wings[1].rotation.z=0;c.t-=dt;c.head.position.y=.32-Math.max(0,Math.sin(T*7+c.x0))*.12;if(c.t<=0){c.t=1+Math.random()*3;c.g.rotation.y+=(Math.random()-.5)*2;}}}});}
const smokeSprites=[],fountains=[],drops=[],signs=[],pennants=[],flies=[],birds=[];
const DROP=radTex('rgba(220,240,255,1)','rgba(200,230,255,0)');
function bunting(x1,z1,x2,z2,y){const n=Math.round(Math.hypot(x2-x1,z2-z1)/1.1),cols=['#d9483f','#f2c14e','#3f6fb8','#f4efe4','#5fa85a'];
  const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push(new THREE.Vector3(x1+(x2-x1)*t,y-Math.sin(t*Math.PI)*.8,z1+(z2-z1)*t));}
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.025,4),flat('#8a6a48')));
  for(let i=0;i<n;i++){const t=(i+.5)/n,p=new THREE.Vector3(x1+(x2-x1)*t,y-Math.sin(t*Math.PI)*.8,z1+(z2-z1)*t);const sh=new THREE.Shape();sh.moveTo(-.32,0);sh.lineTo(.32,0);sh.lineTo(0,-.6);sh.closePath();
    const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshLambertMaterial({color:cols[i%cols.length],side:THREE.DoubleSide}));m.position.copy(p);m.rotation.y=-Math.atan2(z2-z1,x2-x1);m.userData.ph=i*.7;scene.add(m);pennants.push(m);}}
function flagOn(x,y,z){const p=mesh(new THREE.CylinderGeometry(.05,.05,1.6,5),'#5e3f2a');p.position.set(x,y,z);scene.add(p);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.65,6,3),clothMat2('#d9483f'));f.position.set(x,y+.45,z+.58);f.rotation.y=Math.PI/2;scene.add(f);}
function hangSign(x,y0,z,e){const g=new THREE.Group();g.position.set(x,y0,z);const arm=mesh(new THREE.BoxGeometry(.08,.08,1.1),'#4a3122');arm.position.z=.5;g.add(arm);
  const sw=new THREE.Group();sw.position.z=.9;g.add(sw);const bd=mesh(new THREE.BoxGeometry(.08,.7,.9),pickC(['#d9483f','#3f6fb8','#5fa85a','#f2c14e']));bd.position.y=-.45;sw.add(bd);
  for(const s of [-.3,.3]){const ch=mesh(new THREE.BoxGeometry(.02,.15,.02),'#3a3a3a');ch.position.set(0,-.05,s);sw.add(ch);}g.rotation.y=e>0?0:Math.PI;scene.add(g);signs.push({sw,ph:Math.random()*6});}
function makeFly(){const g=new THREE.Group(),col=pickC(['#f2c14e','#f4efe4','#f29a4b','#8fd0ff']);
  for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.CircleGeometry(.16,5),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));w.position.x=s*.13;w.userData.s=s;g.add(w);}
  const e=Math.random()<.5?1:-1;g.userData={cx:e*(L+5.3),cz:(Math.random()-.5)*7,r:1+Math.random()*1.6,sp:.4+Math.random()*.5,ph:Math.random()*6};scene.add(g);flies.push(g);}
function makeBird(){const g=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:'#3a3a48',side:THREE.DoubleSide});
  for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.7,.18),m);w.position.x=s*.35;w.userData.s=s;g.add(w);}g.visible=false;scene.add(g);birds.push(g);}
function launchBird(b){b.visible=true;const s=Math.random()<.5?-1:1;b.userData={x:L+10+Math.random()*10,y:10+Math.random()*4,z:(Math.random()-.5)*30,vx:-7-Math.random()*4,vz:s*(2+Math.random()*3),ph:Math.random()*6};}

// ===== armar la arena =====
async function build(){
  const town=['wall','wall-window-shutters','wall-window-round','wall-door','wall-wood','wall-wood-window-shutters','wall-wood-door','wall-wood-window-round','roof-point','roof-high-point','chimney','pillar-stone','pillar-wood',
    'fountain-round','fountain-center','stall-red','stall-green','stall-bench','stall-stool','cart','cart-high','lantern','hedge','hedge-large','banner-red','banner-green','windmill','tree','tree-high-round','tree-crooked','rock-large','fence'].map(n=>T_+n);
  await Promise.all(['cliff_block_rock','cliff_block_stone','flower_redA','flower_yellowA','flower_purpleA','plant_bush','plant_bushDetailed','tree_oak','tree_default','tree_fat','stump_round'].concat(town).map(loadK));
  const SMK=radTex('rgba(240,240,240,.9)','rgba(240,240,240,0)');
  // banqueta elevada de piedra a los lados y en las esquinas (el borde alto)
  const TH=1.45;
  for(const s of [-1,1]){for(let x=-E-9;x<=E+9;x+=2.5)for(let r=0;r<4;r++)plateau(x,s*(B+1.25+r*2.5),2.52,2.52,TH,true);
    for(const e of [-1,1])for(let z=GW+7.5;z<=B+.5;z+=2.5)for(let k=0;k<3;k++)plateau(e*(E+2.2+k*2.5),s*z,2.52,2.52,TH,true);}
  cobblePlane(L+1.3,L+30,-B-10,B+10);cobblePlane(-L-26,-L-1.3,-B-10,B+10);
  for(const s of [-1,1]){
    // pretil, faroles, banderas y puestos sobre la banqueta
    for(let x=-E-7;x<=E+7;x+=3.4)piece('fence',x,TH,s*(B+1.78),3.4,s>0?Math.PI/2:-Math.PI/2);
    for(let x=-E+3;x<=E-3;x+=9)piece('lantern',x,TH,s*(B+.9),2.2,0);
    for(let x=-E+7.5;x<=E-7;x+=18)piece(Math.random()<.5?'banner-red':'banner-green',x,TH,s*(B+1.95),3.4,s>0?Math.PI/2:-Math.PI/2);
    for(let x=-E+1;x<=E;x+=6.5+Math.random()*3){const r=Math.random();
      if(r<.35)piece(Math.random()<.5?'stall-red':'stall-green',x,TH,s*(B+2.6),3.2,s>0?-Math.PI/2:Math.PI/2);
      else if(r<.55)piece(Math.random()<.5?'cart':'cart-high',x,TH,s*(B+2.4),3.2,Math.random()*6);
      else if(r<.75)piece('stall-bench',x,TH,s*(B+1.6),3.4,0);
      else kenney(pickC(['flower_redA','flower_yellowA','flower_purpleA']),3.4,x,s*(B+1.4),null,{sway:.5,noShadow:true});}
    // casas en fila
    for(let x=-E-6;x<=E+6;x+=4.2+Math.random()*1.4){if(Math.random()<.15)continue;house(x,s*(B+7.8),s>0?Math.PI/2:-Math.PI/2,Math.random()<.45?2:1,Math.random()<.4);}
    for(let x=-E-6;x<=E+6;x+=3+Math.random()*3)kenney(pickC(['tree_oak','tree_default','tree_fat']),4.6,x,s*(B+13+Math.random()*8),null,{sway:.035,var:.3});
    for(let x=-E+5;x<=E-5;x+=21)laundry(x,s*(B+5.6),x+4.2,s*(B+5.6),TH+3.3);
  }
  // los dos extremos iguales (local y visita), en espejo
  for(const e of [1,-1]){const X=d=>e*(L+d),Z=z=>e*z,face=e>0?Math.PI:0,side=e>0?-Math.PI/2:Math.PI/2;
    piece('fountain-round',X(10),0,0,3.2,0);piece('fountain-center',X(10),0,0,3.2,0);fountains.push(new THREE.Vector3(X(10),0,0));
    windmill(X(20),Z(-9),e);house(X(19),Z(8.5),face,2,false);house(X(23.5),Z(5),face,1,true);house(X(24),Z(-2.5),face,2,true);
    piece('stall-bench',X(6.5),0,-6.5,3.4,0);piece('stall-bench',X(6.5),0,6.5,3.4,0);
    for(const z of [-8,8])piece('lantern',X(4.2),0,z,2.2,0);
    piece('banner-red',X(4.7),0,Z(-GW-2),3.4,face);piece('banner-green',X(4.7),0,Z(GW+2),3.4,face);
    piece('tree',X(13.5),0,Z(-11),3,0);piece('tree-high-round',X(13.5),0,Z(11),3,0);
    piece('stall-red',X(7),0,Z(-12.2),3.2,side);piece('stall-green',X(7),0,Z(12.2),3.2,side);piece('cart',X(3.6),0,Z(-6.4),3.2,e>0?.4+Math.PI:.4);
    piece('stall-stool',X(9),0,Z(-14),3.4,0);piece('stall-stool',X(9.8),0,Z(-14.6),3.4,0);
    for(const z of [-3.5,3.5])piece('hedge',X(4.4),0,z,3.4,face);
    for(let k=0;k<9;k++){const zz=-3.6+k*.9;kenney(['flower_redA','flower_yellowA','flower_purpleA'][k%3],3.4,X(5.3),zz,k*1.3,{sway:.5,noShadow:true});}
    bunting(X(4.2),-8,X(4.2),8,4.6);
    for(const [a,b] of [[19,8.5],[24,-2.5]])hangSign(X(a)-e*1.95,Z(b)+1.1,4.2,e);
    for(let k=0;k<8;k++)pigeon(X(6.4+(k%4)*2.3),Z((k<4?-1:1)*(4.9+(k%2)*.9)));
    cat(X(10),Z(3.05),.9);cat(X(7),Z(-12.2),null);
  }
  // palomas y gatos en los lados, iguales de cada lado
  for(const s of [-1,1]){for(let k=0;k<4;k++)pigeon(-L+8+k*16,s*(B+4.6));cat(-L+10,s*(B+.9),TH);cat(L-10,s*(B+.9),TH);}
  for(let i=0;i<10;i++)makeFly();for(let i=0;i<5;i++)makeBird();
  for(let i=0;i<70;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:DROP,transparent:true,depthWrite:false,opacity:.0}));sp.scale.setScalar(.22);scene.add(sp);drops.push({sp,life:0});}
  for(let i=0;i<40;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SMK,transparent:true,depthWrite:false,opacity:0}));sp.scale.setScalar(1.2);scene.add(sp);smokeSprites.push({sp,life:0});}
  
}
function gyH(){return 7+Math.random()*3;}


// ===== detalles detrás de las porterías: animalitos, bancas, banderas, casita, letrero =====
const critters=[];
const ball=(r,hex,w,h,d)=>{const m=mesh(new THREE.IcosahedronGeometry(r,1),hex);m.scale.set(w||1,h||1,d||1);return m;};
function rabbit(x,z,col){const g=new THREE.Group(),b=new THREE.Group();g.add(b);col=col||'#c9b29a';
  const body=ball(.42,col,1,.85,1.25);body.position.y=.42;b.add(body);const head=ball(.28,col);head.position.set(0,.78,.42);b.add(head);
  for(const s of [-1,1]){const e=ball(.09,col,1,3.2,.6);e.position.set(s*.11,1.12,.36);e.rotation.z=s*.15;b.add(e);const ei=ball(.05,'#e9b8b0',1,2.6,.4);ei.position.set(s*.11,1.12,.41);ei.rotation.z=s*.15;b.add(ei);
    const eye=ball(.045,'#1c1c1c');eye.position.set(s*.13,.84,.62);b.add(eye);}
  const tail=ball(.13,'#f4f1e8');tail.position.set(0,.5,-.55);b.add(tail);const nose=ball(.04,'#e58a8a');nose.position.set(0,.76,.69);b.add(nose);
  g.position.set(x,heightAt(x,z),z);g.rotation.y=Math.random()*6.28;scene.add(g);
  critters.push({g,b,hx:x,hz:z,t:Math.random()*3,hop:0,upd(c,dt,T,gk){c.t-=dt;if(c.hop>0){c.hop-=dt;const k=1-c.hop/.45;c.b.position.y=Math.sin(k*Math.PI)*(gk>0?1.1:.45);
      c.g.position.x+=Math.sin(c.g.rotation.y)*dt*2.2;c.g.position.z+=Math.cos(c.g.rotation.y)*dt*2.2;}else{c.b.position.y=0;c.b.children[1].position.y=.78+Math.max(0,Math.sin(T*9))*.04;}
    if(c.t<=0||(gk>.95&&c.hop<=0)){c.t=1.5+Math.random()*3;const back=Math.hypot(c.g.position.x-c.hx,c.g.position.z-c.hz)>2.2;c.g.rotation.y=back?Math.atan2(c.hx-c.g.position.x,c.hz-c.g.position.z):c.g.rotation.y+(Math.random()-.5)*2.4;c.hop=.45;}}});}
function squirrel(x,z,y){const g=new THREE.Group(),col='#b8682e';const body=ball(.22,col,1,1.1,1.3);body.position.y=.28;g.add(body);
  const head=ball(.16,col);head.position.set(0,.5,.22);g.add(head);for(const s of [-1,1]){const e=ball(.05,col,1,1.6,.6);e.position.set(s*.08,.66,.2);g.add(e);const eye=ball(.03,'#1c1c1c');eye.position.set(s*.08,.53,.35);g.add(eye);}
  const tail=new THREE.Group();tail.position.set(0,.3,-.25);g.add(tail);for(let i=0;i<4;i++){const t=ball(.16-i*.01,'#c97a3a');t.position.set(0,i*.17,-Math.sin(i*.6)*.18);tail.add(t);}
  g.position.set(x,y!=null?y:heightAt(x,z),z);g.rotation.y=Math.random()*6.28;scene.add(g);
  critters.push({g,tail,t:0,upd(c,dt,T,gk){c.tail.rotation.x=Math.sin(T*6)*.25+(gk>0?Math.sin(T*25)*.4:0);c.g.children[1].rotation.y=Math.sin(T*1.3)*.6;c.g.position.y+= (gk>0?Math.abs(Math.sin(T*14))*.04:0);}});}
function frog(x,z){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const body=ball(.3,'#5aa843',1.2,.7,1.1);body.position.y=.2;b.add(body);
  for(const s of [-1,1]){const e=ball(.1,'#5aa843');e.position.set(s*.17,.42,.18);b.add(e);const p=ball(.055,'#1c1c1c');p.position.set(s*.18,.46,.25);b.add(p);
    const l=ball(.12,'#4c9638',1.6,.5,1);l.position.set(s*.3,.08,-.1);b.add(l);}
  g.position.set(x,.06,z);scene.add(g);critters.push({g,b,t:2+Math.random()*4,j:0,upd(c,dt,T,gk){c.t-=dt;if(c.j>0){c.j-=dt;c.b.position.y=Math.sin((1-c.j/.6)*Math.PI)*(gk>0?1.4:.7);}else c.b.position.y=0;
    c.b.children[0].scale.y=.7+Math.sin(T*5)*.04;if(c.t<=0||(gk>.95&&c.j<=0)){c.t=3+Math.random()*5;c.j=.6;c.g.rotation.y+=(Math.random()-.5)*2;}}});}
function owl(x,z,y){const g=new THREE.Group();const body=ball(.42,'#7a5a3e',1,1.3,.95);body.position.y=.55;g.add(body);const belly=ball(.3,'#d9c29a',1,1.2,.5);belly.position.set(0,.5,.22);g.add(belly);
  const head=new THREE.Group();head.position.y=1.08;g.add(head);head.add(ball(.36,'#7a5a3e',1.1,.9,1));const face=ball(.28,'#e8d6b0',1.2,.9,.4);face.position.z=.22;head.add(face);
  const eyes=[];for(const s of [-1,1]){const e=ball(.1,'#ffcf3a');e.position.set(s*.13,.03,.32);head.add(e);const p=ball(.05,'#1c1c1c');p.position.set(s*.13,.03,.4);head.add(p);eyes.push(e,p);
    const tuft=mesh(new THREE.ConeGeometry(.08,.25,4),'#5e4430');tuft.position.set(s*.2,.33,0);tuft.rotation.z=-s*.4;head.add(tuft);}
  const beak=mesh(new THREE.ConeGeometry(.05,.12,4),'#e8a33a');beak.rotation.x=Math.PI/2+.4;beak.position.set(0,-.07,.38);head.add(beak);
  const wings=[];for(const s of [-1,1]){const w=ball(.24,'#6a4c33',.45,1.1,.9);w.position.set(s*.4,.6,0);g.add(w);wings.push(w);}
  g.position.set(x,y,z);g.rotation.y=-Math.PI/2;scene.add(g);
  critters.push({g,head,eyes,wings,t:3,upd(c,dt,T,gk){c.head.rotation.y=Math.sin(T*.5)*1.1;const blink=(T%4.3)<.15;for(const e of c.eyes)e.scale.y=blink?.15:1;
    const f=gk>0?Math.sin(T*22)*.9*gk:0;c.wings[0].rotation.z=f;c.wings[1].rotation.z=-f;c.g.position.y=y+(gk>0?Math.abs(Math.sin(T*11))*.3*gk:0);}});}
function snail(x,z,y){const g=new THREE.Group();const body=ball(.14,'#c9b98a',2.4,.6,1);body.position.y=.08;g.add(body);
  const sh=mesh(new THREE.TorusGeometry(.17,.1,5,8),'#b8743a');sh.position.set(-.05,.26,0);g.add(sh);const c2=ball(.1,'#9a5a2a');c2.position.set(-.05,.26,0);g.add(c2);
  for(const s of [-1,1]){const a=mesh(new THREE.CylinderGeometry(.015,.015,.18,4),'#c9b98a');a.position.set(.3,.22,s*.05);a.rotation.z=-.4;g.add(a);}
  g.position.set(x,y,z);scene.add(g);critters.push({g,x0:x,upd(c,dt,T){c.g.position.x=c.x0+Math.sin(T*.08)*.8;c.g.rotation.y=Math.cos(T*.08)>0?0:Math.PI;}});}
function logBench(x,z,ry){const g=new THREE.Group();for(const s of [-1,1]){const st=mesh(new THREE.CylinderGeometry(.32,.36,.55,8),PAL.bark);st.position.set(s*1.1,.28,0);g.add(st);}
  const seat=mesh(new THREE.CylinderGeometry(.34,.34,3,8,1,false,0,Math.PI),PAL.wood);seat.rotation.z=Math.PI/2;seat.rotation.x=Math.PI;seat.position.y=.58;g.add(seat);
  const top=mesh(new THREE.BoxGeometry(3,.05,.66),PAL.woodInner);top.position.y=.58;g.add(top);return add(g,x,heightAt(x,z),z,ry);}
function clothMat(c1,c2){const c=document.createElement('canvas');c.width=96;c.height=160;const x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,96,160);x.fillStyle=c2;x.fillRect(0,0,96,14);
  x.beginPath();x.moveTo(0,160);x.lineTo(48,128);x.lineTo(96,160);x.fill();x.beginPath();x.moveTo(48,40);x.lineTo(70,70);x.lineTo(48,104);x.lineTo(26,70);x.closePath();x.fill();
  const m=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uWind=U.uWind;sh.vertexShader='uniform float uTime,uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float k=clamp(1.-uv.y,0.,1.);transformed.z+=(sin(uTime*2.6+uv.y*4.+position.x*2.)*.18*k+sin(uTime*4.3+uv.y*7.)*.05*k)*uWind;`);};m.customProgramCacheKey=()=>'cloth';return m;}
function flagPole(x,z,c1,c2){const g=new THREE.Group();const p=mesh(new THREE.CylinderGeometry(.07,.09,3.6,6),PAL.woodDark);p.position.y=1.8;g.add(p);
  const k=mesh(new THREE.IcosahedronGeometry(.13,0),PAL.yellow);k.position.y=3.65;g.add(k);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.5,6,8),clothMat(c1,c2));f.position.set(0,2.75,.5);f.rotation.y=Math.PI/2;f.castShadow=true;g.add(f);
  const bar=mesh(new THREE.BoxGeometry(.05,.05,1.05),PAL.woodDark);bar.position.set(0,3.5,.5);g.add(bar);return add(g,x,heightAt(x,z),z,0);}
function fairyHouse(x,z){const g=new THREE.Group();const st=mesh(new THREE.CylinderGeometry(.9,1.05,1.5,9),PAL.bark);st.position.y=.75;g.add(st);
  const roof=mesh(new THREE.ConeGeometry(1.35,1.2,9),PAL.red);roof.position.y=2.05;g.add(roof);
  for(let i=0;i<5;i++){const d=ball(.12,PAL.white,1,.5,1);const a=i*1.3;d.position.set(Math.cos(a)*.75,1.85+(i%2)*.25,Math.sin(a)*.75);g.add(d);}
  const door=mesh(new THREE.BoxGeometry(.08,.7,.45),'#3a2a1c');door.position.set(-.93,.4,0);g.add(door);
  const win=new THREE.Mesh(new THREE.CircleGeometry(.17,8),new THREE.MeshBasicMaterial({color:'#ffd27a'}));win.position.set(-.9,1.05,.38);win.rotation.y=-Math.PI/2;g.add(win);
  add(g,x,heightAt(x,z),z,0);addGlow(new THREE.Vector3(x-1.0,heightAt(x,z)+1.05,z+.38),.9);}
function signpost(x,z,a,b){const g=new THREE.Group();const p=mesh(new THREE.CylinderGeometry(.08,.1,2.4,6),PAL.woodDark);p.position.y=1.2;g.add(p);
  [[a,1.95,.25],[b,1.45,-.25]].forEach(([txt,y,rot],i)=>{const c=document.createElement('canvas');c.width=192;c.height=48;const x2=c.getContext('2d');x2.fillStyle=PAL.woodInner;x2.fillRect(0,0,192,48);
    x2.fillStyle='#4a3122';x2.font='26px "Lilita One",sans-serif';x2.textAlign='center';x2.textBaseline='middle';x2.fillText(txt,96,26);
    const bd=new THREE.Mesh(new THREE.BoxGeometry(1.5,.38,.07),[flat(PAL.wood),flat(PAL.wood),flat(PAL.wood),flat(PAL.wood),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)})]);
    bd.position.set(i?-.35:.35,y,0);bd.rotation.y=rot;bd.castShadow=true;g.add(bd);});return add(g,x,heightAt(x,z),z,-Math.PI/2);}
function addDetails(){
  const RX=L+7.5;
  // arriba, entre la portería y el río
  logBench(L+4.2,-9.2,Math.PI/2);flagPole(L+3.2,-GW-1.6,'#2f6b3a','#e8c25a');flagPole(L+3.2,GW+1.6,'#2f6b3a','#e8c25a');
  
  frog(RX+.3,-6.5);frog(RX-.4,7.5);
  kenney('stump_oldTall',3.4,L+10.5,-9.5,null,{});
  kenney('mushroom_tanGroup',3.2,L+5.2,10,null,{});
  for(let i=0;i<7;i++){const a=i/7*6.28;kenney('mushroom_redTall',3,L+16+Math.cos(a)*1.6,-9+Math.sin(a)*1.6,null,{y:0});}
  addGlow(new THREE.Vector3(L+16,.6,-9),2.2);fairyHouse(L+15.5,9.5);
  // abajo, detrás de la portería de la cámara
  logBench(-E-6.6,-2.6,Math.PI/2);logBench(-E-6.6,2.6,Math.PI/2);flagPole(-E-2.6,-GW-1.6,'#7a2d2a','#e8c25a');flagPole(-E-2.6,GW+1.6,'#7a2d2a','#e8c25a');
  
  fairyHouse(-E-9.5,7.5);signpost(-E-2.4,-14.2,'BOSQUE','▲ GOL');
  for(let i=0;i<6;i++){const a=i/6*6.28;kenney('mushroom_redTall',2.6,-E-9.5+Math.cos(a)*1.3,-1+Math.sin(a)*1.3+0,null,{y:0});}addGlow(new THREE.Vector3(-E-9.5,.5,-1),1.8);
}


// ===== animales animados (Quaternius, CC0) =====
const AN={},beasts=[];
const loadA=n=>new Promise(res=>loader.load('assets/env/animals/'+n+'.glb',g=>{AN[n]=g;res();},undefined,()=>{console.warn('falta animal',n);res();}));
function beast(n,x,z,S,ry,kind){const src=AN[n];if(!src)return;const o=THREE.SkeletonUtils.clone(src.scene);
  o.traverse(c=>{if(c.isMesh){const col=c.material.color.clone().convertLinearToSRGB();c.material=new THREE.MeshLambertMaterial({color:col,flatShading:true,skinning:!!c.isSkinnedMesh});c.castShadow=true;c.receiveShadow=true;c.frustumCulled=false;}});
  o.scale.setScalar(S);o.position.set(x,heightAt(x,z),z);o.rotation.y=ry;scene.add(o);
  const mixer=new THREE.AnimationMixer(o),clip=k=>src.animations.find(a=>a.name===k);
  const b={o,mixer,clip,kind,cur:null,t:0,x0:x,z0:z,ry0:ry,dir:1,react:0};
  b.play=(k,once)=>{const c=clip(k);if(!c)return;const a=mixer.clipAction(c);if(b.cur===a&&!once)return;a.reset();a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=!!once;
    if(b.cur)a.crossFadeFrom(b.cur,.35,false);a.play();b.cur=a;};
  b.play(kind==='fox'?'Idle':'Eating');mixer.update(Math.random()*5);beasts.push(b);}
function beastsUpdate(dt,gk){for(const b of beasts){b.mixer.update(dt);b.t-=dt;
  if(gk>.95&&b.react<=0){b.react=2.2;b.play(b.kind==='fox'?(b.clip('Jump_ToIdle')?'Jump_ToIdle':'Idle_HitReact1'):'Idle_HitReact1',true);continue;}
  if(b.react>0){b.react-=dt;if(b.react<=0)b.t=0;continue;}
  if(b.t>0){if(b.walk){b.o.position.x+=Math.sin(b.o.rotation.y)*dt*1.1;b.o.position.z+=Math.cos(b.o.rotation.y)*dt*1.1;b.o.position.y=heightAt(b.o.position.x,b.o.position.z);}continue;}
  b.walk=false;const r=Math.random();
  if(b.kind==='fox'){if(r<.35){b.walk=true;const far=Math.hypot(b.o.position.x-b.x0,b.o.position.z-b.z0)>2;b.o.rotation.y=far?Math.atan2(b.x0-b.o.position.x,b.z0-b.o.position.z):b.o.rotation.y+(Math.random()-.5)*2;b.play('Walk');b.t=2+Math.random()*1.5;}
    else{b.play(r<.7?'Idle':(b.clip('Idle_2_HeadLow')?'Idle_2_HeadLow':'Idle_2'));b.t=3+Math.random()*4;}}
  else{b.play(r<.55?'Eating':r<.8?'Idle':(b.clip('Idle_Headlow')?'Idle_Headlow':'Idle_2'));b.t=4+Math.random()*5;}}}

// ===== cámara y animación =====
let mode='partido',t0=0,goalT=0;

function update(dt){dt=Math.min(.05,dt);U.uTime.value+=dt;t0+=dt;const T=U.uTime.value;
  U.uWind.value=1+(goalT>0?goalT*.8:0);const gk=goalT>0?goalT/2.8:0;if(goalT>0)goalT-=dt;
  for(const f of fireflies){const u=f.userData,a=T*u.sp+u.ph;let y=u.base+Math.sin(a*1.7)*.5,r=u.r;if(gk>0){y+=gk*4*Math.abs(Math.sin(a));r+=gk*3;}
    f.position.set(u.cx+Math.cos(a+gk*6)*r,y,u.cz+Math.sin(a*1.2+gk*6)*r);f.material.opacity=.35+.65*Math.max(0,Math.sin(T*2.2+u.ph*3));}
  for(const g of glows){const fl=1+Math.sin(T*9+g.ph)*.05+Math.sin(T*23+g.ph*2)*.03+gk*.6;g.sp.scale.setScalar(g.base*fl);}
  for(const p of pools)p.m.material.opacity=.3+Math.sin(T*8+p.ph)*.03+gk*.25;
  for(const r of rays)r.m.material.opacity=.09+Math.sin(T*.6+r.ph)*.04;
  for(const m of mists){m.m.material.opacity=.18+Math.sin(T*.4+m.ph)*.06;m.m.position.y=.75+Math.sin(T*.3+m.ph)*.15;}
  for(const m of mushrooms){const b=gk>0?Math.sin(T*16)*.12*gk:Math.sin(T*1.5+m.position.x)*.012;m.scale.set(1-b*.5,1+b,1-b*.5);}
  if(waterTex)waterTex.offset.y-=dt*.25;
  for(const c of critters)c.upd(c,dt,T,gk);
  for(const m of mills)m.rotation.x+=dt*(.6+gk*3);
  for(const p of pennants)p.rotation.x=Math.sin(T*3+p.userData.ph)*.35*U.uWind.value;
  for(const g of signs)g.sw.rotation.x=Math.sin(T*1.8+g.ph)*(.08+gk*.35);
  for(const f of flies){const u=f.userData,a=T*u.sp+u.ph;f.position.set(u.cx+Math.cos(a)*u.r,1.1+Math.sin(a*2.3)*.4+(gk>0?1.2:0),u.cz+Math.sin(a*1.3)*u.r);f.rotation.y=-a;for(const w of f.children)w.rotation.y=w.userData.s*(.3+Math.abs(Math.sin(T*18+u.ph))*1.1);}
  for(const b of birds){if(!b.visible){if(Math.random()<dt*(gk>0?2:.05))launchBird(b);continue;}const u=b.userData;u.x+=u.vx*dt;u.z+=u.vz*dt;u.y+=dt*.5;b.position.set(u.x,u.y,u.z);b.rotation.y=Math.atan2(u.vx,u.vz);for(const w of b.children)w.rotation.z=w.userData.s*Math.sin(T*12+u.ph)*.6;if(u.x<-L-40)b.visible=false;}
  for(const d of drops){if(d.life<=0){if(fountains.length&&Math.random()<dt*(gk>0?40:14)){const f=pickC(fountains);d.life=1.1;d.v=new THREE.Vector3((Math.random()-.5)*1.6,3.2+Math.random()*1.2+gk*2,(Math.random()-.5)*1.6);d.sp.position.set(f.x,2.6,f.z);}else continue;}
    d.life-=dt;d.v.y-=9.8*dt;d.sp.position.addScaledVector(d.v,dt);d.sp.material.opacity=Math.min(1,d.life*2)*.8;if(d.sp.position.y<.9){d.life=0;d.sp.material.opacity=0;}}
  for(const s2 of smokeSprites){if(s2.life<=0){if(smokes.length&&Math.random()<dt*2){const src=pickC(smokes);s2.src=src;s2.life=4;s2.sp.position.set(src.x,src.y,src.z);}else continue;}
    s2.life-=dt;const k=1-s2.life/4;s2.sp.position.y+=dt*.9;s2.sp.position.x+=dt*.5;s2.sp.scale.setScalar(.8+k*2.2);s2.sp.material.opacity=Math.sin(k*Math.PI)*.45;}

  beastsUpdate(dt,gk);
  for(const l of leaves){const u=l.userData;if(u.life<=0){if(Math.random()<dt*(gk>0?3:.35)&&treeTops.length){const p=pickC(treeTops);l.position.set(p.x+(Math.random()-.5)*3,p.y+6+Math.random()*2,p.z+(Math.random()-.5)*3);u.life=8;l.visible=true;u.ph=Math.random()*6;}else continue;}
    u.life-=dt;l.position.y-=dt*.7;l.position.x+=Math.sin(T*2+u.ph)*dt*.9+dt*.4;l.position.z+=Math.cos(T*1.7+u.ph)*dt*.6;l.rotation.set(T*2+u.ph,T*1.3,T+u.ph);if(l.position.y<.05||u.life<=0){u.life=0;l.visible=false;}}
  }
build();
return {update,onGoal:()=>{goalT=2.8;}};
};
