import { useState, useRef, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { Send, Sparkles, User, Bot, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '../types';

const QUICK_QUESTIONS = [
  'What should I eat?',
  'Create a workout plan',
  'How am I progressing?',
];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getAIResponse(question: string, profile: { name?: string; goal?: string }): string {
  const name = profile.name || 'there';
  const goal = profile.goal || 'maintain';
  const responses: Record<string, string> = {
    'What should I eat?': `Great question, ${name}! Since your goal is to ${goal} weight, I'd recommend focusing on lean proteins (chicken, fish, tofu), plenty of vegetables, and complex carbs. Aim for roughly 2-2.5g protein per kg of body weight. Consider meal prepping to stay consistent!`,
    'Create a workout plan': `Here's a balanced plan for you, ${name}:\n\n🏋️ Mon/Wed/Fri: Strength training (45 min)\n🏃 Tue/Thu: Cardio (30 min)\n🧘 Sat: Yoga/Stretching (30 min)\n\nRest on Sundays. Focus on compound movements like squats, deadlifts, and bench press for maximum efficiency!`,
    'How am I progressing?': `Let me look at your data, ${name}. Based on your logs, you're building a great foundation. Keep tracking your workouts and nutrition consistently — that's the key to seeing results. Every small step counts! 💪`,
  };
  if (responses[question]) return responses[question];
  return `Thanks for asking, ${name}! That's a great question. Based on your ${goal} goal, I'd suggest staying consistent with your current routine and focusing on gradual improvements. Would you like me to elaborate on any specific area?`;
}

export default function AiCoach() {
  const chatMessages = useGlowFitStore((s) => s.chatMessages);
  const addChatMessage = useGlowFitStore((s) => s.addChatMessage);
  const clearChat = useGlowFitStore((s) => s.clearChat);
  const profile = useGlowFitStore((s) => s.profile);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typing]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text.trim(), timestamp: Date.now() };
    addChatMessage(userMsg);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getAIResponse(text.trim(), profile);
      addChatMessage({ id: generateId(), role: 'assistant', content: reply, timestamp: Date.now() });
      setTyping(false);
    }, 1200);
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
            <h1 className="text-lg font-bold text-slate-800">AI Coach</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Powered by GlowFit AI</p>
          </div>
        </div>
        <button onClick={clearChat} className="text-xs text-slate-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg">Clear</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-thin">
        {chatMessages.length === 0 && !typing && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Start a conversation</p>
            <p className="text-slate-400 text-xs">Ask about nutrition, workouts, or your progress</p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-rose-100' : 'bg-slate-100'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-rose-600" /> : <Bot className="w-3.5 h-3.5 text-slate-600" />}
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

        {typing && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-slate-600" /></div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl rounded-bl-sm px-4 py-3 shadow-[var(--shadow-card)]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {chatMessages.length === 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => handleSend(q)} className="flex-shrink-0 text-xs font-medium px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
              {q}
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
          placeholder="Ask your AI coach..."
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
