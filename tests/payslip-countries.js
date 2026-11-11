const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'iwork-tests');fs.mkdirSync(OUT,{recursive:true});

const EXP=JSON.parse(fs.readFileSync(path.join(__dirname,'payslip','expected.json')));
const CC={mx:["MX","es"],ar:["AR","es"],pt:["PT","pt"],be:["BE","fr"],ch:["CH","de"],dk:["DK","da"],no:["NO","en"],fi:["FI","fi"],is:["IS","en"],cz:["CZ","cs"],sk:["SK","sk"],hu:["HU","hu"],lt:["LT","lt"],lv:["LV","lv"],ee:["EE","et"],ro:["RO","ro"],bg:["BG","bg"],hr:["HR","hr"],si:["SI","sl"],gr:["GR","el"],nz:["NZ","en"],ca:["CA","en"]};
(async()=>{const b=await chromium.launch();let fail=0;
for(const k in EXP){const [C,L]=CC[k],exp=EXP[k];const p=await b.newPage();
 await p.addInitScript(([C,L])=>{localStorage.setItem('iwork-lang',L);localStorage.setItem('cartellino-turni-v1',JSON.stringify({days:{},settings:{setup:1,country:C}}));},[C,L]);
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(300);
 fs.copyFileSync(path.join(__dirname,'payslip')+'/'+k+'.pdf',ROOT+'/_t.pdf');
 const P=await p.evaluate(async()=>{const buf=await (await fetch('_t.pdf?'+Math.random())).arrayBuffer();const r=await iworkDebug.bpLines(buf);return iworkDebug.bpParse(r);});
 const bad=[];for(const f in exp)if(Math.abs((P.R[f]??NaN)-exp[f])>0.011)bad.push(f+": got "+P.R[f]+" want "+exp[f]);
 for(const f in P.R)if(!(f in exp))bad.push("extra "+f+"="+P.R[f]);
 if(P.ym!=="2026-10")bad.push("ym "+P.ym);
 console.log((bad.length?"FAIL ":"ok   ")+k.padEnd(4)+(bad.length?bad.join("; "):""));if(bad.length)fail++;await p.close();}
fs.unlinkSync(ROOT+'/_t.pdf');console.log(fail?fail+" failing":"all ok");await b.close()})();
