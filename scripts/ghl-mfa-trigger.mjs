/**
 * GHL MFA — trigger SMS code, then wait for it to be passed in via stdin.
 */
import puppeteer from 'puppeteer-core';
import * as readline from 'readline';
import * as fs from 'fs';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';
const SURVEY_ID = 'mZ3OtaeqMDoJaJ8Paq5r';
const LOCATION_ID = 'Ghstz8eIsHWLeXek47dk';
const SURVEY_URL = `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/survey-builder-v2/${SURVEY_ID}`;
const SESSION_FILE = '/tmp/ghl-session.json';

async function login(page) {
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
  await page.type('input[type="email"], input[name="email"]', EMAIL, { delay: 40 });
  await page.type('input[type="password"]', PASSWORD, { delay: 40 });
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 3000));
}

async function triggerSmsCode(page) {
  // Click "Send code to phone" option
  const buttons = await page.$$('button, div[class*="option"], span');
  for (const btn of buttons) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.includes('phone')) {
      await btn.click();
      console.log('Clicked phone option');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  // Click "Send Security Code"
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.includes('Send Security Code')) {
      await btn.click();
      console.log('Sent security code to phone');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}

async function enterCode(page, code) {
  // Try OTP input fields first (individual digit boxes)
  const otpInputs = await page.$$('input[type="number"], input[inputmode="numeric"], input[maxlength="1"]');
  if (otpInputs.length >= 4) {
    for (let i = 0; i < Math.min(otpInputs.length, code.length); i++) {
      await otpInputs[i].click();
      await otpInputs[i].type(code[i], { delay: 100 });
    }
    console.log('Entered code into OTP boxes');
  } else {
    // Single input
    const input = await page.$('input[type="text"], input[name="code"], input[placeholder*="code" i]');
    if (input) {
      await input.click();
      await input.type(code, { delay: 100 });
      console.log('Entered code into single input');
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  // Submit
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && (txt.includes('Verify') || txt.includes('Submit') || txt.includes('Confirm'))) {
      await btn.click();
      console.log('Submitted MFA code');
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 3000));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Logging in...');
  await login(page);
  
  const url = page.url();
  const body = await page.evaluate(() => document.body.innerText.substring(0, 300));
  
  if (body.includes('Verify Security Code') || body.includes('Security Code')) {
    console.log('MFA screen detected. Sending SMS code...');
    await triggerSmsCode(page);
    
    // Save browser state so we can resume
    const cookies = await page.cookies();
    fs.writeFileSync('/tmp/ghl-pre-mfa-cookies.json', JSON.stringify(cookies));
    
    // Wait for code from stdin
    console.log('\n>>> CODE SENT TO +1*******838. Enter the 6-digit code:');
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const code = await new Promise(resolve => rl.question('Code: ', resolve));
    rl.close();
    
    await enterCode(page, code.trim());
    
    const postMfaUrl = page.url();
    const postMfaBody = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('Post-MFA URL:', postMfaUrl);
    console.log('Post-MFA content:', postMfaBody.substring(0, 200));
    
    if (!postMfaBody.includes('Verify') && !postMfaBody.includes('Security Code')) {
      console.log('✅ MFA passed! Saving session...');
      const sessionCookies = await page.cookies();
      const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies: sessionCookies, localStorage }));
      console.log('Session saved to', SESSION_FILE);
    } else {
      console.log('❌ MFA may have failed. Screenshot saved.');
      await page.screenshot({ path: '/tmp/ghl-post-mfa.png' });
    }
  } else {
    console.log('No MFA — already logged in or different state');
    console.log(body);
  }

  await browser.close();
})();
