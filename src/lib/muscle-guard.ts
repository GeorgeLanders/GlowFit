// lib/muscle-guard.ts — Muscle Guard: GLP-1 muscle-preservation layer.
//
// Clinical basis (2026): GLP-1 weight loss is 20-30% lean mass without
// intervention. Guidance: 1.2-1.6 g protein/kg/day + progressive resistance
// training >=3x/week. Pure on-device math; no PHI leaves the app.

import type { CalorieLog, WorkoutLog } from '../types';

export interface MuscleGuardTargets {
  proteinMinG: number;  // 1.2 g/kg
  proteinIdealG: number; // 1.6 g/kg
  resistanceDaysPerWeek: number;
}

/** Protein target from body weight (kg). Only meaningful on GLP-1 / weight-loss goal. */
export function muscleGuardTargets(weightKg: number): MuscleGuardTargets {
  return {
    proteinMinG: Math.round(1.2 * weightKg),
    proteinIdealG: Math.round(1.6 * weightKg),
    resistanceDaysPerWeek: 3,
  };
}

/** Sum protein (g) logged for a given date string (YYYY-MM-DD). */
export function todayProteinG(logs: CalorieLog[], date: string): number {
  return logs
    .filter((l) => l.date === date)
    .reduce((sum, l) => sum + (l.food?.protein ?? 0) * l.quantity, 0);
}

export interface StrengthProgress {
  weekVolume: number;      // total weight lifted this week (sum of weight*reps*sets)
  prevWeekVolume: number;
  pctChange: number | null; // null when no prior data
  strengthDaysThisWeek: number;
}

/** Weekly strength progression from workout logs. */
export function weeklyStrengthProgress(workouts: WorkoutLog[]): StrengthProgress {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const weekKey = startOfWeek.toISOString().slice(0, 10);
  const prevStart = new Date(startOfWeek);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevKey = prevStart.toISOString().slice(0, 10);
  const prevEnd = weekKey;

  const volume = (w: WorkoutLog): number =>
    (w.sets ?? []).reduce(
      (s: number, set) => s + (set.weight ?? 0) * (set.reps ?? 0) * (set.sets ?? 1),
      0
    );

  const inRange = (d: string, lo: string, hi?: string) =>
    d >= lo && (hi === undefined || d < hi);

  const isStrength = (w: WorkoutLog) => w.type === 'strength';
  const thisWeek = workouts.filter((w) => inRange(w.date, weekKey) && isStrength(w));
  const lastWeek = workouts.filter((w) => inRange(w.date, prevKey, prevEnd) && isStrength(w));
  const weekVol = thisWeek.reduce((s, w) => s + volume(w), 0);
  const prevVol = lastWeek.reduce((s, w) => s + volume(w), 0);
  const pct = prevVol > 0 ? ((weekVol - prevVol) / prevVol) * 100 : null;
  return {
    weekVolume: Math.round(weekVol),
    prevWeekVolume: Math.round(prevVol),
    pctChange: pct === null ? null : Math.round(pct * 10) / 10,
    strengthDaysThisWeek: new Set(thisWeek.map((w) => w.date)).size,
  };
}

/** High-protein quick suggestions for the nudge. */
export const PROTEIN_SUGGESTIONS = [
  { name: 'Greek yogurt (200g)', proteinG: 18 },
  { name: '2 boiled eggs', proteinG: 12 },
  { name: 'Protein shake (1 scoop)', proteinG: 25 },
  { name: 'Cottage cheese (1 cup)', proteinG: 25 },
  { name: 'Chicken breast (100g)', proteinG: 31 },
  { name: 'Tin of tuna', proteinG: 20 },
];

/** Pick a suggestion that roughly covers the remaining gap. */
export function suggestProtein(gapG: number) {
  const sorted = [...PROTEIN_SUGGESTIONS].sort((a, b) => a.proteinG - b.proteinG);
  return sorted.find((s) => s.proteinG >= gapG) ?? sorted[sorted.length - 1];
}
