import { useGlowFitStore } from '../lib/store';
import { Flame, Droplets, Moon, TrendingUp, Footprints, Target, Apple, Brain, Bed, Heart, Zap, BarChart3, Activity, Calendar, Award, Syringe, Camera, UtensilsCrossed } from 'lucide-react';

function today() {
  return new Date().toISOString().split('T')[0] ?? '';
}

function NavCard({ icon: Icon, label, value, unit, color, screen }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  screen: string;
}) {
  const pushScreen = useGlowFitStore((s) => s.pushScreen);
  return (
    <button
      onClick={() => pushScreen(screen)}
      aria-label="Action"
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left w-full`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-800">
            {value}{unit && <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </button>
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-3xl font-serif text-rose-900">
          {profile.name ? `Hi, ${profile.name}` : 'GlowFit'}
        </h1>
        <p className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-rose-400/60 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Today</h2>
        <div className="grid grid-cols-2 gap-3">
          <NavCard icon={Flame} label="Calories" value={todayCalories} unit="kcal" color="bg-rose-500" screen="water-tracker" />
          <NavCard icon={Target} label="Burned" value={caloriesBurned} unit="kcal" color="bg-violet-500" screen="workout-logger" />
          <NavCard icon={Droplets} label="Water" value={todayWater > 0 ? (todayWater / 1000).toFixed(1) : '—'} unit={todayWater > 0 ? 'L' : ''} color="bg-blue-500" screen="water-tracker" />
          <NavCard icon={Moon} label="Mood" value={todayWellness?.mood ?? '—'} unit={todayWellness ? '/5' : ''} color="bg-amber-500" screen="wellness-tracker" />
        </div>
      </div>

      {/* Weight Trend */}
      {latestWeight && (
        <button
          onClick={() => pushScreen('weight-tracker')}
          aria-label="Action"
          className="w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-bold text-slate-700">Current Weight</span>
            </div>
            <span className="text-lg font-bold text-rose-600">{latestWeight.weight} kg</span>
          </div>
        </button>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Quick Add</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Footprints, label: 'Workout', color: 'bg-violet-100 text-violet-600', screen: 'workout-logger' },
            { icon: Apple, label: 'Food', color: 'bg-emerald-100 text-emerald-600', screen: 'nutrition' },
            { icon: Droplets, label: 'Water', color: 'bg-blue-100 text-blue-600', screen: 'water-tracker' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => pushScreen(action.screen)}
              aria-label="Action"
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.color} border border-white/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-95`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Features</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Bed, label: 'Sleep', screen: 'sleep-tracker', color: 'bg-indigo-100 text-indigo-600' },
            { icon: Heart, label: 'Wellness', screen: 'mental-wellness', color: 'bg-pink-100 text-pink-600' },
            { icon: Zap, label: 'Habits', screen: 'habit-tracker', color: 'bg-amber-100 text-amber-600' },
            { icon: Award, label: 'Streaks', screen: 'streak-dashboard', color: 'bg-orange-100 text-orange-600' },
            { icon: BarChart3, label: 'Trends', screen: 'trends', color: 'bg-teal-100 text-teal-600' },
            { icon: Calendar, label: 'Weekly', screen: 'weekly-report', color: 'bg-cyan-100 text-cyan-600' },
            { icon: Brain, label: 'AI Coach', screen: 'ai-coach', color: 'bg-violet-100 text-violet-600' },
            { icon: Activity, label: 'Recovery', screen: 'recovery', color: 'bg-emerald-100 text-emerald-600' },
            { icon: Syringe, label: 'GLP-1', screen: 'glp1-tracker', color: 'bg-rose-100 text-rose-600' },
            { icon: Camera, label: 'Photos', screen: 'progress-photos', color: 'bg-pink-100 text-pink-600' },
            { icon: UtensilsCrossed, label: 'Meals', screen: 'meal-planner', color: 'bg-orange-100 text-orange-600' },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => pushScreen(f.screen)}
              aria-label="Action"
              className={`flex items-center gap-3 p-4 rounded-2xl ${f.color} border border-white/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left`}
            >
              <f.icon className="w-5 h-5" />
              <span className="text-sm font-bold">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Streaks */}
      <button
        onClick={() => pushScreen('streak-dashboard')}
        aria-label="Action"
        className="w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
      >
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Streaks</h3>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="text-2xl">🔥</span>
          <span>
            {completedToday > 0
              ? `${completedToday} habit${completedToday > 1 ? 's' : ''} completed today!`
              : 'Complete your first habit to start a streak!'}
          </span>
        </div>
      </button>
    </div>
  );
}
