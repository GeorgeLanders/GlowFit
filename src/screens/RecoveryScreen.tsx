import { useMemo } from 'react';
import { useGlowFitStore } from '../lib/store';
import {
  computeRecoveryAssessment,
  type MuscleRecoveryState,
} from '../lib/recovery-score';
import {
  BatteryCharging,
  Moon,
  Flame,
  Droplets,
  HeartPulse,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Dumbbell,
} from 'lucide-react';

export default function RecoveryScreen() {
  const workouts = useGlowFitStore((s) => s.workouts);
  const sleepLogs = useGlowFitStore((s) => s.sleepLogs);
  const waterLogs = useGlowFitStore((s) => s.waterLogs);
  const wellnessLogs = useGlowFitStore((s) => s.wellnessLogs);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  const assessment = useMemo(() => {
    return computeRecoveryAssessment({
      workouts,
      sleepLogs,
      waterLogs,
      wellnessLogs,
    });
  }, [workouts, sleepLogs, waterLogs, wellnessLogs]);

  const { score, status, badge, summary, recommendation, pillars, muscleStates } =
    assessment;

  const scoreTheme = useMemo(() => {
    if (score >= 85) {
      return {
        text: 'text-emerald-500 dark:text-emerald-400',
        stroke: '#10b981',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-800/40',
      };
    }
    if (score >= 70) {
      return {
        text: 'text-violet-500 dark:text-violet-400',
        stroke: '#8b5cf6',
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        border: 'border-violet-200 dark:border-violet-800/40',
      };
    }
    if (score >= 50) {
      return {
        text: 'text-amber-500 dark:text-amber-400',
        stroke: '#f59e0b',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/40',
      };
    }
    return {
      text: 'text-rose-500 dark:text-rose-400',
      stroke: '#f43f5e',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/40',
    };
  }, [score]);

  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;



  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-rose-900 dark:text-rose-200">
            Recovery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Whoop & Oura-grade physiological readiness
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${scoreTheme.bg} ${scoreTheme.border} ${scoreTheme.text} border`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
      </div>

      {/* Main Readiness Gauge Card */}
      <div className="card-3d rounded-3xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Animated SVG Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                fill="transparent"
                stroke={scoreTheme.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold font-serif tracking-tight text-slate-800 dark:text-slate-100 tnum">
                {score}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Score
              </span>
            </div>
          </div>

          {/* Assessment Narrative */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <BatteryCharging className={`w-5 h-5 ${scoreTheme.text}`} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {status === 'prime'
                  ? 'Prime Readiness'
                  : status === 'recovered'
                  ? 'Healthy Baseline'
                  : status === 'moderate'
                  ? 'Moderate Fatigue'
                  : 'Rest Advised'}
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {summary}
            </p>
            <div className="pt-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 justify-center sm:justify-start">
              <Info className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{recommendation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Readiness Drivers
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Weighted composite
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sleep Pillar */}
          <div
            onClick={() => pushScreen('sleep-tracker')}
            className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-300">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Sleep Rest
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {pillars.sleep.label} (35% wt)
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum">
                {pillars.sleep.score}%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pillars.sleep.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{pillars.sleep.detail}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Strain Pillar */}
          <div
            onClick={() => pushScreen('workout-logger')}
            className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-300">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Strain Balance
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {pillars.strain.label} (30% wt)
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum">
                {pillars.strain.score}%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pillars.strain.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{pillars.strain.detail}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Hydration Pillar */}
          <div
            onClick={() => pushScreen('water-tracker')}
            className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Hydration
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {pillars.hydration.label} (20% wt)
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum">
                {pillars.hydration.score}%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pillars.hydration.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{pillars.hydration.detail}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Wellness / Stress Pillar */}
          <div
            onClick={() => pushScreen('wellness-tracker')}
            className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Energy & Stress
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {pillars.wellness.label} (15% wt)
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tnum">
                {pillars.wellness.score}%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pillars.wellness.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{pillars.wellness.detail}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>


      {/* Muscle Group Soreness & Readiness Grid */}
      <div className="card-3d rounded-3xl p-5 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Muscle Recovery Status
            </h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Based on logged volume
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {muscleStates.map((m: MuscleRecoveryState) => {
            const isFatigued = m.status === 'fatigued';
            const isRecovering = m.status === 'recovering';
            return (
              <div
                key={m.group}
                className={`p-3 rounded-2xl border transition-all ${
                  isFatigued
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : isRecovering
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {m.group}
                  </span>
                  {isFatigued ? (
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                  ) : isRecovering ? (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {m.lastWorkedDaysAgo === 0
                    ? 'Trained today'
                    : m.lastWorkedDaysAgo === 1
                    ? '1 day ago'
                    : m.lastWorkedDaysAgo !== null
                    ? `${m.lastWorkedDaysAgo} days ago`
                    : 'Fresh / Rested'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

