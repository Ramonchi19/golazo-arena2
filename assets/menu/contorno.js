// ===== Contorno negro delgado que sigue la silueta (de frente, de lado, girando) =====
// Técnica de "casco invertido": una copia de la malla con sus caras de atrás, pintada de negro y empujada hacia afuera
// en pantalla un poquito; como solo se ven las caras de atrás, queda como una línea alrededor del personaje.
// El grosor es una fracción de la altura de la pantalla (igual en cualquier teléfono) y usa normales suavizadas
// (las de Tripo vienen partidas en las costuras y abrirían huecos en la línea).
(function(){
const ls=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}};
const ACTIVO=()=>ls('tc_contorno','1')==='1';
function normalesSuaves(g){if(g.attributes.nSuave)return;const p=g.attributes.position,n=g.attributes.normal,N=p.count,m=new Map(),acc=[];
  for(let i=0;i<N;i++){const k=Math.round(p.getX(i)*1e4)+','+Math.round(p.getY(i)*1e4)+','+Math.round(p.getZ(i)*1e4);let j=m.get(k);
    if(j===undefined){j=acc.length/3;m.set(k,j);acc.push(0,0,0);}acc[j*3]+=n.getX(i);acc[j*3+1]+=n.getY(i);acc[j*3+2]+=n.getZ(i);g.userData._k=g.userData._k||new Int32Array(N);g.userData._k[i]=j;}
  const out=new Float32Array(N*3),K=g.userData._k;
  for(let i=0;i<N;i++){const j=K[i];let x=acc[j*3],y=acc[j*3+1],z=acc[j*3+2];const l=Math.hypot(x,y,z)||1;out[i*3]=x/l;out[i*3+1]=y/l;out[i*3+2]=z/l;}
  g.setAttribute('nSuave',new THREE.BufferAttribute(out,3));delete g.userData._k;}
function material(grosor,color){const m=new THREE.MeshBasicMaterial({color:color||0x0a0d1c,side:THREE.BackSide});m.skinning=true;
  m.onBeforeCompile=sh=>{sh.uniforms.uGrosor={value:grosor};
    // el material básico solo calcula normales si hay envmap: aquí se calcula la normal suave (con piel) a mano
    sh.vertexShader='attribute vec3 nSuave;\nuniform float uGrosor;\n'+sh.vertexShader
      .replace('#include <begin_vertex>','vec3 objectNormal = vec3( nSuave );\n#include <skinnormal_vertex>\n#include <begin_vertex>')
      .replace('#include <project_vertex>','#include <project_vertex>\n{vec4 cn=projectionMatrix*modelViewMatrix*vec4(objectNormal,0.0);vec2 d=cn.xy;float l=length(d);if(l>1e-5){d/=l;float asp=projectionMatrix[1][1]/projectionMatrix[0][0];d.x/=asp;gl_Position.xy+=d*uGrosor*2.0*gl_Position.w;}}');
  };m.userData.contorno=true;return m;}
// grosor: fracción de la altura de la pantalla (0.0022 ≈ 1.5 px en 720p)
function poner(model,grosor){if(!model||model.userData.contorno)return;model.userData.contorno=[];const g0=grosor||.0022,lista=[];
  model.traverse(o=>{if((o.isSkinnedMesh||o.isMesh)&&!o.userData.esContorno&&o.geometry&&o.geometry.attributes.normal)lista.push(o);});
  for(const o of lista){normalesSuaves(o.geometry);let c;
    if(o.isSkinnedMesh){c=new THREE.SkinnedMesh(o.geometry,material(g0));c.bind(o.skeleton,o.bindMatrix);c.bindMode=o.bindMode;}
    else{c=new THREE.Mesh(o.geometry,material(g0));c.material.skinning=false;}
    c.userData.esContorno=true;c.frustumCulled=false;c.renderOrder=-1;c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);
    o.parent.add(c);model.userData.contorno.push(c);}
  visible(model,ACTIVO());}
function visible(model,v){if(model&&model.userData.contorno)for(const c of model.userData.contorno)c.visible=v;}
window.CONTORNO={poner,visible,ACTIVO,setActivo:v=>{try{localStorage.setItem('tc_contorno',v?'1':'0');}catch(e){}}};
})();
