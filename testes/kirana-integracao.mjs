/**
 * Integração real: navegador → site → Kirana → gateway → Kirana → navegador.
 *
 * Diferente de `testes/integracao.mjs` (que usa mocks de rota no navegador),
 * este teste abre a interface de verdade e conversa com o backend da Kirana
 * através das rotas `/api/kirana/*` do site.
 *
 * O teste NÃO decide se o gateway é real ou simulado: ele apenas detecta e
 * informa. A resposta do gateway simulado contém "(Resposta do gateway
 * simulado…)", então o relatório sai honesto nos dois casos.
 *
 * Pré-requisitos:
 *   - versão dinâmica no ar:        npm run build && npm run start -- -p 3200
 *   - backend da Kirana no ar:      node src/server.js          (repo Kirana)
 *   - gateway no ar:                o real (porta 1455) ou `npm run mock`
 *   - site apontando para a Kirana: KIRANA_URL=http://127.0.0.1:3000 em .env.local
 *
 * Uso:
 *   node testes/kirana-integracao.mjs [url-do-site]
 *   node testes/kirana-integracao.mjs http://127.0.0.1:3200
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://127.0.0.1:3200").replace(/\/$/, "");
let falhas = 0;
let mockDetectado = false;
const check = (cond, nome, detalhe = "") => {
  console.log(`  ${cond ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!cond) falhas++;
};

/* 0. pré-requisitos ------------------------------------------------------- */
console.log(`\nAlvo: ${BASE}\n`);

let status = null;
try {
  const r = await fetch(`${BASE}/api/kirana/status`);
  status = await r.json();
} catch {
  console.error(`[teste] não há site em ${BASE} — abra a versão dinâmica primeiro.`);
  process.exit(1);
}

console.log(`  · /api/kirana/status → ${JSON.stringify(status)}`);
if (!status?.available) {
  console.log("\n  A Kirana não está disponível para o site.");
  console.log("  Suba o backend (repo Kirana): node src/server.js");
  console.log("  e o gateway: npm run mock   (ou o gateway real na porta 1455)");
  console.log("\n=== INTEGRAÇÃO NÃO EXECUTADA (dependência externa) ===\n");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errosConsole = [];
const http404 = [];
page.on("console", (m) => m.type() === "error" && errosConsole.push(m.text()));
page.on("pageerror", (e) => errosConsole.push(String(e)));
page.on("response", (r) => r.status() >= 400 && httpUrls(r));

function httpUrls(r) {
  const u = r.url();
  if (u.includes("/api/kirana/")) return; // erros de API são testados à parte
  http404.push(`${r.status()} ${u}`);
}

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

/* 1. o botão do cabeçalho abre a Kirana real, não a demonstração ---------- */
const botao = page.getByRole("button", { name: "Abrir atendente digital" }).first();
check((await botao.count()) > 0, "botão 'Atendente digital' presente no cabeçalho");
await botao.click();
await page.waitForTimeout(1200);

const painelEl = page.locator("div.fixed.rounded-3xl").first();
const painel = await page.evaluate(() => {
  const dialogo = document.querySelector("div.fixed.rounded-3xl");
  const campo = dialogo ? dialogo.querySelector("input[type=text]") : null;
  return {
    aberto: !!dialogo,
    temCampo: !!campo,
    campoDesabilitado: campo ? campo.disabled : null,
    secoesVisiveis: Array.from(document.querySelectorAll("section[id]"))
      .filter((s) => s.getBoundingClientRect().top < 300 && s.getBoundingClientRect().bottom > 0)
      .map((s) => s.id),
    status: (document.querySelector("[class*=kirana], [aria-label=Fechar]") ? "ok" : "-"),
  };
});
check(painel.aberto, "painel do atendente abriu");
check(painel.temCampo && painel.campoDesabilitado === false, "campo de mensagem habilitado (atendimento real)");

/* 2. enviar mensagem e receber resposta real ------------------------------ */
const campo = painelEl.locator("input[type=text]").first();
const botaoEnviar = painelEl.locator('button[aria-label="Enviar mensagem"]').first();
// digita de verdade (o campo é controlado por React; `fill` sozinho não habilita o botão)
const digitar = async (texto) => {
  await campo.click();
  await campo.fill("");
  await campo.pressSequentially(texto, { delay: 12 });
  await botaoEnviar.waitFor({ state: "visible" });
  for (let i = 0; i < 40; i++) {
    if (await botaoEnviar.isEnabled()) break;
    await page.waitForTimeout(100);
  }
  await botaoEnviar.click();
};

await digitar("Olá, vocês atendem padarias pequenas?");

// espera a resposta chegar (streaming) e o indicador de digitação sair
await page.waitForFunction(
  () => {
    const corpo = document.body.innerText;
    return /gateway simulado|Recebi sua mensagem|sou a Kirana|Kirana/i.test(corpo) &&
      !/pensando|digitando|\.\.\./i.test(corpo.slice(-40));
  },
  null,
  { timeout: 60000 },
).catch(() => {});
await page.waitForTimeout(1500);

const conversa = await painelEl.innerText();
check(/Olá, vocês atendem padarias pequenas\?/.test(conversa), "mensagem do visitante aparece na conversa");
const resposta = conversa.replace(/Olá, vocês atendem padarias pequenas\?/, "").trim();
check(resposta.length > 40, "resposta da Kirana chegou à interface", `${resposta.slice(0, 90).replace(/\n/g, " ")}…`);
mockDetectado = /gateway simulado/i.test(conversa);

/* 3. contexto: segunda mensagem na mesma conversa ------------------------ */
await digitar("E como funciona o atendimento no WhatsApp?");
await page.waitForTimeout(8000);
const conversa2 = await painelEl.innerText();
const turnos = (conversa2.match(/E como funciona o atendimento no WhatsApp\?/g) || []).length;
check(turnos >= 1, "segunda mensagem entrou na mesma conversa (contexto preservado)");
const cresceu = conversa2.length > conversa.length + 40;
check(cresceu, "resposta da segunda mensagem também chegou", `${conversa.length} → ${conversa2.length} caracteres`);

/* 4. cookie de sessão não é acessível pelo JavaScript --------------------- */
const cookies = await page.context().cookies(BASE);
const sid = cookies.find((c) => c.name === "kirana_sid");
check(!!sid, "sessão da Kirana mantida em cookie");
check(sid ? sid.httpOnly === true : false, "cookie de sessão é httpOnly (não legível pelo navegador)");
const legivelNoJs = await page.evaluate(() => document.cookie.includes("kirana_sid"));
check(!legivelNoJs, "document.cookie não expõe o id de sessão");

/* 5. nenhuma credencial no HTML/bundle ----------------------------------- */
const vazamento = await page.evaluate(async () => {
  const respostas = await Promise.all(
    Array.from(document.querySelectorAll("script[src]"))
      .slice(0, 12)
      .map((s) => fetch(s.src).then((r) => r.text()).catch(() => "")),
  );
  const html = document.documentElement.outerHTML;
  const tudo = html + respostas.join("\n");
  return {
    chave: /KIRANA_GATEWAY_API_KEY|sk-[A-Za-z0-9]{10,}|local-mock/i.test(tudo),
    enderecoInterno: /127\.0\.0\.1:1455|127\.0\.0\.1:3000/.test(tudo),
  };
});
check(!vazamento.chave, "nenhuma chave/token no HTML ou no JavaScript público");
check(!vazamento.enderecoInterno, "nenhum endereço interno da Kirana/gateway exposto ao navegador");

/* 6. console e recursos -------------------------------------------------- */
check(http404.length === 0, "nenhum recurso 404 durante a conversa", http404.slice(0, 2).join(", ") || "nenhum");
check(errosConsole.length === 0, "console sem erros", errosConsole.slice(0, 2).join(" | ") || "nenhum");

/* 7. tratamento de indisponibilidade (só informativo aqui) --------------- */
const statusFinal = await (await fetch(`${BASE}/api/kirana/status`)).json();

await browser.close();

console.log("\n  Resumo da integração:");
console.log(`   · gateway: ${mockDetectado ? "SIMULADO (mock-gateway.js) — não é prova de modelo real" : "resposta sem marca de mock (verificar se é o gateway real)"}`);
console.log(`   · disponibilidade reportada: ${JSON.stringify(statusFinal)}`);
console.log(falhas ? `\n=== ${falhas} FALHA(S) ===` : "\n=== INTEGRAÇÃO OK ===");
console.log(
  mockDetectado
    ? "\n  ATENÇÃO: caminho completo validado (navegador → site → Kirana → gateway),\n  porém com gateway SIMULADO. A validação com o gateway/modelo real precisa ser\n  feita no Windows, com o gateway ligado — ver docs/INTEGRACAO-KIRANA-REAL.md.\n"
    : "",
);
process.exit(falhas ? 1 : 0);
