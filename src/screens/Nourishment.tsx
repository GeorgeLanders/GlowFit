import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Apple, Plus, Flame, Beef, Droplets, Wheat, X, Trash2 } from 'lucide-react';

interface Recipe {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji: string;
  meal: string;
}

interface CalorieLog {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
  timestamp: number;
}

const RECIPES: Recipe[] = [
  { name: 'Strawberry Protein Oatmeal', calories: 340, protein: 26, carbs: 38, fat: 6, emoji: '🍓', meal: 'Breakfast' },
  { name: 'Avocado Egg Toast', calories: 220, protein: 14, carbs: 18, fat: 11, emoji: '🍳', meal: 'Breakfast' },
  { name: 'Chicken Avocado Salad', calories: 410, protein: 35, carbs: 12, fat: 18, emoji: '🥗', meal: 'Lunch' },
  { name: 'Turkey Spinach Wrap', calories: 320, protein: 25, carbs: 24, fat: 8, emoji: '🌯', meal: 'Lunch' },
  { name: 'Zesty Garlic Lemon Salmon', calories: 450, protein: 38, carbs: 8, fat: 22, emoji: '🐟', meal: 'Dinner' },
  { name: 'Greek Yogurt & Almonds', calories: 210, protein: 18, carbs: 14, fat: 8, emoji: '🥛', meal: 'Snack' },
];

export default function Nourishment() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [logs, setLogs] = useState<CalorieLog[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const todayTotal = logs.reduce((s, l) => s + l.calories, 0);
  const todayProtein = logs.reduce((s, l) => s + l.protein, 0);
  const todayCarbs = logs.reduce((s, l) => s + l.carbs, 0);
  const todayFat = logs.reduce((s, l) => s + l.fat, 0);
  const CALORIE_GOAL = 2000;

  const addRecipe = (r: Recipe) => {
    setLogs(prev => [{ name: r.name, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, meal: r.meal, timestamp: Date.now() }, ...prev]);
  };

  const addCustom = () => {
    if (!customName.trim() || !customCal) return;
    setLogs(prev => [{ name: customName.trim(), calories: +customCal, protein: +customProtein || 0, carbs: +customCarbs || 0, fat: +customFat || 0, meal: 'Custom', timestamp: Date.now() }, ...prev]);
    setCustomName(''); setCustomCal(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
    setShowDialog(false);
  };

  const removeLog = (i: number) => setLogs(prev => prev.filter((_, idx) => idx !== i));

  const mealGroups = ['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(meal => ({
    meal,
    items: logs.filter(l => l.meal === meal),
    total: logs.filter(l => l.meal === meal).reduce((s, l) => s + l.calories, 0),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-serif text-rose-900">Nourishment</h1>
        </div>
      </div>

      {/* Calorie Ring */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Today's Calories</p>
            <p className="text-3xl font-bold">{todayTotal} <span className="text-base font-normal text-white/60">/ {CALORIE_GOAL}</span></p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
            <div className="text-center">
              <Flame className="w-5 h-5 mx-auto" />
              <p className="text-xs mt-0.5">{Math.round((todayTotal / CALORIE_GOAL) * 100)}%</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <Beef className="w-3.5 h-3.5 mx-auto mb-0.5" />
            <p className="text-xs font-bold">{todayProtein}g</p>
            <p className="text-[9px] text-white/60">Protein</p>
          </div>
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <Wheat className="w-3.5 h-3.5 mx-auto mb-0.5" />
            <p className="text-xs font-bold">{todayCarbs}g</p>
            <p className="text-[9px] text-white/60">Carbs</p>
          </div>
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <Droplets className="w-3.5 h-3.5 mx-auto mb-0.5" />
            <p className="text-xs font-bold">{todayFat}g</p>
            <p className="text-[9px] text-white/60">Fat</p>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <button onClick={() => setShowDialog(true)} aria-label="Add custom food" className="w-full py-3 rounded-2xl bg-white/70 border border-white/40 shadow-[var(--shadow-card)] text-sm font-medium text-slate-600 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Custom Food
      </button>

      {/* Recipe Suggestions */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">Quick Add Recipes</p>
        <div className="space-y-2">
          {RECIPES.map((r, i) => (
            <button key={i} onClick={() => addRecipe(r)} aria-label={`Add ${r.name}`} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all text-left">
              <span className="text-xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{r.name}</p>
                <p className="text-[10px] text-slate-400">{r.calories} cal • P{r.protein}g C{r.carbs}g F{r.fat}g</p>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Meal Groups */}
      {mealGroups.some(g => g.items.length > 0) && (
        <div className="space-y-3">
          {mealGroups.filter(g => g.items.length > 0).map((group, gi) => (
            <div key={gi} className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-slate-600">{group.meal}</p>
                <p className="text-xs text-slate-400">{group.total} cal</p>
              </div>
              <div className="space-y-1.5">
                {group.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 text-slate-700 truncate">{item.name}</span>
                    <span className="text-xs text-slate-400">{item.calories} cal</span>
                    <button onClick={() => removeLog(logs.indexOf(item))} aria-label="Remove food entry" className="p-1 rounded-lg hover:bg-rose-50">
                      <Trash2 className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Food Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <p className="font-medium text-slate-700">Add Custom Food</p>
              <button onClick={() => setShowDialog(false)} aria-label="Close dialog"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Food name" className="w-full p-3 rounded-xl border border-slate-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={customCal} onChange={e => setCustomCal(e.target.value)} type="number" placeholder="Calories" className="p-3 rounded-xl border border-slate-200 text-sm" />
              <input value={customProtein} onChange={e => setCustomProtein(e.target.value)} type="number" placeholder="Protein (g)" className="p-3 rounded-xl border border-slate-200 text-sm" />
              <input value={customCarbs} onChange={e => setCustomCarbs(e.target.value)} type="number" placeholder="Carbs (g)" className="p-3 rounded-xl border border-slate-200 text-sm" />
              <input value={customFat} onChange={e => setCustomFat(e.target.value)} type="number" placeholder="Fat (g)" className="p-3 rounded-xl border border-slate-200 text-sm" />
            </div>
            <button onClick={addCustom} disabled={!customName.trim() || !customCal} aria-label="Add food" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm disabled:opacity-40">Add Food</button>
          </div>
        </div>
      )}
    </div>
  );
}
