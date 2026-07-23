import { useGlowFitStore } from '../lib/store';
import { Dumbbell, Plus, Timer, BookOpen, Wind } from 'lucide-react';

export default function Workouts() {
  const workouts = useGlowFitStore((s) => s.workouts);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Workouts</h1>
        <button
          onClick={() => pushScreen('workout-logger')}
          className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Timer, label: 'Timer', screen: 'workout-timer', color: 'bg-emerald-100 text-emerald-600' },
          { icon: BookOpen, label: 'Templates', screen: 'workout-templates', color: 'bg-violet-100 text-violet-600' },
          { icon: Wind, label: 'Breathing', screen: 'breathing-exercises', color: 'bg-blue-100 text-blue-600' },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => pushScreen(a.screen)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${a.color} border border-white/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-95`}
          >
            <a.icon className="w-5 h-5" />
            <span className="text-xs font-bold">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Workouts */}
      {workouts.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] text-center">
          <Dumbbell className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No workouts logged yet</p>
          <p className="text-xs text-slate-400 mt-1">Tap "Log" to record your first workout</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.slice(0, 10).map((w) => (
            <div key={w.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{w.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{w.type} • {w.duration} min • {w.sets.length} exercises</p>
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
