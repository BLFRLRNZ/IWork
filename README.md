# iWork

Il calendario dei tuoi turni di lavoro. Scegli solo l'orario d'inizio: la fine si calcola da sola (8 ore, 6 il sabato).

## Cosa fa

L'app ha due schermate, **Calendario** e **Anno**, e le impostazioni divise per argomento.

**Calendario**
- **Inserimento rapido**: scegli un turno rapido, Riposo o Ferie e tocchi i giorni per assegnarlo.
- **Prossimo turno**: conto alla rovescia all'inizio e, mentre sei in turno, quanto manca alla fine.
- **Totali del mese**: ore, ore extra, ore notturne, sabati, domeniche e festivi, ferie e permessi residui, banca ore.
- **Avvisi**: meno di 11 ore di riposo, sette giorni di fila, settimane sopra le 48 ore, ferie o permessi oltre quelli spettanti.
- **Festività italiane** segnate in rosso.

**Anno**
- Totale ore e turni dell'anno, grafico mese per mese e tabella con turni, ore, extra, ferie, permessi e banca ore.
- **Ferie e permessi residui**: usati, programmati e rimasti, con avviso quando stai per finirli.
- **Banca ore**: ore lavorate meno ore da contratto, giorno per giorno fino a oggi. Ferie, permessi, malattia, domeniche e festivi non contano come ore mancanti.

**Strumenti**
- **Turnazione ciclica**: costruisci uno schema che si ripete (per esempio 5 mattine, 2 riposi, 5 pomeriggi, 2 riposi) e applicalo a più settimane.
- **Ripeti l'ultima settimana**.
- **Condividi la settimana**: immagine pronta da mandare, oppure testo da incollare.
- **PDF del mese** a scelta, pronto da stampare.
- **Backup e ripristino**.

**Impostazioni**
- Durata dei turni (8 ore, 6 il sabato) e fino a 12 turni rapidi, ognuno con orario e, se serve, durata propria.
- Ferie (giorni) e permessi (ore) che ti spettano all'anno.
- Banca ore: ore settimanali da contratto, data di partenza e saldo iniziale.
- Paga oraria facoltativa, tema automatico, chiaro o scuro, aggiornamenti.

Installabile sul telefono, funziona anche offline e cerca da sola gli aggiornamenti.

## Dove sono i dati

I turni restano nel browser del dispositivo che usi (`localStorage`). Non c'è nessun server. Per spostarli su un altro dispositivo usa **Scarica backup** e **Ripristina backup**.

## Usarla

È una pagina statica senza dipendenze da installare: apri `index.html`, oppure pubblicala con GitHub Pages (Settings → Pages → Deploy from a branch → `main`, cartella `/`).

## File

- `index.html`: tutta l'app (markup, stile e codice).
- `manifest.webmanifest`, `sw.js`, icone: installazione sul telefono e uso offline.
- `version.json`: l'ultima versione pubblicata.

## Pubblicare un aggiornamento

1. Cambia `APP_VERSION` in `index.html` (per esempio da `1.2.0` a `1.3.0`).
2. Metti lo stesso numero in `version.json`, con una riga di novità in `notes`.
3. Fai il push su `main`: chi ha l'app aperta vedrà l'avviso entro mezz'ora.
