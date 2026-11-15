// ===== Efectos de cada personaje en el lobby: partículas + luz (fuego, hielo, rayos, etc.) =====
(function(){
// ---------- texturas dibujadas en canvas ----------
function cv(n,f){const c=document.createElement('canvas');c.width=c.height=n;f(c.getContext('2d'),n);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;}
const TX={};
function tex(k){if(TX[k])return TX[k];const T={
  suave:(x,n)=>{const g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,n,n);},
  chispa:(x,n)=>{const g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.15,'rgba(255,255,255,.9)');g.addColorStop(.4,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,n,n);
    x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=n*.04;x.beginPath();x.moveTo(n/2,n*.05);x.lineTo(n/2,n*.95);x.moveTo(n*.05,n/2);x.lineTo(n*.95,n/2);x.stroke();},
  llama:(x,n)=>{const g=x.createRadialGradient(n/2,n*.6,0,n/2,n*.55,n*.5);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;
    x.beginPath();x.moveTo(n/2,n*.02);x.bezierCurveTo(n*.85,n*.4,n*.9,n*.75,n/2,n*.98);x.bezierCurveTo(n*.1,n*.75,n*.15,n*.4,n/2,n*.02);x.fill();},
  copo:(x,n)=>{x.strokeStyle='#fff';x.lineCap='round';x.lineWidth=n*.07;x.translate(n/2,n/2);for(let i=0;i<6;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-n*.42);x.moveTo(0,-n*.24);x.lineTo(n*.1,-n*.33);x.moveTo(0,-n*.24);x.lineTo(-n*.1,-n*.33);x.stroke();}
    const g=x.createRadialGradient(0,0,0,0,0,n*.2);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-n/2,-n/2,n,n);},
  petalo:(x,n)=>{x.fillStyle='#fff';x.beginPath();x.ellipse(n/2,n/2,n*.22,n*.4,.5,0,Math.PI*2);x.fill();x.fillStyle='rgba(255,210,225,1)';x.beginPath();x.ellipse(n*.48,n*.56,n*.08,n*.2,.5,0,Math.PI*2);x.fill();},
  pluma:(x,n)=>{x.fillStyle='#fff';x.beginPath();x.ellipse(n/2,n/2,n*.14,n*.44,.3,0,Math.PI*2);x.fill();x.strokeStyle='rgba(200,215,235,1)';x.lineWidth=n*.03;x.beginPath();x.moveTo(n*.38,n*.92);x.lineTo(n*.62,n*.08);x.stroke();},
  humo:(x,n)=>{for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=n*.14,cx=n/2+Math.cos(a)*r,cy=n/2+Math.sin(a)*r,g=x.createRadialGradient(cx,cy,0,cx,cy,n*.3);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,n,n);}},
  roca:(x,n)=>{x.fillStyle='#fff';x.beginPath();const k=7;for(let i=0;i<k;i++){const a=i/k*Math.PI*2,r=n*(.3+.12*Math.sin(i*2.7));x.lineTo(n/2+Math.cos(a)*r,n/2+Math.sin(a)*r);}x.fill();x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.arc(n*.58,n*.6,n*.18,0,Math.PI*2);x.fill();},
  moneda:(x,n)=>{const g=x.createRadialGradient(n*.4,n*.4,0,n/2,n/2,n*.45);g.addColorStop(0,'#fff');g.addColorStop(.6,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.ellipse(n/2,n/2,n*.42,n*.42,0,0,Math.PI*2);x.fill();},
  trebol:(x,n)=>{x.fillStyle='#fff';for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;x.beginPath();x.arc(n/2+Math.cos(a)*n*.15,n/2+Math.sin(a)*n*.15,n*.16,0,Math.PI*2);x.fill();}},
  estrella:(x,n)=>{x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,r=i%2?n*.18:n*.45;x.lineTo(n/2+Math.cos(a)*r,n/2+Math.sin(a)*r);}x.fill();},
  burbuja:(x,n)=>{x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=n*.07;x.beginPath();x.arc(n/2,n/2,n*.38,0,Math.PI*2);x.stroke();x.fillStyle='rgba(255,255,255,.25)';x.fill();x.fillStyle='#fff';x.beginPath();x.arc(n*.38,n*.36,n*.08,0,Math.PI*2);x.fill();},
  runa:(x,n)=>{x.strokeStyle='#fff';x.lineWidth=n*.09;x.lineCap='round';x.beginPath();x.moveTo(n*.4,n*.15);x.lineTo(n*.4,n*.85);x.moveTo(n*.4,n*.3);x.lineTo(n*.68,n*.15);x.moveTo(n*.4,n*.5);x.lineTo(n*.68,n*.35);x.stroke();
    const g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,n,n);}
 };return TX[k]=cv(64,T[k]);}

// ---------- material de partículas (tamaño, color y transparencia por partícula, giro) ----------
function material(textura,aditivo){return new THREE.ShaderMaterial({
  uniforms:{map:{value:tex(textura)},uEsc:{value:1}},
  vertexShader:'attribute float tam;attribute float alfa;attribute float giro;attribute vec3 col;varying float vA;varying vec3 vC;varying float vG;uniform float uEsc;'+
    'void main(){vA=alfa;vC=col;vG=giro;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=tam*uEsc/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D map;varying float vA;varying vec3 vC;varying float vG;'+
    'void main(){vec2 p=gl_PointCoord-.5;float c=cos(vG),s=sin(vG);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y)+.5;vec4 t=texture2D(map,p);gl_FragColor=vec4(vC*t.rgb,t.a*vA);if(gl_FragColor.a<.01)discard;}',
  transparent:true,depthWrite:false,blending:aditivo?THREE.AdditiveBlending:THREE.NormalBlending});}

const C=h=>new THREE.Color(h);
const lerpC=(a,b,t,o)=>o.copy(a).lerp(b,t);
// ---------- un emisor ----------
// cfg: {tex, add, n (máx), rate (por seg), vida:[a,b], tam:[ini,fin], col:[c0,c1,(c2)], alfa:[ini,medio,fin],
//       de: lista de huesos o 'pies'|'cuerpo'|'cabeza'|'arriba', rad, vel:[x,y,z], rnd:[x,y,z], grav, orbita (rad/s), giro, ondula, fin (multiplicador de alfa)}
function Emisor(cfg){
  const n=cfg.n||80,g=new THREE.BufferGeometry();
  this.cfg=cfg;this.n=n;this.pos=new Float32Array(n*3);this.vel=new Float32Array(n*3);this.edad=new Float32Array(n).fill(1e9);this.vida=new Float32Array(n);
  this.tam=new Float32Array(n);this.alfa=new Float32Array(n);this.giro=new Float32Array(n);this.vg=new Float32Array(n);this.col=new Float32Array(n*3);this.sem=new Float32Array(n);this.org=new Float32Array(n*3);
  g.setAttribute('position',new THREE.BufferAttribute(this.pos,3));g.setAttribute('tam',new THREE.BufferAttribute(this.tam,1));g.setAttribute('alfa',new THREE.BufferAttribute(this.alfa,1));
  g.setAttribute('giro',new THREE.BufferAttribute(this.giro,1));g.setAttribute('col',new THREE.BufferAttribute(this.col,3));
  this.mat=material(cfg.tex||'suave',cfg.add!==false);this.pts=new THREE.Points(g,this.mat);this.pts.frustumCulled=false;this.pts.renderOrder=5;
  this.cols=(cfg.col||['#ffffff']).map(C);this.acc=0;this.k=0;this.tmp=new THREE.Color();
}
Emisor.prototype.origen=function(ctx,out){
  const c=this.cfg,d=c.de,H=ctx.alto,r=(c.rad||.05)*H;
  let base;
  if(Array.isArray(d)){const b=ctx.hueso(d[(Math.random()*d.length)|0]);base=b?b.clone():ctx.centro.clone();}
  else if(d==='pies'){base=ctx.piso.clone();const a=Math.random()*Math.PI*2,rr=(c.anillo||.16)*H*(.6+.4*Math.random());base.x+=Math.cos(a)*rr;base.z+=Math.sin(a)*rr;out.set(base.x,base.y+.01,base.z);return;}
  else if(d==='arriba'){base=ctx.piso.clone();base.y+=H*(1.05+Math.random()*.25);}
  else if(d==='cabeza'){base=ctx.hueso('Head')||ctx.centro.clone();base=base.clone();base.y+=.12*H;}
  else{base=ctx.centro.clone();base.y+=(Math.random()-.5)*.55*H;}
  const u=Math.random()*2-1,a=Math.random()*Math.PI*2,s=Math.sqrt(1-u*u),q=Math.cbrt(Math.random());
  out.set(base.x+Math.cos(a)*s*r*q,base.y+u*r*q,base.z+Math.sin(a)*s*r*q);
};
const _v=new THREE.Vector3();
Emisor.prototype.paso=function(dt,ctx){
  const c=this.cfg,n=this.n,H=ctx.alto,P=this.pos,V=this.vel;
  this.acc+=dt*(c.rate||20)*(ctx.fuerza||1);
  while(this.acc>=1){this.acc-=1;const i=this.k;this.k=(this.k+1)%n;
    this.origen(ctx,_v);P[i*3]=_v.x;P[i*3+1]=_v.y;P[i*3+2]=_v.z;this.org[i*3]=_v.x-ctx.piso.x;this.org[i*3+2]=_v.z-ctx.piso.z;
    const vv=c.vel||[0,0,0],rr=c.rnd||[0,0,0];
    V[i*3]=(vv[0]+(Math.random()*2-1)*rr[0])*H;V[i*3+1]=(vv[1]+(Math.random()*2-1)*rr[1])*H;V[i*3+2]=(vv[2]+(Math.random()*2-1)*rr[2])*H;
    const vd=c.vida||[1,2];this.vida[i]=vd[0]+Math.random()*(vd[1]-vd[0]);this.edad[i]=0;this.giro[i]=Math.random()*6.28;this.vg[i]=((c.giro||0)*(Math.random()*2-1));this.sem[i]=Math.random()*100;}
  const gr=(c.grav||0)*H,orb=c.orbita||0,ond=(c.ondula||0)*H,T=ctx.t,tm=c.tam||[.05,.02],al=c.alfa||[0,1,0],cs=this.cols;
  for(let i=0;i<n;i++){
    if(this.edad[i]>=this.vida[i]){this.alfa[i]=0;continue;}
    this.edad[i]+=dt;const f=Math.min(this.edad[i]/this.vida[i],1);
    V[i*3+1]+=gr*dt;
    let x=P[i*3]+V[i*3]*dt,z=P[i*3+2]+V[i*3+2]*dt;
    if(orb){const ox=x-ctx.piso.x,oz=z-ctx.piso.z,a=orb*dt,ca=Math.cos(a),sa=Math.sin(a);x=ctx.piso.x+ox*ca-oz*sa;z=ctx.piso.z+ox*sa+oz*ca;}
    if(ond){x+=Math.sin(T*2.3+this.sem[i])*ond*dt;z+=Math.cos(T*1.9+this.sem[i])*ond*dt;}
    P[i*3]=x;P[i*3+1]+=V[i*3+1]*dt;P[i*3+2]=z;
    this.tam[i]=(tm[0]+(tm[1]-tm[0])*f)*H;
    this.alfa[i]=(f<.5?al[0]+(al[1]-al[0])*f*2:al[1]+(al[2]-al[1])*(f-.5)*2)*(c.parpadeo?(.55+.45*Math.sin(T*c.parpadeo+this.sem[i])):1);
    this.giro[i]+=this.vg[i]*dt;
    if(cs.length===1)this.tmp.copy(cs[0]);else if(cs.length===2)lerpC(cs[0],cs[1],f,this.tmp);else{if(f<.5)lerpC(cs[0],cs[1],f*2,this.tmp);else lerpC(cs[1],cs[2],(f-.5)*2,this.tmp);}
    this.col[i*3]=this.tmp.r;this.col[i*3+1]=this.tmp.g;this.col[i*3+2]=this.tmp.b;}
  const g=this.pts.geometry;for(const k of ['position','tam','alfa','giro','col'])g.attributes[k].needsUpdate=true;
};

// ---------- rayitos (para Volt y Remiendo): líneas quebradas que aparecen un instante ----------
function Rayos(cfg){this.cfg=cfg;const m=new THREE.LineBasicMaterial({color:cfg.color||0x9fe8ff,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false});
  this.lin=[];this.grupo=new THREE.Group();for(let i=0;i<(cfg.n||3);i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(8*3),3));const l=new THREE.Line(g,m.clone());l.frustumCulled=false;l.visible=false;this.grupo.add(l);this.lin.push({l,t:0});}}
Rayos.prototype.paso=function(dt,ctx){const c=this.cfg,H=ctx.alto;
  for(const o of this.lin){o.t-=dt;if(o.t<=0){
      if(Math.random()<(c.prob||.04)){const b=ctx.hueso(c.de[(Math.random()*c.de.length)|0]);if(!b){o.l.visible=false;continue;}
        const p=o.l.geometry.attributes.position.array,len=(c.largo||.12)*H,dir=new THREE.Vector3(Math.random()-.5,Math.random()-.3,Math.random()-.5).normalize();
        for(let k=0;k<8;k++){const f=k/7,j=k&&k<7?(c.zig||.025)*H:0;p[k*3]=b.x+dir.x*len*f+(Math.random()-.5)*j;p[k*3+1]=b.y+dir.y*len*f+(Math.random()-.5)*j;p[k*3+2]=b.z+dir.z*len*f+(Math.random()-.5)*j;}
        o.l.geometry.attributes.position.needsUpdate=true;o.l.visible=true;o.t=.06+Math.random()*.08;}
      else o.l.visible=false;}
    o.l.material.opacity=o.l.visible?Math.min(1,o.t*14):0;}};

// ---------- recetas por personaje ----------
const MANOS=['LeftHand','RightHand'],PUNOS=['LeftHand','RightHand'];
const R={
  sangre:{luz:{c:0xff6a1a,i:2.2,de:'Head',flick:1},em:[   // Azazel: fuego en cabeza y puños, brasas que suben
    {tex:'llama',de:['Head'],rad:.07,n:70,rate:42,vida:[.45,.8],tam:[.085,.02],col:['#fff2b0','#ff8a1e','#c81e00'],alfa:[.9,.8,0],vel:[0,.42,0],rnd:[.06,.08,.06],giro:1.5},
    {tex:'llama',de:PUNOS,rad:.045,n:70,rate:40,vida:[.35,.65],tam:[.06,.015],col:['#fff2b0','#ff7a10','#b01a00'],alfa:[.9,.75,0],vel:[0,.35,0],rnd:[.05,.06,.05],giro:1.5},
    {tex:'chispa',de:'cuerpo',rad:.18,n:40,rate:9,vida:[1.2,2.2],tam:[.022,.008],col:['#ffd27a','#ff5a00'],alfa:[0,1,0],vel:[0,.22,0],rnd:[.05,.06,.05],ondula:.08,parpadeo:9}]},
  reina:{luz:{c:0x9fdcff,i:1.6,de:'Spine2'},em:[            // Reina: copos que caen, vaho helado en los pies, destellos de escarcha
    {tex:'copo',de:'arriba',rad:.35,n:60,rate:10,vida:[3,4.5],tam:[.045,.035],col:['#e8f7ff','#a8dcff'],alfa:[0,.95,0],vel:[0,-.16,0],rnd:[.04,.03,.04],giro:1.2,ondula:.12,add:false},
    {tex:'humo',de:'pies',anillo:.14,n:30,rate:7,vida:[2.5,3.5],tam:[.12,.3],col:['#d8f0ff','#9fd0ff'],alfa:[0,.32,0],vel:[0,.03,0],rnd:[.05,.01,.05],add:false},
    {tex:'chispa',de:MANOS,rad:.06,n:30,rate:12,vida:[.5,1],tam:[.03,0],col:['#ffffff','#8fd6ff'],alfa:[1,.8,0],vel:[0,.05,0],rnd:[.04,.04,.04]}]},
  turbo:{luz:{c:0x7fd8ff,i:1.8,de:'RightHand',flick:2},rayos:{de:MANOS.concat(['Head']),n:4,prob:.06,largo:.11,color:0xaef0ff},em:[   // Volt: chispas eléctricas
    {tex:'chispa',de:MANOS,rad:.05,n:60,rate:30,vida:[.15,.35],tam:[.035,.008],col:['#ffffff','#5fd0ff'],alfa:[1,.9,0],rnd:[.5,.5,.5],parpadeo:30},
    {tex:'suave',de:'cuerpo',rad:.2,n:30,rate:6,vida:[.8,1.4],tam:[.03,.01],col:['#bff2ff','#2a8cff'],alfa:[0,.8,0],vel:[0,.1,0],rnd:[.05,.05,.05],orbita:1.2}]},
  leon:{luz:{c:0xffb347,i:1.2,de:'Spine2'},em:[             // Kragor: brasas doradas de guerrero
    {tex:'chispa',de:'pies',anillo:.18,n:50,rate:12,vida:[1.6,2.6],tam:[.026,.008],col:['#fff0b0','#ffb020','#ff6000'],alfa:[0,1,0],vel:[0,.3,0],rnd:[.04,.08,.04],ondula:.1,parpadeo:8},
    {tex:'suave',de:PUNOS,rad:.04,n:24,rate:8,vida:[.6,1],tam:[.05,.01],col:['#ffe08a','#ff8a00'],alfa:[.6,.5,0],vel:[0,.12,0],rnd:[.03,.03,.03]}]},
  nebula:{luz:{c:0xc77dff,i:1.6,de:'Spine2'},em:[           // Nébula: estrellas que orbitan
    {tex:'estrella',de:'cuerpo',rad:.25,n:60,rate:14,vida:[2,3.5],tam:[.03,.012],col:['#ffffff','#e3a8ff','#7a5cff'],alfa:[0,1,0],vel:[0,.03,0],rnd:[.02,.03,.02],orbita:.9,giro:2,parpadeo:6},
    {tex:'suave',de:MANOS,rad:.05,n:30,rate:10,vida:[.8,1.3],tam:[.06,.0],col:['#ff9cf0','#6a4cff'],alfa:[.7,.5,0],rnd:[.04,.04,.04]}]},
  zurdito:{em:[                                             // Simún: arena que gira en los pies
    {tex:'suave',de:'pies',anillo:.2,n:80,rate:28,vida:[1.4,2.2],tam:[.02,.012],col:['#ffe2a8','#d9a35a'],alfa:[0,.85,0],vel:[0,.12,0],rnd:[.02,.06,.02],orbita:2.4,add:false},
    {tex:'humo',de:'pies',anillo:.16,n:20,rate:4,vida:[2,3],tam:[.12,.26],col:['#e8c38a','#c99a5a'],alfa:[0,.25,0],vel:[0,.05,0],rnd:[.03,.02,.03],orbita:1.6,add:false}]},
  malabares:{em:[                                           // Ginga: estela verde y amarilla que gira (ritmo)
    {tex:'suave',de:'cuerpo',rad:.24,n:70,rate:24,vida:[1,1.6],tam:[.035,.01],col:['#fff27a','#3ddc6a'],alfa:[0,.9,0],vel:[0,.08,0],rnd:[.02,.03,.02],orbita:2.6},
    {tex:'chispa',de:['LeftFoot','RightFoot'],rad:.04,n:20,rate:6,vida:[.5,.9],tam:[.03,0],col:['#ffffff','#ffe14a'],alfa:[1,.8,0],rnd:[.1,.1,.1]}]},
  muralla:{luz:{c:0xff9a3a,i:.9,de:'Spine2'},em:[            // Golem: piedritas que caen y polvo en el piso
    {tex:'roca',de:['LeftShoulder','RightShoulder','LeftHand','RightHand'],rad:.06,n:30,rate:4,vida:[1,1.6],tam:[.025,.022],col:['#b9875a','#7a5636'],alfa:[1,1,.0],vel:[0,0,0],rnd:[.04,.02,.04],grav:-1.4,giro:3,add:false},
    {tex:'humo',de:'pies',anillo:.2,n:24,rate:5,vida:[2,3],tam:[.14,.3],col:['#c79a6a','#8a6a4a'],alfa:[0,.28,0],vel:[0,.04,0],rnd:[.04,.02,.04],add:false},
    {tex:'chispa',de:'cuerpo',rad:.22,n:20,rate:4,vida:[1,1.8],tam:[.02,.005],col:['#ffb04a','#ff5a00'],alfa:[0,.9,0],vel:[0,.12,0],rnd:[.03,.04,.03],parpadeo:7}]},
  ciclon:{em:[                                              // Kenshi: pétalos de cerezo con el viento
    {tex:'petalo',de:'arriba',rad:.4,n:50,rate:8,vida:[3,4.5],tam:[.04,.035],col:['#ffd6e6','#ff9fc4'],alfa:[0,1,0],vel:[.12,-.14,0],rnd:[.05,.03,.05],giro:2.5,ondula:.15,add:false},
    {tex:'suave',de:'cuerpo',rad:.25,n:20,rate:4,vida:[1.5,2.5],tam:[.03,.01],col:['#ffffff','#ffb8d4'],alfa:[0,.6,0],vel:[.08,.02,0],rnd:[.03,.03,.03]}]},
  ruleta:{luz:{c:0xffd27a,i:.9,de:'Spine2'},em:[            // Maximus: polvo de arena de coliseo y destellos dorados
    {tex:'humo',de:'pies',anillo:.2,n:24,rate:5,vida:[2,3],tam:[.12,.28],col:['#e6c896','#b8935a'],alfa:[0,.3,0],vel:[0,.05,0],rnd:[.05,.02,.05],add:false},
    {tex:'chispa',de:'cuerpo',rad:.24,n:24,rate:5,vida:[.6,1.1],tam:[.03,0],col:['#ffffff','#ffcf4a'],alfa:[1,.8,0],rnd:[.02,.02,.02],parpadeo:12}]},
  valkiria:{luz:{c:0xcfe6ff,i:1.3,de:'Spine2'},em:[          // Valkiria: plumas blancas que caen y aura celeste
    {tex:'pluma',de:'arriba',rad:.4,n:30,rate:4,vida:[3.5,5],tam:[.05,.045],col:['#ffffff','#dbe8ff'],alfa:[0,1,0],vel:[0,-.1,0],rnd:[.04,.02,.04],giro:1.2,ondula:.18,add:false},
    {tex:'suave',de:'cuerpo',rad:.22,n:30,rate:7,vida:[1.4,2.2],tam:[.04,.01],col:['#ffffff','#9fd4ff'],alfa:[0,.6,0],vel:[0,.12,0],rnd:[.03,.03,.03]}]},
  vampira:{luz:{c:0xff2a4a,i:1.2,de:'Head'},em:[             // Vampira: niebla carmesí y gotitas de sangre
    {tex:'humo',de:'pies',anillo:.18,n:30,rate:7,vida:[2.2,3.2],tam:[.14,.32],col:['#8a0f2a','#2a0010'],alfa:[0,.45,0],vel:[0,.04,0],rnd:[.05,.02,.05],add:false},
    {tex:'suave',de:'cuerpo',rad:.24,n:30,rate:6,vida:[1.5,2.5],tam:[.025,.01],col:['#ff4a6a','#a0001e'],alfa:[0,.9,0],vel:[0,.06,0],rnd:[.03,.03,.03],orbita:-.8,parpadeo:5}]},
  remiendo:{luz:{c:0x7dff8a,i:1.2,de:'Head',flick:2},rayos:{de:['Head','Neck'],n:3,prob:.05,largo:.08,color:0x9dff9a},em:[   // Remiendo: chispas verdes de los tornillos
    {tex:'chispa',de:['Head','Neck'],rad:.07,n:40,rate:16,vida:[.2,.45],tam:[.03,.005],col:['#ffffff','#5aff6a'],alfa:[1,.8,0],rnd:[.35,.35,.35],grav:-.6,parpadeo:25}]},
  vikingo:{luz:{c:0x7fb8ff,i:1,de:'Spine2'},em:[             // Thorin: runas azules que flotan y copos ligeros
    {tex:'runa',de:'cuerpo',rad:.26,n:16,rate:2.5,vida:[2,3],tam:[.05,.04],col:['#bfe2ff','#4a8cff'],alfa:[0,.9,0],vel:[0,.05,0],rnd:[.02,.02,.02],orbita:.6},
    {tex:'copo',de:'arriba',rad:.4,n:30,rate:5,vida:[3,4],tam:[.03,.025],col:['#ffffff','#cfe8ff'],alfa:[0,.8,0],vel:[0,-.14,0],rnd:[.03,.02,.03],giro:1,ondula:.1,add:false}]},
  rey:{luz:{c:0xffc94a,i:1.3,de:'Head'},em:[                 // Anubis: arena dorada que sube y destellos en los brazaletes
    {tex:'suave',de:'pies',anillo:.18,n:60,rate:18,vida:[1.8,2.8],tam:[.018,.008],col:['#fff0b0','#e0a020'],alfa:[0,.9,0],vel:[0,.22,0],rnd:[.02,.04,.02],orbita:1.2},
    {tex:'chispa',de:['LeftForeArm','RightForeArm','Head'],rad:.05,n:24,rate:6,vida:[.5,.9],tam:[.035,0],col:['#ffffff','#ffd24a'],alfa:[1,.8,0],rnd:[.01,.01,.01],parpadeo:14}]},
  momia:{luz:{c:0x9cff6a,i:.8,de:'Head'},em:[                // Momia: polvo antiguo y almas verdes
    {tex:'humo',de:'pies',anillo:.16,n:24,rate:5,vida:[2,3],tam:[.12,.26],col:['#d9c99a','#9a8a5a'],alfa:[0,.3,0],vel:[0,.04,0],rnd:[.04,.02,.04],add:false},
    {tex:'suave',de:'cuerpo',rad:.24,n:24,rate:5,vida:[1.8,2.8],tam:[.035,.01],col:['#d8ffb0','#4aff6a'],alfa:[0,.7,0],vel:[0,.12,0],rnd:[.02,.03,.02],ondula:.12}]},
  zombi:{luz:{c:0x8aff4a,i:.9,de:'Spine'},em:[                // Zombi: burbujas tóxicas y niebla verde
    {tex:'burbuja',de:'pies',anillo:.16,n:30,rate:6,vida:[1.4,2.2],tam:[.025,.04],col:['#c8ff8a','#6adf2a'],alfa:[0,.9,0],vel:[0,.2,0],rnd:[.02,.05,.02],ondula:.08},
    {tex:'humo',de:'pies',anillo:.15,n:24,rate:6,vida:[2,3],tam:[.12,.28],col:['#7adf3a','#2a6a10'],alfa:[0,.32,0],vel:[0,.03,0],rnd:[.04,.01,.04],add:false}]},
  yeti:{luz:{c:0xbfe6ff,i:1,de:'Spine2'},em:[                // Yeti: nieve que cae y vaho
    {tex:'copo',de:'arriba',rad:.4,n:60,rate:12,vida:[3,4],tam:[.035,.03],col:['#ffffff','#d8efff'],alfa:[0,.95,0],vel:[0,-.18,0],rnd:[.04,.03,.04],giro:1.3,ondula:.12,add:false},
    {tex:'humo',de:['Head'],rad:.03,n:12,rate:1.5,vida:[1.2,1.8],tam:[.05,.16],col:['#ffffff','#dff2ff'],alfa:[.5,.25,0],vel:[0,.03,.12],rnd:[.02,.02,.02],add:false}]},
  toro:{em:[                                                  // Tauro: resoplidos de vapor por la nariz y polvo
    {tex:'humo',de:['Head'],rad:.025,n:16,rate:2,vida:[.9,1.4],tam:[.04,.14],col:['#ffffff','#e6e6e6'],alfa:[.6,.3,0],vel:[0,-.03,.2],rnd:[.03,.02,.02],add:false},
    {tex:'humo',de:'pies',anillo:.2,n:20,rate:4,vida:[2,3],tam:[.12,.28],col:['#c7a27a','#8a6a4a'],alfa:[0,.28,0],vel:[0,.05,0],rnd:[.05,.02,.05],add:false}]},
  cazador:{em:[                                               // Barbanegra: humo de cañón y destellos de oro pirata
    {tex:'humo',de:'pies',anillo:.2,n:24,rate:5,vida:[2.2,3.2],tam:[.14,.32],col:['#cfd4dc','#7a8090'],alfa:[0,.32,0],vel:[0,.06,0],rnd:[.05,.02,.05],add:false},
    {tex:'moneda',de:'cuerpo',rad:.26,n:20,rate:3,vida:[1,1.6],tam:[.03,.02],col:['#fff2a8','#e8b020'],alfa:[0,1,0],vel:[0,.05,0],rnd:[.02,.03,.02],parpadeo:10}]},
  perro:{luz:{c:0x8fb8ff,i:1.2,de:'Head'},em:[               // Fenrir: niebla de luna y almas azules
    {tex:'humo',de:'pies',anillo:.18,n:30,rate:7,vida:[2.4,3.4],tam:[.14,.32],col:['#a8c4ff','#3a4a8a'],alfa:[0,.4,0],vel:[0,.04,0],rnd:[.05,.02,.05],add:false},
    {tex:'suave',de:'cuerpo',rad:.26,n:24,rate:5,vida:[1.6,2.6],tam:[.035,.01],col:['#ffffff','#7fa8ff'],alfa:[0,.7,0],vel:[0,.1,0],rnd:[.02,.03,.02],orbita:-1,ondula:.1}]},
  expreso:{em:[                                               // Duelo: destellos elegantes (brillo de espada)
    {tex:'chispa',de:'cuerpo',rad:.28,n:30,rate:7,vida:[.6,1.1],tam:[.035,0],col:['#ffffff','#ffe8a8'],alfa:[1,.8,0],rnd:[.02,.02,.02],parpadeo:12},
    {tex:'suave',de:['RightHand'],rad:.04,n:16,rate:5,vida:[.6,1],tam:[.04,0],col:['#ffffff','#ffd27a'],alfa:[.8,.5,0],rnd:[.03,.03,.03]}]},
  goblin:{em:[                                                // Goblin: monedas robadas que brillan
    {tex:'moneda',de:'cuerpo',rad:.24,n:24,rate:4,vida:[1.2,1.8],tam:[.028,.02],col:['#fff2a8','#e8b020'],alfa:[0,1,0],vel:[0,.06,0],rnd:[.02,.03,.02],orbita:1.4,parpadeo:10},
    {tex:'chispa',de:MANOS,rad:.04,n:16,rate:5,vida:[.4,.8],tam:[.03,0],col:['#ffffff','#9aff5a'],alfa:[1,.8,0],rnd:[.05,.05,.05]}]},
  duende:{em:[                                                // Duende: tréboles y brillos de suerte
    {tex:'trebol',de:'cuerpo',rad:.24,n:24,rate:4,vida:[1.6,2.4],tam:[.035,.028],col:['#9aff7a','#2ac04a'],alfa:[0,1,0],vel:[0,.08,0],rnd:[.02,.03,.02],giro:1.5,orbita:1,add:false},
    {tex:'chispa',de:'cuerpo',rad:.26,n:24,rate:6,vida:[.6,1.1],tam:[.03,0],col:['#ffffff','#ffd84a'],alfa:[1,.8,0],rnd:[.02,.02,.02],parpadeo:12}]},
  hongo:{em:[                                                 // Hongo: esporas que flotan
    {tex:'suave',de:'cabeza',rad:.18,n:50,rate:10,vida:[2.5,4],tam:[.025,.012],col:['#fff6c8','#ffb8d8','#b8e8ff'],alfa:[0,.9,0],vel:[0,.03,0],rnd:[.03,.03,.03],ondula:.15}]},
  monje:{luz:{c:0xffd27a,i:1.1,de:'Spine2'},em:[             // Monje: esferas de energía zen que suben despacio
    {tex:'suave',de:'cuerpo',rad:.24,n:30,rate:5,vida:[2.5,3.5],tam:[.05,.02],col:['#fff6c8','#ffb84a'],alfa:[0,.75,0],vel:[0,.08,0],rnd:[.01,.02,.01],orbita:.5},
    {tex:'chispa',de:MANOS,rad:.04,n:16,rate:4,vida:[.6,1],tam:[.03,0],col:['#ffffff','#ffe08a'],alfa:[1,.8,0],rnd:[.02,.02,.02]}]},
  campeon:{luz:{c:0xffe08a,i:1,de:'Spine2'},em:[             // Campeón: estrellitas doradas de gloria
    {tex:'estrella',de:'cuerpo',rad:.26,n:30,rate:6,vida:[1.2,2],tam:[.03,.015],col:['#ffffff','#ffd24a'],alfa:[0,1,0],vel:[0,.12,0],rnd:[.03,.04,.03],giro:2,parpadeo:8}]}
};

// ---------- control ----------
const _p=new THREE.Vector3();
function buscaHuesos(m){const H={};m.traverse(o=>{if(!o.isBone)return;const n=o.name.replace(/^mixamorig[:_]?/,'');if(!H[n])H[n]=o;});return H;}
function controlador(){let ACT=null;return {
  recetas:R,
  poner(model,id,scene,escala){
    this.quitar();const r=R[id];if(!r||!model)return;
    const grupo=new THREE.Group();scene.add(grupo);
    const ems=r.em.map(c=>{const e=new Emisor(c);e.mat.uniforms.uEsc.value=escala||1000;grupo.add(e.pts);return e;});
    let ray=null;if(r.rayos){ray=new Rayos(r.rayos);grupo.add(ray.grupo);}
    let luz=null;if(r.luz){luz=new THREE.PointLight(r.luz.c,r.luz.i,4.5,2);grupo.add(luz);}
    ACT={id,r,grupo,ems,ray,luz,modelo:model,huesos:buscaHuesos(model),t:0};
  },
  modelo(m){if(ACT&&m&&m!==ACT.modelo){ACT.modelo=m;ACT.huesos=buscaHuesos(m);}},
  paso(dt){if(!ACT)return;const A=ACT,m=A.modelo;A.t+=dt;m.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(m),alto=(box.max.y-box.min.y)||2.8;
    const hips=A.huesos.Hips?A.huesos.Hips.getWorldPosition(new THREE.Vector3()):box.getCenter(new THREE.Vector3());
    const ctx={t:A.t,alto,piso:new THREE.Vector3(hips.x,box.min.y,hips.z),centro:new THREE.Vector3(hips.x,box.min.y+alto*.55,hips.z),
      hueso:k=>{const b=A.huesos[k];return b?b.getWorldPosition(new THREE.Vector3()):null;}};
    for(const e of A.ems)e.paso(dt,ctx);if(A.ray)A.ray.paso(dt,ctx);
    if(A.luz){const p=ctx.hueso(A.r.luz.de)||ctx.centro;A.luz.position.set(p.x,p.y,p.z+.35*alto*.3);
      const fl=A.r.luz.flick;A.luz.intensity=A.r.luz.i*(fl?(.75+.25*Math.sin(A.t*13)*Math.sin(A.t*7.3)+(fl>1&&Math.random()<.06?.6:0)):1);}},
  quitar(){if(!ACT)return;ACT.grupo.parent&&ACT.grupo.parent.remove(ACT.grupo);ACT.grupo.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});ACT=null;}
};}
window.EFECTOS=Object.assign(controlador(),{nuevo:controlador});

})();
