# Europa fuori dall'UE: CH, GB, NO, IS, SM, MC, LI
from eu import H,C as _C
def C(code,names,lang,hol,reg=None,regNone=None,**kw):
    raw={k:v for k,v in (reg or {}).items()}
    c,out=_C(code,names,lang,hol,reg=reg,**kw)
    for k,v in raw.items():
        if v.get("replace"):out["reg"][k]["replace"]=True
    if regNone:out["regNone"]=regNone
    return c,out

# --- Svizzera: nomi in de/fr/it/en
def S(r,de,fr,it,en,**o):return H(r,de,en,{"fr":fr,"it":it},**o)
NY=S("01-01","Neujahrstag","Nouvel an","Capodanno","New Year's Day")
B2=S("01-02","Berchtoldstag","2 janvier","2 gennaio","St Berchtold's Day")
E6=S("01-06","Dreikönigstag","Épiphanie","Epifania","Epiphany")
J19=S("03-19","Josefstag","Saint-Joseph","San Giuseppe","St Joseph's Day")
GF=S("e-2","Karfreitag","Vendredi saint","Venerdì santo","Good Friday")
EM=S("e1","Ostermontag","Lundi de Pâques","Lunedì di Pasqua","Easter Monday")
M1=S("05-01","Tag der Arbeit","Fête du travail","Festa dei lavoratori","Labour Day")
M1h=S("05-01","Tag der Arbeit (ab 12 Uhr)","Fête du travail (dès midi)","Festa dei lavoratori (dalle 12)","Labour Day (from noon)")
ASC=S("e39","Auffahrt","Ascension","Ascensione","Ascension Day")
WM=S("e50","Pfingstmontag","Lundi de Pentecôte","Lunedì di Pentecoste","Whit Monday")
CC=S("e60","Fronleichnam","Fête-Dieu","Corpus Domini","Corpus Christi")
PP=S("06-29","Peter und Paul","Saint-Pierre et Paul","San Pietro e Paolo","Saints Peter and Paul")
AUG1=S("08-01","Bundesfeier","Fête nationale","Festa nazionale","Swiss National Day")
ASS=S("08-15","Mariä Himmelfahrt","Assomption","Assunzione","Assumption Day")
AS=S("11-01","Allerheiligen","Toussaint","Ognissanti","All Saints' Day")
IMM=S("12-08","Mariä Empfängnis","Immaculée Conception","Immacolata","Immaculate Conception")
X25=S("12-25","Weihnachtstag","Noël","Natale","Christmas Day")
X26=S("12-26","Stephanstag","Saint-Étienne","Santo Stefano","St Stephen's Day")
X26c=S("12-26","Stephanstag","Saint-Étienne","Santo Stefano","St Stephen's Day",nwd=[2,6])
def K(de,fr,it,en,*hol):return {"n":{"de":de,"fr":fr,"it":it,"en":en},"hol":list(hol)}
CH_REG={
 "AG":K("Aargau","Argovie","Argovia","Aargau",B2,GF,EM,M1,WM,CC,ASS,AS,IMM,X26),
 "AI":K("Appenzell Innerrhoden","Appenzell Rhodes-Intérieures","Appenzello Interno","Appenzell Innerrhoden",GF,EM,WM,CC,ASS,S("09-22","Mauritiustag","Saint-Maurice","San Maurizio","St Maurice's Day"),AS,IMM,X26c),
 "AR":K("Appenzell Ausserrhoden","Appenzell Rhodes-Extérieures","Appenzello Esterno","Appenzell Ausserrhoden",GF,EM,WM,X26c),
 "BE":K("Bern","Berne","Berna","Bern",B2,GF,EM,WM,X26),
 "BL":K("Basel-Landschaft","Bâle-Campagne","Basilea Campagna","Basel-Landschaft",GF,EM,M1,WM,X26),
 "BS":K("Basel-Stadt","Bâle-Ville","Basilea Città","Basel-Stadt",GF,EM,M1,WM,X26),
 "FR":K("Freiburg","Fribourg","Friburgo","Fribourg",GF,CC,ASS,AS,IMM),
 "GE":K("Genf","Genève","Ginevra","Geneva",GF,EM,WM,S("a09-05/4","Genfer Bettag","Jeûne genevois","Digiuno ginevrino","Genevan Fast"),S("12-31","Wiederherstellung der Republik","Restauration de la République","Restaurazione della Repubblica","Restoration of the Republic")),
 "GL":K("Glarus","Glaris","Glarona","Glarus",GF,EM,S("n04/4/1~e-3/7","Näfelser Fahrt","Näfelser Fahrt","Näfelser Fahrt","Näfels Pilgrimage"),WM,AS,X26),
 "GR":K("Graubünden","Grisons","Grigioni","Graubünden",EM,WM,X26),
 "JU":K("Jura","Jura","Giura","Jura",B2,GF,EM,M1,WM,CC,S("06-23","Jahrestag des Plebiszits","Commémoration du plébiscite jurassien","Commemorazione del plebiscito giurassiano","Jura Independence Day"),ASS,AS),
 "LU":K("Luzern","Lucerne","Lucerna","Lucerne",B2,GF,EM,WM,CC,ASS,AS,IMM,X26),
 "NE":K("Neuenburg","Neuchâtel","Neuchâtel","Neuchâtel",S("03-01","Ausrufung der Republik","Instauration de la République","Instaurazione della Repubblica","Republic Day"),GF,M1),
 "NW":K("Nidwalden","Nidwald","Nidvaldo","Nidwalden",J19,GF,CC,ASS,AS,IMM),
 "OW":K("Obwalden","Obwald","Obvaldo","Obwalden",GF,CC,ASS,S("09-25","Bruderklausenfest","Fête de Saint-Nicolas de Flüe","San Nicolao della Flüe","St Nicholas of Flüe"),AS,IMM),
 "SG":K("St. Gallen","Saint-Gall","San Gallo","St. Gallen",GF,EM,WM,AS,X26),
 "SH":K("Schaffhausen","Schaffhouse","Sciaffusa","Schaffhausen",GF,EM,M1,WM,X26),
 "SO":K("Solothurn","Soleure","Soletta","Solothurn",GF,M1h,CC,ASS,AS),
 "SZ":K("Schwyz","Schwytz","Svitto","Schwyz",E6,J19,GF,EM,WM,CC,ASS,AS,IMM,X26),
 "TG":K("Thurgau","Thurgovie","Turgovia","Thurgau",B2,GF,EM,M1,WM,X26),
 "TI":K("Tessin","Tessin","Ticino","Ticino",E6,J19,EM,M1,WM,CC,PP,ASS,AS,IMM,X26),
 "UR":K("Uri","Uri","Uri","Uri",E6,J19,GF,EM,WM,CC,ASS,AS,IMM,X26c),
 "VD":K("Waadt","Vaud","Vaud","Vaud",B2,GF,EM,WM,S("a09-16/1","Bettagsmontag","Lundi du Jeûne fédéral","Lunedì del digiuno federale","Federal Fast Monday")),
 "VS":K("Wallis","Valais","Vallese","Valais",J19,CC,ASS,AS,IMM),
 "ZG":K("Zug","Zoug","Zugo","Zug",GF,CC,ASS,AS,IMM),
 "ZH":K("Zürich","Zurich","Zurigo","Zurich",B2,GF,EM,M1,WM,X26),
}
# Neuchâtel: 2 gennaio e 26 dicembre solo se il giorno prima è domenica

CH_REG["NE"]["hol"]=[S("01-01","Neujahrstag","Nouvel an","Capodanno","New Year's Day",obs="sun"),*CH_REG["NE"]["hol"],S("12-25","Weihnachtstag","Noël","Natale","Christmas Day",obs="sun")]

# --- Regno Unito
def E(r,n,**o):return H(r,n,n,**o)
UK_NY=E("01-01","New Year's Day",obs="mon");UK_GF=E("e-2","Good Friday");UK_EM=E("e1","Easter Monday")
UK_MAY=E("n05/1/1","Early May bank holiday");UK_SPR=E("n05/1/-1","Spring bank holiday")
UK_X=[E("12-25","Christmas Day",obs="mon"),E("12-26","Boxing Day",obs="mon")]
EW=[UK_NY,UK_GF,UK_EM,UK_MAY,UK_SPR,E("n08/1/-1","Summer bank holiday"),*UK_X]

COUNTRIES=[
C("CH",{"de":"Schweiz","fr":"Suisse","it":"Svizzera","en":"Switzerland"},"de",[NY,ASC,AUG1,X25],cur="CHF",night=(23,6),
  rules={"rest":11,"maxWeek":45,"weeklyRest":35},reg=CH_REG,regNone={"it":"Nessun cantone","en":"No canton","de":"Kein Kanton","fr":"Aucun canton"},
  src="Legge federale sul lavoro (LL/ArG) art. 9, 15a, 16, 20a, 21 (SECO): 11 ore di riposo, 45 o 50 ore settimanali, lavoro notturno dalle 23 alle 6; festività cantonali: Ufficio federale di giustizia, elenco dei giorni festivi riconosciuti dai cantoni",
  note="Il limite di 45 ore vale per industria, uffici, tecnici e grande distribuzione; per gli altri è 50. In alcuni comuni (Friburgo, Soletta, Argovia) le feste cambiano: aggiungi la tua come festa locale."),
C("GB",{"en":"United Kingdom","it":"Regno Unito"},"en",EW,cur="GBP",night=(23,6),
  reg={"SCT":{"n":{"en":"Scotland","it":"Scozia"},"replace":True,"hol":[UK_NY,E("01-02","2nd January",obs="mon"),UK_GF,UK_MAY,UK_SPR,E("n08/1/1","Summer bank holiday"),E("11-30","St Andrew's Day",obs="mon"),E("06-15","World Cup bank holiday",from_=2026,to=2026),*UK_X]},
       "NIR":{"n":{"en":"Northern Ireland","it":"Irlanda del Nord"},"hol":[E("03-17","St Patrick's Day",obs="mon"),E("07-12","Battle of the Boyne (Orangemen's Day)",obs="mon")]}},
  regNone={"en":"England and Wales","it":"Inghilterra e Galles"},
  src="Working Time Regulations 1998 (11 ore di riposo, media di 48 ore, notte dalle 23 alle 6); Banking and Financial Dealings Act 1971 e GOV.UK, bank holidays",
  note="Nel Regno Unito le bank holiday non sono un diritto per legge: dipende dal contratto. Il limite delle 48 ore si può derogare per iscritto (opt-out)."),
C("NO",{"nb":"Norge","en":"Norway","it":"Norvegia"},"nb",[
  H("01-01","Første nyttårsdag","New Year's Day"),H("e-3","Skjærtorsdag","Maundy Thursday"),H("e-2","Langfredag","Good Friday"),
  H("e0","Første påskedag","Easter Sunday"),H("e1","Andre påskedag","Easter Monday"),H("05-01","Arbeidernes dag","Labour Day"),
  H("05-17","Grunnlovsdag","Constitution Day"),H("e39","Kristi himmelfartsdag","Ascension Day"),H("e49","Første pinsedag","Whit Sunday"),
  H("e50","Andre pinsedag","Whit Monday"),H("12-25","Første juledag","Christmas Day"),H("12-26","Andre juledag","Boxing Day")],
  cur="NOK",night=(21,6),rules={"weeklyRest":35},
  src="Arbeidsmiljøloven §10-6, §10-8, §10-11 (11 ore di riposo, 35 ore settimanali, notte dalle 21 alle 6); lov om helligdager og helligdagsfred, lov om 1. og 17. mai"),
C("IS",{"is":"Ísland","en":"Iceland","it":"Islanda"},"is",[
  H("01-01","Nýársdagur","New Year's Day"),H("e-3","Skírdagur","Maundy Thursday"),H("e-2","Föstudagurinn langi","Good Friday"),
  H("e0","Páskadagur","Easter Sunday"),H("e1","Annar í páskum","Easter Monday"),H("a04-19/4","Sumardagurinn fyrsti","First Day of Summer"),
  H("05-01","Verkalýðsdagurinn","Labour Day"),H("e39","Uppstigningardagur","Ascension Day"),H("e49","Hvítasunnudagur","Whit Sunday"),
  H("e50","Annar í hvítasunnu","Whit Monday"),H("06-17","Þjóðhátíðardagurinn","National Day"),H("n08/1/1","Frídagur verslunarmanna","Commerce Day"),
  H("12-24","Aðfangadagur jóla (frá kl. 13)","Christmas Eve (from 1 pm)",{"it":"Vigilia di Natale (dalle 13)"}),H("12-25","Jóladagur","Christmas Day"),
  H("12-26","Annar í jólum","Boxing Day"),H("12-31","Gamlársdagur (frá kl. 13)","New Year's Eve (from 1 pm)",{"it":"San Silvestro (dalle 13)"})],
  cur="ISK",src="Legge 46/1980 sull'ambiente di lavoro, capo IX (11 ore di riposo, media di 48 ore); legge 88/1971 sulle festività"),
C("SM",{"it":"San Marino","en":"San Marino"},"it",[
  H("01-01","Capodanno","New Year's Day"),H("01-06","Epifania","Epiphany"),H("02-05","Sant'Agata, liberazione della Repubblica","St Agatha's Day"),
  H("03-25","Anniversario dell'Arengo","Anniversary of the Arengo"),H("04-01","Insediamento dei Capitani Reggenti","Investiture of the Captains Regent"),
  H("e0","Pasqua","Easter Sunday"),H("e1","Lunedì dell'Angelo","Easter Monday"),H("05-01","Festa dei lavoratori","Labour Day"),
  H("e60","Corpus Domini","Corpus Christi"),H("07-28","Caduta del fascismo e festa della libertà","Liberation from Fascism"),
  H("08-15","Assunzione","Assumption Day"),H("09-03","San Marino, fondazione della Repubblica","Foundation of the Republic"),
  H("10-01","Insediamento dei Capitani Reggenti","Investiture of the Captains Regent"),H("11-01","Ognissanti","All Saints' Day"),
  H("11-02","Commemorazione dei defunti","All Souls' Day"),H("12-08","Immacolata Concezione","Immaculate Conception"),
  H("12-25","Natale","Christmas Day"),H("12-26","Santo Stefano","St Stephen's Day")],
  src="Festività: Repubblica di San Marino, elenco delle feste nazionali; regole di riposo: valori di riferimento europei, verifica il tuo contratto",
  note="Per orari e riposi valgono soprattutto i contratti collettivi sammarinesi: controlla i valori qui sotto."),
C("MC",{"fr":"Monaco","en":"Monaco","it":"Principato di Monaco"},"fr",[
  H("01-01","Jour de l'An","New Year's Day",{"it":"Capodanno"},obs="sun"),H("01-27","Sainte-Dévote","St Devota's Day",{"it":"Santa Devota"},obs="sun"),
  H("e1","Lundi de Pâques","Easter Monday",{"it":"Lunedì di Pasqua"}),H("05-01","Fête du Travail","Labour Day",{"it":"Festa del lavoro"},obs="sun"),
  H("e39","Ascension","Ascension Day",{"it":"Ascensione"}),H("e50","Lundi de Pentecôte","Whit Monday",{"it":"Lunedì di Pentecoste"}),
  H("e60","Fête-Dieu","Corpus Christi",{"it":"Corpus Domini"}),H("08-15","Assomption","Assumption Day",{"it":"Assunzione"},obs="sun"),
  H("11-01","Toussaint","All Saints' Day",{"it":"Ognissanti"},obs="sun"),H("11-19","Fête du Prince","National Day",{"it":"Festa del Principe"},obs="sun"),
  H("12-08","Immaculée Conception","Immaculate Conception",{"it":"Immacolata"},obs="sun"),H("12-25","Noël","Christmas Day",{"it":"Natale"},obs="sun")],
  src="Loi n° 798 du 18 février 1966 sur les jours fériés légaux (Gouvernement Princier); regole di riposo: valori di riferimento europei, verifica il tuo contratto",
  note="Se una festa cade di domenica, si recupera il lunedì."),
C("LI",{"de":"Liechtenstein","en":"Liechtenstein","it":"Liechtenstein"},"de",[
  H("01-01","Neujahr","New Year's Day"),H("01-06","Heilige Drei Könige","Epiphany"),H("02-02","Mariä Lichtmess","Candlemas"),
  H("03-19","Josefstag","St Joseph's Day"),H("e1","Ostermontag","Easter Monday"),
  H("05-01","Tag der Arbeit","Labour Day"),H("e39","Christi Himmelfahrt","Ascension Day"),H("e50","Pfingstmontag","Whit Monday"),
  H("e60","Fronleichnam","Corpus Christi"),H("08-15","Staatsfeiertag","National Day"),H("09-08","Mariä Geburt","Nativity of Mary"),
  H("11-01","Allerheiligen","All Saints' Day"),H("12-08","Mariä Empfängnis","Immaculate Conception"),
  H("12-25","Weihnachten","Christmas Day"),H("12-26","Stephanstag","St Stephen's Day")],
  cur="CHF",night=(23,6),rules={"maxWeek":45,"weeklyRest":35},
  src="Arbeitsgesetz del Liechtenstein (riposo, 45 o 50 ore, notte dalle 23 alle 6); festività: Landesverwaltung Liechtenstein",
  note="Il limite di 45 ore vale per industria, uffici e grande distribuzione; per gli altri è 50."),
]
