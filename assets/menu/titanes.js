// ===== Datos de prueba de los titanes: estadísticas, súper, habilidades, nivel (se ajustan cuando el juego tenga los reales) =====
(function(){
// base por posición (nivel 1) y cuánto sube por nivel
const BASE={DEL:{salud:3000,tiro:420,vel:'RÁPIDA',vel_n:3},MED:{salud:3400,tiro:360,vel:'NORMAL',vel_n:2},DEF:{salud:4200,tiro:300,vel:'NORMAL',vel_n:2},POR:{salud:5000,tiro:260,vel:'LENTA',vel_n:1}};
const RAR={comun:1,rara:1.04,epica:1.08,legendaria:1.12};
const POSN={DEL:'DELANTERO',MED:'MEDIO',DEF:'DEFENSA',POR:'PORTERO'};
// súper, descripción y dos habilidades por titán
const X={
 leon:['GOLPE DEL REY','Salta y cae con los dos puños: tumba a todos los rivales cerca y deja el balón para él.','Rugido: asusta al rival más cercano.','Corona: más fuerza mientras lleve el balón.','El rey bárbaro de las montañas. Nunca ha perdido un mano a mano… según él.'],
 turbo:['DESCARGA','Lanza un rayo en línea recta que electrocuta y frena a los rivales.','Chispazo: un sprint corto eléctrico.','Sobrecarga: su súper se carga más rápido.','Semidiós del rayo. Corre tan rápido que a veces llega antes que el balón.'],
 zurdito:['TORMENTA DE ARENA','Crea un remolino de arena que esconde a su equipo y desorienta a los rivales.','Espejismo: deja una copia falsa.','Pies ligeros: no resbala en la arena.','Ladrón del desierto. Te roba el balón y tú ni cuenta te das.'],
 nebula:['AGUJERO NEGRO','Abre un portal que jala el balón y a los rivales hacia el centro.','Polvo estelar: tiro que deja estela.','Gravedad cero: salta más alto.','Hechicera cósmica. Dice que el balón le habla… y le hace caso.'],
 reina:['VENTISCA','Congela el suelo frente a ella: los rivales resbalan y quedan lentos.','Escarcha: su tiro congela un instante.','Corona de hielo: aguanta más golpes.','Reina del hielo. Su mirada enfría hasta el partido más caliente.'],
 malabares:['GINGA','Encadena regates imposibles: nadie lo puede tocar por unos segundos.','Bicicleta: amague que esquiva una barrida.','Ritmo: cada pase acertado lo hace más rápido.','Maestro de capoeira. Juega al ritmo de su propia música.'],
 muralla:['MURO DE PIEDRA','Levanta un muro frente a la portería que bloquea los tiros.','Puño de roca: despeje muy largo.','Inamovible: no lo tumban las barridas.','Gólem de piedra. Más de 300 años sin dejar pasar un balón.'],
 ciclon:['CORTE CICLÓN','Gira como torbellino y quita el balón a todos los que toca.','Desenvaine: barrida más rápida.','Disciplina: menos tiempo de recarga.','Samurái ronin. Un pase, un corte, un gol.'],
 ruleta:['GRITO DEL COLISEO','Lanza su escudo que rebota entre los rivales y los aturde.','Escudo: bloquea un tiro de frente.','Gladiador: más vida en el último minuto.','Gladiador invicto. La arena es su casa y el público grita su nombre.'],
 valkiria:['CARGA DIVINA','Embiste en línea recta con su lanza y derriba a todos en su camino.','Alas: salto largo sobre una barrida.','Valhalla: revive más rápido.','Guerrera del norte. Pelea por su equipo como si fuera la última batalla.'],
 vampira:['MORDIDA','Se lanza al rival, le roba el balón y le quita vida para ella.','Murciélagos: confunden al portero.','Noche eterna: más fuerte en sombra.','Condesa de la noche. Juega de noche y nunca se le ve llegar.'],
 remiendo:['DESCARGA VITAL','Se recarga con un rayo y empuja a todos con una onda eléctrica.','Puntadas: se cura un poco.','Fuerza bruta: empuja más lejos.','Monstruo cosido. Hecho de pedazos de los mejores defensas.'],
 vikingo:['MARTILLAZO','Golpea el suelo con su martillo: onda que levanta a los rivales.','Grito de guerra: su equipo corre más.','Runa: aguanta un golpe extra.','Enano vikingo. Pequeño, terco y duro como una roca.'],
 rey:['MALDICIÓN DEL DESIERTO','Encierra al rival en una tormenta de arena dorada que lo deja lento.','Ojo de Anubis: ve el balón tras los muros.','Juicio: castiga al que lo derribe.','Dios chacal. Pesa el corazón de cada delantero antes del tiro.'],
 momia:['VENDAJE','Lanza vendas que atrapan al rival y lo arrastran hacia él.','Maldición: el rival tira chueco.','Inmortal: se levanta más rápido.','Faraón vendado. Tiene 3,000 años y sigue en forma.'],
 zombi:['HORDA','Llama manos que salen del suelo y agarran a los rivales.','Mordisco: roba un poco de súper.','Sin dolor: no lo frenan los golpes.','Muerto viviente. Lento, pero nunca se rinde.'],
 yeti:['AVALANCHA','Rueda como bola de nieve gigante y aplasta todo a su paso.','Pelaje: resiste el frío y el hielo.','Abrazo: atrapa al rival un momento.','Bestia de las nieves. Abraza fuerte… demasiado fuerte.'],
 toro:['EMBESTIDA','Carga con los cuernos: lanza a los rivales por el aire.','Pezuña: frenón que levanta polvo.','Furia: más rápido si va perdiendo.','Minotauro. Ve rojo y ya nadie lo para.'],
 cazador:['CAÑONAZO','Dispara el balón como bala de cañón: el tiro más fuerte del juego.','Ancla: se queda firme en su lugar.','Botín: gana monedas extra al anotar.','Pirata capitán. Su tesoro favorito: los goles ajenos.'],
 perro:['AULLIDO','Aúlla a la luna: su equipo corre y pega más fuerte un rato.','Rastreo: siempre sabe dónde está el balón.','Manada: más fuerte cerca de aliados.','Hombre lobo. De día es tranquilo… de noche, otra historia.'],
 sangre:['INFIERNO','Incendia el suelo a su alrededor: quema y aleja a los rivales.','Brasa: su tiro deja fuego en el piso.','Ira: más fuerza con menos vida.','Demonio de fuego. Llegó del inframundo solo para jugar futbol.'],
 expreso:['ESTOCADA','Se lanza en estocada: roba el balón y deja al rival girando.','Capa: esquiva un golpe.','Honor: más fuerza en el uno contra uno.','Mosquetero. Uno para todos y todos para el gol.'],
 goblin:['ROBO','Se vuelve invisible un momento y roba el balón sin que lo vean.','Trampa: pone una cáscara en el piso.','Avaricia: más monedas por partido.','Ladronzuelo verde. Si brilla, es suyo.'],
 duende:['TRÉBOL DE LA SUERTE','Lanza un trébol: el siguiente tiro de su equipo siempre va a portería.','Olla de oro: suelta monedas.','Suerte: a veces esquiva una barrida.','Duende de la suerte. Nadie sabe si es bueno o solo afortunado.'],
 hongo:['ESPORAS','Suelta una nube de esporas que marea a los rivales.','Rebote: su sombrero rebota el balón.','Brote: se cura poco a poco.','Hongo feliz. Siempre sonríe, hasta cuando le meten gol.'],
 monje:['PALMA ZEN','Golpe de energía que empuja el balón y a los rivales muy lejos.','Meditación: recupera súper quieto.','Equilibrio: no resbala nunca.','Monje del templo. Encontró la paz interior… y el ángulo perfecto.'],
 campeon:['TIRO DE CAMPEÓN','Tiro con efecto que dobla en el aire y engaña al portero.','Capitán: su equipo gana confianza.','Experiencia: menos errores en el pase.','Campeón del torneo. Ya ganó todo y quiere volver a ganarlo.']
};
const NIVEL={leon:4,toro:2,cazador:3,goblin:2,hongo:5};
const COSTO=[0,20,35,75,140,290,480,800,1250,1875,2800];   // monedas para subir a nivel n+1
const FICHAS=[0,20,30,50,80,130,210,340,550,890,1440];
const MAXN=11;
window.TITAN_DATOS=id=>{const p=PJI[id],b=BASE[p.pos],k=RAR[p.r],x=X[id]||['SÚPER','','','',''];
  const n=NIVEL[id]||1,sal=Math.round(b.salud*k/10)*10,tir=Math.round(b.tiro*k);
  return {p,n,max:MAXN,pos:POSN[p.pos],salud:v=>Math.round(sal*(1+.1*(v-1))),tiro:v=>Math.round(tir*(1+.1*(v-1))),vel:b.vel,vel_n:b.vel_n,
    super:x[0],superD:x[1],hab:[{n:x[2].split(':')[0],d:x[2].split(':')[1]||'',nv:7},{n:x[3].split(':')[0],d:x[3].split(':')[1]||'',nv:9}],desc:x[4],
    costo:COSTO[n]||0,fichas:FICHAS[n]||0,tengoF:Math.round((FICHAS[n]||0)*(n%2?.6:1.15)),trofeos:[0,40,120,180,215,90,0,0,0,0,0][n]||0};};
window.TITAN_NIVEL=NIVEL;window.TITAN_COSTO=COSTO;window.TITAN_FICHAS=FICHAS;
})();
