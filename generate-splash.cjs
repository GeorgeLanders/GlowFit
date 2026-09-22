// Generates the Android launch splash drawables from the brand mark.
//
// The project shipped Capacitor's stock splash.png (a generic blue logo on
// white) in all 11 drawable folders, so tapping the branded launcher icon led
// to an unbranded, off-palette launch screen. This regenerates every one of
// them from src/assets/icon.svg, matching --bg-page / --bg-page-dark so the
// splash flows into the app instead of flashing white at dark-mode users.
//
// Run with: node generate-splash.cjs
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSvg = fs.readFileSync(path.join(__dirname, 'src/assets/icon.svg'), 'utf8');

// Lift the artwork out of its outer <svg> wrapper so it can be nested inside a
// larger canvas and positioned as a group. The wrapper's viewBox is 512x512.
const inner = iconSvg
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim();

const LIGHT_BG = '#F6F1FB'; // --bg-page
const DARK_BG = '#1A102F';  // --bg-page-dark

// Capacitor's splash drawable sizes, one per density and orientation.
const SPLASHES = [
  { dir: 'drawable', w: 480, h: 320 },
  { dir: 'drawable-land-mdpi', w: 480, h: 320 },
  { dir: 'drawable-land-hdpi', w: 800, h: 480 },
  { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  { dir: 'drawable-port-mdpi', w: 320, h: 480 },
  { dir: 'drawable-port-hdpi', w: 480, h: 800 },
  { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
  { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
  { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
];

// The mark occupies ~34% of the shortest edge, which holds up on both a small
// phone and a tablet without looking cramped or lost.
const MARK_FRACTION = 0.34;

function splashSvg(bg, w, h) {
  const size = Math.round(Math.min(w, h) * MARK_FRACTION);
  const x = Math.round((w - size) / 2);
  const y = Math.round((h - size) / 2);
  const scale = size / 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <g transform="translate(${x} ${y}) scale(${scale})">
${inner}
  </g>
</svg>`;
}

function render(svg, w) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
}

// resvg's PNG output is not maximally compressed, and these are large flat-ish
// images, so re-encode losslessly at max effort. Keeps the gradients and the
// ring glow clean (no palette quantisation) while cutting the bytes.
function optimise(png) {
  return sharp(png).png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true }).toBuffer();
}

const resDir = path.join(__dirname, 'android/app/src/main/res');

// Light is the default folder; Android selects the "-night" folder when the
// system is in dark mode. Qualifier order is orientation, then night, then
// density - so "drawable-port-night-xhdpi", never "drawable-night-port-xhdpi".
const VARIANTS = [
  { suffix: '', bg: LIGHT_BG },
  { suffix: '-night', bg: DARK_BG },
];

let written = 0;
let before = 0;
let after = 0;

async function main() {
  for (const s of SPLASHES) {
    for (const v of VARIANTS) {
      let dirName;
      const m = s.dir.match(/^drawable-(land|port)-(\w+)$/);
      if (m) {
        dirName = `drawable-${m[1]}${v.suffix}-${m[2]}`;
      } else {
        dirName = `drawable${v.suffix}`;
      }

      const outDir = path.join(resDir, dirName);
      fs.mkdirSync(outDir, { recursive: true });

      const raw = render(splashSvg(v.bg, s.w, s.h), s.w);
      const png = await optimise(raw);
      fs.writeFileSync(path.join(outDir, 'splash.png'), png);
      written++;
      before += raw.length;
      after += png.length;
    }
    console.log(`splash.png ${s.w}x${s.h}  ->  ${s.dir} + night variant`);
  }

  console.log(`\n${written} splash files written.`);
  console.log(`  raw:    ${(before / 1024).toFixed(0)}KB`);
  console.log(`  packed: ${(after / 1024).toFixed(0)}KB  (${(100 - (after / before) * 100).toFixed(0)}% smaller)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
