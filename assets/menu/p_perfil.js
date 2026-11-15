// ===== PERFIL · CAMBIAR NOMBRE · AMIGOS =====
(function(){
const css=`
#s-perfil .fondo{--bg:linear-gradient(110deg,#2a7bff 0%,#1f5bff 46%,#3a1fc0 46.2%,#2a14a0 100%)}
#s-perfil .carta{position:absolute;left:70px;top:150px;width:620px;height:690px;border:3px solid var(--ink);border-radius:20px;overflow:hidden;transform:rotate(-2deg);background:radial-gradient(circle at 50% 35%,#7fd0ff,#2a6bff 55%,#1a3fc0);box-shadow:0 10px 0 var(--ink),0 24px 40px rgba(0,0,0,.4)}
#s-perfil .carta::before{content:'';position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 40%,rgba(255,255,255,.09) 0 7deg,transparent 7deg 20deg)}
#s-perfil .carta .render{left:310px;transform:translateX(-50%);bottom:122px;height:470px}
#s-perfil .placaN{position:absolute;left:0;right:0;bottom:0;height:120px;background:var(--ink);display:flex;align-items:center;padding:0 24px;gap:14px}
#s-perfil .placaN .t{font-size:44px;flex:1}
#s-perfil .slot{width:70px;height:70px;border-radius:12px;border:4px dashed rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:44px;color:#9fb6ff}
#s-perfil .av{position:absolute;left:30px;top:30px;width:120px;height:120px;border:3.5px solid var(--ink);border-radius:16px;background:#1d3fc0;overflow:hidden;box-shadow:0 6px 0 var(--ink);z-index:2}
#s-perfil .av img{width:100%;height:100%}
#s-perfil .edit{position:absolute;width:60px;height:60px;border-radius:50%;z-index:3;--c1:#fff;--c2:#dfe6ff;--c3:#9aa6d6}
#s-perfil .edit svg{width:34px;height:34px}
#s-perfil .id{position:absolute;left:30px;top:166px;font-size:22px;color:#9fd0ff;z-index:2}
#s-perfil .der{position:absolute;left:760px;right:40px;top:140px;bottom:30px;display:flex;flex-direction:column;gap:22px}
#s-perfil .fila{display:flex;gap:22px}
#s-perfil .pan{padding:18px 22px}
#s-perfil .lbl{font-size:26px;color:#cfe0ff;margin-bottom:10px}
#s-perfil .big{font-size:76px;display:flex;align-items:center;gap:10px}
#s-perfil .big img{width:90px;height:90px}
#s-perfil .mini{display:flex;gap:12px;margin-top:12px}
#s-perfil .mini .c{position:relative;width:96px;height:120px;border:3px solid var(--ink);border-radius:12px;overflow:hidden;box-shadow:0 4px 0 var(--ink)}
#s-perfil .vic{display:flex;gap:18px;margin-top:6px}
#s-perfil .vic .hueco{flex:1;height:96px;display:flex;align-items:center;gap:14px;padding:0 18px;font-size:44px}
#s-perfil .vic img{width:60px;height:60px}
#s-nombre .fondo{--bg:linear-gradient(160deg,#2a7bff,#1846d8)}
#s-nombre .caja{position:absolute;left:560px;right:120px;top:300px;text-align:center}
#s-nombre input{width:100%;height:110px;margin-top:22px;border:3.5px solid var(--ink);border-radius:16px;font:44px Lilita;text-align:center;color:#18245a;background:linear-gradient(#fff,#e9eeff);box-shadow:inset 0 6px 0 rgba(0,0,0,.08),0 7px 0 var(--ink);outline:none;user-select:text;-webkit-user-select:text}
#s-nombre .cont{width:420px;height:110px;margin:60px auto 0;font-size:46px}
#s-amigos .fondo{--bg:linear-gradient(160deg,#2a7bff,#1846d8)}
#s-amigos .tabs{position:absolute;left:30px;top:140px;width:320px;display:flex;flex-direction:column;gap:18px}
#s-amigos .tab{height:96px;font-size:32px;transform:skewX(-6deg)}#s-amigos .tab>*{transform:skewX(6deg)}
#s-amigos .lista{position:absolute;left:400px;right:60px;top:140px;bottom:30px}
#s-amigos .cab{font-size:34px;margin-bottom:16px}
#s-amigos .row{height:104px;margin-bottom:16px;display:flex;align-items:center;gap:18px;padding:0 22px 0 10px}
#s-amigos .row .av{width:80px;height:80px;border:3px solid var(--ink);border-radius:12px;overflow:hidden;position:relative;background:#1d3fc0}
#s-amigos .row .av img{width:100%;height:100%}
#s-amigos .row .n{flex:1;font-size:34px}
#s-amigos .row .est{font-size:20px;margin-top:6px}
#s-amigos .row .tro{display:flex;align-items:center;gap:8px;font-size:36px;width:200px;justify-content:flex-end}
#s-amigos .row .tro img{width:52px;height:52px}
#s-amigos .row .inv{width:150px;height:72px;font-size:26px}
#s-amigos .row.yo{--c1:#ffe25a;background:linear-gradient(#ffe25a,#ffc21a);box-shadow:inset 0 -7px 0 #c27a00,0 7px 0 rgba(0,0,0,.5)}
#s-amigos .add{position:absolute;left:30px;bottom:40px;width:320px;height:120px;font-size:34px;flex-direction:column;gap:0}
#s-amigos .add img{width:84px;margin-top:-40px}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
PANT.perfil={html:()=>`<div class="fondo"></div>${header('PERFIL')}
<div class="carta" data-in="l"><div class="sombra" style="left:150px;bottom:110px;width:320px;height:50px"></div>
  <div class="respira" style="position:absolute;inset:0"><img class="render" src="${cuerpo('leon')}"></div>
  <div class="av">${I('avatar-leon')}</div><div class="id t xs">#TC8Q2LPY</div>
  <div class="placaN"><div class="t">LOVEGORDAS</div><div class="btn edit" style="position:relative" data-go="nombre">${ICO.lapiz}</div><div class="slot">+</div><div class="slot">+</div></div></div>
<div class="der">
 <div class="fila">
  <div class="pan" style="flex:1.2;--d:1" data-in="r"><div class="lbl t xs">CAMINO DE TROFEOS</div><div class="big t"><img src="a/i/trofeo.webp"><span data-count="78">78</span></div><div class="sub" style="font-size:20px;margin-top:6px">ARENA: VOLCÁN</div></div>
  <div class="pan" style="flex:1;--d:2" data-in="r"><div class="lbl t xs">RÉCORD</div><div class="big t amarillo"><img src="a/i/trofeo.webp"><span data-count="112">112</span></div><div class="sub" style="font-size:20px;margin-top:6px">TEMPORADA 3</div></div>
 </div>
 <div class="pan" data-in="r" style="--d:3"><div class="lbl t xs" style="display:flex;justify-content:space-between"><span>TITANES</span><span class="celeste">5 / 27 CONSEGUIDOS</span></div>
  <div class="mini">${MIOS.map(id=>`<div class="c">${retrato(id)}</div>`).join('')}<div class="c" style="background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:44px;color:#9fb6ff" data-go="personajes">+22</div></div></div>
 <div class="pan" data-in="r" style="--d:4"><div class="lbl t xs">VICTORIAS</div><div class="vic">
  <div class="hueco t">${I('balon')}<span data-count="38">38</span><span class="sub" style="font-size:20px">5 VS 5</span></div>
  <div class="hueco t">${I('estrella')}<span data-count="11">11</span><span class="sub" style="font-size:20px">MVP</span></div>
  <div class="hueco t">${I('super-tiro')}<span data-count="64">64</span><span class="sub" style="font-size:20px">GOLES</span></div></div></div>
</div>`};
PANT.nombre={html:()=>`<div class="fondo"></div>${header('CAMBIAR NOMBRE',{sinDinero:true})}
<img src="${cuerpo('leon')}" data-in="l" style="position:absolute;left:90px;bottom:0;height:640px;filter:drop-shadow(0 10px 0 rgba(0,0,0,.25))"><div class="caja"><div class="t s celeste" style="font-size:30px" data-in="u">¡No uses tu nombre real! Escribe un apodo nuevo:</div>
<input maxlength="15" value="LOVEGORDAS" data-in="u" style="--d:1" onclick="this.focus()"><div class="btn azul cont t" data-in="u" style="--d:2" data-go="perfil">CONTINUAR</div></div>`};
const amigos=[['ramoncasr','avatar-dragon','10214','En línea','#8dff5c'],['LOVEGORDAS','avatar-leon','78','Tú',''],['ElChaparro','avatar-lobo','2310','Jugando · Volcán','#ffcf3a'],['Mariana_9','avatar-aguila','5120','Hace 2 h','#9fb6ff']];
PANT.amigos={html:()=>`<div class="fondo"></div>${header('AMIGOS')}
<div class="tabs"><div class="btn tab t" data-in="l"><span>AMIGOS</span></div><div class="btn gris tab t" data-in="l" style="--d:1"><span>SUGERIDOS</span></div><div class="btn gris tab t" data-in="l" style="--d:2"><span>INVITACIONES</span><div class="badge t xs">3</div></div></div>
<div class="lista"><div class="cab t" data-in="f">AMIGOS (3)</div>
${amigos.map(([n,a,t,e,c],i)=>`<div class="pan row ${n==='LOVEGORDAS'?'yo':''}" data-in="r" style="--d:${i+1}"><div class="av">${I(a)}</div><div style="flex:1"><div class="n t s">${n}</div>${c?`<div class="est t xs" style="color:${c}">● ${e}</div>`:''}</div>
 <div class="tro t">${I('trofeo')}${t}</div>${n==='LOVEGORDAS'?'':`<div class="btn verde inv t s">${c==='#8dff5c'?'INVITAR':'VER'}</div>`}</div>`).join('')}</div>
<div class="btn verde add t" data-in="u" style="--d:3" onclick="toast('Comparte tu código: #TC8Q2LPY')">${I('invitar')}AÑADIR AMIGO</div>`};
})();
