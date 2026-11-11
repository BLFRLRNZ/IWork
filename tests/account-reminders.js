// Account e promemoria con un Supabase finto (le risposte del server sono simulate).
const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const OUT=process.env.OUT||path.join(os.tmpdir(),'iwork-tests');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[],calls=[];
const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Rome'});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.route('https://test.supabase.co/**',async r=>{const u=new URL(r.request().url()),body=r.request().postData();calls.push(u.pathname+' '+(body||'').slice(0,300));
  const J=(o,st=200)=>r.fulfill({status:st,contentType:'application/json',body:JSON.stringify(o)});
  if(u.pathname==='/auth/v1/otp')return J({});
  if(u.pathname==='/auth/v1/verify')return JSON.parse(body).token==='123456'?J({access_token:'A',refresh_token:'R',expires_in:3600,user:{id:'u1',email:'mario@esempio.it'}}):J({msg:'Token has expired or is invalid'},403);
  if(u.pathname==='/functions/v1/push-test')return J({sent:1,devices:1});
  if(u.pathname==='/functions/v1/delete-account')return J({deleted:true});
  if(u.pathname==='/auth/v1/logout')return r.fulfill({status:204,body:''});
  return J(1);});
await p.addInitScript(()=>{window.__IWORK_SUPA={url:'https://test.supabase.co',key:'anon',vapid:'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'};
  localStorage.setItem('iwork-lang','it');localStorage.setItem('iwork-tour','1');
  const d={};const t0=new Date();for(let i=0;i<10;i++){const x=new Date(t0.getFullYear(),t0.getMonth(),t0.getDate()+i);d[x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')]=i%3?{k:'w',s:'06:00'}:{k:'r'};}
  localStorage.setItem('cartellino-turni-v1',JSON.stringify({days:d,settings:{setup:1,country:'IT',ocOn:1,j2:{on:1,n:'Bar'}},oc:{},j2:{}}));
  // finto service worker e push (in prova la pagina non è https)
  const fakeSub={endpoint:'https://push.example/abc',toJSON:()=>({keys:{p256dh:'P',auth:'K'}}),unsubscribe:async()=>true};
  const reg={pushManager:{getSubscription:async()=>window.__sub||null,subscribe:async()=>(window.__sub=fakeSub)}};
  Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve(reg),getRegistration:async()=>reg,register:async()=>reg,getRegistrations:async()=>[reg]}});
  window.PushManager=function(){};window.Notification={permission:'default',requestPermission:async()=>(window.Notification.permission='granted')};});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);
// settings: account row
await p.click('#setBtn');await p.waitForTimeout(200);console.log('acSect visible',await p.isVisible('#acSect'),'|',await p.textContent('#acInfo'));
await p.click('#acBtn');await p.waitForTimeout(250);console.log('active',await p.evaluate(()=>document.activeElement.id));
await p.click('#acGo');await p.waitForTimeout(100);console.log('empty email:',await p.textContent('#acStatus'));
await p.fill('#acEmail','mario@esempio.it');await p.click('#acGo');await p.waitForTimeout(300);
console.log('code box',await p.isVisible('#acCodeBox'),'|',await p.textContent('#acCodeHelp'));
await p.screenshot({path:path.join(OUT,'ac_code.png')});
await p.fill('#acCode','111111');await p.click('#acGo');await p.waitForTimeout(300);console.log('wrong code:',await p.textContent('#acStatus'));
await p.fill('#acCode','123456');await p.click('#acGo');await p.waitForTimeout(300);console.log('ok:',await p.textContent('#acStatus'),'|',await p.textContent('#acWho'));
await p.screenshot({path:path.join(OUT,'ac_in.png')});
await p.click('#acClose');await p.waitForTimeout(200);
// reminders
await p.click('#toolsBtn');await p.waitForTimeout(200);console.log('rmBtn visible',await p.isVisible('#rmBtn'));await p.click('#rmBtn');await p.waitForTimeout(250);
console.log('need:',await p.isVisible('#rmNeed'));
await p.check('#rmOn');await p.waitForTimeout(800);console.log('status:',await p.textContent('#rmStatus'));
await p.selectOption('#rmMin','30');await p.waitForTimeout(300);
await p.click('#rmTest');await p.waitForTimeout(300);console.log('test:',await p.textContent('#rmStatus'));
await p.screenshot({path:path.join(OUT,'rm_on.png')});
const ss=calls.filter(c=>c.startsWith('/rest/v1/rpc/set_shifts'));console.log('set_shifts calls',ss.length);
// full payload from page
const items=await p.evaluate(()=>iworkDebug.remItems());console.log('items',items.length,JSON.stringify(items[0]));
await p.keyboard.press('Escape');
// edit a day -> sync after debounce
console.log('saved settings rem',await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('cartellino-turni-v1')).settings.rem)));
// logout
await p.click('#setBtn');await p.waitForTimeout(200);await p.click('#acBtn');await p.waitForTimeout(200);
await p.click('#acDelete');await p.waitForTimeout(100);console.log('arm:',await p.textContent('#acDelete'));
await p.click('#acLogout');await p.waitForTimeout(400);console.log('logout:',await p.textContent('#acStatus'),'| auth',await p.evaluate(()=>localStorage.getItem('iwork-auth')));
console.log('calls:',calls.map(c=>c.split(' ')[0]).join(', '));
console.log('errors',errs);await b.close()})();
