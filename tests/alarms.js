// Sveglie prima dei turni (solo nell'app): plugin nativo finto MyTurnNative con alarmState/alarmRequest/setAlarms.
// Controlla: permesso, sveglie per tipo di turno e anticipo, aggiornamento quando cambiano i turni,
// iPhone senza iOS 26, Android che concede il permesso dopo, nessun pulsante nella versione web.
// Uso: node tests/alarms.js   (serve il server su 8765). Foto in $OUT.
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});
const URL0='http://localhost:8765/index.html';
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const at=(o,hm,min)=>{const d=new Date();d.setDate(d.getDate()+o);const [h,m]=hm.split(':').map(Number);d.setHours(h,m,0,0);return d.getTime()-min*6e4;};
// turni: 1-2 mattina, 3-4 pomeriggio, 5-6 notte, 7-8 riposo, poi di nuovo
const days={};for(let i=1;i<=30;i++){const c=(i-1)%8;days[day(i)]=c<2?{k:'w',s:'06:00'}:c<4?{k:'w',s:'14:00'}:c<6?{k:'w',s:'22:00'}:{k:'r'};}
(async()=>{const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fail++;};
  async function open(o={}){const ctx=await b.newContext({viewport:{width:o.w||430,height:932},locale:'it-IT',colorScheme:o.dark?'dark':'light'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
    await p.addInitScript(([days,o])=>{
      localStorage.setItem('myturn-tour','1');localStorage.setItem('myturn-lang','it');
      localStorage.setItem('myturn-v1',JSON.stringify({days,settings:Object.assign({setup:1,country:'IT'},o.settings||{})}));
      if(o.web)return;
      const log=window.__al={state:o.state||'prompt',after:o.after||'granted',sets:[],asks:0};
      window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>o.platform||'ios',Plugins:{
        LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),getPending:async()=>({notifications:[]}),cancel:async()=>{},schedule:async()=>({notifications:[]})},
        SystemBars:{setStyle:async()=>{}},
        MyTurnNative:{setData:async()=>{},
          alarmState:async()=>({state:log.state}),
          // iPhone: risponde subito; Android: il permesso arriva dopo (finestra o impostazioni)
          alarmRequest:async()=>{log.asks++;if(o.platform==='android'){setTimeout(()=>{log.state=log.after;},2000);return{state:log.state};}log.state=log.after;return{state:log.state};},
          setAlarms:async a=>{log.sets.push(a);return{scheduled:a.items.length};}}}};
    },[days,o]);
    await p.goto(URL0);await p.waitForTimeout(500);return p;}
  async function sheet(p){await p.click('#toolsBtn');await p.waitForTimeout(150);await p.click('#alBtn');await p.waitForTimeout(300);}
  const last=p=>p.evaluate(()=>__al.sets[__al.sets.length-1]);

  // --- 1. iPhone: permesso, poi sveglie per Mattina (90 min prima), Pomeriggio e Notte (60 min prima)
  {const p=await open();await sheet(p);
    ok(await p.isVisible('#alAsk')&&/permesso per le sveglie/.test(await p.textContent('#alNeed'))&&await p.isDisabled('#alOn'),'chiede il permesso, interruttore spento');
    await p.screenshot({path:path.join(OUT,'alarm_prompt.png')});
    await p.click('#alAsk');await p.waitForTimeout(400);
    ok(await p.isHidden('#alAsk')&&await p.isChecked('#alOn')&&await p.isVisible('#alBox'),'dopo il permesso le sveglie sono accese');
    const s=await last(p);ok(s&&s.stop==='Ferma'&&s.snooze==='Posticipa','pulsanti Ferma e Posticipa tradotti');
    const its=s.items;ok(its.length===11,'14 giorni → 11 sveglie ('+its.length+')');
    const m=its.find(i=>i.id===day(1)),pm=its.find(i=>i.id===day(3)),n=its.find(i=>i.id===day(5));
    ok(m&&m.at===at(1,'06:00',90)&&m.title==='Mattina alle 06:00'&&m.body==='Turno alle 06:00','mattina: 1 h 30 min prima → '+JSON.stringify(m));
    ok(pm&&pm.at===at(3,'14:00',60)&&pm.title==='Pomeriggio alle 14:00','pomeriggio: 1 h prima');
    ok(n&&n.at===at(5,'22:00',60)&&n.title==='Notte alle 22:00','notte: 1 h prima');
    ok(its.every((x,i)=>!i||its[i-1].at<=x.at)&&!its.some(i=>i.id===day(7)||i.id===day(8)),'in ordine, niente sveglie nei riposi');
    ok(/Prossima sveglia: .* alle 04:30Mattina alle 06:00 · /.test(await p.textContent('#alNext'))&&/11 sveglie nei prossimi 14 giorni/.test(await p.textContent('#alNext')),'riepilogo: '+await p.textContent('#alNext'));
    await p.screenshot({path:path.join(OUT,'alarm_on.png')});
    // Notte spenta, Mattina 45 minuti prima
    await p.locator('.alrow[data-ty="n"] .alT').uncheck();await p.waitForTimeout(200);
    await p.selectOption('.alrow[data-ty="m"] .alM','45');await p.waitForTimeout(300);
    const s2=await last(p);ok(!s2.items.some(i=>/^Notte/.test(i.title))&&s2.items.find(i=>i.id===day(1)).at===at(1,'06:00',45),'senza notti e mattina 45 min prima');
    ok(await p.isDisabled('.alrow[data-ty="n"] .alM'),'anticipo della notte disattivato');
    const A=await p.evaluate(()=>myturnDebug.S.settings.alarm);ok(A.on===1&&A.n.on===0&&A.m.min===45&&A.p.min===60,'impostazioni salvate '+JSON.stringify(A));
    // un turno cambia → sveglie aggiornate da sole
    await p.keyboard.press('Escape');await p.waitForTimeout(150);await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));const k=(await p.evaluate(()=>__al.sets.length));
    await p.evaluate(d=>myturnDebug.apply([[d,{k:'f'}]],'x'),day(1));await p.waitForTimeout(1400);
    const s3=await last(p);ok((await p.evaluate(()=>__al.sets.length))>k&&!s3.items.some(i=>i.id===day(1)),'giorno di ferie → la sua sveglia sparisce');
    // spenta: elenco vuoto al codice nativo
    await sheet(p);await p.uncheck('#alOn');await p.waitForTimeout(300);ok((await last(p)).items.length===0&&await p.isHidden('#alBox'),'spegnendo, nessuna sveglia');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}

  // --- 2. iPhone senza iOS 26
  {const p=await open({state:'unsupported'});await sheet(p);
    ok(/iOS 26/.test(await p.textContent('#alNeed'))&&await p.isHidden('#alAsk')&&await p.isDisabled('#alOn'),'iOS vecchio: spiega e propone i promemoria');
    ok(!p.errs.length,'nessun errore');await p.context().close();}

  // --- 3. permesso negato
  {const p=await open({state:'denied',settings:{alarm:{on:1}}});await sheet(p);
    ok(/impostazioni del telefono/.test(await p.textContent('#alNeed'))&&!(await p.isChecked('#alOn')),'negato: rimanda alle impostazioni del telefono');
    ok(!p.errs.length,'nessun errore');await p.context().close();}

  // --- 4. Android: il permesso arriva dopo (impostazione "Sveglie e promemoria")
  {const p=await open({platform:'android'});await sheet(p);await p.click('#alAsk');await p.waitForTimeout(500);
    ok(await p.isVisible('#alAsk'),'subito dopo la richiesta aspetta ancora');
    await p.waitForTimeout(3500);ok(await p.isChecked('#alOn')&&(await last(p)).items.length===11,'quando arriva il permesso le sveglie si accendono da sole');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}

  // --- 5. foto a 320 px e scuro, niente che esce
  for(const [w,dark] of [[320,false],[430,true]]){const p=await open({w,dark,state:'granted',settings:{alarm:{on:1}}});await sheet(p);
    const over=await p.evaluate(()=>{const r=document.querySelector('#al .sheet').getBoundingClientRect();return [...document.querySelectorAll('#al .sheet *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&(b.right>r.right+1||b.left<r.left-1);}).map(e=>e.className||e.tagName).slice(0,5);});
    ok(!over.length,w+(dark?' scuro':'')+': niente esce dal pannello '+over.join(','));
    await p.screenshot({path:path.join(OUT,'alarm_'+w+(dark?'_dark':'')+'.png')});await p.context().close();}

  // --- 6. Guida nell'app: sveglie, widget e orologio, risposte senza browser; "Portami lì" apre le sveglie
  {const p=await open({state:'granted'});await p.evaluate(()=>{document.getElementById('helpBtn').click();});await p.waitForTimeout(300);
    const qs=await p.evaluate(()=>[...document.querySelectorAll('#hpList summary')].map(s=>s.textContent));
    ok(qs.includes('Come metto una sveglia prima dei turni?')&&qs.includes("Come metto i turni nei widget o sull'orologio?")&&qs.includes("Se elimino l'app perdo i turni?"),'Guida nell\'app: sveglie, widget e orologio');
    ok(!qs.includes("Come installo l'app sul telefono?")&&!qs.includes('Se cancello i dati del browser perdo i turni?'),'Guida nell\'app: niente domande sul browser');
    const txt=await p.textContent('#hpList');ok(!/schermata Home e la apri da lì|nel browser/.test(txt),'nessuna risposta pensata per il browser');
    await p.fill('#hpQ','sveglia');await p.waitForTimeout(200);
    await p.click('#hpList details:not([hidden]) [data-go="alBtn"]');await p.waitForTimeout(400);
    ok(await p.evaluate(()=>document.getElementById('al').open),'Portami lì apre le sveglie');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}
  // --- 7. versione web: niente sveglie
  {const p=await open({web:true});await p.click('#toolsBtn');await p.waitForTimeout(150);
    ok(await p.isHidden('#alBtn'),'nella versione web il pulsante Sveglie non c\'è');
    await p.keyboard.press('Escape');await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await p.evaluate(()=>document.getElementById('helpBtn').click());await p.waitForTimeout(300);
    const qs=await p.evaluate(()=>[...document.querySelectorAll('#hpList summary')].map(s=>s.textContent));
    ok(qs.includes("Come installo l'app sul telefono?")&&!qs.includes('Come metto una sveglia prima dei turni?'),'Guida web come prima');
    await p.context().close();}

  console.log(fail?fail+' FALLITI':'tutto ok');await b.close();process.exit(fail?1:0);})();
