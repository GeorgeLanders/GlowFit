import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Heart, Smile, Zap, Cloud } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

function today() { return new Date().toISOString().split('T')[0] ?? ''; }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] ?? ''; }
const EMOJIS = ['😢', '😟', '😐', '🙂', '😄'];

export default function WellnessTracker() {
  const { wellnessLogs, addWellness } = useGlowFitStore();
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [stress, setStress] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const todayStr = today();
  const todayLog = wellnessLogs.find((l) => l.date === todayStr);

  const save = () => {
    addWellness({ id: Date.now().toString(), date: todayStr, mood, energy, stress, notes });
  };

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const log = wellnessLogs.find((l) => l.date === d);
    return { day: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }), mood: log?.mood ?? 0, energy: log?.energy ?? 0, stress: log?.stress ?? 0 };
  });

  const ScalePicker = ({ label, value, onChange, icon: Icon, color }: { label: string; value: 1 | 2 | 3 | 4 | 5; onChange: (v: 1 | 2 | 3 | 4 | 5) => void; icon: React.ElementType; color: string }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="text-xs text-slate-400 ml-auto">{EMOJIS[value - 1]}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} onClick={() => onChange(v as 1 | 2 | 3 | 4 | 5)} aria-label={`Set ${label} to ${v}`}
                      className={`flex-1 h-8 rounded-lg text-sm font-bold transition-all ${v <= value ? `${color} bg-current text-white` : 'bg-slate-100 text-slate-300'}`}
                      style={v <= value ? { backgroundColor: 'currentColor' } : {}}>
                      {v}
                    </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Wellness</h1>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-4">
        <ScalePicker label="Mood" value={mood} onChange={setMood} icon={Smile} color="text-rose-500" />
        <ScalePicker label="Energy" value={energy} onChange={setEnergy} icon={Zap} color="text-amber-500" />
        <ScalePicker label="Stress" value={stress} onChange={setStress} icon={Cloud} color="text-blue-500" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
        <button onClick={save} aria-label="Log wellness entry" className="w-full bg-rose-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-95">Log Wellness</button>
      </div>

      {todayLog && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] flex items-center gap-4">
          <Heart className="w-5 h-5 text-rose-400" />
          <div className="flex gap-4 text-sm">
            <span>Mood {EMOJIS[todayLog.mood - 1]}</span>
            <span>Energy {EMOJIS[todayLog.energy - 1]}</span>
            <span>Stress {EMOJIS[todayLog.stress - 1]}</span>
          </div>
        </div>
      )}

      {weekData.some((d) => d.mood > 0) && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">This Week</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={weekData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
