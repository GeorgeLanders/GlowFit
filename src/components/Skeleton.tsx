import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  rounded?: string;
}

export function Skeleton({ className = '', count = 1, height = 'h-4', rounded = 'rounded-xl' }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${height} ${rounded} bg-gradient-to-r from-rose-100/60 via-rose-50/40 to-rose-100/60 dark:from-slate-700/60 dark:via-slate-600/40 dark:dark:to-slate-700/60`}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton height="h-10" rounded="rounded-full" className="w-10 shrink-0" />
        <Skeleton height="h-6" className="flex-1" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} height="h-20" rounded="rounded-2xl" />
        ))}
      </div>
      {/* Chart skeleton */}
      <Skeleton height="h-40" rounded="rounded-2xl" />
      {/* List items */}
      <Skeleton count={3} height="h-14" rounded="rounded-xl" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 space-y-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
      <Skeleton height="h-5" className="w-2/3" />
      <Skeleton height="h-3" />
      <Skeleton height="h-3" className="w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
          <Skeleton height="h-10" rounded="rounded-lg" className="w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" className="w-3/4" />
            <Skeleton height="h-3" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
