import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Smile, Coffee, Sun, Moon as MoonIcon, Cookie, TrendingUp, Plus } from 'lucide-react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MOODS = [
  { value: 1, emoji: '😔', label: 'Sad' },
  { value: 2, emoji: '😐', label: 'Low' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Great' },
];

const MEAL_TYPES: { key: MealType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: <Sun className="w-4 h-4" />, color: 'text-amber-500 bg-amber-50' },
  { key: 'lunch', label: 'Lunch', icon: <Coffee className="w-4 h-4" />, color: 'text-cyan-500 bg-cyan-50' },
  { key: 'dinner', label: 'Dinner', icon: <MoonIcon className="w-4 h-4" />, color: 'text-violet-500 bg-violet-50' },
  { key: 'snack', label: 'Snack', icon: <Cookie className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-50' },
];

interface MoodMealEntry {
  mood: number;
  mealType: MealType;
  food: string;
  notes: string;
  beforeMeal: boolean;
  timestamp: number;
}

const INSIGHTS = [
  { pattern: 'Higher mood after protein-rich breakfasts', icon: '💡' },
  { pattern: 'Mood dips around 3pm — try a healthy snack', icon: '📉' },
  { pattern: 'Exercise days correlate with better evening mood', icon: '🏃' },
  { pattern: 'Water intake affects afternoon energy', icon: '💧' },
];

export default function MoodMeal() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [mood, setMood] = useState(0);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [food, setFood] = useState('');
  const [notes, setNotes] = useState('');
  const [beforeMeal, setBeforeMeal] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [entries, setEntries] = useState<MoodMealEntry[]>([]);

  const save = () => {
    if (mood === 0 || !food.trim()) return;
    const entry: MoodMealEntry = { mood, mealType, food: food.trim(), notes: notes.trim(), beforeMeal, timestamp: Date.now() };
    setEntries(prev => [entry, ...prev]);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setMood(0); setFood(''); setNotes(''); }, 2000);
  };

  const weeklyTrend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const dayEntries = entries.filter(e => new Date(e.timestamp).getDay() === (i + 1) % 7);
    const avg = dayEntries.length > 0 ? dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length : 3;
    return { day, avg };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-serif text-rose-900">Mood & Meal Tracker</h1>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-emerald-700">✅ Entry saved!</p>
        </div>
      )}

      {/* Mood */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">How are you feeling?</p>
        <div className="flex justify-center gap-3">
          {MOODS.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} aria-label={`Mood: ${m.label}`} className={`flex flex-col items-center p-3 rounded-xl transition-all ${mood === m.value ? 'bg-rose-100 border-2 border-rose-400 scale-110' : 'bg-slate-50 border-2 border-transparent'}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-slate-500 mt-1">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meal */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">What did you eat?</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {MEAL_TYPES.map(mt => (
            <button key={mt.key} onClick={() => setMealType(mt.key)} aria-label={`Select ${mt.label}`} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${mealType === mt.key ? `${mt.color} border-2 border-current` : 'bg-slate-50 border-2 border-transparent'}`}>
              {mt.icon}
              <span className="text-xs font-medium">{mt.label}</span>
            </button>
          ))}
        </div>
        <input value={food} onChange={e => setFood(e.target.value)} placeholder="e.g., Grilled chicken salad..." className="w-full p-3 rounded-xl border border-slate-200 text-sm" />
      </div>

      {/* Before/After + Notes */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex gap-2">
          <button onClick={() => setBeforeMeal(true)} aria-label="Before meal" className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${beforeMeal ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Before Meal</button>
          <button onClick={() => setBeforeMeal(false)} aria-label="After meal" className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!beforeMeal ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600'}`}>After Meal</button>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes? (optional)" className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none h-16" />
      </div>

      <button onClick={save} disabled={mood === 0 || !food.trim()} aria-label="Save entry" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg disabled:opacity-40 transition-all active:scale-[0.98]">
        <span className="flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Save Entry</span>
      </button>

      {/* Weekly Trend */}
      {entries.length > 0 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Weekly Mood Trend</p>
          <div className="flex items-end gap-2 h-24">
            {weeklyTrend.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-rose-200 rounded-t-lg" style={{ height: `${(d.avg / 5) * 100}%`, minHeight: '4px' }} />
                <span className="text-[9px] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-amber-700 mb-3">🔍 Pattern Insights</p>
        <div className="space-y-2">
          {INSIGHTS.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span>{insight.icon}</span>
              <span>{insight.pattern}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      {entries.length > 0 && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-slate-600 mb-3">Recent Entries</p>
          <div className="space-y-2">
            {entries.slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                <span className="text-lg">{MOODS[e.mood - 1]?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{e.food}</p>
                  <p className="text-xs text-slate-400">{e.mealType} • {e.beforeMeal ? 'before' : 'after'}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
