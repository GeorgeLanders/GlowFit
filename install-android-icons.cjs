const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync(path.join(__dirname, 'src/assets/icon.svg'), 'utf8');

// Android mipmap sizes
const androidSizes = [
  { density: 'mipmap-mdpi', size: 48 },
  { density: 'mipmap-hdpi', size: 72 },
  { density: 'mipmap-xhdpi', size: 96 },
  { density: 'mipmap-xxhdpi', size: 144 },
  { density: 'mipmap-xxxhdpi', size: 192 },
];

const resDir = path.join(__dirname, 'android/app/src/main/res');

for (const { density, size } of androidSizes) {
  const outDir = path.join(resDir, density);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // ic_launcher.png
  const resvg1 = new Resvg(svg, { fitTo: { mode: 'width', value: size }, background: 'transparent' });
  fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), resvg1.render().asPng());

  // ic_launcher_round.png (same icon, round mask applied by Android)
  const resvg2 = new Resvg(svg, { fitTo: { mode: 'width', value: size }, background: 'transparent' });
  fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), resvg2.render().asPng());

  // ic_launcher_foreground.png (for adaptive icon, 108dp)
  const fgSize = Math.round(size * 108 / 48);
  const resvg3 = new Resvg(svg, { fitTo: { mode: 'width', value: fgSize }, background: 'transparent' });
  fs.writeFileSync(path.join(outDir, 'ic_launcher_foreground.png'), resvg3.render().asPng());

  console.log(`✅ ${density}: ic_launcher.png (${size}x${size}), ic_launcher_round.png, ic_launcher_foreground.png`);
}

console.log('\nAndroid icons installed!');
