import { useState, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Timer, Check, Bell, BellOff } from 'lucide-react';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';
import { notifications } from '../lib/notifications';

const FAST_REMINDER_ID = 9001;
const PRESETS = [12, 14, 16, 18, 20];

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function FastingTracker() {
  const fastingSettings = useGlowFitStore((s) => s.fastingSettings);
  const updateFastingSettings = useGlowFitStore((s) => s.updateFastingSettings);
  const fastingLogs = useGlowFitStore((s) => s.fastingLogs);
  const startFast = useGlowFitStore((s) => s.startFast);
  const endFast = useGlowFitStore((s) => s.endFast);

  const [now, setNow] = useState(Date.now());
  const [customHours, setCustomHours] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeFast = fastingLogs.find((l) => l.endedAt == null);
  const targetMs = (activeFast?.targetHours ?? fastingSettings.windowHours) * 3600e3;
  const elapsedMs = activeFast ? now - activeFast.startedAt : 0;
  const remainingMs = activeFast ? targetMs - elapsedMs : 0;
  const progress = activeFast ? Math.min(1, elapsedMs / targetMs) : 0;

  const R = 70;
  const C = 2 * Math.PI * R;

  const handleStart = async () => {
    haptics.medium();
    const id = Date.now().toString();
    startFast({
      id,
      date: new Date().toISOString().split('T')[0] ?? '',
      startedAt: Date.now(),
      targetHours: fastingSettings.windowHours,
      completed: false,
    });
    if (fastingSettings.enabled) {
      await notifications.requestPermission();
      const endsAt = Date.now() + fastingSettings.windowHours * 3600e3;
      const remindAt = endsAt - fastingSettings.reminderMinutesBefore * 60e3;
      if (remindAt > Date.now()) {
        await notifications.scheduleMedReminder(
          'Fasting window ending soon',
          `Your ${fastingSettings.windowHours}h fast ends at ${new Date(endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          new Date(remindAt),
          FAST_REMINDER_ID
        );
      }
    }
    haptics.success();
    track('fast_started', { windowHours: fastingSettings.windowHours });
  };

  const handleEnd = async () => {
    if (!activeFast) return;
    haptics.medium();
    const endedAt = Date.now();
    const completed = endedAt - activeFast.startedAt >= activeFast.targetHours * 3600e3;
    endFast(activeFast.id, endedAt, completed);
    await notifications.cancel(FAST_REMINDER_ID);
    haptics.success();
    track('fast_ended', { completed: completed ? 1 : 0 });
  };

  const history = fastingLogs.filter((l) => l.endedAt != null).slice(0, 7);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Fasting</h1>

      {/* Active fast / Start */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-5 shadow-[var(--shadow-card)]">
        {activeFast ? (
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
                <circle cx="80" cy="80" r={R} fill="none" strokeWidth="12" className="stroke-slate-200" />
                <circle
                  cx="80" cy="80" r={R} fill="none" strokeWidth="12" strokeLinecap="round"
                  className="stroke-sky-500 transition-all duration-1000"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-slate-800 tabular-nums">
                  {remainingMs >= 0 ? fmt(remainingMs) : 'Done'}
                </p>
                <p className="text-xs text-slate-400">
                  {remainingMs >= 0 ? 'remaining' : 'window reached'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              {Math.floor(elapsedMs / 3600e3)}h {(Math.floor(elapsedMs / 60e3) % 60)}m elapsed of {activeFast.targetHours}h
            </p>
            <button onClick={handleEnd} aria-label="End fast"
              className="mt-4 px-6 py-3 rounded-xl bg-slate-800 text-white text-sm font-bold active:scale-95 transition-all">
              End Fast
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Timer className="w-10 h-10 text-sky-500 mb-2" />
            <p className="text-lg font-bold text-slate-800">{fastingSettings.windowHours}:{(24 - fastingSettings.windowHours)} window</p>
            <p className="text-sm text-slate-500 mb-4">Ready when you are — tap start to begin fasting.</p>
            <button onClick={handleStart} aria-label="Start fast"
              className="px-8 py-3 rounded-xl bg-sky-500 text-white font-semibold shadow-lg active:scale-95 transition-all">
              Start Fast
            </button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-3">
        <p className="text-sm font-medium text-slate-600">Fasting window</p>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((h) => (
            <button key={h} onClick={() => { updateFastingSettings({ windowHours: h }); setCustomHours(''); }} aria-label={`Set ${h} hour window`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${fastingSettings.windowHours === h && !customHours ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {h}:{24 - h}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Custom hours" value={customHours} min="1" max="72"
            onChange={(e) => {
              setCustomHours(e.target.value);
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) updateFastingSettings({ windowHours: v });
            }}
            className="w-32 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          <span className="text-xs text-slate-400">fasting hours</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {fastingSettings.enabled ? <Bell className="w-4 h-4 text-sky-500" /> : <BellOff className="w-4 h-4 text-slate-300" />}
            Window-end reminder
          </div>
          <button onClick={() => updateFastingSettings({ enabled: !fastingSettings.enabled })}
            aria-label={fastingSettings.enabled ? 'Disable fasting reminders' : 'Enable fasting reminders'}
            className={`relative w-12 h-7 rounded-full transition-colors ${fastingSettings.enabled ? 'bg-sky-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${fastingSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-slate-600 mb-2">Recent fasts</p>
          <div className="space-y-2">
            {history.map((log) => {
              const hrs = ((log.endedAt ?? log.startedAt) - log.startedAt) / 3600e3;
              return (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {new Date(log.startedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    {hrs.toFixed(1)}h / {log.targetHours}h
                    {log.completed && <Check className="w-4 h-4 text-emerald-500" aria-label="Completed" />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
