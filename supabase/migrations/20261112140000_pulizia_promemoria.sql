-- Pulizia giornaliera: i promemoria di turni iniziati da più di un giorno non servono più
-- (lo dice l'informativa privacy). Prima venivano cancellati solo quando l'utente mandava di nuovo i suoi turni.
select cron.schedule('myturn-cleanup', '17 3 * * *',
  $$delete from public.shifts where start_at < now() - interval '1 day'$$);
