// =====================================================================
// v211: PÚBLICO DE HONGOS (todas las arenas con gradas).
// Malla ligera del Hongo (~1,100 triángulos, sin textura: color por vértice) y sus poses ya calculadas
// (15 por segundo) de 3 animaciones en loop: normal, aplauso y brinco. Cada cuadro es una malla con instancias:
// cada hongo se pone en la malla del cuadro que le toca, así cientos se mueven casi sin costo.
// Cada hongo hace lo suyo (no reaccionan al partido): ~40% normal, ~20% normal siguiendo el balón,
// ~25% brincando, ~15% aplaudiendo; de vez en cuando alguno cambia. Cada uno con su ritmo y su desfase.
// La playera, el short y las calcetas se pintan con el uniforme del equipo al que apoyan (media grada cada uno);
// zapatos blancos o de color y sombrero de color al azar. Accesorios: guante del número 1, bandera que ondea y bengala.
// uso: const H=GZ_HONGOS({scene,root,seats,kits:[TEAMKIT[0],TEAMKIT[1]],level}); H.update(dt,ball)
// =====================================================================
window.GZ_HONGOS=function(o){
const C={update(){},ready:false,count:0};
const seats=o.seats||[];if(!seats.length||typeof THREE==='undefined')return C;
const par=o.root||o.scene,lvl=o.level||0,SC=o.size||1.4;
const fill=Math.min(1,.35+lvl*.085)*(((window.save&&save.settings&&save.settings.quality)==='baja')?.6:1);
const V='?v=212c';
Promise.all([fetch('assets/arenas/hongos/hongos.json'+V).then(r=>r.json()),fetch('assets/arenas/hongos/hongos.bin'+V).then(r=>r.arrayBuffer())])
 .then(([m,b])=>{try{build(m,b);console.log('hongos:',C.count,'en las gradas');}catch(e){fail(e);}}).catch(fail);
function fail(e){console.warn('hongos: no cargó',e);C.error=String(e&&e.message||e);try{if(window.toast)toast('Público: '+C.error);}catch(_){}}
// v212: pies exactos en el escalón. Para cada lugar se lanza una línea hacia abajo sobre las gradas y se busca piso plano
// (el pie y alrededor a la misma altura). Si cae en la orilla se recorre al centro del escalón; si no hay piso plano, ese lugar no se usa.
function floorCast(list){
  const sc=o.scene||par;sc.updateMatrixWorld(true);const objs=[];
  sc.traverse(x=>{if(!x.isMesh||x.isInstancedMesh||x.isSkinnedMesh||!x.geometry||x.userData.gzDyn||(x.material&&x.material.visible===false))return;for(let q=x;q;q=q.parent)if(q.visible===false)return;objs.push(x);});
  const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),org=new THREE.Vector3(),nm=new THREE.Matrix3(),nv=new THREE.Vector3();
  const top=(x,z,y0)=>{org.set(x,y0+1.1,z);rc.set(org,dn);rc.far=2.6;const hs=rc.intersectObjects(objs,false);
    for(const h of hs){if(!h.face)continue;nm.getNormalMatrix(h.object.matrixWorld);nv.copy(h.face.normal).applyMatrix3(nm).normalize();if(Math.abs(nv.y)>.7)return h.point.y;return null;}return null;};
  const out=[];
  for(const s of list){const fx=Math.sin(s.ry),fz=Math.cos(s.ry),lx=fz,lz=-fx,j=(Math.random()-.5)*.24;   // al frente / a lo ancho
    const bx=s.x+lx*j,bz=s.z+lz*j;let best=null;
    for(const d of [0,.06,-.06,.12,-.12,.18,-.18,.25,-.25,.32,-.32]){const x=bx+fx*d,z=bz+fz*d,y=top(x,z,s.y);if(y==null)continue;
      let ok=true,ym=y;for(const [a,b] of [[.24,0],[-.24,0],[0,.14],[0,-.14]]){const y2=top(x+fx*a+lx*b,z+fz*a+lz*b,s.y);if(y2==null||Math.abs(y2-y)>.04){ok=false;break;}ym=Math.max(ym,y2);}
      if(ok){best={x,y:ym,z,ry:s.ry};break;}}
    if(best)out.push(best);}
  return out;}
function build(m,b){
  const nv=m.nv,nt=m.nt,nf=m.nf,off=m.off;
  const Q=new Int16Array(b,off[0],nf*nv*3),NQ=new Int8Array(b,off[1],nf*nv*3),COL=new Uint8Array(b,off[2],nv*3),IDX=new Uint16Array(b,off[3],nt*3),PART=new Uint8Array(b,off[4],nv),HAND=new Float32Array(b,off[5],nf*12);
  const mn=m.min,sc=m.scale,col=new THREE.BufferAttribute(new Uint8Array(COL),3,true),part=new THREE.BufferAttribute(new Float32Array(PART),1),index=new THREE.BufferAttribute(new Uint16Array(IDX),1);
  // ---- quiénes y dónde
  let list=seats.filter(()=>Math.random()<fill);try{const c=floorCast(list);C.dropped=list.length-c.length;list=c;C.cast=true;}catch(e){console.warn('hongos: piso',e);}
  const N=list.length;if(!N){fail('sin lugares en las gradas');return;}C.count=N;
  const K=o.kits||[{j:0x2f7bff,sh:0x173f99,so:0xffffff},{j:0xff3b4e,sh:0x99202e,so:0xffffff}];
  const kc=(k,a,b)=>new THREE.Color(k[a]!=null?k[a]:(k[b]!=null?k[b]:k.j));
  const SHOES=[0xffffff,0xffffff,0xffffff,0xff3b3b,0x2f7bff,0xffd23a,0x2ecc71],CAPS=[0xd8261e,0xd8261e,0x2f7bff,0x2ecc71,0xffc21a,0x9b4dff,0xff7a1a];
  const uni={uJ0:{value:kc(K[0],'j')},uJ1:{value:kc(K[1],'j')},uSh0:{value:kc(K[0],'sh','d')},uSh1:{value:kc(K[1],'sh','d')},uSo0:{value:kc(K[0],'so','s')},uSo1:{value:kc(K[1],'so','s')},
    uShoe:{value:SHOES.map(h=>new THREE.Color(h))},uCap:{value:CAPS.map(h=>new THREE.Color(h))}};
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  mat.onBeforeCompile=s=>{Object.assign(s.uniforms,uni);
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float aPart;attribute vec3 aVar;uniform vec3 uJ0,uJ1,uSh0,uSh1,uSo0,uSo1;uniform vec3 uShoe[7];uniform vec3 uCap[7];')
      .replace('#include <color_vertex>',`#include <color_vertex>
      {float lum=dot(color.rgb,vec3(.299,.587,.114));int pt=int(aPart+.5);bool t1=aVar.x>.5;vec3 tc=vColor;
       if(pt==1)tc=t1?uJ1:uJ0;else if(pt==2)tc=t1?uSh1:uSh0;else if(pt==3)tc=t1?uSo1:uSo0;
       else if(pt==4){int k=int(aVar.y+.5);for(int i=0;i<7;i++)if(i==k)tc=uShoe[i];}
       else if(pt==5){int k=int(aVar.z+.5);for(int i=0;i<7;i++)if(i==k)tc=uCap[i];}
       if(pt>0)vColor=tc*clamp(.42+lum*1.35,.35,1.25);}`);};
  // una malla por cuadro (comparten color, partes e índices)
  const meshes=[],AVAR=[];
  for(let f=0;f<nf;f++){
    const g=new THREE.BufferGeometry(),P=new Float32Array(nv*3),Nn=new Int8Array(nv*3);
    for(let i=0;i<nv*3;i++){const k=i%3;P[i]=(Q[f*nv*3+i]+32767)*sc[k]+mn[k];}Nn.set(NQ.subarray(f*nv*3,(f+1)*nv*3));
    g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(Nn,3,true));g.setAttribute('color',col);g.setAttribute('aPart',part);g.setIndex(index);
    const av=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);av.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aVar',av);AVAR.push(av);
    const im=new THREE.InstancedMesh(g,mat,N);im.userData.gzDyn=1;im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);par.add(im);meshes.push(im);}
  const clip={};for(const c of m.clips)clip[c.name]=c;
  // ---- accesorios
  const PROP_N=Math.ceil(N*.45);
  const tm=(c,o2)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o2||{}));
  const fingerG=(()=>{const tx=document.createElement('canvas');tx.width=64;tx.height=64;const q=tx.getContext('2d');q.fillStyle='#fff';q.fillRect(0,0,64,64);q.fillStyle='#111';q.font='bold 46px sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText('1',32,36);
    const g=new THREE.BoxGeometry(.2,.26,.08);g.translate(0,.13,0);const f=new THREE.BoxGeometry(.07,.2,.07);f.translate(-.04,.36,0);return [g,f,new THREE.CanvasTexture(tx)];})();
  const finger=new THREE.InstancedMesh(fingerG[0],tm(0xffffff,{map:fingerG[2]}),PROP_N),finger2=new THREE.InstancedMesh(fingerG[1],tm(0xffffff),PROP_N);
  const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.012,.012,.9,5).translate(0,.4,0),tm(0x6b4a2a),PROP_N);
  const clothG=new THREE.PlaneGeometry(.55,.36,8,3);clothG.translate(.28,.66,0);
  const clothM=tm(0xffffff,{side:THREE.DoubleSide,vertexColors:false});const ut={value:0};
  clothM.onBeforeCompile=s=>{s.uniforms.uT=ut;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>',
    `#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*1.7+instanceMatrix[3].z*1.3;\n#else\nfloat ph=0.;\n#endif\nfloat w=clamp(position.x/.55,0.,1.);transformed.z+=sin(position.x*9.-uT*7.+ph)*.06*w;transformed.y+=sin(position.x*6.-uT*5.+ph)*.02*w;`);};
  const cloth=new THREE.InstancedMesh(clothG,clothM,PROP_N);
  const stick=new THREE.InstancedMesh(new THREE.CylinderGeometry(.02,.02,.32,6).translate(0,.16,0),tm(0xc0201a),24);
  for(const im of [finger,finger2,pole,cloth,stick]){im.userData.gzDyn=1;im.count=0;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);par.add(im);}
  cloth.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(PROP_N*3),3);
  // chispas y humo de las bengalas
  const SP=24*28,spP=new Float32Array(SP*3),spV=new Float32Array(SP*3),spL=new Float32Array(SP),spC=new Float32Array(SP*3);
  const spG=new THREE.BufferGeometry();spG.setAttribute('position',new THREE.BufferAttribute(spP,3));spG.setAttribute('color',new THREE.BufferAttribute(spC,3));
  const glowTx=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=gr;q.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);})();
  const sparks=new THREE.Points(spG,new THREE.PointsMaterial({size:.22,map:glowTx,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sparks.frustumCulled=false;par.add(sparks);
  const glowM=new THREE.SpriteMaterial({map:glowTx,color:0xff5a2a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const glows=[];
  // ---- cada hongo
  const R=Math.random,H=[],team=s=>(s.x<0?0:1);
  let nFl=0;
  for(let i=0;i<N;i++){const s=list[i];const r=R();
    const beh=r<.4?'normal':r<.6?'sigue':r<.85?'brinco':'aplauso';
    let prop=0;const pr=R();if(beh==='brinco'){prop=pr<.3?1:pr<.5?2:(pr<.6&&nFl<24)?3:0;}else if(beh==='normal'||beh==='sigue'){prop=pr<.22?2:0;}
    if(prop===3)nFl++;
    const h={x:C.cast?s.x:s.x+(R()-.5)*.25,y:s.y,z:C.cast?s.z:s.z+(R()-.5)*.12,ry:s.ry,team:team(s),beh,prop,rate:.85+R()*.3,ph:R()*10,shoe:Math.floor(R()*7),cap:Math.floor(R()*7),yaw:s.ry,sw:6+R()*14,s:SC*(.9+R()*.18)};
    if(prop===3){const g=new THREE.Sprite(glowM);g.scale.setScalar(.9);par.add(g);h.glow=g;h.fl=glows.length;glows.push(h);}
    H.push(h);}
  const flagCol=[kc(K[0],'j'),kc(K[1],'j')];
  // ---- cada cuadro
  const Mt=new THREE.Matrix4(),Mh=new THREE.Matrix4(),Mp=new THREE.Matrix4(),Q4=new THREE.Quaternion(),E=new THREE.Euler(),S3=new THREE.Vector3(),P3=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),tip=new THREE.Vector3();
  const cnt=new Int32Array(nf);let T=0,spI=0;
  const fps=m.fps;
  C.update=(dt,ball)=>{T+=dt;ut.value=T;cnt.fill(0);let nfi=0,npo=0,nst=0;
    for(const h of H){
      h.sw-=dt;if(h.sw<0){h.sw=8+R()*16;const r=R();if(h.beh!=='sigue'&&!h.prop)h.beh=r<.45?'normal':r<.75?'brinco':'aplauso';}   // a veces cambian
      const c=clip[h.beh==='sigue'?'normal':h.beh];const f=c.start+(Math.floor((T*h.rate+h.ph)*fps)%c.n);
      if(h.beh==='sigue'&&ball){const want=Math.atan2(ball.x-h.x,ball.z-h.z);let d=want-h.ry;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;d=Math.max(-.9,Math.min(.9,d));h.yaw+=(h.ry+d-h.yaw)*Math.min(1,dt*3);}else h.yaw=h.ry;
      Q4.setFromAxisAngle(up,h.yaw);S3.set(h.s,h.s,h.s);P3.set(h.x,h.y,h.z);Mt.compose(P3,Q4,S3);
      const im=meshes[f],k=cnt[f]++;im.setMatrixAt(k,Mt);const av=AVAR[f].array;av[k*3]=h.team;av[k*3+1]=h.shoe;av[k*3+2]=h.cap;
      if(h.prop){const a=HAND,o2=f*12;Mh.set(a[o2],a[o2+1],a[o2+2],a[o2+3],a[o2+4],a[o2+5],a[o2+6],a[o2+7],a[o2+8],a[o2+9],a[o2+10],a[o2+11],0,0,0,1);Mp.multiplyMatrices(Mt,Mh);
        if(h.prop===1){finger.setMatrixAt(nfi,Mp);finger2.setMatrixAt(nfi,Mp);nfi++;}
        else if(h.prop===2){pole.setMatrixAt(npo,Mp);cloth.setMatrixAt(npo,Mp);const cc=flagCol[h.team];cloth.instanceColor.setXYZ(npo,cc.r,cc.g,cc.b);npo++;}
        else if(h.prop===3){stick.setMatrixAt(nst++,Mp);tip.set(0,.34,0).applyMatrix4(Mp);if(h.glow){h.glow.position.copy(tip);h.glow.scale.setScalar(.8+Math.sin(T*30+h.ph)*.15);}
          for(let e=0;e<2;e++){const j=spI++%SP;spP[j*3]=tip.x;spP[j*3+1]=tip.y;spP[j*3+2]=tip.z;spV[j*3]=(R()-.5)*1.2;spV[j*3+1]=1+R()*1.6;spV[j*3+2]=(R()-.5)*1.2;spL[j]=.5+R()*.4;}}}}
    for(let f=0;f<nf;f++){const im=meshes[f];im.count=cnt[f];if(cnt[f]){im.instanceMatrix.needsUpdate=true;AVAR[f].needsUpdate=true;}}
    finger.count=finger2.count=nfi;pole.count=cloth.count=npo;stick.count=nst;
    for(const im of [finger,finger2,pole,cloth,stick])im.instanceMatrix.needsUpdate=true;if(cloth.instanceColor)cloth.instanceColor.needsUpdate=true;
    for(let j=0;j<SP;j++){if(spL[j]<=0){spC[j*3]=spC[j*3+1]=spC[j*3+2]=0;continue;}spL[j]-=dt;spV[j*3+1]-=2.2*dt;spP[j*3]+=spV[j*3]*dt;spP[j*3+1]+=spV[j*3+1]*dt;spP[j*3+2]+=spV[j*3+2]*dt;const l=Math.max(0,spL[j]);spC[j*3]=l*2;spC[j*3+1]=l*1.2;spC[j*3+2]=l*.4;}
    spG.attributes.position.needsUpdate=true;spG.attributes.color.needsUpdate=true;};
  let kk='';C.setKits=k=>{if(!k||!k[0]||!k[1])return;const key=[k[0].j,k[0].sh,k[0].so,k[1].j,k[1].sh,k[1].so].join();if(key===kk)return;kk=key;
    uni.uJ0.value.copy(kc(k[0],'j'));uni.uJ1.value.copy(kc(k[1],'j'));uni.uSh0.value.copy(kc(k[0],'sh','d'));uni.uSh1.value.copy(kc(k[1],'sh','d'));uni.uSo0.value.copy(kc(k[0],'so','s'));uni.uSo1.value.copy(kc(k[1],'so','s'));
    flagCol[0].copy(kc(k[0],'j'));flagCol[1].copy(kc(k[1],'j'));};
  C.ready=true;}
return C;};
