# Lettura delle buste paga

L'app legge il PDF della busta paga sul dispositivo, con [pdf.js](https://github.com/mozilla/pdf.js), e cerca queste voci:

- ore di straordinario;
- ore notturne;
- ore di domenica e festivi;
- ferie godute e residue;
- permessi goduti e residui;
- totale lordo;
- netto pagato;
- mese della busta.

Il file non viene salvato: restano solo i numeri. Se una voce non viene trovata, si scrive a mano.

## Come funziona

1. **Righe e colonne.** Il testo del PDF viene rimesso in righe e colonne in base alla posizione sulla pagina. Il testo letto con altri strumenti spesso non conserva le colonne.
2. **Ore dalla colonna giusta.** Le ore vengono prese dalla colonna delle quantità, riconosciuta dalla sua intestazione. Alcuni esempi di intestazione: *Ore/GG*, *Menge*, *Hours*, *Base* (bulletin francese), *Referência*, *Aantal*, *Antal*, *Ilość*, *Kpl*, *Hodiny*. Così non si confondono con la tariffa o l'importo.
3. **Tabelle di ferie e permessi.** Vengono lette sia per colonne (*Residuo / Maturato / Goduto / Saldo*, *Anspruch / Genommen / Rest*, *Beginsaldo / Opbouw / Opname / Eindsaldo*) sia per righe (*Acquis / Pris / Solde*). Il residuo dell'anno precedente non viene confuso con il saldo attuale.
4. **Straordinari.** Se la busta ha sia la riga dello straordinario sia quella della sola maggiorazione (*Überstundenzuschlag*, *Maggiorazione straordinario*), le ore vengono contate una volta sola. Le voci che non sono ore lavorate vengono escluse: DSR in Brasile, festività non lavorate, banca ore.
5. **Netto.** Si preferisce la dicitura del netto davvero pagato: *Netto in busta*, *Auszahlungsbetrag*, *Net payé*, *Net pay*, *Te betalen*, *Do wypłaty* e simili. Le diciture generiche (*Nettolohn*, *Net à payer avant impôt*) vengono usate solo in mancanza di queste.
6. **Colonne del periodo e progressive.** Nelle buste con le colonne "periodo" e "progressivo" (*This period / YTD*, *Amount / Total to date*) si prende la colonna del periodo.
7. **Formati dei numeri.** I numeri vengono letti secondo il paese: `1.234,56`, `1,234.56`, `1 234,56`, `1'234.56`, corone islandesi senza decimali, ore in formato `7:30`, unità come *uur*, *hrs*, *dni*, *nap*.
8. **Mese della busta.** Il mese viene riconosciuto dai nomi dei mesi in 24 lingue, anche al genitivo (*października*, *Οκτωβρίου*, *spalio*). Si accettano formati come *2026. október*, *2026 m. spalio mėn.*, *outubro de 2026*. Si riconoscono anche le date: `MM/AAAA`, `GG/MM/AAAA` (`MM/GG/AAAA` negli Stati Uniti) e `AAAA-MM-GG`. Le parole dei mesi che cambiano significato da una lingua all'altra vengono lette prima nella lingua del paese: *listopad* è ottobre in Croazia e novembre in Cechia.
9. **Tredicesima e simili.** Viene segnalata la presenza di tredicesima, quattordicesima e mensilità aggiuntive: *Weihnachtsremuneration*, *paga extra*, *aguinaldo*, *13º salário*, *13th month*.

## Modelli provati

Le buste di prova sono state costruite sui modelli ufficiali o più diffusi di ogni paese:

- il modello di riepilogo paga di Fair Work in Australia;
- il bulletin de paie clarifié in Francia;
- i modelli di loonstrook dei payroll olandesi;
- i pay stub statunitensi;
- le lönespecifikation svedesi.

Ogni busta viene letta e confrontata con i valori attesi.

| Paese | Modello | Letto |
|---|---|---|
| Italia (3 impaginazioni), San Marino | cedolino LUL, cedolino PA, stampa a caratteri fissi | tutto |
| Spagna, Messico, Argentina | nómina, recibo de nómina, recibo de sueldo | tutto quello presente |
| Portogallo, Brasile | recibo de vencimento, holerite | tutto quello presente |
| Francia, Belgio, Lussemburgo, Monaco | bulletin de paie (clarifié), fiche de paie | tutto quello presente |
| Germania, Austria, Svizzera, Liechtenstein | Entgeltabrechnung, Lohn-/Gehaltsabrechnung, Lohnabrechnung | tutto quello presente |
| Paesi Bassi | loonstrook / salarisspecificatie | tutto |
| Regno Unito, Irlanda, Malta | payslip | tutto |
| Stati Uniti, Canada | pay stub / pay statement | tutto |
| Australia, Nuova Zelanda | pay slip, payslip | tutto |
| Svezia, Danimarca, Norvegia, Finlandia, Islanda | lönespecifikation, lønseddel, lønnsslipp, palkkalaskelma, launaseðill | tutto |
| Polonia, Cechia, Slovacchia, Ungheria, Romania, Bulgaria | pasek wynagrodzenia, výplatní páska, výplatná páska, bérjegyzék, fluturaș, фиш за заплата | tutto |
| Croazia, Slovenia, Estonia, Lettonia, Lituania | platna lista, plačilna lista, palgaleht, algas aprēķins, atsiskaitymo lapelis | tutto |
| Grecia, Cipro | εκκαθαριστικό μισθοδοσίας | tutto |

Ogni programma paghe impagina a modo suo. Se una busta reale non viene letta bene, il formato si aggiunge partendo da una copia con i dati personali coperti.
