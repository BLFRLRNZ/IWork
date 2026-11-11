import json,sys
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'src')
keys=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'keys.json')))
lang=sys.argv[1]
s=open(os.path.join(ROOT,'lang',f'{lang}.js'),encoding='utf-8').read()
D=json.loads(s[s.index('={',s.index('IWORK_I18N||'))+1:s.rstrip().rindex(';')])
miss=[k for k in keys if k not in D]
print(len(miss),'missing');print(json.dumps(miss,ensure_ascii=False,indent=0))
