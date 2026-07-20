-- Fase 3 — ranking da equipe.
-- Rodar no Supabase Dashboard → SQL Editor → New query → colar → Run.
--
-- Estratégia: em vez de uma view separada, guardamos as estatísticas de ranking
-- direto na tabela `profiles` (que já é legível por TODOS os autenticados via a
-- policy de SELECT da Fase 1). O app não muda: o adapter (src/lib/appStorage.js)
-- calcula `mastered` (frases dominadas) e `level` (nível alcançado) a cada
-- save/load e atualiza o PRÓPRIO perfil (a policy de UPDATE só permite o dono).
--
-- GRANT (select/update) e RLS já vêm da Fase 1 — nada a mudar aqui além das colunas.

alter table public.profiles
  add column if not exists mastered int not null default 0,
  add column if not exists level int not null default 1,
  add column if not exists stats_updated_at timestamptz;
