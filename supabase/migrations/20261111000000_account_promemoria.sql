-- iWork: account e promemoria.
-- Sul server vanno solo: le preferenze dei promemoria, le iscrizioni alle notifiche
-- e i turni dei prossimi 45 giorni (orario e testo della notifica). Tutto il resto resta sul telefono.

-- Preferenze dell'utente
create table if not exists public.profiles(
  user_id uuid primary key references auth.users on delete cascade,
  remind_min int not null default 60 check (remind_min between 0 and 1440),
  lang text not null default 'it',
  tz text not null default 'Europe/Rome',
  updated_at timestamptz not null default now()
);

-- Iscrizioni alle notifiche push (una per dispositivo/browser)
create table if not exists public.push_subs(
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  ua text,
  created_at timestamptz not null default now(),
  last_ok timestamptz
);
create index if not exists push_subs_user on public.push_subs(user_id);

-- Turni in arrivo, con il testo della notifica già scritto dall'app nella lingua dell'utente
create table if not exists public.shifts(
  user_id uuid not null references auth.users on delete cascade,
  start_at timestamptz not null,
  kind text not null default 'w' check (kind in ('w','j2','oc')),
  remind_at timestamptz not null,
  title text not null default '',
  body text not null default '',
  notified_at timestamptz,
  primary key(user_id,start_at,kind)
);
create index if not exists shifts_due on public.shifts(remind_at) where notified_at is null;

-- Configurazione del server (chiavi VAPID, segreto del cron): nessuna regola = solo il server la legge
create table if not exists public.app_config(k text primary key, v text not null);

alter table public.profiles  enable row level security;
alter table public.push_subs enable row level security;
alter table public.shifts    enable row level security;
alter table public.app_config enable row level security;

drop policy if exists "profilo proprio" on public.profiles;
create policy "profilo proprio" on public.profiles for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "iscrizioni proprie" on public.push_subs;
create policy "iscrizioni proprie" on public.push_subs for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "turni propri" on public.shifts;
create policy "turni propri" on public.shifts for select to authenticated
  using (user_id = (select auth.uid()));

-- Salva l'iscrizione di questo dispositivo (se era di un altro account sullo stesso telefono, passa a questo)
create or replace function public.save_push(p_endpoint text, p_p256dh text, p_auth text, p_ua text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from push_subs where endpoint = p_endpoint;
  insert into push_subs(user_id, endpoint, p256dh, auth, ua) values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_ua, 200));
end $$;

create or replace function public.forget_push(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from push_subs where endpoint = p_endpoint and user_id = auth.uid();
$$;

-- Sostituisce i turni futuri dell'utente con quelli mandati dall'app.
-- items: [{"s":"2026-11-12T05:00:00Z","k":"w","r":"2026-11-12T04:00:00Z","t":"Mattina alle 06:00","b":"Inizia tra 1 ora."}, ...]
create or replace function public.set_shifts(items jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare n int; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) > 400 then raise exception 'bad items'; end if;
  delete from shifts s where s.user_id = uid and s.start_at > now()
    and not exists (select 1 from jsonb_array_elements(items) x
                    where (x->>'s')::timestamptz = s.start_at and coalesce(x->>'k','w') = s.kind);
  insert into shifts(user_id, start_at, kind, remind_at, title, body)
    select uid, (x->>'s')::timestamptz, coalesce(x->>'k','w'), (x->>'r')::timestamptz,
           left(coalesce(x->>'t',''), 120), left(coalesce(x->>'b',''), 240)
    from jsonb_array_elements(items) x
    where (x->>'s')::timestamptz > now()
  on conflict (user_id, start_at, kind) do update
    set remind_at = excluded.remind_at, title = excluded.title, body = excluded.body,
        notified_at = case when shifts.remind_at = excluded.remind_at then shifts.notified_at else null end;
  get diagnostics n = row_count;
  -- i turni passati da più di un giorno non servono più
  delete from shifts where user_id = uid and start_at < now() - interval '1 day';
  return n;
end $$;

-- Promemoria da mandare adesso (solo per il server)
create or replace function public.due_reminders()
returns table(user_id uuid, start_at timestamptz, kind text, title text, body text)
language sql security definer set search_path = public as $$
  select s.user_id, s.start_at, s.kind, s.title, s.body
  from shifts s
  where s.notified_at is null and s.remind_at <= now() and s.start_at > now() - interval '15 minutes'
  order by s.remind_at limit 500;
$$;

revoke all on function public.due_reminders() from public, anon, authenticated;
revoke all on function public.save_push(text,text,text,text) from public, anon;
revoke all on function public.forget_push(text) from public, anon;
revoke all on function public.set_shifts(jsonb) from public, anon;
grant execute on function public.save_push(text,text,text,text) to authenticated;
grant execute on function public.forget_push(text) to authenticated;
grant execute on function public.set_shifts(jsonb) to authenticated;
