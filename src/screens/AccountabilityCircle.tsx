import { useGlowFitStore } from '../lib/store';
import { ArrowLeft, Users } from 'lucide-react';

// Accountability Circles is not built yet, so this is an honest placeholder.
//
// What used to be here rendered a convincing UI backed by nothing at all:
// "Join" accepted any non-empty string and then invented "4 members" and a
// "7 day streak", invite codes were Math.random() with no server to redeem them
// against, the Share button had no onClick at all, and the circles themselves
// lived in useState that was discarded on back navigation. No data ever left the
// device, and none of the promised social behaviour happened.
//
// Presenting invented activity as real is a Play Misrepresentation risk, and it
// also tells users their progress is being shared when it is not - which matters
// more than usual for a GLP-1 app. So the fake implementation is gone rather than
// restyled. The real feature needs shared membership on a server; until that
// exists this screen says so plainly. The old implementation is in git history.
export default function AccountabilityCircle() {
  const popScreen = useGlowFitStore((s) => s.popScreen);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={popScreen}
          aria-label="Go back"
          className="card-3d rounded-xl p-2 shadow-[var(--shadow-card)]"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#CE88F7]" />
          <h1 className="text-xl font-serif text-rose-900">Accountability Circles</h1>
        </div>
      </div>

      <div className="card-3d rounded-2xl p-6 shadow-[var(--shadow-card)] text-center">
        <div
          className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#CE88F7] to-[#F569B8] flex items-center justify-center"
          aria-hidden="true"
        >
          <Users className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-rose-900 mb-2">Coming soon</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Circles aren't available yet. When they launch you'll be able to start a circle
          and invite friends with a code.
        </p>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Nothing is shared with anyone in the meantime, and your data stays on your device.
        </p>
      </div>
    </div>
  );
}
