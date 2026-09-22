// components/MilestoneCard.tsx — shareable milestone cards (Muscle Guard +
// Landing Program). Text-share via Capacitor Share; no image pipeline needed.
import { motion } from 'framer-motion';
import { Share2, Trophy, ShieldCheck, PlaneLanding } from 'lucide-react';
import { shareText } from '../lib/share';
import { haptics } from '../lib/haptics';

export type MilestoneKind = 'muscle' | 'landing-graduation' | 'landing-band';

interface Props {
  kind: MilestoneKind;
  stat: string;       // headline number, e.g. "365 days" / "+8% strength"
  detail: string;     // supporting line
}

const KINDS: Record<MilestoneKind, { title: string; icon: typeof Trophy; cta: string; gradient: string }> = {
  muscle: {
    title: 'Muscle Guard',
    icon: ShieldCheck,
    gradient: 'from-rose-500 to-orange-400',
    cta: 'Tracking protein + strength to protect muscle on GLP-1',
  },
  'landing-graduation': {
    title: 'Landing Program',
    icon: Trophy,
    gradient: 'from-emerald-500 to-teal-400',
    cta: 'One year of maintenance after GLP-1 - habits, not willpower',
  },
  'landing-band': {
    title: 'Landing Program',
    icon: PlaneLanding,
    gradient: 'from-violet-500 to-rose-400',
    cta: 'Holding steady after stopping GLP-1',
  },
};

export function MilestoneCard({ kind, stat, detail }: Props) {
  const k = KINDS[kind];
  const Icon = k.icon;

  const share = () => {
    haptics.medium();
    shareText(
      `${k.title}: ${stat} — ${detail}. ${k.cta}. #GlowFit`,
      `GlowFit — ${k.title}`,
    );
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl bg-gradient-to-br ${k.gradient} p-4 text-white shadow-[var(--shadow-card)]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/90">{k.title}</span>
      </div>
      <p className="text-2xl font-bold">{stat}</p>
      <p className="text-sm text-white/90 mt-0.5">{detail}</p>
      <button
        onClick={share}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" /> Share milestone
      </button>
    </motion.div>
  );
}
