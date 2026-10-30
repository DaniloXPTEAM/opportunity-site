/**
 * Verificação HTTP da prévia local (o que o navegador vai pedir).
 *
 * Confere, para cada tipo de recurso: código de status e Content-Type. É o teste
 * que faltava para pegar o sintoma "JavaScript recebendo HTML".
 *
 * Uso: node scripts/verificar-previa.mjs [url-base]
 *      node scripts/verificar-previa.mjs http://127.0.0.1:4400/opportunity-site/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = path.join(ROOT, "out");
const PORTA = process.env.PORT || "4400";
const BASE = (process.argv[2] || `http://127.0.0.1:${PORTA}/opportunity-site/`).replace(/\/$/, "");

let falhas = 0;
const ok = (cond, nome, detalhe = "") => {
  console.log(`  ${cond ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!cond) falhas++;
};

// Servidor desligado não é "falha do site": é só esquecer a outra janela.
const preflight = async () => {
  try {
    await fetch(`${BASE}/`, { method: "HEAD" });
  } catch (e) {
    if (e && (e.cause?.code === "ECONNREFUSED" || e.code === "ECONNREFUSED")) {
      console.error(`\n[verificar] não há servidor em ${BASE}/`);
      console.error("[verificar] Abra a prévia primeiro, em outra janela:");
      console.error("             npm run preview:pages -- --no-open\n");
      process.exit(1);
    }
    throw e;
  }
};
await preflight();

const get = async (url) => {
  const r = await fetch(url, { redirect: "manual" });
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, type: (r.headers.get("content-type") || "").split(";")[0], buf, location: r.headers.get("location") };
};

console.log(`\nAlvo: ${BASE}/\n`);

/* 1. página --------------------------------------------------------------- */
const pagina = await get(`${BASE}/`);
ok(pagina.status === 200, "HTML da página responde 200", `status ${pagina.status}`);
ok(pagina.type === "text/html", "HTML com Content-Type text/html", pagina.type);

const html = pagina.buf.toString("utf8");

/* 2. raiz redireciona ------------------------------------------------------ */
const raiz = await get(BASE.replace(/\/opportunity-site$/, "") + "/");
ok([301, 302].includes(raiz.status), "/ redireciona para o basePath", `${raiz.status} → ${raiz.location || "-"}`);

/* 3. sem barra final ------------------------------------------------------ */
const semBarra = await get(BASE);
ok([301, 302, 200].includes(semBarra.status), "/opportunity-site (sem barra) resolve", `status ${semBarra.status}`);

/* 4. CSS e JS do HTML ------------------------------------------------------ */
const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:css|js))"/g)].map((m) => m[1]);
ok(refs.length > 0, "HTML declara CSS/JS", `${refs.length} arquivos`);

let jsHtml = 0;
for (const ref of refs) {
  const r = await get(`${BASE}${ref.replace(/^\/opportunity-site/, "")}`);
  const esperado = ref.endsWith(".css") ? "text/css" : "text/javascript";
  const tipoOk = r.type === esperado;
  // O sintoma do bug: o servidor devolvia HTML no lugar do JS.
  if (!tipoOk && r.buf.slice(0, 15).toString("utf8").toLowerCase().includes("<!doctype")) jsHtml++;
  ok(r.status === 200 && tipoOk, `${ref.split("/").pop()}`, `${r.status} ${r.type}`);
}
ok(jsHtml === 0, "nenhum JS/CSS recebendo HTML (evita 'Unexpected token <')", `${jsHtml} ocorrência(s)`);

/* 5. imagens referenciadas ------------------------------------------------ */
const imgs = [...html.matchAll(/\/opportunity-site\/assets\/[^"']+\.(?:jpg|png|webp|svg)/g)].map((m) => m[0]);
const unicas = [...new Set(imgs)];
let ruins = 0;
for (const i of unicas) {
  const r = await get(`${BASE}${i.replace(/^\/opportunity-site/, "")}`);
  if (r.status !== 200 || !r.type.startsWith("image/")) ruins++;
}
ok(ruins === 0 && unicas.length > 0, "todas as imagens do HTML carregam", `${unicas.length - ruins}/${unicas.length}`);

/* 6. todos os arquivos de public/ ---------------------------------------- */
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "lib", "assets.generated.json"), "utf8"));
let pubOk = 0;
const pubFalhas = [];
for (const rel of manifest.files) {
  const r = await get(`${BASE}${rel}`);
  if (r.status === 200) pubOk++;
  else pubFalhas.push(`${rel} → ${r.status}`);
}
ok(pubFalhas.length === 0, "todos os arquivos de public/ respondem 200", `${pubOk}/${manifest.files.length} ${pubFalhas.slice(0, 3).join(", ")}`);

/* 7. artefato ------------------------------------------------------------- */
ok(fs.existsSync(path.join(OUT, ".nojekyll")), ".nojekyll presente em out/");
ok(fs.existsSync(path.join(OUT, "index.html")), "out/index.html presente");

console.log(`\n=== ${falhas ? `${falhas} FALHA(S)` : "TUDO OK"} ===\n`);
process.exitCode = falhas ? 1 : 0;
