import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Moon, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

function today() { return new Date().toISOString().split('T')[0] ?? ''; }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] ?? ''; }

export default function SleepTracker() {
  const { sleepLogs, addSleep } = useGlowFitStore();
  const [bed, setBed] = useState('22:00');
  const [wake, setWake] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const todayStr = today();
  const todayLog = sleepLogs.find((l) => l.date === todayStr);

  const calcHours = () => {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let hrs = (wh + wm / 60) - (bh + bm / 60);
    if (hrs < 0) hrs += 24;
    return hrs.toFixed(1);
  };

  const save = () => {
    addSleep({ id: Date.now().toString(), date: todayStr, bedTime: bed, wakeTime: wake, quality, notes });
  };

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const log = sleepLogs.find((l) => l.date === d);
    let hrs = 0;
    if (log) {
      const [bh, bm] = log.bedTime.split(':').map(Number);
      const [wh, wm] = log.wakeTime.split(':').map(Number);
      hrs = (wh + wm / 60) - (bh + bm / 60);
      if (hrs < 0) hrs += 24;
    }
    return { day: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }), hours: Math.round(hrs * 10) / 10 };
  });

  const stars = [1, 2, 3, 4, 5] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Sleep</h1>

      {/* Log Form */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Bedtime</label>
            <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Wake Time</label>
            <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">Quality</label>
          <div className="flex gap-2">
            {stars.map((s) => (
              <button key={s} onClick={() => setQuality(s)} className="p-1">
                <Star className={`w-6 h-6 ${s <= quality ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              </button>
            ))}
          </div>
        </div>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{calcHours()} hours</span>
          <button onClick={save} className="bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-600 active:scale-95">Log Sleep</button>
        </div>
      </div>

      {/* Today */}
      {todayLog && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] flex items-center gap-3">
          <Moon className="w-5 h-5 text-violet-400" />
          <div>
            <p className="text-sm font-bold text-slate-800">{todayLog.bedTime} → {todayLog.wakeTime}</p>
            <p className="text-xs text-slate-400">Quality: {'⭐'.repeat(todayLog.quality)}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">This Week</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
