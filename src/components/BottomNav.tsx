import { useGlowFitStore } from '../lib/store';
import { LayoutDashboard, Dumbbell, Apple, TrendingUp, User } from 'lucide-react';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const activeTab = useGlowFitStore((s) => s.activeTab);
  const setActiveTab = useGlowFitStore((s) => s.setActiveTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-800/85 backdrop-blur-xl border-t border-white/40 dark:border-slate-600/50 shadow-[var(--shadow-float)]">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { haptics.light(); track('nav_tab', { tab: tab.id }); setActiveTab(tab.id); }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-rose-50 dark:bg-rose-900/30' : ''
              }`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
