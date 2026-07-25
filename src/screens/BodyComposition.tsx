import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, TrendingUp, Plus, X } from 'lucide-react';

export default function BodyComposition() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const profile = useGlowFitStore((s) => s.profile);
  const measurements = useGlowFitStore((s) => s.measurements);
  const addMeasurement = useGlowFitStore((s) => s.addMeasurement);
  const [showLog, setShowLog] = useState(false);
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const bmi = profile.currentWeight && profile.height
    ? (profile.currentWeight / Math.pow(profile.height / 100, 2)).toFixed(1)
    : null;

  // Navy method body fat estimation
  const bodyFat = latest && profile.height
    ? profile.gender === 'male'
      ? (495 / (1.0324 - 0.19077 * Math.log10((latest.waist || 0) - 0.1) + 0.15456 * Math.log10(profile.height)) - 450).toFixed(1)
      : (495 / (1.29579 - 0.35004 * Math.log10((latest.waist || 0) + (latest.hips || 0) - 0.1) + 0.22100 * Math.log10(profile.height)) - 450).toFixed(1)
    : null;

  const leanMass = bodyFat && profile.currentWeight
    ? (profile.currentWeight * (1 - parseFloat(bodyFat) / 100)).toFixed(1)
    : null;

  const fatMass = bodyFat && profile.currentWeight
    ? (profile.currentWeight * parseFloat(bodyFat) / 100).toFixed(1)
    : null;

  const handleLog = () => {
    if (waist || hips || chest || arms || thighs) {
      addMeasurement({
        id: Date.now().toString(),
        waist: parseFloat(waist) || 0,
        hips: parseFloat(hips) || 0,
        chest: parseFloat(chest) || 0,
        arms: parseFloat(arms) || 0,
        thighs: parseFloat(thighs) || 0,
        date: new Date().toISOString(),
      });
      setWaist(''); setHips(''); setChest(''); setArms(''); setThighs('');
      setShowLog(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-serif text-rose-900">Body Composition</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'BMI', value: bmi || '—', unit: 'kg/m²', color: 'from-blue-500 to-cyan-500' },
          { label: 'Body Fat', value: bodyFat ? `${bodyFat}%` : '—', unit: 'est.', color: 'from-rose-500 to-pink-500' },
          { label: 'Lean Mass', value: leanMass ? `${leanMass}kg` : '—', unit: 'muscle', color: 'from-emerald-500 to-teal-500' },
          { label: 'Fat Mass', value: fatMass ? `${fatMass}kg` : '—', unit: 'fat', color: 'from-amber-500 to-orange-500' },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
            <p className="text-sm text-white/80">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-white/60">{stat.unit}</p>
          </div>
        ))}
      </div>

      {/* Current Measurements */}
      {latest && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
          <h3 className="font-medium text-slate-800 mb-3">Latest Measurements</h3>
          <div className="space-y-2">
            {[
              { label: 'Waist', value: latest.waist },
              { label: 'Hips', value: latest.hips },
              { label: 'Chest', value: latest.chest },
              { label: 'Arms', value: latest.arms },
              { label: 'Thighs', value: latest.thighs },
            ].filter(m => m.value > 0).map(m => (
              <div key={m.label} className="flex justify-between py-1">
                <span className="text-slate-500">{m.label}</span>
                <span className="font-medium text-slate-800">{m.value} cm</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Button */}
      <button onClick={() => setShowLog(!showLog)} className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
        {showLog ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {showLog ? 'Cancel' : 'Log Measurements'}
      </button>

      {/* Log Form */}
      {showLog && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)] space-y-3">
          <p className="text-sm font-medium text-slate-600">Enter measurements (cm)</p>
          {[
            { label: 'Waist', value: waist, set: setWaist },
            { label: 'Hips', value: hips, set: setHips },
            { label: 'Chest', value: chest, set: setChest },
            { label: 'Arms', value: arms, set: setArms },
            { label: 'Thighs', value: thighs, set: setThighs },
          ].map(f => (
            <input key={f.label} type="number" placeholder={f.label} value={f.value} onChange={e => f.set(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-slate-800" />
          ))}
          <button onClick={handleLog} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold active:scale-95 transition-all">Save Measurements</button>
        </div>
      )}

      {/* Measurement History */}
      {measurements.length > 1 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
          <h3 className="font-medium text-slate-800 mb-3">History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...measurements].reverse().slice(0, 10).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{new Date(m.date).toLocaleDateString()}</span>
                <span className="text-sm text-slate-700">W:{m.waist} H:{m.hips} C:{m.chest}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
