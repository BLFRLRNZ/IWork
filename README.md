# iWork

Il calendario dei tuoi turni di lavoro. Scegli solo l'orario d'inizio: la fine si calcola da sola (8 ore, 6 il sabato).

## Cosa fa

- **Inserimento rapido**: scegli Mattina, Pomeriggio, Notte, Riposo o Ferie e tocchi i giorni per assegnarli.
- **Prossimo turno**: conto alla rovescia all'inizio e, mentre sei in turno, quanto manca alla fine.
- **Totali del mese**: ore lavorate, ore extra, ore notturne (22–06), sabati, domeniche e festivi lavorati, ferie, permessi, malattia.
- **Ore per settimana** e avvisi: meno di 11 ore di riposo tra due turni, sette giorni di fila, settimane sopra le 48 ore.
- **Festività italiane** segnate in rosso, Pasqua e Lunedì dell'Angelo compresi.
- **Strumenti**: ripeti l'ultima settimana, copia i prossimi 7 giorni come testo, crea il PDF di un mese a scelta, pronto da stampare, backup e ripristino.
- **Impostazioni**: durata dei turni, orari dei turni rapidi, paga oraria facoltativa per una stima del lordo.
- Tema chiaro e scuro, installabile sul telefono, funziona anche offline.

## Dove sono i dati

I turni restano nel browser del dispositivo che usi (`localStorage`). Non c'è nessun server. Per spostarli su un altro dispositivo usa **Scarica backup** e **Ripristina backup**.

## Usarla

È una pagina statica senza dipendenze da installare: apri `index.html`, oppure pubblicala con GitHub Pages (Settings → Pages → Deploy from a branch → `main`, cartella `/`).

## File

- `index.html`: tutta l'app (markup, stile e codice).
- `manifest.webmanifest`, `sw.js`, icone: installazione sul telefono e uso offline.
