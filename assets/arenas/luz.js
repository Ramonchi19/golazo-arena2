// =====================================================================
// v213: LUZ NUEVA (por ahora solo en la arena Campo, con el atardecer suave aprobado en la "Prueba de luz").
// - Color correcto de pantalla: los colores de materiales y texturas se pasan a espacio lineal y la salida va en sRGB.
// - Luz de atardecer suave: sol dorado a media altura, cielo durazno, sombras largas pero sin tapar la cancha.
// - Pasto con el color de la imagen de pasto (más clarito y amarillo), cuadros podados, espirales, remolino y corona.
// - Personajes: volumen (lado de sol / lado de sombra), contorno de luz, tela mate, sin el auto-brillo de antes.
// - Faroles del Pueblo alrededor de la cancha que alumbran de verdad (8 luces en calidad alta; brillo y charcos en las demás).
// - Capa de cine (calidad alta): resplandor suave, contraste y un toque cálido. Viñeta suave en todas.
// uso: GZ_LUZ.on({scene,renderer,camera,root,quality}) · GZ_LUZ.off() · GZ_LUZ.tick(dt,cx,cz) · GZ_LUZ.render() -> true si dibujó
// =====================================================================
(function(){
if(typeof THREE==='undefined')return;
// colores de vértice en lineal cuando el material lo pide (público de hongos, piezas pintadas por vértice)
if(!THREE.ShaderChunk.color_vertex.includes('GZ_LIN'))THREE.ShaderChunk.color_vertex+='\n#if defined(GZ_LIN) && (defined(USE_COLOR) || defined(USE_INSTANCING_COLOR))\n vColor.xyz=pow(max(vColor.xyz,vec3(0.)),vec3(2.2));\n#endif\n';
// uniformes de los personajes (los usa selfLit en index.html; neutros cuando la luz nueva está apagada)
const U=window.GZ_LUZ_U=window.GZ_LUZ_U||{rim:{value:0},off:{value:0},sat:{value:1},rimCol:{value:new THREE.Color(1,.93,.8)},key:{value:new THREE.Vector3(0,1,0)},shade:{value:1},spec:{value:0}};
const MOOD={hs:0xdcdcea,hg:0x8c9a4a,hk:.95,sc:0xffd2a0,sk:.95,sp:[48,32,-24],sky:['#4f6fb8','#97a9d6','#e9c2a4','#f7dcb8'],fog:0xe6cdb8,tint:[1.02,1,.97],bl:[.45,.8],sun:0xffc890,
  exp:1.02,sun_i:.74,hem_i:.42,rim:.2,vig:.6};
const ENC=new WeakMap();let G=null,ON=false,scanT=0,vig=null;
const S={field:null,g0:null,g1:null,sky:null,sky0:null,sky1:null,hemi:null,sun:null,lamps:[],comp:null,bloom:null,grade:null,fog0:null,sunspr:null,col:null,w:0,h:0};
function eachMat(f){const seen=new Set();G.scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){if(m&&!seen.has(m)){seen.add(m);f(m);}}});}
// pasa un material a lineal (una sola vez) o lo regresa como estaba
function linMat(m,on){const ud=m.userData;if(on&&ud._lz)return;if(!on&&!ud._lz)return;
  for(const k of ['color','emissive']){if(!m[k]||!m[k].isColor)continue;if(on){ud['_lz'+k]=m[k].clone();m[k].convertSRGBToLinear();}else if(ud['_lz'+k])m[k].copy(ud['_lz'+k]);}
  for(const k of ['map','emissiveMap']){const t=m[k];if(!t)continue;if(!ENC.has(t))ENC.set(t,t.encoding);const want=on?THREE.sRGBEncoding:ENC.get(t);if(t.encoding!==want){t.encoding=want;}}
  if(on){m.defines=Object.assign({},m.defines||{},{GZ_LIN:''});}else if(m.defines)delete m.defines.GZ_LIN;
  if(ud.selfLit&&'roughness' in m){if(on){ud._lzr=m.roughness;m.roughness=.88;}else if(ud._lzr!=null)m.roughness=ud._lzr;}
  ud._lz=on?1:0;m.needsUpdate=true;}
// ---- pasto ----
function grass(){if(!S.field){G.scene.traverse(o=>{const t=o.isMesh&&o.material&&o.material.map;if(!S.field&&t&&t.image&&t.image.width===1728&&t.image.height===1152)S.field=o;});if(!S.field)return;S.g0=S.field.material.map;}
  if(!S.g1){const src=S.g0.image,W=src.width,H=src.height,PX=24;
    const o=document.createElement('canvas');o.width=W;o.height=H;const og=o.getContext('2d');og.drawImage(src,0,0);const od=og.getImageData(0,0,W,H).data;
    const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.filter='blur(2.5px)';g.drawImage(src,0,0);g.filter='none';
    const id=g.getImageData(0,0,W,H),d=id.data;const Ls=[];
    for(let k=0;k<d.length;k+=4*97){const mx=Math.max(od[k],od[k+1],od[k+2]),mn=Math.min(od[k],od[k+1],od[k+2]);if(mx>185&&mx-mn<60)continue;Ls.push(d[k]*.3+d[k+1]*.59+d[k+2]*.11);}
    Ls.sort((a,b)=>a-b);const l0=Ls[Math.floor(Ls.length*.05)],l1=Ls[Math.floor(Ls.length*.95)];
    const pc=document.createElement('canvas');pc.width=W;pc.height=H;const p=pc.getContext('2d');const X=x=>(x+36)*PX,Z=z=>(z+24)*PX;
    p.fillStyle='rgb(128,128,128)';p.fillRect(0,0,W,H);
    for(let k=0,x=-36;x<36;x+=4,k++){p.fillStyle=k%2?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';p.fillRect(X(x),0,4*PX,H);}
    const spiral=(cx,cz,r,turns,dir,col)=>{p.strokeStyle=col;p.lineWidth=.7*PX;p.lineCap='round';p.beginPath();const n=220;for(let i=0;i<=n;i++){const t=i/n,a=dir*t*turns*6.283,rr=r*t;const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;i?p.lineTo(X(x),Z(z)):p.moveTo(X(x),Z(z));}p.stroke();};
    spiral(19,-11,3.4,2.2,1,'rgba(0,30,0,.12)');spiral(19,11,3.4,2.2,-1,'rgba(0,30,0,.12)');spiral(-17,0,7,1.6,1,'rgba(0,30,0,.09)');
    // corona grande acostada al centro, con las puntas hacia la portería izquierda (como en Strikers)
    p.fillStyle='rgba(255,255,230,.08)';p.strokeStyle='rgba(255,255,230,.12)';p.lineWidth=.35*PX;p.lineJoin='round';p.beginPath();
    p.moveTo(X(11),Z(-8));p.lineTo(X(6),Z(-8));p.lineTo(X(-3),Z(-9.5));p.lineTo(X(2),Z(-4.2));p.lineTo(X(-5),Z(0));p.lineTo(X(2),Z(4.2));p.lineTo(X(-3),Z(9.5));p.lineTo(X(6),Z(8));p.lineTo(X(11),Z(8));p.closePath();p.fill();p.stroke();
    p.fillStyle='rgba(255,255,230,.12)';for(const [x,z] of [[-3,-9.5],[-5,0],[-3,9.5]]){p.beginPath();p.arc(X(x),Z(z),.9*PX,0,7);p.fill();}   // bolitas en las puntas
    p.fillStyle='rgba(0,30,0,.08)';p.fillRect(X(7.6),Z(-8),1.4*PX,16*PX);   // banda de la base
    const pd=p.getImageData(0,0,W,H).data;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4;const mx=Math.max(od[k],od[k+1],od[k+2]),mn=Math.min(od[k],od[k+1],od[k+2]),line=(mx>185&&mx-mn<60)?255:0;
      let t=((d[k]*.3+d[k+1]*.59+d[k+2]*.11)-l0)/((l1-l0)||1);t=Math.max(0,Math.min(1,t));d[k]=Math.max(0,Math.min(255,pd[k]*(1+(t-.5)*.34)));d[k+1]=line;d[k+2]=0;}
    g.putImageData(id,0,0);S.g1=new THREE.CanvasTexture(c);S.g1.anisotropy=S.g0.anisotropy;S.g1.encoding=THREE.LinearEncoding;ENC.set(S.g1,THREE.LinearEncoding);
    S.col=new THREE.TextureLoader().load('assets/arenas/campo/pasto_color.png?v=213');S.col.wrapS=S.col.wrapT=THREE.RepeatWrapping;S.col.anisotropy=G.renderer.capabilities.getMaxAnisotropy();
    const m=S.field.material,prev=m.onBeforeCompile,pk=m.customProgramCacheKey,UD={c:{value:S.col},on:{value:1},rep:{value:new THREE.Vector2(72/1.6,48/1.6)}};S.ud=UD;
    m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);sh.uniforms.tCol=UD.c;sh.uniforms.uOn=UD.on;sh.uniforms.uRep=UD.rep;
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tCol;uniform float uOn;uniform vec2 uRep;')
        .replace('#include <map_fragment>','#include <map_fragment>\nif(uOn>.5){vec4 g1=texture2D(map,vUv);vec3 tc=pow(texture2D(tCol,vUv*uRep).rgb,vec3(2.2))*vec3(1.36,1.2,.74);diffuseColor.rgb=mix(tc*g1.r*2.,vec3(.86),smoothstep(.3,.7,g1.g));}');};
    m.customProgramCacheKey=()=>(pk?pk.call(m):'')+'-luz';}
  const want=ON?S.g1:S.g0;if(S.ud)S.ud.on.value=ON?1:0;if(S.field.material.map!==want){S.field.material.map=want;S.field.material.needsUpdate=true;}}
// ---- cielo y sol del cielo ----
function sky(){if(!S.sky){G.root.traverse(o=>{if(!S.sky&&o.isMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.radius===300&&o.material.side===THREE.BackSide)S.sky=o;});if(!S.sky)return;S.sky0=S.sky.material.map;}
  if(!S.sky1){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d'),r=g.createLinearGradient(0,0,0,256);
    r.addColorStop(0,MOOD.sky[0]);r.addColorStop(.42,MOOD.sky[1]);r.addColorStop(.8,MOOD.sky[2]);r.addColorStop(1,MOOD.sky[3]);g.fillStyle=r;g.fillRect(0,0,16,256);S.sky1=new THREE.CanvasTexture(c);S.sky1.encoding=THREE.sRGBEncoding;ENC.set(S.sky1,THREE.sRGBEncoding);}
  const want=ON?S.sky1:S.sky0;if(S.sky.material.map!==want){S.sky.material.map=want;S.sky.material.needsUpdate=true;}
  if(!S.sunspr)G.root.traverse(o=>{if(!S.sunspr&&o.isSprite&&o.position.x===240)S.sunspr={o,p:o.position.clone(),c:o.material.color.clone(),s:o.scale.clone()};});
  if(S.sunspr){const z=S.sunspr;z.o.position.copy(z.p);z.o.material.color.copy(z.c);z.o.scale.copy(z.s);if(ON){z.o.position.fromArray(MOOD.sp).normalize().multiplyScalar(270);z.o.material.color.set(MOOD.sun);z.o.scale.multiplyScalar(1.5);}}}
// ---- luces de la arena ----
function lights(){if(!S.hemi||!S.sun){G.root.traverse(o=>{if(o.isHemisphereLight&&!S.hemi)S.hemi=o;if(o.isDirectionalLight&&o.castShadow&&!S.sun)S.sun=o;});
    if(S.hemi&&!S.hemi.userData.lz0)S.hemi.userData.lz0=[S.hemi.color.clone(),S.hemi.groundColor.clone(),S.hemi.intensity];if(S.sun&&!S.sun.userData.lz0)S.sun.userData.lz0=[S.sun.color.clone(),S.sun.intensity,S.sun.position.clone()];}
  if(S.hemi){const z=S.hemi.userData.lz0;if(ON){S.hemi.color.set(MOOD.hs).convertSRGBToLinear();S.hemi.groundColor.set(MOOD.hg).convertSRGBToLinear();S.hemi.intensity=MOOD.hem_i*MOOD.hk;}else{S.hemi.color.copy(z[0]);S.hemi.groundColor.copy(z[1]);S.hemi.intensity=z[2];}}
  if(S.sun){const z=S.sun.userData.lz0;if(ON){S.sun.color.set(MOOD.sc).convertSRGBToLinear();S.sun.intensity=MOOD.sun_i*MOOD.sk;S.sun.position.fromArray(MOOD.sp);}else{S.sun.color.copy(z[0]);S.sun.intensity=z[1];S.sun.position.copy(z[2]);}}
  const sc=G.scene;if(sc.fog){if(!S.fog0)S.fog0=[sc.fog.near,sc.fog.far,sc.fog.color.clone()];if(ON)sc.fog.color.set(MOOD.fog).convertSRGBToLinear();else{sc.fog.near=S.fog0[0];sc.fog.far=S.fog0[1];sc.fog.color.copy(S.fog0[2]);}}
  if(sc.background&&sc.background.isColor){if(!S.bg0)S.bg0=sc.background.clone();sc.background.copy(S.bg0);if(ON)sc.background.convertSRGBToLinear();}}
// ---- faroles del Pueblo con luz naranja ----
const radT=(a,b,c)=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,a);r.addColorStop(.45,b);r.addColorStop(1,c);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv);};
function lamps(){if(S.lampsLoading||S.lamps.length)return;S.lampsLoading=1;const root=G.root,hq=G.quality==='alta';
  const GLOW=radT('rgba(255,240,200,1)','rgba(255,170,80,.6)','rgba(255,120,30,0)'),POOL=radT('rgba(255,160,80,.22)','rgba(255,140,60,.1)','rgba(255,100,20,0)');
  new THREE.GLTFLoader().load('assets/arenas/pueblo/pueblo_farol.glb?v=213',gl=>{if(G.root!==root)return;const src=gl.scene,bb=new THREE.Box3().setFromObject(src),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3()),k=6/sz.y;
    for(const s of [-1,1])for(const x of [-27,-9,9,27]){const w=new THREE.Group(),m=src.clone(true);m.position.set(-c.x,-bb.min.y,-c.z);w.add(m);w.scale.setScalar(k);w.position.set(x,0,s*18.9);root.add(w);
      m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      const gl2=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));gl2.position.set(x,5.75,s*18.9);gl2.scale.setScalar(2.4);root.add(gl2);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({map:POOL,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}));
      pool.rotation.x=-Math.PI/2;pool.position.set(x,.05,s*17.6);pool.scale.setScalar(6.5);root.add(pool);
      let L=null;if(hq){L=new THREE.PointLight(0xff9a40,0,26,1.4);L.position.set(x,5.4,s*18.9-s*.5);root.add(L);}
      for(const o of [gl2,pool])o.userData.gzDyn=1;w.userData.gzDyn=1;S.lamps.push({w,glow:gl2,pool,light:L});}
    lampsOn();scan();},undefined,e=>console.warn('faroles',e));}
function lampsOn(){for(const L of S.lamps){L.w.visible=L.glow.visible=L.pool.visible=ON;if(L.light){L.light.intensity=ON?1.4:0;L.light.color.set(0xff9a40).convertSRGBToLinear();}}}
// ---- capa de cine ----
function composer(){if(S.comp||G.quality!=='alta'||!THREE.EffectComposer||!THREE.UnrealBloomPass)return S.comp;try{const r=G.renderer,hf=r.capabilities.isWebGL2||r.extensions.has('EXT_color_buffer_half_float'),sz=r.getSize(new THREE.Vector2());
  const rt=new THREE.WebGLRenderTarget(sz.x*r.getPixelRatio(),sz.y*r.getPixelRatio(),{type:hf?THREE.HalfFloatType:THREE.UnsignedByteType});
  S.comp=new THREE.EffectComposer(r,rt);S.comp.addPass(new THREE.RenderPass(G.scene,G.camera));
  S.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(sz.x/2,sz.y/2),MOOD.bl[0],.65,MOOD.bl[1]);S.comp.addPass(S.bloom);
  S.grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},uExp:{value:MOOD.exp},uCon:{value:.22},uSat:{value:1.06},uTint:{value:new THREE.Vector3().fromArray(MOOD.tint)}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform sampler2D tDiffuse;uniform float uExp,uCon,uSat;uniform vec3 uTint;varying vec2 vUv;\nvec3 enc(vec3 c){c=clamp(c,0.,1.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}\nvoid main(){vec3 c=enc(texture2D(tDiffuse,vUv).rgb*uExp*uTint);c=mix(c,c*c*(3.-2.*c),uCon);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);gl_FragColor=vec4(c,1.);}'});
  S.comp.addPass(S.grade);S.w=sz.x;S.h=sz.y;S.comp.setSize(sz.x,sz.y);}catch(e){console.warn('capa de cine',e);S.comp=null;}return S.comp;}
function scan(){if(!G)return;eachMat(m=>linMat(m,ON));}
function apply(){const r=G.renderer,useC=ON&&composer();
  r.outputEncoding=ON&&!useC?THREE.sRGBEncoding:THREE.LinearEncoding;r.toneMapping=ON&&!useC?THREE.LinearToneMapping:THREE.NoToneMapping;r.toneMappingExposure=ON?MOOD.exp:1;
  lights();sky();grass();lampsOn();scan();
  U.rim.value=ON?MOOD.rim:0;U.shade.value=ON?.64:1;U.spec.value=ON?.07:0;U.off.value=ON?1:0;U.sat.value=ON?1.05:1;
  if(!vig){vig=document.createElement('div');vig.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 52%,rgba(0,0,0,.42) 100%);opacity:0;transition:opacity .3s';document.body.appendChild(vig);}
  vig.style.opacity=ON?MOOD.vig:0;}
const _k=new THREE.Vector3(),_t=new THREE.Vector3();
window.GZ_LUZ={
  on(g){G=g;ON=true;S.field=S.g0=S.g1=S.sky=S.sky0=S.sunspr=S.hemi=S.sun=null;S.lamps=[];S.lampsLoading=0;S.fog0=S.bg0=null;apply();lamps();
    for(const dl of [500,1500,3500,7000])setTimeout(()=>{if(ON&&G===g)apply();},dl);},
  off(){if(!G||!ON)return;ON=false;apply();},
  get active(){return ON;},
  tick(dt,cx,cz){if(!ON||!G)return;scanT-=dt;if(scanT<=0){scanT=1;scan();if(!S.field||!S.sky)apply();}
    const cam=G.camera;if(S.sun){_k.copy(S.sun.position).normalize().transformDirection(cam.matrixWorldInverse);U.key.value.copy(_k);}
    if(G.scene.fog){_t.set(cx||0,0,cz||0);const dl=cam.position.distanceTo(_t);G.scene.fog.near=dl+60;G.scene.fog.far=dl+900;}},
  render(){if(!ON||!S.comp)return false;const sz=G.renderer.getSize(new THREE.Vector2());if(sz.x!==S.w||sz.y!==S.h){S.w=sz.x;S.h=sz.y;S.comp.setSize(sz.x,sz.y);}S.comp.render();return true;}
};
})();
