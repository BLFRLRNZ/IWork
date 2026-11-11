// L'app dentro Capacitor (iPhone/Android) simulata nel browser: plugin nativi finti in window.Capacitor.
// Controlla: niente service worker, aggiornamenti "dallo store", promemoria come notifiche locali (anche senza account),
// file condivisi con il menu del telefono, barre di sistema col tema, margini Android dalle variabili --safe-area-inset-*.
// Serve il server: python3 -m http.server 8765
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
(async()=>{const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fail++;};
  const ctx=await b.newContext({viewport:{width:430,height:932},locale:'it-IT'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  const days={};for(let i=0;i<80;i++)days[day(i)]={k:'w',s:'06:00',s2:'15:00',d:3,d2:3};
  await p.addInitScript(days=>{
    const log=window.__nat={sched:[],cancel:0,files:[],share:[],bars:[],perm:'prompt'};
    window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',Plugins:{
      LocalNotifications:{checkPermissions:async()=>({display:log.perm}),requestPermissions:async()=>{log.perm='granted';return{display:'granted'};},
        getPending:async()=>({notifications:log.sched.map(n=>({id:n.id}))}),cancel:async({notifications})=>{log.cancel+=notifications.length;const ids=new Set(notifications.map(n=>n.id));log.sched=log.sched.filter(n=>!ids.has(n.id));},
        schedule:async({notifications})=>{log.sched.push(...notifications);return{notifications:notifications.map(n=>({id:n.id}))};}},
      Filesystem:{writeFile:async o=>{log.files.push({path:o.path,len:o.data.length,dir:o.directory});return{uri:'file:///cache/'+o.path};}},
      Share:{share:async o=>{log.share.push(o);return{};}},
      SystemBars:{setStyle:async o=>{log.bars.push(o.style);}}}};
    localStorage.setItem('myturn-tour','1');
    localStorage.setItem('myturn-v1',JSON.stringify({days,settings:{setup:1,country:'IT'}}));
  },days);
  await p.goto('http://localhost:8765/index.html');await p.evaluate(()=>document.documentElement.style.setProperty('--safe-area-inset-bottom','48px'));await p.waitForTimeout(800);
  ok(await p.evaluate(()=>document.documentElement.classList.contains('native')&&document.documentElement.classList.contains('android')),'classe native/android sulla pagina');
  ok(await p.evaluate(async()=>!(await navigator.serviceWorker.getRegistrations()).length),'nessun service worker');
  ok((await p.evaluate(()=>__nat.bars)).length>0,'barre di sistema impostate col tema');
  // margini Android
  await p.click('#setBtn');await p.waitForTimeout(250);
  const pb=await p.evaluate(()=>getComputedStyle(document.querySelector('#st .sheet')).paddingBottom);ok(pb==='68px','margine sotto dalle variabili di Capacitor → '+pb);
  ok(/App Store o da Google Play/.test(await p.textContent('#upInfo')),'aggiornamenti dallo store: '+await p.textContent('#upInfo'));
  ok(!(await p.isVisible('#upCheck')),'niente pulsante "Cerca aggiornamenti"');
  await p.keyboard.press('Escape');await p.waitForTimeout(150);
  // promemoria senza account
  await p.click('#toolsBtn');await p.waitForTimeout(150);await p.click('#rmBtn');await p.waitForTimeout(250);
  ok(!(await p.isVisible('#rmNeed')),'promemoria: non chiede account né installazione');
  await p.click('#rmOn');await p.waitForTimeout(800);
  const n=await p.evaluate(()=>__nat);ok(n.perm==='granted','chiede il permesso delle notifiche');
  ok(n.sched.length===60&&n.sched.every(x=>x.title&&x.body&&x.schedule.at),'60 notifiche locali programmate ('+n.sched.length+')');
  ok(/attivi/.test(await p.textContent('#rmStatus')),'stato: '+await p.textContent('#rmStatus'));
  await p.screenshot({path:path.join(OUT,'native_rem.png')});
  await p.click('#rmTest');await p.waitForTimeout(300);ok((await p.evaluate(()=>__nat.sched.some(x=>x.id===1))),'notifica di prova → '+await p.textContent('#rmStatus')+' '+JSON.stringify(await p.evaluate(()=>__nat.sched.slice(-2).map(x=>x.id))));
  // modifica dei turni → riprogrammate
  await p.evaluate(k=>{myturnDebug.apply([[k,{k:'r'}]],'x');},day(1));await p.waitForTimeout(4800);
  const n2=await p.evaluate(()=>__nat);ok(n2.cancel>=60&&n2.sched.filter(x=>x.id>=1000).length===60,'dopo una modifica le notifiche vengono riprogrammate');
  await p.click('#rmOn');await p.waitForTimeout(400);ok((await p.evaluate(()=>__nat.sched.filter(x=>x.id>=1000).length))===0,'spegnendo, nessun promemoria in attesa');
  await p.keyboard.press('Escape');await p.waitForTimeout(150);
  // file: calendario .ics → menu Condividi
  await p.click('#toolsBtn');await p.waitForTimeout(150);await p.click('#icsBtn');await p.waitForTimeout(250);await p.click('#icGo');await p.waitForTimeout(600);
  const f=await p.evaluate(()=>__nat);ok(f.files.length===1&&/\.ics$/.test(f.files[0].path)&&f.files[0].dir==='CACHE'&&f.share.length===1&&f.share[0].files[0].startsWith('file://'),'.ics salvato e condiviso '+JSON.stringify(f.files));
  ok(!errs.length,'nessun errore '+errs.join(' | '));
  console.log(fail?fail+' FALLITI':'tutto ok');await b.close();process.exit(fail?1:0);})();
