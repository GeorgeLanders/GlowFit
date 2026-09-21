import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

type Exercise = { name: string; sets: { reps: number; weight: number }[] };
type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'sports';
const TYPES: WorkoutType[] = ['strength', 'cardio', 'hiit', 'flexibility', 'sports'];

export default function WorkoutLogger() {
  const { workouts, addWorkout, deleteWorkout } = useGlowFitStore();
  const [showForm, setShowForm] = useState(false);
  const [wName, setWName] = useState('');
  const [wType, setWType] = useState<WorkoutType>('strength');
  const [duration, setDuration] = useState('30');
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: [{ reps: 10, weight: 0 }] }]);

  const addExercise = () => setExercises([...exercises, { name: '', sets: [{ reps: 10, weight: 0 }] }]);
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i));
  const addSet = (ei: number) => {
    const ex = [...exercises]; ex[ei].sets.push({ reps: 10, weight: 0 }); setExercises(ex);
  };
  const updateSet = (ei: number, si: number, field: 'reps' | 'weight', val: number) => {
    const ex = [...exercises]; ex[ei].sets[si][field] = val; setExercises(ex);
  };
  const updateExName = (ei: number, name: string) => {
    const ex = [...exercises]; ex[ei].name = name; setExercises(ex);
  };

  const save = () => {
    const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0);
    addWorkout({
      id: Date.now().toString(), date: new Date().toISOString().split('T')[0] ?? '',
      name: wName || `${wType} workout`, type: wType,
      duration: parseInt(duration) || 0, caloriesBurned: Math.round(totalSets * 8 + parseInt(duration) * 5),
      sets: exercises.flatMap((e) => e.sets.map((s) => ({ exerciseName: e.name, sets: 1, reps: s.reps, weight: s.weight, completed: true }))),
      notes: '',
    });
    setShowForm(false); setWName(''); setExercises([{ name: '', sets: [{ reps: 10, weight: 0 }] }]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Workouts</h1>
        <button onClick={() => setShowForm(!showForm)} aria-label={showForm ? 'Cancel' : 'Log workout'} className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Log'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-3">
          <input value={wName} onChange={(e) => setWName(e.target.value)} placeholder="Workout name" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setWType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${wType === t ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>
            ))}
          </div>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (min)" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />

          {exercises.map((ex, ei) => (
            <div key={ei} className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input value={ex.name} onChange={(e) => updateExName(ei, e.target.value)} placeholder="Exercise name" className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm" />
                {exercises.length > 1 && <button onClick={() => removeExercise(ei)} aria-label="Remove exercise"><Trash2 className="w-4 h-4 text-red-400" /></button>}
              </div>
              {ex.sets.map((s, si) => (
                <div key={si} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-8">Set {si + 1}</span>
                  <input type="number" value={s.reps} onChange={(e) => updateSet(ei, si, 'reps', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-200" placeholder="Reps" />
                  <input type="number" value={s.weight} onChange={(e) => updateSet(ei, si, 'weight', parseInt(e.target.value) || 0)} className="w-20 px-2 py-1 rounded-lg bg-white border border-slate-200" placeholder="kg" />
                </div>
              ))}
              <button onClick={() => addSet(ei)} aria-label="Add set" className="text-xs text-rose-500 font-bold">+ Add Set</button>
            </div>
          ))}
          <button onClick={addExercise} aria-label="Add exercise" className="text-xs text-rose-500 font-bold">+ Add Exercise</button>
          <button onClick={save} aria-label="Save workout" className="w-full bg-rose-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-rose-600">Save Workout</button>
        </div>
      )}

      {workouts.length === 0 ? (
        <EmptyState emoji="🏋️" title="No workouts yet" message="Your logged workouts will appear here" />
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div key={w.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{w.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{w.type} • {w.duration} min • {w.sets.length} exercises</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-500 font-bold text-sm">{w.caloriesBurned} kcal</span>
                  <button onClick={() => deleteWorkout(w.id)} aria-label="Delete workout"><Trash2 className="w-4 h-4 text-slate-300" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
