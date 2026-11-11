// Sincronizzazione cifrata tra due dispositivi, con un Supabase finto in memoria.
// Prova: prima attivazione, password sbagliata, unione dei dati, modifiche e cancellazioni nei due sensi,
// conflitto (vince la modifica più recente), password dimenticata, e che sul server non ci sia niente in chiaro.
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});
const URL0=process.env.URL||'http://localhost:8765/index.html';
const DB={meta:null,items:new Map(),seq:0};const UID='u1';
async function fake(r){const u=new URL(r.request().url()),m=r.request().method(),b=r.request().postData();
  const J=(o,st=200)=>r.fulfill({status:st,contentType:'application/json',body:JSON.stringify(o)});
  if(u.pathname==='/rest/v1/sync_meta'){if(m==='GET')return J(DB.meta?[DB.meta]:[]);if(m==='POST'){DB.meta=JSON.parse(b);return r.fulfill({status:201,body:''});}if(m==='DELETE'){DB.meta=null;return r.fulfill({status:204,body:''});}}
  if(u.pathname==='/rest/v1/sync_items'){
    if(m==='GET'){const gt=+(u.searchParams.get('seq')||'gt.0').slice(3),lim=+u.searchParams.get('limit')||500;
      return J([...DB.items.values()].filter(x=>x.seq>gt).sort((a,b)=>a.seq-b.seq).slice(0,lim));}
    if(m==='POST'){for(const x of JSON.parse(b)){if(x.user_id!==UID)return J({message:'rls'},403);DB.items.set(x.k,{k:x.k,iv:x.iv,data:x.data,seq:++DB.seq});}return r.fulfill({status:201,body:''});}
    if(m==='DELETE'){DB.items.clear();return r.fulfill({status:204,body:''});}}
  if(u.pathname.startsWith('/rest/v1/rpc/'))return J(null);
  return J({});}
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
async function device(b,name,days){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(name+': '+e.message));
  await p.route('https://test.supabase.co/**',fake);
  await p.addInitScript(([days,UID])=>{window.__MYTURN_SUPA={url:'https://test.supabase.co',key:'anon',vapid:'x'};
    if(!localStorage.getItem('myturn-v1')){localStorage.setItem('myturn-tour','1');localStorage.setItem('myturn-lang','it');
      localStorage.setItem('myturn-v1',JSON.stringify({days,settings:{setup:1,country:'IT'},oc:{},j2:{},bp:{}}));
      localStorage.setItem('myturn-auth',JSON.stringify({access_token:'A',refresh_token:'R',expires_at:Date.now()/1000+86400,user:{id:UID,email:'mario@esempio.it'}}));}},[days,UID]);
  await p.goto(URL0);await p.waitForTimeout(400);p.errs=errs;return p;}
const daysOf=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('myturn-v1')).days);
async function openSy(p){await p.click('#setBtn');await p.waitForTimeout(150);await p.click('#syBtn');await p.waitForTimeout(300);}
async function syncNow(p){await p.evaluate(()=>myturnDebug.syRun());await p.waitForTimeout(300);}
(async()=>{const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fail++;};
  const A=await device(b,'A',{[day(1)]:{k:'w',s:'06:00'},[day(2)]:{k:'w',s:'14:00',n:'nota segreta'}});
  const B=await device(b,'B',{[day(3)]:{k:'f'},[day(1)]:{k:'w',s:'22:00'}});
  // A: prima attivazione
  await openSy(A);ok(await A.isVisible('#syPw2Box'),'A: chiede la password due volte (prima attivazione)');
  await A.fill('#syPw','corta');await A.click('#syGo');await A.waitForTimeout(150);ok(/almeno 8/.test(await A.textContent('#syStatus')),'A: password troppo corta');
  await A.fill('#syPw','password-giusta');await A.fill('#syPw2','password-diversa');await A.click('#syGo');await A.waitForTimeout(150);ok(/non coincidono/.test(await A.textContent('#syStatus')),'A: password diverse');
  await A.fill('#syPw2','password-giusta');await A.click('#syGo');await A.waitForTimeout(4000);
  ok(/attiva/.test(await A.textContent('#syStatus')),'A: attivata → '+await A.textContent('#syStatus'));
  await A.screenshot({path:path.join(OUT,'sync_on.png')});await A.click('#syClose');await A.waitForTimeout(150);
  ok(DB.meta&&DB.items.size>=3,'server: meta e '+DB.items.size+' elementi');
  const dump=JSON.stringify([...DB.items.values()])+JSON.stringify(DB.meta);
  ok(!/nota segreta|06:00|14:00|2026-|settings|days/.test(dump),'server: nessun dato in chiaro');
  // B: password sbagliata, poi giusta
  await openSy(B);ok(!(await B.isVisible('#syPw2Box'))&&await B.isVisible('#syForgot'),'B: chiede solo la password (si unisce)');
  await B.fill('#syPw','password-sbagliata');await B.click('#syGo');await B.waitForTimeout(4000);ok(/sbagliata/.test(await B.textContent('#syStatus')),'B: password sbagliata');
  await B.fill('#syPw','password-giusta');await B.click('#syGo');await B.waitForTimeout(4500);
  let dB=await daysOf(B);
  ok(dB[day(1)]&&dB[day(1)].s==='06:00','B: nel conflitto vince il dato già sincronizzato (06:00)');
  ok(dB[day(2)]&&dB[day(2)].n==='nota segreta','B: ha ricevuto il giorno di A con la nota');
  ok(dB[day(3)]&&dB[day(3)].k==='f','B: ha tenuto il suo giorno di ferie');
  await B.click('#syClose');
  await syncNow(A);let dA=await daysOf(A);ok(dA[day(3)]&&dA[day(3)].k==='f','A: ha ricevuto le ferie di B');
  // modifica e cancellazione da B → A
  await B.evaluate(([k1,k2])=>{myturnDebug.apply([[k1,{k:'w',s:'09:30'}],[k2,null]],'x');},[day(5),day(2)]).catch(async()=>{});
  await B.waitForTimeout(5500);await syncNow(A);dA=await daysOf(A);
  ok(dA[day(5)]&&dA[day(5)].s==='09:30','A: vede il nuovo turno fatto su B');
  ok(!dA[day(2)],'A: il giorno cancellato su B sparisce anche qui');
  // conflitto: A cambia dopo B → vince A
  await B.evaluate(k=>myturnDebug.apply([[k,{k:'w',s:'07:00'}]],'x'),day(6));await B.waitForTimeout(300);
  await A.evaluate(k=>myturnDebug.apply([[k,{k:'w',s:'08:00'}]],'x'),day(6));
  await B.waitForTimeout(5000);await syncNow(A);await syncNow(B);await syncNow(A);
  dA=await daysOf(A);dB=await daysOf(B);ok(dA[day(6)].s==='08:00'&&dB[day(6)].s==='08:00','conflitto: vince la modifica più recente (08:00 su tutti e due)');
  // impostazioni: tema/promemoria locali, il resto si sincronizza
  await A.evaluate(()=>{const s=myturnDebug.S.settings;s.wd=7.5;myturnDebug.mark();});await A.waitForTimeout(5000);await syncNow(B);
  ok(await B.evaluate(()=>myturnDebug.S.settings.wd)===7.5,'B: riceve le impostazioni (durata del turno 7,5)');
  // password dimenticata su B → A deve reinserirla
  await openSy(B);await B.click('#syOff');await B.waitForTimeout(200);await B.click('#syClose');await openSy(B);await B.waitForTimeout(500);
  await B.click('#syForgot');await B.fill('#syPw','nuova-password-1');await B.fill('#syPw2','nuova-password-1');await B.click('#syGo');await B.waitForTimeout(4500);
  ok(/attiva/.test(await B.textContent('#syStatus')),'B: ricominciato con una nuova password');
  await syncNow(A);await A.click('#setBtn');await A.waitForTimeout(200);
  ok(/riattivare/.test(await A.textContent('#syLine')),'A: avvisa che la sincronizzazione va riattivata → '+await A.textContent('#syLine'));
  await A.screenshot({path:path.join(OUT,'sync_lost.png')});
  ok(Object.keys(await daysOf(A)).length>=4,'A: i dati locali restano');
  console.log('errori pagina',A.errs.concat(B.errs));console.log(fail?fail+' FALLITI':'tutto ok');await b.close();process.exit(fail?1:0);})();
