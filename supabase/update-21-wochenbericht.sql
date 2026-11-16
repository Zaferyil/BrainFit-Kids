-- Update 21: 7-Tage-Serie (Belohnung) und wöchentlicher Bericht an die Eltern

-- 1) Belohnung für 7 Tage am Stück (Server bucht dieselbe Belohnung wie die App)
insert into public.belohnungen (art, sterne, diamanten) values ('serie', 100, 2) on conflict (art) do nothing;

-- 2) Eltern können den Wochenbericht abbestellen
create table if not exists public.eltern_einstellungen (
  eltern uuid primary key references auth.users on delete cascade,
  wochenbericht boolean not null default true,
  geaendert timestamptz not null default now()
);
alter table public.eltern_einstellungen enable row level security;
drop policy if exists "eigene eltern_einstellungen" on public.eltern_einstellungen;
create policy "eigene eltern_einstellungen" on public.eltern_einstellungen for all using (eltern = auth.uid()) with check (eltern = auth.uid());

-- 3) Protokoll: wann zuletzt verschickt und welche Lektion das Kind damals hatte (für „diese Woche geschafft“)
create table if not exists public.wochenbericht_log (
  kind uuid primary key references public.kinder on delete cascade,
  gesendet timestamptz not null,
  lektion int not null default 0
);
alter table public.wochenbericht_log enable row level security;  -- nur die Edge Function (Service-Rolle) liest und schreibt
