-- Testdaten entfernen: Bestellungen aus dem Stripe-Testmodus (cs_test_…) und Beispiel-Adressen.
-- 1) Zuerst ANSEHEN, was gelöscht würde (nur lesen):
select b.erstellt, b.eltern_mail, b.paket, b.kind_benutzer, b.stripe_session
from public.bestellungen b
where b.stripe_session like 'cs_test_%' or b.eltern_mail ilike '%@beispiel.at'
order by b.erstellt;

-- 2) Wenn die Liste stimmt: den Block unten markieren und ausführen.
-- Löscht die Test-Bestellungen und die dabei angelegten Kinder-Konten (mit Fortschritt, Konto, Besitz).
-- Echte Bestellungen (cs_live_…) und das Admin-Konto bleiben unberührt.
/*
delete from auth.users where id in (
  select kind from public.bestellungen where kind is not null and (stripe_session like 'cs_test_%' or eltern_mail ilike '%@beispiel.at')
);
delete from public.bestellungen where stripe_session like 'cs_test_%' or eltern_mail ilike '%@beispiel.at';
*/
