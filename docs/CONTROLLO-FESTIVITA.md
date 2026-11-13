# Controllo delle festività (punto 6.1)

Data del controllo: 10 novembre 2026. Anni controllati: 2026 e 2027.

## Come è stato fatto

1. L'app ha calcolato le festività di tutti i 41 paesi e di ogni regione (112 elenchi in tutto).
2. Ogni elenco è stato confrontato in automatico con la libreria open source
   [holidays](https://github.com/vacanza/holidays), che raccoglie le festività dalle leggi e dai decreti di ogni paese.
3. Ogni differenza è stata controllata a mano, dove serviva sulle fonti ufficiali.
4. In precedenza (punto 4.1) i 27 paesi dell'UE erano già stati confrontati con l'elenco dell'EMA per il 2026 e il 2027.

## Risultato

- **89 elenchi su 112** coincidono esattamente.
- **Correzioni** fatte nell'app dopo il confronto (prima del controllo coincidevano 68 elenchi):
  - Irlanda: tolti i giorni di recupero automatici. Per legge non c'è diritto al lunedì successivo
    ([Workplace Relations Commission](https://www.workplacerelations.ie/en/what_you_should_know/public-holidays)).
  - Scozia: aggiunta la bank holiday del 15 giugno 2026 per i Mondiali ([gov.scot](https://www.gov.scot/news/world-cup-bank-holiday-confirmed/)).
  - Canada: giorni di recupero per Natale e Santo Stefano; Nuova Scozia con il Remembrance Day e senza Victoria Day e Boxing Day;
    New Brunswick senza il 30 settembre ([CFIB](https://www.cfib-fcei.ca/en/tools-resources/new-brunswick-statutory-holidays)).
  - Argentina: i *feriados trasladables* si spostano al lunedì secondo la Ley 27.399.
  - Grecia: il Primo maggio si recupera se cade nel fine settimana o a Pasqua.
  - Belgio: aggiunte Pasqua e Pentecoste, che la legge elenca tra i giorni festivi.
  - Cipro: la vigilia di Natale è facoltativa, non festiva. Liechtenstein: il Venerdì Santo è solo festivo bancario.
  - Svizzera, Appenzello e Uri: Santo Stefano non vale quando Natale cade di lunedì o di venerdì.
  - Australia: Anzac Day di domenica spostato al lunedì nel Territorio del Nord e nel Queensland; venerdì della finale AFL in Victoria.
  - Bulgaria, Ungheria, Lettonia: ponti decisi dal governo per il 2026.
- **23 differenze lasciate di proposito**, perché l'app segue un'altra fonte ufficiale o fa una scelta pratica:
  - feste che cadono sempre di domenica (Pasqua, Pentecoste, Festa della mamma in Lettonia, Giornata dell'unità nazionale in Italia);
  - mezze giornate e vigilie (Islanda, Svezia, Australia), segnate perché quasi tutti hanno libero;
  - cantoni svizzeri: l'app segue l'elenco dell'Ufficio federale di giustizia;
  - Baviera: l'Assunta vale solo nei comuni cattolici (indicato nella nota del paese);
  - Paesi Bassi: Venerdì Santo e 5 maggio dipendono dal contratto (indicato nella nota del paese);
  - Argentina: i giorni «con fini turistici» e la visita del Papa sono facoltativi per i privati;
  - Canada senza provincia: l'app usa l'elenco del Codice del lavoro federale;
  - feste valide solo in una città (Royal Queensland Show a Brisbane, Fête-Dieu a Le Landeron).

## Stati di USA e Brasile, Terranova e Labrador (versione 2.14, 13 novembre 2026)

- **Stati Uniti:** 50 stati e il Distretto di Columbia. Ogni stato ha l'elenco completo delle sue festività legali
  (sostituisce quello federale: per esempio la California non ha il Columbus Day e ha il Cesar Chavez Day e il giorno dopo il Ringraziamento).
  Escluse le giornate commemorative in cui gli uffici restano aperti (Susan B. Anthony Day, Diwali in California,
  Cesar Chavez Day in Colorado, [dhr.colorado.gov](https://dhr.colorado.gov/sites/dhr/files/documents/Calendar%20Year%202026%20Holiday%20Schedule.pdf))
  e le feste facoltative del Texas (Cesar Chavez Day, Good Friday, [SAO](https://hr.sao.texas.gov/Documents/Holidays/Holidays2026.pdf)).
- **Brasile:** 27 stati, con le feste statali in aggiunta a quelle nazionali (Minas Gerais non aggiunge niente: la sua data magna coincide con Tiradentes).
- **Terranova e Labrador:** le sei feste del Labour Standards Act (Capodanno, Venerdì santo, Memorial Day il 1° luglio, Labour Day,
  Remembrance Day, Natale), con recupero al lunedì; le altre feste dei dipendenti provinciali
  ([gov.nl.ca](https://www.gov.nl.ca/exec/tbs/2026-paid-holidays)) non sono obbligatorie nel privato.
- **Come:** `tools/countries/states_gen.py` legge la libreria [holidays](https://github.com/vacanza/holidays) e trova per ogni festa
  la regola dell'app; `states_emit.py` scrive `tools/countries/states.py`. Per i casi particolari l'app ha due opzioni nuove:
  `ev` (solo gli anni pari, o uno ogni quattro: Election Day, Inauguration Day) e il recupero `sat` (solo il sabato al venerdì).
- **Risultato:** `tests/holidays-states.js` confronta data per data, recuperi compresi, tutti i 79 elenchi dal 2024 al 2045: coincidono tutti.
