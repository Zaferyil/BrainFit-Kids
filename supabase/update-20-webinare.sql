-- Update 20: Online-Webinare für Eltern. Admin legt Webinare an (mit Zoom-Link),
-- Eltern melden sich über /webinar an und bekommen automatisch eine E-Mail mit dem Zoom-Link.
create table if not exists public.webinare (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  beschreibung text,
  beginn timestamptz not null,
  dauer_min int not null default 60,
  zoom_link text not null,
  aktiv boolean not null default true,
  erstellt timestamptz not null default now()
);
create table if not exists public.webinar_anmeldungen (
  id uuid primary key default gen_random_uuid(),
  webinar uuid not null references public.webinare(id) on delete cascade,
  vorname text not null,
  nachname text not null,
  mail text not null,
  telefon text,
  ort text,
  kind_alter int,
  kind_klasse text,
  mail_gesendet timestamptz,
  erstellt timestamptz not null default now(),
  unique (webinar, mail)
);
alter table public.webinare enable row level security;
alter table public.webinar_anmeldungen enable row level security;
drop policy if exists "admin webinare" on public.webinare;
create policy "admin webinare" on public.webinare for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');
drop policy if exists "admin webinar_anmeldungen" on public.webinar_anmeldungen;
create policy "admin webinar_anmeldungen" on public.webinar_anmeldungen for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

-- Öffentlich: kommende Webinare OHNE Zoom-Link (den gibt es nur per E-Mail nach der Anmeldung)
create or replace function public.webinare_offen() returns table (id uuid, titel text, beschreibung text, beginn timestamptz, dauer_min int)
language sql stable security definer set search_path = public as $$
  select id, titel, beschreibung, beginn, dauer_min from public.webinare
  where aktiv and beginn + make_interval(mins => dauer_min) > now() order by beginn
$$;
grant execute on function public.webinare_offen() to anon, authenticated;
