# Americhe e Oceania: US, CA, MX, BR, AR, AU, NZ
from eu import H
from noneu import C
def E(r,n,**o):return H(r,n,n,**o)
def F(r,en,fr,**o):return H(r,en,en,{"fr":fr},**o)

# --- Stati Uniti (festività federali, OPM 5 U.S.C. 6103)
US=[E("01-01","New Year's Day",obs="near"),E("n01/1/3","Martin Luther King Jr. Day"),E("n02/1/3","Washington's Birthday (Presidents' Day)"),
 E("n05/1/-1","Memorial Day"),E("06-19","Juneteenth",obs="near",from_=2021),E("07-04","Independence Day",obs="near"),E("n09/1/1","Labor Day"),
 E("n10/1/2","Columbus Day"),E("11-11","Veterans Day",obs="near"),E("n11/4/4","Thanksgiving Day"),E("12-25","Christmas Day",obs="near")]

# --- Canada
cNY=F("01-01","New Year's Day","Jour de l'An");cGF=F("e-2","Good Friday","Vendredi saint");cVIC=F("b05-24/1","Victoria Day","Fête de la Reine")
cCAN=F("s07-01/0/1","Canada Day","Fête du Canada");cLAB=F("n09/1/1","Labour Day","Fête du Travail")
cTR=F("09-30","National Day for Truth and Reconciliation","Journée nationale de la vérité et de la réconciliation",from_=2021)
cTH=F("n10/1/2","Thanksgiving","Action de grâce");cREM=F("11-11","Remembrance Day","Jour du Souvenir")
cX=F("12-25","Christmas Day","Noël",obs="mon");cBOX=F("12-26","Boxing Day","Lendemain de Noël",obs="mon")
cFAM=F("n02/1/3","Family Day","Fête de la famille");cAUG=lambda n,fr:F("n08/1/1",n,fr)
cIND=F("06-21","National Indigenous Peoples Day","Journée nationale des peuples autochtones")
def P(en,fr,*hol):return {"n":{"en":en,"fr":fr},"replace":True,"hol":list(hol)}
CA_REG={
 "AB":P("Alberta","Alberta",cNY,cFAM,cGF,cVIC,cCAN,cLAB,cTH,cREM,cX),
 "BC":P("British Columbia","Colombie-Britannique",cNY,cFAM,cGF,cVIC,cCAN,cAUG("British Columbia Day","Jour de la Colombie-Britannique"),cLAB,F("09-30","National Day for Truth and Reconciliation","Journée nationale de la vérité et de la réconciliation",from_=2023),cTH,cREM,cX),
 "MB":P("Manitoba","Manitoba",cNY,F("n02/1/3","Louis Riel Day","Journée Louis-Riel"),cGF,cVIC,cCAN,cLAB,F("09-30","National Day for Truth and Reconciliation","Journée nationale de la vérité et de la réconciliation",from_=2023),cTH,cX),
 "NB":P("New Brunswick","Nouveau-Brunswick",cNY,cFAM,cGF,cCAN,cAUG("New Brunswick Day","Fête du Nouveau-Brunswick"),cLAB,cREM,cX),
 "NS":P("Nova Scotia","Nouvelle-Écosse",cNY,F("n02/1/3","Heritage Day","Jour du patrimoine"),cGF,cCAN,cLAB,F("11-11","Remembrance Day","Jour du Souvenir",obs="mon"),cX),
 "ON":P("Ontario","Ontario",cNY,cFAM,cGF,cVIC,cCAN,cLAB,cTH,cX,cBOX),
 "PE":P("Prince Edward Island","Île-du-Prince-Édouard",cNY,F("n02/1/3","Islander Day","Fête des Insulaires"),cGF,cCAN,cLAB,F("09-30","National Day for Truth and Reconciliation","Journée nationale de la vérité et de la réconciliation",from_=2022),cREM,cX),
 "QC":{"n":{"en":"Quebec","fr":"Québec"},"replace":True,"hol":[cNY,cGF,F("b05-24/1","National Patriots' Day","Journée nationale des patriotes"),F("s06-24/0/1","Saint-Jean-Baptiste Day","Fête nationale du Québec"),cCAN,cLAB,cTH,cX]},
 "SK":P("Saskatchewan","Saskatchewan",cNY,cFAM,cGF,cVIC,cCAN,cAUG("Saskatchewan Day","Fête de la Saskatchewan"),cLAB,cTH,cREM,cX),
 "NT":P("Northwest Territories","Territoires du Nord-Ouest",cNY,cGF,cVIC,cIND,cCAN,cAUG("Civic Holiday","Premier lundi d'août"),cLAB,cTR,cTH,cREM,cX),
 "NU":P("Nunavut","Nunavut",cNY,cGF,cVIC,cCAN,F("07-09","Nunavut Day","Jour du Nunavut"),cAUG("Civic Holiday","Premier lundi d'août"),cLAB,cTR,cTH,cREM,cX),
 "YT":P("Yukon","Yukon",cNY,cGF,cVIC,cIND,cCAN,F("n08/1/3","Discovery Day","Jour de la Découverte"),cLAB,F("09-30","National Day for Truth and Reconciliation","Journée nationale de la vérité et de la réconciliation",from_=2023),cTH,cREM,cX),
}
CA=[cNY,cGF,cVIC,cCAN,cLAB,cTR,cTH,cREM,cX,cBOX]

# --- Messico (LFT art. 74)
MX=[H("01-01","Año Nuevo","New Year's Day"),H("n02/1/1","Día de la Constitución","Constitution Day"),H("n03/1/3","Natalicio de Benito Juárez","Benito Juárez's Birthday"),
 H("05-01","Día del Trabajo","Labour Day"),H("09-16","Día de la Independencia","Independence Day"),H("10-01","Transmisión del Poder Ejecutivo Federal","Presidential Inauguration",from_=2030,to=2030),
 H("n11/1/3","Día de la Revolución","Revolution Day"),H("12-25","Navidad","Christmas Day")]

# --- Brasile
BR=[H("01-01","Confraternização Universal","New Year's Day"),H("e-2","Paixão de Cristo","Good Friday"),H("04-21","Tiradentes","Tiradentes"),
 H("05-01","Dia do Trabalho","Labour Day"),H("09-07","Independência do Brasil","Independence Day"),H("10-12","Nossa Senhora Aparecida","Our Lady of Aparecida"),
 H("11-02","Finados","All Souls' Day"),H("11-15","Proclamação da República","Republic Day"),H("11-20","Dia Nacional de Zumbi e da Consciência Negra","Black Consciousness Day",from_=2024),
 H("12-25","Natal","Christmas Day")]

# --- Argentina (Ley 27.399)
AR=[H("01-01","Año Nuevo","New Year's Day"),H("e-48","Carnaval","Carnival"),H("e-47","Carnaval","Carnival"),
 H("03-24","Día Nacional de la Memoria por la Verdad y la Justicia","Remembrance Day for Truth and Justice"),
 H("04-02","Día del Veterano y de los Caídos en la Guerra de Malvinas","Malvinas Day"),H("e-2","Viernes Santo","Good Friday"),
 H("05-01","Día del Trabajador","Labour Day"),H("05-25","Día de la Revolución de Mayo","May Revolution Day"),
 H("06-17","Paso a la Inmortalidad del General Martín Miguel de Güemes","Güemes Day",obs="arg"),H("06-20","Paso a la Inmortalidad del General Manuel Belgrano","Flag Day"),
 H("07-09","Día de la Independencia","Independence Day"),H("08-17","Paso a la Inmortalidad del General José de San Martín","San Martín Day",obs="ar"),
 H("10-12","Día del Respeto a la Diversidad Cultural","Cultural Diversity Day",obs="ar"),H("11-20","Día de la Soberanía Nacional","National Sovereignty Day",obs="ar"),
 H("12-08","Inmaculada Concepción de María","Immaculate Conception"),H("12-25","Navidad","Christmas Day")]

# --- Australia
aNY=E("01-01","New Year's Day",obs="mon");aAU=E("01-26","Australia Day",obs="mon");aGF=E("e-2","Good Friday");aES=E("e-1","Easter Saturday")
aEU=E("e0","Easter Sunday");aEM=E("e1","Easter Monday");aAZ=E("04-25","Anzac Day");aAZm=E("04-25","Anzac Day",obs="mon")
aKB=E("n06/1/2","King's Birthday");aX=E("12-25","Christmas Day",obs="mon");aBX=E("12-26","Boxing Day",obs="mon")
def S(n,*hol):return {"n":{"en":n},"hol":list(hol)}
AU_REG={
 "ACT":S("Australian Capital Territory",E("n03/1/2","Canberra Day"),aES,aEU,aAZm,E("a05-27/1","Reconciliation Day",from_=2018),aKB,E("n10/1/1","Labour Day")),
 "NSW":S("New South Wales",aES,aEU,aAZm,aKB,E("n10/1/1","Labour Day")),
 "NT":S("Northern Territory",aES,aEU,E("n05/1/1","May Day"),E("04-25","Anzac Day",obs="sun"),aKB,E("n08/1/1","Picnic Day"),E("12-24","Christmas Eve (from 7 pm)"),E("12-31","New Year's Eve (from 7 pm)")),
 "QLD":S("Queensland",aES,aEU,E("04-25","Anzac Day",obs="sun"),E("n05/1/1","Labour Day"),E("n10/1/1","King's Birthday"),E("12-24","Christmas Eve (from 6 pm)")),
 "SA":S("South Australia",E("n03/1/2","Adelaide Cup Day"),aES,aEU,aKB,E("n10/1/1","Labour Day"),E("12-24","Christmas Eve (from 7 pm)"),E("12-31","New Year's Eve (from 7 pm)")),
 "TAS":{"n":{"en":"Tasmania"},"replace":True,"hol":[aNY,aAU,E("n03/1/2","Eight Hours Day"),aGF,aEM,aAZ,aKB,aX,E("12-26","Boxing Day",obs="move")]},
 "VIC":S("Victoria",E("n03/1/2","Labour Day"),aES,aEU,aKB,E("09-25","Friday before the AFL Grand Final",from_=2026,to=2026),E("09-24","Friday before the AFL Grand Final",from_=2027,to=2027),E("n11/2/1","Melbourne Cup")),
 "WA":S("Western Australia",E("n03/1/1","Labour Day"),aEU,aAZm,E("n06/1/1","Western Australia Day"),E("n09/1/-1","King's Birthday")),
}
AU=[aNY,aAU,aGF,aEM,aAZ,aX,aBX]

# --- Nuova Zelanda
MAT={2022:"06-24",2023:"07-14",2024:"06-28",2025:"06-20",2026:"07-10",2027:"06-25",2028:"07-14",2029:"07-06",2030:"06-21",2031:"07-11",2032:"07-02",
 2033:"06-24",2034:"07-07",2035:"06-29",2036:"07-18",2037:"07-10",2038:"06-25",2039:"07-15",2040:"07-06",2041:"07-19",2042:"07-11",2043:"07-03",
 2044:"06-24",2045:"07-07",2046:"06-29",2047:"07-19",2048:"07-03",2049:"06-25",2050:"07-15",2051:"06-30",2052:"06-21"}
NZ=[E("01-01","New Year's Day",obs="mon"),E("01-02","Day after New Year's Day",obs="mon"),E("02-06","Waitangi Day",obs="mon"),
 E("e-2","Good Friday"),E("e1","Easter Monday"),E("04-25","Anzac Day",obs="mon"),E("n06/1/1","King's Birthday"),
 *[E(d,"Matariki",from_=y,to=y) for y,d in MAT.items()],E("n10/1/4","Labour Day"),E("12-25","Christmas Day",obs="mon"),E("12-26","Boxing Day",obs="mon")]
NZ_REG={"AUK":S("Auckland",E("a01-26/1","Auckland Anniversary Day")),"WGN":S("Wellington",E("a01-19/1","Wellington Anniversary Day")),
 "CAN":S("Canterbury",E("a11-11/5","Canterbury Anniversary Day (Show Day)"))}

COUNTRIES=[
C("US",{"en":"United States","it":"Stati Uniti","es":"Estados Unidos"},"en",US,cur="USD",ws=0,
  rules={"rest":8,"maxWeek":40,"adv":1},
  src="Fair Labor Standards Act (straordinario oltre 40 ore a settimana; nessun riposo minimo federale); festività federali: 5 U.S.C. 6103 e U.S. Office of Personnel Management",
  note="Le festività federali valgono per legge solo per i dipendenti pubblici federali: nel privato dipende dal contratto. Ogni stato ha le sue feste: aggiungi la tua come festa locale."),
C("CA",{"en":"Canada","fr":"Canada","it":"Canada"},"en",CA,cur="CAD",ws=0,reg=CA_REG,
  regNone={"en":"Federally regulated workplaces","fr":"Secteurs de compétence fédérale","it":"Settori di competenza federale"},
  rules={"rest":8,"maxWeek":48},
  src="Code canadien du travail / Canada Labour Code (8 ore di riposo tra due turni, 40 ore normali e 48 al massimo); festività: leggi sul lavoro di ogni provincia e territorio",
  note="Orari e riposi possono cambiare da provincia a provincia: controlla i valori qui sotto. Terranova e Labrador non è ancora inclusa."),
C("MX",{"es":"México","en":"Mexico","it":"Messico"},"es",MX,cur="MXN",night=(20,6),
  rules={"rest":8,"maxWeek":48,"maxWeekBy":{"2027":46,"2028":44,"2029":42,"2030":40},"adv":1},
  src="Ley Federal del Trabajo, art. 60, 61, 69, 74; riforma della giornata lavorativa (DOF, 2026): 46 ore nel 2027, 44 nel 2028, 42 nel 2029, 40 dal 2030",
  note="Anche i giorni delle elezioni federali e locali sono festivi per chi deve votare."),
C("BR",{"pt":"Brasil","en":"Brazil","it":"Brasile"},"pt",BR,cur="BRL",ws=0,night=(22,5),
  rules={"rest":11,"maxWeek":44,"weeklyRest":24},
  src="CLT art. 66, 67, 73 e Costituzione art. 7 (11 ore di riposo, 44 ore settimanali, notte dalle 22 alle 5); Lei 662/1949, 6.802/1980, 14.759/2023",
  note="Carnevale e Corpus Domini sono «ponto facultativo»; ogni stato e comune aggiunge le sue feste: aggiungi la tua come festa locale."),
C("AR",{"es":"Argentina","en":"Argentina","it":"Argentina"},"es",AR,cur="ARS",night=(21,6),
  rules={"rest":12,"maxWeek":48,"weeklyRest":35},
  src="Ley de Contrato de Trabajo 20.744 art. 197, 200, 204 e Ley 11.544 (12 ore di riposo, 48 ore settimanali, notte dalle 21 alle 6); feriados: Ley 27.399",
  note="Il governo può spostare i feriados trasladables (17 giugno, 17 agosto, 12 ottobre, 20 novembre) e aggiungere giorni non lavorativi: qui trovi le date fissate dalla legge."),
C("AU",{"en":"Australia","it":"Australia"},"en",AU,cur="AUD",reg=AU_REG,regNone={"en":"No state or territory","it":"Nessuno stato o territorio"},
  rules={"rest":10,"maxWeek":38,"adv":1},
  src="Fair Work Act 2009, National Employment Standards (38 ore settimanali più ore ragionevoli); festività: Fair Work Ombudsman, public holidays per stato e territorio",
  note="Molti contratti collettivi (award) prevedono 10 ore di riposo tra due turni. Alcune feste valgono solo in certe zone (Royal Show, Regatta, Recreation Day): puoi aggiungere la tua come festa locale."),
C("NZ",{"en":"New Zealand","mi":"Aotearoa","it":"Nuova Zelanda"},"en",NZ,cur="NZD",reg=NZ_REG,regNone={"en":"Other region","it":"Altra regione"},
  rules={"rest":8,"maxWeek":40,"adv":1},
  src="Holidays Act 2003 e Te Kāhui o Matariki Public Holiday Act 2022 (date di Matariki fino al 2052, MBIE); Employment Relations Act 2000",
  note="Ogni provincia ha il suo Anniversary Day: se la tua non è in elenco, aggiungila come festa locale."),
]
