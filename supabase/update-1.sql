-- BrainFit Kids – Sicherheits-Update 1: Funktionen nur für angemeldete Kinder/Lehrkräfte
-- ───────────── Server-Funktionen (atomar, nie ins Minus, nie doppelt) ─────────────
create or replace function public.belohnen(p_art text, p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare w record; bid text := p_art || ':' || p_id;
begin
  if coalesce(public.meine_rolle(), '') <> 'kind' then raise exception 'nur für Kinder'; end if;
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
  if coalesce(public.meine_rolle(), '') <> 'kind' then raise exception 'nur für Kinder'; end if;
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
  if coalesce(public.meine_rolle(), '') <> 'kind' then raise exception 'nur für Kinder'; end if;
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
  if coalesce(public.meine_rolle(), '') not in ('admin', 'lehrkraft') or not public.darf_kind_sehen(p_kind) then raise exception 'keine Berechtigung'; end if;
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
revoke execute on function public.belohnen, public.kaufen, public.anziehen, public.korrigieren from public, anon;

