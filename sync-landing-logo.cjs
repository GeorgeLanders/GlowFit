// Inlines the GlowFit brand mark into landing-page/index.html.
//
// The landing page is a single self-contained HTML file with no build step, so
// unlike the React app it cannot import the artwork. Rather than hand-copy the
// SVG — which is exactly how the Android splash kept rendering the retired
// lotus after the logo had already been replaced — this derives the markup
// from src/assets/icon.svg so the two can never disagree again.
//
// Run with: node sync-landing-logo.cjs
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src/assets/icon.svg');
const PAGE = path.join(__dirname, 'landing-page/index.html');

// Strip comments and collapse inter-tag whitespace. Safe for this artwork: it
// contains no <text> or other whitespace-sensitive content.
function minify(svg) {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim();
}

const svg = minify(fs.readFileSync(SRC, 'utf8'));

// Base64 rather than percent-encoding: the artwork is full of '#' (gradients
// and url(#id) references) which would otherwise need escaping, and base64
// cannot be mangled by an editor or a formatter.
const favicon = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');

let html = fs.readFileSync(PAGE, 'utf8');
const before = html;

// 1. Nav brand mark — swap out whatever currently sits inside .brand-mark.
const markRe = /(<span class="brand-mark">)[\s\S]*?(<\/span>)/;
if (!markRe.test(html)) throw new Error('landing-page/index.html: .brand-mark span not found');
html = html.replace(markRe, `$1${svg}$2`);

// 2. Favicon — was a purple-heart emoji data URI.
const favRe = /<link rel="icon" href="data:image\/svg\+xml[^"]*">/;
if (!favRe.test(html)) throw new Error('landing-page/index.html: favicon link not found');
html = html.replace(favRe, `<link rel="icon" href="${favicon}">`);

if (html === before) {
  console.log('No change — landing page already in sync.');
} else {
  fs.writeFileSync(PAGE, html);
  console.log(`Brand mark inlined (${svg.length} bytes).`);
  console.log(`Favicon set (${favicon.length} bytes data URI).`);
}
