import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';

function today() { return new Date().toISOString().split('T')[0] ?? ''; }

export default function WeightTracker() {
  const { weightLogs, addWeight, profile } = useGlowFitStore();
  const [weight, setWeight] = useState('');
  const todayStr = today();
  const latest = weightLogs[0];
  const bmi = latest ? (latest.weight / ((profile.height / 100) ** 2)).toFixed(1) : '—';
  const goalPct = latest && profile.goalWeight ? Math.min(100, Math.abs(latest.weight - profile.currentWeight) / Math.abs(profile.goalWeight - profile.currentWeight) * 100) : 0;

  const chartData = weightLogs.slice(0, 30).reverse().map((l) => ({ date: l.date.slice(5), weight: l.weight }));

  const save = () => {
    const w = parseFloat(weight);
    if (!w) return;
    addWeight({ id: Date.now().toString(), date: todayStr, weight: w, timestamp: Date.now() });
    setWeight('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Weight</h1>

      {/* Quick Entry */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <div className="flex gap-2">
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Today's weight (kg)" className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          <button onClick={save} aria-label="Log weight entry" className="bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95">Log</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] text-center">
          <TrendingUp className="w-5 h-5 text-rose-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800">{latest?.weight ?? '—'} <span className="text-xs text-slate-400">kg</span></p>
          <p className="text-xs text-slate-400">Current</p>
        </div>
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] text-center">
          <Target className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800">{bmi}</p>
          <p className="text-xs text-slate-400">BMI</p>
        </div>
      </div>

      {/* Goal Progress */}
      {profile.goalWeight > 0 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Goal: {profile.goalWeight} kg</span>
            <span>{Math.round(goalPct)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-400 to-violet-400 rounded-full transition-all" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
