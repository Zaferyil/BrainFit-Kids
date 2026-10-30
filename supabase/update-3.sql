-- BrainFit Kids – Update 3: Zugangsdaten zur Bestellung (für die Rückkehr von Stripe)
alter table public.bestellungen add column if not exists kind_benutzer text;
alter table public.bestellungen add column if not exists passwort_start text;
