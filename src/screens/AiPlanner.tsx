import { useState, useMemo } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Sparkles, ArrowLeft, Flame, User, Activity, Utensils, ChevronRight, Dumbbell, Lightbulb } from 'lucide-react';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type DietPref = 'balanced' | 'keto' | 'vegan' | 'paleo' | 'high_protein';
type Gender = 'male' | 'female' | 'other';

const ACTIVITY_OPTIONS: { key: ActivityLevel; label: string; desc: string }[] = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { key: 'light', label: 'Lightly Active', desc: '1-3 workouts/week' },
  { key: 'moderate', label: 'Moderately Active', desc: '3-5 workouts/week' },
  { key: 'active', label: 'Active', desc: '6-7 workouts/week' },
  { key: 'very_active', label: 'Very Active', desc: 'Athlete level' },
];

const DIET_OPTIONS: { key: DietPref; label: string; emoji: string }[] = [
  { key: 'balanced', label: 'Balanced', emoji: '🥗' },
  { key: 'keto', label: 'Keto', emoji: '🥑' },
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
  { key: 'paleo', label: 'Paleo', emoji: '🥩' },
  { key: 'high_protein', label: 'High Protein', emoji: '💪' },
];

export default function AiPlanner() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const profile = useGlowFitStore((s) => s.profile);
  const workouts = useGlowFitStore((s) => s.workouts);

  const [activeTab, setActiveTab] = useState<'setup' | 'plan'>('setup');
  const [age, setAge] = useState(profile.age || 30);
  const [height, setHeight] = useState(profile.height || 165);
  const [weight, setWeight] = useState(profile.currentWeight || 70);
  const [target, setTarget] = useState(profile.goalWeight || 65);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [diet, setDiet] = useState<DietPref>('balanced');
  const [gender, setGender] = useState<Gender>((profile.gender as Gender) || 'female');
  const [isGenerating, setIsGenerating] = useState(false);

  const bmi = useMemo(() => {
    if (height <= 0) return '0';
    return (weight / ((height / 100) ** 2)).toFixed(1);
  }, [weight, height]);

  const bmiCategory = useMemo(() => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
    if (val < 25) return { label: 'Normal', color: 'text-emerald-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-500' };
    return { label: 'Obese', color: 'text-rose-500' };
  }, [bmi]);

  const [plan, setPlan] = useState<{ workouts: string[]; nutrition: string[]; tips: string[] } | null>(null);

  const generatePlan = () => {
    setIsGenerating(true);
    // Generate plan locally based on inputs
    const workoutPlan = [
      `${activity === 'sedentary' ? '3' : activity === 'light' ? '4' : '5'}x/week training split`,
      `Target: ${target < weight ? 'fat loss' : target > weight ? 'muscle gain' : 'maintenance'}`,
      `Cardio: ${activity === 'very_active' ? '4 sessions' : '2-3 sessions'} / week`,
      'Compound movements: Squats, Deadlifts, Bench, Rows',
      'Progressive overload: +2.5kg/week on main lifts',
    ];

    const nutritionPlan = [
      `Calories: ${target < weight ? Math.round(weight * 28) : target > weight ? Math.round(weight * 35) : Math.round(weight * 32)} kcal/day`,
      `Protein: ${Math.round(weight * 1.8)}g/day (${diet === 'high_protein' ? 'priority' : 'moderate'})`,
      `Meals: ${diet === 'keto' ? 'High fat, low carb, 3 meals' : diet === 'vegan' ? 'Plant-based protein focus, 4 meals' : 'Balanced macros, 4 meals'}`,
      'Hydration: 2.5-3L water daily',
      diet === 'keto' ? 'Net carbs < 25g/day' : diet === 'vegan' ? 'Supplement B12 & Iron' : 'Carbs around workouts',
    ];

    const tips = [
      'Sleep 7-9 hours for recovery',
      'Track workouts to measure progress',
      'Take progress photos every 2 weeks',
      'Deload every 4-6 weeks',
      'Consistency > perfection',
    ];

    setTimeout(() => {
      setPlan({ workouts: workoutPlan, nutrition: nutritionPlan, tips });
      setActiveTab('plan');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h1 className="text-xl font-serif text-rose-900">AI Planner</h1>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-500 via-rose-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-8 h-8" />
          <div>
            <p className="text-xs text-white/70">AI Coach</p>
            <p className="text-xl font-bold">Your Personalized Plan</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">Workouts</p>
            <p className="font-bold">{workouts.length}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">BMI</p>
            <p className="font-bold">{bmi}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">Target</p>
            <p className="font-bold">{target}kg</p>
          </div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('setup')} aria-label="Setup tab" className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'setup' ? 'bg-violet-500 text-white shadow-md' : 'bg-white/70 text-slate-600 border border-white/40'}`}>
          Setup
        </button>
        <button onClick={() => plan && setActiveTab('plan')} aria-label="My Plan tab" className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'plan' ? 'bg-violet-500 text-white shadow-md' : 'bg-white/70 text-slate-600 border border-white/40'} ${!plan ? 'opacity-50' : ''}`}>
          My Plan
        </button>
      </div>

      {activeTab === 'setup' ? (
        <div className="space-y-4">
          {/* Profile Summary */}
          {age > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-600 flex items-center gap-1.5"><User className="w-4 h-4" /> Your Profile</p>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>Age: {age}</span>
                    <span>Weight: {weight}kg</span>
                    <span>Target: {target}kg</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border-4 border-violet-200 flex items-center justify-center">
                    <div>
                      <p className="text-sm font-bold text-violet-600">{bmi}</p>
                      <p className="text-[9px] text-slate-400">BMI</p>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${bmiCategory.color}`}>{bmiCategory.label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-3">
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><Activity className="w-4 h-4" /> Edit Profile</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Age</label>
                <input type="number" value={age} onChange={e => setAge(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Target (kg)</label>
                <input type="number" value={target} onChange={e => setTarget(+e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-center font-medium text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              {(['female', 'male', 'other'] as const).map(g => (
                <button key={g} onClick={() => setGender(g)} aria-label={`Select ${g} gender`} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${gender === g ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {g === 'female' ? '♀' : g === 'male' ? '♂' : '⚧'} {g}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5"><Flame className="w-4 h-4" /> Activity Level</p>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setActivity(opt.key)} aria-label={opt.label} className={`w-full p-3 rounded-xl text-left transition-all ${activity === opt.key ? 'bg-violet-100 border-2 border-violet-400' : 'bg-slate-50 border-2 border-transparent'}`}>
                  <p className="font-medium text-sm text-slate-800">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Diet Preference */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5"><Utensils className="w-4 h-4" /> Diet Preference</p>
            <div className="grid grid-cols-3 gap-2">
              {DIET_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setDiet(opt.key)} aria-label={opt.label} className={`p-3 rounded-xl text-center transition-all ${diet === opt.key ? 'bg-violet-100 border-2 border-violet-400' : 'bg-slate-50 border-2 border-transparent'}`}>
                  <p className="text-xl mb-1">{opt.emoji}</p>
                  <p className="text-xs font-medium text-slate-700">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={generatePlan} disabled={isGenerating} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]">
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Plan...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" /> Generate AI Plan</span>
            )}
          </button>
        </div>
      ) : plan ? (
        <div className="space-y-4">
          {/* Workout Plan */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-rose-600 mb-3 flex items-center gap-1.5"><Dumbbell className="w-4 h-4" /> Workout Plan</p>
            <div className="space-y-2">
              {plan.workouts.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <ChevronRight className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Plan */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-1.5"><Utensils className="w-4 h-4" /> Nutrition Plan</p>
            <div className="space-y-2">
              {plan.nutrition.map((n, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <ChevronRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> Pro Tips</p>
            <div className="space-y-2">
              {plan.tips.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-amber-500">•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setActiveTab('setup')} className="w-full py-3 rounded-2xl bg-white/70 border border-white/40 shadow-[var(--shadow-card)] text-sm font-medium text-slate-600">
            ← Edit Profile & Regenerate
          </button>
        </div>
      ) : null}
    </div>
  );
}
