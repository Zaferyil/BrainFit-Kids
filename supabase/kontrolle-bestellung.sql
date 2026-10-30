-- Letzte Bestellungen: ist das Eltern-Konto angelegt und mit dem Kind verknüpft?
select b.erstellt, b.eltern_mail, b.kind_benutzer, b.paket,
       (select u.id is not null from auth.users u where lower(u.email) = lower(b.eltern_mail)) as eltern_konto_da,
       k.eltern is not null as verknuepft
from public.bestellungen b left join public.kinder k on k.id = b.kind
order by b.erstellt desc limit 5;
