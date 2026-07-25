import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FoodItem, MealPlan, MealPlanMeal } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', color: 'border-l-amber-400', bg: 'bg-amber-50' },
  { key: 'lunch', label: 'Lunch', color: 'border-l-emerald-400', bg: 'bg-emerald-50' },
  { key: 'dinner', label: 'Dinner', color: 'border-l-violet-400', bg: 'bg-violet-50' },
  { key: 'snack', label: 'Snack', color: 'border-l-rose-400', bg: 'bg-rose-50' },
] as const;

const QUICK_FOODS: Omit<FoodItem, 'id'>[] = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: '100g' },
  { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, servingSize: '1 cup' },
  { name: 'Mixed Salad', calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2, fiber: 1.5, servingSize: '100g' },
  { name: 'Eggs (2)', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, servingSize: '2 large' },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, servingSize: '1 medium' },
  { name: 'Oatmeal', calories: 154, protein: 5.3, carbs: 27, fat: 2.6, fiber: 4, servingSize: '1 cup' },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, servingSize: '170g' },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, servingSize: '100g' },
];

function emptyWeek(): MealPlan[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      id: `week-${d.toISOString().split('T')[0]}`,
      date: d.toISOString().split('T')[0] ?? '',
      meals: MEAL_TYPES.map(mt => ({ name: mt.key, foods: [], totalCalories: 0 })),
    };
  });
}

function calcMealTotals(meal: MealPlanMeal) {
  const totalCalories = meal.foods.reduce((s, f) => s + f.calories, 0);
  const protein = meal.foods.reduce((s, f) => s + f.protein, 0);
  const carbs = meal.foods.reduce((s, f) => s + f.carbs, 0);
  const fat = meal.foods.reduce((s, f) => s + f.fat, 0);
  return { totalCalories, protein, carbs, fat };
}

function calcDayTotals(day: MealPlan) {
  return day.meals.reduce(
    (acc, meal) => {
      const t = calcMealTotals(meal);
      return { cal: acc.cal + t.totalCalories, protein: acc.protein + t.protein, carbs: acc.carbs + t.carbs, fat: acc.fat + t.fat };
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function MealPlanner() {
  const [week, setWeek] = useState<MealPlan[]>(emptyWeek);
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayIdx = new Date().getDay();
    return dayIdx === 0 ? 6 : dayIdx - 1;
  });
  const [addingMeal, setAddingMeal] = useState<number | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodCal, setFoodCal] = useState('');
  const [foodPro, setFoodPro] = useState('');
  const [foodCarb, setFoodCarb] = useState('');
  const [foodFat, setFoodFat] = useState('');

  const day = week[selectedDay];
  const dayTotals = day ? calcDayTotals(day) : { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const calorieTarget = 2000; // default, could come from profile TDEE

  const addFoodToMeal = (mealIdx: number, food: Omit<FoodItem, 'id'>) => {
    setWeek(prev => {
      const next = [...prev];
      const d = { ...next[selectedDay]! };
      const meals = [...d.meals];
      const meal = { ...meals[mealIdx]! };
      const newFood: FoodItem = { ...food, id: Date.now().toString() + Math.random().toString(36).slice(2) };
      meal.foods = [...meal.foods, newFood];
      meal.totalCalories = meal.foods.reduce((s, f) => s + f.calories, 0);
      meals[mealIdx] = meal;
      d.meals = meals;
      next[selectedDay] = d;
      return next;
    });
  };

  const removeFood = (mealIdx: number, foodId: string) => {
    setWeek(prev => {
      const next = [...prev];
      const d = { ...next[selectedDay]! };
      const meals = [...d.meals];
      const meal = { ...meals[mealIdx]! };
      meal.foods = meal.foods.filter(f => f.id !== foodId);
      meal.totalCalories = meal.foods.reduce((s, f) => s + f.calories, 0);
      meals[mealIdx] = meal;
      d.meals = meals;
      next[selectedDay] = d;
      return next;
    });
  };

  const handleAddCustom = (mealIdx: number) => {
    if (!foodName.trim()) return;
    addFoodToMeal(mealIdx, {
      name: foodName.trim(),
      calories: parseInt(foodCal) || 0,
      protein: parseInt(foodPro) || 0,
      carbs: parseInt(foodCarb) || 0,
      fat: parseInt(foodFat) || 0,
      fiber: 0,
      servingSize: '1 serving',
    });
    setFoodName(''); setFoodCal(''); setFoodPro(''); setFoodCarb(''); setFoodFat('');
    setAddingMeal(null);
  };

  const progressPct = Math.min(100, (dayTotals.cal / calorieTarget) * 100);

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Meal Planner</h1>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {DAYS.map((d, i) => {
          const dayData = week[i];
          const totals = dayData ? calcDayTotals(dayData) : { cal: 0 };
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              aria-label="Action"
              className={`flex-shrink-0 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                selectedDay === i
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/70 text-slate-500 border border-white/40'
              }`}
            >
              <div>{d}</div>
              <div className={`text-xs font-normal mt-0.5 ${selectedDay === i ? 'text-rose-100' : 'text-slate-400'}`}>
                {totals.cal} cal
              </div>
            </button>
          );
        })}
      </div>

      {/* Calorie Progress */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-500 font-medium">{dayTotals.cal} / {calorieTarget} cal</span>
          <span className="text-slate-400">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="text-emerald-600 font-bold">P: {dayTotals.protein.toFixed(0)}g</span>
          <span className="text-amber-600 font-bold">C: {dayTotals.carbs.toFixed(0)}g</span>
          <span className="text-violet-600 font-bold">F: {dayTotals.fat.toFixed(0)}g</span>
        </div>
      </div>

      {/* Meal Slots */}
      {MEAL_TYPES.map((mt, mealIdx) => {
        const meal = day?.meals[mealIdx];
        const totals = meal ? calcMealTotals(meal) : { totalCalories: 0, protein: 0, carbs: 0, fat: 0 };

        return (
          <div key={mt.key} className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[var(--shadow-card)] overflow-hidden border-l-4 ${mt.color}`}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{mt.label}</h3>
                <p className="text-xs text-slate-400">{totals.totalCalories} cal • P:{totals.protein.toFixed(0)}g C:{totals.carbs.toFixed(0)}g F:{totals.fat.toFixed(0)}g</p>
              </div>
              <button
                onClick={() => setAddingMeal(addingMeal === mealIdx ? null : mealIdx)}
                aria-label="Action"
                className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Food list */}
            {meal && meal.foods.length > 0 && (
              <div className="px-4 pb-2 space-y-1.5">
                {meal.foods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50">
                    <div>
                      <span className="font-medium text-slate-700">{food.name}</span>
                      <span className="text-slate-400 ml-2">{food.calories} cal</span>
                    </div>
                    <button onClick={() => removeFood(mealIdx, food.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick-add chips */}
            {addingMeal === mealIdx && (
              <div className="px-4 pb-2 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FOODS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => addFoodToMeal(mealIdx, f)}
                      aria-label="Action"
                      className="text-xs font-medium px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                    >
                      {f.name} ({f.calories}cal)
                    </button>
                  ))}
                </div>

                {/* Custom food form */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <input value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Food name" className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs" />
                  <div className="grid grid-cols-4 gap-2">
                    <input value={foodCal} onChange={e => setFoodCal(e.target.value)} placeholder="Cal" type="number" className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-center" />
                    <input value={foodPro} onChange={e => setFoodPro(e.target.value)} placeholder="P(g)" type="number" className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-center" />
                    <input value={foodCarb} onChange={e => setFoodCarb(e.target.value)} placeholder="C(g)" type="number" className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-center" />
                    <input value={foodFat} onChange={e => setFoodFat(e.target.value)} placeholder="F(g)" type="number" className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-center" />
                  </div>
                  <button onClick={() => handleAddCustom(mealIdx)} className="w-full py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors">Add</button>
                </div>
              </div>
            )}

            {meal && meal.foods.length === 0 && addingMeal !== mealIdx && (
              <div className="px-4 pb-4 text-center">
                <p className="text-xs text-slate-400">Tap + to add foods</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
