-- Update 8: Diamant-Kostüme (nur mit Diamanten zu kaufen)
insert into public.shop_artikel (id, name, slot, preis, waehrung, start) values
  ('d-pixel', 'Pixel-SeZa', 'outfit', 5, 'diamanten', false),
  ('d-roboter', 'Robo-SeZa', 'outfit', 6, 'diamanten', false),
  ('d-magier', 'Sternen-Magier', 'outfit', 8, 'diamanten', false),
  ('d-koenig', 'König SeZa', 'outfit', 10, 'diamanten', false),
  ('d-kristall', 'Kristall-Held', 'outfit', 12, 'diamanten', false)
on conflict (id) do update set name = excluded.name, preis = excluded.preis, waehrung = excluded.waehrung, start = false, aktiv = true;
