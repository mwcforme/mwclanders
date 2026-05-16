import puppeteer from 'puppeteer-core';
import * as fs from 'fs';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Navigating...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const url1 = page.url();
  console.log('URL after load:', url1);
  const html1 = await page.content();
  fs.writeFileSync('/tmp/ghl-page1.html', html1);

  // Check what inputs exist
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(i => ({type:i.type,name:i.name,id:i.id,ph:i.placeholder}))
  );
  console.log('Inputs found:', JSON.stringify(inputs));

  await page.screenshot({ path: '/tmp/ghl-page1.png' });
  console.log('Screenshot saved');
  await browser.close();
})();
