const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'iwork-tests');fs.mkdirSync(OUT,{recursive:true});

const D=()=>JSON.parse(localStorage.getItem('cartellino-turni-v1'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:400,height:860},timezoneId:'Europe/Rome'});const p=await ctx.newPage();
await p.clock.install({time:new Date('2026-11-10T11:00:00+01:00')});p.on('pageerror',e=>console.log('ERR',e.message));
await p.addInitScript(()=>{if(localStorage.getItem('cartellino-turni-v1'))return;const d={};for(let i=1;i<=9;i++)d['2026-11-0'+i]={k:'w',s:'06:00'};
 localStorage.setItem('cartellino-turni-v1',JSON.stringify({days:d,settings:{setup:1,country:'IT',labels:[{id:'la',n:'Reparto A'},{id:'lb',n:'Reparto B'}]}}));});
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(400);
const ev=f=>p.evaluate(f);
console.log('badge before:',await p.isVisible('#toolsBadge'));
await p.click('#toolsBtn');await p.waitForTimeout(200);await p.screenshot({path:path.join(OUT,'v18-tools.png')});await p.click('#tlClose');await p.waitForTimeout(200);
console.log('badge after opening menu:',await p.isVisible('#toolsBadge'));
await p.screenshot({path:path.join(OUT,'v18-cal.png'),clip:{x:0,y:0,width:400,height:520}});
// shift + label brush
await p.click('[data-b="w1"]');await p.click('[data-lb="la"]');console.log('hint:',await p.innerText('#hint'));
await p.click('[data-k="2026-11-12"]');console.log('12:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-12'])));
await p.click('[data-b="w1"]');// only label brush now
await p.click('[data-k="2026-11-03"]');console.log('03 add:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-03'].l)));
await p.click('[data-k="2026-11-03"]');console.log('03 toggle off:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-03'].l||null)));
await p.click('[data-k="2026-11-20"]');console.log('empty day toast:',await p.textContent('#toastMsg'));
await p.click('[data-lb="la"]');
// editor autosave
await p.click('[data-k="2026-11-18"]');await p.waitForTimeout(200);await p.click('label:has(#k-r)');await p.waitForTimeout(400);
console.log('18 autosaved riposo:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-18'])));
await p.click('label:has(#k-w)');await p.fill('#edStart','07:30');await p.fill('#edNote','prova nota');await p.click('#edLabels [data-l="lb"]');
await p.screenshot({path:path.join(OUT,'v18-ed.png')});
await p.keyboard.press('Escape');await p.waitForTimeout(200);
console.log('18 after esc:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-18'])));
// open empty day and close: nothing created
await p.click('[data-k="2026-11-25"]');await p.waitForTimeout(200);await p.click('#edSave');await p.waitForTimeout(200);console.log('25 untouched:',await ev(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-25']||null));
// settings autosave
await p.click('#toolsBtn');await p.waitForTimeout(200);await p.click('#lvBtn');await p.waitForTimeout(200);await p.fill('#stFerie','26');await p.waitForTimeout(600);console.log('ferie saved w/o button:',await ev(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).settings.ferie));
await p.keyboard.press('Escape');await p.waitForTimeout(200);await p.click('#toolsBtn');await p.waitForTimeout(200);await p.click('#pyBtn');await p.waitForTimeout(200);await p.fill('#stRate','11');await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log('rate saved on close:',await ev(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).settings.rate));
await p.screenshot({path:path.join(OUT,'v18-set.png')});
// presets sheet
await p.click('#toolsBtn');await p.click('#presetsBtn');await p.waitForTimeout(300);console.log('tl closed',!(await ev(()=>document.getElementById('tl').open)),'pr open',await ev(()=>document.getElementById('pr').open));
await p.fill('#pn-0','Alba');await p.waitForTimeout(600);console.log('preset renamed live:',await p.innerText('[data-b="w0"]'));
await p.click('#stAdd');await p.fill('#pn-3','Corto');await p.fill('#pd-3','4');await p.waitForTimeout(600);
await p.click('#stPresets [data-del="1"]');console.log('presets:',await ev(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).settings.presets.map(x=>x.n).join(',')),'| toast',await p.textContent('#toastMsg'));
await p.click('#toastUndo');console.log('after undo:',await ev(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).settings.presets.map(x=>x.n).join(',')));
await p.screenshot({path:path.join(OUT,'v18-pr.png')});await p.keyboard.press('Escape');
// labels sheet: delete Reparto A with undo
await p.click('#toolsBtn');await p.click('#labelsBtn');await p.waitForTimeout(300);await p.screenshot({path:path.join(OUT,'v18-lb.png')});
await p.click('#stLabels [data-del="0"]');console.log('label del toast:',await p.textContent('#toastMsg'),'| 12 l:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-12'].l||null)));
await p.click('#toastUndo');console.log('undo -> labels',await ev(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).settings.labels.map(x=>x.n).join(',')),'12 l:',await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days['2026-11-12'].l)));
await p.click('#stLabAdd');await p.fill('#lb-2','Pressa 3');await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log('lchips:',(await p.innerText('#lchips')).replace(/\n/g,' | '));
await p.reload();await p.waitForTimeout(300);console.log('badge after reload:',await p.isVisible('#toolsBadge'),await p.evaluate(()=>[localStorage.getItem('iwork-bkseen'),localStorage.getItem('iwork-lastbackup'),Date.now(),Object.keys(JSON.parse(localStorage.getItem('cartellino-turni-v1')).days).length]));
await b.close()})();
