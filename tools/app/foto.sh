#!/bin/bash
# Estrae le foto dal registro dell'ultima esecuzione del workflow "App iPhone e Android".
# Uso: tools/app/foto.sh [cartella]   (serve gh con accesso a BLFRLRNZ/MyTurn-)
R=BLFRLRNZ/MyTurn-;OUT=${1:-/tmp/myturn-app-foto};mkdir -p "$OUT"
RUN=$(gh api "repos/$R/actions/runs?per_page=20" --jq '[.workflow_runs[]|select(.name=="App iPhone e Android")][0].id')
for J in $(gh api "repos/$R/actions/runs/$RUN/jobs" --jq '.jobs[].id'); do
  gh api "repos/$R/actions/jobs/$J/logs" 2>/dev/null | sed -E 's/^[0-9T:.Z-]+ //' | awk -v o="$OUT" '
    /^FOTO-INIZIO /{n=$2;f=o"/"n".b64";printf "" > f;next} /^FOTO-FINE/{close(f);f="";next} f!=""{print >> f}'
done
for b in "$OUT"/*.b64; do [ -e "$b" ] || continue; case "$b" in *android*) e=png;; *) e=jpg;; esac; base64 -d "$b" > "${b%.b64}.$e" 2>/dev/null && rm "$b"; done
ls "$OUT"
