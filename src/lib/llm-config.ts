// Shared LLM configuration — used by AiCoach, AiInsights, AiPlanner, AgentChat

const IS_NATIVE = typeof (window as any)?.Capacitor !== 'undefined' &&
  (window as any).Capacitor?.getPlatform?.() !== 'web';

export const LLM_BASE_URL = (import.meta as any).env?.VITE_LLM_BASE_URL || 'https://everbloom-lyla-proxy.georgelanders2.workers.dev';
export const LLM_MODEL = (import.meta as any).env?.VITE_LLM_MODEL || 'deepseek-v4-flash-free';
export const OLLAMA_URL = IS_NATIVE ? '' : ((import.meta as any).env?.VITE_OLLAMA_URL || '');
export const OLLAMA_MODEL = (import.meta as any).env?.VITE_OLLAMA_MODEL || 'smollm2:latest';
export const JARVIS_URL = IS_NATIVE ? '' : ((import.meta as any).env?.VITE_JARVIS_URL || 'http://127.0.0.1:8000');
export const JARVIS_MODEL = (import.meta as any).env?.VITE_JARVIS_MODEL || 'nous-hermes2:latest';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionOptions {
  max_tokens?: number;
  aiConfig?: {
    mode: 'app-default' | 'bring-your-own-key';
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
  };
}

/**
 * Try multiple providers in order:
 * 1. If user has BYOK configured → use their provider directly
 * 2. Cloudflare Proxy → OpenJarvis → Ollama
 * Returns the first successful response content string.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const maxTokens = options.max_tokens || 500;
  const aiConfig = options.aiConfig;

  // If user has BYOK configured, use their provider directly
  if (aiConfig?.mode === 'bring-your-own-key' && aiConfig.apiKey) {
    try {
      const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({ model: aiConfig.model, messages, max_tokens: maxTokens }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch { /* user provider failed, fall through to defaults */ }
  }

  // Provider 1: Cloudflare Worker proxy (cloud)
  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: maxTokens }),
    });
    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    }
  } catch { /* proxy down, try next */ }

  // Provider 2: OpenJarvis (local, fast — nous-hermes2)
  if (JARVIS_URL) {
    try {
      const response = await fetch(`${JARVIS_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: JARVIS_MODEL, messages, max_tokens: maxTokens }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch { /* jarvis down, try next */ }
  }

  // Provider 3: Ollama direct (local, fallback — smollm2)
  if (OLLAMA_URL) {
    try {
      const response = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OLLAMA_MODEL, messages, max_tokens: maxTokens }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch { /* ollama down */ }
  }

  throw new Error('All LLM providers failed');
}
