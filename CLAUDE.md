## Design brief
Audience: quant recruiters and researchers. Tone: research notebook, not startup landing page.
References: [site] for [specific feature]; [site] for [specific feature].
Principle: figures are the content. Every project page leads with a real chart, not a description.

## Never
- Inter/Roboto/Arial, purple-blue gradients, glassmorphism, gradient blobs
- Three-card feature grids, centered-everything layouts, "Hi, I'm Rowan 👋" heroes
- Emoji or generic icon-library icons as decoration
- rounded-2xl on everything, pill badges, animated stat counters
- Dark mode with neon accents as the default

## Always
- Left-aligned text, a real type scale, max ~70ch line length
- Numbers in tabular/monospace figures
- Charts: labeled axes, no chartjunk, one accent color
- Nested section numbers (`1`, `1.1`, `1.2`) only where content is a genuine
  hierarchical outline — e.g. subsections within one project page. Never use
  numbers as decorative badges on a list that isn't actually a sequence
  (this is why homepage categories don't get 01–04 treatment).
- One motion moment per page: the hero reveal on load. No scroll-triggered
  fade-ins scattered per row/card — if a section needs to arrive on scroll,
  that's the exception being spent, not the default.
- If content ever needs a category taxonomy (project tags, a future writing
  index), each category gets one fixed, consistent color and a sharp
  (not pill) shape. It's a functional label, not decoration — reuse the
  accent-red sparingly; taxonomy colors are separate from the one editorial
  accent.

## Index pattern (for any future list of many items — writing, research)
Rather than a card grid, use a plain row: date/version in a left column,
tag(s), a one-line description, hairline rule between rows. This is the
shape for a "Research" section once it has real content, or a project's own
changelog/version history — not a grid of identical boxes.

## Never (additions)
- Decorative sequence numbers on a non-sequential list
- Per-row/per-card scroll-triggered fades as the default reveal pattern

## Homepage intro
`app/(site)/IntroRipple.tsx` is the approved fallback intro (the shared-field
line ripple) — it's the default and what ships absent a `?intro=` override.
Don't modify it when iterating on new intro concepts; build those in a new
file instead (e.g. `IntroLeWitt.tsx`) and switch via `?intro=<name>`, so
there's always a known-good state to fall back to.