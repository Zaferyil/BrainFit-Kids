-- BrainFit Kids – Datenbank (Supabase / Postgres)
-- Einmal im Supabase-Dashboard unter „SQL Editor“ → „New query“ einfügen und „Run“ drücken.
-- Das Skript kann gefahrlos mehrmals laufen.
--
-- Grundsätze
-- • Jede Person meldet sich über Supabase Auth an. Kinder bekommen eine interne Adresse
--   <benutzername>@kinder.brainfit-kids.at, damit sie sich mit Benutzername und Passwort anmelden.
-- • Row Level Security (RLS) überall: ein Kind sieht nur seine Daten, Eltern nur ihre Kinder,
--   Lehrkräfte ihre Klasse, Admins alles.
-- • Sterne, Diamanten, Käufe und Belohnungen ändert nur der Server (Funktionen unten, security definer).
--   Das Kind kann sein Guthaben nie direkt schreiben.

-- ───────────── Rollen und Personen ─────────────
create table if not exists public.personen (
  id uuid primary key references auth.users on delete cascade,
  rolle text not null check (rolle in ('kind', 'eltern', 'lehrkraft', 'admin')),
  name text not null default '',
  erstellt timestamptz not null default now()
);

create table if not exists public.klassen (
  code text primary key,
  lehrkraft uuid references public.personen on delete set null,
  erstellt timestamptz not null default now()
);

create table if not exists public.kinder (
  id uuid primary key references public.personen on delete cascade,
  benutzer text not null unique,
  vorname text not null,
  stufe smallint check (stufe between 0 and 6),
  klasse text references public.klassen on delete set null,
  eltern uuid references public.personen on delete set null,
  paket text check (paket in ('basic', 'plus', 'premium')),
  archiviert boolean not null default false,
  erstellt timestamptz not null default now()
);

-- Hilfsfunktionen für die Regeln
create or replace function public.meine_rolle() returns text
language sql stable security definer set search_path = public as $$
  select rolle from public.personen where id = auth.uid()
$$;

create or replace function public.darf_kind_sehen(k uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select k = auth.uid()
    or public.meine_rolle() = 'admin'
    or exists (select 1 from public.kinder where id = k and eltern = auth.uid())
    or exists (select 1 from public.kinder ki join public.klassen kl on kl.code = ki.klasse
               where ki.id = k and kl.lehrkraft = auth.uid())
$$;

-- ───────────── Lernfortschritt ─────────────
-- Fortschritt, Tagesziele, Einstufung usw. als JSON, wie in der App (kein Guthaben!)
create table if not exists public.fortschritt (
  kind uuid primary key references public.kinder on delete cascade,
  daten jsonb not null default '{}',
  geaendert timestamptz not null default now()
);

create table if not exists public.hausaufgaben (
  kind uuid not null references public.kinder on delete cascade,
  schluessel text not null,                 -- „welt-einheit-runde“
  status text not null default 'offen' check (status in ('offen', 'selbst', 'bestanden', 'wiederholen', 'lehrkraft')),
  daten jsonb not null default '{}',        -- Auftrag, geprüft, richtig, falsch, Versuche
  foto text,                                -- Pfad im Speicher „buchfotos“
  geaendert timestamptz not null default now(),
  primary key (kind, schluessel)
);

create table if not exists public.workbook_loesungen (
  seite int not null,
  aufgabe int not null,
  loesung int not null,
  primary key (seite, aufgabe)
);

-- ───────────── SeZa-Shop und Guthaben ─────────────
create table if not exists public.shop_artikel (
  id text primary key,
  name text not null,
  slot text not null,
  preis int not null check (preis >= 0),
  waehrung text not null check (waehrung in ('sterne', 'diamanten')),
  start boolean not null default false,
  aktiv boolean not null default true,
  bild text
);

create table if not exists public.belohnungen (
  art text primary key,
  sterne int not null default 0 check (sterne >= 0),
  diamanten int not null default 0 check (diamanten >= 0)
);

create table if not exists public.konten (
  kind uuid primary key references public.kinder on delete cascade,
  sterne int not null default 0 check (sterne >= 0),
  diamanten int not null default 0 check (diamanten >= 0),
  ausstattung jsonb not null default '{"outfit":"original"}',
  start_gewaehlt boolean not null default false
);

create table if not exists public.besitz (
  kind uuid not null references public.kinder on delete cascade,
  artikel text not null references public.shop_artikel on delete cascade,
  seit timestamptz not null default now(),
  primary key (kind, artikel)
);

-- jede Gutschrift, jeder Kauf, jede Korrektur; die id verhindert doppelte Belohnungen
create table if not exists public.buchungen (
  kind uuid not null references public.kinder on delete cascade,
  id text not null,
  art text not null check (art in ('belohnung', 'kauf', 'korrektur')),
  grund text not null,
  sterne int not null default 0,
  diamanten int not null default 0,
  artikel text,
  von uuid references public.personen on delete set null,
  zeit timestamptz not null default now(),
  primary key (kind, id)
);

-- ───────────── Bestellungen (Stripe) ─────────────
create table if not exists public.bestellungen (
  stripe_session text primary key,
  eltern_mail text not null,
  paket text not null,
  takt text not null check (takt in ('monat', 'jahr')),
  kind_vorname text,
  kind_stufe smallint,
  kind uuid references public.kinder on delete set null,
  status text not null default 'bezahlt',
  erstellt timestamptz not null default now()
);

-- ───────────── Row Level Security ─────────────
alter table public.personen enable row level security;
alter table public.klassen enable row level security;
alter table public.kinder enable row level security;
alter table public.fortschritt enable row level security;
alter table public.hausaufgaben enable row level security;
alter table public.workbook_loesungen enable row level security;
alter table public.shop_artikel enable row level security;
alter table public.belohnungen enable row level security;
alter table public.konten enable row level security;
alter table public.besitz enable row level security;
alter table public.buchungen enable row level security;
alter table public.bestellungen enable row level security;

drop policy if exists p_personen on public.personen;
create policy p_personen on public.personen for select using (id = auth.uid() or public.meine_rolle() in ('admin', 'lehrkraft'));

drop policy if exists p_klassen on public.klassen;
create policy p_klassen on public.klassen for select using (auth.uid() is not null);
drop policy if exists p_klassen_admin on public.klassen;
create policy p_klassen_admin on public.klassen for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

drop policy if exists p_kinder on public.kinder;
create policy p_kinder on public.kinder for select using (public.darf_kind_sehen(id));
drop policy if exists p_kinder_stufe on public.kinder;
create policy p_kinder_stufe on public.kinder for update using (id = auth.uid() or public.meine_rolle() in ('admin', 'lehrkraft'));

drop policy if exists p_fortschritt on public.fortschritt;
create policy p_fortschritt on public.fortschritt for select using (public.darf_kind_sehen(kind));
drop policy if exists p_fortschritt_schreiben on public.fortschritt;
create policy p_fortschritt_schreiben on public.fortschritt for all using (kind = auth.uid() or public.meine_rolle() in ('admin', 'lehrkraft'))
  with check (kind = auth.uid() or public.meine_rolle() in ('admin', 'lehrkraft'));

drop policy if exists p_hausaufgaben on public.hausaufgaben;
create policy p_hausaufgaben on public.hausaufgaben for select using (public.darf_kind_sehen(kind));
drop policy if exists p_hausaufgaben_kind on public.hausaufgaben;
-- das Kind schreibt nur „offen“, „selbst“; bestanden/wiederholen setzt die Funktion, „lehrkraft“ die Lehrkraft
create policy p_hausaufgaben_kind on public.hausaufgaben for insert with check (kind = auth.uid() and status in ('offen', 'selbst'));
drop policy if exists p_hausaufgaben_lehrkraft on public.hausaufgaben;
create policy p_hausaufgaben_lehrkraft on public.hausaufgaben for update using (public.meine_rolle() in ('admin', 'lehrkraft'));

drop policy if exists p_loesungen on public.workbook_loesungen;
create policy p_loesungen on public.workbook_loesungen for all using (public.meine_rolle() in ('admin', 'lehrkraft'))
  with check (public.meine_rolle() in ('admin', 'lehrkraft'));

drop policy if exists p_shop on public.shop_artikel;
create policy p_shop on public.shop_artikel for select using (true);
drop policy if exists p_shop_admin on public.shop_artikel;
create policy p_shop_admin on public.shop_artikel for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

drop policy if exists p_belohnungen on public.belohnungen;
create policy p_belohnungen on public.belohnungen for select using (true);
drop policy if exists p_belohnungen_admin on public.belohnungen;
create policy p_belohnungen_admin on public.belohnungen for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

-- Guthaben, Besitz, Buchungen: nur lesen; ändern nur über die Funktionen unten
drop policy if exists p_konten on public.konten;
create policy p_konten on public.konten for select using (public.darf_kind_sehen(kind));
drop policy if exists p_besitz on public.besitz;
create policy p_besitz on public.besitz for select using (public.darf_kind_sehen(kind));
drop policy if exists p_buchungen on public.buchungen;
create policy p_buchungen on public.buchungen for select using (public.darf_kind_sehen(kind));

drop policy if exists p_bestellungen on public.bestellungen;
create policy p_bestellungen on public.bestellungen for select using (public.meine_rolle() = 'admin');

-- ───────────── Server-Funktionen (atomar, nie ins Minus, nie doppelt) ─────────────
create or replace function public.belohnen(p_art text, p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare w record; bid text := p_art || ':' || p_id;
begin
  if public.meine_rolle() <> 'kind' then raise exception 'nur für Kinder'; end if;
  select * into w from belohnungen where art = p_art;
  if not found or (w.sterne = 0 and w.diamanten = 0) then return null; end if;
  insert into konten (kind) values (auth.uid()) on conflict do nothing;
  insert into buchungen (kind, id, art, grund, sterne, diamanten) values (auth.uid(), bid, 'belohnung', p_art, w.sterne, w.diamanten)
    on conflict do nothing;
  if not found then return null; end if;          -- schon belohnt
  update konten set sterne = sterne + w.sterne, diamanten = diamanten + w.diamanten where kind = auth.uid();
  return jsonb_build_object('sterne', w.sterne, 'diamanten', w.diamanten);
end $$;

create or replace function public.kaufen(p_artikel text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a record; k record;
begin
  if public.meine_rolle() <> 'kind' then raise exception 'nur für Kinder'; end if;
  select * into a from shop_artikel where id = p_artikel and aktiv;
  if not found then return jsonb_build_object('ok', false, 'grund', 'unbekannt'); end if;
  insert into konten (kind) values (auth.uid()) on conflict do nothing;
  select * into k from konten where kind = auth.uid() for update;   -- sperrt das Konto bis zum Ende
  if exists (select 1 from besitz where kind = auth.uid() and artikel = p_artikel) then
    return jsonb_build_object('ok', false, 'grund', 'besitz'); end if;
  if a.waehrung = 'sterne' and k.sterne < a.preis then
    return jsonb_build_object('ok', false, 'grund', 'sterne', 'fehlt', a.preis - k.sterne); end if;
  if a.waehrung = 'diamanten' and k.diamanten < a.preis then
    return jsonb_build_object('ok', false, 'grund', 'diamanten', 'fehlt', a.preis - k.diamanten); end if;
  update konten set sterne = sterne - case when a.waehrung = 'sterne' then a.preis else 0 end,
                    diamanten = diamanten - case when a.waehrung = 'diamanten' then a.preis else 0 end
    where kind = auth.uid();
  insert into besitz (kind, artikel) values (auth.uid(), p_artikel);
  insert into buchungen (kind, id, art, grund, artikel, sterne, diamanten)
    values (auth.uid(), 'kauf:' || p_artikel, 'kauf', a.name, p_artikel,
            case when a.waehrung = 'sterne' then -a.preis else 0 end, case when a.waehrung = 'diamanten' then -a.preis else 0 end);
  return jsonb_build_object('ok', true);
end $$;

-- Anziehen: nur Artikel, die dem Kind gehören (oder Start-Kostüme)
create or replace function public.anziehen(p_ausstattung jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare v text;
begin
  if public.meine_rolle() <> 'kind' then raise exception 'nur für Kinder'; end if;
  for v in select value from jsonb_each_text(p_ausstattung) loop
    if not exists (select 1 from besitz where kind = auth.uid() and artikel = v)
       and not exists (select 1 from shop_artikel where id = v and start) then return false; end if;
  end loop;
  insert into konten (kind, ausstattung, start_gewaehlt) values (auth.uid(), p_ausstattung, true)
    on conflict (kind) do update set ausstattung = excluded.ausstattung, start_gewaehlt = true;
  return true;
end $$;

-- Lehrkraft/Admin: Guthaben nachvollziehbar korrigieren
create or replace function public.korrigieren(p_kind uuid, p_sterne int, p_diamanten int, p_grund text) returns void
language plpgsql security definer set search_path = public as $$
declare k record;
begin
  if public.meine_rolle() not in ('admin', 'lehrkraft') or not public.darf_kind_sehen(p_kind) then raise exception 'keine Berechtigung'; end if;
  if coalesce(trim(p_grund), '') = '' then raise exception 'Grund fehlt'; end if;
  insert into konten (kind) values (p_kind) on conflict do nothing;
  select * into k from konten where kind = p_kind for update;
  update konten set sterne = greatest(0, sterne + p_sterne), diamanten = greatest(0, diamanten + p_diamanten) where kind = p_kind;
  insert into buchungen (kind, id, art, grund, sterne, diamanten, von)
    values (p_kind, 'korrektur:' || extract(epoch from clock_timestamp())::text, 'korrektur', p_grund,
            greatest(0, k.sterne + p_sterne) - k.sterne, greatest(0, k.diamanten + p_diamanten) - k.diamanten, auth.uid());
end $$;

-- Benutzername → interne Anmelde-Adresse (für den Login mit Benutzername)
create or replace function public.anmelde_adresse(p_benutzer text) returns text
language sql immutable as $$ select lower(trim(p_benutzer)) || '@kinder.brainfit-kids.at' $$;

grant execute on function public.belohnen, public.kaufen, public.anziehen, public.korrigieren, public.anmelde_adresse to authenticated;
revoke execute on function public.belohnen, public.kaufen, public.anziehen, public.korrigieren from anon;

-- ───────────── Startwerte ─────────────
insert into public.belohnungen (art, sterne, diamanten) values
  ('uebung', 10, 0), ('lektion', 25, 0), ('test', 30, 0), ('buch', 15, 0), ('tagesziel', 10, 0),
  ('spiel', 5, 0), ('testPerfekt', 0, 1), ('welt', 50, 3)
on conflict (art) do nothing;

insert into public.shop_artikel (id, name, slot, preis, waehrung, start) values
  ('original', 'SeZa Original', 'outfit', 0, 'sterne', true),
  ('sportler', 'Sportler', 'outfit', 0, 'sterne', true),
  ('entdecker', 'Entdecker', 'outfit', 0, 'sterne', true),
  ('astronaut', 'Astronaut', 'outfit', 450, 'sterne', false),
  ('superheld', 'Superheld', 'outfit', 400, 'sterne', false),
  ('zauberer', 'Zauberer', 'outfit', 400, 'sterne', false),
  ('wissenschaftler', 'Wissenschaftler', 'outfit', 350, 'sterne', false),
  ('winterheld', 'Winterheld', 'outfit', 350, 'sterne', false),
  ('genie', 'Genie', 'outfit', 450, 'sterne', false),
  ('ninja', 'Ninja', 'outfit', 400, 'sterne', false),
  ('pirat', 'Pirat', 'outfit', 400, 'sterne', false),
  ('ritter', 'Ritter', 'outfit', 450, 'sterne', false),
  ('feuerwehr', 'Feuerwehr', 'outfit', 350, 'sterne', false),
  ('gold-abakus', 'Goldener Abakus', 'hand', 500, 'sterne', false),
  ('brille', 'Brille', 'brille', 150, 'sterne', false),
  ('krone', 'Krone', 'kopf', 300, 'sterne', false),
  ('umhang', 'Umhang', 'ruecken', 200, 'sterne', false),
  ('raketenrucksack', 'Raketen-Rucksack', 'ruecken', 350, 'sterne', false),
  ('zauberstab', 'Zauberstab', 'stab', 250, 'sterne', false),
  ('hund', 'Hunde-Begleiter', 'begleiter', 400, 'sterne', false)
on conflict (id) do nothing;

-- ───────────── Speicher für Buchfotos (nur Kind selbst und Lehrkraft/Admin) ─────────────
insert into storage.buckets (id, name, public) values ('buchfotos', 'buchfotos', false) on conflict do nothing;
drop policy if exists p_fotos_kind on storage.objects;
create policy p_fotos_kind on storage.objects for insert to authenticated
  with check (bucket_id = 'buchfotos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists p_fotos_lesen on storage.objects;
create policy p_fotos_lesen on storage.objects for select to authenticated
  using (bucket_id = 'buchfotos' and ((storage.foldername(name))[1] = auth.uid()::text or public.meine_rolle() in ('admin', 'lehrkraft')));
