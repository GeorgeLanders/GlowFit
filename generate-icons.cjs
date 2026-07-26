const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync(path.join(__dirname, 'src/assets/icon.svg'), 'utf8');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
  { name: 'icon.png', size: 1024 },
];

const outDir = path.join(__dirname, 'src/assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const { name, size } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'transparent',
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`✅ ${name} (${size}x${size}) — ${(pngBuffer.length / 1024).toFixed(1)}KB`);
}

// Also create Android adaptive icon foreground (108dp @ 4x = 432px)
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 432 },
  background: 'transparent',
});
const pngData = resvg.render();
const pngBuffer = pngData.asPng();
fs.writeFileSync(path.join(outDir, 'icon-foreground.png'), pngBuffer);
console.log(`✅ icon-foreground.png (432x432) — ${(pngBuffer.length / 1024).toFixed(1)}KB`);

console.log('\nAll icons generated!');
