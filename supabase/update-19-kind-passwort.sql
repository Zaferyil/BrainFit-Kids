-- Update 19: Admin sieht die Passwörter der Kinder (Kinder-Konten haben einfache Passwörter wie „stern47“).
-- Eigene Tabelle, nur für Admins lesbar. Kinder, Eltern und Lehrkräfte sehen sie nicht.
create table if not exists public.kind_passwort (
  kind uuid primary key references public.kinder(id) on delete cascade,
  passwort text not null,
  geaendert timestamptz not null default now()
);
alter table public.kind_passwort enable row level security;
drop policy if exists "admin liest kind_passwort" on public.kind_passwort;
create policy "admin liest kind_passwort" on public.kind_passwort for select using (public.meine_rolle() = 'admin');
