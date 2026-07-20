-- Fase 2 — tabela progress (blob jsonb por usuário) + GRANTs + RLS.
-- Rodar no Supabase Dashboard → SQL Editor → New query → colar → Run.
--
-- Modelo: 1 linha por usuário guardando TODO o estado do app num jsonb
-- (mesmo formato do blob "voox-english-v3": { unlocked, best, srs, pron, dyn }).

-- 1) Tabela.
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 1b) GRANTs (sem isto: "permission denied for table progress").
grant usage on schema public to authenticated;
grant select, insert, update on table public.progress to authenticated;

-- 2) RLS: cada um só o PRÓPRIO progresso.
alter table public.progress enable row level security;

drop policy if exists "progress: seleciona o próprio" on public.progress;
create policy "progress: seleciona o próprio"
  on public.progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress: insere o próprio" on public.progress;
create policy "progress: insere o próprio"
  on public.progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress: atualiza o próprio" on public.progress;
create policy "progress: atualiza o próprio"
  on public.progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
