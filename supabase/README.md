# Server (Supabase)

Serve solo a chi sceglie di creare un account. Senza account l'app funziona come prima e tutti i dati restano sul telefono.

## Cosa c'è sul server

| Tabella | Cosa contiene |
|---|---|
| `profiles` | Minuti di anticipo dei promemoria, lingua e fuso orario. |
| `push_subs` | Iscrizioni alle notifiche, una per ogni dispositivo. |
| `shifts` | Turni dei prossimi 45 giorni: ora d'inizio, ora del promemoria e testo della notifica, già scritto dall'app nella lingua dell'utente. |
| `app_config` | Chiavi VAPID e segreto del cron. Nessun utente può leggerla: la legge solo il server. |

Le regole di accesso (RLS) sono attive su tutte le tabelle: ognuno vede solo le proprie righe. Le scritture passano dalle funzioni `save_push`, `forget_push` e `set_shifts`.

## Funzioni

| Funzione | Cosa fa | Controllo del token di accesso |
|---|---|---|
| `send-reminders` | La chiama `pg_cron` ogni minuto. Manda le notifiche dei turni in arrivo e cancella le iscrizioni non più valide. | spento: è protetta dal segreto del cron |
| `push-test` | Manda la notifica di prova dalla scheda Promemoria. | acceso |
| `delete-account` | Elimina l'account e tutti i suoi dati. | acceso |

## Configurazione da fare una volta

1. Applicare `migrations/20261111000000_account_promemoria.sql`.
2. Pubblicare le tre funzioni.
3. Scrivere in `app_config` le chiavi VAPID (`vapid_public`, `vapid_private`, `vapid_subject`) e `cron_secret`. **La chiave privata non va mai nel repository.**
4. Attivare `pg_cron` e `pg_net` e programmare la chiamata a `send-reminders`:
   ```sql
   select cron.schedule('iwork-reminders', '* * * * *', $$
     select net.http_post(
       url := 'https://<progetto>.supabase.co/functions/v1/send-reminders',
       headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<cron_secret>'),
       body := '{}'::jsonb)
   $$);
   ```
5. In **Authentication → Email Templates → Magic Link**, mettere il codice a 6 cifre (`{{ .Token }}`) nel testo dell'email. L'app chiede il codice invece del link, perché su iPhone il link aprirebbe Safari e non l'app installata.
6. Nell'app, impostare in `SUPA` (dentro `index.html`) l'URL del progetto e la chiave pubblica (anon). La chiave pubblica può stare nel codice: la protezione la danno le regole RLS.

## Email

Il servizio email incluso in Supabase manda poche email all'ora, e solo agli indirizzi dei membri del progetto. Va bene per le prove. Per gli utenti veri serve un servizio email esterno (SMTP), per esempio Resend o Brevo, da impostare in **Authentication → SMTP Settings**.
