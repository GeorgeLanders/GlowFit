import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, FileText } from 'lucide-react';

const sections = [
  { title: 'Last Updated', content: 'July 14, 2026' },
  { title: 'Acceptance of Terms', content: 'By downloading, installing, or using GlowFit ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.' },
  { title: 'Description of Service', content: 'GlowFit is a wellness and fitness application that provides AI-powered coaching, meal suggestions, workout recommendations, mood tracking, and progress monitoring. The App is designed to support your personal wellness journey.' },
  { title: 'User Responsibilities', content: 'You are responsible for maintaining the confidentiality of your device and any data stored within the App. You agree to use the App only for lawful purposes.\n\nGlowFit is not a medical device and does not provide medical advice. Always consult a healthcare professional before starting any fitness or nutrition program.' },
  { title: 'AI-Generated Content', content: 'GlowFit uses artificial intelligence to generate personalized recommendations, coaching messages, meal suggestions, and workout plans. These are suggestions only and should not be considered professional medical or nutritional advice.\n\nAI-generated content may occasionally be inaccurate or incomplete. You should use your own judgment and consult professionals as needed.' },
  { title: 'Data Ownership', content: 'All data you enter into GlowFit belongs to you. The App stores data locally on your device. You may export or delete your data at any time through the Settings screen.' },
  { title: 'Limitation of Liability', content: 'To the maximum extent permitted by law, GlowFit shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the App.' },
  { title: 'Contact', content: 'If you have questions about these Terms, please contact us through the app or at our support email.' },
];

export default function TermsOfService() {
  const popScreen = useGlowFitStore((s) => s.popScreen);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-[var(--shadow-card)]">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          <h1 className="text-xl font-serif text-rose-900">Terms of Service</h1>
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
