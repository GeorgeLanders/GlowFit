import { Apple, Plus, Search } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';

function today() {
  return new Date().toISOString().split('T')[0] ?? '';
}

export default function Nutrition() {
  const calorieLogs = useGlowFitStore((s) => s.calorieLogs);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);
  const todayStr = today();
  const todayLogs = calorieLogs.filter((l) => l.date === todayStr);
  const totalCal = todayLogs.reduce((sum, l) => sum + l.food.calories * l.quantity, 0);

  const totalProtein = todayLogs.reduce((sum, l) => sum + (l.food.protein ?? 0) * l.quantity, 0);
  const totalCarbs = todayLogs.reduce((sum, l) => sum + (l.food.carbs ?? 0) * l.quantity, 0);
  const totalFat = todayLogs.reduce((sum, l) => sum + (l.food.fat ?? 0) * l.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Nutrition</h1>
        <button
          onClick={() => pushScreen('food-search')}
          className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Food
        </button>
      </div>

      {/* Calorie Summary */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-[var(--shadow-card)] text-center">
        <Apple className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-3xl font-bold text-slate-800">{totalCal}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">calories today</p>
        {/* Macros */}
        <div className="flex justify-center gap-6 mt-4">
          {[
            { label: 'Protein', value: `${Math.round(totalProtein)}g`, color: 'text-violet-500' },
            { label: 'Carbs', value: `${Math.round(totalCarbs)}g`, color: 'text-amber-500' },
            { label: 'Fat', value: `${Math.round(totalFat)}g`, color: 'text-emerald-500' },
          ].map((m) => (
            <div key={m.label}>
              <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-slate-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Search */}
      <button
        onClick={() => pushScreen('food-search')}
        className="w-full flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
      >
        <Search className="w-5 h-5 text-emerald-500" />
        <span className="text-sm font-bold text-slate-700">Search Foods</span>
      </button>

      {/* Today's Meals */}
      {todayLogs.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] text-center">
          <p className="text-slate-500 font-medium">No meals logged today</p>
          <p className="text-xs text-slate-400 mt-1">Tap "Add Food" to log your first meal</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayLogs.map((log) => (
            <div key={log.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/40 p-3 shadow-[var(--shadow-card)] flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 text-sm">{log.food.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{log.meal}</p>
              </div>
              <span className="text-emerald-500 font-bold text-sm">{Math.round(log.food.calories * log.quantity)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
