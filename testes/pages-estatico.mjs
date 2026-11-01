/**
 * Teste da publicação ESTÁTICA (GitHub Pages) — roda contra o `out/`.
 *
 * Pré-requisito:
 *   npm run build:pages
 *   npm run serve:pages            # em uma janela (porta 4400)
 *   node testes/pages-estatico.mjs # em outra
 *
 * Depois:
 *   node testes/pages-estatico.mjs [url]
 *
 * Verifica o que importa para uma URL de avaliação:
 *  1. página carrega no basePath `/opportunity-site/`;
 *  2. todas as imagens do `public/` carregam de verdade (naturalWidth > 0);
 *  3. showcases respondem (respostas locais, sem tocar em /api/chat);
 *  4. atendente em modo guiado (sem modelo), responde local e oferece WhatsApp, sem 404;
 *  5. formulário abre o WhatsApp oficial com a mensagem preenchida;
 *  6. nenhuma requisição 404 e nenhum erro de console.
 */
import { chromium } from "playwright";

const URL_BASE = process.argv[2] || "http://127.0.0.1:4400/opportunity-site/";
// Arquivos que não existem no pacote (declarados em src/lib/media.ts). O build
// nem os requisita; se algum dia aparecerem, o teste acusa "não são mais
// necessários" em vez de falhar.
const AUSENTES_CONHECIDOS = ["rpg-comic-chronicles", "processo-inteligente-empresas", "lab-cine"];
const falhas = [];
const naoEncontrados = [];
const check = (ok, nome, detalhe = "") => {
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas.push(`${nome}${detalhe ? ` (${detalhe})` : ""}`);
};

// Servidor desligado: mensagem clara em vez de stack trace do Playwright.
try {
  await fetch(URL_BASE, { method: "HEAD" });
} catch {
  console.error(`\n[teste] não há servidor em ${URL_BASE}`);
  console.error("[teste] Abra a prévia primeiro, em outra janela:");
  console.error("        npm run preview:pages -- --no-open\n");
  process.exit(1);
}

// CHROME_PATH permite usar um Chrome já instalado (útil onde o download do Chromium é bloqueado).
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

page.on("console", (m) => {
  if (m.type() === "error") naoEncontrados.push(`console: ${m.text().slice(0, 160)}`);
});
page.on("response", (r) => {
  if (r.status() >= 400) naoEncontrados.push(`${r.status()} ${r.url().replace(URL_BASE, "/")}`);
});
page.on("pageerror", (e) => naoEncontrados.push(`pageerror: ${e.message.slice(0, 160)}`));

console.log(`\nAlvo: ${URL_BASE}\n`);

/* 1. carrega -------------------------------------------------------------- */
const resp = await page.goto(URL_BASE, { waitUntil: "networkidle" });
check(resp?.status() === 200, "página responde 200", `status ${resp?.status()}`);
const titulo = await page.title();
check(/Opportunity AI/.test(titulo), "título correto", titulo.slice(0, 60));

/* 2. imagens -------------------------------------------------------------- */
// rola a página inteira para disparar o lazy-load antes de medir
await page.evaluate(async () => {
  const passo = window.innerHeight;
  for (let y = 0; y < document.body.scrollHeight; y += passo) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(400);
// espera cada <img> carregar, com teto de tempo (nunca trava o teste)
await page.evaluate(async () => {
  const imgs = Array.from(document.images);
  imgs.forEach((i) => {
    i.loading = "eager";
  });
  await Promise.all(
    imgs.map(
      (i) =>
        new Promise((resolve) => {
          if (i.complete && i.naturalWidth > 0) return resolve();
          i.addEventListener("load", resolve, { once: true });
          i.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 3000);
        }),
    ),
  );
});
await page.waitForTimeout(300);

const imagens = await page.$$eval("img", (els) =>
  els.map((e) => ({
    src: e.getAttribute("src") || "",
    // `naturalWidth > 0` é o sinal real de "carregou"; `complete` fica false em
    // imagens lazy ainda não decodificadas e em variantes responsivas ocultas.
    carregou: e.naturalWidth > 0,
    visivel: !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length),
  })),
);
const carregadas = imagens.filter((i) => i.src && i.carregou);
const visiveis = imagens.filter((i) => i.visivel && i.src);
const quebradas = visiveis.filter((i) => !i.carregou);

check(carregadas.length >= 8 && quebradas.length === 0, "imagens da página carregadas de verdade", `${carregadas.length} de ${imagens.length} no DOM`);
check(
  quebradas.every((i) => AUSENTES_CONHECIDOS.some((n) => i.src.includes(n))),
  "nenhuma imagem visível quebrada além das ausentes conhecidas",
  quebradas.map((i) => i.src.split("/").pop()).join(", ") || "nenhuma",
);
check(
  imagens.every((i) => !i.src.startsWith("/assets")),
  "todas as imagens passam pelo basePath",
  imagens.find((i) => i.src.startsWith("/assets"))?.src || "ok",
);

/* 2b. todos os arquivos de public/ respondem 200 ------------------------- */
const manifestPath = "src/lib/assets.generated.json";
let manifestFiles = [];
try {
  manifestFiles = JSON.parse((await import("node:fs")).readFileSync(manifestPath, "utf8")).files;
} catch {
  manifestFiles = [];
}
let okAssets = 0;
const falhasAsset = [];
for (const rel of manifestFiles) {
  const r = await page.request.get(`${URL_BASE.replace(/\/$/, "")}${rel}`);
  if (r.status() === 200) okAssets += 1;
  else falhasAsset.push(`${rel} → ${r.status()}`);
}
check(falhasAsset.length === 0 && okAssets > 0, "todos os arquivos de public/ respondem 200", `${okAssets}/${manifestFiles.length}${falhasAsset.length ? ` | ${falhasAsset.join(", ")}` : ""}`);

/* 2c. CSS realmente aplicado ---------------------------------------------- */
const cssInfo = await page.evaluate(() => {
  const folhas = Array.from(document.styleSheets);
  const regras = folhas.reduce((n, f) => {
    try {
      return n + (f.cssRules ? f.cssRules.length : 0);
    } catch {
      return n;
    }
  }, 0);
  const header = document.querySelector("header") || document.body;
  const estilo = getComputedStyle(header);
  const titulo = document.querySelector("h1, h2");
  const corpo = getComputedStyle(document.body);
  return {
    folhas: folhas.length,
    regras,
    fonte: getComputedStyle(document.body).fontFamily,
    corHeader: estilo.backgroundColor,
    pesoH1: titulo ? getComputedStyle(titulo).fontWeight : "",
    corTexto: corpo.color,
    // sem CSS, o navegador cai em Times/serif e larguras padrão
    larguraContainer: getComputedStyle(document.body).margin,
  };
});
check(cssInfo.folhas > 0 && cssInfo.regras > 20, "CSS carregado", `${cssInfo.folhas} folha(s), ${cssInfo.regras} regras`);
check(/Jakarta|Sora|sans-serif/i.test(cssInfo.fonte), "tipografia do projeto aplicada", cssInfo.fonte.slice(0, 48));
check(parseInt(cssInfo.pesoH1, 10) >= 600, "títulos com peso de fonte do design", cssInfo.pesoH1);
// azul-marinho da marca (#0a1428) — sem CSS o texto ficaria preto puro
check(cssInfo.corTexto === "rgb(10, 20, 40)", "cores do design aplicadas (azul-marinho da marca)", cssInfo.corTexto);

/* 3. showcases ------------------------------------------------------------ */
const secaoDemo = page.locator("text=Kirana em Ação").first();
if (await secaoDemo.count()) await secaoDemo.scrollIntoViewIfNeeded();
const campoDemo = page.locator('input[placeholder^="Pergunte algo ao"]').first();
check((await campoDemo.count()) > 0, "showcase tem campo de pergunta");
if (await campoDemo.count()) {
  await campoDemo.fill("qual o preço?");
  await campoDemo.press("Enter");
  await page.waitForTimeout(1200);
  const respostas = await page.$$eval("p, div", (els) =>
    els.map((e) => e.textContent || "").filter((t) => /catálogo demonstrativo|Horário de funcionamento|Taxa:|Sou o /.test(t)),
  );
  check(respostas.length > 0, "showcase respondeu (resposta local, sem /api)", (respostas[0] || "").slice(0, 70));
}

/* 4. atendente guiado ----------------------------------------------------- */
// O acesso ao atendente é um botão fixo no canto inferior direito (aria-label "Abrir atendente digital do site"); antes ficava no cabeçalho
const botaoKirana = page.locator('button[aria-label^="Abrir atendente digital"]').first();
check((await botaoKirana.count()) > 0, "botão fixo do atendente presente no canto da página");
if (await botaoKirana.count()) {
  const pos = await botaoKirana.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { fixo: getComputedStyle(el).position === "fixed", direita: window.innerWidth - r.right, baixo: window.innerHeight - r.bottom };
  });
  check(pos.fixo && pos.direita < 40 && pos.baixo < 40, "botão do atendente fixo no canto inferior direito", `direita ${Math.round(pos.direita)} px, baixo ${Math.round(pos.baixo)} px`);
}
const convite = page.getByRole("button", { name: /Quero testar o atendente/i }).first();
check((await convite.count()) > 0, "seção Agente Adaptativo tem o botão 'Quero testar o atendente'");
if (await convite.count()) {
  await convite.scrollIntoViewIfNeeded();
  await convite.click();
  await page.waitForTimeout(600);
  const abriu = await page.locator('input[aria-label="Mensagem para o atendente"]').first().isVisible().catch(() => false);
  check(abriu, "o botão abre o atendente do site");
  const fecharConvite = page.locator('button[aria-label="Fechar"]').first();
  if (await fecharConvite.count()) await fecharConvite.click();
  await page.waitForTimeout(300);
}
if (await botaoKirana.count()) {
  await botaoKirana.click();
  await page.waitForTimeout(900);
  const painel = await page.textContent("body");
  check(/Atendimento guiado/.test(painel || ""), "atendente mostra 'Atendimento guiado · versão de avaliação'");
  const inputKirana = page.locator('input[aria-label="Mensagem para o atendente"]').first();
  const habilitado = (await inputKirana.count()) ? await inputKirana.isEnabled() : false;
  check(habilitado, "campo do atendente habilitado (resposta local, sem requisição)");
  if (habilitado) {
    await inputKirana.fill("Quanto custa um orçamento?");
    await inputKirana.press("Enter");
    await page.waitForTimeout(500);
    const links = await page.locator('a[href^="https://wa.me/5585999462763"]').count();
    check(links > 0, "pedido de orçamento oferece botão do WhatsApp oficial");
    const corpo = (await page.textContent("body")) || "";
    check(/sem preço fixo no site/.test(corpo), "resposta não inventa preço");
  }
  const fechar = page.locator('button[aria-label="Fechar"]').first();
  if (await fechar.count()) await fechar.click();
}

/* 4b. projetos: destaques, carrossel e sem aviso de origem das imagens -------- */
const corpoTexto = ((await page.textContent("body")) || "") + (await page.evaluate(() => Array.from(document.images).map((i) => i.alt).join(" ")));
check(!/ilustra[cç][aã]o (gerada por IA|conceitual)|gerada por IA/i.test(corpoTexto), "nenhum aviso de 'ilustração gerada por IA' no site");
const nomesDestaques = await page.locator(".mosaico h3").allTextContents();
check(nomesDestaques.join("|") === "Agente Adaptativo|Armada Nexus RPG|MordenRPG", "projetos em destaque: Agente Adaptativo, Armada Nexus RPG e MordenRPG", nomesDestaques.join(" | "));
const celula = page.locator(".mosaico-celula").nth(1);
if (await celula.count()) {
  await celula.scrollIntoViewIfNeeded();
  await celula.locator(".mosaico-peca").hover();
  await page.waitForTimeout(700);
  const brilho = await celula.evaluate((el) => getComputedStyle(el).filter);
  check(/drop-shadow/.test(brilho), "peça em destaque brilha ao passar o mouse", brilho.slice(0, 40));
}
const cartoes = await page.locator(".carrossel-card").count();
check(cartoes === 9, "catálogo em carrossel com os 9 projetos", `${cartoes} cartões`);
await page.locator("#projetos .carrossel").scrollIntoViewIfNeeded();
await page.hover("#projetos .carrossel"); // o mouse em cima pausa o giro automático
await page.locator('.carrossel-marcador[aria-label="Agente Adaptativo"]').click();
await page.waitForTimeout(500);
const primeiro = await page.locator('.carrossel-card[data-ativo="true"] h3').first().textContent();
check(primeiro === "Agente Adaptativo", "o primeiro cartão é o Agente Adaptativo (maior apelo comercial)", primeiro || "");
await page.getByRole("button", { name: "Próximo projeto" }).click();
await page.waitForTimeout(500);
const segundo = await page.locator('.carrossel-card[data-ativo="true"] h3').first().textContent();
check(segundo === "Opportunity CRM", "a seta gira o carrossel", segundo || "");
await page.locator('.carrossel-marcador[aria-label="Agente Adaptativo"]').click();
await page.waitForTimeout(500);
await page.locator('.carrossel-card[data-ativo="true"] button.btn').click();
await page.waitForTimeout(700);
check(await page.locator('input[aria-label="Mensagem para o atendente"]').first().isVisible().catch(() => false), "o cartão do Agente Adaptativo abre a Kirana para conversar");
const fecharCarrossel = page.locator('button[aria-label="Fechar"]').first();
if (await fecharCarrossel.count()) await fecharCarrossel.click();

/* 5. formulário → WhatsApp ------------------------------------------------ */
const secaoContato = page.locator("#contato").first();
if (await secaoContato.count()) await secaoContato.scrollIntoViewIfNeeded();
const nome = page.locator('input[placeholder="Ex: Carlos Mendes"]').first();
if (await nome.count()) {
  await nome.fill("Teste Avaliação");
  await page.locator('input[placeholder="carlos@empresa.com.br"]').first().fill("teste@exemplo.com");
  await page
    .locator('#contato form textarea')
    .first()
    .fill("Mensagem de teste automatizado.");
  // Sem o consentimento LGPD, o envio não pode acontecer.
  const [semConsentimento] = await Promise.all([
    page.waitForEvent("popup", { timeout: 1500 }).catch(() => null),
    page.locator('#contato button[type="submit"]').first().click(),
  ]);
  check(!semConsentimento, "formulário exige o consentimento antes de enviar");
  if (semConsentimento) await semConsentimento.close();
  await page.locator('#contato form input[type="checkbox"]').first().check();
  const [popup] = await Promise.all([
    page.waitForEvent("popup", { timeout: 5000 }).catch(() => null),
    page.locator('#contato button[type="submit"]').first().click(),
  ]);
  const destino = popup ? popup.url() : (await page.getAttribute("body", "data-x")) || "";
  const urlWa = popup ? popup.url() : "";
  // wa.me redireciona para api.whatsapp.com/send/?phone=… — as duas formas valem.
  check(
    /(wa\.me\/5585999462763)|(api\.whatsapp\.com\/send\/\?phone=5585999462763)/.test(urlWa),
    "formulário abre o WhatsApp oficial (85) 99946-2763",
    urlWa.slice(0, 80) || "popup não abriu",
  );
  if (popup) await popup.close();
  const aviso = await page.textContent("body");
  check(/versão de avaliação/i.test(aviso || ""), "aviso honesto de que o envio vai pelo WhatsApp");
}

/* 6. console/rede --------------------------------------------------------- */
check(naoEncontrados.length === 0, "nenhum 404/erro de console", naoEncontrados.slice(0, 3).join(" | ") || "limpo");

await page.screenshot({ path: "testes/evidencias/pages-estatico.png", fullPage: false }).catch(() => {});
await browser.close();

console.log(`\n=== ${falhas.length ? `${falhas.length} FALHA(S)` : "TUDO OK"} ===`);
if (falhas.length) {
  for (const f of falhas) console.log("  - " + f);
  process.exitCode = 1;
}
