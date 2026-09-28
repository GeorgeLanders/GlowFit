import type { WorkoutLog, SleepLog, WaterLog, WellnessLog } from '../types';

export interface RecoveryPillar {
  name: string;
  score: number; // 0 - 100
  weight: number; // multiplier / percentage
  label: string;
  detail: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
}

export interface MuscleRecoveryState {
  group: string;
  status: 'recovered' | 'recovering' | 'fatigued';
  lastWorkedDaysAgo: number | null;
  workoutCountRecent: number;
}

export interface RecoveryAssessment {
  score: number; // 0 - 100
  status: 'prime' | 'recovered' | 'moderate' | 'fatigued';
  badge: string;
  summary: string;
  recommendation: string;
  pillars: {
    sleep: RecoveryPillar;
    strain: RecoveryPillar;
    hydration: RecoveryPillar;
    wellness: RecoveryPillar;
  };
  muscleStates: MuscleRecoveryState[];
}

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
] as const;

export type MuscleGroupName = (typeof MUSCLE_GROUPS)[number];

// Helper: difference in calendar days between two ISO date strings (or YYYY-MM-DD)
export function daysBetween(dateStrA: string, dateStrB: string): number {
  const d1 = new Date(dateStrA.split('T')[0] ?? '');
  const d2 = new Date(dateStrB.split('T')[0] ?? '');
  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  return Math.round(diffMs / 86400000);
}

// Map exercise names / workout types to primary muscle groups
export function inferMuscleGroups(workout: WorkoutLog): Set<MuscleGroupName> {
  const matched = new Set<MuscleGroupName>();
  const text = (
    workout.name +
    ' ' +
    workout.notes +
    ' ' +
    workout.sets.map((s) => s.exerciseName).join(' ')
  ).toLowerCase();

  if (text.match(/chest|bench|push-up|pushup|fly|pec/)) matched.add('Chest');
  if (text.match(/back|pull-up|pullup|row|lat|deadlift|pulldown/)) matched.add('Back');
  if (text.match(/leg|squat|lunge|quad|hamstring|calf|calves|press|hip thrust/)) matched.add('Legs');
  if (text.match(/shoulder|overhead|press|deltoid|face pull|lateral raise/)) matched.add('Shoulders');
  if (text.match(/arm|bicep|tricep|curl|dip|skull crusher/)) matched.add('Arms');
  if (text.match(/core|ab|abs|plank|twist|crunch/)) matched.add('Core');

  if (matched.size === 0) {
    if (workout.type === 'cardio') {
      matched.add('Legs');
      matched.add('Core');
    } else if (workout.type === 'strength') {
      matched.add('Chest');
      matched.add('Arms');
    }
  }

  return matched;
}

/**
 * Calculates a 0-100 sleep pillar score based on duration and quality rating.
 */
export function calculateSleepScore(sleepLogs: SleepLog[], todayStr: string): RecoveryPillar {
  const recentSleep = sleepLogs
    .filter((l) => daysBetween(l.date, todayStr) <= 1)
    .sort((a, b) => (a.date > b.date ? -1 : 1))[0];

  if (!recentSleep) {
    return {
      name: 'Sleep',
      score: 72,
      weight: 0.35,
      label: 'No log yet',
      detail: '7h baseline estimated',
      status: 'good',
    };
  }

  let hours = 7.5;
  if (recentSleep.bedTime && recentSleep.wakeTime) {
    const [bH, bM] = recentSleep.bedTime.split(':').map(Number);
    const [wH, wM] = recentSleep.wakeTime.split(':').map(Number);
    if (!Number.isNaN(bH) && !Number.isNaN(wH)) {
      let diff = (wH! * 60 + (wM || 0)) - (bH! * 60 + (bM || 0));
      if (diff < 0) diff += 24 * 60;
      hours = Math.max(3, Math.min(12, diff / 60));
    }
  }

  let durationScore = 100;
  if (hours < 8) {
    durationScore = Math.max(20, Math.round(100 - (8 - hours) * 20));
  } else if (hours > 9.5) {
    durationScore = Math.max(80, Math.round(100 - (hours - 9.5) * 15));
  }

  const qualityScore = recentSleep.quality
    ? Math.round((recentSleep.quality / 5) * 100)
    : 75;

  const total = Math.round(durationScore * 0.6 + qualityScore * 0.4);
  const status =
    total >= 85 ? 'optimal' : total >= 70 ? 'good' : total >= 55 ? 'moderate' : 'low';

  return {
    name: 'Sleep Rest',
    score: total,
    weight: 0.35,
    label: `${hours.toFixed(1)} hrs`,
    detail: `${recentSleep.quality ? `Rated ${recentSleep.quality}/5` : 'Estimated restful sleep'}`,
    status,
  };
}

/**
 * Calculates a 0-100 strain balance pillar score.
 */
export function calculateStrainScore(workouts: WorkoutLog[], todayStr: string): RecoveryPillar {
  const past3DaysWorkouts = workouts.filter((w) => daysBetween(w.date, todayStr) <= 3);
  const totalMinutes = past3DaysWorkouts.reduce((acc, w) => acc + (w.duration || 45), 0);
  const count = past3DaysWorkouts.length;

  let score = 95;
  if (totalMinutes > 210 || count >= 4) {
    score = 42;
  } else if (totalMinutes > 150 || count === 3) {
    score = 62;
  } else if (totalMinutes > 80 || count === 2) {
    score = 80;
  } else if (totalMinutes > 0) {
    score = 90;
  }

  const status =
    score >= 85 ? 'optimal' : score >= 70 ? 'good' : score >= 55 ? 'moderate' : 'low';

  return {
    name: 'Strain & Load',
    score,
    weight: 0.30,
    label: `${count} session${count === 1 ? '' : 's'}`,
    detail: `${totalMinutes}m logged in last 3 days`,
    status,
  };
}

/**
 * Calculates a 0-100 hydration pillar score based on today's intake vs 2000ml goal.
 */
export function calculateHydrationScore(
  waterLogs: WaterLog[],
  todayStr: string,
  targetMl = 2000
): RecoveryPillar {
  const todayMl = waterLogs
    .filter((l) => l.date === todayStr)
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const ratio = Math.min(1.2, todayMl / targetMl);
  const score = Math.min(100, Math.round(ratio * 100));

  const status =
    score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 35 ? 'moderate' : 'low';

  return {
    name: 'Hydration',
    score,
    weight: 0.20,
    label: `${todayMl} ml`,
    detail: `${Math.round((todayMl / targetMl) * 100)}% of ${targetMl}ml goal`,
    status,
  };
}


/**
 * Calculates a 0-100 subjective energy/mood pillar score from wellness logs.
 */
export function calculateWellnessScore(
  wellnessLogs: WellnessLog[],
  todayStr: string
): RecoveryPillar {
  const recent = wellnessLogs
    .filter((l) => daysBetween(l.date, todayStr) <= 1)
    .sort((a, b) => (a.date > b.date ? -1 : 1))[0];

  if (!recent) {
    return {
      name: 'Energy & Stress',
      score: 75,
      weight: 0.15,
      label: 'Balanced',
      detail: 'Standard baseline',
      status: 'good',
    };
  }

  const energy = recent.energy ?? 3;
  const stress = recent.stress ?? 3;
  const mood = recent.mood ?? 3;

  const composite = (energy / 5) * 0.45 + (mood / 5) * 0.35 + ((6 - stress) / 5) * 0.20;
  const score = Math.round(composite * 100);

  const status =
    score >= 80 ? 'optimal' : score >= 65 ? 'good' : score >= 50 ? 'moderate' : 'low';

  return {
    name: 'Energy & Stress',
    score,
    weight: 0.15,
    label: `${energy}/5 Energy`,
    detail: `Stress: ${stress}/5 · Mood: ${mood}/5`,
    status,
  };
}

/**
 * Computes individual recovery state per major muscle group from workout history.
 */
export function computeMuscleStates(
  workouts: WorkoutLog[],
  todayStr: string
): MuscleRecoveryState[] {
  return MUSCLE_GROUPS.map((group) => {
    let lastDays: number | null = null;
    let recentHits = 0;

    for (const w of workouts) {
      const diff = daysBetween(w.date, todayStr);
      if (diff > 7) continue;

      const muscles = inferMuscleGroups(w);
      if (muscles.has(group)) {
        if (lastDays === null || diff < lastDays) {
          lastDays = diff;
        }
        if (diff <= 3) {
          recentHits++;
        }
      }
    }

    let status: 'recovered' | 'recovering' | 'fatigued' = 'recovered';
    if (lastDays === 0 || (lastDays === 1 && recentHits >= 2)) {
      status = 'fatigued';
    } else if (lastDays !== null && lastDays <= 2) {
      status = 'recovering';
    }

    return {
      group,
      status,
      lastWorkedDaysAgo: lastDays,
      workoutCountRecent: recentHits,
    };
  });
}

/**
 * Synthesizes all pillars into a comprehensive daily readiness assessment.
 */
export function computeRecoveryAssessment(params: {
  workouts: WorkoutLog[];
  sleepLogs: SleepLog[];
  waterLogs: WaterLog[];
  wellnessLogs: WellnessLog[];
  todayStr?: string;
}): RecoveryAssessment {
  const todayStr = params.todayStr ?? new Date().toISOString().split('T')[0] ?? '';

  const sleep = calculateSleepScore(params.sleepLogs, todayStr);
  const strain = calculateStrainScore(params.workouts, todayStr);
  const hydration = calculateHydrationScore(params.waterLogs, todayStr);
  const wellness = calculateWellnessScore(params.wellnessLogs, todayStr);

  const weightedScore = Math.round(
    sleep.score * sleep.weight +
      strain.score * strain.weight +
      hydration.score * hydration.weight +
      wellness.score * wellness.weight
  );

  const score = Math.max(15, Math.min(100, weightedScore));

  let status: 'prime' | 'recovered' | 'moderate' | 'fatigued';
  let badge: string;
  let summary: string;
  let recommendation: string;

  if (score >= 85) {
    status = 'prime';
    badge = 'Optimal Readiness';
    summary = 'Your body is fully charged and primed for high-intensity output.';
    recommendation =
      'Prime day for personal records, heavy compound lifts, or high-intensity intervals.';
  } else if (score >= 70) {
    status = 'recovered';
    badge = 'Well Recovered';
    summary = 'Good physical balance with healthy capacity for standard training.';
    recommendation =
      'Great state for your programmed workout or moderate cardio. Maintain hydration.';
  } else if (score >= 50) {
    status = 'moderate';
    badge = 'Moderate Capacity';
    summary = 'Mild fatigue or suboptimal rest detected. Pacing is advised.';
    recommendation =
      'Opt for technique work, active recovery, or scale back volume by 15-20%.';
  } else {
    status = 'fatigued';
    badge = 'Rest Advised';
    summary = 'Accumulated strain or low sleep indicates your body needs time to rebuild.';
    recommendation =
      'Focus on full rest, sleep extension, gentle mobility work, and nutrient-dense meals.';
  }

  const muscleStates = computeMuscleStates(params.workouts, todayStr);

  return {
    score,
    status,
    badge,
    summary,
    recommendation,
    pillars: {
      sleep,
      strain,
      hydration,
      wellness,
    },
    muscleStates,
  };
}

