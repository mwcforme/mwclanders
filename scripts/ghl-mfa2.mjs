import puppeteer from 'puppeteer-core';
import * as fs from 'fs';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login
  console.log('Logging in...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', EMAIL, { delay: 40 });
  await page.type('input[type="password"]', PASSWORD, { delay: 40 });
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 4000));

  // Dump full page HTML to inspect MFA structure
  const html = await page.content();
  fs.writeFileSync('/tmp/ghl-mfa-page.html', html);
  console.log('HTML saved to /tmp/ghl-mfa-page.html');

  // Get all text on page
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:\n', text.substring(0, 1000));

  // Get all buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]'))
      .map(el => ({ tag: el.tagName, text: el.textContent?.trim(), id: el.id, cls: el.className?.substring(0,50) }));
  });
  console.log('\nBUTTONS:', JSON.stringify(buttons, null, 2));

  // Get all inputs
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select'))
      .map(el => ({ type: el.type, name: el.name, id: el.id, placeholder: el.placeholder, value: el.value }));
  });
  console.log('\nINPUTS:', JSON.stringify(inputs, null, 2));

  await page.screenshot({ path: '/tmp/ghl-mfa-screen.png' });
  console.log('Screenshot: /tmp/ghl-mfa-screen.png');

  await browser.close();
})();
