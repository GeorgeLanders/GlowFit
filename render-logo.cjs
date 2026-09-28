// One-off: render the logo + feature graphic SVGs to PNG for visual review.
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const jobs = [
  ['store-assets/logo.svg', 'store-assets/logo-preview.png', 1024],
  ['store-assets/logo.svg', 'store-assets/logo-preview-small.png', 256],
  ['store-assets/feature-graphic-logo.svg', 'store-assets/feature-graphic-logo.png', 1024],
  ['src/assets/icon.svg', 'store-assets/icon-preview.png', 512],
  ['src/assets/icon-foreground.svg', 'store-assets/icon-foreground-preview.png', 512],
];

for (const [src, out, size] of jobs) {
  const r = new Resvg(read(src), { fitTo: { mode: 'width', value: size }, background: 'transparent' });
  fs.writeFileSync(path.join(root, out), r.render().asPng());
  console.log(`ok ${out} (${size}px)`);
}
