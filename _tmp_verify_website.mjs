import { chromium } from 'playwright';

const shotsDir = 'C:\\Users\\lococ\\AppData\\Local\\Temp\\claude\\D--Projetos-Zyra\\edd0278a-c857-4c85-908e-6faf84e2832e\\scratchpad';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const issues = [];
page.on('pageerror', (err) => issues.push('pageerror: ' + String(err)));
page.on('requestfailed', (req) => {
  const url = req.url();
  if (!url.startsWith('https://zyra-icons.com')) issues.push('requestfailed: ' + url);
});

await page.goto('http://localhost:3002/', { waitUntil: 'load', timeout: 60000 }).catch((e) => console.log('nav1 error:', e.message));
await page.waitForTimeout(5000);
await page.reload({ waitUntil: 'load', timeout: 60000 }).catch((e) => console.log('reload error:', e.message));
await page.waitForTimeout(4000);

console.log('title:', await page.title());
console.log('issues:', JSON.stringify(issues.slice(0, 20), null, 2));

await page.screenshot({ path: `${shotsDir}\\landing-top.png`, timeout: 60000 });
await page.screenshot({ path: `${shotsDir}\\landing-full.png`, fullPage: true, timeout: 90000 });

await browser.close();
console.log('done');
