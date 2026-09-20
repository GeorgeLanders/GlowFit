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
