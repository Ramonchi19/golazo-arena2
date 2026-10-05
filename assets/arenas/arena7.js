window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[7]=function(G){

const L=32,HW=16,GW=4.5,GH=2.9,B=HW+1.0,E=L+1.2;
// ===== paleta de hielo: azules fríos, nieve, cristal =====
const PAL={leaf:['#4a7a5a'],grass:'#eef4f8',bark:'#6a5040',barkDark:'#4a3a30',wood:'#8a6a50',woodDark:'#5a4434',woodInner:'#d8c8b0',
  stone:['#a8cce0','#9cc4dc','#b4d4e6'],dirt:'#8fb6cf',red:'#d9483f',tan:'#d8c8b0',yellow:'#f2c14e',purple:'#9a7bd6',
  white:'#f4f8fb',moss:'#d8e8f2',topGrass:'#f2f7fb',face:'#9cc4dc',water:'#7fb6d8',glow:'#bfefff'};
const KMAP={grass:'grass',woodBark:'bark',woodBarkDark:'barkDark',wood:'wood',woodDark:'woodDark',woodInner:'woodInner',stone:'stone',dirt:'dirt'};
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;

const renderer=G.renderer;

const scene=G.root,REAL=G.scene;REAL.background=new THREE.Color('#bcd8ec');REAL.fog=new THREE.Fog('#c4dcee',85,190);
const camera=G.camera;
const hemi=new THREE.HemisphereLight(0xe8f4ff,0x7a8a9a,.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xf2f8ff,.6);sun.position.set(-16,42,22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
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
  // v37: hielo turquesa translúcido con cuadrícula tenue "debajo del hielo", marco de bloques de hielo y nieve alrededor
  g.fillStyle='#eaf3f8';g.fillRect(0,0,W,H);
  for(let k=0;k<160;k++){const x=Math.random()*W,y=Math.random()*H,r=20+Math.random()*80,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(170,200,225,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  const fx=X(-L-.9),fy=Z(-HW-.9),fw=(2*L+1.8)*PX,fh=(2*HW+1.8)*PX;
  // marco de bloques de hielo
  for(let x=fx;x<fx+fw;x+=PX*2.2)for(const y of [fy,fy+fh-PX*1.1]){g.fillStyle=pickC(['#a8e2ee','#b6e8f2','#9ad9e8']);g.fillRect(x+2,y+2,PX*2.2-4,PX*1.1-4);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+4,y+4,PX*2.2-8,4);}
  for(let y=fy;y<fy+fh;y+=PX*2.2)for(const x of [fx,fx+fw-PX*1.1]){g.fillStyle=pickC(['#a8e2ee','#b6e8f2','#9ad9e8']);g.fillRect(x+2,y+2,PX*1.1-4,PX*2.2-4);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+4,y+4,4,PX*2.2-8);}
  // superficie de hielo
  const ix=X(-L-.2),iy=Z(-HW-.2),iw=(2*L+.4)*PX,ih=(2*HW+.4)*PX;
  const bg=g.createLinearGradient(ix,iy,ix+iw,iy+ih);bg.addColorStop(0,'#6cc4d9');bg.addColorStop(.5,'#7cd0e2');bg.addColorStop(1,'#66bfd5');g.fillStyle=bg;g.fillRect(ix,iy,iw,ih);
  for(let x=-L,i=0;x<L;x+=2,i++)for(let z=-HW,j=0;z<HW;z+=2,j++){g.fillStyle=(i+j)%2?'rgba(255,255,255,.07)':'rgba(20,90,130,.06)';g.fillRect(X(x),Z(z),2*PX,2*PX);}
  for(let k=0;k<120;k++){const x=ix+Math.random()*iw,y=iy+Math.random()*ih,r=30+Math.random()*120,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,Math.random()<.5?'rgba(220,250,255,.12)':'rgba(30,110,150,.10)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  for(let k=0;k<14;k++){const x=ix+Math.random()*iw,y=iy+Math.random()*ih,len=300+Math.random()*500;const gr=g.createLinearGradient(x,y,x+len,y-len*.5);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.16)');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.strokeStyle=gr;g.lineWidth=10+Math.random()*25;g.beginPath();g.moveTo(x,y);g.lineTo(x+len,y-len*.5);g.stroke();}
  for(let k=0;k<26;k++){let x=ix+Math.random()*iw,y=iy+Math.random()*ih;g.strokeStyle='rgba(30,90,130,.45)';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y);
    for(let s=0;s<5+Math.random()*6;s++){x+=(Math.random()-.5)*110;y+=(Math.random()-.5)*110;g.lineTo(x,y);}g.stroke();}
  const line=(w,col)=>{g.strokeStyle=col;g.lineWidth=PX*w;g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX);g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
    g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-11),9*PX,22*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}};
  line(.34,'rgba(20,70,110,.35)');line(.22,'rgba(255,255,255,.97)');
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const field=new THREE.Mesh(new THREE.PlaneGeometry(72,48),new THREE.MeshLambertMaterial({map:fieldTex(),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
field.rotation.x=-Math.PI/2;field.receiveShadow=true;scene.add(field);
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#e8f1f7';g.fillRect(0,0,S,S);
  for(let i=0;i<300;i++){g.fillStyle=pickC(['rgba(200,220,235,.5)','rgba(255,255,255,.5)']);g.beginPath();g.arc(Math.random()*S,Math.random()*S,4+Math.random()*20,0,7);g.fill();}
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

// ===== piezas de la tundra de hielo =====
const H_='holiday/';
function hp(n,x,z,S,rot,y){const src=KB[H_+n];if(!src)return null;const o=src.clone(true);o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  o.scale.setScalar(S);o.position.set(x,y!=null?y:heightAt(x,z),z);o.rotation.y=rot||0;scene.add(o);return o;}
const crystals=[],icicles=[],snow=[],auroras=[];
const iceMat=new THREE.MeshLambertMaterial({color:'#9fe0f2',emissive:'#2a7ea0',emissiveIntensity:.35,transparent:true,opacity:.86,flatShading:true});
function crystal(x,z,h,tilt){const g=new THREE.Group();const n=3+Math.floor(Math.random()*3);
  for(let i=0;i<n;i++){const hh=h*(i?.45+Math.random()*.4:1),r=.35*h/4*(i?.7:1)+.15;const c=new THREE.Mesh(new THREE.CylinderGeometry(0,r,hh,6),iceMat);c.position.set(i?(Math.random()-.5)*h*.25:0,hh/2,i?(Math.random()-.5)*h*.25:0);
    c.rotation.set(i?(Math.random()-.5)*.6:0,0,i?(Math.random()-.5)*.6:tilt||0);c.castShadow=true;g.add(c);}
  g.position.set(x,heightAt(x,z),z);scene.add(g);crystals.push(g);addGlow(new THREE.Vector3(x,heightAt(x,z)+h*.5,z),h*.9);glows[glows.length-1].sp.material.color.set('#9fe8ff');pools[pools.length-1].m.material.color.set('#9fe8ff');}
function igloo(x,z,face){const g=new THREE.Group();const c=document.createElement('canvas');c.width=128;c.height=64;const q=c.getContext('2d');q.fillStyle='#f2f8fc';q.fillRect(0,0,128,64);q.strokeStyle='#b8cfe0';q.lineWidth=2;
  for(let y=0;y<64;y+=12){q.beginPath();q.moveTo(0,y);q.lineTo(128,y);q.stroke();for(let x=(y/12%2)*8;x<128;x+=16){q.beginPath();q.moveTo(x,y);q.lineTo(x,y+12);q.stroke();}}
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1.9,14,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}));dome.castShadow=true;dome.receiveShadow=true;g.add(dome);
  const tun=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,1.4,10,1,false,0,Math.PI),new THREE.MeshLambertMaterial({color:'#eef6fb'}));tun.rotation.z=Math.PI/2;tun.rotation.y=Math.PI/2;tun.position.set(1.9,0,0);g.add(tun);
  const door=new THREE.Mesh(new THREE.CircleGeometry(.55,10,0,Math.PI),new THREE.MeshBasicMaterial({color:'#3a5068'}));door.position.set(2.62,0,0);door.rotation.y=Math.PI/2;g.add(door);
  g.position.set(x,heightAt(x,z),z);g.rotation.y=face;scene.add(g);}
function icicleRow(x1,x2,s,y){for(let x=x1;x<=x2;x+=.5+Math.random()*.5){const h=.25+Math.random()*.7;const c=new THREE.Mesh(new THREE.ConeGeometry(.09,h,5),iceMat);c.rotation.x=Math.PI;c.position.set(x,y-h/2,s*(B-.06));scene.add(c);}}
function mountain(x,z,S){const m=mesh(new THREE.ConeGeometry(14*S,14*S,7),'#8a9cb0');m.position.set(x,7*S,z);scene.add(m);const cap=mesh(new THREE.ConeGeometry(6.2*S,6.2*S,7),'#f4f8fb');cap.position.set(x,7*S+4*S,z);cap.rotation.y=m.rotation.y;scene.add(cap);}
function aurora(){for(let i=0;i<3;i++){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,64);
    gr.addColorStop(0,'rgba(120,255,200,0)');gr.addColorStop(.5,i%2?'rgba(140,255,190,.9)':'rgba(150,170,255,.9)');gr.addColorStop(1,'rgba(120,255,200,0)');g.fillStyle=gr;g.fillRect(0,0,256,64);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(140,16,40,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));
    m.position.set(75+i*12,34+i*6,(i-1)*10);m.rotation.y=-Math.PI/2;scene.add(m);auroras.push({m,ph:i*2,base:m.geometry.attributes.position.array.slice()});}}
const FLAKE=radTex('rgba(255,255,255,1)','rgba(255,255,255,0)');

// ===== armar la arena =====
async function build(){
  await Promise.all(['cliff_block_rock','cliff_block_stone'].concat(['tree-snow-a','tree-snow-b','tree-snow-c','snowman','snowman-hat','rocks-large','rocks-medium','rocks-small','snow-pile','snow-bunker','lantern','lights-colored','bench','sled','sled-long'].map(n=>H_+n)).map(loadK));
  // paredes de hielo y nieve (3 escalones) con carámbanos
  for(const s of [-1,1]){for(let x=-E-9;x<=E+9;x+=2.5){plateau(x,s*(B+1.25),2.52,2.5,2.1+Math.random()*.25,true);plateau(x,s*(B+3.75),2.52,2.5,3.1+Math.random()*.3,true);plateau(x,s*(B+6.25),2.52,2.5,4.2+Math.random()*.4,true);}
    for(const e of [-1,1])for(let z=GW+7.5;z<=B+.5;z+=2.5)for(let k=0;k<3;k++)plateau(e*(E+2.2+k*2.5),s*z,2.52,2.52,(e>0?2.1+k*.9:1.3+k*.6),true);
    icicleRow(-E-8,E+8,s,2.08);}
  // orilla y arriba (igual de cada lado)
  for(const s of [-1,1]){
    for(let x=-E-6;x<=E+6;x+=2.4+Math.random()*1.4){const r=Math.random(),z=s*(B+.8+Math.random()*1.3);
      if(r<.3)hp('snow-pile',x,z,2.6,Math.random()*6);else if(r<.45)hp(pickC(['rocks-small','rocks-medium']),x,z,1.4,Math.random()*6);}
    for(const x of [-24,-8,8,24])hp('lantern',x,s*(B+.9),1.6,0);
    for(let x=-E+1;x<=E-1;x+=1.6)hp('lights-colored',x,s*(B+.25),1.6,0,heightAt(x,s*(B+1.25)));
    for(const x of [-16,16]){hp('snowman-hat',x,s*(B+1.6),2,s>0?Math.PI:0);}
    for(const x of [-28,-4,4,28])crystal(x,s*(B+3.6),2.6+Math.random()*1.2,s*.2);
    igloo(0,s*(B+3.7),s>0?-Math.PI/2:Math.PI/2);
    for(let x=-E-8;x<=E+8;x+=2.6)hp(pickC(['tree-snow-a','tree-snow-b','tree-snow-c']),x+Math.random(),s*(B+5.6+Math.random()*1.4),2.2+Math.random()*.8,Math.random()*6);
    for(let x=-E-8;x<=E+8;x+=3.2)hp(pickC(['tree-snow-a','tree-snow-b','tree-snow-c']),x+Math.random()*2,s*(B+10+Math.random()*12),2.6+Math.random()*1.2,Math.random()*6);}
  // extremos (los dos iguales): puerta de cristales, iglú, muñecos de nieve, trineo, bancas, faroles y montañas
  for(const e of [1,-1]){const X=d=>e*(L+d),face=e>0?Math.PI:0;
    for(const sz of [-1,1]){crystal(X(3.4),sz*(GW+1.8),5.2,-sz*.15*e);crystal(X(7.5),sz*(GW+5),3.2,0);
      hp('snowman',X(5),sz*(GW+3.2),1.8,face+(e>0?0:0));hp('bench',X(4.2),sz*(GW+7.2),1.8,e>0?-Math.PI/2:Math.PI/2);hp('lantern',X(3.2),sz*(GW+5.8),1.6,0);
      hp('rocks-large',X(10),sz*10.5,1.2,Math.random()*6);hp('snow-bunker',X(6.5),sz*(GW+8.2),1.8,Math.random()*6);
      for(let k=0;k<3;k++)hp(pickC(['tree-snow-a','tree-snow-b','tree-snow-c']),X(12+k*2.5),sz*(7+k*2),2.6,Math.random()*6);}
    igloo(X(10),0,e>0?Math.PI:0);hp('sled-long',X(6.5),0,1.8,Math.PI/2);
    mountain(X(48),-14,1.4);mountain(X(52),10,1.8);}
  aurora();
  for(let i=0;i<220;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FLAKE,transparent:true,depthWrite:false,opacity:.85}));sp.scale.setScalar(.16+Math.random()*.12);
    sp.position.set((Math.random()-.5)*110,Math.random()*30,(Math.random()-.5)*80);sp.userData={v:.8+Math.random()*.9,ph:Math.random()*6};scene.add(sp);snow.push(sp);}
  
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
  for(const f of snow){const u=f.userData;f.position.y-=dt*u.v*(1+gk*.5);f.position.x+=Math.sin(T*.8+u.ph)*dt*.5+dt*(.4+gk*4);if(f.position.y<0||f.position.x>60){f.position.y=24+Math.random()*8;f.position.x=(Math.random()-.5)*110;}}
  for(const a of auroras){const p=a.m.geometry.attributes.position;for(let i=0;i<p.count;i++){const bx=a.base[i*3];p.setY(i,a.base[i*3+1]+Math.sin(bx*.08+T*.6+a.ph)*3);p.setZ(i,Math.sin(bx*.05+T*.4+a.ph)*4);}p.needsUpdate=true;a.m.material.opacity=.28+Math.sin(T*.5+a.ph)*.1+gk*.4;}
  iceMat.emissiveIntensity=.3+Math.sin(T*1.4)*.08+gk*.6;

  beastsUpdate(dt,gk);
  for(const l of leaves){const u=l.userData;if(u.life<=0){if(Math.random()<dt*(gk>0?3:.35)&&treeTops.length){const p=pickC(treeTops);l.position.set(p.x+(Math.random()-.5)*3,p.y+6+Math.random()*2,p.z+(Math.random()-.5)*3);u.life=8;l.visible=true;u.ph=Math.random()*6;}else continue;}
    u.life-=dt;l.position.y-=dt*.7;l.position.x+=Math.sin(T*2+u.ph)*dt*.9+dt*.4;l.position.z+=Math.cos(T*1.7+u.ph)*dt*.6;l.rotation.set(T*2+u.ph,T*1.3,T+u.ph);if(l.position.y<.05||u.life<=0){u.life=0;l.visible=false;}}
  }
build();
return {update,onGoal:()=>{goalT=2.8;}};
};
