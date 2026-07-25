import { useGlowFitStore } from '../lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0] ?? '';
}

export default function WeeklyReport() {
  const workouts = useGlowFitStore((s) => s.workouts);
  const calorieLogs = useGlowFitStore((s) => s.calorieLogs);
  const waterLogs = useGlowFitStore((s) => s.waterLogs);
  const sleepLogs = useGlowFitStore((s) => s.sleepLogs);
  const wellnessLogs = useGlowFitStore((s) => s.wellnessLogs);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = daysAgo(6 - i);
    const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const dayWorkouts = workouts.filter((w) => w.date === date);
    const dayCalories = calorieLogs.filter((l) => l.date === date).reduce((s, l) => s + l.food.calories * l.quantity, 0);
    const dayWater = waterLogs.filter((l) => l.date === date).reduce((s, l) => s + l.amount, 0);
    const daySleep = sleepLogs.find((l) => l.date === date);
    const dayMood = wellnessLogs.find((l) => l.date === date);
    return {
      day: dayLabel,
      calories: dayCalories,
      water: Math.round(dayWater / 1000 * 10) / 10,
      workouts: dayWorkouts.length,
      sleep: daySleep ? 6 : 0,
      mood: dayMood?.mood ?? 0,
    };
  });

  const totalWorkouts = weekDays.reduce((s, d) => s + d.workouts, 0);
  const avgCalories = Math.round(weekDays.reduce((s, d) => s + d.calories, 0) / 7);
  const avgWater = (weekDays.reduce((s, d) => s + d.water, 0) / 7).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Weekly Report</h1>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 -mt-4">
        {daysAgo(6)} — {daysAgo(0)}
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Workouts', value: totalWorkouts },
          { label: 'Avg Cal', value: avgCalories },
          { label: 'Avg Water', value: `${avgWater}L` },
        ].map((s) => (
          <div key={s.label} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-3 shadow-[var(--shadow-card)] text-center">
            <p className="text-lg font-bold text-slate-800">{s.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calories Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Calories</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekDays}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="calories" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Water Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Water (L)</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekDays}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
