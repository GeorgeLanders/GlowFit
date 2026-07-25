import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Search, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';

const exerciseDatabase = [
  { id: '1', name: 'Bench Press', category: 'Chest', muscle: 'Pectorals', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '2', name: 'Squat', category: 'Legs', muscle: 'Quadriceps', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '3', name: 'Deadlift', category: 'Back', muscle: 'Hamstrings', equipment: 'Barbell', difficulty: 'Advanced' },
  { id: '4', name: 'Pull-up', category: 'Back', muscle: 'Latissimus Dorsi', equipment: 'Bodyweight', difficulty: 'Intermediate' },
  { id: '5', name: 'Overhead Press', category: 'Shoulders', muscle: 'Deltoids', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '6', name: 'Barbell Row', category: 'Back', muscle: 'Rhomboids', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '7', name: 'Bicep Curl', category: 'Arms', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { id: '8', name: 'Tricep Dip', category: 'Arms', muscle: 'Triceps', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '9', name: 'Lunges', category: 'Legs', muscle: 'Quadriceps', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '10', name: 'Leg Press', category: 'Legs', muscle: 'Quadriceps', equipment: 'Machine', difficulty: 'Beginner' },
  { id: '11', name: 'Cable Fly', category: 'Chest', muscle: 'Pectorals', equipment: 'Cable', difficulty: 'Beginner' },
  { id: '12', name: 'Lat Pulldown', category: 'Back', muscle: 'Latissimus Dorsi', equipment: 'Machine', difficulty: 'Beginner' },
  { id: '13', name: 'Face Pull', category: 'Shoulders', muscle: 'Rear Deltoids', equipment: 'Cable', difficulty: 'Beginner' },
  { id: '14', name: 'Plank', category: 'Core', muscle: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '15', name: 'Russian Twist', category: 'Core', muscle: 'Obliques', equipment: 'Bodyweight', difficulty: 'Beginner' },
  { id: '16', name: 'Hip Thrust', category: 'Legs', muscle: 'Glutes', equipment: 'Barbell', difficulty: 'Intermediate' },
  { id: '17', name: 'Dumbbell Row', category: 'Back', muscle: 'Latissimus Dorsi', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { id: '18', name: 'Calf Raise', category: 'Legs', muscle: 'Calves', equipment: 'Machine', difficulty: 'Beginner' },
  { id: '19', name: 'Hammer Curl', category: 'Arms', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner' },
  { id: '20', name: 'Skull Crusher', category: 'Arms', muscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate' },
];

const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

export default function ExerciseBrowser() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = exerciseDatabase.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || ex.muscle.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-serif text-rose-900">Exercise Library</h1>
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
        <input type="text" placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm text-slate-800 placeholder-slate-400" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-rose-500 text-white' : 'bg-white/70 text-slate-600 border border-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">{filtered.length} exercises</p>

      <div className="space-y-2">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[var(--shadow-card)] overflow-hidden">
            <button onClick={() => setExpanded(expanded === ex.id ? null : ex.id)} className="w-full p-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">{ex.name}</h3>
                <p className="text-sm text-slate-500">{ex.muscle}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[ex.difficulty]}`}>{ex.difficulty}</span>
              {expanded === ex.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {expanded === ex.id && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Category</span><span className="text-slate-800">{ex.category}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Equipment</span><span className="text-slate-800">{ex.equipment}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Difficulty</span><span className="text-slate-800">{ex.difficulty}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
