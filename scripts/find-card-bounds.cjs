// Find exact card boundaries in both images
const { PNG } = require('pngjs');
const fs = require('fs');

const devImg = PNG.sync.read(fs.readFileSync('.ralph/shots/BookConfirmed_390_dev.png'));
const lockImg = PNG.sync.read(fs.readFileSync('.ralph/shots/BookConfirmed_390_lock.png'));

// For each row, compute average RGB
function avgRow(img, y) {
  let r = 0, g = 0, b = 0;
  const w = img.width;
  for (let x = 0; x < w; x++) {
    const i = (w * y + x) << 2;
    r += img.data[i]; g += img.data[i+1]; b += img.data[i+2];
  }
  return [Math.round(r/w), Math.round(g/w), Math.round(b/w)];
}

// Check if a row is "white-ish" (card interior)
function isLight(rgb) { return rgb[0] > 180 && rgb[1] > 180 && rgb[2] > 180; }
function isDark(rgb) { return rgb[0] < 50 && rgb[1] < 70 && rgb[2] < 110; }

console.log('=== CARD BOUNDARY DETECTION ===\n');
console.log('Row | DEV avg | DEV type | LOCK avg | LOCK type');
console.log('----|---------|----------|----------|-----------');

let devCardStart = -1, devCardEnd = -1;
let lockCardStart = -1, lockCardEnd = -1;
const h = Math.min(devImg.height, lockImg.height);

for (let y = 200; y < h; y += 1) {
  const devAvg = avgRow(devImg, y);
  const lockAvg = avgRow(lockImg, y);
  const devType = isLight(devAvg) ? 'CARD' : isDark(devAvg) ? 'BG' : 'mid';
  const lockType = isLight(lockAvg) ? 'CARD' : isDark(lockAvg) ? 'BG' : 'mid';
  
  // Track card boundaries
  if (devCardStart < 0 && devType === 'CARD') devCardStart = y;
  if (devCardStart >= 0 && devCardEnd < 0 && devType === 'BG') devCardEnd = y - 1;
  if (lockCardStart < 0 && lockType === 'CARD') lockCardStart = y;
  if (lockCardStart >= 0 && lockCardEnd < 0 && lockType === 'BG') lockCardEnd = y - 1;
  
  // Print interesting transitions
  if (devType !== prevDevType || lockType !== prevLockType) {
    console.log(`Y=${String(y).padStart(3)} | ${devAvg.join(',')} | ${devType.padEnd(4)} | ${lockAvg.join(',')} | ${lockType}`);
  }
  var prevDevType = devType, prevLockType = lockType;
}

console.log('\n=== CARD POSITIONS ===');
console.log(`DEV card:  Y=${devCardStart} → Y=${devCardEnd} (height=${devCardEnd-devCardStart}px)`);
console.log(`LOCK card: Y=${lockCardStart} → Y=${lockCardEnd} (height=${lockCardEnd-lockCardStart}px)`);
console.log(`Offset: card starts ${lockCardStart-devCardStart}px LATER in LOCK`);
console.log(`Size diff: LOCK card is ${(lockCardEnd-lockCardStart)-(devCardEnd-devCardStart)}px TALLER`);
