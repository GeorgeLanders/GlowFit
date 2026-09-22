import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Plus } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

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
        <button onClick={() => setShowForm(!showForm)} aria-label={showForm ? 'Cancel add habit' : 'Add habit'} className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showForm && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          <div className="flex gap-2">{COLORS.map((c) => <button key={c} onClick={() => setColor(c)} aria-label={`Select color ${c}`} aria-pressed={color === c} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: c }} />)}</div>
          <button onClick={save} aria-label="Save habit" className="w-full bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm">Save</button>
        </div>
      )}

      {habits.length === 0 ? (
        <EmptyState emoji="✅" title="No habits yet" message="Small daily habits compound into big change" />
      ) : (
        <div className="space-y-3">
          {habits.map((h) => {
            const streak = h.completedDates.filter((d) => { const diff = (new Date(today()).getTime() - new Date(d).getTime()) / 86400000; return diff >= 0 && diff < 30; }).length;
            return (
              <div key={h.id} className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
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
                        aria-label={`${done ? 'Unmark' : 'Mark'} habit ${h.name} for ${new Date(d).toLocaleDateString('en-US', { weekday: 'long' })}`}
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
