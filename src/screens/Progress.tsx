import { TrendingUp, Ruler, Camera, ChevronRight } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';

export default function Progress() {
  const weightLogs = useGlowFitStore((s) => s.weightLogs);
  const measurements = useGlowFitStore((s) => s.measurements);
  const progressPhotos = useGlowFitStore((s) => s.progressPhotos);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Progress</h1>

      {/* Weight Chart */}
      <button
        onClick={() => pushScreen('weight-tracker')}
        aria-label="Action"
        className="w-full card-3d rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Weight Trend</h3>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        {weightLogs.length === 0 ? (
          <div className="text-center py-4">
            <TrendingUp className="w-10 h-10 text-rose-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Log your weight to see trends</p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-slate-800">{weightLogs[0]?.weight} kg</p>
            <p className="text-xs text-slate-400">Latest weight</p>
          </div>
        )}
      </button>

      {/* Body Measurements */}
      <button
        onClick={() => pushScreen('body-measurements')}
        aria-label="Action"
        className="w-full card-3d rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Measurements</h3>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        {measurements.length === 0 ? (
          <div className="text-center py-2">
            <Ruler className="w-10 h-10 text-rose-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Track body measurements</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-400">Chest:</span> <span className="font-bold">{measurements[0]?.chest} cm</span></div>
            <div><span className="text-slate-400">Waist:</span> <span className="font-bold">{measurements[0]?.waist} cm</span></div>
            <div><span className="text-slate-400">Hips:</span> <span className="font-bold">{measurements[0]?.hips} cm</span></div>
            <div><span className="text-slate-400">Arms:</span> <span className="font-bold">{measurements[0]?.arms} cm</span></div>
          </div>
        )}
      </button>

      {/* Progress Photos */}
      <button
        onClick={() => pushScreen('progress-photos')}
        aria-label="Action"
        className="w-full card-3d rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98] text-left"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Photos</h3>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        {progressPhotos.length === 0 ? (
          <div className="text-center py-2">
            <Camera className="w-10 h-10 text-rose-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Log progress photos</p>
          </div>
        ) : (
          <p className="text-slate-500 text-sm py-2">{progressPhotos.length} photos logged</p>
        )}
      </button>
    </div>
  );
}
