// Builds the Play Store listing assets from the captured screenshots.
//
// Everything is rendered by headless Chrome rather than an image library so the
// marketing copy uses the app's real brand fonts (Inter + Playfair Display),
// served from the same build. That avoids shipping a second, subtly different
// typeface in the store listing.
//
// Produces:
//   store-assets/phone/<theme>/N-*.png     1080x1920 framed screenshots
//   store-assets/feature-graphic.png       1024x500 (required by Play)
//
// Run with: node build-store-assets.cjs [dark|light]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SERVE = 'http://localhost:4173';
const ROOT = __dirname;
const ASSETS = path.join(ROOT, 'dist', 'assets');
const OUT = path.join(ROOT, 'store-assets');

// Headline copy is benefit-led and stays strictly descriptive of what the
// screenshots actually show, so nothing here overpromises.
const SHOTS = [
  { id: '1-dashboard',
    h: 'Everything that<br>matters, on <span class="grad">one screen</span>',
    s: 'Calories, water, mood and steps, tracked live.' },
  { id: '2-nutrition',
    h: 'Log a meal in<br><span class="grad">seconds</span>',
    s: 'Search the food database and see your macros add up.' },
  { id: '3-workouts',
    h: 'Train with a plan<br>that <span class="grad">adapts</span>',
    s: 'Strength, cardio and HIIT, logged in one place.' },
  { id: '4-progress',
    h: 'See the trend,<br>not the <span class="grad">noise</span>',
    s: 'Weight, measurements and progress photos over time.' },
  { id: '5-ai-coach',
    h: 'A coach that<br><span class="grad">knows your history</span>',
    s: 'Advice grounded in the data you have already logged.' },
  { id: '6-water',
    h: 'Hit your<br><span class="grad">hydration goal</span>',
    s: 'One tap to log a glass and watch the ring fill.' },
  { id: '7-weekly-report',
    h: 'Your whole week,<br>in <span class="grad">one report</span>',
    s: 'Consistency, calories and training at a glance.' },
  { id: '8-profile',
    h: 'Built around<br><span class="grad">your goals</span>',
    s: 'Set a target once and let GlowFit do the maths.' },
];

// The app's own brand ramp, reused here so the listing matches the product.
const SWEEP = 'linear-gradient(100deg,#22D3EE 0%,#8B5CF6 38%,#C026D3 68%,#EC4899 100%)';

const THEMES = {
  dark: { page: 'linear-gradient(165deg,#120A24 0%,#1A102F 42%,#2C1748 100%)',
          ink: '#FFFFFF', sub: '#C4B5E0', chip: 'rgba(255,255,255,.10)',
          chipLine: 'rgba(255,255,255,.18)', device: 'rgba(255,255,255,.12)' },
  light: { page: 'linear-gradient(165deg,#F7F2FF 0%,#F0E9FF 45%,#E9DDFB 100%)',
           ink: '#2A1240', sub: '#6B5A8A', chip: 'rgba(255,255,255,.75)',
           chipLine: 'rgba(120,80,180,.18)', device: 'rgba(120,80,180,.22)' },
};

const b64 = (p) => fs.readFileSync(p).toString('base64');

// Pull the real font files out of the build so the CSS here can reference the
// exact same hashed assets the app ships.
function fontFace() {
  const files = fs.readdirSync(ASSETS);
  const url = (re) => {
    const f = files.find((n) => re.test(n) && n.endsWith('.woff2'));
    if (!f) throw new Error('missing font: ' + re);
    return `/assets/${f}`;
  };
  return `
  @font-face{font-family:Inter;font-weight:400;font-style:normal;src:url(${url(/^inter-latin-400-normal/)}) format('woff2')}
  @font-face{font-family:Inter;font-weight:600;font-style:normal;src:url(${url(/^inter-latin-600-normal/)}) format('woff2')}
  @font-face{font-family:Inter;font-weight:700;font-style:normal;src:url(${url(/^inter-latin-700-normal/)}) format('woff2')}
  @font-face{font-family:Playfair;font-weight:400;font-style:normal;src:url(${url(/^playfair-display-latin-400-normal/)}) format('woff2')}
  @font-face{font-family:Playfair;font-weight:700;font-style:normal;src:url(${url(/^playfair-display-latin-700-normal/)}) format('woff2')}`;
}

const base = (t) => `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{overflow:hidden;background:${t.page};color:${t.ink};
    font-family:Inter,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
  .blob{position:absolute;border-radius:50%;filter:blur(130px)}
  .b1{width:860px;height:860px;background:#8B5CF6;opacity:.42;top:-300px;left:-280px}
  .b2{width:780px;height:780px;background:#EC4899;opacity:.30;top:-220px;right:-300px}
  .b3{width:700px;height:700px;background:#22D3EE;opacity:.16;bottom:-320px;left:-200px}
  .grad{background:${SWEEP};-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;color:transparent}`;

function phoneHtml(theme, shot, imgPath) {
  const t = THEMES[theme];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace()}
  body{width:1080px;height:1920px;position:relative}
  ${base(t)}
  .wrap{position:relative;z-index:2;padding:140px 88px 0;text-align:center}
  .chip{display:inline-block;font-size:29px;font-weight:600;letter-spacing:.18em;
    text-transform:uppercase;color:${t.sub};border:1px solid ${t.chipLine};
    background:${t.chip};padding:15px 32px;border-radius:999px}
  .head{font-family:Playfair,Georgia,serif;font-weight:700;font-size:84px;
    line-height:1.08;letter-spacing:-0.015em;margin-top:38px}
  .sub{font-size:33px;line-height:1.45;color:${t.sub};margin-top:28px}
  .device{position:absolute;left:50%;transform:translateX(-50%);top:672px;width:876px;
    border-radius:66px 66px 0 0;overflow:hidden;border:12px solid ${t.device};
    border-bottom:0;box-shadow:0 46px 130px rgba(18,10,36,.55);z-index:3}
  .device img{display:block;width:100%}
  </style></head><body>
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap">
    <div class="chip">GlowFit</div>
    <h1 class="head">${shot.h}</h1>
    <p class="sub">${shot.s}</p>
  </div>
  <div class="device"><img src="data:image/png;base64,${b64(imgPath)}"></div>
  </body></html>`;
}

// 1024x500 is a hard Play Store requirement and cannot be composed from a phone
// screenshot alone, so it gets its own wide layout: wordmark and value
// proposition on the left, one real screen on the right.
function featureHtml(theme, imgPath) {
  const t = THEMES[theme];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace()}
  body{width:1024px;height:500px;position:relative}
  ${base(t)}
  .wrap{position:relative;z-index:2;padding:76px 0 0 72px;width:600px}
  .word{font-family:Playfair,Georgia,serif;font-weight:700;font-size:82px;
    letter-spacing:-0.02em;line-height:1}
  .word span{background:${SWEEP};-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;color:transparent}
  .tag{font-size:27px;line-height:1.5;color:${t.sub};margin-top:22px;max-width:520px}
  .pills{display:flex;gap:12px;margin-top:34px}
  .pill{font-size:20px;font-weight:600;color:${t.sub};border:1px solid ${t.chipLine};
    background:${t.chip};padding:11px 20px;border-radius:999px;white-space:nowrap}
  /* width 256 + 8px border => 240px of image => 427px tall, +16px border =
     443px outer height. At top:29px the device bottom lands at 472px, inside
     the 500px canvas, so the whole screen (incl. the nav bar) is visible with
     even 29px/28px margins instead of the nav icons being sliced off. */
  .shot{position:absolute;right:96px;top:29px;width:256px;border-radius:30px;
    overflow:hidden;border:8px solid ${t.device};box-shadow:0 26px 70px rgba(18,10,36,.5);z-index:3}
  .shot img{display:block;width:100%}
  </style></head><body>
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap">
    <div class="word">Glow<span>Fit</span></div>
    <div class="tag">Track your training, food, mood and sleep.
      See the whole picture, not just today.</div>
    <div class="pills"><span class="pill">Workouts</span><span class="pill">Nutrition</span>
      <span class="pill">Progress</span><span class="pill">AI Coach</span></div>
  </div>
  <div class="shot"><img src="data:image/png;base64,${b64(imgPath)}"></div>
  </body></html>`;
}

async function main() {
  const theme = (process.argv[2] || 'dark').toLowerCase();
  if (!THEMES[theme]) throw new Error(`bad theme: ${theme}`);

  const rawDir = path.join(OUT, `raw-${theme}`);
  const outDir = path.join(OUT, 'phone', theme);
  const stageDir = path.join(ROOT, 'dist', '_store');
  fs.mkdirSync(outDir, { recursive: true });
  // Staged inside dist because the font URLs are root-relative and only the
  // preview server's origin serves them.
  fs.mkdirSync(stageDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--no-sandbox'],
  });
  const page = await browser.newPage();

  // Renders one staged page and waits for the brand webfonts to actually apply,
  // otherwise the screenshot can catch the fallback face.
  const render = async (html, file, w, h) => {
    const staged = path.join(stageDir, 'current.html');
    fs.writeFileSync(staged, html);
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(`${SERVE}/_store/current.html?cb=${Date.now()}`,
      { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({ path: file });
    console.log(path.relative(ROOT, file));
  };

  for (const shot of SHOTS) {
    const img = path.join(rawDir, `${shot.id}.png`);
    if (!fs.existsSync(img)) throw new Error(`missing raw capture: ${img}`);
    await render(phoneHtml(theme, shot, img),
      path.join(outDir, `${shot.id}.png`), 1080, 1920);
  }

  // Feature graphic uses the dashboard, the screen that best explains the app.
  await render(featureHtml(theme, path.join(rawDir, '1-dashboard.png')),
    path.join(OUT, `feature-graphic-${theme}.png`), 1024, 500);

  // Play Console's upload slot expects feature-graphic.png (1024x500), not the
  // themed filenames. Dark is the store listing graphic; light stays as a variant.
  if (theme === 'dark') {
    fs.copyFileSync(
      path.join(OUT, 'feature-graphic-dark.png'),
      path.join(OUT, 'feature-graphic.png'),
    );
    console.log('store-assets/feature-graphic.png');
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


