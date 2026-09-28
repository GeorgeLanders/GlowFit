// Verification: re-render icon.svg / icon-foreground.svg under unique names
// and print dimensions of every preview PNG so nothing can be mixed up.
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const root = __dirname;

for (const [src, out] of [
  ['src/assets/icon.svg', 'store-assets/verify-icon.png'],
  ['src/assets/icon-foreground.svg', 'store-assets/verify-fg.png'],
]) {
  const svg = fs.readFileSync(path.join(root, src), 'utf8');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } }).render().asPng();
  fs.writeFileSync(path.join(root, out), png);
  // PNG dimensions from IHDR (bytes 16-23)
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  console.log(`${out}: ${w}x${h}, ${png.length} bytes`);
}

for (const f of fs.readdirSync(path.join(root, 'store-assets')).filter(n => n.endsWith('.png'))) {
  const png = fs.readFileSync(path.join(root, 'store-assets', f));
  console.log(`store-assets/${f}: ${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);
}
