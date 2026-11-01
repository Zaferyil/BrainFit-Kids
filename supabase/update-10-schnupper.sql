-- Update 10: Schnupperwoche (7 Tage Zugang, einmalig bezahlt)
alter table public.kinder drop constraint if exists kinder_paket_check;
alter table public.kinder add constraint kinder_paket_check check (paket in ('basic', 'plus', 'premium', 'schnupper'));
alter table public.kinder add column if not exists gueltig_bis timestamptz;
