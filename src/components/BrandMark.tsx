// GlowFit's brand mark, rendered straight from src/assets/icon.svg.
//
// That one file also feeds the launcher icon, the PWA favicon, the Android
// splash and the store-listing art (see generate-*.cjs), so importing it here
// keeps a single source of truth. Pasting a second copy of the artwork into a
// component is what let the splash keep rendering the retired lotus for days
// after the logo had already been replaced.
//
// The SVG draws its own rounded tile with transparent corners, so callers only
// need to supply a size — no CSS border-radius is required.
import iconUrl from '../assets/icon.svg';

export function BrandMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`${className} shrink-0 select-none`}
    />
  );
}
