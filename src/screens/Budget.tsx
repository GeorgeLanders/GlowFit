import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { DollarSign, AlertTriangle, X, ArrowLeft, BarChart3 } from 'lucide-react';

interface BudgetItem {
  name: string;
  used: number;
  limit: number;
  unit: string;
}

export default function Budget() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [warningDismissed, setWarningDismissed] = useState(false);

  const budgets: BudgetItem[] = [
    { name: 'AI Coach Messages', used: 42, limit: 100, unit: 'messages' },
    { name: 'Workout Generation', used: 8, limit: 30, unit: 'plans' },
    { name: 'Meal Suggestions', used: 15, limit: 50, unit: 'suggestions' },
    { name: 'Storage', used: 12, limit: 50, unit: 'MB' },
  ];

  const usagePercent = Math.round(budgets.reduce((s, b) => s + b.used, 0) / budgets.reduce((s, b) => s + b.limit, 0) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-serif text-rose-900">Budget</h1>
        </div>
      </div>

      {!warningDismissed && usagePercent > 80 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">You've used {usagePercent}% of your monthly budget.</p>
          <button onClick={() => setWarningDismissed(true)}><X className="w-4 h-4 text-amber-500" /></button>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Monthly Overview</h2>
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div className={`h-3 rounded-full transition-all ${usagePercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${usagePercent}%` }} />
        </div>
        <p className="text-sm text-slate-500">{usagePercent}% used this month</p>
      </div>

      <div className="space-y-3">
        {budgets.map((item) => {
          const pct = Math.round((item.used / item.limit) * 100);
          return (
            <div key={item.name} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-800">{item.name}</h3>
                <span className="text-sm text-slate-500">{item.used}/{item.limit} {item.unit}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${pct > 80 ? 'bg-amber-500' : pct > 50 ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
