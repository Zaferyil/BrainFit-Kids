-- Aufträge auch für Kinder ohne Schulklasse („ONLINE“ = online angemeldete Kinder)
alter table public.auftraege drop constraint if exists auftraege_klasse_fkey;
drop policy if exists p_auftraege_lesen on public.auftraege;
create policy p_auftraege_lesen on public.auftraege for select using (
  public.meine_rolle() in ('admin', 'lehrkraft')
  or klasse = (select coalesce(klasse, 'ONLINE') from public.kinder where id = auth.uid())
);
