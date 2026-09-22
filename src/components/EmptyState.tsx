/**
 * EmptyState — friendly, consistent empty-list placeholder.
 * Used by screens with no data yet (workouts, habits, journal, photos...).
 * Dark-mode aware; optional CTA button.
 */
export function EmptyState({
  emoji,
  title,
  message,
  actionLabel,
  onAction,
}: {
  emoji: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-700/40 p-8 shadow-[var(--shadow-card)] text-center">
      <div className="text-4xl mb-3" aria-hidden="true">
        {emoji}
      </div>
      <p className="text-slate-700 dark:text-slate-200 font-medium">{title}</p>
      {message && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{message}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2.5 rounded-xl iridescent gloss text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-fuchsia-600/30 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}