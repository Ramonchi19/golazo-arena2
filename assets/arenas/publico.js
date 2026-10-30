// =====================================================================
// v204: PÚBLICO compartido para todas las arenas.
// El hincha 3D (rig Mixamo) se pone en 10 poses por código y se "fotografía" (de frente y de espalda) con 4 variantes
// de accesorios hechos por código: sin nada, gorro de lana, bandera, y gorra con guante del número uno.
// Cada hincha en la grada es una figura plana que mira a la cámara: se ve limpio y casi no pesa en el celular.
// Los brazos nunca tocan la cabeza: se mide la cabeza con la malla y, si una pose la tocaría, el brazo se abre lo justo.
// Nadie se encorva. La ropa azul (y los accesorios) se pintan del color de su equipo: media grada de cada equipo.
// uso: const P=GZ_CROWD({scene,renderer,seats,fog,teams:['#e2382b','#2f6fe0'],url}); P.update(dt,gk); P.react('gol'|'uy'|'triste'|'ola')
// seats: [{x,y,z,ry}] con y = piso del escalón donde se para (el centro del escalón, no la orilla)
// =====================================================================
window.GZ_CROWD=function(o){
const C={mesh:null,list:[],react,update,ready:false};
const scene=o.scene,renderer=o.renderer,seats=o.seats||[];if(!seats.length)return C;
const HH=o.height||1.3;   // alto del hincha (los jugadores miden ~2.4)
const TEAM=(o.teams||['#e2382b','#2f6fe0']).map(h=>new THREE.Color(h));
const SKINS=['#ffffff','#ffe6d8','#e8f4ff','#f0ffe8','#fff0f8','#f4e8ff'];
const NP=10,NV=4,CW=160,EL=.42,SF=1.6,FB=.06;   // celda de la foto, inclinación de la cámara, tamaño del cuadro (×alto) y dónde quedan los pies
const V=(x,y,z)=>new THREE.Vector3(x,y,z),MIR=v=>V(-v.x,v.y,v.z);
const DOWN=[V(.55,-.8,.15),V(.45,-.85,.25)],UP=[V(.8,.6,.12),V(.45,.88,.1)],CLAPO=[V(.45,-.35,.8),V(-.1,.15,.95)],CLAPC=[V(.25,-.3,.9),V(-.65,.1,.7)],UY=[V(.95,.2,.2),V(.4,.9,.15)],SAD=[V(.3,-1,.1),V(.15,-1,.2)];
const sym=a=>({l:a,r:[MIR(a[0]),MIR(a[1])]});
// 0 normal · 1 brazos arriba · 2-3 aplauso · 4-5 saludo · 6 ¡uy! · 7 triste · 8-9 puño
const FRAMES=[sym(DOWN),sym(UP),sym(CLAPO),sym(CLAPC),
  {l:DOWN,r:[V(-.45,.95,.15),V(-.85,.5,.15)]},{l:DOWN,r:[V(-.45,.95,.15),V(.15,1,.15)]},
  sym(UY),Object.assign(sym(SAD),{head:V(0,.62,.6)}),
  {l:DOWN,r:[V(-.7,.7,.15),V(-.45,.2,.85)]},{l:DOWN,r:[V(-.7,.7,.15),V(-.35,.95,.1)]}];
new THREE.GLTFLoader().load(o.url||'assets/arenas/publico/publico_hincha.glb?v=204',gl=>{try{build(gl);}catch(e){console.warn('público',e);}},undefined,e=>console.warn('público: falta el modelo',e));

function build(gl){
  const holder=new THREE.Group(),root=THREE.SkeletonUtils.clone(gl.scene);holder.add(root);const shot=new THREE.Scene();shot.add(holder);
  let sm=null;root.traverse(m=>{if(m.isSkinnedMesh&&!sm)sm=m;});if(!sm)return;root.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});
  const map=sm.material.map;if(map){map.encoding=THREE.LinearEncoding;map.needsUpdate=true;}
  sm.material=new THREE.MeshLambertMaterial({map,skinning:true});
  const bones={};sm.skeleton.bones.forEach(b=>{bones[b.name.replace(/^mixamorig:?/,'')]=b;});
  const rest=new Map();sm.skeleton.bones.forEach(b=>rest.set(b,b.quaternion.clone()));
  holder.updateMatrixWorld(true);const bb0=new THREE.Box3().setFromObject(root),hgt=bb0.max.y-bb0.min.y;
  const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_q=new THREE.Quaternion(),_pq=new THREE.Quaternion(),_wq=new THREE.Quaternion();
  function aim(bn,cn,dir){const b=bones[bn],c=bones[cn];if(!b||!c)return;holder.updateMatrixWorld(true);
    b.getWorldPosition(_a);c.getWorldPosition(_b);_q.setFromUnitVectors(_b.sub(_a).normalize(),dir.clone().normalize());
    b.getWorldQuaternion(_wq);b.parent.getWorldQuaternion(_pq);b.quaternion.copy(_pq.invert().multiply(_q.multiply(_wq)));holder.updateMatrixWorld(true);}
  // cabeza medida con la malla (sin la antena), guardada en coordenadas del hueso de la cabeza
  let head=null;{const g=sm.geometry,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,wn=(g.attributes.skinWeight.array instanceof Float32Array)?1:(g.attributes.skinWeight.array instanceof Uint8Array?1/255:1/65535),pa=g.attributes.position,bs=sm.skeleton.bones;
    const hb=new Set([bs.indexOf(bones.Head),bs.indexOf(bones.HeadTop_End)]),pts=[],v=new THREE.Vector3();
    for(let i=0;i<pa.count;i++){let w=0;for(let k=0;k<4;k++)if(hb.has(si.array[i*4+k]))w+=sw.array[i*4+k]*wn;if(w<.5)continue;v.fromBufferAttribute(pa,i);sm.boneTransform(i,v);v.applyMatrix4(sm.matrixWorld);pts.push(v.clone());}
    if(pts.length){pts.sort((a,b)=>a.y-b.y);const keep=pts.slice(0,Math.floor(pts.length*.92)),ctr=new THREE.Box3().setFromPoints(keep).getCenter(new THREE.Vector3());
      const ds=keep.map(p=>p.distanceTo(ctr)).sort((a,b)=>a-b);head={local:bones.Head.worldToLocal(ctr.clone()),r:ds[Math.floor(ds.length*.9)]};}}
  let hat=false;const _hc=new THREE.Vector3(),_e=new THREE.Vector3(),_h=new THREE.Vector3();
  function clearance(side){if(!head)return 1;bones.Head.updateWorldMatrix(true,false);_hc.copy(head.local).applyMatrix4(bones.Head.matrixWorld);
    bones[side+'ForeArm'].getWorldPosition(_e);bones[side+'Hand'].getWorldPosition(_h);const R=head.r*(hat?1.12:1.04)+_e.distanceTo(_h)*.34;let best=1e9;
    for(const k of [0,.5,1,1.5])best=Math.min(best,_e.clone().lerp(_h,k).distanceTo(_hc)-R);return best;}
  function armSafe(side,d1,d2){const sg=side==='Left'?1:-1;d1=d1.clone();d2=d2.clone();
    for(let it=0;it<14;it++){aim(side+'Arm',side+'ForeArm',d1);aim(side+'ForeArm',side+'Hand',d2);if(clearance(side)>=0)return;d1.x+=sg*.18;d2.x+=sg*.26;d1.normalize();d2.normalize();}}
  function setPose(F){for(const [b,q] of rest)b.quaternion.copy(q);holder.updateMatrixWorld(true);if(F.head)aim('Neck','Head',F.head);
    armSafe('Left',F.l[0],F.l[1]);armSafe('Right',F.r[0],F.r[1]);}
  // ----- accesorios (en azul de llave: el shader los pinta del color del equipo) -----
  const KEY='#2347ff',KEYD='#1630b8',L=c=>new THREE.MeshLambertMaterial({color:c});
  const T=(fn,w,h)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);return new THREE.CanvasTexture(cv);};
  const sc=hgt/1.5,gear=[];   // tamaños pensados para un muñeco de 1.5 de alto
  const onHead=g=>{if(!head)return;shot.add(g);g.position.copy(head.local.clone().applyMatrix4(bones.Head.matrixWorld));g.updateMatrixWorld(true);bones.Head.attach(g);};
  // 1: gorro de lana con franja blanca y pompón
  const beanie=new THREE.Group();if(head){const r=head.r*1.06;
    const d=new THREE.Mesh(new THREE.SphereGeometry(r,18,10,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshLambertMaterial({map:T((q,w,h)=>{q.fillStyle=KEY;q.fillRect(0,0,w,h);q.fillStyle='#fff';q.fillRect(0,h*.62,w,h*.12);},64,32)}));d.scale.y=1.18;d.position.y=r*.12;beanie.add(d);
    const cuff=new THREE.Mesh(new THREE.TorusGeometry(r*.97,r*.14,8,22),L('#ffffff'));cuff.rotation.x=Math.PI/2;cuff.position.y=r*.18;beanie.add(cuff);
    const pom=new THREE.Mesh(new THREE.IcosahedronGeometry(r*.3,1),L('#ffffff'));pom.position.y=r*1.3;beanie.add(pom);onHead(beanie);}
  // 3: gorra con visera
  const cap=new THREE.Group();if(head){const r=head.r*1.05;const d=new THREE.Mesh(new THREE.SphereGeometry(r,18,8,0,Math.PI*2,0,Math.PI*.5),L(KEY));d.position.y=r*.18;cap.add(d);
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(r*.75,r*.75,r*.06,18,1,false,-Math.PI/2,Math.PI),L(KEYD));brim.position.set(0,r*.2,r*.62);cap.add(brim);
    const btn=new THREE.Mesh(new THREE.SphereGeometry(r*.1,8,6),L('#ffffff'));btn.position.y=r*1.18;cap.add(btn);onHead(cap);}
  // 2: bandera (siempre derecha, en la mano derecha)
  const flag=new THREE.Group();{const Lp=.75*sc;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.02*sc,.02*sc,Lp,6),L('#7a5230'));pole.position.y=Lp/2-.12*sc;flag.add(pole);
    const t=T((q,w,h)=>{q.fillStyle=KEY;q.fillRect(0,0,w,h);q.fillStyle='#fff';q.fillRect(0,h*.4,w,h*.2);q.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?7:16;q.lineTo(w*.5+Math.cos(a)*rr,h*.5+Math.sin(a)*rr);}q.closePath();q.fillStyle='#ffd23a';q.fill();},128,80);
    const geo=new THREE.PlaneGeometry(.52*sc,.33*sc,6,1);geo.translate(.26*sc,0,0);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/sc*9)*.04*sc);
    const cl=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}));cl.position.y=Lp-.12*sc-.17*sc;flag.add(cl);shot.add(flag);}
  // 3: guante gigante del número uno (sigue a la mano derecha)
  const glove=new THREE.Group();{const m=new THREE.MeshLambertMaterial({map:T((q,w,h)=>{q.fillStyle=KEY;q.fillRect(0,0,w,h);q.fillStyle='#fff';q.font='bold 44px sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText('1',w/2,h*.55);},64,64)});
    const palm=new THREE.Mesh(new THREE.BoxGeometry(.2*sc,.17*sc,.1*sc),m);palm.position.y=.06*sc;glove.add(palm);
    const f=new THREE.Mesh(new THREE.CylinderGeometry(.04*sc,.045*sc,.24*sc,8),L(KEY));f.position.set(.04*sc,.25*sc,0);glove.add(f);
    const tp=new THREE.Mesh(new THREE.SphereGeometry(.04*sc,8,6),L(KEY));tp.position.set(.04*sc,.37*sc,0);glove.add(tp);
    bones.RightHand.add(glove);const ws=bones.RightHand.getWorldScale(new THREE.Vector3()).x;glove.scale.setScalar(1/ws);}
  const VAR=[{},{beanie:1},{flag:1},{cap:1,glove:1}];
  // ----- foto: hoja de NP poses × (NV variantes × frente/espalda) -----
  const rt=new THREE.WebGLRenderTarget(NP*CW,NV*2*CW,{format:THREE.RGBAFormat});
  shot.add(new THREE.HemisphereLight(0xffffff,0x8a7a90,.85));const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(.4,1,.8);shot.add(dl);
  const S=hgt*SF,cam=new THREE.OrthographicCamera(-S/2,S/2,S*(1-FB),-S*FB,.01,100),ctrX=(bb0.min.x+bb0.max.x)/2,ctrZ=(bb0.min.z+bb0.max.z)/2;
  root.position.set(-ctrX,-bb0.min.y,-ctrZ);holder.updateMatrixWorld(true);
  const oldT=renderer.getRenderTarget(),oldC=renderer.getClearColor(new THREE.Color()),oldA=renderer.getClearAlpha(),oldSc=renderer.getScissorTest();
  renderer.setRenderTarget(rt);renderer.setClearColor(0x000000,0);renderer.clear();
  for(let v=0;v<NV;v++){const Vv=VAR[v];beanie.visible=!!Vv.beanie;cap.visible=!!Vv.cap;flag.visible=!!Vv.flag;glove.visible=!!Vv.glove;hat=beanie.visible||cap.visible;
    for(let p=0;p<NP;p++){setPose(FRAMES[p]);
      if(flag.visible){bones.RightHand.getWorldPosition(flag.position);flag.rotation.set(0,0,0);}
      shot.updateMatrixWorld(true);
      for(let side=0;side<2;side++){const back=side===1;cam.position.set(0,Math.sin(EL)*10,(back?-1:1)*Math.cos(EL)*10);cam.lookAt(0,0,0);cam.updateProjectionMatrix();   // los pies quedan siempre en el mismo lugar de la foto
        const row=v*2+side;rt.viewport.set(p*CW,row*CW,CW,CW);rt.scissor.set(p*CW,row*CW,CW,CW);rt.scissorTest=true;renderer.setRenderTarget(rt);renderer.render(shot,cam);}}}
  rt.scissorTest=false;renderer.setRenderTarget(oldT);renderer.setClearColor(oldC,oldA);renderer.setScissorTest(oldSc);
  shot.traverse(m=>{if(m.isMesh&&!m.isSkinnedMesh){m.geometry.dispose();}});
  // ----- repartir a los hinchas -----
  const q=o.quality||((window.save&&save.settings&&save.settings.quality)||'media'),fill=q==='baja'?.55:q==='alta'?.95:.8;
  const list=seats.filter(()=>Math.random()<fill),N=list.length,c=new THREE.Color();
  const quad=new THREE.InstancedBufferGeometry(),base=new THREE.PlaneGeometry(1,1);base.translate(0,.5,0);quad.index=base.index;quad.setAttribute('position',base.attributes.position);quad.setAttribute('uv',base.attributes.uv);
  const aOff=new Float32Array(N*4),aTeam=new Float32Array(N*3),aSkin=new Float32Array(N*3),aVar=new Float32Array(N),aPose=new Float32Array(N);
  const teamOf=o.teamOf||(s=>{const side=s.x<0?0:1;return Math.random()<.85?side:1-side;});
  list.forEach((s,i)=>{aOff[i*4]=s.x+(Math.random()-.5)*.25;aOff[i*4+1]=s.y;aOff[i*4+2]=s.z+(Math.random()-.5)*.12;aOff[i*4+3]=s.ry;
    const tm=teamOf(s);TEAM[tm].toArray(aTeam,i*3);c.set(SKINS[Math.floor(Math.random()*SKINS.length)]).toArray(aSkin,i*3);
    const r=Math.random();aVar[i]=r<.38?0:r<.62?1:r<.8?2:3;aPose[i]=Math.random()<.15?1:0;C.list.push({i,t:Math.random()*4,team:tm});});
  quad.setAttribute('aOff',new THREE.InstancedBufferAttribute(aOff,4));quad.setAttribute('aTeam',new THREE.InstancedBufferAttribute(aTeam,3));
  quad.setAttribute('aSkin',new THREE.InstancedBufferAttribute(aSkin,3));quad.setAttribute('aVar',new THREE.InstancedBufferAttribute(aVar,1));
  const pz=new THREE.InstancedBufferAttribute(aPose,1);pz.setUsage(THREE.DynamicDrawUsage);quad.setAttribute('aPose',pz);quad.instanceCount=N;
  const fog=o.fog||{color:new THREE.Color(0x000000),near:1e6,far:2e6};
  C.uni={uAtlas:{value:rt.texture},uTime:{value:0},uHype:{value:0},uOla:{value:0},uOlaOn:{value:0},uNP:{value:NP},uNV:{value:NV},uSize:{value:HH*SF/Math.cos(EL)},uFB:{value:FB},
    uLight:{value:new THREE.Color(o.light||0xffffff)},fogColor:{value:fog.color},fogNear:{value:fog.near},fogFar:{value:fog.far}};
  const mat=new THREE.ShaderMaterial({uniforms:C.uni,
    vertexShader:`attribute vec4 aOff;attribute vec3 aTeam,aSkin;attribute float aPose,aVar;uniform float uTime,uHype,uSize,uOla,uOlaOn,uNP,uNV,uFB;
      varying vec2 vUv;varying vec3 vTeam,vSkin;varying float vFog;
      float h1(float x){return fract(sin(x*127.1)*43758.5);}
      void main(){float ph=h1(aOff.x*3.1+aOff.z*7.7),sp=.8+h1(aOff.z*1.3+aOff.x)*.6,A=aPose;
        // 0 normal · 1 aplaudir · 2 saludar · 3 festejar · 4 ¡uy! · 5 triste · 6 puño
        float fr=0.,bob=abs(sin(uTime*sp*2.2+ph*6.28))*.03,jump=0.;
        if(A>.5&&A<1.5){fr=2.+step(.5,fract(uTime*4.5*sp+ph));bob=.02;}
        else if(A>1.5&&A<2.5){fr=4.+step(.5,fract(uTime*2.2*sp+ph));}
        else if(A>2.5&&A<3.5){fr=1.;jump=abs(sin(uTime*(6.+sp*2.)+ph*6.28))*(.45+uHype*.4);}
        else if(A>3.5&&A<4.5){fr=6.;bob=abs(sin(uTime*9.+ph*6.28))*.025;}
        else if(A>4.5&&A<5.5){fr=7.;bob=0.;}
        else if(A>5.5){fr=8.+step(.5,fract(uTime*3.*sp+ph));jump=fr>8.5?.06:0.;}
        float ang=atan(aOff.z,aOff.x),d=abs(mod(ang-uOla+3.14159,6.28318)-3.14159),ola=uOlaOn*smoothstep(.45,.05,d);if(ola>.35)fr=1.;
        vec3 base=aOff.xyz+vec3(0.,bob+jump+ola*.6,0.);
        vec2 tc=normalize((cameraPosition-base).xz);vec3 right=normalize(vec3(tc.y,0.,-tc.x));
        vec2 face=vec2(sin(aOff.w),cos(aOff.w));float back=step(dot(face,tc),-.15);
        vec3 wp=base+right*(position.x*uSize)+vec3(0.,(position.y-uFB)*uSize,0.)+vec3(tc.x,0.,tc.y)*.25;   // un poquito hacia la cámara: nunca se mete en el escalón de atrás
        vUv=vec2((uv.x+fr)/uNP,(uv.y+aVar*2.+back)/(uNV*2.));vTeam=aTeam;vSkin=aSkin;
        vec4 mv=viewMatrix*vec4(wp,1.);vFog=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform sampler2D uAtlas;uniform vec3 uLight,fogColor;uniform float fogNear,fogFar;varying vec2 vUv;varying vec3 vTeam,vSkin;varying float vFog;
      void main(){vec4 t=texture2D(uAtlas,vUv);if(t.a<.5)discard;vec3 c=t.rgb/max(t.a,.001);
        float key=smoothstep(.06,.2,c.b-max(c.r,c.g)),lum=dot(c,vec3(.3,.59,.11));
        float sk=(1.-key)*smoothstep(.05,.15,c.r-c.b)*smoothstep(.45,.7,lum);
        c=mix(c,c*vSkin,sk);c=mix(c,vTeam*clamp(lum*2.3,.35,1.25),key);c*=uLight;
        c=mix(c,fogColor,smoothstep(fogNear,fogFar,vFog));gl_FragColor=vec4(c,1.);}`});
  const m=new THREE.Mesh(quad,mat);m.frustumCulled=false;m.userData.crowd=1;m.userData.anim=1;scene.add(m);C.mesh=m;C.pose=pz;C.ready=true;
  console.log('público',N,'hinchas');}

const REACT={gol:[[3,.55],[6,.25],[1,.2]],uy:[[4,.8],[0,.2]],triste:[[5,.75],[0,.25]]};
let olaT=0;
function pick(tbl){let r=Math.random();for(const [a,w] of tbl){if((r-=w)<=0)return a;}return tbl[0][0];}
// react('gol',equipo): festeja la afición de ese equipo y la otra se pone triste
function react(kind,team){if(!C.mesh)return;if(kind==='ola'){olaT=9;C.uni.uOla.value=-Math.PI;return;}
  if(!REACT[kind])return;const a=C.pose.array;
  for(const h of C.list){const k=kind==='gol'&&team!=null&&h.team!==team?'triste':kind;a[h.i]=pick(REACT[k]);h.t=(k==='gol'?4:k==='uy'?1.8:3.5)+Math.random()*.8;}C.pose.needsUpdate=true;}
function update(dt,gk){if(!C.mesh)return;C.uni.uTime.value+=dt;C.uni.uHype.value=gk>0?Math.min(1,gk*1.4):0;
  if(olaT>0){olaT-=dt;C.uni.uOla.value+=dt*1.6;C.uni.uOlaOn.value=Math.min(1,olaT,(9-olaT)*2);}else C.uni.uOlaOn.value=0;
  let ch=false;const a=C.pose.array;
  for(const h of C.list){h.t-=dt;if(h.t>0)continue;h.t=2+Math.random()*5;const r=Math.random();a[h.i]=r<.7?0:r<.84?1:r<.94?2:6;ch=true;}
  if(ch)C.pose.needsUpdate=true;}
return C;};
