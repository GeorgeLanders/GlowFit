import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';

const PHASES = ['menstrual', 'follicular', 'ovulation', 'luteal'] as const;
const FLOWS = ['none', 'light', 'medium', 'heavy'] as const;
const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Tender breasts', 'Acne', 'Insomnia'];

export default function CycleTracker() {
  const { cycleLogs, addCycleLog } = useGlowFitStore();
  const today = new Date().toISOString().split('T')[0] ?? '';
  const [phase, setPhase] = useState<typeof PHASES[number]>('menstrual');
  const [flow, setFlow] = useState<typeof FLOWS[number]>('light');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggle = (s: string) => setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const save = () => {
    addCycleLog({ id: Date.now().toString(), date: today, phase, flow, symptoms, notes });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Cycle</h1>

      {/* Phase Selector */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Current Phase</h3>
        <div className="grid grid-cols-2 gap-2">
          {PHASES.map((p) => (
            <button key={p} onClick={() => setPhase(p)} aria-label={`Set phase to ${p}`}
              className={`p-3 rounded-xl text-sm font-bold capitalize transition-all ${phase === p ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
              {p}
            </button>
          ))}
        </div>

        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Flow</h3>
        <div className="flex gap-2">
          {FLOWS.map((f) => (
            <button key={f} onClick={() => setFlow(f)} aria-label={`Set flow to ${f}`}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${flow === f ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
              {f}
            </button>
          ))}
        </div>

        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Symptoms</h3>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <button key={s} onClick={() => toggle(s)} aria-label={`Toggle ${s} symptom`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${symptoms.includes(s) ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>

        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
        <button onClick={save} aria-label="Log cycle data" className="w-full bg-rose-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-95">Log</button>
      </div>

      {/* Recent Logs */}
      {cycleLogs.length > 0 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Recent</h3>
          <div className="space-y-2">
            {cycleLogs.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-500">{l.date}</span>
                <span className="capitalize font-medium text-slate-700">{l.phase}</span>
                <span className="capitalize text-xs text-slate-400">{l.flow} flow</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
