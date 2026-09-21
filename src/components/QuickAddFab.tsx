import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Footprints, Apple, Droplets } from 'lucide-react';
import { useGlowFitStore } from '../lib/store';
import { haptics } from '../lib/haptics';
import { track } from '../lib/analytics';

/**
 * QuickAddFab — floating + button on the main tab view.
 * Opens the three most-used logging actions in one tap.
 * Only rendered in App.tsx's main-tab branch, so it never covers sub-screens.
 */
const ACTIONS = [
  { icon: Droplets, label: 'Water', screen: 'water-tracker', color: 'bg-blue-500' },
  { icon: Apple, label: 'Food', screen: 'food-search', color: 'bg-emerald-500' },
  { icon: Footprints, label: 'Workout', screen: 'workout-logger', color: 'bg-violet-500' },
];

export function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const pushScreen = useGlowFitStore((s) => s.pushScreen);

  return (
    <div
      className="fixed right-5 z-40 flex flex-col items-end gap-3"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <AnimatePresence>
        {open &&
          ACTIONS.map((a) => (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                haptics.light();
                track('fab_quick_add', { type: a.label });
                setOpen(false);
                pushScreen(a.screen);
              }}
              aria-label={`Log ${a.label}`}
              className="flex items-center gap-2.5"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-full shadow">
                {a.label}
              </span>
              <span
                className={`w-11 h-11 rounded-full ${a.color} text-white flex items-center justify-center shadow-lg`}
              >
                <a.icon className="w-5 h-5" />
              </span>
            </motion.button>
          ))}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          haptics.medium();
          setOpen(!open);
        }}
        aria-label="Quick add"
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center"
      >
        <Plus
          className={`w-7 h-7 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        />
      </motion.button>
    </div>
  );
}