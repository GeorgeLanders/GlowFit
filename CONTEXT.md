# CONTEXT.md — GlowFit (System map / ICM form)

Small stable routing + change-impact map for the dev agent. Read THIS file
before any edit, then only the one file you change. Target 2k–8k tokens/step.

## Where am I
- App: GlowFit — AI fitness companion (Capacitor/React, Android).
- Root: C:/Users/George/Desktop/GlowFit
- App source: src/  (screens/ = UI pages, lib/ = logic/services)
- Web funnel: landing-page/index.html  (separate; edits here do NOT touch the app)
- Build: `npm run build` (tsc + vite). Release APK: android/app/build/outputs/apk/release/

## Nouns (key modules — one home per fact)
### lib/ (factory / stable reference)
- store.ts        — central client state (Zustand). EDITING A STATE SHAPE hits every screen that reads it.
- api.ts          — Cloudflare backend client (D1/KV). Endpoints live here.
- device-id.ts    — per-install UUID sent as `X-User-Id` on EVERY api.ts request.
                    The worker rejects missing/malformed IDs (400) and has no
                    `default` fallback, so installs can never share a partition.
                    Mirrors the worker's own validator pattern.
- base64.ts       — File/bytes → raw base64 for the upload contract. Worker
                    expects JSON { filename, data } (NOT multipart).
- provider-config.ts / llm-config.ts — AI provider wiring + BYOK keys.
- offline-queue.ts — offline write buffer; flush on reconnect.
- notifications.ts — local + push reminders (workouts, GLP-1, hydration).
- nutrition.ts    — macro/meal logic (shared with MealPlanner/Nourishment).
- voice-input.ts / camera.ts / biometric.ts / haptics.ts / share.ts — native Capsule bridges.
- analytics.ts / error-tracking.ts — telemetry (Crashlytics/Analytics).
- useDarkMode.ts  — theme toggle.

### screens/ (product / per-run views)
- SettingsScreen.tsx  — global settings, theme, BYOK entry. HIGH-TRAFFIC.
- Dashboard.tsx       — home; reads many slices of store.ts.
- AiCoach / AiInsights / AiPlanner / AgentChat / MemoryInsights / AISettings — all consume provider-config + llm-config.
- GLP1Dashboard / GLP1Settings, HabitTracker, CycleTracker, SleepTracker, HeartRate, RecoveryScreen — consume notifications.ts + store.ts.
- Nutrition / MealPlanner / Nourishment / FoodSearch / FoodPhotoJournal — consume nutrition.ts + api.ts.
- AccountabilityCircle.tsx — partner circles (recently re-themed to brand lavender/pink).
- OnboardingFlow.tsx  — first-run; writes profile to store + api.

## Change-impact edges (edit X → also check Y)
- store.ts shape change        → re-grep every `useStore`/`store.` consumer (all screens).
- api.ts endpoint/path change  → screens importing from lib/api.ts.
- device-id.ts format change   → cloudflare-worker/index.js (both sides must
                                 agree on the same pattern, or every request 400s).
- provider-config/llm-config   → all Ai* screens + AISettings + MemoryInsights.
- notifications.ts schedule change → GLP1*, HabitTracker, CycleTracker, SleepTracker.
- nutrition.ts logic change    → Nutrition, MealPlanner, Nourishment, FoodSearch.
- theme token (CSS var) change → landing-page/index.html + any screen using var(--*).
- SettingsScreen change        → smoke-test build + open app.

## Factory vs product
- Factory (stable): lib/, theme tokens, config. Configure once.
- Product (per run): screen-local component state, user data in store/storage.

## Guard rails (dev-agent)
- SAFE edits (deterministic): copy/paste renames, typo fixes, one-line config.
- RISKY (needs George's yes): anything touching store.ts shape, api.ts, auth, build config.
- Never write app source without George's approval on risky edits.
- SIGNING: release credentials live in `android/keystore.properties` (GITIGNORED).
  `android/app/build.gradle` reads them at build time and is a TRACKED file in a
  PUBLIC repo — on 2026-09-20 it publicly leaked the keystore password
  (`GlowFit2026!`) at raw.githubusercontent.com/GeorgeLanders/GlowFit. That value
  is now rotated and dead. NEVER put storePassword/keyPassword back into
  build.gradle. If the properties file is missing, copy
  `android/keystore.properties.example` and fill it in. Back up
  `~/.android/keystores/*.jks` + keystore.properties off-machine.


## Brand assets (launcher icons + store graphics)
- Source mark: `src/assets/icon.svg` (mark-only, NO text — Play/PWA rule).
  Replaced the old lotus; dark tile + neon orbit + reaching figure + star.
- Adaptive foreground: `src/assets/icon-foreground.svg` (transparent mark,
  scaled 0.78 to fit the 169px Android adaptive safe circle).
- Colors pulled verbatim from `src/index.css` tokens: cyan `#28D9F1`, lavender
  `#CE88F7`, pink `#F569B8`, magenta `#C026D3`, violet `#7C3AED`, dark `#1A102F`.
- Regenerate launcher + web icon PNGs: `node generate-icons.cjs` (exit 0).
  Produces `src/assets/icon-192.png`, `icon-512.png`, `favicon-16.png`,
  `favicon-32.png`, `icon.png` (1024), `icon-foreground.png` (432).
- Push icons into Android mipmaps: `node install-android-icons.cjs` (exit 0).
  Writes all densities + `ic_launcher/ic_launcher_round/foreground` under
  `android/app/src/main/res/mipmap-*`. Re-run after any icon.svg/foreground change;
  the AAB picks them up on the next Capacitor/Android build.
- Preview a render: `node render-logo.cjs` renders icon, icon-foreground, logo,
  and feature-graphic previews to `store-assets/` via `@resvg/resvg-bin` +
  skia-redloader-prod.
- Verify renders: `node verify-render.cjs` — re-renders icon + fg under unique
  names + dumps every `store-assets/*.png` IHDR dimension (no text, no clutter).
- Feature graphic: `store-assets/feature-graphic-logo.svg/.png` (exactly 1024×500)
  — dark gradient bg, GLOW FIT wordmark, tagline, 4 feature pills, floating mark.
  - NOTE: `store-assets/feature-graphic.png` (screenshot-based) still holds the Play
    upload slot. To promote the new graphic, copy it over: `cp store-assets/feature-graphic-logo.png store-assets/feature-graphic.png`.
- Store listing: upload `store-assets/logo-preview.png` as the Play/PWA app icon
  graphic where a full logo is expected, `store-assets/feature-graphic-logo.png` as
  the 1024×512 feature graphic. Use the regenerated launcher PNGs (android/mipmap)
  for the AAB.

## Web funnel (live) — verified 2026-09-23
- Studio hub: `https://everbloom-lyla.pages.dev/` — Everbloom IVF Companion (Lyla AI), with sister-app block `💜 Meet GlowFit → /glowfit`.
- GlowFit landing: `https://everbloom-lyla.pages.dev/glowfit` — source `landing-page/index.html` (standalone file, does NOT import app src/).
- GlowFit landing structure: sticky nav (Features / Privacy / Back to Everbloom) → hero pill `✨ Your personal AI fitness coach` → H1 `Glow with every workout` → sub `Track workouts, meals, GLP-1 medication, sleep, and progress — with an AI coach that knows you. Free, private, and beautifully simple.` → CTAs `⬇️ Download Free` + `Explore Features ↓` → AI Coach mock card (Today's Plan / streak / water / GLP-1 logged / kcal + Insight quote) → 9 feature cards (Smart Workouts, Nutrition, GLP-1 Support, AI Coach Glow, Smart Insights, Progress Photos, Hydration & Sleep, Habits & Streaks, Private & Secure) → stats strip (54+ Screens / AI Powered / Free Forever / Private) → CTA `Start glowing today → Get GlowFit Free (→ github.com/GeorgeLanders/GlowFit)` → footer `Built with 💜 by George Landers · GitHub · Privacy Policy · Back to Everbloom`.
- Palette B (landing-page only, bright pastels): `--primary #CE88F7, --secondary #F569B8, --tertiary #28D9F1, --success #79BD7D, --deep-lav #7C3AED, --deep-pink #BE185D, --ink #5B4A66, --bg #F6F1FB`. Fonts: Playfair Display (H1) + Inter (body).
- Known gap: nav brand-mark is still 💜 emoji tile + `Download Free` has no APK/Play href yet — wire to real AAB/APK or Play listing before FB tester push.

## Session log (brand assets)
- 2026-09-22: replaced lotus icon with mark-only neon-orbit/runner icon; created
  adaptive foreground; created 1024×500 feature-graphic-logo; extended render-logo
  to render logo + fg + both icon previews; regenerated all web + Android PNGs;
  verified via verify-render (dimensions + content); vite build passes (EXIT=0).
- 2026-09-23: verified live funnel https://everbloom-lyla.pages.dev/glowfit (hero, 9 features, CTAs) + studio hub cross-link; documented structure + Palette B in CONTEXT.md. Links now live for FB tester post: landing https://everbloom-lyla.pages.dev/glowfit, repo https://github.com/GeorgeLanders/GlowFit.
- 2026-09-23 (FB): built `store-assets/fb-tester-graphic.svg/.png` (1200×630, FB link-post optimal) — left mark + `BETA TESTERS WANTED` pill + `GLOW FIT / WORKOUT. SHINE. THRIVE.` + professional inside copy `Your AI-Powered Fitness Companion` + `Workouts - Nutrition - GLP-1 - Sleep - Progress` + `Join the Journey` CTA. Use as the single attached image for the tester post.
  Remaining: promote feature-graphic-logo.png to feature-graphic.png (deploy choice),
  rebuild AAB so new mipmaps ship, upload store graphics to Play Console.