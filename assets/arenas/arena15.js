window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[15]=function(G){

window.GZ_FIELD_MOTIF='balon';   // v203: grabado en el césped de esta arena
// =====================================================================
// v201: CAMPO DE ENTRENAMIENTO — la primera arena, sencilla y alegre (piezas de Tripo en assets/arenas/campo)
// Día soleado. Terrazas de tierra con pasto encima de distintas alturas, unas cuantas gradas de madera,
// la terraza alta detrás de la portería rival, árboles redondos,
// lomas verdes al fondo, nubes, pájaros, mariposas y flores.
// Es la más ligera de todas: pocas piezas, sin fuego ni luces extra.
// =====================================================================
const L=32,HW=16;
const renderer=G.renderer,scene=G.root,REAL=G.scene,camera=G.camera;
REAL.background=new THREE.Color('#8fcdf5');REAL.fog=new THREE.Fog('#c4e6fa',150,340);
const hemi=new THREE.HemisphereLight(0xeef8ff,0x7a8a50,.64);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff2dc,.8);sun.position.set(-18,44,24);sun.castShadow=true;{const hq=window.save&&save.settings&&save.settings.quality==='alta';sun.shadow.mapSize.set(hq?2048:1024,hq?2048:1024);}
Object.assign(sun.shadow.camera,{left:-60,right:60,top:46,bottom:-46,near:8,far:140});sun.shadow.bias=-.0004;sun.shadow.normalBias=.045;scene.add(sun);
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;
const matCache={};
function flat(hex){if(matCache[hex])return matCache[hex];return matCache[hex]=new THREE.MeshLambertMaterial({color:hex,flatShading:true});}
const mesh=(geo,hex)=>{const m=new THREE.Mesh(geo,typeof hex==='string'?flat(hex):hex);m.castShadow=true;m.receiveShadow=true;return m;};
function radTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,inner);r.addColorStop(.35,inner.replace(/[\d.]+\)$/,'0.45)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}

// ===== cielo azul de día con sol y nubes esponjosas que pasan despacio =====
(function(){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,0,256);
  r.addColorStop(0,'#2f7fd6');r.addColorStop(.45,'#5fa9ea');r.addColorStop(.82,'#a9dbfa');r.addColorStop(1,'#e2f4ff');g.fillStyle=r;g.fillRect(0,0,16,256);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(300,32,16,0,Math.PI*2,0,Math.PI/2+.12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false,depthWrite:false}));
  dome.position.y=-20;scene.add(dome);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:radTex('rgba(255,252,235,1)','rgba(255,240,200,0)'),transparent:true,depthWrite:false,fog:false}));sp.position.set(240,150,-30);sp.scale.setScalar(90);scene.add(sp);})();
const clouds=[];
const CLOUDM=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8a9aaa});
function cloud(a,R,y,s){const g=new THREE.Group();const n=4+Math.floor(Math.random()*3);
  for(let i=0;i<n;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),CLOUDM);const k=(i/(n-1)-.5);b.position.set(k*s*3.2,Math.sin((k+.5)*Math.PI)*s*.5,(Math.random()-.5)*s*.8);b.scale.set(s*(1+Math.random()*.4),s*(.7+Math.random()*.3),s*.9);g.add(b);}
  const base=new THREE.Mesh(new THREE.SphereGeometry(1,12,6),CLOUDM);base.scale.set(s*2.4,s*.45,s*1.1);g.add(base);
  scene.add(g);clouds.push({g,a,R,y,sp:.004+Math.random()*.004});}

// ===== cancha: césped de la arena 1 =====
const CR=(window.SIM&&SIM.C&&SIM.C.CR)||7;
function lines(g,X,Z,PX,col,w){g.strokeStyle=col;g.lineWidth=PX*w;
  (window.GZ_RR?GZ_RR(g,X(-L),Z(-HW),2*L*PX,2*HW*PX,CR*PX):g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX));g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
  g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-8.6),9*PX,17.2*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}}
function grassTex(){const PX=24,W=72*PX,H=48*PX,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX,q=4,STK=!!window.strikersGrass;
  if(STK)strikersGrass(g,W,H,PX,X,Z);else for(let x=-36,i=0;x<36;x+=q,i++)for(let z=-24,j=0;z<24;z+=q,j++){g.fillStyle=(i+j)%2?'#9db150':'#89a444';g.fillRect(X(x),Z(z),q*PX+1,q*PX+1);}
  const t=new THREE.CanvasTexture(c);if(STK&&window.strikersFinish)strikersFinish(g,W,H,X(0),Z(0),PX,t);
  lines(g,X,Z,PX,STK?'#f6faf0':'rgba(240,234,214,.9)',STK?.25:.22);t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.needsUpdate=true;return t;}
function fieldShape(hx,hz,cx,cz){const sh=new THREE.Shape(),N=10,rx=hx-cx,rz=hz-cz,pts=[];
  for(const [sx,sz,a0] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]])
    for(let i=0;i<=N;i++){const a=a0+i/N*Math.PI/2;pts.push(new THREE.Vector2(sx*cx+Math.cos(a)*rx,sz*cz+Math.sin(a)*rz));}
  sh.setFromPoints(pts);const geo=new THREE.ShapeGeometry(sh,1),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+36)/72,(p.getY(i)+24)/48);return geo;}
const GRASS=grassTex();
const field=new THREE.Mesh(fieldShape(L+2.2,HW+1.6,L-CR,HW-CR),new THREE.MeshLambertMaterial({map:GRASS}));
field.rotation.x=-Math.PI/2;field.position.y=.01;field.receiveShadow=true;scene.add(field);
// pasto de afuera: un verde un poco más oscuro con manchitas, tréboles y florecitas pintadas
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#78b443';g.fillRect(0,0,S,S);
  for(let i=0;i<1400;i++){g.fillStyle=pickC(['rgba(60,120,30,.25)','rgba(150,200,80,.22)','rgba(90,150,40,.3)']);g.beginPath();g.ellipse(Math.random()*S,Math.random()*S,2+Math.random()*7,1+Math.random()*3,Math.random()*3,0,7);g.fill();}
  for(let i=0;i<90;i++){g.fillStyle=pickC(['#ffffff','#ffe066','#ff8fb0']);const x=Math.random()*S,y=Math.random()*S;for(let k=0;k<5;k++){const a=k*1.2566;g.beginPath();g.arc(x+Math.cos(a)*2.2,y+Math.sin(a)*2.2,1.6,0,7);g.fill();}g.fillStyle='#f2b632';g.beginPath();g.arc(x,y,1.2,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60);t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(460,460),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=-.02;m.receiveShadow=true;scene.add(m);})();

// ===== piezas de Tripo =====
const DIR='assets/arenas/campo/';
const loader=new THREE.GLTFLoader(),GM={};
const loadG=n=>new Promise(res=>loader.load(DIR+n+'.glb?v=203',g=>{GM[n]=g;res();},undefined,e=>{console.warn('falta',n,e);res();}));
function arenaMat(src){const map=src.map||null;if(map){map.encoding=THREE.LinearEncoding;map.anisotropy=4;map.needsUpdate=true;}
  const m=new THREE.MeshLambertMaterial({map,color:0xffffff});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.06;');};
  m.customProgramCacheKey=()=>'campoMat';return m;}
const PREP={};
function prep(n){if(PREP[n])return PREP[n];const g=GM[n];if(!g)return null;const s=g.scene;
  const mats=new Map();s.traverse(o=>{if(o.isMesh){if(!mats.has(o.material))mats.set(o.material,arenaMat(o.material));o.material=mats.get(o.material);o.castShadow=true;o.receiveShadow=true;}});
  s.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(s);return PREP[n]={s,box,size:box.getSize(new THREE.Vector3())};}
// place: w = ancho (x del modelo), d = fondo (z), h = alto; s = escala pareja; ry = giro (el frente del modelo mira a +z)
function place(n,o){const P=prep(n);if(!P)return null;o=o||{};
  const inner=P.s.clone(true),wrap=new THREE.Group();wrap.add(inner);
  const c=P.box.getCenter(new THREE.Vector3());inner.position.set(-c.x,-P.box.min.y,-c.z);
  const W0=P.size.x,D0=P.size.z,H0=P.size.y;let k=o.s||(o.w?o.w/W0:o.d?o.d/D0:o.h?o.h/H0:1);
  wrap.scale.set(o.w?o.w/W0:k,o.h?o.h/H0:k,o.d?o.d/D0:k);wrap.position.set(o.x||0,o.y||0,o.z||0);wrap.rotation.y=o.ry||0;scene.add(wrap);
  if(o.shadow===false)wrap.traverse(m=>{if(m.isMesh)m.castShadow=false;});return wrap;}
// piezas sueltas de un modelo (solo los triángulos dentro de una caja vista desde arriba)
const PARTS={};
function partOf(n,bx,yMin){yMin=yMin||0;const key=n+bx.join()+yMin;if(PARTS[key])return PARTS[key];const P=prep(n);if(!P)return null;const g=new THREE.Group(),mn=P.box.min,sz=P.size;
  P.s.updateMatrixWorld(true);P.s.traverse(m=>{if(!m.isMesh)return;const geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);const p=geo.attributes.position,idx=geo.index?geo.index.array:null,cnt=idx?idx.length:p.count,keep=[];
    const inb=v=>{const fx=(p.getX(v)-mn.x)/sz.x,fz=(p.getZ(v)-mn.z)/sz.z,fy=(p.getY(v)-mn.y)/sz.y;return fx>=bx[0]&&fx<=bx[1]&&fz>=bx[2]&&fz<=bx[3]&&fy>=yMin;};
    for(let t=0;t<cnt;t+=3){const a=idx?idx[t]:t,b=idx?idx[t+1]:t+1,c=idx?idx[t+2]:t+2;if(inb(a)&&inb(b)&&inb(c))keep.push(a,b,c);}
    if(!keep.length)return;geo.setIndex(keep);geo.clearGroups();const mm=new THREE.Mesh(geo,Array.isArray(m.material)?m.material[0]:m.material);mm.castShadow=true;mm.receiveShadow=true;g.add(mm);});
  g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);return PARTS[key]={s:g,box,size:box.getSize(new THREE.Vector3())};}
function placePart(Pp,o){const inner=Pp.s.clone(true),wrap=new THREE.Group();const c=Pp.box.getCenter(new THREE.Vector3());inner.position.set(-c.x,-Pp.box.min.y,-c.z);wrap.add(inner);
  wrap.scale.setScalar(o.h/Pp.size.y);wrap.position.set(o.x,o.y||0,o.z);wrap.rotation.y=o.ry||0;scene.add(wrap);return wrap;}
// objetos del modelo campo_objetos: caja (fracciones x0,x1,z0,z1 vistas desde arriba) y alto en metros
const OBJ={cono:[[.35,.56,0,.19],.9],balones:[[.235,.49,.56,.8],1.1],paca:[[0,.24,.36,.6],1.3],arbusto:[[.57,.83,.13,.38],1.2],banca:[[.81,1,.32,.6],1.1],letrero:[[.5,.58,.73,1],2.4]};
function obj(k,x,z,ry,y){const d=OBJ[k],Pp=partOf('campo_objetos',d[0],0);if(Pp)placePart(Pp,{x,z,y:y||0,h:d[1],ry:ry==null?Math.random()*6.28:ry});}

// terraza de tierra con pasto: W = ancho en x del mundo, D = fondo en z del mundo, H = alto
// (la terraza2 es la de franjas rojas; viene larga en z, así que se gira para usarla a lo largo de x)
function terr(t,x,z,W,D,H){const n=t===2?'campo_terraza2':'campo_terraza1';
  if(t===2)return place(n,{x,z,y:-.25,w:D,d:W,h:H,ry:Math.PI/2});return place(n,{x,z,y:-.25,w:W,d:D,h:H});}
// grada de madera: el frente (los escalones) mira a la cancha
const ROWS=[[.1,.26],[.32,.42],[.55,.57],[.76,.72]],SEATS=[];   // escalones medidos en la grada (centro del escalón, alto del piso)
function grada(x,z,ry,y){const W=8.05,D=6.5,H=5;place('campo_grada',{x,z,y:y||0,ry,w:W,d:D,h:H});
  const cs=Math.cos(ry),sn=Math.sin(ry);for(const [f,h] of ROWS){const lz=D/2-f*D;for(let lx=-W/2+.9;lx<=W/2-.7;lx+=1.45)SEATS.push({x:x+lx*cs+lz*sn,y:(y||0)+h*H,z:z-lx*sn+lz*cs,ry});}}
function tree(x,z,h,y){place(Math.random()<.5?'campo_arbol1':'campo_arbol2',{x,z,y:y||0,h,ry:Math.random()*6.28});}

// ===== lomas verdes al fondo =====
function hills(){const cols=['#6fae3e','#7cbc48','#5f9e36','#86c454'],far=['#8cc3a0','#9ccdb0','#a8d6bc'];
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2+Math.random()*.1,R=130+Math.random()*30,r=26+Math.random()*22;
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:pickC(cols)}));m.scale.set(r*1.5,r*(.35+Math.random()*.25),r);m.position.set(Math.cos(a)*R,-1,Math.sin(a)*R*.85);m.rotation.y=-a;m.receiveShadow=true;scene.add(m);}
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2,R=210+Math.random()*30,r=40+Math.random()*30;
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:pickC(far)}));m.scale.set(r*1.6,r*(.45+Math.random()*.3),r);m.position.set(Math.cos(a)*R,-2,Math.sin(a)*R*.85);m.rotation.y=-a;scene.add(m);}}

// ===== flores (una sola malla repetida: muy ligero) =====
function flowers(spots){const n=spots.length,geo=new THREE.IcosahedronGeometry(.2,0),m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),n),M=new THREE.Matrix4(),C=new THREE.Color();
  const cols=['#ff5a6e','#ffd23a','#ffffff','#b07bff','#ff8a3a','#5ab8ff'];
  spots.forEach(([x,z],i)=>{const s=.8+Math.random()*.7;M.makeScale(s,s*.7,s).setPosition(x,.22*s,z);m.setMatrixAt(i,M);m.setColorAt(i,C.set(pickC(cols)));});
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;scene.add(m);
  // tallitos y hojas: matitas verdes
  const g2=new THREE.ConeGeometry(.22,.6,5),t=new THREE.InstancedMesh(g2,new THREE.MeshLambertMaterial({color:'#4f9a2e'}),n);
  spots.forEach(([x,z],i)=>{M.makeRotationY(Math.random()*6).setPosition(x+(Math.random()-.5)*.3,.18,z+(Math.random()-.5)*.3);t.setMatrixAt(i,M);});t.instanceMatrix.needsUpdate=true;scene.add(t);}
function cluster(x,z,r,n,out){for(let i=0;i<n;i++){const a=Math.random()*6.28,d=Math.sqrt(Math.random())*r;out.push([x+Math.cos(a)*d,z+Math.sin(a)*d]);}}

// ===== mariposas, pájaros y humo de las chimeneas =====
const butterflies=[],birds=[],puffs=[],chimneys=[];
const WING=(function(){const c=document.createElement('canvas');c.width=64;c.height=32;const g=c.getContext('2d');
  for(const s of [-1,1]){g.fillStyle='#ffb02e';g.beginPath();g.ellipse(32+s*14,12,13,10,s*.4,0,7);g.fill();g.fillStyle='#ff7a2e';g.beginPath();g.ellipse(32+s*10,24,8,6,0,0,7);g.fill();
    g.fillStyle='#ffffff';g.beginPath();g.arc(32+s*18,10,3,0,7);g.fill();}
  g.fillStyle='#3a2a20';g.fillRect(30,6,4,22);return new THREE.CanvasTexture(c);})();
function butterfly(x,z){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:WING,transparent:true,depthWrite:false,color:pickC([0xffffff,0xffd0f0,0xc8f0ff])}));sp.scale.set(.7,.35,1);scene.add(sp);
  butterflies.push({sp,x,z,r:1+Math.random()*2,ph:Math.random()*6,sp_:.5+Math.random()*.5});}
function bird(){const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:'#4a3a32',side:THREE.DoubleSide});
  for(const s of [-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(s*.45,.18,s*.9,.05);sh.lineTo(s*.5,-.05);sh.lineTo(0,-.08);const w=new THREE.Mesh(new THREE.ShapeGeometry(sh),m);w.rotation.x=-Math.PI/2;const p=new THREE.Group();p.add(w);p.userData.s=s;g.add(p);}
  const b=new THREE.Mesh(new THREE.SphereGeometry(.13,6,5),m);g.add(b);g.scale.setScalar(1.3);scene.add(g);
  birds.push({g,cx:(Math.random()-.5)*60,cz:(Math.random()-.5)*60,r:14+Math.random()*20,h:22+Math.random()*14,sp_:.25+Math.random()*.25,ph:Math.random()*6,dir:Math.random()<.5?-1:1});}
const PUFF=radTex('rgba(255,255,255,.95)','rgba(255,255,255,0)');

// ===== portería de madera (al tamaño de la del juego) =====
function goals(){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},WD=new THREE.MeshLambertMaterial({color:'#b07848'}),WL=new THREE.MeshLambertMaterial({color:'#d9a46a'});
  for(const s of [-1,1]){for(const z of [-C.GW-.25,C.GW+.25]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.26,.3,C.GH+.3,10),WD);p.position.set(s*(L+.05),(C.GH+.3)/2,z);p.castShadow=true;scene.add(p);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),WL);cap.position.set(s*(L+.05),C.GH+.35,z);scene.add(cap);
      for(const y of [.5,C.GH-.4]){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.14,10),WL);ring.position.set(s*(L+.05),y,z);scene.add(ring);}}
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,2*C.GW+.5,10),WD);bar.rotation.x=Math.PI/2;bar.position.set(s*(L+.05),C.GH+.12,0);bar.castShadow=true;scene.add(bar);}}
function drawNets(){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},D=2.2,HB=C.GH*.72;
  const t=(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='#ffffff';g.lineWidth=4;g.strokeRect(2,2,60,60);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
  const mat=new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.25,side:THREE.DoubleSide,depthWrite:false});
  const panel=(w,h,x,y,z,ry,rx)=>{const gg=new THREE.PlaneGeometry(w,h),uv=gg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.6,uv.getY(i)*h/.6);
    const m=new THREE.Mesh(gg,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry,0,'YXZ');scene.add(m);};
  for(const s of [-1,1]){const X=s*L;panel(2*C.GW,HB,X+s*D,HB/2,0,Math.PI/2);
    panel(2*C.GW,Math.hypot(D,C.GH-HB),X+s*D/2,(C.GH+HB)/2,0,Math.PI/2,Math.atan2(s*D,-(C.GH-HB)));
    for(const z of [-C.GW,C.GW])panel(D,(C.GH+HB)/2,X+s*D/2,(C.GH+HB)/4,z,0);}}

// =====================================================================
// armado
// =====================================================================
async function build(){
  await Promise.all(['campo_grada','campo_terraza1','campo_terraza2','campo_arbol1','campo_arbol2','campo_objetos'].map(loadG));
  hills();
  const fl=[];
  // --- lados largos: una grada larga de madera abajo y terrazas de varios niveles detrás ---
  for(const s of [-1,1]){const ry=s>0?Math.PI:0,ZF=26;
    // terrazas bajitas al pie, a los lados de la grada
    const low=s>0?[[-27,9,2.6],[-18,7,3.6],[18.5,8,3],[27,9,2.4]]:[[-27,9,3.2],[-18.5,8,2.4],[18,7,3.4],[27,9,2.8]];
    low.forEach(([x,W,H],i)=>terr(i%2?2:1,x,s*23,W,6,H));
    const row1=s>0?[[-38,8,6],[-30,8,7.4],[-21.5,9,5.2],[-12,10,6.6],[-1,12,5.6],[11,12,7],[22,10,5.4],[31.5,9,7.6],[39.5,7,6]]
                  :[[-38,8,6.8],[-30,8,5.4],[-21.5,9,7.2],[-12,10,5.8],[-1,12,6.8],[11,12,5.4],[22,10,6.4],[31.5,9,5.2],[39.5,7,6.6]];
    row1.forEach(([x,W,H],i)=>{terr(i%3===1?2:1,x,s*(ZF+4),W+.3,8,H);if(i===1||i===6)tree(x,s*(ZF+4),8+Math.random()*2,H-.35);});
    const row2=s>0?[[-36,10,10.4],[-26,10,12],[-16,10,9.2],[-6,10,11.2],[4,10,9.6],[14,10,12.4],[24,10,10],[34,10,11.6]]
                  :[[-35,10,11.4],[-25,10,9.4],[-15,10,12.2],[-5,10,9.8],[5,10,11.8],[15,10,9.6],[25,10,12],[35,10,10.2]];
    row2.forEach(([x,W,H],i)=>{terr(i%2?2:1,x,s*(ZF+12),W+.3,8,H);if(i===2||i===6)tree(x,s*(ZF+12.5),9+Math.random()*2,H-.35);});
    const row3=s>0?[[-29,12,15],[3,10,16.5],[28,12,14.6]]:[[-28,12,16],[-2,10,14.6],[27,12,16.4]];
    row3.forEach(([x,W,H],i)=>{terr(1,x,s*(ZF+19.5),W,7,H);if(i===1)tree(x,s*(ZF+19.5),10,H-.35);});
    for(const x of [-8,0,8])grada(x,s*22.75,ry);   // tres tramos pegados = una grada larga
    for(const [k,x,z] of [['cono',-29.5,18.9],['cono',-27,18.8],['balones',13.4,19.3],['arbusto',-13.3,19.4]])obj(k,x,s*z,null);
    cluster(-22,s*18.9,1.2,8,fl);cluster(23,s*18.9,1.2,8,fl);}
  // --- detrás de la portería rival: pared de terrazas de franjas, y la terraza alta con la torrecita ---
  for(const [z,H] of [[-13.5,6],[-4.5,7.2],[4.5,7],[13.5,6.2]])terr(2,40,z,5,9.2,H);
  terr(1,48.5,0,12,14,11);tree(48.5,0,10,10.65);
  for(const e of [-1,1]){terr(1,47.5,e*13.5,10,12,9);tree(48,e*14,9.5,8.65);terr(1,57,e*7,9,12,13);}
  // esquinas del rival: arbolitos en el pasto
  for(const e of [-1,1]){tree(40,e*22,8);obj('paca',36.5,e*20,null);obj('arbusto',38.6,e*24.5,null);cluster(37.5,e*22.5,2.4,16,fl);}
  // --- detrás de TU portería: una gradita bajita (la cámara va ahí) con terrazas chiquitas a los lados ---
  terr(2,-40,0,6,12,2.2);terr(1,-46,0,7,16,4.2);
  for(const e of [-1,1]){terr(1,-40,e*10.5,8,9,3.2);terr(2,-46.5,e*13,8,10,5.6);tree(-41,e*19,8.5);cluster(-37.5,e*14.5,2.4,12,fl);}
  for(const e of [-1,1])tree(-55,e*8,9.5);
  // --- árboles sueltos en el campo de afuera ---
  for(const [x,z] of [[70,-30],[64,10],[74,34],[60,-48],[100,-20],[96,24],[-58,40],[-62,-36],[30,-60],[-10,-62],[10,62],[-24,64],[48,58],[50,-62],[110,-56],[84,-80],[64,84],[-48,-70]])tree(x+(Math.random()-.5)*4,z+(Math.random()-.5)*4,9+Math.random()*4);
  flowers(fl);
  for(let i=0;i<10;i++){const p=pickC(fl);if(p)butterfly(p[0],p[1]);}
  for(let i=0;i<7;i++)bird();
  for(let i=0;i<12;i++)cloud(i/12*Math.PI*2+Math.random()*.3,170+Math.random()*60,70+Math.random()*40,5+Math.random()*4);
  goals();
  if(!(typeof NETS!=='undefined'&&NETS.length))drawNets();
  // v205: público quitado por ahora (publico.js se queda guardado)
}
// ===== público (módulo compartido assets/arenas/publico.js) =====
let CROWD=null;
function crowdOn(){const go=()=>{try{CROWD=window.GZ_CROWD({scene,renderer,seats:SEATS,fog:REAL.fog,teams:window.GZ_TEAM_COLORS});}catch(e){console.warn('público',e);}};
  if(window.GZ_CROWD)go();else{const sc=document.createElement('script');sc.src='assets/arenas/publico.js?v=204';sc.onload=go;document.head.appendChild(sc);}}

// ===== animación =====
let goalT=0;
function update(dt){dt=Math.min(.05,dt);const T=(update.t=(update.t||0)+dt);const gk=goalT>0?goalT/2.8:0;if(goalT>0)goalT-=dt;
  if(CROWD)CROWD.update(dt,gk);
  for(const c of clouds){c.a+=c.sp*dt;c.g.position.set(Math.cos(c.a)*c.R,c.y,Math.sin(c.a)*c.R*.85);}
  for(const b of butterflies){const a=T*b.sp_+b.ph;b.sp.position.set(b.x+Math.cos(a)*b.r,.9+Math.sin(a*2.7)*.4+gk*2,b.z+Math.sin(a*1.3)*b.r);b.sp.scale.x=.7*(.35+Math.abs(Math.sin(T*14+b.ph))*.65);}
  for(const b of birds){const a=T*b.sp_*(1+gk*1.5)*b.dir+b.ph;b.g.position.set(b.cx+Math.cos(a)*b.r,b.h+Math.sin(a*2)*1.2,b.cz+Math.sin(a)*b.r);b.g.rotation.y=-a*b.dir+(b.dir<0?Math.PI:0);
    for(const w of b.g.children)if(w.userData.s)w.rotation.z=w.userData.s*Math.sin(T*9+b.ph)*.6;}
  for(const p of puffs){if(p.life<=0){p.life+=dt;if(p.life>0&&chimneys.length){const c=pickC(chimneys);p.life=4;p.sp.position.set(c.x,c.y,c.z);}else{p.sp.material.opacity=0;continue;}}
    p.life-=dt;const k=1-p.life/4;p.sp.position.y+=dt*1.6;p.sp.position.x+=dt*.8;p.sp.scale.setScalar(1.2+k*4.5);p.sp.material.opacity=Math.sin(k*Math.PI)*.75;if(p.life<=0)p.life=-Math.random()*1.2;}
}
build();
try{if(typeof GOAL_STD!=='undefined')GOAL_STD.forEach(m=>{if(m.geometry&&m.geometry.parameters&&m.geometry.parameters.radiusTop>.1)m.visible=false;});}catch(e){}
return {update,seats:SEATS,onGoal:t=>{goalT=2.8;if(CROWD)CROWD.react('gol',t);},crowdReact:k=>{if(CROWD)CROWD.react(k);}};
};
