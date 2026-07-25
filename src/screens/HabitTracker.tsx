import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Plus, Check } from 'lucide-react';

function today() { return new Date().toISOString().split('T')[0] ?? ''; }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] ?? ''; }
const COLORS = ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

export default function HabitTracker() {
  const { habits, addHabit, toggleHabitDate } = useGlowFitStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));

  const save = () => {
    if (!name) return;
    addHabit({ id: Date.now().toString(), name, frequency: 'daily', color, icon: '✓', completedDates: [] });
    setName(''); setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Habits</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          <div className="flex gap-2">{COLORS.map((c) => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: c }} />)}</div>
          <button onClick={save} className="w-full bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm">Save</button>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] text-center">
          <Check className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
          <p className="text-slate-500">No habits yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => {
            const streak = h.completedDates.filter((d) => { const diff = (new Date(today()).getTime() - new Date(d).getTime()) / 86400000; return diff >= 0 && diff < 30; }).length;
            return (
              <div key={h.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="font-bold text-slate-800 text-sm">{h.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">🔥 {streak} days</span>
                </div>
                <div className="flex gap-1.5">
                  {days.map((d) => {
                    const done = h.completedDates.includes(d);
                    const isToday = d === today();
                    return (
                      <button key={d} onClick={() => toggleHabitDate(h.id, d)}
                        className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${done ? 'text-white' : 'bg-slate-50 text-slate-300 border border-slate-200'} ${isToday ? 'ring-2 ring-rose-200' : ''}`}
                        style={done ? { backgroundColor: h.color } : {}}>
                        {done ? '✓' : new Date(d).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
