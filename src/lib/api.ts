// GlowFit Cloudflare Backend API Client
// Connects to: glowfit-api.georgelanders2.workers.dev

const API_BASE = import.meta.env.VITE_API_URL || 'https://glowfit-api.georgelanders2.workers.dev';
const USER_ID = 'default'; // Will be replaced with real user ID when auth is added

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': USER_ID,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ═══════════════════════════════════════════
// Photo Storage (R2)
// ═══════════════════════════════════════════

export const photos = {
  async upload(file: File, type: 'progress' | 'food' = 'progress'): Promise<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await fetch(`${API_BASE}/api/photos/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': USER_ID },
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },

  async list(type: 'progress' | 'food' = 'progress'): Promise<{ key: string; url: string; size: number; uploaded: string }[]> {
    return apiFetch(`/api/photos/list?type=${type}`);
  },

  getUrl(key: string): string {
    return `${API_BASE}/api/photos/${encodeURIComponent(key)}`;
  },

  async remove(key: string): Promise<void> {
    await apiFetch(`/api/photos/${encodeURIComponent(key)}`, { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════
// Data Sync (D1)
// ═══════════════════════════════════════════

export const sync = {
  async push(data: Record<string, unknown[]>): Promise<{ synced: boolean; timestamp: number }> {
    return apiFetch('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async pull(since?: string): Promise<Record<string, unknown[]>> {
    const query = since ? `?since=${since}` : '';
    return apiFetch(`/api/sync/pull${query}`);
  },
};

// ═══════════════════════════════════════════
// AI Cache (KV)
// ═══════════════════════════════════════════

export const aiCache = {
  async get(key: string): Promise<{ cached: boolean; data: unknown }> {
    return apiFetch(`/api/cache/get?key=${encodeURIComponent(key)}`);
  },

  async set(key: string, data: unknown, ttl: number = 3600): Promise<{ stored: boolean }> {
    return apiFetch('/api/cache/set', {
      method: 'POST',
      body: JSON.stringify({ key, data, ttl }),
    });
  },
};

// ═══════════════════════════════════════════
// AI Chat (with KV caching)
// ═══════════════════════════════════════════

export const aiChat = {
  async send(messages: { role: string; content: string }[], model?: string): Promise<unknown> {
    return apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, model }),
    });
  },
};
