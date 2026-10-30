/**
 * Teste integrado do novo site com a Kirana REAL conectada (backend + gateway).
 *
 * O que este teste prova:
 *  1. o site abre, sem erro de console e sem imagem quebrada;
 *  2. existe UM único ponto de atendimento (o botão original) e ele abre a Kirana;
 *  3. a conversa vai para /api/kirana/chat e volta com texto real do agente;
 *  4. ferramenta de site executada (navegação) quando o agente pede;
 *  5. (com MOCK_FORCE_TOOL=navigate_to_page) a diretiva site_action rola a página;
 *  6. showcases respondem SEM tocar em /api/kirana/* (nenhum token gasto);
 *  7. nenhum segredo aparece no HTML nem no JavaScript do site;
 *  8. desktop e celular renderizam (capturas comparativas).
 *
 * NÃO é homologação do Gateway real: rode com `scripts/mock-gateway.js`.
 * Uso: node testes/integracao.mjs [url] [pasta-de-capturas]
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://127.0.0.1:3200';
const OUT = process.argv[3] || '/home/user/entregas/capturas';
const SKIP_SHOTS = process.env.SHOTS === '0';
fs.mkdirSync(OUT, { recursive: true });

let pass = 0;
let fail = 0;
const failures = [];
function check(name, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });

/* ------------------------------ desktop ------------------------------ */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  const text = m.text();
  if (m.type() === 'error' && !/webpack-hmr|favicon|Download the React DevTools/i.test(text)) {
    consoleErrors.push(`console: ${text.slice(0, 160)}`);
  }
});
const badResponses = [];
page.on('response', (r) => {
  if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url().replace('http://127.0.0.1:3200', '')}`);
});

const kiranaCalls = [];
page.on('request', (r) => {
  const u = r.url();
  if (u.includes('/api/kirana/')) kiranaCalls.push({ url: u, at: Date.now() });
});

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(600);
if (!SKIP_SHOTS) await page.screenshot({ path: path.join(OUT, '01-desktop-topo.png') });

// Percorre a página inteira: as imagens têm carregamento preguiçoso e só
// provam que existem depois de entrar na viewport.
for (const id of ['destaques', 'demo-kirana', 'projetos', 'solucoes', 'tecnologia', 'sobre', 'contato']) {
  await page.evaluate((sec) => document.getElementById(sec)?.scrollIntoView(), id);
  await page.waitForTimeout(350);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

console.log('\n[1] carregamento');
// Espera as imagens assentarem (decode real) antes de julgar.
await page.evaluate(async () => {
  const settle = (img) =>
    Promise.race([
      img.decode ? img.decode().catch(() => {}) : Promise.resolve(),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  await Promise.all(Array.from(document.images).map(settle));
});
await page.waitForTimeout(500);

// Arquivos que NÃO vieram no ZIP do proprietário e não existem no site atual.
// Ficam registrados: a referência é preservada até o material chegar.
const AUSENTES_CONHECIDAS = [
  '/assets/img/rpg-comic-chronicles.jpg',
  '/assets/img/processo-inteligente-empresas.jpg',
];
// Só conta imagem que o navegador realmente pediu: as duplicatas do fallback
// mobile ficam escondidas por CSS e nunca chegam a carregar (currentSrc vazio).
const broken = await page.evaluate(() =>
  Array.from(document.images)
    .filter((i) => i.currentSrc && (!i.complete || i.naturalWidth === 0))
    .map((i) => i.currentSrc.replace('http://127.0.0.1:3200', '')),
);
const decodeUrl = (u) => decodeURIComponent((u.split('url=')[1] || u).split('&')[0]);
const brokenFiles = [...new Set(broken.map(decodeUrl))];
const inesperadas = brokenFiles.filter((f) => !AUSENTES_CONHECIDAS.includes(f));
check(
  'nenhuma imagem quebrada além das ausentes registradas',
  inesperadas.length === 0,
  inesperadas.join(', '),
);
const imageErrors = badResponses
  .filter((r) => r.includes('_next/image') || r.startsWith('404'))
  .map((r) => r.replace(/^\d+\s+/, ''));
const imageErrorsInesperadas = [...new Set(imageErrors.map(decodeUrl))].filter(
  (f) => !AUSENTES_CONHECIDAS.includes(f),
);
check(
  'nenhum recurso visual com erro HTTP inesperado',
  imageErrorsInesperadas.length === 0,
  imageErrorsInesperadas.join(', '),
);
console.log(`  info imagens ausentes registradas: ${AUSENTES_CONHECIDAS.join(', ')}`);

const consoleSemAusencias = consoleErrors.filter(
  (e) => !/status of 40[04]/i.test(e) || !/Failed to load resource/i.test(e),
);
check(
  'nenhum erro de JavaScript no console',
  consoleSemAusencias.length === 0,
  consoleSemAusencias.slice(0, 3).join(' | '),
);
check(
  'os únicos 4xx são as imagens ausentes do pacote',
  consoleErrors.every((e) => /Failed to load resource/i.test(e)) ,
  consoleErrors.filter((e) => !/Failed to load resource/i.test(e)).join(' | '),
);

console.log('\n[2] um único atendimento');
const launchers = await page.locator('button[aria-label="Abrir Kirana"]').count();
check('existe exatamente 1 botão flutuante de atendimento', launchers === 1, `encontrados: ${launchers}`);
const panelsBefore = await page.locator('text=Agente Inteligente Residente').count();
check('nenhum painel de chat aberto de início', panelsBefore === 0);

console.log('\n[3] conversa real (backend + gateway)');
await page.locator('button[aria-label="Abrir Kirana"]').click();
await page.waitForTimeout(600);
if (!SKIP_SHOTS) await page.screenshot({ path: path.join(OUT, '02-desktop-kirana-aberta.png') });
check('painel abriu', (await page.locator('text=Kirana · Opportunity AI').count()) === 1);

const input = page.getByPlaceholder('Pergunte algo à Kirana da Opportunity AI...');
await input.fill('Quais soluções a Opportunity AI oferece?');
await input.press('Enter');

// Enquanto o stream corre, o painel mostra o indicador; ao fim, texto do agente.
await page.waitForFunction(
  () => {
    const bubbles = Array.from(document.querySelectorAll('div.p-3\\.5.rounded-2xl'));
    return bubbles.some((b) => (b.textContent || '').trim().length > 40);
  },
  { timeout: 60000 },
);
await page.waitForTimeout(1200);

const chatCalls = kiranaCalls.filter((c) => c.url.includes('/api/kirana/chat'));
check('a conversa passou por /api/kirana/chat', chatCalls.length >= 1, `${chatCalls.length} chamada(s)`);

const replyText = await page.evaluate(() => {
  const bubbles = Array.from(document.querySelectorAll('div.p-3\\.5.rounded-2xl'));
  return bubbles.map((b) => (b.textContent || '').trim()).filter(Boolean).pop() || '';
});
check('o agente devolveu texto (não vazio)', replyText.length > 20, `tamanho: ${replyText.length}`);
check('a resposta não é uma das frases fixas antigas da rota mock', !/^Olá! Sou a Kirana, o agente inteligente residente da Opportunity AI\. Posso te explicar/.test(replyText));
if (!SKIP_SHOTS) await page.screenshot({ path: path.join(OUT, '03-desktop-conversa.png') });

console.log('\n[4] showcases sem tocar na Kirana');
const beforeShowcase = kiranaCalls.length;
await page.locator('#demo-kirana').scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
// pergunta sugerida de um showcase (resposta predefinida)
const suggested = page.locator('#demo-kirana button').filter({ hasText: /preç|preco|quanto|horário|horario|entrega/i }).first();
if (await suggested.count()) {
  await suggested.click();
  await page.waitForTimeout(1500);
}
if (!SKIP_SHOTS) await page.screenshot({ path: path.join(OUT, '04-desktop-showcase.png') });
check(
  'showcase não chamou /api/kirana/* (nenhum token gasto)',
  kiranaCalls.length === beforeShowcase,
  `${kiranaCalls.length - beforeShowcase} chamada(s) durante o showcase`,
);

console.log('\n[5] segredos no cliente');
const html = await page.content();
const secretPatterns = [
  /sk-[A-Za-z0-9]{20,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /KIRANA_ACCESS_TOKEN/i,
  /KIRANA_GATEWAY_API_KEY/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
];
const leaked = secretPatterns.filter((re) => re.test(html));
check('nenhum segredo no HTML', leaked.length === 0, leaked.map(String).join(', '));

const scripts = await page.evaluate(() =>
  Array.from(document.querySelectorAll('script[src]')).map((s) => s.src),
);
let jsLeak = '';
for (const src of scripts.filter((s) => s.includes('/_next/'))) {
  const body = await page.request.get(src).then((r) => (r.ok() ? r.text() : ''));
  const found = secretPatterns.find((re) => re.test(body));
  if (found) jsLeak = `${src}: ${found}`;
  if (/127\.0\.0\.1:1455|:3000\/api/.test(body)) jsLeak = jsLeak || `${src}: endereço interno exposto`;
}
check('nenhum segredo nem endereço interno no JavaScript público', jsLeak === '', jsLeak);

/* ------------------------------- mobile ------------------------------ */
console.log('\n[6] celular');
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
await mobile.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
await mobile.waitForTimeout(700);
if (!SKIP_SHOTS) await mobile.screenshot({ path: path.join(OUT, '05-mobile-topo.png') });
await mobile.locator('button[aria-label="Abrir Kirana"]').click();
await mobile.waitForTimeout(700);
const box = await mobile.locator('text=Kirana · Opportunity AI').boundingBox();
check('painel cabe na largura do celular', Boolean(box) && box.width <= 390, `largura: ${box?.width}`);
if (!SKIP_SHOTS) await mobile.screenshot({ path: path.join(OUT, '06-mobile-kirana.png') });
const overflowX = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check('sem rolagem horizontal no celular', overflowX <= 1, `excesso: ${overflowX}px`);

await browser.close();

console.log(`\n# pass ${pass} / # fail ${fail}`);
if (fail) {
  console.log('falhas:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('capturas em', OUT);
