(window.IWORK_COUNTRIES=window.IWORK_COUNTRIES||{}).IT={
  n:{it:"Italia",en:"Italy"},lang:"it",cur:"EUR",ws:1,
  rules:{rest:11,maxWeek:48,weeklyRest:24,night:[22,6]},
  src:"D.Lgs. 66/2003 (orario di lavoro, ministero del Lavoro); L. 260/1949 e succ.; L. 151/2025 (San Francesco dal 2026)",
  hol:[
    ["01-01",{it:"Capodanno",en:"New Year's Day"}],
    ["01-06",{it:"Epifania",en:"Epiphany"}],
    ["e0",{it:"Pasqua",en:"Easter Sunday"}],
    ["e1",{it:"Lunedì dell'Angelo",en:"Easter Monday"}],
    ["04-25",{it:"Festa della Liberazione",en:"Liberation Day"}],
    ["05-01",{it:"Festa del Lavoro",en:"Labour Day"}],
    ["06-02",{it:"Festa della Repubblica",en:"Republic Day"}],
    ["08-15",{it:"Ferragosto",en:"Assumption Day"}],
    ["10-04",{it:"San Francesco d'Assisi",en:"St Francis of Assisi"},{from:2026}],
    ["11-01",{it:"Ognissanti",en:"All Saints' Day"}],
    ["12-08",{it:"Immacolata Concezione",en:"Immaculate Conception"}],
    ["12-25",{it:"Natale",en:"Christmas Day"}],
    ["12-26",{it:"Santo Stefano",en:"St Stephen's Day"}]
  ],
  reg:{
    BZ:{n:{it:"Provincia di Bolzano (Alto Adige)",en:"South Tyrol (Bolzano)"},hol:[["e50",{it:"Lunedì di Pentecoste",en:"Whit Monday"}]]}
  },
  /* santi patroni dei capoluoghi: [città, regola, santo] */
  patrons:[
    ["Agrigento","02-25","San Gerlando"],["Alessandria","11-10","San Baudolino"],["Ancona","05-04","San Ciriaco"],["Aosta","09-07","San Grato"],
    ["Arezzo","08-07","San Donato"],["Ascoli Piceno","08-05","Sant'Emidio"],["Asti","n05/2/1","San Secondo"],["Avellino","02-14","San Modestino"],
    ["Bari","05-08","San Nicola"],["Barletta","12-30","San Ruggero"],["Belluno","11-11","San Martino"],["Benevento","08-24","San Bartolomeo"],
    ["Bergamo","08-26","Sant'Alessandro"],["Biella","12-26","Santo Stefano"],["Bologna","10-04","San Petronio"],["Bolzano","e50","Lunedì di Pentecoste"],
    ["Brescia","02-15","Santi Faustino e Giovita"],["Cagliari","10-30","San Saturnino"],["Caltanissetta","09-29","San Michele Arcangelo"],
    ["Campobasso","04-23","San Giorgio"],["Carrara","06-16","San Ceccardo"],["Caserta","01-20","San Sebastiano"],["Catania","02-05","Sant'Agata"],
    ["Catanzaro","07-16","San Vitaliano"],["Cesena","06-24","San Giovanni Battista"],["Chieti","05-11","San Giustino"],["Como","08-31","Sant'Abbondio"],
    ["Cosenza","02-12","Madonna del Pilerio"],["Cremona","11-13","Sant'Omobono"],["Crotone","10-09","San Dionigi"],["Cuneo","09-29","San Michele Arcangelo"],
    ["Enna","07-02","Maria Santissima della Visitazione"],["Fermo","08-16","Santa Maria Assunta e San Savino"],["Ferrara","04-23","San Giorgio"],
    ["Firenze","06-24","San Giovanni Battista"],["Foggia","03-22","Madonna dei Sette Veli"],["Forlì","02-04","Madonna del Fuoco"],
    ["Frosinone","06-20","San Silverio"],["Genova","06-24","San Giovanni Battista"],["Gorizia","03-16","Santi Ilario e Taziano"],["Grosseto","08-10","San Lorenzo"],
    ["Iglesias","08-11","Santa Chiara"],["Imperia","11-26","San Leonardo"],["Isernia","05-19","San Celestino V"],["La Spezia","03-19","San Giuseppe"],
    ["L'Aquila","06-10","San Massimo"],["Latina","07-06","Santa Maria Goretti"],["Lecce","08-26","Sant'Oronzo"],["Lecco","12-06","San Nicolò"],
    ["Livorno","05-22","Santa Giulia"],["Lodi","01-19","San Bassiano"],["Lucca","07-12","San Paolino"],["Macerata","08-31","San Giuliano"],
    ["Mantova","03-18","Sant'Anselmo"],["Massa","10-04","San Francesco"],["Matera","07-02","Madonna della Bruna"],["Messina","06-03","Madonna della Lettera"],
    ["Milano","12-07","Sant'Ambrogio"],["Modena","01-31","San Geminiano"],["Monza","06-24","San Giovanni Battista"],["Napoli","09-19","San Gennaro"],
    ["Novara","01-22","San Gaudenzio"],["Nuoro","08-05","Santa Maria della Neve"],["Olbia","05-15","San Simplicio"],["Oristano","02-13","Sant'Archelao"],
    ["Padova","06-13","Sant'Antonio"],["Palermo","07-15","Santa Rosalia"],["Parma","01-13","Sant'Ilario"],["Pavia","12-09","San Siro"],
    ["Perugia","01-29","San Costanzo"],["Pesaro","09-24","San Terenzio"],["Pescara","10-10","San Cetteo"],["Piacenza","07-04","Sant'Antonino"],
    ["Pisa","06-17","San Ranieri"],["Pistoia","07-25","San Jacopo"],["Potenza","05-30","San Gerardo"],["Prato","12-26","Santo Stefano"],
    ["Ragusa","08-29","San Giovanni Battista"],["Ravenna","07-23","Sant'Apollinare"],["Reggio Calabria","04-23","San Giorgio"],
    ["Reggio Emilia","11-24","San Prospero"],["Rieti","12-04","Santa Barbara"],["Rimini","10-14","San Gaudenzio"],["Roma","06-29","Santi Pietro e Paolo"],
    ["Rovigo","11-26","San Bellino"],["Salerno","09-21","San Matteo"],["Sassari","12-06","San Nicola"],["Savona","03-18","Nostra Signora della Misericordia"],
    ["Siena","12-01","Sant'Ansano"],["Siracusa","12-13","Santa Lucia"],["Sondrio","06-19","Santi Gervasio e Protasio"],["Taranto","05-10","San Cataldo"],
    ["Teramo","12-19","San Berardo"],["Terni","02-14","San Valentino"],["Torino","06-24","San Giovanni Battista"],["Trapani","08-07","Sant'Alberto"],
    ["Trento","06-26","San Vigilio"],["Treviso","04-27","San Liberale"],["Trieste","11-03","San Giusto"],["Udine","07-12","Santi Ermacora e Fortunato"],
    ["Varese","05-08","San Vittore"],["Venezia","11-21","Madonna della Salute"],["Verbania","05-08","San Vittore"],["Vercelli","08-01","Sant'Eusebio"],
    ["Verona","05-21","San Zeno"],["Vibo Valentia","03-01","San Leoluca"],["Vicenza","09-08","Madonna di Monte Berico"],["Viterbo","09-04","Santa Rosa"]
  ]
};