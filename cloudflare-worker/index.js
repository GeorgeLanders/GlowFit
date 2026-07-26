export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS
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
      // R2 Photo Storage
      // ═══════════════════════════════════════════
      if (url.pathname === '/api/photos/upload' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type') || 'progress'; // progress | food
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        
        const key = `${userId}/${type}/${Date.now()}_${file.name}`;
        await env.R2_BUCKET.put(key, file, {
          httpMetadata: { contentType: file.type },
        });
        
        return new Response(JSON.stringify({ key, url: `/api/photos/${key}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname.startsWith('/api/photos/') && request.method === 'GET') {
        const key = decodeURIComponent(url.pathname.replace('/api/photos/', ''));
        const object = await env.R2_BUCKET.get(key);
        if (!object) {
          return new Response('Not found', { status: 404, headers: corsHeaders });
        }
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      }
      
      if (url.pathname === '/api/photos/list' && request.method === 'GET') {
        const type = url.searchParams.get('type') || 'progress';
        const listing = await env.R2_BUCKET.list({ prefix: `${userId}/${type}/` });
        const photos = listing.objects.map(o => ({
          key: o.key,
          url: `/api/photos/${o.key}`,
          size: o.size,
          uploaded: o.uploaded,
        })).sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
        
        return new Response(JSON.stringify(photos), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (url.pathname.startsWith('/api/photos/') && request.method === 'DELETE') {
        const key = decodeURIComponent(url.pathname.replace('/api/photos/', ''));
        await env.R2_BUCKET.delete(key);
        return new Response(JSON.stringify({ deleted: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // ═══════════════════════════════════════════
      // D1 User Data Sync
      // ═══════════════════════════════════════════
      if (url.pathname === '/api/sync/push' && request.method === 'POST') {
        const data = await request.json();
        
        // Upsert each data type
        for (const [type, entries] of Object.entries(data)) {
          if (!Array.isArray(entries)) continue;
          for (const entry of entries) {
            await env.DB.prepare(
              `INSERT OR REPLACE INTO user_data (user_id, type, entry_id, data, updated_at)
               VALUES (?, ?, ?, ?, datetime('now'))`
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
          `SELECT type, entry_id, data, updated_at FROM user_data
           WHERE user_id = ? AND updated_at > ?
           ORDER BY updated_at DESC`
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
        if (!key) {
          return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
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
        
        // Check cache for simple queries
        const lastUserMsg = messages[messages.length - 1]?.content || '';
        const cacheKey = `chat:${lastUserMsg.slice(0, 100).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const cached = await env.AI_CACHE.get(cacheKey, 'json');
        if (cached) {
          return new Response(JSON.stringify({ ...cached, cached: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Forward to LLM proxy
        const llmResponse = await fetch('https://everbloom-lyla-proxy.georgelanders2.workers.dev/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model || 'big-pickle', messages }),
        });
        
        const result = await llmResponse.json();
        
        // Cache non-streaming responses for 1 hour
        if (result.choices?.[0]?.message?.content) {
          await env.AI_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
        }
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', services: { r2: !!env.R2_BUCKET, d1: !!env.DB, kv: !!env.AI_CACHE } }), {
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
