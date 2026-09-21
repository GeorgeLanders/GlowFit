// screens/LandingProgram.tsx - Phase 1 (Stabilize) of the Landing Program:
// structured support for the first 4 weeks after stopping GLP-1 medication.
// Behavioral support only; not medical advice.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlaneLanding, CheckCircle2, Scale, Beef, Dumbbell, Info } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';
import { haptics } from '../lib/haptics';
import {
  loadLanding, saveLanding, startLanding, currentLandingWeek,
  weightBand, bandStatus, STABILIZE_WEEKS, type LandingState,
} from '../lib/landing-program';

function todayStr() { return new Date().toISOString().split('T')[0] ?? ''; }

export default function LandingProgram() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const profile = useGlowFitStore((s) => s.profile);
  const weightLogs = useGlowFitStore((s) => s.weightLogs);

  const [state, setState] = useState<LandingState | null>(loadLanding());
  const [med, setMed] = useState('Semaglutide');
  const [lastDose, setLastDose] = useState(todayStr());

  const latestWeight = weightLogs[0]?.weight ?? null;

  const begin = () => {
    haptics.medium();
    const s = startLanding(med, lastDose, latestWeight ?? profile.currentWeight ?? 70);
    setState(s);
  };

  const endProgram = () => {
    haptics.light();
    saveLanding(null);
    setState(null);
  };

  // ------- Activation view -------
  if (!state?.active) {
    return (
      <div className="space-y-4">
        <Header popScreen={popScreen} />
        <div className="bg-gradient-to-br from-violet-50 to-rose-50 dark:from-violet-950/40 dark:to-rose-950/40 rounded-2xl p-5 border border-violet-100 dark:border-violet-900/40 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-2">
            <PlaneLanding className="w-5 h-5 text-violet-500" />
            <h2 className="font-serif text-lg text-slate-800 dark:text-slate-100">The Landing Program</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Coming off a GLP-1 is a real transition - appetite returns over a few weeks.
            This 4-week program keeps your protein, strength, and routine steady while your
            body recalibrates, so the progress you made stays yours.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Stopping or changing medication is a decision for you and your prescriber.
            This program supports your habits; it does not give medical advice.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 dark:border-slate-700/40 shadow-[var(--shadow-card)] space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Which medication did you stop?
            <select value={med} onChange={(e) => setMed(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
              {['Semaglutide', 'Tirzepatide', 'Liraglutide', 'Dulaglutide', 'Other'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Date of your last dose
            <input type="date" value={lastDose} max={todayStr()} onChange={(e) => setLastDose(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100" />
          </label>
          <button onClick={begin}
            className="w-full rounded-xl bg-violet-600 text-white font-semibold py-3 text-sm hover:bg-violet-700 transition-colors">
            Start my Landing Program
          </button>
        </div>
      </div>
    );
  }

  // ------- Active program view -------
  const week = currentLandingWeek(state);
  const plan = STABILIZE_WEEKS[week - 1] ?? STABILIZE_WEEKS[0]!;
  const band = weightBand(state);
  const status = bandStatus(state, latestWeight);

  return (
    <div className="space-y-4">
      <Header popScreen={popScreen} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-500 to-rose-400 rounded-2xl p-5 text-white shadow-[var(--shadow-card)]">
        <p className="text-xs uppercase tracking-widest text-white/80">Landing Program - off {state.medicationName}</p>
        <h2 className="text-xl font-bold mt-1">{plan.title}</h2>
        <p className="text-sm text-white/90 mt-1.5 leading-relaxed">{plan.focus}</p>
        <div className="flex gap-1 mt-3">
          {[1, 2, 3, 4].map((w) => (
            <div key={w} className={`h-1.5 flex-1 rounded-full ${w <= week ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </motion.div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 dark:border-slate-700/40 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Your stability band</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          A hold range of {band.low.toFixed(1)}kg to {band.high.toFixed(1)}kg around your start weight (within about 2 kg is normal fluctuation).
        </p>
        {latestWeight != null ? (
          <p className={`text-sm font-semibold ${
            status === 'inside' ? 'text-emerald-600' : status === 'above' ? 'text-amber-600' : 'text-slate-500'
          }`}>
            {status === 'inside' && `${latestWeight.toFixed(1)} kg - inside your band. Steady does it.`}
            {status === 'above' && `${latestWeight.toFixed(1)} kg - above band. Pull protein up and keep meals on schedule this week.`}
            {status === 'below' && `${latestWeight.toFixed(1)} kg - below band. Make sure you eat enough.`}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Log a weight to check your band.</p>
        )}
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 dark:border-slate-700/40 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">This week: three anchors</h3>
        <div className="space-y-2">
          {plan.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 p-3 text-center">
          <Beef className="w-5 h-5 text-rose-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Protein first</p>
          <p className="text-[11px] text-slate-500">Muscle Guard targets stay on</p>
        </div>
        <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 p-3 text-center">
          <Dumbbell className="w-5 h-5 text-violet-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">3 strength days</p>
          <p className="text-[11px] text-slate-500">Volume holds the muscle</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          If your weight climbs for more than two weeks, or hunger feels unmanageable, talk to your prescriber -
          options exist, and restarting is a medical decision, not a failure.
        </p>
      </div>

      <button onClick={endProgram} className="w-full text-xs text-slate-400 underline underline-offset-2 py-1">
        End program
      </button>
    </div>
  );
}

function Header({ popScreen }: { popScreen: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 shadow-[var(--shadow-card)]">
        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>
      <div>
        <h1 className="text-xl font-serif text-rose-900 dark:text-rose-200">Landing Program</h1>
        <p className="text-xs text-slate-400">Your first 4 weeks after GLP-1</p>
      </div>
    </div>
  );
}
