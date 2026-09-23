// Captures Play Store screenshots from the real built app.
//
// Runs the production build in headless Chrome at a true 9:16 phone viewport
// (360x640 CSS at deviceScaleFactor 3 == exactly 1080x1920, the Play Store
// standard) and screenshots each screen with realistic demo data.
//
// Demo data is seeded through the store's own persist key before any app script
// runs, and navigation is driven the same way the app persists it (activeTab /
// currentScreen), so no app code needs to change for this to work.
//
// Run with: node capture-screenshots.cjs [dark|light]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.GF_URL || 'http://localhost:4173/';
const STORE_KEY = 'glowfit-storage';

const iso = (d) => d.toISOString().slice(0, 10);
const TODAY = new Date();
const day = (offset) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return iso(d);
};

// ─── Realistic demo data ────────────────────────────────────────────
// A believable cut phase in progress: consistent logging, a downward weight
// trend, meals spread across the day. Empty screens read as a broken app.
const food = (id, name, calories, protein, carbs, fat, fiber, servingSize) => ({
  id, name, calories, protein, carbs, fat, fiber, servingSize,
});

const SEED = {
  profile: {
    name: 'Alex',
    age: 34,
    height: 170,
    currentWeight: 72.4,
    goalWeight: 65,
    gender: 'female',
    activityLevel: 'moderate',
    goal: 'lose',
    glp1User: false,
    onboardingCompleted: true,
  },

  calorieLogs: [
    { id: 'cl1', date: day(0), meal: 'breakfast', quantity: 1, timestamp: Date.now() - 6e6,
      food: food('f1', 'Greek yoghurt & berries', 286, 19, 32, 8, 5, '200g bowl') },
    { id: 'cl2', date: day(0), meal: 'breakfast', quantity: 1, timestamp: Date.now() - 5.9e6,
      food: food('f2', 'Black coffee', 5, 0, 1, 0, 0, '1 cup') },
    { id: 'cl3', date: day(0), meal: 'lunch', quantity: 1, timestamp: Date.now() - 2.4e6,
      food: food('f3', 'Grilled chicken salad', 428, 41, 24, 17, 7, '1 bowl') },
    { id: 'cl4', date: day(0), meal: 'snack', quantity: 1, timestamp: Date.now() - 1.2e6,
      food: food('f4', 'Almonds', 174, 6, 6, 15, 3, '30g') },
  ],

  waterLogs: [
    { id: 'w1', date: day(0), amount: 500, timestamp: Date.now() - 7e6 },
    { id: 'w2', date: day(0), amount: 500, timestamp: Date.now() - 4e6 },
    { id: 'w3', date: day(0), amount: 400, timestamp: Date.now() - 2e6 },
    { id: 'w4', date: day(0), amount: 400, timestamp: Date.now() - 5e5 },
  ],

  workouts: [
    { id: 'wo1', date: day(0), name: 'Upper Body Strength', type: 'strength', duration: 48,
      caloriesBurned: 386, notes: 'Felt strong today.',
      sets: [
        { exerciseName: 'Bench Press', sets: 4, reps: 8, weight: 42.5, completed: true },
        { exerciseName: 'Bent-Over Row', sets: 4, reps: 10, weight: 35, completed: true },
        { exerciseName: 'Shoulder Press', sets: 3, reps: 10, weight: 20, completed: true },
      ] },
    { id: 'wo2', date: day(-1), name: 'Morning Run', type: 'cardio', duration: 32,
      caloriesBurned: 298, notes: '5.2km easy pace.', sets: [] },
    { id: 'wo3', date: day(-2), name: 'Lower Body Strength', type: 'strength', duration: 52,
      caloriesBurned: 412, notes: '', sets: [
        { exerciseName: 'Back Squat', sets: 4, reps: 8, weight: 60, completed: true },
        { exerciseName: 'Romanian Deadlift', sets: 3, reps: 10, weight: 50, completed: true },
      ] },
    { id: 'wo4', date: day(-4), name: 'HIIT Circuit', type: 'hiit', duration: 24,
      caloriesBurned: 264, notes: '', sets: [] },
  ],

  weightLogs: Array.from({ length: 24 }, (_, i) => {
    const offset = -(23 - i);
    return { id: `wt${i}`, date: day(offset),
      weight: +(76.2 - i * 0.16 + (i % 3 === 0 ? 0.18 : 0)).toFixed(1),
      timestamp: new Date(day(offset)).getTime() };
  }),

  wellnessLogs: [
    { id: 'we1', date: day(0), mood: 4, energy: 4, stress: 2, notes: 'Good focus today.' },
    { id: 'we2', date: day(-1), mood: 3, energy: 3, stress: 3, notes: '' },
    { id: 'we3', date: day(-2), mood: 5, energy: 5, stress: 1, notes: 'Best I have felt in weeks.' },
  ],

  sleepLogs: [
    { id: 'sl1', date: day(0), bedTime: '22:45', wakeTime: '06:30', quality: 4, notes: '' },
    { id: 'sl2', date: day(-1), bedTime: '23:20', wakeTime: '06:45', quality: 3, notes: '' },
  ],

  healthSteps: [{ date: day(0), steps: 8420, syncedAt: Date.now() }],

  habits: [
    { id: 'h1', name: 'Drink 2L water', frequency: 'daily', color: 'blue', icon: 'droplet',
      completedDates: [day(0), day(-1), day(-2), day(-3)] },
    { id: 'h2', name: '10k steps', frequency: 'daily', color: 'emerald', icon: 'footprints',
      completedDates: [day(0), day(-1), day(-2)] },
    { id: 'h3', name: 'Strength train', frequency: 'weekly', color: 'violet', icon: 'dumbbell',
      completedDates: [day(0), day(-2), day(-4)] },
    { id: 'h4', name: 'Read 20 mins', frequency: 'daily', color: 'amber', icon: 'book',
      completedDates: [day(0), day(-1)] },
  ],

  streaks: [
    { id: 's1', name: 'Daily logging', currentCount: 18, bestCount: 31, lastCompletedDate: day(0), active: true },
    { id: 's2', name: 'Workouts', currentCount: 6, bestCount: 12, lastCompletedDate: day(0), active: true },
    { id: 's3', name: 'Hydration', currentCount: 11, bestCount: 21, lastCompletedDate: day(0), active: true },
  ],

  measurements: [
    { id: 'm1', date: day(0), chest: 94, waist: 78, hips: 99, arms: 29, thighs: 56, bodyFatPercent: 27.4 },
    { id: 'm2', date: day(-14), chest: 95, waist: 80, hips: 100, arms: 28.5, thighs: 57, bodyFatPercent: 28.6 },
  ],

  chatMessages: [
    { id: 'c1', role: 'user', content: 'I only have 25 minutes today and no gym access. What should I do?',
      timestamp: Date.now() - 6e5 },
    { id: 'c2', role: 'assistant',
      content: '25 minutes is plenty. Try a full-body superset circuit: 4 rounds of squats, push-ups, rows and a plank, 40 seconds on with 20 seconds rest. You have already logged 3 strength sessions this week, so keep the load moderate and focus on tempo. Want me to log it for you?',
      timestamp: Date.now() - 5.4e5 },
  ],

  fastingSettings: { enabled: true, windowHours: 16, reminderMinutesBefore: 30 },
  fastingLogs: [{ id: 'fs1', date: day(0), startedAt: Date.now() - 14 * 36e5, targetHours: 16, completed: false }],

  aiConfig: { mode: 'app-default', provider: 'groq', apiKey: '', baseUrl: '', model: '' },
  seeded: true,
};

// ─── Screens to capture ─────────────────────────────────────────────
// Order matters: this is the order they appear in the store listing.
const TARGETS = [
  { id: '1-dashboard', tab: 'dashboard', screen: null },
  { id: '2-nutrition', tab: 'nutrition', screen: null },
  { id: '3-workouts', tab: 'workouts', screen: null },
  { id: '4-progress', tab: 'progress', screen: null },
  { id: '5-ai-coach', tab: 'dashboard', screen: 'ai-coach' },
  { id: '6-water', tab: 'dashboard', screen: 'water-tracker' },
  { id: '7-weekly-report', tab: 'dashboard', screen: 'weekly-report' },
  { id: '8-profile', tab: 'profile', screen: null },
];

async function main() {
  const theme = (process.argv[2] || 'dark').toLowerCase();
  if (!['dark', 'light'].includes(theme)) throw new Error(`bad theme: ${theme}`);

  const outDir = path.join(__dirname, 'store-assets', `raw-${theme}`);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--hide-scrollbars', '--force-device-scale-factor=3', '--no-sandbox'],
  });

  const page = await browser.newPage();
  // 360x640 CSS at 3x == exactly 1080x1920, which is 9:16 and therefore inside
  // the Play Store's accepted phone range.
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3 });

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160));
  });

  for (const t of TARGETS) {
    const state = { ...SEED, activeTab: t.tab, currentScreen: t.screen };

    // Seeding before load means the app boots straight into the demo state: no
    // flash of onboarding, no first paint without data. Re-registered per target
    // because navigation re-runs it.
    await page.evaluateOnNewDocument(
      (key, payload, th) => {
        window.localStorage.setItem(key, payload);
        window.localStorage.setItem('glowfit-theme', th);
      },
      STORE_KEY,
      JSON.stringify({ state, version: 0 }),
      theme
    );

    await page.goto(URL, { waitUntil: 'networkidle0' });
    // Let the self-hosted fonts settle and the framer-motion entrance
    // animations finish, otherwise screenshots catch cards mid-slide.
    await new Promise((r) => setTimeout(r, 1500));

    const file = path.join(outDir, `${t.id}.png`);
    await page.screenshot({ path: file });
    console.log(`${t.id.padEnd(18)} -> ${path.relative(__dirname, file)}`);
  }

  await browser.close();

  if (errors.length) {
    console.log('\n--- page errors (deduped) ---');
    [...new Set(errors)].slice(0, 8).forEach((e) => console.log('  ' + e));
  } else {
    console.log('\nno page errors');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
