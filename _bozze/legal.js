// Pagine informative: italiano o inglese (dalla lingua del browser o da ?lang=it|en), con i pulsanti in alto.
(function(){
  var q=new URLSearchParams(location.search).get("lang"),nav=(navigator.languages||[navigator.language||"en"])[0]||"en";
  var lang=q==="it"||q==="en"?q:(/^it/i.test(nav)?"it":"en");
  function set(l){document.querySelectorAll("article[data-lang]").forEach(function(a){a.hidden=a.dataset.lang!==l;});
    document.querySelectorAll(".langs button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.l===l));});
    document.documentElement.lang=l;var h=document.querySelector('article[data-lang="'+l+'"] h1');if(h)document.title="MyTurn – "+h.textContent;
    // i collegamenti tra le due pagine restano nella lingua scelta
    document.querySelectorAll('a[href="privacy.html"],a[href^="privacy.html?"],a[href="termini.html"],a[href^="termini.html?"]').forEach(function(a){a.href=a.getAttribute("href").split("?")[0]+"?lang="+l;});}
  document.querySelectorAll(".langs button").forEach(function(b){b.onclick=function(){set(b.dataset.l);try{history.replaceState(null,"","?lang="+b.dataset.l);}catch(e){}};});
  set(lang);
})();
