// ===== Titanes en 3D para BUSCAR RIVAL, VS y VICTORIA/DERROTA =====
// Un solo dibujador WebGL para todo: cada vista se dibuja en su cuadrito de un "atlas" y se copia a su propio <canvas> 2D
// (así la tarjeta puede ir inclinada/recortada con CSS). Modo LIGERO: cada vista se dibuja UNA vez, se guarda como imagen y
// se suelta de la memoria; la respiración se hace con CSS (teléfonos de gama baja).
(function(){
// en el juego los modelos van en binario (.glb), sin base64
const b64=u=>fetch(u.replace(/\.txt$/,'')).then(r=>{if(!r.ok)throw new Error(u);return r.arrayBuffer();});
const parse=buf=>new Promise((res,rej)=>new THREE.GLTFLoader().parse(buf,'',res,rej));
const ls=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}},lw=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
// ---------- color vivo: más saturación y contraste en las texturas + sin el tono "lavado" del mapeo ACES ----------
const VIVO=()=>ls('tc_vivo','1')==='1';
function aviva(obj,px){if(obj.userData._aviv===(px||0))return;obj.userData._aviv=px||0;const hechos=new Map(),viv=VIVO();
  obj.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of [].concat(o.material)){const t=m.map;if(!t||!t.image)continue;
    if(!hechos.has(t)){const im=t.image,w=im.width||im.naturalWidth,h=im.height||im.naturalHeight;if(!w||(!viv&&(!px||w<=px))){hechos.set(t,t);continue;}
      const W=px&&w>px?px:w,H=Math.round(W*h/w),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
      if(viv)x.filter='saturate(1.35) contrast(1.08) brightness(1.03)';x.drawImage(im,0,0,W,H);
      const nt=new THREE.CanvasTexture(c);nt.flipY=t.flipY;nt.encoding=THREE.sRGBEncoding;nt.wrapS=t.wrapS;nt.wrapT=t.wrapT;nt.anisotropy=4;t.dispose();hechos.set(t,nt);}
    m.map=hechos.get(t);m.needsUpdate=true;}});}
function render0(R){R.outputEncoding=THREE.sRGBEncoding;
  if(VIVO()){R.toneMapping=THREE.NoToneMapping;R.toneMappingExposure=1;}else{R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;}}
function luces(sc){const viv=VIVO();
  sc.add(new THREE.HemisphereLight(0xeef4ff,0x3a3050,viv?.85:1.0));
  const sol=new THREE.DirectionalLight(0xfff4e6,viv?1.25:1.6);sol.position.set(2.5,5,6);sc.add(sol);
  const b1=new THREE.DirectionalLight(0x9fd8ff,viv?1.0:1.2);b1.position.set(-4,3,-5);sc.add(b1);
  const b2=new THREE.DirectionalLight(0xffc89a,viv?.8:.9);b2.position.set(4,2,-4);sc.add(b2);}
window.COLOR3D={aviva,render0,luces,VIVO,setVivo:v=>lw('tc_vivo',v?'1':'0')};

let R=null,scene=null,clock=null,raf=0,VIS=[],fpsN=0,fpsT=0;const CACHE={},CARGA={};
const ligero=()=>ls('tc_ligero','0')==='1',setLigero=v=>lw('tc_ligero',v?'1':'0');
function base(){if(R)return;
  R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});R.setPixelRatio(1);render0(R);R.setClearColor(0,0);R.autoClear=false;
  scene=new THREE.Scene();clock=new THREE.Clock();luces(scene);}
// tipos: 'u' completo · 'l' textura 512 · 'v' modelo de victoria del capitán (trae su animación) · 'k' modelo triste del capitán
const ARCH={u:'u_',l:'u_',v:'v_',k:'l_'};
function cargar(id,tipo){const k=tipo+id;if(CARGA[k])return CARGA[k];
  return CARGA[k]=b64('a/m/'+ARCH[tipo]+id+'.glb.txt').then(parse).then(g=>{aviva(g.scene,tipo==='l'?512:0);
    if(tipo==='v'&&id==='turbo'&&window.vueltaCompleta)g.animations[0]=vueltaCompleta(g.animations[0]);CACHE[k]=g;return g;});}
const listo=(id,tipo)=>!!CACHE[tipo+id];
// prepara un modelo: altura 2.8 · respiración ida y vuelta · de frente (cabeza mirando a la cámara)
// acc: 'idle' (default) · 'victoria' (anima una vez y luego respira con idleClip) · 'lamento' (anima una vez y se queda abajo)
function preparar(g,acc,idleClip,id){
  const m=g.scene;m.traverse(o=>{if(o.isMesh&&!o.userData.esContorno){o.frustumCulled=false;if(o.material){o.material.side=THREE.DoubleSide;if(o.material.color)o.material.color.setScalar(1);}}});
  m.scale.setScalar(1);m.position.set(0,0,0);m.rotation.y=0;m.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(m),s=2.8*((id&&window.ESTATURA&&ESTATURA[id])||1)/((box.max.y-box.min.y)||1);m.scale.setScalar(s);m.position.y=-box.min.y*s;
  const mixer=new THREE.AnimationMixer(m);let cab=null;m.traverse(o=>{if(o.isBone&&/Head$/.test(o.name)&&!cab)cab=o;});
  const clipIdle=idleClip||g.animations[0];let rotBase=0;
  if(clipIdle){const a=mixer.clipAction(clipIdle);a.setLoop(THREE.LoopPingPong,Infinity);a.play();
    if(cab){m.updateMatrixWorld(true);const q0=cab.getWorldQuaternion(new THREE.Quaternion()).invert();let sx=0,sz=0;const qa=new THREE.Quaternion(),f=new THREE.Vector3(),D=clipIdle.duration;
      for(let i=0;i<12;i++){mixer.setTime(D*i/12);m.updateMatrixWorld(true);cab.getWorldQuaternion(qa);f.set(0,0,1).applyQuaternion(qa.multiply(q0));sx+=f.x;sz+=f.z;}
      rotBase=-Math.atan2(sx,sz);}
    mixer.setTime(Math.random()*clipIdle.duration);
    if(acc==='victoria'||acc==='lamento'){const ani=g.animations[0];mixer.stopAllAction();const b=mixer.clipAction(ani);b.setLoop(THREE.LoopOnce,1);b.clampWhenFinished=true;b.reset().play();
      if(acc==='victoria'){const ia=mixer.clipAction(clipIdle);ia.setLoop(THREE.LoopPingPong,Infinity);
        mixer.addEventListener('finished',e=>{if(e.action===b){ia.reset();ia.setEffectiveWeight(1);ia.play();b.crossFadeTo(ia,.6,false);}});}}}
  if(window.CONTORNO)CONTORNO.poner(m);m.rotation.y=rotBase;return {m,mixer,rotBase,y0:m.position.y};}
// ---------- vistas ----------
// tarjetas: [{cv,id,tipo,enc:'cintura'|'cuerpo'}] · una cámara por tarjeta, el titán mira a la cámara
function tarjetas(lista){base();parar();
  lista.forEach((t,i)=>{const g=CACHE[t.tipo+t.id];if(!g)return;const P=preparar(g,null,null,t.enc==='cuerpo'?t.id:null);P.m.position.x=i*6;scene.add(P.m);P.id=t.id;
    const cam=new THREE.PerspectiveCamera(20,1,.1,80),v={cv:t.cv,ctx:t.cv.getContext('2d'),cam,objs:[P],enc:t.enc,x:i*6,giro:0,spin:0,spinT:-1};VIS.push(v);
    if(t.efecto&&window.EFECTOS){v.fx=EFECTOS.nuevo();v.fx.poner(P.m,t.id,scene,t.cv.height/(2*Math.tan(10*Math.PI/180)));}
    if(t.girar)girable(v);if(t.presenta)v.spinT=0;});
  encuadra();}
// girar con el dedo (también con la pantalla rotada)
function girable(v){const cv=v.cv;let act=false,lx=0;const pos=e=>(typeof ROT!=='undefined'&&ROT)?e.clientY:e.clientX;
  cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{act=true;lx=pos(e);v.spinT=-1;e.stopPropagation();});
  addEventListener('pointermove',e=>{if(!act)return;const p=pos(e);v.giro+=(p-lx)*.012/(typeof SC!=='undefined'?SC:1);lx=p;});
  addEventListener('pointerup',()=>{act=false;});}
// acción de capitán (clip suelto: lobby1/lobby2) en la vista i; al terminar vuelve a respirar
const ACC={};
function accion(i,url,corte){const v=VIS[i];if(!v)return Promise.resolve();
  const k=url+(corte||'');const p=ACC[k]||(ACC[k]=b64(url).then(parse).then(g=>{let c=g.animations[0];if(corte)c=THREE.AnimationUtils.subclip(c,'c',0,Math.round(corte*60),60);return c;}));
  return p.then(c=>{const o=v.objs[0];if(!o||!VIS.includes(v))return;const mx=o.mixer,b=mx.clipAction(c);b.reset();b.setLoop(THREE.LoopOnce,1);b.clampWhenFinished=true;
    const idle=mx._actions.find(a=>a!==b&&a.getClip().name!==c.name&&a.loop===THREE.LoopPingPong);
    b.setEffectiveWeight(1);b.play();if(idle)idle.crossFadeTo(b,.4,false);
    const fin=e=>{if(e.action!==b)return;mx.removeEventListener('finished',fin);if(idle){idle.reset();idle.setEffectiveWeight(1);idle.play();b.crossFadeTo(idle,.6,false);}};
    mx.addEventListener('finished',fin);});}
function encuadra(){for(const v of VIS){if(v.fija)continue;const a=v.cv.width/v.cv.height,c=v.cam;c.aspect=a;
  const y0=v.enc==='cuerpo'?-.05:1.1,y1=v.enc==='cuerpo'?3.6:3.0,hh=y1-y0,cy=(y0+y1)/2,d=(hh/2)/Math.tan(c.fov*Math.PI/360)*1.04;
  c.position.set(v.x,cy+.1,d);c.lookAt(v.x,cy,0);c.updateProjectionMatrix();}}
// escena: varios titanes en un mismo cuadro (victoria/derrota). items: [{id,tipo,x,z,acc,idleDe}] · cam:{x,y,z,mira:[x,y,z],fov}
function escena(cv,items,cam){base();
  const ox=1000+VIS.length*40,objs=[],c=new THREE.PerspectiveCamera(cam.fov||28,cv.width/cv.height,.1,200);
  c.position.set(ox+cam.x,cam.y,cam.z);c.lookAt(ox+cam.mira[0],cam.mira[1],cam.mira[2]);c.updateProjectionMatrix();
  for(const it of items){const g=CACHE[it.tipo+it.id];if(!g)continue;const idl=it.idleDe&&CACHE[it.idleDe]?CACHE[it.idleDe].animations[0]:null;
    const P=preparar(g,it.acc,idl,it.id);P.m.position.x=ox+it.x;P.m.position.z=it.z||0;if(it.s)P.m.scale.multiplyScalar(it.s);if(it.oscuro)P.m.traverse(o=>{if(o.isMesh&&!o.userData.esContorno&&o.material&&o.material.color)o.material.color.setScalar(it.oscuro);});
    // que mire a la cámara desde donde está parado
    P.m.rotation.y=P.rotBase+Math.atan2(cam.x-it.x,cam.z-(it.z||0));scene.add(P.m);objs.push(P);}
  VIS.push({cv,ctx:cv.getContext('2d'),cam:c,objs,fija:true});}
function dibujar(){let W=0,H=0;for(const v of VIS){W+=v.cv.width;H=Math.max(H,v.cv.height);}if(!W)return;
  const sz=R.getSize(new THREE.Vector2());if(sz.x!==W||sz.y!==H)R.setSize(W,H,false);
  R.setScissorTest(true);R.clear();let x=0;
  for(const v of VIS){const w=v.cv.width,h=v.cv.height;R.setViewport(x,H-h,w,h);R.setScissor(x,H-h,w,h);R.render(scene,v.cam);v._x=x;x+=w;}
  R.setScissorTest(false);
  for(const v of VIS){v.ctx.clearRect(0,0,v.cv.width,v.cv.height);v.ctx.drawImage(R.domElement,v._x,0,v.cv.width,v.cv.height,0,0,v.cv.width,v.cv.height);}}
function cuadro(){raf=requestAnimationFrame(cuadro);const dt=Math.min(clock.getDelta(),.05);
  for(const v of VIS){if(v.spinT>=0){v.spinT+=dt;const u=Math.min(1,v.spinT/1.3);v.spin=(1-Math.pow(1-u,3))*Math.PI*2;if(u>=1){v.spinT=-1;v.spin=0;}}
    for(const o of v.objs){o.mixer.update(dt);if(!v.fija){o.m.rotation.y=o.rotBase+v.giro+v.spin;o.m.position.y=o.y0+(v.spinT>=0?Math.sin(Math.min(1,v.spinT/1.3)*Math.PI)*.25:0);}if(window.PELO)PELO.paso(o.m,dt);}
    if(v.fx)v.fx.paso(dt);}dibujar();
  fpsN++;fpsT+=dt;if(fpsT>=1){const e=document.getElementById('fps3d');let n=0;for(const v of VIS)n+=v.objs.length;if(e)e.textContent=Math.round(fpsN/fpsT)+' fps · '+n+' titanes en 3D';fpsN=0;fpsT=0;}}
function arrancar(){if(ligero()){   // una foto por vista (en la victoria, la del capitán a media celebración) y se suelta todo
    for(const v of VIS)for(const o of v.objs)o.mixer.update(1.2);dibujar();
    for(const v of VIS){v.cv.classList.add('foto');if(v.fx)v.fx.quitar();for(const o of v.objs)scene.remove(o.m);}VIS=[];
    const e=document.getElementById('fps3d');if(e)e.textContent='modo ligero: imágenes (0 titanes en 3D)';return;}
  cancelAnimationFrame(raf);clock.getDelta();cuadro();}
function parar(){cancelAnimationFrame(raf);raf=0;for(const v of VIS){if(v.fx)v.fx.quitar();for(const o of v.objs)scene&&scene.remove(o.m);}VIS=[];}
window.VS3D={cargar,listo,tarjetas,escena,arrancar,parar,ligero,setLigero,accion,presenta:i=>{if(VIS[i])VIS[i].spinT=0;}};
})();
