-- Fase 1 — tabela profiles + RLS + trigger de auto-criação.
-- Rodar no Supabase Dashboard → SQL Editor → New query → colar → Run.

-- 1) Tabela: um perfil por usuário autenticado.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- 1b) GRANTs de tabela: sem isto, o papel `authenticated` recebe
-- "permission denied for table profiles" (o RLS só entra DEPOIS do grant).
grant usage on schema public to authenticated;
grant select, insert, update on table public.profiles to authenticated;

-- 2) RLS ligada; ninguém acessa nada sem política.
alter table public.profiles enable row level security;

-- Leitura: qualquer usuário LOGADO pode ler todos os perfis
-- (necessário na Fase 3 para mostrar nomes no ranking da equipe).
drop policy if exists "profiles: leitura para autenticados" on public.profiles;
create policy "profiles: leitura para autenticados"
  on public.profiles for select
  to authenticated
  using (true);

-- Escrita: cada um só cria/edita o PRÓPRIO perfil.
drop policy if exists "profiles: insere o próprio" on public.profiles;
create policy "profiles: insere o próprio"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles: atualiza o próprio" on public.profiles;
create policy "profiles: atualiza o próprio"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3) Trigger: cria a linha do perfil automaticamente no 1º login
-- (o nome fica null até a pessoa preencher na tela de boas-vindas).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
