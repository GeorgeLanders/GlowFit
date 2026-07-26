import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Download, FileJson, FileText, ArrowLeft, Check, Activity, Utensils, Moon, Scale, Droplets, Heart, Share2 } from 'lucide-react';
import { shareText } from '../lib/share';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';

export default function ExportData() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const store = useGlowFitStore();
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const dataCategories = [
    { name: 'Workouts', icon: Activity, count: store.workouts.length, color: 'text-rose-500' },
    { name: 'Nutrition', icon: Utensils, count: store.calorieLogs.length, color: 'text-amber-500' },
    { name: 'Sleep', icon: Moon, count: store.sleepLogs.length, color: 'text-indigo-500' },
    { name: 'Weight', icon: Scale, count: store.weightLogs.length, color: 'text-blue-500' },
    { name: 'Water', icon: Droplets, count: store.waterLogs.length, color: 'text-cyan-500' },
    { name: 'Wellness', icon: Heart, count: store.wellnessLogs.length, color: 'text-pink-500' },
  ];

  const handleExport = () => {
    setExporting(true);
    const data = {
      exportDate: new Date().toISOString(),
      profile: store.profile,
      workouts: store.workouts,
      calorieLogs: store.calorieLogs,
      sleepLogs: store.sleepLogs,
      weightLogs: store.weightLogs,
      waterLogs: store.waterLogs,
      wellnessLogs: store.wellnessLogs,
    };
    const content = format === 'json' ? JSON.stringify(data, null, 2) : convertToCSV(data);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glowfit-export-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => { setExporting(false); setExported(true); }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-serif text-rose-900">Export Data</h1>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">Export Format</p>
        <div className="flex gap-3">
          <button onClick={() => setFormat('json')} aria-label="Select JSON format" className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center gap-2 justify-center ${format === 'json' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500'}`}>
            <FileJson className="w-5 h-5" /><span className="font-medium">JSON</span>
          </button>
          <button onClick={() => setFormat('csv')} aria-label="Select CSV format" className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center gap-2 justify-center ${format === 'csv' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500'}`}>
            <FileText className="w-5 h-5" /><span className="font-medium">CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-slate-600 mb-3">Data Included</p>
        <div className="space-y-2">
          {dataCategories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <cat.icon className={`w-5 h-5 ${cat.color}`} />
                <span className="text-slate-700">{cat.name}</span>
              </div>
              <span className="text-sm text-slate-400">{cat.count} entries</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleExport} aria-label="Export all data" disabled={exporting} className={`w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg ${exported ? 'bg-emerald-500' : exporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-rose-500 to-pink-500 active:scale-95'}`}>
        {exported ? <span className="flex items-center justify-center gap-2"><Check className="w-5 h-5" /> Downloaded!</span> : exporting ? 'Exporting...' : <span className="flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Export All Data</span>}
      </button>
      <button
        onClick={async () => {
          haptics.medium();
          track('export_share');
          const data = {
            profile: store.profile,
            workoutCount: store.workouts.length,
            nutritionCount: store.calorieLogs.length,
          };
          await shareText(
            `My GlowFit Summary:\nWorkouts: ${data.workoutCount}\nMeals logged: ${data.nutritionCount}\nGoal: ${data.profile.goalWeight}kg`,
            'GlowFit Progress'
          );
          haptics.success();
        }}
        aria-label="Share progress summary"
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
      >
        <Share2 className="w-5 h-5" />
        Share Progress Summary
      </button>
      <p className="text-xs text-slate-400 text-center">All data is stored locally on your device.</p>
    </div>
  );
}

function convertToCSV(data: any): string {
  const lines: string[] = ['Type,Date,Value,Details'];
  data.workouts.forEach((w: any) => lines.push(`Workout,${w.date},${w.durationMinutes}min,${w.exercises?.length || 0} exercises`));
  data.calorieLogs.forEach((c: any) => lines.push(`Calories,${c.date},${c.calories}kcal,"${c.foodName || ''}"`));
  data.weightLogs.forEach((w: any) => lines.push(`Weight,${w.date},${w.weightKg}kg,`));
  data.waterLogs.forEach((w: any) => lines.push(`Water,${w.date},${w.amountMl}ml,`));
  data.sleepLogs.forEach((s: any) => lines.push(`Sleep,${s.date},${s.hours}h,quality:${s.quality || 'N/A'}`));
  return lines.join('\n');
}
