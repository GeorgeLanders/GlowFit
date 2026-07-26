import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Camera, Plus, X, Image } from 'lucide-react';
import { takePhoto, pickPhoto } from '../lib/camera';
import { photos } from '../lib/api';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';

const API_BASE = import.meta.env.VITE_API_URL || 'https://glowfit-api.georgelanders2.workers.dev';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type MoodTag = 'great' | 'good' | 'okay' | 'bad';

interface FoodPhotoEntry {
  id: string;
  imageUrl: string;
  mealType: MealType;
  mood: MoodTag;
  notes: string;
  date: string;
  calories?: number;
}

const mealEmojis: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
const moodEmojis: Record<MoodTag, string> = { great: '😋', good: '😊', okay: '😐', bad: '😞' };

export default function FoodPhotoJournal() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [entries, setEntries] = useState<FoodPhotoEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [selectedMood, setSelectedMood] = useState<MoodTag>('good');
  const [notes, setNotes] = useState('');
  const [filterMeal, setFilterMeal] = useState<MealType | 'all'>('all');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleTakePhoto = async () => {
    haptics.medium();
    const url = await takePhoto();
    if (url) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], `food_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const result = await photos.upload(file, 'food');
        setPhotoUrl(`${API_BASE}${result.url}`);
      } catch {
        setPhotoUrl(url);
      }
      haptics.success();
      track('food_photo_captured');
    }
  };

  const handlePickPhoto = async () => {
    haptics.light();
    const url = await pickPhoto();
    if (url) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], `food_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const result = await photos.upload(file, 'food');
        setPhotoUrl(`${API_BASE}${result.url}`);
      } catch {
        setPhotoUrl(url);
      }
      haptics.success();
      track('food_photo_picked');
    }
  };

  const addEntry = () => {
    const newEntry: FoodPhotoEntry = {
      id: Date.now().toString(),
      imageUrl: photoUrl,
      mealType: selectedMeal,
      mood: selectedMood,
      notes,
      date: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setNotes('');
    setPhotoUrl('');
    setShowAdd(false);
    haptics.success();
    track('food_photo_entry_added');
  };

  const filtered = filterMeal === 'all' ? entries : entries.filter(e => e.mealType === filterMeal);

  // Stats
  const moodDistribution = { great: entries.filter(e => e.mood === 'great').length, good: entries.filter(e => e.mood === 'good').length, okay: entries.filter(e => e.mood === 'okay').length, bad: entries.filter(e => e.mood === 'bad').length };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-serif text-rose-900">Food Photo Journal</h1>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm text-white/80 mb-1">This Week</p>
        <p className="text-2xl font-bold">{entries.length} meals logged</p>
        <div className="flex gap-4 mt-3">
          {(Object.entries(moodDistribution) as [MoodTag, number][]).map(([mood, count]) => (
            <div key={mood} className="text-center">
              <span className="text-lg">{moodEmojis[mood]}</span>
              <p className="text-sm font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map(f => (
          <button key={f} onClick={() => setFilterMeal(f)} aria-label={`Filter by ${f}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterMeal === f ? 'bg-amber-500 text-white' : 'bg-white/70 text-slate-600 border border-slate-200'}`}>
            {f === 'all' ? '🍽️ All' : `${mealEmojis[f]} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? "Cancel" : "Add food photo"} className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
        {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {showAdd ? 'Cancel' : 'Add Food Photo'}
      </button>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-3">
          {photoUrl ? (
            <div className="relative">
              <img src={photoUrl} alt="Food" className="w-full h-32 object-cover rounded-xl" />
              <button onClick={() => setPhotoUrl('')} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleTakePhoto} className="flex-1 h-32 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors">
                <Camera className="w-8 h-8 text-slate-400 mb-1" />
                <p className="text-sm text-slate-500">Take Photo</p>
              </button>
              <button onClick={handlePickPhoto} className="flex-1 h-32 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors">
                <Image className="w-8 h-8 text-slate-400 mb-1" />
                <p className="text-sm text-slate-500">Choose from Gallery</p>
              </button>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Meal Type</p>
            <div className="flex gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
                <button key={meal} onClick={() => setSelectedMeal(meal)} aria-label={`Select ${meal}`}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${selectedMeal === meal ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {mealEmojis[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">How did it feel?</p>
            <div className="flex gap-2">
              {(['great', 'good', 'okay', 'bad'] as const).map(mood => (
                <button key={mood} onClick={() => setSelectedMood(mood)} aria-label={`Mood: ${mood}`}
                  className={`flex-1 py-2 rounded-xl text-lg transition-all ${selectedMood === mood ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-slate-100'}`}>
                  {moodEmojis[mood]}
                </button>
              ))}
            </div>
          </div>

          <input type="text" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-slate-800" />

          <button onClick={addEntry} aria-label="Save entry" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold active:scale-95 transition-all">Save Entry</button>
        </div>
      )}

      {/* Entries Grid */}
      <div className="space-y-3">
        {filtered.map(entry => (
          <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-slate-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{mealEmojis[entry.mealType]}</span>
                  <span className="font-medium text-slate-800 capitalize">{entry.mealType}</span>
                  <span>{moodEmojis[entry.mood]}</span>
                </div>
                {entry.notes && <p className="text-sm text-slate-600">{entry.notes}</p>}
                <p className="text-xs text-slate-400 mt-1">{new Date(entry.date).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No food photos yet. Start logging!</p>
          </div>
        )}
      </div>
    </div>
  );
}
