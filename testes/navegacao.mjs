/**
 * Navegação autorizada pela Kirana (diretiva `site_action`).
 *
 * A Kirana decide ("abra a página de contato"), o servidor autoriza e o SITE
 * executa. Este teste roda com um gateway de teste forçando a ferramenta
 * `navigate_to_page` e confere que a página realmente rola até a seção.
 *
 * Uso: node testes/navegacao.mjs [url]
 * Requer: MOCK_FORCE_TOOL=navigate_to_page no scripts/mock-gateway.js
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:3200';
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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const siteActions = [];
page.on('response', async () => {});
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });

await page.locator('button[aria-label="Abrir Kirana"]').click();
await page.waitForTimeout(500);
const input = page.getByPlaceholder('Pergunte algo à Kirana da Opportunity AI...');
await input.fill('navegue para a seção de contato');
await input.press('Enter');

// A diretiva chega no stream e o site rola a página.
await page.waitForFunction(
  () => {
    const contato = document.getElementById('contato');
    if (!contato) return false;
    const top = contato.getBoundingClientRect().top;
    return Math.abs(top) < 200; // seção de contato entrou na viewport
  },
  { timeout: 45000 },
);
await page.waitForTimeout(800);
check('o site navegou para a seção pedida pela Kirana', true);

// O pill de ferramenta aparece na conversa (transparência do que foi usado).
const pill = await page.locator('span:has-text("navigate to page")').count();
check('a resposta mostra a ferramenta usada', pill >= 1, `pills: ${pill}`);

// Nada de navegação arbitrária: o painel continua aberto e o site intacto.
check('painel da Kirana continua aberto durante a navegação', (await page.locator('text=Kirana · Opportunity AI').count()) === 1);
check('o site segue na mesma página (sem sair para fora)', page.url().startsWith(BASE));

await page.screenshot({ path: '/home/user/entregas/capturas/07-desktop-navegacao.png' });
await browser.close();

console.log(`\n# pass ${pass} / # fail ${fail}`);
if (fail) {
  console.log('falhas:\n- ' + failures.join('\n- '));
  process.exit(1);
}
