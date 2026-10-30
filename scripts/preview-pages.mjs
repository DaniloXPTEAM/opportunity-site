/**
 * Prévia local do site estático, imitando o GitHub Pages de projeto.
 *
 * Por que não `npx serve out`
 * ---------------------------
 * O build estático usa `basePath: "/opportunity-site"`: o HTML pede
 * `/opportunity-site/_next/...` e `/opportunity-site/assets/...`. No disco,
 * porém, os arquivos ficam em `out/_next/...` e `out/assets/...` — o prefixo
 * existe só na URL. Servir `out/` na raiz (`serve out`, `http-server out`)
 * devolve 404 em TODO recurso; o 404 é HTML, o navegador recebe HTML no lugar
 * de `.js`, e aparecem os erros "Uncaught SyntaxError: Unexpected token '<'"
 * (um por script) além da página sem CSS.
 *
 * Este servidor faz o mapeamento que o Pages faz:
 *
 *   http://127.0.0.1:4400/opportunity-site/_next/...  →  out/_next/...
 *   http://127.0.0.1:4400/opportunity-site/assets/... →  out/assets/...
 *   http://127.0.0.1:4400/                            →  302 /opportunity-site/
 *   http://127.0.0.1:4400/opportunity-site            →  302 /opportunity-site/
 *
 * Uso:
 *   npm run preview:pages                # build (se faltar) + servidor + abre o navegador
 *   npm run preview:pages -- --rebuild    # força novo build
 *   npm run preview:pages -- --no-open    # não abre o navegador
 *   PORT=4400 node scripts/preview-pages.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = path.join(ROOT, "out");
const BASE_PATH = (process.env.PAGES_BASE_PATH || "/opportunity-site").replace(/\/$/, "");
const PORTA_PEDIDA = process.env.PORT ? Number(process.env.PORT) : null;
const PORT = PORTA_PEDIDA || 4400;
const HOST = process.env.HOST || "127.0.0.1";
const args = new Set(process.argv.slice(2));
const REBUILD = args.has("--rebuild");
const NO_OPEN = args.has("--no-open");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/* 1. build, se necessário -------------------------------------------------- */
function ensureBuild() {
  const temBuild = fs.existsSync(path.join(OUT, "index.html"));
  const velho = temBuild && buildDesatualizado();
  const precisa = REBUILD || !temBuild || velho;
  if (!precisa) {
    console.log("[preview] usando o build existente em out/ (use --rebuild para refazer)");
    return;
  }
  if (velho && !REBUILD) console.log("[preview] o build está mais velho que o código — refazendo para você ver a versão atual");
  console.log("[preview] gerando o build estático…");
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "build-pages.mjs")], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) {
    console.error("[preview] o build falhou — corrija o erro acima e tente de novo");
    process.exit(1);
  }
}
ensureBuild();

/* 2. servidor -------------------------------------------------------------- */
const requests = [];
const faltando = [];

const send = (res, status, body, type = "text/plain; charset=utf-8", extra = {}) => {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store", ...extra });
  res.end(body);
};

const server = http.createServer((req, res) => {
  const rawUrl = decodeURIComponent((req.url || "/").split("?")[0]);
  const registrar = (status, type) => {
    requests.push({ url: rawUrl, status, type });
    if (status === 404) faltando.push(rawUrl);
  };

  // raiz → página
  if (rawUrl === "/" || rawUrl === "") {
    registrar(302, "-");
    res.writeHead(302, { location: `${BASE_PATH}/` });
    return res.end();
  }
  // sem barra final → com barra (é o que o GitHub Pages faz)
  if (rawUrl === BASE_PATH || rawUrl === `${BASE_PATH}/index.html`) {
    registrar(301, "-");
    res.writeHead(301, { location: `${BASE_PATH}/` });
    return res.end();
  }
  if (!rawUrl.startsWith(`${BASE_PATH}/`)) {
    registrar(404, "text/html");
    return send(res, 404, `<h1>404</h1><p>Fora do basePath. Use <a href="${BASE_PATH}/">${BASE_PATH}/</a></p>`, "text/html; charset=utf-8");
  }

  let rel = rawUrl.slice(BASE_PATH.length + 1) || "index.html";
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(OUT, rel);

  if (!file.startsWith(OUT)) {
    registrar(403, "-");
    return send(res, 403, "403");
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const semExt = !path.extname(rel);
    if (semExt && fs.existsSync(`${file}.html`)) rel = `${rel}.html`;
    else {
      const html404 = path.join(OUT, "404.html");
      registrar(404, "text/html");
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      return res.end(fs.existsSync(html404) ? fs.readFileSync(html404) : "<h1>404</h1>");
    }
  }

  const final = path.join(OUT, rel.endsWith(".html") ? rel : rel);
  const type = MIME[path.extname(final).toLowerCase()] || "application/octet-stream";
  registrar(200, type.split(";")[0]);
  res.writeHead(200, {
    "content-type": type,
    "content-length": fs.statSync(final).size,
    "cache-control": "no-store",
  });
  fs.createReadStream(final).pipe(res);
});

/**
 * O build está mais velho que o código? Servir um `out/` velho faz o usuário
 * "não ver" as próprias mudanças — um problema silencioso, do mesmo tipo do
 * 404 de recurso. Aqui a gente detecta e refaz o build.
 */
function buildDesatualizado() {
  const alvo = path.join(OUT, "index.html");
  if (!fs.existsSync(alvo)) return false;
  const quando = fs.statSync(alvo).mtimeMs;
  const varrer = (p) => {
    if (!fs.existsSync(p)) return quando;
    const st = fs.statSync(p);
    if (!st.isDirectory()) return st.mtimeMs;
    let maior = st.mtimeMs;
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      maior = Math.max(maior, varrer(path.join(p, e.name)));
    }
    return maior;
  };
  const fontes = ["src", "public", "next.config.ts", "package.json", "postcss.config.mjs"].map((f) => varrer(path.join(ROOT, f)));
  return Math.max(...fontes) > quando + 1000;
}

const abrirNavegador = (url) => {
  if (NO_OPEN) return;
  const cmd = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const argv = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(cmd, argv, { detached: true, stdio: "ignore" }).unref();
  } catch {
    /* sem navegador: o endereço já aparece no terminal */
  }
};

let portaAtual = PORT;
const MAX_TENTATIVAS = 10;

const anunciar = (porta) => {
  const url = `http://${HOST === "0.0.0.0" ? "127.0.0.1" : HOST}:${porta}${BASE_PATH}/`;
  console.log("");
  console.log("  ┌───────────────────────────────────────────────────────────────┐");
  console.log("  │  Prévia do site estático (imita o GitHub Pages de projeto)     │");
  console.log("  └───────────────────────────────────────────────────────────────┘");
  console.log(`  Abra:  ${url}`);
  console.log(`  Serve: ${OUT}`);
  console.log("  Ctrl+C para parar.");
  console.log("");
  abrirNavegador(url);
  return url;
};

const subir = (porta, tentativa = 0) => {
  // Cada tentativa registra seus próprios ouvintes e desfaz os do erro:
  // sem isso, a tentativa que falhou ficaria pendurada e anunciaria duas URLs.
  const aoOuvir = () => {
    server.removeListener("error", aoFalhar);
    portaAtual = porta;
    anunciar(porta);
  };
  const aoFalhar = (err) => {
    server.removeListener("listening", aoOuvir);
    if (err.code === "EADDRINUSE" || err.code === "EACCES") {
      // Porta ocupada é comum (outra prévia aberta, outro projeto). Em vez de
      // despejar stack trace, avisamos e tentamos a próxima porta.
      const proxima = porta + 1;
      if (tentativa < MAX_TENTATIVAS) {
        console.log(`[preview] a porta ${porta} já está em uso — tentando ${proxima}…`);
        subir(proxima, tentativa + 1);
        return;
      }
      console.error(`[preview] não achei porta livre entre ${PORT} e ${proxima}.`);
      console.error("[preview] Feche a outra prévia ou use: $env:PORT=4500; npm run preview:pages");
      process.exit(1);
    }
    console.error("[preview] falha ao subir o servidor:", err.message);
    process.exit(1);
  };
  server.once("listening", aoOuvir);
  server.once("error", aoFalhar);
  server.listen(porta, HOST);
};
subir(PORT);

process.on("SIGINT", () => {
  console.log(`\n[preview] porta ${portaAtual} — requisições atendidas:`, requests.length);
  if (faltando.length) {
    console.log("[preview] caminhos que deram 404 (investigar):");
    for (const f of [...new Set(faltando)]) console.log("   -", f);
  } else {
    console.log("[preview] nenhum 404.");
  }
  server.close(() => process.exit(0));
});
