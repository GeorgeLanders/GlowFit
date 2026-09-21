// lib/landing-program.ts — "Landing Program": post-GLP-1 transition support.
//
// Phase 1 (Stabilize, weeks 1-4) state machine. Behavioral support only —
// never medical advice; the UI always routes stopping decisions to the
// prescriber. Clinical basis: appetite rebound typically starts 1-2 weeks
// after the last dose of semaglutide/tirzepatide; regain risk peaks in the
// first 6 months without structured habits. Protein + strength + weight-band
// monitoring are the three evidence-backed anchors.

export type LandingPhaseName = 'activate' | 'stabilize' | 'pause' | 'complete';

export interface LandingState {
  active: boolean;
  medicationName: string;
  lastDoseDate: string; // ISO YYYY-MM-DD
  startWeightKg: number; // weight when program started
  week: number; // 1-4 during stabilize
  completedAt?: string;
}

const KEY = 'glowfit_landing_program';

export function loadLanding(): LandingState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LandingState) : null;
  } catch { return null; }
}

export function saveLanding(s: LandingState | null) {
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
}

export function startLanding(medicationName: string, lastDoseDate: string, weightKg: number): LandingState {
  const s: LandingState = { active: true, medicationName, lastDoseDate, startWeightKg: weightKg, week: 1 };
  saveLanding(s);
  return s;
}

export function currentLandingWeek(state: LandingState): number {
  const start = new Date(state.lastDoseDate).getTime();
  const days = Math.max(0, (Date.now() - start) / 86_400_000);
  return Math.min(4, Math.floor(days / 7) + 1);
}

// Maintenance bandwidth: ±2 kg around start weight (per research consensus on
// acceptable fluctuation during GLP-1 discontinuation).
export function weightBand(state: LandingState): { low: number; high: number } {
  return { low: state.startWeightKg - 2, high: state.startWeightKg + 2 };
}

export type BandStatus = 'inside' | 'above' | 'below' | 'unknown';

export function bandStatus(state: LandingState, currentWeightKg: number | null): BandStatus {
  if (currentWeightKg == null) return 'unknown';
  const b = weightBand(state);
  if (currentWeightKg > b.high) return 'above';
  if (currentWeightKg < b.low) return 'below';
  return 'inside';
}

// Weekly focus content for Phase 1 (Stabilize). Short, plain-English.
export interface StabilizeWeek {
  week: number;
  title: string;
  focus: string;
  actions: string[];
}

export const STABILIZE_WEEKS: StabilizeWeek[] = [
  {
    week: 1, title: 'Week 1 — Expect the shift',
    focus: 'Fullness from the medication starts fading over the next 1–2 weeks. That is physiology, not failure.',
    actions: ['Keep protein at the top of your range every day', 'Eat on a schedule, even without hunger', 'Weigh in once, then put the scale away for the week'],
  },
  {
    week: 2, title: 'Week 2 — Anchor your meals',
    focus: 'Hunger signals return. Structure beats willpower: planned meals at planned times.',
    actions: ['3 meals + 1 planned protein snack, same times daily', 'Keep 3 strength sessions this week', 'Log hunger level once a day (1–5)'],
  },
  {
    week: 3, title: 'Week 3 — Guard the muscle',
    focus: 'Your weight may drift up 1–2 kg. If strength and protein hold, that is mostly water and glycogen, not fat.',
    actions: ['Check weight against your band', 'Push one lift slightly heavier than last week', 'Hit protein target 5 of 7 days'],
  },
  {
    week: 4, title: 'Week 4 — Prove the routine',
    focus: 'You now have 3 weeks of post-medication data. This is your real maintenance baseline.',
    actions: ['Compare this week\'s average weight to start', 'Decide your maintenance calories from the data, not a guess', 'Celebrate: 1 month off-medication, habits intact'],
  },
];
