/**
 * Capturas antes/depois dos pontos alterados (destaques + atendimento).
 * Uso: node testes/comparativo.mjs <url> <prefixo>
 */
import { chromium } from 'playwright';
const [url = 'http://127.0.0.1:3200', prefix = 'depois'] = process.argv.slice(2);
const OUT = '/home/user/entregas/comparativo';
const fs = await import('node:fs');
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ args: ['--no-sandbox'] });
for (const [name, viewport, mobile] of [
  ['desktop', { width: 1440, height: 900 }, false],
  ['mobile', { width: 390, height: 844 }, true],
]) {
  const p = await b.newPage({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await p.evaluate(() => document.getElementById('destaques')?.scrollIntoView());
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${OUT}/${prefix}-destaques-${name}.png` });
  if (name === 'desktop') {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(600);
    await p.locator('button[aria-label="Abrir Kirana"]').click();
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${prefix}-atendimento-desktop.png` });
  }
  await p.close();
}
await b.close();
console.log('capturas em', OUT);
