/**
 * Gera a lista de arquivos que EXISTEM em `public/`.
 *
 * Por que isso existe: três imagens citadas pelo projeto não estão no pacote
 * (`rpg-comic-chronicles.jpg`, `processo-inteligente-empresas.jpg`,
 * `lab-cine.jpg`). Sem o manifesto, o navegador pediria cada uma, tomaria 404 e
 * deixaria erro no console. Com ele, o componente só renderiza (e só pede) o
 * que existe de fato — e quando o arquivo chegar em `public/`, o próximo build
 * o inclui automaticamente, sem mexer em código.
 *
 * Roda antes de cada build (`prebuild` e `prebuild:pages`).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PUBLIC = path.join(ROOT, "public");
const DEST = path.join(ROOT, "src", "lib", "assets.generated.json");

const walk = (dir, base = "") => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${base}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
};

const files = fs.existsSync(PUBLIC) ? walk(PUBLIC).sort() : [];
fs.writeFileSync(
  DEST,
  `${JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), count: files.length, files }, null, 2)}\n`,
  "utf8",
);
console.log(`[assets] ${files.length} arquivos em public/ → ${path.relative(ROOT, DEST)}`);
