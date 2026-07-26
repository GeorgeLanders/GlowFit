import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { getPendingCount, onOnlineStatusChange } from '../lib/offline-queue';

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const unsub = onOnlineStatusChange((isOnline) => {
      setOnline(isOnline);
      if (isOnline) setPending(getPendingCount());
    });
    setPending(getPendingCount());
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <WifiOff className="w-4 h-4" />
          <span>You're offline{pending > 0 ? ` — ${pending} changes waiting to sync` : ''}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
