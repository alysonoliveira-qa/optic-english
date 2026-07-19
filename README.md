# English no Balcão

Treinador de inglês para a equipe da **Ótica VooX** (Feira dos Importados, Brasília). Nasceu de um atendimento real: uma família do Cazaquistão apareceu na loja, o Alyson travou em termos que já sabia — "atender", "via de pagamento", "receita" — e improvisou frases como "payment receive" e "Thanks for your preference". Este app é o antídoto: os erros reais viram treino.

Autoria: **Alyson** (Ótica VooX / ALNA). Estende o padrão ALNA — construir rápido, publicar em Vercel/GitHub Pages, validar com usuários reais.

---

## O que o app faz

Um único componente React que roda 100% no cliente. 3 níveis de dificuldade progressivos, cada um com 4 abas:

- **📖 Script** — o diálogo completo do atendimento (VOCÊ + CLIENTE), organizado por seções (recepção, orçamento, objeções etc), com PT-BR abaixo de cada frase e um bloco de vocabulário-chave no fim.
- **🃏 Cards** — repetição espaçada estilo Anki com 4 botões (De novo 1min / Difícil 10min / Fácil 1 dia / Muito fácil 4 dias). Dois tipos de card: "você" (PT → falar EN) e "cliente" (EN → o que ele quer + resposta sugerida). A prova só libera com **100% dos cards em Fácil ou Muito fácil**.
- **🎤 Fala** — TTS (`speechSynthesis` en-US, botões Ouvir 0.95x e Devagar 0.6x) + reconhecimento de voz (`webkitSpeechRecognition`, en-US) com scoring estilo WER (edit distance por palavra + desconto de confiança). Se o mic não estiver disponível, fallback pro **Modo autoavaliação**.
- **🎭 Dinâmica** — cenários pra fazer em dupla na loja: um vendedor pega o celular e vira o cliente (lê perfil + missão + imprevisto secreto), o outro atende sem olhar a tela. Checklist do avaliador gera nota %; ≥80% aprova.

Cada nível encerra com uma **prova de 12 questões** (incluindo 2 de compreensão de fala do cliente). Passa com 10/12 (`Math.ceil(len*0.8)`), e passar desbloqueia o próximo nível.

### Níveis

| ID | Grau     | Nome    | Palavras EN | Foco |
|----|----------|---------|-------------|------|
| 1  | +0.50    | Júnior  | ≈300        | Recepção, preço, pagamento, despedida. Small talk. |
| 2  | +2.00    | Pleno   | ≈850        | Cadastro, cópia do grau, orçamento com objeção de preço, conserto, garantia, dúvidas comuns. |
| 3  | +4.00    | Sênior  | ≈1.200      | Anamnese, condução ao exame, hospital dos óculos, escada de lentes (monofocal → multi convencional → digital → Freeform), negociação, fechamento, pós-venda. |

Todos os diálogos usam **ambas as vozes**: o cliente pergunta e responde. Isso é crítico — não adianta saber falar sem entender o que o cliente pergunta.

---

## Design tokens (ALNA)

**Não altere sem consultar o Alyson.**

```js
const C = {
  bg: "#ECF0E8",       // sage green (fundo)
  card: "#20342A",     // dark forest green (cards principais)
  cardSoft: "#2A4234", // cards internos
  ink: "#1C2921",      // texto principal
  inkSoft: "#4A5A50",  // texto secundário
  paper: "#F8F7F2",    // cards claros
  gold: "#C8A96E",     // dourado ALNA (botões, acentos)
  goldDeep: "#A8894E", // dourado escuro (bordas, hover)
  cream: "#EFE9DA",    // texto sobre card escuro
  ok: "#4C7A5E",
  okSoft: "#9FD3AE",
  bad: "#B4552D",
  line: "#D7DDD2",
};

const FONT_HEAD = "'Fraunces', Georgia, serif";  // títulos e frases-chave
const FONT_BODY = "'Inter', -apple-system, sans-serif";
```

Fontes vêm do Google Fonts via `@import` no `<style>` do componente `Shell`.

---

## Arquitetura de dados

Persistência via `window.storage` (funciona nos artifacts do Claude). No build standalone HTML, um shim `appStorage` transparente reescreve pra `localStorage` — o `compile.js` faz a substituição textual.

**Chave única:** `"voox-english-v3"` (a v3 é a que tem cards de cliente, aba Dinâmica e níveis recalibrados; NÃO renomear, os usuários existentes já têm progresso salvo nela).

Formato do estado salvo:

```js
{
  unlocked: 1 | 2 | 3,                // maior nível liberado
  best:     { [levelId]: numAcertos },
  srs:      { [cardKey]: { r: 0-3, due: timestampMs } },
  pron:     { [cardKey]: bestPctInt },
  dyn:      { [levelId]: bestPctInt },
}
```

`cardKey` = `"${level.id}-${sectionIdx}-${lineIdx}"`. Estável entre versões desde que a ordem das seções não mude — se for reordenar, migrar a chave ou zerar (`Zerar meu progresso` no rodapé da home).

---

## Estrutura do repo (recomendada no Antigravity)

```
voox-english/
├── src/
│   └── voox-english-trainer.jsx   # componente React único, ~1650 linhas
├── build/
│   ├── compile.js                 # Babel + substituições
│   ├── package.json               # dependências do build
│   └── node_modules/
├── public/
│   └── (nada permanente)
├── dist/
│   └── index.html                 # bundle final ~186KB, é o que sobe pro GitHub Pages
└── README.md
```

---

## Pipeline de build

Objetivo: gerar **um único `index.html` de ~186KB, sem CDN externa nenhuma**, que funciona offline e no iPhone via GitHub Pages.

### 1. Compilar o JSX

`build/compile.js` usa `@babel/core` com:

```js
{
  presets: [
    ['@babel/preset-react', { runtime: 'classic', development: false }],
    '@babel/preset-env',
  ]
}
```

Substituições textuais **depois** do Babel (regex simples):

- `import React, { useState, useEffect, useCallback, useRef } from "react";` → `const { useState, useEffect, useCallback, useRef } = React;`
- `export default function VooxEnglishTrainer` → `function VooxEnglishTrainer`
- No fim do arquivo, garantir `ReactDOM.render(React.createElement(VooxEnglishTrainer), document.getElementById('root'));`
- `window.storage.get(...)` / `.set(...)` / `.delete(...)` / `.list(...)` → `appStorage.get(...)` etc.

Saída: `build/app.compiled.js`.

### 2. Injetar React UMD + shim

Script Python monta o HTML final:

```python
react     = open('node_modules/react/umd/react.production.min.js').read()
reactdom  = open('node_modules/react-dom/umd/react-dom.production.min.js').read()
app       = open('build/app.compiled.js').read()

APP_STORAGE_SHIM = '''
const appStorage = {
  async get(k)      { const v = localStorage.getItem(k); return v ? { key: k, value: v } : null; },
  async set(k, v)   { localStorage.setItem(k, v); return { key: k, value: v }; },
  async delete(k)   { localStorage.removeItem(k); return { key: k, deleted: true }; },
  async list(prefix){ return { keys: Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix)) }; },
};
'''

html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#20342A" />
  <title>English no Balcão · Ótica VooX</title>
  <style>html, body {{ margin: 0; padding: 0; background: #ECF0E8; }}</style>
</head>
<body>
  <div id="root"></div>
  <script>{react}</script>
  <script>{reactdom}</script>
  <script>{APP_STORAGE_SHIM}</script>
  <script>{app}</script>
</body>
</html>
'''
open('dist/index.html', 'w').write(html)
```

### 3. Smoke test com jsdom

```js
const { JSDOM } = require('jsdom');
const html = require('fs').readFileSync('dist/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
setTimeout(() => {
  const t = dom.window.document.body.textContent || '';
  console.log(t.includes('English no Balcão') && t.includes('Nível 1') ? '✓ Renderizou OK' : '✗ FALHOU');
}, 800);
```

Se falhar, quase sempre é: `import` sobrando, JSX que o preset-react não pegou, ou o UMD sendo carregado depois do app.

### Dependências do build

```json
{
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@babel/preset-env": "^7.24.0",
    "@babel/preset-react": "^7.24.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "jsdom": "^24.0.0"
  }
}
```

---

## Scoring de pronúncia (detalhe importante)

O scorer usa **edit distance por palavra (WER)** — a ordem importa. Palavra trocada/omitida/extra penaliza. Depois aplica desconto pela confidence do reconhecedor:

```
pct = wordPct * (0.5 + 0.5 * confidence)
```

Configuração do reconhecedor: `maxAlternatives = 1` (só a transcrição principal, sem "best of N"). Exibe no resultado: **Palavras corretas: X% · Clareza da fala: Y%**.

**Limite conhecido, importante:** o reconhecedor da Apple/Google autocorrige pronúncias "quase certas". Se o vendedor falar "kelp" em vez de "help", pode transcrever "help" com confidence baixa. A gente pega isso no desconto de clareza, mas não é uma avaliação fonética real. Detectar erro de fonema (th, r/h, vogais) só com **Azure Pronunciation Assessment** — encaixa na fase Supabase (backend com chave).

---

## Deploy

**Hoje (produção):** GitHub Pages via repo `voox-english`.

Fluxo de atualização direto do celular (funciona no iPhone, testado):
1. Baixa `dist/index.html`
2. GitHub → repo `voox-english` → **Add file → Upload files**
3. Sobe com o mesmo nome (`index.html`), Commit
4. Em ~1 min o link `https://<usuario>.github.io/voox-english/` atualiza sozinho

**iPhone não abre HTML local** (limitação do iOS, o Chrome iOS usa o mesmo motor do Safari). Android abre via Chrome. Por isso o deploy via GitHub Pages é obrigatório pra testar no iPhone.

---

## Roadmap

**Fase 1 (HOJE):** HTML standalone no GitHub Pages ✓

**Fase 2 (próxima):** importar o mesmo repo no Vercel. Sem mudança de código — Vercel serve o `index.html` direto. Ganha domínio próprio e analytics básicas.

**Fase 3 (Supabase):**
- **Auth:** login por vendedor da VooX (magic link por e-mail é o mais simples pro contexto da loja).
- **Tabelas** (usar `security_invoker = true` como no Lensys/Rodotech):
  - `sellers` (id, email, nome, loja_id)
  - `progress` (seller_id, level_id, best_quiz, unlocked)
  - `srs_scores` (seller_id, card_key, rating, due)
  - `pron_scores` (seller_id, card_key, best_pct)
  - `dyn_scores` (seller_id, level_id, best_pct)
  - `rankings` (view agregada — ranking semanal por loja)
- **Migração de dados:** ao logar pela primeira vez, ler `localStorage["voox-english-v3"]` e fazer upsert nas tabelas; depois marcar `synced=true` e usar Supabase como fonte da verdade.
- **Pronúncia real:** trocar o scorer local pela Azure Pronunciation Assessment via Edge Function (chave fica no backend, cliente só recebe a nota por fonema).

**Fase 4 (produto):** se funcionar bem na VooX, virar SaaS pra outras óticas. Painel de gestor por loja, cards customizáveis, integração com sistema da ótica.

---

## Contexto histórico (pro Claude e pra memória)

- Repo GitHub: **voox-english** (público, GitHub Pages ativo no branch main / root).
- Storage key **não muda** de v3 pra não zerar progresso da equipe.
- Design ALNA — MESMOS tokens do Rodotech, Lensys Care e Control Center. Consistência de marca vale mais do que "melhoria" visual.
- Preferência: código direto, comentários curtos, honestidade sobre limitações (ex: o parágrafo do scorer acima) em vez de vender o app como perfeito.

---

## Comandos essenciais

```bash
# Setup inicial (uma vez)
cd voox-english/build
npm install

# Build (a cada mudança no JSX)
cd voox-english/build
node compile.js && python3 make-html.py && node smoke-test.js

# Verificar tamanho final (deve ficar em ~186KB, alerta se passar de 250KB)
ls -lh ../dist/index.html
```
