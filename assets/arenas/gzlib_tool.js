// funciones del juego que usa la arena (copiadas de index.html)
const rand=(a,b)=>a+Math.random()*(b-a);const L=32,HW=16;let FIELD_LOGO={complete:false,naturalWidth:0,addEventListener(){}};function fieldLogo(){}
const GR={base:'#5cad3a',light:'#6dbd45',dark:'#4f9e31',deep:'#47922c'};
function grassBlades(g,W,H,n,a){for(let k=0;k<n;k++){const x=Math.random()*W,y=Math.random()*H,l=rand(4,10),r=Math.random();
  g.strokeStyle=r<.45?`rgba(170,230,110,${a})`:r<.8?`rgba(30,80,10,${a*1.1})`:`rgba(220,255,170,${a*.8})`;g.lineWidth=rand(1,2);g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-2,2),y-l);g.stroke();}}
function strikersGrass(g,W,H,PX,X,Z){
  g.fillStyle=GR.base;g.fillRect(0,0,W,H);
  // franjas de corte a lo largo (muy suaves)
  for(let k=0,x=0;x<W;x+=PX*4,k++){g.fillStyle=k%2?'rgba(255,255,220,.05)':'rgba(0,40,0,.05)';g.fillRect(x,0,PX*4,H);}
  // figuras podadas, simétricas en las dos mitades
  const R=(x0,z0,x1,z1,col,edge)=>{for(const sx of [-1,1])for(const sz of [-1,1]){const xa=X(sx*x0),xb=X(sx*x1),za=Z(sz*z0),zb=Z(sz*z1),x=Math.min(xa,xb),y=Math.min(za,zb),w=Math.abs(xb-xa),h=Math.abs(zb-za);
    g.fillStyle=col;g.fillRect(x,y,w,h);if(edge){g.strokeStyle=edge;g.lineWidth=PX*.18;g.strokeRect(x,y,w,h);}}};
  const LL=L,HH=HW;
  R(0,0,LL*.34,HH*.62,'rgba(230,255,170,.15)','rgba(20,60,0,.22)');        // gran tablero central
  R(0,0,LL*.14,HH*.3,'rgba(0,50,0,.13)','rgba(230,255,180,.16)');           // cuadro interior
  R(LL*.4,HH*.18,LL*.6,HH*.62,'rgba(230,255,170,.13)','rgba(20,60,0,.2)'); // bloques a media cancha
  R(LL*.4,0,LL*.6,HH*.12,'rgba(0,50,0,.12)',null);
  R(LL*.64,HH*.7,LL*.98,HH*.98,'rgba(230,255,170,.11)',null);               // esquinas
  R(LL*.2,HH*.72,LL*.36,HH*.92,'rgba(0,50,0,.12)','rgba(230,255,180,.14)');
  R(LL*.04,HH*.74,LL*.16,HH*.86,'rgba(230,255,170,.15)',null);
  // grano suave + muchas hojitas
  for(let k=0;k<500;k++){const x=Math.random()*W,y=Math.random()*H,r=rand(20,110),gr=g.createRadialGradient(x,y,0,x,y,r),lt=Math.random()<.5;
    gr.addColorStop(0,lt?'rgba(220,255,150,.035)':'rgba(10,50,0,.04)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  grassBlades(g,W,H,70000,.22);}
// después de las líneas: hojitas encima (orillas como pintura sobre pasto) y el logo podado al centro
// v203d: el logo de cada arena va podado dentro del círculo central (en lugar del logo del juego), con el mismo estilo:
// dibujo en pasto claro y un contorno más oscuro. La arena pone window.GZ_FIELD_MOTIF antes de armar su césped.
const GZ_MOTIFS=['balon','hoja','campana','timon','escarabajo','mamut','murcielago','volcan','corona'];
window.GZ_MOTIF_IMG=window.GZ_MOTIF_IMG||{};
for(const n of GZ_MOTIFS){if(window.GZ_MOTIF_IMG[n])continue;const im=new Image();im.src='assets/ui/motivos/'+n+'.png';window.GZ_MOTIF_IMG[n]=im;}
function fieldIcon(g,cx,cy,PX,k){const im=window.GZ_MOTIF_IMG[k];if(!im||!im.complete||!im.naturalWidth)return false;
  const S=Math.ceil(8*PX),c=document.createElement('canvas');c.width=c.height=S;const q=c.getContext('2d');
  // contorno oscuro: el dibujo engordado un poquito, debajo
  const o=Math.max(1,.13*PX);for(let i=0;i<12;i++){const a=i*Math.PI/6;q.drawImage(im,Math.cos(a)*o,Math.sin(a)*o,S,S);}
  q.globalCompositeOperation='source-in';q.fillStyle='rgba(25,70,10,.31)';q.fillRect(0,0,S,S);
  // dibujo en pasto claro encima
  const l=document.createElement('canvas');l.width=l.height=S;const lq=l.getContext('2d');lq.drawImage(im,0,0,S,S);lq.globalCompositeOperation='source-in';lq.fillStyle='rgba(215,255,160,.45)';lq.fillRect(0,0,S,S);
  q.globalCompositeOperation='destination-out';q.drawImage(im,0,0,S,S);q.globalCompositeOperation='source-over';q.drawImage(l,0,0);
  g.save();g.translate(cx,cy);g.rotate(typeof FIELD_LOGO_ROT!=='undefined'?FIELD_LOGO_ROT:Math.PI/2);g.drawImage(c,-S/2,-S/2);g.restore();return true;}
function strikersFinish(g,W,H,cx,cy,PX,tex){grassBlades(g,W,H,9000,.16);tex.needsUpdate=true;
  const k=window.GZ_FIELD_MOTIF,ic=k&&window.GZ_MOTIF_IMG[k];
  if(ic){const put=()=>{try{if(fieldIcon(g,cx,cy,PX,k))tex.needsUpdate=true;}catch(e){}};if(ic.complete&&ic.naturalWidth)put();else ic.addEventListener('load',put,{once:true});return;}   // v203d: logo de la arena en el círculo
  const logo=()=>{try{fieldLogo(g,cx,cy,PX);tex.needsUpdate=true;}catch(e){}};
  if(FIELD_LOGO.complete&&FIELD_LOGO.naturalWidth)logo();else FIELD_LOGO.addEventListener('load',logo,{once:true});}
window.strikersGrass=strikersGrass;window.strikersFinish=strikersFinish;
window.GZ_RR=function(g,x,y,w,h,r){if(w<0){x+=w;w=-w;}if(h<0){y+=h;h=-h;}r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.arcTo(x+w,y,x+w,y+r,r);g.lineTo(x+w,y+h-r);g.arcTo(x+w,y+h,x+w-r,y+h,r);g.lineTo(x+r,y+h);g.arcTo(x,y+h,x,y+h-r,r);g.lineTo(x,y+r);g.arcTo(x,y,x+r,y,r);g.closePath();g.stroke();};
