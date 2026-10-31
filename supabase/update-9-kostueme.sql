-- Update 9: weitere Kostüme (durch Lernen freischaltbar)
insert into public.shop_artikel (id, name, slot, preis, waehrung, start) values
  ('dino', 'Dino-SeZa', 'outfit', 0, 'sterne', true),
  ('rennfahrer', 'Rennfahrer', 'outfit', 0, 'sterne', true),
  ('wueste', 'Wüsten-Reisender', 'outfit', 0, 'sterne', true),
  ('kapitaen', 'Kapitän', 'outfit', 0, 'sterne', true),
  ('schattenninja', 'Schatten-Ninja', 'outfit', 0, 'sterne', true)
on conflict (id) do update set name = excluded.name, start = true, aktiv = true;
