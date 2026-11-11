from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("DV",__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)),"..","..","fonts","pdf-Regular.ttf")))
def mk(path,rows,font="DV",size=8,lh=13):
    c=canvas.Canvas(path,pagesize=A4);c.setFont(font,size);y=805
    for r in rows:
        if r=="":y-=lh;continue
        for x,t,*al in r:
            if al and al[0]=="r":c.drawRightString(x,y,t)
            else:c.drawString(x,y,t)
        y-=lh
    c.save()
T=lambda *cols:[(x,t,a) for x,t,a in cols]
# US
mk("us.pdf",[[(30,"Earning Statement - Acme Logistics LLC")],[(30,"Pay Period: 10/12/2026 - 10/25/2026"),(330,"Pay Date: 10/30/2026")],"",
 [(30,"Earnings"),(170,"Rate"),(230,"Hours"),(300,"This Period"),(400,"YTD")],
 [(30,"Regular"),(200,"$22.50","r"),(260,"80.00","r"),(350,"$1,800.00","r"),(450,"$36,000.00","r")],
 [(30,"Overtime"),(200,"$33.75","r"),(260,"6.50","r"),(350,"$219.38","r"),(450,"$1,920.00","r")],
 [(30,"Night Shift Differential"),(200,"$2.00","r"),(260,"24.00","r"),(350,"$48.00","r"),(450,"$600.00","r")],
 [(30,"Holiday Worked"),(200,"$33.75","r"),(260,"8.00","r"),(350,"$270.00","r"),(450,"$540.00","r")],
 [(30,"Vacation"),(200,"$22.50","r"),(260,"16.00","r"),(350,"$360.00","r"),(450,"$900.00","r")],
 [(30,"Gross Pay"),(350,"$2,697.38","r"),(450,"$39,960.00","r")],"",
 [(30,"Deductions"),(300,"This Period"),(400,"YTD")],[(30,"Federal Income Tax"),(350,"$310.00","r"),(450,"$4,600.00","r")],
 [(30,"Net Pay"),(350,"$2,051.12","r"),(450,"$30,100.00","r")],[(30,"YTD Net"),(350,"$30,100.00","r")],
 [(30,"PTO Balance"),(150,"64.00 hrs")]])
# UK
mk("uk.pdf",[[(30,"PAYSLIP"),(330,"Pay date: 31 October 2026")],[(30,"Tax period: 7"),(330,"Tax code: 1257L")],"",
 [(30,"Description"),(200,"Units"),(260,"Rate"),(330,"Amount"),(420,"Total to date")],
 [(30,"Basic pay"),(230,"160.00","r"),(290,"12.50","r"),(370,"2,000.00","r"),(470,"14,000.00","r")],
 [(30,"Overtime x1.5"),(230,"9.00","r"),(290,"18.75","r"),(370,"168.75","r"),(470,"900.00","r")],
 [(30,"Night premium"),(230,"40.00","r"),(290,"1.50","r"),(370,"60.00","r"),(470,"420.00","r")],
 [(30,"Bank holiday premium"),(230,"0.00","r"),(290,"12.50","r"),(370,"0.00","r"),(470,"100.00","r")],
 [(30,"Holiday pay"),(230,"3.00","r"),(290,"100.00","r"),(370,"300.00","r"),(470,"1,200.00","r")],"",
 [(30,"Total gross pay"),(370,"2,528.75","r"),(470,"16,620.00","r")],[(30,"PAYE tax"),(370,"300.00","r")],[(30,"Net pay"),(370,"2,007.43","r")],"",
 [(30,"Holiday entitlement"),(150,"28 days"),(230,"Taken"),(280,"12 days"),(330,"Remaining"),(400,"16 days")]])
# DE
mk("de.pdf",[[(30,"Musterfirma GmbH"),(330,"Abrechnung der Brutto/Netto-Bezüge")],[(30,"Abrechnungsmonat: Oktober 2026")],"",
 [(30,"Lohnart"),(70,"Bezeichnung"),(250,"Menge"),(310,"Faktor"),(400,"Betrag")],
 [(30,"1000"),(70,"Gehalt"),(430,"3.200,00","r")],
 [(30,"1200"),(70,"Überstunden"),(280,"12,00","r"),(340,"18,50","r"),(430,"222,00","r")],
 [(30,"1210"),(70,"Überstundenzuschlag 25%"),(280,"12,00","r"),(340,"4,62","r"),(430,"55,44","r")],
 [(30,"1300"),(70,"Nachtzuschlag 25%"),(280,"35,50","r"),(340,"4,62","r"),(430,"164,01","r")],
 [(30,"1310"),(70,"Sonntagszuschlag 50%"),(280,"16,00","r"),(340,"9,25","r"),(430,"148,00","r")],
 [(30,"1320"),(70,"Feiertagszuschlag 125%"),(280,"8,00","r"),(340,"23,12","r"),(430,"184,96","r")],"",
 [(30,"Gesamtbrutto"),(430,"3.974,41","r")],[(30,"Steuer-Brutto"),(430,"3.974,41","r")],[(30,"Nettoverdienst"),(430,"2.611,20","r")],[(30,"Auszahlungsbetrag"),(430,"2.561,20","r")],"",
 [(30,"Urlaub")],[(130,"Anspruch"),(200,"Genommen"),(270,"Rest")],
 [(30,"Vorjahr"),(170,"5,00","r"),(240,"0,00","r"),(300,"5,00","r")],
 [(30,"lfd. Jahr"),(170,"30,00","r"),(240,"3,00","r"),(300,"14,00","r")]])
# FR
mk("fr.pdf",[[(30,"BULLETIN DE PAIE"),(330,"Période du 01/10/2026 au 31/10/2026")],"",
 [(30,"Éléments de paie"),(250,"Base"),(310,"Taux"),(380,"Montant salarial")],
 [(30,"Salaire de base"),(280,"151,67","r"),(340,"14,50","r"),(430,"2 199,22","r")],
 [(30,"Heures supplémentaires 25 %"),(280,"8,00","r"),(340,"18,13","r"),(430,"145,04","r")],
 [(30,"Heures supplémentaires 50 %"),(280,"2,00","r"),(340,"21,75","r"),(430,"43,50","r")],
 [(30,"Majoration heures de nuit"),(280,"21,00","r"),(340,"2,90","r"),(430,"60,90","r")],
 [(30,"Majoration dimanche"),(280,"7,00","r"),(340,"7,25","r"),(430,"50,75","r")],
 [(30,"Absence congés payés"),(280,"2,00","r")],
 [(30,"SALAIRE BRUT"),(430,"2 499,41","r")],"",
 [(30,"NET À PAYER AVANT IMPÔT SUR LE REVENU"),(430,"1 948,22","r")],[(30,"Impôt sur le revenu prélevé à la source"),(430,"74,03","r")],[(30,"NET PAYÉ EN EUROS"),(430,"1 874,19","r")],"",
 [(30,"Congés payés"),(150,"N-1"),(210,"N")],
 [(30,"Acquis"),(180,"25,00","r"),(240,"12,50","r")],[(30,"Pris"),(180,"2,00","r"),(240,"0,00","r")],[(30,"Solde"),(180,"23,00","r"),(240,"12,50","r")]])
# NL
mk("nl.pdf",[[(30,"Salarisspecificatie: Oktober 2026")],"",
 [(30,"Omschrijving"),(250,"Aantal"),(310,"Tarief"),(400,"Bedrag")],
 [(30,"Salaris"),(280,"156,00 uur","r"),(340,"15,18","r"),(430,"2.368,08","r")],
 [(30,"Overuren 125%"),(280,"6,00","r"),(340,"18,98","r"),(430,"113,88","r")],
 [(30,"Nachttoeslag 30%"),(280,"10,00","r"),(340,"4,55","r"),(430,"45,50","r")],
 [(30,"Zondagtoeslag 50%"),(280,"8,00","r"),(340,"7,59","r"),(430,"60,72","r")],
 [(30,"Vakantiegeld 8%"),(340,"8,00","r"),(430,"206,49","r")],
 [(30,"Brutoloon"),(430,"2.794,67","r")],[(30,"Nettoloon"),(430,"2.230,10","r")],[(30,"Te betalen loon"),(430,"2.211,40","r")],"",
 [(30,"Verlof (uren)"),(150,"Beginsaldo"),(210,"Opbouw"),(270,"Opname"),(330,"Eindsaldo")],
 [(30,"Vakantie-uren"),(180,"80,00","r"),(240,"12,00","r"),(300,"16,00","r"),(360,"76,00","r")]])
# SE
mk("se.pdf",[[(30,"Lönespecifikation"),(330,"Löneperiod 2026-10-01 - 2026-10-31")],"",
 [(30,"Löneart"),(250,"Antal"),(310,"À-pris"),(400,"Belopp")],
 [(30,"Månadslön"),(430,"32 000,00","r")],
 [(30,"Övertid 50%"),(280,"5,00","r"),(340,"280,00","r"),(430,"1 400,00","r")],
 [(30,"OB natt"),(280,"12,00","r"),(340,"52,00","r"),(430,"624,00","r")],
 [(30,"OB helg"),(280,"8,00","r"),(340,"61,00","r"),(430,"488,00","r")],
 [(30,"Bruttolön"),(430,"34 512,00","r")],[(30,"Preliminär skatt"),(430,"-9 100,00","r")],[(30,"Att utbetala"),(430,"25 412,00","r")],"",
 [(30,"Betalda semesterdagar"),(200,"25")],[(30,"Uttagna semesterdagar"),(200,"3")],[(30,"Resterande semesterdagar"),(200,"22")]])
# PL
mk("pl.pdf",[[(30,"Pasek wynagrodzenia — lista płac za październik 2026")],"",
 [(30,"Składnik"),(250,"Ilość"),(310,"Stawka"),(400,"Kwota")],
 [(30,"Wynagrodzenie zasadnicze"),(430,"5 600,00","r")],
 [(30,"Godziny nadliczbowe 50%"),(280,"6,00","r"),(340,"50,00","r"),(430,"300,00","r")],
 [(30,"Dodatek za pracę w porze nocnej"),(280,"20,00","r"),(340,"4,80","r"),(430,"96,00","r")],
 [(30,"Wynagrodzenie brutto"),(430,"5 996,00","r")],[(30,"Do wypłaty"),(430,"4 343,64","r")],"",
 [(30,"Urlop wypoczynkowy wykorzystany"),(250,"2 dni")],[(30,"Pozostały urlop"),(250,"18 dni")]])
# BR
mk("br.pdf",[[(30,"RECIBO DE PAGAMENTO DE SALÁRIO"),(330,"Mês/Ano: 10/2026")],"",
 [(30,"Cód."),(70,"Descrição"),(250,"Referência"),(330,"Vencimentos"),(430,"Descontos")],
 [(30,"001"),(70,"SALÁRIO BASE"),(290,"30,00","r"),(380,"3.000,00","r")],
 [(30,"050"),(70,"HORAS EXTRAS 50%"),(290,"10,00","r"),(380,"204,55","r")],
 [(30,"051"),(70,"DSR S/ HORAS EXTRAS"),(290,"4,00","r"),(380,"40,91","r")],
 [(30,"060"),(70,"ADICIONAL NOTURNO 20%"),(290,"30,00","r"),(380,"81,82","r")],
 [(30,"900"),(70,"INSS"),(290,"9,00","r"),(470,"295,62","r")],
 [(70,"TOTAL DE VENCIMENTOS"),(380,"3.327,28","r"),(400,"TOTAL DE DESCONTOS"),(520,"512,40","r")],
 [(70,"VALOR LÍQUIDO"),(380,"2.814,88","r")]])
# AU
mk("au.pdf",[[(30,"Pay slip"),(330,"Pay period: 13/10/2026 to 26/10/2026")],"",
 [(30,"Description"),(250,"Hours/units"),(320,"Rate"),(400,"Total")],
 [(30,"Ordinary hours"),(290,"76.00","r"),(350,"30.50","r"),(430,"2,318.00","r")],
 [(30,"Overtime (time and a half)"),(290,"4.00","r"),(350,"45.75","r"),(430,"183.00","r")],
 [(30,"Night shift loading 15%"),(290,"15.20","r"),(350,"4.58","r"),(430,"69.62","r")],
 [(30,"Sunday penalty 50%"),(290,"7.60","r"),(350,"15.25","r"),(430,"115.90","r")],
 [(30,"Annual leave taken"),(290,"7.60","r"),(350,"30.50","r"),(430,"231.80","r")],
 [(30,"Total gross payment"),(430,"2,918.32","r")],[(30,"Total net payment"),(430,"2,301.50","r")],"",
 [(30,"Annual leave balance"),(250,"120.50 hrs")]])
# AT
mk("at.pdf",[[(30,"Lohn-/Gehaltsabrechnung für Oktober 2026")],"",
 [(30,"Lohnart"),(250,"Anzahl"),(310,"Satz"),(400,"Betrag")],
 [(30,"Gehalt"),(430,"2.900,00","r")],
 [(30,"Überstunden 50%"),(280,"10,00","r"),(340,"25,10","r"),(430,"251,00","r")],
 [(30,"Überstundenzuschlag 50%"),(280,"10,00","r"),(340,"8,37","r"),(430,"83,70","r")],
 [(30,"Sonderzahlung Urlaubszuschuss"),(430,"2.900,00","r")],
 [(30,"Brutto gesamt"),(430,"6.134,70","r")],[(30,"Auszahlung"),(430,"4.010,55","r")]])
print("ok")
