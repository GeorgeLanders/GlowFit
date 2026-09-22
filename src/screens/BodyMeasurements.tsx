import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Ruler, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BodyMeasurements() {
  const { measurements, addMeasurement } = useGlowFitStore();
  const [showForm, setShowForm] = useState(false);
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  const save = () => {
    addMeasurement({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0] ?? '',
      waist: parseFloat(waist) || 0,
      hips: parseFloat(hips) || 0,
      chest: parseFloat(chest) || 0,
      arms: parseFloat(arms) || 0,
      thighs: parseFloat(thighs) || 0,
    });
    setWaist(''); setHips(''); setChest(''); setArms(''); setThighs('');
    setShowForm(false);
  };

  const latest = measurements[0];
  const previous = measurements[1];

  const trend = (current: number, prev: number) => {
    if (!prev) return null;
    const diff = current - prev;
    if (Math.abs(diff) < 0.1) return <Minus className="w-3 h-3 text-slate-400" />;
    return diff > 0
      ? <TrendingUp className="w-3 h-3 text-red-400" />
      : <TrendingDown className="w-3 h-3 text-emerald-400" />;
  };

  const chartData = measurements.slice(0, 10).reverse().map((m) => ({
    date: m.date.slice(5),
    waist: m.waist,
    hips: m.hips,
    chest: m.chest,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Measurements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          aria-label="Action"
          className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>

      {/* Current Measurements */}
      {latest && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Latest</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Waist', value: latest.waist, unit: 'cm' },
              { label: 'Hips', value: latest.hips, unit: 'cm' },
              { label: 'Chest', value: latest.chest, unit: 'cm' },
              { label: 'Arms', value: latest.arms, unit: 'cm' },
              { label: 'Thighs', value: latest.thighs, unit: 'cm' },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-500">{m.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800">{m.value}{m.unit}</span>
                  {previous && trend(m.label === 'Waist' ? latest.waist : m.label === 'Hips' ? latest.hips : m.label === 'Chest' ? latest.chest : m.label === 'Arms' ? latest.arms : latest.thighs,
                    m.label === 'Waist' ? previous.waist : m.label === 'Hips' ? previous.hips : m.label === 'Chest' ? previous.chest : m.label === 'Arms' ? previous.arms : previous.thighs)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="waist" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Waist" />
              <Bar dataKey="hips" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Hips" />
              <Bar dataKey="chest" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Chest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log Form */}
      {showForm && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-3">
          {[
            { label: 'Waist (cm)', value: waist, set: setWaist },
            { label: 'Hips (cm)', value: hips, set: setHips },
            { label: 'Chest (cm)', value: chest, set: setChest },
            { label: 'Arms (cm)', value: arms, set: setArms },
            { label: 'Thighs (cm)', value: thighs, set: setThighs },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
              <input type="number" step="0.1" value={f.value} onChange={(e) => f.set(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
            </div>
          ))}
          <button onClick={save} className="w-full bg-rose-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all">
            Save Measurements
          </button>
        </div>
      )}

      {/* History */}
      {measurements.length > 0 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">History</h3>
          <div className="space-y-2">
            {measurements.slice(0, 10).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-500">{m.date}</span>
                <span className="text-slate-700 font-medium">W{m.waist} H{m.hips} C{m.chest}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {measurements.length === 0 && !showForm && (
        <div className="card-3d rounded-2xl p-8 shadow-[var(--shadow-card)] text-center">
          <Ruler className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No measurements yet</p>
          <p className="text-xs text-slate-400 mt-1">Track your body changes over time</p>
        </div>
      )}
    </div>
  );
}
