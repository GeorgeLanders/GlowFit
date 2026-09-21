// components/MuscleGuard.tsx — "Muscle Guard" dashboard card.
// Surfaces GLP-1 muscle preservation: protein progress vs 1.6 g/kg target,
// weekly strength trend, and a quick protein-gap suggestion.
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, TrendingDown, Minus, UtensilsCrossed, Dumbbell } from 'lucide-react';
import type { Profile } from '../types';
import { muscleGuardTargets, suggestProtein, type StrengthProgress } from '../lib/muscle-guard';

interface Props {
  profile: Profile;
  proteinTodayG: number;
  strength: StrengthProgress;
  onLogFood: () => void;
  onLogWorkout: () => void;
}

export function MuscleGuardCard({ profile, proteinTodayG, strength, onLogFood, onLogWorkout }: Props) {
  const targets = muscleGuardTargets(profile.currentWeight || 70);
  const pct = Math.min(100, Math.round((proteinTodayG / targets.proteinIdealG) * 100));
  const gap = targets.proteinIdealG - proteinTodayG;
  const suggestion = gap > 15 ? suggestProtein(gap) : null;

  const trendIcon =
    strength.pctChange === null ? <Minus className="w-4 h-4 text-slate-400" /> :
    strength.pctChange >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
    <TrendingDown className="w-4 h-4 text-amber-500" />;
  const trendLabel =
    strength.pctChange === null ? 'baseline week' :
    `${strength.pctChange >= 0 ? '+' : ''}${strength.pctChange}% vs last week`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      aria-label="Muscle Guard — protein and strength protection"
      className="rounded-2xl border border-rose-100/60 dark:border-rose-900/30 bg-gradient-to-br from-rose-50/80 via-white/70 to-violet-50/60 dark:from-rose-950/30 dark:via-slate-800/70 dark:to-violet-950/30 backdrop-blur-sm p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Muscle Guard</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Protect your muscle while you lose</p>
        </div>
      </div>

      {/* Protein bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Protein</span>
          <span className="text-slate-500 dark:text-slate-400">
            {Math.round(proteinTodayG)}g / {targets.proteinIdealG}g
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200/70 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {suggestion && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            {Math.round(gap)}g short — try {suggestion.name} (+{suggestion.proteinG}g)
          </p>
        )}
      </div>

      {/* Strength trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {trendIcon}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Strength {trendLabel}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {strength.strengthDaysThisWeek}/{targets.resistanceDaysPerWeek} strength days
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={onLogFood}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/90 text-white text-xs font-semibold py-2 hover:bg-rose-600 transition-colors"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" /> Log protein
        </button>
        <button
          onClick={onLogWorkout}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-700/90 dark:bg-slate-600 text-white text-xs font-semibold py-2 hover:bg-slate-800 transition-colors"
        >
          <Dumbbell className="w-3.5 h-3.5" /> Log workout
        </button>
      </div>
    </motion.section>
  );
}
