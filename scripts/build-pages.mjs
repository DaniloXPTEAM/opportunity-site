/**
 * Build estático (GitHub Pages) — funciona igual no Windows, Linux e macOS.
 *
 * Por que este arquivo existe
 * ---------------------------
 * O script anterior era:
 *
 *   PAGES_STATIC=1 PAGES_BASE_PATH=/opportunity-site ... next build
 *
 * Isso é sintaxe de shell POSIX. No PowerShell/cmd o comando não roda
 * (`'PAGES_STATIC' não é reconhecido...`). Aqui as variáveis são montadas em
 * JavaScript e passadas ao processo filho — sem depender de shell, sem depender
 * de `npx`, sem aspas para escapar. O binário do Next é resolvido dentro de
 * `node_modules`, então o mesmo comando vale em qualquer terminal.
 *
 * Uso:
 *   npm run build:pages
 *   node scripts/build-pages.mjs
 *   node scripts/build-pages.mjs --base-path /outro-repo
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(import.meta.url);

const argBase = process.argv.indexOf("--base-path");
const BASE_PATH = (argBase > -1 ? process.argv[argBase + 1] : process.env.PAGES_BASE_PATH) || "/opportunity-site";
const SITE_URL = process.env.SITE_URL || "https://daniloxpteam.github.io";
const OUT = path.join(ROOT, "out");

const log = (msg) => console.log(`[build:pages] ${msg}`);
const fail = (msg) => {
  console.error(`[build:pages] ERRO: ${msg}`);
  process.exit(1);
};

log(`projeto   : ${ROOT}`);
log(`basePath  : ${BASE_PATH}`);
log(`site      : ${SITE_URL}`);

/* 1. manifesto de imagens (o que existe em public/) ------------------------ */
try {
  spawnSync(process.execPath, [path.join(ROOT, "scripts", "gen-assets-manifest.mjs")], { cwd: ROOT, stdio: "inherit" });
} catch {
  fail("não foi possível gerar o manifesto de imagens");
}

/* 2. next build com as variáveis certas ----------------------------------- */
let nextBin;
try {
  nextBin = require.resolve("next/dist/bin/next");
} catch {
  fail("Next.js não encontrado em node_modules — rode `npm ci` (ou `npm install`) antes.");
}

const env = {
  ...process.env,
  PAGES_STATIC: "1",
  PAGES_BASE_PATH: BASE_PATH,
  NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  NEXT_PUBLIC_STATIC_EXPORT: "1",
  SITE_URL,
  NODE_ENV: process.env.NODE_ENV || "production",
};

log("executando next build (output: export)…");
const built = spawnSync(process.execPath, [nextBin, "build"], { cwd: ROOT, env, stdio: "inherit" });
if (built.status !== 0) fail(`next build terminou com código ${built.status}`);

/* 3. conferência do artefato ---------------------------------------------- */
const indexPath = path.join(OUT, "index.html");
if (!fs.existsSync(indexPath)) fail("out/index.html não foi gerado");

const html = fs.readFileSync(indexPath, "utf8");
const problemas = [];

if (!fs.existsSync(path.join(OUT, ".nojekyll"))) problemas.push("out/.nojekyll ausente (GitHub Pages ignora pastas com _)");

// Todo recurso precisa sair com o basePath. Caminho absoluto sem o prefixo vira
// 404 no Pages de projeto — foi o que deixou o site sem CSS e com os
// "Unexpected token '<'" nos .js (o servidor devolvia HTML no lugar do script).
const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
const semPrefixo = [...new Set(refs.filter((r) => !r.startsWith(`${BASE_PATH}/`) && r !== BASE_PATH))];
if (semPrefixo.length) problemas.push(`recursos sem basePath: ${semPrefixo.slice(0, 5).join(", ")}`);

const css = refs.filter((r) => r.endsWith(".css"));
const js = refs.filter((r) => r.endsWith(".js"));
if (!css.length) problemas.push("nenhum CSS referenciado no index.html");
if (!js.length) problemas.push("nenhum JS referenciado no index.html");

for (const rel of [...css, ...js]) {
  const file = path.join(OUT, rel.slice(BASE_PATH.length + 1));
  if (!fs.existsSync(file)) problemas.push(`referência sem arquivo: ${rel}`);
}

const contar = (dir) => {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? contar(path.join(dir, e.name)) : 1;
  }
  return n;
};
const arquivos = contar(OUT);
const mb = (() => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? walk(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
  return (walk(OUT) / (1024 * 1024)).toFixed(1);
})();

console.log("");
log(`artefato  : out/ — ${arquivos} arquivos, ${mb} MB`);
log(`CSS       : ${css.length} · JS: ${js.length} · imagens em assets/: ${contar(path.join(OUT, "assets", "img"))}`);
if (problemas.length) {
  for (const p of problemas) console.error(`[build:pages] PROBLEMA: ${p}`);
  process.exit(1);
}
log(`OK — recursos com prefixo ${BASE_PATH}, .nojekyll presente.`);
log("Para ver localmente: npm run preview:pages");
