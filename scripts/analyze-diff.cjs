// Quick script to find which ROWS have most pixel differences
const { PNG } = require('pngjs');
const fs = require('fs');

const devPath = '.ralph/shots/BookConfirmed_390_dev.png';
const lockPath = '.ralph/shots/BookConfirmed_390_lock.png';

const devImg = PNG.sync.read(fs.readFileSync(devPath));
const lockImg = PNG.sync.read(fs.readFileSync(lockPath));

const w = Math.min(devImg.width, lockImg.width);
const h = Math.min(devImg.height, lockImg.height);

// For each row, count different pixels and compute avg color
const rowDiffs = [];
for (let y = 0; y < h; y++) {
  let diffPx = 0;
  let devR = 0, devG = 0, devB = 0;
  let lockR = 0, lockG = 0, lockB = 0;
  for (let x = 0; x < w; x++) {
    const i = (devImg.width * y + x) << 2;
    const j = (lockImg.width * y + x) << 2;
    devR += devImg.data[i]; devG += devImg.data[i+1]; devB += devImg.data[i+2];
    lockR += lockImg.data[j]; lockG += lockImg.data[j+1]; lockB += lockImg.data[j+2];
    const dr = Math.abs(devImg.data[i] - lockImg.data[j]);
    const dg = Math.abs(devImg.data[i+1] - lockImg.data[j+1]);
    const db = Math.abs(devImg.data[i+2] - lockImg.data[j+2]);
    if (Math.max(dr, dg, db) > 20) diffPx++;
  }
  rowDiffs.push({
    y,
    diffPct: (diffPx / w * 100).toFixed(1),
    devAvg: `rgb(${Math.round(devR/w)},${Math.round(devG/w)},${Math.round(devB/w)})`,
    lockAvg: `rgb(${Math.round(lockR/w)},${Math.round(lockG/w)},${Math.round(lockB/w)})`,
  });
}

// Print worst 30 rows
console.log('=== TOP 30 ROWS BY PIXEL DIFFERENCE ===');
const sorted = [...rowDiffs].sort((a, b) => parseFloat(b.diffPct) - parseFloat(a.diffPct));
sorted.slice(0, 30).forEach(r => {
  console.log(`Y=${String(r.y).padStart(3)}: diff=${String(r.diffPct).padStart(5)}%  dev=${r.devAvg}  lock=${r.lockAvg}`);
});

// Print rows in order (showing regions)
console.log('\n=== DIFF PROFILE (every 20 rows) ===');
for (let y = 0; y < h; y += 20) {
  const r = rowDiffs[y];
  const bar = '█'.repeat(Math.round(parseFloat(r.diffPct) / 5));
  console.log(`Y=${String(y).padStart(3)}: ${String(r.diffPct).padStart(5)}% ${bar}`);
}

console.log(`\nImage dims: dev=${devImg.width}x${devImg.height}, lock=${lockImg.width}x${lockImg.height}`);
