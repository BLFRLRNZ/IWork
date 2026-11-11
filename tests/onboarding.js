const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});

const run=async(b,locale,seed,tag,steps)=>{const ctx=await b.newContext({viewport:{width:390,height:844},locale,timezoneId:'Europe/Rome'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-10T12:00:00+01:00')});
  if(seed)await p.addInitScript(s=>{if(!localStorage.getItem('myturn-v1'))localStorage.setItem('myturn-v1',s);},seed);
  await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(600);
  console.log(tag,'open:',await p.evaluate(()=>document.getElementById('ob').open),'|',await p.textContent('#obTitle'),'|',await p.textContent('#obSub'));
  await steps(p);console.log(tag,'errors',errs);await ctx.close();};
(async()=>{const b=await chromium.launch();
 await run(b,'it-IT',null,'NEW-IT',async p=>{await p.screenshot({path:path.join(OUT,'ob1.png')});
   await p.click('#obNext');await p.waitForTimeout(150);if(await p.$('#obAuth')){console.log(' account step:',await p.textContent('#obTitle'));await p.click('#obNext');await p.waitForTimeout(150);}console.log(' step2:',await p.textContent('#obTitle'));await p.screenshot({path:path.join(OUT,'ob2.png')});
   await p.click('#obNext');await p.waitForTimeout(150);console.log(' step3:',await p.textContent('#obTitle'));await p.selectOption('#obReg','BZ');await p.selectOption('#obPat','Milano');await p.screenshot({path:path.join(OUT,'ob3.png')});
   await p.click('#obNext');await p.fill('#obWd','7');await p.fill('#obSat','5');await p.screenshot({path:path.join(OUT,'ob4.png')});
   await p.click('#obNext');await p.waitForTimeout(150);await p.screenshot({path:path.join(OUT,'ob5.png')});console.log(' summary:',(await p.innerText('.obsum')).replace(/\n/g,' '));
   await p.click('#obNext');await p.waitForTimeout(300);
   console.log(' saved:',await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('myturn-v1')).settings,['country','region','patron','c','wd','sat','week','setup'])),'closed',!(await p.evaluate(()=>document.getElementById('ob').open)));
   await p.reload();await p.waitForTimeout(400);console.log(' reopen after reload?',await p.evaluate(()=>document.getElementById('ob').open),'| footer',await p.textContent('#footRule'));});
 await run(b,'en-GB',null,'NEW-EN',async p=>{for(let i=0;i<8&&await p.$('#ob[open]');i++){await p.click('#obNext');await p.waitForTimeout(100);}await p.waitForTimeout(300);
   console.log(' presets:',await p.innerText('#chips').then(x=>x.replace(/\n/g,' ')),'| lang',await p.evaluate(()=>localStorage.getItem('myturn-lang')));});
 await run(b,'it-IT',JSON.stringify({days:{'2026-11-09':{k:'w',s:'06:00'}},settings:{presets:[{n:'Alba',t:'05:00'}]}}),'EXISTING',async p=>{await p.screenshot({path:path.join(OUT,'ob-ex.png')});
   const sel=await p.$$eval('.opt[aria-pressed=true]',x=>x.map(e=>e.textContent));console.log(' preselected:',sel);
   for(let i=0;i<8&&await p.$('#ob[open]');i++){await p.click('#obNext');await p.waitForTimeout(100);}
   console.log(' kept:',await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('myturn-v1'));return JSON.stringify([Object.keys(s.days),s.settings.presets.map(x=>x.n),s.settings.setup]);}));
   // rules override
   await p.click('#toolsBtn');await p.waitForTimeout(200);await p.click('#whBtn');await p.waitForTimeout(200);await p.fill('#stRRest','12');await p.locator('#stRRest').blur();await p.waitForTimeout(200);
   console.log(' override:',await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('myturn-v1')).settings.rules)),'| reset visible',await p.isVisible('#stRReset'),'|',await p.textContent('#stRules'));
   await p.locator('#stRRest').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,'st-rules.png')});
   await p.click('#stRReset');console.log(' after reset:',await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('myturn-v1')).settings.rules)),await p.inputValue('#stRRest'));});
 await b.close();})();
