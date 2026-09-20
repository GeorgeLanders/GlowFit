const PROXY_URL = 'https://everbloom-lyla-proxy.georgelanders2.workers.dev';
const OLLAMA_URL = (import.meta as any).env?.VITE_OLLAMA_URL || '';
const OLLAMA_MODEL = (import.meta as any).env?.VITE_OLLAMA_MODEL || 'smollm2:latest';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are GlowFit AI Coach, a supportive fitness and wellness assistant. You help users with:
- Workout planning and form tips
- Nutrition advice and meal planning
- Progress analysis and motivation
- Mental wellness and recovery
- Sleep optimization
- GLP-1 medication guidance (general, not medical advice)

Be warm, encouraging, and evidence-based. Keep responses concise (2-4 sentences max unless asked for detail).
Always remind users you're not a medical professional for health-related questions.

Current user context will be provided in the conversation.`;

export async function getAIResponse(
  messages: ChatMessage[],
  userContext?: string
): Promise<string> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: SYSTEM_PROMPT + (userContext ? `\n\nUser context: ${userContext}` : ''),
  };

  const payload = {
    messages: [systemMessage, ...messages],
    model: 'ling-3.0-flash-free',
    max_tokens: 500,
  };

  // Try cloud proxy first
  try {
    const response = await fetch(`${PROXY_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    if (data.error) throw new Error(data.error?.message || 'Proxy error');
  } catch (proxyErr) {
    console.warn('[AiCoach] Cloud proxy failed, trying Ollama:', proxyErr);
  }

  // Fallback to local Ollama
  if (OLLAMA_URL) {
    try {
      const ollamaPayload = { ...payload, model: OLLAMA_MODEL };
      const ollamaResponse = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ollamaPayload),
      });
      const data = await ollamaResponse.json();
      return data.choices?.[0]?.message?.content
        || 'I could not generate a response. Please try again.';
    } catch (ollamaErr) {
      console.error('[AiCoach] Ollama also failed:', ollamaErr);
    }
  }

  return 'I am having trouble connecting right now. Please try again in a moment.';
}

export function analyzeProgress(data: {
  workouts: number[];
  weight: number[];
  mood: number[];
  sleep: number[];
}): string[] {
  const insights: string[] = [];

  if (data.workouts.length >= 3) {
    const recent = data.workouts.slice(-3);
    const trend = recent[2] - recent[0];
    if (trend > 0) insights.push('Your workout frequency is increasing — great progress!');
    if (trend < 0) insights.push('Workout frequency dipped recently. A short walk counts!');
  }

  if (data.weight.length >= 2) {
    const diff = data.weight[data.weight.length - 1] - data.weight[0];
    if (Math.abs(diff) > 0.5) {
      insights.push(diff < 0
        ? 'Weight trending down — consistent effort is paying off!'
        : 'Weight fluctuation is normal. Focus on how you feel.');
    }
  }

  if (data.mood.length >= 3) {
    const avg = data.mood.reduce((a, b) => a + b, 0) / data.mood.length;
    if (avg >= 4) insights.push('Your mood has been consistently positive — keep it up!');
    if (avg <= 2) insights.push('Mood has been low lately. Consider a short outdoor walk.');
  }

  if (data.sleep.length >= 3) {
    const avg = data.sleep.reduce((a, b) => a + b, 0) / data.sleep.length;
    if (avg < 6) insights.push('Sleep averaging under 6 hours. Even 20 extra minutes helps.');
    if (avg >= 7) insights.push('Great sleep habits! This supports all your other goals.');
  }

  if (insights.length === 0) {
    insights.push('Log a few more days of data and I will have personalized insights for you!');
  }

  return insights;
}
