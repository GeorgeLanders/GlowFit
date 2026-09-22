import { useGlowFitStore } from '../lib/store';
import { Flame, Trophy } from 'lucide-react';

export default function StreakDashboard() {
  const { workouts, habits } = useGlowFitStore();
  const totalDays = new Set(workouts.map((w) => w.date)).size;
  const habitStreaks = habits.map((h) => {
    let count = 0;
    const d = new Date();
    while (h.completedDates.includes(d.toISOString().split('T')[0] ?? '')) { count++; d.setDate(d.getDate() - 1); }
    return { name: h.name, color: h.color, streak: count };
  });

  // Calendar heatmap — last 30 days
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 29 + i);
    const dateStr = d.toISOString().split('T')[0] ?? '';
    const active = workouts.some((w) => w.date === dateStr) || habits.some((h) => h.completedDates.includes(dateStr));
    return { date: dateStr, active, day: d.getDate() };
  });

  const messages = ['Keep going! 💪', 'Consistency is key! 🔑', 'You are on fire! 🔥', 'Never give up! ⭐'];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Streaks</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] text-center">
          <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-800">{totalDays}</p>
          <p className="text-xs text-slate-400">Active Days</p>
        </div>
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] text-center">
          <Trophy className="w-6 h-6 text-violet-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-800">{habits.length}</p>
          <p className="text-xs text-slate-400">Active Habits</p>
        </div>
      </div>

      {/* Message */}
      <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-4 shadow-[var(--shadow-card)] text-center">
        <p className="text-lg font-serif text-slate-700">{msg}</p>
      </div>

      {/* Habit Streaks */}
      {habitStreaks.length > 0 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Habit Streaks</h3>
          <div className="space-y-2">
            {habitStreaks.map((h) => (
              <div key={h.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                  <span className="text-sm text-slate-700">{h.name}</span>
                </div>
                <span className="text-sm font-bold text-amber-500">🔥 {h.streak}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Heatmap */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Last 30 Days</h3>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((d) => (
            <div key={d.date} className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold ${d.active ? 'bg-emerald-400 text-white' : 'bg-slate-100 text-slate-300'}`}>
              {d.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
