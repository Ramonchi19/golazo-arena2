window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[6]=function(G){

const L=32,HW=16,GW=4.5,GH=2.9,B=HW+1.0,E=L+1.2;
// ===== paleta del desierto: arenisca, ocre, azul faraón y oro =====
const PAL={leaf:['#6aa84a','#5f9a42'],grass:'#c9a46c',bark:'#7a5236',barkDark:'#5e3f2a',wood:'#b07a4c',woodDark:'#8a5a38',woodInner:'#e6cfa4',
  stone:['#e2c48c','#d9b77e','#e8cd98'],stoneDark:['#c49a62','#b88e58'],dirt:'#c49a62',red:'#2b4c8c',tan:'#d8b98a',yellow:'#f2c14e',purple:'#9a7bd6',
  white:'#f4efe4',moss:'#c9a46c',topGrass:'#e2c48c',face:'#c9a06a',water:'#3fb0c8',glow:'#ffb050'};
const KMAP={leafsGreen:'leaf',grass:'grass',woodBark:'bark',woodBarkDark:'barkDark',wood:'wood',woodDark:'woodDark',woodInner:'woodInner',
  stone:'stone',stoneDark:'stoneDark',dirt:'dirt',colorRed:'red'};
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;

const renderer=G.renderer;

const scene=G.root,REAL=G.scene;REAL.background=new THREE.Color('#f3dfb0');REAL.fog=new THREE.Fog('#f0dcae',90,200);
const camera=G.camera;
const hemi=new THREE.HemisphereLight(0xfff4dc,0x9a7a50,.47);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe8bc,.64);sun.position.set(-16,42,22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
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
  g.fillStyle='#9a7848';g.fillRect(0,0,W,H);
  let y=0;while(y<H){const rh=(1.5+Math.random()*.9)*PX;let x=-Math.random()*PX;
    while(x<W){const rw=(1.6+Math.random()*1.6)*PX;const cx=(x+rw/2)/PX-36,cz=(y+rh/2)/PX-24;const inside=Math.abs(cx)<L+.6&&Math.abs(cz)<HW+.6;
      const v=(Math.random()-.5)*16;const b=inside?(Math.random()<.5?[196,166,116]:[188,158,108]):[170,118,80];
      g.fillStyle=`rgb(${b[0]+v|0},${b[1]+v|0},${b[2]+v|0})`;const x0=x+3,y0=y+3,w=rw-6,h=rh-6;g.beginPath();if(g.roundRect)g.roundRect(x0,y0,w,h,4);else g.rect(x0,y0,w,h);g.fill();
      g.strokeStyle='rgba(255,245,220,.2)';g.lineWidth=2;g.beginPath();g.moveTo(x0+3,y0+h-3);g.lineTo(x0+3,y0+3);g.lineTo(x0+w-3,y0+3);g.stroke();
      g.strokeStyle='rgba(110,70,30,.18)';g.beginPath();g.moveTo(x0+3,y0+h-2);g.lineTo(x0+w-2,y0+h-2);g.lineTo(x0+w-2,y0+3);g.stroke();
      x+=rw;}
    y+=rh;}
  for(let k=0;k<120;k++){const x=Math.random()*W,yy=Math.random()*H,r=20+Math.random()*80,gr=g.createRadialGradient(x,yy,0,x,yy,r);gr.addColorStop(0,'rgba(240,215,160,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,yy-r,r*2,r*2);}
  const line=(w,col)=>{g.strokeStyle=col;g.lineWidth=PX*w;g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX);g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
    g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-11),9*PX,22*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}};
  line(.36,'rgba(120,80,40,.35)');line(.22,'rgba(255,253,245,.97)');
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const field=new THREE.Mesh(new THREE.PlaneGeometry(72,48),new THREE.MeshLambertMaterial({map:fieldTex(),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
field.rotation.x=-Math.PI/2;field.receiveShadow=true;scene.add(field);
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#d9b77e';g.fillRect(0,0,S,S);
  for(let i=0;i<300;i++){g.fillStyle=pickC(['rgba(230,200,150,.4)','rgba(190,150,100,.3)']);g.beginPath();g.arc(Math.random()*S,Math.random()*S,4+Math.random()*20,0,7);g.fill();}
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

// ===== piezas del templo del desierto =====
function glyphTex(){const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');g.fillStyle='#c9a46c';g.fillRect(0,0,128,256);
  g.strokeStyle='#8a5e34';g.lineWidth=4;g.strokeRect(6,6,116,244);g.fillStyle='#8a5e34';g.strokeStyle='#8a5e34';g.lineWidth=3;
  for(let r=0;r<6;r++)for(let k=0;k<2;k++){const x=22+k*52,y=24+r*38,t=(r*2+k+Math.floor(Math.random()*3))%6;g.beginPath();
    if(t===0){g.arc(x+10,y+12,10,0,7);g.stroke();g.beginPath();g.arc(x+10,y+12,3,0,7);g.fill();}
    else if(t===1){g.moveTo(x,y+24);g.lineTo(x+10,y);g.lineTo(x+20,y+24);g.closePath();g.stroke();}
    else if(t===2){g.moveTo(x+10,y);g.lineTo(x+10,y+24);g.moveTo(x,y+8);g.lineTo(x+20,y+8);g.stroke();g.beginPath();g.arc(x+10,y+4,5,0,7);g.stroke();}
    else if(t===3){g.moveTo(x,y+12);g.quadraticCurveTo(x+10,y-6,x+20,y+12);g.quadraticCurveTo(x+10,y+30,x,y+12);g.stroke();}
    else if(t===4){for(let w=0;w<3;w++){g.moveTo(x,y+4+w*8);for(let q=0;q<4;q++)g.lineTo(x+5+q*5,y+(q%2?0:4)+w*8);}g.stroke();}
    else{g.fillRect(x+2,y+4,16,16);}}
  return new THREE.CanvasTexture(c);}
const GLY=[];
function glyphPanel(x,s,y,h){if(!GLY.length)for(let i=0;i<4;i++)GLY.push(glyphTex());const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,h),new THREE.MeshLambertMaterial({map:pickC(GLY),polygonOffset:true,polygonOffsetFactor:-2}));
  m.position.set(x,y,s*(B-.03));m.rotation.y=s>0?Math.PI:0;scene.add(m);}
function pyramid(x,z,S){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');for(let y=0;y<256;y+=16){g.fillStyle=y/16%2?'#d9b77e':'#cfab72';g.fillRect(0,y,64,16);g.fillStyle='rgba(120,80,40,.25)';g.fillRect(0,y+14,64,2);}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(6,1);const m=new THREE.Mesh(new THREE.ConeGeometry(18*S,16*S,4,1),new THREE.MeshLambertMaterial({map:t,flatShading:true}));
  m.position.set(x,8*S,z);m.rotation.y=Math.PI/4;m.castShadow=true;m.receiveShadow=true;scene.add(m);
  const cap=mesh(new THREE.ConeGeometry(1.8*S,1.6*S,4),'#f2c14e');cap.position.set(x,16*S-.8*S+.05,z);cap.rotation.y=Math.PI/4;scene.add(cap);}
function oasis(x,z,r){const w=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshLambertMaterial({color:'#3fb0c8',transparent:true,opacity:.92}));w.rotation.x=-Math.PI/2;w.position.set(x,.05,z);scene.add(w);oases.push(w);
  const rim=new THREE.Mesh(new THREE.RingGeometry(r,r+.6,20),new THREE.MeshLambertMaterial({color:'#b89a68'}));rim.rotation.x=-Math.PI/2;rim.position.set(x,.04,z);scene.add(rim);
  for(let i=0;i<8;i++){const a=i/8*6.28;kenney('stone_largeB',1,x+Math.cos(a)*(r+.4),z+Math.sin(a)*(r+.4),null,{h:.45+Math.random()*.3,y:0});}}
const oases=[],tumbles=[],dusts=[],vultures=[];
function tumble(){const g=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,1),new THREE.MeshLambertMaterial({color:'#a07a48',wireframe:true}));scene.add(g);g.userData={t:Math.random()*8};g.visible=false;tumbles.push(g);}
function vulture(){const g=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:'#3a2e28',side:THREE.DoubleSide});
  for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.3),m);w.position.x=s*.7;w.userData.s=s;g.add(w);}
  g.userData={cx:(Math.random()<.5?-1:1)*(L+12+Math.random()*6),cz:(Math.random()-.5)*20,r:6+Math.random()*6,h:16+Math.random()*5,sp:.18+Math.random()*.12,ph:Math.random()*6};scene.add(g);vultures.push(g);}
const DUST=radTex('rgba(240,215,160,.8)','rgba(240,215,160,0)');

// ===== armar la arena =====
async function build(){
  await Promise.all(['cliff_block_rock','cliff_block_stone','statue_column','statue_columnDamaged','statue_obelisk','statue_head','statue_block','statue_ring','cactus_short','cactus_tall','pot_large','pot_small','tent_detailedOpen','stone_tallC','stone_largeB',
    'gy-fire-basket','pirate/palm-straight','pirate/palm-detailed-bend','pirate/palm-detailed-straight'].map(loadK));
  // terrazas de arenisca a los lados (3 escalones) y esquinas
  for(const s of [-1,1]){for(let x=-E-9;x<=E+9;x+=2.5){plateau(x,s*(B+1.25),2.52,2.5,2.2,true);plateau(x,s*(B+3.75),2.52,2.5,3.2,true);plateau(x,s*(B+6.25),2.52,2.5,4.2,true);}
    for(const e of [-1,1])for(let z=GW+7.5;z<=B+.5;z+=2.5)for(let k=0;k<3;k++)plateau(e*(E+2.2+k*2.5),s*z,2.52,2.52,(e>0?2.2+k*.9:1.4+k*.6),true);}
  // jeroglíficos en la pared, columnas, estandartes, braseros, vasijas y cactus (igual cada lado)
  for(const s of [-1,1]){
    for(let x=-E+1;x<=E-1;x+=5)glyphPanel(x,s,1.15,1.9);
    for(let x=-E+3;x<=E-3;x+=6){kenney(Math.abs(x)%12<1?'statue_columnDamaged':'statue_column',1,x,s*(B+.9),0,{h:Math.abs(x)%12<1?2.4:3.4});}
    for(let x=-E+6;x<=E-6;x+=12){const bn=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.8,6,8),clothMat('#2b4c8c','#f2c14e'));bn.position.set(x,2.2+1.75,s*(B+.45));bn.rotation.y=s>0?Math.PI:0;scene.add(bn);
      for(const dx of [-.75,.75]){const p=mesh(new THREE.CylinderGeometry(.06,.07,3.4,6),'#8a5a38');p.position.set(x+dx,2.2+1.7,s*(B+.5));scene.add(p);}
      const rod=mesh(new THREE.CylinderGeometry(.05,.05,1.7,5),'#f2c14e');rod.rotation.z=Math.PI/2;rod.position.set(x,2.2+3.2,s*(B+.47));scene.add(rod);}
    for(const x of [-18,0,18]){kenney('gy-fire-basket',1,x,s*(B+3.6),0,{h:1.1});addGlow(new THREE.Vector3(x,3.2+1.2,s*(B+3.6)),2.2);}
    for(let x=-E-6;x<=E+6;x+=3+Math.random()*2){const r=Math.random(),z=s*(B+1.6+Math.random()*.8);
      if(r<.3)kenney(pickC(['pot_large','pot_small']),2.6,x,z,null,{});else if(r<.5)kenney(pickC(['cactus_short','cactus_tall']),3.4,x,z,null,{var:.3});}
    for(let x=-E-4;x<=E+4;x+=9)kenney('statue_obelisk',1,x,s*(B+6),0,{h:5.5});
    for(let x=-E;x<=E;x+=13)kenney('tent_detailedOpen',3.6,x+4,s*(B+3.75),s>0?Math.PI:0,{});
    for(let x=-E-6;x<=E+6;x+=7)kenney(pickC(['pirate/palm-straight','pirate/palm-detailed-straight']),1,x+2,s*(B+9+Math.random()*3),null,{h:5+Math.random()*1.5});}
  // extremos (los dos iguales): pórtico de columnas, obeliscos, cabeza de estatua, oasis con palmeras y pirámide
  for(const e of [1,-1]){const X=d=>e*(L+d);
    for(const sz of [-1,1]){kenney('statue_obelisk',1,X(3.4),sz*(GW+1.8),0,{h:5,y:0});
      for(let k=0;k<3;k++)kenney('statue_column',1,X(7),sz*(GW+1.5+k*2.6),0,{h:4,y:0});
      kenney('statue_head',1,X(10.5),sz*12,e>0?-Math.PI/2:Math.PI/2,{h:3.2,y:0});
      kenney(pickC(['pot_large','pot_small']),2.6,X(4.2),sz*(GW+4.2),null,{y:0});kenney('cactus_tall',3.4,X(5.4),sz*(GW+6.2),null,{y:0});}
    const lint=mesh(new THREE.BoxGeometry(1,0.6,2*(GW+1.5+5.2)+1),'#d9b77e');lint.position.set(X(7),4.3,0);scene.add(lint);
    oasis(X(12),0,2.6);for(const sz of [-1,1])kenney('pirate/palm-detailed-bend',1,X(12),sz*3.6,sz>0?Math.PI*.5:-Math.PI*.5,{h:5.5,y:0});
    pyramid(X(40),0,1.5);kenney('statue_ring',1,X(16),0,e>0?Math.PI/2:-Math.PI/2,{h:3.4,y:0});}
  for(let i=0;i<4;i++)tumble();for(let i=0;i<6;i++)vulture();
  for(let i=0;i<40;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:DUST,transparent:true,depthWrite:false,opacity:0}));scene.add(sp);dusts.push({sp,life:0});}
  
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
  for(const w of oases)w.material.color.setHSL(.53,.5,.5+Math.sin(T*2+w.position.x)*.03);
  for(const v of vultures){const u=v.userData,a=T*u.sp+u.ph;v.position.set(u.cx+Math.cos(a)*u.r,u.h+gk*4,u.cz+Math.sin(a)*u.r);v.rotation.y=-a;for(const w of v.children)w.rotation.z=w.userData.s*(.15+Math.sin(T*3+u.ph)*.12*(1+gk*3));}
  for(const t of tumbles){const u=t.userData;if(!t.visible){u.t-=dt;if(u.t<=0||gk>.95){t.visible=true;const e=Math.random()<.5?1:-1;u.x=e*(L+4+Math.random()*6);u.z=-B;u.v=2+Math.random()*1.5+gk*3;}else continue;}
    u.z+=u.v*dt;t.position.set(u.x+Math.sin(u.z*.6)*.4,.45+Math.abs(Math.sin(u.z*1.4))*.5,u.z);t.rotation.x+=dt*u.v/.45;if(u.z>B){t.visible=false;u.t=5+Math.random()*8;}}
  for(const d of dusts){if(d.life<=0){if(Math.random()<dt*(gk>0?30:4)){d.life=2.2;const s=Math.random()<.5?-1:1;d.sp.position.set((Math.random()-.5)*2*L,2.4+Math.random()*2,s*(B+2+Math.random()*3));d.v=new THREE.Vector3(2+Math.random()*2,(gk>0?1.5:.2),0);}else continue;}
    d.life-=dt;const k=1-d.life/2.2;d.sp.position.addScaledVector(d.v,dt);d.sp.scale.setScalar(1+k*3);d.sp.material.opacity=Math.sin(k*Math.PI)*.35;}
  for(const g of glows){const fl=1+Math.sin(T*9+g.ph)*.06+gk*.5;g.sp.scale.setScalar(g.base*fl);}

  beastsUpdate(dt,gk);
  for(const l of leaves){const u=l.userData;if(u.life<=0){if(Math.random()<dt*(gk>0?3:.35)&&treeTops.length){const p=pickC(treeTops);l.position.set(p.x+(Math.random()-.5)*3,p.y+6+Math.random()*2,p.z+(Math.random()-.5)*3);u.life=8;l.visible=true;u.ph=Math.random()*6;}else continue;}
    u.life-=dt;l.position.y-=dt*.7;l.position.x+=Math.sin(T*2+u.ph)*dt*.9+dt*.4;l.position.z+=Math.cos(T*1.7+u.ph)*dt*.6;l.rotation.set(T*2+u.ph,T*1.3,T+u.ph);if(l.position.y<.05||u.life<=0){u.life=0;l.visible=false;}}
  }
build();
return {update,onGoal:()=>{goalT=2.8;}};
};
