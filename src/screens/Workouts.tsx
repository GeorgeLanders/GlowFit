import { Dumbbell, Plus } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';

export default function Workouts() {
  const workouts = useGlowFitStore((s) => s.workouts);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Workouts</h1>
        <button className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors active:scale-95">
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] text-center">
          <Dumbbell className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No workouts logged yet</p>
          <p className="text-xs text-slate-400 mt-1">Tap "Log" to record your first workout</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div key={w.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{w.name}</h3>
                  <p className="text-xs text-slate-400">{w.type} • {w.duration} min</p>
                </div>
                <span className="text-rose-500 font-bold text-sm">{w.caloriesBurned} kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
