-- Hausaufgaben als Arbeitsblatt oder eigene Datei (PDF, JPG, PNG)
alter table public.auftraege drop constraint if exists auftraege_art_check;
alter table public.auftraege add constraint auftraege_art_check check (art in ('anzan', 'spiel', 'wiederholen', 'pruefung', 'blatt'));

insert into storage.buckets (id, name, public) values ('hausaufgaben', 'hausaufgaben', false) on conflict do nothing;
drop policy if exists ha_dateien_hochladen on storage.objects;
create policy ha_dateien_hochladen on storage.objects for insert
  with check (bucket_id = 'hausaufgaben' and public.meine_rolle() in ('admin', 'lehrkraft'));
drop policy if exists ha_dateien_loeschen on storage.objects;
create policy ha_dateien_loeschen on storage.objects for delete
  using (bucket_id = 'hausaufgaben' and public.meine_rolle() in ('admin', 'lehrkraft'));
drop policy if exists ha_dateien_lesen on storage.objects;
create policy ha_dateien_lesen on storage.objects for select
  using (bucket_id = 'hausaufgaben' and auth.uid() is not null);
