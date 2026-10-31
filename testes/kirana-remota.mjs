/**
 * Teste da Kirana ONLINE no site estático (atendente real + fallback guiado).
 *
 * Pré-requisitos (três terminais):
 *   1) Gateway de teste e Kirana, no repositório da Kirana:
 *        node scripts/mock-gateway.js --port 1456 --key local-mock
 *        KIRANA_ENV=production KIRANA_ACCESS_TOKEN=<qualquer> KIRANA_TRUST_PROXY=true \
 *        KIRANA_ALLOWED_ORIGINS=http://127.0.0.1:4400 KIRANA_AGENT_RATE_MAX=60 \
 *        KIRANA_GATEWAY_URL=http://127.0.0.1:1456 KIRANA_GATEWAY_API_KEY=local-mock \
 *        node src/server.js
 *   2) Site construído apontando para ela e servido:
 *        NEXT_PUBLIC_KIRANA_URL=http://127.0.0.1:3000 npm run build:pages
 *        npm run serve:pages
 *   3) node testes/kirana-remota.mjs [url-do-site]      (aceita CHROME_PATH)
 *
 * O horário é fixado no navegador (Playwright), então o teste não depende da hora em que roda.
 *
 * Verifica:
 *  1. com a Kirana de pé, o painel é o da Kirana online e ela responde com o conhecimento do site;
 *  2. o rodapé leva à equipe (WhatsApp e formulário);
 *  3. no horário de descanso (00h–06h em Fortaleza) o painel guiado abre com o aviso, sem tentar conectar;
 *  4. com a Kirana fora do ar (ou o Gateway sem login), o painel guiado abre com o aviso e o visitante continua atendido;
 *  5. nenhum erro de página.
 */
import { chromium } from "playwright";

const URL_SITE = process.argv[2] || "http://127.0.0.1:4400/opportunity-site/";
const falhas = [];
const check = (ok, nome, detalhe = "") => {
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas.push(nome);
};

try {
  await fetch(URL_SITE, { method: "HEAD" });
} catch {
  console.error(`\n[teste] não há servidor em ${URL_SITE} (veja os pré-requisitos no topo do arquivo)\n`);
  process.exit(2);
}

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {},
);

async function abrirAtendente(page, instante) {
  await page.clock.setFixedTime(new Date(instante));
  await page.goto(URL_SITE, { waitUntil: "load" });
  await page.getByRole("button", { name: /Atendente digital/i }).first().click();
}

// 15:00Z = 12:00 em Fortaleza (fora do descanso) · 05:30Z = 02:30 em Fortaleza (dentro).
const MEIO_DIA = "2026-11-02T15:00:00Z";
const MADRUGADA = "2026-11-02T05:30:00Z";

console.log(`Alvo: ${URL_SITE}\n`);

/* 1 e 2 — Kirana de pé ---------------------------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await abrirAtendente(page, MEIO_DIA);
  const painel = page.locator('[data-testid="kirana-remota"]');
  const campo = painel.locator("input");
  let aberto = true;
  try {
    await campo.waitFor({ timeout: 15000 });
  } catch {
    aberto = false;
  }
  check(aberto, "com a Kirana de pé, abre o painel da Kirana online");
  if (aberto) {
    await campo.fill("Quais serviços vocês oferecem?");
    await campo.press("Enter");
    let resposta = "";
    try {
      await painel.getByText(/7 frentes/i).waitFor({ timeout: 15000 });
      resposta = "ok";
    } catch {
      resposta = "";
    }
    check(resposta === "ok", "a Kirana responde com o conhecimento do site (7 frentes)");
    let temFrenteNova = false;
    try {
      await painel.getByText(/Sites e sistemas personalizados/).waitFor({ timeout: 15000 });
      temFrenteNova = true;
    } catch {
      temFrenteNova = false;
    }
    check(temFrenteNova, "a resposta inclui a frente nova (Sites e sistemas)");
    const wa = await painel.locator('a[href*="wa.me/5585999462763"]').count();
    check(wa > 0, "o rodapé leva ao WhatsApp da equipe");
    check((await painel.getByRole("button", { name: /formulário de contato/i }).count()) > 0, "o rodapé leva ao formulário");
    check(
      (await page.locator('[data-testid="aviso-atendente"]').count()) === 0,
      "sem aviso de indisponibilidade quando a Kirana está de pé",
    );
  }
  check(erros.length === 0, "nenhum erro de página com a Kirana online", erros.join(" | ").slice(0, 120));
  await page.close();
}

/* 3 — horário de descanso ------------------------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let tentouConectar = false;
  page.on("request", (r) => {
    if (r.url().includes("/api/status")) tentouConectar = true;
  });
  await abrirAtendente(page, MADRUGADA);
  const aviso = page.locator('[data-testid="aviso-atendente"]');
  let texto = "";
  try {
    await aviso.waitFor({ timeout: 8000 });
    texto = (await aviso.innerText()).replace(/\s+/g, " ");
  } catch {
    texto = "";
  }
  check(/descansa/i.test(texto), "no horário de descanso, o painel guiado abre com o aviso", texto.slice(0, 80));
  check(/0h às 6h/.test(texto), "o aviso informa a janela (0h às 6h)");
  check(!tentouConectar, "no descanso nem tenta conectar à Kirana");
  check((await page.locator('[data-testid="kirana-remota"]:visible').count()) === 0, "o painel remoto não aparece no descanso");
  await page.close();
}

/* 4 — Kirana fora do ar --------------------------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/status", (rota) => rota.abort());
  await abrirAtendente(page, MEIO_DIA);
  const aviso = page.locator('[data-testid="aviso-atendente"]');
  let texto = "";
  try {
    await aviso.waitFor({ timeout: 12000 });
    texto = (await aviso.innerText()).replace(/\s+/g, " ");
  } catch {
    texto = "";
  }
  check(/fora do ar/i.test(texto), "com a Kirana fora do ar, o painel guiado abre com o aviso", texto.slice(0, 80));
  check(
    (await page.getByText(/Atendimento guiado/i).count()) > 0,
    "o atendimento guiado continua disponível para o visitante",
  );
  await page.close();
}

/* 5 — Gateway sem login (SIWC) -------------------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/status", (rota) =>
    rota.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ gateway: { configured: true, reachable: true, health: { status: "ok", authenticated: false } } }),
    }),
  );
  await abrirAtendente(page, MEIO_DIA);
  const aviso = page.locator('[data-testid="aviso-atendente"]');
  let texto = "";
  try {
    await aviso.waitFor({ timeout: 12000 });
    texto = (await aviso.innerText()).replace(/\s+/g, " ");
  } catch {
    texto = "";
  }
  check(/fora do ar/i.test(texto), "com o Gateway sem login, cai no atendimento guiado com aviso");
  check((await page.locator('[data-testid="kirana-remota"]:visible').count()) === 0, "o painel remoto não abre sem login do Gateway");
  await page.close();
}

await browser.close();
console.log(falhas.length ? `\n=== ${falhas.length} FALHA(S) ===\n  - ${falhas.join("\n  - ")}` : "\n=== TUDO OK ===");
process.exit(falhas.length ? 1 : 0);
