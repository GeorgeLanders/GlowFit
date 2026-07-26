// Shared LLM configuration — used by AiCoach, AiInsights, AiPlanner
export const LLM_BASE_URL = (import.meta as any).env?.VITE_LLM_BASE_URL || 'https://everbloom-lyla-proxy.georgelanders2.workers.dev';
export const LLM_MODEL = ((import.meta as any).env?.VITE_LLM_MODEL || 'big-pickle').toLowerCase().replace(/\s+/g, '-');
