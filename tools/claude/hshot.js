// THREE de mentira para las pruebas con Playwright (el sandbox no puede bajar three.js).
// Cualquier propiedad, llamada o "new" devuelve otro objeto de mentira, así el juego corre sin dibujar nada.
// Sirve para menús y errores de JS, NO para ver el 3D. Lo usan prueba_partido.js, capturas_menu.js y capturas_tamanos.js.
const STUB=`(function(){
const cache=new Map();
function mk(name){
  const f=function(){};
  const store={};
  const h={
    get(t,k){
      if(k===Symbol.toPrimitive)return ()=>0;
      if(k===Symbol.iterator)return function*(){};
      if(k==='then')return undefined;
      if(k==='length')return k in store?store[k]:mk(name+'.length');   // sirve como número (0) y como función (v.length())
      if(k==='count'||k==='x'||k==='y'||k==='z'||k==='w'||k==='r'||k==='g'||k==='b')return k in store?store[k]:0;
      if(k==='isStub')return true;
      if(k==='toString'||k==='valueOf')return ()=>'0';
      if(k in store)return store[k];
      const v=mk(name+'.'+String(k));store[k]=v;return v;},
    set(t,k,v){store[k]=v;return true;},
    has(){return true;},
    apply(){return mk(name+'()');},
    construct(t,args){const o=mk('new '+name);return o;},
    deleteProperty(t,k){delete store[k];return true;}
  };
  return new Proxy(f,h);
}
const T=mk('THREE');
// constantes numéricas que el juego compara o usa en cuentas
const nums={REVISION:'128',DoubleSide:2,BackSide:1,FrontSide:0,AdditiveBlending:2,NormalBlending:1,LoopOnce:2200,LoopRepeat:2201,
  NearestFilter:1003,LinearFilter:1006,RGBAFormat:1023,UnsignedByteType:1009,FloatType:1015,sRGBEncoding:3001,LinearEncoding:3000,
  NoToneMapping:0,ACESFilmicToneMapping:4,PCFSoftShadowMap:2,ClampToEdgeWrapping:1001,RepeatWrapping:1000,DynamicDrawUsage:35048};
for(const k in nums)T[k]=nums[k];
T.MathUtils={clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),lerp:(a,b,t)=>a+(b-a)*t,degToRad:d=>d*Math.PI/180,radToDeg:r=>r*180/Math.PI,randFloat:(a,b)=>a+Math.random()*(b-a),smoothstep:(x,a,b)=>x<=a?0:x>=b?1:((x-a)/(b-a))**2*(3-2*(x-a)/(b-a))};
window.THREE=T;
})();`;
module.exports={STUB};
