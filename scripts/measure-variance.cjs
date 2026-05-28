// scripts/measure-variance.cjs (CommonJS wrapper)
// Usage: node scripts/measure-variance.cjs <surface> <viewport>
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const resemble = require("resemblejs");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://mwclanders.vercel.app";
const SURFACES = {
  BookSchedule:  { dev: `${BASE_URL}/book/schedule`,  lock: "https://mwclocked.pplx.app/#/" },
  BookConfirmed: { dev: `${BASE_URL}/book/confirmed`, lock: "https://mwclocked.pplx.app/#/confirmed" },
};

// Demo booking state — seeds both BookConfirmed and BookSchedule
const DEMO_STATE = JSON.stringify({
  state: {
    identity: { firstName: "Eric", lastName: "Smith", phone: "5555555555", email: "eric@test.com", ghlContactId: "demo" },
    service: "trt",
    location: "richmond",
    appointmentTime: "2026-05-26T08:00:00-04:00",  // fixed date matching lock reference
  },
  version: 0,
});

async function shot(url, vp, outPath, surface) {
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
  const ctx = await browser.newContext({ viewport: { width: Number(vp), height: 900 } });
  const page = await ctx.newPage();
  try {
    // Seed sessionStorage for any dev booking surface (guard requires state)
    if (!url.includes("mwclocked")) {
      const origin = new URL(url).origin;
      await page.goto(origin + "/", { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.evaluate((state) => {
        sessionStorage.setItem("mwc_booking_state_v2", state);
      }, DEMO_STATE);
    }
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: outPath, fullPage: false });
  } finally {
    await browser.close();
  }
}

function loadPng(p) { return PNG.sync.read(fs.readFileSync(p)); }

function cropToCommon(a, b) {
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const crop = (img) => {
    const out = new PNG({ width: w, height: h });
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (img.width * y + x) << 2, j = (w * y + x) << 2;
      out.data[j]   = img.data[i];
      out.data[j+1] = img.data[i+1];
      out.data[j+2] = img.data[i+2];
      out.data[j+3] = img.data[i+3];
    }
    return out;
  };
  return [crop(a), crop(b), w, h];
}

async function resembleScore(devPath, lockPath) {
  return new Promise((resolve) => {
    resemble(fs.readFileSync(devPath))
      .compareTo(fs.readFileSync(lockPath))
      .ignoreAntialiasing()
      .scaleToSameSize()
      .onComplete((data) => resolve(Number(data.misMatchPercentage)));
  });
}

(async () => {
  const { default: pixelmatch } = await import("pixelmatch");

  const [,,surface, vp] = process.argv;
  if (!SURFACES[surface] || !["390","1280"].includes(vp)) {
    console.error("usage: measure-variance.cjs <BookSchedule|BookConfirmed> <390|1280>");
    process.exit(2);
  }
  const { dev, lock } = SURFACES[surface];
  const outDir = path.resolve(".ralph/shots");
  fs.mkdirSync(outDir, { recursive: true });
  const devPath  = path.join(outDir, `${surface}_${vp}_dev.png`);
  const lockPath = path.join(outDir, `${surface}_${vp}_lock.png`);
  const diffPath = path.join(outDir, `${surface}_${vp}_diff.png`);

  await shot(dev, vp, devPath, surface);
  await shot(lock, vp, lockPath, surface);

  const [a, b, w, h] = cropToCommon(loadPng(devPath), loadPng(lockPath));
  const diff = new PNG({ width: w, height: h });
  const diffPx = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  const pmPct = (diffPx / (w * h)) * 100;

  const rsPct = await resembleScore(devPath, lockPath);
  const avg   = (pmPct + rsPct) / 2;
  const lower = Math.min(pmPct, rsPct);
  const pass  = avg < 2.0 && lower < 2.5;

  const metricsPath = ".ralph/METRICS.md";
  if (!fs.existsSync(metricsPath) || !fs.readFileSync(metricsPath, "utf8").includes("pixelmatch")) {
    fs.appendFileSync(metricsPath, "\n\n## Variance Gate Tracking\n| ts | surface | vp | pixelmatch | resemble | avg | lower | pass |\n|---|---|---|---|---|---|---|---|\n");
  }
  fs.appendFileSync(metricsPath,
    `| ${new Date().toISOString()} | ${surface} | ${vp} | ${pmPct.toFixed(2)}% | ${rsPct.toFixed(2)}% | ${avg.toFixed(2)}% | ${lower.toFixed(2)}% | ${pass?"✅":"❌"} |\n`
  );

  console.log(JSON.stringify({ surface, vp, pixelmatch: pmPct, resemble: rsPct, avg, lower, pass, diffPath }, null, 2));
  process.exit(pass ? 0 : 1);
})();
