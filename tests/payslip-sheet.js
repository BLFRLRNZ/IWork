const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'iwork-tests');fs.mkdirSync(OUT,{recursive:true});

(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text().slice(0,200))});
await p.addInitScript(()=>{localStorage.setItem('iwork-lang','it');const d={};
 for(let i=1;i<=31;i++){const k='2026-10-'+String(i).padStart(2,'0');const dow=new Date(2026,9,i).getDay();if(dow>=1&&dow<=5)d[k]={k:'w',s:i%3?'06:00':'22:00'};}
 d['2026-10-05']={k:'w',s:'06:00',ot:2};d['2026-10-12']={k:'w',s:'06:00',ot:4};d['2026-10-19']={k:'f'};d['2026-10-20']={k:'f'};d['2026-10-21']={k:'p',h:4};d['2026-10-04']={k:'w',s:'06:00'};
 localStorage.setItem('cartellino-turni-v1',JSON.stringify({days:d,settings:{setup:1,country:'IT',rate:11.56,pOt:25,pNight:20,ferie:26,perm:32}}));});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{const u=document.getElementById('upBar');if(u)u.remove();});
await p.click('#toolsBtn');await p.waitForTimeout(200);await p.click('#bpBtn');await p.waitForTimeout(300);
const B=path.join(__dirname,'payslip')+'/';
for(const f of ['busta_a.pdf','busta_b.pdf','busta_scan.pdf','busta_pw.pdf']){
  await p.setInputFiles('#bpFile',B+f);await p.waitForFunction(()=>!/Leggo/.test(document.getElementById('bpStatus').textContent),null,{timeout:20000});await p.waitForTimeout(200);
  console.log('==',f,'|',(await p.textContent('#bpStatus')).trim());
  if(f==='busta_pw.pdf'){await p.fill('#bpPw','SBAGLIATA');await p.click('#bpPwGo');await p.waitForTimeout(800);console.log('  wrong:',await p.textContent('#bpStatus'));
    await p.fill('#bpPw','RSSMRA80A01F205X');await p.click('#bpPwGo');await p.waitForFunction(()=>!/Leggo/.test(document.getElementById('bpStatus').textContent));await p.waitForTimeout(200);console.log('  right:',(await p.textContent('#bpStatus')).trim());}
  console.log('  stored',JSON.stringify(await p.evaluate(()=>JSON.parse(localStorage.getItem('cartellino-turni-v1')).bp)));
  if(f==='busta_a.pdf'){await p.screenshot({path:path.join(OUT,'bp_a.png'),fullPage:true});console.log('  cmp:',(await p.textContent('#bpCmp')).replace(/\s+/g,' '));}
  if(f!=='busta_scan.pdf')await p.evaluate(()=>{});
}
await p.keyboard.press('Escape');await p.waitForTimeout(200);
// view October
await p.evaluate(()=>{});await p.click('#prev');await p.waitForTimeout(300);
console.log('card:',(await p.textContent('#bpCard')).replace(/\s+/g,' '));await p.evaluate(()=>document.getElementById('bpCard').scrollIntoView());await p.screenshot({path:path.join(OUT,'bp_card.png')});
console.log('errors',errs);await b.close()})();
