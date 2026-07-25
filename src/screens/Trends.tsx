import { useState, useMemo } from 'react';
import { useGlowFitStore } from '../lib/store';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Flame, Droplets, Scale, Activity } from 'lucide-react';

type Range = '7d' | '30d' | '90d';

function getDateRange(range: Range): string {
  const d = new Date();
  if (range === '7d') d.setDate(d.getDate() - 7);
  else if (range === '30d') d.setDate(d.getDate() - 30);
  else d.setDate(d.getDate() - 90);
  return d.toISOString().split('T')[0] ?? '';
}

function SummaryCard({ icon: Icon, label, value, unit, color }: {
  icon: React.ElementType; label: string; value: string | number; unit?: string; color: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-base font-bold text-slate-800">{value}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></p>
        </div>
      </div>
    </div>
  );
}

export default function Trends() {
  const weightLogs = useGlowFitStore((s) => s.weightLogs);
  const calorieLogs = useGlowFitStore((s) => s.calorieLogs);
  const waterLogs = useGlowFitStore((s) => s.waterLogs);
  const [range, setRange] = useState<Range>('30d');

  const fromDate = getDateRange(range);

  const weightData = useMemo(() => {
    const filtered = weightLogs.filter((w) => w.date >= fromDate).sort((a, b) => a.date.localeCompare(b.date));
    return filtered.map((w) => ({ date: w.date.slice(5), weight: w.weight }));
  }, [weightLogs, fromDate]);

  const dailyCalories = useMemo(() => {
    const map = new Map<string, number>();
    calorieLogs.filter((l) => l.date >= fromDate).forEach((l) => {
      map.set(l.date, (map.get(l.date) ?? 0) + l.food.calories * l.quantity);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, cal]) => ({ date: date.slice(5), calories: Math.round(cal) }));
  }, [calorieLogs, fromDate]);

  const dailyWater = useMemo(() => {
    const map = new Map<string, number>();
    waterLogs.filter((w) => w.date >= fromDate).forEach((w) => {
      map.set(w.date, (map.get(w.date) ?? 0) + w.amount);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, ml]) => ({ date: date.slice(5), liters: parseFloat((ml / 1000).toFixed(2)) }));
  }, [waterLogs, fromDate]);

  const avgCalories = dailyCalories.length > 0 ? Math.round(dailyCalories.reduce((s, d) => s + d.calories, 0) / dailyCalories.length) : 0;
  const avgWater = dailyWater.length > 0 ? parseFloat((dailyWater.reduce((s, d) => s + d.liters, 0) / dailyWater.length).toFixed(1)) : 0;
  const latestWeight = weightLogs.length > 0 ? weightLogs[0]?.weight : null;
  const oldestInRange = weightData.length > 0 ? weightData[0]?.weight : null;
  const weightChange = latestWeight && oldestInRange ? (latestWeight - oldestInRange).toFixed(1) : null;

  const ranges: { key: Range; label: string }[] = [{ key: '7d', label: '7D' }, { key: '30d', label: '30D' }, { key: '90d', label: '90D' }];

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-serif text-rose-900 pt-2">Trends</h1>

      {/* Range Selector */}
      <div className="flex gap-2">
        {ranges.map((r) => (
          <button key={r.key} onClick={() => setRange(r.key)} aria-label={`Show ${r.label} trends`}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${range === r.key ? 'bg-rose-500 text-white shadow-md' : 'bg-white/70 border border-white/40 text-slate-500 hover:bg-white'}`}>
                      {r.label}
                    </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard icon={Scale} label="Weight" value={latestWeight ?? '—'} unit={latestWeight ? 'kg' : ''} color="bg-rose-500" />
        <SummaryCard icon={TrendingUp} label="Change" value={weightChange ?? '—'} unit={weightChange ? 'kg' : ''} color="bg-violet-500" />
        <SummaryCard icon={Flame} label="Avg Cal" value={avgCalories || '—'} unit={avgCalories ? 'kcal' : ''} color="bg-amber-500" />
        <SummaryCard icon={Droplets} label="Avg Water" value={avgWater || '—'} unit={avgWater ? 'L' : ''} color="bg-blue-500" />
      </div>

      {/* Weight Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-700">Weight Trend</h3>
        </div>
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="weight" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">No weight data for this period</p>
        )}
      </div>

      {/* Calories Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-700">Daily Calories</h3>
        </div>
        {dailyCalories.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="calories" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">No calorie data for this period</p>
        )}
      </div>

      {/* Water Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-700">Daily Water Intake</h3>
        </div>
        {dailyWater.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyWater}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="liters" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">No water data for this period</p>
        )}
      </div>
    </div>
  );
}
