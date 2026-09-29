// Intro-phase line field: ~40 evenly spaced horizontal hairlines, all
// displaced by the SAME smooth field (a sum of a few Gaussian bumps) rather
// than each having its own independent path. Because every line samples the
// identical field at a given x, they're exact vertical translates of one
// another there — lines can never cross, by construction, not by tuning.
// This reads as one bending surface (a vol-surface cross-section) instead
// of a tangle of independent paths.
//
// Stroke width and opacity vary per line (seeded, not the shared field, so
// this can't affect the no-crossing guarantee — it's a pure render-style
// tweak) for a slightly hand-varied feel instead of perfectly uniform lines.
//
// Draw-in (stroke-dashoffset) is a normal/time animation on load. The idle
// drift is also time-based: two field "phases" are baked into each line's
// own @keyframes as two `d` values with matching path structure, so the
// browser interpolates the shape smoothly (CSS path morphing) — no JS, no
// per-frame recomputation. The fade-out-on-scroll lives on the wrapping
// .intro-layer element in globals.css. Server-rendered, no hydration risk.
//
// This is the approved fallback intro (?intro=ripple, and the default).

const W = 1440;
const H = 900;
const LINE_COUNT = 40;
const SAMPLES = 20;
const DRAW_DURATION = 1;
const DRAW_STAGGER = 0.5; // last line finishes at DRAW_DURATION + DRAW_STAGGER ≈ 1.5s
const DRIFT_DELAY = 1.6;
const DRIFT_DURATION = 26;

function seeded(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Bump = { center: number; width: number; amp: number };

const bumpsA: Bump[] = [
  { center: 0.20 * W, width: 220, amp: 34 },
  { center: 0.55 * W, width: 300, amp: -26 },
  { center: 0.85 * W, width: 180, amp: 20 },
];
const bumpsB: Bump[] = [
  { center: 0.32 * W, width: 240, amp: 30 },
  { center: 0.45 * W, width: 280, amp: -32 },
  { center: 0.75 * W, width: 200, amp: 26 },
];

function field(x: number, bumps: Bump[]) {
  return bumps.reduce((sum, b) => {
    const dx = x - b.center;
    return sum + b.amp * Math.exp(-(dx * dx) / (2 * b.width * b.width));
  }, 0);
}

function smoothPath(points: [number, number][]) {
  let d = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    d += ` Q ${x0.toFixed(1)},${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)},${((y0 + y1) / 2).toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0].toFixed(1)},${last[1].toFixed(1)}`;
  return d;
}

function buildPath(baselineY: number, bumps: Bump[]) {
  const points: [number, number][] = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const x = (i / SAMPLES) * W;
    return [x, baselineY + field(x, bumps)];
  });
  return smoothPath(points);
}

const lines = Array.from({ length: LINE_COUNT }, (_, i) => {
  const baselineY = ((i + 0.5) / LINE_COUNT) * H;
  return {
    i,
    dA: buildPath(baselineY, bumpsA),
    dB: buildPath(baselineY, bumpsB),
    delay: (i / LINE_COUNT) * DRAW_STAGGER,
    strokeWidth: 1.4 + seeded(i * 7 + 900) * 1.0, // 1.4–2.4
    strokeOpacity: 0.45 + seeded(i * 7 + 901) * 0.35, // 0.45–0.80
  };
});

const styleText = lines
  .map(
    (l) => `
@keyframes line-drift-${l.i} {
  0%   { d: path("${l.dA}"); }
  100% { d: path("${l.dB}"); }
}
.line-${l.i} {
  animation: path-draw-in ${DRAW_DURATION}s cubic-bezier(0.16,1,0.3,1) both ${l.delay.toFixed(3)}s,
             line-drift-${l.i} ${DRIFT_DURATION}s ease-in-out infinite alternate ${DRIFT_DELAY}s;
}`
  )
  .join("\n");

// Soft elliptical fade where the "on the line" name treatment (page.tsx,
// name=2) sits: left-aligned text starting at the 7vw page margin, vertically
// centered. Lines fade out approaching it and back in past it, rather than
// being cut by a hard-edged box — feathered via the gradient's own stops,
// not a mask on top of an opaque background.
const NAME_FADE_MASK =
  "radial-gradient(ellipse 26% 16% at 24% 50%, transparent 0%, transparent 45%, black 100%)";

// Vertical padding on the viewBox, not on the line data — the field's bumps
// can push a line's y past 0 or H at the extremes (e.g. the topmost line
// sitting near a negative-amplitude bump), and the SVG's default
// overflow:hidden clips anything outside the viewBox. Padding the box
// instead of shrinking the field keeps the full range of motion intact.
const V_PAD = 50;

export default function IntroRipple({ fadeMask = false }: { fadeMask?: boolean }) {
  return (
    <svg
      className="intro-layer absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 ${-V_PAD} ${W} ${H + V_PAD * 2}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={
        fadeMask
          ? { maskImage: NAME_FADE_MASK, WebkitMaskImage: NAME_FADE_MASK }
          : undefined
      }
    >
      <style>{styleText}</style>
      <g stroke="#999999" fill="none">
        {lines.map((l) => (
          <path
            key={l.i}
            className={`line-${l.i}`}
            d={l.dA}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            strokeWidth={l.strokeWidth}
            strokeOpacity={l.strokeOpacity}
          />
        ))}
      </g>
    </svg>
  );
}
