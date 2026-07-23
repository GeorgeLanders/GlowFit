import { useGlowFitStore } from './lib/store';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './components/BottomNav';

// Main tab screens
import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
import Nutrition from './screens/Nutrition';
import Progress from './screens/Progress';
import Profile from './screens/Profile';

// Sub-screens
import WaterTracker from './screens/WaterTracker';
import SleepTracker from './screens/SleepTracker';
import WellnessTracker from './screens/WellnessTracker';
import MentalWellness from './screens/MentalWellness';
import HabitTracker from './screens/HabitTracker';
import StreakDashboard from './screens/StreakDashboard';
import WeeklyReport from './screens/WeeklyReport';
import Trends from './screens/Trends';
import AiCoach from './screens/AiCoach';
import WorkoutLogger from './screens/WorkoutLogger';
import WorkoutTimer from './screens/WorkoutTimer';
import WorkoutTemplates from './screens/WorkoutTemplates';
import FoodSearch from './screens/FoodSearch';
import BreathingExercises from './screens/BreathingExercises';
import CycleTracker from './screens/CycleTracker';
import Gamification from './screens/Gamification';
import WeightTracker from './screens/WeightTracker';
import RecoveryScreen from './screens/RecoveryScreen';
import SettingsScreen from './screens/SettingsScreen';
import JournalScreen from './screens/JournalScreen';
import BodyMeasurements from './screens/BodyMeasurements';

import './index.css';

// ═══════════════════════════════════════════════════════════════════
// Screen Registry
// ═══════════════════════════════════════════════════════════════════

const MAIN_SCREENS: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  workouts: <Workouts />,
  nutrition: <Nutrition />,
  progress: <Progress />,
  profile: <Profile />,
};

const SUB_SCREENS: Record<string, { title: string; component: React.ReactNode }> = {
  // Dashboard sub-screens
  'water-tracker': { title: 'Water Intake', component: <WaterTracker /> },
  'sleep-tracker': { title: 'Sleep Log', component: <SleepTracker /> },
  'wellness-tracker': { title: 'Mood & Wellness', component: <WellnessTracker /> },
  'mental-wellness': { title: 'Mental Wellness', component: <MentalWellness /> },
  'habit-tracker': { title: 'Habits', component: <HabitTracker /> },
  'streak-dashboard': { title: 'Streaks', component: <StreakDashboard /> },
  'weekly-report': { title: 'Weekly Report', component: <WeeklyReport /> },
  'trends': { title: 'Trends', component: <Trends /> },
  'ai-coach': { title: 'AI Coach', component: <AiCoach /> },
  // Workout sub-screens
  'workout-logger': { title: 'Log Workout', component: <WorkoutLogger /> },
  'workout-timer': { title: 'Workout Timer', component: <WorkoutTimer /> },
  'workout-templates': { title: 'Templates', component: <WorkoutTemplates /> },
  'breathing-exercises': { title: 'Breathing Exercises', component: <BreathingExercises /> },
  'cycle-tracker': { title: 'Cycle Tracker', component: <CycleTracker /> },
  'gamification': { title: 'Achievements', component: <Gamification /> },
  'weight-tracker': { title: 'Weight Log', component: <WeightTracker /> },
  'recovery': { title: 'Recovery', component: <RecoveryScreen /> },
  // Nutrition sub-screens
  'food-search': { title: 'Food Search', component: <FoodSearch /> },
  // Progress sub-screens
  'body-measurements': { title: 'Body Measurements', component: <BodyMeasurements /> },
  // Profile sub-screens
  'settings': { title: 'Settings', component: <SettingsScreen /> },
  'journal': { title: 'Journal', component: <JournalScreen /> },
};

// ═══════════════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════════════

function AppContent() {
  const activeTab = useGlowFitStore((s) => s.activeTab);
  const currentScreen = useGlowFitStore((s) => s.currentScreen);
  const popScreen = useGlowFitStore((s) => s.popScreen);

  // Sub-screen view
  if (currentScreen && SUB_SCREENS[currentScreen]) {
    const { title, component } = SUB_SCREENS[currentScreen];
    return (
      <div className="min-h-screen bg-[var(--bg-page)]">
        <main className="max-w-lg mx-auto px-4 pb-20 pt-4">
          {/* Back Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={popScreen}
              className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)] hover:bg-white/90 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-serif text-rose-900">{title}</h1>
          </div>
          {component}
        </main>
        <BottomNav />
      </div>
    );
  }

  // Main tab view
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <main className="max-w-lg mx-auto px-4 pb-20 pt-4">
        {MAIN_SCREENS[activeTab] ?? <Dashboard />}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
