import { chromium } from 'playwright';

const shotsDir = 'C:\\Users\\lococ\\AppData\\Local\\Temp\\claude\\D--Projetos-Zyra\\edd0278a-c857-4c85-908e-6faf84e2832e\\scratchpad';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + String(err)));
page.on('requestfailed', (req) => consoleErrors.push('requestfailed: ' + req.url() + ' ' + (req.failure()?.errorText ?? '')));
page.on('response', (res) => {
  if (res.status() >= 400) consoleErrors.push(`HTTP ${res.status()} ${res.url()}`);
});

const resp = await page.goto('http://localhost:3001/cadastro', { waitUntil: 'load', timeout: 60000 }).catch((e) => {
  console.log('nav error:', e.message);
  return null;
});
console.log('nav status:', resp ? resp.status() : 'null');
await page.waitForTimeout(6000);

console.log('title:', await page.title());
console.log('bodyText (first 500 chars):', (await page.textContent('body'))?.slice(0, 500));
console.log('all console/network issues:', JSON.stringify(consoleErrors, null, 2));

await page.screenshot({ path: `${shotsDir}\\cadastro2.png`, fullPage: true, timeout: 60000 });

await browser.close();
console.log('done');
