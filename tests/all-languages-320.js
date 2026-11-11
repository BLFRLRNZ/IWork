// 6.2: every language, every screen, 320px wide: find clipped/overflowing text
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});

const LANGS=(process.argv[2]||'it,en,fr,de,es,pt,pt-BR,nl,pl,ro,bg,hr,cs,da,et,fi,el,hu,lv,lt,sk,sl,sv').split(',');
const SHOT=(process.argv[3]||'fi,el,hu,de').split(',');
const HOME={it:'IT',en:'GB',fr:'FR',de:'DE',es:'ES',pt:'PT','pt-BR':'BR',nl:'NL',pl:'PL',ro:'RO',bg:'BG',hr:'HR',cs:'CZ',da:'DK',et:'EE',fi:'FI',el:'GR',hu:'HU',lv:'LV',lt:'LT',sk:'SK',sl:'SI',sv:'SE'};
const probe=()=>{const vw=innerWidth,out=[];const dlg=[...document.querySelectorAll('dialog[open]')].pop();const root=dlg||document.body;
  for(const el of root.querySelectorAll('*')){if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')continue;
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();if(r.width===0)continue;
    const clip=(el.scrollWidth>el.clientWidth+1)&&cs.overflowX!=='visible'&&cs.textOverflow!=='ellipsis';
    const off=r.right>vw+1||r.left<-1;
    if(clip||off)out.push((off?'OFF ':'CLIP ')+(el.id||el.className||el.tagName)+': '+el.textContent.trim().slice(0,60));}
  return [...new Set(out)];};
(async()=>{const b=await chromium.launch();const rep={};
for(const l of LANGS){const p=await b.newPage({viewport:{width:320,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(([l,c])=>{if(localStorage.getItem('myturn-v1'))return;localStorage.setItem('myturn-lang',l);const d={};
  for(let i=2;i<=13;i++){const k='2026-11-'+String(i).padStart(2,'0');d[k]={k:'w',s:i%3?'06:00':'22:00',l:['a'],n:i===4?'Nota molto lunga per controllare il taglio del testo nelle celle':''};}
  d['2026-11-14']={k:'f'};d['2026-11-16']={k:'p',h:2};d['2026-11-17']={k:'m'};d['2026-11-18']={k:'w',s:'08:00',d:4,s2:'16:00',d2:4};d['2026-11-19']={k:'w',s:'21:00',ot:1.5};d['2026-11-20']={k:'w',s:'06:00'};
  localStorage.setItem('myturn-v1',JSON.stringify({days:d,settings:{setup:1,country:c,rate:12,ferie:26,perm:32,ocOn:1,ocPay:10,j2:{on:1,n:'Bar Centrale',rate:9},labels:[{id:'a',n:'Reparto A'}]},oc:{'2026-11-18':{s:'20:00',d:12,x:2},'2026-11-21':{s:'20:00',d:12}},j2:{'2026-11-18':{s:'18:00',d:4},'2026-11-22':{s:'18:30',d:4}},bp:{'2026-11':{ot:14,night:3,fest:8,ferie:2,perm:4,ferieRes:4.5,permRes:22,gross:2293.46,net:1669}}}));},[l,HOME[l]]);
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(700);const R={};
 const snap=async(name)=>{await p.waitForTimeout(250);R[name]=await p.evaluate(probe);if(SHOT.includes(l))await p.screenshot({path:`s54/${l}_${name}.png`,fullPage:name==='cal'||name==='year'||name==='list'});};
 const close=async()=>{await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await p.waitForTimeout(150);};
 const tool=async(id)=>{await p.click('#toolsBtn');await p.waitForTimeout(250);await p.click('#'+id);};
 await snap('cal');
 await p.click('#vList');await snap('list');await p.click('#vCal');
 await p.click('#tabYear');await snap('year');await p.click('#tabCal');
 await p.click('[data-k="2026-11-18"]');await snap('editor');await close();
 await p.click('#setBtn');await snap('settings');await close();
 await p.click('#toolsBtn');await snap('tools');await close();
 for(const [id,n] of [['cycleBtn','cycle'],['presetsBtn','presets'],['labelsBtn','labels'],['shareBtn','share'],['pdfBtn','pdf'],['whBtn','wh'],['pyBtn','py'],['j2Btn','j2'],['icsBtn','ics'],['bpBtn','bp']]){await tool(id);await snap(n);await close();}
 // onboarding on a fresh page
 const q=await b.newPage({viewport:{width:320,height:640},locale:l==='pt-BR'?'pt-BR':l+'-'+HOME[l]});q.on('pageerror',e=>errs.push(e.message));
 await q.goto('http://localhost:8765/index.html');await q.waitForTimeout(600);
 for(let i=0;i<5;i++){if(!await q.evaluate(()=>document.getElementById('ob').open))break;R['ob'+i]=await q.evaluate(probe);if(l==='fi'||l==='hu')await q.screenshot({path:`s54/${l}_ob${i}.png`});await q.click('#obNext');await q.waitForTimeout(200);}
 rep[l]={errs,issues:Object.fromEntries(Object.entries(R).filter(([k,v])=>v.length))};
 console.log(l,'errors',errs.length,'screens with issues',Object.keys(rep[l].issues).join(',')||'-');await p.close();await q.close();}
fs.writeFileSync(path.join(OUT,'all-languages.json'),JSON.stringify(rep,null,1));await b.close()})();
