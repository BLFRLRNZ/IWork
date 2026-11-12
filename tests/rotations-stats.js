// Rotazioni pronte nella turnazione ciclica e statistiche nella vista Anno.
// Uso: node tests/rotations-stats.js   (serve il server su 8765). Foto in $OUT.
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});
const URL0='http://localhost:8765/index.html';
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
(async()=>{const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fail++;};
  async function page(state,o={}){const ctx=await b.newContext({viewport:{width:o.w||430,height:932},locale:'it-IT',colorScheme:o.dark?'dark':'light'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
    await p.addInitScript(st=>{localStorage.setItem('myturn-tour','1');localStorage.setItem('myturn-lang','it');localStorage.setItem('myturn-v1',JSON.stringify(st));},state);
    await p.goto(URL0);await p.waitForTimeout(500);return p;}
  const base={days:{},settings:{setup:1,country:'IT'}};
  async function openCycle(p){await p.click('#toolsBtn');await p.waitForTimeout(150);await p.click('#cycleBtn');await p.waitForTimeout(250);}
  // --- 1. ciclo continuo 2-2-2-2 con i turni che ci sono già
  {const p=await page(base);await openCycle(p);
    ok(await p.locator('#cyRots .rot').count()===9,'9 rotazioni pronte');
    await p.screenshot({path:path.join(OUT,'rot_list.png')});
    await p.click('#cyRots [data-rot="2222"]');await p.waitForTimeout(150);
    const steps=await p.evaluate(()=>[...document.querySelectorAll('#cySteps select')].map(s=>s.value));
    ok(JSON.stringify(steps)==='["p0","p1","p2","r"]','2-2-2-2 usa Mattina, Pomeriggio, Notte già esistenti: '+steps);
    ok(await p.getAttribute('#cyRots [data-rot="2222"]','aria-pressed')==='true'&&await p.isHidden('#cyNew'),'rotazione evidenziata, niente turni da aggiungere');
    const from=await p.inputValue('#cyFrom');await p.click('#cyGo');await p.waitForTimeout(300);
    const days=await p.evaluate(()=>myturnDebug.S.days);const d0=new Date(from);
    const got=[0,1,2,3,4,5,6,7,8].map(i=>{const k=key(new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+i));const e=days[k];return e?(e.k==='w'?e.s:e.k):'-';});
    ok(got.join(',')==='06:00,06:00,14:00,14:00,22:00,22:00,r,r,06:00','giorni compilati: '+got.join(','));
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}
  // --- 2. DuPont: mancano i turni da 12 ore, vengono aggiunti
  {const p=await page(base);await openCycle(p);await p.click('#cyRots [data-rot="dup"]');await p.waitForTimeout(150);
    ok(await p.isVisible('#cyNew')&&/Giorno 12 h.*Notte 12 h|Notte 12 h.*Giorno 12 h/.test(await p.textContent('#cyNew')),'avvisa dei turni che aggiunge: '+await p.textContent('#cyNew'));
    ok(/Ciclo di <b>28 giorni/.test(await p.innerHTML('#cySum')),'ciclo di 28 giorni');
    await p.screenshot({path:path.join(OUT,'rot_dupont.png')});
    const from=await p.inputValue('#cyFrom');await p.click('#cyGo');await p.waitForTimeout(300);
    const st=await p.evaluate(()=>({P:myturnDebug.S.settings.presets,days:myturnDebug.S.days,cy:myturnDebug.S.settings.cycle}));
    ok(st.P.length===5&&st.P[3].n==='Notte 12 h'&&st.P[3].t==='19:00'&&st.P[3].d===12&&st.P[4].n==='Giorno 12 h'&&st.P[4].t==='07:00','aggiunti Notte 12 h e Giorno 12 h: '+JSON.stringify(st.P.slice(3)));
    ok(st.cy.every(c=>/^p\d+$|^r$/.test(c.v)),'il ciclo salvato usa solo turni veri');
    const d0=new Date(from),e0=st.days[key(d0)],e4=st.days[key(new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+4))],e7=st.days[key(new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+7))];
    ok(e0&&e0.s==='19:00'&&e0.d===12&&e4&&e4.k==='r'&&e7&&e7.s==='07:00','DuPont: 4 notti, 3 riposi, poi giorni');
    // riaprendo: il ciclo salvato si ricarica senza "nuovi"
    await openCycle(p);ok(await p.isHidden('#cyNew'),'riaprendo, i turni da 12 ore sono già tra i turni rapidi');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}
  // --- 3. statistiche dell'anno
  const y=new Date().getFullYear(),days={};
  for(let d=new Date(y,0,1);d.getFullYear()===y;d.setDate(d.getDate()+1)){const i=Math.floor((d-new Date(y,0,1))/864e5),c=i%8;
    days[key(d)]=c<2?{k:'w',s:'06:00'}:c<4?{k:'w',s:'14:00',ot:c===2&&i%16===2?1.5:0}:c<6?{k:'w',s:'22:00'}:{k:'r'};}
  days[key(new Date(y,7,10))]={k:'f'};days[key(new Date(y,7,11))]={k:'f'};
  const prev={};for(let i=0;i<40;i++)prev[key(new Date(y-1,2,i+1))]={k:'w',s:'08:00'};
  for(const [w,dark] of [[430,false],[320,false],[430,true]]){const p=await page({days:Object.assign({},prev,days),settings:{setup:1,country:'IT'}},{w,dark});
    await p.click('#tabYear');await p.waitForTimeout(400);
    const vis=await p.isVisible('#yStats');ok(vis,w+(dark?' scuro':'')+': pannello Statistiche visibile');
    if(w===430&&!dark){const txt=await p.textContent('#yStats');
      ok(/Statistiche del/.test(txt)&&/Tipi di turno/.test(txt)&&/Turni per mese/.test(txt)&&/Giorni della settimana/.test(txt),'sezioni presenti');
      ok(await p.locator('#yStats .sbars button').count()===12&&await p.locator('#yStats .wbars > div').count()===7&&await p.locator('#yStats .mini').count()===3,'12 mesi, 7 giorni, 3 mini grafici');
      const streak=await p.evaluate(()=>[...document.querySelectorAll('#yStats .tile')].map(x=>x.textContent));
      ok(streak.some(s=>/^6Giorni di lavoro di fila/.test(s)),'giorni di fila al massimo: 6 → '+streak.join(' | '));
      ok(streak.some(s=>/Rispetto al/.test(s)),'confronto con l\'anno prima');
      await p.click('#yStats .sbars button[data-ym="2"]');await p.waitForTimeout(300);
      ok(await p.evaluate(()=>document.querySelector('#yearView').hidden||getComputedStyle(document.querySelector('#yearView')).display==='none'),'toccando un mese si apre il calendario');}
    else{const el=await p.$('#yStats');await el.screenshot({path:path.join(OUT,'stats_'+w+(dark?'_dark':'')+'.png')});}
    if(w===430&&!dark){await p.click('#tabYear');await p.waitForTimeout(300);const el=await p.$('#yStats');await el.screenshot({path:path.join(OUT,'stats_430.png')});}
    const over=await p.evaluate(()=>{const r=document.querySelector('#yStats').getBoundingClientRect();return [...document.querySelectorAll('#yStats *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&(b.right>r.right+1||b.left<r.left-1);}).map(e=>e.className||e.tagName).slice(0,5);});
    ok(!over.length,w+': niente esce dal pannello '+over.join(','));
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}
  console.log(fail?fail+' FALLITI':'tutto ok');await b.close();process.exit(fail?1:0);})();
