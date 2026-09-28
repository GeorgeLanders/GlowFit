import { BrandMark } from './BrandMark';

// App-wide brand bar for the main tab view. That view previously rendered no
// header at all, so the logo existed only on the launcher icon and the splash
// and vanished the moment the app opened. Sits above the screen content on
// every main tab, matching the back-header on sub-screens.
export function BrandHeader() {
  return (
    <header className="flex items-center gap-3 mb-5">
      <BrandMark className="w-9 h-9" />
      <span className="text-lg font-serif text-iridescent">GlowFit</span>
    </header>
  );
}
