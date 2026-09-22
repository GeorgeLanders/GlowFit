import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useGlowFitStore } from '../lib/store';
import { Flame, Droplets, Moon, TrendingUp, Footprints, Target, Brain, Bed, Heart, Zap, BarChart3, Activity, Calendar, Award, Syringe, Camera, UtensilsCrossed, Timer, Pill, Sparkles, CalendarCheck, Dumbbell, HeartPulse, RefreshCw, Trophy, Image as ImageIcon, BookOpen, PlaneLanding, KeyRound } from 'lucide-react';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';
import { notifications } from '../lib/notifications';
import { MuscleGuardCard } from '../components/MuscleGuard';
import { todayProteinG, weeklyStrengthProgress } from '../lib/muscle-guard';
import { PullToRefresh } from '../components/PullToRefresh';

// Feature grid entries. Kept at module scope so the "See all" toggle can count them.
const FEATURES: { icon: React.ElementType; label: string; screen: string; color: string }[] = [
  /* Feature tiles are grouped into six semantic colour families so the grid
     reads as organised rather than random. Families: violet = AI,
     rose = mind & wellbeing, emerald = nutrition, sky = progress & metrics,
     amber = momentum, slate = training & tools. */
  { icon: Bed, label: 'Sleep', screen: 'sleep-tracker', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { icon: Timer, label: 'Fasting', screen: 'fasting-tracker', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { icon: Heart, label: 'Wellness', screen: 'mental-wellness', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { icon: Zap, label: 'Habits', screen: 'habit-tracker', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { icon: Award, label: 'Streaks', screen: 'streak-dashboard', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { icon: BarChart3, label: 'Trends', screen: 'trends', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { icon: Calendar, label: 'Weekly', screen: 'weekly-report', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { icon: Brain, label: 'AI Coach', screen: 'ai-coach', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { icon: KeyRound, label: 'AI Keys', screen: 'ai-settings', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { icon: Activity, label: 'Recovery', screen: 'recovery', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { icon: Syringe, label: 'GLP-1', screen: 'glp1-tracker', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { icon: PlaneLanding, label: 'Landing', screen: 'landing-program', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { icon: Camera, label: 'Photos', screen: 'progress-photos', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { icon: UtensilsCrossed, label: 'Meals', screen: 'meal-planner', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { icon: Sparkles, label: 'AI Insights', screen: 'ai-insights', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { icon: CalendarCheck, label: 'AI Planner', screen: 'ai-planner', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { icon: Dumbbell, label: 'Exercises', screen: 'exercise-browser', color: 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300' },
  { icon: HeartPulse, label: 'Heart Rate', screen: 'heart-rate', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { icon: RefreshCw, label: 'Cycle', screen: 'cycle-tracker', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { icon: Trophy, label: 'Achievements', screen: 'gamification', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { icon: ImageIcon, label: 'Food Photos', screen: 'food-photo-journal', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { icon: BookOpen, label: 'Programs', screen: 'programs', color: 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300' },
];

function today() {
  return new Date().toISOString().split('T')[0] ?? '';
}

function NavCard({ icon: Icon, label, value, unit, color, screen, index }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  screen: string;
  index?: number;
}) {
  const pushScreen = useGlowFitStore((s) => s.pushScreen);
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.05, duration: 0.3, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { haptics.light(); track('dashboard_nav', { screen }); pushScreen(screen); }}
      aria-label={label}
      className="card-3d rounded-2xl p-4 text-left w-full hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className={`gloss w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
          <Icon className="w-5 h-5 text-white drop-shadow-sm" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">{label}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {value}{unit && <span className="text-xs font-normal text-slate-400 dark:text-slate-400 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function Dashboard() {
  const profile = useGlowFitStore((s) => s.profile);
  const workouts = useGlowFitStore((s) => s.workouts);
  const calorieLogs = useGlowFitStore((s) => s.calorieLogs);
  const waterLogs = useGlowFitStore((s) => s.waterLogs);
  const weightLogs = useGlowFitStore((s) => s.weightLogs);
  const wellnessLogs = useGlowFitStore((s) => s.wellnessLogs);
  const habits = useGlowFitStore((s) => s.habits);
  const medications = useGlowFitStore((s) => s.medications);
  const medicationDoses = useGlowFitStore((s) => s.medicationDoses);
  const upsertDose = useGlowFitStore((s) => s.upsertDose);
  const healthSteps = useGlowFitStore((s) => s.healthSteps);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const handleRefresh = useCallback(async () => {
    haptics.light();
    track('dashboard_refresh');
    await new Promise(r => setTimeout(r, 800));
  }, []);

  const todayStr = today();
  const todaySteps = healthSteps.find((e) => e.date === todayStr);
  const todayWorkouts = workouts.filter((w) => w.date === todayStr);
  const todayCalories = calorieLogs
    .filter((l) => l.date === todayStr)
    .reduce((sum, l) => sum + l.food.calories * l.quantity, 0);
  const todayWater = waterLogs
    .filter((l) => l.date === todayStr)
    .reduce((sum, l) => sum + l.amount, 0);
  const todayWellness = wellnessLogs.find((l) => l.date === todayStr);
  const latestWeight = weightLogs[0];
  const caloriesBurned = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const completedToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const showMuscleGuard = profile.glp1User === true;
  const mgProteinG = todayProteinG(calorieLogs, todayStr);
  const mgStrength = weeklyStrengthProgress(workouts);

  const addDays = (dateStr: string, days: number): string => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d);
    dt.setDate(dt.getDate() + days);
    return dt.toISOString().split('T')[0] ?? dateStr;
  };
  const dueMed = medications
    .map((med) => {
      const takenDates = medicationDoses
        .filter((d) => d.medicationId === med.id && d.taken)
        .sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0));
      const due = takenDates.length === 0 ? todayStr : addDays(takenDates[0].date, med.frequencyDays);
      const taken = medicationDoses.some((d) => d.medicationId === med.id && d.date === due && d.taken);
      return { med, due, taken };
    })
    .find(({ due, taken }) => !taken && due <= todayStr);

  const markDueTaken = async () => {
    if (!dueMed) return;
    haptics.medium();
    upsertDose({ id: `${dueMed.med.id}_${dueMed.due}`, medicationId: dueMed.med.id, date: dueMed.due, taken: true, takenAt: Date.now() });
    if (dueMed.med.reminderEnabled) {
      const nextDue = addDays(dueMed.due, dueMed.med.frequencyDays);
      const [hh, mm] = dueMed.med.reminderTime.split(':').map(Number);
      const [y, mo, dd] = nextDue.split('-').map(Number);
      const at = new Date(y, (mo ?? 1) - 1, dd, hh ?? 8, mm ?? 0);
      if (at.getTime() > Date.now()) {
        await notifications.scheduleMedReminder(
          `${dueMed.med.name} dose due`,
          `Time for your ${dueMed.med.dose}mg dose of ${dueMed.med.name}.`,
          at,
          8000 + (parseInt(dueMed.med.id.slice(-6), 10) % 900)
        );
      }
    }
    haptics.success();
    track('medication_dose_taken', { name: dueMed.med.name });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2"
        >
          <h1 className="text-3xl font-serif text-iridescent">
            {profile.name ? `Hi, ${profile.name}` : 'GlowFit'}
          </h1>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-rose-700/70 dark:text-rose-300/80 mt-1.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Today's Stats */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">Today</h2>
          <div className="grid grid-cols-2 gap-3">
            {showMuscleGuard && (
        <MuscleGuardCard
          profile={profile}
          proteinTodayG={mgProteinG}
          strength={mgStrength}
          onLogFood={() => { haptics.light(); pushScreen('food-search'); }}
          onLogWorkout={() => { haptics.light(); pushScreen('workout-logger'); }}
        />
      )}
      <NavCard icon={Flame} label="Calories" value={todayCalories} unit="kcal" color="bg-gradient-to-br from-rose-500 to-rose-600" screen="water-tracker" index={0} />
            <NavCard icon={Target} label="Burned" value={caloriesBurned} unit="kcal" color="bg-gradient-to-br from-violet-500 to-violet-600" screen="workout-logger" index={1} />
            <NavCard icon={Droplets} label="Water" value={todayWater > 0 ? (todayWater / 1000).toFixed(1) : '—'} unit={todayWater > 0 ? 'L' : ''} color="bg-gradient-to-br from-sky-500 to-sky-600" screen="water-tracker" index={2} />
            <NavCard icon={Moon} label="Mood" value={todayWellness?.mood ?? '—'} unit={todayWellness ? '/5' : ''} color="bg-gradient-to-br from-amber-500 to-amber-600" screen="wellness-tracker" index={3} />
          </div>
        </div>

        {/* Synced Steps */}
        {todaySteps && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptics.light(); pushScreen('settings'); }}
            aria-label="Synced steps from Health Connect"
            className="w-full card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Steps · Health Connect</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {todaySteps.steps.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">
                    synced {new Date(todaySteps.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>
            </div>
          </motion.button>
        )}

        {/* Medication Due */}
        {dueMed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
            onClick={() => { haptics.light(); pushScreen('glp1-tracker'); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { haptics.light(); pushScreen('glp1-tracker'); } }}
            role="button"
            tabIndex={0}
            aria-label={`Medication due: ${dueMed.med.name}`}
            className="w-full card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {dueMed.due < todayStr ? 'Medication missed' : 'Medication due'}
                  </p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {dueMed.med.name} {dueMed.med.dose}mg
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); markDueTaken(); }}
                aria-label={`Mark ${dueMed.med.name} taken`}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold active:scale-95 transition-all"
              >
                Taken
              </button>
            </div>
          </motion.div>
        )}

        {/* Weight Trend */}
        {latestWeight && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptics.light(); pushScreen('weight-tracker'); }}
            aria-label="Weight trend"
            className="w-full card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Current Weight</span>
              </div>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{latestWeight.weight} kg</span>
            </div>
          </motion.button>
        )}

        {/* Feature Grid */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {(showAllFeatures ? FEATURES : FEATURES.slice(0, 8)).map((f) => (
              <motion.button
                key={f.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => { haptics.light(); track('dashboard_feature', { screen: f.screen }); pushScreen(f.screen); }}
                aria-label={f.label}
                className={`gloss flex items-center gap-3 p-4 rounded-2xl ${f.color} border border-white/50 dark:border-slate-600/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all text-left`}
              >
                <f.icon className="w-5 h-5" />
                <span className="text-sm font-bold">{f.label}</span>
              </motion.button>
            ))}
          </div>
          <button
            onClick={() => { haptics.light(); setShowAllFeatures(!showAllFeatures); }}
            aria-expanded={showAllFeatures}
            className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            {showAllFeatures ? 'Show less' : `See all ${FEATURES.length} features`}
          </button>
        </div>

        {/* Streaks */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { haptics.light(); pushScreen('streak-dashboard'); }}
          aria-label="Streaks"
          className="w-full card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Streaks</h3>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <span className="text-2xl">🔥</span>
            <span>
              {completedToday > 0
                ? `${completedToday} habit${completedToday > 1 ? 's' : ''} completed today!`
                : 'Complete your first habit to start a streak!'}
            </span>
          </div>
        </motion.button>
      </div>
    </PullToRefresh>
  );
}
