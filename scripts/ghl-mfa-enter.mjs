import puppeteer from 'puppeteer-core';
import * as fs from 'fs';

const CHROMIUM = '/usr/bin/chromium';
const EMAIL = 'eobrien@menswellnesscenters.com';
const PASSWORD = 'ghlRock8613!';
const SESSION_FILE = '/tmp/ghl-session.json';
const delay = ms => new Promise(r => setTimeout(r, ms));

const mfaCode = process.argv[2];
if (!mfaCode) { console.error('Usage: node ghl-mfa-enter.mjs <6-digit-code>'); process.exit(1); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login
  console.log('Logging in...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1000);
  await page.click('#email');
  await page.type('#email', EMAIL, { delay: 50 });
  await page.click('#password');
  await page.type('#password', PASSWORD, { delay: 50 });
  await page.click('button[type="submit"]');
  await delay(5000);

  // 2. Select phone radio
  console.log('Selecting phone option...');
  await page.click('#otp-for-phone');
  await delay(500);

  // 3. Click Send Security Code
  console.log('Clicking Send Security Code...');
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.textContent?.includes('Send Security Code')) {
        b.click();
        return true;
      }
    }
    return false;
  });
  console.log('Send clicked:', sent);
  await delay(4000);

  // 4. Check what appeared after send
  const afterSendText = await page.evaluate(() => document.body.innerText.substring(0, 600));
  console.log('After send:\n', afterSendText);

  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type, maxlen: i.maxLength, id: i.id, name: i.name,
      placeholder: i.placeholder, cls: i.className?.substring(0, 60)
    }))
  );
  console.log('Inputs after send:', JSON.stringify(inputs, null, 2));

  // 5. Enter the code
  const otpBoxes = await page.$$('input[maxlength="1"]');
  if (otpBoxes.length >= 4) {
    console.log(`Found ${otpBoxes.length} OTP boxes, entering code: ${mfaCode}`);
    for (let i = 0; i < Math.min(otpBoxes.length, mfaCode.length); i++) {
      await otpBoxes[i].click();
      await otpBoxes[i].type(mfaCode[i], { delay: 200 });
    }
  } else {
    // Find any text/number input that appeared after the send
    const textInput = await page.$('input[type="text"]:not([name="email"]), input[type="number"], input[inputmode="numeric"]');
    if (textInput) {
      await textInput.click();
      await textInput.type(mfaCode, { delay: 100 });
      console.log('Entered code in text input');
    } else {
      // Try typing directly — some OTP fields grab focus automatically
      console.log('No specific input found, typing via keyboard...');
      await page.keyboard.type(mfaCode, { delay: 200 });
    }
  }

  await delay(1000);

  // 6. Submit — find verify button
  const verifyClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      const t = b.textContent?.trim();
      if (t && (t.includes('Verify') || t.includes('Confirm') || t.includes('Submit') || t.includes('Sign in'))) {
        b.click();
        return t;
      }
    }
    // Try Enter key approach via form submit
    const form = document.querySelector('form');
    if (form) { form.requestSubmit?.(); return 'form submit'; }
    return null;
  });
  console.log('Verify clicked:', verifyClicked);

  // Also try pressing Enter
  await page.keyboard.press('Enter');
  await delay(6000);

  const finalUrl = page.url();
  const finalText = await page.evaluate(() => document.body.innerText.substring(0, 600));
  console.log('\nFinal URL:', finalUrl);
  console.log('Final text:', finalText.substring(0, 400));

  const success = finalUrl.includes('dashboard') ||
    finalUrl.includes('location') ||
    (!finalText.includes('Verify Security Code') && !finalText.includes('Sign into your account'));

  if (success) {
    console.log('\n✅ LOGGED IN SUCCESSFULLY!');
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => {
      const store = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        store[k] = window.localStorage.getItem(k);
      }
      return store;
    });
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies, localStorage }));
    console.log('Session saved to', SESSION_FILE);
  } else {
    console.log('\n❌ Still on login/MFA page.');
    await page.screenshot({ path: '/tmp/ghl-final.png' });
    console.log('Screenshot: /tmp/ghl-final.png');
  }

  await browser.close();
})();
