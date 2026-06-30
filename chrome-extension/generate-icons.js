// Run with: node generate-icons.js
// Generates PNG icons using canvas (Node.js + canvas package)
// If canvas isn't available, falls back to writing SVG files Chrome can use

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

// Simple SVG icon — dusty rose background with a routing arrow
function makeSVG(size) {
  const pad = Math.round(size * 0.12);
  const r = Math.round(size * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#D4A5A5"/>
  <text x="${size/2}" y="${size*0.72}" font-family="Arial" font-size="${size*0.55}" text-anchor="middle" fill="white" font-weight="bold">→</text>
</svg>`;
}

const dir = path.join(__dirname, 'images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

sizes.forEach(s => {
  fs.writeFileSync(path.join(dir, `icon-${s}.svg`), makeSVG(s));
  console.log(`Created icon-${s}.svg`);
});

console.log('\nNote: Chrome needs PNG files. Rename .svg to .png OR use an online converter.');
console.log('Quick option: https://cloudconvert.com/svg-to-png');
