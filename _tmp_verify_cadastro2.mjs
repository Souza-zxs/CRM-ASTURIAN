import { chromium } from 'playwright';

const shotsDir = 'C:\\Users\\lococ\\AppData\\Local\\Temp\\claude\\D--Projetos-Zyra\\edd0278a-c857-4c85-908e-6faf84e2832e\\scratchpad';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + String(err)));
page.on('requestfailed', (req) => {
  const url = req.url();
  if (!url.startsWith('https://zyra-icons.com') && !url.includes('android-launchericon')) {
    consoleErrors.push('requestfailed: ' + url + ' ' + (req.failure()?.errorText ?? ''));
  }
});

await page.goto('http://localhost:3001/cadastro', { waitUntil: 'load', timeout: 60000 }).catch((e) => console.log('nav1 error:', e.message));
await page.waitForTimeout(8000);
console.log('reloading...');
await page.reload({ waitUntil: 'load', timeout: 60000 }).catch((e) => console.log('reload error:', e.message));
await page.waitForTimeout(8000);

console.log('title:', await page.title());
console.log('critical issues:', JSON.stringify(consoleErrors, null, 2));

await page.screenshot({ path: `${shotsDir}\\cadastro3.png`, fullPage: true, timeout: 60000 });

await browser.close();
console.log('done');
