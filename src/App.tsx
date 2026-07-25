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
import { AiCoach } from './screens/AiCoach';
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
import { GLP1Dashboard } from './screens/GLP1Dashboard';
import { ProgressPhotos } from './screens/ProgressPhotos';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { MealPlanner } from './screens/MealPlanner';
import AiInsights from './screens/AiInsights';
import Budget from './screens/Budget';
import ExportData from './screens/ExportData';
import SmartNotifications from './screens/SmartNotifications';
import TDEECalculator from './screens/TDEECalculator';
import ExerciseBrowser from './screens/ExerciseBrowser';
import BodyComposition from './screens/BodyComposition';
import ProgressiveOverload from './screens/ProgressiveOverload';
import FoodPhotoJournal from './screens/FoodPhotoJournal';
import HeartRate from './screens/HeartRate';
import CrisisResources from './screens/CrisisResources';
import PrivacyPolicy from './screens/PrivacyPolicy';
import TermsOfService from './screens/TermsOfService';
import AccountabilityCircle from './screens/AccountabilityCircle';
import Programs from './screens/Programs';
import MemoryInsights from './screens/MemoryInsights';
import AgentChat from './screens/AgentChat';
import AiPlanner from './screens/AiPlanner';
import BodyNeutralProgress from './screens/BodyNeutralProgress';
import GLP1Settings from './screens/GLP1Settings';
import MoodMeal from './screens/MoodMeal';
import Nourishment from './screens/Nourishment';
import SleepWellness from './screens/SleepWellness';
import SosGrounding from './screens/SosGrounding';

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
  // New screens
  'glp1-tracker': { title: 'GLP-1 Tracker', component: <GLP1Dashboard /> },
  'progress-photos': { title: 'Progress Photos', component: <ProgressPhotos /> },
  'meal-planner': { title: 'Meal Planner', component: <MealPlanner /> },
  // Phase 3 screens
  'ai-insights': { title: 'AI Insights', component: <AiInsights /> },
  'budget': { title: 'Budget', component: <Budget /> },
  'export-data': { title: 'Export Data', component: <ExportData /> },
  'smart-notifications': { title: 'Notifications', component: <SmartNotifications /> },
  'tdee-calculator': { title: 'TDEE Calculator', component: <TDEECalculator /> },
  'exercise-browser': { title: 'Exercise Library', component: <ExerciseBrowser /> },
  'body-composition': { title: 'Body Composition', component: <BodyComposition /> },
  'progressive-overload': { title: 'Progressive Overload', component: <ProgressiveOverload /> },
  'food-photo-journal': { title: 'Food Photo Journal', component: <FoodPhotoJournal /> },
  'heart-rate': { title: 'Heart Rate', component: <HeartRate /> },
  'crisis-resources': { title: 'Crisis Resources', component: <CrisisResources /> },
  'privacy-policy': { title: 'Privacy Policy', component: <PrivacyPolicy /> },
  'terms-of-service': { title: 'Terms of Service', component: <TermsOfService /> },
  'accountability-circle': { title: 'Accountability Circle', component: <AccountabilityCircle /> },
  'programs': { title: 'Workout Programs', component: <Programs /> },
  'memory-insights': { title: 'Memory Insights', component: <MemoryInsights /> },
  // Phase 3b screens
  'agent-chat': { title: 'AI Agent Chat', component: <AgentChat /> },
  'ai-planner': { title: 'AI Planner', component: <AiPlanner /> },
  'body-neutral-progress': { title: 'Body Neutral Progress', component: <BodyNeutralProgress /> },
  'glp1-settings': { title: 'GLP-1 Settings', component: <GLP1Settings /> },
  'mood-meal': { title: 'Mood & Meal', component: <MoodMeal /> },
  'nourishment': { title: 'Nourishment', component: <Nourishment /> },
  'sleep-wellness': { title: 'Sleep Wellness', component: <SleepWellness /> },
  'sos-grounding': { title: 'SOS Grounding', component: <SosGrounding /> },
};

// ═══════════════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════════════

function AppContent() {
  const activeTab = useGlowFitStore((s) => s.activeTab);
  const currentScreen = useGlowFitStore((s) => s.currentScreen);
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const onboardingCompleted = useGlowFitStore((s) => s.profile.onboardingCompleted);
  const updateProfile = useGlowFitStore((s) => s.updateProfile);

  // Onboarding gate
  if (!onboardingCompleted && !currentScreen) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)]">
        <main className="max-w-lg mx-auto px-4 pt-4">
          <OnboardingFlow onComplete={() => updateProfile({ onboardingCompleted: true })} />
        </main>
      </div>
    );
  }

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
