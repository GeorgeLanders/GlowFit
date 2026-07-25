import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Moon, Star, Plus, Trash2, Sparkles } from 'lucide-react';

interface SleepLog {
  hours: number;
  quality: number;
  notes: string;
  timestamp: number;
}

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

export default function SleepWellness() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [hours, setHours] = useState('8.0');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const avgHours = logs.length > 0 ? (logs.reduce((s, l) => s + l.hours, 0) / logs.length).toFixed(1) : '0';
  const avgQuality = logs.length > 0 ? (logs.reduce((s, l) => s + l.quality, 0) / logs.length).toFixed(1) : '0';

  const saveLog = () => {
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return;
    setLogs(prev => [{ hours: h, quality, notes: notes.trim(), timestamp: Date.now() }, ...prev]);
    setHours('8.0'); setQuality(4); setNotes(''); setIsExpanded(false);
  };

  const removeLog = (i: number) => setLogs(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-500" />
          <h1 className="text-xl font-serif text-rose-900">Sleep & Wellness</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] text-center">
          <Moon className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-800">{avgHours}h</p>
          <p className="text-xs text-slate-400">Avg Sleep</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] text-center">
          <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-800">{avgQuality}</p>
          <p className="text-xs text-slate-400">Avg Quality</p>
        </div>
      </div>

      {/* Log Sleep */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <button onClick={() => setIsExpanded(!isExpanded)} aria-label={isExpanded ? "Collapse sleep log form" : "Expand sleep log form"} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            <span className="font-medium text-slate-700">Log Sleep</span>
          </div>
          <span className="text-xs text-slate-400">{isExpanded ? '▲' : '▼'}</span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-slate-500">Hours Slept</label>
              <input type="number" step="0.5" value={hours} onChange={e => setHours(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-center text-lg font-medium mt-1" />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Quality: {QUALITY_LABELS[quality]}</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setQuality(s)} aria-label={`Rate quality ${s} out of 5`} className="transition-all">
                    <Star className={`w-8 h-8 ${s <= quality ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)..." className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none h-16" />

            <button onClick={saveLog} aria-label="Save sleep log" className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm">Save Sleep Log</button>
          </div>
        )}
      </div>

      {/* Sleep Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-4 border border-indigo-200/50 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-indigo-700 mb-2 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Sleep Tips</p>
        <div className="space-y-1.5 text-xs text-slate-600">
          <p>• Aim for 7-9 hours per night</p>
          <p>• Keep a consistent sleep schedule</p>
          <p>• Avoid screens 1 hour before bed</p>
          <p>• Keep your room cool and dark</p>
          <p>• Limit caffeine after 2pm</p>
        </div>
      </div>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Sleep History</p>
            <p className="text-xs text-slate-400">{logs.length} nights</p>
          </div>

          {/* Mini chart */}
          <div className="flex items-end gap-1 h-16 mb-3">
            {logs.slice(0, 7).reverse().map((l, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full bg-indigo-300 rounded-t" style={{ height: `${(l.hours / 12) * 100}%`, minHeight: '4px' }} />
                <span className="text-[8px] text-slate-400">{l.hours}h</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.slice(0, 10).map((l, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                <div className="text-center min-w-[32px]">
                  <p className="text-sm font-bold text-indigo-600">{l.hours}h</p>
                  <div className="flex gap-0.5 justify-center">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-2 h-2 ${s < l.quality ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {l.notes && <p className="text-xs text-slate-500 truncate">{l.notes}</p>}
                  <p className="text-xs text-slate-400">{new Date(l.timestamp).toLocaleDateString()}</p>
                </div>
                <button onClick={() => removeLog(i)} aria-label="Delete sleep log" className="p-1 rounded-lg hover:bg-rose-50">
                  <Trash2 className="w-3 h-3 text-rose-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
