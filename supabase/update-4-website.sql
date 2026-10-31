-- Update 4: Website-Einstellungen (Countdown, Kampagnen-Popup) – vom Admin im Admin-Bereich änderbar
create table if not exists public.website (
  id int primary key default 1 check (id = 1),
  daten jsonb not null default '{}'::jsonb,
  geaendert timestamptz not null default now()
);
alter table public.website enable row level security;

-- alle dürfen lesen (die Website braucht die Daten ohne Anmeldung), nur Admins ändern
drop policy if exists p_website_lesen on public.website;
create policy p_website_lesen on public.website for select using (true);
drop policy if exists p_website_admin on public.website;
create policy p_website_admin on public.website for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

insert into public.website (id, daten) values (1, '{
  "countdown": {"an": true, "ende": "2026-11-30T23:59", "titel": "Jetzt Gründerpreis sichern – nur noch kurze Zeit!", "fuss": "Nur für die ersten 50 Familien · noch 37 Plätze", "balken": 26},
  "popup": {"an": false, "titel": "", "text": "", "knopf": "Zu den Paketen", "code": "", "ab": "", "bis": "", "sekunden": 8}
}'::jsonb) on conflict (id) do nothing;
