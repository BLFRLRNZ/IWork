import json,sys
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'src')
def add(lang,new):
    p=os.path.join(ROOT,'lang',f'{lang}.js');s=open(p,encoding='utf-8').read()
    i=s.index('={',s.index('MYTURN_I18N||'))+1;D=json.loads(s[i:s.rstrip().rindex(';')]);D.update(new)
    open(p,'w',encoding='utf-8').write(s[:i]+json.dumps(D,ensure_ascii=False,indent=0)+';\n')
    print(lang,len(D))
if __name__=='__main__':
    add(sys.argv[1],json.load(open(sys.argv[2],encoding='utf-8')))
