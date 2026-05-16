import puppeteer from 'puppeteer-core';
import * as fs from 'fs';

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

  console.log('Logging in...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(1000);
  await page.type('#email', EMAIL, { delay: 50 });
  await page.type('#password', PASSWORD, { delay: 50 });
  await page.click('button[type="submit"]');
  await delay(5000);

  // Select phone + send code
  await page.click('#otp-for-phone');
  await delay(300);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Send Security Code'))?.click();
  });
  await delay(6000); // wait longer for OTP fields to render

  // Dump full HTML to see what rendered
  const html = await page.content();
  fs.writeFileSync('/tmp/ghl-otp-page.html', html);
  
  const allInputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type, maxlen: i.maxLength, id: i.id, name: i.name,
      placeholder: i.placeholder, value: i.value
    }))
  );
  console.log('All inputs:', JSON.stringify(allInputs, null, 2));

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body (800):', bodyText.substring(0, 800));

  if (mfaCode) {
    // Try clicking each digit box sequentially
    const boxes = await page.$$('input');
    console.log(`Total inputs: ${boxes.length}`);
    
    // Filter to only the OTP boxes (skip email/password)
    const otpInputs = [];
    for (const box of boxes) {
      const info = await page.evaluate(el => ({
        type: el.type, maxlen: el.maxLength, name: el.name, id: el.id
      }), box);
      if (info.name !== 'email' && info.name !== 'password' && info.name !== 'otp') {
        otpInputs.push({ el: box, info });
      }
    }
    console.log('OTP candidate inputs:', otpInputs.map(x => x.info));

    if (otpInputs.length >= 4) {
      for (let i = 0; i < Math.min(otpInputs.length, mfaCode.length); i++) {
        await otpInputs[i].el.click();
        await otpInputs[i].el.type(mfaCode[i], { delay: 200 });
      }
    } else if (otpInputs.length === 1) {
      await otpInputs[0].el.click();
      await otpInputs[0].el.type(mfaCode, { delay: 100 });
    } else {
      // No visible inputs — try typing directly to focused element
      await page.keyboard.type(mfaCode, { delay: 200 });
    }

    await delay(500);
    await page.keyboard.press('Enter');
    await delay(5000);

    const finalUrl = page.url();
    const finalText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('\nFinal URL:', finalUrl);
    console.log('Final text:', finalText);

    const success = !finalText.includes('Verify Security Code') && !finalText.includes('Sign into');
    if (success) {
      console.log('✅ LOGGED IN!');
      const cookies = await page.cookies();
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies }));
      console.log('Session saved.');
    } else {
      console.log('❌ Still on auth page');
    }
  }

  await browser.close();
})();
