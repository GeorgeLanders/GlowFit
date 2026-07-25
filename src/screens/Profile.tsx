import { User, Settings, BookOpen, ChevronRight } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';

export default function Profile() {
  const profile = useGlowFitStore((s) => s.profile);
  const workouts = useGlowFitStore((s) => s.workouts);
  const journalEntries = useGlowFitStore((s) => s.journalEntries);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-[var(--shadow-card)] text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-200 to-violet-200 flex items-center justify-center mx-auto mb-3">
          <User className="w-10 h-10 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{profile.name || 'Your Name'}</h2>
        <p className="text-xs text-slate-400 mt-1">
          {profile.age > 0 ? `${profile.age} years` : 'Age not set'} • {profile.goal}
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Workouts logged</span><span className="font-bold">{workouts.length}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Journal entries</span><span className="font-bold">{journalEntries.length}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Current weight</span><span className="font-bold">{profile.currentWeight} kg</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Goal weight</span><span className="font-bold">{profile.goalWeight} kg</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Height</span><span className="font-bold">{profile.height} cm</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => pushScreen('settings')}
          aria-label="Action"
          className="w-full flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] text-left hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => pushScreen('journal')}
          aria-label="Action"
          className="w-full flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] text-left hover:shadow-[var(--shadow-card-hover)] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Journal</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
