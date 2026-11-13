# MyTurn: istruzioni per Claude

Questo file serve a riprendere il lavoro sul progetto in una chat nuova. Va letto prima di toccare il codice.

## Il proprietario e come lavorare con lui

- Parla e scrive in **italiano**. Le risposte vanno in italiano semplice, senza gergo tecnico. Prima il risultato, poi i dettagli.
- Usa l'app su **iPhone 16 Pro Max**: le modifiche vanno pensate prima di tutto per il telefono, ma devono funzionare anche su computer.
- Ogni modifica che si vede nell'app è un **rilascio**, secondo la lista "Rilascio" più sotto. Si lavora direttamente su `main`.
- I dati restano sul dispositivo. L'unico server è Supabase (vedi "Server"), usato per l'account, i promemoria e la sincronizzazione cifrata. Ogni altra funzione che richiede il server (calendario in abbonamento, condivisione) va discussa con il proprietario prima di farla.

## Cos'è

**MyTurn** (fino alla 2.6 si chiamava iWork, che è un marchio di Apple) è una PWA per segnare i turni di lavoro (calendario dei turni con ore, straordinari, ferie, permessi, banca ore, stima paga e altro).

- **Repository:** BLFRLRNZ/MyTurn- (con il trattino finale; prima BLFRLRNZ/IWork, il vecchio indirizzo rimanda qui), pubblicato con GitHub Pages. Per le API di GitHub serve il nome esatto `BLFRLRNZ/MyTurn-`.
- **App per iPhone e Android:** la stessa `index.html` dentro Capacitor (vedi "App per gli store").
- **Nomi interni:** tutto usa il prefisso `myturn`: dati in `localStorage["myturn-v1"]`, altre chiavi `myturn-*`, cache `myturn-vN`, `MYTURN_I18N`, `MYTURN_COUNTRIES`, `myturnDebug`. Il nome visibile è `APP` in `index.html`.
- **Lingue:** 23.
- **Paesi:** 41, con le loro festività e le regole sul riposo; per Stati Uniti, Brasile, Canada, Australia e altri anche stati, province o regioni.
- **Versione:** è in `APP_VERSION` dentro `index.html` e in `version.json`.

## File

| File | Cosa contiene |
|---|---|
| `index.html` | Tutta l'app: HTML, CSS e JS in un unico file, senza build. |
| `countries.js` | Profili dei paesi: festività, regioni, regole, valuta, lingua. **Generato** da `tools/countries/` (vedi sotto). |
| `lang/xx.js` | Traduzioni: `(window.MYTURN_I18N=…)["xx"]={…}`. Le chiavi sono le frasi italiane. **Generati** da `tools/i18n/`. |
| `fonts/pdf-*.ttf` | Font del PDF del mese, con lettere latine, greche e cirilliche (licenza OFL). |
| `fonts/geist.woff2`, `fonts/geist-mono.woff2` | Caratteri dell'app (Geist, licenza OFL in `fonts/OFL-Geist.txt`), serviti dal sito: dalla 2.12 niente Google Fonts, quindi nessuna richiesta a server esterni. Il greco è escluso con `unicode-range` (Geist ha solo qualche lettera greca e le parole uscivano mescolate): lo disegna il carattere del telefono. |
| `_bozze/` | Informativa privacy (`privacy.html`) e condizioni d'uso (`termini.html`), italiano e inglese, con `legal.css` e `legal.js`. **Non pubblicate**: GitHub Pages usa Jekyll, che salta le cartelle con `_`. Titolare: Lorenz Belfiore. Manca l'email di contatto (segnaposto `[email]`). |
| `vendor/pdfjs/` | pdf.js 6.2.108, versione "legacy" (Apache-2.0). Si carica solo quando si legge una busta paga. |
| `sw.js` | Service worker: prima prova la rete, poi la cache. La cache si chiama `myturn-vN`: N va aumentato a ogni rilascio. |
| `version.json` | Versione, data e note di rilascio (it, en, fr, de, es, pt). L'app la usa per proporre l'aggiornamento. |
| `supabase/` | Server: tabelle (`migrations/`), funzioni (`functions/`) e istruzioni (`README.md`). |
| `docs/` | `CONTROLLO-FESTIVITA.md` (verifica delle festività), `BUSTE-PAGA.md` (come vengono lette le buste paga). |
| `ROADMAP.md` | Roadmap dell'internazionalizzazione, tutta completata (2.0). La roadmap del prodotto (fasi 1–4 contro i concorrenti) è nel documento "MyTurn – Roadmap" su Claude. |
| `package.json`, `capacitor.config.json` | App per gli store con Capacitor 8. `appId` = `app.myturn` (si può cambiare solo prima della prima pubblicazione). |
| `tools/app/copy-web.js` | Copia in `www/` (ignorata da git) i file che vanno dentro l'app. Il service worker no. |
| `assets/` | Immagini di partenza per icone e schermata di avvio (le genera `@capacitor/assets` nel workflow). |
| `ios/`, `android/` | Progetti nativi. **Creati e aggiornati dal workflow** `.github/workflows/app.yml`: prima di modificarli fare `git pull`. |
| `.github/workflows/app.yml` | Su GitHub: crea i progetti nativi, compila l'app iPhone per il simulatore e l'APK Android, e fa le foto. |

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
| `helpData` | Contiene il testo della Guida. Alcune risposte cambiano nell'app (`NATIVE`): sveglie, widget e orologi, niente browser. |
| `startTour` / `tourSteps` | Avviano e descrivono il tour guidato. |
| `ROT` / `ROLE` / `rotRole` | Rotazioni pronte della turnazione ciclica: schemi per ruolo (M, P, N da 8 ore; G, NN da 12 ore; R riposo). Ogni ruolo usa un turno rapido esistente (per orario e durata) o ne aggiunge uno (`new:X` finché non si applica). I nomi sono nella lista "values passed through variables" di `tools/i18n/extract.js`. |
| `renderYStats` | Statistiche della vista Anno (`#yStats`), con i dati in più di `yearData` (`tm/tp/tn`, `wd`, `fe`, `streak`, `wkFree`). |

`window.myturnDebug` espone `remItems`, `syItems`, `syRun`, `S`, `apply`, `mark`, `startTour`, `t`, `tn`, `bpLines`, `bpParse`, `bpNum`, `holFor`, `holidays` e altre funzioni per i test.

### Festività

Il motore delle festività è in `index.html`. Le regole possono essere:
- `MM-GG`, data fissa;
- `e±N`, Pasqua cattolica più o meno N giorni;
- `o±N`, Pasqua ortodossa;
- `nMM/W/N`, l'ennesimo giorno della settimana del mese;
- `aMM-GG/W`, `bMM-GG/W`, `sMM-GG/W/D`, giorno della settimana dopo, prima o vicino a una data;
- `?…:…`, una condizione;
- `A~B/D`, una festività che si sposta.

Le opzioni sono `from`, `to`, `skip`, `obs` (`near`, `mon`, `sun`, `sat`, `move`, `ar`), `nwd` e `ev` (solo gli anni con anno%N==R). Le regioni possono aggiungere festività o sostituire quelle nazionali.

## App per gli store (Capacitor)

- **Niente Mac e niente npm in locale:** in questa sessione npm non scarica pacchetti. Tutto ciò che è nativo si fa su GitHub Actions (`app.yml`, Mac per iPhone e Linux per Android). Ogni push che tocca l'app lo avvia; si segue con `gh api repos/BLFRLRNZ/MyTurn-/actions/runs`, i log con `.../actions/jobs/<id>/logs`.
- Il workflow crea `ios/` e `android/` se mancano e li salva con un commit del bot: dopo un'esecuzione fare `git pull --rebase`.
- **Nel codice:** `NATIVE` è vero dentro l'app; `CAP` contiene i plugin (`Capacitor.Plugins`). Sulla pagina ci sono le classi `native` e `ios`/`android`.
  - Niente service worker e niente controllo di `version.json`: gli aggiornamenti arrivano dallo store.
  - File (PDF, .ics, copia, immagine dei turni): `nativeShare()` li scrive con Filesystem e apre il menu Condividi (Share).
  - Promemoria: notifiche **locali** (LocalNotifications), programmate dal telefono senza server e senza account. `remLocal()` tiene le prime 60 (l'iPhone ne accetta 64), con id ≥ 1000; l'id 1 è la notifica di prova.
  - Margini: su Android Capacitor inietta `--safe-area-inset-*`; il CSS usa `var(--safe-area-inset-x,env(safe-area-inset-x,0px))`.
  - Barre di sistema: `SystemBars.setStyle` segue il tema in `applyTheme`.
  - **Sveglie** (dalla 2.13, solo nell'app; pannello `#al`, pulsante `#alBtn` negli Strumenti): `settings.alarm={on,m,p,n}` con `{on,min}` per tipo di turno (minuti in `AL_MIN`, da 30 a 180); non si sincronizza. `alItems()` prepara le sveglie dei prossimi 14 giorni (primo orario di ogni giorno di lavoro, tipo da `slot()`), al massimo 40; `alSync()` le manda tutte a `MyTurnNative.setAlarms({items,stop,snooze})`, che ogni volta cancella e rimette. `alarmState`/`alarmRequest` rispondono `granted`, `prompt`, `denied` o `unsupported`.
    - iPhone: `App/ShiftAlarms.swift` con **AlarmKit** (iOS 26; prima risponde `unsupported` e la pagina propone i promemoria). "Posticipa" è l'intent `SnoozeShiftAlarm` (nuova sveglia tra 10 minuti, i cui id restano in `UserDefaults` per non cancellarla quando l'app si riapre). Testo del permesso: `NSAlarmKitUsageDescription` in `Info.plist`.
    - Android: `ShiftAlarms.java` (`setAlarmClock`, codici 2000+, elenco salvato per `BootReceiver` dopo un riavvio), `AlarmReceiver.java` (notifica a tutto schermo sul canale `myturn_alarm` con suono da sveglia che si ripete, pulsanti Ferma e Posticipa), `AlarmActivity.java` (schermata sopra il blocco). Permessi: notifiche e "Sveglie e promemoria" (`SCHEDULE_EXACT_ALARM`); la pagina ricontrolla per un minuto dopo la richiesta. Con `--ez alarmPreview true` (solo prove) mostra una sveglia finta.
  - **Widget e orologio:** `wgData()` prepara i prossimi 14 giorni già tradotti (`{days:[{d,wd,dn,k,t,h,c,x?,s?,e?}],s:{today,tomorrow,next,free,app}}`); `wgSync()` li manda al plugin **MyTurnNative** (`setData({json})`) a ogni `saveLocal`, al cambio di lingua, all'avvio e quando l'app torna visibile.
- **Codice nativo nostro** (non lo tocca Capacitor):
  - iPhone, in `ios/App/`: `App/MyTurnNativePlugin.swift` (salva nell'App Group `group.app.myturn`, aggiorna i widget, manda i dati all'orologio con WatchConnectivity), `App/MyTurnViewController.swift` (registra il plugin; è la classe del controller in `Main.storyboard`), `App/ShiftAlarms.swift` (sveglie), `App/WidgetSnapshot.swift` (solo Debug: con `-widgetSnapshot` disegna i widget in Documents per le foto). `Shared/` = modello e viste comuni; `SharedWidget/` = calendario dei widget; `MyTurnWidget/` = widget Home e schermata di blocco; `MyTurnWatch/` = app Apple Watch; `MyTurnWatchWidget/` = complicazioni.
  - I target si aggiungono al progetto Xcode con `tools/app/ios-targets.rb` (gem xcodeproj, nel workflow): un file `.swift` nuovo in una di quelle cartelle entra da solo nei target giusti.
  - Android, in `android/app/src/main/`: `MainActivity.java` (registra il plugin; con `--ez widgetPreview true` mostra l'anteprima del widget, solo nelle versioni di prova), `MyTurnNativePlugin.java`, `ShiftAlarms.java`, `AlarmReceiver.java`, `AlarmActivity.java`, `BootReceiver.java`, `ShiftWidget.java`, `res/layout/myturn_widget.xml`, `res/xml/myturn_widget_info.xml`.
  - **Orologi Wear OS** (dalla 2.14), modulo `android/wear/` in **Kotlin con Compose per Wear OS** (unico codice Kotlin del progetto; plugin Kotlin 2.2.20 nel `build.gradle` principale; librerie del 2024: wear compose 1.4.1, tiles 1.4.1, protolayout 1.2.1, complicazioni 1.2.1). Stesso `applicationId` dell'app del telefono (serve al Data Layer). Il telefono manda il JSON dei widget anche all'orologio (`MyTurnNativePlugin.toWatch`, percorso `/myturn/data`, `play-services-wearable`); sull'orologio `DataListener` lo salva e aggiorna riquadro e complicazione. File: `MainActivity.kt` (schermata con turno in corso o prossimo e giorni seguenti), `ShiftTileService.kt` (riquadro, una schermata per ogni inizio e fine turno, e `DataListener`), `ShiftComplicationService.kt` (breve, lunga, con barra), `ShiftStore.kt` (dati, colori, testi, dati di prova). Testi senza dati in `res/values*/strings.xml` (it, en, fr, de, es, pt). Con `--ez demo true` (solo prove) usa dati di prova.
  - Le foto del workflow (avvio, widget, orologio, sveglia Android, Wear OS) finiscono nel registro: `tools/app/foto.sh cartella` le estrae.
- **Prossimi passi (fase 1 della roadmap):** account Apple Developer e Google Play del proprietario; firma e invio a TestFlight dal workflow (chiave API di App Store Connect nei segreti di GitHub; App Group e identificativi `app.myturn`, `.widget`, `.watchkitapp`, `.watchkitapp.widget` da registrare); 12 tester per 14 giorni su Google Play; provare sveglie e orologio Wear OS su dispositivi veri; calendario per la famiglia.

## Privacy e condizioni d'uso

- Le pagine sono in `_bozze/`. Per pubblicarle: sostituire `[email]` (anche nei `mailto:`), spostare i quattro file nella cartella principale, mettere `LEGAL_READY=true` in `index.html` e fare un rilascio. Compaiono allora i collegamenti in Impostazioni (in fondo), nel pannello Account e nella registrazione ("Creando l'account accetti…").
- Nell'app nativa i collegamenti puntano al sito (`SITE` in `index.html`, `https://blfrlrnz.github.io/MyTurn-/`); nella versione web sono relativi. Le pagine scelgono italiano o inglese da sole (`?lang=it|en`).
- Quello che le pagine promettono e il codice deve mantenere: dati solo sul dispositivo senza account; sincronizzazione cifrata; promemoria web con i turni dei prossimi 45 giorni; uscendo dall'account si cancellano indirizzo per le notifiche e promemoria futuri (`acLogout`); i promemoria passati si cancellano ogni notte (job `myturn-cleanup` di `pg_cron`, migrazione `20261112140000_pulizia_promemoria.sql`); niente cookie, statistiche, pubblicità o file da server esterni. **Se cambia uno di questi punti, va aggiornata anche l'informativa.**
- Fornitori citati: Supabase (Supabase Pte. Ltd. e Supabase, Inc.; server a Francoforte), Brevo (Brevo SAS, Parigi), GitHub Pages, servizi push dei browser.

## Server (Supabase)

- Serve per **accesso** (email e password), **promemoria** (notifiche push prima dei turni) e **sincronizzazione** tra dispositivi.
- **Accesso** (codice in `index.html`, cerca `accesso con email e password`): un solo modulo `authUI(contenitore,{mode,onDone})` usato nella schermata iniziale (`#obAuth`, passo `account` dopo la lingua, solo per chi non ha dati e non è collegato) e nel pannello Account (`#acAuth`). Modi: `login`, `signup`, `code` (conferma della registrazione), `forgot`, `fcode` (codice + nuova password). Gli id dei campi hanno il prefisso del contenitore (`obAuthEmail`, `acAuthPw`…).
  - **Una sola password** per account e cifratura. A Supabase va `authSecret(email,pw)` = PBKDF2-SHA256(pw, "myturn-login|email", 600.000) in esadecimale; la cifratura usa PBKDF2 con il sale casuale di `sync_meta`. Chi gestisce il server non può ricavare la chiave dei dati.
  - Registrazione: `/auth/v1/signup` → email "Confirm sign up" con il codice → `/auth/v1/verify` (tipo `email`, in alternativa `signup`). Accesso: `/auth/v1/token?grant_type=password`. Password dimenticata: codice con `/auth/v1/otp` (`create_user:false`, email "Magic link") → `/auth/v1/verify` → `PUT /auth/v1/user` con la nuova chiave → la copia sincronizzata viene ricreata da questo dispositivo (`syEnable(pw,true)`).
  - Dopo ogni accesso `authSync(pw)` accende la sincronizzazione. Nella schermata iniziale, se arrivano impostazioni già configurate (`setup:1`), la configurazione si chiude, il tour non parte e compare "Bentornato!".
  - Gli account creati prima della 2.10 con il solo codice via email non hanno una password: la scelgono con "Password dimenticata?". Progetto Supabase `jszgiqdylsachclshyqm` (nome mostrato nel pannello: "iwork"), organizzazione BLFRLRNZ/Team, piano gratuito, Francoforte.
- **Email:** Supabase manda i codici (conferma della registrazione e password dimenticata) tramite Brevo (SMTP, piano gratuito: 300 email al giorno; Supabase ne permette 30 all'ora). Mittente: la Gmail del proprietario, verificata su Brevo e scritta tutta in minuscolo anche su Supabase, altrimenti Brevo rifiuta l'invio. Brevo sostituisce gli indirizzi Gmail con un suo indirizzo tecnico: per aprire a molti utenti conviene un dominio proprio. I modelli "Magic link" e "Confirm sign up" contengono solo `Il tuo codice MyTurn: {{ .Token }}` (dal telefono l'editor non permette di incollare).
- Il collegamento sta in `index.html`, nell'oggetto `SUPA={url,key,vapid}`: indirizzo del progetto, chiave pubblica "anon" e chiave pubblica VAPID. Se è vuoto, la sezione Account e il pulsante Promemoria restano nascosti e l'app non chiama nessun server.
- Il client è scritto a mano con `fetch` (`sbFetch`, `auToken`), senza librerie. La sessione sta in `localStorage["myturn-auth"]`.
- L'app calcola da sola i promemoria dei prossimi 45 giorni (`remItems`), già tradotti e con l'ora di invio, e li manda al server con `set_shifts` ogni volta che i dati cambiano (`mark()` → `remSync`).
- Sul server: il job `myturn-reminders` di `pg_cron` chiama ogni minuto la funzione `send-reminders` con `pg_net`, passando il `cron_secret` letto da `app_config`. Le notifiche partono con Web Push; `sw.js` le mostra (`push`, `notificationclick`). Le risposte si vedono in `net._http_response`.
- Le tre funzioni hanno la verifica del token spenta: controllano da sole il segreto del cron o il token dell'utente.
- Lo strumento di Supabase annulla da solo le modifiche che chiedono una conferma (per esempio con `drop`): applicare le modifiche al database a pezzi piccoli e senza `drop`.
- **Sincronizzazione** (codice in `index.html`, cerca `sincronizzazione tra dispositivi`; schermata `#sy`, aperta da `#syBtn` in Impostazioni → Account):
  - Cifratura end-to-end scelta dal proprietario: password dell'account → PBKDF2-SHA256 (600.000 giri, sale in `sync_meta`) → 512 bit: AES-GCM per i dati, HMAC per gli identificativi. La password non viene salvata; le chiavi stanno in `localStorage["myturn-sync"]`. La schermata `#sy` chiede la password dell'account (verificata con un nuovo accesso); se la copia sul server è cifrata con un'altra password propone "Ricomincia". `sync_meta.check_*` è il testo `{ok:"myturn"}` cifrato, per controllare la password.
  - Un elemento per ogni giorno (`d|AAAA-MM-GG`), reperibilità (`o|`), secondo lavoro (`j|`), busta paga (`b|AAAA-MM`) e impostazioni (`s`, senza `rem`). Sul server: `sync_items(k=HMAC, iv, data, seq)`. `seq` cresce a ogni scrittura (sequenza + trigger); ogni dispositivo chiede gli elementi con `seq` maggiore dell'ultimo visto.
  - Modifiche locali: `mark()` → `syNote()` confronta con l'impronta dell'ultimo valore sincronizzato (`myturn-syncbase`) e annota le differenze con l'ora (`myturn-syncdirty`). `syRun()` scarica, applica (vince la modifica più recente), poi manda. Parte all'apertura, quando l'app torna visibile, ogni 2 minuti e qualche secondo dopo una modifica.
  - Un dispositivo che si aggiunge dà ora 0 ai suoi dati: nei conflitti vincono quelli già sincronizzati. "Password dimenticata?" (nel pannello Account) cancella la copia sul server e la ricrea; gli altri dispositivi se ne accorgono perché il sale è cambiato e chiedono di riattivare.
  - Tema e lingua sono già locali (`myturn-theme`, `myturn-lang`); le impostazioni dei promemoria (`settings.rem`) non si sincronizzano.
  - **Dalla 2.11 la sincronizzazione è parte dell'account** (richiesta del proprietario): niente "Attiva" né "Disattiva". In Impostazioni la riga `#syRow` mostra solo lo stato; il pulsante `#syBtn` ("Completa") compare solo se serve la password. Nel pannello Account: stato (`#acSync`) e "Sincronizza ora" (`#syNow`). La finestra `#sy` serve solo a scrivere la password: `syAsk()` la apre da sola all'avvio o al ritorno nell'app se c'è l'accesso ma non la sincronizzazione (al massimo ogni 20 ore, `myturn-syask`); dopo un accesso con la copia sul server protetta da un'altra password si apre subito in modo "Ricomincia" (`openSync(pw)`).
- Senza sincronizzazione restano **solo sul dispositivo**: note, etichette, busta paga, stima paga e tutto il resto.
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

Gli stati di Stati Uniti e Brasile sono in `states.py`, **generato**: si clona la libreria [holidays](https://github.com/vacanza/holidays), poi `python3 -I tools/countries/states_gen.py /percorso/holidays US` (e `BR`), `python3 tools/countries/states_emit.py`, la riga `build.py` sopra e `node tests/holidays-states.js`. Le date attese del test sono in `tests/holidays/` (copiate dai file `expected_XX.json` che scrive `states_gen.py`). Le esclusioni (giornate commemorative, feste facoltative del Texas) sono in `EXCL` di `states_gen.py`; i casi particolari (vigilia di Natale, Inauguration Day) in `fix()` di `states_emit.py`. Opzioni del motore aggiunte per questi casi: `ev:[N,R]` (solo gli anni con anno%N==R) e il recupero `sat`.

## Test

I test usano Playwright, che è già installato. Alcuni test leggono file con `fetch`: in quel caso bisogna avviare prima un server dalla cartella principale del progetto, con `python3 -m http.server 8765`. Le immagini prodotte vanno in `$OUT` (di solito `/tmp/myturn-tests`).

| Test | Cosa prova | Serve il server |
|---|---|---|
| `tests/editor-labels.js` | Scheda del giorno, etichette, annulla | no |
| `tests/onboarding.js` | Schermata iniziale e regole del paese | no |
| `tests/tools-sheets.js` | Schede degli Strumenti e salvataggio | no |
| `tests/all-languages-320.js` | Tutti i pannelli in 23 lingue a 320 px, testo che esce o tagliato (circa 10 minuti; le foto di fi e hu vanno in `s54/`). Nella turnazione le rotazioni pronte risultano "OFF": la riga scorre di lato, è voluto | sì |
| `tests/payslip-models.js` | 14 buste paga: 4 italiane, poi Spagna, Stati Uniti, Regno Unito, Germania, Francia, Paesi Bassi, Svezia, Polonia, Brasile, Australia (Austria è nella riga sotto) | sì |
| `tests/payslip-countries.js` | Le buste di altri 22 paesi, compresa l'Austria | sì |
| `tests/payslip-sheet.js` | Scheda Busta paga, PDF con password, scansione | sì |
| `tests/tour-first-run.js` | Il tour parte una volta sola e si riapre dalla Guida | sì |
| `tests/tour-all-languages.js` | Il tour resta dentro lo schermo in 23 lingue | no |
| `tests/account-reminders.js` | Accesso, uscita e promemoria con un Supabase finto | sì |
| `tests/auth-onboarding.js` | Due telefoni con un server finto: registrazione al primo avvio, accesso che ritrova tutto, password sbagliata, password dimenticata | sì |
| `tests/layout-audit.js` | Apre ogni schermata e pannello e cerca campi sovrapposti, attaccati o che escono; foto in `$OUT/layout`. Uso: `node tests/layout-audit.js 430 it` (alcune segnalazioni sono volute: righe che scorrono, cifre sopra l'etichetta, tabelle) | sì |
| `tests/native-shell.js` | L'app nativa simulata nel browser con plugin finti: niente service worker, promemoria locali, file condivisi, margini Android | sì |
| `tests/rotations-stats.js` | Rotazioni pronte (turni esistenti e turni da 12 ore aggiunti) e statistiche della vista Anno a 430 e 320 px, anche scuro | sì |
| `tests/alarms.js` | Sveglie nell'app con un plugin finto: permesso, anticipo per tipo di turno, aggiornamento quando cambiano i turni, iOS vecchio, permesso negato, Android che concede dopo, niente nella versione web | sì |
| `tests/holidays-states.js` | Festività di 51 stati USA, 27 stati del Brasile e Terranova e Labrador, data per data dal 2024 al 2045, contro le date attese in `tests/holidays/` | sì |
| `tests/sync.js` | Sincronizzazione tra due dispositivi con un server finto: password, unione, conflitti, cancellazioni, password dimenticata, niente in chiaro sul server | sì |

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
- **Festività mancanti:** i ponti decisi ogni anno dai governi; il Diwali in California (dal 2026, data lunare) se il proprietario lo vuole.
- **Dominio proprio per le email** (per esempio myturn.it), da collegare a Brevo, quando l'app si apre a molti utenti.
- **Funzioni del server ancora da fare:** calendario in abbonamento, condivisione con i colleghi.

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
| 2.9 | Sincronizzazione cifrata tra dispositivi |
| 2.10 | Accesso con email e password anche dalla prima schermata; una sola password per account e cifratura; campi sistemati sui telefoni piccoli |
| 2.11 | Sincronizzazione automatica con l'account, senza niente da attivare; app per iPhone e Android (Capacitor) con widget e Apple Watch, non ancora negli store |
| 2.12 | Rotazioni pronte nella turnazione ciclica (9 schemi); statistiche nella vista Anno |
| 2.13 | Sveglie prima dei turni nell'app (AlarmKit su iPhone, AlarmManager su Android); greco con il carattere del telefono |
| 2.14 | Festività di 51 stati USA, 27 stati del Brasile e di Terranova e Labrador; nell'app la Guida spiega sveglie, widget e orologi; app per orologi Wear OS |
