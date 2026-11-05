-- Aufträge der Lehrkraft an eine Klasse (z. B. „3× Anzan Level 5“, „2× Spiegel-Perlen“)
create table if not exists public.auftraege (
  id uuid primary key default gen_random_uuid(),
  klasse text not null references public.klassen on delete cascade,
  art text not null check (art in ('anzan', 'spiel', 'wiederholen', 'pruefung')),
  ziel jsonb not null default '{}',      -- z. B. {"level": 5, "anzahl": 3} oder {"spiel": "spiegel", "anzahl": 2}
  titel text not null,
  faellig date,
  erstellt_von uuid references public.personen on delete set null,
  erstellt timestamptz not null default now()
);
alter table public.auftraege enable row level security;
drop policy if exists p_auftraege_lesen on public.auftraege;
create policy p_auftraege_lesen on public.auftraege for select using (
  public.meine_rolle() in ('admin', 'lehrkraft')
  or klasse = (select klasse from public.kinder where id = auth.uid())
);
drop policy if exists p_auftraege_schreiben on public.auftraege;
create policy p_auftraege_schreiben on public.auftraege for all
  using (public.meine_rolle() in ('admin', 'lehrkraft'))
  with check (public.meine_rolle() in ('admin', 'lehrkraft'));
