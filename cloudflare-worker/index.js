const GITHUB_REPO = 'GeorgeLanders/glowfit-photos';
const GITHUB_API = 'https://api.github.com';

async function githubFetch(path, env, options = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      'User-Agent': 'GlowFit-Worker/1.0',
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}

async function getFile(userId, type, filename, env) {
  const path = `${userId}/${type}/${filename}`;
  const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, env);
  if (res.status === 404) return null;
  const data = await res.json();
  return { ...data, content: atob(data.content), path: data.path };
}

async function saveFile(userId, type, filename, base64Data, env, message) {
  const path = `${userId}/${type}/${filename}`;
  // Check if file exists
  const existing = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, env);
  const body = { message, content: base64Data };
  if (existing.ok) {
    const data = await existing.json();
    body.sha = data.sha;
  }
  return githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, env, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

async function deleteFile(userId, type, filename, env) {
  const path = `${userId}/${type}/${filename}`;
  const existing = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, env);
  if (!existing.ok) return null;
  const data = await existing.json();
  return githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, env, {
    method: 'DELETE',
    body: JSON.stringify({ message: `Delete ${filename}`, sha: data.sha }),
  });
}

async function listFiles(userId, type, env) {
  const path = `${userId}/${type}`;
  const res = await githubFetch(`/repos/${GITHUB_REPO}/contents/${path}`, env);
  if (res.status === 404) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter(f => f.type === 'file')
    .map(f => ({
      key: f.path,
      name: f.name,
      size: f.size,
      url: `/api/photos/file/${encodeURIComponent(f.path)}`,
    }))
    .sort((a, b) => b.name.localeCompare(a.name));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
        },
      });
    }
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    };
    
    const userId = request.headers.get('X-User-Id') || 'default';
    
    try {
      // ═══════════════════════════════════════════
      // GitHub Photo Storage
      // ═══════════════════════════════════════════
      if (url.pathname === '/api/photos/upload' && request.method === 'POST') {
        const { filename, data: base64Data, type = 'progress' } = await request.json();
        if (!filename || !base64Data) {
          return new Response(JSON.stringify({ error: 'Missing filename or data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const res = await saveFile(userId, type, safeFilename, base64Data, env, `Upload ${safeFilename}`);
        const resText = await res.text();
        let resData;
        try { resData = JSON.parse(resText); } catch { resData = { raw: resText.slice(0, 500) }; }
        if (!res.ok) {
          return new Response(JSON.stringify({ error: resData.message || resData.raw || 'GitHub API error', status: res.status }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const path = `${userId}/${type}/${safeFilename}`;
        return new Response(JSON.stringify({ key: path, url: `/api/photos/file/${encodeURIComponent(path)}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname.startsWith('/api/photos/file/') && request.method === 'GET') {
        const path = decodeURIComponent(url.pathname.replace('/api/photos/file/', ''));
        const parts = path.split('/');
        if (parts.length < 3) {
          return new Response('Invalid path', { status: 400, headers: corsHeaders });
        }
        const [fileUserId, type, ...filenameParts] = parts;
        const filename = filenameParts.join('/');
        const file = await getFile(fileUserId, type, filename, env);
        if (!file) {
          return new Response('Not found', { status: 404, headers: corsHeaders });
        }
        // Determine content type from extension
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
        return new Response(file.content, {
          headers: {
            ...corsHeaders,
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      }
      
      if (url.pathname === '/api/photos/list' && request.method === 'GET') {
        const type = url.searchParams.get('type') || 'progress';
        const photos = await listFiles(userId, type, env);
        return new Response(JSON.stringify(photos), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname.startsWith('/api/photos/') && request.method === 'DELETE') {
        const path = decodeURIComponent(url.pathname.replace('/api/photos/', ''));
        const parts = path.split('/');
        if (parts.length >= 3) {
          const [fileUserId, type, ...filenameParts] = parts;
          const filename = filenameParts.join('/');
          await deleteFile(fileUserId, type, filename, env);
        }
        return new Response(JSON.stringify({ deleted: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // ═══════════════════════════════════════════
      // D1 User Data Sync
      // ═══════════════════════════════════════════
      if (url.pathname === '/api/sync/push' && request.method === 'POST') {
        const data = await request.json();
        for (const [type, entries] of Object.entries(data)) {
          if (!Array.isArray(entries)) continue;
          for (const entry of entries) {
            await env.DB.prepare(
              `INSERT OR REPLACE INTO user_data (user_id, type, entry_id, data, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`
            ).bind(userId, type, entry.id || `${Date.now()}`, JSON.stringify(entry)).run();
          }
        }
        return new Response(JSON.stringify({ synced: true, timestamp: Date.now() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname === '/api/sync/pull' && request.method === 'GET') {
        const since = url.searchParams.get('since') || '1970-01-01';
        const { results } = await env.DB.prepare(
          `SELECT type, entry_id, data, updated_at FROM user_data WHERE user_id = ? AND updated_at > ? ORDER BY updated_at DESC`
        ).bind(userId, since).all();
        const grouped = {};
        for (const row of results) {
          if (!grouped[row.type]) grouped[row.type] = [];
          grouped[row.type].push({ id: row.entry_id, ...JSON.parse(row.data), _updatedAt: row.updated_at });
        }
        return new Response(JSON.stringify(grouped), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // ═══════════════════════════════════════════
      // KV AI Response Cache
      // ═══════════════════════════════════════════
      if (url.pathname === '/api/cache/get' && request.method === 'GET') {
        const key = url.searchParams.get('key');
        const cached = await env.AI_CACHE.get(`ai:${userId}:${key}`, 'json');
        return new Response(JSON.stringify({ cached: !!cached, data: cached }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname === '/api/cache/set' && request.method === 'POST') {
        const { key, data, ttl } = await request.json();
        await env.AI_CACHE.put(`ai:${userId}:${key}`, JSON.stringify(data), { expirationTtl: ttl || 3600 });
        return new Response(JSON.stringify({ stored: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // ═══════════════════════════════════════════
      // AI Chat (with KV caching)
      // ═══════════════════════════════════════════
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        const { messages, model } = await request.json();
        const lastUserMsg = messages[messages.length - 1]?.content || '';
        const cacheKey = `chat:${lastUserMsg.slice(0, 100).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const cached = await env.AI_CACHE.get(cacheKey, 'json');
        if (cached) {
          return new Response(JSON.stringify({ ...cached, cached: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const llmResponse = await fetch('https://everbloom-lyla-proxy.georgelanders2.workers.dev/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model || 'big-pickle', messages }),
        });
        const result = await llmResponse.json();
        if (result.choices?.[0]?.message?.content) {
          await env.AI_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
        }
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          services: { d1: !!env.DB, kv: !!env.AI_CACHE, github: !!env.GITHUB_TOKEN },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
