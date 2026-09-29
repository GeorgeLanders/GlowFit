import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Shield } from 'lucide-react';

const sections = [
  { title: 'Last Updated', content: 'September 28, 2026' },
  { title: 'Who This App Is For', content: 'GlowFit is intended for adults aged 18 and over and is not directed to children. We do not knowingly collect information from anyone under 18.' },
  { title: 'Introduction', content: 'GlowFit ("we", "our", or "us") is committed to protecting your privacy. This policy explains what the app stores, what it sends off your device, and the choices you have.\n\nIt replaces the policy dated July 14, 2026, which stated that no data left your device. That is no longer accurate: photo storage and the AI features both transmit data, as described below.' },
  { title: 'What Stays On Your Device', content: 'GlowFit is local-first. Your weight logs, meal and calorie records, workout history, water intake, sleep entries, mood and wellness check-ins, GLP-1 dose logs, and profile details are stored only on your device.\n\nWe do not upload this information to our servers. It is also excluded from Android cloud backup and device-to-device transfer, so it does not leave your phone through a backup either.' },
  { title: 'What Leaves Your Device', content: 'Two features send data off your device.\n\n1. Photos. When you save a progress photo or a food photo, the image is uploaded to our storage service (Cloudflare R2) so the app can display it. Each upload is stored under a random identifier generated for your installation, and remains there until you delete it.\n\n2. AI features. When you use the AI Coach, AI Planner, or AI Insights, the text you enter is sent to an AI service, together with context that can include your age, height, weight, goal weight, gender, BMI, activity level, diet, and summaries of your recent workouts, water, calories, sleep, and weight entries. If you have configured your own API key, these requests go directly to the provider you selected (for example Google Gemini, NVIDIA, or Kilo) under their privacy policy. Otherwise they pass through our proxy to a configured AI provider.' },
  { title: 'Third-Party Services', content: 'AI processing: Google Gemini, NVIDIA NIM, or Kilo Gateway, depending on the provider configured.\n\nEmbedded videos: exercise demonstration videos are embedded from YouTube using youtube-nocookie.com. When a video or thumbnail loads, Google receives that request and any playback information, under the Google privacy policy. We do not control what Google collects.' },
  { title: 'Third-Party Data Sharing', content: 'We do not sell your personal information, and we do not share it with advertisers.\n\nData reaches third parties in only the two cases described above: the AI provider configured receives the prompt needed to answer you, and Google receives requests for embedded videos. Photos are stored on our own infrastructure and are not shared with anyone. We may disclose information where required by law.' },
  { title: 'Health Connect', content: 'If you connect Health Connect, GlowFit requests read-only access to steps, heart rate, and sleep. That data is summarized inside the app and stored only on your device; we do not upload it to our servers. You can revoke access at any time in the Health Connect settings on your device, or from the Health Sync section of GlowFit Settings.' },
  { title: 'What We Do Not Collect', content: 'No advertising or ad-network SDKs, and no advertising identifiers.\nNo analytics or crash-reporting SDKs are enabled in this build.\nNo location, contacts, calendar, or microphone access.\nNo account, email address, or password - the app has no sign-in.' },
  { title: 'Keeping Your Data Safe', content: 'Data sent off your device is transmitted over HTTPS/TLS. Server-side photos are stored under a random per-install identifier rather than your name or email.\n\nNote that this identifier is a device scope, not authentication. Reinstalling the app generates a new identifier, so photos uploaded by an earlier installation can no longer be reached from the app.' },
  { title: 'Export & Deletion', content: 'Export: you can export all of your data at any time from Settings, using Export Data, as JSON or CSV.\n\nDelete: Delete All Data in Settings removes everything stored on your device and also deletes your uploaded photos from our servers. This cannot be undone.\n\nIf a deletion cannot be completed - for example while offline - the app will tell you, and you can email glowfit.app@gmail.com to request manual removal. We respond to deletion requests within 30 days.\n\nDeleting app data does not remove information already held by third parties such as your AI provider or Google; please refer to their privacy policies and account settings.' },
  { title: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time. Material changes will be posted in the app together with a new Last Updated date, and continued use of the app after an update means you accept the revised policy.' },
  { title: 'Contact Us', content: 'Questions about this policy or how your data is handled: glowfit.app@gmail.com' },
];

export default function PrivacyPolicy() {
  const popScreen = useGlowFitStore((s) => s.popScreen);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={popScreen} aria-label="Go back" className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-serif text-rose-900">Privacy Policy</h1>
        </div>
      </div>

      <div className="card-3d rounded-2xl shadow-[var(--shadow-card)] p-5 space-y-5">
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
