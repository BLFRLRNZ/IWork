from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
W,H=A4
def A(path):
    c=canvas.Canvas(path,pagesize=A4);c.setFont("Helvetica-Bold",9)
    c.drawString(30,810,"ACME SERVIZI S.R.L.");c.setFont("Helvetica",7)
    c.drawString(30,800,"Via Roma 1 - 20100 Milano   C.F. 01234567890")
    c.drawString(380,810,"PERIODO DI RETRIBUZIONE");c.setFont("Helvetica-Bold",9);c.drawString(380,800,"OTTOBRE 2026")
    c.setFont("Helvetica",7);c.drawString(30,780,"Dipendente: ROSSI MARIO   Matricola 0042   Livello 4   Qualifica Operaio")
    c.drawString(30,770,"Data assunzione 01/03/2019   CCNL Metalmeccanica Industria   Ore settimanali 40,00   Divisore orario 173")
    y=745;c.setFont("Helvetica-Bold",7)
    for x,t in [(30,"COD."),(70,"DESCRIZIONE"),(300,"ORE/GG"),(360,"IMPORTO BASE"),(445,"COMPETENZE"),(515,"TRATTENUTE")]:c.drawString(x,y,t)
    c.setFont("Helvetica",7)
    rows=[("0001","Retribuzione ordinaria","168,00","11,56214","1.942,44",""),
          ("0210","Straordinario 25%","10,00","14,45268","144,53",""),
          ("0215","Straordinario 50%","4,00","17,34321","69,37",""),
          ("0300","Maggiorazione notturna 20%","22,00","2,31243","50,87",""),
          ("0320","Lavoro festivo","8,00","5,78107","46,25",""),
          ("0400","Ferie godute","16,00","11,56214","",""),
          ("0410","Permessi R.O.L. goduti","4,00","11,56214","",""),
          ("0510","Indennità di reperibilità","2,00","20,00000","40,00",""),
          ("9001","Contributo IVS 9,19%","","2.293,46","","210,77"),
          ("9100","Ritenute IRPEF","","2.082,69","","389,12"),
          ("9200","Addizionale regionale","","","","25,40")]
    for r in rows:
        y-=12
        c.drawString(30,y,r[0]);c.drawString(70,y,r[1])
        for x,v in [(330,r[2]),(400,r[3]),(490,r[4]),(560,r[5])]:
            if v:c.drawRightString(x,y,v)
    y-=30;c.setFont("Helvetica-Bold",7)
    for x,t in [(30,"TOTALE COMPETENZE"),(150,"TOTALE TRATTENUTE"),(280,"ARROTONDAMENTO"),(420,"NETTO DEL MESE")]:c.drawString(x,y,t)
    y-=12;c.setFont("Helvetica",8)
    for x,v in [(100,"2.293,46"),(220,"625,29"),(330,"0,83"),(480,"1.669,00")]:c.drawRightString(x,y,v)
    y-=30;c.setFont("Helvetica-Bold",7)
    for x,t in [(120,"RESIDUO A.P."),(190,"MATURATO"),(255,"GODUTO"),(315,"SALDO")]:c.drawString(x,y,t)
    c.setFont("Helvetica",7)
    for lab,vals in [("FERIE (ORE)",["40,00","13,33","16,00","37,33"]),("PERMESSI (ORE)",["20,00","6,00","4,00","22,00"])]:
        y-=11;c.drawString(30,y,lab)
        for x,v in zip([160,225,285,345],vals):c.drawRightString(x,y,v)
    c.save()
def B(path):
    c=canvas.Canvas(path,pagesize=A4);c.setFont("Times-Bold",10)
    c.drawString(40,800,"Comune di Esempio - Cedolino stipendio");c.setFont("Times-Roman",9)
    c.drawString(40,786,"Mese: 10/2026     Dipendente: Bianchi Anna     Cat. C1")
    y=760;c.setFont("Times-Bold",9)
    for x,t in [(40,"Voce"),(250,"Q.tà"),(320,"Unitario"),(420,"Competenze"),(500,"Ritenute")]:c.drawString(x,y,t)
    c.setFont("Times-Roman",9)
    rows=[("Stipendio tabellare","","","1.800,00",""),("Lavoro straordinario diurno","6,50","15,20","98,80",""),
          ("Lavoro straordinario notturno/festivo","3,00","17,10","51,30",""),("Indennità turno notturno","18,00","1,20","21,60",""),
          ("Compenso domenicale","12,00","3,10","37,20",""),("Ritenuta previdenziale","","","","198,00")]
    for r in rows:
        y-=14;c.drawString(40,y,r[0])
        for x,v in [(275,r[1]),(355,r[2]),(470,r[3]),(545,r[4])]:
            if v:c.drawRightString(x,y,v)
    y-=30;c.drawString(40,y,"Totale lordo");c.drawRightString(470,y,"2.008,90")
    y-=14;c.setFont("Times-Bold",10);c.drawString(40,y,"NETTO A PAGARE");c.drawRightString(470,y,"€ 1.523,00")
    c.setFont("Times-Roman",9);y-=30
    c.drawString(40,y,"Ferie godute gg");c.drawRightString(160,y,"2,00");c.drawString(200,y,"Ferie residue gg");c.drawRightString(330,y,"12,50")
    y-=14;c.drawString(40,y,"Permessi goduti ore");c.drawRightString(160,y,"3,00");c.drawString(200,y,"ROL residui ore");c.drawRightString(330,y,"18,00")
    c.save()
def Img(path):
    c=canvas.Canvas(path,pagesize=A4);c.rect(30,30,500,700,fill=1);c.save()
A("busta_a.pdf");B("busta_b.pdf");Img("busta_scan.pdf")
w=PdfWriter();w.append(PdfReader("busta_a.pdf"));w.encrypt("RSSMRA80A01F205X");w.write("busta_pw.pdf")
print("ok")
def C(path):
    c=canvas.Canvas(path,pagesize=A4);c.setFont("Courier",7.5);y=800
    L=["HOTEL BELVEDERE SPA                                   CEDOLINO PAGA",
       "Dipendente: VERDI LUCA            Mese di competenza: 09/2026",
       "",
       "CODICE DESCRIZIONE                         ORE/GG       BASE      COMPETENZE   TRATTENUTE",
       "Z00001 Paga base                           172,00    9,87654     1 698,77",
       "Z00250 Lavoro straordinario 30%             7,50    12,83950        96,30",
       "Z00251 Straord. festivo 50%                 2,00    14,81481        29,63",
       "Z00300 Lavoro notturno                     31,00     1,97530        61,23",
       "Z00320 Maggiorazione domenicale            16,00     1,48148        23,70",
       "Z00400 Ferie                                3,00",
       "Z00410 Permessi retribuiti                  6,00",
       "Z09000 Contributi INPS                                                          176,64",
       "",
       "TOTALE COMPETENZE    1 909,63      TOTALE TRATTENUTE    498,21",
       "NETTO IN BUSTA 1 411,00",
       "",
       "FERIE     Residuo AP  10,00   Maturate  2,17   Godute  3,00   Residue  9,17",
       "PERMESSI  Residuo AP  12,00   Maturati  8,67   Goduti  6,00   Residui 14,67"]
    for l in L:
        c.drawString(30,y,l);y-=11
    c.showPage();c.setFont("Courier",7.5);c.drawString(30,800,"Pagina 2 - Note: nessuna");c.save()
C("busta_c.pdf")
def D(path):
    c=canvas.Canvas(path,pagesize=A4);c.setFont("Helvetica",8)
    c.drawString(30,800,"EMPRESA EJEMPLO S.L.     RECIBO INDIVIDUAL DE SALARIOS");c.drawString(30,788,"Periodo de liquidación: del 01/10/2026 al 31/10/2026")
    y=760
    for x,t in [(30,"Concepto"),(250,"Cuantía"),(320,"Precio"),(420,"Devengos"),(500,"Deducciones")]:c.drawString(x,y,t)
    for r in [("Salario base","30,00","50,00","1.500,00",""),("Horas extraordinarias","5,00","15,00","75,00",""),("Plus nocturnidad","20,00","2,50","50,00",""),("Plus domingos y festivos","8,00","3,00","24,00",""),("Contingencias comunes","","","","74,73")]:
        y-=13;c.drawString(30,y,r[0])
        for x,v in [(280,r[1]),(350,r[2]),(460,r[3]),(545,r[4])]:
            if v:c.drawRightString(x,y,v)
    y-=30;c.drawString(30,y,"TOTAL DEVENGADO");c.drawRightString(460,y,"1.649,00");y-=13;c.drawString(30,y,"LÍQUIDO TOTAL A PERCIBIR");c.drawRightString(460,y,"1.412,27");c.save()
D("busta_d.pdf")
