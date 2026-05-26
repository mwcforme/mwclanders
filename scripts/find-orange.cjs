// Find exact pill boundaries in both images
const { PNG } = require('pngjs');
const fs = require('fs');

const devImg = PNG.sync.read(fs.readFileSync('.ralph/shots/BookConfirmed_390_dev.png'));
const lockImg = PNG.sync.read(fs.readFileSync('.ralph/shots/BookConfirmed_390_lock.png'));

function avgRow(img, y) {
  let r = 0, g = 0, b = 0;
  const w = img.width;
  for (let x = 0; x < w; x++) {
    const i = (w * y + x) << 2;
    r += img.data[i]; g += img.data[i+1]; b += img.data[i+2];
  }
  return [Math.round(r/w), Math.round(g/w), Math.round(b/w)];
}

// Orange detection: high R, medium G, low B
function isOrange(rgb) { return rgb[0] > 150 && rgb[1] < 170 && rgb[2] < 120 && rgb[0] > rgb[1] + 50; }

console.log('=== ORANGE PILL POSITION (Y=360-620) ===');
console.log('Y   | DEV type | DEV avg         | LOCK type | LOCK avg');
console.log('----|----------|-----------------|-----------|----------');

for (let y = 360; y <= 620; y++) {
  const dev = avgRow(devImg, y);
  const lock = avgRow(lockImg, y);
  const devO = isOrange(dev) ? 'ORANGE' : '      ';
  const lockO = isOrange(lock) ? 'ORANGE' : '      ';
  if (devO !== '      ' || lockO !== '      ') {
    console.log(`Y=${y}: ${devO} (${dev.join(',')}) | ${lockO} (${lock.join(',')})`);
  } else if (y % 20 === 0) {
    console.log(`Y=${y}:        (${dev.join(',')}) |        (${lock.join(',')})`);
  }
}
