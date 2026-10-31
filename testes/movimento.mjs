/**
 * Teste do movimento (GSAP) — roda contra o `out/`.
 *
 * Pré-requisito: npm run build:pages · npm run serve:pages (porta 4400)
 *   node testes/movimento.mjs [url]
 *
 * Garante a melhoria progressiva: com movimento, tudo termina visível e a barra de leitura anda; com
 * "reduzir movimento" ou sem JavaScript, nada fica escondido, e o celular não ganha rolagem horizontal.
 */
import { chromium } from "playwright";

const URL_BASE = process.argv[2] || "http://127.0.0.1:4400/opportunity-site/";
const falhas = [];
const check = (ok, nome, detalhe = "") => {
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas.push(nome);
};

const translucidos = (page) =>
  page.evaluate(
    () =>
      Array.from(document.querySelectorAll("[data-reveal], [data-stagger] > *")).filter(
        (e) => parseFloat(getComputedStyle(e).opacity) < 0.99,
      ).length,
  );

async function rolarTudo(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(1600);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--no-sandbox"],
});

// 1. Com movimento
{
  console.log("Com movimento");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto(URL_BASE, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  check((await page.evaluate(() => document.documentElement.dataset.motion)) === "live", "GSAP assumiu o controle (data-motion=live)");
  check((await page.locator("h1 .linha-titulo").count()) > 0, "título do início dividido em linhas");
  await rolarTudo(page);
  check((await translucidos(page)) === 0, "depois de rolar, nenhum bloco fica escondido");
  const barra = await page.evaluate(() => {
    const el = document.querySelector(".progresso-leitura");
    return el ? new DOMMatrix(getComputedStyle(el).transform).a : -1;
  });
  check(barra > 0.9, "barra de leitura chega ao fim da página", `escala ${barra.toFixed(2)}`);
  const numeros = await page.evaluate(() => Array.from(document.querySelectorAll("[data-count]")).map((e) => e.textContent));
  check(numeros.join(",") === "7,9,1", "números do início chegam ao valor real", numeros.join(","));
  check(erros.length === 0, "sem erro de JavaScript", erros.slice(0, 2).join(" | "));
  await ctx.close();
}

// 2. Reduzir movimento
{
  console.log("Reduzir movimento");
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(URL_BASE, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  check((await page.evaluate(() => document.documentElement.dataset.motion)) === undefined, "movimento desligado");
  check((await page.locator("h1 .linha-titulo").count()) === 0, "título sem divisão em linhas");
  check((await translucidos(page)) === 0, "nada escondido");
  const anima = await page.evaluate(() => getComputedStyle(document.querySelector(".faixa-corre")).animationName);
  check(anima === "none", "faixa de frentes parada", anima);
  await ctx.close();
}

// 3. Sem JavaScript
{
  console.log("Sem JavaScript");
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(URL_BASE, { waitUntil: "load" });
  await page.waitForTimeout(800);
  check((await translucidos(page)) === 0, "conteúdo visível sem JavaScript");
  const h1 = await page.evaluate(() => getComputedStyle(document.querySelector("h1")).visibility);
  check(h1 === "visible", "título visível sem JavaScript", h1);
  await ctx.close();
}

// 4. Celular
{
  console.log("Celular (390 px)");
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.goto(URL_BASE, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  await rolarTudo(page);
  const largura = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: window.innerWidth }));
  check(largura.s <= largura.w, "sem rolagem horizontal", `${largura.s} de ${largura.w}`);
  check((await translucidos(page)) === 0, "nada escondido depois de rolar");
  await ctx.close();
}

await browser.close();
console.log(falhas.length ? `\n=== ${falhas.length} FALHA(S) ===` : "\n=== TUDO OK ===");
process.exit(falhas.length ? 1 : 0);
