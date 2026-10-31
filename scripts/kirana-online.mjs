#!/usr/bin/env node
/**
 * Kirana online — assistente de configuração para o PC do dono (Windows).
 *
 * Não precisa instalar nada: usa só o Node que a Kirana já exige.
 *
 *   node kirana-online.mjs env     [--pasta C:\Kirana]   ajusta o .env da Kirana para o modo online
 *   node kirana-online.mjs tunel   [--pasta C:\Kirana]   escreve o config.yml do Cloudflare Tunnel
 *   node kirana-online.mjs testar  [--url https://kirana.opportunity.ia.br]   confere local e público
 *
 * Nada aqui envia dado para fora: "env" e "tunel" só escrevem arquivos no seu PC e "testar" só faz
 * pedidos de leitura. Segredos nunca são impressos por completo.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const DOMINIO = "kirana.opportunity.ia.br";
const SITE_ORIGEM = "https://daniloxpteam.github.io";
const PORTA_PADRAO = "3000";

// Só estas rotas chegam à Kirana pelo túnel; o resto responde 404 na borda.
const ROTAS_PUBLICAS = String.raw`^/(widget/kirana-v2\.js|api/copilot.*|api/status|health)$`;

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const vermelho = (t) => `\x1b[31m${t}\x1b[0m`;
const amarelo = (t) => `\x1b[33m${t}\x1b[0m`;
const ok = (t) => console.log(`${verde("OK ")} ${t}`);
const aviso = (t) => console.log(`${amarelo("!  ")} ${t}`);
const erro = (t) => console.log(`${vermelho("X  ")} ${t}`);

function argumento(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
}

// ---------------------------------------------------------------------------
// .env
// ---------------------------------------------------------------------------

/** Lê o valor ativo (não comentado) de uma chave; undefined se não existir. */
export function lerChave(linhas, chave) {
  for (const l of linhas) {
    const m = /^\s*([A-Z0-9_]+)\s*=(.*)$/.exec(l);
    if (m && m[1] === chave) return m[2].trim();
  }
  return undefined;
}

/** Define uma chave: troca a linha ativa existente ou acrescenta ao fim. Preserva o resto. */
export function definirChave(linhas, chave, valor) {
  const novo = `${chave}=${valor}`;
  const i = linhas.findIndex((l) => {
    const m = /^\s*([A-Z0-9_]+)\s*=/.exec(l);
    return m && m[1] === chave;
  });
  if (i > -1) linhas[i] = novo;
  else linhas.push(novo);
}

/** Junta origens sem duplicar (a lista é separada por vírgula). */
export function juntarOrigens(atual, nova) {
  const lista = (atual || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!lista.includes(nova)) lista.push(nova);
  return lista.join(",");
}

export function aplicarModoOnline(texto) {
  const crlf = texto.includes("\r\n");
  const linhas = texto.split(/\r?\n/);
  // remove a linha vazia final para o acréscimo ficar limpo
  while (linhas.length && linhas[linhas.length - 1].trim() === "") linhas.pop();

  const relatorio = [];
  const definir = (chave, valor, rotulo = valor) => {
    const antes = lerChave(linhas, chave);
    definirChave(linhas, chave, valor);
    relatorio.push({ chave, antes, depois: rotulo });
  };

  definir("KIRANA_ENV", "production");
  definir("KIRANA_HOST", "127.0.0.1");
  if (!lerChave(linhas, "KIRANA_PORT")) definir("KIRANA_PORT", PORTA_PADRAO);

  let tokenNovo = false;
  const tokenAtual = lerChave(linhas, "KIRANA_ACCESS_TOKEN");
  if (!tokenAtual || tokenAtual.length < 24) {
    definirChave(linhas, "KIRANA_ACCESS_TOKEN", crypto.randomBytes(32).toString("base64url"));
    tokenNovo = true;
    relatorio.push({ chave: "KIRANA_ACCESS_TOKEN", antes: tokenAtual ? "(curta demais)" : undefined, depois: "(gerada agora, 43 caracteres)" });
  } else {
    relatorio.push({ chave: "KIRANA_ACCESS_TOKEN", antes: "(já existia)", depois: "(mantida)" });
  }

  definir("KIRANA_TRUST_PROXY", "true");
  definir("KIRANA_ALLOWED_ORIGINS", juntarOrigens(lerChave(linhas, "KIRANA_ALLOWED_ORIGINS"), SITE_ORIGEM));
  definir("KIRANA_AGENT_RATE_MAX", lerChave(linhas, "KIRANA_AGENT_RATE_MAX") && lerChave(linhas, "KIRANA_AGENT_RATE_MAX") !== "0" ? lerChave(linhas, "KIRANA_AGENT_RATE_MAX") : "30");
  definir("KIRANA_BRIDGE", "off");
  definir("COPILOTKIT_TELEMETRY_DISABLED", "true");

  return { texto: linhas.join(crlf ? "\r\n" : "\n") + (crlf ? "\r\n" : "\n"), relatorio, tokenNovo };
}

function comandoEnv() {
  const pasta = path.resolve(argumento("pasta", process.cwd()));
  const arquivo = path.join(pasta, ".env");
  if (!fs.existsSync(arquivo)) {
    erro(`Não achei ${arquivo}`);
    console.log("   Rode este comando dentro da pasta da Kirana (onde está o INICIAR-TUDO.cmd) ou use --pasta.");
    process.exit(1);
  }
  const original = fs.readFileSync(arquivo, "utf8");
  if (!lerChave(original.split(/\r?\n/), "KIRANA_GATEWAY_API_KEY")) {
    aviso("KIRANA_GATEWAY_API_KEY está vazia no .env. A Kirana não falará com o Gateway até você preencher.");
  }
  const { texto, relatorio, tokenNovo } = aplicarModoOnline(original);
  const copia = `${arquivo}.antes-online-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  fs.writeFileSync(copia, original);
  fs.writeFileSync(arquivo, texto);
  ok(`Cópia de segurança: ${path.basename(copia)}`);
  for (const r of relatorio) {
    console.log(`   ${r.chave.padEnd(32)} ${r.antes === undefined ? "(novo)" : `era: ${r.antes === "" ? "(vazio)" : r.antes}`}  ->  ${r.depois}`);
  }
  ok("Gateway (KIRANA_GATEWAY_URL e KIRANA_GATEWAY_API_KEY) não foi tocado.");
  if (tokenNovo) {
    console.log();
    aviso("A chave de acesso da Kirana foi gerada e gravada no .env (KIRANA_ACCESS_TOKEN).");
    console.log("   Em modo online a tela local (http://127.0.0.1:3000) passa a pedir essa chave. Abra o .env e copie-a de lá.");
    console.log("   Não a mande para ninguém e não a coloque no GitHub.");
  }
  console.log("\nPróximo passo: PARAR-TUDO.cmd e INICIAR-TUDO.cmd (reinicia a Kirana com as novas configurações).");
}

// ---------------------------------------------------------------------------
// Túnel
// ---------------------------------------------------------------------------

export function montarConfigTunel({ idOuNome, credenciais, porta }) {
  return [
    `tunnel: ${idOuNome}`,
    `credentials-file: ${credenciais}`,
    "",
    "ingress:",
    "  # LISTA DE PERMITIDOS: só estas rotas chegam à Kirana; todo o resto responde 404 na borda.",
    `  - hostname: ${DOMINIO}`,
    `    path: ${ROTAS_PUBLICAS}`,
    `    service: http://127.0.0.1:${porta}`,
    "  - service: http_status:404",
    "",
  ].join("\n");
}

function comandoTunel() {
  const pasta = path.resolve(argumento("pasta", process.cwd()));
  const dirCf = path.join(os.homedir(), ".cloudflared");
  if (!fs.existsSync(dirCf)) {
    erro(`Não achei ${dirCf}. Rode antes:  cloudflared tunnel login  e  cloudflared tunnel create kirana`);
    process.exit(1);
  }
  const jsons = fs.readdirSync(dirCf).filter((f) => /^[0-9a-f-]{36}\.json$/i.test(f));
  if (jsons.length === 0) {
    erro("Nenhum arquivo de credenciais do túnel encontrado. Rode:  cloudflared tunnel create kirana");
    process.exit(1);
  }
  let escolhido = argumento("id", "");
  if (escolhido) escolhido = `${escolhido.replace(/\.json$/, "")}.json`;
  else if (jsons.length === 1) escolhido = jsons[0];
  else {
    erro("Há mais de um túnel; indique qual com --id <ID>. Encontrados:");
    for (const j of jsons) console.log(`   ${j.replace(/\.json$/, "")}`);
    process.exit(1);
  }
  const arquivoCred = path.join(dirCf, escolhido);
  if (!fs.existsSync(arquivoCred)) {
    erro(`Credenciais não encontradas: ${arquivoCred}`);
    process.exit(1);
  }
  let porta = PORTA_PADRAO;
  const envArq = path.join(pasta, ".env");
  if (fs.existsSync(envArq)) porta = lerChave(fs.readFileSync(envArq, "utf8").split(/\r?\n/), "KIRANA_PORT") || PORTA_PADRAO;

  const destino = path.join(dirCf, "config.yml");
  if (fs.existsSync(destino)) {
    fs.copyFileSync(destino, `${destino}.antes-${Date.now()}`);
    ok("config.yml anterior guardado como cópia.");
  }
  fs.writeFileSync(destino, montarConfigTunel({ idOuNome: escolhido.replace(/\.json$/, ""), credenciais: arquivoCred, porta }));
  ok(`Escrevi ${destino}`);
  console.log(`   túnel ${escolhido.replace(/\.json$/, "")} -> http://127.0.0.1:${porta}  (só as rotas liberadas, host ${DOMINIO})`);
  console.log("\nPróximo passo:  cloudflared tunnel run <nome-do-túnel>   (deixe a janela aberta) e depois:  node kirana-online.mjs testar");
}

// ---------------------------------------------------------------------------
// Teste
// ---------------------------------------------------------------------------

async function codigo(url, opcoes = {}) {
  try {
    const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), ...opcoes });
    return r;
  } catch (e) {
    return { status: 0, erro: e.cause?.code || e.message, json: async () => ({}) };
  }
}

async function comandoTestar() {
  const local = `http://127.0.0.1:${argumento("porta", PORTA_PADRAO)}`;
  const publica = argumento("url", `https://${DOMINIO}`).replace(/\/$/, "");
  let falhas = 0;
  const esperar = (cond, boa, ruim) => {
    if (cond) ok(boa);
    else {
      falhas += 1;
      erro(ruim);
    }
  };

  console.log("— 1. Kirana e Gateway (no seu PC)");
  const st = await codigo(`${local}/api/status`);
  esperar(st.status === 200, "Kirana responde em /api/status", `Kirana não responde em ${local} (rode INICIAR-TUDO.cmd)`);
  if (st.status === 200) {
    const j = await st.json();
    esperar(j?.gateway?.reachable === true, "Gateway alcançável", "Kirana não alcança o Gateway (ele está ligado? KIRANA_GATEWAY_URL certo?)");
    esperar(j?.gateway?.health?.authenticated !== false, "Gateway com login ativo", "Gateway sem login: abra http://127.0.0.1:1455/auth/start e entre");
  }

  console.log("\n— 2. Túnel público");
  const liberadas = ["/health", "/api/status", "/widget/kirana-v2.js"];
  for (const rota of liberadas) {
    const r = await codigo(publica + rota);
    esperar(r.status === 200, `${rota} -> 200`, `${rota} -> ${r.status}${r.erro ? ` (${r.erro})` : ""} (esperado 200)`);
  }
  const bloqueadas = ["/api/gateway/health", "/api/sessions", "/api/memory", "/api/chat", "/"];
  for (const rota of bloqueadas) {
    const r = await codigo(publica + rota);
    esperar(r.status === 404, `${rota} -> 404 (bloqueada, como deve)`, `${rota} -> ${r.status} (esperado 404: esta rota NÃO pode ficar pública)`);
  }

  console.log("\n— 3. Navegador do site (CORS)");
  const pre = await codigo(`${publica}/api/copilot`, {
    method: "OPTIONS",
    headers: { Origin: SITE_ORIGEM, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type" },
  });
  const permitida = pre.headers?.get?.("access-control-allow-origin");
  esperar(permitida === SITE_ORIGEM, `O site (${SITE_ORIGEM}) pode chamar a Kirana`, `CORS não libera o site (recebido: ${permitida ?? "nada"}); confira KIRANA_ALLOWED_ORIGINS e reinicie a Kirana`);
  const estranha = await codigo(`${publica}/api/copilot`, {
    method: "OPTIONS",
    headers: { Origin: "https://exemplo-qualquer.com", "Access-Control-Request-Method": "POST" },
  });
  const aEstranha = estranha.headers?.get?.("access-control-allow-origin");
  esperar(!aEstranha || aEstranha === "null", "Outro site qualquer NÃO é liberado", `Outro site foi liberado (${aEstranha}); não deixe KIRANA_ALLOWED_ORIGINS com *`);

  console.log();
  if (falhas === 0) ok(verde("Tudo certo. Falta só a variável KIRANA_URL no site (ver o passo a passo)."));
  else {
    erro(`${falhas} verificação(ões) falharam. Corrija e rode de novo.`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------

const AJUDA = `Uso:
  node kirana-online.mjs env    [--pasta <pasta da Kirana>]
  node kirana-online.mjs tunel  [--pasta <pasta da Kirana>] [--id <ID do túnel>]
  node kirana-online.mjs testar [--url ${`https://${DOMINIO}`}] [--porta ${PORTA_PADRAO}]
`;

const comando = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (comando === "env") comandoEnv();
  else if (comando === "tunel") comandoTunel();
  else if (comando === "testar") await comandoTestar();
  else if (comando) {
    console.log(AJUDA);
    process.exitCode = 1;
  } else console.log(AJUDA);
}
