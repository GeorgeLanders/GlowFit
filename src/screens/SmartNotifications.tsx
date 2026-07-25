import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Bell, ArrowLeft, Droplets, Dumbbell, Moon, Apple, Trophy, Heart } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
  time?: string;
}

export default function SmartNotifications() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'water', title: 'Water Reminders', description: 'Remind you to drink water every 2 hours', icon: <Droplets className="w-5 h-5" />, color: 'text-cyan-500', enabled: true, time: 'Every 2h' },
    { id: 'workout', title: 'Workout Reminders', description: 'Remind you to work out on schedule', icon: <Dumbbell className="w-5 h-5" />, color: 'text-rose-500', enabled: true, time: '9:00 AM' },
    { id: 'sleep', title: 'Sleep Reminder', description: 'Wind down notification at bedtime', icon: <Moon className="w-5 h-5" />, color: 'text-indigo-500', enabled: false, time: '10:30 PM' },
    { id: 'meal', title: 'Meal Logging', description: 'Remind you to log your meals', icon: <Apple className="w-5 h-5" />, color: 'text-amber-500', enabled: true, time: '12:00 PM' },
    { id: 'streak', title: 'Streak Alerts', description: 'Get notified when your streak is at risk', icon: <Trophy className="w-5 h-5" />, color: 'text-orange-500', enabled: true },
    { id: 'wellness', title: 'Wellness Check-in', description: 'Daily mood and wellness prompt', icon: <Heart className="w-5 h-5" />, color: 'text-pink-500', enabled: false, time: '8:00 PM' },
  ]);

  const toggle = (id: string) => setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-serif text-rose-900">Smart Notifications</h1>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
        <p className="text-sm text-slate-500 mb-1">Notifications Enabled</p>
        <p className="text-2xl font-bold text-slate-800">{settings.filter(s => s.enabled).length}/{settings.length}</p>
      </div>

      <div className="space-y-2">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className={setting.color}>{setting.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">{setting.title}</h3>
                <p className="text-sm text-slate-500">{setting.description}</p>
                {setting.time && <p className="text-xs text-slate-400 mt-1">⏰ {setting.time}</p>}
              </div>
              <button onClick={() => toggle(setting.id)} className={`w-12 h-7 rounded-full transition-all relative ${setting.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow ${setting.enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
