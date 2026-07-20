// appStorage — adapter de persistência do "English for Optics".
//
// Contrato (o app conhece SÓ isto, via window.storage):
//   get(key) -> Promise<{ key, value }>   (lança "not found" se não existir)
//   set(key, value) -> Promise<{ key, value }>
// `value` é sempre a STRING JSON do estado completo (mesmo blob de sempre).
//
// Fase 2: a fonte de verdade passa a ser o Supabase (tabela `progress`, 1 linha
// por usuário, coluna `data` jsonb), com CACHE OFFLINE no localStorage:
//   - get: tenta a nuvem; se offline/erro, cai pro cache local.
//   - set: grava o cache local NA HORA (rápido/offline) e empurra pra nuvem
//          em best-effort (falha de rede não quebra o app).
//   - migração: no 1º acesso, se a nuvem estiver vazia, semeia com o blob antigo
//     do localStorage ("voox-english-v3") e sobe pra nuvem.
//
// O cache local é namespaced por usuário (`<key>::<userId>`) pra dois logins no
// mesmo aparelho não se misturarem. O app (voox-english-trainer.jsx) não muda.
import { supabase } from "./supabaseClient.js";

const TABLE = "progress";

function cacheKey(userId, key) {
  return userId ? `${key}::${userId}` : key;
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

async function pushToCloud(userId, value) {
  await supabase.from(TABLE).upsert({
    user_id: userId,
    data: JSON.parse(value),
    updated_at: new Date().toISOString(),
  });
}

// Fase 3 — deriva as estatísticas de ranking do blob e grava no próprio perfil
// (a policy de UPDATE só permite o dono). Best-effort: nunca quebra o save.
//   - mastered = nº de cards com rating SRS >= 2 (frases "dominadas")
//   - level    = maior nível desbloqueado
async function syncProfileStats(userId, value) {
  try {
    const d = JSON.parse(value) || {};
    const mastered = d.srs
      ? Object.values(d.srs).filter((c) => (c?.r ?? -1) >= 2).length
      : 0;
    const level = d.unlocked || 1;
    await supabase
      .from("profiles")
      .update({ mastered, level, stats_updated_at: new Date().toISOString() })
      .eq("id", userId);
  } catch (e) {
    console.warn("[appStorage] falha ao atualizar ranking (ignorado):", e?.message);
  }
}

export const appStorage = {
  async get(key) {
    const userId = await currentUserId();

    // Sem sessão (fora do app autenticado): só localStorage.
    if (!userId) {
      const v = localStorage.getItem(key);
      if (v === null) throw new Error("not found");
      return { key, value: v };
    }

    const nsKey = cacheKey(userId, key);

    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;

      // Nuvem tem progresso → é a fonte de verdade; atualiza o cache e devolve.
      if (data && data.data && Object.keys(data.data).length > 0) {
        const value = JSON.stringify(data.data);
        localStorage.setItem(nsKey, value);
        syncProfileStats(userId, value); // ranking em dia ao abrir
        return { key, value };
      }

      // Nuvem vazia → migrar: cache namespaced OU blob legado (localStorage antigo).
      const seed = localStorage.getItem(nsKey) ?? localStorage.getItem(key);
      if (seed) {
        try { await pushToCloud(userId, seed); } catch (_) { /* sobe depois */ }
        localStorage.setItem(nsKey, seed);
        syncProfileStats(userId, seed);
        return { key, value: seed };
      }

      // Nada em lugar nenhum → primeira vez de verdade.
      throw new Error("not found");
    } catch (e) {
      if (e && e.message === "not found") throw e;
      // Offline / erro de rede → cai pro cache local (namespaced ou legado).
      const cached = localStorage.getItem(nsKey) ?? localStorage.getItem(key);
      if (cached !== null) return { key, value: cached };
      throw new Error("not found");
    }
  },

  async set(key, value) {
    const userId = await currentUserId();
    const nsKey = cacheKey(userId, key);

    // 1) Cache local imediato (rápido e resistente a offline).
    localStorage.setItem(nsKey, value);

    // 2) Empurra pra nuvem em best-effort; falha não rejeita a promise
    //    (o cache já garante o dado; o próximo save reenvia o estado completo).
    if (userId) {
      try {
        await pushToCloud(userId, value);
      } catch (e) {
        console.warn("[appStorage] progresso mantido offline (nuvem indisponível):", e?.message);
      }
      syncProfileStats(userId, value); // atualiza o ranking a cada save
    }

    return { key, value };
  },
};

export default appStorage;
