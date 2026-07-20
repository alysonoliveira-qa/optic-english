// Build pipeline for "English for Optics" (Ótica VooX).
//
// Takes the single-component React source (voox-english-trainer.jsx) and emits a
// self-contained standalone index.html for GitHub Pages:
//   - JSX compiled with @babel/preset-react (classic runtime)
//   - modern JS preserved (preset-env targeting esmodules → no regenerator)
//   - `import React ...`      → `const { ... } = React;`
//   - `export default`        → removed
//   - `window.storage`        → `appStorage` (shimmed to localStorage below)
//   - React + ReactDOM production bundles embedded inline (from vendor/)
//
// Design tokens (ALNA) live in the source and are NOT touched here.
import { readFileSync, writeFileSync } from "node:fs";
import { transformSync } from "@babel/core";
import { minify } from "terser";

const SRC = "voox-english-trainer.jsx";
const OUT = "index.html";

let src = readFileSync(SRC, "utf8");

// --- 1) Source-level substitutions (before Babel, so preset-env sees no ESM) ---
const IMPORT_RE = /^import React[^\n]*from ["']react["'];?[ \t]*$/m;
if (!IMPORT_RE.test(src)) throw new Error("build: React import line not found");
src = src.replace(
  IMPORT_RE,
  "const { useState, useEffect, useCallback, useRef } = React;"
);

if (!/export default function VooxEnglishTrainer/.test(src)) {
  throw new Error("build: `export default function VooxEnglishTrainer` not found");
}
src = src.replace(/export default /, "");

const storageHits = (src.match(/window\.storage/g) || []).length;
if (storageHits === 0) throw new Error("build: no `window.storage` occurrences found");
src = src.replaceAll("window.storage", "appStorage");

// --- 2) Babel: compile JSX + keep modern syntax native ---
const out = transformSync(src, {
  filename: SRC,
  sourceType: "unambiguous",
  comments: false,
  compact: false, // terser handles compaction below
  presets: [
    ["@babel/preset-react", { runtime: "classic" }],
    // Modern baseline: the app already requires a browser with the Web Speech
    // API, so target evergreen versions. This keeps object spread, optional
    // chaining (?.) and nullish coalescing (??) native — matching the deployed
    // bundle and avoiding bulky _objectSpread/_defineProperty helpers.
    ["@babel/preset-env", {
      targets: { chrome: "87", edge: "87", firefox: "78", safari: "14" },
      bugfixes: true,
    }],
  ],
});
if (!out || !out.code) throw new Error("build: Babel returned no code");

// --- 2b) Minify with Terser (mangle:false keeps the original readable
//         identifiers — COMMON_FIXES, LEVELS, C, … — matching the deployed
//         bundle's style while stripping whitespace/dead code). ---
const min = await minify(out.code, {
  mangle: false,
  compress: { passes: 2 },
  format: { comments: false },
});
if (min.error) throw min.error;
if (!min.code) throw new Error("build: Terser returned no code");
const appCode = min.code;

// --- 3) appStorage shim (window.storage API → localStorage) ---
const shim =
  `const appStorage={async get(key){const v=localStorage.getItem(key);` +
  `if(v===null)throw new Error("not found");return{key,value:v};},` +
  `async set(key,value){localStorage.setItem(key,value);return{key,value};}};`;

// --- 4) Bootstrap ---
const bootstrap =
  `ReactDOM.createRoot(document.getElementById("root"))` +
  `.render(React.createElement(VooxEnglishTrainer));`;

// --- 5) Assemble standalone HTML ---
const react = readFileSync("vendor/react.production.min.js", "utf8");
const reactDom = readFileSync("vendor/react-dom.production.min.js", "utf8");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#20342A" />
<title>English for Optics · Ótica VooX</title>
<style>html, body { margin: 0; padding: 0; background: #ECF0E8; }</style>
</head>
<body>
<div id="root"></div>
<script>${react}</script>
<script>${reactDom}</script>
<script>${shim}
${appCode}
${bootstrap}</script>
</body>
</html>
`;

writeFileSync(OUT, html, "utf8");
console.log(`build: OK → ${OUT} (${html.length.toLocaleString()} bytes)`);
console.log(`build: window.storage → appStorage (${storageHits} replacement${storageHits === 1 ? "" : "s"})`);
