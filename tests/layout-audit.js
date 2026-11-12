// Controllo della disposizione: apre ogni schermata e pannello e cerca elementi sovrapposti,
// elementi attaccati senza spazio e testo che esce. Salva una foto di ogni pannello in $OUT/layout.
// Uso: node tests/layout-audit.js [larghezza] [lingua]   (serve il server su 8765)
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=path.join(process.env.OUT||path.join(os.tmpdir(),'myturn-tests'),'layout');fs.mkdirSync(OUT,{recursive:true});
const W=+(process.argv[2]||430),LANG=process.argv[3]||'it',H=+(process.env.H||2400),SHOTS=!process.env.NOSHOTS;
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const AUDIT=()=>{const root=[...document.querySelectorAll('dialog[open]')].pop()||document.body,out=[];
  const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;for(let x=e;x;x=x.parentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;if(x===root)break;}return true;};
  const ATOM='input:not([type=hidden]),select,textarea,button,summary,h2,h3,p,label,dt,dd,small,.eyebrow,.chip,.opt,img,canvas,svg.logo';
  const own=e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
  let els=[...root.querySelectorAll('*')].filter(e=>vis(e)&&(e.matches(ATOM)||own(e)));
  els=els.filter(e=>!els.some(o=>o!==e&&o.contains(e)&&o.matches('button,summary,.opt,.chip,label,p,small,dd,dt,h2,h3')));
  const name=e=>(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''))+' «'+(e.innerText||e.value||e.placeholder||'').trim().slice(0,28)+'»';
  const R=els.map(e=>e.getBoundingClientRect());
  /* le etichette che contengono un campo (label > input) non contano come sovrapposizione */
  for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=R[i],b=R[j];
    const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
    if(w>2&&h>2&&!els[i].contains(els[j])&&!els[j].contains(els[i]))out.push('SOVRAPPOSTI '+name(els[i])+' ↔ '+name(els[j])+' ('+Math.round(w)+'×'+Math.round(h)+')');}
  /* attaccati: un elemento subito sotto un altro (colonne che si toccano) con meno di 4px */
  for(let i=0;i<els.length;i++){let best=null,bg=1e9;const a=R[i];
    for(let j=0;j<els.length;j++){if(i===j)continue;const b=R[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)<20)continue;const g=b.top-a.bottom;if(g>=-1&&g<bg){bg=g;best=j;}}
    if(best!=null&&bg<4&&!els[i].contains(els[best])&&!els[best].contains(els[i])){const bb=els[best];
      const both=[els[i],bb];if(both.every(e=>e.matches('.opt,.chip,li,dd,dt')))continue;
      out.push('ATTACCATI '+name(els[i])+' sopra '+name(bb)+' (spazio '+Math.round(bg)+'px)');}}
  /* testo che esce dal suo riquadro o dallo schermo */
  els.forEach((e,i)=>{if(e.matches('input,select,textarea,svg,img,canvas'))return;if(e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='auto'&&e.clientWidth>0)out.push('ESCE '+name(e));
    if(R[i].right>innerWidth+1||R[i].left<-1)out.push('FUORI SCHERMO '+name(e));});
  return[...new Set(out)];};
(async()=>{const b=await chromium.launch();const report=[];let shot=0;
  async function page(state,opts={}){const ctx=await b.newContext({viewport:{width:W,height:opts.h||H},deviceScaleFactor:1,locale:LANG.includes('-')?LANG:LANG+'-'+(LANG==='en'?'GB':LANG.toUpperCase())});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
    await p.route('https://test.supabase.co/**',r=>{const u=new URL(r.request().url());
      if(u.pathname==='/rest/v1/sync_meta')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(opts.meta?[{salt:'c2FsdA==',check_iv:'x',check_data:'y'}]:[])});
      return r.fulfill({status:200,contentType:'application/json',body:'[]'});});
    await p.addInitScript(([state,LANG,opts])=>{window.__MYTURN_SUPA={url:'https://test.supabase.co',key:'anon',vapid:'x'};localStorage.setItem('myturn-lang',LANG);
      if(state){localStorage.setItem('myturn-tour','1');localStorage.setItem('myturn-v1',JSON.stringify(state));}
      if(opts.auth)localStorage.setItem('myturn-auth',JSON.stringify({access_token:'A',refresh_token:'R',expires_at:Date.now()/1000+86400,user:{id:'u1',email:'maria.rossi@esempio.it'}}));
      if(opts.sync)localStorage.setItem('myturn-sync',JSON.stringify({uid:'u1',salt:'c2FsdA==',ek:btoa('a'.repeat(32)),hk:btoa('b'.repeat(32)),cur:0,last:Date.now()}));},[state,LANG,opts]);
    await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);return p;}
  async function check(p,label){await p.waitForTimeout(250);await p.evaluate(()=>document.querySelectorAll('dialog[open] details').forEach(d=>d.open=true));await p.waitForTimeout(80);
    const r=await p.evaluate(AUDIT);report.push(['== '+label,...r.map(x=>'   '+x),...p.errs.map(x=>'   ERRORE '+x)]);p.errs.length=0;
    if(SHOTS){const f=String(++shot).padStart(2,'0')+'-'+label.replace(/[^a-z0-9]+/gi,'_')+'.png';const dl=await p.$('dialog[open] .sheet');
      if(dl)await dl.screenshot({path:path.join(OUT,f)}).catch(()=>p.screenshot({path:path.join(OUT,f)}));else await p.screenshot({path:path.join(OUT,f),clip:{x:0,y:0,width:W,height:Math.min(H,1400)}});}}
  const days={};for(let i=-12;i<20;i++){const k=day(i);days[k]=i%7===5?{k:'r'}:i%7===6?{k:'f'}:i===3?{k:'w',s:'08:00',s2:'16:00',d:4,d2:4,n:'Nota lunga: cambio reparto e riunione alle 15',l:['la']}:i===4?{k:'p',h:3}:i===8?{k:'m'}:{k:'w',s:i%2?'06:00':'14:00',ot:i===2?1.5:0};}
  const S0={days,settings:{setup:1,country:'IT',region:'',labels:[{id:'la',n:'Reparto Accettazione'},{id:'lb',n:'Pressa 3'}],ocOn:1,j2:{on:1,n:'Bar Centrale',wd:4,rate:9},pay:{rate:12.5,on:1},bank:{on:1,week:40,from:day(-30)},leave:{ferie:26,perm:104}},oc:{[day(1)]:{s:'20:00',d:12,x:2}},j2:{[day(2)]:{s:'18:00',d:4}},bp:{}};
  // primo avvio
  {const p=await page(null);for(let i=0;i<8;i++){if(!(await p.$('#ob[open]')))break;await check(p,'benvenuto passo '+(i+1));if(i===1)await p.click('#obBody .opt[data-v=IT]').catch(()=>{});await p.click('#obNext');await p.waitForTimeout(250);}await p.context().close();}
  // schermate principali
  {const p=await page(S0,{auth:true});await check(p,'calendario');
    await p.click('#tabYear').catch(()=>{});await check(p,'anno');await p.click('#tabCal').catch(()=>{});
    await p.evaluate(()=>{const b=document.querySelector('#vList');if(b)b.click();});await check(p,'elenco');
    await p.evaluate(()=>{const b=document.querySelector('#vCal,#vGrid');if(b)b.click();});
    for(const [o,lab] of [[0,'giorno turno'],[3,'giorno turno spezzato con nota'],[4,'giorno permesso'],[8,'giorno malattia'],[5,'giorno riposo'],[1,'giorno con reperibilità']]){
      await p.evaluate(k=>{const c=document.querySelector('[data-k="'+k+'"]');if(c)c.click();},day(o));await check(p,'scheda '+lab);await p.keyboard.press('Escape');await p.waitForTimeout(150);}
    await p.click('#setBtn');await check(p,'impostazioni');await p.keyboard.press('Escape');await p.waitForTimeout(150);
    await p.click('#toolsBtn');await check(p,'strumenti');
    for(const id of ['cycleBtn','whBtn','lvBtn','hbBtn','pyBtn','bpBtn','presetsBtn','labelsBtn','shareBtn','pdfBtn','icsBtn','rmBtn','helpBtn']){
      await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await p.click('#toolsBtn');await p.waitForTimeout(150);
      await p.click('#'+id).catch(()=>{});await check(p,'strumento '+id);}
    await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
    await p.click('#setBtn');await p.click('#acBtn');await check(p,'account con accesso');await p.context().close();}
  {const p=await page(S0);await p.click('#setBtn');await p.click('#acBtn');await check(p,'account senza accesso');
    await p.click('#acAuth [data-a=signup]').catch(()=>{});await p.waitForTimeout(200);await check(p,'account registrazione');await p.context().close();}
  {const p=await page(S0,{auth:true});await p.click('#setBtn');await p.click('#syBtn');await p.waitForTimeout(300);await check(p,'sincronizzazione prima volta');await p.context().close();}
  {const p=await page(S0,{auth:true,meta:true});await p.click('#setBtn');await p.click('#syBtn');await p.waitForTimeout(300);await check(p,'sincronizzazione altro dispositivo');await p.context().close();}
  {const p=await page(S0,{auth:true,meta:true,sync:true});await p.click('#setBtn');await p.waitForTimeout(200);await check(p,'impostazioni con sincronizzazione');await p.click('#acBtn');await p.waitForTimeout(300);await check(p,'account con sincronizzazione');await p.context().close();}
  const txt=report.map(x=>x.join('\n')).join('\n');fs.writeFileSync(path.join(OUT,'report-'+W+'-'+LANG+'.txt'),txt);
  console.log(txt);console.log('problemi:',report.reduce((n,x)=>n+x.length-1,0));await b.close();})();
