import { useState, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface MemoryInsight {
  id: string;
  category: 'pattern' | 'achievement' | 'suggestion' | 'warning';
  title: string;
  message: string;
  confidence: number;
}

function generateInsights(state: any): MemoryInsight[] {
  const insights: MemoryInsight[] = [];
  const { workouts, calorieLogs, weightLogs, sleepLogs, waterLogs } = state;

  // Pattern: workout consistency
  if (workouts.length >= 5) {
    const days = [...new Set(workouts.map((w: any) => new Date(w.date).getDay()))] as number[];
    if (days.length >= 3) {
      insights.push({
        id: 'workout-pattern',
        category: 'pattern',
        title: 'Consistent Schedule',
        message: `You tend to work out on ${days.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d] || 'Unknown').join(', ')}. Keep it up!`,
        confidence: 85,
      });
    }
  }

  // Achievement: calorie tracking
  if (calorieLogs.length >= 14) {
    insights.push({
      id: 'calorie-achievement',
      category: 'achievement',
      title: 'Two Weeks Tracked',
      message: 'You\'ve logged calories for 14+ days — great discipline!',
      confidence: 95,
    });
  }

  // Suggestion: protein intake
  const recentCalories = calorieLogs.slice(-7);
  if (recentCalories.length > 0) {
    const avgCalories = recentCalories.reduce((s: number, c: any) => s + c.calories, 0) / recentCalories.length;
    if (avgCalories < 1500) {
      insights.push({
        id: 'low-calories',
        category: 'suggestion',
        title: 'Consider More Protein',
        message: `Your average intake is ${Math.round(avgCalories)} kcal/day. For muscle recovery, aim for 1.6-2.2g protein per kg of bodyweight.`,
        confidence: 70,
      });
    }
  }

  // Warning: sleep deprivation
  const recentSleep = sleepLogs.slice(-5);
  if (recentSleep.length > 0) {
    const avgSleep = recentSleep.reduce((s: number, l: any) => s + l.hours, 0) / recentSleep.length;
    if (avgSleep < 6) {
      insights.push({
        id: 'sleep-warning',
        category: 'warning',
        title: 'Sleep Deficit Detected',
        message: `Average ${avgSleep.toFixed(1)}h sleep. Chronic sleep deprivation impairs recovery and muscle growth.`,
        confidence: 90,
      });
    }
  }

  // Pattern: hydration
  if (waterLogs.length >= 7) {
    const avgWater = waterLogs.slice(-7).reduce((s: number, w: any) => s + w.amountMl, 0) / 7;
    insights.push({
      id: 'hydration-pattern',
      category: 'pattern',
      title: 'Hydration Average',
      message: `You drink about ${(avgWater / 1000).toFixed(1)}L/day on average. ${avgWater < 2000 ? 'Try to increase to 2-3L.' : 'Great hydration!'}`,
      confidence: 80,
    });
  }

  // Weight trend
  if (weightLogs.length >= 7) {
    const recent = weightLogs.slice(-7);
    const trend = recent[recent.length - 1].weightKg - recent[0].weightKg;
    if (Math.abs(trend) > 1) {
      insights.push({
        id: 'weight-trend',
        category: trend < 0 ? 'achievement' : 'suggestion',
        title: trend < 0 ? 'Weight Loss Trend' : 'Weight Gain Trend',
        message: `${trend < 0 ? 'Lost' : 'Gained'} ${Math.abs(trend).toFixed(1)}kg this week. ${trend < 0 ? 'Great progress!' : 'Make sure this aligns with your goals.'}`,
        confidence: 75,
      });
    }
  }

  return insights.sort((a, b) => b.confidence - a.confidence);
}

const categoryIcons: Record<string, React.ReactNode> = {
  pattern: <TrendingUp className="w-5 h-5 text-blue-500" />,
  achievement: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  suggestion: <Sparkles className="w-5 h-5 text-amber-500" />,
  warning: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const categoryColors: Record<string, string> = {
  pattern: 'border-blue-200 bg-blue-50',
  achievement: 'border-emerald-200 bg-emerald-50',
  suggestion: 'border-amber-200 bg-amber-50',
  warning: 'border-red-200 bg-red-50',
};

export default function MemoryInsights() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const store = useGlowFitStore();
  const [insights, setInsights] = useState<MemoryInsight[]>([]);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    setGenerating(true);
    const timer = setTimeout(() => {
      setInsights(generateInsights(store));
      setGenerating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <h1 className="text-xl font-serif text-rose-900">Memory Insights</h1>
        </div>
      </div>

      {generating ? (
        <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-8 text-white shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-lg font-semibold">Analyzing your data...</p>
          <p className="text-sm text-white/80 mt-1">Generating personalized insights</p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <p className="text-sm text-white/80">AI-Powered Insights</p>
                <p className="text-2xl font-bold">{insights.length} insights found</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className={`rounded-2xl border p-4 bg-white/70 backdrop-blur-sm shadow-[var(--shadow-card)] ${categoryColors[insight.category]}`}>
                <div className="flex items-start gap-3">
                  {categoryIcons[insight.category]}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{insight.title}</h3>
                      <span className="text-xs text-slate-400">{insight.confidence}%</span>
                    </div>
                    <p className="text-sm text-slate-600">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
