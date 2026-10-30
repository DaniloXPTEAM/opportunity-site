/**
 * Capturas da entrega (desktop 1440×900 e celular 390×844).
 *
 * Gera exatamente as 20 imagens usadas no relatório, a partir da versão
 * DINÂMICA do site (http://127.0.0.1:3200). A versão estática é capturada
 * separadamente em `pages-estatico.png` pelo teste `testes/pages-estatico.mjs`.
 *
 * Uso: node testes/capturas.mjs [url] [pasta]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] || "http://127.0.0.1:3200/";
const DIR = process.argv[3] || "/home/user/entregas/capturas-reorganizacao";
mkdirSync(DIR, { recursive: true });

const b = await chromium.launch({ args: ["--no-sandbox"] });
const erros = [];

// A versão dinâmica fala com a Kirana (status + possíveis streams), então
// `waitUntil: "networkidle"` pode nunca acontecer. Esperamos o DOM e depois as
// imagens de forma determinística.
const esperaImagens = async (p) => {
  for (let i = 0; i < 40; i++) {
    const prontas = await p.evaluate(() => Array.from(document.images).every((im) => im.complete));
    if (prontas) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(400);
};

const irPara = async (p, id) => {
  await p.evaluate((s) => document.getElementById(s)?.scrollIntoView({ behavior: "instant", block: "start" }), id);
  await p.waitForTimeout(700);
  await esperaImagens(p);
};

// ---------- desktop ----------
const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
d.on("console", (m) => m.type() === "error" && erros.push("console: " + m.text().slice(0, 120)));
d.on("pageerror", (e) => erros.push("pageerror: " + String(e).slice(0, 120)));
d.on("response", (r) => r.status() >= 400 && erros.push(`http ${r.status()} ${r.url().slice(0, 90)}`));

await d.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await d.waitForTimeout(1200);
await esperaImagens(d);
await d.screenshot({ path: `${DIR}/desktop-inicio.png` });
await d.screenshot({ path: `${DIR}/desktop-pagina-completa.png`, fullPage: true });

for (const [id, nome] of [
  ["solucoes", "desktop-solucoes"],
  ["destaques", "desktop-destaques"],
  ["agente", "desktop-agente"],
  ["projetos", "desktop-projetos"],
  ["processo", "desktop-processo"],
  ["sobre", "desktop-sobre"],
  ["contato", "desktop-contato"],
]) {
  await irPara(d, id);
  await d.screenshot({ path: `${DIR}/${nome}.png` });
}

// cartão do RPG Comic Chronicles (projeto sem captura de tela): enquadramento
// próprio para mostrar a composição de identidade usada no lugar da imagem
const enquadrou = await d.evaluate(() => {
  const card = Array.from(document.querySelectorAll("#projetos article")).find((a) =>
    /rpg comic/i.test(a.textContent || ""),
  );
  if (!card) return false;
  card.scrollIntoView({ behavior: "instant", block: "center" });
  return true;
});
if (enquadrou) {
  await d.waitForTimeout(700);
  await d.screenshot({ path: `${DIR}/desktop-catalogo-sem-captura.png` });
}

// ---------- celular ----------
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
m.on("pageerror", (e) => erros.push("mobile pageerror: " + String(e).slice(0, 120)));
await m.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await m.waitForTimeout(1200);
await esperaImagens(m);
await m.screenshot({ path: `${DIR}/mobile-topo.png` });
await m.screenshot({ path: `${DIR}/mobile-pagina-completa.png`, fullPage: true });

// menu mobile aberto
await m.evaluate(() => {
  const btn = document.querySelector('header button[aria-label="Menu"]') ||
    Array.from(document.querySelectorAll("header button")).find((b) => b.querySelector("svg") && b.offsetWidth < 60);
  btn?.click();
});
await m.waitForTimeout(700);
await m.screenshot({ path: `${DIR}/mobile-menu-aberto.png` });
await m.evaluate(() => {
  const btn = document.querySelector('header button[aria-label="Menu"]');
  btn?.click();
});
await m.waitForTimeout(500);

for (const [id, nome] of [
  ["solucoes", "mobile-solucoes"],
  ["destaques", "mobile-destaques"],
  ["agente", "mobile-agente"],
  ["projetos", "mobile-projetos"],
  ["processo", "mobile-processo"],
  ["sobre", "mobile-sobre"],
  ["contato", "mobile-contato"],
]) {
  await irPara(m, id);
  await m.screenshot({ path: `${DIR}/${nome}.png` });
}

console.log(erros.length ? "ERROS:\n" + erros.slice(0, 10).join("\n") : "sem erros de console/HTTP");
await b.close().catch(() => {});
process.exit(0);
