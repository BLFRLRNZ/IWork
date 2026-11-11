import json,sys,importlib,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','countries.js'),encoding='utf-8').read()
head=src[:src.index('(window.IWORK_COUNTRIES')]
it=src[src.index('(window.IWORK_COUNTRIES'):src.index('};',src.index('(window.IWORK_COUNTRIES'))+2]
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'it_block.js'),'w',encoding='utf-8').write(it) if 'it_block.js' not in sys.argv else None
mods=[m for m in sys.argv[1:] if not m.endswith('.js')]
out=head+open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'it_block.js'),encoding='utf-8').read()+"\n"
for m in mods:
    M=importlib.import_module(m)
    for code,data in M.COUNTRIES:
        out+="window.IWORK_COUNTRIES."+code+"="+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";\n"
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','countries.js'),'w',encoding='utf-8').write(out)
print(len(out),'bytes')
