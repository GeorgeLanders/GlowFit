import { useState, useRef, useCallback } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Play, Pause, RotateCcw, Flag, Save, Dumbbell } from 'lucide-react';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutTimer() {
  const { addWorkout } = useGlowFitStore();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const lap = useCallback(() => {
    setLaps((prev) => [elapsed, ...prev]);
  }, [elapsed]);

  const saveWorkout = () => {
    if (elapsed < 10) return;
    addWorkout({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0] ?? '',
      name: workoutName || 'Timed Workout',
      type: 'strength',
      duration: Math.round(elapsed / 60),
      caloriesBurned: Math.round(elapsed * 0.15),
      sets: [],
      notes: laps.length > 0 ? `Laps: ${laps.map(formatTime).join(', ')}` : '',
    });
    reset();
    setWorkoutName('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Timer Display */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40 p-8 shadow-[var(--shadow-card)] flex flex-col items-center">
        <Dumbbell className="w-8 h-8 text-rose-300 mb-4" />
        <div className="text-6xl font-mono font-bold text-slate-800 tracking-wider mb-2">
          {formatTime(elapsed)}
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-widest">
          {running ? 'In Progress' : elapsed > 0 ? 'Paused' : 'Ready'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!running ? (
          <button
                      onClick={start}
                      aria-label="Start timer"
                      className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <Play className="w-7 h-7 ml-1" />
          </button>
        ) : (
          <button
                      onClick={pause}
                      aria-label="Pause timer"
                      className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
          >
            <Pause className="w-7 h-7" />
          </button>
        )}

        {elapsed > 0 && !running && (
          <button
                      onClick={reset}
                      aria-label="Reset timer"
                      className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {running && (
          <button
                      onClick={lap}
                      aria-label="Record lap"
                      className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-lg hover:bg-violet-600 active:scale-95 transition-all"
          >
            <Flag className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Laps</h3>
          <div className="space-y-2">
            {laps.map((lapTime, i) => {
              const prev = laps[i + 1] ?? 0;
              const split = lapTime - prev;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Lap {laps.length - i}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">+{formatTime(split)}</span>
                    <span className="font-mono font-bold text-slate-700">{formatTime(lapTime)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save */}
      {elapsed >= 10 && !running && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-3">
          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Workout name (optional)"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm"
          />
          <button
                      onClick={saveWorkout}
                      aria-label="Save workout"
                      className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4" />
            Save Workout ({formatTime(elapsed)})
          </button>
        </div>
      )}
    </div>
  );
}
