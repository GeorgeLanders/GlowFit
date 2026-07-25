import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import type { ProgressPhoto } from '../types';
import { ArrowLeft, Camera } from 'lucide-react';

export default function BodyNeutralProgress() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const progressPhotos = useGlowFitStore((s) => s.progressPhotos);
  const [showMeasurements, setShowMeasurements] = useState(false);

  // Group photos into pairs
  const photoPairs: ProgressPhoto[][] = progressPhotos.reduce<ProgressPhoto[][]>((acc, _, i, arr) => {
    if (i % 2 === 0 && arr[i + 1]) {
      acc.push([arr[i], arr[i + 1]]);
    }
    return acc;
  }, []);

  const getImg = (p: ProgressPhoto) => p.front || p.side || p.back;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-violet-500" />
          <h1 className="text-xl font-serif text-rose-900">Progress Photos</h1>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-[var(--shadow-card)] text-center">
        <p className="text-4xl mb-2">🦋</p>
        <h2 className="font-serif text-lg text-rose-900 font-bold">Progress is not just numbers</h2>
        <p className="text-sm text-slate-500 mt-1">Focus on how you feel, not just measurements</p>
      </div>

      {/* Toggle */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700">Show Details</p>
            <p className="text-xs text-slate-400">Hidden by default for body neutrality</p>
          </div>
          <button onClick={() => setShowMeasurements(!showMeasurements)} aria-label={showMeasurements ? 'Hide details' : 'Show details'} className={`w-12 h-7 rounded-full transition-all relative ${showMeasurements ? 'bg-violet-500' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow ${showMeasurements ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Pairs */}
      {photoPairs.length > 0 && (
        <>
          <h3 className="font-medium text-slate-700 px-1">Comparisons</h3>
          {photoPairs.map((pair, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
              <p className="text-sm font-medium text-slate-600 mb-3">Before & After</p>
              <div className="grid grid-cols-2 gap-3">
                {pair.map((photo, j) => (
                  <div key={j}>
                    <p className="text-xs text-slate-400 mb-1">{j === 0 ? 'Before' : 'After'}</p>
                    <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden">
                      {getImg(photo) ? (
                        <img src={getImg(photo)} alt={j === 0 ? 'Before' : 'After'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera className="w-8 h-8" /></div>
                      )}
                    </div>
                    {showMeasurements && photo.notes && (
                      <p className="text-xs text-slate-400 italic mt-1">"{photo.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* All Photos */}
      {progressPhotos.length > 0 ? (
        <>
          <h3 className="font-medium text-slate-700 px-1">All Photos</h3>
          <div className="grid grid-cols-2 gap-3">
            {progressPhotos.map((photo, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white/40 shadow-[var(--shadow-card)]">
                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden">
                  {getImg(photo) ? (
                    <img src={getImg(photo)} alt={`Progress ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera className="w-8 h-8" /></div>
                  )}
                </div>
                {photo.date && <p className="text-xs text-slate-400 mt-1.5 text-center">{new Date(photo.date).toLocaleDateString()}</p>}
                {showMeasurements && photo.notes && (
                  <p className="text-xs text-slate-400 mt-1 text-center truncate">{photo.notes}</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-[var(--shadow-card)] text-center">
          <p className="text-4xl mb-3">📸</p>
          <h3 className="font-medium text-slate-700">No progress photos yet</h3>
          <p className="text-sm text-slate-400 mt-1">Add photos from the Progress tab to track your visual journey</p>
        </div>
      )}
    </div>
  );
}
