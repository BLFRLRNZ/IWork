// Lettura del foglio dei turni (Strumenti → Leggi il foglio dei turni): PDF con tabella e legenda, tabella inglese con orari
// su due righe, elenco personale, foto storta e sgranata (Tesseract.js da vendor/tesseract). Fogli in tests/schedule/ (gen.py).
// Uso: node tests/schedule-import.js   (serve il server su 8765). Foto in $OUT.
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});
const F=f=>path.join(__dirname,'schedule',f);
// la verità dei fogli di prova (come in gen.py)
const PEOPLE=['Bianchi Laura','Rossi Marco','Esposito Anna','Ferrari Luca','Romano Giulia','Colombo Paolo'],CYCLE=['M','M','P','P','N','N','R','R'];
const codes=(i,n)=>Array.from({length:n},(_,d)=>i===1&&d>=9&&d<=13?'F':CYCLE[(d+i*2)%8]);
const LEG={M:['07:00',7],P:['14:00',7],N:['21:00',10]};
const same=(e,c)=>c==='R'?e.k==='r':c==='F'?e.k==='f':e.k==='w'&&e.s===LEG[c][0]&&+e.d===LEG[c][1];
(async()=>{const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fail++;};
  async function open(o={}){const ctx=await b.newContext({viewport:{width:o.w||430,height:932},colorScheme:o.dark?'dark':'light'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
    await p.addInitScript(o=>{localStorage.setItem('myturn-tour','1');localStorage.setItem('myturn-lang',o.lang||'it');if(!localStorage.getItem('myturn-v1'))localStorage.setItem('myturn-v1',JSON.stringify({days:o.days||{},settings:{setup:1,country:'IT'}}));},o);
    await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);return p;}
  async function load(p,file){if(!await p.evaluate(()=>document.getElementById('im').open)){await p.click('#toolsBtn');await p.waitForTimeout(150);await p.click('#importBtn');await p.waitForTimeout(200);}
    await p.evaluate(()=>{const s=document.getElementById('imStatus');s.hidden=true;s.className='bpst';});
    await p.setInputFiles('#imFile',F(file));await p.waitForFunction(()=>{const s=document.getElementById('imStatus');return !s.hidden&&/\b(ok|err)\b/.test(s.className);},null,{timeout:240000});
    return p.evaluate(()=>({st:document.getElementById('imStatus').textContent,cls:document.getElementById('imStatus').className,who:[...document.querySelectorAll('#imWho option')].map(o=>o.textContent),mon:document.getElementById('imMon').value,whoHidden:document.getElementById('imWhoF').hidden}));}
  const plan=p=>p.evaluate(()=>myturnDebug.imPlan().map(o=>({k:o.k,e:o.e})));
  const pick=async(p,name)=>{await p.selectOption('#imWho',{label:name});await p.waitForTimeout(150);};

  // --- 1. PDF del reparto: 6 persone, sigle con legenda, ferie, mese dal titolo
  {const p=await open({days:{'2026-11-03':{k:'w',s:'06:00',n:'cambio con Anna',ot:0}}});const r=await load(p,'tabella-it.pdf');
    ok(/6 persone/.test(r.st)&&JSON.stringify(r.who.slice(1))===JSON.stringify(PEOPLE),'tabella: 6 persone, la legenda non è una persona → '+r.who.join(', '));
    ok(r.mon==='2026-11'&&r.who[0]==='Scegli…'&&await p.isDisabled('#imGo'),'mese dal titolo, prima si sceglie la persona');
    await pick(p,'Rossi Marco');
    const map=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#imCodes select')].map(s=>[s.dataset.code,s.value])));
    ok(map.M==='t'&&map.P==='t'&&map.N==='t'&&map.R==='r'&&map.F==='f','sigle: orari della legenda, R riposo, F ferie → '+JSON.stringify(map));
    const pl=await plan(p),truth=codes(1,30);
    ok(pl.length===30&&pl.every((o,i)=>o.k==='2026-11-'+String(i+1).padStart(2,'0')&&same(o.e,truth[i])),'30 giorni tutti giusti');
    await p.screenshot({path:path.join(OUT,'import_tabella.png')});
    ok(/Importa 30 giorni/.test(await p.textContent('#imGo')),'pulsante: Importa 30 giorni');
    await p.click('#imGo');await p.waitForTimeout(400);
    const st=await p.evaluate(()=>({d:myturnDebug.S.days,imp:myturnDebug.S.settings.imp}));
    ok(st.d['2026-11-01'].s==='14:00'&&st.d['2026-11-01'].d===7&&st.d['2026-11-10'].k==='f'&&st.d['2026-11-05'].k==='r'&&st.d['2026-11-07'].s==='07:00','giorni importati nel calendario');
    ok(st.d['2026-11-03'].s==='21:00'&&st.d['2026-11-03'].n==='cambio con Anna','giorno già compilato sostituito, nota tenuta');
    ok(st.imp.who==='Rossi Marco'&&st.imp.map.M==='t','persona e sigle ricordate');
    ok(/Importati 30 giorni/.test(await p.textContent('#toast')),'messaggio con Annulla');
    await p.click('#toastUndo');await p.waitForTimeout(300);
    ok(await p.evaluate(()=>myturnDebug.S.days['2026-11-03'].s==='06:00'&&!myturnDebug.S.days['2026-11-01']),'Annulla rimette com\'era');
    // di nuovo: persona già scelta; "non sostituire" lascia il giorno com'è
    const r2=await load(p,'tabella-it.pdf');ok(await p.inputValue('#imWho')!==''&&(await p.$eval('#imWho',s=>s.selectedOptions[0].textContent))==='Rossi Marco','la seconda volta la persona è già scelta');
    await p.uncheck('#imOver');await p.waitForTimeout(150);ok(/Importa 29 giorni/.test(await p.textContent('#imGo')),'senza sostituire: 29 giorni');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}

  // --- 2. rota inglese: date gg/mm nell'intestazione, orari su due righe, OFF e HOL
  {const p=await open();const r=await load(p,'orari-en.pdf');ok(r.who.length===4,'rota: 3 persone');await pick(p,'Patel, Priya');
    const pl=await plan(p),m=Object.fromEntries(pl.map(o=>[o.k,o.e]));
    ok(pl.length===14&&m['2026-11-30'].k==='r'&&m['2026-12-02'].s==='23:00'&&m['2026-12-02'].d===8&&m['2026-12-09'].s==='07:00','due settimane a cavallo del mese, orari su due righe, OFF = riposo');
    await pick(p,'Garcia, Ana');const g=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#imCodes select')].map(s=>[s.dataset.code,s.value])));
    ok(g.HOL==='x'||g.HOL==='f','sigla sconosciuta (HOL): da scegliere → '+g.HOL);
    const pa=await plan(p);ok(pa.find(o=>o.k==='2026-11-30').e.s==='09:00'&&pa.find(o=>o.k==='2026-11-30').e.d===8.5,'09:00–17:30 = 8,5 ore');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}

  // --- 3. elenco personale
  {const p=await open();const r=await load(p,'elenco-it.pdf');ok(/12 giorni/.test(r.st)&&r.whoHidden,'elenco: 12 giorni, nessuna persona da scegliere');
    const pl=await plan(p),m=Object.fromEntries(pl.map(o=>[o.k,o.e]));
    ok(m['2026-12-01'].s==='06:00'&&m['2026-12-07'].s==='22:00'&&m['2026-12-05'].k==='r'&&m['2026-12-11'].k==='f','orari, riposo e ferie');
    ok(m['2026-12-10'].s==='08:30'&&m['2026-12-10'].d===4&&m['2026-12-10'].s2==='14:00'&&m['2026-12-10'].d2===4,'turno spezzato 08:30–12:30 e 14:00–18:00');
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}

  // --- 4. foto storta e sgranata: Tesseract.js dal sito
  {const p=await open();const t0=Date.now();const r=await load(p,'foto-tabella.jpg');const sec=(Date.now()-t0)/1000;
    ok(/5 persone/.test(r.st)&&JSON.stringify(r.who.slice(1))===JSON.stringify(PEOPLE.slice(0,5)),'foto: 5 persone in '+sec.toFixed(1)+' s → '+r.who.join(', '));
    let tot=0,good=0;const per=[];
    for(let i=0;i<5;i++){await pick(p,PEOPLE[i]);const pl=await plan(p),truth=codes(i,30),m=Object.fromEntries(pl.map(o=>[o.k,o.e]));let g=0;
      truth.forEach((c,d)=>{const e=m['2026-11-'+String(d+1).padStart(2,'0')];if(e&&same(e,c))g++;});per.push(PEOPLE[i].split(' ')[0]+' '+g+'/30');tot+=30;good+=g;}
    ok(good/tot>=.9,'caselle lette giuste: '+good+'/'+tot+' ('+per.join(', ')+')');
    const leg=await p.evaluate(()=>[...document.querySelectorAll('#imCodes option[value="t"]')].map(o=>o.textContent));ok(leg.length>=3&&leg.includes('07:00–14:00'),'legenda letta dalla foto: '+leg.join(' | '));
    await p.screenshot({path:path.join(OUT,'import_foto.png')});
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}

  // --- 5. file senza turni e foto a 320 px / scuro
  {const p=await open({w:320,dark:true});const r=await load(p,'../payslip/'+fs.readdirSync(path.join(__dirname,'payslip')).find(f=>f.endsWith('.pdf')));
    ok(/err/.test(r.cls)&&/Non ho trovato turni/.test(r.st),'una busta paga non è un foglio dei turni: '+r.st);
    const r2=await load(p,'tabella-it.pdf');await pick(p,'Bianchi Laura');
    const over=await p.evaluate(()=>{const s=document.querySelector('#im .sheet').getBoundingClientRect();return[...document.querySelectorAll('#im .sheet *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&(b.right>s.right+1||b.left<s.left-1);}).map(e=>e.id||e.className||e.tagName).slice(0,5);});
    ok(!over.length,'320 px: niente esce dal pannello '+over.join(','));await p.screenshot({path:path.join(OUT,'import_320_dark.png')});
    ok(!p.errs.length,'nessun errore '+p.errs.join('|'));await p.context().close();}
  console.log(fail?fail+' FALLITI':'tutto ok');await b.close();process.exit(fail?1:0);})();
