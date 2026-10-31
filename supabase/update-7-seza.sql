-- Update 7: SeZa neu – Kostüme werden durch Lernen frei (im Shop alle als „start“ erlaubt),
-- Sterne für Hintergründe, Rahmen und die Überraschungskiste. Alte Accessoires werden ausgeblendet.
update public.shop_artikel set start = true, preis = 0 where slot = 'outfit';
update public.shop_artikel set name = 'Forscher' where id = 'wissenschaftler';
update public.shop_artikel set aktiv = false where slot in ('hand', 'brille', 'kopf', 'ruecken', 'stab', 'begleiter');

insert into public.shop_artikel (id, name, slot, preis, waehrung, start) values
  ('hg-regenbogen', 'Regenbogen', 'hg', 150, 'sterne', false),
  ('hg-wald', 'Zauberwald', 'hg', 150, 'sterne', false),
  ('hg-meer', 'Unterwasser', 'hg', 200, 'sterne', false),
  ('hg-sonne', 'Sonnenstrand', 'hg', 200, 'sterne', false),
  ('hg-weltall', 'Weltall', 'hg', 300, 'sterne', false),
  ('hg-burg', 'Abakus-Burg', 'hg', 300, 'sterne', false),
  ('r-gold', 'Goldrahmen', 'rahmen', 200, 'sterne', false),
  ('r-regenbogen', 'Regenbogenrahmen', 'rahmen', 250, 'sterne', false),
  ('r-flamme', 'Feuerrahmen', 'rahmen', 300, 'sterne', false),
  ('r-diamant', 'Diamantrahmen', 'rahmen', 400, 'sterne', false)
on conflict (id) do update set name = excluded.name, slot = excluded.slot, preis = excluded.preis, aktiv = true;

-- Überraschungskiste: 180 Sterne für einen Hintergrund oder Rahmen, den das Kind noch nicht hat
create or replace function public.kiste_oeffnen(p_artikel text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a record; k record; preis int := 180;
begin
  if coalesce(public.meine_rolle(), '') <> 'kind' then raise exception 'nur für Kinder'; end if;
  select * into a from shop_artikel where id = p_artikel and aktiv and slot in ('hg', 'rahmen');
  if not found then return jsonb_build_object('ok', false, 'grund', 'unbekannt'); end if;
  insert into konten (kind) values (auth.uid()) on conflict do nothing;
  select * into k from konten where kind = auth.uid() for update;
  if exists (select 1 from besitz where kind = auth.uid() and artikel = p_artikel) then
    return jsonb_build_object('ok', false, 'grund', 'besitz'); end if;
  if k.sterne < preis then return jsonb_build_object('ok', false, 'grund', 'sterne', 'fehlt', preis - k.sterne); end if;
  update konten set sterne = sterne - preis where kind = auth.uid();
  insert into besitz (kind, artikel) values (auth.uid(), p_artikel);
  insert into buchungen (kind, id, art, grund, artikel, sterne, diamanten)
    values (auth.uid(), 'kiste:' || p_artikel, 'kauf', 'Überraschungskiste: ' || a.name, p_artikel, -preis, 0);
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.kiste_oeffnen(text) to authenticated;
