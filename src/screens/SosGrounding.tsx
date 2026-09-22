import { useState, useEffect, useRef } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Heart, Phone, Shield, Wind, Eye, Hand, Ear } from 'lucide-react';

const CATEGORIES = ['General', 'Body Image', 'Overwhelm', 'Food', 'Sleep'];

const GROUNDING_STEPS: Record<string, { title: string; instruction: string; icon: React.ReactNode }[]> = {
  'General': [
    { title: '5 Things You See', instruction: 'Look around and name 5 things you can see. Notice their colors, shapes, and textures.', icon: <Eye className="w-5 h-5" /> },
    { title: '4 Things You Touch', instruction: 'Touch 4 different surfaces. Feel the texture, temperature, and pressure.', icon: <Hand className="w-5 h-5" /> },
    { title: '3 Things You Hear', instruction: 'Listen carefully. Name 3 sounds you can hear right now.', icon: <Ear className="w-5 h-5" /> },
    { title: '2 Things You Smell', instruction: 'Notice 2 scents around you. If you can\'t smell anything, think of 2 favorite smells.', icon: <Wind className="w-5 h-5" /> },
    { title: '1 Thing You Taste', instruction: 'Notice one thing you can taste. Take a sip of water if needed.', icon: <Heart className="w-5 h-5" /> },
  ],
  'Body Image': [
    { title: 'Body Gratitude', instruction: 'Name 3 things your body did for you today. Walking, breathing, hugging...', icon: <Heart className="w-5 h-5" /> },
    { title: 'Sensation Focus', instruction: 'Close your eyes. Notice the sensation of your feet on the floor. Feel grounded.', icon: <Hand className="w-5 h-5" /> },
    { title: 'Compassionate Breath', instruction: 'Breathe in kindness for yourself. Breathe out any harsh judgment.', icon: <Wind className="w-5 h-5" /> },
    { title: 'Mirror Affirmation', instruction: 'Look at yourself and say: "I am more than my appearance. I am worthy."', icon: <Eye className="w-5 h-5" /> },
    { title: 'Comfort Object', instruction: 'Hold something soft or comforting. Focus on the warmth and texture.', icon: <Hand className="w-5 h-5" /> },
  ],
  'Overwhelm': [
    { title: 'Box Breathing', instruction: 'Breathe in 4 counts. Hold 4 counts. Breathe out 4 counts. Hold 4 counts. Repeat.', icon: <Wind className="w-5 h-5" /> },
    { title: 'Name It to Tame It', instruction: 'Say out loud: "I am feeling overwhelmed right now. This is temporary."', icon: <Heart className="w-5 h-5" /> },
    { title: 'One Thing Only', instruction: 'Pick ONE small thing to do right now. Just one. Everything else can wait.', icon: <Eye className="w-5 h-5" /> },
    { title: 'Cold Water Reset', instruction: 'Splash cold water on your face or hold ice. The sensation resets your nervous system.', icon: <Hand className="w-5 h-5" /> },
    { title: 'Safe Place Visualization', instruction: 'Close your eyes. Picture your safe, calm place. Stay there for 60 seconds.', icon: <Eye className="w-5 h-5" /> },
  ],
  'Food': [
    { title: 'Mindful Bite', instruction: 'If eating, take one bite slowly. Notice the taste, texture, and temperature.', icon: <Heart className="w-5 h-5" /> },
    { title: 'Hunger Check', instruction: 'On a scale of 1-10, how hungry are you? Eat if you\'re above 3.', icon: <Eye className="w-5 h-5" /> },
    { title: 'Permission Thought', instruction: 'Say: "I am allowed to eat. Food is fuel and joy. I deserve nourishment."', icon: <Wind className="w-5 h-5" /> },
    { title: 'Sensory Grounding', instruction: 'Before eating, take 3 deep breaths. Touch the food, notice its warmth.', icon: <Hand className="w-5 h-5" /> },
    { title: 'Self-Compassion', instruction: 'Place your hand on your heart. Say: "I\'m doing my best, and that is enough."', icon: <Heart className="w-5 h-5" /> },
  ],
  'Sleep': [
    { title: '4-7-8 Breathing', instruction: 'Inhale 4s → Hold 7s → Exhale 8s. This activates your parasympathetic system.', icon: <Wind className="w-5 h-5" /> },
    { title: 'Body Scan', instruction: 'Starting from your toes, tense and release each muscle group as you move up.', icon: <Hand className="w-5 h-5" /> },
    { title: 'Gratitude Count', instruction: 'Think of 5 things you\'re grateful for today. Let the warmth settle in.', icon: <Heart className="w-5 h-5" /> },
    { title: 'Worry Dump', instruction: 'Write down anything on your mind. Close the notebook. It will be there tomorrow.', icon: <Eye className="w-5 h-5" /> },
    { title: 'Dark & Cool', instruction: 'Make your room dark and cool. Put your phone away. Close your eyes.', icon: <Eye className="w-5 h-5" /> },
  ],
};

export default function SosGrounding() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [category, setCategory] = useState('General');
  const [currentStep, setCurrentStep] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathTimer, setBreathTimer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = GROUNDING_STEPS[category] || GROUNDING_STEPS['General'];

  // 4-7-8 Breathing animation
  useEffect(() => {
    if (!breathActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let elapsed = 0;
    const totalCycle = 19; // 4+7+8

    intervalRef.current = setInterval(() => {
      elapsed = (elapsed + 1) % totalCycle;
      setBreathTimer(elapsed);

      if (elapsed < 4) {
        setBreathPhase('inhale');
      } else if (elapsed < 11) {
        setBreathPhase('hold');
      } else {
        setBreathPhase('exhale');
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [breathActive]);

  const breathScale = breathActive ? (() => {
    if (breathPhase === 'inhale') return 0.6 + (breathTimer / 4) * 0.4;
    if (breathPhase === 'hold') return 1.0;
    return 1.0 - ((breathTimer - 11) / 8) * 0.4;
  })() : 0.6;

  const breathLabel = breathActive
    ? breathPhase === 'inhale' ? `Inhale (${4 - breathTimer}s)`
    : breathPhase === 'hold' ? `Hold (${11 - breathTimer}s)`
    : `Exhale (${19 - breathTimer}s)`
    : 'Tap to start';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-serif text-rose-900">🆘 Grounding Exercise</h1>
        </div>
      </div>

      {/* Breathing Circle */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg flex flex-col items-center">
        <p className="text-sm text-white/70 mb-4">4-7-8 Breathing Technique</p>
        <button
                  onClick={() => setBreathActive(!breathActive)}
                  aria-label="Toggle breathing exercise"
                  className="relative w-32 h-32 rounded-full flex items-center justify-center transition-transform"
          style={{ transform: `scale(${breathScale})`, background: 'rgba(255,255,255,0.15)' }}
        >
          <div className="text-center">
            <Wind className="w-8 h-8 mx-auto mb-1" />
            <p className="text-xs font-medium">{breathLabel}</p>
          </div>
        </button>
        <p className="text-xs text-white/50 mt-4">{breathActive ? 'Tap circle to pause' : 'Tap circle to begin'}</p>
      </div>

      {/* Category Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setCurrentStep(0); }} aria-label={`Select ${cat} category`} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-rose-500 text-white shadow-md' : 'bg-white/70 text-slate-600 border border-white/40'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grounding Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className={`card-3d rounded-2xl p-4 border shadow-[var(--shadow-card)] transition-all ${i === currentStep ? 'border-rose-400 shadow-md' : 'border-white/40'}`}>
            <button onClick={() => setCurrentStep(i)} aria-label={step.title} className="w-full text-left">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i === currentStep ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-700 text-sm">{i + 1}. {step.title}</p>
                  {i === currentStep && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.instruction}</p>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2">
        <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} aria-label="Previous step" className="flex-1 py-3 rounded-xl bg-white/70 border border-white/40 shadow-[var(--shadow-card)] text-sm font-medium text-slate-600 disabled:opacity-40">
          ← Previous
        </button>
        <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1} aria-label="Next step" className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-medium disabled:opacity-40">
          Next →
        </button>
      </div>

      {/* Crisis Resources */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200/50 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-rose-700 mb-2 flex items-center gap-1.5"><Phone className="w-4 h-4" /> Need more help?</p>
        <div className="space-y-1.5 text-xs text-slate-600">
          <p>• <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
          <p>• <strong>National Suicide Prevention:</strong> 988</p>
          <p>• <strong>NEDA Helpline:</strong> 1-800-931-2237</p>
        </div>
      </div>
    </div>
  );
}
