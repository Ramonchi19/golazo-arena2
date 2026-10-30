window.GZ_ARENAS=window.GZ_ARENAS||{};
window.GZ_ARENAS[13]=function(G){
window.GZ_FIELD_MOTIF='corona';   // v203: grabado en el césped de esta arena

// =====================================================================
// v198: COLISEO DE LAS LEYENDAS — la arena legendaria (piezas de Tripo en assets/arenas/leyendas)
// Mármol blanco, oro y azul real. Dos pisos en todo el estadio: arriba la grada sobre arcadas de coliseo con
// luz dorada; corona de arcadas detrás; el Salón de las Leyendas con el trofeo gigante detrás de la portería rival;
// torres con corona en las esquinas; estatuas doradas; arco del triunfo con la estatua encima; fuegos artificiales.
// =====================================================================
const L=32,HW=16;
const renderer=G.renderer,scene=G.root,REAL=G.scene,camera=G.camera;
// de noche: cielo morado; luz de luna lila, lo cálido son las ventanas y velas
REAL.background=new THREE.Color('#2a1a5a');REAL.fog=new THREE.Fog('#6a3a7a',170,380);
const hemi=new THREE.HemisphereLight(0xd6dcff,0x2a2a40,.78);scene.add(hemi);
const warm=new THREE.HemisphereLight(0xffc870,0x000000,.14);scene.add(warm);
const sun=new THREE.DirectionalLight(0xeef0ff,.62);sun.position.set(-18,44,24);sun.castShadow=true;{const hq=window.save&&save.settings&&save.settings.quality==='alta';sun.shadow.mapSize.set(hq?2048:1024,hq?2048:1024);}   // sombras según la calidad elegida
Object.assign(sun.shadow.camera,{left:-60,right:60,top:44,bottom:-44,near:8,far:140});sun.shadow.bias=-.0004;sun.shadow.normalBias=.045;scene.add(sun);
const pickC=v=>Array.isArray(v)?v[Math.floor(Math.random()*v.length)]:v;
let _env=null;function ENV(){if(_env)return _env;const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
  const r=g.createLinearGradient(0,0,0,256);r.addColorStop(0,'#1a1450');r.addColorStop(.42,'#5a3a9a');r.addColorStop(.5,'#ffb860');r.addColorStop(.56,'#fff0d0');r.addColorStop(.62,'#c88a60');r.addColorStop(1,'#2a2040');g.fillStyle=r;g.fillRect(0,0,512,256);
  const s=g.createRadialGradient(128,128,0,128,128,60);s.addColorStop(0,'rgba(255,240,200,1)');s.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=s;g.fillRect(0,0,512,256);
  const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;try{const pm=new THREE.PMREMGenerator(renderer);_env=pm.fromEquirectangular(t).texture;pm.dispose();}catch(e){_env=null;}return _env;}
const matCache={};
function flat(hex){if(matCache[hex])return matCache[hex];return matCache[hex]=new THREE.MeshLambertMaterial({color:hex,flatShading:true});}
const mesh=(geo,hex)=>{const m=new THREE.Mesh(geo,typeof hex==='string'?flat(hex):hex);m.castShadow=true;m.receiveShadow=true;return m;};
function radTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,inner);r.addColorStop(.35,inner.replace(/[\d.]+\)$/,'0.45)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}

// ===== cielo: domo con degradado, estrellas que titilan y estrellas fugaces =====
const stars=[],shooting=[];
(function(){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,0,256);
  r.addColorStop(0,'#0a0628');r.addColorStop(.4,'#2a1a6a');r.addColorStop(.72,'#8a3a8a');r.addColorStop(.9,'#ff8a4a');r.addColorStop(1,'#ffd28a');g.fillStyle=r;g.fillRect(0,0,16,256);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(280,32,16,0,Math.PI*2,0,Math.PI/2+.12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false,depthWrite:false}));
  dome.position.y=-20;scene.add(dome);
  for(let k=0;k<3;k++){const n=260,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=.12+Math.random()*1.35,R=260;
      pos[i*3]=Math.cos(a)*Math.cos(e)*R;pos[i*3+1]=Math.sin(e)*R-20;pos[i*3+2]=Math.sin(a)*Math.cos(e)*R;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const m=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:[1.6,2.4,3.4][k],sizeAttenuation:false,transparent:true,opacity:.9,fog:false,depthWrite:false}));scene.add(m);stars.push({m,ph:k*2.1});}
  const st=(function(){const c=document.createElement('canvas');c.width=256;c.height=16;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,256,0);r.addColorStop(0,'rgba(255,220,255,0)');r.addColorStop(.85,'rgba(255,230,255,.9)');r.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=r;g.fillRect(0,6,256,4);return new THREE.CanvasTexture(c);})();
  for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(40,1.4),new THREE.MeshBasicMaterial({map:st,transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));scene.add(m);shooting.push({m,t:-Math.random()*8});}})();
// luna grande y pálida
(function(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const gr=g.createRadialGradient(128,128,40,128,128,128);
  gr.addColorStop(0,'rgba(255,245,255,1)');gr.addColorStop(.36,'rgba(240,220,255,1)');gr.addColorStop(.42,'rgba(220,180,255,.35)');gr.addColorStop(1,'rgba(200,150,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  g.fillStyle='rgba(200,180,230,.35)';for(const [x,y,rr] of [[110,105,12],[150,140,9],[120,155,6]]){g.beginPath();g.arc(x,y,rr,0,7);g.fill();}
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false}));sp.position.set(230,140,-70);sp.scale.setScalar(120);scene.add(sp);})();

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
// césped verde con nieve: el mismo pasto, un poco escarchado y con manchones de nieve (más en las orillas)
let GRASS_NIEVE=null;
function snowGrass(){const src=GRASS.image,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
  const W=c.width,H=c.height,PX=W/72;
  const id=g.getImageData(0,0,W,H),d=id.data;for(let k=0;k<d.length;k+=4){const r=d[k],gg=d[k+1],b=d[k+2];if(r>200&&gg>200&&b>190)continue;
    d[k]=r*.86+30;d[k+1]=gg*.88+30;d[k+2]=b*.8+46;}g.putImageData(id,0,0);   // escarcha: verde más frío y claro
  for(let i=0;i<2600;i++){const x=Math.random()*W,y=Math.random()*H,ex=Math.min(x,W-x)/W,ey=Math.min(y,H-y)/H,edge=Math.max(0,1-Math.min(ex*5.5,ey*4.5));
    if(Math.random()>.28+edge*.9)continue;const rr=(.25+Math.random()*1.1)*PX*(1+edge*1.6),a=.16+Math.random()*.3+edge*.35;
    const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(248,252,255,'+a+')');gr.addColorStop(1,'rgba(248,252,255,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
  for(let i=0;i<9000;i++){g.fillStyle='rgba(255,255,255,'+(.25+Math.random()*.45)+')';g.fillRect(Math.random()*W,Math.random()*H,1.5,1.5);}   // copitos sueltos
  lines(g,x=>(x+36)*PX,z=>(z+24)*PX,PX,'rgba(246,250,255,.95)',.25);
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
// modo: 0 = césped verde sin nieve, 1 = césped nevado (el de la Tundra)
function setPiso(mode){mode=mode===true?1:mode===false?0:mode|0;if(mode===1&&!GRASS_NIEVE)GRASS_NIEVE=snowGrass();field.material.map=mode===1?GRASS_NIEVE:GRASS;field.material.needsUpdate=true;}
const setSand=setPiso;
setPiso(0);
// estrella dorada al centro del césped (arena legendaria)
(function(){const src=GRASS.image,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
  const PX=c.width/72,cx=36*PX,cy=24*PX,R=3.9*PX,r=R*.42;g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r:R;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}g.closePath();
  g.fillStyle='rgba(255,212,80,.6)';g.fill();g.lineWidth=PX*.18;g.strokeStyle='rgba(255,250,230,.95)';g.stroke();
  const t=new THREE.CanvasTexture(c);t.anisotropy=renderer.capabilities.getMaxAnisotropy();field.material.map=t;field.material.needsUpdate=true;})();
// piso de afuera: losas oscuras moradas
(function(){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#d8d4cc';g.fillRect(0,0,S,S);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()<.5?'rgba(140,135,125,.25)':'rgba(255,255,255,.3)';g.beginPath();g.arc(Math.random()*S,Math.random()*S,1+Math.random()*5,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(70,70);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(122,96),new THREE.MeshLambertMaterial({map:t}));t.repeat.set(20,16);m.rotation.x=-Math.PI/2;m.position.set(-1,-.04,0);m.material.polygonOffset=true;m.material.polygonOffsetFactor=1;m.material.polygonOffsetUnits=1;m.receiveShadow=true;scene.add(m);})();

// ===== mármol blanco por código (bases, escaleras, muros) =====
function blockTex(rows,cols,seed){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#a8a296';g.fillRect(0,0,256,256);
  const bh=256/rows;for(let r=0;r<rows;r++){const off=(r%2)*(256/cols/2),bw=256/cols;for(let k=-1;k<=cols;k++){const x=k*bw+off,y=r*bh,v=(Math.random()-.5)*22;
    g.fillStyle=`rgb(${236+v*.4|0},${232+v*.4|0},${222+v*.4|0})`;g.fillRect(x+3,y+3,bw-6,bh-6);
    g.fillStyle='rgba(255,255,255,.4)';g.fillRect(x+3,y+3,bw-6,5);g.fillStyle='rgba(120,110,100,.18)';g.fillRect(x+3,y+bh-8,bw-6,5);
    for(let s=0;s<3;s++){g.fillStyle=Math.random()<.5?'rgba(150,145,140,.14)':'rgba(255,255,255,.2)';g.beginPath();g.arc(x+Math.random()*bw,y+Math.random()*bh,4+Math.random()*10,0,7);g.fill();}}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const BT=blockTex(4,3);
// material de bloques con UV por posición en el mundo (los bloques salen del mismo tamaño en cualquier caja)
const stoneMat=new THREE.MeshLambertMaterial({map:BT});
stoneMat.onBeforeCompile=sh=>{sh.vertexShader='varying float vSnow;\n'+sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
  vec4 wpU=modelMatrix*vec4(position,1.);vec3 nW=normalize(mat3(modelMatrix)*normal);
  vec2 uvW=abs(nW.y)>.7?wpU.xz:(abs(nW.x)>abs(nW.z)?wpU.zy:wpU.xy);vUv=uvW/vec2(3.6,2.4);vSnow=smoothstep(.55,.85,nW.y);`);
  sh.fragmentShader='varying float vSnow;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb*=1.+vSnow*.12;');};
stoneMat.customProgramCacheKey=()=>'leyMarble';
// franja de madera tallada con nudo vikingo
const zig=(function(){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#5a3a22';g.fillRect(0,0,256,64);
  g.strokeStyle='#bfe3f6';g.lineWidth=5;for(let x=0;x<256;x+=64){g.beginPath();g.moveTo(x,32);g.bezierCurveTo(x+16,4,x+48,60,x+64,32);g.stroke();g.beginPath();g.moveTo(x,32);g.bezierCurveTo(x+16,60,x+48,4,x+64,32);g.stroke();}
  g.fillStyle='#3a2414';g.fillRect(0,0,256,5);g.fillRect(0,59,256,5);
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t;})();
function box(w,h,d,x,y,z,ry){const m=mesh(new THREE.BoxGeometry(w,h,d),stoneMat);m.position.set(x,y,z);m.rotation.y=ry||0;scene.add(m);return m;}
// franja tallada en zigzag (sobre una cara)
function zigBand(len,x,y,z,ry){const t=zig.clone();t.needsUpdate=true;t.repeat.set(len/3.2,1);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(len,.7),new THREE.MeshLambertMaterial({map:t,polygonOffset:true,polygonOffsetFactor:-2}));m.position.set(x,y,z);m.rotation.y=ry||0;scene.add(m);return m;}
// nicho con brasero encendido (cuadro brillante metido en la pared)
const NICHE=new THREE.MeshBasicMaterial({color:'#ffb35a'}),NICHE_D=new THREE.MeshLambertMaterial({color:'#3a2a20'}),glows=[];
const GLOW=radTex('rgba(255,200,110,1)','rgba(255,140,40,0)');
function niche(x,y,z,ry){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;scene.add(g);
  const fr=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.05,.12),NICHE_D);g.add(fr);const f=new THREE.Mesh(new THREE.PlaneGeometry(.8,.7),NICHE);f.position.z=.07;g.add(f);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.34,.2,.22,10),NICHE_D);bowl.position.set(0,-.25,.18);g.add(bowl);
  fire(g,0,-.05,.22,.6);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));sp.scale.setScalar(2.4);sp.position.z=.4;g.add(sp);glows.push({sp,ph:Math.random()*6});}

// ===== piezas de Tripo =====
const DIR='assets/arenas/leyendas/';
const loader=new THREE.GLTFLoader(),GM={};
const loadG=n=>new Promise(res=>loader.load(DIR+n+'.glb?v=203',g=>{GM[n]=g;res();},undefined,e=>{console.warn('falta',n,e);res();}));
function arenaMat(src){const map=src.map||null;if(map){map.encoding=THREE.LinearEncoding;map.anisotropy=4;map.needsUpdate=true;}
  const m=new THREE.MeshLambertMaterial({map,color:0xffffff});
  m.onBeforeCompile=sh=>{sh.uniforms.uWin=winU;sh.fragmentShader='uniform float uWin;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      {vec3 c=diffuseColor.rgb;float lit=smoothstep(.72,.9,min(c.r,c.g))*smoothstep(.12,.3,c.g-c.b);
       float pink=smoothstep(.6,.85,c.r)*smoothstep(.1,.28,c.r-c.g)*smoothstep(.4,.6,c.b);
       float teal=smoothstep(.45,.75,c.g)*smoothstep(.12,.3,c.g-c.r)*smoothstep(.4,.6,c.b);
       totalEmissiveRadiance+=c*(lit*.8+pink*.95*uWin+teal*.8+.07);}`);};
  m.customProgramCacheKey=()=>'leyMat';return m;}
const winU={value:1};
const PREP={},FACE={},TRIM={};
function prep(n){if(PREP[n])return PREP[n];const g=GM[n];if(!g)return null;const s=g.scene;s.rotation.y=TRIM[n]||0;
  const mats=new Map();s.traverse(o=>{if(o.isMesh){if(!mats.has(o.material))mats.set(o.material,arenaMat(o.material));o.material=mats.get(o.material);o.castShadow=true;o.receiveShadow=true;}});
  s.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(s);return PREP[n]={s,box,size:box.getSize(new THREE.Vector3()),fires:findFires(s,box)};}
// quita de un modelo las piezas (partes conectadas) que son casi todas de cierto color de la textura
function cutColor(s,pred){try{s.traverse(o=>{if(!o.isMesh||!o.material.map||!o.material.map.image)return;const img=o.material.map.image,cv=document.createElement('canvas');cv.width=cv.height=256;
  const g=cv.getContext('2d');g.drawImage(img,0,0,256,256);const px=g.getImageData(0,0,256,256).data,geo=o.geometry,uv=geo.attributes.uv,pa=geo.attributes.position;if(!uv)return;
  const col=i=>{let u=uv.getX(i)%1,w=uv.getY(i)%1;if(u<0)u+=1;if(w<0)w+=1;const k=(Math.floor(w*255)*256+Math.floor(u*255))*4;return pred(px[k],px[k+1],px[k+2]);};
  // vértices iguales por posición (las costuras de UV los duplican) → unión de piezas conectadas
  const vid=new Int32Array(pa.count),map=new Map();for(let i=0;i<pa.count;i++){const k=Math.round(pa.getX(i)*1e4)+','+Math.round(pa.getY(i)*1e4)+','+Math.round(pa.getZ(i)*1e4);if(!map.has(k))map.set(k,map.size);vid[i]=map.get(k);}
  const par=new Int32Array(map.size).map((_,i)=>i),find=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;},uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b;};
  const idx=geo.index?geo.index.array:null,cnt=idx?idx.length:pa.count,T=i=>idx?idx[i]:i;
  for(let t=0;t<cnt;t+=3){uni(vid[T(t)],vid[T(t+1)]);uni(vid[T(t+1)],vid[T(t+2)]);}
  const tot=new Map(),hit=new Map();for(let t=0;t<cnt;t+=3){const c=find(vid[T(t)]),h=((col(T(t))?1:0)+(col(T(t+1))?1:0)+(col(T(t+2))?1:0))>=2;tot.set(c,(tot.get(c)||0)+1);if(h)hit.set(c,(hit.get(c)||0)+1);}
  const keep=[];for(let t=0;t<cnt;t+=3){const c=find(vid[T(t)]),n=tot.get(c);if(n>20&&(hit.get(c)||0)/n>.35)continue;keep.push(T(t),T(t+1),T(t+2));}
  const g2=geo.clone();g2.setIndex(keep);g2.clearGroups();o.geometry=g2;});}catch(e){console.warn('cutColor',e);}}
// colmillo de mamut: tubo curvo que se va afilando, color marfil con anillos
const IVORY=(function(){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');const r=g.createLinearGradient(0,0,0,256);r.addColorStop(0,'#cdb88e');r.addColorStop(.5,'#efe2c2');r.addColorStop(1,'#fbf4e2');g.fillStyle=r;g.fillRect(0,0,16,256);
  for(let y=6;y<256;y+=14+Math.random()*10){g.fillStyle='rgba(150,120,80,.22)';g.fillRect(0,y,16,2);}return new THREE.CanvasTexture(c);})();
function tusk(pts,r0,r1){const curve=new THREE.CatmullRomCurve3(pts),N=40,M=12,pos=[],uv=[],idx=[];
  for(let i=0;i<=N;i++){const t=i/N,p=curve.getPointAt(t),T=curve.getTangentAt(t),Nn=new THREE.Vector3(0,0,1).cross(T).normalize(),B=T.clone().cross(Nn).normalize(),r=r0+(r1-r0)*Math.pow(t,1.3);
    for(let j=0;j<=M;j++){const a=j/M*Math.PI*2,v=Nn.clone().multiplyScalar(Math.cos(a)*r).add(B.clone().multiplyScalar(Math.sin(a)*r)).add(p);pos.push(v.x,v.y,v.z);uv.push(j/M,t);}
    if(i<N)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;idx.push(a,b,a+1,b,b+1,a+1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:IVORY}));m.castShadow=true;m.receiveShadow=true;return m;}
// par de colmillos enormes que se cruzan por encima del portón (en coordenadas de la tribuna: u a lo largo, z hacia afuera)
function tusks(g,cu,zFront,w,H){for(const e of [-1,1]){const V=(u,y,z)=>new THREE.Vector3(cu+e*u,y,zFront+z);
    const m=tusk([V(w/2,0,.4),V(w/2+1.3,H*.45,-.8),V(w*.36,H*1.12,-1.9),V(-w*.06,H*1.42,-1.5),V(-w*.3,H*1.36,-.3)],.95,.1);g.add(m);
    // base de piedra y nieve donde nace cada colmillo
    const b=new THREE.Mesh(new THREE.CylinderGeometry(1,1.15,1,10),stoneMat);b.position.set(cu+e*w/2,.5,zFront+.4);b.castShadow=true;g.add(b);}}
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
  wrap.scale.set(o.w?o.w/W0:k,o.h?o.h/H0:k,o.d?o.d/D0:k);wrap.position.set(o.x||0,o.y||0,o.z||0);wrap.rotation.y=o.ry||0;scene.add(wrap);(CAT[n]=CAT[n]||[]).push(wrap);
  // fuego de verdad sobre los braseros del modelo (tamaño parejo aunque la pieza esté estirada)
  if(P.fires&&P.fires.length&&o.fire!==false&&!/grada/.test(n)){   // en las gradas el fuego ya viene pintado: sin partículas (mucho más ligero)
    const sx=wrap.scale.x,sy=wrap.scale.y,sz=wrap.scale.z;
    for(const f of P.fires){const g=fire(inner,f.x,f.y,f.z,.8/Math.min(sx,sy,sz));g.scale.set(Math.min(sx,sy,sz)/sx,Math.min(sx,sy,sz)/sy,Math.min(sx,sy,sz)/sz);}}
  return wrap;}
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
// filas de asiento medidas en la grada (f = fondo desde el frente, h = fracción del alto)
const ROWS=[[.2,.36],[.4,.52],[.6,.68],[.78,.82]],SEATS=[];
function seats(cx,cz,y0,ry,W,D,H){const cs=Math.cos(ry),sn=Math.sin(ry);for(const [f,h] of ROWS){const lz=D/2-f*D;for(let lx=-W/2+.9;lx<=W/2-.7;lx+=1.45)SEATS.push({x:cx+lx*cs+lz*sn,y:y0+h*H,z:cz-lx*sn+lz*cs,ry});}}
function grada(cx,cz,y0,ry,W,D,H){place('leyendas_grada',{x:cx,z:cz,y:y0,ry,w:W,d:D,h:H});seats(cx,cz,y0,ry,W,D,H);}
// grada doblada 90° para las esquinas
function bentStand(C,a0,r,D,H){const P=prep('leyendas_grada');if(!P)return;const g=new THREE.Group();
  const src=P.s.clone(true);const c=P.box.getCenter(new THREE.Vector3());src.position.set(-c.x,-P.box.min.y,-c.z);const tmp=new THREE.Group();tmp.add(src);tmp.updateMatrixWorld(true);
  const W0=P.size.x,D0=P.size.z,H0=P.size.y,v=new THREE.Vector3();
  src.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo=tessellate(geo,W0/36);const pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);const t=(v.x+W0/2)/W0,back=(D0/2-v.z)/D0*D,th=a0+t*Math.PI/2,rr=r+back;pa.setXYZ(i,C.x+Math.cos(th)*rr,v.y/H0*H,C.z+Math.sin(th)*rr);}
    geo.computeVertexNormals();geo.computeBoundingSphere();const m=new THREE.Mesh(geo,o.material);m.castShadow=true;m.receiveShadow=true;g.add(m);});
  scene.add(g);CAT.esqAbajo.push(g);for(const [f,h] of ROWS){const rr=r+f*D,cnt=Math.max(1,Math.floor(rr*Math.PI/2/1.45));for(let k=0;k<cnt;k++){const th=a0+(k+.5)/cnt*Math.PI/2;SEATS.push({x:C.x+Math.cos(th)*rr,y:h*H,z:C.z+Math.sin(th)*rr,ry:Math.atan2(-Math.cos(th),-Math.sin(th))});}}}

// ===== escalera con muros a los lados (los "bordes") =====
// u = eje a lo largo de la tribuna; la escalera sube de la orilla de la cancha (z0, piso) hacia atrás (z1, alto top)
// sideZ: +1/-1 lado de la tribuna; todo se arma en coordenadas locales y se gira con la tribuna
function sideWall(g,u,z0,z1,top,th,extra){const sh=new THREE.Shape();const lip=1.1;
  sh.moveTo(z0-.35,0);sh.lineTo(z0-.35,lip);sh.lineTo(z1,top+lip);sh.lineTo(z1+(extra||0),top+lip);sh.lineTo(z1+(extra||0),0);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1});geo.translate(0,0,-th/2);
  const m=new THREE.Mesh(geo,stoneMat);m.castShadow=m.receiveShadow=true;m.rotation.y=-Math.PI/2;m.position.x=u;g.add(m);
  // tapa de bloques arriba del muro (como en la referencia)
  const len=Math.hypot(z1-z0+.35,top),cap=new THREE.Mesh(new THREE.BoxGeometry(th+.25,.32,len+.2),stoneMat);cap.castShadow=true;
  cap.position.set(u,(lip+top+lip)/2+.12,(z0-.35+z1)/2);cap.rotation.x=-Math.atan2(top,z1-z0+.35);g.add(cap);CAT.bordes.push(m,cap);
  if(extra){const c2=new THREE.Mesh(new THREE.BoxGeometry(th+.25,.32,extra+.1),stoneMat);c2.position.set(u,top+lip+.12,z1+extra/2);g.add(c2);CAT.bordes.push(c2);}
  return m;}
function stairs(g,u,w,z0,z1,top){const n=Math.max(6,Math.round(top/.42)),dz=(z1-z0)/n;
  for(let i=0;i<n;i++){const h=(i+1)*top/n,s=new THREE.Mesh(new THREE.BoxGeometry(w,h,dz+.02),stoneMat);s.position.set(u,h/2,z0+dz*(i+.5));s.castShadow=s.receiveShadow=true;g.add(s);}}

// ===== cascada congelada (hielo con brillo que corre despacio, carámbanos arriba y cristales abajo) =====
const sandFalls=[],dust=[],sparkles=[];
const SPARK=radTex('rgba(230,250,255,1)','rgba(160,220,255,0)');
function iceFallTex(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(150,210,240,.25)');gr.addColorStop(.2,'rgba(190,232,252,.9)');gr.addColorStop(.8,'rgba(190,232,252,.9)');gr.addColorStop(1,'rgba(150,210,240,.25)');
  g.fillStyle=gr;g.fillRect(0,0,64,256);for(let i=0;i<50;i++){g.strokeStyle=Math.random()<.6?'rgba(255,255,255,.6)':'rgba(90,150,200,.35)';g.lineWidth=1+Math.random()*3;const x=6+Math.random()*52;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+4,80,x-4,170,x+2,256);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function crystal(x,z,s,ry){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry||0;scene.add(g);
  const mat=new THREE.MeshLambertMaterial({color:'#a9dcf6',emissive:'#1b4f7a',transparent:true,opacity:.88,flatShading:true});
  for(let i=0;i<5;i++){const h=(1.2+Math.random()*2.4)*s,m=new THREE.Mesh(new THREE.CylinderGeometry(0,.38*s,h*.35,6),mat),b=new THREE.Mesh(new THREE.CylinderGeometry(.38*s,.42*s,h*.65,6),mat);
    const k=new THREE.Group();b.position.y=h*.325;m.position.y=h*.65+h*.175;k.add(b,m);k.position.set((Math.random()-.5)*1.6*s,0,(Math.random()-.5)*1.6*s);k.rotation.set((Math.random()-.5)*.6,0,(Math.random()-.5)*.6);g.add(k);}
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARK,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sp.position.y=2.4*s;sp.scale.setScalar(1.4*s);g.add(sp);sparkles.push({sp,ph:Math.random()*6});return g;}
function iceFall(x,yTop,z,w,face){const t=iceFallTex();t.repeat.set(1,yTop/6);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,yTop,1,6),new THREE.MeshLambertMaterial({map:t,transparent:true,emissive:'#123a5a',side:THREE.DoubleSide}));
  const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=p.getY(i)/yTop+.5;p.setZ(i,Math.sin(v*Math.PI)*.6);}m.geometry.computeVertexNormals();
  m.position.set(x,yTop/2,z);m.rotation.y=face;scene.add(m);sandFalls.push(t);
  const ic=new THREE.MeshLambertMaterial({color:'#d8f0ff',emissive:'#1b4f7a',transparent:true,opacity:.92});
  for(let i=0;i<7;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.18+Math.random()*.12,.8+Math.random()*1.2,6),ic);c.rotation.x=Math.PI;const u=(i/6-.5)*w*.9;
    c.position.set(x+Math.cos(face)*u,yTop-.5,z-Math.sin(face)*u);scene.add(c);}
  crystal(x,z,1.2,face);
  for(let i=0;i<8;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARK,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));scene.add(sp);dust.push({sp,x,z,w,y:yTop,life:Math.random()*2});}}
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
function tileTex(up){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=up?'#1d4f7a':'#5a3a22';g.fillRect(0,0,64,64);g.strokeStyle='#3a2414';g.lineWidth=6;g.strokeRect(3,3,58,58);
  g.strokeStyle='#eaf7ff';g.lineWidth=4;g.lineCap='round';for(let k=0;k<3;k++){const a=k*Math.PI/3;g.beginPath();g.moveTo(32-Math.cos(a)*20,32-Math.sin(a)*20);g.lineTo(32+Math.cos(a)*20,32+Math.sin(a)*20);g.stroke();}
  return new THREE.CanvasTexture(c);}
function goal(s){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},X=s*L,P=.75,g=new THREE.Group();scene.add(g);
  for(const z of [-C.GW-P/2,C.GW+P/2]){let y=0;for(const [w,h] of [[.95,1.15],[.82,1.1],[.88,C.GH-2.25]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),stoneMat);b.position.set(X+s*.1,y+h/2,z);b.castShadow=true;g.add(b);y+=h;}}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.9,.85,2*C.GW+2*P+.3),stoneMat);bar.position.set(X+s*.1,C.GH+.42,0);bar.castShadow=true;g.add(bar);
  [true,false,true].forEach((up,i)=>{const t=new THREE.Mesh(new THREE.PlaneGeometry(.95,.68),new THREE.MeshBasicMaterial({map:tileTex(up)}));t.position.set(X+s*.1-s*.46,C.GH+.42,(i-1)*1.25);t.rotation.y=-s*Math.PI/2;g.add(t);});}
function drawNets(){const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},D=2.2,HB=C.GH*.72;
  const t=CHAIN;
  const mat=new THREE.MeshBasicMaterial({map:t,color:0xffffff,transparent:true,alphaTest:.25,side:THREE.DoubleSide,depthWrite:false});
  const panel=(w,h,x,y,z,ry,rx)=>{const gg=new THREE.PlaneGeometry(w,h),uv=gg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.9,uv.getY(i)*h/.9);
    const m=new THREE.Mesh(gg,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry,0,'YXZ');scene.add(m);};
  for(const s of [-1,1]){const X=s*L;panel(2*C.GW,HB,X+s*D,HB/2,0,Math.PI/2);
    panel(2*C.GW,Math.hypot(D,C.GH-HB),X+s*D/2,(C.GH+HB)/2,0,Math.PI/2,Math.atan2(s*D,-(C.GH-HB)));
    for(const z of [-C.GW,C.GW])panel(D,(C.GH+HB)/2,X+s*D/2,(C.GH+HB)/4,z,0);}}
// banderines verdes (tela que ondea)
const flags=[];
function banner(x,y,z,ry){const c=document.createElement('canvas');c.width=64;c.height=96;const g=c.getContext('2d');g.fillStyle='#2a3fa8';g.fillRect(0,0,64,96);g.fillStyle='#d4a92e';g.fillRect(0,0,64,8);g.fillRect(0,88,64,8);
  g.fillStyle='#ffd86a';g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?7:16;g.lineTo(32+Math.cos(a)*rr,46+Math.sin(a)*rr);}g.closePath();g.fill();
  const geo=new THREE.PlaneGeometry(1.1,1.7,1,6);const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));
  m.position.set(x,y,z);m.rotation.y=ry;m.userData.anim=1;scene.add(m);flags.push({m,base:geo.attributes.position.array.slice(),ph:Math.random()*6});
  const pole=mesh(new THREE.CylinderGeometry(.06,.06,2.2,6),'#d4a92e');pole.position.set(x,y+.2,z);scene.add(pole);}

// ===== montañas nevadas alrededor de todo el estadio (roca gris-azul abajo, nieve arriba) =====
function canyon(){const HX=96,HZ=80,R=34,pts=[];   // contorno: rectángulo de esquinas redondas
  const seg=(x0,z0,x1,z1,n)=>{for(let i=0;i<n;i++){const t=i/n;pts.push([x0+(x1-x0)*t,z0+(z1-z0)*t]);}};
  const arc=(cx,cz,a0,n)=>{for(let i=0;i<n;i++){const a=a0-i/n*Math.PI/2;pts.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R]);}};
  seg(HX-R,-HZ,-(HX-R),-HZ,40);arc(-(HX-R),-(HZ-R),-Math.PI/2,10);seg(-HX,-(HZ-R),-HX,HZ-R,24);arc(-(HX-R),HZ-R,Math.PI,10);
  seg(-(HX-R),HZ,HX-R,HZ,40);arc(HX-R,HZ-R,Math.PI/2,10);seg(HX,HZ-R,HX,-(HZ-R),24);arc(HX-R,-(HZ-R),0,10);
  const N=pts.length,M=14,ph=[...Array(8)].map(()=>Math.random()*6.28);
  const nz=(t,k)=>Math.sin(t*6.28*3+ph[k])*.5+Math.sin(t*6.28*7+ph[k+1])*.3+Math.sin(t*6.28*17+ph[k+2])*.2;
  const pos=[],col=[],idx=[];const rock=['#1c2450','#222c5c','#18204a','#283466'],snowC=['#3a4880','#44528c','#344278','#4c5a96'];
  for(let i=0;i<=N;i++){const a=pts[i%N],b=pts[(i+1)%N],t=i/N;let nx=-(b[1]-a[1]),nzv=b[0]-a[0];const ln=Math.hypot(nx,nzv)||1;nx/=ln;nzv/=ln;
    // normal hacia adentro (el contorno va al revés de las manecillas visto desde arriba)
    const top=46+nz(t,0)*14+Math.max(0,nz(t*1.7,3))*22;
    for(let j=0;j<=M;j++){const v=j/M,y=v*top;
      // salientes en capas: la pared se mete y sale con la altura, más rugosa arriba
      const d=nz(t*2+v*.7,1)*2.2+Math.sin(v*Math.PI*5+t*40)*.9+(v>.85?nz(t*3,4)*2:0)-v*3;
      pos.push(a[0]-nx*d,y,a[1]-nzv*d);
      const sn=v>.45+nz(t*2,5)*.18||(d>1.2&&v>.2);const c=new THREE.Color(pickC(sn?snowC:rock));const sh=.9+Math.random()*.16;col.push(c.r*sh,c.g*sh,c.b*sh);}}
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=(i+1)*(M+1)+j;idx.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);
  const g2=geo.toNonIndexed();g2.computeVertexNormals();
  const m=new THREE.Mesh(g2,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}));m.receiveShadow=true;scene.add(m);
  // rocas sueltas al pie del cañón
  for(let i=0;i<70;i++){const q=pts[Math.floor(Math.random()*N)],r=mesh(new THREE.DodecahedronGeometry(1.2+Math.random()*2.6,0),pickC(['#1c2450','#222c5c','#18204a']));
    r.position.set(q[0]*(.94+Math.random()*.03),.4,q[1]*(.93+Math.random()*.03));r.rotation.set(Math.random()*3,Math.random()*3,0);r.scale.y=.7;scene.add(r);}}

// escudo vikingo redondo en la pared (de colores)
const SH_COL=[['#c9473a','#f2d27a'],['#2f5f9a','#eaf7ff'],['#e8a23a','#5a3a22'],['#3e8a62','#f2d27a']];
function shield(x,y,z,ry,k){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);const c=SH_COL[k%SH_COL.length];
  const d=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.14,18),flat(c[0]));d.rotation.x=Math.PI/2;d.position.z=.07;g.add(d);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.85,.08,6,20),flat('#6b5a4a'));rim.position.z=.15;g.add(rim);
  for(const a of [0,Math.PI/2]){const b=new THREE.Mesh(new THREE.BoxGeometry(1.6,.18,.05),flat(c[1]));b.rotation.z=a+Math.PI/4;b.position.z=.16;g.add(b);}
  const boss=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),flat('#9aa3ad'));boss.position.z=.2;g.add(boss);}
// remate de muro: viga de madera oscura con picos de hierro victorianos
const WOODM=new THREE.MeshLambertMaterial({color:'#d4a92e',emissive:'#3a2a08'}),IRONM=new THREE.MeshLambertMaterial({color:'#f2c94c',emissive:'#4a3408'});   // remate dorado
const capGeo=(len,d)=>new THREE.BoxGeometry(len,.35,d+.25);
function merlons(g,u0,u1,y,z,d){const len=u1-u0,b=new THREE.Mesh(capGeo(len,d),WOODM);b.position.set((u0+u1)/2,y+.17,z);g.add(b);CAT.vigas.push(b);
  for(let k=0;k<Math.max(2,Math.round(len/1.2));k++){const sp=new THREE.Mesh(new THREE.ConeGeometry(.09,.7,5),IRONM);sp.position.set(u0+.4+k*(len-.8)/Math.max(1,Math.round(len/1.2)-1),y+.7,z);g.add(sp);CAT.vigas.push(sp);}}
// puerta grande de madera con herrajes
const DOOR=(function(){const c=document.createElement('canvas');c.width=128;c.height=160;const g=c.getContext('2d');g.fillStyle='#5a3a22';g.fillRect(0,0,128,160);
  for(let x=0;x<128;x+=16){g.fillStyle=x%32?'#6b4628':'#4e321d';g.fillRect(x+1,0,14,160);}
  g.fillStyle='#3b3f46';for(const y of [26,80,134]){g.fillRect(0,y,128,9);for(let x=8;x<128;x+=20){g.beginPath();g.arc(x,y+4.5,3,0,7);g.fillStyle='#9aa3ad';g.fill();g.fillStyle='#3b3f46';}}
  g.fillStyle='#2a1a10';g.fillRect(62,0,4,160);g.strokeStyle='#9aa3ad';g.lineWidth=4;for(const x of [50,78]){g.beginPath();g.arc(x,92,8,0,7);g.stroke();}
  return new THREE.CanvasTexture(c);})();
function gateDoor(g,u,y,z,w,h){const d=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:DOOR}));d.position.set(u,y+h/2,z);d.rotation.y=Math.PI;g.add(d);
  const fr=new THREE.Mesh(new THREE.BoxGeometry(w+.6,.5,.5),flat('#3a2414'));fr.position.set(u,y+h+.25,z-.1);g.add(fr);}
// torre de guardia cuadrada de hielo con almenas, aspilleras y punta de cristal
function guardTower(g,u,z,H,s){const w=4.2*(s||1),t=new THREE.Mesh(new THREE.BoxGeometry(w,H,w),stoneMat);t.position.set(u,H/2,z);t.castShadow=t.receiveShadow=true;g.add(t);
  const cr=new THREE.Mesh(new THREE.BoxGeometry(w+.8,1,w+.8),stoneMat);cr.position.set(u,H+.5,z);g.add(cr);
  for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1.1,1),stoneMat);m.position.set(u+a*(w/2),H+1.55,z+b*(w/2));g.add(m);}
  const tip=new THREE.Mesh(new THREE.ConeGeometry(w*.42,w*1.1,6),new THREE.MeshLambertMaterial({color:'#a9dcf6',emissive:'#1b4f7a',flatShading:true,transparent:true,opacity:.92}));tip.position.set(u,H+1.1+w*.55,z);g.add(tip);
  const sl=flat('#0e1a2a');for(const y of [H*.45,H*.72]){const a=new THREE.Mesh(new THREE.PlaneGeometry(.35,1.3),sl);a.position.set(u,y,z-w/2-.02);a.rotation.y=Math.PI;g.add(a);}}
// río congelado entre la cancha y las gradas largas: hielo con grietas encima y una corriente oscura que se mueve debajo
let riverT=null;
function frozenRiver(){const z0=HW+1.9,z1=ZS-.35,zc=(z0+z1)/2,w=z1-z0,X=X0;
  const under=(function(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle='#1f5d8c';g.fillRect(0,0,64,256);
    for(let i=0;i<40;i++){g.strokeStyle='rgba(120,200,240,'+(.2+Math.random()*.3)+')';g.lineWidth=2+Math.random()*3;const y=Math.random()*256,x=Math.random()*64;g.beginPath();g.moveTo(x,y);g.lineTo(x+8+Math.random()*12,y+3);g.stroke();}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();riverT=under;under.repeat.set(1,2*X/6);
  const top=(function(){const c=document.createElement('canvas');c.width=128;c.height=512;const g=c.getContext('2d');g.fillStyle='rgba(200,236,252,.55)';g.fillRect(0,0,128,512);
    for(let i=0;i<30;i++){g.strokeStyle='rgba(255,255,255,'+(.4+Math.random()*.4)+')';g.lineWidth=1+Math.random()*1.5;let x=Math.random()*128,y=Math.random()*512;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(Math.random()-.5)*40;y+=(Math.random()-.5)*40;g.lineTo(x,y);}g.stroke();}
    for(let i=0;i<25;i++){g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(Math.random()*128,Math.random()*512,4+Math.random()*14,3+Math.random()*8,Math.random()*3,0,7);g.fill();}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();top.repeat.set(1,2*X/10);
  for(const side of [-1,1]){
    const a=new THREE.Mesh(new THREE.PlaneGeometry(w,2*X),new THREE.MeshLambertMaterial({map:under,emissive:0x0a2a48,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));a.rotation.set(-Math.PI/2,0,Math.PI/2);a.position.set(0,.06,side*zc);scene.add(a);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(w,2*X),new THREE.MeshLambertMaterial({map:top,transparent:true,emissive:0x16405e,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));b.rotation.set(-Math.PI/2,0,Math.PI/2);b.position.set(0,.1,side*zc);scene.add(b);
    for(const e of [-1,1]){const k=mesh(new THREE.BoxGeometry(2*X+.4,.4,.42),stoneMat);k.position.set(0,.18,side*(zc+e*(w/2+.15)));scene.add(k);}
    for(const x of [-X,X]){const k=mesh(new THREE.BoxGeometry(.42,.4,w+.7),stoneMat);k.position.set(x,.18,side*zc);scene.add(k);}}}

// red dorada de rombos
const CHAIN=(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='#ffe08a';g.lineWidth=4;g.beginPath();g.moveTo(0,32);g.lineTo(32,0);g.lineTo(64,32);g.lineTo(32,64);g.closePath();g.stroke();
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
// grupos para poder esconder piezas y encontrar cuál es cuál
const CAT={balcon:[],estructura:[],vigas:[],esquina:[],bordes:[],esqAbajo:[]};
function ver(cat,on){for(const o of (CAT[cat]||[]))if(o)o.visible=on;}
// ===== valla de hexágonos morados que brilla alrededor de la cancha (como la referencia) =====
const hexT=(function(){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.clearRect(0,0,128,64);
  g.strokeStyle='rgba(220,140,255,.95)';g.lineWidth=3;const R=9,hx=R*Math.sqrt(3);
  for(let row=-1;row<6;row++)for(let col=-1;col<9;col++){const cx=col*hx+(row%2?hx/2:0),cy=row*R*1.5;g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);}g.closePath();g.stroke();}
  const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(190,90,255,.05)');gr.addColorStop(1,'rgba(190,90,255,.35)');g.fillStyle=gr;g.fillRect(0,0,128,64);
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t;})();
const fenceMat=new THREE.MeshBasicMaterial({map:hexT,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
function hexFence(){const C=(window.SIM&&SIM.C)||{GW:4.8},HX=L+2.8,HZ=HW+2.2,Rc=CR+.6,cx=HX-Rc,cz=HZ-Rc,pts=[];
  const seg=(x0,z0,x1,z1,n)=>{for(let i=0;i<n;i++){const t=i/n;pts.push([x0+(x1-x0)*t,z0+(z1-z0)*t]);}};
  const arc=(ax,az,a0,n)=>{for(let i=0;i<n;i++){const a=a0+i/n*Math.PI/2;pts.push([ax+Math.cos(a)*Rc,az+Math.sin(a)*Rc]);}};
  seg(HX,-cz,HX,cz,16);arc(cx,cz,0,8);seg(cx,HZ,-cx,HZ,40);arc(-cx,cz,Math.PI/2,8);seg(-HX,cz,-HX,-cz,16);arc(-cx,-cz,Math.PI,8);seg(-cx,-HZ,cx,-HZ,40);arc(cx,-cz,Math.PI*1.5,8);
  const H=1.3;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    if(Math.abs(Math.abs(mx)-HX)<.01&&Math.abs(mz)<C.GW+1.2)continue;   // la boca de las porterías queda libre
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const gg=new THREE.PlaneGeometry(len+.02,H),uv=gg.attributes.uv;for(let k=0;k<uv.count;k++)uv.setX(k,uv.getX(k)*len/4);
    const m=new THREE.Mesh(gg,fenceMat);m.position.set(mx,H/2+.02,mz);m.rotation.y=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);scene.add(m);}
  // franja de luz en el piso al pie de la valla
}

// ===== fuegos artificiales y confeti dorado =====
const ghosts=[],bats=[],fogs=[],sparksF=[],confetti=[];
const SPARKF=radTex('rgba(255,255,255,1)','rgba(255,255,255,0)');
function firework(x,y,z){const col=pickC([0xffd86a,0xffffff,0x6f8cff,0xff6fd8,0x7affc8]);
  for(let i=0;i<46;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARKF,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(1.1);sp.position.set(x,y,z);scene.add(sp);
    const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),v=7+Math.random()*4;sparksF.push({sp,v:new THREE.Vector3(Math.sin(b)*Math.cos(a)*v,Math.cos(b)*v,Math.sin(b)*Math.sin(a)*v),life:1.6+Math.random()*.6});}}
const CONF_N=500,confPos=new Float32Array(CONF_N*3),confV=new Float32Array(CONF_N);
const confGeo=new THREE.BufferGeometry();confGeo.setAttribute('position',new THREE.BufferAttribute(confPos,3));
const conf=new THREE.Points(confGeo,new THREE.PointsMaterial({color:0xffd86a,size:.45,transparent:true,opacity:0,depthWrite:false}));scene.add(conf);
let confT=0;function confettiBurst(){confT=6;for(let i=0;i<CONF_N;i++){confPos[i*3]=(Math.random()-.5)*80;confPos[i*3+1]=22+Math.random()*16;confPos[i*3+2]=(Math.random()-.5)*50;confV[i]=1.5+Math.random()*2;}confGeo.attributes.position.needsUpdate=true;}
function fogPuff(){}function fogBank(){}function ghost(){}function bat(){}
// relámpago de vez en cuando
let flashT=0,nextFlash=6;

// =====================================================================
// armado
// =====================================================================
const ZS=HW+3.4,Z0E=13,XS=L+3.6,X0=XS-(ZS-Z0E);   // frente de las tribunas largas, mitad del fondo, frente de la cabecera, mitad del largo
const LD=7.4,LH=5.6,UD=6.4,UH=5;           // grada de abajo y de arriba (fondo/alto)
const chand=[];   // brillos turquesa de los candelabros de los balcones
// arcada de coliseo al frente de cada base (antes balcón) (como los palcos de la referencia): abajo queda recto detrás de la grada
// y de la altura de la grada de abajo para arriba se curva hacia afuera
function balcony(x,z,ry,w,h,B,yb){B=B==null?0:B;yb=yb==null?LH:yb;const P=prep('leyendas_arcada');if(!P)return;
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);CAT.balcon.push(g);
  const src=P.s.clone(true),c=P.box.getCenter(new THREE.Vector3()),tmp=new THREE.Group();tmp.add(src);tmp.updateMatrixWorld(true);
  const W0=P.size.x,H0=P.size.y,D0=P.size.z,d=.8,v=new THREE.Vector3();
  src.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo=tessellate(geo,W0/22);const pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);const X=(v.x-c.x)/W0*w,Y=(v.y-P.box.min.y)/H0*h,t=X/w+.5;
      const up=Math.min(1,Math.max(0,(Y-yb+.6)/1.6)),k=up*up*(3-2*up),bow=B*(1-Math.pow(2*t-1,2))*k;
      pa.setXYZ(i,X,Y,(v.z-c.z)/D0*d+bow);}
    geo.computeVertexNormals();geo.computeBoundingSphere();const m=new THREE.Mesh(geo,o.material);m.castShadow=true;m.receiveShadow=true;g.add(m);});
  const cs=Math.cos(ry),sn=Math.sin(ry);for(const f of [-.33,0,.33]){const lx=f*w,bz=B*(1-Math.pow(2*f,2))+.6,sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW_T,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));
    sp.position.set(x+lx*cs+bz*sn,Math.max(h*.72,yb+1),z-lx*sn+bz*cs);sp.scale.setScalar(2.6);scene.add(sp);chand.push({sp,ph:Math.random()*6});CAT.balcon.push(sp);}}
const GLOW_T=radTex('rgba(255,220,130,1)','rgba(255,180,60,0)');
function longSide(side,gaps){const g=new THREE.Group();scene.add(g);g.rotation.y=side<0?Math.PI:0;   // local: +z hacia afuera de la cancha
  const ry=side<0?0:Math.PI;
  const XE=X0-.9,total=2*XE,gw=gaps.reduce((a,b)=>a+b.w,0),n=gaps.length+1,secW=(total-gw)/n;
  const HB=side<0?[8.4,10.2,9,10.8]:[10.4,8.2,11,9];const SET=side<0?[.4,2,1,2.4]:[2.2,.6,1.8,.2];const SH=side<0?[.3,-.5,.4,-.2]:[-.4,.2,-.3,.5];
  let u=-XE;const secs=[];
  for(let i=0;i<n;i++){secs.push({u0:u,u1:u+secW,hb:HB[i],set:SET[i],sh:SH[i]});u+=secW;if(i<gaps.length){gaps[i].u0=u;gaps[i].u1=u+gaps[i].w;u+=gaps[i].w;}}
  const L2W=(lu,lz)=>({x:side<0?-lu:lu,z:side<0?-lz:lz});
  const zf=ZS,zl=ZS+LD;
  for(const s of secs){const cu=(s.u0+s.u1)/2,w=s.u1-s.u0;
    const p=L2W(cu,zf+LD/2);grada(p.x,p.z,0,ry,w,LD,LH);
    const zb=zl+s.set,uw=w-.9,cuU=cu+s.sh*.3;
    if(s.set>.05){const b=new THREE.Mesh(new THREE.BoxGeometry(w,LH*.98,s.set+.1),stoneMat);b.position.set(cu,LH*.49,zl+s.set/2);b.castShadow=b.receiveShadow=true;g.add(b);}
    const base=new THREE.Mesh(new THREE.BoxGeometry(uw+.5,s.hb,UD),stoneMat);base.position.set(cuU,s.hb/2,zb+UD/2);base.castShadow=base.receiveShadow=true;g.add(base);
    // frente de la base: balcón de madera con arcos, papel tapiz turquesa y candelabros (de Tripo)
    {const q=L2W(cuU,zb-.4);balcony(q.x,q.z,ry,uw+.5,s.hb);}
    const q=L2W(cuU,zb+UD/2);grada(q.x,q.z,s.hb,ry,uw,UD,UH);
    const back=new THREE.Mesh(new THREE.BoxGeometry(uw+.5,s.hb+UH+1.2,1),stoneMat);back.position.set(cuU,(s.hb+UH+1.2)/2,zb+UD+.5);back.castShadow=true;g.add(back);
    merlons(g,cuU-(uw+.5)/2,cuU+(uw+.5)/2,s.hb+UH+1.2,zb+UD+.5,1);
    s.zb=zb;s.top=s.hb+UH;}
  for(let i=0;i<gaps.length;i++){const G_=gaps[i],a=secs[i],b=secs[i+1],cu=(G_.u0+G_.u1)/2,top=Math.min(a.hb,b.hb),z1=Math.max(a.zb,b.zb)+1.4,th=.6;
    if(G_.type==='escalera'){stairs(g,cu,G_.w-2*th,zf-.2,z1,top);const lnd=new THREE.Mesh(new THREE.BoxGeometry(G_.w,top,UD+1),stoneMat);lnd.position.set(cu,top/2,z1+(UD+1)/2);g.add(lnd);}
    if(G_.type==='estatua'){const fill=new THREE.Mesh(new THREE.BoxGeometry(G_.w,Math.max(a.top,b.top),UD+3),stoneMat);fill.position.set(cu,Math.max(a.top,b.top)/2,z1+(UD+3)/2-1);g.add(fill);
      const p=L2W(cu,zf+3);place('leyendas_estatua1',{x:p.x,z:p.z,ry,h:Math.min(15,(G_.w-2*th-.4)/.508)});}
    if(G_.type==='porton'){const PW=G_.w-2*th,PP=prep('leyendas_porton'),PD=Math.min(6,PP?PW*PP.size.z/PP.size.x:5),PH=PP?PW*PP.size.y/PP.size.x:9.4;
      {const p=L2W(cu,zf+.6+PD/2);place('leyendas_porton',{x:p.x,z:p.z,ry,w:PW,d:PD,h:PH});const q=L2W(cu,zf+.6+PD*.5);place('leyendas_estatua2',{x:q.x,z:q.z,y:PH,h:7,ry});}
      // detrás de la reja: la pared de la tribuna con su balcón y la grada de arriba corrida
      const hb=Math.max(a.hb,b.hb,PH+.4)+.6,zb=Math.max(a.zb,b.zb,zf+PD+3);
      const br=new THREE.Mesh(new THREE.BoxGeometry(G_.w,hb,UD+zb-(zf+PD+1.5)),stoneMat);br.position.set(cu,hb/2,(zf+PD+1.5+zb+UD)/2);br.castShadow=br.receiveShadow=true;g.add(br);
      {const q=L2W(cu,zf+PD+1.1);balcony(q.x,q.z,ry,G_.w,hb,.5,PH*.6);}
      const q=L2W(cu,zb+UD/2);grada(q.x,q.z,hb,ry,G_.w,UD,UH);const bk=new THREE.Mesh(new THREE.BoxGeometry(G_.w,hb+UH+1.2,1),stoneMat);bk.position.set(cu,(hb+UH+1.2)/2,zb+UD+.5);g.add(bk);
      merlons(g,cu-G_.w/2,cu+G_.w/2,hb+UH+1.2,zb+UD+.5,1);}
    for(const e of [-1,1]){const S=e<0?a:b;sideWall(g,cu+e*(G_.w/2-th/2),zf,S.zb,Math.max(S.hb,top),th,UD+1.2);}
    for(const e of [-1,1]){const p=L2W(cu+e*(G_.w/2+.7),zl+.3);banner(p.x,LH+1.6,p.z,side<0?0:Math.PI);}}
  for(const e of [-1,1]){const S=e<0?secs[0]:secs[secs.length-1];sideWall(g,e*(X0-.45),zf,S.zb,S.hb,.9,UD+1.2);}
  return secs;}

async function build(){
  await Promise.all(['leyendas_grada','leyendas_arcada','leyendas_salon','leyendas_torre','leyendas_pantalla','leyendas_estatua1','leyendas_estatua2','leyendas_objetos','leyendas_porton'].map(loadG));
  skyRealm();   // el coliseo flota en las nubes, como la Leyendas anterior
  // --- lados largos: izquierda con una torrecilla al centro; derecha con la reja de entrada ---
  longSide(-1,[{type:'escalera',w:3.4},{type:'estatua',w:7.4},{type:'escalera',w:3.4}]);
  longSide(1,[{type:'escalera',w:3.4},{type:'porton',w:14},{type:'escalera',w:3.4}]);
  // --- detrás de TU portería: dos tramos de dos pisos con escalera al centro (más bajitos: la cámara va ahí) ---
  {const g=new THREE.Group();scene.add(g);g.rotation.y=-Math.PI/2;
    const ry=Math.PI/2,sw=(2*(Z0E-.9)-3.4)/2;
    for(const e of [-1,1]){const cz=e*(3.4/2+sw/2);grada(-(XS+LD/2),cz,0,ry,sw,LD,LH);
      const hb=e<0?7.4:8.2;box(UD,hb,sw-.4,-(XS+LD+.6+UD/2),hb/2,cz);balcony(-(XS+LD+.6-.4),cz,ry,sw-.4,hb);grada(-(XS+LD+.6+UD/2),cz,hb,ry,sw-.6,UD,UH);
      box(1,hb+UH+1.2,sw-.4,-(XS+LD+.6+UD+.5),(hb+UH+1.2)/2,cz);}
    stairs(g,0,2.2,XS-.2,XS+LD+.6,7.4);for(const e of [-1,1])sideWall(g,e*1.4,XS,XS+LD+.6,7.8,.6,UD+.8);
    for(const e of [-1,1])sideWall(g,e*(Z0E-.45),XS,XS+LD+.6,e<0?7.4:8.2,.9,UD+1);}
  // --- esquinas: grada doblada 90°, muro curvo con picos y una torrecilla detrás ---
  const r=ZS-Z0E;
  for(const sx of [-1,1])for(const sz of [-1,1]){const a0=sx>0?(sz>0?0:Math.PI*1.5):(sz>0?Math.PI/2:Math.PI);const C=new THREE.Vector3(sx*X0,0,sz*Z0E);
    bentStand(C,a0,r,LD,LH);
    // segundo piso también en la esquina: base curva de piedra, balcón de madera doblado y grada de arriba doblada
    const hbC=9.4,R1=r+LD,R2=R1+UD;
    arcBox(C,a0,(R1+R2)/2,0,UD,hbC,stoneMat);
    CAT.balcon.push(bendModel('leyendas_arcada',C,a0,R1-.85,.8,hbC,0));
    CAT.esquina.push(bendModel('leyendas_grada',C,a0,R1,UD,UH,hbC));
    for(const [f,h] of ROWS){const rr=R1+f*UD,cnt=Math.max(1,Math.floor(rr*Math.PI/2/1.45));for(let k=0;k<cnt;k++){const th=a0+(k+.5)/cnt*Math.PI/2;SEATS.push({x:C.x+Math.cos(th)*rr,y:hbC+h*UH,z:C.z+Math.sin(th)*rr,ry:Math.atan2(-Math.cos(th),-Math.sin(th))});}}
    for(const f of [.2,.5,.8]){const th=a0+f*Math.PI/2,sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW_T,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));sp.position.set(C.x+Math.cos(th)*(R1-1.5),hbC*.72,C.z+Math.sin(th)*(R1-1.5));sp.scale.setScalar(2.6);scene.add(sp);chand.push({sp,ph:Math.random()*6});}
    const d=R2+3.6,ang=Math.atan2(sz,sx)+(sx>0?sz*.36:0);const tx=C.x+Math.cos(ang)*d,tz=C.z+Math.sin(ang)*d;
    {const Rw=R2+.5,Hw=hbC+UH+1.2;arcBox(C,a0,Rw,0,1.1,Hw,stoneMat);
     arcBeam(C,a0,Rw,Hw,1.35,.35);}
    {const pl=mesh(new THREE.CylinderGeometry(4.6,5,1.6,16),stoneMat);pl.position.set(tx,.8,tz);pl.rotation.y=Math.atan2(-sx,-sz);scene.add(pl);}
    place('leyendas_torre',{x:tx,z:tz,y:1.6,h:22,ry:Math.atan2(-sx,-sz)});}
  // --- lado RIVAL: el Salón de las Leyendas con el trofeo gigante, dos torres con corona y dos estatuas doradas ---
  {const W=2*Z0E-.4,d=14,H=22;place('leyendas_salon',{x:XS+d/2+.4,z:0,ry:-Math.PI/2,w:W,d,h:H});
    for(const e of [-1,1])place('leyendas_torre',{x:XS+d*.95,z:e*(W/2+2.2),h:H*1.1,ry:-Math.PI/2});
    for(const e of [-1,1])place('leyendas_estatua2',{x:XS+.9,z:e*(W/2-2.6),h:9,ry:-Math.PI/2});}
  // --- pantallas sobre su columna en las esquinas rivales, paradas en la grada curva y mirando a la cancha ---
  for(const sz of [-1,1]){const a=.7,x=X0+Math.cos(a)*(r+LD*.58),z=sz*(Z0E+Math.sin(a)*(r+LD*.58));place('leyendas_pantalla',{x,z,y:LH*.72,h:11,ry:Math.atan2(4-x,-z)});}
  // --- corona de arcadas de coliseo detrás de todas las gradas (se ve el coliseo desde arriba) ---
  {const zb=ZS+LD+2.4+UD+2.2;for(const side of [-1,1])for(let k=0;k<6;k++){const w=X0*2/6+.3,x=-X0+X0*2/6*(k+.5);place('leyendas_arcada',{x,z:side*zb,y:11.5,ry:side>0?Math.PI:0,w,h:7,d:1.6});}
   const xb=-(XS+LD+.6+UD+2.2);for(let k=0;k<2;k++)place('leyendas_arcada',{x:xb,z:-Z0E+Z0E*(k+.5),y:10,ry:Math.PI/2,w:Z0E+.3,h:7,d:1.6});}
  // --- estatuas doradas afuera de las esquinas ---
  for(const [x,z,ry] of [[-56,34,2.2],[-56,-34,.9],[54,30,-2.2],[54,-30,-.9]])place('leyendas_estatua2',{x,z,h:13,ry});
  // --- porterías de mármol con capiteles y perillas de oro (al tamaño de la del juego) ---
  {const C=(window.SIM&&SIM.C)||{GW:4.8,GH:3.3},PM=new THREE.MeshLambertMaterial({color:'#f2efe8'}),GM_=new THREE.MeshLambertMaterial({color:'#e2b33a',emissive:'#3a2a08'});
   for(const s of [-1,1]){for(const z of [-C.GW-.3,C.GW+.3]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.32,.36,C.GH,14),PM);p.position.set(s*(L+.05),C.GH/2,z);p.castShadow=true;scene.add(p);
       const k=new THREE.Mesh(new THREE.SphereGeometry(.4,12,10),GM_);k.position.set(s*(L+.05),C.GH+.55,z);scene.add(k);
       const b=new THREE.Mesh(new THREE.BoxGeometry(.9,.4,.9),GM_);b.position.set(s*(L+.05),.2,z);scene.add(b);
       const cap=new THREE.Mesh(new THREE.BoxGeometry(.85,.3,.85),GM_);cap.position.set(s*(L+.05),C.GH-.1,z);scene.add(cap);}
     const bar=new THREE.Mesh(new THREE.BoxGeometry(.5,.45,2*C.GW+.9),PM);bar.position.set(s*(L+.05),C.GH+.2,0);bar.castShadow=true;scene.add(bar);
     const gb=new THREE.Mesh(new THREE.BoxGeometry(.52,.12,2*C.GW+.9),GM_);gb.position.set(s*(L+.05),C.GH+.47,0);scene.add(gb);}}
  // red dorada: en el juego se cambia la textura de la red (con física)
  if(typeof NETS!=='undefined'&&NETS.length){for(const N of NETS)for(const P of N.panels){const m=P.mesh.material;P.mesh.userData._c=m.color.getHex();P.mesh.userData._map=m.map;m.map=CHAIN;m.color.setHex(0xffffff);m.needsUpdate=true;}}
  else drawNets();
  // --- objetos sueltos (urna con fuego, estandarte, laurel, balones, columna, trofeo) ---
  {const PB=[[.187,.377,0,.283],[.69,.86,.02,.33],[.77,1,.433,.997],[.55,.653,.473,.72],[0,.17,.52,.9],[.343,.507,.637,.913]];
   const PH=[2.4,4.2,3,1.3,2.8,2];
   const spots=[[L+2.9,-14.8],[L+2.9,14.8],[-(L+2.9),-14.8],[-(L+2.9),14.8]];
   for(const sx of [-1,1])for(const sz of [-1,1])for(const da of (sx>0?[]:[-.42,.42])){const a=Math.atan2(sz,sx)+da,dd=r+LD+2.2;spots.push([sx*X0+Math.cos(a)*dd,sz*Z0E+Math.sin(a)*dd]);}
   spots.forEach(([x,z],i)=>{const k=i%PB.length,Pp=partOf('leyendas_objetos',PB[k]);if(Pp)placePart(Pp,{x,z,h:PH[k],ry:Math.random()*6.28});});}
  for(let i=0;i<12;i++)ghost();
  for(let i=0;i<14;i++)bat();
}

// ===== el coliseo flotando en las nubes (fondo de la Leyendas anterior) =====
const clouds=[],islands=[];
const CLOUDMAT=new THREE.MeshLambertMaterial({color:'#ffe6d6',emissive:'#5a2a40'});
function cloud(x,y,z,S){const P=[],N=[];for(let i=0;i<6;i++){const geo=new THREE.IcosahedronGeometry((1.6+Math.random()*1.4)*S,1);
    geo.translate((Math.random()-.5)*5*S,(Math.random()-.3)*1.2*S,(Math.random()-.5)*3*S);P.push(...geo.attributes.position.array);N.push(...geo.attributes.normal.array);geo.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  const m=new THREE.Mesh(g,CLOUDMAT);m.position.set(x,y,z);scene.add(m);clouds.push({g:m,v:.3+Math.random()*.5});}
function island(x,y,z,S){const g=new THREE.Group();const rock=mesh(new THREE.ConeGeometry(2.6*S,4*S,7),'#b8a99a');rock.rotation.x=Math.PI;rock.position.y=-2*S;g.add(rock);
  const top=mesh(new THREE.CylinderGeometry(2.7*S,2.6*S,.5*S,7),'#86b04a');top.position.y=.2*S;g.add(top);
  if(Math.random()<.8){const tr=mesh(new THREE.CylinderGeometry(.18*S,.24*S,1.6*S,6),'#7a5236');tr.position.y=1.2*S;g.add(tr);const cr=mesh(new THREE.IcosahedronGeometry(1.1*S,0),'#5e9a35');cr.position.y=2.5*S;g.add(cr);}
  g.position.set(x,y,z);scene.add(g);islands.push({g,y,ph:Math.random()*6});}
function skyRealm(){const X1=-62,X2=60,Z=46;
  const slab=mesh(new THREE.BoxGeometry(X2-X1,3,2*Z),'#e2dbcd');slab.position.set((X1+X2)/2,-1.65,0);scene.add(slab);
  const edge=new THREE.Mesh(new THREE.BoxGeometry(X2-X1+.4,.4,2*Z+.4),new THREE.MeshLambertMaterial({color:'#e2b33a',emissive:'#3a2a08'}));edge.position.set((X1+X2)/2,-.42,0);scene.add(edge);
  const under=mesh(new THREE.ConeGeometry(Math.max(X2-X1,2*Z)/2+8,46,8),'#b8a99a');under.rotation.x=Math.PI;under.position.set((X1+X2)/2,-26,0);under.scale.z=(2*Z)/(X2-X1);scene.add(under);
  for(let i=0;i<60;i++){const a=Math.random()*6.28,r=72+Math.random()*60;cloud(Math.cos(a)*r,-14+Math.random()*14,Math.sin(a)*r*.8,1.6+Math.random()*1.8);}
  for(let i=0;i<10;i++){const a=i/10*6.28+.3,r=88+Math.random()*20;island(Math.cos(a)*r,8+Math.random()*14,Math.sin(a)*r*.75,1.4+Math.random()*.8);}
  // mar de nubes hasta el horizonte
  for(let i=0;i<70;i++){const a=Math.random()*6.28,r=140+Math.random()*120;cloud(Math.cos(a)*r,-22+Math.random()*10,Math.sin(a)*r,3+Math.random()*3);}
  // dos colosos dorados de leyendas parados sobre las nubes, a lo lejos detrás del salón
  for(const e of [-1,1]){const o=place(e<0?'leyendas_estatua1':'leyendas_estatua2',{x:190,z:e*95,y:-24,h:95,ry:-Math.PI/2-e*.45,fire:false});if(o)o.traverse(c=>{if(c.isMesh)c.material=COLOSO;});}
  // resplandor dorado en el horizonte detrás del salón
  {const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:radTex('rgba(255,210,140,.9)','rgba(255,140,80,0)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(260,10,0);sp.scale.set(320,140,1);scene.add(sp);}
  // nebulosa y vía láctea
  for(let i=0;i<7;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:NEB,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.5,color:pickC([0xb070ff,0xff70c0,0x70a0ff])}));
    const a=-.9+i*.3;sp.position.set(Math.cos(a)*240,140+Math.sin(i*1.7)*30,Math.sin(a)*240);sp.scale.set(170,90,1);scene.add(sp);}
  // polvo dorado que sube despacio sobre el estadio
  {const N=180,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*110;pos[i*3+1]=Math.random()*30;pos[i*3+2]=(Math.random()-.5)*80;gold.push(.4+Math.random()*.8);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
   goldPts=new THREE.Points(geo,new THREE.PointsMaterial({map:SPARKF,color:0xffd88a,size:.45,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.7}));scene.add(goldPts);}}   // polvo dorado: una sola llamada de dibujo
const gold=[];let goldPts=null;
const COLOSO=new THREE.MeshLambertMaterial({color:'#e8b84a',emissive:'#4a3410',fog:false});
const NEB=(function(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  for(let i=0;i<60;i++){const x=128+(Math.random()-.5)*160,y=128+(Math.random()-.5)*90,rr=20+Math.random()*50,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}
  for(let i=0;i<120;i++){g.fillStyle='rgba(255,255,255,'+(.4+Math.random()*.6)+')';g.fillRect(64+Math.random()*128,80+Math.random()*96,1.5,1.5);}return new THREE.CanvasTexture(c);})();
// arco del triunfo de mármol: un arco grande al centro, bandas de oro y la estatua dorada encima
function triumph(g,cu,zc,W,H,D,ry,L2W){const sh=new THREE.Shape();sh.moveTo(-W/2,0);sh.lineTo(W/2,0);sh.lineTo(W/2,H);sh.lineTo(-W/2,H);sh.closePath();
  const aw=W*.42,ah=H*.68,hole=new THREE.Path();hole.moveTo(-aw/2,0);hole.lineTo(-aw/2,ah-aw/2);hole.absarc(0,ah-aw/2,aw/2,Math.PI,0,true);hole.lineTo(aw/2,0);hole.closePath();sh.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false,curveSegments:16});geo.translate(0,0,-D/2);
  const m=new THREE.Mesh(geo,stoneMat);m.castShadow=m.receiveShadow=true;m.position.set(cu,0,zc);g.add(m);
  const GMat=new THREE.MeshLambertMaterial({color:'#e2b33a',emissive:'#3a2a08'});
  for(const y of [H*.82,H-.25]){const b=new THREE.Mesh(new THREE.BoxGeometry(W+.3,.45,D+.3),GMat);b.position.set(cu,y,zc);g.add(b);}
  for(const e of [-1,1]){const col=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,H*.78,14),stoneMat);col.position.set(cu+e*(W/2-1.1),H*.39,zc-D/2-.4);g.add(col);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.2,.35,1.2),GMat);cap.position.set(cu+e*(W/2-1.1),H*.79,zc-D/2-.4);g.add(cap);}
  const tun=new THREE.Mesh(new THREE.PlaneGeometry(aw,ah),new THREE.MeshBasicMaterial({color:'#0a0a14',side:THREE.DoubleSide}));tun.position.set(cu,ah/2,zc+D/2-.05);g.add(tun);
  const p=L2W(cu,zc);place('leyendas_estatua2',{x:p.x,z:p.z,y:H,h:7.5,ry});}
// viga de madera curva (una sola pieza que sigue la curva) con picos de hierro encima
function arcBox(C,a0,R,y,t,h,mat){const geo=new THREE.BoxGeometry(1,h,t,40,1,1),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const u=p.getX(i)+.5,th=a0+u*Math.PI/2,rr=R+p.getZ(i);p.setXYZ(i,C.x+Math.cos(th)*rr,y+h/2+p.getY(i),C.z+Math.sin(th)*rr);}
  geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;scene.add(m);return m;}
function arcBeam(C,a0,R,y,t,h){CAT.vigas.push(arcBox(C,a0,R,y,t,h,WOODM));
  const n=Math.round(R*Math.PI/2/1.2);for(let k=0;k<=n;k++){const th=a0+k/n*Math.PI/2,sp=new THREE.Mesh(new THREE.ConeGeometry(.09,.7,5),IRONM);sp.position.set(C.x+Math.cos(th)*R,y+h+.35,C.z+Math.sin(th)*R);scene.add(sp);CAT.vigas.push(sp);}}
// parte los triángulos largos (barandales y vigas que solo tienen puntos en las puntas) para que se puedan doblar en curva
function tessellate(geo,maxL){const g=geo.index?geo.toNonIndexed():geo,P=g.attributes.position,U=g.attributes.uv,pos=[],uv=[];
  const tri=(a,b,c,ua,ub,uc,depth)=>{const ab=a.distanceTo(b),bc=b.distanceTo(c),ca=c.distanceTo(a),m=Math.max(ab,bc,ca);
    if(m<=maxL||depth>9){pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);if(U)uv.push(ua.x,ua.y,ub.x,ub.y,uc.x,uc.y);return;}
    if(m===ab){const p=a.clone().lerp(b,.5),q=ua&&ua.clone().lerp(ub,.5);tri(a,p,c,ua,q,uc,depth+1);tri(p,b,c,q,ub,uc,depth+1);}
    else if(m===bc){const p=b.clone().lerp(c,.5),q=ub&&ub.clone().lerp(uc,.5);tri(a,b,p,ua,ub,q,depth+1);tri(a,p,c,ua,q,uc,depth+1);}
    else{const p=c.clone().lerp(a,.5),q=uc&&uc.clone().lerp(ua,.5);tri(a,b,p,ua,ub,q,depth+1);tri(p,b,c,q,ub,uc,depth+1);}};
  const V=i=>new THREE.Vector3().fromBufferAttribute(P,i),T=i=>U?new THREE.Vector2().fromBufferAttribute(U,i):null;
  for(let i=0;i<P.count;i+=3)tri(V(i),V(i+1),V(i+2),T(i),T(i+1),T(i+2),0);
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(U)out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return out;}
// dobla cualquier modelo 90° alrededor de un centro (como la grada de las esquinas) y lo sube a y0
function bendModel(n,C,a0,r,D,H,y0){const P=prep(n);if(!P)return;const g=new THREE.Group();
  const src=P.s.clone(true);const c=P.box.getCenter(new THREE.Vector3());src.position.set(-c.x,-P.box.min.y,-c.z);const tmp=new THREE.Group();tmp.add(src);tmp.updateMatrixWorld(true);
  const W0=P.size.x,D0=P.size.z,H0=P.size.y,v=new THREE.Vector3();
  src.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo=tessellate(geo,W0/22);const pa=geo.attributes.position;
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);const t=(v.x+W0/2)/W0,back=(D0/2-v.z)/D0*D,th=a0+t*Math.PI/2,rr=r+back;pa.setXYZ(i,C.x+Math.cos(th)*rr,y0+v.y/H0*H,C.z+Math.sin(th)*rr);}
    geo.computeVertexNormals();geo.computeBoundingSphere();const m=new THREE.Mesh(geo,o.material);m.castShadow=true;m.receiveShadow=true;g.add(m);});
  scene.add(g);return g;}

// ===== animación =====
let goalT=0;
function update(dt){dt=Math.min(.05,dt);const T=(update.t=(update.t||0)+dt);const gk=goalT>0?goalT/2.8:0;if(goalT>0)goalT-=dt;
  for(const f of fires){const s=f.s;for(const p of f.parts){const fl=Math.sin(T*11+p.ph)*.12+Math.sin(T*23+p.ph*2)*.08;
      p.sp.scale.set((.75-p.k*.15+fl*.4)*s*(1+gk*.5),(1.25-p.k*.2+fl)*s*(1+gk*.7),1);p.sp.position.set(Math.sin(T*6+p.ph)*.06*s,(.45+p.k*.1)*s,0);p.sp.material.opacity=.9-p.k*.2;}
    f.core.material.opacity=.55+Math.sin(T*9+f.parts[0].ph)*.12;
    for(const e of f.emb){e.t+=dt*(.7+gk);if(e.t>1){e.t=0;e.dx=(Math.random()-.5)*.6;}e.sp.position.set((e.dx+Math.sin(T*4+e.ph)*.15)*s,(.3+e.t*1.8)*s,0);e.sp.material.opacity=(1-e.t)*.9;}}
  for(const s of stars)s.m.material.opacity=.65+Math.sin(T*1.3+s.ph)*.25;
  for(const s of shooting){s.t+=dt;if(s.t>2.2){s.t=-4-Math.random()*8;const a=Math.random()*Math.PI*2;s.p=new THREE.Vector3(Math.cos(a)*150,90+Math.random()*50,Math.sin(a)*150);s.d=new THREE.Vector3(-Math.sin(a)*.8,-.35,Math.cos(a)*.8).normalize();}
    if(s.t<0||!s.p){s.m.material.opacity=0;continue;}const k=s.t/2.2;s.m.position.copy(s.p).addScaledVector(s.d,k*120);s.m.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),s.d);s.m.material.opacity=Math.sin(k*Math.PI)*.9;}
  for(const f of flags){const a=f.m.geometry.attributes.position;for(let i=0;i<a.count;i++){const y=f.base[i*3+1],k=(.85-y)/1.7;a.setZ(i,Math.sin(T*3+f.ph+y*2)*.12*k*(1+gk*2));}a.needsUpdate=true;}
  for(const c of chand)c.sp.material.opacity=.45+Math.sin(T*3+c.ph)*.08+Math.sin(T*13+c.ph)*.04+gk*.3;
  // ventanas que parpadean de vez en cuando
  winU.value=1;
  for(const c of clouds){c.g.position.x+=dt*c.v;if(c.g.position.x>140)c.g.position.x=-140;}
  for(const i of islands){i.g.position.y=i.y+Math.sin(T*.5+i.ph)*.8;i.g.rotation.y+=dt*.03;}
  if(goldPts){const a=goldPts.geometry.attributes.position.array;for(let i=0;i<gold.length;i++){a[i*3+1]+=gold[i]*dt*(1+gk*3);a[i*3]+=Math.sin(T*.6+i)*dt*.3;if(a[i*3+1]>32)a[i*3+1]=0;}goldPts.geometry.attributes.position.needsUpdate=true;}
  for(let i=sparksF.length-1;i>=0;i--){const p=sparksF[i];p.life-=dt;p.v.y-=6*dt;p.v.multiplyScalar(1-dt*.9);p.sp.position.addScaledVector(p.v,dt);p.sp.material.opacity=Math.min(1,p.life);if(p.life<=0){scene.remove(p.sp);sparksF.splice(i,1);}}
  if(gk>0&&Math.random()<dt*6)firework((Math.random()-.5)*90,26+Math.random()*16,(Math.random()<.5?-1:1)*(28+Math.random()*12));
  if(confT>0){confT-=dt;const a=confGeo.attributes.position.array;for(let i=0;i<CONF_N;i++){a[i*3+1]-=confV[i]*dt;a[i*3]+=Math.sin(T*3+i)*dt*.8;}confGeo.attributes.position.needsUpdate=true;conf.material.opacity=Math.min(1,confT);}
  for(const g of ghosts){const a=T*g.sp_+g.ph;g.sp.position.set(g.cx+Math.cos(a)*g.r,g.h+Math.sin(a*2.3)*1.2+gk*3,g.cz+Math.sin(a)*g.r*.4);g.sp.material.opacity=.45+Math.sin(T*1.7+g.ph)*.3;}
  for(const b of bats){const a=T*b.sp_*(1+gk)+b.ph;b.g.position.set(b.cx+Math.cos(a)*b.r,b.h+Math.sin(a*3)*1.5,b.cz+Math.sin(a)*b.r);b.g.rotation.y=-a;for(const w of b.g.children)if(w.userData.s)w.rotation.z=w.userData.s*Math.sin(T*16+b.ph)*.7;}
  for(const f of fogs){f.sp.position.x=f.x+Math.sin(T*.2+f.ph)*(f.big?8:3);f.sp.material.opacity=(f.big?.42:.22)+Math.sin(T*.4+f.ph)*.08;}
}
build();
try{if(typeof GOAL_STD!=='undefined')GOAL_STD.forEach(m=>{if(m.geometry&&m.geometry.parameters&&m.geometry.parameters.radiusTop>.1)m.visible=false;});}catch(e){}
return {update,setSand,setPiso,ver,seats:SEATS,onGoal:()=>{goalT=2.8;confettiBurst();for(let k=0;k<4;k++)firework((Math.random()-.5)*80,28+Math.random()*12,(Math.random()<.5?-1:1)*(28+Math.random()*10));}};
};
