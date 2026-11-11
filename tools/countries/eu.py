# Dati dei paesi UE (oltre all'Italia, che resta nel file originale).
# H(regola, nome locale, nome inglese, nomi extra, opzioni)
EU_RULES={"rest":11,"maxWeek":48,"weeklyRest":24}
EU_SRC="Direttiva 2003/88/CE (minimi UE: 11 ore di riposo giornaliero, 24 ore settimanali, media di 48 ore); festività: elenchi ufficiali nazionali, confrontati con l'elenco EMA dei giorni festivi degli Stati membri 2026–2027"
def H(r,loc,en,extra=None,**o):
    n={"loc":loc,"en":en}
    if extra:n.update(extra)
    o={("from" if k=="from_" else k):v for k,v in o.items()}
    return [r,n,o] if o else [r,n]
def C(code,names,lang,hol,night=(22,6),ws=1,cur="EUR",reg=None,note=None,rules=None,src=None):
    r=dict(EU_RULES);r["night"]=list(night)
    if rules:r.update(rules)
    out={"n":names,"lang":lang,"cur":cur,"ws":ws,"rules":r,"src":src or EU_SRC,"hol":[]}
    for h in hol:
        n=dict(h[1]);loc=n.pop("loc");n[lang]=loc
        out["hol"].append([h[0],n]+([h[2]] if len(h)>2 else []))
    if reg:
        out["reg"]={}
        for k,v in reg.items():
            hl=[]
            for h in v["hol"]:
                n=dict(h[1]);loc=n.pop("loc");n[lang]=loc;hl.append([h[0],n]+([h[2]] if len(h)>2 else []))
            out["reg"][k]={"n":v["n"],"hol":hl}
    if note:out["note"]=note
    return code,out

E="e";O="o"
COUNTRIES=[
C("AT",{"de":"Österreich","en":"Austria","it":"Austria"},"de",[
 H("01-01","Neujahr","New Year's Day"),H("01-06","Heilige Drei Könige","Epiphany"),H("e1","Ostermontag","Easter Monday"),
 H("05-01","Staatsfeiertag","Labour Day"),H("e39","Christi Himmelfahrt","Ascension Day"),H("e50","Pfingstmontag","Whit Monday"),
 H("e60","Fronleichnam","Corpus Christi"),H("08-15","Mariä Himmelfahrt","Assumption Day"),H("10-26","Nationalfeiertag","National Day"),
 H("11-01","Allerheiligen","All Saints' Day"),H("12-08","Mariä Empfängnis","Immaculate Conception"),H("12-25","Christtag","Christmas Day"),
 H("12-26","Stefanitag","St Stephen's Day")],night=(22,5)),
C("BE",{"nl":"België","fr":"Belgique","de":"Belgien","en":"Belgium","it":"Belgio"},"nl",[
 H("01-01","Nieuwjaar","New Year's Day",{"fr":"Jour de l'An"}),H("e0","Pasen","Easter Sunday",{"fr":"Pâques"}),H("e1","Paasmaandag","Easter Monday",{"fr":"Lundi de Pâques"}),
 H("05-01","Dag van de Arbeid","Labour Day",{"fr":"Fête du Travail"}),H("e39","Onze-Lieve-Heer-Hemelvaart","Ascension Day",{"fr":"Ascension"}),
 H("e49","Pinksteren","Whit Sunday",{"fr":"Pentecôte"}),H("e50","Pinkstermaandag","Whit Monday",{"fr":"Lundi de Pentecôte"}),H("07-21","Nationale feestdag","National Day",{"fr":"Fête nationale"}),
 H("08-15","Onze-Lieve-Vrouw-Hemelvaart","Assumption Day",{"fr":"Assomption"}),H("11-01","Allerheiligen","All Saints' Day",{"fr":"Toussaint"}),
 H("11-11","Wapenstilstand","Armistice Day",{"fr":"Armistice"}),H("12-25","Kerstmis","Christmas Day",{"fr":"Noël"})],night=(20,6),
 note="Se una festa cade di domenica, il datore di lavoro fissa un giorno di recupero."),
C("BG",{"bg":"България","en":"Bulgaria","it":"Bulgaria"},"bg",[
 H("01-01","Нова година","New Year's Day",obs="mon"),H("03-03","Ден на Освобождението","Liberation Day",obs="mon"),
 H("o-2","Разпети петък","Good Friday"),H("o-1","Велика събота","Holy Saturday"),H("o0","Великден","Easter Sunday"),H("o1","Великден (понеделник)","Easter Monday"),
 H("05-01","Ден на труда","Labour Day",obs="mon"),H("05-06","Гергьовден","St George's Day",obs="mon"),
 H("05-24","Ден на светите братя Кирил и Методий","Education and Culture Day",obs="mon"),H("09-06","Ден на Съединението","Unification Day",obs="mon"),
 H("09-22","Ден на Независимостта","Independence Day",obs="mon"),H("12-24","Бъдни вечер","Christmas Eve",obs="mon"),
 H("01-02","Неприсъствен ден","Bridge day",from_=2026,to=2026),H("12-25","Рождество Христово","Christmas Day",obs="mon"),H("12-26","Рождество Христово (втори ден)","Second Day of Christmas",obs="mon")]),
C("HR",{"hr":"Hrvatska","en":"Croatia","it":"Croazia"},"hr",[
 H("01-01","Nova godina","New Year's Day"),H("01-06","Bogojavljenje","Epiphany"),H("e0","Uskrs","Easter Sunday"),H("e1","Uskrsni ponedjeljak","Easter Monday"),
 H("05-01","Praznik rada","Labour Day"),H("05-30","Dan državnosti","Statehood Day"),H("e60","Tijelovo","Corpus Christi"),
 H("06-22","Dan antifašističke borbe","Anti-Fascist Struggle Day"),H("08-05","Dan pobjede i domovinske zahvalnosti","Victory Day"),
 H("08-15","Velika Gospa","Assumption Day"),H("11-01","Svi sveti","All Saints' Day"),H("11-18","Dan sjećanja na žrtve Domovinskog rata","Remembrance Day",from_=2020),
 H("12-25","Božić","Christmas Day"),H("12-26","Sveti Stjepan","St Stephen's Day")]),
C("CY",{"el":"Κύπρος","en":"Cyprus","it":"Cipro"},"el",[
 H("01-01","Πρωτοχρονιά","New Year's Day"),H("01-06","Θεοφάνια","Epiphany"),H("o-48","Καθαρά Δευτέρα","Green Monday"),
 H("03-25","Ευαγγελισμός","Greek Independence Day"),H("04-01","Εθνική Επέτειος","Cyprus National Day"),H("o-2","Μεγάλη Παρασκευή","Good Friday"),
 H("o0","Κυριακή του Πάσχα","Easter Sunday"),H("o1","Δευτέρα του Πάσχα","Easter Monday"),H("05-01","Πρωτομαγιά","Labour Day"),
 H("o50","Κατακλυσμός","Whit Monday (Kataklysmos)"),H("08-15","Κοίμηση της Θεοτόκου","Assumption Day"),H("10-01","Ημέρα Ανεξαρτησίας","Independence Day"),
 H("10-28","Επέτειος του Όχι","Ochi Day"),H("12-25","Χριστούγεννα","Christmas Day"),
 H("12-26","Σύναξη της Θεοτόκου","Day after Christmas")]),
C("CZ",{"cs":"Česko","en":"Czechia","it":"Repubblica Ceca"},"cs",[
 H("01-01","Nový rok","New Year's Day"),H("e-2","Velký pátek","Good Friday"),H("e1","Velikonoční pondělí","Easter Monday"),
 H("05-01","Svátek práce","Labour Day"),H("05-08","Den vítězství","Liberation Day"),H("07-05","Den slovanských věrozvěstů Cyrila a Metoděje","Saints Cyril and Methodius Day"),
 H("07-06","Den upálení mistra Jana Husa","Jan Hus Day"),H("09-28","Den české státnosti","Statehood Day"),H("10-28","Den vzniku samostatného československého státu","Independence Day"),
 H("11-17","Den boje za svobodu a demokracii","Freedom and Democracy Day"),H("12-24","Štědrý den","Christmas Eve"),H("12-25","1. svátek vánoční","Christmas Day"),
 H("12-26","2. svátek vánoční","St Stephen's Day")]),
C("DK",{"da":"Danmark","en":"Denmark","it":"Danimarca"},"da",[
 H("01-01","Nytårsdag","New Year's Day"),H("e-3","Skærtorsdag","Maundy Thursday"),H("e-2","Langfredag","Good Friday"),H("e0","Påskedag","Easter Sunday"),
 H("e1","2. påskedag","Easter Monday"),H("e26","Store bededag","General Prayer Day",to=2023),H("e39","Kristi himmelfartsdag","Ascension Day"),
 H("e49","Pinsedag","Whit Sunday"),H("e50","2. pinsedag","Whit Monday"),H("12-25","Juledag","Christmas Day"),H("12-26","2. juledag","Second Day of Christmas")],
 note="Grundlovsdag (5 giugno) e la vigilia di Natale non sono festivi per legge, ma molti contratti li prevedono."),
C("EE",{"et":"Eesti","en":"Estonia","it":"Estonia"},"et",[
 H("01-01","Uusaasta","New Year's Day"),H("02-24","Iseseisvuspäev","Independence Day"),H("e-2","Suur reede","Good Friday"),H("e0","Ülestõusmispühade 1. püha","Easter Sunday"),
 H("05-01","Kevadpüha","Spring Day"),H("e49","Nelipühade 1. püha","Whit Sunday"),H("06-23","Võidupüha","Victory Day"),H("06-24","Jaanipäev","Midsummer Day"),
 H("08-20","Taasiseseisvumispäev","Restoration of Independence Day"),H("12-24","Jõululaupäev","Christmas Eve"),H("12-25","Esimene jõulupüha","Christmas Day"),
 H("12-26","Teine jõulupüha","Second Day of Christmas")]),
C("FI",{"fi":"Suomi","sv":"Finland","en":"Finland","it":"Finlandia"},"fi",[
 H("01-01","Uudenvuodenpäivä","New Year's Day"),H("01-06","Loppiainen","Epiphany"),H("e-2","Pitkäperjantai","Good Friday"),H("e0","Pääsiäispäivä","Easter Sunday"),
 H("e1","2. pääsiäispäivä","Easter Monday"),H("05-01","Vappu","May Day"),H("e39","Helatorstai","Ascension Day"),H("e49","Helluntaipäivä","Whit Sunday"),
 H("a06-19/5","Juhannusaatto","Midsummer Eve"),H("a06-20/6","Juhannuspäivä","Midsummer Day"),H("a10-31/6","Pyhäinpäivä","All Saints' Day"),
 H("12-06","Itsenäisyyspäivä","Independence Day"),H("12-24","Jouluaatto","Christmas Eve"),H("12-25","Joulupäivä","Christmas Day"),H("12-26","Tapaninpäivä","St Stephen's Day")]),
C("FR",{"fr":"France","en":"France","it":"Francia"},"fr",[
 H("01-01","Jour de l'An","New Year's Day"),H("e1","Lundi de Pâques","Easter Monday"),H("05-01","Fête du Travail","Labour Day"),
 H("05-08","Victoire 1945","Victory in Europe Day"),H("e39","Ascension","Ascension Day"),H("e50","Lundi de Pentecôte","Whit Monday"),
 H("07-14","Fête nationale","Bastille Day"),H("08-15","Assomption","Assumption Day"),H("11-01","Toussaint","All Saints' Day"),
 H("11-11","Armistice 1918","Armistice Day"),H("12-25","Noël","Christmas Day")],night=(21,6),
 reg={"AM":{"n":{"fr":"Alsace-Moselle","en":"Alsace-Moselle","it":"Alsazia-Mosella"},"hol":[H("e-2","Vendredi saint","Good Friday"),H("12-26","Saint-Étienne","St Stephen's Day")]}},
 note="Il lunedì di Pentecoste è spesso la «giornata di solidarietà» e si lavora."),
C("DE",{"de":"Deutschland","en":"Germany","it":"Germania"},"de",[
 H("01-01","Neujahr","New Year's Day"),H("e-2","Karfreitag","Good Friday"),H("e1","Ostermontag","Easter Monday"),H("05-01","Tag der Arbeit","Labour Day"),
 H("e39","Christi Himmelfahrt","Ascension Day"),H("e50","Pfingstmontag","Whit Monday"),H("10-03","Tag der Deutschen Einheit","German Unity Day"),
 H("12-25","1. Weihnachtstag","Christmas Day"),H("12-26","2. Weihnachtstag","Boxing Day")],night=(23,6),
 reg={
  "BW":{"n":{"de":"Baden-Württemberg","en":"Baden-Württemberg"},"hol":[H("01-06","Heilige Drei Könige","Epiphany"),H("e60","Fronleichnam","Corpus Christi"),H("11-01","Allerheiligen","All Saints' Day")]},
  "BY":{"n":{"de":"Bayern","en":"Bavaria","it":"Baviera"},"hol":[H("01-06","Heilige Drei Könige","Epiphany"),H("e60","Fronleichnam","Corpus Christi"),H("08-15","Mariä Himmelfahrt","Assumption Day"),H("11-01","Allerheiligen","All Saints' Day")]},
  "BE":{"n":{"de":"Berlin","en":"Berlin","it":"Berlino"},"hol":[H("03-08","Internationaler Frauentag","International Women's Day",from_=2019)]},
  "BB":{"n":{"de":"Brandenburg","en":"Brandenburg"},"hol":[H("e0","Ostersonntag","Easter Sunday"),H("e49","Pfingstsonntag","Whit Sunday"),H("10-31","Reformationstag","Reformation Day")]},
  "HB":{"n":{"de":"Bremen","en":"Bremen","it":"Brema"},"hol":[H("10-31","Reformationstag","Reformation Day",from_=2018)]},
  "HH":{"n":{"de":"Hamburg","en":"Hamburg","it":"Amburgo"},"hol":[H("10-31","Reformationstag","Reformation Day",from_=2018)]},
  "HE":{"n":{"de":"Hessen","en":"Hesse","it":"Assia"},"hol":[H("e60","Fronleichnam","Corpus Christi")]},
  "MV":{"n":{"de":"Mecklenburg-Vorpommern","en":"Mecklenburg-Vorpommern"},"hol":[H("03-08","Internationaler Frauentag","International Women's Day",from_=2023),H("10-31","Reformationstag","Reformation Day")]},
  "NI":{"n":{"de":"Niedersachsen","en":"Lower Saxony","it":"Bassa Sassonia"},"hol":[H("10-31","Reformationstag","Reformation Day",from_=2018)]},
  "NW":{"n":{"de":"Nordrhein-Westfalen","en":"North Rhine-Westphalia","it":"Renania Settentrionale-Vestfalia"},"hol":[H("e60","Fronleichnam","Corpus Christi"),H("11-01","Allerheiligen","All Saints' Day")]},
  "RP":{"n":{"de":"Rheinland-Pfalz","en":"Rhineland-Palatinate","it":"Renania-Palatinato"},"hol":[H("e60","Fronleichnam","Corpus Christi"),H("11-01","Allerheiligen","All Saints' Day")]},
  "SL":{"n":{"de":"Saarland","en":"Saarland"},"hol":[H("e60","Fronleichnam","Corpus Christi"),H("08-15","Mariä Himmelfahrt","Assumption Day"),H("11-01","Allerheiligen","All Saints' Day")]},
  "SN":{"n":{"de":"Sachsen","en":"Saxony","it":"Sassonia"},"hol":[H("10-31","Reformationstag","Reformation Day"),H("b11-22/3","Buß- und Bettag","Day of Repentance and Prayer")]},
  "ST":{"n":{"de":"Sachsen-Anhalt","en":"Saxony-Anhalt","it":"Sassonia-Anhalt"},"hol":[H("01-06","Heilige Drei Könige","Epiphany"),H("10-31","Reformationstag","Reformation Day")]},
  "SH":{"n":{"de":"Schleswig-Holstein","en":"Schleswig-Holstein"},"hol":[H("10-31","Reformationstag","Reformation Day",from_=2018)]},
  "TH":{"n":{"de":"Thüringen","en":"Thuringia","it":"Turingia"},"hol":[H("09-20","Weltkindertag","World Children's Day",from_=2019),H("10-31","Reformationstag","Reformation Day")]}},
 note="In Baviera l'Assunta è festiva solo nei comuni a maggioranza cattolica."),
C("GR",{"el":"Ελλάδα","en":"Greece","it":"Grecia"},"el",[
 H("01-01","Πρωτοχρονιά","New Year's Day"),H("01-06","Θεοφάνια","Epiphany"),H("o-48","Καθαρά Δευτέρα","Clean Monday"),H("03-25","Ευαγγελισμός","Independence Day"),
 H("o-2","Μεγάλη Παρασκευή","Good Friday"),H("o0","Κυριακή του Πάσχα","Easter Sunday"),H("o1","Δευτέρα του Πάσχα","Easter Monday"),H("05-01","Πρωτομαγιά","Labour Day",obs="mon"),
 H("o50","Αγίου Πνεύματος","Whit Monday"),H("08-15","Κοίμηση της Θεοτόκου","Assumption Day"),H("10-28","Επέτειος του Όχι","Ochi Day"),
 H("12-25","Χριστούγεννα","Christmas Day"),H("12-26","Σύναξη της Θεοτόκου","Synaxis of the Theotokos")]),
C("HU",{"hu":"Magyarország","en":"Hungary","it":"Ungheria"},"hu",[
 H("01-01","Újév","New Year's Day"),H("03-15","Nemzeti ünnep","1848 Revolution Day"),H("e-2","Nagypéntek","Good Friday"),H("e0","Húsvétvasárnap","Easter Sunday"),
 H("e1","Húsvéthétfő","Easter Monday"),H("05-01","A munka ünnepe","Labour Day"),H("e49","Pünkösdvasárnap","Whit Sunday"),H("e50","Pünkösdhétfő","Whit Monday"),
 H("08-20","Az államalapítás ünnepe","State Foundation Day"),H("10-23","Nemzeti ünnep","1956 Revolution Day"),H("11-01","Mindenszentek","All Saints' Day"),
 H("12-25","Karácsony","Christmas Day"),H("12-26","Karácsony másnapja","Second Day of Christmas"),
 H("01-02","Pihenőnap","Bridge day",from_=2026,to=2026),H("08-21","Pihenőnap","Bridge day",from_=2026,to=2026),H("12-24","Pihenőnap","Bridge day",from_=2026,to=2026)]),
C("IE",{"en":"Ireland","ga":"Éire","it":"Irlanda"},"en",[
 H("01-01","New Year's Day","New Year's Day"),H("?02-01/5:n02/1/1","St Brigid's Day","St Brigid's Day",from_=2023),
 H("03-17","St Patrick's Day","St Patrick's Day"),H("e1","Easter Monday","Easter Monday"),H("n05/1/1","May Bank Holiday","May Bank Holiday"),
 H("n06/1/1","June Bank Holiday","June Bank Holiday"),H("n08/1/1","August Bank Holiday","August Bank Holiday"),H("n10/1/-1","October Bank Holiday","October Bank Holiday"),
 H("12-25","Christmas Day","Christmas Day"),H("12-26","St Stephen's Day","St Stephen's Day")],night=(0,7)),
C("LV",{"lv":"Latvija","en":"Latvia","it":"Lettonia"},"lv",[
 H("01-01","Jaungada diena","New Year's Day"),H("e-2","Lielā Piektdiena","Good Friday"),H("e0","Lieldienas","Easter Sunday"),H("e1","Otrās Lieldienas","Easter Monday"),
 H("05-01","Darba svētki","Labour Day"),H("05-04","Latvijas Republikas Neatkarības atjaunošanas diena","Restoration of Independence Day",obs="mon"),
 H("e49","Vasarsvētki","Whit Sunday"),H("06-23","Līgo diena","Midsummer Eve"),H("06-24","Jāņu diena","Midsummer Day"),
 H("11-18","Latvijas Republikas proklamēšanas diena","Proclamation Day",obs="mon"),H("12-24","Ziemassvētku vakars","Christmas Eve"),
 H("12-25","Pirmie Ziemassvētki","Christmas Day"),H("12-26","Otrie Ziemassvētki","Second Day of Christmas"),H("12-31","Vecgada diena","New Year's Eve"),
 H("01-02","Brīvdiena","Bridge day",from_=2026,to=2026),H("06-22","Brīvdiena","Bridge day",from_=2026,to=2026)]),
C("LT",{"lt":"Lietuva","en":"Lithuania","it":"Lituania"},"lt",[
 H("01-01","Naujieji metai","New Year's Day"),H("02-16","Lietuvos valstybės atkūrimo diena","Restoration of the State Day"),H("03-11","Lietuvos nepriklausomybės atkūrimo diena","Restoration of Independence Day"),
 H("e0","Velykos","Easter Sunday"),H("e1","Antroji Velykų diena","Easter Monday"),H("05-01","Tarptautinė darbo diena","Labour Day"),
 H("n05/0/1","Motinos diena","Mother's Day"),H("n06/0/1","Tėvo diena","Father's Day"),H("06-24","Joninės","St John's Day"),
 H("07-06","Valstybės diena","Statehood Day"),H("08-15","Žolinė","Assumption Day"),H("11-01","Visų šventųjų diena","All Saints' Day"),
 H("11-02","Vėlinės","All Souls' Day"),H("12-24","Kūčios","Christmas Eve"),H("12-25","Kalėdos","Christmas Day"),H("12-26","Antroji Kalėdų diena","Second Day of Christmas")]),
C("LU",{"fr":"Luxembourg","de":"Luxemburg","en":"Luxembourg","it":"Lussemburgo"},"fr",[
 H("01-01","Jour de l'An","New Year's Day"),H("e1","Lundi de Pâques","Easter Monday"),H("05-01","Fête du Travail","Labour Day"),
 H("05-09","Journée de l'Europe","Europe Day",from_=2019),H("e39","Ascension","Ascension Day"),H("e50","Lundi de Pentecôte","Whit Monday"),
 H("06-23","Fête nationale","National Day"),H("08-15","Assomption","Assumption Day"),H("11-01","Toussaint","All Saints' Day"),
 H("12-25","Noël","Christmas Day"),H("12-26","Saint-Étienne","St Stephen's Day")]),
C("MT",{"mt":"Malta","en":"Malta","it":"Malta"},"en",[
 H("01-01","New Year's Day","New Year's Day"),H("02-10","Feast of St Paul's Shipwreck","St Paul's Shipwreck"),H("03-19","Feast of St Joseph","St Joseph's Day"),
 H("03-31","Freedom Day","Freedom Day"),H("e-2","Good Friday","Good Friday"),H("05-01","Workers' Day","Workers' Day"),H("06-07","Sette Giugno","Sette Giugno"),
 H("06-29","Feast of St Peter and St Paul","St Peter and St Paul"),H("08-15","Feast of the Assumption","Assumption Day"),H("09-08","Victory Day","Victory Day"),
 H("09-21","Independence Day","Independence Day"),H("12-08","Feast of the Immaculate Conception","Immaculate Conception"),H("12-13","Republic Day","Republic Day"),
 H("12-25","Christmas Day","Christmas Day")]),
C("NL",{"nl":"Nederland","en":"Netherlands","it":"Paesi Bassi"},"nl",[
 H("01-01","Nieuwjaarsdag","New Year's Day"),H("e0","Eerste Paasdag","Easter Sunday"),H("e1","Tweede Paasdag","Easter Monday"),
 H("s04-27/0/-1","Koningsdag","King's Day"),H("05-05","Bevrijdingsdag","Liberation Day"),H("e39","Hemelvaartsdag","Ascension Day"),
 H("e49","Eerste Pinksterdag","Whit Sunday"),H("e50","Tweede Pinksterdag","Whit Monday"),H("12-25","Eerste Kerstdag","Christmas Day"),H("12-26","Tweede Kerstdag","Boxing Day")],
 night=(0,6),note="Venerdì Santo e 5 maggio sono liberi solo se lo prevede il contratto (CAO)."),
C("PL",{"pl":"Polska","en":"Poland","it":"Polonia"},"pl",[
 H("01-01","Nowy Rok","New Year's Day"),H("01-06","Święto Trzech Króli","Epiphany"),H("e0","Wielkanoc","Easter Sunday"),H("e1","Poniedziałek Wielkanocny","Easter Monday"),
 H("05-01","Święto Pracy","Labour Day"),H("05-03","Święto Konstytucji 3 Maja","Constitution Day"),H("e49","Zielone Świątki","Whit Sunday"),
 H("e60","Boże Ciało","Corpus Christi"),H("08-15","Wniebowzięcie Najświętszej Maryi Panny","Assumption Day"),H("11-01","Wszystkich Świętych","All Saints' Day"),
 H("11-11","Narodowe Święto Niepodległości","Independence Day"),H("12-24","Wigilia Bożego Narodzenia","Christmas Eve",from_=2025),
 H("12-25","Boże Narodzenie","Christmas Day"),H("12-26","Drugi dzień Bożego Narodzenia","Second Day of Christmas")]),
C("PT",{"pt":"Portugal","en":"Portugal","it":"Portogallo"},"pt",[
 H("01-01","Ano Novo","New Year's Day"),H("e-2","Sexta-feira Santa","Good Friday"),H("e0","Páscoa","Easter Sunday"),H("04-25","Dia da Liberdade","Freedom Day"),
 H("05-01","Dia do Trabalhador","Labour Day"),H("e60","Corpo de Deus","Corpus Christi"),H("06-10","Dia de Portugal","Portugal Day"),
 H("08-15","Assunção de Nossa Senhora","Assumption Day"),H("10-05","Implantação da República","Republic Day"),H("11-01","Dia de Todos os Santos","All Saints' Day"),
 H("12-01","Restauração da Independência","Restoration of Independence"),H("12-08","Imaculada Conceição","Immaculate Conception"),H("12-25","Natal","Christmas Day")],
 night=(22,7),reg={"LIS":{"n":{"pt":"Lisboa","en":"Lisbon","it":"Lisbona"},"hol":[H("06-13","Santo António","St Anthony's Day")]},
  "POR":{"n":{"pt":"Porto","en":"Porto","it":"Porto"},"hol":[H("06-24","São João","St John's Day")]}},
 note="Il martedì di Carnevale è facoltativo; ogni comune ha anche la sua festa municipale."),
C("RO",{"ro":"România","en":"Romania","it":"Romania"},"ro",[
 H("01-01","Anul Nou","New Year's Day"),H("01-02","A doua zi de Anul Nou","Day after New Year's Day"),H("01-06","Boboteaza","Epiphany",from_=2024),
 H("01-07","Sfântul Ioan Botezătorul","St John the Baptist",from_=2024),H("01-24","Ziua Unirii Principatelor Române","Union Day"),
 H("o-2","Vinerea Mare","Good Friday"),H("o0","Paștele","Easter Sunday"),H("o1","A doua zi de Paște","Easter Monday"),H("05-01","Ziua Muncii","Labour Day"),
 H("06-01","Ziua Copilului","Children's Day"),H("o49","Rusaliile","Whit Sunday"),H("o50","A doua zi de Rusalii","Whit Monday"),
 H("08-15","Adormirea Maicii Domnului","Assumption Day"),H("11-30","Sfântul Andrei","St Andrew's Day"),H("12-01","Ziua Națională","National Day"),
 H("12-25","Crăciunul","Christmas Day"),H("12-26","A doua zi de Crăciun","Second Day of Christmas")]),
C("SK",{"sk":"Slovensko","en":"Slovakia","it":"Slovacchia"},"sk",[
 H("01-01","Deň vzniku Slovenskej republiky","Republic Day"),H("01-06","Zjavenie Pána","Epiphany"),H("e-2","Veľký piatok","Good Friday"),
 H("e1","Veľkonočný pondelok","Easter Monday"),H("05-01","Sviatok práce","Labour Day"),H("05-08","Deň víťazstva nad fašizmom","Victory over Fascism Day",skip=[2026]),
 H("07-05","Sviatok svätého Cyrila a Metoda","Saints Cyril and Methodius Day"),H("08-29","Výročie Slovenského národného povstania","Slovak National Uprising Day"),
 H("09-15","Sedembolestná Panna Mária","Our Lady of Sorrows",skip=[2026]),H("11-01","Sviatok všetkých svätých","All Saints' Day"),
 H("11-17","Deň boja za slobodu a demokraciu","Freedom and Democracy Day",to=2024),H("12-24","Štedrý deň","Christmas Eve"),
 H("12-25","Prvý sviatok vianočný","Christmas Day"),H("12-26","Druhý sviatok vianočný","Second Day of Christmas")],
 note="Dal 2025 il 17 novembre non è più festivo; nel 2026 si lavora anche l'8 maggio e il 15 settembre."),
C("SI",{"sl":"Slovenija","en":"Slovenia","it":"Slovenia"},"sl",[
 H("01-01","Novo leto","New Year's Day"),H("01-02","Novo leto","New Year Holiday"),H("02-08","Prešernov dan","Prešeren Day"),H("e0","Velikonočna nedelja","Easter Sunday"),
 H("e1","Velikonočni ponedeljek","Easter Monday"),H("04-27","Dan upora proti okupatorju","Day of Uprising Against Occupation"),H("05-01","Praznik dela","Labour Day"),
 H("05-02","Praznik dela","Labour Day Holiday"),H("e49","Binkoštna nedelja","Whit Sunday"),H("06-25","Dan državnosti","Statehood Day"),
 H("08-15","Marijino vnebovzetje","Assumption Day"),H("10-31","Dan reformacije","Reformation Day"),H("11-01","Dan spomina na mrtve","Remembrance Day"),
 H("12-25","Božič","Christmas Day"),H("12-26","Dan samostojnosti in enotnosti","Independence and Unity Day")]),
C("ES",{"es":"España","en":"Spain","it":"Spagna"},"es",[
 H("01-01","Año Nuevo","New Year's Day"),H("01-06","Epifanía del Señor","Epiphany"),H("e-2","Viernes Santo","Good Friday"),H("05-01","Fiesta del Trabajo","Labour Day"),
 H("08-15","Asunción de la Virgen","Assumption Day"),H("10-12","Fiesta Nacional de España","National Day"),H("11-01","Todos los Santos","All Saints' Day"),
 H("12-06","Día de la Constitución","Constitution Day"),H("12-08","Inmaculada Concepción","Immaculate Conception"),H("12-25","Natividad del Señor","Christmas Day")],
 note="Ogni comunità autonoma aggiunge le sue feste (spesso il Giovedì Santo) e le cambia di anno in anno: aggiungi la tua come festa locale."),
C("SE",{"sv":"Sverige","en":"Sweden","it":"Svezia"},"sv",[
 H("01-01","Nyårsdagen","New Year's Day"),H("01-06","Trettondedag jul","Epiphany"),H("e-2","Långfredagen","Good Friday"),H("e0","Påskdagen","Easter Sunday"),
 H("e1","Annandag påsk","Easter Monday"),H("05-01","Första maj","May Day"),H("e39","Kristi himmelsfärdsdag","Ascension Day"),H("e49","Pingstdagen","Whit Sunday"),
 H("06-06","Sveriges nationaldag","National Day"),H("a06-19/5","Midsommarafton","Midsummer Eve"),H("a06-20/6","Midsommardagen","Midsummer Day"),
 H("a10-31/6","Alla helgons dag","All Saints' Day"),H("12-24","Julafton","Christmas Eve"),H("12-25","Juldagen","Christmas Day"),H("12-26","Annandag jul","Boxing Day"),
 H("12-31","Nyårsafton","New Year's Eve")],note="Le vigilie (Midsommarafton, Julafton, Nyårsafton) non sono festive per legge ma sono libere quasi ovunque."),
]
