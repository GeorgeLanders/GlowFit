# GlowFit — Recommended Upgrades & Features (Research)

Date: 2026-09-19
Method: inline research against primary sources (official Google Play listings, npm registry package metadata). Background agents were unavailable (infra timeouts), so this was done directly.

**Sources actually fetched and read:**
- MyFitnessPal official Google Play listing — https://play.google.com/store/apps/details?id=com.myfitnesspal.android
- Cal AI official Google Play listing — https://play.google.com/store/apps/details?id=com.viraldevelopment.calai
- npm registry package metadata (downloads, maintenance, versions) — https://registry.npmjs.org/-/v1/search?text=capacitor+health-connect / ...capacitor+pedometer

**Could NOT verify against a primary source** (marked where cited):
- Google Health Connect official developer docs — developer.android.com was unreachable from this environment (transport errors on both attempts)
- Wear OS developer docs, Whoop/Strava/Fitbit feature specifics, Hevy feature list (hevy.com renders JS-only; not fetched)

## Summary — top 5

1. **Google Health Connect sync** — one Capacitor plugin away; puts GlowFit data in the Android health ecosystem and pulls real steps/heart-rate/sleep in.
2. **GLP-1 medication tracker upgrade** — MyFitnessPal officially ships dose logging, custom medication reminders, and symptom/side-effect pattern tracking; GlowFit has the toggle and dashboards but no dose log. (Already approved by you — this research validates it.)
3. **Live OTA updates (Capgo)** — ship JS-only updates to devices without full APK rebuilds; directly removes the "rebuilt but didn't see the change" friction from this session.
4. **Food memory + photo-logging hardening** — Cal AI's core differentiator is 3-second photo logging with remembered frequent meals; GlowFit has the pieces (FoodPhotoJournal, camera, FoodSearch) — wire them together and always let users confirm AI estimates.
5. **Intermittent fasting tracker** — a core premium feature for MyFitnessPal; small subsystem (eating-window timer + notification) that GlowFit lacks entirely.

## Prioritized table

| # | Feature | Why (source) | How | Effort |
|---|---|---|---|---|
| 1 | Google Health Connect sync | MFP lists "Connect 40+ fitness trackers, smartwatches & health apps" [MFP Play listing]; Health Connect is the Android-side standard [unverified: official docs unreachable] | `@capgo/capacitor-health` (106k dl/mo, HealthKit + Health Connect, MPL-2.0, v8.11.3, updated 2026-09-16) or `capacitor-health` (45k dl/mo, MIT) — both verified on npm | M |
| 2 | GLP-1 dose log + reminders + symptom tracking | MFP: "Log & track how you feel on your GLP-1 medications to spot patterns in symptoms & side effects… custom reminders for your GLP-1 medication" [MFP Play listing] | Extend store.ts medication shape (needs your approval — RISKY edge) + notifications.ts scheduling + a GLP1Dashboard section | M |
| 3 | Live OTA updates | Avoids Play-Store-review cycles for JS changes; `@capgo/capacitor-updater` 1.1M dl/mo, updated 2026-09-19 [npm] | Install plugin + Capgo account; wire into CI | S |
| 4 | Food memory + photo-log hardening | Cal AI: "Food Memory: Your food diary remembers your frequent meals", 3-second snap logging [Cal AI Play listing]; reviews warn photo estimates fluctuate for the same food [Cal AI reviews] | Add frequent-meal suggestions to FoodPhotoJournal; always show editable AI estimate before saving | S |
| 5 | Intermittent fasting tracker | MFP ships "intermittent fasting tracker" as a core feature [MFP Play listing] | New FastingTracker screen: eating-window timer + notifications.ts reminder | M |
| 6 | Pedometer step tracking | Real steps beat manual entry; MFP: "Log workouts & steps with the integrated fitness tracker" [MFP Play listing] | `@capgo/capacitor-pedometer` (93k dl/mo, steps/distance/pace/cadence/floors, updated 2026-09-15) [npm] | S |
| 7 | Recovery/readiness score | Whoop-style readiness is the top-app differentiator [unverified: Whoop docs not fetched] | Heuristic score from data GlowFit already tracks (sleep + workouts + wellness logs) — no wearable needed for v1 | M |
| 8 | Social challenges / leaderboards | MFP: "Find friends & motivation in the MyFitnessPal community" [MFP Play listing] | Extend AccountabilityCircle + Cloudflare backend (D1) with weekly challenges | L |
| 9 | Wear OS companion | MFP: "Wear OS support – calorie tracker, water tracker & macro tracker on your wrist… tiles… complications" [MFP Play listing] | Native Kotlin module — separate from the Capacitor app | L |

## Detail per recommendation

### 1. Google Health Connect sync (Quick win)
Health Connect is Android's central health-data store; apps read/write steps, heart
rate, sleep sessions, and workouts with user consent. Two maintained Capacitor
plugins exist (verified on npm): `@capgo/capacitor-health` — 106,264 monthly
downloads, supports Apple HealthKit AND Health Connect, MPL-2.0, v8.11.3 updated
2026-09-16 — and `capacitor-health` (MIT, 45,852 monthly). A dedicated
`capacitor-health-connect` (ubie-oss, Apache-2.0) is Android-only at 3,789 monthly.
Impact: steps/heart-rate/sleep flow into HeartRate, SleepTracker, and Recovery
automatically; workouts logged in GlowFit appear in the ecosystem. Caution: I could
not reach developer.android.com from this environment — verify permission
declarations against the official docs before shipping.

### 2. GLP-1 medication tracker upgrade (Quick win — already approved)
MyFitnessPal's listing states it directly: "Log & track how you feel on your GLP-1
medications to spot patterns in your symptoms & side effects" and "Stick to your
schedule with custom reminders for your GLP-1 medication". GlowFit has the GLP-1
toggle (onboarding), GLP1Dashboard/GLP1Settings screens, and GLP-1 reminders in
notifications.ts — but no dose log. Build: medication list (name, dose, schedule),
taken/missed states, symptom notes per dose, correlation view against nutrition and
workouts. This matches your approved spec: reminders AND exercise-guidance
adjustment. Note: touches store.ts shape — your explicit yes required (RISKY edge).

### 3. Live OTA updates via Capgo (Quick win)
`@capgo/capacitor-updater` (1,145,882 monthly downloads, MPL-2.0, updated
2026-09-19) ships JavaScript bundle updates over the air, so CSS/JS changes reach
installed devices without a full APK rebuild or Play review. Directly addresses the
friction hit in this session: web builds land in dist/ but the APK serves its own
asset copy — OTA updates close that loop for non-native changes.

### 4. Food memory + photo-log hardening (Quick win)
Cal AI's listing centers on speed and memory: "Just snap a photo and our smart AI
calorie tracker analyzes your meal instantly" and "Food Memory: Your food diary
remembers your frequent meals". GlowFit has FoodPhotoJournal, camera bridge,
FoodSearch, and the Cloudflare backend. Add frequent-meal quick-add chips and a
recent-meals rail. Review caution from Cal AI users: photo estimates "wildly
fluctuate in macros and calories" for the same food — always require a confirm/edit
step before an AI estimate is saved.

### 5. Intermittent fasting tracker (Quick win/M)
MyFitnessPal ships an "intermittent fasting tracker" as a first-class feature
[bMFP Play listing]. GlowFit has nothing here. Minimal build: 16:8/18:6/custom
eating windows, start/stop timer, daily notification reminders via notifications.ts,
fasting history in Trends.

### 6. Pedometer step tracking (Quick win)
`@capgo/capacitor-pedometer` (93,311 monthly downloads, MPL-2.0, v8.0.41, updated
2026-09-15) exposes steps, distance, pace, cadence, and floors. Real step counts
replace manual entry in the Dashboard's activity tile and feed Recovery scoring.

### 7. Recovery/readiness score (Big bet)
Readiness scores are the flagship differentiator of wearable-first apps (Whoop
style) [unverified against Whoop's own docs]. A v1 heuristic can ship with data
GlowFit already collects: sleep duration/quality (SleepTracker), workout load
(WorkoutLogger), mood/energy (wellness logs). Zero new hardware; progressively
replace with Health Connect/heart-rate inputs once #1 lands.

### 8. Social challenges / leaderboards (Big bet)
MyFitnessPal sells community as motivation [MFP Play listing]. GlowFit's
AccountabilityCircle already has partner circles. Add weekly step/workout/streak
challenges with a leaderboard, backed by the existing Cloudflare D1 database.

### 9. Wear OS companion (Big bet)
MyFitnessPal advertises tiles and home-screen complications on Wear OS [MFP Play
listing]. This is native Kotlin work outside the Capacitor app — only worth it
after the phone experience is validated.

## Already covered — do not re-build
Workout logging/timer/templates/programs/progressive-overload; exercise library
with demo videos; nutrition/meal planner/food search/photo journal; water,
weight, body, habit, cycle, sleep, wellness, mental-wellness trackers; breathing
exercises; SOS grounding; heart rate screen; streaks; gamification; trends;
weekly report; AI coach/insights/planner/chat (BYOK); accountability circles;
smart notifications; data export; TDEE calculator.

## One UX warning from the sources
MyFitnessPal's most-liked recent review (38 found-helpful, April 2026): "New UI
changes are AWFUL… Can't view the entire day anymore, everything is hidden in sub
menus. Nutrient info for the day is three menus deep." Lesson for the pending
dashboard redesign: keep today's core numbers on the first screen; put depth one
tap deep, never three.
