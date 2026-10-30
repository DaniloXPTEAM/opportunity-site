#!/usr/bin/env node
/**
 * VALIDAÇÃO DA KIRANA COM O GATEWAY/MODELO REAIS — pelo caminho do site.
 *
 * Para que serve
 * --------------
 * A rodada anterior provou o caminho `navegador → site → Kirana → gateway`, mas
 * com o **gateway simulado**. Este script é o passo que falta: ele roda no
 * Windows do responsável, com o **Gateway real** ligado e a Kirana real
 * apontando para ele, e mede o caminho completo:
 *
 *   navegador → site (Next) → Kirana v0.5.3 → Gateway real → modelo real
 *            → Kirana → site (SSE) → navegador
 *
 * Ele NÃO confia em texto decorado: verifica eventos, sessão, ferramentas e o
 * evento `done`. E **reprova** se detectar assinatura de gateway simulado.
 *
 * Pré-requisitos (nesta ordem, em janelas separadas):
 *   1. Gateway real ligado (o mesmo que já atende a Kirana; não criar outro).
 *   2. Kirana real: `node src\server.js` na pasta dela, `.env` apontando para o
 *      Gateway e `KIRANA_GATEWAY_API_KEY` preenchida.
 *      Opcional e recomendável antes: `homologar.bat` do repo da Kirana —
 *      ele aprova o Gateway real por conta própria (doctor + preflight).
 *   3. Site dinâmico: `npm ci` → `npm run build` → `npx next start -p 3200`
 *      (use `node_modules\.bin\next start -p 3200`, não `npx next start`).
 *   4. `.env.local` do site com KIRANA_URL apontando para a Kirana local.
 *
 * Uso
 * ---
 *   node testes\validar-kirana-real.mjs                     # recusa a ação (padrão)
 *   node testes\validar-kirana-real.mjs --aprovar           # aprova (cria REQ real)
 *   node testes\validar-kirana-real.mjs http://127.0.0.1:3200 --out kirana-real.json
 *
 * Padrão = `Cancelar` na confirmação, para não gravar solicitação de teste no
 * ambiente do responsável. `--aprovar` executa de verdade e registra o id.
 *
 * Códigos de saída
 *   0 = caminho completo aprovado com modelo real
 *   1 = alguma verificação falhou (o resumo diz qual)
 *   2 = dependência ausente (site fora do ar, Kirana indisponível, navegador)
 *   3 = REPROVADO por assinatura de gateway simulado (não é homologação real)
 *
 * Segurança: nada de credencial é lido, impresso ou gravado. O JSON de saída
 * leva apenas nomes de evento, ids de sessão/ação truncados e tempos.
 */
import { writeFileSync, mkdirSync } from "node:fs";

// Playwright é carregado sob demanda: se não estiver instalado, as sondas de API
// ainda rodam e a mensagem diz exatamente o que falta (nada de stack trace cru).
let chromium = null;
try {
  ({ chromium } = await import("playwright"));
} catch {
  chromium = null;
}

const argv = process.argv.slice(2);
const URL_BASE = (argv.find((a) => a.startsWith("http")) || "http://127.0.0.1:3200").replace(/\/$/, "");
const APROVAR = argv.includes("--aprovar");
const idxOut = argv.indexOf("--out");
const OUT = idxOut >= 0 ? argv[idxOut + 1] : "kirana-real.json";

const MARCADORES_MOCK = [
  "resposta do gateway simulado",
  "gateway simulado",
  "mock-gateway",
  "chave inválida no gateway simulado",
];

const resultado = {
  inicio: new Date().toISOString(),
  alvo: URL_BASE,
  modoConfirmacao: APROVAR ? "aprovar (cria solicitação real)" : "cancelar (não cria solicitação)",
  etapas: [],
  veredito: "não executado",
  gateway: "desconhecido",
};
const falhas = [];
let mockDetectado = false;

const etapa = (nome, ok, detalhe = "") => {
  resultado.etapas.push({ nome, ok, detalhe });
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas.push(nome);
};

const sair = async (codigo, msg) => {
  resultado.fim = new Date().toISOString();
  resultado.veredito =
    codigo === 0
      ? "APROVADO — caminho completo com gateway real"
      : codigo === 3
        ? "REPROVADO — assinatura de gateway simulado"
        : codigo === 2
          ? "NÃO EXECUTADO — dependência externa ausente"
          : "REPROVADO — ver falhas";
  resultado.falhas = falhas;
  try {
    mkdirSync(OUT.replace(/[\\/][^\\/]+$/, "") || ".", { recursive: true });
    writeFileSync(OUT, JSON.stringify(resultado, null, 2));
    console.log(`\n  JSON (sem segredos): ${OUT}`);
  } catch {
    console.log("\n  (não foi possível gravar o JSON)");
  }
  console.log(`\n=== ${resultado.veredito} ===`);
  if (msg) console.log(msg);
  process.exit(codigo);
};

// ---------------------------------------------------------------- 0. site no ar
console.log(`\nValidação real da Kirana — alvo ${URL_BASE}\n`);

let status;
try {
  const r = await fetch(`${URL_BASE}/api/kirana/status`, { signal: AbortSignal.timeout(8000) });
  status = await r.json();
} catch {
  await sair(
    2,
    "Site dinâmico não respondeu. Suba a versão dinâmica (npm run build + next start).\n" +
      "Se estiver vendo a versão estática (GitHub Pages), ela não tem /api/kirana/*.",
  );
}
etapa("site dinâmico responde /api/kirana/status", typeof status === "object", JSON.stringify(status));
if (!status?.available) {
  await sair(
    2,
    "A Kirana está indisponível para o site. Verifique: Kirana rodando, KIRANA_URL no .env.local, Gateway ligado.",
  );
}

// ------------------------------------------------- 1. sonda direta (stream cru)
// Conversa com a rota do site (não com a Kirana) e guarda o texto cru do SSE:
// é aqui que se detecta mock e se leem `model`, `ttftMs` e os eventos.
const jar = new Map();
const cookieHeader = () => Array.from(jar, ([k, v]) => `${k}=${v}`).join("; ");
const guardarCookies = (r) => {
  for (const c of r.headers.getSetCookie?.() || []) {
    const [par] = c.split(";");
    const i = par.indexOf("=");
    if (i > 0) jar.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
  }
};

const perguntar = async (mensagem, section = "contato") => {
  const r = await fetch(`${URL_BASE}/api/kirana/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(jar.size ? { Cookie: cookieHeader() } : {}) },
    body: JSON.stringify({ message: mensagem, section }),
    signal: AbortSignal.timeout(180000),
  });
  guardarCookies(r);
  const cru = await r.text();
  return { status: r.status, cru };
};

const eventosDe = (cru) =>
  cru
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => {
      try {
        return JSON.parse(l.slice(5).trim());
      } catch {
        return null;
      }
    })
    .filter(Boolean);

const textoDe = (cru) =>
  eventosDe(cru)
    .filter((e) => e.type === "delta" && typeof e.text === "string")
    .map((e) => e.text)
    .join("");

const checarMock = (cru, ondem) => {
  // Confere o corpo cru E o texto remontado: a assinatura pode chegar partida
  // entre dois deltas do streaming, e aí não existiria no corpo cru.
  const baixo = (cru + "\n" + textoDe(cru)).toLowerCase();
  const achado = MARCADORES_MOCK.find((m) => baixo.includes(m));
  if (achado) {
    mockDetectado = true;
    etapa(`gateway real (${ondem})`, false, `assinatura de SIMULADO encontrada: "${achado}"`);
  }
  return !!achado;
};

const t0 = Date.now();
const p1 = await perguntar("Olá! Quais soluções da Opportunity AI servem para uma padaria pequena?");
const ev1 = eventosDe(p1.cru);
const s1 = ev1.find((e) => e.type === "session")?.sessionId || null;
const done1 = ev1.find((e) => e.type === "done");
const txt1 = textoDe(p1.cru);

etapa("1ª mensagem: HTTP 200 no stream", p1.status === 200, `HTTP ${p1.status}`);
etapa("1ª mensagem: sessão emitida pela Kirana", !!s1, s1 ? `sessionId ${s1.slice(0, 12)}…` : "sem session");
etapa("1ª mensagem: resposta com conteúdo", txt1.trim().length > 40, `${txt1.trim().length} caracteres`);
if (done1) {
  resultado.gateway = done1.model ? `modelo declarado: ${done1.model}` : "modelo não declarado";
  etapa(
    "1ª mensagem: evento done com métricas",
    true,
    `model=${done1.model ?? "—"} ttft=${done1.ttftMs ?? "—"}ms total=${done1.totalMs ?? "—"}ms`,
  );
}
checarMock(p1.cru, "1ª mensagem");
const amostra = txt1.replace(/\s+/g, " ").slice(0, 160);
console.log(`       └─ trecho da resposta: "${amostra}${txt1.length > 160 ? "…" : ""}"`);
resultado.resposta1 = { caracteres: txt1.length, amostra, sessao: s1 ? `${s1.slice(0, 12)}…` : null };

// ------------------------------------------------ 2. contexto (mesma sessão)
const p2 = await perguntar(
  "Voltando ao que falamos: daquelas soluções, qual você indicaria primeiro para quem vende pão e não tem sistema?",
);
const ev2 = eventosDe(p2.cru);
const s2 = ev2.find((e) => e.type === "session")?.sessionId || null;
const txt2 = textoDe(p2.cru);
etapa("2ª mensagem: resposta chegou", txt2.trim().length > 40, `${txt2.trim().length} caracteres`);
etapa(
  "2ª mensagem: mesma sessão (sem reiniciar conversa)",
  !s2 && !!jar.get("kirana_sid"),
  s2 ? `nova sessão emitida: ${s2.slice(0, 12)}…` : "nenhuma sessão nova; cookie mantido",
);
etapa(
  "2ª mensagem: coerente com a 1ª (cita o contexto)",
  /p(ã|a)o|padaria|venda|padeir|com(é|e)rcio|atendimento/i.test(txt2),
  txt2.replace(/\s+/g, " ").slice(0, 120),
);
checarMock(p2.cru, "2ª mensagem");
resultado.resposta2 = { caracteres: txt2.length, amostra: txt2.replace(/\s+/g, " ").slice(0, 160) };

// ------------------------------------- 3. ação sensível → evento de confirmação
const p3 = await perguntar("Quero contratar um agente de atendimento para a minha padaria.", "contato");
const ferramentas3 = eventosDe(p3.cru)
  .filter((e) => e.type === "tool_start" || e.type === "tool")
  .map((e) => e.name)
  .filter(Boolean);
checarMock(p3.cru, "pedido de contratação");
etapa(
  "pedido de contratação: ferramenta de solicitação acionada",
  ferramentas3.some((n) => /service_request|start_service/i.test(n)) || /solicita|pedido|contato/i.test(textoDe(p3.cru)),
  ferramentas3.join(", ") || "sem tool_start (pode estar no texto)",
);

const p4 = await perguntar("Pode enviar o pedido de contato agora.", "contato");
const ev4 = eventosDe(p4.cru);
const confirmacao = ev4.find((e) => e.type === "confirmation")?.action || null;
checarMock(p4.cru, "confirmação");
etapa(
  "confirmação: a Kirana pediu autorização antes de executar",
  !!confirmacao,
  confirmacao ? `${confirmacao.tool} · ${String(confirmacao.summary || "").slice(0, 70)}` : "nenhum evento confirmation",
);
resultado.confirmacao = confirmacao
  ? { acao: `${String(confirmacao.id).slice(0, 12)}…`, ferramenta: confirmacao.tool, expira: confirmacao.expiresAt }
  : null;

if (mockDetectado) {
  await sair(
    3,
    "O gateway em uso respondeu como SIMULADO. Isto NÃO é homologação real:\n" +
      "  · confira se o site aponta para a Kirana certa (KIRANA_URL no .env.local);\n" +
      "  · confira se a Kirana aponta para o Gateway real (KIRANA_GATEWAY_URL/KIRANA_GATEWAY_API_KEY no .env dela);\n" +
      "  · rode antes o `homologar.bat` do repositório da Kirana para aprovar o Gateway real.",
  );
}

// ------------------------------------------- 4. a mesma coisa pelo navegador
if (!chromium) {
  await sair(2, "Playwright não está instalado neste projeto. Rode: npm ci  e depois  npx playwright install chromium");
}

let browser;
try {
  browser = await chromium.launch();
} catch {
  await sair(2, "Playwright não conseguiu abrir o navegador. Rode: npx playwright install chromium");
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  page.on("pageerror", (e) => erros.push(String(e).slice(0, 120)));
  page.on("console", (m) => m.type() === "error" && erros.push(m.text().slice(0, 120)));

  await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);

  await page.getByRole("button", { name: /Atendente digital/i }).first().click();
  const painel = page.locator("div.fixed.rounded-3xl").first();
  await painel.waitFor({ state: "visible", timeout: 15000 });
  const campo = painel.locator("input[type=text]").first();
  const enviar = painel.locator('button[aria-label="Enviar mensagem"]').first();
  etapa("navegador: painel do atendente abriu com campo habilitado", await campo.isEnabled());

  const digitar = async (texto) => {
    await campo.click();
    await campo.fill("");
    await campo.pressSequentially(texto, { delay: 8 });
    for (let i = 0; i < 40; i++) {
      if (await enviar.isEnabled()) break;
      await page.waitForTimeout(100);
    }
    await enviar.click();
  };

  const antes = (await painel.innerText()).length;
  const tNavegador = Date.now();
  await digitar("Me diga em duas frases o que a Opportunity AI faz e para quem.");
  // espera o texto crescer e a digitação parar
  let estavel = 0;
  let anterior = -1;
  for (let i = 0; i < 200 && estavel < 6; i++) {
    await page.waitForTimeout(300);
    const n = (await painel.innerText()).length;
    estavel = n === anterior ? estavel + 1 : 0;
    anterior = n;
  }
  const textoNavegador = await painel.innerText();
  const resposta = textoNavegador.slice(antes);
  etapa(
    "navegador: resposta do modelo apareceu na tela",
    resposta.length > 80,
    `${resposta.length} caracteres em ${Date.now() - tNavegador}ms`,
  );
  if (checarMock(resposta, "resposta no navegador")) {
    await sair(3, "A resposta exibida no navegador tem assinatura de gateway simulado.");
  }
  console.log(`       └─ trecho: "${resposta.replace(/\s+/g, " ").slice(0, 160)}…"`);
  resultado.navegador = { caracteres: resposta.length, ms: Date.now() - tNavegador };

  // confirmação pela interface (botões reais)
  const temBotoes = await painel.getByRole("button", { name: /^(Confirmar|Cancelar)$/ }).count();
  if (temBotoes >= 2) {
    const rotulo = APROVAR ? "Confirmar" : "Cancelar";
    await painel.getByRole("button", { name: rotulo, exact: true }).first().click();
    await page.waitForTimeout(4000);
    const depois = await painel.innerText();
    etapa(
      `navegador: ação ${APROVAR ? "aprovada" : "cancelada"} pela interface, sem erro`,
      !/erro|falha|não foi possível/i.test(depois.slice(-400)),
      APROVAR ? "solicitação criada de verdade" : "nenhuma solicitação criada",
    );
    resultado.confirmacaoInterface = rotulo;
  } else {
    etapa("navegador: bloco de confirmação apareceu na conversa", false, "botões Confirmar/Cancelar ausentes");
  }

  etapa("navegador: console sem erros", erros.length === 0, erros.slice(0, 2).join(" | ") || "nenhum");

  const cookies = await page.context().cookies(URL_BASE);
  const sid = cookies.find((c) => c.name === "kirana_sid");
  etapa("navegador: sessão em cookie httpOnly", !!sid?.httpOnly, sid ? "kirana_sid httpOnly" : "ausente");
  const html = await page.content();
  etapa(
    "navegador: nenhuma credencial/endereço interno no HTML",
    !/KIRANA_TOKEN|KIRANA_GATEWAY|api[_-]?key|127\.0\.0\.1:1455|localhost:1455/i.test(html),
  );
  resultado.duracaoTotalMs = Date.now() - t0;
  await browser.close();
} catch (e) {
  await browser?.close().catch(() => {});
  await sair(1, `Falha durante a validação no navegador: ${e.message}`);
}

if (falhas.length) await sair(1, "Corrija as etapas marcadas como FALHA e rode de novo.");
await sair(0, "Caminho completo aprovado com Gateway/modelo reais. Anexe o JSON ao relatório.");
