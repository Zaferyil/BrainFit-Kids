-- Update 15: Gratis Kopfrechen-Check (Website) – anonyme Ergebnisse für den Vergleich mit Gleichaltrigen

create table if not exists public.check_ergebnisse (
  id uuid primary key default gen_random_uuid(),
  erstellt timestamptz not null default now(),
  alter_jahre smallint not null check (alter_jahre between 3 and 14),
  stufe smallint not null check (stufe between 0 and 6),
  rechnen smallint not null check (rechnen between 0 and 100),
  abakus smallint not null check (abakus between 0 and 100),
  blitz smallint not null check (blitz between 0 and 100),
  merken smallint not null check (merken between 0 and 100),
  konzentration smallint not null check (konzentration between 0 and 100),
  gesamt smallint not null check (gesamt between 0 and 100),
  dauer_sek int,
  -- Testvariante: A = Vorschule (Bilder), B = kennt Zahlen (Auswahl), C = Schulkind (Eintippen); abakus = kennt den Abakus
  variante text not null default 'C' check (variante in ('A', 'B', 'C')),
  abakus_bekannt boolean not null default false,
  -- nur wenn die Eltern den Bericht anfordern (setzt die Funktion „check-bericht“)
  mail text,
  newsletter boolean not null default false,
  bericht_gesendet timestamptz
);
create index if not exists check_stufe on public.check_ergebnisse (stufe, variante, abakus_bekannt);
alter table public.check_ergebnisse enable row level security;

-- Jeder darf ein Ergebnis speichern (ohne Mail); lesen darf nur der Admin
drop policy if exists check_speichern on public.check_ergebnisse;
create policy check_speichern on public.check_ergebnisse for insert to anon, authenticated with check (mail is null and bericht_gesendet is null and newsletter = false);
drop policy if exists check_admin on public.check_ergebnisse;
create policy check_admin on public.check_ergebnisse for select using (public.meine_rolle() = 'admin');

-- Vergleich: Anteil der Kinder derselben Schulstufe mit einem niedrigeren Wert (Perzentil) – nur Zahlen, keine Einzeldaten
create or replace function public.check_vergleich(p_stufe smallint, p_variante text, p_abakus boolean, w jsonb)
returns jsonb language sql stable security definer set search_path = public as $$
  with g as (select * from check_ergebnisse where stufe = p_stufe and variante = p_variante and abakus_bekannt = p_abakus)
  select jsonb_build_object(
    'anzahl', (select count(*) from g),
    'rechnen', (select round(100.0 * count(*) filter (where rechnen < (w->>'rechnen')::int) / nullif(count(*), 0)) from g),
    'abakus', (select round(100.0 * count(*) filter (where abakus < (w->>'abakus')::int) / nullif(count(*), 0)) from g),
    'blitz', (select round(100.0 * count(*) filter (where blitz < (w->>'blitz')::int) / nullif(count(*), 0)) from g),
    'merken', (select round(100.0 * count(*) filter (where merken < (w->>'merken')::int) / nullif(count(*), 0)) from g),
    'konzentration', (select round(100.0 * count(*) filter (where konzentration < (w->>'konzentration')::int) / nullif(count(*), 0)) from g),
    'gesamt', (select round(100.0 * count(*) filter (where gesamt < (w->>'gesamt')::int) / nullif(count(*), 0)) from g),
    'schnitt', (select jsonb_build_object('rechnen', round(avg(rechnen)), 'abakus', round(avg(abakus)), 'blitz', round(avg(blitz)),
                'merken', round(avg(merken)), 'konzentration', round(avg(konzentration)), 'gesamt', round(avg(gesamt))) from g)
  )
$$;
grant execute on function public.check_vergleich(smallint, text, boolean, jsonb) to anon, authenticated;

-- Statistik für den Admin-Bereich
create or replace function public.check_statistik()
returns table (stufe smallint, anzahl bigint, mit_mail bigint, schnitt_gesamt numeric)
language sql stable security definer set search_path = public as $$
  select stufe, count(*), count(mail), round(avg(gesamt))
  from check_ergebnisse where public.meine_rolle() = 'admin'
  group by stufe order by stufe
$$;
grant execute on function public.check_statistik() to authenticated;
