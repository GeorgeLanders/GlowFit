// Error tracking — console-only with optional Sentry integration

let initialized = false;

export async function initErrorTracking() {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.info('[GlowFit] Error tracking: console-only mode (no Sentry DSN)');
    return;
  }

  try {
    const Sentry = await import('@sentry/capacitor');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      tracesSampleRate: 0.1,
    });
    initialized = true;
  } catch {
    console.info('[GlowFit] Error tracking: Sentry init failed, falling back to console');
  }
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  console.error('[GlowFit Error]', error.message, context);

  if (initialized) {
    import('@sentry/capacitor').then(Sentry => {
      Sentry.captureException(error, { extra: context });
    }).catch(() => {});
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info']('[GlowFit]', message);
}
