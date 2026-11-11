// Accesso con email e password dalla schermata iniziale, con un Supabase finto (accesso + sincronizzazione).
// Telefono A: crea l'account al primo avvio, finisce la configurazione e segna dei turni.
// Telefono B: al primo avvio accede con la stessa email e password e ritrova tutto, senza rifare la configurazione.
// Poi: password sbagliata, password dimenticata (codice + nuova password) e A che se ne accorge.
const {chromium}=require('playwright');const crypto=require('crypto');const path=require('path'),os=require('os'),fs=require('fs');
const OUT=process.env.OUT||path.join(os.tmpdir(),'myturn-tests');fs.mkdirSync(OUT,{recursive:true});
const SECRET=(em,pw)=>crypto.pbkdf2Sync(pw,'myturn-login|'+em,600000,32,'sha256').toString('hex');
const EM='mario@esempio.it',UID='u-mario';
const U={},DB={meta:null,items:new Map(),seq:0};const log=[];
async function fake(r){const u=new URL(r.request().url()),m=r.request().method(),b=r.request().postData(),q=b?JSON.parse(b):{};
  const J=(o,st=200)=>r.fulfill({status:st,contentType:'application/json',body:JSON.stringify(o)});
  const sess=em=>({access_token:'tok-'+em,refresh_token:'R',expires_in:3600,user:{id:UID,email:em}});log.push(m+' '+u.pathname);
  if(u.pathname==='/auth/v1/signup'){if(!U[q.email])U[q.email]={secret:q.password,confirmed:false};return J({id:UID,email:q.email});}
  if(u.pathname==='/auth/v1/verify'){const x=U[q.email];if(q.token!=='123456'||!x)return J({error_code:'otp_expired',msg:'Token has expired or is invalid'},403);x.confirmed=true;return J(sess(q.email));}
  if(u.pathname==='/auth/v1/resend')return J({});
  if(u.pathname==='/auth/v1/token'){const x=U[q.email];if(!x||x.secret!==q.password)return J({code:400,error_code:'invalid_credentials',msg:'Invalid login credentials'},400);
    if(!x.confirmed)return J({code:400,error_code:'email_not_confirmed',msg:'Email not confirmed'},400);return J(sess(q.email));}
  if(u.pathname==='/auth/v1/otp'){return U[q.email]?J({}):J({error_code:'otp_disabled',msg:'Signups not allowed for otp'},422);}
  if(u.pathname==='/auth/v1/user'&&m==='PUT'){U[EM].secret=q.password;return J({id:UID,email:EM});}
  if(u.pathname==='/rest/v1/sync_meta'){if(m==='GET')return J(DB.meta?[DB.meta]:[]);if(m==='POST'){DB.meta=q;return r.fulfill({status:201,body:''});}DB.meta=null;return r.fulfill({status:204,body:''});}
  if(u.pathname==='/rest/v1/sync_items'){if(m==='GET'){const gt=+(u.searchParams.get('seq')||'gt.0').slice(3);return J([...DB.items.values()].filter(x=>x.seq>gt).sort((a,b)=>a.seq-b.seq).slice(0,500));}
    if(m==='POST'){for(const x of q)DB.items.set(x.k,{k:x.k,iv:x.iv,data:x.data,seq:++DB.seq});return r.fulfill({status:201,body:''});}DB.items.clear();return r.fulfill({status:204,body:''});}
  return J(null);}
async function fresh(b,name){const ctx=await b.newContext({viewport:{width:430,height:932},locale:'it-IT'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(name+': '+e.message));
  await p.route('https://test.supabase.co/**',fake);await p.addInitScript(()=>{window.__MYTURN_SUPA={url:'https://test.supabase.co',key:'anon',vapid:'x'};});
  await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);return p;}
const go=p=>p.click('#obAuth [data-a=go]');const st=p=>p.textContent('#obAuth .austat');
(async()=>{const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)fail++;};
  // --- A: crea l'account al primo avvio
  const A=await fresh(b,'A');await A.click('#obNext');await A.waitForTimeout(250);
  ok(/account/i.test(await A.textContent('#obTitle')),'A: dopo la lingua chiede dell\'account → '+await A.textContent('#obTitle'));
  ok(/Continua senza account/.test(await A.textContent('#obNext')),'A: si può continuare senza account');
  await A.screenshot({path:path.join(OUT,'ob_account.png')});
  await A.click('#obAuth [data-a=signup]');await A.waitForTimeout(150);
  await A.fill('#obAuthEmail',EM);await A.fill('#obAuthPw','corta');await A.fill('#obAuthPw2','corta');await go(A);await A.waitForTimeout(150);ok(/almeno 8/.test(await st(A)),'A: password troppo corta');
  await A.fill('#obAuthPw','password-giusta');await A.fill('#obAuthPw2','password-diversa');await go(A);await A.waitForTimeout(150);ok(/non coincidono/.test(await st(A)),'A: password diverse');
  await A.fill('#obAuthPw2','password-giusta');await go(A);await A.waitForTimeout(2500);
  ok(await A.isVisible('#obAuthCode'),'A: chiede il codice ricevuto via email');await A.screenshot({path:path.join(OUT,'ob_code.png')});
  await A.fill('#obAuthCode','111111');await go(A);await A.waitForTimeout(400);ok(/sbagliato/.test(await st(A)),'A: codice sbagliato');
  await A.fill('#obAuthCode','123456');await go(A);await A.waitForTimeout(5000);
  ok(/Dove lavori/.test(await A.textContent('#obTitle')),'A: account creato, prosegue con il paese');
  ok(!!DB.meta,'server: sincronizzazione già accesa per il nuovo account');
  for(let i=0;i<6;i++){if(!(await A.$('#ob[open]')))break;await A.click('#obNext');await A.waitForTimeout(250);}
  await A.waitForTimeout(700);ok(!!(await A.$('#tour')),'A: per un nuovo utente parte il tour');await A.keyboard.press('Escape');await A.waitForTimeout(200);
  await A.evaluate(()=>{const d=new Date(),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');myturnDebug.apply([[k,{k:'w',s:'07:30',n:'turno di A'}]],'x');myturnDebug.S.settings.wd=7;myturnDebug.mark();});
  await A.waitForTimeout(5500);await A.evaluate(()=>myturnDebug.syRun());await A.waitForTimeout(400);
  ok(DB.items.size>=2,'server: '+DB.items.size+' elementi cifrati di A');
  // --- B: accede al primo avvio e ritrova tutto
  const B=await fresh(b,'B');await B.click('#obNext');await B.waitForTimeout(250);
  await B.fill('#obAuthEmail',EM);await B.fill('#obAuthPw','password-sbagliata');await go(B);await B.waitForTimeout(2500);ok(/sbagliate/.test(await st(B)),'B: password sbagliata');
  await B.fill('#obAuthPw','password-giusta');await go(B);await B.waitForTimeout(6000);
  ok(!(await B.$('#ob[open]')),'B: dopo l\'accesso la configurazione si chiude da sola');
  const dB=await B.evaluate(()=>({days:Object.values(myturnDebug.S.days).map(e=>e.n||''),wd:myturnDebug.S.settings.wd,setup:myturnDebug.S.settings.setup}));
  ok(dB.days.includes('turno di A')&&dB.wd===7&&dB.setup===1,'B: ritrova turni e impostazioni di A '+JSON.stringify(dB));
  ok(!(await B.$('#tour')),'B: niente tour per chi rientra');
  await B.screenshot({path:path.join(OUT,'ob_restored.png')});
  // --- B: password dimenticata
  await B.click('#setBtn');await B.waitForTimeout(150);await B.click('#acBtn');await B.waitForTimeout(200);
  ok(await B.isVisible('#acWho'),'B: risulta collegato');await B.click('#acLogout');await B.waitForTimeout(500);await B.click('#acClose');await B.waitForTimeout(150);
  await B.click('#setBtn');await B.waitForTimeout(150);await B.click('#acBtn');await B.waitForTimeout(200);
  await B.click('#acAuth [data-a=forgot]');await B.fill('#acAuthEmail',EM);await B.click('#acAuth [data-a=go]');await B.waitForTimeout(400);
  ok(await B.isVisible('#acAuthCode')&&await B.isVisible('#acAuthPw2'),'B: codice e nuova password');await B.screenshot({path:path.join(OUT,'ac_forgot.png')});
  await B.fill('#acAuthCode','123456');await B.fill('#acAuthPw','nuova-password-2');await B.fill('#acAuthPw2','nuova-password-2');await B.click('#acAuth [data-a=go]');await B.waitForTimeout(6000);
  ok(/sincronizzati/.test(await B.textContent('#acStatus')),'B: nuova password e dati ricreati → '+await B.textContent('#acStatus'));
  ok(U[EM].secret===SECRET(EM,'nuova-password-2'),'server: la password nuova arriva solo come chiave ricavata');
  const dump=JSON.stringify([...DB.items.values()])+JSON.stringify(DB.meta)+JSON.stringify(U);
  ok(!/turno di A|07:30|password-giusta|nuova-password/.test(dump),'server: niente in chiaro, nemmeno le password');
  await A.evaluate(()=>myturnDebug.syRun());await A.waitForTimeout(500);await A.click('#setBtn');await A.waitForTimeout(200);
  ok(/riattivare/.test(await A.textContent('#syLine')),'A: si accorge che la password è cambiata');
  await A.click('#syBtn');await A.waitForTimeout(200);await A.fill('#syPw','nuova-password-2');await A.click('#syGo');await A.waitForTimeout(6000);
  ok(/attiva/.test(await A.textContent('#syStatus')),'A: riattivata con la password nuova → '+await A.textContent('#syStatus'));
  console.log('errori pagina',A.errs.concat(B.errs));console.log(fail?fail+' FALLITI':'tutto ok');await b.close();process.exit(fail?1:0);})();
