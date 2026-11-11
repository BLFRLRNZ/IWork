import json,re,sys,subprocess
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'src')
lang,name=sys.argv[1],sys.argv[2]
J=lambda code:json.loads(subprocess.check_output(['node','-e',code]))
keys=json.loads(subprocess.check_output(['node','-e','global.window={};require(process.argv[1]);console.log(JSON.stringify(Object.keys(window.MYTURN_I18N.en)))',os.path.join(ROOT,'lang','en.js')]))
html=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
pairs=dict((o,n) for n,o in re.findall(r'tn\([^,]*,"([^"]*)","([^"]*)"',html))  # other -> one
vals=[l.rstrip('\n') for l in open(os.path.join(SRC,lang+'.txt'),encoding='utf-8')]
while vals and not vals[-1]:vals.pop()
assert len(vals)==len(keys),(len(vals),len(keys))
ph=lambda s:sorted(re.findall(r'\{\w+\}|</?b>',s))
D={};bad=0
for k,v in zip(keys,vals):
    forms=None
    if '‖' in v:
        parts=[p.strip() for p in v.split('‖')];forms={'other':parts[0]}
        for p in parts[1:]:
            c,x=p.split(':',1);forms[c.strip()]=x.strip()
        if k not in pairs:print('FORMS ON NON-PLURAL',k);bad+=1
    for x in (forms.values() if forms else [v]):
        if ph(k.split('|')[0])!=ph(x):print('PH',k,'=>',x);bad+=1
        if not x.strip():print('EMPTY',k);bad+=1
    D[k]=forms if forms else v
for o,n in pairs.items():
    if o in D and n in D:
        if not isinstance(D[o],dict):D[o]={'other':D[o]}
        D[o].setdefault('one',D[n])
open(os.path.join(ROOT,'lang',f'{lang}.js'),'w',encoding='utf-8').write(f'/* {name} */\n(window.MYTURN_I18N=window.MYTURN_I18N||{{}})["{lang}"]='+json.dumps(D,ensure_ascii=False,indent=0)+';\n')
print(lang,len(D),'bad',bad,'plural objects',sum(isinstance(x,dict) for x in D.values()))
