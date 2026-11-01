-- Update 12: Push im Admin-Bereich – automatische Benachrichtigungen ein/aus, eigene Nachrichten senden
create table if not exists public.push_global (
  id smallint primary key default 1 check (id = 1),
  auto_an boolean not null default true,
  geaendert timestamptz not null default now()
);
insert into public.push_global (id) values (1) on conflict do nothing;
alter table public.push_global enable row level security;
drop policy if exists push_global_admin on public.push_global;
create policy push_global_admin on public.push_global for all
  using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

-- Verlauf der vom Admin gesendeten Nachrichten
create table if not exists public.push_nachrichten (
  id bigserial primary key,
  zeit timestamptz not null default now(),
  titel text not null,
  text text not null,
  ziel text not null,
  kind uuid references public.kinder on delete set null,
  geraete int not null default 0
);
alter table public.push_nachrichten enable row level security;
drop policy if exists push_nachrichten_admin on public.push_nachrichten;
create policy push_nachrichten_admin on public.push_nachrichten for select using (public.meine_rolle() = 'admin');

-- Wie viele Geräte sind angemeldet? (nur Admin)
create or replace function public.push_statistik() returns table (rolle text, geraete bigint, kinder bigint)
language sql stable security definer set search_path = public as $$
  select rolle, count(*), count(distinct kind) from push_abos where public.meine_rolle() = 'admin' group by rolle
$$;
grant execute on function public.push_statistik() to authenticated;
