-- Update 11: Push-Benachrichtigungen (Erinnerungen fürs Kind, Wochenbericht für Eltern)
-- Im Supabase SQL-Editor ausführen. CRON_GEHEIM unten durch den Wert von der Kopier-Seite ersetzen.

-- Einstellungen je Kind (setzen die Eltern). Standard: aus – erst die Eltern schalten Erinnerungen ein.
create table if not exists public.push_einstellungen (
  kind uuid primary key references public.kinder on delete cascade,
  kind_an boolean not null default false,
  erinnerung time not null default '17:00',
  serie_an boolean not null default true,
  eltern_woche boolean not null default true,
  eltern_pause boolean not null default true,
  geaendert timestamptz not null default now()
);
alter table public.push_einstellungen enable row level security;
drop policy if exists push_einst_lesen on public.push_einstellungen;
create policy push_einst_lesen on public.push_einstellungen for select using (public.darf_kind_sehen(kind));
drop policy if exists push_einst_schreiben on public.push_einstellungen;
create policy push_einst_schreiben on public.push_einstellungen for all
  using (public.meine_rolle() = 'admin' or exists (select 1 from public.kinder where id = kind and eltern = auth.uid()))
  with check (public.meine_rolle() = 'admin' or exists (select 1 from public.kinder where id = kind and eltern = auth.uid()));

-- Geräte, die Benachrichtigungen bekommen (eins je Gerät, Kind und Rolle)
create table if not exists public.push_abos (
  id bigserial primary key,
  endpoint text not null,
  person uuid not null references public.personen on delete cascade,
  kind uuid not null references public.kinder on delete cascade,
  rolle text not null check (rolle in ('kind', 'eltern')),
  p256dh text not null,
  auth text not null,
  erstellt timestamptz not null default now(),
  unique (endpoint, kind, rolle)
);
alter table public.push_abos enable row level security;
drop policy if exists push_abos_eigene on public.push_abos;
create policy push_abos_eigene on public.push_abos for select using (person = auth.uid());
drop policy if exists push_abos_loeschen on public.push_abos;
create policy push_abos_loeschen on public.push_abos for delete using (person = auth.uid());

-- Anmelden eines Geräts: Kind nur für sich selbst, Eltern nur für eigene Kinder
create or replace function public.push_abo_speichern(p_kind uuid, p_rolle text, p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if p_rolle = 'kind' and p_kind <> auth.uid() then raise exception 'nicht erlaubt'; end if;
  if p_rolle = 'eltern' and not exists (select 1 from kinder where id = p_kind and eltern = auth.uid()) then raise exception 'nicht erlaubt'; end if;
  if p_rolle not in ('kind', 'eltern') then raise exception 'rolle'; end if;
  delete from push_abos where endpoint = p_endpoint and kind = p_kind and rolle = p_rolle;
  insert into push_abos (endpoint, person, kind, rolle, p256dh, auth) values (p_endpoint, auth.uid(), p_kind, p_rolle, p_p256dh, p_auth);
end $$;
grant execute on function public.push_abo_speichern(uuid, text, text, text, text) to authenticated;

-- Protokoll (damit nichts doppelt kommt und höchstens 2 Nachrichten am Tag); nur der Server liest es
create table if not exists public.push_log (
  id bigserial primary key,
  kind uuid not null references public.kinder on delete cascade,
  rolle text not null,
  art text not null,
  tag date not null,
  zeit timestamptz not null default now()
);
create index if not exists push_log_kind_tag on public.push_log (kind, tag);
alter table public.push_log enable row level security;

-- Alle 15 Minuten prüft die Funktion „push-senden“, ob etwas fällig ist
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('push-senden') where exists (select 1 from cron.job where jobname = 'push-senden');
select cron.schedule('push-senden', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://zqskietwmexfrwisgrft.supabase.co/functions/v1/push-senden',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc2tpZXR3bWV4ZnJ3aXNncmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODQxMzYsImV4cCI6MjEwODk2MDEzNn0.uLR_tvZLJw01G8Bpg_dxajikFQ5rlsidegMOOZGXrbI',
      'x-cron', 'CRON_GEHEIM'),
    body := '{}'::jsonb)
$$);
