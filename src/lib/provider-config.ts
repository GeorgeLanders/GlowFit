// AI Provider configurations for BYOK (Bring Your Own Key)
// Shared between Everbloom and GlowFit

export const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash-lite'],
    defaultModel: 'gemini-2.0-flash',
    signupUrl: 'https://aistudio.google.com/apikey',
    keyPrefix: 'AIza',
    instructions: 'Go to Google AI Studio and click "Get API key"',
    color: '#4285F4', // Google blue
    icon: '🔵',
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    defaultModel: 'llama-3.3-70b-versatile',
    signupUrl: 'https://console.groq.com/keys',
    keyPrefix: 'gsk_',
    instructions: 'Sign up at console.groq.com and create an API key',
    color: '#F55036', // Groq orange
    icon: '⚡',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.3-70b-instruct', 'openai/gpt-4o-mini'],
    defaultModel: 'google/gemini-2.0-flash-001',
    signupUrl: 'https://openrouter.ai/keys',
    keyPrefix: 'sk-or-',
    instructions: 'Sign in at openrouter.ai and create an API key ($1 free credit)',
    color: '#7C3AED', // Purple
    icon: '🌐',
  },
  together: {
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    models: ['meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    defaultModel: 'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo',
    signupUrl: 'https://api.together.xyz/settings/api-keys',
    keyPrefix: '',
    instructions: 'Sign up at together.ai and create an API key ($1 free credit)',
    color: '#0EA5E9', // Sky blue
    icon: '🤝',
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
  if (apiKey.startsWith('AIza')) return 'gemini';
  if (apiKey.startsWith('gsk_')) return 'groq';
  if (apiKey.startsWith('sk-or-')) return 'openrouter';
  return null;
}

// Get provider config for a given provider key
export function getProviderConfig(provider: ProviderKey) {
  return AI_PROVIDERS[provider];
}
