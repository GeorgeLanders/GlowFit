import { Heart, Sparkles, Phone, BookOpen } from 'lucide-react';

const AFFIRMATIONS = [
  "I am worthy of love and care.",
  "My body is strong and capable.",
  "I choose progress over perfection.",
  "I deserve rest and recovery.",
  "Every day I am getting stronger.",
];

const TIPS = [
  { title: '5-4-3-2-1 Grounding', desc: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.' },
  { title: 'Body Scan', desc: 'Starting from your toes, slowly notice each body part without judgment.' },
  { title: 'Gratitude Pause', desc: 'Name 3 things you are grateful for right now.' },
  { title: 'Box Breathing', desc: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.' },
];

export default function MentalWellness() {
  const affirmation = AFFIRMATIONS[Math.floor(Date.now() / 86400000) % AFFIRMATIONS.length];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Mental Wellness</h1>

      {/* Affirmation */}
      <div className="bg-gradient-to-br from-violet-100 to-rose-100 rounded-2xl p-6 shadow-[var(--shadow-card)] text-center">
        <Sparkles className="w-6 h-6 text-violet-500 mx-auto mb-2" />
        <p className="text-lg font-serif text-slate-700 italic">"{affirmation}"</p>
      </div>

      {/* Crisis Resources */}
      <a href="tel:988" className="flex items-center gap-3 bg-red-50 rounded-2xl border border-red-200 p-4 shadow-[var(--shadow-card)]">
        <Phone className="w-5 h-5 text-red-500" />
        <div>
          <p className="text-sm font-bold text-red-700">Crisis? Call 988</p>
          <p className="text-xs text-red-400">Suicide & Crisis Lifeline — 24/7</p>
        </div>
      </a>

      {/* Stress Management */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Coping Techniques</h2>
        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.title} className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-700">{tip.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tip.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Prompt */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-700">Daily Prompt</h3>
        </div>
        <p className="text-sm text-slate-600">What is one thing your body did for you today that you are grateful for?</p>
      </div>
    </div>
  );
}
