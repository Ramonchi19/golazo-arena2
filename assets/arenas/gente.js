// =====================================================================
// v215: PÚBLICO MIXTO (gente.js) (hongo, señor de bigote y 3 niños).
// Cada personaje trae sus poses ya calculadas (8 por segundo) de las mismas animaciones:
// tranquilo, festejo, lamento (cabeza abajo), manos en la cabeza, bandera y aplauso.
// Las poses viven en dos texturas (posición y normal por vértice y cuadro) y la tarjeta de video
// las lee y mezcla dos cuadros seguidos: una sola malla con instancias por personaje (5 dibujos en total).
// Playera, short y calcetas con el color del equipo al que apoyan (media grada cada uno); zapatos y gorro de colores.
// Reaccionan al partido: C.react('gol',equipo) -> los de ese equipo festejan y los otros se lamentan;
// C.react('casi') -> manos a la cabeza. Si no pasa nada: tranquilos, siguiendo el balón, aplaudiendo o con bandera.
// uso: const P=GZ_GENTE({scene,root,seats,kits:[TEAMKIT[0],TEAMKIT[1]],level}); P.update(dt,ball)
// =====================================================================
window.GZ_GENTE=function(o){
const C={update(){},react(){},setKits(){},ready:false,count:0};
const seats=o.seats||[];if(!seats.length||typeof THREE==='undefined')return C;
const par=o.root||o.scene,lvl=o.level||0,SC=o.size||1.4;
const fill=Math.min(1,.45+lvl*.07)*(((window.save&&save.settings&&save.settings.quality)==='baja')?.6:1);
const V='?v=215',DIR='assets/arenas/gente/';
const getBin=window.GZ_GETBIN||(u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.arrayBuffer();}));
fetch(DIR+'gente.json'+V).then(r=>r.json()).then(m=>Promise.all(m.species.map(s=>getBin(DIR+s.name+'.bin'+V))).then(bs=>{try{build(m,bs);console.log('público:',C.count,'en las gradas');}catch(e){fail(e);}})).catch(fail);
function fail(e){console.warn('público: no cargó',e);C.error=String(e&&e.message||e);try{if(window.toast)toast('Público: '+C.error);}catch(_){}}
// pies exactos en el escalón (igual que v212): línea hacia abajo y piso plano alrededor
function floorCast(list){
  const sc=o.scene||par;sc.updateMatrixWorld(true);const objs=[];
  sc.traverse(x=>{if(!x.isMesh||x.isInstancedMesh||x.isSkinnedMesh||!x.geometry||x.userData.gzDyn||(x.material&&x.material.visible===false))return;for(let q=x;q;q=q.parent)if(q.visible===false)return;objs.push(x);});
  const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),org=new THREE.Vector3(),nm=new THREE.Matrix3(),nv=new THREE.Vector3();
  const top=(x,z,y0)=>{org.set(x,y0+1.1,z);rc.set(org,dn);rc.far=2.6;const hs=rc.intersectObjects(objs,false);
    for(const h of hs){if(!h.face)continue;nm.getNormalMatrix(h.object.matrixWorld);nv.copy(h.face.normal).applyMatrix3(nm).normalize();if(Math.abs(nv.y)>.7)return h.point.y;return null;}return null;};
  const out=[];
  for(const s of list){const fx=Math.sin(s.ry),fz=Math.cos(s.ry),lx=fz,lz=-fx,j=(Math.random()-.5)*.2;
    const bx=s.x+lx*j,bz=s.z+lz*j;let best=null;
    for(const d of [0,.06,-.06,.12,-.12,.18,-.18,.25,-.25,.32,-.32]){const x=bx+fx*d,z=bz+fz*d,y=top(x,z,s.y);if(y==null)continue;
      let ok=true,ym=y;for(const [a,b] of [[.2,0],[-.2,0],[0,.12],[0,-.12]]){const y2=top(x+fx*a+lx*b,z+fz*a+lz*b,s.y);if(y2==null||Math.abs(y2-y)>.04){ok=false;break;}ym=Math.max(ym,y2);}
      if(ok){best={x,y:ym,z,ry:s.ry};break;}}
    if(best)out.push(best);}
  return out;}
function build(m,bins){
  const nf=m.nf,fps=m.fps,clip={},CL=m.clips;CL.forEach((c,i)=>{clip[c.name]=c;c.i=i;});
  // ---- quiénes y dónde
  let list=seats.filter(()=>Math.random()<fill);try{const c=floorCast(list);C.dropped=list.length-c.length;list=c;C.cast=true;}catch(e){console.warn('público: piso',e);}
  const N=list.length;if(!N){fail('sin lugares en las gradas');return;}C.count=N;
  const K=o.kits||[{j:0x2f7bff,sh:0x173f99,so:0xffffff},{j:0xff3b4e,sh:0x99202e,so:0xffffff}];
  // o.noRed (arena del volcán): con la luz de fuego el rojo se ve incandescente; ningún rojo ni naranja en el público
  const NR=!!o.noRed,isRed=c=>{const h={};c.getHSL(h);return h.s>.35&&(h.h<.09||h.h>.93);};
  const kc=(k,a,b)=>{const c=new THREE.Color(k[a]!=null?k[a]:(k[b]!=null?k[b]:k.j));if(NR&&isRed(c)){const l=c.getHSL({}).l;c.setHSL(.36,.62,Math.min(.6,Math.max(.3,l)));}return c;};
  const SHOES=NR?[0x2a2a2a,0xffffff,0xffffff,0x2f7bff,0x2f7bff,0xffd23a,0x2ecc71]:[0x2a2a2a,0xffffff,0xffffff,0xff3b3b,0x2f7bff,0xffd23a,0x2ecc71],CAPS=NR?[0x2f7bff,0x2f7bff,0x2ecc71,0x2ecc71,0xffc21a,0x9b4dff,0xffffff]:[0xd8261e,0xd8261e,0x2f7bff,0x2ecc71,0xffc21a,0x9b4dff,0xff7a1a];
  const uT={value:0};
  const uni={uJ0:{value:kc(K[0],'j')},uJ1:{value:kc(K[1],'j')},uSh0:{value:kc(K[0],'sh','d')},uSh1:{value:kc(K[1],'sh','d')},uSo0:{value:kc(K[0],'so','s')},uSo1:{value:kc(K[1],'so','s')},
    uShoe:{value:SHOES.map(h=>new THREE.Color(h))},uCap:{value:CAPS.map(h=>new THREE.Color(h))},uT,uFps:{value:fps}};
  // cuánto de cada personaje y su tamaño (los niños más chicos)
  const MIX={hongo:.3,bigote:.2,gorro:.17,gorra:.17,pelon:.16},SIZE={hongo:1,bigote:1.04,gorro:.84,gorra:.84,pelon:.84};
  const SPC=m.species.map((s,si)=>{
    const b=bins[si],nv=s.nv,nt=s.nt,off=s.off;
    const Q=new Uint16Array(b,off[0],nf*nv*3),OC=new Uint8Array(b,off[1],nf*nv*2),UVA=new Float32Array(b,off[2],nv*2),IDX=new Uint16Array(b,off[3],nt*3),PART=new Uint8Array(b,off[4],nv),HAND=new Float32Array(b,off[5],nf*12);
    // texturas de poses: A = (x alto, x bajo, y alto, y bajo), B = (z alto, z bajo, normal u, normal v)
    const A=new Uint8Array(nv*nf*4),B=new Uint8Array(nv*nf*4);
    for(let i=0,n=nv*nf;i<n;i++){const x=Q[i*3],y=Q[i*3+1],z=Q[i*3+2];A[i*4]=x>>8;A[i*4+1]=x&255;A[i*4+2]=y>>8;A[i*4+3]=y&255;B[i*4]=z>>8;B[i*4+1]=z&255;B[i*4+2]=OC[i*2];B[i*4+3]=OC[i*2+1];}
    const dt=a=>{const t=new THREE.DataTexture(a,nv,nf,THREE.RGBAFormat,THREE.UnsignedByteType);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.needsUpdate=true;return t;};
    const g=new THREE.BufferGeometry(),P0=new Float32Array(nv*3),VID=new Float32Array(nv);
    for(let i=0;i<nv;i++){VID[i]=i;for(let k=0;k<3;k++)P0[i*3+k]=Q[i*3+k]*s.scale[k]+s.min[k];}
    g.setAttribute('position',new THREE.BufferAttribute(P0,3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(UVA),2));
    g.setAttribute('aVid',new THREE.BufferAttribute(VID,1));g.setAttribute('aPart',new THREE.BufferAttribute(new Float32Array(PART),1));g.setIndex(new THREE.BufferAttribute(new Uint16Array(IDX),1));
    const tex=new THREE.TextureLoader().load(DIR+s.tex+V);tex.flipY=false;tex.anisotropy=4;
    const mat=new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide});
    const su=Object.assign({tA:{value:dt(A)},tB:{value:dt(B)},uW:{value:nv},uH:{value:nf},uMin:{value:new THREE.Vector3().fromArray(s.min)},uSc:{value:new THREE.Vector3().fromArray(s.scale)}},uni);
    mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,su);
      sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
uniform sampler2D tA,tB;uniform float uW,uH,uT,uFps;uniform vec3 uMin,uSc;attribute float aVid,aPart;attribute vec4 aAnim;attribute vec3 aVar;varying float vPart;varying vec3 vVar;
vec3 gzPos(vec4 a,vec4 b){return vec3(a.r*65280.+a.g*255.,a.b*65280.+a.a*255.,b.r*65280.+b.g*255.)*uSc+uMin;}
vec3 gzNrm(vec4 b){vec2 e=b.ba*2.-1.;vec3 n=vec3(e,1.-abs(e.x)-abs(e.y));if(n.z<0.)n.xy=(1.-abs(n.yx))*vec2(n.x>=0.?1.:-1.,n.y>=0.?1.:-1.);return normalize(n);}`)
        .replace('#include <beginnormal_vertex>',`float gzF=mod((uT*aAnim.z+aAnim.w)*uFps,aAnim.y);float gz0=floor(gzF),gz1=mod(gz0+1.,aAnim.y),gzT=gzF-gz0;
float gzU=(aVid+.5)/uW;vec2 q0=vec2(gzU,(aAnim.x+gz0+.5)/uH),q1=vec2(gzU,(aAnim.x+gz1+.5)/uH);
vec4 a0=texture2D(tA,q0),b0=texture2D(tB,q0),a1=texture2D(tA,q1),b1=texture2D(tB,q1);
vec3 gzP=mix(gzPos(a0,b0),gzPos(a1,b1),gzT);vec3 objectNormal=normalize(mix(gzNrm(b0),gzNrm(b1),gzT));vPart=aPart;vVar=aVar;`)
        .replace('#include <begin_vertex>','vec3 transformed=gzP;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vPart;varying vec3 vVar;uniform vec3 uJ0,uJ1,uSh0,uSh1,uSo0,uSo1;uniform vec3 uShoe[7];uniform vec3 uCap[7];')
        .replace('#include <map_fragment>',`#include <map_fragment>
      {float lum=dot(diffuseColor.rgb,vec3(.299,.587,.114));int pt=int(vPart+.5);bool t1=vVar.x>.5;vec3 tc=diffuseColor.rgb;
       if(pt==1)tc=t1?uJ1:uJ0;else if(pt==2)tc=t1?uSh1:uSh0;else if(pt==3)tc=t1?uSo1:uSo0;
       else if(pt==4){int k=int(vVar.y+.5);for(int i=0;i<7;i++)if(i==k)tc=uShoe[i];}
       else if(pt==5){int k=int(vVar.z+.5);for(int i=0;i<7;i++)if(i==k)tc=uCap[i];}
       if(pt>0){
       #ifdef GZ_LIN
       tc=pow(max(tc,vec3(0.)),vec3(2.2));lum=pow(max(lum,0.),.4545);
       #endif
       diffuseColor.rgb=tc*clamp(.42+lum*1.35,.35,1.25);}}`);};
    return {s,g,mat,HAND,list:[]};});
  // repartir: cada lugar con un personaje al azar
  const R=Math.random,names=m.species.map(s=>s.name);let tot=0;const cum=names.map(n=>tot+=MIX[n]||.2);
  const pick=()=>{const r=R()*tot;for(let i=0;i<cum.length;i++)if(r<cum[i])return i;return cum.length-1;};
  const H=[],team=s=>(s.x<0?0:1);
  for(let i=0;i<N;i++){const s=list[i],si=pick(),sp=SPC[si];const r=R();
    const base=r<.5?'tranquilo':r<.68?'sigue':r<.86?'aplauso':'bandera';
    const h={sp:si,k:sp.list.length,x:s.x,y:s.y,z:s.z,ry:s.ry,yaw:s.ry,team:team(s),base,cur:'',until:0,rate:.85+R()*.3,ph:R()*10,shoe:Math.floor(R()*7),cap:Math.floor(R()*7),sw:6+R()*14,s:SC*(SIZE[names[si]]||1)*(.94+R()*.12)};
    sp.list.push(h);H.push(h);}
  for(const sp of SPC){const n=Math.max(1,sp.list.length);
    sp.anim=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4);sp.anim.setUsage(THREE.DynamicDrawUsage);sp.g.setAttribute('aAnim',sp.anim);
    sp.var=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);sp.g.setAttribute('aVar',sp.var);
    const im=new THREE.InstancedMesh(sp.g,sp.mat,n);im.count=sp.list.length;im.userData.gzDyn=1;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);par.add(im);sp.im=im;
    for(const h of sp.list){sp.var.setXYZ(h.k,h.team,h.shoe,h.cap);}}
  // ---- banderas (las de los que hacen la animación de bandera)
  const tm=(c,o2)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o2||{}));
  const FL=Math.max(1,H.filter(h=>h.base==='bandera').length+Math.ceil(N*.2));
  const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.012,.012,.9,5).translate(0,.3,0),tm(0x6b4a2a),FL);
  const clothG=new THREE.PlaneGeometry(.5,.32,8,3);clothG.translate(-.25,.58,0);
  const clothM=tm(0xffffff,{side:THREE.DoubleSide});const ut={value:0};
  clothM.onBeforeCompile=s=>{s.uniforms.uT=ut;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>',
    `#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*1.7+instanceMatrix[3].z*1.3;\n#else\nfloat ph=0.;\n#endif\nfloat w=clamp(-position.x/.5,0.,1.);transformed.z+=sin(position.x*9.+uT*7.+ph)*.06*w;transformed.y+=sin(position.x*6.+uT*5.+ph)*.02*w;`);};
  const cloth=new THREE.InstancedMesh(clothG,clothM,FL);cloth.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(FL*3),3);
  for(const im of [pole,cloth]){im.userData.gzDyn=1;im.count=0;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);par.add(im);}
  const flagCol=[kc(K[0],'j'),kc(K[1],'j')];
  // ---- reacciones
  let T=0;
  C.react=(ev,tm2)=>{for(const h of H){const r=R();
    if(ev==='gol'){h.cur=h.team===tm2?(r<.7?'festejo':r<.85?'bandera':'aplauso'):(r<.6?'lamento':r<.9?'cabeza':'tranquilo');h.until=T+5+R()*3;}
    else if(ev==='casi'){h.cur=r<.7?'cabeza':h.base;h.until=T+2.5+R()*1.5;}
    else if(ev==='ola'){h.cur='festejo';h.until=T+3;}}};
  C.setKits=k=>{if(!k||!k[0]||!k[1])return;uni.uJ0.value.copy(kc(k[0],'j'));uni.uJ1.value.copy(kc(k[1],'j'));uni.uSh0.value.copy(kc(k[0],'sh','d'));uni.uSh1.value.copy(kc(k[1],'sh','d'));uni.uSo0.value.copy(kc(k[0],'so','s'));uni.uSo1.value.copy(kc(k[1],'so','s'));
    flagCol[0].copy(kc(k[0],'j'));flagCol[1].copy(kc(k[1],'j'));};
  // ---- cada cuadro
  const Mt=new THREE.Matrix4(),Mh=new THREE.Matrix4(),Mp=new THREE.Matrix4(),Q4=new THREE.Quaternion(),S3=new THREE.Vector3(),P3=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  C.update=(dt,ball)=>{T+=dt;uT.value=T;ut.value=T;let nfl=0;
    for(const sp of SPC){const an=sp.anim.array;
      for(const h of sp.list){
        if(h.cur&&T>h.until)h.cur='';
        h.sw-=dt;if(h.sw<0){h.sw=8+R()*16;if(h.base!=='bandera'){const r=R();h.base=r<.5?'tranquilo':r<.75?'sigue':'aplauso';}}   // a veces cambian
        const nm=h.cur||(h.base==='sigue'?'tranquilo':h.base),c=clip[nm];
        an[h.k*4]=c.start;an[h.k*4+1]=c.n;an[h.k*4+2]=h.rate;an[h.k*4+3]=h.ph;
        if(h.base==='sigue'&&!h.cur&&ball){const want=Math.atan2(ball.x-h.x,ball.z-h.z);let d=want-h.ry;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;d=Math.max(-.9,Math.min(.9,d));h.yaw+=(h.ry+d-h.yaw)*Math.min(1,dt*3);}else h.yaw+=(h.ry-h.yaw)*Math.min(1,dt*3);
        Q4.setFromAxisAngle(up,h.yaw);S3.set(h.s,h.s,h.s);P3.set(h.x,h.y,h.z);Mt.compose(P3,Q4,S3);sp.im.setMatrixAt(h.k,Mt);
        if(nm==='bandera'&&nfl<FL){const f=c.start+Math.floor(((T*h.rate+h.ph)*fps)%c.n),a=sp.HAND,o2=f*12;
          Mh.set(a[o2],a[o2+1],a[o2+2],a[o2+3],a[o2+4],a[o2+5],a[o2+6],a[o2+7],a[o2+8],a[o2+9],a[o2+10],a[o2+11],0,0,0,1);Mp.multiplyMatrices(Mt,Mh);
          pole.setMatrixAt(nfl,Mp);cloth.setMatrixAt(nfl,Mp);const cc=flagCol[h.team];cloth.instanceColor.setXYZ(nfl,cc.r,cc.g,cc.b);nfl++;}}
      sp.anim.needsUpdate=true;sp.im.instanceMatrix.needsUpdate=true;}
    pole.count=cloth.count=nfl;pole.instanceMatrix.needsUpdate=cloth.instanceMatrix.needsUpdate=true;cloth.instanceColor.needsUpdate=true;};
  C.ready=true;}
return C;};
