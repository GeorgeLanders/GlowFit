import { Sun, Moon, Monitor } from 'lucide-react';
import { useDarkMode } from '../lib/useDarkMode';
import { haptics } from '../lib/haptics';

export function DarkModeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useDarkMode();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  return (
    <div className={`flex gap-1 p-1 bg-rose-50/80 dark:bg-slate-800/80 rounded-xl ${className}`}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => { setTheme(value); haptics.selection(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            theme === value
              ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-700 dark:text-rose-300'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
