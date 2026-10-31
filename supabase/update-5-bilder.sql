-- Update 5: Bilder für das Kampagnen-Popup (öffentlicher Speicher „website“, nur Admins laden hoch)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website', 'website', true, 3145728, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists p_website_bilder_admin on storage.objects;
create policy p_website_bilder_admin on storage.objects for all
  using (bucket_id = 'website' and public.meine_rolle() = 'admin')
  with check (bucket_id = 'website' and public.meine_rolle() = 'admin');
