const fs=require('fs');const {chromium}=require('playwright');
const html=fs.readFileSync(require('path').resolve(__dirname,'../../index.html'),'utf8');
const js=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
const keys=new Map();const add=(k,src)=>{if(!k||!/[A-Za-zÀ-ÿ]/.test(k))return;if(!keys.has(k))keys.set(k,src);};
// parse string literal at i (double or single quote)
function lit(s,i){const q=s[i];let j=i+1,out="";while(j<s.length&&s[j]!==q){if(s[j]==="\\"){out+=s[j+1];j+=2;continue;}out+=s[j];j++;}return [out,j+1];}
// find calls t( and tn(
const re=/(^|[^\w.$])(tn?)\(/g;let m;
while((m=re.exec(js))){const fn=m[2];let i=m.index+m[0].length,depth=1,arg=0,str=[];
  while(i<js.length&&depth>0){const c=js[i];
    if(c==='"'||c==="'"){const [v,j]=lit(js,i);if(depth===1)str.push([arg,v]);i=j;continue;}
    if(c==='`'){i=js.indexOf('`',i+1)+1;continue;}
    if(c==='('||c==='['||c==='{')depth++;else if(c===')'||c===']'||c==='}')depth--;else if(c===','&&depth===1)arg++;
    i++;}
  str.forEach(([a,v])=>{if(fn==='t'&&a===0)add(v,'js');if(fn==='tn'&&(a===1||a===2))add(v,'js');});}
// values passed through variables
["Riposo","Ferie","Permesso","Malattia","Perm.","Mal.","Mattina","Pomeriggio","Notte","Turno","Capodanno","Epifania","Liberazione","Festa del Lavoro","Festa della Repubblica","Ferragosto","Ognissanti","Immacolata","Natale","Santo Stefano","San Francesco","Pasqua","Lunedì dell'Angelo"].forEach(k=>add(k,'var'));
(async()=>{const b=await chromium.launch();const p=await b.newPage();
  const stat=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,"text/html");d.querySelectorAll("script,style").forEach(x=>x.remove());const out=[];
    const w=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const k=n.nodeValue.trim().replace(/\s+/g," ");if(k)out.push(k);}
    d.querySelectorAll("[placeholder],[aria-label],[title],[alt]").forEach(el=>["placeholder","aria-label","title","alt"].forEach(a=>{if(el.hasAttribute(a))out.push(el.getAttribute(a));}));return out;},html);
  stat.forEach(k=>add(k,'html'));await b.close();
  const arr=[...keys.keys()];fs.writeFileSync(require('path').join(__dirname,'keys.json'),JSON.stringify(arr,null,1));console.log(arr.length,'keys');})();
