-- BrainFit Kids – Update 2: erstes Admin-Konto, Testkonto entfernen
insert into public.personen (id, rolle, name)
select id, 'admin', 'Zafer Yildiz' from auth.users where email = 'zaferyildiz.tr@hotmail.com'
on conflict (id) do update set rolle = 'admin';

delete from auth.users where email = 'testkind1@kinder.brainfit-kids.at';

select p.rolle, u.email from public.personen p join auth.users u on u.id = p.id;
