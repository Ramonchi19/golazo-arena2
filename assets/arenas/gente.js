// =====================================================================
// v217: PÚBLICO ESTILO STRIKERS (gente.js)
// Vikinguitos, gnomos, goblins, hongos (amarillo y rojo) y esqueletos (solo de la Tundra en adelante), con 4 animaciones:
// normal, brinquitos, manos arriba con brincos y cabeza abajo (brazos ya corregidos para no chocar con cabeza ni cuerpo).
// - Gradas llenas y apretadas: hasta 3 aficionados por lugar, más chicos que los jugadores.
// - Cerca de la cámara: modelo 3D completo (poses guardadas en textura, la tarjeta de video mezcla dos cuadros).
// - Lejos: imagen plana animada sacada del mismo modelo al cargar (se hace en el celular, una vez). Así caben miles.
// - Color de juguete: colores puros y brillantes con su propio sombreado (no se apagan con la luz de la arena).
// - Playera blanca y short oscuro se pintan del equipo al que apoyan (media grada cada uno).
// uso: const P=GZ_GENTE({scene,root,seats,camera,arena,kits:[k0,k1],level}); P.update(dt,ball); P.react('gol',equipo)|P.react('casi')
// =====================================================================
window.GZ_GENTE=function(o){
const C={update(){},react(){},setKits(){},ready:false,count:0};
const seats=o.seats||[];if(!seats.length||typeof THREE==='undefined')return C;
const par=o.root||o.scene,cam=o.camera||null,AR=o.arena||0;
const low=((window.save&&save.settings&&save.settings.quality)==='baja');
const USE_IMP=false;   // v217g: todos en 3D completo, iguales en cualquier cámara (sin imágenes planas de lejos)
const PER=low?2:3,SC=o.size||1.35,NEAR=low?16:24,NEARMAX=low?120:260;
const V='?v=219b',DIR='assets/arenas/gente/';
const getBin=window.GZ_GETBIN||(u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.arrayBuffer();}));
fetch(DIR+'gente.json'+V).then(r=>r.json()).then(m=>{
  const allowed=m.species.filter(s=>s.name!=='esqueleto'||[11,12,14,13].includes(AR));   // esqueletos: después del Desierto
  return Promise.all(allowed.map(s=>getBin(DIR+s.name+'.bin'+V))).then(bs=>{try{build(m,allowed,bs);console.log('público:',C.count);}catch(e){fail(e);}});}).catch(fail);
function fail(e){console.warn('público: no cargó',e);C.error=String(e&&e.message||e);try{if(window.toast)toast('Público: '+C.error);}catch(_){}}
// ---- pies en el escalón (raycast hacia abajo, piso plano alrededor) ----
function floorCast(list){
  const sc=o.scene||par;sc.updateMatrixWorld(true);const objs=[];
  sc.traverse(x=>{if(!x.isMesh||x.isInstancedMesh||x.isSkinnedMesh||!x.geometry||x.userData.gzDyn||(x.material&&x.material.visible===false))return;for(let q=x;q;q=q.parent)if(q.visible===false)return;objs.push(x);});
  // v219b: índice por cuadritos de los triángulos (en vez de raycast contra todo): con la arena ya unida en piezas enormes el raycast tardaba minutos (la Mansión se trababa)
  let y0m=1e9,y1m=-1e9;for(const s of list){y0m=Math.min(y0m,s.y);y1m=Math.max(y1m,s.y);}const YA=y0m-1.6,YB=y1m+1.2;
  const TR=[],grid=new Map(),big=[],key=(i,j)=>i*73856093^j*19349663,va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3();
  for(const m of objs){const g=m.geometry,pa=g.attributes.position;if(!pa)continue;const ix=g.index,nt=ix?ix.count/3:pa.count/3,mw=m.matrixWorld;
    for(let t=0;t<nt;t++){const i0=ix?ix.getX(t*3):t*3,i1=ix?ix.getX(t*3+1):t*3+1,i2=ix?ix.getX(t*3+2):t*3+2;
      va.fromBufferAttribute(pa,i0).applyMatrix4(mw);vb.fromBufferAttribute(pa,i1).applyMatrix4(mw);vc.fromBufferAttribute(pa,i2).applyMatrix4(mw);
      const ymn=Math.min(va.y,vb.y,vc.y),ymx=Math.max(va.y,vb.y,vc.y);if(ymx<YA||ymn>YB)continue;
      const ux=vb.x-va.x,uy=vb.y-va.y,uz=vb.z-va.z,wx=vc.x-va.x,wy=vc.y-va.y,wz=vc.z-va.z,nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,nl=Math.hypot(nx,ny,nz)||1;
      if(Math.abs(ny/nl)<.15)continue;   // paredes paradas: un rayo hacia abajo no les pega
      const k=TR.length;TR.push(va.x,va.y,va.z,vb.x,vb.y,vb.z,vc.x,vc.y,vc.z,Math.abs(ny/nl)>.7?1:0);
      const x0=Math.floor(Math.min(va.x,vb.x,vc.x)),x1=Math.floor(Math.max(va.x,vb.x,vc.x)),z0=Math.floor(Math.min(va.z,vb.z,vc.z)),z1=Math.floor(Math.max(va.z,vb.z,vc.z));
      if((x1-x0+1)*(z1-z0+1)>300){big.push(k);continue;}
      for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const kk=key(i,j);let c=grid.get(kk);if(!c)grid.set(kk,c=[]);c.push(k);}}}
  const hit=(k,x,z)=>{const ax=TR[k],ay=TR[k+1],az=TR[k+2],bx=TR[k+3],by=TR[k+4],bz=TR[k+5],cx=TR[k+6],cy=TR[k+7],cz=TR[k+8];
    const d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-9)return null;const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;
    if(l1<-1e-4||l2<-1e-4||l3<-1e-4)return null;return l1*ay+l2*by+l3*cy;};
  const top=(x,z,y0)=>{const yt=y0+1.1,yb=y0-1.5;let best=-1e9,fl=0;const c=grid.get(key(Math.floor(x),Math.floor(z)));
    for(const L of [c||[],big])for(const k of L){const y=hit(k,x,z);if(y!=null&&y<=yt&&y>=yb&&y>best){best=y;fl=TR[k+9];}}
    return best>-1e8&&fl?best:null;};
  const out=[];
  for(const s of list){const fx=Math.sin(s.ry),fz=Math.cos(s.ry),lx=fz,lz=-fx;let best=null;
    for(const d of [0,.06,-.06,.12,-.12,.18,-.18,.25,-.25,.32,-.32]){const x=s.x+fx*d,z=s.z+fz*d,y=top(x,z,s.y);if(y==null)continue;
      let ok=true,ym=y;for(const [a,b] of [[.18,0],[-.18,0],[0,.5],[0,-.5]]){const y2=top(x+fx*a+lx*b,z+fz*a+lz*b,s.y);if(y2==null||Math.abs(y2-y)>.04){ok=false;break;}ym=Math.max(ym,y2);}
      if(ok){best={x,y:ym,z,ry:s.ry,lx,lz};break;}}
    if(best)out.push(best);}
  return out;}
// ---- código común de la tarjeta de video: leer la pose del cuadro, pintar del equipo, sombreado de juguete ----
const VAT=`uniform sampler2D tA,tB;uniform float uW,uH,uT,uFps;uniform vec3 uMin,uSc;
vec3 gzPos(vec4 a,vec4 b){return vec3(a.r*65280.+a.g*255.,a.b*65280.+a.a*255.,b.r*65280.+b.g*255.)*uSc+uMin;}
vec3 gzNrm(vec4 b){vec2 e=b.ba*2.-1.;vec3 n=vec3(e,1.-abs(e.x)-abs(e.y));if(n.z<0.)n.xy=(1.-abs(n.yx))*vec2(n.x>=0.?1.:-1.,n.y>=0.?1.:-1.);return normalize(n);}
void gzRead(float vid,float row0,float row1,float t,out vec3 p,out vec3 n){float u=(vid+.5)/uW;vec2 q0=vec2(u,(row0+.5)/uH),q1=vec2(u,(row1+.5)/uH);
  vec4 a0=texture2D(tA,q0),b0=texture2D(tB,q0),a1=texture2D(tA,q1),b1=texture2D(tB,q1);p=mix(gzPos(a0,b0),gzPos(a1,b1),t);n=normalize(mix(gzNrm(b0),gzNrm(b1),t));}`;
// regla de color, pixel por pixel: en el torso lo blanco es playera; en torso y muslos lo oscuro es short
const PAINT=`float gzShirt(vec3 c,float z){float l=dot(c,vec3(.333));float s=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));return (z>.5&&z<1.5&&l>.55&&s<.22)?1.:0.;}
float gzShorts(vec3 c,float z){float l=dot(c,vec3(.333));return (z>.5&&l<.42&&gzShirt(c,z)<.5)?1.:0.;}
vec3 gzToy(vec3 c){float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.22);return clamp(c*1.08,0.,.9);}`;
const LDIR='vec3 gzL=normalize(vec3(.35,.85,.55));';
function build(m,SPC,bins){
  const nf=m.nf,fps=m.fps,clip={};m.clips.forEach(c=>clip[c.name]=c);
  // ---- lugares: un raycast por asiento y hasta 3 aficionados a lo ancho ----
  let base=seats;try{base=floorCast(seats);}catch(e){console.warn('público: piso',e);base=seats.map(s=>({x:s.x,y:s.y,z:s.z,ry:s.ry,lx:Math.cos(s.ry),lz:-Math.sin(s.ry)}));}
  const OFF=PER===3?[-.53,0,.53]:[-.34,.34],pos=[];const R=Math.random;
  for(const s of base)for(const d of OFF){if(R()<.22)continue;const j=(R()-.5)*.06;   /* un poco más separados: 1 de cada 5 lugares queda libre */pos.push({x:s.x+s.lx*(d+j),y:s.y,z:s.z+s.lz*(d+j),ry:s.ry+(R()-.5)*.25});}
  const N=pos.length;if(!N){fail('sin lugares en las gradas');return;}C.count=N;
  const K=o.kits||[{j:0x2f7bff,sh:0x173f99},{j:0xff3b4e,sh:0x99202e}];
  const kc=(k,a,b)=>new THREE.Color(k[a]!=null?k[a]:(k[b]!=null?k[b]:k.j));
  const U={uJ0:{value:kc(K[0],'j')},uJ1:{value:kc(K[1],'j')},uSh0:{value:kc(K[0],'sh','d')},uSh1:{value:kc(K[1],'sh','d')},uT:{value:0},uFps:{value:fps},uCamR:{value:new THREE.Vector3(1,0,0)},uCamF:{value:new THREE.Vector3(0,0,1)}};
  const MIX={vikingo:1,gnomo:1,hongoA:1.1,hongoR:1.1,esqueleto:.9,goblin:1};
  const SIZE={gnomo:.86,goblin:.95,hongoR:1,hongoA:1.06,esqueleto:1.12,vikingo:1.2};   // cada especie de su tamaño (todos los de una especie iguales)
  let tot=0;const cum=SPC.map(s=>tot+=MIX[s.name]||1);const pick=()=>{const r=R()*tot;for(let i=0;i<cum.length;i++)if(r<cum[i])return i;return cum.length-1;};
  const H=[];
  const SP=SPC.map((s,si)=>{
    const b=bins[si],nv=s.nv,nt=s.nt,off=s.off;
    const Q=new Uint16Array(b,off[0],nf*nv*3),OC=new Uint8Array(b,off[1],nf*nv*2),UVA=new Float32Array(b,off[2],nv*2),IDX=new Uint16Array(b,off[3],nt*3),PART=new Uint8Array(b,off[4],nv);
    const A=new Uint8Array(nv*nf*4),B=new Uint8Array(nv*nf*4);
    for(let i=0,n=nv*nf;i<n;i++){const x=Q[i*3],y=Q[i*3+1],z=Q[i*3+2];A[i*4]=x>>8;A[i*4+1]=x&255;A[i*4+2]=y>>8;A[i*4+3]=y&255;B[i*4]=z>>8;B[i*4+1]=z&255;B[i*4+2]=OC[i*2];B[i*4+3]=OC[i*2+1];}
    const dt=a=>{const t=new THREE.DataTexture(a,nv,nf,THREE.RGBAFormat,THREE.UnsignedByteType);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.needsUpdate=true;return t;};
    const g=new THREE.BufferGeometry(),P0=new Float32Array(nv*3),VID=new Float32Array(nv);
    for(let i=0;i<nv;i++){VID[i]=i;for(let k=0;k<3;k++)P0[i*3+k]=Q[i*3+k]*s.scale[k]+s.min[k];}
    g.setAttribute('position',new THREE.BufferAttribute(P0,3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(UVA),2));
    g.setAttribute('aVid',new THREE.BufferAttribute(VID,1));g.setAttribute('aZone',new THREE.BufferAttribute(new Float32Array(PART),1));g.setIndex(new THREE.BufferAttribute(new Uint16Array(IDX),1));
    const tex=new THREE.TextureLoader().load(DIR+s.tex+V,()=>{if(USE_IMP)bakeOne(sp);});tex.flipY=false;
    const su={tA:{value:dt(A)},tB:{value:dt(B)},uW:{value:nv},uH:{value:nf},uMin:{value:new THREE.Vector3().fromArray(s.min)},uSc:{value:new THREE.Vector3().fromArray(s.scale)}};
    // modelo 3D (cerca)
    const mat=new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide});   // v217f: recibe la luz y las sombras de la arena
    mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,su,U);
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+VAT+'\nattribute float aVid,aZone;attribute vec4 aAnim;attribute float aTeam;varying float vZone,vTeam;')
        .replace('#include <beginnormal_vertex>',`float gzF=mod((uT*aAnim.z+aAnim.w)*uFps,aAnim.y);float gz0=floor(gzF);vec3 gzP,gzN;gzRead(aVid,aAnim.x+gz0,aAnim.x+mod(gz0+1.,aAnim.y),gzF-gz0,gzP,gzN);
vec3 objectNormal=gzN;vZone=aZone;vTeam=aTeam;`).replace('#include <begin_vertex>','vec3 transformed=gzP;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+PAINT+'\nuniform vec3 uJ0,uJ1,uSh0,uSh1;varying float vZone,vTeam;')
        .replace('#include <map_fragment>',`#include <map_fragment>
{vec3 c=diffuseColor.rgb;
#ifdef GZ_LIN
vec3 cg=pow(max(c,vec3(0.)),vec3(.4545));
#else
vec3 cg=c;
#endif
float l=dot(cg,vec3(.333));vec3 tc=cg;bool t1=vTeam>.5;
if(gzShirt(cg,vZone)>.5)tc=(t1?uJ1:uJ0)*clamp(l*1.15,.55,1.15);else if(gzShorts(cg,vZone)>.5)tc=(t1?uSh1:uSh0)*clamp(.55+l,.5,1.);
tc=min(gzToy(tc),vec3(.9));
#ifdef GZ_LIN
tc=pow(max(tc,vec3(0.)),vec3(2.2));
#endif
diffuseColor.rgb=tc;}`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*.1;');};
    mat.customProgramCacheKey=()=>'gente-mesh-l';
    const sp={s,g,mat,su,tex,list:[],imp:null};return sp;});
  // ---- repartir aficionados ----
  for(let i=0;i<N;i++){const p=pos[i],si=pick(),sp=SP[si];const r=R();
    const h={sp:si,k:sp.list.length,x:p.x,y:p.y,z:p.z,ry:p.ry,team:p.x<0?0:1,base:r<.5?'normal':r<.75?'manos':'brinquitos',cur:'',until:0,
      rate:.85+R()*.3,ph:R()*10,sw:6+R()*14,s:SC*(SIZE[sp.s.name]||1)*(.98+R()*.04),near:false};
    sp.list.push(h);H.push(h);}
  // ---- impostores: imagen plana animada (lejos) ----
  const TILE=low?48:64,PITCH=.5;   // vista un poco desde arriba, como la cámara del juego
  function bakeOne(sp){try{
    const s=sp.s,cols=Math.ceil(Math.sqrt(nf)),rows=Math.ceil(nf/cols),Wt=cols*TILE,Ht=rows*TILE;
    const hgt=s.height||1,box=Math.max(hgt*1.25,.9);
    const ocam=new THREE.OrthographicCamera(-box/2,box/2,box/2,-box/2,.01,20);
    const cy=hgt*.5;ocam.position.set(0,cy+Math.sin(PITCH)*5,Math.cos(PITCH)*5);ocam.lookAt(0,cy,0);
    const mk=(mode)=>new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:Object.assign({map:{value:sp.tex},uFrame:{value:0},uMode:{value:mode}},sp.su),
      vertexShader:VAT+'\nattribute float aVid,aZone;uniform float uFrame;varying vec2 vUv;varying float vZone,vShade;'+
        `void main(){vec3 p,n;gzRead(aVid,uFrame,uFrame,0.,p,n);vUv=uv;vZone=aZone;${LDIR}vShade=.62+.42*max(dot(n,gzL),0.)+.12*max(n.y,0.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader:'uniform sampler2D map;uniform float uMode;varying vec2 vUv;varying float vZone,vShade;\n'+PAINT+
        `void main(){vec3 c=texture2D(map,vUv).rgb;float sh=gzShirt(c,vZone),so=gzShorts(c,vZone);
          if(uMode<.5){vec3 o=(sh>.5||so>.5)?vec3(dot(c,vec3(.333))):gzToy(c);gl_FragColor=vec4(clamp(o*(.8+.3*max(vShade-.62,0.)),0.,.9),1.);}
          else gl_FragColor=vec4(sh,so,0.,1.);}`});
    const bs=new THREE.Scene(),bm=new THREE.Mesh(sp.g,mk(0));bm.frustumCulled=false;bs.add(bm);
    const r=o.renderer||window.renderer;if(!r)return;
    const rts=[0,1].map(()=>{const t=new THREE.WebGLRenderTarget(Wt,Ht,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false});t.texture.flipY=false;return t;});
    const prevRT=r.getRenderTarget(),prevCol=r.getClearColor(new THREE.Color()),prevA=r.getClearAlpha(),prevAuto=r.autoClear,prevEnc=r.outputEncoding,prevTM=r.toneMapping;
    r.outputEncoding=THREE.LinearEncoding;r.toneMapping=THREE.NoToneMapping;r.autoClear=false;
    for(let mode=0;mode<2;mode++){bm.material=mk(mode);const rt=rts[mode];r.setRenderTarget(rt);r.setClearColor(0x000000,0);rt.scissorTest=false;rt.viewport.set(0,0,Wt,Ht);r.clear(true,true,true);
      for(let f=0;f<nf;f++){const cx=(f%cols)*TILE,cyy=Math.floor(f/cols)*TILE;rt.viewport.set(cx,cyy,TILE,TILE);rt.scissor.set(cx,cyy,TILE,TILE);rt.scissorTest=true;r.setRenderTarget(rt);
        bm.material.uniforms.uFrame.value=f;r.clear(true,true,true);r.render(bs,ocam);}
      rt.scissorTest=false;rt.viewport.set(0,0,Wt,Ht);}
    r.setRenderTarget(prevRT);r.setClearColor(prevCol,prevA);r.autoClear=prevAuto;r.outputEncoding=prevEnc;r.toneMapping=prevTM;
    // cuadro plano: abajo en los pies, mira siempre a la cámara (gira solo de lado)
    const pg=new THREE.PlaneGeometry(box,box);pg.translate(0,cy,0);
    const n=Math.max(1,sp.list.length);
    const im=new THREE.InstancedMesh(pg,null,n);
    const pm=new THREE.MeshLambertMaterial({map:rts[0].texture,transparent:false,alphaTest:.5,side:THREE.DoubleSide});
    pm.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U,{tMask:{value:rts[1].texture},uCols:{value:cols},uRows:{value:rows}});
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT,uFps,uCols,uRows;uniform vec3 uCamR,uCamF;attribute vec4 aAnim;attribute float aTeam;varying float vTeam;')
        .replace('#include <uv_vertex>',`#include <uv_vertex>
float gzF=floor(mod((uT*aAnim.z+aAnim.w)*uFps,aAnim.y))+aAnim.x;float gc=mod(gzF,uCols),gr=floor(gzF/uCols);
vUv=(vec2(gc,gr)+uv)/vec2(uCols,uRows);vTeam=aTeam;`)
        .replace('#include <defaultnormal_vertex>','vec3 transformedNormal=normalize(mat3(viewMatrix)*normalize(vec3(0.,.65,0.)+uCamF*.75));')
        .replace('#include <worldpos_vertex>','vec4 worldPosition=vec4(gzW,1.);')
        .replace('#include <project_vertex>',`vec3 ic=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float isc=length((modelMatrix*instanceMatrix*vec4(1.,0.,0.,0.)).xyz);
vec3 gzW=ic+uCamR*transformed.x*isc+vec3(0.,1.,0.)*transformed.y*isc;vec4 mvPosition=viewMatrix*vec4(gzW,1.);gl_Position=projectionMatrix*mvPosition;`);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tMask;uniform vec3 uJ0,uJ1,uSh0,uSh1;varying float vTeam;')
        .replace('#include <map_fragment>',`#include <map_fragment>
{vec4 mk=texture2D(tMask,vUv);bool t1=vTeam>.5;vec3 c=diffuseColor.rgb;
#ifdef GZ_LIN
vec3 cg=pow(max(c,vec3(0.)),vec3(.4545));
#else
vec3 cg=c;
#endif
vec3 tc=cg;float l=cg.r;
if(mk.r>.5)tc=gzToyI((t1?uJ1:uJ0)*clamp(l*1.15,.55,1.15));else if(mk.g>.5)tc=gzToyI((t1?uSh1:uSh0)*clamp(.55+l,.5,1.));
#ifdef GZ_LIN
tc=pow(max(tc,vec3(0.)),vec3(2.2));
#endif
diffuseColor.rgb=tc;}`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*.1;').replace('#include <common>','#include <common>\nvec3 gzToyI(vec3 c){float l=dot(c,vec3(.299,.587,.114));return clamp(mix(vec3(l),c,1.22)*1.08,0.,.9);}');};
    pm.customProgramCacheKey=()=>'gente-imp-l';
    im.material=pm;sp.imp=im;attach(sp,im,true);
  }catch(e){console.warn('público: imágenes de lejos',e);}}
  let T=0,dirty=true,lodT=0;
  // ---- instancias ----
  function attach(sp,im,isImp){const n=Math.max(1,sp.list.length),g=im.geometry;
    const an=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4);an.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aAnim',an);
    const tm=new THREE.InstancedBufferAttribute(new Float32Array(n),1);g.setAttribute('aTeam',tm);
    for(const h of sp.list){tm.setX(h.k,h.team);}
    im.count=sp.list.length;im.userData.gzDyn=1;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if(isImp)sp.ian=an;else sp.man=an;par.add(im);dirty=true;}
  for(const sp of SP){const im=new THREE.InstancedMesh(sp.g,sp.mat,Math.max(1,sp.list.length));sp.mesh=im;attach(sp,im,false);}
  // ---- reacciones ----
  C.react=(ev,tm2)=>{for(const h of H){const r=R();
    if(ev==='gol'){h.cur=h.team===tm2?'manos':(r<.8?'cabeza':'normal');h.until=T+6+R()*2;}   // gol: todo su equipo brinca con las manos arriba
    else if(ev==='casi'){h.cur=r<.55?'cabeza':h.base;h.until=T+2.5+R()*1.5;}}dirty=true;};
  C.setKits=k=>{if(!k||!k[0]||!k[1])return;U.uJ0.value.copy(kc(k[0],'j'));U.uJ1.value.copy(kc(k[1],'j'));U.uSh0.value.copy(kc(k[0],'sh','d'));U.uSh1.value.copy(kc(k[1],'sh','d'));};
  const Mt=new THREE.Matrix4(),Z=new THREE.Matrix4().makeScale(0,0,0),Q4=new THREE.Quaternion(),S3=new THREE.Vector3(),P3=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),cp=new THREE.Vector3(),cr=new THREE.Vector3();
  C.update=(dt)=>{T+=dt;U.uT.value=T;
    if(cam){cr.setFromMatrixColumn(cam.matrixWorld,0);cr.y=0;if(cr.lengthSq()>1e-6)U.uCamR.value.copy(cr.normalize());cr.setFromMatrixColumn(cam.matrixWorld,2);cr.y=0;if(cr.lengthSq()>1e-6)U.uCamF.value.copy(cr.normalize());}
    for(const h of H){if(h.cur&&T>h.until){h.cur='';dirty=true;}h.sw-=dt;if(h.sw<0){h.sw=8+R()*16;const r=R();h.base=r<.5?'normal':r<.75?'manos':'brinquitos';dirty=true;}}
    lodT-=dt;if(lodT<=0){lodT=.25;   // quién va en 3D: los más cercanos a la cámara
      let near=[];if(cam){cam.getWorldPosition(cp);for(const h of H){h.d=Math.hypot(h.x-cp.x,h.y-cp.y,h.z-cp.z);if(h.d<NEAR)near.push(h);}near.sort((a,b)=>a.d-b.d);near=near.slice(0,NEARMAX);}
      const ns=new Set(near);for(const h of H){const v=ns.has(h)||!SP[h.sp].imp;if(v!==h.near){h.near=v;dirty=true;}}}
    if(!dirty)return;dirty=false;
    for(const sp of SP){const ma=sp.man&&sp.man.array,ia=sp.ian&&sp.ian.array;
      for(const h of sp.list){const c=clip[h.cur||h.base]||clip.normal;
        for(const a of [ma,ia])if(a){a[h.k*4]=c.start;a[h.k*4+1]=c.n;a[h.k*4+2]=h.rate;a[h.k*4+3]=h.ph;}
        Q4.setFromAxisAngle(up,h.ry);S3.set(h.s,h.s,h.s);P3.set(h.x,h.y,h.z);Mt.compose(P3,Q4,S3);
        sp.mesh.setMatrixAt(h.k,h.near?Mt:Z);if(sp.imp)sp.imp.setMatrixAt(h.k,h.near?Z:Mt);}
      if(sp.man)sp.man.needsUpdate=true;if(sp.ian)sp.ian.needsUpdate=true;sp.mesh.instanceMatrix.needsUpdate=true;if(sp.imp)sp.imp.instanceMatrix.needsUpdate=true;}};
  C.ready=true;}
return C;};
