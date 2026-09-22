import { useState, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { User, Info, Save, Trash2, Fingerprint, HeartPulse, Sparkles } from 'lucide-react';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { notifications } from '../lib/notifications';
import { haptics } from '../lib/haptics';
import { biometric } from '../lib/biometric';
import { track } from '../lib/analytics';
import { isHealthSupported, requestHealthAccess, checkHealthAccess, syncTodayHealth, sleepTimesToday, openHealthConnectSettings, type HealthSyncSummary } from '../lib/health-connect';

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const;
const GOALS = ['lose', 'maintain', 'gain'] as const;
const GENDERS = ['male', 'female', 'other'] as const;

export default function SettingsScreen() {
  const { profile, updateProfile } = useGlowFitStore();
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [weight, setWeight] = useState(profile.currentWeight.toString());
  const [goalWeight, setGoalWeight] = useState(profile.goalWeight.toString());
  const [activity, setActivity] = useState(profile.activityLevel);
  const [goal, setGoal] = useState(profile.goal);
  const [gender, setGender] = useState(profile.gender);
  const [saved, setSaved] = useState(false);
  const [biometricInfo, setBiometricInfo] = useState<{ available: boolean; strong: boolean; type: string }>({ available: false, strong: false, type: 'None' });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [healthSupport, setHealthSupport] = useState<{ available: boolean; reason?: string } | null>(null);
  const [healthGranted, setHealthGranted] = useState<string[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSyncSummary | null>(null);
  const [healthSyncing, setHealthSyncing] = useState(false);
  const upsertHealthSteps = useGlowFitStore((s) => s.upsertHealthSteps);
  const sleepLogs = useGlowFitStore((s) => s.sleepLogs);
  const upsertHealthSleep = useGlowFitStore((s) => s.upsertHealthSleep);

  useEffect(() => {
    biometric.check().then(setBiometricInfo).catch(() => {});
    isHealthSupported().then(setHealthSupport).catch(() => setHealthSupport({ available: false }));
  }, []);

  useEffect(() => {
    if (healthSupport?.available) {
      checkHealthAccess().then((a) => setHealthGranted(a.granted)).catch(() => {});
    }
  }, [healthSupport]);

  const connectHealth = async () => {
    haptics.medium();
    try {
      const { granted } = await requestHealthAccess();
      setHealthGranted(granted);
      if (granted.length > 0) {
        haptics.success();
        track('health_connect_authorized');
      }
    } catch {
      haptics.light();
    }
  };

  const syncHealth = async () => {
    if (healthSyncing) return;
    setHealthSyncing(true);
    haptics.medium();
    try {
      const summary = await syncTodayHealth();
      const todayStr = new Date().toISOString().split('T')[0] ?? '';
      upsertHealthSteps({ date: todayStr, steps: summary.steps, syncedAt: summary.syncedAt });
      const manualToday = sleepLogs.some((l) => l.date === todayStr && l.source !== 'health-connect');
      if (summary.sleepMinutes != null && !manualToday) {
        const { bedTime, wakeTime } = sleepTimesToday(summary.syncedAt, summary.sleepMinutes);
        upsertHealthSleep({
          id: `hc_${todayStr}`,
          date: todayStr,
          bedTime,
          wakeTime,
          quality: 3,
          notes: 'Synced from Health Connect',
          source: 'health-connect',
        });
      }
      setHealthSummary(summary);
      haptics.success();
      track('health_sync', { steps: summary.steps });
    } catch {
      haptics.light();
    } finally {
      setHealthSyncing(false);
    }
  };

  const save = () => {
    updateProfile({
      name,
      age: parseInt(age) || 0,
      height: parseFloat(height) || 170,
      currentWeight: parseFloat(weight) || 70,
      goalWeight: parseFloat(goalWeight) || 65,
      activityLevel: activity,
      goal,
      gender,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete ALL your data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-serif text-rose-900 dark:text-rose-300">Settings</h1>

      <button
        onClick={() => { haptics.light(); useGlowFitStore.getState().pushScreen('ai-settings'); }}
        className="w-full mt-4 flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 shadow-[var(--shadow-card)]"
      >
        <Sparkles className="w-5 h-5 text-purple-600" />
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">AI Assistant</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose provider, bring your own key - free options available</p>
        </div>
        <span className="text-xs text-rose-500">Open</span>
      </button>


      {/* Appearance */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Appearance</h3>
        <DarkModeToggle />
      </div>

      {/* Notifications */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Notifications</h3>
        <button
          onClick={async () => {
            haptics.light();
            const granted = await notifications.requestPermission();
            if (granted) haptics.success();
          }}
          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
        >
          Enable Push Notifications
        </button>
      </div>

      {/* Health Sync */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Health Sync</h3>
        {healthSupport == null ? (
          <p className="text-xs text-slate-400">Checking device support…</p>
        ) : !healthSupport.available ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-slate-300" />
              <p className="text-xs text-slate-500">Health sync isn't available on this device{healthSupport.reason ? `: ${healthSupport.reason}` : '.'}</p>
            </div>
            <button onClick={() => openHealthConnectSettings()} aria-label="Open Health Connect settings"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium active:scale-95 transition-all">
              Open Health Connect Settings
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <HeartPulse className={`w-5 h-5 ${healthGranted.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {healthGranted.length > 0 ? `Connected (${healthGranted.join(', ')})` : 'Connect your health data'}
                </p>
                <p className="text-xs text-slate-400">Reads steps, heart rate, and sleep. Read-only.</p>
              </div>
            </div>
            <div className="flex gap-2">
              {healthGranted.length === 0 ? (
                <button onClick={connectHealth} aria-label="Connect health data"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold active:scale-95 transition-all">
                  Connect
                </button>
              ) : (
                <button onClick={syncHealth} disabled={healthSyncing} aria-label="Sync health data now"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold active:scale-95 transition-all disabled:opacity-50">
                  {healthSyncing ? 'Syncing…' : 'Sync Now'}
                </button>
              )}
            </div>
            {healthSummary && (
              <div className="flex gap-4 text-sm">
                <span className="text-slate-600"><span className="font-bold text-slate-800">{healthSummary.steps.toLocaleString()}</span> steps</span>
                {healthSummary.avgHeartRate != null && <span className="text-slate-600"><span className="font-bold text-slate-800">{healthSummary.avgHeartRate}</span> bpm avg</span>}
                {healthSummary.sleepMinutes != null && <span className="text-slate-600"><span className="font-bold text-slate-800">{Math.floor(healthSummary.sleepMinutes / 60)}h {healthSummary.sleepMinutes % 60}m</span> sleep</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security */}
      {biometricInfo.available && (
        <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Security</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{biometricInfo.type} Lock</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Require {biometricInfo.type} to open app</p>
              </div>
            </div>
            <button
              onClick={async () => {
                haptics.medium();
                track('biometric_toggle');
                if (biometricEnabled) {
                  setBiometricEnabled(false);
                } else {
                  const ok = await biometric.authenticate('Enable app lock');
                  if (ok) { setBiometricEnabled(true); haptics.success(); }
                }
              }}
              className={`w-12 h-7 rounded-full transition-all ${biometricEnabled ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              role="switch"
              aria-checked={biometricEnabled}
              aria-label="Toggle biometric lock"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-1 ${biometricEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Profile</h3>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Goal Weight (kg)</label>
            <input type="number" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Gender</label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${gender === g ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{g}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Activity Level</label>
          <div className="flex gap-1.5 flex-wrap">
            {ACTIVITY_LEVELS.map((a) => (
              <button key={a} onClick={() => setActivity(a)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activity === a ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{a.replace('_', ' ')}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Goal</label>
          <div className="flex gap-2">
            {GOALS.map((g) => (
              <button key={g} onClick={() => setGoal(g)} className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${goal === g ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{g}</button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          aria-label="Action"
          className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all"
        >
          {saved ? '✓ Saved!' : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>

      {/* Data */}
      <div className="card-3d rounded-2xl p-4 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Data</h3>
        </div>
        <button
          onClick={clearAllData}
          aria-label="Action"
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-xl font-bold text-sm hover:bg-red-100 active:scale-[0.98] transition-all"
        >
          <Trash2 className="w-4 h-4" /> Delete All Data
        </button>
        <p className="text-xs text-slate-400 text-center">All data is stored locally on your device</p>
      </div>
    </div>
  );
}
