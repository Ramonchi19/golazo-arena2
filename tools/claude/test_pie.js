// Prueba de la v228b. Uso (desde la raíz del repo): node tools/claude/test_pie.js
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');
const footLine=h.match(/const f0=p\.kickFace0[^\n]*/)[0].replace(/\/\/.*$/,'');
const passLine=h.match(/const side=Math\.abs\(latR\)[^}]*\}/)[0];
const PASS_R_SIDE={peq:'l',med:'r',gra:'r',atl:'r'};
function run(c){const KFOOT={zurdito:'l'};const p={kickFace0:c.f0,face:9,card:{id:c.id}},ball={vx:c.vx,vz:c.vz},pw=c.pw,m={peq:c.g};let n;
  eval(footLine.replace('const ','var '));eval(passLine.replace('const ','var ').replace(/\}$/,''));return {foot,n};}
// mirando hacia +z (face 0): +x es su izquierda
const C=[
 ['tiro al frente, diestro',{f0:0,vx:0,vz:1,pw:1,id:'leon',g:'atl'},'r'],
 ['tiro a su izquierda',{f0:0,vx:1,vz:.3,pw:1,id:'leon',g:'atl'},'l'],
 ['tiro a su derecha',{f0:0,vx:-1,vz:.3,pw:1,id:'leon',g:'atl'},'r'],
 ['Simún tiro al frente',{f0:0,vx:0,vz:1,pw:1,id:'zurdito',g:'med'},'l'],
 ['súper a su izquierda, diestro',{f0:0,vx:1,vz:.2,pw:1.15,id:'leon',g:'atl'},'r'],
 ['mirando +x, balón hacia -z (su izquierda)',{f0:Math.PI/2,vx:0,vz:-1,pw:1,id:'leon',g:'atl'},'l'],
];
let ok=true;for(const [t,c,want] of C){const r=run(c);const pass=r.foot===want;ok=ok&&pass;console.log(pass?'ok ':'MAL',t,'→ pie',r.foot);}
// pases: la animación debe empujar hacia donde va el balón
const P=[['pase a su izquierda, pequeño',{f0:0,vx:1,vz:.2,pw:.5,id:'vikingo',g:'peq'},'pass_r'],['pase a su izquierda, atlético',{f0:0,vx:1,vz:.2,pw:.5,id:'leon',g:'atl'},'pass_l'],
 ['pase a su derecha, pequeño',{f0:0,vx:-1,vz:.2,pw:.5,id:'vikingo',g:'peq'},'pass_l'],['pase a su derecha, mediano',{f0:0,vx:-1,vz:.2,pw:.5,id:'turbo',g:'med'},'pass_r'],
 ['pase al frente, diestro',{f0:0,vx:0,vz:1,pw:.5,id:'turbo',g:'med'},'pass_r'],['pase al frente, Simún',{f0:0,vx:0,vz:1,pw:.5,id:'zurdito',g:'med'},'pass_l']];
for(const [t,c,want] of P){const r=run(c);const pass=r.n===want;ok=ok&&pass;console.log(pass?'ok ':'MAL',t,'→',r.n);}
console.log(ok?'PASA':'FALLA');
