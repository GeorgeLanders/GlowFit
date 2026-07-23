import { useGlowFitStore } from './lib/store';
import BottomNav from './components/BottomNav';
import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
import Nutrition from './screens/Nutrition';
import Progress from './screens/Progress';
import Profile from './screens/Profile';
import './index.css';

function AppContent() {
  const activeTab = useGlowFitStore((s) => s.activeTab);

  const screens: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    workouts: <Workouts />,
    nutrition: <Nutrition />,
    progress: <Progress />,
    profile: <Profile />,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Page Content */}
      <main className="max-w-lg mx-auto px-4 pb-20 pt-4">
        {screens[activeTab] ?? <Dashboard />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
