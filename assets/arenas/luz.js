// =====================================================================
// v216: LUZ NUEVA para TODAS las arenas (cada una con su ambiente, estilo Strikers).
// v213 (Campo, aprobado): color correcto de pantalla, atardecer suave, pasto de la imagen, faroles del Pueblo.
// v215 (Volcán, aprobado): cielo lila con resplandor, luz morada, reflectores cálidos, fuego que alumbra, ladrillo café rojizo.
// v216: Bosque, Pueblo, Playa (de tarde), Desierto, Tundra, Mansión y Coliseo de Leyendas con su propio ambiente.
// - Color correcto de pantalla: materiales y texturas en espacio lineal, salida sRGB.
// - Cielo: el de la arena con los colores nuevos (si la arena no tiene domo, se pone uno); estrellas y luna donde toca.
// - Fuego, antorchas, faroles y lámparas alumbran de verdad: hasta 6 luces cerca de la cancha + charco de luz en el piso.
// - Personajes: volumen, contorno del color de la luz de la arena, tela mate.
// - Capa de cine (calidad alta): resplandor, contraste, saturación y tono de cada arena. Viñeta suave en todas.
// uso: GZ_LUZ.on({scene,renderer,camera,root,quality,n,mod}) -> true si la arena tiene ambiente · GZ_LUZ.off()
//      GZ_LUZ.tick(dt,cx,cz) · GZ_LUZ.render() -> true si dibujó · GZ_LUZ.tune({...}) para ajustar en vivo (página de prueba)
// =====================================================================
(function(){
if(typeof THREE==='undefined')return;
if(!THREE.ShaderChunk.color_vertex.includes('GZ_LIN'))THREE.ShaderChunk.color_vertex+='\n#if defined(GZ_LIN) && (defined(USE_COLOR) || defined(USE_INSTANCING_COLOR))\n vColor.xyz=pow(max(vColor.xyz,vec3(0.)),vec3(2.2));\n#endif\n';
const U=window.GZ_LUZ_U=window.GZ_LUZ_U||{rim:{value:0},off:{value:0},sat:{value:1},rimCol:{value:new THREE.Color(1,.93,.8)},key:{value:new THREE.Vector3(0,1,0)},shade:{value:1},spec:{value:0}};
const st=(a,b,c,d)=>[[0,a],[.42,b],[.8,c],[1,d]];
// ---- ambiente de cada arena ----
// hs/hg/hem_i: luz de ambiente (cielo/suelo); sc/sun_i/sp: sol o luna (o reflectores); sky: degradado del cielo de arriba (0) al horizonte (1)
// fog: color de neblina; fogN/fogF: dónde empieza y termina detrás de lo que ves; tint/sat/con/exp/bl: capa de cine
// rim: color del contorno de los personajes; fill: luz de relleno [color,intensidad,x,y,z]; fire: fuerza del fuego (0 = sin luces de fuego)
// grass: pasto con la imagen de pasto (tint) o false = el piso de la arena; extra: stars, moon, neb, stone
const PROF={
 15:{name:'Campo',hs:0xdcdcea,hg:0x8c9a4a,hem_i:.42*.95,sc:0xffd2a0,sun_i:.74*.95,sp:[48,32,-24],sky:st('#4f6fb8','#97a9d6','#e9c2a4','#f7dcb8'),fog:0xe6cdb8,fogN:60,fogF:900,
   tint:[1.02,1,.97],sat:1.06,con:.22,exp:1.02,bl:[.45,.8],blq:2,rimLin:[1,.93,.8],rim_i:.2,vig:.6,sunSpr:{x:240,col:0xffc890,k:1.5},fire:0,lamps:'pueblo',grass:{tint:[1.3,1.22,.7],stripes:.06}},
 14:{name:'Volcán',hs:0x7a5ce6,hg:0xff6a3a,hem_i:.62,sc:0xffe2b4,sun_i:.9,sp:[46,40,-14],sky:[[0,'#3a1388'],[.3,'#6a2fd2'],[.6,'#9c62fa'],[.84,'#7448cc'],[1,'#4c3292']],fog:0x4a2c86,fogN:70,fogF:490,
   tint:[1.03,.97,1.04],sat:1.14,con:.22,exp:1.06,bl:[.75,.86],rim:0xff8a48,rim_i:.35,vig:.6,fill:[0x8a6cff,.32,-34,22,26],fire:1.6,grass:{tint:[1.3,1.22,.7],stripes:.06},stone:true,
   neb:{x:240,y:120,z:-30,w:420,h:300,c:['rgba(190,140,255,.75)','rgba(150,90,255,.28)','rgba(120,60,240,0)']}},
 // Bosque: atardecer dorado entre árboles gigantes; sol bajo que entra de lado, sombras largas, faroles que ya se notan
 16:{name:'Bosque',bgSky:true,hs:0xffd8b4,hg:0x55683a,hem_i:.5,sc:0xffbe78,sun_i:.95,sp:[44,24,16],sky:st('#47398a','#b26088','#f39a66','#ffd59a'),fog:0xe2a072,fogN:50,fogF:520,
   tint:[1.04,.99,.93],sat:1.1,con:.24,exp:1.03,bl:[.55,.82],rim:0xffc880,rim_i:.32,vig:.6,fill:[0x8a9cff,.22,-30,22,-20],fire:1.2,sunSpr:{x:250,col:0xffd090,k:1},grass:{tint:[1.3,1.22,.7],stripes:.06}},
 // Pueblo: tarde dorada rosada (tejas rojas y piedra clara), los faroles del pueblo encendidos
 3:{name:'Pueblo',bgSky:true,hs:0xffd8c4,hg:0x6a5048,hem_i:.46,sc:0xffb474,sun_i:.88,sp:[-40,26,26],sky:st('#5a6ec8','#c48ab8','#f6b48a','#ffd8a8'),fog:0xeab08e,fogN:55,fogF:600,
   tint:[1.03,.99,.95],sat:1.1,con:.22,exp:1.03,bl:[.5,.82],rim:0xffd0a0,rim_i:.28,vig:.6,fill:[0x9aa8ff,.2,30,22,-26],fire:1.2,grass:{tint:[1.3,1.22,.7],stripes:.06}},
 // Playa Pirata DE TARDE: atardecer tropical, sol grande y bajo, cielo rosa-naranja; las antorchas tiki ya encendidas
 5:{name:'Playa',bgSky:true,hs:0xffd2b8,hg:0x6a5a48,hem_i:.5,sc:0xffae6a,sun_i:.92,sp:[40,22,-30],sky:st('#3f5fb4','#c07aa8','#ff9a62','#ffd08a'),fog:0xf0a878,fogN:55,fogF:600,
   tint:[1.04,.99,.94],sat:1.12,con:.22,exp:1.03,bl:[.55,.82],rim:0xffc080,rim_i:.3,vig:.6,fill:[0x9a9cff,.18,-30,20,30],fire:1.1,nL:8,grass:{tint:[1.3,1.22,.7],stripes:.06},
   moon:{x:183,y:101,z:-137,s:46,c:0xffdca0,halo:['rgba(255,190,120,.5)','rgba(255,150,90,.18)','rgba(255,120,60,0)']}},
 // Templo del Desierto: noche morada con luna, arena cálida por las antorchas
 10:{name:'Desierto',bgSky:true,hs:0x9a88ff,hg:0x7a4a2a,hem_i:.56,sc:0xc8b8ff,sun_i:.66,sp:[-18,44,24],sky:st('#120a34','#2a1658','#5a2a78','#a04a6a'),fog:0x3a2070,fogN:50,fogF:480,
   tint:[1.02,.98,1.03],sat:1.12,con:.22,exp:1.08,bl:[.7,.82],rim:0xffb070,rim_i:.36,vig:.62,fire:1.7,grass:false,moon:{x:-120,y:130,z:-160,s:26,c:0xfff0dc}},
 // Tundra de Hielo: noche azul helada con aurora, nieve que brilla con la luna; fogatas cálidas
 11:{name:'Tundra',bgSky:true,hs:0xa8c8ff,hg:0x34445e,hem_i:.62,sc:0xd0e4ff,sun_i:.72,sp:[-18,44,24],sky:st('#06122e','#0d2a5a','#1f5a8a','#5aa0b8'),fog:0x1a3360,fogN:50,fogF:480,
   tint:[.97,1,1.05],sat:1.08,con:.2,exp:1.06,bl:[.66,.84],rim:0xbfe6ff,rim_i:.38,vig:.62,fire:1.5,grass:false},
 // Mansión Embrujada (medida de la foto de Strikers): cielo violeta brillante con estrellas, muros azul-violeta oscuro,
 // reflectores blancos fríos sobre la cancha (pasto verde de la 2a foto, franjas marcadas y espirales grabadas), rebote turquesa de los candelabros
 12:{name:'Mansión',bgSky:true,hs:0x6a5ae0,hg:0x3a6a5a,hem_i:.6,sc:0xf2f0ff,sun_i:.95,sp:[46,40,-10],sky:[[0,'#5a2ab8'],[.35,'#8a4cf0'],[.7,'#985dfb'],[1,'#7a48d8']],fog:0x4a2a9a,fogN:55,fogF:480,
   tint:[.98,1,1.05],sat:1.12,con:.2,exp:1.05,bl:[.6,.85],rim:0xc0a8ff,rim_i:.32,vig:.6,fill:[0x40d0b0,.25,-30,18,24],fire:1,grass:{tint:[1.3,1.22,.7],stripes:.06},
   neb:{x:200,y:140,z:20,w:380,h:260,c:['rgba(190,140,255,.55)','rgba(150,90,255,.2)','rgba(120,60,240,0)']}},
 // Coliseo de Leyendas: noche de gala, reflectores blancos fuertes sobre la cancha, oro que brilla, cielo morado
 13:{name:'Leyendas',bgSky:true,hs:0xc8ccf0,hg:0x2a2a40,hem_i:.48,sc:0xfff0d8,sun_i:.7,sp:[-18,48,24],sky:st('#0c0a2a','#2a1a5a','#6a3a7a','#c06a6a'),fog:0x4a2a6a,fogN:60,fogF:520,
   tint:[1.01,1,.98],sat:1.06,con:.18,exp:.95,bl:[.42,.9],rim:0xffd86a,rim_i:.26,vig:.6,fire:1,grass:{tint:[1.3,1.22,.7],stripes:.06}}
};
let M=PROF[15],N=15;
const ENC=new WeakMap();let G=null,ON=false,scanT=0,vig=null;
const S={};function resetS(){Object.assign(S,{field:null,g0:null,g1:null,ud:null,col:null,sky:null,sky0:null,sky1:null,own:null,hemi:null,sun:null,lamps:[],lampsLoading:0,comp:null,bloom:null,grade:null,fog0:null,bg0:null,sunspr:null,
  fill:null,flood:null,fires:[],firesN:-1,firesK:0,firesT:0,other:[],stars:null,moon:null,neb:null,w:0,h:0});}resetS();
function eachMat(f){const seen=new Set();G.scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){if(m&&!seen.has(m)){seen.add(m);f(m);}}});}
const isStone=m=>m.customProgramCacheKey&&m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey&&(()=>{try{return m.customProgramCacheKey()==='volStone';}catch(e){return false;}})();
function linMat(m,on){const ud=m.userData;if(on&&ud._lz)return;if(!on&&!ud._lz)return;
  for(const k of ['color','emissive']){if(!m[k]||!m[k].isColor)continue;if(on){ud['_lz'+k]=m[k].clone();m[k].convertSRGBToLinear();}else if(ud['_lz'+k])m[k].copy(ud['_lz'+k]);}
  if(on&&M.stone&&isStone(m))m.color.setRGB(2.1,1.6,1.55).convertSRGBToLinear();   // ladrillo café rojizo (Volcán)
  for(const k of ['map','emissiveMap']){const t=m[k];if(!t)continue;if(!ENC.has(t))ENC.set(t,t.encoding);const want=on?THREE.sRGBEncoding:ENC.get(t);if(t.encoding!==want){t.encoding=want;}}
  if(on){m.defines=Object.assign({},m.defines||{},{GZ_LIN:''});}else if(m.defines)delete m.defines.GZ_LIN;
  if(ud.selfLit&&'roughness' in m){if(on){ud._lzr=m.roughness;m.roughness=.88;}else if(ud._lzr!=null)m.roughness=ud._lzr;}
  ud._lz=on?1:0;m.needsUpdate=true;}
const radT=(a,b,c)=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,a);r.addColorStop(.45,b);r.addColorStop(1,c);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv);};
const dyn=o=>{o.userData.gzDyn=1;o.userData.gzLuz=1;return o;};
// ---- pasto ----
function grass(){if(!M.grass&&!S.field)return;
  if(!S.field){G.scene.traverse(o=>{const t=o.isMesh&&o.material&&o.material.map;if(!S.field&&t&&t.image&&t.image.width===1728&&t.image.height===1152)S.field=o;});if(!S.field)return;S.g0=S.field.material.map;}
  if(M.grass&&!S.g1){const src=S.g0.image,W=src.width,H=src.height,PX=24,GR=M.grass;
    const o=document.createElement('canvas');o.width=W;o.height=H;const og=o.getContext('2d');og.drawImage(src,0,0);const od=og.getImageData(0,0,W,H).data;
    const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.filter='blur(2.5px)';g.drawImage(src,0,0);g.filter='none';
    const id=g.getImageData(0,0,W,H),d=id.data;const Ls=[];
    for(let k=0;k<d.length;k+=4*97){const mx=Math.max(od[k],od[k+1],od[k+2]),mn=Math.min(od[k],od[k+1],od[k+2]);if(mx>185&&mx-mn<60)continue;Ls.push(d[k]*.3+d[k+1]*.59+d[k+2]*.11);}
    Ls.sort((a,b)=>a-b);const l0=Ls[Math.floor(Ls.length*.05)],l1=Ls[Math.floor(Ls.length*.95)];
    const pc=document.createElement('canvas');pc.width=W;pc.height=H;const p=pc.getContext('2d');const X=x=>(x+36)*PX,Z=z=>(z+24)*PX;
    p.fillStyle='rgb(128,128,128)';p.fillRect(0,0,W,H);const sa=GR.stripes!=null?GR.stripes:.07;
    for(let k=0,x=-36;x<36;x+=4,k++){p.fillStyle=k%2?'rgba(255,255,255,'+sa+')':'rgba(0,0,0,'+sa+')';p.fillRect(X(x),0,4*PX,H);}
    if(GR.swirl){   // espirales grabadas más claras (Mansión, como la foto)
      p.strokeStyle=GR.swirlCol||'rgba(255,255,220,.1)';p.lineWidth=.6*PX;p.lineCap='round';
      for(const [cx,cz,r,turns,dir] of GR.swirl){p.beginPath();const n=220;for(let i=0;i<=n;i++){const t=i/n,a=dir*t*turns*6.283,rr=r*t;const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;i?p.lineTo(X(x),Z(z)):p.moveTo(X(x),Z(z));}p.stroke();}}
    if(GR.campo){   // solo el Campo: espirales, remolino y corona acostada (como la foto de Strikers)
      const spiral=(cx,cz,r,turns,dir,col)=>{p.strokeStyle=col;p.lineWidth=.7*PX;p.lineCap='round';p.beginPath();const n=220;for(let i=0;i<=n;i++){const t=i/n,a=dir*t*turns*6.283,rr=r*t;const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;i?p.lineTo(X(x),Z(z)):p.moveTo(X(x),Z(z));}p.stroke();};
      spiral(19,-11,3.4,2.2,1,'rgba(0,30,0,.12)');spiral(19,11,3.4,2.2,-1,'rgba(0,30,0,.12)');spiral(-17,0,7,1.6,1,'rgba(0,30,0,.09)');
      p.fillStyle='rgba(255,255,230,.08)';p.strokeStyle='rgba(255,255,230,.12)';p.lineWidth=.35*PX;p.lineJoin='round';p.beginPath();
      p.moveTo(X(11),Z(-8));p.lineTo(X(6),Z(-8));p.lineTo(X(-3),Z(-9.5));p.lineTo(X(2),Z(-4.2));p.lineTo(X(-5),Z(0));p.lineTo(X(2),Z(4.2));p.lineTo(X(-3),Z(9.5));p.lineTo(X(6),Z(8));p.lineTo(X(11),Z(8));p.closePath();p.fill();p.stroke();
      p.fillStyle='rgba(255,255,230,.12)';for(const [x,z] of [[-3,-9.5],[-5,0],[-3,9.5]]){p.beginPath();p.arc(X(x),Z(z),.9*PX,0,7);p.fill();}
      p.fillStyle='rgba(0,30,0,.08)';p.fillRect(X(7.6),Z(-8),1.4*PX,16*PX);}
    const pd=p.getImageData(0,0,W,H).data;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4;const mx=Math.max(od[k],od[k+1],od[k+2]),mn=Math.min(od[k],od[k+1],od[k+2]),line=(mx>185&&mx-mn<60)?255:0;
      let t=((d[k]*.3+d[k+1]*.59+d[k+2]*.11)-l0)/((l1-l0)||1);t=Math.max(0,Math.min(1,t));d[k]=Math.max(0,Math.min(255,pd[k]*(1+(t-.5)*.34)));d[k+1]=line;d[k+2]=0;}
    g.putImageData(id,0,0);S.g1=new THREE.CanvasTexture(c);S.g1.anisotropy=S.g0.anisotropy;S.g1.encoding=THREE.LinearEncoding;ENC.set(S.g1,THREE.LinearEncoding);
    S.col=new THREE.TextureLoader().load('assets/arenas/campo/pasto_color.png?v=213');S.col.wrapS=S.col.wrapT=THREE.RepeatWrapping;S.col.anisotropy=G.renderer.capabilities.getMaxAnisotropy();
    const m=S.field.material,prev=m.onBeforeCompile,pk=m.customProgramCacheKey,UD={c:{value:S.col},on:{value:1},rep:{value:new THREE.Vector2(72/1.6,48/1.6)},tint:{value:new THREE.Vector3().fromArray(GR.tint)}};S.ud=UD;
    m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);sh.uniforms.tCol=UD.c;sh.uniforms.uOn=UD.on;sh.uniforms.uRep=UD.rep;sh.uniforms.uTintG=UD.tint;
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tCol;uniform float uOn;uniform vec2 uRep;uniform vec3 uTintG;')
        .replace('#include <map_fragment>','#include <map_fragment>\nif(uOn>.5){vec4 g1=texture2D(map,vUv);vec3 tc=pow(texture2D(tCol,vUv*uRep).rgb,vec3(2.2))*uTintG;diffuseColor.rgb=mix(tc*g1.r*2.,vec3(.86),smoothstep(.3,.7,g1.g));}');};
    m.customProgramCacheKey=()=>(pk?pk.call(m):'')+'-luz';}
  if(!M.grass)return;
  const want=ON?S.g1:S.g0;if(S.ud)S.ud.on.value=ON?1:0;if(S.field.material.map!==want){S.field.material.map=want;S.field.material.needsUpdate=true;}}
// ---- cielo, estrellas, luna y resplandor ----
function skyTex(){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d'),r=g.createLinearGradient(0,0,0,256);for(const [k,cc] of M.sky)r.addColorStop(k,cc);g.fillStyle=r;g.fillRect(0,0,16,256);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;ENC.set(t,THREE.sRGBEncoding);return t;}
function sky(){
  if(!S.sky&&!S.own){G.root.traverse(o=>{const p=o.isMesh&&o.geometry&&o.geometry.parameters;if(!S.sky&&p&&(p.radius===300||p.radius===280)&&o.material.side===THREE.BackSide)S.sky=o;});
    if(S.sky)S.sky0=S.sky.material.map;
    else{S.own=dyn(new THREE.Mesh(new THREE.SphereGeometry(290,32,16,0,Math.PI*2,0,Math.PI/2+.12),new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,depthWrite:false})));S.own.position.y=-20;S.own.renderOrder=-2;G.root.add(S.own);}}
  if(!S.sky1)S.sky1=skyTex();
  if(S.sky){const want=ON?S.sky1:S.sky0;if(S.sky.material.map!==want){S.sky.material.map=want;S.sky.material.needsUpdate=true;}}
  if(S.own){S.own.material.map=S.sky1;S.own.visible=ON;S.own.material.needsUpdate=true;}
  // el sol que se ve en el cielo, en la misma dirección que la luz
  if(M.sunSpr&&!S.sunspr)G.root.traverse(o=>{if(!S.sunspr&&o.isSprite&&o.position.x===M.sunSpr.x)S.sunspr={o,p:o.position.clone(),c:o.material.color.clone(),s:o.scale.clone()};});
  if(S.sunspr){const z=S.sunspr;z.o.position.copy(z.p);z.o.material.color.copy(z.c);z.o.scale.copy(z.s);if(ON){z.o.position.fromArray(M.sp).normalize().multiplyScalar(270);z.o.material.color.set(M.sunSpr.col);z.o.scale.multiplyScalar(M.sunSpr.k);}}
  if(M.stars&&!S.stars){const n=700,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=.1+Math.random()*1.4,R=265;pos[i*3]=Math.cos(a)*Math.cos(e)*R;pos[i*3+1]=Math.sin(e)*R-20;pos[i*3+2]=Math.sin(a)*Math.cos(e)*R;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));S.stars=dyn(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,transparent:true,opacity:.85,fog:false,depthWrite:false})));G.root.add(S.stars);}
  if(S.stars)S.stars.visible=ON;
  if(M.moon&&!S.moon){const mo=M.moon;S.moon=dyn(new THREE.Group());
    const disc=new THREE.Sprite(new THREE.SpriteMaterial({map:radT('rgba(255,255,255,1)','rgba(250,252,255,1)','rgba(240,246,255,0)'),color:mo.c,transparent:true,depthWrite:false,fog:false}));disc.scale.setScalar(mo.s);
    const hc=mo.halo||['rgba(200,220,255,.5)','rgba(160,190,255,.18)','rgba(120,160,255,0)'],halo=new THREE.Sprite(new THREE.SpriteMaterial({map:radT(hc[0],hc[1],hc[2]),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));halo.scale.setScalar(mo.s*5);
    S.moon.add(halo);S.moon.add(disc);S.moon.position.set(mo.x,mo.y,mo.z);G.root.add(S.moon);}
  if(S.moon)S.moon.visible=ON;
  if(M.neb&&!S.neb){const nb=M.neb;S.neb=dyn(new THREE.Sprite(new THREE.SpriteMaterial({map:radT(nb.c[0],nb.c[1],nb.c[2]),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})));S.neb.position.set(nb.x,nb.y,nb.z);S.neb.scale.set(nb.w,nb.h,1);S.neb.renderOrder=-1;G.root.add(S.neb);}
  if(S.neb)S.neb.visible=ON;}
// ---- luces de la arena ----
function lights(){if(!S.hemi||!S.sun){G.root.traverse(o=>{if(o.isHemisphereLight&&!S.hemi)S.hemi=o;if(o.isDirectionalLight&&o.castShadow&&!S.sun)S.sun=o;});
    if(S.hemi&&!S.hemi.userData.lz0)S.hemi.userData.lz0=[S.hemi.color.clone(),S.hemi.groundColor.clone(),S.hemi.intensity];if(S.sun&&!S.sun.userData.lz0)S.sun.userData.lz0=[S.sun.color.clone(),S.sun.intensity,S.sun.position.clone()];}
  if(S.hemi){const z=S.hemi.userData.lz0;if(ON){S.hemi.color.set(M.hs).convertSRGBToLinear();S.hemi.groundColor.set(M.hg).convertSRGBToLinear();S.hemi.intensity=M.hem_i;}else{S.hemi.color.copy(z[0]);S.hemi.groundColor.copy(z[1]);S.hemi.intensity=z[2];}}
  if(S.sun){const z=S.sun.userData.lz0;if(ON){S.sun.color.set(M.sc).convertSRGBToLinear();S.sun.intensity=M.sun_i;S.sun.position.fromArray(M.sp);}else{S.sun.color.copy(z[0]);S.sun.intensity=z[1];S.sun.position.copy(z[2]);}}
  // las otras luces de la arena (cálida de ambiente, la de la lava...) también a lineal
  G.root.traverse(o=>{if(o.isLight&&o!==S.hemi&&o!==S.sun&&!o.userData.gzLuz&&!o.userData.lz1){o.userData.lz1=[o.color.clone(),o.groundColor?o.groundColor.clone():null];S.other.push(o);}});
  for(const o of S.other){const z=o.userData.lz1;o.color.copy(z[0]);if(z[1])o.groundColor.copy(z[1]);if(ON){o.color.convertSRGBToLinear();if(z[1])o.groundColor.convertSRGBToLinear();}}
  if(M.fill&&!S.fill){S.fill=dyn(new THREE.DirectionalLight(0xffffff,0));G.root.add(S.fill);}
  if(S.fill){S.fill.visible=ON&&!!M.fill;if(M.fill){S.fill.color.set(M.fill[0]).convertSRGBToLinear();S.fill.intensity=M.fill[1];S.fill.position.set(M.fill[2],M.fill[3],M.fill[4]);}}
  const sc=G.scene;if(sc.fog){if(!S.fog0)S.fog0=[sc.fog.near,sc.fog.far,sc.fog.color.clone()];if(ON)sc.fog.color.set(M.fog).convertSRGBToLinear();else{sc.fog.near=S.fog0[0];sc.fog.far=S.fog0[1];sc.fog.color.copy(S.fog0[2]);}}
  if(sc.background&&sc.background.isColor){if(!S.bg0)S.bg0=sc.background.clone();sc.background.copy(S.bg0);if(ON){if(M.bgSky)sc.background.set(M.sky[M.sky.length-1][1]);sc.background.convertSRGBToLinear();}}}
// ---- faroles del Pueblo alrededor de la cancha (solo el Campo) ----
function lamps(){if(M.lamps!=='pueblo'||S.lampsLoading||S.lamps.length)return;S.lampsLoading=1;const root=G.root,hq=G.quality==='alta';
  const GLOW=radT('rgba(255,240,200,1)','rgba(255,170,80,.6)','rgba(255,120,30,0)'),POOL=radT('rgba(255,160,80,.22)','rgba(255,140,60,.1)','rgba(255,100,20,0)');
  new THREE.GLTFLoader().load('assets/arenas/pueblo/pueblo_farol.glb?v=213',gl=>{if(G.root!==root)return;const src=gl.scene,bb=new THREE.Box3().setFromObject(src),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3()),k=6/sz.y;
    for(const s of [-1,1])for(const x of [-27,-9,9,27]){const w=new THREE.Group(),m=src.clone(true);m.position.set(-c.x,-bb.min.y,-c.z);w.add(m);w.scale.setScalar(k);w.position.set(x,0,s*18.9);root.add(w);
      m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      const gl2=dyn(new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})));gl2.position.set(x,5.75,s*18.9);gl2.scale.setScalar(2.4);root.add(gl2);
      const pool=dyn(new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({map:POOL,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6})));
      pool.rotation.x=-Math.PI/2;pool.position.set(x,.05,s*17.6);pool.scale.setScalar(6.5);root.add(pool);
      let L=null;if(hq){L=dyn(new THREE.PointLight(0xff9a40,0,26,1.4));L.position.set(x,5.4,s*18.9-s*.5);root.add(L);}
      dyn(w);S.lamps.push({w,glow:gl2,pool,light:L});}
    lampsOn();scan();},undefined,e=>console.warn('faroles',e));}
function lampsOn(){for(const L of S.lamps){L.w.visible=L.glow.visible=L.pool.visible=ON;if(L.light){L.light.intensity=ON?1.4:0;L.light.color.set(0xff9a40).convertSRGBToLinear();}}}
// ---- fuego que alumbra de verdad (antorchas, braseros, faroles, velas, lava) ----
// Se toman los puntos de luz que la arena pasa (mod.luces) o se buscan solos: brillos y llamas (sprites que suman luz) cerca de la cancha.
const POOLF=radT('rgba(255,140,60,.34)','rgba(255,110,40,.14)','rgba(255,80,20,0)');
function fireSpots(){const mod=G.mod;if(mod&&mod.luces&&mod.luces.length)return mod.luces.filter(p=>p.k!=='reflector'&&p.k!=='antorcha').map(p=>({x:p.x,y:p.y,z:p.z,lava:p.k==='lava',col:p.k==='lava'?0xff5a1e:0xff7a30,given:1}));
  const pts=[],v=new THREE.Vector3();G.root.updateMatrixWorld(true);
  G.root.traverse(o=>{if(!o.isSprite||o.userData.gzLuz||!o.visible)return;const m=o.material;if(!m||m.blending!==THREE.AdditiveBlending)return;o.getWorldPosition(v);const sc=o.getWorldScale(new THREE.Vector3()).x;
    if(sc<.7||sc>9||v.y<.2||v.y>12||Math.abs(v.x)>70||Math.abs(v.z)>56)return;const c=m.color;if(c.b>c.r*.9)return;   // solo luz cálida (no luciérnagas azules ni brillos fríos)
    pts.push({x:v.x,y:v.y,z:v.z,c:c.clone()});});
  const cl=[];for(const p of pts){let q=cl.find(q=>Math.hypot(q.x-p.x,q.z-p.z)<2.2&&Math.abs(q.y-p.y)<2.5);if(!q){q={x:0,y:0,z:0,n:0,c:p.c};cl.push(q);}q.x+=p.x;q.y+=p.y;q.z+=p.z;q.n++;}
  return cl.map(q=>{const c=q.c;const warm=(c.r>.9&&c.g>.9&&c.b>.9)?0xffa050:c.getHex();return {x:q.x/q.n,y:q.y/q.n,z:q.z/q.n,lava:false,col:warm};});}
function firesInit(){if(!M.fire||S.fires.length)return;const sp=fireSpots();if(!sp.length)return;S.firesT=(S.firesT||0)+1;if(sp.length!==S.firesN&&S.firesT<10){S.firesN=sp.length;S.firesK=0;return;}if(++S.firesK<3&&S.firesT<10)return;   // espera a que la arena termine de armarse (las llamas cambian de tamaño: a los 10 s se toma lo que haya)
  const hq=G.quality!=='baja',nL=hq?(M.nL||6):3;
  const dOut=p=>p.given?Math.hypot(p.x,p.z*1.6):Math.hypot(Math.max(0,Math.abs(p.x)-32),Math.max(0,Math.abs(p.z)-16))+p.y*.3;   // las más cercanas a la cancha
  const near=sp.slice().sort((a,b)=>dOut(a)-dOut(b));
  const REAL=new Set(near.slice(0,nL));let lv=0;
  for(const p of sp){if(p.lava&&(lv++%2))continue;let light=null;
    if(REAL.has(p)){light=dyn(new THREE.PointLight(p.col,0,p.lava?16:15,1.6));light.position.set(p.x,p.y+(p.lava?.6:.3),p.z);G.root.add(light);}
    let pool=null;if(p.y<7){pool=dyn(new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({map:POOLF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6})));
      pool.rotation.x=-Math.PI/2;pool.position.set(p.x,.06,p.z);pool.scale.setScalar(p.lava?7.5:p.y>3?5.5:p.given?6.5:4.5);G.root.add(pool);}
    S.fires.push({light,pool,col:p.col,ph:Math.random()*6,base:p.lava?1.2:1});}
  firesOn();scan();}
function firesOn(){for(const f of S.fires){if(f.pool)f.pool.visible=ON;if(f.light){f.light.visible=ON;f.light.color.set(f.col).convertSRGBToLinear();}}}
// ---- reflectores (Playa de noche): dos luces blancas cálidas desde lo alto + focos que se ven en las esquinas + cancha más clara ----
function flood(){const F=M.flood;if(F&&!S.flood){S.flood={L:[],H:[],P:null};
    for(const d of F.dirs){const l=dyn(new THREE.DirectionalLight(0xffffff,0));l.position.set(d[0],d[1],d[2]);G.root.add(l);S.flood.L.push(l);}
    const HT=radT('rgba(255,236,190,1)','rgba(255,200,130,.5)','rgba(255,170,90,0)');
    for(const h of F.heads){const g=dyn(new THREE.Group());g.position.set(h[0],h[1],h[2]);
      for(let k=-1;k<=1;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:HT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(0,0,k*1.6*Math.sign(h[0]));sp.scale.setScalar(3.2);g.add(sp);}
      const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:HT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.35}));halo.scale.setScalar(16);g.add(halo);
      G.root.add(g);S.flood.H.push(g);}
    const PT=radT('rgba(255,214,150,1)','rgba(255,196,120,.55)','rgba(255,180,100,0)');   // la cancha iluminada: más clara al centro, se apaga hacia las orillas
    const pl=dyn(new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:PT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:F.pool,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6})));
    pl.rotation.x=-Math.PI/2;pl.position.y=.07;pl.scale.set(84,52,1);G.root.add(pl);S.flood.P=pl;}
  if(S.flood){for(const l of S.flood.L){l.visible=ON&&!!F;if(F){l.color.set(F.c).convertSRGBToLinear();l.intensity=F.i;}}for(const g of S.flood.H)g.visible=ON&&!!F;if(S.flood.P){S.flood.P.visible=ON&&!!F;if(F)S.flood.P.material.opacity=F.pool;}}}
// ---- capa de cine ----
function composer(){if(S.comp||G.quality!=='alta'||!THREE.EffectComposer||!THREE.UnrealBloomPass)return S.comp;try{const r=G.renderer,hf=r.capabilities.isWebGL2||r.extensions.has('EXT_color_buffer_half_float'),sz=r.getSize(new THREE.Vector2());
  const rt=new THREE.WebGLRenderTarget(sz.x*r.getPixelRatio(),sz.y*r.getPixelRatio(),{type:hf?THREE.HalfFloatType:THREE.UnsignedByteType});
  S.comp=new THREE.EffectComposer(r,rt);S.comp.addPass(new THREE.RenderPass(G.scene,G.camera));
  S.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(sz.x/(M.blq||4),sz.y/(M.blq||4)),M.bl[0],.65,M.bl[1]);S.comp.addPass(S.bloom);
  S.grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},uExp:{value:M.exp},uCon:{value:M.con},uSat:{value:M.sat},uTint:{value:new THREE.Vector3().fromArray(M.tint)}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform sampler2D tDiffuse;uniform float uExp,uCon,uSat;uniform vec3 uTint;varying vec2 vUv;\nvec3 enc(vec3 c){c=clamp(c,0.,1.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}\nvoid main(){vec3 c=enc(texture2D(tDiffuse,vUv).rgb*uExp*uTint);c=mix(c,c*c*(3.-2.*c),uCon);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);gl_FragColor=vec4(c,1.);}'});
  S.comp.addPass(S.grade);S.w=sz.x;S.h=sz.y;S.comp.setSize(sz.x,sz.y);}catch(e){console.warn('capa de cine',e);S.comp=null;}return S.comp;}
function scan(){if(!G)return;eachMat(m=>linMat(m,ON));}
function apply(){const r=G.renderer,useC=ON&&composer();
  r.outputEncoding=ON&&!useC?THREE.sRGBEncoding:THREE.LinearEncoding;r.toneMapping=ON&&!useC?THREE.LinearToneMapping:THREE.NoToneMapping;r.toneMappingExposure=ON?M.exp:1;
  if(S.grade){const u=S.grade.uniforms;u.uExp.value=M.exp;u.uCon.value=M.con;u.uSat.value=M.sat;u.uTint.value.fromArray(M.tint);}if(S.bloom){S.bloom.strength=M.bl[0];S.bloom.threshold=M.bl[1];}
  lights();sky();grass();lamps();lampsOn();firesOn();flood();scan();
  U.rim.value=ON?M.rim_i:0;if(ON&&M.rimLin)U.rimCol.value.setRGB(M.rimLin[0],M.rimLin[1],M.rimLin[2]);else{U.rimCol.value.set(ON?M.rim:0xffeed2);if(ON)U.rimCol.value.convertSRGBToLinear();}
  U.shade.value=ON?.64:1;U.spec.value=ON?.07:0;U.off.value=ON?1:0;U.sat.value=ON?1.05:1;
  if(!vig){vig=document.createElement('div');vig.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 52%,rgba(0,0,0,.42) 100%);opacity:0;transition:opacity .3s';document.body.appendChild(vig);}
  vig.style.opacity=ON?M.vig:0;}
const _k=new THREE.Vector3(),_t=new THREE.Vector3();let T=0;
window.GZ_LUZ={
  PROF,
  on(g){const n=g.n!=null?g.n:15;if(!PROF[n]){if(ON)this.off();return false;}
    if(G&&G.root!==g.root){if(ON){ON=false;apply();}resetS();}
    G=g;N=n;M=Object.assign({},PROF[n]);ON=true;apply();
    for(const dl of [500,1500,3500,7000])setTimeout(()=>{if(ON&&G===g)apply();},dl);return true;},
  off(){if(!G||!ON)return;ON=false;apply();},
  get active(){return ON;},get n(){return N;},
  profile(){return M;},
  tune(o){Object.assign(M,o);if(G)apply();},
  tick(dt,cx,cz){if(!ON||!G)return;T+=dt;scanT-=dt;if(scanT<=0){scanT=1;scan();if(!S.field&&M.grass||!S.sky&&!S.own)apply();firesInit();}
    const cam=G.camera;if(S.sun){_k.copy(S.sun.position).normalize().transformDirection(cam.matrixWorldInverse);U.key.value.copy(_k);}
    if(G.scene.fog){_t.set(cx||0,0,cz||0);const dl=cam.position.distanceTo(_t);G.scene.fog.near=dl+M.fogN;G.scene.fog.far=dl+M.fogF;}
    for(const f of S.fires)if(f.light)f.light.intensity=M.fire*f.base*(1+Math.sin(T*9+f.ph)*.06+Math.sin(T*23+f.ph*2)*.04);},
  render(){if(!ON||!S.comp)return false;const sz=G.renderer.getSize(new THREE.Vector2());if(sz.x!==S.w||sz.y!==S.h){S.w=sz.x;S.h=sz.y;S.comp.setSize(sz.x,sz.y);}S.comp.render();return true;}
};
})();
