# MyTurn

(Prima si chiamava iWork: il nome è cambiato nella versione 2.7, perché "iWork" è un marchio di Apple.)

Il calendario dei tuoi turni di lavoro. Scegli solo l'orario d'inizio: la fine si calcola da sola (8 ore, 6 il sabato).

**Versione 2.0**: 41 paesi (Unione Europea, Svizzera, Regno Unito, Norvegia, Islanda, San Marino, Monaco, Liechtenstein, Stati Uniti, Canada, Messico, Brasile, Argentina, Australia, Nuova Zelanda) con le loro regole di lavoro e festività, in 23 lingue. Le festività del 2026 e 2027 sono state controllate paese per paese: vedi [docs/CONTROLLO-FESTIVITA.md](docs/CONTROLLO-FESTIVITA.md).

## Cosa fa

Al primo avvio una breve procedura chiede lingua (23 lingue: italiano, inglese, francese, tedesco, spagnolo, portoghese e portoghese del Brasile, olandese, polacco, rumeno, bulgaro, croato, ceco, danese, estone, finlandese, greco, ungherese, lettone, lituano, slovacco, sloveno, svedese), paese, zona e durata del turno.

L'app ha due schermate, **Calendario** e **Anno**. In **Impostazioni** ci sono le scelte di base (paese e festività, lingua, aspetto, aggiornamenti); in **Strumenti** tutto ciò che riguarda il lavoro: turni rapidi, etichette, turnazione, orario e regole, ferie e permessi, banca ore, stima paga, busta paga, secondo lavoro, condivisione, esportazione nel calendario, backup e la guida.

**Calendario**
- **Inserimento rapido**: scegli un turno rapido, un'etichetta o tutti e due, e con un tocco sul giorno assegni turno ed etichetta insieme.
- **Prossimo turno**: conto alla rovescia all'inizio e, mentre sei in turno, quanto manca alla fine.
- **Totali del mese**: ore, ore extra, ore notturne, sabati, domeniche e festivi, ferie e permessi residui, banca ore.
- **Avvisi**: meno di 11 ore di riposo, sette giorni di fila, settimane sopra le 48 ore, ferie o permessi oltre quelli spettanti.
- **Festività del paese** segnate in rosso, con la regione (o il cantone) e il santo patrono o una festa locale. Paesi disponibili: Italia, gli altri 26 dell'Unione Europea, Svizzera, Regno Unito, Norvegia, Islanda, San Marino, Monaco, Liechtenstein, Stati Uniti, Canada, Messico, Brasile, Argentina, Australia e Nuova Zelanda (41 paesi). Per Stati Uniti (50 stati e Washington DC), Brasile (27 stati), Canada (tutte le province, compresa Terranova e Labrador) e Australia si sceglie anche lo stato o la provincia.
- **Vista calendario o elenco**: nell'elenco leggi note ed etichette per intero e puoi **cercare** in tutte le note e le etichette, di qualsiasi mese.
- **Turni spezzati**: due fasce nello stesso giorno, per esempio 8–12 e 16–20, anche come turni rapidi.
- **Etichette**: reparti, macchinari o postazioni che crei una volta e scegli con un tocco in ogni giorno.
- **Stima paga** (solo per te): paga oraria e maggiorazioni per straordinari, notturno, domenica e festivi. Gli importi si possono nascondere e non compaiono mai nel PDF né nelle immagini condivise.
- **Reperibilità**: in qualsiasi giorno, anche di riposo, con orario d'inizio e durata. Le ore di intervento contano come lavorate e nella stima paga valgono come straordinario; l'indennità per ogni reperibilità si imposta nella stima paga.
- **Busta paga**: carichi il PDF della busta paga (anche protetto da password) e l'app legge straordinari, notturno, festivi, ferie e permessi goduti e residui, lordo e netto; se non hai il PDF scrivi i numeri a mano. Le voci vengono confrontate con le ore segnate e le differenze compaiono nel riepilogo del mese. Il PDF è letto solo sul dispositivo e non viene salvato. Riconosce i modelli di busta paga dei 41 paesi dell'app (vedi [docs/BUSTE-PAGA.md](docs/BUSTE-PAGA.md)). Per la lettura usa [pdf.js](https://github.com/mozilla/pdf.js) (Apache-2.0, nella cartella `vendor/pdfjs/`).
- **Secondo lavoro**: nome, durata abituale e paga oraria propri. I suoi turni compaiono come seconda riga negli stessi giorni, con turni rapidi dedicati, e si contano a parte: non toccano banca ore, ferie e avvisi del lavoro principale.

**Anno**
- Totale ore e turni dell'anno, grafico mese per mese e tabella con turni, ore, extra, ferie, permessi e banca ore.
- **Statistiche**: quante mattine, pomeriggi e notti, i turni di ogni mese divisi per tipo, ore extra, ore notturne, domeniche e festivi mese per mese, i giorni della settimana in cui lavori di più, la durata media del turno, il massimo di giorni di lavoro di fila, i weekend liberi e il confronto con l'anno prima.
- **Ferie e permessi residui**: usati, programmati e rimasti, con avviso quando stai per finirli.
- **Banca ore**: ore lavorate meno ore da contratto, giorno per giorno fino a oggi. Ferie, permessi, malattia, domeniche e festivi non contano come ore mancanti.

**Strumenti** (pulsante ⋯ in alto)
- **Turni rapidi** ed **Etichette**: crei e modifichi i pulsanti che compaiono sopra al calendario.
- **Turnazione ciclica**: costruisci uno schema che si ripete (per esempio 5 mattine, 2 riposi, 5 pomeriggi, 2 riposi) e applicalo a più settimane. Ci sono 9 **rotazioni pronte** da scegliere con un tocco: settimana 5 + 2, mattina e pomeriggio alternati, rotazione settimanale 3 × 8, ciclo continuo 2-2-2-2, in quinta, 2-2-3 (Panama), Pitman, DuPont e 4 e 4. Usano i tuoi turni rapidi; se manca un turno (per esempio quelli da 12 ore) viene aggiunto, e lo puoi cambiare quando vuoi.
- **Ripeti l'ultima settimana**.
- **Leggi il foglio dei turni**: carichi il PDF o una foto della turnistica dell'azienda (tabella con i giorni del mese e una riga per persona, oppure elenco con date e orari). Scegli la tua riga, controlli cosa vuol dire ogni sigla (gli orari si prendono dalla legenda, se c'è) e vedi l'anteprima prima di importare; le scelte restano per il mese dopo. Il file è letto solo sul dispositivo e non viene salvato: i PDF con [pdf.js](https://github.com/mozilla/pdf.js), le foto e i PDF scansionati con [Tesseract.js](https://github.com/naptha/tesseract.js) (Apache-2.0, nella cartella `vendor/tesseract/`) o, nell'app per iPhone, con il riconoscimento del testo di iOS.
- **Condividi la settimana**: qualsiasi settimana, passata o futura, come immagine pronta da mandare oppure come testo da incollare.
- **PDF del mese** a scelta, pronto da stampare, del lavoro principale o del secondo lavoro.
- **Esporta nel calendario**: un file .ics per Google Calendar, il Calendario di Apple e Outlook, con periodo, contenuto e promemoria a scelta. Riesportando lo stesso periodo i turni si aggiornano invece di duplicarsi.
- **Backup**: "Salva una copia dei turni" crea un file con turni e impostazioni da tenere al sicuro; "Carica una copia" li recupera, dopo una conferma. Un pallino sul pulsante ⋯ ricorda di salvare una copia se l'ultima ha più di 30 giorni.

**Ore e contratto** (in Strumenti; ogni modifica si salva da sola, anche nella scheda del giorno)
- Orario di lavoro: durata dei turni (8 ore, 6 il sabato), regole del paese (riposo minimo, media settimanale, fascia notturna) adattabili al proprio contratto, reperibilità.
- Ferie (giorni) e permessi (ore) che ti spettano all'anno.
- Banca ore: ore settimanali da contratto, data di partenza e saldo iniziale.
- Stima paga: paga oraria, maggiorazioni e indennità di reperibilità.
- Busta paga: confronto con le ore segnate, anche quando straordinari e maggiorazioni arrivano il mese dopo.
- Secondo lavoro.

**Guida** (in Strumenti e nelle Impostazioni): domande frequenti su tutte le funzioni, compresi account e promemoria, con ricerca e un pulsante che porta allo strumento giusto. Alla prima apertura, dopo la scelta di lingua e paese, un **tour guidato** di nove passi mostra dove sono le cose; si può rivedere dalla Guida.

**Impostazioni**
- Paese e festività, lingua, tema automatico, chiaro o scuro, aggiornamenti.

**Account, promemoria e sincronizzazione**
- **Accesso con email e password**, anche dalla prima schermata subito dopo la lingua: si accede, si crea un account (confermato con un codice di 6 cifre via email) oppure si continua senza. Chi accede su un nuovo telefono ritrova subito turni e impostazioni e salta il resto della configurazione. "Password dimenticata?" manda un codice via email per sceglierne una nuova.
- La password non lascia mai il dispositivo: da essa si ricavano due chiavi diverse, una per l'accesso (l'unica che riceve il server) e una per cifrare i dati sincronizzati, che il server quindi non può leggere.
- **Promemoria** (Strumenti → Promemoria): il telefono avvisa prima di ogni turno anche ad app chiusa, da 15 minuti a 3 ore prima, anche per il secondo lavoro e la reperibilità. Sull'iPhone serve l'app aggiunta alla schermata Home.
- **Sincronizzazione**: fa parte dell'account e parte da sola all'accesso, non c'è niente da attivare o spegnere (per smettere si esce dall'account). Se un dispositivo ha già l'accesso ma non ha mai ricevuto la password (accessi di prima della 2.10, o password cambiata altrove), all'apertura la chiede da solo, al massimo una volta al giorno. Turni, note, etichette, busta paga e impostazioni restano uguali su tutti i dispositivi; se lo stesso giorno cambia su due dispositivi vale la modifica più recente; tema e promemoria restano di ogni dispositivo.
- Senza account l'app funziona come sempre.

**App per iPhone e Android** (pronta, non ancora negli store; vedi "App per gli store" in `CLAUDE.md`)
- È la stessa app dentro Capacitor, con in più i **widget** sulla schermata Home e sulla schermata di blocco, l'app per **Apple Watch** con le complicazioni, l'app per gli orologi **Wear OS** (Android) con il riquadro e la complicazione per il quadrante, e i promemoria come notifiche del telefono, senza account. La Guida spiega sveglie, widget, orologi, Dynamic Island e Siri.
- **Sveglie** (Strumenti → Sveglie): una sveglia vera prima di ogni turno, che suona anche con il telefono in silenzioso e si può fermare o posticipare di 10 minuti. Si sceglie per mattina, pomeriggio e notte se suona e quanto prima (da 30 minuti a 3 ore). Copre i prossimi 14 giorni e si aggiorna da sola quando cambiano i turni. Sull'iPhone serve iOS 26 (AlarmKit); su Android la sveglia compare anche a schermo intero sopra il blocco e torna dopo un riavvio.
- **Solo su iPhone**: il turno in corso o che inizia entro 3 ore compare sulla **Dynamic Island** e sulla **schermata di blocco** (Live Activity) con il tempo che manca alla fine; **Siri** risponde a "prossimo turno" (anche nell'app Comandi); nel **Centro di Controllo** si può aggiungere un tasto con il prossimo turno che apre il calendario (iOS 18).

Installabile sul telefono, funziona anche offline e cerca da sola gli aggiornamenti. Disponibile in 23 lingue (le traduzioni sono nella cartella `lang/`).

## Dove sono i dati

I turni restano nel browser del dispositivo che usi (`localStorage`). Il server ([Supabase](supabase/README.md), nell'Unione Europea) serve solo a chi crea un account: per i promemoria riceve l'email e i turni dei prossimi 45 giorni, con orario e nome del turno; per la sincronizzazione riceve tutti i dati, ma cifrati sul dispositivo con la password dell'utente, quindi illeggibili.

## Usarla

È una pagina statica senza dipendenze da installare: apri `index.html`, oppure pubblicala con GitHub Pages (Settings → Pages → Deploy from a branch → `main`, cartella `/`).

## File

- `index.html`: tutta l'app (markup, stile e codice).
- `manifest.webmanifest`, `sw.js`, icone: installazione sul telefono e uso offline.
- `countries.js`: regole di lavoro e festività di ogni paese, con le fonti.
- `lang/`: le traduzioni (l'italiano è dentro `index.html`).
- `fonts/`: il carattere incorporato nel PDF (sottoinsieme di Liberation Sans rinominato "MyTurn Sans PDF", licenza SIL Open Font License in `fonts/OFL.txt`), con latino, greco e cirillico.
- `lang/`: le traduzioni (l'italiano è nel codice).
- `vendor/`: librerie servite dal sito stesso (pdf.js per i PDF, Tesseract.js per le foto del foglio dei turni, scaricato dal workflow `.github/workflows/vendor.yml`).
- `version.json`: l'ultima versione pubblicata.
- `supabase/`: tabelle e funzioni del server per account e promemoria.

## Pubblicare un aggiornamento

1. Cambia `APP_VERSION` in `index.html` (per esempio da `1.2.0` a `1.3.0`).
2. Metti lo stesso numero in `version.json`, con una riga di novità in `notes`.
3. Fai il push su `main`: chi ha l'app aperta vedrà l'avviso entro mezz'ora.
