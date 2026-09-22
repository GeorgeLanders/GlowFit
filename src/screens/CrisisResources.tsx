import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Phone, Heart } from 'lucide-react';

const crisisResources = [
  { name: '988 Suicide & Crisis Lifeline', phone: '988', description: '24/7 free, confidential support', color: 'from-blue-500 to-indigo-500' },
  { name: 'Crisis Text Line', phone: 'Text HOME to 741741', description: 'Free 24/7 crisis counseling via text', color: 'from-emerald-500 to-teal-500' },
  { name: 'SAMHSA Helpline', phone: '1-800-662-4357', description: 'Free treatment referrals & information', color: 'from-purple-500 to-violet-500' },
  { name: 'National Domestic Violence', phone: '1-800-799-7233', description: '24/7 confidential support', color: 'from-rose-500 to-pink-500' },
  { name: 'NEDA Helpline', phone: '1-800-931-2237', description: 'Eating disorders support', color: 'from-amber-500 to-orange-500' },
];

const selfCareTips = [
  'Take 5 deep breaths — in for 4, hold for 4, out for 4',
  'Drink a glass of cold water',
  'Step outside for fresh air, even for 2 minutes',
  'Text someone you trust and tell them how you feel',
  'Ground yourself: name 5 things you see, 4 you hear, 3 you touch',
];

export default function CrisisResources() {
  const popScreen = useGlowFitStore((s) => s.popScreen);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-500" />
          <h1 className="text-xl font-serif text-rose-900">Crisis Resources</h1>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg text-center">
        <Heart className="w-8 h-8 mx-auto mb-2" />
        <p className="text-lg font-semibold">You are not alone.</p>
        <p className="text-sm text-white/80 mt-1">Help is available 24/7. Reaching out takes courage.</p>
      </div>

      <div className="space-y-3">
        {crisisResources.map((resource) => (
          <div key={resource.name} className={`bg-gradient-to-r ${resource.color} rounded-2xl p-4 text-white shadow-lg`}>
            <h3 className="font-semibold text-lg">{resource.name}</h3>
            <p className="text-sm text-white/80 mb-2">{resource.description}</p>
            <a href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`} className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-white font-medium hover:bg-white/30 transition-all">
              <Phone className="w-4 h-4" />
              {resource.phone}
            </a>
          </div>
        ))}
      </div>

      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="font-medium text-slate-800 mb-3">🧘 Quick Self-Care</h3>
        <div className="space-y-2">
          {selfCareTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <p className="text-sm text-slate-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
