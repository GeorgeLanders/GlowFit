import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Search, Apple, Flame } from 'lucide-react';
import type { FoodItem } from '../types';

type FoodResult = FoodItem;

const COMMON_FOODS: FoodResult[] = [
  { id: '1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: '100g' },
  { id: '2', name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, servingSize: '1 cup' },
  { id: '3', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, servingSize: '1 medium' },
  { id: '4', name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, servingSize: '1 large' },
  { id: '5', name: 'Oatmeal', calories: 154, protein: 5, carbs: 27, fat: 2.6, fiber: 4, servingSize: '1 cup' },
  { id: '6', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, servingSize: '170g' },
  { id: '7', name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, servingSize: '100g' },
  { id: '8', name: 'Sweet Potato', calories: 103, protein: 2.3, carbs: 24, fat: 0.1, fiber: 3.8, servingSize: '1 medium' },
  { id: '9', name: 'Avocado', calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 10, servingSize: '1 whole' },
  { id: '10', name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, servingSize: '28g' },
  { id: '11', name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, servingSize: '1 scoop' },
  { id: '12', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, servingSize: '1 medium' },
  { id: '13', name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5.1, servingSize: '1 cup' },
  { id: '14', name: 'Tuna', calories: 128, protein: 29, carbs: 0, fat: 1.3, fiber: 0, servingSize: '100g' },
  { id: '15', name: 'Pasta', calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, servingSize: '1 cup' },
];

export default function FoodSearch() {
  const { addCalorieLog, recentFoods, addRecentFood } = useGlowFitStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');

  const results = query.length > 0
    ? COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : recentFoods.slice(0, 5);

  const logFood = (food: FoodResult) => {
    const qty = parseFloat(quantity) || 1;
    addCalorieLog({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0] ?? '',
      food,
      quantity: qty,
      meal: mealType,
      timestamp: Date.now(),
    });
    addRecentFood(food);
    setSelected(null);
    setQuery('');
    setQuantity('1');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Food Search</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      {/* Meal Type */}
      <div className="flex gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMealType(m)}
            aria-label="Action"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              mealType === m ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Selected Food */}
      {selected && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{selected.name}</h3>
              <p className="text-xs text-slate-400">{selected.servingSize}</p>
            </div>
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Cal', value: Math.round(selected.calories * (parseFloat(quantity) || 1)), color: 'text-rose-600' },
              { label: 'Protein', value: `${Math.round(selected.protein * (parseFloat(quantity) || 1))}g`, color: 'text-violet-600' },
              { label: 'Carbs', value: `${Math.round(selected.carbs * (parseFloat(quantity) || 1))}g`, color: 'text-amber-600' },
              { label: 'Fat', value: `${Math.round(selected.fat * (parseFloat(quantity) || 1))}g`, color: 'text-emerald-600' },
            ].map((n) => (
              <div key={n.label}>
                <p className={`text-lg font-bold ${n.color}`}>{n.value}</p>
                <p className="text-xs text-slate-400">{n.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-center"
              min="0.5"
              step="0.5"
            />
            <span className="text-xs text-slate-400">servings</span>
          </div>
          <button
            onClick={() => logFood(selected)}
            aria-label="Action"
            className="w-full bg-rose-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all"
          >
            Log {mealType}
          </button>
        </div>
      )}

      {/* Results */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          {query ? 'Results' : 'Recent'}
        </h2>
        {results.length === 0 ? (
          <div className="card-3d rounded-2xl p-6 shadow-[var(--shadow-card)] text-center">
            <Apple className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No foods found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelected(food)}
                aria-label="Action"
                className="w-full card-3d rounded-2xl p-3 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{food.name}</p>
                    <p className="text-xs text-slate-400">{food.servingSize}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-500">{food.calories} cal</p>
                    <p className="text-xs text-slate-400">P{food.protein}g C{food.carbs}g F{food.fat}g</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
