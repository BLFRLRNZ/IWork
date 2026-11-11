const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});

(async()=>{const b=await chromium.launch();const errs=[];
for(const [W,H,tag] of [[390,844,'m'],[1280,800,'d']]){
const p=await b.newPage({viewport:{width:W,height:H}});p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('myturn-lang','it');sessionStorage.setItem('x','1');}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);
// fresh: onboarding open → click through
for(let i=0;i<8&&await p.evaluate(()=>document.getElementById('ob').open);i++){await p.click('#obNext');await p.waitForTimeout(250);}
await p.waitForTimeout(700);
console.log(tag,'tour present',await p.$('#tour')!==null);
for(let i=0;i<12&&await p.$('#tour');i++){
  const info=await p.evaluate(()=>{const h=document.querySelector('#tour .thole').getBoundingClientRect(),bb=document.querySelector('#tour .tbub').getBoundingClientRect();return {h:document.getElementById('tourH').textContent,c:document.querySelector('#tour .tcount').textContent,hole:[h.x,h.y,h.width,h.height].map(Math.round),bub:[bb.x,bb.y,bb.width,bb.height].map(Math.round),inView:bb.top>=0&&bb.bottom<=innerHeight,overlap:!(bb.bottom<=h.top||bb.top>=h.bottom||bb.right<=h.left||bb.left>=h.right)&&h.width>0}});
  console.log(' ',JSON.stringify(info));await p.waitForTimeout(300);await p.screenshot({path:path.join(OUT,'tour_')+tag+i+'.png'});
  await p.click('#tour [data-t="next"]');await p.waitForTimeout(350);}
console.log(tag,'seen flag',await p.evaluate(()=>localStorage.getItem('myturn-tour')),'locked',await p.evaluate(()=>document.body.classList.contains('locked')));
await p.reload();await p.waitForTimeout(600);console.log(tag,'tour after reload',await p.$('#tour')!==null);
// replay from guide + Esc
await p.click('#toolsBtn');await p.waitForTimeout(200);await p.click('#helpBtn');await p.waitForTimeout(200);await p.click('#hpTour');await p.waitForTimeout(400);
console.log(tag,'replay',await p.$('#tour')!==null);await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log(tag,'after esc',await p.$('#tour')!==null);
await p.close();}
console.log('errors',errs);await b.close()})();
