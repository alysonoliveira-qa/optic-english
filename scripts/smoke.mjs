// Smoke test: load the built index.html in jsdom, mount the app, and assert the
// core UI rendered. Guards against a broken bundle before publishing.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const NEEDLES = ["English for Optics", "Nível 1"];

const html = readFileSync("index.html", "utf8");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "https://voox-english.local/",
  pretendToBeVisual: true, // provides requestAnimationFrame for React 18
});

// React 18 createRoot flushes the initial mount asynchronously; give it a few ticks.
await new Promise((r) => setTimeout(r, 500));

const root = dom.window.document.getElementById("root");
const text = (root && root.textContent) || "";

const missing = NEEDLES.filter((n) => !text.includes(n));
if (missing.length) {
  console.error("smoke: FAIL — missing strings:", missing);
  console.error("smoke: root textContent (first 500 chars):");
  console.error(text.slice(0, 500) || "(empty)");
  process.exit(1);
}

console.log(`smoke: OK — rendered ${NEEDLES.map((n) => `"${n}"`).join(" + ")}`);
