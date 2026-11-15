// ===== Kragor en 3D en el lobby con la animación de reposo (la misma del juego) =====
(function(){
const W=760,H=640;let R=null,scene,cam,mixer,model,clock,raf=0,listo=false,fallo=false,cargando=null;
// en el juego los modelos van en binario (.glb), sin base64
const b64=u=>fetch(u.replace(/\.txt$/,'')).then(r=>{if(!r.ok)throw new Error(u);return r.arrayBuffer();});
function parse(buf){return new Promise((res,rej)=>new THREE.GLTFLoader().parse(buf,'',res,rej));}
async function cargar(){
  if(!window.THREE||!THREE.GLTFLoader)throw new Error('sin three');
  R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.setSize(W,H,false);
  COLOR3D.render0(R);
  R.domElement.className='lienzo3d';
  scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(26,W/H,.1,100);cam.position.set(0,1.75,8.6);cam.lookAt(0,1.38,0);
  COLOR3D.luces(scene);
  const ga=await parse(await b64('a/m/anims_extra.glb.txt'));CLIP=ga.animations.find(c=>c.name==='reposo')||ga.animations[0];
  clock=new THREE.Clock();await poner(window.HEROE||'leon');listo=true;
}
let CLIP=null;const CACHE={};
const UTH=['goblin','duende','yeti','turbo','momia','monje','campeon','remiendo','zombi','hongo','vampira','leon','nebula','malabares','rey','cazador','ciclon','zurdito','ruleta','expreso','sangre','toro','vikingo','reina','perro','muralla','valkiria'];
const FBX=[];   // ya todos llegan en GLB
const CAP={leon:{base:'v_leon',idle:'u_leon',triste:'l_leon',lob:['a_leon_lobby1','a_leon_lobby2'],corte:{0:3.05}},
           turbo:{base:'v_turbo',idle:'u_turbo',triste:'l_turbo',lob:['a_turbo_lobby1','a_turbo_lobby2'],giro:true,balon:1}};
// recorta un clip a [0, fin] segundos (claves a 60 cuadros)
function corta(c,fin){return THREE.AnimationUtils.subclip(c,c.name+'_c',0,Math.round(fin*60),60);}
// vuelta completa: la cadera de la animación gira y se regresa por el mismo camino; se cambia a una vuelta entera en un solo sentido
window.vueltaCompleta=c=>vueltaCompleta(c);
function vueltaCompleta(c){const tr=c.tracks.find(t=>/Hips\.quaternion$/.test(t.name));if(!tr)return c;
  const v=tr.values,n=v.length/4,yaw=[],q=new THREE.Quaternion(),e=new THREE.Euler();
  for(let i=0;i<n;i++){q.fromArray(v,i*4);e.setFromQuaternion(q,'YXZ');yaw.push(e.y);}
  for(let i=1;i<n;i++){while(yaw[i]-yaw[i-1]>Math.PI)yaw[i]-=2*Math.PI;while(yaw[i]-yaw[i-1]<-Math.PI)yaw[i]+=2*Math.PI;}
  const y0=yaw[0],th=0.12;let i0=-1,i1=-1;for(let i=0;i<n;i++)if(Math.abs(yaw[i]-y0)>th){if(i0<0)i0=i;i1=i;}
  if(i0<1||i1<=i0)return c;i0--;i1=Math.min(n-1,i1+1);
  let ext=i0;for(let i=i0;i<=i1;i++)if(Math.abs(yaw[i]-y0)>Math.abs(yaw[ext]-y0))ext=i;const dir=Math.sign(yaw[ext]-y0);
  const cum=[0];for(let i=i0+1;i<=i1;i++)cum.push(cum[cum.length-1]+Math.abs(yaw[i]-yaw[i-1]));const tot=cum[cum.length-1]||1;
  const fin=yaw[i1]+dir*2*Math.PI,ini=yaw[i0],nv=v.slice(),Y=new THREE.Vector3(0,1,0),dq=new THREE.Quaternion();
  for(let i=i0;i<n;i++){const want=i<=i1?ini+(fin-ini)*cum[i-i0]/tot:yaw[i]+dir*2*Math.PI;dq.setFromAxisAngle(Y,want-yaw[i]);q.fromArray(v,i*4);dq.multiply(q);dq.toArray(nv,i*4);}
  const t2=new THREE.QuaternionKeyframeTrack(tr.name,tr.times,nv);return new THREE.AnimationClip(c.name,c.duration,c.tracks.map(t=>t===tr?t2:t));}
async function poner(id){window.LOBBY_ID=id;
  const uth=UTH.includes(id);
  const fbx=FBX.includes(id);
  const url=fbx?'a/m/f_'+id+'.fbx.txt':uth?'a/m/u_'+id+'.glb.txt':id==='leon'?'a/m/leon.glb.txt':'a/m/hd_'+id+'.glb.txt';
  if(CAP[id]&&!CACHE[id]){   // capitanes: modelo arreglado + reposo, victoria, acciones del lobby y modelo triste para el lamento
    const c=CAP[id],L=async u=>parse(await b64('a/m/'+u+'.glb.txt'));
    const [gv,gi,gt,...gl]=await Promise.all([L(c.base),L(c.idle),L(c.triste),...c.lob.map(L)]);
    const lob=gl.map((x,i)=>c.corte&&c.corte[i]?corta(x.animations[0],c.corte[i]):x.animations[0]);
    CACHE[id]={scene:gv.scene,animations:[gi.animations[0]],vic:c.giro?vueltaCompleta(gv.animations[0]):gv.animations[0],lob,sad:{scene:gt.scene,clip:gt.animations[0]},balon:c.balon};
  }
  const g=CACHE[id]||(CACHE[id]=fbx?await b64(url).then(buf=>{const o=new THREE.FBXLoader().parse(buf,'');return {scene:o,animations:o.animations};}):await parse(await b64(url)));
  if(model)scene.remove(model);if(SAD){scene.remove(SAD.model);SAD=null;}clearTimeout(TAUTO);OCUP=false;
  COLOR3D.aviva(g.scene);if(g.sad)COLOR3D.aviva(g.sad.scene);if(window.CONTORNO){CONTORNO.poner(g.scene);if(g.sad)CONTORNO.poner(g.sad.scene);}
  model=g.scene;model.traverse(o=>{if(o.isMesh&&!o.userData.esContorno){o.frustumCulled=false;if(o.material){o.material.side=THREE.DoubleSide;if(o.material.map)o.material.map.encoding=THREE.sRGBEncoding;}}});
  model.scale.setScalar(1);model.position.set(0,0,0);GIRO=0;scene.add(model);model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model),s=2.8/((box.max.y-box.min.y)||1);model.scale.setScalar(s);model.position.y=-box.min.y*s;
  if(window.EFECTOS){try{EFECTOS.poner(model,id,scene,H/(2*Math.tan(13*Math.PI/180))*R.getPixelRatio());}catch(e){console.warn('efectos',e);}}
  // la cadera de la animación viene en otra escala (cm): se ajusta a la altura de cadera de este modelo
  let hips=null;model.traverse(o=>{if(o.isBone&&/Hips$/.test(o.name)&&!hips)hips=o;});
  let clip=CLIP;
  if(hips){const tr=CLIP.tracks.map(t=>{if(!/Hips\.position$/.test(t.name))return t;const u=t.clone(),v=u.values,k=hips.position.y/100;   // igual que el juego: altura de cadera = valor/100 de la de reposo, x y z fijos
    for(let i=0;i<v.length;i+=3){v[i]=hips.position.x;v[i+1]=v[i+1]*k;v[i+2]=hips.position.z;}return u;});
    clip=new THREE.AnimationClip(CLIP.name,CLIP.duration,tr);}
  mixer=new THREE.AnimationMixer(model);LOOP=null;
  SK=null;model.rotation.y=0;BASE=null;
  if(uth&&g.animations.length){   // animación de Uthana: bucle empalmado (cruce del final con el inicio) y de frente
    const c0=g.animations[0],c1=c0.clone();
    LOOP={A:mixer.clipAction(c0),B:mixer.clipAction(c1),D:c0.duration,F:Math.min(.9,c0.duration*.22),cur:null,fade:false};
    for(const x of [LOOP.A,LOOP.B]){x.setLoop(THREE.LoopOnce,1);x.clampWhenFinished=true;}
    // frente: que la CABEZA mire a la cámara (promedio en toda la animación); solo se gira el modelo completo, la animación no se toca
    const hueso=n=>{let r=null;model.traverse(o=>{if(o.isBone&&o.name.endsWith(n)&&!r)r=o;});return r;};
    const cab=hueso('Head');model.updateMatrixWorld(true);
    const q0=cab?cab.getWorldQuaternion(new THREE.Quaternion()).invert():null;   // cabeza en la pose base (mira al frente)
    LOOP.A.play();let sx=0,sz=0;const qa=new THREE.Quaternion(),f=new THREE.Vector3();
    if(cab)for(let i=0;i<16;i++){mixer.setTime(LOOP.D*i/16);model.updateMatrixWorld(true);
      cab.getWorldQuaternion(qa);f.set(0,0,1).applyQuaternion(qa.multiply(q0));sx+=f.x;sz+=f.z;}
    model.rotation.y=-Math.atan2(sx,sz);
    // punto de bucle: el cuadro del final que más se parece al inicio (así no hay deslizamiento al empalmar)
    const huesos=[];model.traverse(o=>{if(o.isBone)huesos.push(o);});const hip=hueso('Hips');
    const pose=t=>{mixer.setTime(t);const v=[];for(const h of huesos){const q=h.quaternion;v.push(q.x,q.y,q.z,q.w);}if(hip){v.push(hip.position.x*4,hip.position.y*4,hip.position.z*4);}return v;};
    const p0=pose(0);let mejor=LOOP.D,md=1e9;
    for(let t=LOOP.D*.45;t<=LOOP.D;t+=1/30){const v=pose(t);let d=0;for(let i=0;i<v.length;i++){let x=v[i]-p0[i];d+=x*x;}if(d<md){md=d;mejor=t;}}
    // bucle de ida y vuelta: la animación avanza y luego regresa; nunca hay salto ni giro
    LOOP.A.stop();LOOP.A.reset();LOOP.A.setLoop(THREE.LoopPingPong,Infinity);LOOP.A.clampWhenFinished=false;LOOP.A.play();LOOP.cur=null;
    VIC=null;LOB=[];
    const unaVez=c=>{const a=mixer.clipAction(c);a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;return a;};
    if(g.vic){VIC=unaVez(g.vic);LOB=(g.lob||[]).map(unaVez);
      mixer.addEventListener('finished',e=>{if(e.action!==LOOP.A&&LOOP){LOOP.A.reset();LOOP.A.setEffectiveWeight(1);LOOP.A.play();e.action.crossFadeTo(LOOP.A,.6,false);setTimeout(()=>{OCUP=false;auto();},650);}});}
    if(g.sad){   // modelo triste: misma escala y frente; se muestra solo en el lamento
      const m2=g.sad.scene;m2.traverse(o=>{if(o.isMesh&&!o.userData.esContorno){o.frustumCulled=false;if(o.material){o.material.side=THREE.DoubleSide;if(o.material.map)o.material.map.encoding=THREE.sRGBEncoding;}}});
      m2.scale.setScalar(1);m2.position.set(0,0,0);m2.rotation.y=0;scene.add(m2);m2.updateMatrixWorld(true);
      const b2=new THREE.Box3().setFromObject(m2),s2=2.8/((b2.max.y-b2.min.y)||1);m2.scale.setScalar(s2);m2.position.y=-b2.min.y*s2;m2.visible=false;
      const mx2=new THREE.AnimationMixer(m2),la=mx2.clipAction(g.sad.clip);la.setLoop(THREE.LoopOnce,1);la.clampWhenFinished=true;
      const ri=mx2.clipAction(g.animations[0]);ri.setLoop(THREE.LoopPingPong,Infinity);
      SAD={model:m2,mixer:mx2,lam:la,idle:ri};
    }
    BALON=null;if(g.balon!=null&&window.BALON_VOLT&&LOB[g.balon]){const B=BALON_VOLT;
      if(!BALL){const cv=document.createElement('canvas');cv.width=256;cv.height=128;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,256,128);x.fillStyle='#1a1a2a';
        for(const [a,b] of [[30,30],[100,64],[170,30],[230,80],[60,100],[140,110],[200,10],[10,75]]){x.beginPath();for(let k=0;k<5;k++){const t=k/5*Math.PI*2-Math.PI/2;x.lineTo(a+15*Math.cos(t),b+15*Math.sin(t));}x.fill();}
        const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;BALL=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshStandardMaterial({map:tx,roughness:.5}));}
      BALL.scale.setScalar(.0001);BALL.visible=false;model.add(BALL);BALON={act:LOB[g.balon],B};}
    auto();
  }else{model.traverse(o=>{if(o.isSkinnedMesh&&!SK)SK=o.skeleton;});}
  BR={};model.traverse(o=>{if(!o.isBone)return;for(const k of ['LeftArm','RightArm','LeftForeArm','RightForeArm','LeftHand','RightHand','Spine1','Spine2','Neck','Head','Hips','LeftShoulder','RightShoulder'])if(o.name.endsWith(k)&&!o.name.endsWith('Up'+k)&&!/Spine\d$/.test(o.name.slice(0,-k.length))&&!BR[k])BR[k]=o;});
}
let nfr=0,BR={};
// apertura de brazos y giro de palmas encima de la animación (grados), por personaje
window.AJ=window.AJ||{};const AJ0={abre:14,palma:0};
let _q,_p,_r,_v,_w,_Z;function vecs(){if(_q)return;_q=new THREE.Quaternion();_p=new THREE.Quaternion();_r=new THREE.Quaternion();_v=new THREE.Vector3();_w=new THREE.Vector3();_Z=new THREE.Vector3(0,0,1);}
function giraMundo(b,eje,ang){if(!b||!ang)return;b.getWorldQuaternion(_q);b.parent.getWorldQuaternion(_p);_r.setFromAxisAngle(eje,ang);
  b.quaternion.copy(_p.invert().multiply(_r.multiply(_q)));b.updateMatrixWorld(true);}
let SK=null,T0=performance.now(),GIRO=0,BASE=0,LOOP=null,VIC=null,LOB=[],SAD=null,TAUTO=0,OCUP=false,TRISTE=false,BALL=null,BALON=null;
function balon(){if(!BALON||!BALL)return;const a=BALON.act,B=BALON.B;if(!a.isRunning()||a.getEffectiveWeight()<.05){BALL.visible=false;return;}
  const f=a.time*B.fps,i=Math.min(B.pos.length-2,Math.floor(f)),u=f-i,p=B.pos[i],q=B.pos[i+1],s=(B.esc[i]*(1-u)+B.esc[i+1]*u)*B.r;
  if(s<1e-4){BALL.visible=false;return;}BALL.visible=true;BALL.position.set(p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u,p[2]+(q[2]-p[2])*u);BALL.scale.setScalar(s);BALL.rotation.x+=.25;BALL.rotation.z+=.08;}
// que las manos no se metan en la cara: si una mano entra al volumen de la cabeza, el brazo se aleja un poco hacia el frente
let _hc,_hd,_ax,_qq;function manosFuera(){if(!VIC||!model||!BR.Head)return;if(!_hc){_hc=new THREE.Vector3();_hd=new THREE.Vector3();_ax=new THREE.Vector3();_qq=new THREE.Quaternion();}
  model.updateMatrixWorld(true);const s=model.scale.x,hR=.13*2.8;BR.Head.getWorldPosition(_hc);_hc.y+=.05*2.8;
  const fw=new THREE.Vector3(Math.sin(model.rotation.y),0,Math.cos(model.rotation.y));
  for(const L of ['Left','Right']){const h=BR[L+'Hand'],arm=BR[L+'Arm'];if(!h||!arm)continue;h.getWorldPosition(_hd);const rel=_hd.clone().sub(_hc);
    const dist=rel.length();if(dist>=hR)continue;const sh=arm.getWorldPosition(new THREE.Vector3()),lado=_hd.clone().sub(sh);
    _ax.crossVectors(lado,fw).normalize();const ang=Math.min(.6,(hR-dist)/Math.max(lado.length(),.01))*1.1;
    giraMundo(arm,_ax,-ang);model.updateMatrixWorld(true);}}
function hacer(a){if(!a||!LOOP)return false;if(TRISTE)normal();OCUP=true;clearTimeout(TAUTO);a.stop();a.reset();a.setEffectiveWeight(1);a.play();LOOP.A.crossFadeTo(a,.35,false);return true;}
function normal(){if(!SAD)return;TRISTE=false;SAD.model.visible=false;SAD.lam.stop();SAD.idle.stop();model.visible=true;}
function auto(){clearTimeout(TAUTO);if(!LOB.length||TRISTE)return;TAUTO=setTimeout(()=>{if(!OCUP&&!TRISTE&&LOB.length)hacer(LOB[Math.floor(Math.random()*LOB.length)]);},8000+Math.random()*7000);}
function bucle(){if(!LOOP||!LOOP.cur)return;const c=LOOP.cur;if(!LOOP.fade&&c.time>=LOOP.D-LOOP.F){const n=c===LOOP.A?LOOP.B:LOOP.A;n.stop();n.reset();n.setEffectiveWeight(1);n.play();c.crossFadeTo(n,LOOP.F,false);LOOP.cur=n;LOOP.fade=true;setTimeout(()=>LOOP&&(LOOP.fade=false),LOOP.F*1000+50);}}
const BRZ=window.BRAZOS||{};
function respira(){vecs();if(!SK)return;SK.pose();model.updateMatrixWorld(true);
  const t=(performance.now()-T0)/1000,id=window.HEROE||'turbo',b=BRZ[id]||{Left:20,Right:20},D=Math.PI/180;
  const br=Math.sin(t*2*Math.PI/4.2),sw=Math.sin(t*2*Math.PI/8.4);
  if(BR.Hips){BR.Hips.position.x+=sw*.012/model.scale.x;BR.Hips.updateMatrixWorld(true);}
  const X=new THREE.Vector3(1,0,0);
  giraMundo(BR.Spine1,X,-br*1.2*D);giraMundo(BR.Spine2,X,-br*1.6*D);giraMundo(BR.Spine2,_Z,-sw*1.2*D);
  giraMundo(BR.Head,X,br*1.4*D+1.5*D);
  giraMundo(BR.LeftShoulder,_Z,br*1.0*D);giraMundo(BR.RightShoulder,_Z,-br*1.0*D);
  giraMundo(BR.LeftArm,_Z,-(b.Left-2+br*1.2)*D);giraMundo(BR.RightArm,_Z,(b.Right-2+br*1.2)*D);
  giraMundo(BR.LeftForeArm,X,-9*D);giraMundo(BR.RightForeArm,X,-9*D);}
function ajustaBrazos(){respira();return;vecs();const a=AJ[window.HEROE||'turbo']||AJ0;model.updateMatrixWorld(true);const ab=a.abre*Math.PI/180,pa=a.palma*Math.PI/180;
  for(const [L,sg] of [['Left',1],['Right',-1]]){const arm=BR[L+'Arm'],fa=BR[L+'ForeArm'],h=BR[L+'Hand'];
    giraMundo(arm,_Z,sg*ab);
    if(fa&&h&&pa){fa.getWorldPosition(_v);h.getWorldPosition(_w);_w.sub(_v).normalize();giraMundo(fa,_w.clone(),sg*pa);}}}
function diag(t){const c=document.getElementById('carg');if(c){c.style.display='block';c.style.fontSize='16px';c.style.top='300px';c.style.whiteSpace='pre';c.textContent=t;}}
function cuadro(){raf=requestAnimationFrame(cuadro);if(!listo)return;
  try{const dt=Math.min(clock.getDelta(),.05);mixer.update(dt);if(SAD&&TRISTE)SAD.mixer.update(dt);bucle();ajustaBrazos();balon();if(window.EFECTOS){try{EFECTOS.modelo(TRISTE&&SAD?SAD.model:model);EFECTOS.paso(dt);}catch(e){}}if(model){if(BASE===null)BASE=model.rotation.y;model.rotation.y=BASE+GIRO;if(SAD)SAD.model.rotation.y=model.rotation.y;}if(window.PELO){try{PELO.paso(TRISTE&&SAD?SAD.model:model,dt);}catch(e){}}R.render(scene,cam);}catch(e){cancelAnimationFrame(raf);diag('ERROR AL DIBUJAR: '+e.message);return;}
  if(++nfr===40){const b=new THREE.Box3().setFromObject(model),cv=R.domElement.getBoundingClientRect(),gl=R.getContext();
    let h=null;model.traverse(o=>{if(o.isBone&&/Hips$/.test(o.name)&&!h)h=o;});const hp=h?h.getWorldPosition(new THREE.Vector3()):null;
    if(hp&&hp.y>b.max.y*1.5)diag('3D OK · '+(window.HEROE||'turbo')+' · tri '+R.info.render.triangles+' · llamadas '+R.info.render.calls+
      '\ncaja y '+b.min.y.toFixed(2)+'..'+b.max.y.toFixed(2)+' x '+b.min.x.toFixed(2)+'..'+b.max.x.toFixed(2)+
      '\ncadera '+(hp?[hp.x,hp.y,hp.z].map(v=>v.toFixed(2)).join(','):'-')+'\nlienzo '+Math.round(cv.width)+'x'+Math.round(cv.height)+' en '+Math.round(cv.x)+','+Math.round(cv.y)+
      '\nwebgl '+(gl?'sí':'no')+' · errgl '+(gl?gl.getError():'-'));}}
window.LOBBY3D={
  montar(caja,respaldo){
    if(fallo){respaldo.style.display='block';return;}
    const poner=()=>{nfr=0;caja.appendChild(R.domElement);
      if(!R.domElement._giro){R.domElement._giro=1;let on=false,lx=0;const px=e=>(ROT?e.clientY:e.clientX);
        R.domElement.addEventListener('pointerdown',e=>{on=true;lx=px(e);R.domElement.setPointerCapture(e.pointerId);});
        R.domElement.addEventListener('pointermove',e=>{if(!on)return;const x=px(e);GIRO+=(x-lx)*0.012*(ROT?-1:1);lx=x;});
        R.domElement.addEventListener('pointerup',()=>on=false);R.domElement.addEventListener('pointercancel',()=>on=false);
        R.domElement.style.touchAction='none';R.domElement.style.cursor='grab';}respaldo.style.display='none';clock.getDelta();cancelAnimationFrame(raf);cuadro();};
    if(listo){poner();return;}
    respaldo.style.display='block';
    const c=document.getElementById('carg');if(c){c.style.display='block';c.textContent='CARGANDO 3D…';}
    (cargando||(cargando=cargar())).then(()=>{if(c)c.style.display='none';if(caja.isConnected)poner();}).catch(e=>{console.warn('lobby 3D',e);fallo=true;if(c){c.style.display='block';c.style.fontSize='18px';c.textContent='3D NO CARGÓ: '+(e&&e.message||e);}});
  },
  parar(){cancelAnimationFrame(raf);},
  victoria(){return hacer(VIC);},
  lobby(i){return hacer(LOB[i]);},
  lamento(){if(!SAD)return false;clearTimeout(TAUTO);OCUP=false;TRISTE=true;model.visible=false;SAD.model.visible=true;SAD.idle.stop();SAD.lam.stop();SAD.lam.reset();SAD.lam.play();return true;},
  normal(){if(!TRISTE)return false;normal();auto();return true;},
  esCapitan(){return !!VIC;},
  cambiar(id){window.HEROE=id;if(!listo)return Promise.resolve();return poner(id);}
};
})();
