"""Fogli dei turni di prova per tests/schedule-import.js.
Uso: python3 tests/schedule/gen.py   (reportlab e Pillow)"""
import os, random, datetime as dt
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
D = os.path.dirname(os.path.abspath(__file__))
random.seed(7)

PEOPLE = ["Bianchi Laura", "Rossi Marco", "Esposito Anna", "Ferrari Luca", "Romano Giulia", "Colombo Paolo"]
CYCLE = ["M", "M", "P", "P", "N", "N", "R", "R"]
def codes(i, n):
    out = []
    for d in range(n):
        c = CYCLE[(d + i * 2) % len(CYCLE)]
        if i == 1 and 9 <= d <= 13: c = "F"   # Rossi in ferie dal 10 al 14
        out.append(c)
    return out

def tabella_it():
    """Reparto, novembre 2026: sigle M/P/N/R/F, legenda con gli orari, giorni 1–30 con l'iniziale del giorno sopra."""
    W, H = landscape(A4); c = canvas.Canvas(os.path.join(D, "tabella-it.pdf"), pagesize=(W, H))
    c.setFont("Helvetica-Bold", 14); c.drawString(30, H - 40, "Ospedale San Luca - Pronto Soccorso - Turni di Novembre 2026")
    x0, cw, y = 150, 21.5, H - 90
    wd = "DLMMGVS"; first = dt.date(2026, 11, 1)
    c.setFont("Helvetica", 8)
    for d in range(30):
        c.drawCentredString(x0 + d * cw + cw / 2, y + 14, wd[(first + dt.timedelta(d)).isoweekday() % 7])
    c.setFont("Helvetica-Bold", 9); c.drawString(30, y, "Nominativo")
    for d in range(30): c.drawCentredString(x0 + d * cw + cw / 2, y, str(d + 1))
    c.setFont("Helvetica", 9)
    for i, p in enumerate(PEOPLE):
        yy = y - 22 * (i + 1)
        c.drawString(30, yy, p)
        for d, k in enumerate(codes(i, 30)): c.drawCentredString(x0 + d * cw + cw / 2, yy, k)
        c.setStrokeGray(.7); c.line(28, yy - 6, x0 + 30 * cw, yy - 6)
    c.setFont("Helvetica", 9)
    c.drawString(30, y - 22 * 8, "Legenda: M = 07:00-14:00   P = 14:00-21:00   N = 21:00-07:00   R = riposo   F = ferie")
    c.drawString(30, y - 22 * 9, "Il coordinatore: Dott. Neri")
    c.save()

def orari_en():
    """Two weeks, dates dd/mm in the header, times on two lines in each cell, OFF days."""
    W, H = landscape(A4); c = canvas.Canvas(os.path.join(D, "orari-en.pdf"), pagesize=(W, H))
    c.setFont("Helvetica-Bold", 13); c.drawString(30, H - 40, "Warehouse rota - weeks 49-50")
    first = dt.date(2026, 11, 30); x0, cw, y = 160, 44, H - 90
    c.setFont("Helvetica-Bold", 9); c.drawString(30, y, "Employee")
    for d in range(14):
        day = first + dt.timedelta(d)
        c.drawCentredString(x0 + d * cw + cw / 2, y + 12, day.strftime("%a"))
        c.drawCentredString(x0 + d * cw + cw / 2, y, day.strftime("%d/%m"))
    c.setFont("Helvetica", 8.5)
    rows = {"Smith, John": ["07:00|15:00"] * 5 + ["OFF", "OFF"] + ["15:00|23:00"] * 5 + ["OFF", "OFF"],
            "Patel, Priya": ["OFF", "OFF"] + ["23:00|07:00"] * 5 + ["OFF", "OFF"] + ["07:00|15:00"] * 5,
            "Garcia, Ana": ["09:00|17:30"] * 4 + ["HOL"] * 3 + ["09:00|17:30"] * 5 + ["OFF", "OFF"]}
    for i, (n, cells) in enumerate(rows.items()):
        yy = y - 34 * (i + 1); c.drawString(30, yy, n)
        for d, v in enumerate(cells):
            a, _, b = v.partition("|"); cx = x0 + d * cw + cw / 2
            c.drawCentredString(cx, yy + (5 if b else 0), a)
            if b: c.drawCentredString(cx, yy - 6, b)
    c.save()

def elenco_it():
    """Il proprio elenco: una riga per giorno con data e orario."""
    c = canvas.Canvas(os.path.join(D, "elenco-it.pdf"), pagesize=A4); W, H = A4
    c.setFont("Helvetica-Bold", 13); c.drawString(40, H - 50, "Programmazione turni - Dicembre 2026 - Rossi Marco")
    c.setFont("Helvetica", 11); first = dt.date(2026, 12, 1); gg = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"]
    plan = ["06:00 - 14:00", "06:00 - 14:00", "14:00 - 22:00", "14:00 - 22:00", "Riposo", "Riposo", "22:00 - 06:00",
            "22:00 - 06:00", "Riposo", "08:30 - 12:30 / 14:00 - 18:00", "Ferie", "Ferie"]
    for i, v in enumerate(plan):
        d = first + dt.timedelta(i); yy = H - 90 - 20 * i
        c.drawString(40, yy, gg[d.weekday()] + " " + d.strftime("%d/%m/%Y")); c.drawString(170, yy, v)
    c.save()

def foto():
    """La tabella del reparto come foto: un po' storta, ombra, grana e JPEG."""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    W, H = 2200, 900; im = Image.new("L", (W, H), 250); g = ImageDraw.Draw(im)
    def font(sz, bold=False):
        for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else ""), "/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf" % ("Bold" if bold else "Regular")]:
            if os.path.exists(f): return ImageFont.truetype(f, sz)
        return ImageFont.load_default()
    F, FB = font(26), font(28, True)
    g.text((40, 30), "Turni di Novembre 2026 - Reparto B", font=font(36, True), fill=20)
    x0, cw, y = 330, 60, 140
    g.text((40, y), "Nome", font=FB, fill=20)
    for d in range(30):
        s = str(d + 1); w = g.textlength(s, font=FB); g.text((x0 + d * cw + (cw - w) / 2, y), s, font=FB, fill=20)
    for i, p in enumerate(PEOPLE[:5]):
        yy = y + 70 * (i + 1); g.text((40, yy), p, font=F, fill=25)
        for d, k in enumerate(codes(i, 30)):
            w = g.textlength(k, font=F); g.text((x0 + d * cw + (cw - w) / 2, yy), k, font=F, fill=25)
        g.line((30, yy + 48, x0 + 30 * cw, yy + 48), fill=170, width=2)
    for d in range(31): g.line((x0 + d * cw, y - 10, x0 + d * cw, y + 70 * 6 - 10), fill=190, width=2)
    g.text((40, y + 70 * 6 + 20), "M = 07:00-14:00   P = 14:00-21:00   N = 21:00-07:00   R = riposo", font=F, fill=25)
    im = im.rotate(1.2, resample=Image.BICUBIC, expand=True, fillcolor=235)
    sh = Image.linear_gradient("L").resize(im.size).point(lambda v: 255 - v // 6); im = Image.composite(im, sh, Image.new("L", im.size, 200))
    px = im.load()
    for _ in range(60000):
        x, yv = random.randrange(im.width), random.randrange(im.height); px[x, yv] = max(0, min(255, px[x, yv] + random.randint(-40, 40)))
    im = im.filter(ImageFilter.GaussianBlur(.7)).convert("RGB")
    im.save(os.path.join(D, "foto-tabella.jpg"), quality=72)

if __name__ == "__main__":
    tabella_it(); orari_en(); elenco_it(); foto(); print("fatto:", sorted(os.listdir(D)))
