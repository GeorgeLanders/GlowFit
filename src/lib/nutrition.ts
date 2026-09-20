// lib/nutrition.ts — on-device nutrition calculators for GlowFit.
//
// Formulas ported from the fitness-nutrition skill (official, MIT):
// Mifflin-St Jeor TDEE, macro splits, Epley/Brzycki 1RM.
// Pure functions, no dependencies — runs fully on-device, no PHI leaves the app.

import type { Profile } from '../types';

// ─── Activity multipliers ────────────────────────────────────────────

const ACTIVITY_MULTIPLIER: Record<Profile['activityLevel'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// ─── BMR / TDEE ──────────────────────────────────────────────────────

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function bmr(profile: Pick<Profile, 'gender'> & {
  weightKg: number; heightCm: number; age: number;
}): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.gender === 'male') return Math.round(base + 5);
  if (profile.gender === 'female') return Math.round(base - 161);
  return Math.round(base - 78); // midpoint for 'other'
}

/** Total daily energy expenditure from activity level. */
export function tdee(
  profile: Pick<Profile, 'gender' | 'activityLevel'> & {
    weightKg: number; heightCm: number; age: number;
  }
): number {
  const b = bmr(profile);
  return Math.round(b * ACTIVITY_MULTIPLIER[profile.activityLevel]);
}

/** Calorie target adjusted for goal. Lose = −500, gain = +300, maintain = 0. */
export function calorieTarget(
  profile: Pick<Profile, 'gender' | 'activityLevel' | 'goal'> & {
    weightKg: number; heightCm: number; age: number;
  }
): number {
  const t = tdee(profile);
  if (profile.goal === 'lose') return Math.max(1200, t - 500); // floor for safety
  if (profile.goal === 'gain') return t + 300;
  return t;
}

// ─── Macros ──────────────────────────────────────────────────────────

export interface MacroSplit { proteinG: number; carbsG: number; fatG: number; kcal: number }

/**
 * Macro split by goal (grams/day):
 *  lose:    high-protein 35/35/30 (preserves muscle in deficit)
 *  maintain balanced 30/40/30
 *  gain:    25/50/25 (carb-forward for training)
 */
export function macros(kcal: number, goal: Profile['goal']): MacroSplit {
  const pct =
    goal === 'lose' ? { p: 0.35, c: 0.35, f: 0.30 } :
    goal === 'gain' ? { p: 0.25, c: 0.50, f: 0.25 } :
                      { p: 0.30, c: 0.40, f: 0.30 };
  return {
    proteinG: Math.round((kcal * pct.p) / 4),
    carbsG: Math.round((kcal * pct.c) / 4),
    fatG: Math.round((kcal * pct.f) / 9),
    kcal,
  };
}

/** Full daily plan from a profile in one call. */
export function dailyNutritionPlan(profile: Omit<Profile, 'height'> & { heightCm?: number }): {
  bmr: number; tdee: number; target: number; macros: MacroSplit;
} {
  const weightKg = (profile as any).weightKg ?? profile.currentWeight;
  // Profile stores height as `height` (cm); accept both for safety
  const heightCm = profile.heightCm ?? (profile as any).height;
  const p = {
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    weightKg,
    heightCm,
    age: profile.age,
  };
  const target = calorieTarget(p);
  return { bmr: bmr(p), tdee: tdee(p), target, macros: macros(target, profile.goal) };
}

// ─── Strength ────────────────────────────────────────────────────────

/** Estimated one-rep max; averages Epley and Brzycki (converge ≤6 reps). */
export function oneRepMax(weightLifted: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightLifted;
  const epley = weightLifted * (1 + reps / 30);
  const brzycki = weightLifted * (36 / (37 - Math.min(reps, 36)));
  return Math.round((epley + brzycki) / 2);
}

/** Training-percentage table from a 1RM (warmup through peak set). */
export function trainingPercentages(orm: number): { label: string; pct: number; kg: number }[] {
  const rows: [string, number][] = [
    ['Warm-up', 0.5], ['Endurance', 0.65], ['Hypertrophy', 0.75],
    ['Strength', 0.85], ['Peak', 0.95],
  ];
  return rows.map(([label, pct]) => ({ label, pct, kg: Math.round(orm * pct) }));
}

/** Water intake estimate (liters/day): 33ml per kg, +0.5L per workout hour. */
export function waterIntake(weightKg: number, workoutHours = 0): number {
  return +(weightKg * 0.033 + workoutHours * 0.5).toFixed(1);
}
