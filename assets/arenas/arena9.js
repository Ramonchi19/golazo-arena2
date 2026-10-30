window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[9]=function(G){

const L=32,HW=16,GW=4.5,GH=2.9,B=HW+1.0,E=L+1.2;
// ===== v192: Volcán de noche. Cielo morado y luz fría; lo cálido es la lava, el fuego y los focos =====
const PAL={stone:['#3a3036','#332a30'],glow:'#ffb050',ground:'#1c1418'};
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;
const renderer=G.renderer;
const scene=G.root,REAL=G.scene;REAL.background=new THREE.Color('#2b1a46');REAL.fog=new THREE.Fog('#2b1a46',95,230);
const camera=G.camera;
const hemi=new THREE.HemisphereLight(0x9a8ce0,0x3a1a14,.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe2c4,.72);sun.position.set(-16,42,22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-56,right:56,top:40,bottom:-40,near:8,far:130});sun.shadow.bias=-.0004;sun.shadow.normalBias=.045;scene.add(sun);
// la lava alumbra desde abajo con un naranja suave
const lavaLight=new THREE.DirectionalLight(0xff7a30,.22);lavaLight.position.set(0,-10,0);scene.add(lavaLight);
const U={uTime:{value:0},uWind:{value:1}};
const matCache={};
function flat(hex){if(matCache[hex])return matCache[hex];return matCache[hex]=new THREE.MeshLambertMaterial({color:hex,flatShading:true});}
const mesh=(geo,hex)=>{const m=new THREE.Mesh(geo,flat(hex));m.castShadow=true;m.receiveShadow=true;return m;};
function radTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,inner);r.addColorStop(.35,inner.replace(/[\d.]+\)$/,'0.45)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
const GLOW=radTex('rgba(255,214,130,1)','rgba(255,180,80,0)');

// ===== cancha: el césped de la arena 1 (estilo Strikers) =====
function fieldTex(){const PX=24,W=72*PX,H=48*PX,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const X=x=>(x+36)*PX,Z=z=>(z+24)*PX,q=4;
  const STK=!!window.strikersGrass;
  if(STK)strikersGrass(g,W,H,PX,X,Z);else
  for(let x=-36,i=0;x<36;x+=q,i++)for(let z=-24,j=0;z<24;z+=q,j++){g.fillStyle=(i+j)%2?'#9db150':'#89a444';g.fillRect(X(x),Z(z),q*PX+1,q*PX+1);}
  const id=g.getImageData(0,0,W,H),d=id.data;for(let k=0;k<d.length;k+=4){const n=(Math.random()-.5)*6;d[k]+=n;d[k+1]+=n*1.1;d[k+2]+=n*.8;}g.putImageData(id,0,0);
  g.strokeStyle=STK?'#f6faf0':'rgba(240,234,214,.9)';g.lineWidth=PX*(STK?.25:.22);
  (window.GZ_RR?GZ_RR(g,X(-L),Z(-HW),2*L*PX,2*HW*PX,(SIM.C.CR||0)*PX):g.strokeRect(X(-L),Z(-HW),2*L*PX,2*HW*PX));g.beginPath();g.moveTo(X(0),Z(-HW));g.lineTo(X(0),Z(HW));g.stroke();
  g.beginPath();g.arc(X(0),Z(0),5*PX,0,7);g.stroke();
  for(const s of [-1,1]){g.strokeRect(X(s>0?L-9:-L),Z(-8.6),9*PX,17.2*PX);g.strokeRect(X(s>0?L-3.5:-L),Z(-5.5),3.5*PX,11*PX);}
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();if(STK)strikersFinish(g,W,H,X(0),Z(0),PX,t);return t;}
// el pasto llega justo hasta la barda (rectángulo con esquinas redondeadas como la cancha)
function fieldShape(hx,hz,cx,cz){const sh=new THREE.Shape(),N=10,rx=hx-cx,rz=hz-cz;const pts=[];
  for(const [sx,sz,a0] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]])
    for(let i=0;i<=N;i++){const a=a0+i/N*Math.PI/2;pts.push(new THREE.Vector2(sx*cx+Math.cos(a)*rx,sz*cz+Math.sin(a)*rz));}
  sh.setFromPoints(pts);const geo=new THREE.ShapeGeometry(sh,1),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+36)/72,(p.getY(i)+24)/48);return geo;}
const FIELD_CR=(window.SIM&&SIM.C&&SIM.C.CR)||7;
const field=new THREE.Mesh(fieldShape(L+2.6,HW+1.7,L-FIELD_CR,HW-FIELD_CR),new THREE.MeshLambertMaterial({map:fieldTex()}));
field.rotation.x=-Math.PI/2;field.position.y=0;field.receiveShadow=true;scene.add(field);
// suelo de roca oscura de afuera
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle=PAL.ground;g.fillRect(0,0,S,S);
  for(let i=0;i<300;i++){g.fillStyle=pickC(['rgba(70,50,60,.5)','rgba(30,20,26,.5)','rgba(140,50,20,.18)']);g.beginPath();g.arc(Math.random()*S,Math.random()*S,4+Math.random()*20,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(16,16);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=-.3;m.receiveShadow=true;scene.add(m);})();

// =====================================================================
// v192: VOLCÁN ESTADIO — gradas y estructuras hechas en Tripo (assets/arenas/volcan)
// Estadio cerrado: tribuna principal al fondo, gradas detrás de porterías,
// grada baja del lado de la cámara y esquinas curvas (la grada doblada por código).
// =====================================================================
const DIR='assets/arenas/volcan/';
const loader=new THREE.GLTFLoader(),GM={};
const loadG=n=>new Promise(res=>loader.load(DIR+n+'.glb?v=192',g=>{GM[n]=g;res();},undefined,e=>{console.warn('falta',n,e);res();}));

// --- materiales: lambert (barato) + brillo propio en lo naranja/amarillo (lava, cristales, focos) ---
const glowU={value:1};
function arenaMat(src){const map=src.map||null;if(map){map.encoding=THREE.LinearEncoding;map.anisotropy=4;map.needsUpdate=true;}
  const m=new THREE.MeshLambertMaterial({map,color:0xffffff});
  m.onBeforeCompile=sh=>{sh.uniforms.uGlow=glowU;
    sh.fragmentShader='uniform float uGlow;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      {vec3 c=diffuseColor.rgb;float hot=smoothstep(.22,.5,c.r-c.b)*smoothstep(.42,.75,c.r);
       totalEmissiveRadiance+=c*hot*(.85*uGlow)+c*.16;}`);};
  m.customProgramCacheKey=()=>'volcanGlow';return m;}
// prepara cada modelo: material nuevo, sombras, y su caja (para colocarlo por medidas)
const PREP={};
const TRIM={volcan_techo:-6.45*Math.PI/180};   // el modelo del techo viene girado 6.45°: se endereza
function prep(n){if(PREP[n])return PREP[n];const g=GM[n];if(!g)return null;const s=g.scene;s.rotation.y=TRIM[n]||0;
  const mats=new Map();s.traverse(o=>{if(o.isMesh){if(!mats.has(o.material))mats.set(o.material,arenaMat(o.material));o.material=mats.get(o.material);o.castShadow=true;o.receiveShadow=true;}});
  if(STRETCH[n])stretchTop(s,STRETCH[n]);
  s.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(s);return PREP[n]={s,box,size:box.getSize(new THREE.Vector3())};}
// solo la pared de atrás de la tribuna principal (para correrla encima del portón)
function wallPart(){if(PREP.muro)return PREP.muro;const P=prep('volcan_grada_principal');if(!P)return null;const s=P.s,rot=s.rotation.y;s.rotation.y=0;s.updateMatrixWorld(true);
  const g=new THREE.Group(),x0=P.box.min.x,sx=P.size.x;
  s.traverse(m=>{if(!m.isMesh)return;const geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);const pa=geo.attributes.position,idx=geo.index?geo.index.array:null,cnt=idx?idx.length:pa.count,keep=[];
    for(let t=0;t<cnt;t+=3){const a=idx?idx[t]:t,b=idx?idx[t+1]:t+1,c=idx?idx[t+2]:t+2;if([a,b,c].every(v=>(pa.getX(v)-x0)/sx>.84))keep.push(a,b,c);}
    geo.setIndex(keep);const mm=new THREE.Mesh(geo,m.material);mm.castShadow=true;mm.receiveShadow=true;g.add(mm);});
  s.rotation.y=rot;s.updateMatrixWorld(true);return PREP.muro={s:g,box:P.box,size:P.size};}
// estira a lo largo (eje z del modelo) solo lo que está arriba de cierta altura: la lámina del techo, no los pilares
const STRETCH={volcan_techo:{k:1.4,cut:.64}};
function stretchTop(s,o){const rot=s.rotation.y;s.rotation.y=0;s.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(s),y0=box.min.y,H=box.max.y-box.min.y,zc=(box.min.z+box.max.z)/2,meshes=[];
  s.traverse(m=>{if(m.isMesh)meshes.push(m);});
  for(const m of meshes){const geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i);const t=Math.min(1,Math.max(0,(y-y0-o.cut*H)/(H*.06)));if(t>0)p.setZ(i,zc+(p.getZ(i)-zc)*(1+(o.k-1)*t));}
    geo.computeVertexNormals();m.geometry=geo;m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.set(1,1,1);s.add(m);}
  s.rotation.y=rot;}
// FACE: cuánto girar cada modelo para que su frente mire a +z (hacia la cancha cuando se pone al fondo)
const FACE={volcan_grada:Math.PI/2,volcan_grada_principal:Math.PI/2,volcan_grada_baja:0,muro:Math.PI/2};
// coloca un modelo: w = ancho (eje x una vez girado), d = fondo, h = alto. Si falta alguno usa la escala del otro.
function place(n,o){const P=n==='muro'?wallPart():prep(n);if(!P)return null;o=o||{};
  const inner=P.s.clone(true),wrap=new THREE.Group(),rot=new THREE.Group();rot.add(inner);
  const c=P.box.getCenter(new THREE.Vector3());inner.position.set(-c.x,-P.box.min.y,-c.z);
  rot.rotation.y=(FACE[n]||0)+(o.spin||0);wrap.add(rot);
  const turned=Math.abs(Math.sin(rot.rotation.y))>.5,W0=turned?P.size.z:P.size.x,D0=turned?P.size.x:P.size.z,H0=P.size.y;
  let k=o.s||null;if(!k)k=o.w?o.w/W0:o.d?o.d/D0:o.h?o.h/H0:1;
  wrap.scale.set(o.w?o.w/W0:k,o.h?o.h/H0:(o.ys||k),o.d?o.d/D0:k);
  wrap.position.set(o.x||0,o.y||0,o.z||0);wrap.rotation.y=o.ry||0;scene.add(wrap);return wrap;}

// filas de asiento medidas de cada grada (f = fracción del fondo desde el frente, h = fracción del alto)
const ROWS={volcan_grada:[[.17,.17],[.30,.28],[.43,.38],[.57,.48],[.71,.57],[.82,.68]],
  volcan_grada_principal:[[.32,.27],[.45,.34],[.56,.41],[.68,.48],[.80,.55]],
  volcan_grada_baja:[[.33,.33],[.46,.41],[.57,.50],[.70,.59],[.80,.67]]};
const SEATS=[];   // {x,y,z,ry}
function seatsStraight(n,cx,cz,ry,W,D,H,sp){const R=ROWS[n];if(!R)return;const cs=Math.cos(ry),sn=Math.sin(ry);
  for(const [f,h] of R){const lz=D/2-f*D;for(let lx=-W/2+sp*.6;lx<=W/2-sp*.5;lx+=sp){
    SEATS.push({x:cx+lx*cs+lz*sn,y:h*H,z:cz-lx*sn+lz*cs,ry});}}}

// --- grada doblada 90° para las esquinas: misma malla y misma textura, curvada alrededor de C ---
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

// ===== medidas del estadio =====
const ZB=HW+1.4,XB=L+2.3;          // barda alrededor de la cancha
const ZS=HW+3.6,XS=L+4.5,RC=7;          // frente de las gradas y radio de las esquinas
const X0=XS-RC,Z0=ZS-RC;            // centros de las esquinas
const SG=15;                        // escala de la grada (fila ≈ 1)
const VS=1.45;                      // las gradas se estiran hacia arriba: más empinadas, encierran más
const MAIN={d:.673*SG,h:.814*SG*VS},GRD={d:.549*SG,h:.65*SG*VS},LOW={d:.447*11,h:.374*11*1.2};
const SP=1.45;                      // separación entre hinchas

// lava del foso que late y brilla (la del piso ya está; aquí una franja más viva junto a las gradas)
const lavaMats=[];
function lavaTex(){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#ff7a1a';g.fillRect(0,0,S,S);
  for(let i=0;i<120;i++){const x=Math.random()*S,y=Math.random()*S,r=8+Math.random()*30,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,Math.random()<.5?'rgba(255,230,120,.9)':'rgba(255,170,40,.8)');gr.addColorStop(1,'rgba(255,120,20,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<40;i++){g.fillStyle='rgba(90,25,8,.55)';g.beginPath();g.ellipse(Math.random()*S,Math.random()*S,6+Math.random()*16,3+Math.random()*7,Math.random()*3,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}

// brillos, brasas, ceniza y humo
const glows=[],emitters=[],embers=[],ashes=[],smokes=[],chimneys=[];
const EMB=radTex('rgba(255,190,90,1)','rgba(255,90,20,0)'),ASH=radTex('rgba(120,110,105,.9)','rgba(80,70,65,0)'),SMK=radTex('rgba(70,60,58,.8)','rgba(60,50,48,0)');
function addGlow(p,size,col){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:col||PAL.glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.85}));
  sp.position.copy(p);sp.scale.setScalar(size);scene.add(sp);glows.push({sp,base:size,ph:Math.random()*6});return sp;}
// antorchas: flamita de sprites (fuego por código)
const FIRE=radTex('rgba(255,236,150,1)','rgba(255,110,20,0)'),torches=[];
function torch(x,y,z,s){s=s||1;const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const parts=[];
  for(let i=0;i<4;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FIRE,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(.9*s);g.add(sp);parts.push({sp,ph:Math.random()*6,k:i/4});}
  addGlow(new THREE.Vector3(x,y+.3*s,z),3.2*s,'#ffb050');torches.push({parts,s});emitters.push({x,y:y+.6*s,z,r:.15,fire:1});}
// mantas que ondean (por código), colgadas de los ganchos de la tribuna principal
function clothMat(c1,c2){const c=document.createElement('canvas');c.width=96;c.height=192;const x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,96,192);x.fillStyle=c2;x.fillRect(0,0,96,16);x.fillRect(0,176,96,16);
  x.beginPath();x.moveTo(48,52);x.bezierCurveTo(78,84,70,120,48,140);x.bezierCurveTo(26,120,18,84,48,52);x.fill();
  x.fillStyle=c1;x.beginPath();x.moveTo(48,92);x.bezierCurveTo(60,104,58,120,48,128);x.bezierCurveTo(38,120,36,104,48,92);x.fill();
  const m=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide,emissive:0x220800});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uWind=U.uWind;sh.vertexShader='uniform float uTime,uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float k=clamp(1.-uv.y,0.,1.);transformed.z+=(sin(uTime*2.6+uv.y*4.+position.x*2.)*.22*k+sin(uTime*4.3+uv.y*7.)*.06*k)*uWind;`);};m.customProgramCacheKey=()=>'cloth9';return m;}
function banner(x,y,z,ry,w,h,c1,c2){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h,4,8),clothMat(c1,c2));m.position.set(x,y-h/2,z);m.rotation.y=ry;scene.add(m);return m;}

// ===== ladera del cráter: un anillo de roca que sube hasta la espalda de las gradas =====
// alto de la ladera a "d" metros detrás de la orilla de las gradas (h = alto de la grada en ese lado)
function bermY(d,h){return d<12?h*.9-h*.22*d/12:Math.max(0,h*.68*(1-(d-12)/20));}
function rockTex(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#2a2026';g.fillRect(0,0,S,S);
  for(let i=0;i<500;i++){g.fillStyle=pickC(['rgba(70,52,64,.55)','rgba(20,14,18,.5)','rgba(54,40,50,.6)']);const x=Math.random()*S,y=Math.random()*S,r=6+Math.random()*30;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r,y);g.lineTo(x,y+r*.8);g.lineTo(x-r*.9,y);g.closePath();g.fill();}
  g.lineCap='round';for(let k=0;k<22;k++){let x=Math.random()*S,y=Math.random()*S,a=Math.random()*6.28;const w=1.5+Math.random()*3;
    for(let s=0;s<14;s++){const nx=x+Math.cos(a)*14,ny=y+Math.sin(a)*14;g.strokeStyle='rgba(255,120,30,.9)';g.lineWidth=w+2;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();
      g.strokeStyle='rgba(255,220,120,1)';g.lineWidth=w*.6;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();x=nx;y=ny;a+=(Math.random()-.5)*1.1;}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function crater(){const P=[];// puntos de la orilla interior: x,z, normal hacia afuera, alto
  const line=(x0,z0,x1,z1,nx,nz,h,n)=>{for(let i=0;i<n;i++){const t=i/n;P.push([x0+(x1-x0)*t,z0+(z1-z0)*t,nx,nz,h]);}};
  const arc=(cx,cz,r,a0,a1,h,n)=>{for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n;P.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r,Math.cos(a),Math.sin(a),h]);}};
  const rF=RC+GRD.d,rN=RC+GRD.d,HM=MAIN.h,HG=GRD.h,HL=GRD.h;
  line(-X0,-ZS-MAIN.d,X0,-ZS-MAIN.d,0,-1,HM,16);arc(X0,-Z0,rF,-Math.PI/2,0,HG,10);
  line(XS+GRD.d,-Z0,XS+GRD.d,Z0,1,0,HG,8);arc(X0,Z0,rN,0,Math.PI/2,HL,10);
  line(X0,ZS+MAIN.d,-X0,ZS+MAIN.d,0,1,HM,16);arc(-X0,Z0,rN,Math.PI/2,Math.PI,HL,10);
  line(-XS-GRD.d,Z0,-XS-GRD.d,-Z0,-1,0,HG,8);arc(-X0,-Z0,rF,Math.PI,Math.PI*1.5,HG,10);
  const R=[-.6,3,8,13,20,28,34],n=P.length,pos=[],uv=[],idx=[];let acc=0;
  for(let i=0;i<n;i++){const [x,z,nx,nz,h]=P[i];if(i)acc+=Math.hypot(x-P[i-1][0],z-P[i-1][1]);
    for(let j=0;j<R.length;j++){const d=R[j],jit=j&&j<R.length-1?(Math.sin(i*1.7+j*2.3)*.8):0;pos.push(x+nx*(d+jit),j===0?h*.9:bermY(d,h)+jit*.4,z+nz*(d+jit));uv.push(acc/14,d/14);}}
  for(let i=0;i<n;i++){const a=i*R.length,b=((i+1)%n)*R.length;for(let j=0;j<R.length-1;j++){idx.push(a+j,b+j,a+j+1,b+j,b+j+1,a+j+1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,arenaMat({map:rockTex()}));m.material.side=THREE.DoubleSide;m.receiveShadow=true;m.castShadow=false;scene.add(m);
  // rocas sueltas y brasas en la ladera
  for(let i=0;i<n;i+=3){const [x,z,nx,nz,h]=P[i];const d=6+Math.random()*16;emitters.push({x:x+nx*d,y:bermY(d,h),z:z+nz*d,r:1.5});}}
// ===== pantallas: lienzo animado sobre el marcador (VOLCÁN, barras de colores y ¡GOL!) =====
const screens=[];let scrT=0;
function screen(x,y,z,ry,w,o){const c=document.createElement('canvas');c.width=512;c.height=288;const tex=new THREE.CanvasTexture(c);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w*.47,w*.37),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
  const lz=w*.212/2+.08,ly=y+w*.753*.53;m.position.set(x+lz*Math.sin(ry),ly,z+lz*Math.cos(ry));m.rotation.y=ry;scene.add(m);
  addGlow(new THREE.Vector3(m.position.x+Math.sin(ry)*1.5,ly,m.position.z+Math.cos(ry)*1.5),w*.9,'#ff9a50').material.opacity=.35;
  screens.push({c,g:c.getContext('2d'),tex});}
function drawScreens(T,gk){for(const s of screens){const g=s.g,W=512,H=288;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#3a0a14');gr.addColorStop(1,'#120408');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<24;i++){const x=i*W/24,h=(Math.sin(T*3+i*.7)*.5+.5)*H*.32+H*.08;g.fillStyle=i%3===0?'#ff5a1f':i%3===1?'#ffb030':'#e2382b';g.fillRect(x+2,H-h,W/24-4,h);}
  g.textAlign='center';g.textBaseline='middle';
  if(gk>0){const on=Math.floor(T*8)%2;g.fillStyle=on?'#ffe066':'#ffffff';g.font='120px "Lilita One",system-ui,sans-serif';g.fillText('¡GOL!',W/2,H*.42);}
  else{const ph=Math.floor(T/4)%2;g.fillStyle='#fff3dc';g.font=(ph?'86px':'96px')+' "Lilita One",system-ui,sans-serif';g.fillText(ph?'¡VAMOS!':'VOLCÁN',W/2,H*.4);
    g.fillStyle='#ffb030';g.font='34px "Lilita One",system-ui,sans-serif';g.fillText('🔥  ARENA 7  🔥'.replace(/🔥/g,'★'),W/2,H*.68);}
  g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<H;y+=4)g.fillRect(0,y,W,2);
  s.tex.needsUpdate=true;}}

// ===== armar el estadio =====
async function build(){
  await Promise.all(['volcan_grada','volcan_grada_principal','volcan_grada_baja','volcan_forja','volcan_fondo','volcan_techo','volcan_torre',
    'volcan_porton','volcan_marcador','volcan_banca','volcan_reflector','volcan_barda','volcan_esquina_barda','volcan_muro','volcan_arco','volcan_props','publico_hincha'].map(loadG));

  // --- piso de basalto entre la cancha y las gradas ---
  {const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#2e252b';g.fillRect(0,0,S,S);
   g.strokeStyle='#1a1418';g.lineWidth=3;for(let y=0;y<S;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();for(let x=(y/32%2)*32;x<S;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}
   for(let i=0;i<400;i++){g.fillStyle=Math.random()<.5?'rgba(80,64,74,.35)':'rgba(10,6,8,.3)';g.fillRect(Math.random()*S,Math.random()*S,2+Math.random()*4,2+Math.random()*4);}
   const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set((2*XS+10)/6,(2*ZS+10)/6);
   const p=new THREE.Mesh(new THREE.PlaneGeometry(2*XS+10,2*ZS+10),new THREE.MeshLambertMaterial({map:t}));p.rotation.x=-Math.PI/2;p.position.y=-.04;p.receiveShadow=true;scene.add(p);}
  // --- río de lava a los costados: corre entre la cancha y las tribunas largas; se corta frente al portón ---
  {const z0=HW+1.75,z1=ZS-.15,zc=(z0+z1)/2,w=z1-z0,X=X0-1.5,segs=[[1,-X,X],[-1,-X,-7.5],[-1,7.5,X]];
   for(const [side,xa,xb] of segs){const t=lavaTex();t.repeat.set((xb-xa)/4,1);const m=new THREE.MeshBasicMaterial({map:t});lavaMats.push(m);
     const len=xb-xa,riv=new THREE.Mesh(new THREE.PlaneGeometry(len,w),m);riv.rotation.x=-Math.PI/2;riv.position.set((xa+xb)/2,-.02,side*zc);scene.add(riv);
     for(const e of [-1,1]){const kerb=mesh(new THREE.BoxGeometry(len+.4,.28,.32),'#3a2e34');kerb.position.set((xa+xb)/2,.1,side*(zc+e*(w/2+.12)));scene.add(kerb);}
     for(const x of [xa,xb]){const cap=mesh(new THREE.BoxGeometry(.32,.28,w+.6),'#3a2e34');cap.position.set(x,.1,side*zc);scene.add(cap);}
     for(let x=xa+2;x<xb-1;x+=4.5){emitters.push({x,y:.05,z:side*zc,r:.6});if(Math.random()<.5)addGlow(new THREE.Vector3(x,.4,side*zc),2.4,'#ff8a30');}}}

  // ===== COMPOSICIÓN — vista del juego tipo Clash Royale: la cámara va alta detrás de TU portería (x<0)
  // y mira hacia la portería RIVAL (x>0). Del lado rival no hay grada: ahí va la Forja.
  const at=(x,z,ry,lx,ly,lz)=>new THREE.Vector3(x+lx*Math.cos(ry)+lz*Math.sin(ry),ly,z-lx*Math.sin(ry)+lz*Math.cos(ry));
  const mainW=(2*X0-12)/4,mainX=i=>(i<2?-X0+mainW*(i+.5):X0-mainW*(4-i-.5));
  // techo: voladizo con las proporciones del modelo, derecho y paralelo a la grada, parado en la pared de atrás
  const roof=(cx,side)=>{const k=mainW,D=.632*k;const z=side*(ZS+MAIN.d*.93-.25*D);place('volcan_techo',{x:cx,z,y:MAIN.h*.76,spin:Math.PI/2,s:k,ry:side>0?Math.PI:0});ROOFS.push({x:cx,z,y:MAIN.h});};

  // --- las dos tribunas largas: 4 módulos; el portón al centro de una ---
  for(const side of [-1,1]){const ry=side<0?0:Math.PI,cz=side*(ZS+MAIN.d/2);
    for(let i=0;i<4;i++){const cx=mainX(i);
      place('volcan_grada_principal',{x:cx,z:cz,ry,w:mainW,d:MAIN.d,h:MAIN.h});seatsStraight('volcan_grada_principal',cx,cz,ry,mainW,MAIN.d,MAIN.h,SP);
      for(const q of [-.32,.32]){const p=at(cx,cz,ry,q*mainW,MAIN.h*.92,-MAIN.d*.43);torch(p.x,p.y,p.z,1.2);}}
    roof(mainX(0),side);roof(mainX(3),side);}
  place('volcan_porton',{x:0,z:-ZS-2.6,w:11});
  // encima del portón: solo la pared de atrás de la tribuna, corrida de un lado al otro (sin gradas)
  place('muro',{x:0,z:-(ZS+MAIN.d/2),w:12.2,d:MAIN.d,h:MAIN.h});
  // del otro lado no hay portón: el hueco del centro se llena con otro módulo de tribuna
  place('volcan_grada_principal',{x:0,z:ZS+MAIN.d/2,ry:Math.PI,w:12.2,d:MAIN.d,h:MAIN.h});seatsStraight('volcan_grada_principal',0,ZS+MAIN.d/2,Math.PI,12,MAIN.d,MAIN.h,SP);
  for(const q of [-1,1])torch(q*6.4,9.6,-ZS-1,1.3);

  // --- detrás de TU portería (x<0): grada con ventanitas ---
  for(let i=0;i<2;i++){const cz=-Z0+Z0*(i+.5),cx=-(XS+GRD.d/2),ry=Math.PI/2;
    place('volcan_grada',{x:cx,z:cz,ry,w:Z0,d:GRD.d,h:GRD.h});seatsStraight('volcan_grada',cx,cz,ry,Z0,GRD.d,GRD.h,SP);
    for(const q of [-.3,.3]){const p=at(cx,cz,ry,q*Z0,GRD.h*.97,-GRD.d*.46);torch(p.x,p.y,p.z,1.1);}}

  // --- las cuatro esquinas curvas ---
  for(const sx of [-1,1])for(const sz of [-1,1]){const a0=sx>0?(sz<0?-Math.PI/2:0):(sz<0?Math.PI:Math.PI/2);
    bentStand('volcan_grada',{x:sx*X0,z:sz*Z0},a0,RC,GRD.d,GRD.h,SP);}

  // --- porterías: el arco, con el hueco justo del tamaño de la portería del juego ---
  {const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},W=2*C.GW/.497,H=C.GH/.687;
   for(const s of [-1,1])place('volcan_arco',{x:s*(L+.35),z:0,ry:s>0?-Math.PI/2:Math.PI/2,w:W,h:H,d:2.4});}

  // red café: en el juego se pintan las redes que ya existen (con su física); en la vista previa se dibuja una
  brownNets();
  // --- la ladera del cráter, cerrada por los cuatro lados ---
  crater();

  // --- la Forja: en el lugar de la grada del rival (x>0), del ancho de ese lado ---
  {const FW=2*Z0+1,FD=.669*FW,FX=XS+FD/2;place('volcan_forja',{x:FX,z:0,ry:-Math.PI/2,w:FW});
   for(const cz of [-7.2,-4.3,4.5])chimneys.push({x:FX+1,y:FW*.92,z:cz});
   place('volcan_fondo',{x:FX+80,z:-30,w:120,ry:-1.2});volcanTop={x:FX+80,y:76,z:-30};}

  // --- reflectores encima de las tribunas largas y detrás de tu portería, con su luz ---
  const flood=(x,y,z,ry,h)=>{place('volcan_reflector',{x,z,y,ry,h});const p=at(x,z,ry,0,y+h*.9,h*.12);addGlow(p,h*.75,'#fff4dc');addGlow(p,h*.3,'#ffffff');};
  for(const side of [-1,1])flood(mainX(1),MAIN.h*.86,side*(ZS+MAIN.d*.9),side<0?0:Math.PI,10);
  flood(-(XS+GRD.d*.9),GRD.h*.86,0,Math.PI/2,9);

  // --- torres de vigía en las cuatro esquinas, sobre la ladera ---
  for(const sx of [-1,1])for(const sz of [-1,1]){const r=RC+GRD.d+(sx>0?8:3.5),x=sx*(X0+r*.7071),z=sz*(Z0+r*.7071),y=bermY(r-RC-GRD.d,GRD.h);
    place('volcan_torre',{x,z,y,h:22});addGlow(new THREE.Vector3(x,y+21.5,z),7,'#ffcf60');}

  // --- dos pantallas en las esquinas del lado rival, sobre la grada curva, inclinadas hacia adentro ---
  for(const s of [-1,1]){const r=RC+GRD.d-.5,x=X0+r*.7071,z=s*(Z0+r*.7071),ry=Math.atan2(-x,-z),y=GRD.h*.82,w=15;
    const o=place('volcan_marcador',{x,z,y,ry,w});screen(x,y,z,ry,w,o);}

  // --- partículas ---
  for(let i=0;i<120;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:EMB,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sp.scale.setScalar(.28);scene.add(sp);embers.push({sp,life:0});}
  for(let i=0;i<50;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ASH,transparent:true,depthWrite:false,opacity:.6}));sp.scale.setScalar(.18);sp.position.set((Math.random()-.5)*90,Math.random()*20,(Math.random()-.5)*60);scene.add(sp);ashes.push(sp);}
  for(let i=0;i<24;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SMK,transparent:true,depthWrite:false,opacity:0}));scene.add(sp);smokes.push({sp,life:0});}

  // --- público (apagado por ahora) ---
  if(window.GZ_CROWD_ON)buildCrowd();
}
let volcanTop=null;const ROOFS=[];
const NET_BROWN=0x8a5a32,FRAME_BROWN=0x5a3a22;
function netTexB(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='#ffffff';g.lineWidth=5;
  g.beginPath();g.moveTo(0,32);g.lineTo(32,0);g.lineTo(64,32);g.lineTo(32,64);g.closePath();g.stroke();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function brownNets(){
  if(typeof NETS!=='undefined'&&NETS.length){for(const N of NETS)for(const P of N.panels){P.mesh.userData._c=P.mesh.material.color.getHex();P.mesh.material.color.setHex(NET_BROWN);const mp=P.mesh.material.map;if(mp){mp.wrapS=mp.wrapT=THREE.RepeatWrapping;mp.repeat.set(2,2);mp.needsUpdate=true;}}
    if(typeof GOAL_STD!=='undefined')for(const m of GOAL_STD){m.userData._c=m.material.color.getHex();m.material.color.setHex(FRAME_BROWN);}return;}
  const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},D=2.2,HB=C.GH*.72,mat=new THREE.MeshBasicMaterial({map:netTexB(),color:NET_BROWN,transparent:true,alphaTest:.25,side:THREE.DoubleSide,depthWrite:false});
  const panel=(w,h,x,y,z,ry,rx)=>{const g=new THREE.PlaneGeometry(w,h);const t=g.attributes.uv;for(let i=0;i<t.count;i++)t.setXY(i,t.getX(i)*w/.8,t.getY(i)*h/.8);
    const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry,0,'YXZ');scene.add(m);};
  for(const s of [-1,1]){const X=s*L;panel(2*C.GW,HB,X+s*D,HB/2,0,Math.PI/2);
    const sl=Math.hypot(D,C.GH-HB);panel(2*C.GW,sl,X+s*D/2,(C.GH+HB)/2,0,Math.PI/2,Math.atan2(s*D,-(C.GH-HB)));
    for(const z of [-C.GW,C.GW])panel(D,(C.GH+HB)/2,X+s*D/2,(C.GH+HB)/4,z,0);}}

// =====================================================================
// PÚBLICO: el hincha 3D (rig Mixamo) se pone en 4 poses por código y se "fotografía" de frente y de
// espalda en una hoja de figuras. Cada hincha es una figura plana que siempre mira a la cámara:
// se ve limpio y cuesta casi nada en el celular. El azul de casco y playera se cambia por su color.
// =====================================================================
const crowd={mesh:null,list:[],atlas:null,uni:null};
const TEAMS=['#e2382b','#2f6fe0','#f2c230','#2fae5a','#9a4ae0','#f07a1a','#e04aa0','#f4f4f4'];
const SKINS=['#ffffff','#ffe6d8','#e8f4ff','#f0ffe8','#fff0f8','#f4e8ff'];
const HH=1.3;   // alto del hincha en metros del juego (los jugadores miden ~2.4)
function buildCrowd(){const G0=GM.publico_hincha;if(!G0||!SEATS.length)return;
  const root=THREE.SkeletonUtils.clone(G0.scene);const holder=new THREE.Group();holder.add(root);holder.updateMatrixWorld(true);
  let sm=null;root.traverse(o=>{if(o.isSkinnedMesh&&!sm)sm=o;});if(!sm)return;
  const bones={};sm.skeleton.bones.forEach(b=>{bones[b.name.replace(/^mixamorig:?/,'')]=b;});
  const map=sm.material.map;if(map){map.encoding=THREE.LinearEncoding;map.needsUpdate=true;}
  const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_q=new THREE.Quaternion(),_pq=new THREE.Quaternion(),_wq=new THREE.Quaternion();
  function aim(bn,cn,dir){const b=bones[bn],c=bones[cn];if(!b||!c)return;holder.updateMatrixWorld(true);
    b.getWorldPosition(_a);c.getWorldPosition(_b);const cur=_b.sub(_a).normalize();_q.setFromUnitVectors(cur,dir.clone().normalize());
    b.getWorldQuaternion(_wq);b.parent.getWorldQuaternion(_pq);b.quaternion.copy(_pq.invert().multiply(_q.multiply(_wq)));holder.updateMatrixWorld(true);}
  const rest=new Map();sm.skeleton.bones.forEach(b=>rest.set(b,b.quaternion.clone()));
  const resetPose=()=>{for(const [b,q] of rest)b.quaternion.copy(q);holder.updateMatrixWorld(true);};
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  // poses (por código, apuntando huesos): 0 normal, 1 brazos arriba, 2-3 aplauso (abierto/cerrado),
  // 4-5 saludo (mano a un lado y al otro), 6 manos en la cabeza ("¡uy!"), 7 triste (cabizbajo)
  const arms=(l1,l2,r1,r2)=>{aim('LeftArm','LeftForeArm',l1);aim('LeftForeArm','LeftHand',l2);aim('RightArm','RightForeArm',r1);aim('RightForeArm','RightHand',r2);};
  const M=(v)=>V(-v.x,v.y,v.z);   // espejo izquierda→derecha
  const POSES=[
    ()=>arms(V(.55,-.8,.15),V(.45,-.85,.25),M(V(.55,-.8,.15)),M(V(.45,-.85,.25))),
    ()=>arms(V(.8,.6,.12),V(.45,.88,.1),M(V(.8,.6,.12)),M(V(.45,.88,.1))),
    ()=>arms(V(.45,-.35,.8),V(-.1,.15,.95),M(V(.45,-.35,.8)),M(V(-.1,.15,.95))),
    ()=>arms(V(.25,-.3,.9),V(-.65,.1,.7),M(V(.25,-.3,.9)),M(V(-.65,.1,.7))),
    ()=>arms(V(.55,-.8,.15),V(.45,-.85,.25),V(-.65,.75,.1),V(-.75,.6,.1)),
    ()=>arms(V(.55,-.8,.15),V(.45,-.85,.25),V(-.25,1,.1),V(.25,.95,.1)),
    ()=>arms(V(.85,.45,.15),V(-.55,.75,-.05),M(V(.85,.45,.15)),M(V(-.55,.75,-.05))),
    ()=>{arms(V(.2,-1,.15),V(.1,-1,.25),M(V(.2,-1,.15)),M(V(.1,-1,.25)));aim('Spine1','Spine2',V(0,.85,.5));aim('Neck','Head',V(0,.55,.85));}];
  // malla completa en cada pose (sin aligerar: solo se usa para la foto)
  const g=sm.geometry,pa=g.attributes.position,n=pa.count,t=new THREE.Vector3();
  const bake=pose=>{resetPose();pose();const P=new Float32Array(n*3);for(let i=0;i<n;i++){t.fromBufferAttribute(pa,i);sm.boneTransform(i,t);t.applyMatrix4(sm.matrixWorld);P[i*3]=t.x;P[i*3+1]=t.y;P[i*3+2]=t.z;}return P;};
  const geos=POSES.map(p=>{const geo=g.clone();for(const k of ['skinIndex','skinWeight'])geo.deleteAttribute(k);geo.setAttribute('position',new THREE.BufferAttribute(bake(p),3));geo.computeVertexNormals();geo.computeBoundingBox();return geo;});
  const bb=geos[0].boundingBox,hgt=bb.max.y-bb.min.y,cxm=(bb.min.x+bb.max.x)/2,czm=(bb.min.z+bb.max.z)/2;
  // foto: 4 poses × (frente, espalda) en una hoja de 1024×512
  const NP=POSES.length,CW=256,rt=new THREE.WebGLRenderTarget(NP*CW,2*CW,{format:THREE.RGBAFormat});
  const shotScene=new THREE.Scene();shotScene.add(new THREE.HemisphereLight(0xffffff,0x8a7a90,.85));const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(.4,1,.8);shotScene.add(dl);
  const shotMat=new THREE.MeshLambertMaterial({map});const shotMesh=new THREE.Mesh(geos[0],shotMat);shotMesh.position.set(-cxm,-bb.min.y,-czm);shotScene.add(shotMesh);
  const S=hgt*1.25,cam=new THREE.OrthographicCamera(-S/2,S/2,S,0,.01,100);
  const oldTarget=renderer.getRenderTarget(),oldClear=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha(),oldScissor=renderer.getScissorTest();
  renderer.setRenderTarget(rt);renderer.setClearColor(0x000000,0);renderer.clear();
  for(let p=0;p<NP;p++)for(let side=0;side<2;side++){shotMesh.geometry=geos[p];
    const back=side===1,el=.42;cam.position.set(0,hgt*.5+Math.sin(el)*10,(back?-1:1)*Math.cos(el)*10);cam.up.set(0,1,0);cam.lookAt(0,hgt*.5,0);
    cam.top=S*.92;cam.bottom=-S*.08;cam.updateProjectionMatrix();
    rt.viewport.set(p*CW,side*CW,CW,CW);rt.scissor.set(p*CW,side*CW,CW,CW);rt.scissorTest=true;renderer.setRenderTarget(rt);renderer.render(shotScene,cam);}
  rt.scissorTest=false;renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldClear,oldAlpha);renderer.setScissorTest(oldScissor);
  geos.forEach(q=>q.dispose());crowd.atlas=rt.texture;
  // reparte a los hinchas (no todos los asientos; menos en calidad baja)
  const q=(window.save&&save.settings&&save.settings.quality)||'media',fill=q==='baja'?.5:q==='alta'?.9:.75;
  const c=new THREE.Color(),list=[];for(const s of SEATS)if(Math.random()<fill)list.push(s);
  const N=list.length,quad=new THREE.InstancedBufferGeometry();const base=new THREE.PlaneGeometry(1,1);base.translate(0,.5,0);
  quad.index=base.index;quad.setAttribute('position',base.attributes.position);quad.setAttribute('uv',base.attributes.uv);
  const aOff=new Float32Array(N*4),aTeam=new Float32Array(N*3),aSkin=new Float32Array(N*3),aPose=new Float32Array(N);crowd.N=N;
  list.forEach((s,i)=>{aOff[i*4]=s.x+(Math.random()-.5)*.2;aOff[i*4+1]=s.y;aOff[i*4+2]=s.z+(Math.random()-.5)*.15;aOff[i*4+3]=s.ry;
    c.set(pickC(TEAMS)).toArray(aTeam,i*3);c.set(pickC(SKINS)).toArray(aSkin,i*3);aPose[i]=Math.random()<.15?1:0;
    crowd.list.push({i,t:Math.random()*4});});
  quad.setAttribute('aOff',new THREE.InstancedBufferAttribute(aOff,4));quad.setAttribute('aTeam',new THREE.InstancedBufferAttribute(aTeam,3));
  quad.setAttribute('aSkin',new THREE.InstancedBufferAttribute(aSkin,3));const pz=new THREE.InstancedBufferAttribute(aPose,1);pz.setUsage(THREE.DynamicDrawUsage);quad.setAttribute('aPose',pz);
  quad.instanceCount=N;
  crowd.uni={uAtlas:{value:crowd.atlas},uTime:U.uTime,uHype:{value:0},uOla:{value:0},uOlaOn:{value:0},uNP:{value:NP},uSize:{value:HH*1.25},uLight:{value:new THREE.Color(1.05,.98,1.02)},
    fogColor:{value:REAL.fog.color},fogNear:{value:REAL.fog.near},fogFar:{value:REAL.fog.far}};
  const mat=new THREE.ShaderMaterial({uniforms:crowd.uni,transparent:false,
    vertexShader:`attribute vec4 aOff;attribute vec3 aTeam,aSkin;attribute float aPose;uniform float uTime,uHype,uSize,uOla,uOlaOn,uNP;
      varying vec2 vUv;varying vec3 vTeam,vSkin;varying float vFog;
      float h1(float x){return fract(sin(x*127.1)*43758.5);}
      void main(){float ph=h1(aOff.x*3.1+aOff.z*7.7);float sp=.8+h1(aOff.z*1.3+aOff.x)*.6;float A=aPose;
        // animación: 0 normal · 1 aplaudir · 2 saludar · 3 festejar · 4 ¡uy! · 5 triste
        float fr=0.,bob=abs(sin(uTime*sp*2.2+ph*6.28))*.04,jump=0.;
        if(A>.5&&A<1.5){fr=2.+step(.5,fract(uTime*4.5*sp+ph));bob=.02;}
        else if(A>1.5&&A<2.5){fr=4.+step(.5,fract(uTime*2.2*sp+ph));}
        else if(A>2.5&&A<3.5){fr=1.;jump=abs(sin(uTime*(6.+sp*2.)+ph*6.28))*(.55+uHype*.5);}
        else if(A>3.5&&A<4.5){fr=6.;bob=abs(sin(uTime*9.+ph*6.28))*.03;}
        else if(A>4.5){fr=7.;bob=0.;}
        // la ola: pasa alrededor del estadio; quien la tiene se para con los brazos arriba
        float ang=atan(aOff.z,aOff.x);float d=abs(mod(ang-uOla+3.14159,6.28318)-3.14159);float ola=uOlaOn*smoothstep(.45,.05,d);
        if(ola>.35)fr=1.;
        vec3 base=aOff.xyz+vec3(0.,bob+jump+ola*.7,0.);
        vec3 toCam=cameraPosition-base;vec2 tc=normalize(toCam.xz);
        vec3 right=normalize(vec3(tc.y,0.,-tc.x));
        vec2 face=vec2(sin(aOff.w),cos(aOff.w));float back=step(dot(face,tc),-.15);
        vec3 wp=base+right*(position.x*uSize)+vec3(0.,position.y*uSize,0.);
        vUv=vec2((uv.x+fr)/uNP,(uv.y+back)*.5);vTeam=aTeam;vSkin=aSkin;
        vec4 mv=viewMatrix*vec4(wp,1.);vFog=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform sampler2D uAtlas;uniform vec3 uLight,fogColor;uniform float fogNear,fogFar;varying vec2 vUv;varying vec3 vTeam,vSkin;varying float vFog;
      void main(){vec4 t=texture2D(uAtlas,vUv);if(t.a<.5)discard;vec3 c=t.rgb/max(t.a,.001);
        float key=smoothstep(.06,.2,c.b-max(c.r,c.g));float lum=dot(c,vec3(.3,.59,.11));
        float sk=(1.-key)*smoothstep(.05,.15,c.r-c.b)*smoothstep(.45,.7,lum);
        c=mix(c,c*vSkin,sk);c=mix(c,vTeam*clamp(lum*2.3,.35,1.25),key);c*=uLight;
        c=mix(c,fogColor,smoothstep(fogNear,fogFar,vFog));gl_FragColor=vec4(c,1.);}`});
  const m=new THREE.Mesh(quad,mat);m.frustumCulled=false;m.userData.crowd=1;scene.add(m);crowd.mesh=m;crowd.pose=pz;
  console.log('público',N,'hinchas');}
// reacciones del público: 'gol' (festejo), 'uy' (casi gol), 'triste' (gol del rival), 'ola'
const REACT={gol:[[3,.7],[1,.2],[2,.1]],uy:[[4,.75],[0,.25]],triste:[[5,.7],[1,.15],[0,.15]]};
let reactT=0,reactKind=null,olaT=0;
function pickAnim(tbl){let r=Math.random();for(const [a,w] of tbl){if((r-=w)<=0)return a;}return tbl[0][0];}
function crowdReact(kind){if(!crowd.mesh)return;
  if(kind==='ola'){olaT=9;crowd.uni.uOla.value=-Math.PI;return;}
  const tbl=REACT[kind];if(!tbl)return;reactKind=kind;reactT=kind==='gol'?4:kind==='uy'?1.8:3.5;
  const a=crowd.pose.array;for(const h of crowd.list){a[h.i]=pickAnim(tbl);h.t=reactT+Math.random()*.8;}crowd.pose.needsUpdate=true;}
function crowdUpdate(dt,T,gk){if(!crowd.mesh)return;crowd.uni.uHype.value=gk>0?Math.min(1,gk*1.4):0;
  if(olaT>0){olaT-=dt;crowd.uni.uOla.value+=dt*1.6;crowd.uni.uOlaOn.value=Math.min(1,olaT,(9-olaT)*2);}else crowd.uni.uOlaOn.value=0;
  if(reactT>0)reactT-=dt;
  let ch=false;const a=crowd.pose.array;
  for(const h of crowd.list){h.t-=dt;if(h.t>0)continue;h.t=2+Math.random()*5;
    // en calma: casi todos normales, algunos aplauden o saludan
    const r=Math.random();a[h.i]=r<.68?0:r<.82?1:r<.94?2:3;ch=true;}
  if(ch)crowd.pose.needsUpdate=true;}

// ===== cámara y animación =====
let goalT=0;
function update(dt){dt=Math.min(.05,dt);U.uTime.value+=dt;const T=U.uTime.value;
  U.uWind.value=1+(goalT>0?goalT*.8:0);const gk=goalT>0?goalT/2.8:0;if(goalT>0)goalT-=dt;
  glowU.value=1+Math.sin(T*1.7)*.08+gk*.6;
  for(const m of lavaMats){m.map.offset.x+=dt*.03;m.map.offset.y+=dt*.018;m.color.setScalar(1+Math.sin(T*1.7)*.06+gk*.25);}
  for(const g of glows){const fl=1+Math.sin(T*9+g.ph)*.05+Math.sin(T*23+g.ph*2)*.03+gk*.5;g.sp.scale.setScalar(g.base*fl);}
  for(const t of torches)for(const p of t.parts){const k=(T*1.6+p.k)%1;p.sp.position.set(Math.sin(T*7+p.ph)*.08*t.s,k*1.1*t.s,0);p.sp.scale.setScalar((1-k*.7)*(.9+gk*.6)*t.s);p.sp.material.opacity=1-k;}
  hemi.intensity=.42+Math.sin(T*2.1)*.015+gk*.08;
  for(const e of embers){if(e.life<=0){if(emitters.length&&Math.random()<dt*(gk>0?60:12)){const s=pickC(emitters);e.life=1.6+Math.random()*1.6;e.sp.position.set(s.x+(Math.random()-.5)*s.r*2,s.y,s.z+(Math.random()-.5)*s.r*2);e.v=new THREE.Vector3((Math.random()-.5)*.6,1.2+Math.random()*1.6+(s.fire?1:0)+gk*3,(Math.random()-.5)*.6);}else continue;}
    e.life-=dt;e.sp.position.addScaledVector(e.v,dt);e.sp.position.x+=Math.sin(T*3+e.sp.position.y)*dt*.3;e.sp.material.opacity=Math.min(1,e.life)*.95;e.sp.scale.setScalar(.12+Math.min(1,e.life)*.2);}
  for(const a of ashes){a.position.y-=dt*.5;a.position.x+=Math.sin(T*.7+a.position.z)*dt*.4+dt*.3;if(a.position.y<0){a.position.y=18+Math.random()*4;a.position.x=(Math.random()-.5)*90;}}
  for(const s of smokes){if(s.life<=0){const src=Math.random()<.4&&volcanTop?volcanTop:chimneys.length?pickC(chimneys):null;if(src&&Math.random()<dt*(gk>0?10:3)){s.life=6;s.big=src===volcanTop;s.sp.position.set(src.x+(Math.random()-.5)*2,src.y,src.z+(Math.random()-.5)*2);}else continue;}
    s.life-=dt;const k=1-s.life/6;s.sp.position.y+=dt*(1.8+gk*3);s.sp.position.x+=dt*.7;s.sp.scale.setScalar((s.big?6:2)+k*(s.big?16:7));s.sp.material.opacity=Math.sin(k*Math.PI)*.5;}
  crowdUpdate(dt,T,gk);
  scrT-=dt;if(scrT<=0&&screens.length){scrT=.12;drawScreens(T,gk);}
}
build();
try{if(typeof GOAL_STD!=='undefined')GOAL_STD.forEach(m=>{if(m.geometry&&m.geometry.parameters&&m.geometry.parameters.radiusTop>.1)m.visible=false;});}catch(e){}
return {update,onGoal:t=>{goalT=2.8;crowdReact(t===1?'triste':'gol');},crowdReact,roofs:ROOFS};
};
