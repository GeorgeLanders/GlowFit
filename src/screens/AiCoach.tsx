import { useState, useRef, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Send, Sparkles, User, MessageSquare, Trash2 } from 'lucide-react';
import type { ChatMessage } from '../types';

const LLM_BASE_URL = (import.meta as any).env?.VITE_LLM_BASE_URL || 'https://everbloom-lyla-proxy.georgelanders2.workers.dev';
const LLM_MODEL = ((import.meta as any).env?.VITE_LLM_MODEL || 'big-pickle').toLowerCase().replace(/\s+/g, '-');

const QUICK_ACTIONS = [
  { label: 'How am I doing?', prompt: 'Based on my recent data, how am I doing with my fitness goals?' },
  { label: 'Workout suggestion', prompt: 'Give me a workout suggestion for today based on my recent activity.' },
  { label: 'Meal ideas', prompt: 'Suggest some meal ideas that fit my calorie and macro targets.' },
  { label: 'GLP-1 tips', prompt: 'Give me tips for managing side effects and maximizing results on GLP-1 medication.' },
];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildSystemPrompt(profile: any, recentWorkouts: any[], recentCalories: any[], recentWeight: any[], glp1Logs: any[]) {
  const lines = [
    'You are Coach Glow, a supportive and knowledgeable AI fitness coach.',
    'You are warm, encouraging, and give practical, actionable advice.',
    'Keep responses concise (2-4 paragraphs max) unless the user asks for detail.',
    'Use emojis sparingly to keep the tone friendly.',
    '',
    '## User Profile',
    `- Name: ${profile.name || 'User'}`,
    `- Age: ${profile.age || 'not set'}`,
    `- Gender: ${profile.gender || 'not set'}`,
    `- Height: ${profile.height || 'not set'} cm`,
    `- Current weight: ${profile.currentWeight || 'not set'} kg`,
    `- Goal weight: ${profile.goalWeight || 'not set'} kg`,
    `- Goal: ${profile.goal || 'maintain'}`,
    `- Activity level: ${profile.activityLevel || 'moderate'}`,
    `- GLP-1 user: ${profile.glp1User ? 'Yes' : 'No'}`,
  ];

  if (recentWorkouts.length > 0) {
    lines.push('', '## Recent Workouts');
    recentWorkouts.slice(0, 5).forEach(w => {
      lines.push(`- ${w.date}: ${w.name} (${w.type}, ${w.duration}min, ${w.caloriesBurned}cal)`);
    });
  }

  if (recentCalories.length > 0) {
    const totalCal = recentCalories.reduce((s, l) => s + l.food.calories * l.quantity, 0);
    lines.push('', `## Today's Nutrition: ${totalCal} calories logged`);
  }

  if (recentWeight.length > 0) {
    lines.push('', `## Weight: ${recentWeight[0]?.weight} kg (latest)`);
    if (recentWeight.length > 1) {
      const diff = recentWeight[0]?.weight - recentWeight[recentWeight.length - 1]?.weight;
      lines.push(`- Trend: ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg over ${recentWeight.length} entries`);
    }
  }

  if (glp1Logs.length > 0) {
    const latest = glp1Logs[0];
    lines.push('', `## GLP-1: Latest dose ${latest.dosage}mg ${latest.medication} on ${latest.date}`);
    lines.push(`- Appetite: ${latest.appetite}/5, Nausea: ${latest.nausea}/5`);
  }

  return lines.join('\n');
}

export function AiCoach() {
  const chatMessages = useGlowFitStore((s) => s.chatMessages);
  const addChatMessage = useGlowFitStore((s) => s.addChatMessage);
  const clearChat = useGlowFitStore((s) => s.clearChat);
  const profile = useGlowFitStore((s) => s.profile);
  const workouts = useGlowFitStore((s) => s.workouts);
  const calorieLogs = useGlowFitStore((s) => s.calorieLogs);
  const weightLogs = useGlowFitStore((s) => s.weightLogs);
  const glp1Logs = useGlowFitStore((s) => s.glp1Logs);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typing, streaming]);

  const handleSend = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setInput('');
    setTyping(true);
    setStreaming('');

    const systemPrompt = buildSystemPrompt(profile, workouts, calorieLogs, weightLogs, glp1Logs);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text.trim() },
    ];

    try {
      abortRef.current = new AbortController();
      const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages,
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                full += delta;
                setStreaming(full);
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: full || 'Sorry, I could not generate a response. Please try again.',
        timestamp: Date.now(),
      };
      addChatMessage(assistantMsg);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: 'Oops! I had trouble connecting. Please check your connection and try again.',
          timestamp: Date.now(),
        };
        addChatMessage(errorMsg);
      }
    } finally {
      setTyping(false);
      setStreaming('');
      abortRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Coach Glow</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">AI Fitness Coach</p>
          </div>
        </div>
        <button
          onClick={() => { abortRef.current?.abort(); clearChat(); }}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-thin">
        {chatMessages.length === 0 && !typing && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Hi there! I'm Coach Glow ✨</p>
            <p className="text-slate-400 text-xs">Ask me about nutrition, workouts, or your GLP-1 journey</p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-rose-100' : 'bg-slate-100'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-rose-600" /> : <Sparkles className="w-3.5 h-3.5 text-rose-500" />}
              </div>
              <div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-rose-500 text-white rounded-br-sm'
                    : 'bg-white/70 backdrop-blur-sm border border-white/40 text-slate-700 shadow-[var(--shadow-card)] rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] text-slate-300 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {typing && streaming && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-[var(--shadow-card)]">
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{streaming}</p>
                <span className="inline-block w-1.5 h-4 bg-rose-400 animate-pulse ml-0.5 rounded-sm" />
              </div>
            </div>
          </div>
        )}

        {typing && !streaming && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl rounded-bl-sm px-4 py-3 shadow-[var(--shadow-card)]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {chatMessages.length === 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => handleSend(a.prompt)}
              className="text-left text-xs font-medium px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[var(--shadow-card)] flex items-center gap-2 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
          placeholder="Ask Coach Glow..."
          className="flex-1 text-sm text-slate-700 placeholder-slate-400 bg-transparent px-3 py-2 outline-none"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || typing}
          className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center disabled:opacity-40 hover:bg-rose-600 transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
