// ===== Pelo con resorte: cadena Pelo1→Pelo2→Pelo3 (agregada al modelo) que se queda atrás cuando la cabeza gira o se mueve =====
// Cada eslabón sigue al anterior con un poco de retraso (así el pelo se curva en vez de doblarse en un punto).
// La fuerza por titán viene en el modelo (extras.fuerza del hueso Pelo1).
(function(){
const UP=new THREE.Vector3(0,1,0),_q=new THREE.Quaternion(),_qp=new THREE.Quaternion(),_qi=new THREE.Quaternion(),_v=new THREE.Vector3(),_f=new THREE.Vector3(),_e=new THREE.Euler();
const K=[60,45,34],C=[7.5,6,5],SIGUE=.6;   // rigidez y amortiguación por eslabón; cuánto sigue cada eslabón al anterior
function preparar(m){if(m.userData.pelo!==undefined)return m.userData.pelo;const grupos={};let cab=null;
  m.traverse(o=>{if(!o.isBone)return;const r=/(Pelo|Nuca)(\d)$/.exec(o.name);if(r){(grupos[r[1]]=grupos[r[1]]||[])[+r[2]-1]=o;}else if(/Head$/.test(o.name)&&!cab)cab=o;});
  const cads=Object.values(grupos).map(g=>g.filter(Boolean)).filter(g=>g.length);if(!cads.length||!cab){m.userData.pelo=null;return null;}
  const S={cab,cads:cads.map(cad=>({cad,fz:(cad[0].userData&&cad[0].userData.fuerza)||1,rest:cad.map(b=>b.quaternion.clone()),ang:cad.map(()=>({y:0,x:0,z:0,vy:0,vx:0,vz:0}))})),
    yaw:null,pos:null,vel:new THREE.Vector3()};
  m.userData.pelo=S;return S;}
function resorte(a,t,k,c,dt,lim){for(const e of ['y','x','z']){const acc=k*(t[e]-a[e])-c*a['v'+e];a['v'+e]+=acc*dt;a[e]+=a['v'+e]*dt;a[e]=Math.max(-lim,Math.min(lim,a[e]));}}
function aplica(b,rest,a){b.quaternion.copy(rest);b.parent.updateMatrixWorld(true);b.parent.getWorldQuaternion(_qp);
  _q.setFromEuler(_e.set(a.x,a.y,a.z,'YXZ'));_qi.copy(_qp).invert();
  b.quaternion.copy(_qi.multiply(_q).multiply(_qp)).multiply(rest);}   // local' = inv(padre)·giro·padre·reposo
function paso(m,dt){const S=preparar(m);if(!S||dt<=0)return;
  m.updateMatrixWorld(true);S.cab.getWorldQuaternion(_q);_f.set(0,0,1).applyQuaternion(_q);const yaw=Math.atan2(_f.x,_f.z);S.cab.getWorldPosition(_v);
  if(S.yaw===null){S.yaw=yaw;S.pos=_v.clone();return;}
  let dy=yaw-S.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;S.yaw=yaw;
  const w=dy/dt,vel=_v.clone().sub(S.pos).divideScalar(dt),acc=vel.clone().sub(S.vel).divideScalar(dt);S.pos.copy(_v);S.vel.lerp(vel,.5);
  const fwd=_f.clone().setY(0).normalize(),lado=new THREE.Vector3().crossVectors(UP,fwd);
  for(const G of S.cads){const fz=G.fz,lim=.32*fz,cl=x=>Math.max(-lim,Math.min(lim,x*fz));
    let t={y:cl(-w*.06),x:cl(-acc.dot(fwd)*.008+acc.y*.003),z:cl(acc.dot(lado)*.008)};
    for(let i=0;i<G.cad.length;i++){const a=G.ang[i];resorte(a,t,K[i]||30,C[i]||5,dt,lim);aplica(G.cad[i],G.rest[i],a);t={y:a.y*SIGUE,x:a.x*SIGUE,z:a.z*SIGUE};}}}
window.PELO={paso,preparar};
})();
