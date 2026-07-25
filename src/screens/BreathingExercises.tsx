import { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

type BreathPattern = {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  description: string;
};

const PATTERNS: BreathPattern[] = [
  { name: '4-7-8 Relaxing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: 'Calming technique for sleep and anxiety' },
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Navy SEAL technique for focus' },
  { name: 'Energizing', inhale: 6, hold1: 0, exhale: 2, hold2: 0, description: 'Quick inhale, short exhale for energy' },
  { name: 'Deep Calm', inhale: 5, hold1: 5, exhale: 5, hold2: 5, description: 'Equal timing for deep relaxation' },
];

export default function BreathingExercises() {
  const [selected, setSelected] = useState<BreathPattern | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [seconds, setSeconds] = useState(0);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !selected) return;

    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        const maxForPhase =
          phase === 'inhale' ? selected.inhale :
          phase === 'hold1' ? selected.hold1 :
          phase === 'exhale' ? selected.exhale :
          selected.hold2;

        if (prev >= maxForPhase) {
          // Move to next phase
          if (phase === 'inhale' && selected.hold1 > 0) setPhase('hold1');
          else if (phase === 'inhale' || phase === 'hold1') setPhase('exhale');
          else if (phase === 'exhale' && selected.hold2 > 0) setPhase('hold2');
          else { setPhase('inhale'); setTotalBreaths((b) => b + 1); }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, selected, phase]);

  const toggle = () => {
    if (isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setPhase('inhale');
      setSeconds(0);
      setIsActive(true);
    }
  };

  const reset = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('inhale');
    setSeconds(0);
    setTotalBreaths(0);
  };

  const getPhaseLabel = () => {
    if (!selected) return '';
    if (phase === 'inhale') return 'Breathe In';
    if (phase === 'hold1') return 'Hold';
    if (phase === 'exhale') return 'Breathe Out';
    return 'Hold';
  };

  const getPhaseMax = () => {
    if (!selected) return 0;
    if (phase === 'inhale') return selected.inhale;
    if (phase === 'hold1') return selected.hold1;
    if (phase === 'exhale') return selected.exhale;
    return selected.hold2;
  };

  const scale = isActive ? (phase === 'inhale' ? 1 + (seconds / getPhaseMax()) * 0.5 : phase === 'exhale' ? 1.5 - (seconds / getPhaseMax()) * 0.5 : phase === 'hold1' ? 1.5 : 1) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Breathe</h1>

      {/* Breathing Circle */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] flex flex-col items-center">
        {selected && isActive ? (
          <>
            <div
              className="w-40 h-40 rounded-full bg-gradient-to-br from-rose-300 to-violet-300 flex items-center justify-center transition-transform duration-1000 ease-in-out shadow-lg"
              style={{ transform: `scale(${scale})` }}
            >
              <div className="text-center">
                <p className="text-white font-bold text-lg">{getPhaseLabel()}</p>
                <p className="text-white/80 text-2xl font-light">{getPhaseMax() - seconds}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">Breaths: {totalBreaths}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={toggle} aria-label={isActive ? 'Pause breathing exercise' : 'Start breathing exercise'} className="p-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={reset} aria-label="Reset breathing exercise" className="p-3 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Wind className="w-12 h-12 text-rose-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Select a breathing pattern</p>
          </div>
        )}
      </div>

      {/* Pattern Selection */}
      <div className="space-y-3">
        {PATTERNS.map((p) => (
          <button
            key={p.name}
            onClick={() => { setSelected(p); reset(); }}
            aria-label={`Select ${p.name} breathing pattern`}
            className={`w-full text-left bg-white/70 backdrop-blur-sm rounded-2xl border p-4 shadow-[var(--shadow-card)] transition-all ${
              selected?.name === p.name ? 'border-rose-300 ring-2 ring-rose-200' : 'border-white/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {p.inhale}-{p.hold1}-{p.exhale}{p.hold2 > 0 ? `-${p.hold2}` : ''}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
