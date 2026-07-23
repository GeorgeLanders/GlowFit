import { TrendingUp } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';

export default function Progress() {
  const weightLogs = useGlowFitStore((s) => s.weightLogs);
  const measurements = useGlowFitStore((s) => s.measurements);
  const progressPhotos = useGlowFitStore((s) => s.progressPhotos);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Progress</h1>

      {/* Weight Chart Placeholder */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Weight Trend</h3>
        {weightLogs.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 text-rose-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Log your weight to see trends</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-slate-800">{weightLogs[0]?.weight} kg</p>
            <p className="text-xs text-slate-400">Latest weight</p>
          </div>
        )}
      </div>

      {/* Body Measurements */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Measurements</h3>
        {measurements.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No measurements yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-400">Chest:</span> <span className="font-bold">{measurements[0]?.chest} cm</span></div>
            <div><span className="text-slate-400">Waist:</span> <span className="font-bold">{measurements[0]?.waist} cm</span></div>
            <div><span className="text-slate-400">Hips:</span> <span className="font-bold">{measurements[0]?.hips} cm</span></div>
            <div><span className="text-slate-400">Arms:</span> <span className="font-bold">{measurements[0]?.arms} cm</span></div>
          </div>
        )}
      </div>

      {/* Progress Photos */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Photos</h3>
        {progressPhotos.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No progress photos yet</p>
        ) : (
          <p className="text-slate-500 text-sm">{progressPhotos.length} photos logged</p>
        )}
      </div>
    </div>
  );
}
