window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[10]=function(G){
window.GZ_FIELD_MOTIF='escarabajo';   // v203: grabado en el césped de esta arena

// =====================================================================
// v195: DESIERTO — estadio de ruinas de arenisca (piezas de Tripo en assets/arenas/desierto)
// Dos pisos disparejos en los lados largos: grada abajo y, separada, otra grada montada sobre
// una base de bloques a distinta altura y distancia en cada tramo. Escaleras con muros a los
// lados entre tramos, cascada de arena, templo detrás de la portería rival, torres-arco en las
// 4 esquinas, 2 pantallas en las esquinas rivales y el portón al centro del lado derecho.
// =====================================================================
const L=32,HW=16;
const renderer=G.renderer,scene=G.root,REAL=G.scene,camera=G.camera;
// de noche: cielo morado con estrellas; la luz fría de la luna y lo cálido viene del fuego
REAL.background=new THREE.Color('#2a1658');REAL.fog=new THREE.Fog('#3a2070',130,300);
const hemi=new THREE.HemisphereLight(0xb6a4ff,0x6a3a2a,.6);scene.add(hemi);
const warm=new THREE.HemisphereLight(0xffa860,0x000000,.16);scene.add(warm);
const sun=new THREE.DirectionalLight(0xd8ccff,.62);sun.position.set(-18,44,24);sun.castShadow=true;{const hq=window.save&&save.settings&&save.settings.quality==='alta';sun.shadow.mapSize.set(hq?2048:1024,hq?2048:1024);}   // sombras según la calidad elegida
Object.assign(sun.shadow.camera,{left:-60,right:60,top:44,bottom:-44,near:8,far:140});sun.shadow.bias=-.0004;sun.shadow.normalBias=.045;scene.add(sun);
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;
const matCache={};
function flat(hex){if(matCache[hex])return matCache[hex];return matCache[hex]=new THREE.MeshLambertMaterial({color:hex,flatShading:true});}
const mesh=(geo,hex)=>{const m=new THREE.Mesh(geo,typeof hex==='string'?flat(hex):hex);m.castShadow=true;m.receiveShadow=true;return m;};
function radTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,inner);r.addColorStop(.35,inner.replace(/[\d.]+\)$/,'0.45)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}

// ===== cielo: domo con degradado, estrellas que titilan y estrellas fugaces =====
const stars=[],shooting=[];
(function(){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,0,256);
  r.addColorStop(0,'#160a3a');r.addColorStop(.45,'#3a1a7a');r.addColorStop(.8,'#6a2fa8');r.addColorStop(1,'#8a4ab8');g.fillStyle=r;g.fillRect(0,0,16,256);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(280,32,16,0,Math.PI*2,0,Math.PI/2+.12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false,depthWrite:false}));
  dome.position.y=-20;scene.add(dome);
  for(let k=0;k<3;k++){const n=260,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=.12+Math.random()*1.35,R=260;
      pos[i*3]=Math.cos(a)*Math.cos(e)*R;pos[i*3+1]=Math.sin(e)*R-20;pos[i*3+2]=Math.sin(a)*Math.cos(e)*R;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const m=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:[1.6,2.4,3.4][k],sizeAttenuation:false,transparent:true,opacity:.9,fog:false,depthWrite:false}));scene.add(m);stars.push({m,ph:k*2.1});}
  const st=(function(){const c=document.createElement('canvas');c.width=256;c.height=16;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,256,0);r.addColorStop(0,'rgba(255,220,255,0)');r.addColorStop(.85,'rgba(255,230,255,.9)');r.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=r;g.fillRect(0,6,256,4);return new THREE.CanvasTexture(c);})();
  for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(40,1.4),new THREE.MeshBasicMaterial({map:st,transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));scene.add(m);shooting.push({m,t:-Math.random()*8});}})();
// focos de las torres: haces de luz que barren el cielo
const beams=[];
function beam(x,y,z,ph){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');const r=g.createLinearGradient(0,128,0,0);r.addColorStop(0,'rgba(255,255,240,.55)');r.addColorStop(1,'rgba(255,255,240,0)');g.fillStyle=r;g.fillRect(0,0,64,128);
  const geo=new THREE.ConeGeometry(4,70,16,1,true);geo.translate(0,-35,0);geo.rotateX(Math.PI);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,opacity:.35}));
  m.position.set(x,y,z);scene.add(m);beams.push({m,ph});}

// ===== fuego: llamas en capas que se mueven, centro brillante y chispitas que suben =====
function flameTex(){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');
  const r=g.createRadialGradient(32,92,2,32,80,44);r.addColorStop(0,'rgba(255,250,210,1)');r.addColorStop(.25,'rgba(255,214,90,.95)');r.addColorStop(.55,'rgba(255,120,30,.75)');r.addColorStop(1,'rgba(200,40,10,0)');
  g.fillStyle=r;g.beginPath();g.moveTo(32,4);g.bezierCurveTo(52,40,60,70,54,96);g.bezierCurveTo(48,122,16,122,10,96);g.bezierCurveTo(4,70,12,40,32,4);g.fill();return new THREE.CanvasTexture(c);}
const FLAME=flameTex(),EMBER=radTex('rgba(255,220,140,1)','rgba(255,120,30,0)'),fires=[];
function fire(parent,x,y,z,s){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const parts=[];
  const mk=(map,blend)=>new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthWrite:false,blending:blend?THREE.AdditiveBlending:THREE.NormalBlending}));
  for(let i=0;i<2;i++){const sp=mk(FLAME,true);g.add(sp);parts.push({sp,ph:Math.random()*6,k:i});}
  const core=mk(GLOW_F,true);core.scale.setScalar(1.8*s);core.position.y=.15*s;g.add(core);
  const emb=[];for(let i=0;i<1;i++){const e=mk(EMBER,true);e.scale.setScalar(.14*s);g.add(e);emb.push({sp:e,t:Math.random(),dx:(Math.random()-.5)*.6,ph:Math.random()*6});}
  fires.push({parts,core,emb,s});return g;}
const GLOW_F=radTex('rgba(255,190,90,.9)','rgba(255,110,30,0)');

// ===== cancha: césped de la arena 1 (opción: cancha de arena como la referencia) =====
const CR=(window.SIM&&SIM.C&&SIM.C.CR)||7;
function lines(g,X,Z,PX,col,w){g.strokeStyle=col;g.lineWidth=PX*w;
  (window.GZ_RR?GZ_RR(g,X(-L),Z(-HW),2*L*PX,2*HW*PX,CR*PX):g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX));g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
  g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-8.6),9*PX,17.2*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}}
function grassTex(){const PX=24,W=72*PX,H=48*PX,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX,q=4,STK=!!window.strikersGrass;
  if(STK)strikersGrass(g,W,H,PX,X,Z);else for(let x=-36,i=0;x<36;x+=q,i++)for(let z=-24,j=0;z<24;z+=q,j++){g.fillStyle=(i+j)%2?'#9db150':'#89a444';g.fillRect(X(x),Z(z),q*PX+1,q*PX+1);}
  const t=new THREE.CanvasTexture(c);if(STK&&window.strikersFinish)strikersFinish(g,W,H,X(0),Z(0),PX,t);
  lines(g,X,Z,PX,STK?'#f6faf0':'rgba(240,234,214,.9)',STK?.25:.22);t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.needsUpdate=true;return t;}
function sandFieldTex(){const PX=24,W=72*PX,H=48*PX,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX;g.fillStyle='#e8c27c';g.fillRect(0,0,W,H);
  // franjas y triángulos tallados en la arena, como la referencia
  for(let x=-36,i=0;x<36;x+=4,i++){g.fillStyle=i%2?'rgba(255,240,200,.16)':'rgba(170,110,40,.08)';g.fillRect(X(x),0,4*PX,H);}
  g.fillStyle='rgba(190,130,60,.12)';for(let x=-30;x<30;x+=6)for(let z=-12;z<=12;z+=12){g.beginPath();g.moveTo(X(x),Z(z+2));g.lineTo(X(x+3),Z(z-2));g.lineTo(X(x+6),Z(z+2));g.closePath();g.fill();}
  const id=g.getImageData(0,0,W,H),d=id.data;for(let k=0;k<d.length;k+=4){const n=(Math.random()-.5)*14;d[k]+=n;d[k+1]+=n*.9;d[k+2]+=n*.6;}g.putImageData(id,0,0);
  lines(g,X,Z,PX,'rgba(255,255,255,.95)',.24);const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
function fieldShape(hx,hz,cx,cz){const sh=new THREE.Shape(),N=10,rx=hx-cx,rz=hz-cz,pts=[];
  for(const [sx,sz,a0] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]])
    for(let i=0;i<=N;i++){const a=a0+i/N*Math.PI/2;pts.push(new THREE.Vector2(sx*cx+Math.cos(a)*rx,sz*cz+Math.sin(a)*rz));}
  sh.setFromPoints(pts);const geo=new THREE.ShapeGeometry(sh,1),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+36)/72,(p.getY(i)+24)/48);return geo;}
const GRASS=grassTex();let SANDF=null;
const field=new THREE.Mesh(fieldShape(L+2.2,HW+1.6,L-CR,HW-CR),new THREE.MeshLambertMaterial({map:GRASS}));
field.rotation.x=-Math.PI/2;field.position.y=.01;field.receiveShadow=true;scene.add(field);
// césped igualito pero teñido color arena (se conservan el corte, las hojitas y las líneas)
let GRASS_ARENA=null;
function tintGrass(){const src=GRASS.image,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
  const id=g.getImageData(0,0,c.width,c.height),d=id.data;for(let k=0;k<d.length;k+=4){const r=d[k],gg=d[k+1],b=d[k+2];
    if(r>200&&gg>200&&b>190)continue;   // líneas blancas tal cual
    const l=(r*.3+gg*.59+b*.11)/150;d[k]=Math.min(255,226*l);d[k+1]=Math.min(255,176*l);d[k+2]=Math.min(255,104*l);}
  g.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
// modo: 0 = césped verde, 1 = césped color arena, 2 = cancha de arena; (true/false se aceptan por compatibilidad)
function setSand(mode){mode=mode===true?2:mode===false?0:mode|0;
  if(mode===1&&!GRASS_ARENA)GRASS_ARENA=tintGrass();if(mode===2&&!SANDF)SANDF=sandFieldTex();
  field.material.map=mode===1?GRASS_ARENA:mode===2?SANDF:GRASS;field.material.needsUpdate=true;}
setSand(window.GZ_DESIERTO_PISO!=null?GZ_DESIERTO_PISO:1);   // aprobado: césped color arena
// piso de afuera: arena del desierto, con un borde de piedritas alrededor del césped
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#e2b878';g.fillRect(0,0,S,S);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()<.5?'rgba(190,130,70,.22)':'rgba(255,236,200,.25)';g.beginPath();g.arc(Math.random()*S,Math.random()*S,1+Math.random()*4,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(70,70);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(440,440),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=-.02;m.receiveShadow=true;scene.add(m);})();

// ===== arenisca por código (bases, escaleras, muros de los lados): mismos tonos que la grada de Tripo =====
function blockTex(rows,cols,seed){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#7c4220';g.fillRect(0,0,256,256);
  const bh=256/rows;for(let r=0;r<rows;r++){const off=(r%2)*(256/cols/2),bw=256/cols;for(let k=-1;k<=cols;k++){const x=k*bw+off,y=r*bh,v=(Math.random()-.5)*22;
    g.fillStyle=`rgb(${181+v|0},${104+v*.8|0},${46+v*.5|0})`;g.fillRect(x+3,y+3,bw-6,bh-6);
    g.fillStyle='rgba(255,210,150,.22)';g.fillRect(x+3,y+3,bw-6,5);g.fillStyle='rgba(90,40,10,.22)';g.fillRect(x+3,y+bh-8,bw-6,5);
    for(let s=0;s<3;s++){g.fillStyle=Math.random()<.5?'rgba(120,60,20,.12)':'rgba(255,220,170,.10)';g.beginPath();g.arc(x+Math.random()*bw,y+Math.random()*bh,4+Math.random()*10,0,7);g.fill();}}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const BT=blockTex(4,3);
// material de bloques con UV por posición en el mundo (los bloques salen del mismo tamaño en cualquier caja)
const stoneMat=new THREE.MeshLambertMaterial({map:BT});
stoneMat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
  vec4 wpU=modelMatrix*vec4(position,1.);vec3 nW=normalize(mat3(modelMatrix)*normal);
  vec2 uvW=abs(nW.y)>.7?wpU.xz:(abs(nW.x)>abs(nW.z)?wpU.zy:wpU.xy);vUv=uvW/vec2(3.6,2.4);`);};
stoneMat.customProgramCacheKey=()=>'desStone';
const zig=(function(){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#a5582a';g.fillRect(0,0,256,64);
  g.strokeStyle='#e7a25c';g.lineWidth=7;g.beginPath();for(let x=0;x<=256;x+=32){g.lineTo(x,x%64?12:52);}g.stroke();
  g.strokeStyle='rgba(80,30,10,.5)';g.lineWidth=3;g.beginPath();for(let x=0;x<=256;x+=32){g.lineTo(x,(x%64?12:52)+7);}g.stroke();
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t;})();
function box(w,h,d,x,y,z,ry){const m=mesh(new THREE.BoxGeometry(w,h,d),stoneMat);m.position.set(x,y,z);m.rotation.y=ry||0;scene.add(m);return m;}
// franja tallada en zigzag (sobre una cara)
function zigBand(len,x,y,z,ry){const t=zig.clone();t.needsUpdate=true;t.repeat.set(len/3.2,1);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(len,.7),new THREE.MeshLambertMaterial({map:t,polygonOffset:true,polygonOffsetFactor:-2}));m.position.set(x,y,z);m.rotation.y=ry||0;scene.add(m);return m;}
// nicho con brasero encendido (cuadro brillante metido en la pared)
const NICHE=new THREE.MeshBasicMaterial({color:'#ffb35a'}),NICHE_D=new THREE.MeshLambertMaterial({color:'#5a2a12'}),glows=[];
const GLOW=radTex('rgba(255,200,110,1)','rgba(255,140,40,0)');
function niche(x,y,z,ry){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;scene.add(g);
  const fr=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.05,.12),NICHE_D);g.add(fr);const f=new THREE.Mesh(new THREE.PlaneGeometry(.8,.7),NICHE);f.position.z=.07;g.add(f);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.34,.2,.22,10),NICHE_D);bowl.position.set(0,-.25,.18);g.add(bowl);
  fire(g,0,-.05,.22,.6);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));sp.scale.setScalar(2.4);sp.position.z=.4;g.add(sp);glows.push({sp,ph:Math.random()*6});}

// ===== piezas de Tripo =====
const DIR='assets/arenas/desierto/';
const loader=new THREE.GLTFLoader(),GM={};
const loadG=n=>new Promise(res=>loader.load(DIR+n+'.glb?v=203',g=>{GM[n]=g;res();},undefined,e=>{console.warn('falta',n,e);res();}));
function arenaMat(src){const map=src.map||null;if(map){map.encoding=THREE.LinearEncoding;map.anisotropy=4;map.needsUpdate=true;}
  const m=new THREE.MeshLambertMaterial({map,color:0xffffff});
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      {vec3 c=diffuseColor.rgb;float lit=smoothstep(.72,.9,min(c.r,c.g))*smoothstep(.12,.3,c.g-c.b);totalEmissiveRadiance+=c*(lit*.8+.06);}`);};
  m.customProgramCacheKey=()=>'desMat';return m;}
const PREP={},FACE={},TRIM={};
function prep(n){if(PREP[n])return PREP[n];const g=GM[n];if(!g)return null;const s=g.scene;s.rotation.y=TRIM[n]||0;
  const mats=new Map();s.traverse(o=>{if(o.isMesh){if(!mats.has(o.material))mats.set(o.material,arenaMat(o.material));o.material=mats.get(o.material);o.castShadow=true;o.receiveShadow=true;}});
  s.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(s);return PREP[n]={s,box,size:box.getSize(new THREE.Vector3()),fires:findFires(s,box)};}
// busca los braseros de un modelo de Tripo: vértices con color de fuego (amarillo-naranja brillante) agrupados
function findFires(s,box){const out=[];try{const cells=new Map(),size=box.getSize(new THREE.Vector3()),cell=Math.max(size.x,size.z)*.06;
  s.traverse(o=>{if(!o.isMesh||!o.material.map||!o.material.map.image)return;const img=o.material.map.image;const cv=document.createElement('canvas');cv.width=128;cv.height=128;const g=cv.getContext('2d');
    g.drawImage(img,0,0,128,128);const px=g.getImageData(0,0,128,128).data;const uv=o.geometry.attributes.uv,pa=o.geometry.attributes.position;if(!uv)return;const v=new THREE.Vector3();
    for(let i=0;i<pa.count;i+=2){let u=uv.getX(i)%1,w=uv.getY(i)%1;if(u<0)u+=1;if(w<0)w+=1;const k=((Math.floor(w*127))*128+Math.floor(u*127))*4,r=px[k],gg=px[k+1],b=px[k+2];
      if(r>225&&gg>150&&b<120&&gg-b>90){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);const key=Math.round(v.x/cell)+','+Math.round(v.z/cell);
        const c=cells.get(key)||{x:0,y:-1e9,z:0,n:0};c.x+=v.x;c.z+=v.z;c.y=Math.max(c.y,v.y);c.n++;cells.set(key,c);}}});
  for(const c of cells.values())if(c.n>=3){const p={x:c.x/c.n,y:c.y,z:c.z/c.n};if(!out.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<cell*1.6))out.push(p);}}catch(e){}
  return out.slice(0,8);}
// place: w = ancho (x del modelo), d = fondo (z), h = alto; s = escala pareja; ry = giro (el frente del modelo mira a +z)
function place(n,o){const P=prep(n);if(!P)return null;o=o||{};
  const inner=P.s.clone(true),wrap=new THREE.Group(),rot=new THREE.Group();rot.add(inner);
  const c=P.box.getCenter(new THREE.Vector3());inner.position.set(-c.x,-P.box.min.y,-c.z);rot.rotation.y=FACE[n]||0;wrap.add(rot);
  const W0=P.size.x,D0=P.size.z,H0=P.size.y;let k=o.s||(o.w?o.w/W0:o.d?o.d/D0:o.h?o.h/H0:1);
  wrap.scale.set(o.w?o.w/W0:k,o.h?o.h/H0:k,o.d?o.d/D0:k);wrap.position.set(o.x||0,o.y||0,o.z||0);wrap.rotation.y=o.ry||0;scene.add(wrap);
  // fuego de verdad sobre los braseros del modelo (tamaño parejo aunque la pieza esté estirada)
  if(P.fires&&P.fires.length&&o.fire!==false&&!/grada/.test(n)){   // en las gradas el fuego ya viene pintado: sin partículas (mucho más ligero)
    const sx=wrap.scale.x,sy=wrap.scale.y,sz=wrap.scale.z;
    for(const f of P.fires){const g=fire(inner,f.x,f.y,f.z,.8/Math.min(sx,sy,sz));g.scale.set(Math.min(sx,sy,sz)/sx,Math.min(sx,sy,sz)/sy,Math.min(sx,sy,sz)/sz);}}
  return wrap;}
// piezas sueltas de un modelo (solo los triángulos dentro de una caja vista desde arriba)
const PARTS={};
function partOf(n,bx){const key=n+bx.join();if(PARTS[key])return PARTS[key];const P=prep(n);if(!P)return null;const g=new THREE.Group(),mn=P.box.min,sz=P.size;
  P.s.updateMatrixWorld(true);P.s.traverse(m=>{if(!m.isMesh)return;const geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);const p=geo.attributes.position,idx=geo.index?geo.index.array:null,cnt=idx?idx.length:p.count,keep=[];
    const inb=v=>{const fx=(p.getX(v)-mn.x)/sz.x,fz=(p.getZ(v)-mn.z)/sz.z;return fx>=bx[0]&&fx<=bx[1]&&fz>=bx[2]&&fz<=bx[3];};
    for(let t=0;t<cnt;t+=3){const a=idx?idx[t]:t,b=idx?idx[t+1]:t+1,c=idx?idx[t+2]:t+2;if(inb(a)&&inb(b)&&inb(c))keep.push(a,b,c);}
    if(!keep.length)return;geo.setIndex(keep);geo.clearGroups();const mm=new THREE.Mesh(geo,Array.isArray(m.material)?m.material[0]:m.material);mm.castShadow=true;mm.receiveShadow=true;g.add(mm);});
  g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);return PARTS[key]={s:g,box,size:box.getSize(new THREE.Vector3())};}
function placePart(Pp,o){const inner=Pp.s.clone(true),wrap=new THREE.Group();const c=Pp.box.getCenter(new THREE.Vector3());inner.position.set(-c.x,-Pp.box.min.y,-c.z);wrap.add(inner);
  wrap.scale.setScalar(o.h/Pp.size.y);wrap.position.set(o.x,o.y||0,o.z);wrap.rotation.y=o.ry||0;scene.add(wrap);return wrap;}
// filas de asiento medidas en la grada (f = fondo desde el frente, h = fracción del alto)
const ROWS=[[.31,.49],[.53,.72],[.72,.98]],SEATS=[];
function seats(cx,cz,y0,ry,W,D,H){const cs=Math.cos(ry),sn=Math.sin(ry);for(const [f,h] of ROWS){const lz=D/2-f*D;for(let lx=-W/2+.9;lx<=W/2-.7;lx+=1.45)SEATS.push({x:cx+lx*cs+lz*sn,y:y0+h*H,z:cz-lx*sn+lz*cs,ry});}}
function grada(cx,cz,y0,ry,W,D,H){place('desierto_grada',{x:cx,z:cz,y:y0,ry,w:W,d:D,h:H});seats(cx,cz,y0,ry,W,D,H);}
// grada doblada 90° para las esquinas
function bentStand(C,a0,r,D,H){const P=prep('desierto_grada');if(!P)return;const g=new THREE.Group();
  const src=P.s.clone(true);const c=P.box.getCenter(new THREE.Vector3());src.position.set(-c.x,-P.box.min.y,-c.z);const tmp=new THREE.Group();tmp.add(src);tmp.updateMatrixWorld(true);
  const W0=P.size.x,D0=P.size.z,H0=P.size.y,v=new THREE.Vector3();
  src.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);const t=(v.x+W0/2)/W0,back=(D0/2-v.z)/D0*D,th=a0+t*Math.PI/2,rr=r+back;pa.setXYZ(i,C.x+Math.cos(th)*rr,v.y/H0*H,C.z+Math.sin(th)*rr);}
    geo.computeVertexNormals();geo.computeBoundingSphere();const m=new THREE.Mesh(geo,o.material);m.castShadow=true;m.receiveShadow=true;g.add(m);});
  scene.add(g);for(const [f,h] of ROWS){const rr=r+f*D,cnt=Math.max(1,Math.floor(rr*Math.PI/2/1.45));for(let k=0;k<cnt;k++){const th=a0+(k+.5)/cnt*Math.PI/2;SEATS.push({x:C.x+Math.cos(th)*rr,y:h*H,z:C.z+Math.sin(th)*rr,ry:Math.atan2(-Math.cos(th),-Math.sin(th))});}}}

// ===== escalera con muros a los lados (los "bordes") =====
// u = eje a lo largo de la tribuna; la escalera sube de la orilla de la cancha (z0, piso) hacia atrás (z1, alto top)
// sideZ: +1/-1 lado de la tribuna; todo se arma en coordenadas locales y se gira con la tribuna
function sideWall(g,u,z0,z1,top,th,extra){const sh=new THREE.Shape();const lip=1.1;
  sh.moveTo(z0-.35,0);sh.lineTo(z0-.35,lip);sh.lineTo(z1,top+lip);sh.lineTo(z1+(extra||0),top+lip);sh.lineTo(z1+(extra||0),0);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1});geo.translate(0,0,-th/2);
  const m=new THREE.Mesh(geo,stoneMat);m.castShadow=m.receiveShadow=true;m.rotation.y=-Math.PI/2;m.position.x=u;g.add(m);
  // tapa de bloques arriba del muro (como en la referencia)
  const len=Math.hypot(z1-z0+.35,top),cap=new THREE.Mesh(new THREE.BoxGeometry(th+.25,.32,len+.2),stoneMat);cap.castShadow=true;
  cap.position.set(u,(lip+top+lip)/2+.12,(z0-.35+z1)/2);cap.rotation.x=-Math.atan2(top,z1-z0+.35);g.add(cap);
  if(extra){const c2=new THREE.Mesh(new THREE.BoxGeometry(th+.25,.32,extra+.1),stoneMat);c2.position.set(u,top+lip+.12,z1+extra/2);g.add(c2);}
  return m;}
function stairs(g,u,w,z0,z1,top){const n=Math.max(6,Math.round(top/.42)),dz=(z1-z0)/n;
  for(let i=0;i<n;i++){const h=(i+1)*top/n,s=new THREE.Mesh(new THREE.BoxGeometry(w,h,dz+.02),stoneMat);s.position.set(u,h/2,z0+dz*(i+.5));s.castShadow=s.receiveShadow=true;g.add(s);}}

// ===== cascada de arena (cae de lo alto entre los niveles y hace un montoncito abajo) =====
const sandFalls=[],dust=[];
function sandStreamTex(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(230,180,110,0)');gr.addColorStop(.18,'rgba(236,190,120,.95)');gr.addColorStop(.82,'rgba(236,190,120,.95)');gr.addColorStop(1,'rgba(230,180,110,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,256);for(let i=0;i<90;i++){g.strokeStyle=Math.random()<.5?'rgba(255,235,190,.5)':'rgba(170,110,50,.35)';g.lineWidth=1+Math.random()*2.5;const x=8+Math.random()*48,y=Math.random()*256;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+10+Math.random()*30);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const DUST=radTex('rgba(240,205,150,.9)','rgba(240,205,150,0)');
function sandFall(x,yTop,z,w,face){const t=sandStreamTex();t.repeat.set(1,yTop/5);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,yTop),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide,color:0xf0d0a0}));
  m.position.set(x,yTop/2,z);m.rotation.y=face;scene.add(m);sandFalls.push(t);
  const mound=mesh(new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2),'#e7bd7d');mound.scale.set(w*.9,1.1,w*.9);mound.position.set(x,0,z);scene.add(mound);
  for(let i=0;i<10;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:DUST,transparent:true,depthWrite:false,opacity:0}));scene.add(sp);dust.push({sp,x,z,w,life:Math.random()*1.4});}}

// ===== portería de bloques (al tamaño de la del juego) con 3 mosaicos de triángulo =====
function tileTex(up){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#bfe9f4';g.fillRect(0,0,64,64);g.strokeStyle='#5a3a20';g.lineWidth=6;g.strokeRect(3,3,58,58);
  g.fillStyle='#ffffff';g.beginPath();if(up){g.moveTo(32,12);g.lineTo(52,50);g.lineTo(12,50);}else{g.moveTo(12,14);g.lineTo(52,14);g.lineTo(32,52);}g.closePath();g.fill();return new THREE.CanvasTexture(c);}
function goal(s){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},X=s*L,P=.75,g=new THREE.Group();scene.add(g);
  for(const z of [-C.GW-P/2,C.GW+P/2]){let y=0;for(const [w,h] of [[.95,1.15],[.82,1.1],[.88,C.GH-2.25]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),stoneMat);b.position.set(X+s*.1,y+h/2,z);b.castShadow=true;g.add(b);y+=h;}}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.9,.85,2*C.GW+2*P+.3),stoneMat);bar.position.set(X+s*.1,C.GH+.42,0);bar.castShadow=true;g.add(bar);
  [true,false,true].forEach((up,i)=>{const t=new THREE.Mesh(new THREE.PlaneGeometry(.95,.68),new THREE.MeshBasicMaterial({map:tileTex(up)}));t.position.set(X+s*.1-s*.46,C.GH+.42,(i-1)*1.25);t.rotation.y=-s*Math.PI/2;g.add(t);});}
function drawNets(){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},D=2.2,HB=C.GH*.72;
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='#ffffff';g.lineWidth=5;g.beginPath();g.moveTo(0,32);g.lineTo(32,0);g.lineTo(64,32);g.lineTo(32,64);g.closePath();g.stroke();
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  const mat=new THREE.MeshBasicMaterial({map:t,color:0xf4f4f0,transparent:true,alphaTest:.25,side:THREE.DoubleSide,depthWrite:false});
  const panel=(w,h,x,y,z,ry,rx)=>{const gg=new THREE.PlaneGeometry(w,h),uv=gg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.9,uv.getY(i)*h/.9);
    const m=new THREE.Mesh(gg,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry,0,'YXZ');scene.add(m);};
  for(const s of [-1,1]){const X=s*L;panel(2*C.GW,HB,X+s*D,HB/2,0,Math.PI/2);
    panel(2*C.GW,Math.hypot(D,C.GH-HB),X+s*D/2,(C.GH+HB)/2,0,Math.PI/2,Math.atan2(s*D,-(C.GH-HB)));
    for(const z of [-C.GW,C.GW])panel(D,(C.GH+HB)/2,X+s*D/2,(C.GH+HB)/4,z,0);}}
// banderines verdes (tela que ondea)
const flags=[];
function banner(x,y,z,ry){const c=document.createElement('canvas');c.width=64;c.height=96;const g=c.getContext('2d');g.fillStyle='#6fc9a0';g.fillRect(0,0,64,96);g.fillStyle='#2f8a68';g.fillRect(0,0,64,8);g.fillRect(0,88,64,8);
  g.fillStyle='#f2d27a';g.beginPath();g.moveTo(32,20);g.lineTo(50,70);g.lineTo(14,70);g.closePath();g.fill();
  const geo=new THREE.PlaneGeometry(1.1,1.7,1,6);const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));
  m.position.set(x,y,z);m.rotation.y=ry;m.userData.anim=1;scene.add(m);flags.push({m,base:geo.attributes.position.array.slice(),ph:Math.random()*6});
  const pole=mesh(new THREE.CylinderGeometry(.06,.06,2.2,6),'#3e8a62');pole.position.set(x,y+.2,z);scene.add(pole);}

// ===== cañón tipo Petra: paredes de roca rosada muy altas, con capas, alrededor de todo el estadio =====
function canyon(){const HX=60,HZ=47,R=20,pts=[];   // contorno: rectángulo de esquinas redondas
  const seg=(x0,z0,x1,z1,n)=>{for(let i=0;i<n;i++){const t=i/n;pts.push([x0+(x1-x0)*t,z0+(z1-z0)*t]);}};
  const arc=(cx,cz,a0,n)=>{for(let i=0;i<n;i++){const a=a0-i/n*Math.PI/2;pts.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R]);}};
  seg(HX-R,-HZ,-(HX-R),-HZ,40);arc(-(HX-R),-(HZ-R),-Math.PI/2,10);seg(-HX,-(HZ-R),-HX,HZ-R,24);arc(-(HX-R),HZ-R,Math.PI,10);
  seg(-(HX-R),HZ,HX-R,HZ,40);arc(HX-R,HZ-R,Math.PI/2,10);seg(HX,HZ-R,HX,-(HZ-R),24);arc(HX-R,-(HZ-R),0,10);
  const N=pts.length,M=14,ph=[...Array(8)].map(()=>Math.random()*6.28);
  const nz=(t,k)=>Math.sin(t*6.28*3+ph[k])*.5+Math.sin(t*6.28*7+ph[k+1])*.3+Math.sin(t*6.28*17+ph[k+2])*.2;
  const pos=[],col=[],idx=[];const band=['#c86a4e','#d98a62','#b85a44','#e3a074','#c97455','#a9503e','#dd9468'];
  for(let i=0;i<=N;i++){const a=pts[i%N],b=pts[(i+1)%N],t=i/N;let nx=-(b[1]-a[1]),nzv=b[0]-a[0];const ln=Math.hypot(nx,nzv)||1;nx/=ln;nzv/=ln;
    // normal hacia adentro (el contorno va al revés de las manecillas visto desde arriba)
    const top=36+nz(t,0)*9+Math.max(0,nz(t*1.7,3))*10;
    for(let j=0;j<=M;j++){const v=j/M,y=v*top;
      // salientes en capas: la pared se mete y sale con la altura, más rugosa arriba
      const d=nz(t*2+v*.7,1)*2.2+Math.sin(v*Math.PI*5+t*40)*.9+(v>.85?nz(t*3,4)*2:0)-v*3;
      pos.push(a[0]-nx*d,y,a[1]-nzv*d);
      const c=new THREE.Color(band[Math.floor((y/3.2+nz(t,5)*.6+7)%band.length)]);const sh=.9+Math.random()*.16;col.push(c.r*sh,c.g*sh,c.b*sh);}}
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=(i+1)*(M+1)+j;idx.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);
  const g2=geo.toNonIndexed();g2.computeVertexNormals();
  const m=new THREE.Mesh(g2,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}));m.receiveShadow=true;scene.add(m);
  // rocas sueltas al pie del cañón
  for(let i=0;i<70;i++){const q=pts[Math.floor(Math.random()*N)],r=mesh(new THREE.DodecahedronGeometry(1.2+Math.random()*2.6,0),pickC(['#c86a4e','#b85a44','#d98a62']));
    r.position.set(q[0]*(.94+Math.random()*.03),.4,q[1]*(.93+Math.random()*.03));r.rotation.set(Math.random()*3,Math.random()*3,0);r.scale.y=.7;scene.add(r);}}

// =====================================================================
// armado
// =====================================================================
const ZS=HW+2.4,X0=30,Z0E=13,XS=L+3.6;   // frente de las tribunas largas, mitad del largo, mitad del fondo, frente de la cabecera
const LD=7,LH=4.2,UD=6.2,UH=3.7;           // grada de abajo y de arriba (fondo/alto)
// cada tribuna larga: tramos con su propia base (alto y retiro distintos) separados por huecos
function longSide(side,gaps){const g=new THREE.Group();scene.add(g);g.rotation.y=side<0?Math.PI:0;   // local: +z hacia afuera de la cancha
  const ry=side<0?0:Math.PI;   // giro de la grada para que mire a la cancha
  const XE=X0-.9,total=2*XE,gw=gaps.reduce((a,b)=>a+b.w,0),n=gaps.length+1,secW=(total-gw)/n;
  const HB=side<0?[5.6,7.4,6.2,8]:[7.6,5.4,8.2,6];const SET=side<0?[.4,2,1,2.4]:[2.2,.6,1.8,.2];const SH=side<0?[.3,-.5,.4,-.2]:[-.4,.2,-.3,.5];
  let u=-XE;const secs=[];
  for(let i=0;i<n;i++){secs.push({u0:u,u1:u+secW,hb:HB[i],set:SET[i],sh:SH[i]});u+=secW;if(i<gaps.length){gaps[i].u0=u;gaps[i].u1=u+gaps[i].w;u+=gaps[i].w;}}
  const L2W=(lu,lz)=>({x:side<0?-lu:lu,z:side<0?-lz:lz});   // local (u, z hacia afuera) → mundo
  const zf=ZS,zl=ZS+LD;
  for(const s of secs){const cu=(s.u0+s.u1)/2,w=s.u1-s.u0;
    // abajo
    const p=L2W(cu,zf+LD/2);grada(p.x,p.z*1,0,ry,w,LD,LH);
    // pasillo entre niveles (a la altura de la grada de abajo) y base de bloques con nichos
    const zb=zl+s.set,uw=w-.9;   // un poco más angosta: nunca se mete en los muros de los lados
    if(s.set>.05){const b=new THREE.Mesh(new THREE.BoxGeometry(w,LH*.98,s.set+.1),stoneMat);b.position.set(cu,LH*.49,zl+s.set/2);b.castShadow=b.receiveShadow=true;g.add(b);}
    const base=new THREE.Mesh(new THREE.BoxGeometry(uw+.5,s.hb,UD),stoneMat);base.position.set(cu+s.sh*.3,s.hb/2,zb+UD/2);base.castShadow=base.receiveShadow=true;g.add(base);
    // nichos con brasero en el frente de la base (lo que se ve arriba de la grada de abajo)
    const ny=LH+(s.hb-LH)*.5;if(s.hb-LH>1.2)for(let k=0;k<Math.max(2,Math.round(uw/5));k++){const nu=cu+s.sh*.3+(k+.5-Math.max(2,Math.round(uw/5))/2)*4.6;const q=L2W(nu,zb-.06);niche(q.x,ny,q.z,side<0?0:Math.PI);}
    const zq=L2W(cu+s.sh*.3,zb-.04);zigBand(uw+.4,zq.x,s.hb-.45,zq.z,side<0?0:Math.PI);
    // arriba
    const q=L2W(cu+s.sh*.3,zb+UD/2);grada(q.x,q.z,s.hb,ry,uw,UD,UH);
    // pared de atrás que cierra la tribuna
    const back=new THREE.Mesh(new THREE.BoxGeometry(uw+.5,s.hb+UH+1.4,1),stoneMat);back.position.set(cu+s.sh*.3,(s.hb+UH+1.4)/2,zb+UD+.5);back.castShadow=true;g.add(back);
    s.zb=zb;s.top=s.hb+UH;}
  // huecos: escalera con muros, cascada de arena o portón
  for(let i=0;i<gaps.length;i++){const G_=gaps[i],a=secs[i],b=secs[i+1],cu=(G_.u0+G_.u1)/2,top=Math.min(a.hb,b.hb),z1=Math.max(a.zb,b.zb)+1.4,th=.6;
    if(G_.type==='escalera'){stairs(g,cu,G_.w-2*th,zf-.2,z1,top);const lnd=new THREE.Mesh(new THREE.BoxGeometry(G_.w,top,UD+1),stoneMat);lnd.position.set(cu,top/2,z1+(UD+1)/2);g.add(lnd);}
    if(G_.type==='arena'){const fill=new THREE.Mesh(new THREE.BoxGeometry(G_.w,Math.max(a.top,b.top)+2.2,2),stoneMat);fill.position.set(cu,(Math.max(a.top,b.top)+2.2)/2,z1+UD-.5);g.add(fill);
      const p=L2W(cu,z1+UD-1.6);sandFall(p.x,Math.max(a.top,b.top)+2,p.z,G_.w-1.6,side<0?Math.PI:0);}
    if(G_.type==='porton'){const p=L2W(cu,zf+3.2);place('desierto_porton',{x:p.x,z:p.z,ry:side<0?0:Math.PI,w:G_.w-2*th});
      // la grada de arriba sigue corrida sobre el portón
      const hb=Math.max(a.hb,b.hb)+.6,zb=Math.max(a.zb,b.zb);const br=new THREE.Mesh(new THREE.BoxGeometry(G_.w,hb,zb+UD-(zf+6)),stoneMat);br.position.set(cu,hb/2,(zf+6+zb+UD)/2);br.castShadow=br.receiveShadow=true;g.add(br);
      const q=L2W(cu,zb+UD/2);grada(q.x,q.z,hb,ry,G_.w,UD,UH);const bk=new THREE.Mesh(new THREE.BoxGeometry(G_.w,hb+UH+1.4,1),stoneMat);bk.position.set(cu,(hb+UH+1.4)/2,zb+UD+.5);g.add(bk);}
    // los dos muros de los lados del hueco
    for(const e of [-1,1]){const S=e<0?a:b;sideWall(g,cu+e*(G_.w/2-th/2),zf,S.zb,Math.max(S.hb,top),th,UD+1.2);}
    // banderines en los muros
    for(const e of [-1,1]){const p=L2W(cu+e*(G_.w/2+.7),zl+.3);banner(p.x,LH+1.6,p.z,side<0?0:Math.PI);}}
  // bordes en las puntas de la tribuna
  for(const e of [-1,1]){const S=e<0?secs[0]:secs[secs.length-1];sideWall(g,e*(X0-.45),zf,S.zb,S.hb,.9,UD+1.2);}
  return secs;}

async function build(){
  await Promise.all(['desierto_grada','desierto_templo','desierto_torre','desierto_porton','desierto_pantalla','desierto_ladera','desierto_objetos'].map(loadG));
  // --- lados largos: izquierda (z<0) con la cascada de arena al centro; derecha (z>0) con el portón ---
  longSide(-1,[{type:'escalera',w:3.4},{type:'arena',w:4.4},{type:'escalera',w:3.4}]);
  longSide(1,[{type:'escalera',w:3.4},{type:'porton',w:9},{type:'escalera',w:3.4}]);
  // --- detrás de TU portería: dos tramos con escalera al centro, dos niveles más bajitos (la cámara va ahí) ---
  {const g=new THREE.Group();scene.add(g);g.rotation.y=-Math.PI/2;   // local +z → mundo -x
    const ry=Math.PI/2,sw=(2*(Z0E-.9)-3.4)/2;
    for(const e of [-1,1]){const cz=e*(3.4/2+sw/2);grada(-(XS+LD/2),cz,0,ry,sw,LD,LH);
      const hb=e<0?5.2:6;const b=box(UD,hb,sw-.4,-(XS+LD+.6+UD/2),hb/2,cz);grada(-(XS+LD+.6+UD/2),cz,hb,ry,sw-.6,UD,UH);
      box(1,hb+UH+1.2,sw-.4,-(XS+LD+.6+UD+.5),(hb+UH+1.2)/2,cz);
      niche(-(XS+LD+.55),LH+(hb-LH)*.5,cz,Math.PI/2);}
    stairs(g,0,2.2,XS-.2,XS+LD+.6,5.2);for(const e of [-1,1])sideWall(g,e*1.4,XS,XS+LD+.6,5.6,.6,UD+.8);
    for(const e of [-1,1])sideWall(g,e*(Z0E-.45),XS,XS+LD+.6,e<0?5.2:6,.9,UD+1);}
  // --- esquinas: la grada doblada 90° con su torre-arco detrás ---
  const r=ZS-Z0E;
  for(const sx of [-1,1])for(const sz of [-1,1]){const a0=sx>0?(sz>0?0:Math.PI*1.5):(sz>0?Math.PI/2:Math.PI);const C=new THREE.Vector3(sx*X0,0,sz*Z0E);
    const rr=sx>0?r:(XS-X0);bentStand(C,a0,sx>0?r:r,LD,LH);
    // del lado rival la torre se corre hacia la tribuna larga para que la pantalla no la tape desde la cámara
    const d=r+LD+4.5,ang=Math.atan2(sz,sx)+(sx>0?sz*.36:0);const tx=C.x+Math.cos(ang)*d,tz=C.z+Math.sin(ang)*d;
    // la torre va sobre una plataforma de bloques
    box(8.6,3,6,tx,1.5,tz,Math.atan2(-sx,-sz));place('desierto_torre',{x:tx,z:tz,y:3,h:16,ry:Math.atan2(-sx,-sz)});}
  // --- lado RIVAL: el templo detrás de la portería; 2 pantallas en las esquinas inclinadas hacia adentro ---
  {const P=prep('desierto_templo');const W=2*Z0E-.4,d=P?W*P.size.z/P.size.x:10;place('desierto_templo',{x:XS+d/2+.4,z:0,ry:-Math.PI/2,w:W});
    // la cascada de arena baja también de la cornisa del templo, a los lados de la puerta
    const th=P?W*P.size.y/P.size.x:15;for(const e of [-1,1])sandFall(XS+1.2,th*.86,e*(W*.36),2,-Math.PI/2);}
  // lugar libre medido entre el templo, la grada curva y la torre (sin tocar ninguna pared)
  // más metidas en la esquina: paradas sobre la parte de atrás de la grada curva, mirando a la cancha
  for(const sz of [-1,1]){const a=.7,x=X0+Math.cos(a)*11.2,z=sz*(Z0E+Math.sin(a)*11.2);place('desierto_pantalla',{x,z,y:LH*.97,h:10,ry:Math.atan2(10-x,-z)});}
  // --- muritos decorados a los lados de cada portería (la ladera de Tripo) ---
  for(const s of [-1,1])for(const sz of [-1,1])place('desierto_ladera',{x:s*(L+2.4),z:sz*(Z0E-3),ry:s>0?-Math.PI/2:Math.PI/2,w:6.4,h:1.9});
  // --- el estadio queda metido en un cañón de roca rosada tipo Petra; las laderas van al pie ---
  canyon();
  {const XA=-55,XB=53,ZA=40,H=9,piece=(x0,x1,z,ry,n)=>{const w=(x1-x0)/n;for(let i=0;i<n;i++)place('desierto_ladera',{x:x0+w*(i+.5),z,ry,w:w+1.2,h:H+(i%2?1.6:0)});};
   piece(XA,XB,ZA,Math.PI,5);piece(XA,XB,-ZA,0,5);
   for(const [x,ry] of [[XA,Math.PI/2],[XB,-Math.PI/2]]){const n=4,w=2*ZA/n;for(let i=0;i<n;i++)place('desierto_ladera',{x,z:-ZA+w*(i+.5),ry,w:w+1.2,h:H+(i%2?0:1.4)});}}
  // --- porterías de bloques ---
  for(const s of [-1,1])goal(s);
  if(typeof NETS==='undefined'||!NETS.length)drawNets();
  // --- palmeras (de la Playa) y objetos sueltos repartidos ---
  {const PB=[[.355,.658,-.005,.265],[.665,.835,.092,.298],[.812,1.001,.202,.431],[.005,.175,.265,.478],[.682,.981,.325,.701],[.342,.671,.515,.985],[.075,.255,.675,.891],[.865,.985,.712,.861]];
   const PH=[1.3,3.4,1.6,5,1.5,1.7,1.9,1.1];
   const spots=[[L+2.8,-14.6],[L+2.8,14.6],[-(L+2.8),-14.6],[-(L+2.8),14.6]];
   for(const sx of [-1,1])for(const sz of [-1,1])for(const da of (sx>0?[]:[-.42,.42])){const a=Math.atan2(sz,sx)+da,d=r+LD+2.2;spots.push([sx*X0+Math.cos(a)*d,sz*Z0E+Math.sin(a)*d]);}
   spots.forEach(([x,z],i)=>{const k=i%PB.length,Pp=partOf('desierto_objetos',PB[k]);if(Pp)placePart(Pp,{x,z,h:PH[k]*.85,ry:Math.random()*6.28});});}
  try{const pl=await new Promise(res=>loader.load('assets/arenas/playa/playa_palmera.glb?v=203',res,undefined,()=>res(null)));
    if(pl){GM.palmera=pl;for(const [x,z,h] of [[47,33,11],[-38,33,10],[47,-33,10],[-38,-33,12],[48,26,9],[-44,-33.5,9]])place('palmera',{x,z,h,ry:Math.random()*6});}}catch(e){}
}

// ===== animación =====
let goalT=0;
function update(dt){dt=Math.min(.05,dt);const T=(update.t=(update.t||0)+dt);const gk=goalT>0?goalT/2.8:0;if(goalT>0)goalT-=dt;
  for(const t of sandFalls)t.offset.y+=dt*(.9+gk*.8);
  for(const p of dust){p.life-=dt;if(p.life<=0){p.life=1+Math.random()*.8;p.sp.position.set(p.x+(Math.random()-.5)*p.w*.6,.3,p.z+(Math.random()-.5)*p.w*.6);}
    p.sp.position.y+=dt*.6;const k=p.life/1.8;p.sp.material.opacity=Math.sin(Math.min(1,k)*Math.PI)*.45;p.sp.scale.setScalar(1.2+(1-k)*2.2);}
  for(const g of glows){g.sp.material.opacity=.45+Math.sin(T*8+g.ph)*.08+Math.sin(T*19+g.ph)*.05+gk*.3;}
  for(const f of fires){const s=f.s;for(const p of f.parts){const fl=Math.sin(T*11+p.ph)*.12+Math.sin(T*23+p.ph*2)*.08;
      p.sp.scale.set((.75-p.k*.15+fl*.4)*s*(1+gk*.5),(1.25-p.k*.2+fl)*s*(1+gk*.7),1);p.sp.position.set(Math.sin(T*6+p.ph)*.06*s,(.45+p.k*.1)*s,0);p.sp.material.opacity=.9-p.k*.2;}
    f.core.material.opacity=.55+Math.sin(T*9+f.parts[0].ph)*.12;
    for(const e of f.emb){e.t+=dt*(.7+gk);if(e.t>1){e.t=0;e.dx=(Math.random()-.5)*.6;}e.sp.position.set((e.dx+Math.sin(T*4+e.ph)*.15)*s,(.3+e.t*1.8)*s,0);e.sp.material.opacity=(1-e.t)*.9;}}
  for(const s of stars)s.m.material.opacity=.65+Math.sin(T*1.3+s.ph)*.25;
  for(const s of shooting){s.t+=dt;if(s.t>2.2){s.t=-4-Math.random()*8;const a=Math.random()*Math.PI*2;s.a=a;s.p=new THREE.Vector3(Math.cos(a)*150,90+Math.random()*50,Math.sin(a)*150);s.d=new THREE.Vector3(-Math.sin(a)*.8,-.35,Math.cos(a)*.8).normalize();}
    if(s.t<0||!s.p){s.m.material.opacity=0;continue;}const k=s.t/2.2;s.m.position.copy(s.p).addScaledVector(s.d,k*120);s.m.lookAt(s.m.position.clone().add(new THREE.Vector3(0,1,0)));
    s.m.rotation.z=0;s.m.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),s.d);s.m.material.opacity=Math.sin(k*Math.PI)*.9;}
  for(const b of beams){b.m.rotation.set(-.35+Math.sin(T*.35+b.ph)*.25,0,Math.sin(T*.27+b.ph*1.7)*.45);}
  for(const f of flags){const a=f.m.geometry.attributes.position;for(let i=0;i<a.count;i++){const y=f.base[i*3+1],k=(.85-y)/1.7;a.setZ(i,Math.sin(T*3+f.ph+y*2)*.12*k*(1+gk*2));}a.needsUpdate=true;}
}
build();
try{if(typeof GOAL_STD!=='undefined')GOAL_STD.forEach(m=>{if(m.geometry&&m.geometry.parameters&&m.geometry.parameters.radiusTop>.1)m.visible=false;});}catch(e){}
return {update,setSand,seats:SEATS,onGoal:()=>{goalT=2.8;}};
};
