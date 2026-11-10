# iWork

Il calendario dei tuoi turni di lavoro. Scegli solo l'orario d'inizio: la fine si calcola da sola (8 ore, 6 il sabato).

## Cosa fa

Al primo avvio una breve procedura chiede lingua, paese, zona e durata del turno.

L'app ha due schermate, **Calendario** e **Anno**, e le impostazioni divise per argomento.

**Calendario**
- **Inserimento rapido**: scegli un turno rapido, un'etichetta o tutti e due, e con un tocco sul giorno assegni turno ed etichetta insieme.
- **Prossimo turno**: conto alla rovescia all'inizio e, mentre sei in turno, quanto manca alla fine.
- **Totali del mese**: ore, ore extra, ore notturne, sabati, domeniche e festivi, ferie e permessi residui, banca ore.
- **Avvisi**: meno di 11 ore di riposo, sette giorni di fila, settimane sopra le 48 ore, ferie o permessi oltre quelli spettanti.
- **Festività del paese** segnate in rosso, con la regione (o il cantone) e il santo patrono o una festa locale. Paesi disponibili: Italia, gli altri 26 dell'Unione Europea, Svizzera, Regno Unito, Norvegia, Islanda, San Marino, Monaco, Liechtenstein, Stati Uniti, Canada, Messico, Brasile, Argentina, Australia e Nuova Zelanda (41 paesi).
- **Vista calendario o elenco**: nell'elenco leggi note ed etichette per intero e puoi **cercare** in tutte le note e le etichette, di qualsiasi mese.
- **Turni spezzati**: due fasce nello stesso giorno, per esempio 8–12 e 16–20, anche come turni rapidi.
- **Etichette**: reparti, macchinari o postazioni che crei una volta e scegli con un tocco in ogni giorno.
- **Stima paga** (solo per te): paga oraria e maggiorazioni per straordinari, notturno, domenica e festivi. Gli importi si possono nascondere e non compaiono mai nel PDF né nelle immagini condivise.

**Anno**
- Totale ore e turni dell'anno, grafico mese per mese e tabella con turni, ore, extra, ferie, permessi e banca ore.
- **Ferie e permessi residui**: usati, programmati e rimasti, con avviso quando stai per finirli.
- **Banca ore**: ore lavorate meno ore da contratto, giorno per giorno fino a oggi. Ferie, permessi, malattia, domeniche e festivi non contano come ore mancanti.

**Strumenti** (pulsante ⋯ in alto)
- **Turni rapidi** ed **Etichette**: crei e modifichi i pulsanti che compaiono sopra al calendario.
- **Turnazione ciclica**: costruisci uno schema che si ripete (per esempio 5 mattine, 2 riposi, 5 pomeriggi, 2 riposi) e applicalo a più settimane.
- **Ripeti l'ultima settimana**.
- **Condividi la settimana**: qualsiasi settimana, passata o futura, come immagine pronta da mandare oppure come testo da incollare.
- **PDF del mese** a scelta, pronto da stampare.
- **Backup**: "Salva una copia dei turni" crea un file con turni e impostazioni da tenere al sicuro; "Carica una copia" li recupera, dopo una conferma. Un pallino sul pulsante ⋯ ricorda di salvare una copia se l'ultima ha più di 30 giorni.

**Impostazioni** (ogni modifica si salva da sola, anche nella scheda del giorno)
- Durata dei turni (8 ore, 6 il sabato).
- Ferie (giorni) e permessi (ore) che ti spettano all'anno.
- Banca ore: ore settimanali da contratto, data di partenza e saldo iniziale.
- Regole del paese (riposo minimo, media settimanale, fascia notturna) adattabili al proprio contratto.
- Paga oraria e maggiorazioni, tema automatico, chiaro o scuro, aggiornamenti.

Installabile sul telefono, funziona anche offline e cerca da sola gli aggiornamenti. Disponibile in italiano e inglese (le traduzioni sono nella cartella `lang/`).

## Dove sono i dati

I turni restano nel browser del dispositivo che usi (`localStorage`). Non c'è nessun server. Per non perderli e per spostarli su un altro dispositivo usa **Strumenti → Salva una copia dei turni** e poi **Carica una copia**.

## Usarla

È una pagina statica senza dipendenze da installare: apri `index.html`, oppure pubblicala con GitHub Pages (Settings → Pages → Deploy from a branch → `main`, cartella `/`).

## File

- `index.html`: tutta l'app (markup, stile e codice).
- `manifest.webmanifest`, `sw.js`, icone: installazione sul telefono e uso offline.
- `countries.js`: regole di lavoro e festività di ogni paese, con le fonti.
- `lang/`: le traduzioni (l'italiano è nel codice).
- `version.json`: l'ultima versione pubblicata.

## Pubblicare un aggiornamento

1. Cambia `APP_VERSION` in `index.html` (per esempio da `1.2.0` a `1.3.0`).
2. Metti lo stesso numero in `version.json`, con una riga di novità in `notes`.
3. Fai il push su `main`: chi ha l'app aperta vedrà l'avviso entro mezz'ora.
