const {chromium}=require('playwright');const path=require('path'),os=require('os'),fs=require('fs');const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.join(os.tmpdir(),'iwork-tests');fs.mkdirSync(OUT,{recursive:true});

const CASES=[["busta_a.pdf","IT","it",{ot:14,night:22,fest:8,ferie:2,perm:4,ferieRes:4.67,permRes:22,gross:2293.46,net:1669},"2026-10"],
["busta_b.pdf","IT","it",{ot:9.5,night:18,fest:12,ferie:2,perm:3,ferieRes:12.5,permRes:18,gross:2008.9,net:1523},"2026-10"],
["busta_c.pdf","IT","it",{ot:9.5,night:31,fest:16,ferie:3,perm:6,ferieRes:9.17,permRes:14.67,gross:1909.63,net:1411},"2026-09"],
["busta_d.pdf","ES","es",{ot:5,night:20,fest:8,gross:1649,net:1412.27},"2026-10"],
["us.pdf","US","en",{ot:6.5,night:24,fest:8,ferie:2,ferieRes:8,gross:2697.38,net:2051.12},"2026-10"],
["uk.pdf","GB","en",{ot:9,night:40,fest:0,ferie:3,ferieRes:16,gross:2528.75,net:2007.43},"2026-10"],
["de.pdf","DE","de",{ot:12,night:35.5,fest:24,ferie:3,ferieRes:19,gross:3974.41,net:2561.2},"2026-10"],
["fr.pdf","FR","fr",{ot:10,night:21,fest:7,ferie:2,ferieRes:35.5,gross:2499.41,net:1874.19},"2026-10"],
["nl.pdf","NL","nl",{ot:6,night:10,fest:8,ferie:2,ferieRes:9.5,gross:2794.67,net:2211.4},"2026-10"],
["se.pdf","SE","sv",{ot:5,night:12,fest:8,ferie:3,ferieRes:22,gross:34512,net:25412},"2026-10"],
["pl.pdf","PL","pl",{ot:6,night:20,ferie:2,ferieRes:18,gross:5996,net:4343.64},"2026-10"],
["br.pdf","BR","pt-BR",{ot:10,night:30,gross:3327.28,net:2814.88},"2026-10"],
["au.pdf","AU","en",{ot:4,night:15.2,fest:7.6,ferie:0.95,ferieRes:15.06,gross:2918.32,net:2301.5},"2026-10"],
["at.pdf","AT","de",{ot:10,gross:6134.7,net:4010.55},"2026-10",true]];
(async()=>{const b=await chromium.launch();let fail=0;
for(const [f,C,L,exp,ym,extra] of CASES){const p=await b.newPage();
 await p.addInitScript(([C,L])=>{localStorage.setItem('iwork-lang',L);localStorage.setItem('cartellino-turni-v1',JSON.stringify({days:{},settings:{setup:1,country:C}}));},[C,L]);
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(300);
 fs.copyFileSync(path.join(__dirname,'payslip')+'/'+f,ROOT+'/_t.pdf');
 const P=await p.evaluate(async()=>{const buf=await (await fetch('_t.pdf?'+Math.random())).arrayBuffer();const r=await iworkDebug.bpLines(buf);return iworkDebug.bpParse(r);});
 const bad=[];for(const k in exp)if(Math.abs((P.R[k]??NaN)-exp[k])>0.011)bad.push(k+": got "+P.R[k]+" want "+exp[k]);
 for(const k in P.R)if(!(k in exp))bad.push("extra "+k+"="+P.R[k]);
 if(P.ym!==ym)bad.push("ym "+P.ym);if(!!extra!==P.extra)bad.push("extra flag "+P.extra);
 console.log((bad.length?"FAIL ":"ok   ")+f.padEnd(14)+(bad.length?bad.join("; "):""));if(bad.length)fail++;await p.close();}
fs.unlinkSync(ROOT+'/_t.pdf');console.log(fail?fail+" failing":"all ok");await b.close()})();
