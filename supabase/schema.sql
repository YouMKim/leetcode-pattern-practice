-- LeetCode Grimoire cloud saves: one JSONB blob per user, RLS-guarded.
create table if not exists public.grimoire_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.grimoire_saves enable row level security;

drop policy if exists "own save select" on public.grimoire_saves;
drop policy if exists "own save insert" on public.grimoire_saves;
drop policy if exists "own save update" on public.grimoire_saves;
drop policy if exists "own save delete" on public.grimoire_saves;

create policy "own save select" on public.grimoire_saves
  for select using (auth.uid() = user_id);
create policy "own save insert" on public.grimoire_saves
  for insert with check (auth.uid() = user_id);
create policy "own save update" on public.grimoire_saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own save delete" on public.grimoire_saves
  for delete using (auth.uid() = user_id);

select 'schema ok' as result;
