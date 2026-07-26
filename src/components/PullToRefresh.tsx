import { useState, useCallback, type ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const controls = useAnimation();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const y = e.touches[0].clientY;
    if (y < 100) setPulling(true);
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);
    setRefreshing(true);
    controls.start({ rotate: 360, transition: { duration: 1, repeat: Infinity, ease: 'linear' } });

    await onRefresh();

    controls.stop();
    setRefreshing(false);
  }, [pulling, onRefresh, controls]);

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {(pulling || refreshing) && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="flex justify-center py-2"
        >
          <motion.div
            animate={controls}
            className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full"
          />
        </motion.div>
      )}
      {children}
    </div>
  );
}
