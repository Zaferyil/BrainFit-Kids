-- Update 22: Wochenbericht jeden Sonntag um 18:00 Uhr (Wien) automatisch verschicken.
-- Vorher: in Supabase unter Database → Extensions „pg_cron“ und „pg_net“ aktivieren
-- und unter Edge Functions → Secrets das Secret CRON_KEY anlegen (ein selbst gewähltes, langes Passwort).
-- DEIN-CRON-KEY unten durch genau dieses Passwort ersetzen.
select cron.unschedule('wochenbericht') where exists (select 1 from cron.job where jobname = 'wochenbericht');
select cron.schedule('wochenbericht', '0 17 * * 0', $$
  select net.http_post(
    url := 'https://zqskietwmexfrwisgrft.supabase.co/functions/v1/wochenbericht',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-key', 'DEIN-CRON-KEY'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$$);
