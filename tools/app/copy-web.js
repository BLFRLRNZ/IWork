// Copia in www/ i file dell'app web che servono dentro l'app nativa (Capacitor).
// Uso: node tools/app/copy-web.js   (dalla cartella principale del progetto)
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'www');
const FILES=['index.html','countries.js','version.json','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'];
const DIRS=['lang','fonts','vendor'];
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
for(const f of FILES)fs.copyFileSync(path.join(ROOT,f),path.join(OUT,f));
for(const d of DIRS)fs.cpSync(path.join(ROOT,d),path.join(OUT,d),{recursive:true});
// il service worker non serve nell'app: i file sono già nel telefono
console.log('www pronta:',fs.readdirSync(OUT).join(', '));
