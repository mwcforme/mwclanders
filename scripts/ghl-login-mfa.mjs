import puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as readline from 'readline';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';
const SESSION_FILE = '/tmp/ghl-session.json';
const delay = ms => new Promise(r => setTimeout(r, ms));

const mfaCode = process.argv[2];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // ── Step 1: Login ──────────────────────────────────────────────────────
  console.log('Navigating to GHL...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1000);

  console.log('Filling credentials...');
  await page.click('#email');
  await page.type('#email', EMAIL, { delay: 50 });
  await page.click('#password');
  await page.type('#password', PASSWORD, { delay: 50 });

  console.log('Clicking Sign in...');
  await page.click('button[type="submit"]');
  await delay(6000);

  const url = page.url();
  const text = await page.evaluate(() => document.body.innerText);
  console.log('URL:', url);
  console.log('Text (600):', text.substring(0, 600));

  const isMfa = text.includes('Security Code') || text.includes('Verify') || text.includes('verification');

  if (!isMfa) {
    if (mfaCode) {
      // Already past MFA from previous run — just enter code
      console.log('⚠️  No MFA screen. May already be logged in or session expired.');
    } else {
      console.log('✅ Logged in without MFA!');
      const cookies = await page.cookies();
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies }));
    }
    await browser.close();
    return;
  }

  // ── Step 2: MFA screen detected ──────────────────────────────────────
  console.log('\n📱 MFA screen detected.');

  if (!mfaCode) {
    // Trigger phone code
    console.log('Looking for phone option...');

    // Dump the MFA page HTML for inspection
    const html = await page.content();
    fs.writeFileSync('/tmp/ghl-mfa.html', html);

    // Find and click phone radio/option
    const clicked = await page.evaluate(() => {
      // Try radio buttons
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      for (const r of radios) {
        const label = document.querySelector(`label[for="${r.id}"]`);
        const txt = (label?.textContent || r.parentElement?.textContent || '').toLowerCase();
        if (txt.includes('phone') || txt.includes('sms') || txt.includes('text')) {
          r.click();
          return 'radio:' + txt.trim().substring(0, 50);
        }
      }
      // Try divs/labels with "phone" text
      const all = Array.from(document.querySelectorAll('*'));
      for (const el of all) {
        if (el.children.length === 0 && el.textContent) {
          const t = el.textContent.toLowerCase();
          if ((t.includes('phone') || t.includes('sms')) && t.length < 60) {
            el.click();
            return 'text-click:' + el.textContent.trim();
          }
        }
      }
      return null;
    });
    console.log('Phone click result:', clicked);
    await delay(1000);

    // Click "Send Security Code" button
    const sendResult = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      for (const b of btns) {
        if (b.textContent?.includes('Send')) {
          b.click();
          return b.textContent.trim();
        }
      }
      return null;
    });
    console.log('Send button:', sendResult);
    await delay(3000);

    const afterText = await page.evaluate(() => document.body.innerText.substring(0, 400));
    console.log('After send:', afterText);

    // Save pre-MFA cookies
    const cookies = await page.cookies();
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies, step: 'pre-mfa' }));

    console.log('\n✅ SMS code sent. Run again with the code:');
    console.log('   node scripts/ghl-login-mfa.mjs 123456\n');

  } else {
    // ── Step 3: Enter the MFA code ──────────────────────────────────────
    console.log('Entering MFA code:', mfaCode);

    // Check for OTP input boxes
    const inputInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(i => ({ type: i.type, maxlen: i.maxLength, id: i.id, name: i.name, cls: i.className?.substring(0,50) }));
    });
    console.log('Inputs on MFA page:', JSON.stringify(inputInfo));

    const otpBoxes = await page.$$('input[maxlength="1"]');
    if (otpBoxes.length >= 4) {
      console.log(`Filling ${otpBoxes.length} individual OTP boxes`);
      for (let i = 0; i < Math.min(otpBoxes.length, mfaCode.length); i++) {
        await otpBoxes[i].click();
        await otpBoxes[i].type(mfaCode[i], { delay: 150 });
      }
    } else {
      // Single input
      const inp = await page.$('input[type="text"]:not([name="email"]), input[type="number"], input[name*="code" i], input[id*="code" i], input[id*="otp" i]');
      if (inp) {
        await inp.click();
        await inp.type(mfaCode, { delay: 100 });
        console.log('Typed into single input');
      } else {
        console.log('No input found, typing via keyboard');
        await page.keyboard.type(mfaCode, { delay: 150 });
      }
    }

    await delay(500);

    // Click verify button
    const verifyResult = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      for (const b of btns) {
        const t = b.textContent?.trim();
        if (t && (t.includes('Verify') || t.includes('Confirm') || t.includes('Submit') || t.includes('Continue') || t.includes('Sign'))) {
          b.click();
          return t;
        }
      }
      // Try submit via form
      const form = document.querySelector('form');
      if (form) { form.requestSubmit(); return 'form.requestSubmit'; }
      return null;
    });
    console.log('Verify button clicked:', verifyResult);

    await delay(5000);

    const finalUrl = page.url();
    const finalText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('\nFinal URL:', finalUrl);
    console.log('Final text:', finalText);

    const success = !finalText.includes('Security Code') && !finalText.includes('Verify Security') && finalUrl !== 'https://app.gohighlevel.com/';

    if (success) {
      console.log('\n✅ Successfully logged in!');
      const cookies = await page.cookies();
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies }));
      console.log('Session saved to', SESSION_FILE);
    } else {
      console.log('\n❌ Login may have failed. Saving screenshot...');
      await page.screenshot({ path: '/tmp/ghl-fail.png' });
    }
  }

  await browser.close();
})();
