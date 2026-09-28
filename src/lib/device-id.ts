// Per-install identity for the GlowFit backend.
//
// Every request carries this value as `X-User-Id`, and the worker stores photos
// and synced rows under it. It used to be the hard-coded string 'default', which
// meant every install on earth wrote into one shared partition — two strangers
// could list and read each other's weight logs and progress photos.
//
// The ID is generated once per install and kept in localStorage, the same store
// zustand's persist middleware already uses, so it survives restarts.
//
// This is a device scope, NOT user authentication. There is no account system
// yet, so reinstalling produces a new ID and the previous partition becomes
// unreachable. That is the honest tradeoff until accounts exist; it is strictly
// better than everyone sharing one namespace.

const STORAGE_KEY = 'glowfit.device-id';

// Must match the validator in cloudflare-worker/index.js.
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function randomId(): string {
  const c = globalThis.crypto;
  // randomUUID needs a secure context; the Capacitor WebView and a localhost dev
  // server both qualify, but fall back rather than throw.
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = c.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Last resort. Not cryptographically random, but still unique per install.
  return `gf${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

let cached: string | null = null;

export function getDeviceId(): string {
  if (cached) return cached;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && ID_PATTERN.test(existing) && existing !== 'default') {
      cached = existing;
      return cached;
    }
  } catch {
    // localStorage can be unavailable (storage disabled, exotic WebView). Fall
    // through to an in-memory ID so the app still works for this session.
  }

  const fresh = randomId();
  cached = fresh;
  try {
    localStorage.setItem(STORAGE_KEY, fresh);
  } catch {
    // Session-only ID. Requests are still scoped per install, they just do not
    // survive a restart.
  }
  return fresh;
}
