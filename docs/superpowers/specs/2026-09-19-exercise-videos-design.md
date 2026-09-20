# Exercise Demo Videos in ExerciseBrowser — Design

Date: 2026-09-19
Status: Approved (design), pending implementation
Scope: One file — `src/screens/ExerciseBrowser.tsx`. No store, api, routing, or build-config changes.

## Problem

The exercise library (`ExerciseBrowser.tsx`) lists 20 exercises with metadata only
(name, category, muscle, equipment, difficulty). Users get no form demonstration,
so they can't check how an exercise is performed.

## Decision summary

- Source: YouTube embeds (privacy-enhanced domain, no hosting/licensing burden).
- UI: click-to-play video inside the expanded exercise card.
- Video IDs: curated via web search, each link verified before wiring in. The
  `videoId` field is optional, so missing entries degrade gracefully.

Rejected alternatives: `lite-youtube-embed` package (new dependency for laziness
the accordion already provides); extracting the database to `src/data/`
(other screens reference exercise names as strings only — verified by grep —
so extraction has no consumer yet).

## Architecture

Single-file change to `ExerciseBrowser.tsx`:

- **Data**: each entry in the local `exerciseDatabase` gains `videoId?: string`.
- **Component**: a small `ExerciseVideo` sub-component (same file) rendered at the
  top of the expanded panel, above the details rows.

## Data flow / behavior

1. User expands an exercise card (existing single-expand accordion state).
2. If `videoId` exists, the expanded panel shows a **facade**: poster image from
   `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`, rounded 2xl, play-button
   overlay with `aria-label="Play {exercise name} video"`.
3. Tap on the facade swaps it for the iframe
   `https://www.youtube-nocookie.com/embed/{videoId}?autoplay=1&rel=0` with
   `allow="encrypted-media; picture-in-picture"`.
4. Tapping the card header to collapse resets `playing` to null, unmounting the
   iframe.

## Constraints / invariants

- Max one iframe alive at any time (accordion is single-expand, `playing` holds
  at most one id).
- No new npm dependencies. Icons come from `lucide-react` (already used).
- Styling follows the file's existing conventions: Tailwind, `bg-white/70
  backdrop-blur-sm`, `rounded-2xl`, `shadow-[var(--shadow-card)]`.
- Exercises without a `videoId` render exactly as today (details only).

## Error handling

- Offline or a removed/private video → YouTube renders its own error inside the
  iframe; user collapses the card. No app-level crash path.
- Facade image fails to load → broken-image alt text is descriptive
  (`alt="{exercise name} demonstration video"`); the play affordance remains.

## Testing

- `npm run build` (tsc + vite) must pass.
- Rendered review: get-review-rules + check-comprehension + inspect-spacing on
  the modified screen (facade + expanded state).
- Manual smoke test in the running app: expand an exercise with a video, play,
  collapse, expand another.
