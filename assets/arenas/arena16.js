window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[16]=function(G){

window.GZ_FIELD_MOTIF='hoja';   // v203: grabado en el césped de esta arena
// =====================================================================
// v202: BOSQUE ENCANTADO — atardecer dorado entre árboles gigantes (piezas de Tripo en assets/arenas/bosque)
// Una grada larga de troncos por lado, escalones de roca con musgo de varias alturas, el árbol más grande
// detrás de la portería rival con un arroyo enfrente, hongos gigantes que brillan, faroles, rayos de luz,
// luciérnagas y hojas que caen. Ligera como la primera arena: sin sombras extra ni luces de verdad.
// =====================================================================
const L=32,HW=16;
const renderer=G.renderer,scene=G.root,REAL=G.scene,camera=G.camera;
REAL.background=new THREE.Color('#f0a86a');REAL.fog=new THREE.Fog('#d9946a',110,260);
const hemi=new THREE.HemisphereLight(0xffe2c0,0x4a5a30,.6);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffc890,.78);sun.position.set(30,30,18);sun.castShadow=true;{const hq=window.save&&save.settings&&save.settings.quality==='alta';sun.shadow.mapSize.set(hq?2048:1024,hq?2048:1024);sun.shadow.bias=-.0004;sun.shadow.normalBias=.045; /* v208: sin rayitas de sombra en el pasto */}
Object.assign(sun.shadow.camera,{left:-60,right:60,top:46,bottom:-46,near:8,far:140});sun.shadow.bias=-.0004;sun.shadow.normalBias=.045;scene.add(sun);
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;
const matCache={};
function flat(hex){if(matCache[hex])return matCache[hex];return matCache[hex]=new THREE.MeshLambertMaterial({color:hex,flatShading:true});}
const mesh=(geo,hex)=>{const m=new THREE.Mesh(geo,typeof hex==='string'?flat(hex):hex);m.castShadow=true;m.receiveShadow=true;return m;};
function radTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,inner);r.addColorStop(.35,inner.replace(/[\d.]+\)$/,'0.45)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}

// ===== cielo azul de día con sol y nubes esponjosas que pasan despacio =====
(function(){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,0,256);
  r.addColorStop(0,'#4a3a8a');r.addColorStop(.4,'#b0628a');r.addColorStop(.75,'#f09a6a');r.addColorStop(1,'#ffd49a');g.fillStyle=r;g.fillRect(0,0,16,256);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(300,32,16,0,Math.PI*2,0,Math.PI/2+.12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false,depthWrite:false}));
  dome.position.y=-20;scene.add(dome);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:radTex('rgba(255,236,190,1)','rgba(255,170,90,0)'),transparent:true,depthWrite:false,fog:false}));sp.position.set(250,38,-20);sp.scale.setScalar(130);scene.add(sp);})();
const clouds=[];
const CLOUDM=new THREE.MeshLambertMaterial({color:0xffd2b0,emissive:0xa0604a});
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
// piso del bosque: verde oscuro con hojas caídas naranjas y musgo
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#4f8a34';g.fillRect(0,0,S,S);
  for(let i=0;i<1400;i++){g.fillStyle=pickC(['rgba(30,70,20,.3)','rgba(110,160,60,.2)','rgba(60,110,30,.3)']);g.beginPath();g.ellipse(Math.random()*S,Math.random()*S,2+Math.random()*7,1+Math.random()*3,Math.random()*3,0,7);g.fill();}
  for(let i=0;i<160;i++){g.fillStyle=pickC(['#e08a3a','#c8642a','#e8b44a','#a8502a']);const x=Math.random()*S,y=Math.random()*S;g.beginPath();g.ellipse(x,y,4,2,Math.random()*3,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60);t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(460,460),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=-.02;m.receiveShadow=true;scene.add(m);})();

// ===== piezas de Tripo =====
const DIR='assets/arenas/bosque/';
const loader=new THREE.GLTFLoader(),GM={};
const loadG=n=>new Promise(res=>loader.load(DIR+n+'.glb?v=203',g=>{GM[n]=g;res();},undefined,e=>{console.warn('falta',n,e);res();}));
function arenaMat(src){const map=src.map||null;if(map){map.encoding=THREE.LinearEncoding;map.anisotropy=4;map.needsUpdate=true;}
  const m=new THREE.MeshLambertMaterial({map,color:0xffffff});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
     {vec3 c=diffuseColor.rgb;float yel=smoothstep(.55,.8,c.r)*smoothstep(.45,.7,c.g)*smoothstep(.25,.05,c.b);
      float cyan=smoothstep(.45,.7,c.g)*smoothstep(.45,.7,c.b)*smoothstep(.3,.1,c.r);
      float pur=smoothstep(.4,.6,c.b)*smoothstep(.3,.5,c.r)*smoothstep(.3,.15,c.g);
      totalEmissiveRadiance+=c*(.06+yel*.8+cyan*.7+pur*.35);}`);};
  m.customProgramCacheKey=()=>'bosqueMat';return m;}
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
// objetos del modelo bosque_objetos: caja (fracciones x0,x1,z0,z1 vistas desde arriba) y alto en metros
const OBJ={tronco:[[0,.46,0,.3],1.2],tocon:[[.58,1,.03,.3],1.4],helecho:[[0,.46,.4,.7],1.3],roca:[[.55,.96,.4,.66],1.3],helecho2:[[0,.47,.72,1],1.2],barril:[[.48,.69,.82,.99],1.1],letrero:[[.74,1,.86,.97],2]};
function obj(k,x,z,ry,y){const d=OBJ[k],Pp=partOf('bosque_objetos',d[0],0);if(Pp)placePart(Pp,{x,z,y:y||0,h:d[1],ry:ry==null?Math.random()*6.28:ry});}

// terraza de tierra con pasto: W = ancho en x del mundo, D = fondo en z del mundo, H = alto
// (la terraza2 es la de franjas rojas; viene larga en z, así que se gira para usarla a lo largo de x)
function terr(t,x,z,W,D,H){const f=t===2?Math.PI:0;if(W<D)return place('bosque_roca',{x,z,y:-.2,w:D,d:W,h:H,ry:Math.PI/2+f});return place('bosque_roca',{x,z,y:-.2,w:W,d:D,h:H,ry:f});}
// grada de madera: el frente (los escalones) mira a la cancha
const ROWS=[[.16,.41],[.36,.54],[.56,.67],[.76,.84]],SEATS=[];   // escalones medidos en la grada (centro del escalón, alto del piso)
function grada(x,z,ry,y){const W=8.05,D=6.5,H=5;place('bosque_grada',{x,z,y:y||0,ry,w:W,d:D,h:H});
  const cs=Math.cos(ry),sn=Math.sin(ry);for(const [f,h] of ROWS){const lz=D/2-f*D;for(let lx=-W/2+.9;lx<=W/2-.7;lx+=1.45)SEATS.push({x:x+lx*cs+lz*sn,y:(y||0)+h*H,z:z-lx*sn+lz*cs,ry});}}
function tree(x,z,h,y){place('bosque_arbol',{x,z,y:y||0,h,ry:Math.random()*6.28,shadow:false});}
function giant(x,z,h,k,ry){place(k===2?'bosque_arbolgrande2':'bosque_arbolgrande1',{x,z,y:-h*.055,h,ry:ry==null?Math.random()*6.28:ry});}
function shrooms(x,z,h,k,y){place(k===2?'bosque_hongos2':'bosque_hongos1',{x,z,y:y||0,h,ry:Math.random()*6.28});addGlow(new THREE.Vector3(x,(y||0)+h*.7,z),h*1.6,k===2?'#c070ff':'#60e0d0',.35);}

// ===== lomas verdes al fondo =====
function hills(){const cols=['#2f5a2a','#355f2c','#2a5226','#3a6630'],far=['#6a5a6a','#7a6070','#5f5266'];
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2+Math.random()*.1,R=130+Math.random()*30,r=26+Math.random()*22;
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:pickC(cols)}));m.scale.set(r*1.5,r*(.35+Math.random()*.25),r);m.position.set(Math.cos(a)*R,-1,Math.sin(a)*R*.85);m.rotation.y=-a;m.receiveShadow=true;scene.add(m);}
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2,R=210+Math.random()*30,r=40+Math.random()*30;
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:pickC(far)}));m.scale.set(r*1.6,r*(.45+Math.random()*.3),r);m.position.set(Math.cos(a)*R,-2,Math.sin(a)*R*.85);m.rotation.y=-a;scene.add(m);}}

// ===== flores (una sola malla repetida: muy ligero) =====
function flowers(spots){const n=spots.length,geo=new THREE.IcosahedronGeometry(.2,0),m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),n),M=new THREE.Matrix4(),C=new THREE.Color();
  const cols=['#ffd23a','#ffffff','#b07bff','#60e0d0','#ff8ac0'];
  spots.forEach(([x,z],i)=>{const s=.8+Math.random()*.7;M.makeScale(s,s*.7,s).setPosition(x,.22*s,z);m.setMatrixAt(i,M);m.setColorAt(i,C.set(pickC(cols)));});
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;scene.add(m);
  // tallitos y hojas: matitas verdes
  const g2=new THREE.ConeGeometry(.22,.6,5),t=new THREE.InstancedMesh(g2,new THREE.MeshLambertMaterial({color:'#4f9a2e'}),n);
  spots.forEach(([x,z],i)=>{M.makeRotationY(Math.random()*6).setPosition(x+(Math.random()-.5)*.3,.18,z+(Math.random()-.5)*.3);t.setMatrixAt(i,M);});t.instanceMatrix.needsUpdate=true;scene.add(t);}
function cluster(x,z,r,n,out){for(let i=0;i<n;i++){const a=Math.random()*6.28,d=Math.sqrt(Math.random())*r;out.push([x+Math.cos(a)*d,z+Math.sin(a)*d]);}}

// ===== brillos, faroles, luciérnagas, hojas que caen, rayos de luz y arroyo =====
const glows=[],rays=[],waters=[];
const GLOW=radTex('rgba(255,220,140,1)','rgba(255,170,80,0)');
function addGlow(p,size,col,op){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:col||'#ffc070',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:op||.6}));
  sp.position.copy(p);sp.scale.setScalar(size);scene.add(sp);glows.push({sp,base:size,ph:Math.random()*6});return sp;}
// farol de madera con lámpara de luz cálida (por código)
const WOODF=new THREE.MeshLambertMaterial({color:'#5a3a22'}),IRONF=new THREE.MeshLambertMaterial({color:'#2a2422'}),LAMP=new THREE.MeshBasicMaterial({color:'#ffd27a'});
function lantern(x,z,ry){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry||0;scene.add(g);
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.13,.18,3.6,7),WOODF);p.position.y=1.8;p.castShadow=true;g.add(p);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,1),WOODF);arm.position.set(0,3.45,.42);g.add(arm);
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(.38,.5,.38),LAMP);lamp.position.set(0,3.05,.85);g.add(lamp);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.34,.3,4),IRONF);cap.rotation.y=Math.PI/4;cap.position.set(0,3.45,.85);g.add(cap);
  const bot=new THREE.Mesh(new THREE.BoxGeometry(.44,.08,.44),IRONF);bot.position.set(0,2.8,.85);g.add(bot);
  g.updateMatrixWorld(true);addGlow(new THREE.Vector3(0,3.05,.85).applyMatrix4(g.matrixWorld),3.4,'#ffc070',.7);}
// luciérnagas y hojas que caen (puntos: muy ligero)
const FF_N=140,ffPos=new Float32Array(FF_N*3),ffBase=new Float32Array(FF_N*3);let ffPts=null;
const LF_N=70,lfPos=new Float32Array(LF_N*3);let lfPts=null;
function particles(){for(let i=0;i<FF_N;i++){const a=Math.random()*6.28,R=38+Math.random()*16;ffBase[i*3]=Math.cos(a)*R*1.2;ffBase[i*3+1]=1+Math.random()*6;ffBase[i*3+2]=Math.sin(a)*R*.75;}
  const g1=new THREE.BufferGeometry();g1.setAttribute('position',new THREE.BufferAttribute(ffPos,3));
  ffPts=new THREE.Points(g1,new THREE.PointsMaterial({map:radTex('rgba(230,255,140,1)','rgba(200,255,90,0)'),color:0xeaff9a,size:.7,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));ffPts.frustumCulled=false;scene.add(ffPts);
  for(let i=0;i<LF_N;i++){lfPos[i*3]=(Math.random()-.5)*90;lfPos[i*3+1]=Math.random()*20;lfPos[i*3+2]=(Math.random()-.5)*60;}
  const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.fillStyle='#e8903a';g.beginPath();g.ellipse(16,16,12,6,.6,0,7);g.fill();g.strokeStyle='#a8502a';g.lineWidth=2;g.beginPath();g.moveTo(6,22);g.lineTo(26,10);g.stroke();
  const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(lfPos,3));
  lfPts=new THREE.Points(g2,new THREE.PointsMaterial({map:new THREE.CanvasTexture(c),size:.55,transparent:true,alphaTest:.3,depthWrite:false}));lfPts.frustumCulled=false;scene.add(lfPts);}
// rayos de luz del atardecer entre los árboles
function lightRays(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,220,150,.0)');gr.addColorStop(.25,'rgba(255,220,150,.55)');gr.addColorStop(1,'rgba(255,220,150,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,256);const id=g.getImageData(0,0,64,256);for(let y=0;y<256;y++)for(let x=0;x<64;x++){const k=(y*64+x)*4,e=Math.sin(x/63*Math.PI);id.data[k+3]*=e;}g.putImageData(id,0,0);
  const t=new THREE.CanvasTexture(c);
  for(const [x,z,w,ry] of [[30,-30,7,.5],[18,30,6,-.4],[-10,-34,8,.3],[40,8,5,.1],[-28,30,6,-.2],[6,-36,5,.6]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,46),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:.5,fog:false}));
    m.position.set(x,18,z);m.rotation.set(0,ry,-.55);scene.add(m);rays.push({m,ph:Math.random()*6});}}
// arroyo que corre a lo ancho, detrás de la pared de rocas del lado rival
function stream(x0,x1){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');g.fillStyle='#3a9ab8';g.fillRect(0,0,128,128);
  for(let i=0;i<60;i++){g.strokeStyle='rgba(220,250,255,'+(.25+Math.random()*.4)+')';g.lineWidth=1+Math.random()*2.5;const y=Math.random()*128,x=Math.random()*128;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+10,y-4,x+22,y);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,12);waters.push(t);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,120),new THREE.MeshLambertMaterial({map:t,emissive:0x0e3040,transparent:true,opacity:.92}));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.05,0);scene.add(m);
  for(const x of [x0,x1])for(let z=-58;z<58;z+=2.2){const r=mesh(new THREE.DodecahedronGeometry(.6+Math.random()*.5,0),pickC(['#7a7f86','#8a8f96','#6a6f76']));r.position.set(x+(Math.random()-.5)*.6,.15,z);r.scale.y=.6;scene.add(r);}}
// ===== portería de madera (al tamaño de la del juego) =====
function goals(){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},WD=new THREE.MeshLambertMaterial({color:'#8a5a34'}),WL=new THREE.MeshLambertMaterial({color:'#b88450'});
  for(const s of [-1,1]){for(const z of [-C.GW-.25,C.GW+.25]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.26,.3,C.GH+.3,10),WD);p.position.set(s*(L+.05),(C.GH+.3)/2,z);p.castShadow=true;scene.add(p);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),WL);cap.position.set(s*(L+.05),C.GH+.35,z);scene.add(cap);
      for(const y of [.5,C.GH-.4]){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.14,10),WL);ring.position.set(s*(L+.05),y,z);scene.add(ring);}}
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,2*C.GW+.5,10),WD);bar.rotation.x=Math.PI/2;bar.position.set(s*(L+.05),C.GH+.12,0);bar.castShadow=true;scene.add(bar);
    // enredadera: hojitas verdes alrededor de postes y travesaño
    const LV=new THREE.MeshLambertMaterial({color:'#4f9a2e',flatShading:true}),lg=new THREE.IcosahedronGeometry(.16,0);
    for(const z of [-C.GW-.25,C.GW+.25])for(let k=0;k<9;k++){const a=k*1.4,y=.3+k*C.GH/9,l=new THREE.Mesh(lg,LV);l.position.set(s*(L+.05)+Math.cos(a)*.3,y,z+Math.sin(a)*.3);scene.add(l);}
    for(let k=0;k<14;k++){const a=k*1.3,l=new THREE.Mesh(lg,LV);l.position.set(s*(L+.05)+Math.cos(a)*.27,C.GH+.12+Math.sin(a)*.27,-C.GW+k*2*C.GW/13);scene.add(l);}}}
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
  await Promise.all(['bosque_grada','bosque_roca','bosque_arbol','bosque_arbolgrande1','bosque_arbolgrande2','bosque_hongos1','bosque_hongos2','bosque_objetos'].map(loadG));
  hills();
  const fl=[];
  // --- lados largos: una grada larga de troncos abajo, escalones de roca con musgo detrás y árboles gigantes ---
  for(const s of [-1,1]){const ry=s>0?Math.PI:0,ZF=26;
    const low=s>0?[[-27,9,2.4],[-18,7,3.4],[18.5,8,2.8],[27,9,2.2]]:[[-27,9,3],[-18.5,8,2.2],[18,7,3.2],[27,9,2.6]];
    low.forEach(([x,W,H],i)=>{terr(i%2?2:1,x,s*23,W,6,H);if(i!==(s>0?0:3))tree(x+(i<2?-1.5:1.5),s*23.4,8+Math.random()*2.5,H-.3);});   // arbolitos arriba de las rocas bajitas, cerca de la cancha
    const row1=s>0?[[-36,10,6],[-26,10,7.4],[-16,10,5.2],[-6,10,6.6],[4,10,5.6],[14,10,7],[24,10,5.4],[34,10,7.6]]
                  :[[-36,10,6.8],[-26,10,5.4],[-16,10,7.2],[-6,10,5.8],[4,10,6.8],[14,10,5.4],[24,10,6.4],[34,10,5.2]];
    row1.forEach(([x,W,H],i)=>terr(i%2?2:1,x,s*(ZF+4),W+.4,8,H));
    // árboles gigantes atrás, entre árboles altos
    for(const [x,k] of (s>0?[[-30,1],[2,2],[30,1]]:[[-14,2],[18,1]]))giant(x,s*(ZF+19),24+Math.random()*4,k);
    for(const x of (s>0?[-40,-16,16,42]:[-38,-28,2,32,42]))tree(x+(Math.random()-.5)*3,s*(ZF+12+Math.random()*4),16+Math.random()*5);
    for(const x of [-8,0,8])grada(x,s*22.75,ry);   // tres tramos pegados = una grada larga
    lantern(-12.6,s*19.3,ry);lantern(12.6,s*19.3,ry);
    shrooms(s>0?-27:27,s*23,4.2,s>0?1:2,s>0?2.2:2.4);
    for(const [k,x,z] of [['tronco',-29,19],['helecho',14,18.9],['tocon',-14.3,18.9]])obj(k,x,s*z,k==='tronco'?0:null);
    cluster(-22,s*18.9,1.2,8,fl);cluster(23,s*18.9,1.2,8,fl);}
  // --- lado RIVAL: pared baja de rocas, el arroyo y el árbol más grande del bosque ---
  for(const [z,H] of [[-13.5,3.2],[-4.5,2.4],[4.5,2.6],[13.5,3.4]])terr(2,38.5,z,4,9.2,H);
  stream(41.5,45.5);
  giant(60,0,32,1,-Math.PI/2);
  for(const e of [-1,1]){terr(1,52,e*19,12,10,6);shrooms(50,e*18.5,5,e>0?2:1,5.8);giant(68,e*31,24,2);obj('barril',39,e*20,null);lantern(35.6,e*9.4,-Math.PI/2);}
  // esquinas del rival y tuyas: hongos chicos y helechos
  for(const sx of [-1,1])for(const e of [-1,1])tree(sx*36.5,e*26.5,9+Math.random()*2);
  for(const e of [-1,1]){shrooms(37,e*23,3.4,e>0?1:2);obj('helecho2',35.5,e*19.5,null);cluster(37.5,e*21.5,2,12,fl);}
  // --- detrás de TU portería: rocas bajitas, helechos y hongos (la cámara va ahí) ---
  terr(2,-39,0,5,12,2);terr(1,-45,0,7,16,3.8);
  for(const e of [-1,1]){terr(1,-40,e*10.5,8,9,3);terr(2,-46.5,e*13,8,10,5.2);obj('helecho',-37,e*6.2,null);shrooms(-40,e*19,3.6,e>0?2:1);giant(-56,e*12,24,e>0?1:2);}
  obj('letrero',-36.4,-3.4,Math.PI/2);
  // --- bosque alrededor: anillo de árboles altos ---
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2+Math.random()*.08,R=68+Math.random()*14,x=Math.cos(a)*R*1.15,z=Math.sin(a)*R*.85;if(x<-60&&Math.abs(z)<30)continue;tree(x,z,18+Math.random()*8);}
  flowers(fl);
  particles();lightRays();
  for(let i=0;i<10;i++)cloud(i/10*Math.PI*2+Math.random()*.3,180+Math.random()*60,80+Math.random()*30,6+Math.random()*4);
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
  for(const g of glows)g.sp.material.opacity=Math.min(1,(g.sp.userData.o||(g.sp.userData.o=g.sp.material.opacity))*(1+Math.sin(T*3+g.ph)*.12+gk*.4));
  for(const r of rays)r.m.material.opacity=.32+Math.sin(T*.6+r.ph)*.14;
  for(const t of waters)t.offset.y-=dt*.35;
  if(ffPts){for(let i=0;i<FF_N;i++){const p=i*1.7;ffPos[i*3]=ffBase[i*3]+Math.sin(T*.5+p)*2;ffPos[i*3+1]=ffBase[i*3+1]+Math.sin(T*.9+p*2)*.8+gk*2;ffPos[i*3+2]=ffBase[i*3+2]+Math.cos(T*.4+p)*2;}ffPts.geometry.attributes.position.needsUpdate=true;
    ffPts.material.size=.55+Math.sin(T*4)*.15;}
  if(lfPts){for(let i=0;i<LF_N;i++){lfPos[i*3+1]-=dt*(.9+(i%4)*.25);lfPos[i*3]+=Math.sin(T*1.3+i)*dt*.8+dt*.4;lfPos[i*3+2]+=Math.cos(T+i)*dt*.4;if(lfPos[i*3+1]<0){lfPos[i*3+1]=18+Math.random()*4;lfPos[i*3]=(Math.random()-.5)*90;lfPos[i*3+2]=(Math.random()-.5)*60;}}lfPts.geometry.attributes.position.needsUpdate=true;}
}
build();
try{if(typeof GOAL_STD!=='undefined')GOAL_STD.forEach(m=>{if(m.geometry&&m.geometry.parameters&&m.geometry.parameters.radiusTop>.1)m.visible=false;});}catch(e){}
return {update,seats:SEATS,onGoal:t=>{goalT=2.8;if(CROWD)CROWD.react('gol',t);},crowdReact:k=>{if(CROWD)CROWD.react(k);}};
};
