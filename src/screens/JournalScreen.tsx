import { useState } from 'react';
import { useGlowFitStore } from '../lib/store';
import { BookOpen, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const PROMPTS = [
  'How are you feeling today?',
  'What went well in your workout?',
  'What challenged you today?',
  'What are you grateful for?',
  'Any insights about your nutrition?',
  'How is your energy level?',
];

export default function JournalScreen() {
  const { journalEntries, addJournalEntry } = useGlowFitStore();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const save = () => {
    if (!content.trim()) return;
    addJournalEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0] ?? '',
      content: content.trim(),
      mood,
      tags: [],
    });
    setContent('');
    setMood(3);
    setShowForm(false);
  };

  const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-rose-900">Journal</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          aria-label="Action"
          className="flex items-center gap-1.5 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Write'}
        </button>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)] space-y-4">
          <p className="text-xs text-slate-400 italic">"{randomPrompt}"</p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts..."
            rows={5}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
          />

          <div>
            <label className="text-xs text-slate-500 mb-2 block">Mood</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m as 1 | 2 | 3 | 4 | 5)}
                  aria-label="Action"
                  className={`text-2xl transition-all ${mood === m ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}
                >
                  {m === 1 ? '😔' : m === 2 ? '😐' : m === 3 ? '🙂' : m === 4 ? '😊' : '🤩'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={save}
            aria-label="Action"
            className="w-full bg-rose-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 active:scale-[0.98] transition-all"
          >
            Save Entry
          </button>
        </div>
      )}

      {/* Entries */}
      {journalEntries.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-card)] text-center">
          <BookOpen className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No journal entries yet</p>
          <p className="text-xs text-slate-400 mt-1">Start writing to track your thoughts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journalEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 p-4 shadow-[var(--shadow-card)]">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  aria-label="Action"
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {entry.mood === 1 ? '😔' : entry.mood === 2 ? '😐' : entry.mood === 3 ? '🙂' : entry.mood === 4 ? '😊' : '🤩'}
                      </span>
                      <div>
                        <p className="text-xs text-slate-400">{entry.date}</p>
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{entry.content}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{entry.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
