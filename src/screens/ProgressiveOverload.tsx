import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, TrendingUp, Trophy, ChevronDown } from 'lucide-react';

export default function ProgressiveOverload() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const workouts = useGlowFitStore((s) => s.workouts);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Extract unique exercise names from workout history
  const exerciseNames = [...new Set(workouts.flatMap(w => w.sets?.map(s => s.exerciseName) || []))];
  if (exerciseNames.length === 0) {
    exerciseNames.push('Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row');
  }

  // Get progression data for selected exercise
  const progressionData = workouts
    .filter(w => w.sets?.some(s => s.exerciseName === selectedExercise))
    .flatMap(w => w.sets.filter(s => s.exerciseName === selectedExercise).map(s => ({
      date: w.date,
      sets: s.sets || 3,
      reps: s.reps || 10,
      weight: s.weight || 0,
    })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const personalRecord = progressionData.length > 0
    ? progressionData.reduce((best, curr) => curr.weight > best.weight ? curr : best)
    : null;

  // Calculate total volume over time
  const totalVolume = progressionData.map(d => ({
    date: d.date,
    volume: d.sets * d.reps * d.weight,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-serif text-rose-900">Progressive Overload</h1>
        </div>
      </div>

      {/* Exercise Selector */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] relative">
        <p className="text-sm font-medium text-slate-600 mb-2">Select Exercise</p>
        <button onClick={() => setShowDropdown(!showDropdown)} className="w-full p-3 rounded-xl border border-slate-200 text-left flex items-center justify-between">
          <span className={selectedExercise ? 'text-slate-800' : 'text-slate-400'}>{selectedExercise || 'Choose an exercise...'}</span>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </button>
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
            {exerciseNames.map(name => (
              <button key={name} onClick={() => { setSelectedExercise(name); setShowDropdown(false); }}
                className="w-full p-3 text-left hover:bg-rose-50 text-slate-700 text-sm border-b border-slate-100 last:border-0">
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedExercise && (
        <>
          {/* Personal Record */}
          {personalRecord && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                <div>
                  <p className="text-sm text-white/80">Personal Record</p>
                  <p className="text-2xl font-bold">{personalRecord.weight}kg × {personalRecord.reps}</p>
                  <p className="text-xs text-white/60">{new Date(personalRecord.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Volume Chart */}
          {totalVolume.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
              <h3 className="font-medium text-slate-800 mb-3">Volume Progression</h3>
              <div className="flex items-end gap-1 h-32">
                {totalVolume.slice(-10).map((point, i) => {
                  const maxVol = Math.max(...totalVolume.map(p => p.volume));
                  const height = maxVol > 0 ? (point.volume / maxVol) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all" style={{ height: `${Math.max(height, 4)}%` }} />
                      <span className="text-[10px] text-slate-400">{new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Sets */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <h3 className="font-medium text-slate-800 mb-3">Recent Sessions</h3>
            <div className="space-y-2">
              {progressionData.slice(-5).reverse().map((set, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{new Date(set.date).toLocaleDateString()}</span>
                  <span className="font-medium text-slate-800">{set.sets}×{set.reps} @ {set.weight}kg</span>
                  <span className="text-sm text-slate-400">{set.sets * set.reps * set.weight}kg vol</span>
                </div>
              ))}
              {progressionData.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No data yet. Log workouts to see progression.</p>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedExercise && (
        <div className="text-center py-12 text-slate-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select an exercise to view progression</p>
        </div>
      )}
    </div>
  );
}
