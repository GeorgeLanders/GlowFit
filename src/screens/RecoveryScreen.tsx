import { useGlowFitStore } from '../lib/store';
import { Battery, AlertTriangle, Check } from 'lucide-react';

export default function RecoveryScreen() {
  const workouts = useGlowFitStore((s) => s.workouts);
  const today = new Date().toISOString().split('T')[0] ?? '';
  const recentWorkouts = workouts.filter((w) => {
    const d = new Date(w.date);
    const diff = (new Date(today).getTime() - d.getTime()) / 86400000;
    return diff <= 3;
  });

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const intensity = recentWorkouts.length > 3 ? 'high' : recentWorkouts.length > 1 ? 'moderate' : 'low';

  const tips: Record<string, string[]> = {
    high: ['Take a full rest day today', 'Prioritize 8+ hours of sleep', 'Consider a gentle walk or stretching', 'Eat extra protein (1.6-2g per kg)'],
    moderate: ['Light active recovery (yoga, walk)', 'Foam roll for 10-15 minutes', 'Stay hydrated — aim for 3L today', 'Focus on anti-inflammatory foods'],
    low: ['You are well recovered!', 'Great time for an intense workout', 'Keep stretching daily', 'Maintain consistent sleep schedule'],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Recovery</h1>

      {/* Status Card */}
      <div className={`rounded-2xl p-6 shadow-[var(--shadow-card)] ${
        intensity === 'high' ? 'bg-amber-50 border border-amber-200' :
        intensity === 'moderate' ? 'bg-blue-50 border border-blue-200' :
        'bg-emerald-50 border border-emerald-200'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          {intensity === 'high' ? <AlertTriangle className="w-6 h-6 text-amber-500" /> :
           <Battery className="w-6 h-6 text-emerald-500" />}
          <div>
            <h2 className="font-bold text-slate-800 capitalize">{intensity} Load</h2>
            <p className="text-xs text-slate-500">{recentWorkouts.length} workouts in last 3 days</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Recommendations</h3>
        <div className="space-y-2">
          {tips[intensity].map((tip) => (
            <div key={tip} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Group Check */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Soreness Check</h3>
        <div className="grid grid-cols-2 gap-2">
          {muscleGroups.map((group) => (
            <div key={group} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
              <span className="text-sm text-slate-700">{group}</span>
              <span className="text-xs text-slate-400">—</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
