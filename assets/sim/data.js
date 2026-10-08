/* Wild Strikers · datos del partido compartidos entre el juego y el servidor (v64) */
const CARDS={
  bomba:{name:'Bomba',cost:3,icon:'💣',target:true,r:4.5},
  cascara:{name:'Cáscara',cost:1,icon:'🍌',target:true,r:1},
  rayo:{name:'Rayo',cost:4,icon:'⚡',target:true,r:5.5},
  hielo:{name:'Hielo',cost:3,icon:'🧊',target:true,r:4.2},
  turbo:{name:'Turbo',cost:4,icon:'⭐',target:false},
  escudo:{name:'Escudo',cost:4,icon:'🧤',target:false},
  superbalon:{name:'Súper balón',cost:3,icon:'☄️',target:false},
  punetazo:{name:'Puñetazo',cost:2,icon:'🥊',target:true,r:3.5},
  tornado:{name:'Tornado',cost:4,icon:'🌪️',target:true,r:2.6},
  meteorito:{name:'Meteorito',cost:6,icon:'☄️',target:true,r:6.5},
  lodo:{name:'Lodo',cost:2,icon:'🟤',target:true,r:3.2},
  muro:{name:'Muro',cost:3,icon:'🧱',target:true,r:3.6},
  barril:{name:'Barril',cost:3,icon:'🛢️',target:true,r:1.3},
};
const FORMS={
 diamante:{n:'Diamante',t:'1-2-1',s:[{x:-16,z:0,r:'DEF'},{x:-9,z:-8,r:'MED'},{x:-9,z:8,r:'MED'},{x:-3,z:0,r:'DEL'}]},
 cuadrado:{n:'Cuadrado',t:'2-2',s:[{x:-15,z:-6,r:'DEF'},{x:-15,z:6,r:'DEF'},{x:-4,z:-6,r:'DEL'},{x:-4,z:6,r:'DEL'}]},
 ataque:{n:'Ataque total',t:'1-1-2',s:[{x:-15,z:0,r:'DEF'},{x:-9,z:0,r:'MED'},{x:-3,z:-7,r:'DEL'},{x:-3,z:7,r:'DEL'}]},
 cerrojo:{n:'Cerrojo',t:'2-1-1',s:[{x:-16,z:-6,r:'DEF'},{x:-16,z:6,r:'DEF'},{x:-9,z:0,r:'MED'},{x:-3,z:0,r:'DEL'}]},
 muro:{n:'Muro',t:'3-1',s:[{x:-16,z:-8,r:'DEF'},{x:-17,z:0,r:'DEF'},{x:-16,z:8,r:'DEF'},{x:-3,z:0,r:'DEL'}]},
};
const DIFF={easy:{ai:.75,keep:.85,think:1.5,tack:.6},normal:{ai:1,keep:1,think:1,tack:1},hard:{ai:1.25,keep:1.1,think:.65,tack:1.35}};
const HITS=['¡PUM!','¡ZAS!','¡CRACK!','¡BAM!','¡TRAS!'];
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const dirOf=t=>t===0?1:-1;
