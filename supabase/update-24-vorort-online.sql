-- Update 24: Schnupperstunde vor Ort oder online
alter table public.vorort_anmeldungen add column if not exists wo text check (wo in ('vorort', 'online'));
