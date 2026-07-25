import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Heart, Plus, X, Activity } from 'lucide-react';

interface HeartRateEntry {
  id: string;
  date: string;
  resting: number;
  active: number;
}

export default function HeartRate() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [entries, setEntries] = useState<HeartRateEntry[]>([
    { id: '1', date: '2026-06-01', resting: 72, active: 145 },
    { id: '2', date: '2026-06-15', resting: 68, active: 152 },
    { id: '3', date: '2026-06-29', resting: 65, active: 158 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [resting, setResting] = useState('');
  const [active, setActive] = useState('');

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const avgResting = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.resting, 0) / entries.length) : 0;

  const addEntry = () => {
    if (resting && active) {
      setEntries(prev => [...prev, {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        resting: parseInt(resting),
        active: parseInt(active),
      }]);
      setResting('');
      setActive('');
      setShowAdd(false);
    }
  };

  const getHRZone = (hr: number) => {
    if (hr < 60) return { label: 'Excellent', color: 'text-emerald-500' };
    if (hr < 70) return { label: 'Good', color: 'text-blue-500' };
    if (hr < 80) return { label: 'Average', color: 'text-amber-500' };
    return { label: 'Above Average', color: 'text-rose-500' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-serif text-rose-900">Heart Rate</h1>
        </div>
      </div>

      {/* Latest Reading */}
      {latest && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-sm text-white/80">Resting HR</p>
            <p className="text-3xl font-bold">{latest.resting}</p>
            <p className="text-xs text-white/60">bpm</p>
            <p className={`text-xs mt-1 ${getHRZone(latest.resting).color === 'text-emerald-500' ? 'text-white/90' : 'text-white/80'}`}>{getHRZone(latest.resting).label}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-sm text-white/80">Active HR</p>
            <p className="text-3xl font-bold">{latest.active}</p>
            <p className="text-xs text-white/60">bpm</p>
            <p className="text-xs text-white/80">Peak</p>
          </div>
        </div>
      )}

      {/* Average */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-rose-500" />
          <div>
            <p className="text-sm text-slate-500">Average Resting HR</p>
            <p className="text-xl font-bold text-slate-800">{avgResting} bpm ({entries.length} readings)</p>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {entries.length > 1 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
          <h3 className="font-medium text-slate-800 mb-3">Resting HR Trend</h3>
          <div className="flex items-end gap-2 h-24">
            {entries.map((entry, i) => {
              const minHR = Math.min(...entries.map(e => e.resting));
              const maxHR = Math.max(...entries.map(e => e.resting));
              const range = maxHR - minHR || 1;
              const height = ((entry.resting - minHR) / range) * 80 + 20;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{entry.resting}</span>
                  <div className="w-full bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-lg" style={{ height: `${height}%` }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Button */}
      <button onClick={() => setShowAdd(!showAdd)} className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
        {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {showAdd ? 'Cancel' : 'Log Heart Rate'}
      </button>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-3">
          <input type="number" placeholder="Resting BPM" value={resting} onChange={e => setResting(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-slate-800" />
          <input type="number" placeholder="Active/Peak BPM" value={active} onChange={e => setActive(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-slate-800" />
          <button onClick={addEntry} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold active:scale-95 transition-all">Save Reading</button>
        </div>
      )}

      {/* History */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <h3 className="font-medium text-slate-800 mb-3">History</h3>
        <div className="space-y-2">
          {[...entries].reverse().map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
              <div className="flex gap-4">
                <span className="text-sm text-rose-500">Rest: {entry.resting}</span>
                <span className="text-sm text-orange-500">Active: {entry.active}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
