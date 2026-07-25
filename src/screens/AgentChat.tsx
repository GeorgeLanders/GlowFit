import { useState, useRef, useEffect } from 'react';
import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Send, Bot, Dumbbell, Apple, Moon, Heart, Brain, Zap } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  agentIcon?: React.ReactNode;
  suggestions?: string[];
  timestamp: number;
}

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Workout Plan', icon: <Dumbbell className="w-5 h-5" />, prompt: 'Create a workout plan for me based on my profile', color: 'text-rose-500 bg-rose-50' },
  { title: 'Nutrition Tips', icon: <Apple className="w-5 h-5" />, prompt: 'Give me nutrition tips for my fitness goals', color: 'text-emerald-500 bg-emerald-50' },
  { title: 'Sleep Advice', icon: <Moon className="w-5 h-5" />, prompt: 'How can I improve my sleep quality?', color: 'text-indigo-500 bg-indigo-50' },
  { title: 'Recovery Tips', icon: <Heart className="w-5 h-5" />, prompt: 'What are the best recovery strategies?', color: 'text-pink-500 bg-pink-50' },
  { title: 'Form Check', icon: <Brain className="w-5 h-5" />, prompt: 'How do I improve my exercise form?', color: 'text-violet-500 bg-violet-50' },
  { title: 'Motivation', icon: <Zap className="w-5 h-5" />, prompt: 'Give me motivation to stay on track', color: 'text-amber-500 bg-amber-50' },
];

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'WorkoutAgent': <Dumbbell className="w-4 h-4" />,
  'NutritionAgent': <Apple className="w-4 h-4" />,
  'RecoveryAgent': <Heart className="w-4 h-4" />,
  'MindsetAgent': <Brain className="w-4 h-4" />,
  'GeneralAgent': <Bot className="w-4 h-4" />,
};

function getAgentIcon(name?: string): React.ReactNode {
  if (!name) return <Bot className="w-4 h-4" />;
  return AGENT_ICONS[name] || <Bot className="w-4 h-4" />;
}

function classifyAgent(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.match(/workout|exercise|gym|set|rep|training/)) return 'WorkoutAgent';
  if (lower.match(/food|eat|nutrition|diet|protein|calorie/)) return 'NutritionAgent';
  if (lower.match(/sleep|rest|recovery|sore|stretch/)) return 'RecoveryAgent';
  if (lower.match(/motivat|mindset|mental|confident|stuck/)) return 'MindsetAgent';
  return 'GeneralAgent';
}

const CLOUDFLARE_PROXY = 'https://everbloom-lyla-proxy.georgelanders2.workers.dev';

export default function AgentChat() {
  const popScreen = useGlowFitStore((s) => s.popScreen);
  const profile = useGlowFitStore((s) => s.profile);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const agentName = classifyAgent(text);
    const userMsg: ChatMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const profileContext = profile ? `User profile: Age ${profile.age}, Weight ${profile.currentWeight}kg, Goal: ${profile.goal || 'fitness'}. ` : '';
      const historyContext = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');

      const systemPrompt = `You are GlowFit AI Coach. You have 5 specialized agents: WorkoutAgent (exercise plans), NutritionAgent (diet advice), RecoveryAgent (rest/recovery), MindsetAgent (motivation), GeneralAgent (general fitness). ${profileContext}Current agent: ${agentName}. Be concise, supportive, and actionable. Max 3 sentences per response.`;

      const res = await fetch(`${CLOUDFLARE_PROXY}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'big-pickle',
          messages: [
            { role: 'system', content: systemPrompt },
            ...historyContext ? [{ role: 'user', content: `Conversation so far:\n${historyContext}` }] : [],
            { role: 'user', content: text },
          ],
          max_tokens: 300,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "I'm here to help! Could you rephrase that?";

      const assistantMsg: ChatMsg = {
        role: 'assistant',
        content: reply,
        agentName,
        agentIcon: getAgentIcon(agentName),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that right now. Please try again.",
        agentName: 'GeneralAgent',
        agentIcon: getAgentIcon('GeneralAgent'),
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-rose-500 rounded-2xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <button onClick={popScreen} className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">AI Fitness Coach</h1>
            <p className="text-xs text-white/70">Powered by 5 specialized agents</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Messages / Welcome */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 space-y-3 pb-3">
        {messages.length === 0 ? (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-[var(--shadow-card)] text-center">
              <div className="text-4xl mb-3">🏋️‍♀️</div>
              <h2 className="font-serif text-lg text-rose-900 font-bold mb-1">Your AI Coach</h2>
              <p className="text-sm text-slate-500">Ask me anything about fitness, nutrition, or recovery</p>
            </div>

            {/* Quick Actions */}
            <h3 className="font-medium text-slate-700 px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.prompt)}
                  className={`flex items-center gap-2 p-3 rounded-xl border border-white/40 shadow-sm text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${action.color}`}
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-violet-500 to-rose-500 text-white'
                  : 'bg-white/80 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]'
              }`}>
                {msg.role === 'assistant' && msg.agentName && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">
                    {msg.agentIcon}
                    <span>{msg.agentName}</span>
                  </div>
                )}
                <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)] rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[var(--shadow-card)] px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask your AI coach..."
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-rose-500 text-white disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
