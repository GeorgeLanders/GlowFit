// AI Provider configurations for BYOK (Bring Your Own Key)
// Shared between Everbloom and GlowFit

export const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    // Updated 2026-09-21: gemini-2.0-* was shut down June 2026 and the
    // 2.5-flash-preview-05-20 preview is long gone. Tap "Refresh model list"
    // in AI Settings for the authoritative live list from Google.
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
    defaultModel: 'gemini-2.5-flash',
    signupUrl: 'https://aistudio.google.com/apikey',
    keyPrefix: 'AIza',  // legacy format; newer keys start with 'AQ.'
    instructions: 'Go to Google AI Studio and click "Get API key"',
    color: '#4285F4', // Google blue
    icon: '🔵',
  },
  nvidia: {
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    // 2026-09-22: NVIDIA NIM provides OpenAI-compatible inference.
    // Tap "Refresh model list" for the live catalog from NVIDIA.
    models: ['meta/llama-3.3-70b-instruct', 'meta/llama-3.1-8b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'],
    defaultModel: 'meta/llama-3.3-70b-instruct',
    signupUrl: 'https://build.nvidia.com/',
    keyPrefix: 'nvapi-',
    instructions: 'Go to build.nvidia.com, sign in, and generate an API key',
    color: '#76B900', // NVIDIA green
    icon: '🟢',
  },
  kilo: {
    name: 'Kilo Gateway',
    baseUrl: 'https://api.kilo.ai/api/gateway',
    // 2026-09-21: Kilo is an OpenAI-compatible gateway to hundreds of models
    // with one account key. Tap "Refresh model list" to see everything your
    // plan enables (the free tier ships a working default set).
    models: ['moonshotai/kimi-k2.5', 'anthropic/claude-sonnet-4.5', 'openai/gpt-5-mini'],
    defaultModel: 'moonshotai/kimi-k2.5',
    signupUrl: 'https://kilo.ai/docs/gateway/authentication',
    keyPrefix: '',
    instructions: 'Create an account at kilo.ai, then copy your API key from the dashboard',
    color: '#E11D48', // Kilo crimson
    icon: '⚡',
  },
  custom: {
    name: 'Custom Endpoint',
    baseUrl: '',
    models: [],
    defaultModel: '',
    signupUrl: '',
    keyPrefix: '',
    instructions: 'Enter your OpenAI-compatible API endpoint URL',
    color: '#6B7280', // Gray
    icon: '⚙️',
  },
} as const;

export type ProviderKey = keyof typeof AI_PROVIDERS;

export interface AIProviderConfig {
  mode: 'app-default' | 'bring-your-own-key';
  provider: ProviderKey;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  mode: 'app-default',
  provider: 'gemini',
  apiKey: '',
  baseUrl: AI_PROVIDERS.gemini.baseUrl,
  model: AI_PROVIDERS.gemini.defaultModel,
};

// Auto-detect provider from API key prefix
export function detectProvider(apiKey: string): ProviderKey | null {
  // Gemini: legacy 'AIza...' keys AND Google's newer 'AQ....' format.
  if (apiKey.startsWith('AIza') || apiKey.startsWith('AQ.')) return 'gemini';
  if (apiKey.startsWith('nvapi-')) return 'nvidia';
  return null;
}

// Get provider config for a given provider key
export function getProviderConfig(provider: ProviderKey) {
  return AI_PROVIDERS[provider];
}

// ─── Live model list (authoritative) ────────────────────────────────────────
// Hard-coded model lists go stale: providers retire models without warning
// (Groq retired llama-3.3-70b-versatile on 2026-08-16; Google shut down
// gemini-2.0-flash in 2026-06). Asking the provider what it currently serves
// is the only durable fix, so the app exposes a "Refresh model list" action.

/** Models that are not chat models - never offer these as chat choices. */
const NON_CHAT_HINTS = [
  'embedding', 'embed', 'aqa', 'tts', 'whisper', 'audio',
  'image', 'imagen', 'veo', 'vision-only', 'guard', 'moderation',
];

/**
 * Fetch the models the given endpoint currently serves.
 * Works on any OpenAI-compatible /models endpoint (Gemini, Groq, OpenRouter,
 * Together). Throws with the provider's own message so the UI can show why.
 */
export async function fetchProviderModels(baseUrl: string, apiKey: string): Promise<string[]> {
  if (!baseUrl) throw new Error('No endpoint URL set for this provider.');
  if (!apiKey) throw new Error('Enter your API key first.');

  const url = `${baseUrl.replace(/\/+$/, '')}/models`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (err) {
    throw new Error(
      `Could not reach the provider (${err instanceof Error ? err.message : 'network error'}). Check your connection.`
    );
  }

  const raw = await response.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* fall through to the generic error below */
  }

  if (!response.ok) {
    const detail =
      parsed?.error?.message || parsed?.error || raw.slice(0, 200) || 'no detail';
    // 401/403 is a key problem, not a model problem - say so plainly.
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Your API key was rejected (HTTP ${response.status}). Check the key was copied in full and hasn't been revoked or expired.`
      );
    }
    throw new Error(`HTTP ${response.status}: ${detail}`);
  }

  const ids: string[] = (parsed?.data ?? [])
    .map((m: any) => (typeof m?.id === 'string' ? m.id : m?.name))
    .filter((id: unknown): id is string => typeof id === 'string')
    // Gemini's OpenAI-compat layer prefixes ids with "models/".
    .map((id: string) => id.replace(/^models\//, ''));

  const chatModels = ids
    .filter((id) => !NON_CHAT_HINTS.some((hint) => id.toLowerCase().includes(hint)))
    .sort();

  if (chatModels.length === 0) {
    throw new Error('The provider returned no usable chat models for this key.');
  }
  return chatModels;
}

