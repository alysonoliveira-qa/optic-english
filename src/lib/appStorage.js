// appStorage — adapter de persistência do "English no Balcão".
//
// Mantém o MESMO contrato que o app já usa via window.storage:
//   get(key) -> Promise<{ key, value }>  (lança se não existir)
//   set(key, value) -> Promise<{ key, value }>
//
// Hoje: localStorage (Fase 0/1 — paridade com o build standalone).
// Depois (Fase 2): trocar SÓ este arquivo para ler/escrever no Supabase
// (tabela `progress`, jsonb), com cache offline no localStorage e migração
// do blob `voox-english-v3` no 1º login. O app (voox-english-trainer.jsx)
// NÃO muda — ele só conhece este contrato.

export const appStorage = {
  async get(key) {
    const value = localStorage.getItem(key);
    if (value === null) throw new Error("not found");
    return { key, value };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
};

export default appStorage;
