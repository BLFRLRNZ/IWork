# MyTurn: istruzioni per Claude

Questo file serve a riprendere il lavoro sul progetto in una chat nuova. Va letto prima di toccare il codice.

## Il proprietario e come lavorare con lui

- Parla e scrive in **italiano**. Le risposte vanno in italiano semplice, senza gergo tecnico. Prima il risultato, poi i dettagli.
- Usa l'app su **iPhone 16 Pro Max**: le modifiche vanno pensate prima di tutto per il telefono, ma devono funzionare anche su computer.
- Ogni modifica che si vede nell'app è un **rilascio**, secondo la lista "Rilascio" più sotto. Si lavora direttamente su `main`.
- I dati restano sul dispositivo. L'unico server è Supabase (vedi "Server"), usato solo per l'account e i promemoria. Ogni altra funzione che richiede il server (sincronizzazione, calendario in abbonamento, condivisione) va discussa con il proprietario prima di farla.

## Cos'è

**MyTurn** (fino alla 2.6 si chiamava iWork, che è un marchio di Apple) è una PWA per segnare i turni di lavoro (calendario dei turni con ore, straordinari, ferie, permessi, banca ore, stima paga e altro).

- **Repository:** BLFRLRNZ/MyTurn (prima BLFRLRNZ/IWork), pubblicato con GitHub Pages su `https://blfrlrnz.github.io/MyTurn/`.
- **Nomi interni:** tutto usa il prefisso `myturn`: dati in `localStorage["myturn-v1"]`, altre chiavi `myturn-*`, cache `myturn-vN`, `MYTURN_I18N`, `MYTURN_COUNTRIES`, `myturnDebug`. Il nome visibile è `APP` in `index.html`.
- **Lingue:** 23.
- **Paesi:** 41, con le loro festività e le regole sul riposo.
- **Versione:** è in `APP_VERSION` dentro `index.html` e in `version.json`.

## File

| File | Cosa contiene |
|---|---|
| `index.html` | Tutta l'app: HTML, CSS e JS in un unico file, senza build. |
| `countries.js` | Profili dei paesi: festività, regioni, regole, valuta, lingua. **Generato** da `tools/countries/` (vedi sotto). |
| `lang/xx.js` | Traduzioni: `(window.MYTURN_I18N=…)["xx"]={…}`. Le chiavi sono le frasi italiane. **Generati** da `tools/i18n/`. |
| `fonts/pdf-*.ttf` | Font del PDF del mese, con lettere latine, greche e cirilliche (licenza OFL). |
| `vendor/pdfjs/` | pdf.js 6.2.108, versione "legacy" (Apache-2.0). Si carica solo quando si legge una busta paga. |
| `sw.js` | Service worker: prima prova la rete, poi la cache. La cache si chiama `myturn-vN`: N va aumentato a ogni rilascio. |
| `version.json` | Versione, data e note di rilascio (it, en, fr, de, es, pt). L'app la usa per proporre l'aggiornamento. |
| `supabase/` | Server: tabelle (`migrations/`), funzioni (`functions/`) e istruzioni (`README.md`). |
| `docs/` | `CONTROLLO-FESTIVITA.md` (verifica delle festività), `BUSTE-PAGA.md` (come vengono lette le buste paga). |
| `ROADMAP.md` | Roadmap dell'internazionalizzazione, tutta completata (2.0). |

## Come è fatto `index.html`

### Stato e salvataggio

- I dati sono in `localStorage["myturn-v1"]` e hanno questa forma: `S={days,settings,oc,j2,bp}`.
  - `days["AAAA-MM-GG"]`: un giorno, con `k` (`w` turno, `r` riposo, `f` ferie, `p` permesso, `m` malattia) e poi `s`, `d`, `s2`, `d2` (orari e durate), `ot` (ore in più o in meno), `n` (nota), `l` (etichette), `h` (ore di permesso).
  - `oc`: reperibilità, `{s,d,x}` dove `x` sono le ore di intervento.
  - `j2`: turni del secondo lavoro, `{s,d,n?}`.
  - `bp["AAAA-MM"]`: numeri della busta paga.
  - `settings`: si normalizza sempre con `normSettings()`.
- Funzioni per normalizzare: `normEntry`, `normOc`, `normJ2`, `normBp`.
- Per modificare i giorni si usa `apply(changes,msg)`, che permette di annullare. `changes` è una lista di `[chiave, valore|null, store?]`, dove `store` è `"oc"` o `"j2"`; se manca, vale `days`.

### Traduzioni nel codice

- `t("frase italiana",{var})` traduce una frase. `tn(n,"singolare","plurale")` gestisce i plurali.
- Il testo fisso dell'HTML viene tradotto da `translateDom`, quindi va scritto in italiano.
- **Ogni nuova frase va tradotta in tutte le lingue** (vedi "Traduzioni").

### Schermate e pannelli

- Calendario, elenco e Anno. Il pannello Strumenti (`#tl`) contiene le schede `#wh`, `#lv`, `#hb`, `#py`, `#j2`, `#bp`, `#ic`, `#hp` e le altre.
- **Ogni nuovo `<dialog>`** va aggiunto alla lista che gestisce la chiusura toccando fuori: cerca `$("lb"),$("wh"),…].forEach(dlg=>`.
- I pannelli si aprono con `openDlg()`, che mette il fuoco sul pannello stesso. Nessun campo deve prendere il fuoco da solo all'apertura, perché su iPhone farebbe comparire la tastiera. Un link a un'impostazione precisa usa `showField(id)`: scorre fino al campo e lo evidenzia.
- I pulsanti in fondo ai pannelli stanno in `.sheet>.actions`, fissati con `position:sticky;bottom:0`. Il margine sotto tiene conto della barra dell'iPhone (`env(safe-area-inset-bottom)`).

### Funzioni principali

| Funzione | Cosa fa |
|---|---|
| `render` | Ridisegna il calendario. |
| `monthData` | Calcola i totali del mese. |
| `payFor` | Calcola la stima paga. |
| `yearData` | Calcola i totali dell'anno. |
| `monthPdf(y,m,job)` | Crea il PDF del mese (`job` 2 = secondo lavoro). |
| `icsText` | Crea il file per il calendario (.ics). |
| `bpLines` / `bpParse` | Leggono la busta paga dal PDF. |
| `helpData` | Contiene il testo della Guida. |
| `startTour` / `tourSteps` | Avviano e descrivono il tour guidato. |

`window.myturnDebug` espone `remItems`, `startTour`, `t`, `tn`, `bpLines`, `bpParse`, `bpNum`, `holFor`, `holidays` e altre funzioni per i test.

### Festività

Il motore delle festività è in `index.html`. Le regole possono essere:
- `MM-GG`, data fissa;
- `e±N`, Pasqua cattolica più o meno N giorni;
- `o±N`, Pasqua ortodossa;
- `nMM/W/N`, l'ennesimo giorno della settimana del mese;
- `aMM-GG/W`, `bMM-GG/W`, `sMM-GG/W/D`, giorno della settimana dopo, prima o vicino a una data;
- `?…:…`, una condizione;
- `A~B/D`, una festività che si sposta.

Le opzioni sono `from`, `to`, `skip`, `obs` e `nwd`. Le regioni possono aggiungere festività o sostituire quelle nazionali.

## Server (Supabase)

- Serve solo per **accesso** (codice di 6 cifre via email) e **promemoria** (notifiche push prima dei turni). Progetto Supabase `jszgiqdylsachclshyqm` (nome mostrato nel pannello: "iwork"), organizzazione BLFRLRNZ/Team, piano gratuito, Francoforte.
- **Email:** Supabase manda i codici tramite Brevo (SMTP, piano gratuito: 300 email al giorno; Supabase ne permette 30 all'ora). Mittente: la Gmail del proprietario, verificata su Brevo e scritta tutta in minuscolo anche su Supabase, altrimenti Brevo rifiuta l'invio. Brevo sostituisce gli indirizzi Gmail con un suo indirizzo tecnico: per aprire a molti utenti conviene un dominio proprio. I modelli "Magic link" e "Confirm sign up" contengono solo `Il tuo codice MyTurn: {{ .Token }}` (dal telefono l'editor non permette di incollare).
- Il collegamento sta in `index.html`, nell'oggetto `SUPA={url,key,vapid}`: indirizzo del progetto, chiave pubblica "anon" e chiave pubblica VAPID. Se è vuoto, la sezione Account e il pulsante Promemoria restano nascosti e l'app non chiama nessun server.
- Il client è scritto a mano con `fetch` (`sbFetch`, `auToken`), senza librerie. La sessione sta in `localStorage["myturn-auth"]`.
- L'app calcola da sola i promemoria dei prossimi 45 giorni (`remItems`), già tradotti e con l'ora di invio, e li manda al server con `set_shifts` ogni volta che i dati cambiano (`mark()` → `remSync`).
- Sul server: il job `myturn-reminders` di `pg_cron` chiama ogni minuto la funzione `send-reminders` con `pg_net`, passando il `cron_secret` letto da `app_config`. Le notifiche partono con Web Push; `sw.js` le mostra (`push`, `notificationclick`). Le risposte si vedono in `net._http_response`.
- Le tre funzioni hanno la verifica del token spenta: controllano da sole il segreto del cron o il token dell'utente.
- Lo strumento di Supabase annulla da solo le modifiche che chiedono una conferma (per esempio con `drop`): applicare le modifiche al database a pezzi piccoli e senza `drop`.
- Restano **solo sul dispositivo**: note, etichette, busta paga, stima paga e tutto il resto.
- **Segreti:** la chiave privata VAPID, il `cron_secret` e la chiave `service_role` stanno solo nella tabella `app_config` di Supabase. Non vanno mai nel repository né chiesti in chat.
- Le istruzioni passo per passo sono in `supabase/README.md`.

## Traduzioni

Le fonti delle traduzioni sono in `tools/i18n/src/xx.txt`: una riga per chiave, nello stesso ordine delle chiavi di `lang/en.js`. I plurali si scrivono `altro ‖few: … ‖many: …`.

```bash
node tools/i18n/extract.js                 # raccoglie le chiavi da index.html
python3 tools/i18n/check.py en             # elenca le chiavi che mancano in inglese (JSON)
python3 tools/i18n/addkeys.py en nuove.json   # aggiunge a en.js {chiave italiana: inglese}
# per ogni altra lingua: aggiungere le righe nuove in fondo a tools/i18n/src/xx.txt, nello stesso ordine, poi
python3 tools/i18n/mklang.py de "Deutsch"  # rigenera lang/de.js e controlla i segnaposto {x}
python3 tools/i18n/check.py de             # deve dire "0 missing"
```

- **Lingue:** it (base), en, fr, de, es, pt, pt-BR, nl, pl, ro, bg, hr, cs, da, et, fi, el, hu, lv, lt, sk, sl, sv.
- **Tono:** fr e pt danno del lei (vous, você formale); le altre lingue danno del tu.
- **Nomi nell'interfaccia:** i nomi di pulsanti e schermate nelle frasi lunghe vanno passati come segnaposto, presi da `t()`. È così nella Guida e nel tour.
- **Controllo dei caratteri:** cerca lettere cirilliche o greche finite per errore in lingue con alfabeto latino. È già successo.

## Paesi

```bash
python3 tools/countries/build.py eu noneu amoc it_block.js   # rigenera countries.js
```

`it_block.js` contiene l'intestazione e l'Italia. `eu.py`, `noneu.py` e `amoc.py` contengono gli altri paesi.

## Test

I test usano Playwright, che è già installato. Alcuni test leggono file con `fetch`: in quel caso bisogna avviare prima un server dalla cartella principale del progetto, con `python3 -m http.server 8765`. Le immagini prodotte vanno in `$OUT` (di solito `/tmp/myturn-tests`).

| Test | Cosa prova | Serve il server |
|---|---|---|
| `tests/editor-labels.js` | Scheda del giorno, etichette, annulla | no |
| `tests/onboarding.js` | Schermata iniziale e regole del paese | no |
| `tests/tools-sheets.js` | Schede degli Strumenti e salvataggio | no |
| `tests/all-languages-320.js` | Tutti i pannelli in 23 lingue a 320 px, testo che esce o tagliato (circa 10 minuti) | sì |
| `tests/payslip-models.js` | 14 buste paga: 4 italiane, poi Spagna, Stati Uniti, Regno Unito, Germania, Francia, Paesi Bassi, Svezia, Polonia, Brasile, Australia (Austria è nella riga sotto) | sì |
| `tests/payslip-countries.js` | Le buste di altri 22 paesi, compresa l'Austria | sì |
| `tests/payslip-sheet.js` | Scheda Busta paga, PDF con password, scansione | sì |
| `tests/tour-first-run.js` | Il tour parte una volta sola e si riapre dalla Guida | sì |
| `tests/tour-all-languages.js` | Il tour resta dentro lo schermo in 23 lingue | no |
| `tests/account-reminders.js` | Accesso, uscita e promemoria con un Supabase finto | sì |

- Le buste paga di prova sono in `tests/payslip/`. Si rigenerano con `gen.py`, `gen2.py` e `gen3.py`, che usano reportlab e pypdf.
- I risultati attesi delle 22 buste di `gen3.py` sono in `expected.json`. Quelli delle buste di `gen.py` e `gen2.py` sono scritti direttamente in `payslip-models.js`.

## Rilascio

1. Aumentare `APP_VERSION` in `index.html` e `version` in `version.json`, scrivendo le note in it, en, fr, de, es e pt.
2. Cambiare `myturn-vN` in `sw.js` in `myturn-v(N+1)`.
3. Se cambia qualcosa che l'utente vede, aggiornare il `README.md`.
4. Lanciare i test che riguardano la modifica e controllare gli screenshot.
5. Fare il commit con un messaggio in italiano che termina con le righe di attribuzione richieste, poi `git push origin main`. I tag non si possono inviare (errore 403): il proprietario li crea da GitHub.

## Cose ancora aperte (da decidere con il proprietario)

- **Traduzioni da far rivedere** a chi parla la lingua: et, lv, lt, hu, sl; il termine per "reperibilità" in ogni lingua; i nomi dei menu di iPhone e Android nella Guida.
- **Etichetta della versione 2.0.0 su GitHub:** va creata a mano.
- **Festività mancanti:** quelle dei singoli stati di USA e Brasile, la provincia di Terranova e Labrador in Canada, i ponti decisi ogni anno dai governi.
- **Dominio proprio per le email** (per esempio myturn.it), da collegare a Brevo, quando l'app si apre a molti utenti.
- **Funzioni del server ancora da fare:** sincronizzazione tra dispositivi, calendario in abbonamento, condivisione con i colleghi.

## Storia delle versioni

| Versione | Novità |
|---|---|
| 2.0 | 23 lingue e 41 paesi |
| 2.1 | Ore e lavoro spostati negli Strumenti |
| 2.2 | Reperibilità, secondo lavoro, esportazione .ics; pulsanti sopra la barra Home dell'iPhone; nessuna tastiera che si apre da sola |
| 2.3 | Busta paga, con la lettura dei modelli di 41 paesi |
| 2.4 | Guida e domande frequenti |
| 2.5 | Tour guidato alla prima apertura |
| 2.6 | Account e promemoria con Supabase (nascosti) |
| 2.7 | Nuovo nome: MyTurn, anche nei nomi interni e nell'indirizzo |
| 2.8 | Account e promemoria aperti a tutti (email tramite Brevo); 2.8.1: Guida e tour li spiegano |
