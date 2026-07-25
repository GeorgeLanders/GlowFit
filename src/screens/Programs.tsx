import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Dumbbell, ChevronRight, Check, Flame } from 'lucide-react';

interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  daysPerWeek: number;
  exercises: string[];
  color: string;
  isActive: boolean;
}

const programDatabase: WorkoutProgram[] = [
  { id: '1', name: 'Beginner Strength', description: 'Full body strength training for beginners. Build a solid foundation.', duration: '4 weeks', difficulty: 'Beginner', daysPerWeek: 3, exercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row'], color: 'from-emerald-500 to-teal-500', isActive: false },
  { id: '2', name: 'Hypertrophy Builder', description: 'High-volume training focused on muscle growth.', duration: '8 weeks', difficulty: 'Intermediate', daysPerWeek: 5, exercises: ['Chest Fly', 'Leg Press', 'Lat Pulldown', 'Lateral Raise', 'Cable Row'], color: 'from-rose-500 to-pink-500', isActive: false },
  { id: '3', name: 'Powerlifting Peaking', description: 'Intensify your squat, bench, and deadlift for competition.', duration: '6 weeks', difficulty: 'Advanced', daysPerWeek: 4, exercises: ['Competition Squat', 'Competition Bench', 'Competition Deadlift', 'Pause Squat', 'Close-Grip Bench'], color: 'from-amber-500 to-orange-500', isActive: false },
  { id: '4', name: 'Fat Loss Blitz', description: 'High-intensity circuit training for maximum calorie burn.', duration: '4 weeks', difficulty: 'Intermediate', daysPerWeek: 4, exercises: ['Burpees', 'Kettlebell Swings', 'Box Jumps', 'Battle Ropes', 'Mountain Climbers'], color: 'from-blue-500 to-indigo-500', isActive: false },
  { id: '5', name: 'Home Bodyweight', description: 'No equipment needed. Train anywhere with just your bodyweight.', duration: '6 weeks', difficulty: 'Beginner', daysPerWeek: 3, exercises: ['Push-ups', 'Pull-ups', 'Pistol Squats', 'Plank', 'Dips'], color: 'from-purple-500 to-violet-500', isActive: false },
];

export default function Programs() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [programs, setPrograms] = useState(programDatabase);
  const [selected, setSelected] = useState<string | null>(null);

  const startProgram = (id: string) => {
    setPrograms(prev => prev.map(p => ({ ...p, isActive: p.id === id })));
    setSelected(id);
  };

  const activeProgram = programs.find(p => p.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-serif text-rose-900">Workout Programs</h1>
        </div>
      </div>

      {/* Active Program */}
      {activeProgram && (
        <div className={`bg-gradient-to-br ${activeProgram.color} rounded-2xl p-5 text-white shadow-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm text-white/80">Active Program</span>
          </div>
          <h3 className="text-lg font-bold">{activeProgram.name}</h3>
          <p className="text-sm text-white/80">{activeProgram.duration} · {activeProgram.daysPerWeek} days/week</p>
        </div>
      )}

      {/* Program List */}
      <div className="space-y-3">
        {programs.map(program => (
          <button key={program.id} onClick={() => setSelected(selected === program.id ? null : program.id)}
            aria-label={`${program.name} program`}
            aria-expanded={selected === program.id}
            className={`w-full text-left bg-white/70 backdrop-blur-sm rounded-2xl p-4 border transition-all ${program.isActive ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-white/40'} shadow-[var(--shadow-card)]`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center`}>
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{program.name}</h3>
                <p className="text-sm text-slate-500">{program.duration} · {program.daysPerWeek}d/wk · {program.difficulty}</p>
              </div>
              {program.isActive ? <Check className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </div>

            {selected === program.id && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-3">{program.description}</p>
                <div className="space-y-1 mb-3">
                  {program.exercises.map(ex => (
                    <div key={ex} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-400" /> {ex}
                    </div>
                  ))}
                </div>
                {!program.isActive && (
                  <button onClick={(e) => { e.stopPropagation(); startProgram(program.id); }}
                    aria-label={`Start ${program.name} program`}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${program.color} text-white font-semibold active:scale-95 transition-all`}>
                    Start Program
                  </button>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
