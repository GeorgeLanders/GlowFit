import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Shield } from 'lucide-react';

const sections = [
  { title: 'Last Updated', content: 'July 14, 2026' },
  { title: 'Introduction', content: 'GlowFit ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.' },
  { title: 'Data We Collect', content: 'GlowFit is a local-first application. All your personal data — including weight logs, meal records, workout history, sleep data, wellness entries, and profile information — is stored exclusively on your device using local database storage.\n\nWe do NOT collect, transmit, or store any personal data on external servers.' },
  { title: 'AI Features', content: 'GlowFit uses AI to provide personalized coaching, meal suggestions, and workout recommendations. When you use these features, your input (e.g., meal names, workout preferences, health goals) is sent to an AI API for processing.\n\nWe do not store or have access to your AI conversation history beyond what is kept locally on your device.' },
  { title: 'Data Sharing', content: 'We do NOT sell, trade, or share your personal information with third parties. Your data remains on your device unless you explicitly choose to export it.' },
  { title: 'Data Export & Deletion', content: 'You can export all your data at any time via the Settings screen. You can also permanently delete all your data from the device at any time. Upon deletion, all data is irrecoverably removed from local storage.' },
  { title: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the app.' },
];

export default function PrivacyPolicy() {
  const popScreen = useGlowFitStore((s) => s.popScreen);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-serif text-rose-900">Privacy Policy</h1>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[var(--shadow-card)] p-5 space-y-5">
        {sections.map((section, i) => (
          <div key={i}>
            <h3 className="font-semibold text-slate-800 mb-1">{section.title}</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
