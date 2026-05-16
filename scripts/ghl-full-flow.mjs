/**
 * GHL full login + MFA + survey rebuild.
 * Step 1: Login, trigger phone MFA, save state, exit.
 * Run again with MFA code as first arg to continue.
 */
import puppeteer from 'puppeteer-core';
import * as fs from 'fs';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';
const SESSION_FILE = '/tmp/ghl-session.json';
const LOCATION_ID = 'Ghstz8eIsHWLeXek47dk';
const SURVEY_ID = 'mZ3OtaeqMDoJaJ8Paq5r';

const delay = ms => new Promise(r => setTimeout(r, ms));

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
  });
}

async function doLogin(page) {
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(2000);
  await page.type('input[name="email"]', EMAIL, { delay: 60 });
  await page.type('input[name="password"]', PASSWORD, { delay: 60 });
  await page.click('button[type="submit"], button:not([type="button"])');
  await delay(5000);
}

async function triggerPhoneMfa(page) {
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Page after login (first 400):', text.substring(0, 400));

  if (!text.includes('Security Code') && !text.includes('Verify')) {
    console.log('No MFA screen — may already be logged in');
    return false;
  }

  // Dump all clickable elements
  const els = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="button"], div[class*="option"], label, span'))
      .filter(el => el.textContent?.trim().length > 0 && el.textContent?.trim().length < 100)
      .map(el => ({ tag: el.tagName, text: el.textContent?.trim(), cls: el.className?.substring(0,80) }))
  );
  console.log('Clickable elements:', JSON.stringify(els.slice(0, 30), null, 2));

  // Try clicking phone option
  let clicked = false;
  for (const el of els) {
    if (el.text && (el.text.toLowerCase().includes('phone') || el.text.includes('838'))) {
      console.log('Found phone option:', el.text);
      // Click it via evaluate
      await page.evaluate((txt) => {
        const all = Array.from(document.querySelectorAll('*'));
        for (const el of all) {
          if (el.textContent?.trim() === txt && el.children.length === 0) {
            el.click();
            return;
          }
        }
        // Try parent click
        for (const el of all) {
          if (el.textContent?.includes(txt)) {
            el.click();
            return;
          }
        }
      }, el.text);
      clicked = true;
      await delay(1000);
      break;
    }
  }

  if (!clicked) {
    console.log('Could not find phone option by text, trying radio inputs...');
    const radios = await page.$$('input[type="radio"]');
    console.log(`Found ${radios.length} radio inputs`);
    if (radios.length > 1) {
      // Second radio is usually phone
      await radios[1].click();
      await delay(500);
    }
  }

  // Click send button
  const sendBtns = await page.$$('button');
  for (const btn of sendBtns) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt && (txt.includes('Send') || txt.includes('Continue'))) {
      console.log('Clicking:', txt);
      await btn.click();
      await delay(2000);
      break;
    }
  }

  const afterText = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('After send click:', afterText);
  return true;
}

async function enterMfaCode(page, code) {
  await delay(1000);
  const text = await page.evaluate(() => document.body.innerText);
  console.log('MFA entry screen:', text.substring(0, 300));

  // Try individual OTP boxes
  const otpBoxes = await page.$$('input[maxlength="1"], input[data-id]');
  if (otpBoxes.length >= 4) {
    console.log(`Filling ${otpBoxes.length} OTP boxes`);
    for (let i = 0; i < Math.min(otpBoxes.length, code.length); i++) {
      await otpBoxes[i].click();
      await otpBoxes[i].type(code[i], { delay: 150 });
    }
  } else {
    // Single text input
    const inputs = await page.$$('input[type="text"], input[type="number"], input:not([type="password"]):not([type="email"])');
    if (inputs.length > 0) {
      await inputs[0].click();
      await inputs[0].type(code, { delay: 100 });
      console.log('Typed code into single input');
    } else {
      // Try keyboard directly
      await page.keyboard.type(code, { delay: 150 });
      console.log('Typed code via keyboard');
    }
  }

  await delay(500);

  // Submit
  const btns = await page.$$('button');
  for (const btn of btns) {
    const txt = await page.evaluate(el => el.textContent?.trim(), btn);
    if (txt && (txt.includes('Verify') || txt.includes('Submit') || txt.includes('Confirm') || txt.includes('Continue'))) {
      await btn.click();
      console.log('Clicked verify:', txt);
      break;
    }
  }

  await delay(4000);
  const afterUrl = page.url();
  const afterText = await page.evaluate(() => document.body.innerText.substring(0, 400));
  console.log('Post-MFA URL:', afterUrl);
  console.log('Post-MFA text:', afterText);
  return afterText;
}

const mfaCode = process.argv[2];

(async () => {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

  if (mfaCode) {
    // Resume from saved session
    console.log('Resuming with MFA code:', mfaCode);
    const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded' });
    await page.setCookie(...session.cookies);
    await delay(1000);

    // Re-login to get back to MFA screen
    await doLogin(page);
    await triggerPhoneMfa(page);
    const result = await enterMfaCode(page, mfaCode);

    if (!result.includes('Security') && !result.includes('Verify')) {
      console.log('✅ Logged in! Saving session...');
      const cookies = await page.cookies();
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies }));
      console.log('Session saved. Ready to modify survey.');
    }
  } else {
    // Fresh login + trigger MFA
    console.log('Fresh login...');
    await doLogin(page);
    const needsMfa = await triggerPhoneMfa(page);

    // Save cookies so we can resume
    const cookies = await page.cookies();
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies }));
    console.log('Pre-MFA state saved.');

    if (needsMfa) {
      console.log('\n✅ SMS code sent to phone. Run again with the code:');
      console.log('   node scripts/ghl-full-flow.mjs 123456');
    }
  }

  await browser.close();
})();
