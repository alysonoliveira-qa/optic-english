import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// English for Optics — Vite + React SPA (migração da build standalone).
// O componente do app segue em voox-english-trainer.jsx na raiz (fonte única,
// compatível com a pipeline antiga); main.jsx o monta e injeta window.storage.
export default defineConfig({
  plugins: [react()],
  // Porta fixada em 5174 (cai pra 5175 se ocupada) — preferência do projeto.
  server: { port: 5174, strictPort: false, open: true },
  build: { outDir: "dist" },
});
