import { useGlowFitStore } from '../lib/store';
import { Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GOAL = 2000;
function today() { return new Date().toISOString().split('T')[0] ?? ''; }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] ?? ''; }

export default function WaterTracker() {
  const { waterLogs, addWater } = useGlowFitStore();
  const todayStr = today();
  const todayAmount = waterLogs.filter((l) => l.date === todayStr).reduce((s, l) => s + l.amount, 0);
  const pct = Math.min(todayAmount / GOAL * 100, 100);

  const addAmount = (ml: number) => {
    addWater({ id: Date.now().toString(), date: todayStr, amount: ml, timestamp: Date.now() });
  };

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    return { day: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }), ml: waterLogs.filter((l) => l.date === d).reduce((s, l) => s + l.amount, 0) };
  });

  const todayLogs = waterLogs.filter((l) => l.date === todayStr);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Water</h1>

      {/* Progress Ring */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle cx="80" cy="80" r="70" fill="none" stroke="#3b82f6" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
              strokeLinecap="round" className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className="w-6 h-6 text-blue-400 mb-1" />
            <span className="text-2xl font-bold text-slate-800">{(todayAmount / 1000).toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">of {(GOAL / 1000).toFixed(1)}L</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => addAmount(250)} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-200 active:scale-95">+250ml</button>
          <button onClick={() => addAmount(500)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 active:scale-95">+500ml</button>
        </div>
      </div>

      {/* Today's Log */}
      {todayLogs.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Today</h3>
          <div className="space-y-1">
            {todayLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-slate-600">{l.amount}ml</span>
                <span className="text-xs text-slate-400">{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">This Week</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="ml" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
