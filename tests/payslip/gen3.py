import json
from gen2 import mk
# (file, period line, header [desc,qty,rate,amount], ot, night, fest, gross label, gross, net label, net, used label+val, res label+val, number style)
def f(v,st):
    s=f"{v:,.2f}"
    if st=="it":return s.replace(",","X").replace(".",",").replace("X",".")
    if st=="sp":return s.replace(",","X").replace(".",",").replace("X"," ")
    if st=="ch":return s.replace(",","'")
    if st=="is":return f"{int(v):,}".replace(",",".")
    return s
M=[
 ("mx","Periodo del 16/10/2026 al 31/10/2026",["Concepto","Cantidad","Valor unitario","Importe"],"Horas extra dobles","Turno nocturno",None,"Total percepciones","Neto a pagar",("Días de vacaciones disfrutados","2"),("Saldo de vacaciones","10"),"en"),
 ("ar","Período: Octubre 2026",["Concepto","Cantidad","Unitario","Haberes"],"Horas extras 50%",None,None,"Total haberes","Neto a cobrar",None,None,"it"),
 ("pt","Período: outubro de 2026",["Descrição","Quantidade","Valor unit.","Abonos"],"Trabalho suplementar","Subsídio de trabalho noturno",None,"Total ilíquido","Líquido a receber",("Férias gozadas","2"),("Férias por gozar","20"),"it"),
 ("be","Fiche de paie octobre 2026",["Libellé","Nombre","Taux","Montant"],"Heures supplémentaires","Prime de nuit","Prestations dimanche","Rémunération brute","Net à payer",("Jours de vacances pris","2"),("Solde jours de vacances","18"),"it"),
 ("ch","Lohnabrechnung Oktober 2026",["Lohnart","Anzahl","Ansatz","Betrag"],"Überzeit 125%","Nachtzulage","Sonntagszulage","Bruttolohn","Auszahlung",("Ferien bezogen","2"),("Ferien Saldo","18"),"ch"),
 ("dk","Lønseddel for oktober 2026",["Tekst","Antal","Sats","Beløb"],"Overarbejde 50%","Nattillæg","Søndagstillæg","Bruttoløn","Til udbetaling",("Ferie afholdt","2 dage"),("Restferie","18 dage"),"it"),
 ("no","Lønnsslipp oktober 2026",["Lønnsart","Antall","Sats","Beløp"],"Overtid 50%","Nattillegg","Helgetillegg","Sum brutto","Utbetalt",("Feriedager avviklet","2"),("Gjenstående feriedager","18"),"sp"),
 ("fi","Palkkalaskelma, palkkakausi 1.10.2026–31.10.2026",["Palkkalaji","Kpl","A-hinta","Euroa"],"Ylityö 50%","Yötyölisä","Sunnuntaityökorvaus","Bruttopalkka","Maksetaan",("Pidetyt lomapäivät","2"),("Lomapäiviä jäljellä","20"),"sp"),
 ("is","Launaseðill október 2026",["Tegund","Einingar","Taxti","Upphæð"],"Yfirvinna 1","Næturvinna",None,"Heildarlaun","Útborgað",("Orlof tekið","2"),("Orlof eftir","18"),"is"),
 ("cz","Výplatní páska za říjen 2026",["Složka mzdy","Hodiny","Sazba","Částka"],"Přesčas 25%","Příplatek za noc 10%","Příplatek za neděli","Hrubá mzda","K výplatě",("Dovolená čerpána","2 dny"),("Zůstatek dovolené","15 dnů"),"sp"),
 ("sk","Výplatná páska október 2026",["Zložka mzdy","Hodiny","Sadzba","Suma"],"Nadčas","Príplatok za nočnú prácu","Príplatok za sobotu a nedeľu","Hrubá mzda","K výplate",("Čerpaná dovolenka","2 dni"),("Zostatok dovolenky","18 dní"),"sp"),
 ("hu","Bérjegyzék 2026. október",["Jogcím","Mennyiség","Egységár","Összeg"],"Túlóra 50%","Éjszakai pótlék","Vasárnapi pótlék","Bruttó bér","Kifizetendő",("Kivett szabadság","2 nap"),("Maradék szabadság","18 nap"),"sp"),
 ("lt","Atsiskaitymo lapelis, 2026 m. spalio mėn.",["Pavadinimas","Kiekis","Įkainis","Suma"],"Viršvalandžiai","Naktinis darbas","Darbas poilsio dienomis","Priskaičiuota iš viso","Išmokėti",("Panaudotos atostogos","2 d."),("Atostogų likutis","18 d."),"sp"),
 ("lv","Algas aprēķins 2026. gada oktobris",["Nosaukums","Daudzums","Likme","Summa"],"Virsstundas","Nakts darbs","Darbs svētku dienās","Bruto alga","Izmaksājamā summa",("Izmantotais atvaļinājums","2 d."),("Atvaļinājuma atlikums","18 d."),"sp"),
 ("ee","Palgaleht oktoober 2026",["Nimetus","Kogus","Hind","Summa"],"Ületunnitöö","Öötöö tasu","Riigipüha tasu","Brutopalk","Väljamakstav summa",("Kasutatud puhkusepäevad","2"),("Puhkuse jääk","18"),"sp"),
 ("ro","Fluturaș de salariu - octombrie 2026",["Denumire","Nr. ore","Tarif","Suma"],"Ore suplimentare 75%","Spor de noapte 25%","Ore lucrate în zile de sărbătoare","Venit brut","Rest de plată",("Concediu de odihnă efectuat","2 zile"),("Zile concediu rămase","18"),"it"),
 ("bg","Фиш за заплата за октомври 2026",["Перо","Количество","Ставка","Сума"],"Извънреден труд","Нощен труд","Труд в празнични дни","Брутно възнаграждение","Сума за получаване",("Ползван отпуск","2 дни"),("Остатък отпуск","18 дни"),"sp"),
 ("hr","Platna lista za listopad 2026.",["Opis","Sati","Iznos/sat","Iznos"],"Prekovremeni rad","Noćni rad","Rad nedjeljom","Bruto plaća","Za isplatu",("Iskorišteni godišnji odmor","2 dana"),("Preostali godišnji odmor","18 dana"),"it"),
 ("si","Plačilna lista za oktober 2026",["Vrsta izplačila","Ure","Postavka","Znesek"],"Nadure","Nočno delo","Delo na nedeljo","Bruto plača","Za izplačilo",("Izrabljen dopust","2 dni"),("Preostali dopust","18 dni"),"it"),
 ("gr","Εκκαθαριστικό μισθοδοσίας Οκτωβρίου 2026",["Περιγραφή","Ώρες","Τιμή","Ποσό"],"Υπερωρίες","Νυχτερινά","Κυριακές","Μικτές αποδοχές","Πληρωτέο",("Άδεια που ελήφθη","2"),("Υπόλοιπο άδειας","18"),"it"),
 ("nz","Payslip - pay period ending 25 October 2026",["Description","Hours","Rate","Amount"],"Time and a half","Night allowance","Public holiday worked","Gross earnings","Net pay",("Annual leave taken","2 days"),("Annual leave balance","18 days"),"en"),
 ("ca","Pay statement - Period: 2026-10-12 to 2026-10-25",["Earnings","Hours","Rate","Current"],"Overtime 1.5","Night shift premium","Stat holiday worked","Gross pay","Net pay",("Vacation taken","16 hrs"),("Vacation balance","80 hrs"),"en"),
]
out={}
for (k,per,H,ot,ni,fe,gl,nl,u,r,st) in M:
    rows=[[(30,per)],""]
    rows.append([(30,H[0]),(250,H[1]),(310,H[2]),(400,H[3])])
    rows.append([(30,"Base"),(430,f(2500,st),"r")])
    exp={}
    if ot:rows.append([(30,ot),(280,f(6,st) if st!="is" else "6","r"),(340,f(20,st) if st!="is" else "3.000","r"),(430,f(120,st) if st!="is" else "18.000","r")]);exp["ot"]=6
    if ni:rows.append([(30,ni),(280,f(20,st) if st!="is" else "20","r"),(340,f(2,st) if st!="is" else "500","r"),(430,f(40,st) if st!="is" else "10.000","r")]);exp["night"]=20
    if fe:rows.append([(30,fe),(280,f(8,st) if st!="is" else "8","r"),(340,f(5,st) if st!="is" else "800","r"),(430,f(40,st) if st!="is" else "6.400","r")]);exp["fest"]=8
    g=2700 if st!="is" else 450000;n=2050.5 if st!="is" else 330000
    rows+=["",[(30,gl),(430,f(g,st),"r")],[(30,"Tax"),(430,f(400,st),"r")],[(30,nl),(430,f(n,st),"r")]]
    exp["gross"]=g;exp["net"]=n
    if u:rows+=["",[(30,u[0]),(200,u[1])]];exp["ferie"]=2 if k!="ca" else 2
    if r:rows+=[[(30,r[0]),(200,r[1])]];exp["ferieRes"]=float(r[1].split()[0]) if k!="ca" else 10
    mk(k+".pdf",rows);out[k]=exp
json.dump(out,open("expected.json","w"))
print(len(out))
