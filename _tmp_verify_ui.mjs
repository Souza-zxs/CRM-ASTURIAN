import { chromium } from 'playwright';

const shotsDir = 'C:\\Users\\lococ\\AppData\\Local\\Temp\\claude\\D--Projetos-Zyra\\edd0278a-c857-4c85-908e-6faf84e2832e\\scratchpad';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

async function shot(url, name) {
  consoleErrors.length = 0;
  await page.goto(url, { waitUntil: 'load', timeout: 120000 }).catch((e) => console.log(`nav error ${url}: ${e.message}`));
  await page.waitForSelector('body', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${shotsDir}\\${name}.png`, fullPage: true, timeout: 60000 });
  console.log(`--- ${name} (${url}) ---`);
  if (consoleErrors.length) {
    console.log('console errors:', consoleErrors.slice(0, 10));
  } else {
    console.log('no console errors');
  }
}

await shot('http://localhost:3001/login', 'login');
await shot('http://localhost:3001/cadastro', 'cadastro');

await browser.close();
console.log('done');
