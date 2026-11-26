-- Update 23: Vor-Ort-Kurs (Linz) – Voranmeldung, Schnupperkurs und Anmeldung über /vorort
-- Die Edge Function „vorort-anmeldung“ speichert die Formulare (Service-Rolle) und schickt E-Mails an Eltern und Admin.
create table if not exists public.vorort_anmeldungen (
  id uuid primary key default gen_random_uuid(),
  art text not null check (art in ('voranmeldung', 'schnupper', 'anmeldung')),
  eltern_vorname text not null,
  eltern_nachname text not null,
  mail text not null,
  telefon text,
  strasse text,
  plz text,
  ort text,
  kind_vorname text not null,
  kind_nachname text,
  kind_geburt date,
  kind_stufe int,
  wunschzeiten text,
  nachricht text,
  takt text check (takt in ('monat', 'jahr')),
  betrag numeric,
  status text not null default 'neu',
  notiz text,
  mail_gesendet timestamptz,
  erstellt timestamptz not null default now()
);
create index if not exists vorort_anmeldungen_erstellt on public.vorort_anmeldungen (erstellt desc);
alter table public.vorort_anmeldungen enable row level security;
-- nur Admins lesen und bearbeiten; Eintragen nur über die Edge Function
drop policy if exists "admin vorort_anmeldungen" on public.vorort_anmeldungen;
create policy "admin vorort_anmeldungen" on public.vorort_anmeldungen for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');
