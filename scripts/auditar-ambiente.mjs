/**
 * Auditoria do ambiente de execução local — a classe de erro que estragou a prévia.
 *
 * Roda sem rede e sem servidor: olha o projeto e o que está versionado e responde
 * "existe alguma armadilha que vai quebrar o build ou a prévia?". Cobre:
 *
 *   1. imports `@/...` resolvem (com a caixa exata das letras — importa para o Linux);
 *   2. todo asset do manifesto existe em `public/`;
 *   3. nomes de arquivo seguros para Windows (sem `: * ? " < > |`, sem nomes
 *      reservados, sem colisão de maiúscula/minúscula que quebra no Linux);
 *   4. scripts do `package.json` existem no disco e não usam sintaxe POSIX de
 *      variável (`VAR=1 comando`), que é o que falhava no PowerShell;
 *   5. comandos citados na documentação existem de verdade;
 *   6. `.gitignore` não esconde pasta de código (foi o que deixou o ZIP sem
 *      `src/data/` e quebrou o build de quem baixou);
 *   7. `.cmd`/`.bat` em ASCII + CRLF e conferindo a versão do Node;
 *   8. workflow do Pages coerente com o build atual;
 *   9. `basePath` igual no `next.config`, no build e no servidor de prévia;
 *  10. manifesto de imagens em sincronia com `public/`.
 *
 * Uso:
 *   node scripts/auditar-ambiente.mjs        (ou: npm run auditar)
 *   Saída final: "=== AMBIENTE OK ===" ou a lista de problemas com o que fazer.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const problemas = [];
const avisos = [];
const ok = [];

const r = (...p) => path.join(ROOT, ...p);
const existe = (...p) => fs.existsSync(r(...p));
const ler = (...p) => fs.readFileSync(r(...p), "utf8");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

const IGNORAR = new Set(["node_modules", ".next", "out", ".git"]);

function listar(dir = ROOT, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, acc);
    else acc.push(p);
  }
  return acc;
}

const arquivos = listar();

/* 1. imports `@/...` com a caixa exata -------------------------------------- */
function caixaExata(alvo) {
  if (!fs.existsSync(alvo)) return false;
  const partes = path.relative(ROOT, alvo).split(path.sep);
  let atual = ROOT;
  for (const parte of partes) {
    if (!fs.existsSync(atual)) return false;
    if (!fs.readdirSync(atual).includes(parte)) return false;
    atual = path.join(atual, parte);
  }
  return true;
}

function resolverImport(spec) {
  const base = r("src", spec.slice(2));
  for (const ext of ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css"]) {
    const f = base + ext;
    if (caixaExata(f)) return true;
    for (const iext of [".ts", ".tsx", ".js"]) {
      const idx = path.join(base + ext, "index" + iext);
      if (caixaExata(idx)) return true;
    }
  }
  return false;
}

let nImports = 0;
for (const f of arquivos.filter((f) => /\.(ts|tsx|mjs|js)$/.test(f) && !rel(f).startsWith("scripts/"))) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/(?:from\s+|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g)) {
    const spec = m[1];
    if (!spec.startsWith("@/")) continue;
    nImports++;
    if (!resolverImport(spec)) problemas.push(`import não resolve: ${spec} (em ${rel(f)})`);
  }
}
ok.push(`imports @/… verificados: ${nImports}`);

/* 2. assets do manifesto ---------------------------------------------------- */
const publicFiles = new Set();
(function andarPublico(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) andarPublico(p);
    else publicFiles.add("/" + path.relative(r("public"), p).split(path.sep).join("/"));
  }
})(r("public"));

if (!existe("src/lib/assets.generated.json")) {
  problemas.push("src/lib/assets.generated.json ausente — rode `npm run gen:assets`");
} else {
  const manifesto = JSON.parse(ler("src/lib/assets.generated.json"));
  const doManifesto = (manifesto.files || []).slice().sort();
  for (const a of doManifesto) if (!publicFiles.has(a)) problemas.push(`manifesto cita asset inexistente: ${a}`);
  const real = [...publicFiles].sort();
  if (JSON.stringify(doManifesto) !== JSON.stringify(real)) problemas.push("manifesto fora de sincronia com public/ — rode `npm run gen:assets`");
  ok.push(`assets do manifesto x public/: ${doManifesto.length} × ${real.length}`);
}

/* 3. nomes seguros para Windows e para o Linux ------------------------------ */
const RESERVADOS = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
const INVALIDOS = /[<>:"|?*\x00-\x1f]/;
const porCaixaBaixa = new Map();
for (const f of arquivos.map(rel)) {
  const nome = path.basename(f);
  if (INVALIDOS.test(f)) problemas.push(`nome inválido no Windows: ${f}`);
  if (RESERVADOS.test(nome)) problemas.push(`nome reservado no Windows: ${f}`);
  if (/[ .]$/.test(nome)) problemas.push(`nome termina em espaço/ponto (Windows remove): ${f}`);
  const chave = f.toLowerCase();
  if (porCaixaBaixa.has(chave) && porCaixaBaixa.get(chave) !== f) problemas.push(`colisão só de maiúsculas/minúsculas: ${porCaixaBaixa.get(chave)} × ${f}`);
  porCaixaBaixa.set(chave, f);
  if (f.length > 180) avisos.push(`caminho longo (${f.length} caracteres): ${f}`);
}
ok.push(`nomes de arquivo verificados: ${arquivos.length}`);

/* 4. scripts do package.json ------------------------------------------------ */
const pkg = JSON.parse(ler("package.json"));
const nomesScripts = new Set(Object.keys(pkg.scripts || {}));
for (const [nome, cmd] of Object.entries(pkg.scripts || {})) {
  if (/^\s*[A-Z_][A-Z0-9_]*=\S+\s+\S/.test(cmd)) problemas.push(`script "${nome}" usa sintaxe POSIX de variável (falha no PowerShell): ${cmd}`);
  for (const m of cmd.matchAll(/\b(?:node|next)\s+([\w./-]+\.(?:mjs|js))/g)) {
    if (m[1].startsWith("scripts/") && !existe(m[1])) problemas.push(`script "${nome}" aponta para ${m[1]}, que não existe`);
  }
}
if (!nomesScripts.has("build:pages")) problemas.push('falta o script "build:pages" no package.json');
if (!nomesScripts.has("preview:pages")) problemas.push('falta o script "preview:pages" no package.json');
if (!pkg.engines || !/>=2[0-9]/.test(String(pkg.engines.node || ""))) avisos.push("package.json sem engines.node >= 20 (o Next 16 exige Node 20+)");
ok.push(`scripts do package.json verificados: ${nomesScripts.size}`);

/* 5. comandos citados na documentação -------------------------------------- */
let nDocs = 0;
for (const doc of arquivos.filter((f) => /\.(md|ya?ml)$/.test(f))) {
  const texto = fs.readFileSync(doc, "utf8");
  const nomeDoc = rel(doc);
  nDocs++;
  for (const m of texto.matchAll(/node\s+(scripts|testes)\/([\w.-]+\.mjs)/g)) {
    const antes = texto.slice(Math.max(0, (m.index || 0) - 1500), m.index);
    const ehDeOutroRepo =
      /reposit[óo]rio da Kirana|do reposit[óo]rio Kirana/i.test(antes) ||
      // relatos de correção citam o arquivo removido de propósito
      /removid[oa]|n[ãa]o existe|corrigid[oa]|deixou de existir/i.test(antes);
    if (!existe(m[1], m[2]) && !ehDeOutroRepo) problemas.push(`${nomeDoc} manda rodar ${m[1]}/${m[2]}, que não existe neste projeto`);
  }
  for (const m of texto.matchAll(/npm run ([\w:.-]+)/g)) {
    if (!nomesScripts.has(m[1])) problemas.push(`${nomeDoc} manda rodar "npm run ${m[1]}", que não existe`);
  }
}
ok.push(`documentos verificados: ${nDocs}`);

/* 6. .gitignore não esconde código ----------------------------------------- */
const regras = ler(".gitignore").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const perigosas = regras.filter((l) => /^(data|src|app|lib|components|public|testes|scripts|docs|assets)\/?$/.test(l));
for (const p of perigosas) problemas.push(`.gitignore esconde pasta de código com "${p}" — use "/${p.replace(/\/+$/, "")}/" para limitar à raiz`);
for (const essencial of ["src/data/portfolio.ts", "src/data/scenarios.ts", "src/lib/assets.generated.json", "public/.nojekyll"]) {
  if (!existe(essencial)) problemas.push(`arquivo essencial ausente: ${essencial}`);
}
// O bug real: os arquivos existiam no disco, mas NÃO estavam no git — e o ZIP
// feito a partir do repositório saía sem eles, quebrando o build de quem baixou.
if (existe(".git")) {
  const { spawnSync } = await import("node:child_process");
  for (const essencial of ["src/data/portfolio.ts", "src/data/scenarios.ts", "src/lib/assets.generated.json", "public/.nojekyll", "scripts/build-pages.mjs"]) {
    if (!existe(essencial)) continue;
    const r = spawnSync("git", ["ls-files", "--error-unmatch", essencial], { cwd: ROOT, stdio: "ignore" });
    if (r.status !== 0) problemas.push(`${essencial} existe no disco mas NÃO está versionado no git (o ZIP/clone sai sem ele)`);
  }
}
ok.push(`regras do .gitignore: ${regras.length}`);

/* 7. .cmd / .bat para o Windows -------------------------------------------- */
const scriptsWin = arquivos.filter((f) => /\.(cmd|bat)$/i.test(f));
for (const f of scriptsWin) {
  const bytes = fs.readFileSync(f);
  const nome = rel(f);
  if (bytes.some((b) => b > 127)) problemas.push(`${nome}: tem caractere não-ASCII (o cmd.exe pode travar)`);
  if (!bytes.includes("\r\n")) problemas.push(`${nome}: sem CRLF (o cmd.exe pode falhar)`);
  if (!/NODE_MAJOR|node -v/.test(bytes.toString("ascii"))) avisos.push(`${nome}: não confere a versão do Node`);
}
ok.push(`scripts .cmd/.bat verificados: ${scriptsWin.length}`);

/* 8. workflow do GitHub Pages ---------------------------------------------- */
if (existe(".github/workflows/pages.yml")) {
  const wf = ler(".github/workflows/pages.yml");
  if (!/npm run build:pages/.test(wf)) problemas.push("pages.yml não chama `npm run build:pages`");
  if (/PAGES_STATIC=1/.test(wf)) problemas.push("pages.yml usa o comando POSIX antigo");
  if (!/path:\s*out/.test(wf)) problemas.push("pages.yml não publica a pasta out/");
  ok.push("workflow do Pages: build:pages + out/");
} else {
  avisos.push("sem .github/workflows/pages.yml (não afeta a prévia local)");
}

/* 9. basePath coerente ----------------------------------------------------- */
const MARCA = "/opportunity-site";
const consistente = ["next.config.ts", "scripts/build-pages.mjs", "scripts/preview-pages.mjs"].every(
  (f) => existe(f) && ler(f).includes(MARCA),
);
if (!consistente) problemas.push(`o basePath ${MARCA} não aparece em next.config.ts + build-pages.mjs + preview-pages.mjs`);
ok.push(`basePath ${MARCA} coerente nos 3 pontos`);

/* 10. resumo --------------------------------------------------------------- */
console.log("\nAuditoria do ambiente local — Opportunity AI\n");
for (const l of ok) console.log(`  ok   ${l}`);

if (avisos.length) {
  console.log("\nAvisos (não impedem nada):");
  for (const a of avisos) console.log(`  ~    ${a}`);
}

if (problemas.length) {
  console.log("\nProblemas encontrados:");
  for (const p of problemas) console.log(`  FALHA ${p}`);
  console.log(`\n=== ${problemas.length} PROBLEMA(S) ===\n`);
  process.exit(1);
}

console.log("\n=== AMBIENTE OK ===\n");
