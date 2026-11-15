// ===== puente con el juego: cuando el menú corre dentro de Titan Crashers, los datos son los del jugador =====
window.J=(()=>{try{return window.parent!==window&&parent.MENU_API||null;}catch(e){return null;}})();
window.EN_JUEGO=!!window.J;
// solo hay pantallas con modelo 4K para estos titanes; los demás no salen en el menú nuevo
window.TIENE4K=id=>!!(window.PJI&&PJI[id]);
window.JUEGO_SYNC=()=>{if(!J)return null;const i=J.info();window.JINFO=i;
  window.MIOS=PJ.map(p=>p.id).filter(id=>i.own[id]);
  const cap=TIENE4K(i.cap)?i.cap:(i.squad.find(TIENE4K)||MIOS[0]||'leon');window.HEROE=cap;return i;};
JUEGO_SYNC();
