import { useState, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface Insight {
  id: string;
  category: 'hydration' | 'workout' | 'nutrition' | 'sleep' | 'general';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

function generateInsights(state: any): Insight[] {
  const insights: Insight[] = [];
  const { workouts, waterLogs, calorieLogs, sleepLogs, weightLogs } = state;

  const todayWater = waterLogs.filter((w: any) => {
    const d = new Date(w.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).reduce((sum: number, w: any) => sum + w.amountMl, 0);

  if (todayWater < 2000) {
    insights.push({
      id: 'water', category: 'hydration', title: 'Stay Hydrated',
      message: `You've had ${(todayWater / 1000).toFixed(1)}L today. Aim for 2-3L.`,
      priority: 'high', icon: '💧',
    });
  }

  const thisWeekWorkouts = workouts.filter((w: any) => {
    const d = new Date(w.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });

  if (thisWeekWorkouts.length < 3) {
    insights.push({
      id: 'workout', category: 'workout', title: 'Keep Moving',
      message: `${thisWeekWorkouts.length} workouts this week. Aim for 3-5 sessions.`,
      priority: 'medium', icon: '🏋️',
    });
  } else {
    insights.push({
      id: 'workout-great', category: 'workout', title: 'Great Streak!',
      message: `${thisWeekWorkouts.length} workouts this week — crushing it!`,
      priority: 'low', icon: '🔥',
    });
  }

  if (weightLogs.length >= 2) {
    const recent = weightLogs.slice(-7);
    const change = recent[recent.length - 1].weightKg - recent[0].weightKg;
    insights.push({
      id: 'weight', category: 'general', title: 'Weight Trend',
      message: change < 0 ? `Down ${Math.abs(change).toFixed(1)}kg this week!`
        : change > 0 ? `Up ${change.toFixed(1)}kg — stay consistent.`
        : 'Weight stable this week.',
      priority: change !== 0 ? 'medium' : 'low', icon: '⚖️',
    });
  }

  const recentSleep = sleepLogs.slice(-3);
  if (recentSleep.length > 0) {
    const avgHours = recentSleep.reduce((s: number, l: any) => s + l.hours, 0) / recentSleep.length;
    insights.push({
      id: 'sleep', category: 'sleep',
      title: avgHours >= 7 ? 'Good Sleep' : 'Sleep More',
      message: avgHours >= 7 ? `Avg ${avgHours.toFixed(1)}h — great recovery!`
        : `Avg ${avgHours.toFixed(1)}h. Aim for 7-9 hours.`,
      priority: avgHours >= 7 ? 'low' : 'high', icon: '😴',
    });
  }

  const todayCalories = calorieLogs.filter((c: any) =>
    new Date(c.date).toDateString() === new Date().toDateString()
  ).reduce((sum: number, c: any) => sum + c.calories, 0);

  if (todayCalories > 0) {
    insights.push({
      id: 'calories', category: 'nutrition', title: 'Calorie Check',
      message: `Today: ${todayCalories} kcal. ${todayCalories < 1200 ? 'Eat more for energy.' : todayCalories > 2500 ? 'High intake — check your goals.' : 'Looking good!'}`,
      priority: todayCalories < 1200 || todayCalories > 2500 ? 'medium' : 'low', icon: '🍽️',
    });
  }

  return insights.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

export default function AiInsights() {
  const store = useGlowFitStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const popScreen = useGlowFitStore((s) => s.popScreen);

  useEffect(() => {
    setInsights(generateInsights(store));
  }, [store.workouts, store.waterLogs, store.calorieLogs, store.sleepLogs, store.weightLogs]);

  const priorityColors: Record<string, string> = {
    high: 'bg-red-50 border-red-200 text-red-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-serif text-rose-900">AI Insights</h1>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <div>
            <p className="text-sm text-white/80">Wellness Score</p>
            <p className="text-2xl font-bold">{Math.min(100, Math.round(insights.filter(i => i.priority === 'low').length / Math.max(insights.length, 1) * 100 + 40))}/100</p>
          </div>
        </div>
        <p className="text-sm text-white/80">{insights.length} insights from your data</p>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800">{insight.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[insight.priority]}`}>{insight.priority}</span>
                </div>
                <p className="text-sm text-slate-600">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
        {insights.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Log some data to get personalized insights!</p>
          </div>
        )}
      </div>
    </div>
  );
}
