# AGENTS.md — GlowFit

Capacitor + React 19 + Vite 8 + Tailwind v4 + Zustand app (`com.georgelanders.glowfit`). Web build in `dist/`, Android shell in `android/`, backend in `cloudflare-worker/`.

> The package name was `com.glowfit.app` until 2026-09-28. Google Play rejected it:
> that ID is permanently owned by another developer ("GlowFit: Makeup & Style AI",
> Sorin Constantin Ciornei, ES). Play package names are global and never released,
> so the ID had to change. `appId` (capacitor.config.ts), `applicationId` +
> `namespace` (android/app/build.gradle), `package_name` (res/values/strings.xml),
> and `MainActivity.java`'s package must all move together.


## Commands

- `npm run dev` — Vite dev server. `npm run preview` — serve `dist/`.
- `npm run build` — `tsc -b && vite build`. Always run before `npx cap sync` / APK work.
- `npm run lint` — `oxlint` (config in `.oxlintrc.json`). No test runner in this repo — verify with `build` + `lint`.
- Node asset scripts (run from root): `node generate-icons.cjs` → `node install-android-icons.cjs` (after any `src/assets/icon*.svg` change); `node render-logo.cjs` + `node verify-render.cjs` for store graphics; `node generate-splash.cjs`, `node capture-screenshots.cjs`, `node build-store-assets.cjs`.

## Architecture (non-obvious)

- Navigation is **Zustand-driven, not react-router** (`react-router-dom` is installed but unused for routing). `src/lib/store.ts` holds `activeTab` / `currentScreen` / `pushScreen` / `popScreen`; `src/App.tsx` `MAIN_SCREENS` + `SUB_SCREENS` registry is the route table. New screen = add file in `src/screens/` + register there. Hardware back button pops or minimizes (App.tsx).
- `src/lib/store.ts` (Zustand + `persist` in localStorage) is the single client state. Shape change → grep every `useGlowFitStore` consumer (~57 screens).
- Backend client is `src/lib/api.ts` → `glowfit-api.*.workers.dev`. Every request sends `X-User-Id` from `src/lib/device-id.ts` (per-install UUID, pattern `^[A-Za-z0-9_-]{8,64}$`). **Must match the validator in `cloudflare-worker/index.js`** — if either side drifts, every request 400s. Never restore a `'default'` fallback (it merged all installs into one partition).
- Photo upload contract is JSON `{ filename, data }` with raw base64 from `src/lib/base64.ts` — **not multipart**. The worker parses with `request.json()`.
- `landing-page/index.html` is standalone (deployed to everbloom-lyla.pages.dev/glowfit). It does NOT import `src/` — edits there never touch the app.
- `cloudflare-worker/` (`index.js` + `wrangler.toml`, D1 `glowfit-db` + KV `AI_CACHE`, R2 commented out until enabled in dashboard).

## Conventions / gotchas

- Styling: Tailwind v4. Dark mode is class-based via `@custom-variant dark` in `src/index.css` + `.dark` on `<html>` (`src/lib/useDarkMode.ts`) — do not switch to media-query dark mode or the in-app toggle half-breaks. Design tokens live in `@theme`; `rose-500 (#C026D3)` / `rose-600 (#A21CAF)` are primary-button colors and must keep ≥4.5:1 contrast with white text (pastel tints there made buttons invisible once).
- Fonts are self-hosted `@fontsource` latin subsets, loaded in `src/main.tsx` and declared in `@theme`. Keep family names in sync; don't add CDN font links (app is used offline in gyms).
- TS is strict: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax` — unused vars and enums break `npm run build`.
- Env: `.env` is gitignored; copy `.env.example`. Keys are `VITE_LLM_*` (Cloudflare proxy), `VITE_OLLAMA_*`, `VITE_JARVIS_*`, `VITE_API_URL` (api.ts fallback).
- Android signing: credentials live ONLY in gitignored `android/keystore.properties` (template: `keystore.properties.example`). **Never put passwords in tracked `android/app/build.gradle`** — this public repo previously leaked one. Capacitor `webDir` is `dist`, `backgroundColor #1A102F` prevents white flash on launch (capacitor.config.ts).
- AI screens (`Ai*`, `AgentChat`, `MemoryInsights`, `AISettings`) consume `src/lib/provider-config.ts` + `src/lib/llm-config.ts` (BYOK). Model lists go stale (providers retire models) — the live list comes from "Refresh model list" in AI Settings, not hardcoded arrays.
