// Datos del prototipo (nombres y rarezas reales del juego)
window.PJ=[
 ['leon','Kragor','Rey bárbaro','DEL','epica'],['turbo','Volt','Semidiós del rayo','DEL','legendaria'],['zurdito','Simún','Ladrón del desierto','DEL','legendaria'],
 ['nebula','Nébula','Hechicera cósmica','MED','legendaria'],['reina','Reina','Reina del hielo','DEL','legendaria'],['malabares','Ginga','Maestro de capoeira','MED','legendaria'],
 ['muralla','Golem','Gólem de piedra','POR','legendaria'],['ciclon','Kenshi','Samurái ronin','DEF','epica'],['ruleta','Maximus','Gladiador','MED','epica'],
 ['valkiria','Valkiria','Guerrera del norte','DEF','epica'],['vampira','Vampira','Condesa de la noche','DEL','epica'],['remiendo','Remiendo','Monstruo cosido','DEF','epica'],
 ['vikingo','Thorin','Enano vikingo','DEF','rara'],['rey','Anubis','Dios chacal','DEL','rara'],['momia','Momia','Faraón vendado','DEF','rara'],
 ['zombi','Zombi','Muerto viviente','DEF','rara'],['yeti','Yeti','Bestia de las nieves','MED','rara'],['toro','Tauro','Minotauro','MED','comun'],
 ['cazador','Barbanegra','Pirata capitán','DEL','comun'],['perro','Fenrir','Hombre lobo','MED','comun'],['sangre','Azazel','Demonio de fuego','DEF','comun'],
 ['expreso','Duelo','Mosquetero','DEF','comun'],['goblin','Goblin','Ladronzuelo verde','MED','comun'],['duende','Duende','Duende de la suerte','MED','comun'],
 ['hongo','Hongo','Hongo feliz','MED','comun'],['monje','Monje','Monje del templo','DEF','comun'],['campeon','Campeón','Campeón del torneo','DEL','comun']
].map(([id,n,t,pos,r])=>({id,n,t,pos,r}));
window.PJI=Object.fromEntries(PJ.map(p=>[p.id,p]));
window.MIOS=['leon','toro','cazador','goblin','hongo'];          // personajes que ya tiene el jugador
window.ZOOM={};   // los retratos nuevos salen del modelo 4K ya encuadrados
// estatura de cada titán (1 = normal): se usa en la colección, el detalle, la tienda y la pantalla final
window.ESTATURA={leon:1.06,turbo:.92,zurdito:.93,nebula:.95,reina:.9,malabares:.96,muralla:1.25,ciclon:1.0,ruleta:1.05,valkiria:1.0,vampira:.88,remiendo:1.15,vikingo:.78,rey:1.08,momia:.95,zombi:.97,yeti:1.2,toro:1.15,cazador:1.02,perro:1.08,sangre:1.12,expreso:.96,goblin:.7,duende:.72,hongo:.7,monje:.9,campeon:.96};
window.RARN={comun:'COMÚN',rara:'RARO',epica:'ÉPICO',legendaria:'LEGENDARIO'};
window.ARENAS=[['a0','Campo de Entrenamiento',0],['a1','Bosque Encantado',300],['a2','Pueblo',600],['a3','Playa Pirata',1000],['a4','Templo del Desierto',1500],['a5','Tundra de Hielo',2100],['a7','Volcán',2800],['a8','Coliseo de Leyendas',3600]];
window.RANK=[['El Titán MX','🇲🇽','Los Volcanes',12840,'leon'],['ZurdoKing','🇦🇷','Tango FC',12611,'zurdito'],['NébulaGG','🇪🇸','Galaxia',12477,'nebula'],
 ['Kenshi_77','🇨🇴','Ronin Club',11980,'ciclon'],['La Muralla','🇲🇽','Los Volcanes',11804,'muralla'],['VoltRápido','🇨🇱','Rayos',11650,'turbo'],
 ['Reina Fría','🇵🇪','Hielo Eterno',11402,'reina'],['Golazo23','🇺🇸','Halcones',11366,'ruleta'],['Capi Thorin','🇲🇽','Vikingos',11201,'vikingo'],['Fenrir_x','🇻🇪','Manada',11054,'perro']];
