/**
 * Verificação de usabilidade da reorganização (desktop / tablet / celular).
 *
 * Confere o que o briefing exige antes de entregar:
 *   1. navegação do cabeçalho chega a todas as seções;
 *   2. Projetos em Destaque abre o modal e volta;
 *   3. catálogo: 9 projetos, agrupados, com estado;
 *   4. contato: formulário gera link do WhatsApp oficial;
 *   5. nenhum 404, nenhum erro de console;
 *   6. nenhum elemento cobrindo texto (botão flutuante eliminado);
 *   7. layout sem rolagem horizontal em 390px.
 */
import { chromium } from "playwright";

const URL = process.argv[2] || "http://127.0.0.1:4400/opportunity-site/";
const b = await chromium.launch();
let falhas = 0;
const ok = (cond, nome, detalhe = "") => {
  console.log(`  ${cond ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!cond) falhas++;
};

for (const vp of [
  { w: 1440, h: 900, n: "desktop" },
  { w: 768, h: 1024, n: "tablet" },
  { w: 390, h: 844, n: "mobile" },
]) {
  console.log(`\n[${vp.n} ${vp.w}×${vp.h}]`);
  const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
  const errosConsole = [];
  const http404 = [];
  p.on("console", (m) => m.type() === "error" && errosConsole.push(m.text()));
  p.on("response", (r) => r.status() >= 400 && http404.push(`${r.status()} ${r.url()}`));
  p.on("pageerror", (e) => errosConsole.push(String(e)));
  const apiContato = []; // versão dinâmica: o envio vai para /api/contact
  p.on("response", (r) => r.url().includes("/api/contact") && apiContato.push(r.status()));

  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);

  // 1. seções existem e o menu tem 6 itens
  const secoes = await p.$$eval("main section[id]", (els) => els.map((e) => e.id));
  ok(
    ["inicio", "solucoes", "destaques", "agente", "projetos", "processo", "sobre", "contato"].every((s) =>
      secoes.includes(s),
    ),
    "todas as 8 seções presentes na ordem nova",
    secoes.join(" → "),
  );

  // 2. navegação do cabeçalho (desktop/tablet) e menu mobile
  const irPara = async (id) => {
    if (vp.w < 1024) {
      // O hambúrguer informa o estado (aria-expanded): abre só se estiver fechado,
      // porque clicar com o menu aberto o fecha.
      const hamburguer = p.locator('button[aria-label="Menu"]');
      const aberto = (await hamburguer.getAttribute("aria-expanded")) === "true";
      if (!aberto) {
        await hamburguer.click();
        await p.waitForTimeout(350);
      }
      // `exact: true` evita casar "Sobre" com "Fale sobre seu projeto"
      await p.getByRole("button", { name: rotulo[id], exact: true }).last().click();
    } else {
      await p.locator("header nav").getByRole("button", { name: rotulo[id], exact: true }).click();
    }
    // espera a rolagem suave parar de verdade: 3 amostras iguais seguidas
    // (a rolagem suave do navegador tem quadros com o mesmo Y no meio).
    await p.evaluate(async () => {
      let iguais = 0;
      let anterior = -1;
      for (let i = 0; i < 60 && iguais < 3; i++) {
        await new Promise((r) => setTimeout(r, 100));
        const y = Math.round(window.scrollY);
        iguais = y === anterior ? iguais + 1 : 0;
        anterior = y;
      }
    });
    const y = await p.evaluate((sec) => {
      const el = document.getElementById(sec);
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    }, id);
    return y;
  };
  const rotulo = {
    solucoes: "Soluções",
    destaques: "Projetos",
    agente: "Agente Adaptativo",
    sobre: "Sobre",
    contato: "Contato",
  };
  let navegou = true;
  const detalhes = [];
  for (const id of ["solucoes", "destaques", "agente", "sobre", "contato"]) {
    const topo = await irPara(id);
    detalhes.push(`${rotulo[id]}→${topo}px`);
    // tolera a faixa do cabeçalho fixo (~92px de scroll-margin)
    if (topo === null || topo > 140 || topo < -40) navegou = false;
  }
  ok(navegou, "menu leva a cada seção", detalhes.join(" · "));

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);

  // 3. Projetos em Destaque (componente aprovado): abre modal e fecha
  await p.evaluate(() => document.getElementById("destaques").scrollIntoView());
  await p.waitForTimeout(600);
  const abriu = await p.evaluate(async () => {
    const painel = document.querySelector("#destaques .cursor-pointer");
    if (!painel) return false;
    painel.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 700));
    return !!document.querySelector(".fixed.inset-0.z-50");
  });
  ok(abriu, "Projetos em Destaque abre o detalhe ao clicar");
  if (abriu) {
    await p.keyboard.press("Escape").catch(() => {});
    await p.evaluate(() => {
      const fechar = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim() === "Fechar");
      fechar?.click();
    });
    await p.waitForTimeout(400);
    const fechou = await p.evaluate(() => !document.querySelector(".fixed.inset-0.z-50"));
    ok(fechou, "detalhe fecha e volta ao catálogo");
  }

  // 4. catálogo: 9 projetos e grupos
  const catalogo = await p.evaluate(() => {
    const sec = document.getElementById("projetos");
    if (!sec) return null;
    const cards = sec.querySelectorAll("article");
    const grupos = Array.from(sec.querySelectorAll("h3")).map((h) => h.textContent?.trim());
    const estados = Array.from(sec.querySelectorAll("article span")).map((s) => s.textContent?.trim());
    return {
      cards: cards.length,
      grupos,
      comEstado: estados.filter((e) => ["Conceito", "Em desenvolvimento", "Demonstração", "Disponível"].includes(e))
        .length,
    };
  });
  ok(catalogo?.cards === 9, "catálogo com os 9 projetos preservados", `${catalogo?.cards} cartões`);
  ok((catalogo?.grupos?.length || 0) >= 5, "catálogo agrupado por natureza", catalogo?.grupos?.join(" / "));
  ok((catalogo?.comEstado || 0) >= 9, "todo cartão mostra o estado real", `${catalogo?.comEstado} marcadores`);

  // 4b. RPG Comic Chronicles: sem texto de bastidor na interface pública,
  //     no lugar da captura ausente aparece a composição de identidade do projeto
  const rpg = await p.evaluate(() => {
    const sec = document.getElementById("projetos");
    const texto = (sec?.innerText || "").toLowerCase();
    const card = Array.from(sec?.querySelectorAll("article") || []).find((a) =>
      /rpg comic/i.test(a.textContent || ""),
    );
    return {
      textoBastidor: texto.includes("captura em produção") || texto.includes("captura em producao"),
      cardExiste: !!card,
      cardTexto: (card?.innerText || "").toLowerCase(),
      temaComposicao: !!card?.querySelector(".font-mono.uppercase"),
    };
  });
  ok(!rpg.textoBastidor, "nenhum cartão exibe 'captura em produção'");
  ok(rpg.cardExiste, "cartão do RPG Comic Chronicles presente");
  ok(
    rpg.cardExiste && !rpg.cardTexto.includes("captura"),
    "cartão sem captura não promete imagem que não existe",
  );
  ok(rpg.temaComposicao, "cartão sem captura usa composição de identidade do projeto");

  // 4c. Sobre: identificação do fundador exatamente como no site oficial,
  //     sem imagem/avatar e sem mencionar foto ausente
  const sobre = await p.evaluate(() => {
    const sec = document.getElementById("sobre");
    const texto = sec?.innerText || "";
    const temImagem = !!sec?.querySelector("img, svg[role=img], [style*='background-image']");
    return {
      cargo: /Fundador e CEO/.test(texto),
      nome: /Danilo de Vasconcelos Silva/.test(texto),
      semFoto: !/foto|avatar|imagem do fundador/i.test(texto),
      temImagem,
    };
  });
  ok(sobre.cargo && sobre.nome, "Sobre com 'Danilo de Vasconcelos Silva — Fundador e CEO'");
  ok(sobre.semFoto, "Sobre não menciona foto/avatar ausente");
  ok(!sobre.temImagem, "Sobre sem imagem do fundador (só conteúdo textual na identificação)");

  // 5. contato: link do WhatsApp é gerado com a mensagem
  await p.evaluate(() => document.getElementById("contato").scrollIntoView());
  await p.waitForTimeout(500);
  const zap = await p.evaluate(() => {
    const sec = document.getElementById("contato");
    const campos = sec.querySelectorAll("input, textarea");
    const set = (el, v) => {
      const setter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const [nome, email, whats] = campos;
    set(nome, "Teste Verificação");
    set(email, "teste@exemplo.com");
    set(whats, "85999999999");
    const ta = sec.querySelector("textarea");
    set(ta, "Preciso organizar o atendimento do WhatsApp da minha loja.");
    const linkDireto = sec.querySelector('a[href*="5585999462763"]')?.href || null;
    const btn = sec.querySelector('form button[type="submit"]') ||
      Array.from(sec.querySelectorAll("button")).find((b) => /whats|enviar|continuar/i.test(b.textContent || ""));
    if (!btn) return { erro: "botão do WhatsApp não encontrado" };
    let aberto = null;
    const original = window.open;
    window.open = (url) => {
      aberto = url;
      return null;
    };
    btn.click();
    window.open = original;
    return { aberto, linkDireto };
  });
  // O número oficial tem de funcionar nas duas versões: no estático o envio do
  // formulário abre o WhatsApp; no dinâmico o lead vai para /api/contact e o
  // WhatsApp fica como canal direto (sempre presente na seção).
  await p.waitForTimeout(900);
  const zapOficial =
    (typeof zap?.aberto === "string" && zap.aberto.includes("5585999462763")) ||
    (typeof zap?.linkDireto === "string" && zap.linkDireto.includes("5585999462763"));
  ok(
    zapOficial,
    "contato expõe o WhatsApp oficial (85) 99946-2763",
    zap?.aberto
      ? decodeURIComponent(zap.aberto).slice(0, 78)
      : zap?.linkDireto
        ? decodeURIComponent(zap.linkDireto).slice(0, 78)
        : zap?.erro || "-",
  );
  ok(
    zap?.aberto ? true : apiContato.length > 0 && apiContato.every((st) => st < 400),
    "envio do formulário respondeu sem erro",
    zap?.aberto ? "abriu WhatsApp com a mensagem" : `POST /api/contact → ${apiContato.join(", ") || "sem resposta"}`,
  );

  // 6. nada cobrindo texto (sem botão flutuante)
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const flutuante = await p.evaluate(() => {
    const fixos = Array.from(document.querySelectorAll("*")).filter((el) => {
      const st = getComputedStyle(el);
      return (
        (st.position === "fixed" || st.position === "sticky") &&
        el.tagName === "BUTTON" &&
        el.getBoundingClientRect().top > window.innerHeight * 0.6
      );
    });
    return fixos.map((el) => el.getAttribute("aria-label") || el.textContent?.slice(0, 30));
  });
  ok(flutuante.length === 0, "sem botão flutuante sobre o conteúdo", flutuante.join(", ") || "nenhum");

  // 7. sem rolagem horizontal
  const overflow = await p.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  ok(overflow.scroll <= overflow.client + 2, "sem rolagem horizontal", `${overflow.scroll} / ${overflow.client}px`);

  // 8. limpeza técnica
  ok(http404.length === 0, "nenhum recurso 404", http404.slice(0, 3).join(", ") || "nenhum");
  ok(errosConsole.length === 0, "console limpo", errosConsole.slice(0, 3).join(" | ") || "nenhum");

  await p.close();
}

await b.close();
console.log(falhas ? `\n=== ${falhas} FALHA(S) ===\n` : "\n=== TUDO OK ===\n");
process.exit(falhas ? 1 : 0);
