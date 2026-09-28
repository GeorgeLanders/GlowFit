# GlowFit — Google Play Closed Testing & Store Readiness Audit

Last updated: September 28, 2026
App: **GlowFit** (`com.georgelanders.glowfit`)
Target: Google Play Closed Testing Track (Alpha) & Production Access (12 testers for 14 continuous days)

> **Package name changed 2026-09-28.** The app was built as `com.glowfit.app`,
> which Google Play Console rejected with *"This package name is already in use."*
> That ID is permanently owned by another developer — **GlowFit: Makeup & Style
> AI** by Sorin Constantin Ciornei (Málaga, Spain). Play package names are
> global and are never released, so a new ID was required. All references
> (`capacitor.config.ts`, `android/app/build.gradle`, `res/values/strings.xml`,
> `MainActivity.java`) now use `com.georgelanders.glowfit`.

---

## 1. Executive Summary & Readiness Status

| Category | Status | Details |
| :--- | :---: | :--- |
| **Android Build & Sign** | **READY** | `app-release.aab` compiled and signed with release keystore (`glowfit-release.jks`). `compileSdk 36`, `targetSdk 36`, `versionCode 1`, `versionName 1.0`. |
| **Store Listing Copy** | **READY** | Title (under 30 chars), Short Description (79 chars), Full Description formatted and checked against Play policy. |
| **Store Assets** | **READY** | App Icon (512x512 PNG), Feature Graphic (1024x500 PNG), Screenshots (8 light + 8 dark at 1080x1920) generated and verified. |
| **Privacy & Legal** | **READY** | Live Privacy Policy hosted at `https://georgelanders.github.io/glowfit-privacy/`, in-app Privacy Policy accessible, local-first architecture. |
| **Data Safety** | **READY** | Complete answers prepared for the Play Console questionnaire. |
| **Backend & Cloud** | **READY** | Cloudflare Worker + per-install UUID device isolation (`device-id.ts`) verified and deployed. |

---

## 2. Release Asset Locations

All binaries and store assets are compiled and ready on your local workstation:

- **Signed Android App Bundle (AAB)**:
  `C:\Users\George\Desktop\GlowFit\android\app\build\outputs\bundle\release\app-release.aab` (10.36 MB)
- **App Icon (512x512 PNG)**:
  `C:\Users\George\Desktop\GlowFit\src\assets\icon-512.png`
- **Feature Graphic (1024x500 PNG)**:
  `C:\Users\George\Desktop\GlowFit\store-assets\feature-graphic.png` (or `store-assets\feature-graphic-logo.png`)
- **Phone Screenshots (1080x1920 PNG)**:
  - Dark mode set: `C:\Users\George\Desktop\GlowFit\store-assets\phone\dark\` (8 screenshots: Dashboard, Nutrition, Workouts, Progress, AI Coach, Water, Weekly Report, Profile)
  - Light mode set: `C:\Users\George\Desktop\GlowFit\store-assets\phone\light\` (8 screenshots)
- **Beta Tester Recruitment Graphic (1200x630 PNG)**:
  `C:\Users\George\Desktop\GlowFit\store-assets\fb-tester-graphic.png` (Optimized for Facebook/community posts)

---

## 3. Store Listing Copy (Play Console Inputs)

### App Name (max 30 characters)
```text
GlowFit: GLP-1 Muscle Guard
```
(27 characters — fits with room to spare.)

> Console tip: the App name box reported "30 / 30" for a title that is only 29
> characters ("GlowFit - AI Fitness & Health"). That means a stray trailing space
> is sitting in the box. Clear the field and retype, or Play may store the title
> with invisible padding.

**Why the title changed on 2026-09-28.** It was `GlowFit - AI Fitness & Health`.
Play allows two apps to share a display name, but the Impersonation policy bans
titles "so similar to those of existing products or services that users may be
misled." A third-party developer already ships **GlowFit: Makeup & Style AI**
(Málaga, ES), and the `GlowFit` name is further crowded by `glowfit.app` (a
different dev again) and iOS apps of the same name. Adding a functional
descriptor does three things:

- It reads unmistakably as a different product from a makeup app.
- It front-loads the two search terms buyers actually type (`GLP-1`, `muscle`).
- It costs nothing. The store title is editable at any time and is not tied to
  the permanent package name.

**The launcher label stays `GlowFit`** (`app_name` in
`android/app/src/main/res/values/strings.xml`). That mismatch is deliberate and
standard practice - Android truncates long launcher labels, and Play titles
exist to be searched. Spotify, Netflix and others ship short launcher names
with long store titles. Do not "fix" it.

### Short Description (max 80 characters)
```text
GLP-1 fitness companion that protects your muscle - on and after the medication.
```
(Exactly 80 of 80 characters - it fits, but with zero margin. If Console refuses
it, fall back to `GLP-1 fitness companion that protects your muscle.` - 50 chars.)

### Full Description (max 4000 characters)
```text
GlowFit is the fitness companion built for life on - and after - GLP-1 medication.

Most weight-loss apps watch the scale. GlowFit protects what the scale hides: your muscle.

MUSCLE GUARD
GLP-1 medications can cost you 20-30% of lost weight as lean muscle. Muscle Guard keeps that from happening: daily protein targets personalized to your body (1.2-1.6 g/kg), strength-progress tracking, and smart nudges when you fall short - all on one glanceable card.

THE LANDING PROGRAM (A GlowFit Exclusive)
Half of GLP-1 users stop their medication within a year. No other app is waiting for them on the other side. GlowFit's Landing Program walks you through the 6 months after your last dose:
- Phase 1 Stabilize (weeks 1-4): navigate returning appetite with structure, not willpower.
- Phase 2 Rebuild (weeks 5-12): strength becomes the headline, and GlowFit computes your REAL maintenance calories from your own logged data - not a formula guess.
- Phase 3 Autonomy (weeks 13-24+): tapered check-ins, an early-warning system that catches drift two weeks in, and a 365-day stability milestone.

EVERYTHING ELSE A HEALTH JOURNEY NEEDS
- 50+ trackers: workouts, sleep, fasting, water, cycle, heart rate, mood
- AI coach and weekly insights (bring your own API key - your data stays yours)
- Food photo journal and meal planner
- Progress photos and body measurements
- Habit streaks, achievements, accountability circles
- Works offline; syncs when you are back

---

## 4. Play Console App Setup & Data Safety Answers

### App Details & Categorization
- **App Category**: Health & Fitness
- **Tags**: Health, Fitness, Workout Tracker, Diet & Nutrition, Habit Tracker
- **Store Listing Contact**: `georgelanders2@gmail.com`
- **Privacy Policy URL**: `https://georgelanders.github.io/glowfit-privacy/`

### Content Rating Questionnaire
- **Category**: Health & Fitness
- **Violence, Sexual Content, Offensive Language**: No
- **Controlled Substances / Pharmaceuticals**: No (GlowFit is a tracking/lifestyle companion; do not classify as online pharmacy or dispensary)
- **User Interaction**: Features local journal, optional BYOK AI, and optional local circles. Select No to open chat rooms.

### Target Audience & Content
- **Target Age Group**: 18 and older
- **Appeal to Children**: No

### Data Safety Form
- **Does your app collect or share user data?**:
  - If using only local storage & BYOK AI: Select **No** (Local-only on device, not collected or shared by developer).
  - Note: Data remains on-device via local storage and SQLite. Photos stored via cloud backup use per-device encrypted keys with zero account correlation.
- **Is all user data collected by your app encrypted in transit?**: Yes (all network traffic is HTTPS).
- **Do you provide a way for users to request that their data be deleted?**: Yes (Settings > Delete All My Data wipes local databases permanently).

---

## 5. Google Play Closed Testing Checklist (The 12-Tester / 14-Day Rule)

Because personal developer accounts created after Nov 13, 2023 require testing verification:
1. **Navigate in Play Console**: `Testing` > `Closed testing` > `Alpha` (or create new track).
2. **Create New Release**:
   - Upload: `android/app/build/outputs/bundle/release/app-release.aab`
   - Release name: `1.0 (1)`
   - Release notes:
     ```text
     Initial closed beta release of GlowFit - your GLP-1 and fitness companion with Muscle Guard, Recovery Assessment, and offline tracking.
     ```
3. **Configure Testers**:
   - Create an email list called `GlowFit Testers`.
   - Add at least 15–20 tester Google emails (Sandra, family, testers recruited via Facebook/communities).
   - Enter feedback email: `georgelanders2@gmail.com`.
4. **Distribute Opt-In Link**:
   - Once the track is saved and approved by Google, copy the "Join on Android" / "Join on the web" link.
   - Testers MUST open the link, click **Become a Tester**, download the app from Google Play, and open it.
   - The 14-day clock starts once **12 testers have actively installed and opted in**.


PRIVATE BY DESIGN
Your health data lives on your phone. No account required. AI features use your own API key, so even we never see your conversations.

MEDICAL DISCLAIMER
GlowFit is a behavioral companion, not a medical device. Always make medication decisions in consultation with your prescribing physician.
```
