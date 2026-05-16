/**
 * GHL Login check — attempt login and detect MFA screen.
 */
import puppeteer from 'puppeteer-core';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';
const SURVEY_URL = 'https://app.gohighlevel.com/v2/location/Ghstz8eIsHWLeXek47dk/survey-builder-v2/mZ3OtaeqMDoJaJ8Paq5r';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log('Current URL:', page.url());
  
  // Fill login form
  await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email" i]', { timeout: 10000 });
  await page.type('input[type="email"], input[name="email"], input[placeholder*="email" i]', EMAIL, { delay: 50 });
  await page.type('input[type="password"]', PASSWORD, { delay: 50 });
  
  console.log('Credentials entered, submitting...');
  await page.keyboard.press('Enter');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  
  console.log('After submit URL:', page.url());
  
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Page content preview:', bodyText);
  
  const screenshot = await page.screenshot({ path: '/tmp/ghl-login-state.png' });
  console.log('Screenshot saved to /tmp/ghl-login-state.png');

  await browser.close();
})();
