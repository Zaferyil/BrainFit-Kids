-- Update 13: Partner-Programm (Kontingente)
-- Partner kaufen Kredite (1 Kredit = 1 Kind, 12 Monate Zugang). Kredite sind 18 Monate gültig;
-- ein aktiviertes Kind behält seine 12 Monate, auch wenn das Kontingent danach abläuft.

-- neue Rolle „partner“
alter table public.personen drop constraint if exists personen_rolle_check;
alter table public.personen add constraint personen_rolle_check check (rolle in ('kind', 'eltern', 'lehrkraft', 'admin', 'partner'));

create table if not exists public.partner (
  id uuid primary key references public.personen on delete cascade,
  firma text not null default '',
  name text not null default '',
  mail text not null default '',
  telefon text not null default '',
  region text not null default '',
  aktiv boolean not null default true,
  notiz text not null default '',
  erstellt timestamptz not null default now()
);

-- Kontingente: ein Eintrag je Kauf
create table if not exists public.partner_kredite (
  id bigserial primary key,
  partner uuid not null references public.partner on delete cascade,
  paket text not null check (paket in ('basic', 'plus', 'premium')),
  anzahl int not null check (anzahl > 0),
  gueltig_bis timestamptz not null default (now() + interval '18 months'),
  notiz text not null default '',
  erstellt timestamptz not null default now()
);

-- Kinder eines Partners (mit dem verbrauchten Kontingent)
alter table public.kinder add column if not exists partner uuid references public.partner on delete set null;
alter table public.kinder add column if not exists kredit bigint references public.partner_kredite on delete set null;
alter table public.kinder add column if not exists eltern_mail text;
create index if not exists kinder_partner on public.kinder (partner);

-- Partner dürfen ihre eigenen Kinder sehen (Lernstand)
create or replace function public.darf_kind_sehen(k uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select k = auth.uid()
    or public.meine_rolle() = 'admin'
    or exists (select 1 from public.kinder where id = k and eltern = auth.uid())
    or exists (select 1 from public.kinder where id = k and partner = auth.uid())
    or exists (select 1 from public.kinder ki join public.klassen kl on kl.code = ki.klasse
               where ki.id = k and kl.lehrkraft = auth.uid())
$$;

alter table public.partner enable row level security;
drop policy if exists partner_lesen on public.partner;
create policy partner_lesen on public.partner for select using (id = auth.uid() or public.meine_rolle() = 'admin');
drop policy if exists partner_admin on public.partner;
create policy partner_admin on public.partner for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

alter table public.partner_kredite enable row level security;
drop policy if exists kredite_lesen on public.partner_kredite;
create policy kredite_lesen on public.partner_kredite for select using (partner = auth.uid() or public.meine_rolle() = 'admin');
drop policy if exists kredite_admin on public.partner_kredite;
create policy kredite_admin on public.partner_kredite for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

-- Partner sehen ihre Kinder in der Tabelle „kinder“
drop policy if exists kinder_partner_lesen on public.kinder;
create policy kinder_partner_lesen on public.kinder for select using (partner = auth.uid());

-- Stand je Paket: gekauft, verbraucht, frei (nur gültige Kontingente zählen als frei)
create or replace function public.partner_stand(p uuid default null)
returns table (paket text, gekauft bigint, verbraucht bigint, frei bigint, naechster_ablauf timestamptz)
language sql stable security definer set search_path = public as $$
  with wer as (select coalesce(p, auth.uid()) as id),
  erlaubt as (select (select id from wer) = auth.uid() or public.meine_rolle() = 'admin' as ok),
  k as (
    select pk.id, pk.paket, pk.anzahl, pk.gueltig_bis,
      (select count(*) from kinder ki where ki.kredit = pk.id) as benutzt
    from partner_kredite pk where pk.partner = (select id from wer) and (select ok from erlaubt)
  )
  select pa.paket,
    coalesce(sum(k.anzahl), 0),
    coalesce(sum(k.benutzt), 0),
    coalesce(sum(case when k.gueltig_bis > now() then greatest(k.anzahl - k.benutzt, 0) else 0 end), 0),
    min(case when k.gueltig_bis > now() and k.anzahl > k.benutzt then k.gueltig_bis end)
  from (values ('basic'), ('plus'), ('premium')) as pa(paket)
  left join k on k.paket = pa.paket
  group by pa.paket
  order by array_position(array['basic', 'plus', 'premium'], pa.paket)
$$;
grant execute on function public.partner_stand(uuid) to authenticated;
