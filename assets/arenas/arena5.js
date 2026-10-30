window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[5]=function(G){
window.GZ_FIELD_MOTIF='timon';   // v203: grabado en el césped de esta arena

const L=32,HW=16,GW=4.5,GH=2.9,B=HW+1.0,E=L+1.2;
// ===== paleta del bosque: verdes profundos, troncos oscuros, hongos rojos, faroles ámbar =====
const PAL={leaf:['#3f7a3a','#356b34','#4b8a40','#2f6236'],grass:'#5f8a3a',bark:'#5a3d2a',barkDark:'#4a3122',wood:'#8a6040',woodDark:'#6a4630',
  woodInner:'#cfae84',stone:['#7d7f6e','#6f7262','#878a78'],dirt:'#6b5038',red:'#d9483f',tan:'#d8b98a',yellow:'#e8c25a',purple:'#8f73c8',
  white:'#f1ede2',moss:'#4f7d32',topGrass:'#5a8636',face:'#6b5038',water:'#3f8fa0',glow:'#ffd27a'};
const KMAP={leafsGreen:'leaf',leafsDark:'leaf',grass:'grass',woodBark:'bark',woodBarkDark:'barkDark',wood:'wood',woodDark:'woodDark',woodInner:'woodInner',
  stone:'stone',dirt:'dirt',colorRed:'red',colorRedDark:'red',colorTan:'tan',colorYellow:'yellow',colorPurple:'purple'};
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;

const renderer=G.renderer;

const scene=G.root,REAL=G.scene;REAL.background=new THREE.Color('#9fd8f2');REAL.fog=new THREE.Fog('#a8dcf2',90,200);
const camera=G.camera;
const hemi=new THREE.HemisphereLight(0xffffff,0x8a7a5a,.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff4dc,.62);sun.position.set(-16,42,22);sun.castShadow=true;{const hq=window.save&&save.settings&&save.settings.quality==='alta';sun.shadow.mapSize.set(hq?2048:1024,hq?2048:1024);}   // v203: sombras según la calidad
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
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX;
  // v34: losas color crema dentro de la cancha y banda de piedra malva por fuera (como la referencia)
  g.fillStyle='#a8987c';g.fillRect(0,0,W,H);
  const tile=(x0,y0,w,h,inside)=>{const v=(Math.random()-.5)*14;const base=inside?(Math.random()<.5?[206,190,160]:[196,180,150]):[128,118,134];
    g.fillStyle=`rgb(${base[0]+v|0},${base[1]+v|0},${base[2]+v|0})`;g.beginPath();if(g.roundRect)g.roundRect(x0,y0,w,h,4);else g.rect(x0,y0,w,h);g.fill();
    g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.beginPath();g.moveTo(x0+3,y0+h-3);g.lineTo(x0+3,y0+3);g.lineTo(x0+w-3,y0+3);g.stroke();
    g.strokeStyle='rgba(90,70,50,.14)';g.beginPath();g.moveTo(x0+3,y0+h-2);g.lineTo(x0+w-2,y0+h-2);g.lineTo(x0+w-2,y0+3);g.stroke();
    for(let k=0;k<4;k++){g.fillStyle=Math.random()<.5?'rgba(120,100,70,.06)':'rgba(255,255,255,.07)';g.beginPath();g.arc(x0+Math.random()*w,y0+Math.random()*h,3+Math.random()*9,0,7);g.fill();}};
  let y=0;while(y<H){const rh=(1.7+Math.random()*.6)*PX;let x=-Math.random()*PX;
    while(x<W){const rw=(1.7+Math.random()*.8)*PX;const cx=(x+rw/2)/PX-36,cz=(y+rh/2)/PX-24;const inside=Math.abs(cx)<L+.6&&Math.abs(cz)<HW+.6;tile(x+3,y+3,rw-6,rh-6,inside);x+=rw;}
    y+=rh;}
  for(let k=0;k<60;k++){const x=Math.random()*W,yy=Math.random()*H,r=30+Math.random()*90,gr=g.createRadialGradient(x,yy,0,x,yy,r);gr.addColorStop(0,'rgba(200,175,130,.10)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,yy-r,r*2,r*2);}
  const line=(w,col)=>{g.strokeStyle=col;g.lineWidth=PX*w;(window.GZ_RR?GZ_RR(g,X(-L),Z(-HW),2*L*PX,2*HW*PX,(SIM.C.CR||0)*PX):g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX));g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
    g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-8.6),9*PX,17.2*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}};
  line(.36,'rgba(120,95,70,.35)');line(.22,'rgba(255,255,255,.97)');
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const field=new THREE.Mesh(new THREE.PlaneGeometry(72,48),new THREE.MeshLambertMaterial({map:fieldTex()}));
field.rotation.x=-Math.PI/2;field.receiveShadow=true;scene.add(field);
// opción: césped como el de la arena 1 en lugar de las losas
const TILES=field.material.map;let GRASS=null;
function grassTex(){const PX=24,W=72*PX,H=48*PX,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX,q=4,STK=!!window.strikersGrass;
  if(STK)strikersGrass(g,W,H,PX,X,Z);else for(let x=-36,i=0;x<36;x+=q,i++)for(let z=-24,j=0;z<24;z+=q,j++){g.fillStyle=(i+j)%2?'#9db150':'#89a444';g.fillRect(X(x),Z(z),q*PX+1,q*PX+1);}
  const t=new THREE.CanvasTexture(c);if(STK&&window.strikersFinish)strikersFinish(g,W,H,X(0),Z(0),PX,t);   // hojitas de pasto y logo del centro
  // fuera de la cancha: arena de playa (el césped solo dentro, con esquinas redondeadas)
  {const m=1.2,x0=X(-L-m),z0=Z(-HW-m),w=2*(L+m)*PX,h=2*(HW+m)*PX,r=((window.SIM&&SIM.C&&SIM.C.CR)||7)*PX+m*PX;
   g.save();g.beginPath();g.rect(0,0,W,H);g.moveTo(x0+r,z0);g.arcTo(x0,z0,x0,z0+h,r);g.arcTo(x0,z0+h,x0+w,z0+h,r);g.arcTo(x0+w,z0+h,x0+w,z0,r);g.arcTo(x0+w,z0,x0,z0,r);g.closePath();g.clip('evenodd');
   g.fillStyle='#e8d29c';g.fillRect(0,0,W,H);
   for(let i=0;i<1400;i++){g.fillStyle=Math.random()<.5?'rgba(190,160,110,.18)':'rgba(255,248,225,.22)';g.beginPath();g.arc(Math.random()*W,Math.random()*H,2+Math.random()*10,0,7);g.fill();}
   // piedritas en el borde del césped que se van perdiendo en la arena
   const bx=L+m,bz=HW+m,rr=r/PX,sdf=(x,z)=>{const qx=Math.abs(x)-(bx-rr),qz=Math.abs(z)-(bz-rr);return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-rr;};
   for(let i=0;i<9000;i++){const x=(Math.random()-.5)*72,z=(Math.random()-.5)*48,d=sdf(x,z);if(d<0||d>3.2)continue;const a=1-d/3.2;if(Math.random()>a*a+.05)continue;
     const sx=X(x),sz=Z(z),rw=(.22+Math.random()*.38)*PX*(.6+a*.5),rh=rw*(.6+Math.random()*.35),ang=Math.random()*3.14,v=(Math.random()-.5)*26|0;
     g.globalAlpha=.35+a*.6;g.fillStyle='rgba(70,55,40,.35)';g.beginPath();g.ellipse(sx+rw*.18,sz+rw*.2,rw,rh,ang,0,7);g.fill();
     g.fillStyle=`rgb(${176+v},${164+v},${146+v})`;g.beginPath();g.ellipse(sx,sz,rw,rh,ang,0,7);g.fill();
     g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(sx-rw*.25,sz-rh*.3,rw*.45,rh*.35,ang,0,7);g.fill();}
   g.globalAlpha=1;
   g.restore();
   g.strokeStyle='rgba(150,120,80,.35)';g.lineWidth=PX*.18;g.beginPath();g.moveTo(x0+r,z0);g.arcTo(x0,z0,x0,z0+h,r);g.arcTo(x0,z0+h,x0+w,z0+h,r);g.arcTo(x0+w,z0+h,x0+w,z0,r);g.arcTo(x0+w,z0,x0,z0,r);g.closePath();g.stroke();}
  g.strokeStyle=STK?'#f6faf0':'rgba(240,234,214,.9)';g.lineWidth=PX*(STK?.25:.22);
  (window.GZ_RR?GZ_RR(g,X(-L),Z(-HW),2*L*PX,2*HW*PX,(SIM.C.CR||0)*PX):g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX));g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
  g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-8.6),9*PX,17.2*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}
  t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.needsUpdate=true;return t;}
function setGrass(on){if(on&&!GRASS)GRASS=grassTex();field.material.map=on?GRASS:TILES;field.material.needsUpdate=true;}
if(window.GZ_PLAYA_GRASS)setGrass(true);
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#55772f';g.fillRect(0,0,S,S);
  for(let i=0;i<300;i++){g.fillStyle=pickC(['rgba(90,120,50,.4)','rgba(60,90,35,.4)','rgba(170,110,50,.35)']);g.beginPath();g.arc(Math.random()*S,Math.random()*S,4+Math.random()*20,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=-.15;m.receiveShadow=true;})(); // v33: aquí el suelo de afuera es el mar

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

// ===== piezas de la playa pirata =====
const P_='pirate/';
function pp(n,x,z,S,rot,y){const src=KB[P_+n];if(!src)return null;const o=src.clone(true);o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  o.scale.setScalar(S);o.position.set(x,y!=null?y:heightAt(x,z),z);o.rotation.y=rot||0;scene.add(o);return o;}
// palmeras con viento (material con textura + balanceo)
const swayCache=new WeakMap();
function palm(n,x,z,S,rot){const o=pp(n,x,z,S,rot);if(!o)return;o.traverse(c=>{if(c.isMesh){let m=swayCache.get(c.material);
  if(!m){m=c.material.clone();m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uWind=U.uWind;sh.vertexShader='uniform float uTime,uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec4 wp0=modelMatrix*vec4(position,1.);float hh=max(0.,position.y-1.);float sw=sin(uTime*1.4+wp0.x*.3+wp0.z*.2)*.6+sin(uTime*2.6+wp0.z*.5)*.25;
    transformed.x+=sw*hh*hh*.012*uWind;transformed.z+=sw*hh*hh*.008*uWind;`);};m.customProgramCacheKey=()=>'palm';swayCache.set(c.material,m);}c.material=m;}});}
// mar con olas
let seaTex=null;
function sea(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#2f9fc0';g.fillRect(0,0,256,256);
  for(let i=0;i<220;i++){g.strokeStyle=`rgba(255,255,255,${.08+Math.random()*.18})`;g.lineWidth=1+Math.random()*2;const x=Math.random()*256,y=Math.random()*256;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+8,y-3,x+16+Math.random()*10,y);g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle='rgba(20,90,130,.25)';g.beginPath();g.ellipse(Math.random()*256,Math.random()*256,10+Math.random()*30,5+Math.random()*12,0,0,7);g.fill();}
  seaTex=new THREE.CanvasTexture(c);seaTex.wrapS=seaTex.wrapT=THREE.RepeatWrapping;seaTex.repeat.set(30,30);
  const m=new THREE.MeshLambertMaterial({map:seaTex,transparent:true,opacity:.96});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    transformed.z+=sin(position.x*.25+uTime*1.3)*.18+sin(position.y*.31+uTime*1.1)*.14;`);};m.customProgramCacheKey=()=>'sea';
  const w=new THREE.Mesh(new THREE.PlaneGeometry(320,320,80,80),m);w.rotation.x=-Math.PI/2;w.position.y=-.35;w.receiveShadow=true;scene.add(w);}
function sandPlane(x1,x2,z1,z2,y){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#e8d29c';g.fillRect(0,0,256,256);
  for(let i=0;i<500;i++){g.fillStyle=Math.random()<.5?'rgba(200,170,110,.25)':'rgba(255,245,215,.3)';g.beginPath();g.arc(Math.random()*256,Math.random()*256,1+Math.random()*3,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set((x2-x1)/6,(z2-z1)/6);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,z2-z1),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set((x1+x2)/2,y||.0,(z1+z2)/2);m.receiveShadow=true;scene.add(m);return m;}
const foams=[];
function foam(x1,z1,x2,z2){const len=Math.hypot(x2-x1,z2-z1);const m=new THREE.Mesh(new THREE.PlaneGeometry(len,1.4),new THREE.MeshBasicMaterial({map:vGrad('rgba(255,255,255,0)','rgba(255,255,255,1)'),transparent:true,opacity:.6,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.rotation.z=-Math.atan2(z2-z1,x2-x1);m.position.set((x1+x2)/2,-.12,(z1+z2)/2);scene.add(m);foams.push({m,ph:Math.random()*6});}
const ships=[],gulls=[],cannons=[],puffs=[],sparks=[];
const PUFF=radTex('rgba(235,235,230,.95)','rgba(235,235,230,0)'),FLASH=radTex('rgba(255,220,120,1)','rgba(255,150,40,0)'),SPK=radTex('rgba(255,250,200,1)','rgba(255,230,120,0)');
function gull(){const g=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:'#f6f6f2',side:THREE.DoubleSide});
  for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.9,.22),m);w.position.x=s*.45;w.userData.s=s;g.add(w);}
  g.userData={cx:(Math.random()-.5)*80,cz:(Math.random()<.5?-1:1)*(B+12+Math.random()*14),r:5+Math.random()*8,h:9+Math.random()*6,sp:.25+Math.random()*.2,ph:Math.random()*6};scene.add(g);gulls.push(g);}

const PDIR='assets/arenas/playa/',GM={};
const loadG=n=>new Promise(res=>loader.load(PDIR+n+'.glb?v=203',g=>{GM[n]=g;res();},undefined,e=>{console.warn('falta',n,e);res();}));
// material: lambert con un poco de luz propia en lo amarillo claro (ventanas y faroles)
function arenaMat(src){const map=src.map||null;if(map){map.encoding=THREE.LinearEncoding;map.anisotropy=4;map.needsUpdate=true;}
  const m=new THREE.MeshLambertMaterial({map,color:0xffffff});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      {vec3 c=diffuseColor.rgb;float lit=smoothstep(.72,.9,min(c.r,c.g))*smoothstep(.12,.3,c.g-c.b);totalEmissiveRadiance+=c*(lit*.75+.08);}`);};
  m.customProgramCacheKey=()=>'playaMat';return m;}
const PREP={};
function prep(n){if(PREP[n])return PREP[n];const g=GM[n];if(!g)return null;const s=g.scene;s.rotation.y=TRIM[n]||0;
  const mats=new Map();s.traverse(o=>{if(o.isMesh){if(!mats.has(o.material))mats.set(o.material,arenaMat(o.material));o.material=mats.get(o.material);o.castShadow=true;o.receiveShadow=true;}});
  s.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(s);return PREP[n]={s,box,size:box.getSize(new THREE.Vector3())};}
// FACE: giro para que el frente de cada modelo mire a +z
const FACE={playa_palco:Math.PI/2};
const TRIM={playa_taberna:-5.5*Math.PI/180};   // la taberna viene girada de Tripo
function place(n,o){const P=prep(n);if(!P)return null;o=o||{};
  const inner=P.s.clone(true),wrap=new THREE.Group(),rot=new THREE.Group();rot.add(inner);
  const c=P.box.getCenter(new THREE.Vector3());inner.position.set(-c.x,-P.box.min.y,-c.z);
  rot.rotation.y=(FACE[n]||0)+(o.spin||0);wrap.add(rot);
  const turned=Math.abs(Math.sin(rot.rotation.y))>.5,W0=turned?P.size.z:P.size.x,D0=turned?P.size.x:P.size.z,H0=P.size.y;
  let k=o.s||null;if(!k)k=o.w?o.w/W0:o.d?o.d/D0:o.h?o.h/H0:1;
  wrap.scale.set(o.w?o.w/W0:k,o.h?o.h/H0:(o.ys||k),o.d?o.d/D0:k);
  wrap.position.set(o.x||0,o.y||0,o.z||0);wrap.rotation.y=o.ry||0;scene.add(wrap);return wrap;}

// filas de asiento medidas (f = fondo desde el frente, h = fracción del alto)
const ROWS={playa_grada:[[.25,.37],[.43,.46],[.62,.54],[.79,.62]]};
const SEATS=[];   // {x,y,z,ry}
function seatsStraight(n,cx,cz,ry,W,D,H,sp){const R=ROWS[n];if(!R)return;const cs=Math.cos(ry),sn=Math.sin(ry);
  for(const [f,h] of R){const lz=D/2-f*D;for(let lx=-W/2+sp*.6;lx<=W/2-sp*.5;lx+=sp){
    SEATS.push({x:cx+lx*cs+lz*sn,y:h*H,z:cz-lx*sn+lz*cs,ry});}}}

function bentStand(n,C,a0,r,D,H,sp){const P=prep(n);if(!P)return;const g=new THREE.Group();
  const src=P.s.clone(true);const rot=new THREE.Group();rot.add(src);const c=P.box.getCenter(new THREE.Vector3());src.position.set(-c.x,-P.box.min.y,-c.z);rot.rotation.y=FACE[n]||0;
  const tmp=new THREE.Group();tmp.add(rot);tmp.updateMatrixWorld(true);
  const turned=Math.abs(Math.sin(rot.rotation.y))>.5,W0=turned?P.size.z:P.size.x,D0=turned?P.size.x:P.size.z,H0=P.size.y;
  const v=new THREE.Vector3();
  src.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);
      const t=(v.x+W0/2)/W0,back=(D0/2-v.z)/D0*D,th=a0+t*Math.PI/2,rr=r+back;
      pa.setXYZ(i,C.x+Math.cos(th)*rr,v.y/H0*H,C.z+Math.sin(th)*rr);}
    geo.computeVertexNormals();geo.computeBoundingSphere();const m=new THREE.Mesh(geo,o.material);m.castShadow=true;m.receiveShadow=true;g.add(m);});
  scene.add(g);
  const R=ROWS[n]||[];for(const [f,h] of R){const rr=r+f*D,len=rr*Math.PI/2,cnt=Math.max(1,Math.floor(len/sp));
    for(let k=0;k<cnt;k++){const th=a0+(k+.5)/cnt*Math.PI/2;SEATS.push({x:C.x+Math.cos(th)*rr,y:h*H,z:C.z+Math.sin(th)*rr,ry:Math.atan2(-Math.cos(th),-Math.sin(th))});}}
  return g;}


// =====================================================================
// v194: PLAYA PIRATA — una caleta cerrada por acantilados. Gradas de muelle en los lados,
// el palco elevado con la pantalla detrás de la portería rival, el arco de roca con el galeón encallado,
// vigías sobre pilotes, río a los costados, mar de fondo.
// =====================================================================
const ZS=HW+3.6,XS=L+4.5,X0=26,Z0E=12;
const GD=8,GHH=8*.537/.481,SP=1.45;
let canalT=null;
function canalTex2(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle='#38b4cf';g.fillRect(0,0,64,256);
  for(let i=0;i<60;i++){g.strokeStyle='rgba(255,255,255,'+(.15+Math.random()*.3)+')';g.lineWidth=1+Math.random()*2;const y=Math.random()*256,x0=Math.random()*64;g.beginPath();g.moveTo(x0,y);g.lineTo(x0+6+Math.random()*14,y+2);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const FIRE=radTex('rgba(255,236,150,1)','rgba(255,110,20,0)'),torches=[];
function torch(x,y,z,s){s=s||1;const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const parts=[];
  for(let i=0;i<4;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FIRE,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(.9*s);g.add(sp);parts.push({sp,ph:Math.random()*6,k:i/4});}
  torches.push({parts,s});}
function drawNets(){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},D=2.2,HB=C.GH*.72;
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='#ffffff';g.lineWidth=5;g.beginPath();g.moveTo(0,32);g.lineTo(32,0);g.lineTo(64,32);g.lineTo(32,64);g.closePath();g.stroke();
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  const mat=new THREE.MeshBasicMaterial({map:t,color:0xf4f4f0,transparent:true,alphaTest:.25,side:THREE.DoubleSide,depthWrite:false});
  const panel=(w,h,x,y,z,ry,rx)=>{const gg=new THREE.PlaneGeometry(w,h),uv=gg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.9,uv.getY(i)*h/.9);
    const m=new THREE.Mesh(gg,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry,0,'YXZ');scene.add(m);};
  for(const s of [-1,1]){const X=s*L;panel(2*C.GW,HB,X+s*D,HB/2,0,Math.PI/2);
    panel(2*C.GW,Math.hypot(D,C.GH-HB),X+s*D/2,(C.GH+HB)/2,0,Math.PI/2,Math.atan2(s*D,-(C.GH-HB)));
    for(const z of [-C.GW,C.GW])panel(D,(C.GH+HB)/2,X+s*D/2,(C.GH+HB)/4,z,0);}}

// ===== cascadas: punto del modelo → mundo, lámina de agua sutil, laguna y arroyo al río =====
function worldPt(wrap,n,fx,fy,fz){const P=prep(n);if(!P)return null;wrap.updateMatrixWorld(true);const rot=wrap.children[0],inner=rot.children[0];
  return rot.localToWorld(new THREE.Vector3(P.box.min.x+fx*P.size.x,P.box.min.y+fy*P.size.y,P.box.min.z+fz*P.size.z).add(inner.position));}
const falls=[],fmist=[],lagoons=[];
const MIST=radTex('rgba(255,255,255,.8)','rgba(230,245,255,0)');
function fallTex(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(170,225,240,0)');gr.addColorStop(.2,'rgba(190,235,248,.55)');gr.addColorStop(.8,'rgba(190,235,248,.55)');gr.addColorStop(1,'rgba(170,225,240,0)');g.fillStyle=gr;g.fillRect(0,0,64,256);
  for(let i=0;i<40;i++){g.strokeStyle='rgba(255,255,255,'+(.15+Math.random()*.3)+')';g.lineWidth=1+Math.random()*2;const x=10+Math.random()*44,y=Math.random()*256;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+20+Math.random()*40);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function waterfall(top,base,face,riverPt){const h=top.y-base.y,t=fallTex();t.repeat.set(1,Math.max(1,h/8));
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,h+.4),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.75,depthWrite:false,side:THREE.DoubleSide}));
  m.position.set(base.x+face.x*.5,base.y+h/2,base.z+face.z*.5);m.rotation.y=Math.atan2(face.x,face.z);scene.add(m);falls.push(t);
  // lagunita donde cae el agua, con piedras alrededor
  const pc=new THREE.Vector3(base.x+face.x*3,0,base.z+face.z*3),R=3.4,pt=canalTex2();pt.repeat.set(1,1);
  const pool=new THREE.Mesh(new THREE.CircleGeometry(R,28),new THREE.MeshLambertMaterial({map:pt,emissive:0x08303a,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
  pool.rotation.x=-Math.PI/2;pool.position.set(pc.x,.11,pc.z);scene.add(pool);lagoons.push(pt);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2+Math.random()*.2,r=R+.25+Math.random()*.3;const st=mesh(new THREE.DodecahedronGeometry(.4+Math.random()*.35,0),pickC(['#b8a07a','#a89070','#c6b08a']));
    st.position.set(pc.x+Math.cos(a)*r,.12,pc.z+Math.sin(a)*r);st.rotation.set(Math.random(),Math.random()*6,0);scene.add(st);}
  // espuma muy suave donde cae
  for(let i=0;i<6;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:MIST,transparent:true,depthWrite:false,opacity:0}));scene.add(sp);fmist.push({sp,x:base.x+face.x*1.6,z:base.z+face.z*1.6,life:Math.random()*1.5});}
  // arroyo de la laguna al río del costado
  const a0=new THREE.Vector3(pc.x,.11,pc.z).addScaledVector(new THREE.Vector3().subVectors(riverPt,pc).setY(0).normalize(),R*.8);
  const len=a0.distanceTo(riverPt);if(len>1){const W=1.8,ang=Math.atan2(riverPt.x-a0.x,riverPt.z-a0.z),st=canalTex2();st.repeat.set(1,len/6);
    const rib=new THREE.Mesh(new THREE.PlaneGeometry(W,len),new THREE.MeshLambertMaterial({map:st,emissive:0x08303a,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    rib.rotation.set(-Math.PI/2,0,ang+Math.PI);rib.position.set((a0.x+riverPt.x)/2,.105,(a0.z+riverPt.z)/2);scene.add(rib);lagoons.push(st);
    for(let k=1;k<len;k+=1.3)for(const e of [-1,1]){const px=a0.x+(riverPt.x-a0.x)*k/len+Math.cos(ang)*e*(W/2+.3),pz=a0.z+(riverPt.z-a0.z)*k/len-Math.sin(ang)*e*(W/2+.3);
      const r=mesh(new THREE.DodecahedronGeometry(.3+Math.random()*.2,0),'#b8a07a');r.position.set(px,.12,pz);scene.add(r);}}}

// ===== armar la caleta =====
async function build(){
  await Promise.all(['playa_grada','playa_palco','playa_galeon','playa_arco_roca','playa_acantilado','playa_acantilado_curvo','playa_vigia','playa_taberna','playa_porteria','playa_pantalla','playa_porton','playa_empalizada','playa_farol','playa_palmera'].map(loadG));
  sandPlane(-220,220,-220,220,-.06);   // ya no hay mar: todo es tierra; el agua baja de las cascadas
  // --- río a los costados de la cancha ---
  {const z0=HW+1.75,z1=ZS-.15,zc=(z0+z1)/2,w=z1-z0,X=X0;canalT=canalTex2();canalT.repeat.set(1,2*X/6);
   for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,2*X),new THREE.MeshLambertMaterial({map:canalT,emissive:0x08303a,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
     m.rotation.set(-Math.PI/2,0,Math.PI/2);m.position.set(0,.1,side*zc);scene.add(m);
     for(const e of [-1,1]){const k=mesh(new THREE.BoxGeometry(2*X+.4,.36,.4),'#c9a46a');k.position.set(0,.16,side*(zc+e*(w/2+.14)));scene.add(k);}
     for(const x of [-X,X]){const k=mesh(new THREE.BoxGeometry(.4,.36,w+.6),'#c9a46a');k.position.set(x,.16,side*zc);scene.add(k);}}}
  const at=(x,z,ry,lx,ly,lz)=>new THREE.Vector3(x+lx*Math.cos(ry)+lz*Math.sin(ry),ly,z-lx*Math.sin(ry)+lz*Math.cos(ry));

  // --- tribunas largas: grada de muelle; el portón al centro del lado z<0 ---
  for(const side of [-1,1]){const ry=side<0?0:Math.PI,cz=side*(ZS+GD/2),gap=side<0?11:0,mW=(2*X0-gap)/4;
    for(let i=0;i<4;i++){const x=i<2?-X0+mW*(i+.5):X0-mW*(4-i-.5);
      place('playa_grada',{x,z:cz,ry,w:mW,d:GD,h:GHH});seatsStraight('playa_grada',x,cz,ry,mW,GD,GHH,SP);}
    for(let i=0;i<=4;i++){const x=-X0+i*X0/2;if(side<0&&Math.abs(x)<6)continue;place('playa_farol',{x,z:side*(ZS-.4),h:6.5});}}
  place('playa_porton',{x:0,z:-(ZS+2.2),w:11});
  // --- detrás de TU portería: grada ---
  for(let i=0;i<2;i++){const cz=-Z0E+Z0E*(i+.5),cx=-(XS+GD/2),ry=Math.PI/2;place('playa_grada',{x:cx,z:cz,ry,w:Z0E,d:GD,h:GHH});seatsStraight('playa_grada',cx,cz,ry,Z0E,GD,GHH,SP);}

  // --- los acantilados cierran la caleta por los cuatro lados ---
  {const P=prep('playa_acantilado');if(P){const W=X0,k=W/P.size.x,dp=P.size.z*k;
    for(const side of [-1,1])for(const x of [-X0/2,X0/2])place('playa_acantilado',{x,z:side*(ZS+GD+dp/2+.8),ry:side<0?0:Math.PI,s:k});
    place('playa_acantilado',{x:-(XS+GD+dp/2+.8),z:0,ry:Math.PI/2,w:2*Z0E+2,d:dp,h:P.size.y*k});}}
  // esquinas: el acantilado curvo con su cascada, la curva mirando a la cancha
  for(const sx of [-1,1])for(const sz of [-1,1]){const S=27;const o=place('playa_acantilado_curvo',{x:sx*(X0+1.2+S/2),z:sz*(Z0E+S/2),ry:Math.atan2(-sx,-sz)+Math.PI/4,w:S,d:S});
    if(o){const top=worldPt(o,'playa_acantilado_curvo',.25,.58,.28),base=worldPt(o,'playa_acantilado_curvo',.25,0,.28);
      const face=new THREE.Vector3(sx*X0,0,sz*Z0E).sub(base).setY(0).normalize();waterfall(top,base,face,new THREE.Vector3(sx*X0,.12,sz*(HW+1.75+ZS-.15)/2));}}

  // --- lado rival: el palco elevado, la pantalla detrás y el arco de roca con el galeón ---
  const PX=L+7.5;place('playa_palco',{x:PX,z:0,ry:-Math.PI/2,w:13,d:9,h:11});
  place('playa_pantalla',{x:PX+6,z:0,y:5,ry:-Math.PI/2,w:14});
  for(const s of [-1,1])for(const z of [8.5,13.5])place('playa_empalizada',{x:L+6,z:s*z,ry:-Math.PI/2,w:5.2});
  place('playa_arco_roca',{x:XS+20,z:0,ry:-Math.PI/2,w:32});
  // el galeón quedó varado en tierra, detrás del acantilado de la izquierda, un poco ladeado
  {const g=place('playa_galeon',{x:10,z:-52,y:-1.2,ry:.12,h:26});if(g)g.rotation.z=.12;}
  // vigías sobre pilotes en las esquinas rivales; tabernas en las esquinas de tu lado
  for(const s of [-1,1]){place('playa_vigia',{x:L+3,z:s*(HW+7),h:14,ry:Math.atan2(-(L+3),-s*(HW+7))});
    place('playa_taberna',{x:-(L+3),z:s*(HW+7),h:9,ry:Math.atan2(L+3,-s*(HW+7))});
    place('playa_palmera',{x:L+9,z:s*(HW+2),h:11,ry:Math.random()*6});place('playa_palmera',{x:-(L+8),z:s*(HW+2.5),h:10,ry:Math.random()*6});
  }

  // --- porterías de bambú: el hueco del tamaño de la portería del juego ---
  {const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},D=3.2;
   for(const s of [-1,1])place('playa_porteria',{x:s*(L+.33*D),z:0,ry:s>0?-Math.PI/2:Math.PI/2,w:2*C.GW/.622,d:D,h:C.GH/.741});}
  if(typeof NETS==='undefined'||!NETS.length)drawNets();

  for(let i=0;i<8;i++)gull();
  for(let i=0;i<50;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:PUFF,transparent:true,depthWrite:false,opacity:0}));scene.add(sp);puffs.push({sp,life:0});}
}
// v34: murallas con más detalle (almenas, contrafuertes, estandartes, salvavidas, redes, musgo, pasarela, atalaya, conchas)
function wallDetails(WS){const top=4.4*WS,FACE=B+.06,stone=['#9a9488','#8f897d','#a59f93'];
  const NET=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='rgba(120,95,60,.95)';g.lineWidth=3;
    for(let i=-64;i<128;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke();g.beginPath();g.moveTo(i+64,0);g.lineTo(i,64);g.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
  const stain=(x,y,z,s,w,h,col)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');for(let i=0;i<14;i++){g.fillStyle=col;g.globalAlpha=.25;g.beginPath();g.arc(32+(Math.random()-.5)*36,20+Math.random()*40,6+Math.random()*12,0,7);g.fill();}
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.position.set(x,y,z);m.rotation.y=s>0?Math.PI:0;scene.add(m);};
  for(const s of [-1,1]){const zf=s*FACE;
    // almenas y pasarela de madera arriba
    for(let x=-E-1.5;x<=E+1.5;x+=1.25){const mer=mesh(new THREE.BoxGeometry(.7,.7,.5),pickC(stone));mer.position.set(x,top+.35,s*(B+.32));scene.add(mer);}
    const walk=mesh(new THREE.BoxGeometry(2*(E+1.8),.12,1.1),'#8a6040');walk.position.set(0,top+.06,s*(B+1.4));scene.add(walk);
    // contrafuertes (salen poco, nunca pasan la línea) y entre ellos estandartes
    const bx=[-27,-18,-9,0,9,18,27];
    for(const x of bx){const bt=mesh(new THREE.BoxGeometry(1.1,top-.3,.9),pickC(stone));bt.position.set(x,(top-.3)/2,s*(FACE+.0));scene.add(bt);
      const cap=mesh(new THREE.BoxGeometry(1.3,.25,1.05),'#7e786c');cap.position.set(x,top-.18,s*FACE);scene.add(cap);}
    for(let i=0;i<bx.length-1;i++){const x=(bx[i]+bx[i+1])/2,cols=i%2?['#1f1f24','#e8e0cc']:['#a8302a','#f2c14e'];
      const bn=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.3,6,8),clothMat(cols[0],cols[1]));bn.position.set(x,top-1.45,s*(FACE-.04));bn.rotation.y=s>0?Math.PI:0;bn.castShadow=true;scene.add(bn);
      const rod=mesh(new THREE.CylinderGeometry(.04,.04,1.6,5),'#5a3a28');rod.rotation.z=Math.PI/2;rod.position.set(x,top-.28,s*(FACE-.05));scene.add(rod);}
    // salvavidas y redes con flotadores, alternados
    for(let i=0;i<bx.length-1;i++){const x=(bx[i]+bx[i+1])/2+(i%2?3:-3);
      if(i%2===0){const g=new THREE.Group();for(let k=0;k<4;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(.36,.11,6,10,Math.PI/2),flat(k%2?'#f4efe4':'#d9483f'));t.rotation.z=k*Math.PI/2;g.add(t);}
        g.position.set(x,1.7,s*(FACE-.08));g.rotation.y=s>0?Math.PI:0;g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);}
      else{const n=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),new THREE.MeshLambertMaterial({map:NET,transparent:true,alphaTest:.3,side:THREE.DoubleSide}));n.position.set(x,2.3,s*(FACE-.05));n.rotation.y=s>0?Math.PI:0;scene.add(n);
        for(let k=0;k<4;k++){const f=mesh(new THREE.SphereGeometry(.12,6,4),k%2?'#f2c14e':'#e8853a');f.position.set(x-.9+k*.6,1.55,s*(FACE-.12));scene.add(f);}}}
    // musgo y manchas de humedad en la pared
    for(let x=-E;x<=E;x+=4+Math.random()*3)stain(x,.7+Math.random()*1.2,s*(FACE-.02),s,1.6+Math.random()*1.4,1.2+Math.random()*.8,Math.random()<.6?'#5f7a3a':'#6a5a48');
    // atalaya al centro de cada muralla
    pp('tower-watch',0,s*(B+1.3),.85,0,top+.12);
    // pie de la muralla: arena acumulada, conchas y estrellas de mar (fuera de la línea)
    const drift=mesh(new THREE.CylinderGeometry(.55,.55,2*(E+1.5),8,1,false,0,Math.PI),'#e3cd96');drift.rotation.z=Math.PI/2;drift.rotation.y=s>0?0:Math.PI;drift.position.set(0,0,s*(FACE-.05));drift.scale.set(1,.45,1);scene.add(drift);
    for(let x=-E;x<=E;x+=2.2+Math.random()*2){const sh=mesh(new THREE.IcosahedronGeometry(.16,0),pickC(['#f4efe4','#f2c8b0','#e8d8c0']));sh.scale.y=.4;sh.position.set(x,.08,s*(FACE-.45));scene.add(sh);}
    for(let x=-E+3;x<=E-3;x+=12){const st=new THREE.Shape();for(let k=0;k<10;k++){const a=k/10*Math.PI*2,r=k%2?.12:.3;k?st.lineTo(Math.cos(a)*r,Math.sin(a)*r):st.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
      const m=new THREE.Mesh(new THREE.ShapeGeometry(st),new THREE.MeshLambertMaterial({color:'#e8853a',side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,.06,s*(FACE-.4));scene.add(m);}
  }}
function cannonFire(){for(const c of cannons){if(Math.random()<.6)continue;for(let k=0;k<4;k++){const p=puffs.find(q=>q.life<=0);if(!p)break;p.life=1.4;p.sp.position.set(c.x,c.y,c.z);p.v=new THREE.Vector3((Math.random()-.5)*1.2,1.4+Math.random(),(Math.random()-.5)*1.2);p.flash=k===0;}}}
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
  if(seaTex){seaTex.offset.x+=dt*.012;seaTex.offset.y+=dt*.008;}
  if(canalT)canalT.offset.y-=dt*(.25+gk*.4);
  for(const t of falls)t.offset.y+=dt*.55;for(const t of lagoons)t.offset.y-=dt*.12;   // movimiento sutil de la cascada
  for(const p of fmist){p.life-=dt;if(p.life<=0){p.life=1.4+Math.random()*.8;p.sp.position.set(p.x+(Math.random()-.5)*.8,.4,p.z+(Math.random()-.5)*.8);}
    p.sp.position.y+=dt*.35;const k=p.life/2;p.sp.material.opacity=Math.sin(Math.min(1,k)*Math.PI)*.35;p.sp.scale.setScalar(1+(1-k)*1.6);}
  for(const t of torches)for(const p of t.parts){const k=(T*1.6+p.k)%1;p.sp.position.set(Math.sin(T*7+p.ph)*.08*t.s,k*1.1*t.s,0);p.sp.scale.setScalar((1-k*.7)*(.9+gk*.6)*t.s);p.sp.material.opacity=1-k;}
  for(const f of foams)f.m.material.opacity=.35+.3*Math.abs(Math.sin(T*.9+f.ph));
  for(const s of ships){s.o.rotation.z=Math.sin(T*.8+s.ph)*.05*(1+gk*2);s.o.rotation.x=Math.sin(T*.6+s.ph)*.03;s.o.position.y=s.y+Math.sin(T*1.1+s.ph)*.15;}
  for(const g of gulls){const u=g.userData,a=T*u.sp+u.ph;g.position.set(u.cx+Math.cos(a)*u.r,u.h+Math.sin(a*2)*.6+gk*3,u.cz+Math.sin(a)*u.r);g.rotation.y=-a;for(const w of g.children)w.rotation.z=w.userData.s*(.25+Math.sin(T*7+u.ph)*.35*(1+gk*2));}
  for(const s of sparks){const k=Math.max(0,Math.sin(T*2.4+s.ph));s.sp.material.opacity=k*.9;s.sp.position.set(s.x+Math.cos(s.ph)*.5,1.1+Math.sin(s.ph*2)*.3,s.z+Math.sin(s.ph)*.5);if(k<.02)s.ph+=1.7;}
  if(gk>.95&&!window._fired){window._fired=1;cannonFire();}if(gk<=0)window._fired=0;
  for(const p of puffs){if(p.life<=0)continue;p.life-=dt;p.sp.position.addScaledVector(p.v,dt);const k=1-p.life/1.4;
    if(p.flash&&k<.15){p.sp.material.map=FLASH;p.sp.material.blending=THREE.AdditiveBlending;}else{p.sp.material.map=PUFF;p.sp.material.blending=THREE.NormalBlending;}
    p.sp.scale.setScalar(.8+k*3);p.sp.material.opacity=Math.sin(Math.min(1,k*1.2)*Math.PI)*.8;}

  beastsUpdate(dt,gk);
  for(const l of leaves){const u=l.userData;if(u.life<=0){if(Math.random()<dt*(gk>0?3:.35)&&treeTops.length){const p=pickC(treeTops);l.position.set(p.x+(Math.random()-.5)*3,p.y+6+Math.random()*2,p.z+(Math.random()-.5)*3);u.life=8;l.visible=true;u.ph=Math.random()*6;}else continue;}
    u.life-=dt;l.position.y-=dt*.7;l.position.x+=Math.sin(T*2+u.ph)*dt*.9+dt*.4;l.position.z+=Math.cos(T*1.7+u.ph)*dt*.6;l.rotation.set(T*2+u.ph,T*1.3,T+u.ph);if(l.position.y<.05||u.life<=0){u.life=0;l.visible=false;}}
  }
build();
try{if(typeof GOAL_STD!=='undefined')GOAL_STD.forEach(m=>{if(m.geometry&&m.geometry.parameters&&m.geometry.parameters.radiusTop>.1)m.visible=false;});}catch(e){}
return {update,setGrass,onGoal:()=>{goalT=2.8;}};
};
