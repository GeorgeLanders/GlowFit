// GlowFit Cloudflare Backend API Client
// Connects to: glowfit-api.georgelanders2.workers.dev

import { getDeviceId } from './device-id';
import { fileToBase64 } from './base64';

const API_BASE = import.meta.env.VITE_API_URL || 'https://glowfit-api.georgelanders2.workers.dev';

// Identity is per install and never shared. This used to be the literal string
// 'default', which put every install on earth in one storage partition. Read as
// a live value rather than a module-level constant so a freshly generated ID is
// never missed by a request that fired during startup.
function identityHeaders(): Record<string, string> {
  return { 'X-User-Id': getDeviceId() };
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...identityHeaders(),
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
    // The worker parses this endpoint with `request.json()` and destructures
    // { filename, data, type }, where data is raw base64. It was being sent
    // multipart/form-data, so every upload died with a 500 and the callers
    // silently fell back to local storage.
    const data = await fileToBase64(file);
    const res = await fetch(`${API_BASE}/api/photos/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...identityHeaders() },
      body: JSON.stringify({ filename: file.name || `${type}.jpg`, data, type }),
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },

  async list(type: 'progress' | 'food' = 'progress'): Promise<
    { key: string; name: string; size: number; url: string }[]
  > {
    return apiFetch(`/api/photos/list?type=${type}`);
  },

  getUrl(key: string): string {
    // Worker serves files at /api/photos/file/<userId>/<type>/<filename>, and
    // `key` is exactly that path (encodeURIComponent is undone by the worker's
    // decodeURIComponent).
    return `${API_BASE}/api/photos/file/${encodeURIComponent(key)}`;
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
