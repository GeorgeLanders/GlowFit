import { useState, useMemo } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Calculator, ArrowLeft, Flame } from 'lucide-react';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose' | 'maintain' | 'gain';

const activityMultipliers: Record<ActivityLevel, { label: string; value: number; desc: string }> = {
  sedentary: { label: 'Sedentary', value: 1.2, desc: 'Desk job, little exercise' },
  light: { label: 'Lightly Active', value: 1.375, desc: '1-3 workouts/week' },
  moderate: { label: 'Moderately Active', value: 1.55, desc: '3-5 workouts/week' },
  active: { label: 'Active', value: 1.725, desc: '6-7 workouts/week' },
  very_active: { label: 'Very Active', value: 1.9, desc: 'Athlete level' },
};

export default function TDEECalculator() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const profile = useGlowFitStore((s) => s.profile);

  const [gender, setGender] = useState<'male' | 'female'>((profile.gender as 'male' | 'female') || 'female');
  const [age, setAge] = useState(profile.age || 30);
  const [weight, setWeight] = useState(profile.currentWeight || 70);
  const [height, setHeight] = useState(profile.height || 165);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');

  const result = useMemo(() => {
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = Math.round(bmr * activityMultipliers[activity].value);
    const goalCalories = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
    const protein = Math.round(weight * (goal === 'lose' ? 2.2 : 1.8));
    const fat = Math.round(goalCalories * 0.25 / 9);
    const carbs = Math.max(0, Math.round((goalCalories - protein * 4 - fat * 9) / 4));
    return { bmr: Math.round(bmr), tdee, goalCalories, protein, fat, carbs };
  }, [gender, age, weight, height, activity, goal]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-serif text-rose-900">TDEE Calculator</h1>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-8 h-8" />
          <div>
            <p className="text-sm text-white/80">Your TDEE</p>
            <p className="text-3xl font-bold">{result.tdee} kcal/day</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">BMR</p>
            <p className="font-bold">{result.bmr}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">Goal</p>
            <p className="font-bold">{result.goalCalories}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">Protein</p>
            <p className="font-bold">{result.protein}g</p>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex gap-3">
          <button onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl font-medium transition-all ${gender === 'female' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'}`}>♀ Female</button>
          <button onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl font-medium transition-all ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>♂ Male</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500">Age</label>
            <input type="number" value={age} onChange={e => setAge(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium" />
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">Activity Level</p>
        <div className="space-y-2">
          {(Object.entries(activityMultipliers) as [ActivityLevel, { label: string; value: number; desc: string }][]).map(([key, val]) => (
            <button key={key} onClick={() => setActivity(key)} className={`w-full p-3 rounded-xl text-left transition-all ${activity === key ? 'bg-orange-100 border-2 border-orange-400' : 'bg-slate-50 border-2 border-transparent'}`}>
              <p className="font-medium text-slate-800">{val.label}</p>
              <p className="text-xs text-slate-500">{val.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">Goal</p>
        <div className="flex gap-3">
          {([['lose', 'Lose Weight', 'bg-blue-500'], ['maintain', 'Maintain', 'bg-emerald-500'], ['gain', 'Gain Muscle', 'bg-rose-500']] as const).map(([key, label, color]) => (
            <button key={key} onClick={() => setGoal(key)} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${goal === key ? `${color} text-white` : 'bg-slate-100 text-slate-600'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">Recommended Macros</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{result.protein}g</p>
            <p className="text-xs text-slate-500">Protein</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{result.carbs}g</p>
            <p className="text-xs text-slate-500">Carbs</p>
          </div>
          <div className="text-center p-3 bg-rose-50 rounded-xl">
            <p className="text-2xl font-bold text-rose-600">{result.fat}g</p>
            <p className="text-xs text-slate-500">Fat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
