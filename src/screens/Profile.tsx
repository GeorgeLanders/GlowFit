import {
  User, Settings, BookOpen, ChevronRight,
  Bot, Brain, Percent, Heart, TrendingUp, Calculator, Leaf,
  Moon, Smile, Wind, LifeBuoy, Wallet, Users, Syringe, Bell,
  Download, Shield, FileText, Dumbbell, NotebookPen,
  Scale, Target, Ruler,
} from 'lucide-react';
import { useGlowFitStore } from '../lib/store';

type MenuItem = { label: string; screen: string; icon: React.ElementType; color: string };

/** Round converted metric values so stored/displayed numbers stay clean
 *  (avoids 86.1825503 kg from unit conversion). */
function one(n: number): number {
  return Number.isFinite(n) ? Number(n.toFixed(1)) : 0;
}

// Feature screens that have no other navigation entry point.
const MORE_SCREENS: MenuItem[] = [
  { label: 'AI Agent Chat', screen: 'agent-chat', icon: Bot, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { label: 'Memory Insights', screen: 'memory-insights', icon: Brain, color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400' },
  { label: 'Body Composition', screen: 'body-composition', icon: Percent, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { label: 'Body Neutral Progress', screen: 'body-neutral-progress', icon: Heart, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { label: 'Progressive Overload', screen: 'progressive-overload', icon: TrendingUp, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  { label: 'TDEE Calculator', screen: 'tdee-calculator', icon: Calculator, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { label: 'Mood & Meals', screen: 'mood-meal', icon: Smile, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { label: 'Nourishment', screen: 'nourishment', icon: Leaf, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { label: 'Sleep & Wellness', screen: 'sleep-wellness', icon: Moon, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  { label: 'Wellness Tracker', screen: 'wellness-tracker', icon: Heart, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { label: 'SOS Grounding', screen: 'sos-grounding', icon: Wind, color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
  { label: 'Crisis Resources', screen: 'crisis-resources', icon: LifeBuoy, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  { label: 'Budget', screen: 'budget', icon: Wallet, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { label: 'Accountability Circle', screen: 'accountability-circle', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { label: 'GLP-1 Settings', screen: 'glp1-settings', icon: Syringe, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
  { label: 'Smart Notifications', screen: 'smart-notifications', icon: Bell, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
];

// Legal & data — Play requires privacy policy and terms to be reachable in-app.
const LEGAL_SCREENS: MenuItem[] = [
  { label: 'Export Data', screen: 'export-data', icon: Download, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { label: 'Privacy Policy', screen: 'privacy-policy', icon: Shield, color: 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300' },
  { label: 'Terms of Service', screen: 'terms-of-service', icon: FileText, color: 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300' },
];

function MenuRow({ label, screen, icon: Icon, color }: MenuItem) {
  const pushScreen = useGlowFitStore((s) => s.pushScreen);
  return (
    <button
      onClick={() => pushScreen(screen)}
      aria-label={label}
      className="w-full flex items-center gap-3 card-3d rounded-2xl p-3.5 shadow-[var(--shadow-card)] text-left hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98]"
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

export default function Profile() {
  const profile = useGlowFitStore((s) => s.profile);
  const workouts = useGlowFitStore((s) => s.workouts);
  const journalEntries = useGlowFitStore((s) => s.journalEntries);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900 dark:text-rose-300">Profile</h1>

      {/* Profile Card */}
      <div className="relative overflow-hidden card-3d rounded-2xl shadow-[var(--shadow-card)] text-center">
        <div className="h-24 bg-gradient-to-r from-rose-500 to-violet-500" aria-hidden="true" />
        <div className="px-6 pb-6 -mt-12">
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 p-1 mx-auto mb-3 shadow-lg">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center">
              <User className="w-11 h-11 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile.name || 'Your Name'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {profile.age > 0 ? `${profile.age} years` : 'Age not set'} • {profile.goal.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Stats</h3>
        <div className="space-y-2.5">
          {[
            { icon: Dumbbell, label: 'Workouts logged', value: `${workouts.length}`, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
            { icon: NotebookPen, label: 'Journal entries', value: `${journalEntries.length}`, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
            { icon: Scale, label: 'Current weight', value: `${one(profile.currentWeight)} kg`, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
            { icon: Target, label: 'Goal weight', value: `${one(profile.goalWeight)} kg`, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            { icon: Ruler, label: 'Height', value: `${one(profile.height)} cm`, color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </span>
              <span className="text-slate-500 dark:text-slate-400 flex-1 text-sm">{s.label}</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => pushScreen('settings')}
          aria-label="Action"
          className="w-full flex items-center gap-3 card-3d rounded-2xl p-3.5 shadow-[var(--shadow-card)] text-left hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98]"
        >
          <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">Settings</span>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        <button
          onClick={() => pushScreen('journal')}
          aria-label="Action"
          className="w-full flex items-center gap-3 card-3d rounded-2xl p-3.5 shadow-[var(--shadow-card)] text-left hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98]"
        >
          <span className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">Journal</span>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Tools & More */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Tools & More</h3>
        {MORE_SCREENS.map((item) => (
          <MenuRow key={item.screen} {...item} />
        ))}
      </div>

      {/* Legal & Data */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Legal & Data</h3>
        {LEGAL_SCREENS.map((item) => (
          <MenuRow key={item.screen} {...item} />
        ))}
      </div>
    </div>
  );
}
