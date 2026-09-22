import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { BookOpen, Plus, Play, ChevronRight } from 'lucide-react';

type Template = {
  id: string;
  name: string;
  type: string;
  exercises: { name: string; sets: number; reps: number; weight: number }[];
  estimatedMinutes: number;
};

const PRESETS: Template[] = [
  {
    id: 'preset-push', name: 'Push Day', type: 'strength', estimatedMinutes: 45,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 30 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: 20 },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 10 },
      { name: 'Tricep Dips', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    id: 'preset-pull', name: 'Pull Day', type: 'strength', estimatedMinutes: 45,
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 5, weight: 80 },
      { name: 'Barbell Row', sets: 4, reps: 8, weight: 50 },
      { name: 'Lat Pulldown', sets: 3, reps: 12, weight: 40 },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 15 },
      { name: 'Barbell Curl', sets: 3, reps: 12, weight: 20 },
    ],
  },
  {
    id: 'preset-legs', name: 'Leg Day', type: 'strength', estimatedMinutes: 50,
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, weight: 70 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 50 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 100 },
      { name: 'Walking Lunges', sets: 3, reps: 12, weight: 15 },
      { name: 'Calf Raises', sets: 4, reps: 15, weight: 30 },
    ],
  },
  {
    id: 'preset-hiit', name: 'HIIT Blast', type: 'hiit', estimatedMinutes: 25,
    exercises: [
      { name: 'Burpees', sets: 3, reps: 15, weight: 0 },
      { name: 'Mountain Climbers', sets: 3, reps: 20, weight: 0 },
      { name: 'Jump Squats', sets: 3, reps: 15, weight: 0 },
      { name: 'High Knees', sets: 3, reps: 30, weight: 0 },
    ],
  },
];

export default function WorkoutTemplates() {
  const { workoutTemplates, addWorkout, pushScreen } = useGlowFitStore();
  const [showCreate, setShowCreate] = useState(false);

  const startTemplate = (t: Template) => {
    addWorkout({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0] ?? '',
      name: t.name,
      type: t.type as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'sports',
      duration: t.estimatedMinutes,
      caloriesBurned: Math.round(t.estimatedMinutes * 8),
      sets: t.exercises.flatMap((e) =>
        Array.from({ length: e.sets }, () => ({
          exerciseName: e.name,
          sets: 1,
          reps: e.reps,
          weight: e.weight,
          completed: false,
        }))
      ),
      notes: '',
    });
    pushScreen('workout-logger');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Templates</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          aria-label="Action"
          className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Preset Templates */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Presets</h2>
        <div className="space-y-3">
          {PRESETS.map((t) => (
            <div key={t.id} className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-800">{t.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{t.type} • ~{t.estimatedMinutes} min • {t.exercises.length} exercises</p>
                </div>
                <button
                  onClick={() => startTemplate(t)}
                  aria-label="Action"
                  className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  <Play className="w-3 h-3" /> Start
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.exercises.map((e) => (
                  <span key={e.name} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {e.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      {workoutTemplates.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Custom</h2>
          <div className="space-y-3">
            {workoutTemplates.map((t) => (
              <div key={t.id} className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{t.name}</h3>
                    <p className="text-xs text-slate-400">{t.exercises.length} exercises</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse Exercises */}
      <button
        onClick={() => pushScreen('workout-logger')}
        aria-label="Action"
        className="w-full flex items-center justify-between card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-bold text-slate-700">Log Custom Workout</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}
