"""Crea tools/countries/states.py dalle regole prodotte da states_gen.py (OUT/rules_US.json, OUT/rules_BR.json)."""
import json, os
OUTD = os.environ.get("OUT", "/tmp/myturn-tests")
US = json.load(open(os.path.join(OUTD, 'rules_US.json'))); BR = json.load(open(os.path.join(OUTD, 'rules_BR.json')))
BR['MG'] = [r for r in BR['MG'] if r[1] != 'Execução de Tiradentes']  # stessa data e stesso evento di Tiradentes nazionale
USN = {"AK":"Alaska","AL":"Alabama","AR":"Arkansas","AZ":"Arizona","CA":"California","CO":"Colorado","CT":"Connecticut","DC":"District of Columbia","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","IA":"Iowa","ID":"Idaho","IL":"Illinois","IN":"Indiana","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","MA":"Massachusetts","MD":"Maryland","ME":"Maine","MI":"Michigan","MN":"Minnesota","MO":"Missouri","MS":"Mississippi","MT":"Montana","NC":"North Carolina","ND":"North Dakota","NE":"Nebraska","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NV":"Nevada","NY":"New York","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VA":"Virginia","VT":"Vermont","WA":"Washington","WI":"Wisconsin","WV":"West Virginia","WY":"Wyoming"}
BRN = {"AC":"Acre","AL":"Alagoas","AP":"Amapá","AM":"Amazonas","BA":"Bahia","CE":"Ceará","DF":"Distrito Federal","ES":"Espírito Santo","GO":"Goiás","MA":"Maranhão","MT":"Mato Grosso","MS":"Mato Grosso do Sul","MG":"Minas Gerais","PA":"Pará","PB":"Paraíba","PR":"Paraná","PE":"Pernambuco","PI":"Piauí","RJ":"Rio de Janeiro","RN":"Rio Grande do Norte","RS":"Rio Grande do Sul","RO":"Rondônia","RR":"Roraima","SC":"Santa Catarina","SP":"São Paulo","SE":"Sergipe","TO":"Tocantins"}
assert set(US) == set(USN) and set(BR) == set(BRN)

def fix(rules):
    """Casi che le regole dell'app esprimono solo con più elementi."""
    out = []
    for r, n, o in rules:
        if n == "Christmas Eve" and o.get("obs") == "sat":
            # di sabato si recupera venerdì 23; di domenica venerdì 22; di venerdì (Natale recuperato il 24) giovedì 23
            out += [[r, n, {}], ["12-23", n + " (observed)", {"nwd": [0, 1, 2, 3, 6]}], ["12-22", n + " (observed)", {"nwd": [0, 1, 2, 3, 4, 6]}]]
        elif n == "Day After Christmas" and o.get("obs") == "mon":
            # di sabato o domenica al lunedì, di lunedì (Natale recuperato) al martedì
            out += [[r, n, o], ["12-27", n + " (observed)", {"nwd": [0, 1, 3, 4, 5, 6]}]]
        elif n == "Inauguration Day" and o.get("obs") == "sun":
            # di domenica si recupera il lunedì anche se è già festa (Martin Luther King Jr. Day nel 2041)
            o2 = {k: v for k, v in o.items() if k != "obs"}
            out += [[r, n, o2], ["s01-20/0/1", n, o2]]
        else:
            out.append([r, n, o])
    return out
US = {k: fix(v) for k, v in US.items()}
opt = lambda o: "".join(f",{k}={json.dumps(v)}" for k, v in o.items())
ent = lambda r: f'E({json.dumps(r[0])},{json.dumps(r[1], ensure_ascii=False)}{opt(r[2])})'
out = ['''# Festività dei singoli stati di Stati Uniti e Brasile. GENERATO da states_gen.py e states_emit.py: non modificare a mano.
# Fonte: libreria open source "holidays" (github.com/vacanza/holidays, che cita le leggi di ogni stato),
# convertita nelle regole dell'app e controllata data per data dal 2024 al 2060 (tests/holidays-states.js).
# Stati Uniti: elenco completo dello stato (sostituisce quello federale). Escluse le giornate commemorative
# senza chiusura degli uffici (Susan B. Anthony Day, Diwali in California, Cesar Chavez Day in Colorado)
# e le feste facoltative del Texas (Cesar Chavez Day, Good Friday).
# Brasile: feste dello stato in aggiunta a quelle nazionali.
from eu import H
def E(r,n,**o):return H(r,n,n,**o)
''', 'US_REG={']
for k in sorted(US, key=lambda k: USN[k]):
    out.append(f' "{k}":{{"n":{{"en":{json.dumps(USN[k])}}},"replace":True,"hol":[')
    out.append('  ' + ",".join(ent(r) for r in US[k]) + ']},')
out += ['}', 'BR_REG={']
for k in sorted(BR, key=lambda k: BRN[k]):
    out.append(f' "{k}":{{"n":{{"pt":{json.dumps(BRN[k], ensure_ascii=False)},"en":{json.dumps(BRN[k], ensure_ascii=False)}}},"hol":[')
    out.append('  ' + ",".join(ent(r) for r in BR[k]) + ']},')
out.append('}')
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'states.py'), 'w').write("\n".join(out) + "\n")
print("states.py:", len(US), "stati USA,", len(BR), "stati del Brasile")
