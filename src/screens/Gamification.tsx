import { useGlowFitStore } from '../lib/store';
import { Trophy, Star, Flame, Droplets, Dumbbell, Target, Heart, Zap } from 'lucide-react';

const ACHIEVEMENTS = [
  { icon: Dumbbell, name: 'First Step', desc: 'Log your first workout', xp: 50, check: (s: any) => s.workouts.length >= 1 },
  { icon: Flame, name: 'On Fire', desc: '7-day workout streak', xp: 100, check: (s: any) => s.workouts.length >= 7 },
  { icon: Trophy, name: 'Century Club', desc: 'Log 100 workouts', xp: 500, check: (s: any) => s.workouts.length >= 100 },
  { icon: Droplets, name: 'Hydrated', desc: 'Log water 7 days in a row', xp: 75, check: (s: any) => s.waterLogs.length >= 7 },
  { icon: Target, name: 'Goal Getter', desc: 'Reach your goal weight', xp: 200, check: (s: any) => s.weightLogs.length >= 10 },
  { icon: Heart, name: 'Wellness Warrior', desc: 'Log wellness 14 days', xp: 150, check: (s: any) => s.wellnessLogs.length >= 14 },
  { icon: Star, name: 'Journaler', desc: 'Write 10 journal entries', xp: 100, check: (s: any) => s.journalEntries.length >= 10 },
  { icon: Zap, name: 'Habit Master', desc: 'Create 5 habits', xp: 75, check: (s: any) => s.habits.length >= 5 },
];

export default function Gamification() {
  const store = useGlowFitStore();
  const totalXp = ACHIEVEMENTS.filter((a) => a.check(store)).reduce((s, a) => s + a.xp, 0);
  const level = Math.floor(totalXp / 100) + 1;
  const xpInLevel = totalXp % 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900">Achievements</h1>

      {/* Level Card */}
      <div className="bg-gradient-to-br from-violet-100 to-rose-100 rounded-2xl p-6 shadow-[var(--shadow-card)] text-center">
        <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <p className="text-3xl font-bold text-slate-800">Level {level}</p>
        <p className="text-xs text-slate-500 mt-1">{totalXp} XP total • {xpInLevel}/100 to next level</p>
        <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" style={{ width: `${xpInLevel}%` }} />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.check(store);
          const Icon = a.icon;
          return (
            <div key={a.name} className={`rounded-2xl border p-4 shadow-[var(--shadow-card)] text-center transition-all ${unlocked ? 'bg-white/70 backdrop-blur-sm border-amber-200' : 'bg-slate-50/50 border-slate-200 opacity-60'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${unlocked ? 'bg-amber-100' : 'bg-slate-100'}`}>
                <Icon className={`w-6 h-6 ${unlocked ? 'text-amber-600' : 'text-slate-300'}`} />
              </div>
              <p className="text-sm font-bold text-slate-800">{a.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
              <p className="text-xs font-bold text-amber-500 mt-1">{a.xp} XP</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
