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

// ═══════════════════════════════════════════════════════════════════
// Phase 2 — Rebuild (weeks 5-12)
// Strength becomes the headline. Maintenance calories computed from the
// user's OWN logged intake + weight drift, not a formula guess.
// ═══════════════════════════════════════════════════════════════════

import type { CalorieLog as _Cal } from '../types';
import type { WeightLog as _W } from '../types';

export const REBUILD_TOTAL_WEEKS = 12; // weeks 5-12 inclusive => landing week 5..12

export function landingPhase(state: LandingState): 'stabilize' | 'rebuild' | 'autonomy' {
  const w = currentLandingWeekTotal(state);
  if (w <= 4) return 'stabilize';
  if (w <= REBUILD_TOTAL_WEEKS) return 'rebuild';
  return 'autonomy';
}

export function currentLandingWeekTotal(state: LandingState): number {
  const start = new Date(state.lastDoseDate).getTime();
  const days = Math.max(0, (Date.now() - start) / 86_400_000);
  return Math.floor(days / 7) + 1;
}

export interface MaintenanceEstimate {
  kcal: number | null;        // null until >= 14 days with both intake + weight data
  confidence: 'low' | 'medium' | 'high';
  daysWithData: number;
  weightDeltaKg: number;      // over the measured window
  explanation: string;
}

// Energy balance: 1 kg of body mass ~ 7700 kcal.
// maintenance = avgDailyIntake + (weightDeltaKg * 7700 / days)
// (if you gained, you ate above maintenance, so true maintenance is LOWER:
//  note sign — gaining means intake exceeded maintenance, so subtract.)
export function estimateMaintenance(
  state: LandingState,
  calorieLogs: _Cal[],
  weightLogs: _W[],
): MaintenanceEstimate {
  const startDate = state.lastDoseDate;
  const logs = calorieLogs.filter((l) => l.date >= startDate);
  const weights = weightLogs
    .filter((w) => w.date >= startDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const daysSet = new Set(logs.map((l) => l.date));
  const daysWithData = daysSet.size;

  if (daysWithData < 7 || weights.length < 2) {
    return {
      kcal: null, confidence: 'low', daysWithData, weightDeltaKg: 0,
      explanation: daysWithData < 7
        ? 'Log food for at least 7 days to compute your real maintenance number.'
        : 'Log at least 2 weights since your last dose to compute maintenance.',
    };
  }

  const totalKcal = logs.reduce((s, l) => s + l.food.calories * l.quantity, 0);
  const avgIntake = totalKcal / daysWithData;

  const spanDays = Math.max(1,
    (new Date(weights[weights.length - 1]!.date).getTime() - new Date(weights[0]!.date).getTime()) / 86_400_000);
  const delta = weights[weights.length - 1]!.weight - weights[0]!.weight;
  const dailySurplus = (delta * 7700) / spanDays;
  const maintenance = Math.round(avgIntake - dailySurplus);

  const confidence: MaintenanceEstimate['confidence'] =
    daysWithData >= 21 && spanDays >= 14 ? 'high' :
    daysWithData >= 14 && spanDays >= 7 ? 'medium' : 'low';

  const dir = delta > 0.3 ? 'gaining slowly' : delta < -0.3 ? 'still losing' : 'holding steady';
  return {
    kcal: maintenance,
    confidence,
    daysWithData,
    weightDeltaKg: Math.round(delta * 10) / 10,
    explanation: `From ${daysWithData} days of your logging: you average ${Math.round(avgIntake)} kcal and are ${dir} (${delta >= 0 ? '+' : ''}${Math.round(delta * 10) / 10} kg). Your real maintenance is about ${maintenance} kcal — that's your data talking, not a formula.`,
  };
}

export interface RebuildWeek {
  week: number; // 5-12
  title: string;
  focus: string;
  actions: string[];
}

export const REBUILD_WEEKS: RebuildWeek[] = [
  {
    week: 5, title: 'Week 5 - Strength takes the lead',
    focus: 'Muscle is now the headline metric. The scale is a supporting character from here on.',
    actions: ['3 strength sessions this week, minimum', 'Protein at target 5 of 7 days', 'Log weight once, mid-week'],
  },
  {
    week: 6, title: 'Week 6 - Find your real number',
    focus: 'Two weeks of your own data beats any calculator. Your maintenance calories are becoming visible.',
    actions: ['Log food most days - accuracy drives the estimate', 'Compare your computed maintenance to what you assumed', 'Keep meals on their schedule'],
  },
  {
    week: 7, title: 'Week 7 - Push one thing',
    focus: 'Pick one lift and add a little weight or one rep. Mastery beats variety right now.',
    actions: ['One personal record attempt on a main lift', 'Protein target every day this week', 'Sleep 7+ hours - recovery drives strength'],
  },
  {
    week: 8, title: 'Week 8 - The plateau test',
    focus: 'Weight stable for two weeks with strength rising means the rebuild is working exactly as designed.',
    actions: ['Check your band - inside means winning', 'Note how clothes fit vs what the scale says', 'Celebrate non-scale wins out loud'],
  },
  {
    week: 9, title: 'Week 9 - Habits on autopilot',
    focus: 'By now protein and training should feel routine, not effortful. If not, shrink the ask, not the habit.',
    actions: ['Identify your weakest anchor and simplify it', 'One enjoyable cardio session you actually like', 'Keep food logging - it powers your number'],
  },
  {
    week: 10, title: 'Week 10 - Plan real life',
    focus: 'Restaurants, travel, stress weeks. Practice maintenance through one disruption on purpose.',
    actions: ['Pick a busy day and pre-plan its protein', 'Use your maintenance number to sanity-check menus', 'No panic after a high day - look at the week, not the day'],
  },
  {
    week: 11, title: 'Week 11 - Teach-back',
    focus: 'Explaining your own system out loud proves you own it. This is how maintenance sticks for years.',
    actions: ['Write down your 3 rules that actually work', 'Check confidence level on your maintenance estimate', 'Strength sessions at full effort'],
  },
  {
    week: 12, title: 'Week 12 - Graduation review',
    focus: 'Twelve weeks off medication with habits intact. This is the outcome most people never get.',
    actions: ['Review your 12-week weight and strength trend', 'Lock in your maintenance number', 'Move to Autonomy: monthly check-ins, not daily'],
  },
];

export function currentRebuildWeek(state: LandingState): RebuildWeek | null {
  const w = currentLandingWeekTotal(state);
  if (w < 5 || w > REBUILD_TOTAL_WEEKS) return null;
  return REBUILD_WEEKS[w - 5] ?? null;
}
