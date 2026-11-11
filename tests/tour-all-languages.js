const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'iwork-tests');fs.mkdirSync(OUT,{recursive:true});

(async()=>{const b=await chromium.launch();const errs=[];const bad=[];
for(const L of ['it','en','fr','de','es','pt','pt-BR','nl','pl','ro','bg','hr','cs','da','et','fi','el','hu','lv','lt','sk','sl','sv']){
const p=await b.newPage({viewport:{width:320,height:640}});p.on('pageerror',e=>errs.push(L+': '+e.message));
await p.addInitScript(L=>{localStorage.setItem('iwork-lang',L);localStorage.setItem('cartellino-turni-v1',JSON.stringify({days:{'2026-11-12':{k:'w',s:'06:00'}},settings:{setup:1,country:'IT'}}));},L);
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(350);
await p.evaluate(()=>iworkDebug.startTour());await p.waitForTimeout(300);
for(let i=0;i<10&&await p.$('#tour');i++){
  const r=await p.evaluate(()=>{const bb=document.querySelector('#tour .tbub').getBoundingClientRect();const ov=[...document.querySelectorAll('#tour .tbub *')].filter(e=>e.scrollWidth>e.clientWidth+1).length;return{h:document.getElementById('tourH').textContent,top:bb.top,bot:bb.bottom,ov,ctrl:/\{[a-z]\}/.test(document.getElementById('tourP').textContent)}});
  const ol=await p.evaluate(()=>{const h=document.querySelector('#tour .thole').getBoundingClientRect(),bb=document.querySelector('#tour .tbub').getBoundingClientRect();return h.width>0&&!(bb.bottom<=h.top+2||bb.top>=h.bottom-2)});r.ol=ol;if(r.top<0||r.bot>640||r.ov||r.ctrl||ol)bad.push(L+' '+i+' '+JSON.stringify(r));
  if(L==='hu'&&i===1)await p.screenshot({path:path.join(OUT,'tour_hu1.png')});
  await p.click('#tour [data-t="next"]');await p.waitForTimeout(280);}
await p.close();}
console.log('bad',bad,'errors',errs);await b.close()})();
