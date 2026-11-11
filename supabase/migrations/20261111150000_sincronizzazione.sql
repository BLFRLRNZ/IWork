-- MyTurn: sincronizzazione tra dispositivi.
-- Sul server arrivano solo dati cifrati sul dispositivo con la password dell'utente (AES-GCM, chiave da PBKDF2):
-- il server non può leggerli. sync_meta tiene il "sale" della password e un piccolo testo cifrato per controllarla.
-- sync_items tiene un elemento per giorno/reperibilità/secondo lavoro/busta paga/impostazioni; k è un HMAC, quindi
-- nemmeno le date sono visibili. seq cresce a ogni scrittura: i dispositivi chiedono "tutto dopo seq N".
create table if not exists public.sync_meta(
  user_id uuid primary key references auth.users on delete cascade,
  salt text not null,
  check_iv text not null,
  check_data text not null,
  created_at timestamptz not null default now()
);
create sequence if not exists public.sync_seq;
create table if not exists public.sync_items(
  user_id uuid not null references auth.users on delete cascade,
  k text not null check (length(k) between 8 and 64),
  iv text not null check (length(iv) <= 32),
  data text not null check (length(data) <= 60000),
  seq bigint not null default nextval('public.sync_seq'),
  primary key(user_id,k)
);
create index if not exists sync_items_seq on public.sync_items(user_id,seq);
alter table public.sync_meta enable row level security;
alter table public.sync_items enable row level security;
create policy "sync meta propria" on public.sync_meta for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "sync dati propri" on public.sync_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant usage, select on sequence public.sync_seq to authenticated;

create or replace function public.sync_bump_seq() returns trigger
language plpgsql set search_path = public as $$
begin
  new.seq := nextval('public.sync_seq');
  new.user_id := old.user_id;
  return new;
end $$;
create trigger sync_items_bump before update on public.sync_items
  for each row execute function public.sync_bump_seq();
