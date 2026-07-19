// Cliente Supabase (browser / SPA).
//
// Usa a PUBLISHABLE KEY (sb_publishable_...) — pode ir para o bundle do cliente,
// pois o acesso é protegido por RLS. A SECRET KEY (sb_secret_...) NUNCA entra
// aqui nem em nenhuma variável VITE_* — ela é só para backend/Edge Functions.
//
// Fase 0: o cliente existe e conecta, mas ainda não é usado pela persistência
// (isso é a Fase 2, no appStorage.js). Serve para validar a conexão e, em
// seguida, o login por magic link (Fase 1).
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY ausentes. " +
      "Copie o .env.example para .env e preencha com os valores do painel do Supabase."
  );
}

export const supabase = createClient(url, publishableKey);

export default supabase;
