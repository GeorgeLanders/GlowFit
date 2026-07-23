import { useGlowFitStore } from '../lib/store';
import { Flame, Droplets, Moon, TrendingUp, Footprints, Target, Apple } from 'lucide-react';

function today() {
  return new Date().toISOString().split('T')[0] ?? '';
}

function StatCard({ icon: Icon, label, value, unit, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-800">
            {value}{unit && <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const profile = useGlowFitStore((s) => s.profile);
  const workouts = useGlowFitStore((s) => s.workouts);
  const calorieLogs = useGlowFitStore((s) => s.calorieLogs);
  const waterLogs = useGlowFitStore((s) => s.waterLogs);
  const weightLogs = useGlowFitStore((s) => s.weightLogs);
  const wellnessLogs = useGlowFitStore((s) => s.wellnessLogs);

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
          <StatCard icon={Flame} label="Calories" value={todayCalories} unit="kcal" color="bg-rose-500" />
          <StatCard icon={Target} label="Burned" value={caloriesBurned} unit="kcal" color="bg-violet-500" />
          <StatCard icon={Droplets} label="Water" value={todayWater > 0 ? (todayWater / 1000).toFixed(1) : '—'} unit={todayWater > 0 ? 'L' : ''} color="bg-blue-500" />
          <StatCard icon={Moon} label="Mood" value={todayWellness?.mood ?? '—'} unit={todayWellness ? '/5' : ''} color="bg-amber-500" />
        </div>
      </div>

      {/* Weight Trend */}
      {latestWeight && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-bold text-slate-700">Current Weight</span>
            </div>
            <span className="text-lg font-bold text-rose-600">{latestWeight.weight} kg</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Quick Add</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Footprints, label: 'Workout', color: 'bg-violet-100 text-violet-600' },
            { icon: Apple, label: 'Food', color: 'bg-emerald-100 text-emerald-600' },
            { icon: Droplets, label: 'Water', color: 'bg-blue-100 text-blue-600' },
          ].map((action) => (
            <button
              key={action.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${action.color} border border-white/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-95`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Streaks</h3>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="text-2xl">🔥</span>
          <span>Complete your first workout to start a streak!</span>
        </div>
      </div>
    </div>
  );
}
