import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Search, Dumbbell, ChevronDown, ChevronUp, Play } from 'lucide-react';

const exerciseDatabase = [
  { id: '1', name: 'Bench Press', category: 'Chest', muscle: 'Pectorals', equipment: 'Barbell', difficulty: 'Intermediate', videoId: 'hWbUlkb5Ms4' },
  { id: '2', name: 'Squat', category: 'Legs', muscle: 'Quadriceps', equipment: 'Barbell', difficulty: 'Intermediate', videoId: 'PPmvh7gBTi0' },
  { id: '3', name: 'Deadlift', category: 'Back', muscle: 'Hamstrings', equipment: 'Barbell', difficulty: 'Advanced', videoId: 'ZaTM37cfiDs' },
  { id: '4', name: 'Pull-up', category: 'Back', muscle: 'Latissimus Dorsi', equipment: 'Bodyweight', difficulty: 'Intermediate', videoId: 'OEXosPwzFdc' },
  { id: '5', name: 'Overhead Press', category: 'Shoulders', muscle: 'Deltoids', equipment: 'Barbell', difficulty: 'Intermediate', videoId: 'zoN5EH50Dro' },
  { id: '6', name: 'Barbell Row', category: 'Back', muscle: 'Rhomboids', equipment: 'Barbell', difficulty: 'Intermediate', videoId: 'Nqh7q3zDCoQ' },
  { id: '7', name: 'Bicep Curl', category: 'Arms', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', videoId: 'XE_pHwbst04' },
  { id: '8', name: 'Tricep Dip', category: 'Arms', muscle: 'Triceps', equipment: 'Bodyweight', difficulty: 'Beginner', videoId: 'aCa7cc8ECp8' },
  { id: '9', name: 'Lunges', category: 'Legs', muscle: 'Quadriceps', equipment: 'Bodyweight', difficulty: 'Beginner', videoId: '1cS-6KsJW9g' },
  { id: '10', name: 'Leg Press', category: 'Legs', muscle: 'Quadriceps', equipment: 'Machine', difficulty: 'Beginner', videoId: 'nDh_BlnLCGc' },
  { id: '11', name: 'Cable Fly', category: 'Chest', muscle: 'Pectorals', equipment: 'Cable', difficulty: 'Beginner', videoId: 'M97ra0UR-40' },
  { id: '12', name: 'Lat Pulldown', category: 'Back', muscle: 'Latissimus Dorsi', equipment: 'Machine', difficulty: 'Beginner', videoId: 'bNmvKpJSWKM' },
  { id: '13', name: 'Face Pull', category: 'Shoulders', muscle: 'Rear Deltoids', equipment: 'Cable', difficulty: 'Beginner', videoId: 'IeOqdw9WI90' },
  { id: '14', name: 'Plank', category: 'Core', muscle: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner', videoId: 'v25dawSzRTM' },
  { id: '15', name: 'Russian Twist', category: 'Core', muscle: 'Obliques', equipment: 'Bodyweight', difficulty: 'Beginner', videoId: 'wkD8rjkodUI' },
  { id: '16', name: 'Hip Thrust', category: 'Legs', muscle: 'Glutes', equipment: 'Barbell', difficulty: 'Intermediate', videoId: 'pF17m_CXfL0' },
  { id: '17', name: 'Dumbbell Row', category: 'Back', muscle: 'Latissimus Dorsi', equipment: 'Dumbbell', difficulty: 'Beginner', videoId: 'roCP6wCXPqo' },
  { id: '18', name: 'Calf Raise', category: 'Legs', muscle: 'Calves', equipment: 'Machine', difficulty: 'Beginner', videoId: 'eMTy3qylqnE' },
  { id: '19', name: 'Hammer Curl', category: 'Arms', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', videoId: 'lmIo_gVE8T4' },
  { id: '20', name: 'Skull Crusher', category: 'Arms', muscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', videoId: 'dtkD5sQLFL4' },
];

const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

function ExerciseVideo({ videoId, name }: { videoId: string; name: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`${name} demonstration video`}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button onClick={() => setPlaying(true)} aria-label={`Play ${name} video`}
      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/40 shadow-[var(--shadow-card)]">
      <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt={`${name} demonstration video`} loading="lazy"
        className="w-full h-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
        <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-[var(--shadow-card)]">
          <Play className="w-6 h-6 text-rose-500 ml-0.5" />
        </span>
      </span>
    </button>
  );
}

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
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
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
          <button key={cat} onClick={() => setSelectedCategory(cat)} aria-label={`Filter by ${cat}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-rose-500 text-white' : 'bg-white/70 text-slate-600 border border-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">{filtered.length} exercises</p>

      <div className="space-y-2">
        {filtered.map(ex => (
          <div key={ex.id} className="card-3d rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
            <button onClick={() => setExpanded(expanded === ex.id ? null : ex.id)} aria-label={expanded === ex.id ? `Collapse ${ex.name}` : `Expand ${ex.name}`} className="w-full p-4 flex items-center gap-3 text-left">
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
                {ex.videoId && <ExerciseVideo videoId={ex.videoId} name={ex.name} />}
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
