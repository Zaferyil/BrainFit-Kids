-- Update 14: Partner bestellen Kredite (Preisstufen, Bestellungen; Bezahlung per Rechnung/Überweisung)

-- Preise je Stufe und Paket (netto, € je Kredit) – im Admin-Bereich änderbar
create table if not exists public.partner_preise (
  stufe text not null check (stufe in ('starter', 'pro', 'master')),
  paket text not null check (paket in ('basic', 'plus', 'premium')),
  min_kredite int not null,
  preis numeric(10, 2) not null,
  primary key (stufe, paket)
);
insert into public.partner_preise (stufe, paket, min_kredite, preis) values
  ('starter', 'basic', 10, 319), ('starter', 'plus', 10, 509), ('starter', 'premium', 10, 639),
  ('pro', 'basic', 30, 269), ('pro', 'plus', 30, 429), ('pro', 'premium', 30, 539),
  ('master', 'basic', 75, 245), ('master', 'plus', 75, 395), ('master', 'premium', 75, 495)
on conflict do nothing;
alter table public.partner_preise enable row level security;
drop policy if exists preise_lesen on public.partner_preise;
create policy preise_lesen on public.partner_preise for select using (public.meine_rolle() in ('partner', 'admin'));
drop policy if exists preise_admin on public.partner_preise;
create policy preise_admin on public.partner_preise for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');

-- Bestellungen der Partner (Positionen: [{paket, anzahl, preis}])
create table if not exists public.partner_bestellungen (
  id bigserial primary key,
  partner uuid not null references public.partner on delete cascade,
  erstellt timestamptz not null default now(),
  stufe text not null,
  positionen jsonb not null,
  netto numeric(10, 2) not null,
  status text not null default 'offen' check (status in ('offen', 'bezahlt', 'storniert')),
  notiz text not null default '',
  erledigt timestamptz
);
alter table public.partner_bestellungen enable row level security;
drop policy if exists best_lesen on public.partner_bestellungen;
create policy best_lesen on public.partner_bestellungen for select using (partner = auth.uid() or public.meine_rolle() = 'admin');
drop policy if exists best_admin on public.partner_bestellungen;
create policy best_admin on public.partner_bestellungen for all using (public.meine_rolle() = 'admin') with check (public.meine_rolle() = 'admin');
-- Partner legen Bestellungen nur über die Funktion „partner“ an (Preise rechnet der Server)

-- Bezahlt: Kredite buchen (in einem Schritt, nur Admin)
create or replace function public.partner_bestellung_bezahlt(b bigint, notiz text default '')
returns void language plpgsql security definer set search_path = public as $$
declare r record; pos jsonb;
begin
  if public.meine_rolle() <> 'admin' then raise exception 'nur Admin'; end if;
  select * into r from partner_bestellungen where id = b for update;
  if r.status <> 'offen' then raise exception 'Bestellung ist nicht offen'; end if;
  for pos in select * from jsonb_array_elements(r.positionen) loop
    if (pos->>'anzahl')::int > 0 then
      insert into partner_kredite (partner, paket, anzahl, notiz)
      values (r.partner, pos->>'paket', (pos->>'anzahl')::int, 'Bestellung #' || b || coalesce(nullif(' · ' || notiz, ' · '), ''));
    end if;
  end loop;
  update partner_bestellungen set status = 'bezahlt', erledigt = now(), notiz = partner_bestellung_bezahlt.notiz where id = b;
end $$;
grant execute on function public.partner_bestellung_bezahlt(bigint, text) to authenticated;
