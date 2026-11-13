// Festività degli stati di Stati Uniti e Brasile e di Terranova e Labrador (Canada):
// le date calcolate dall'app, recuperi compresi, devono essere quelle della libreria "holidays" dal 2024 al 2045.
// Le date attese sono in tests/holidays/expected_XX.json (le crea tools/countries/states_gen.py).
// Uso: node tests/holidays-states.js   (serve il server su 8765)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let fail=0,checked=0;
  await p.addInitScript(()=>{localStorage.setItem('myturn-tour','1');localStorage.setItem('myturn-v1',JSON.stringify({days:{},settings:{setup:1,country:'US'}}));});
  await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(600);
  for(const C of ['US','BR','CA']){
    const exp=JSON.parse(fs.readFileSync(path.join(__dirname,'holidays','expected_'+C+'.json'),'utf8'));
    const res=await p.evaluate(([C,exp])=>{const out={};const S=myturnDebug.S;
      for(const sub of Object.keys(exp)){S.settings.country=C;S.settings.region=sub;const got=[];
        for(let y=2024;y<=2045;y++)Object.keys(myturnDebug.holidays(y)).forEach(k=>got.push(k));
        const want=exp[sub].split(',');const g=new Set(got),w=new Set(want);
        out[sub]={miss:want.filter(x=>!g.has(x)).slice(0,6),extra:got.filter(x=>!w.has(x)).slice(0,6),n:want.length};}
      return out;},[C,exp]);
    for(const [sub,r] of Object.entries(res)){checked++;
      if(r.miss.length||r.extra.length){fail++;console.log('FAIL',C,sub,'mancano',r.miss.join(' '),'| in più',r.extra.join(' '));}}
    const names=await p.evaluate(C=>Object.keys(window.MYTURN_COUNTRIES[C].reg||{}).length,C);
    console.log(C,Object.keys(exp).length,'suddivisioni controllate,',names,'nel profilo');}
  console.log(fail?fail+' FALLITI':'tutto ok ('+checked+' suddivisioni, 2024–2045)');await b.close();process.exit(fail?1:0);})();
