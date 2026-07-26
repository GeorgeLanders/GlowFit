import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGlowFitStore } from '../lib/store';
import { Flame, Droplets, Moon, TrendingUp, Footprints, Target, Apple, Brain, Bed, Heart, Zap, BarChart3, Activity, Calendar, Award, Syringe, Camera, UtensilsCrossed } from 'lucide-react';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';
import { PullToRefresh } from '../components/PullToRefresh';

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
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left w-full"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {value}{unit && <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">{unit}</span>}
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
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  const handleRefresh = useCallback(async () => {
    haptics.light();
    track('dashboard_refresh');
    await new Promise(r => setTimeout(r, 800));
  }, []);

  const todayStr = today();
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

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2"
        >
          <h1 className="text-3xl font-serif text-rose-900 dark:text-rose-300">
            {profile.name ? `Hi, ${profile.name}` : 'GlowFit'}
          </h1>
          <p className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-rose-400/60 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Today's Stats */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">Today</h2>
          <div className="grid grid-cols-2 gap-3">
            <NavCard icon={Flame} label="Calories" value={todayCalories} unit="kcal" color="bg-rose-500" screen="water-tracker" index={0} />
            <NavCard icon={Target} label="Burned" value={caloriesBurned} unit="kcal" color="bg-violet-500" screen="workout-logger" index={1} />
            <NavCard icon={Droplets} label="Water" value={todayWater > 0 ? (todayWater / 1000).toFixed(1) : '—'} unit={todayWater > 0 ? 'L' : ''} color="bg-blue-500" screen="water-tracker" index={2} />
            <NavCard icon={Moon} label="Mood" value={todayWellness?.mood ?? '—'} unit={todayWellness ? '/5' : ''} color="bg-amber-500" screen="wellness-tracker" index={3} />
          </div>
        </div>

        {/* Weight Trend */}
        {latestWeight && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptics.light(); pushScreen('weight-tracker'); }}
            aria-label="Weight trend"
            className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left"
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

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">Quick Add</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Footprints, label: 'Workout', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', screen: 'workout-logger' },
              { icon: Apple, label: 'Food', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', screen: 'nutrition' },
              { icon: Droplets, label: 'Water', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', screen: 'water-tracker' },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => { haptics.light(); track('dashboard_quick_add', { type: action.label }); pushScreen(action.screen); }}
                aria-label={action.label}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.color} border border-white/40 dark:border-slate-700/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs font-bold">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Bed, label: 'Sleep', screen: 'sleep-tracker', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
              { icon: Heart, label: 'Wellness', screen: 'mental-wellness', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
              { icon: Zap, label: 'Habits', screen: 'habit-tracker', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
              { icon: Award, label: 'Streaks', screen: 'streak-dashboard', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
              { icon: BarChart3, label: 'Trends', screen: 'trends', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
              { icon: Calendar, label: 'Weekly', screen: 'weekly-report', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
              { icon: Brain, label: 'AI Coach', screen: 'ai-coach', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
              { icon: Activity, label: 'Recovery', screen: 'recovery', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
              { icon: Syringe, label: 'GLP-1', screen: 'glp1-tracker', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
              { icon: Camera, label: 'Photos', screen: 'progress-photos', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
              { icon: UtensilsCrossed, label: 'Meals', screen: 'meal-planner', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
            ].map((f) => (
              <motion.button
                key={f.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => { haptics.light(); track('dashboard_feature', { screen: f.screen }); pushScreen(f.screen); }}
                aria-label={f.label}
                className={`flex items-center gap-3 p-4 rounded-2xl ${f.color} border border-white/40 dark:border-slate-700/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left`}
              >
                <f.icon className="w-5 h-5" />
                <span className="text-sm font-bold">{f.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Streaks */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { haptics.light(); pushScreen('streak-dashboard'); }}
          aria-label="Streaks"
          className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left"
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
