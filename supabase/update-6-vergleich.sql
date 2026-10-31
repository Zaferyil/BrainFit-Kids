-- Update 6: Vergleich für den Lernbericht – Mittelwerte und Verteilung der Fähigkeiten in derselben Schulstufe.
-- Liefert nie Namen oder IDs anderer Kinder; unter 5 Kindern nur die Anzahl.
create or replace function public.vergleich(p_kind uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare st smallint; n int; erg jsonb;
begin
  if not public.darf_kind_sehen(p_kind) then raise exception 'keine Berechtigung'; end if;
  select stufe into st from kinder where id = p_kind;
  with w as (
    select f.daten -> ('bfk.werte.' || f.kind::text) as v
    from fortschritt f join kinder k on k.id = f.kind
    where k.stufe is not distinct from st and not k.archiviert and f.daten ? ('bfk.werte.' || f.kind::text)
  )
  select count(*) into n from w;
  if n < 5 then return jsonb_build_object('n', n); end if;
  with w as (
    select f.daten -> ('bfk.werte.' || f.kind::text) as v
    from fortschritt f join kinder k on k.id = f.kind
    where k.stufe is not distinct from st and not k.archiviert and f.daten ? ('bfk.werte.' || f.kind::text)
  ), b(id) as (values ('rechnen'), ('tempo'), ('konzentration'), ('aufmerksamkeit'), ('gedaechtnis'))
  select jsonb_build_object('n', n,
    'mittel', jsonb_object_agg(b.id, (select round(avg((v ->> b.id)::numeric)) from w)),
    'werte', jsonb_object_agg(b.id, (select jsonb_agg((v ->> b.id)::numeric) from w)))
  into erg from b;
  return erg;
end $$;
grant execute on function public.vergleich(uuid) to authenticated;
