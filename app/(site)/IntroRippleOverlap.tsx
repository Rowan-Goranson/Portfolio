// Variant of IntroRipple.tsx (kept as a separate file per the project's own
// rule: don't edit the approved fallback in place, build new intro concepts
// alongside it so there's always a known-good state to return to).
//
// IntroRipple's lines all sample the exact same shared field, so they're
// vertical translates of one another and can never cross — a deliberate
// choice documented there. This variant breaks that on purpose: each line
// gets its own small "personal" bump on top of the shared field (seeded per
// line), so neighboring lines can locally cross and overlap instead of only
// ever running parallel. The shared field still dominates the overall
// shape — this is a local wobble, not an independent path per line.
//
// Static once drawn — draw-in only, no idle drift (removed per request).

const W = 1440;
const H = 900;
const LINE_COUNT = 40;
const SAMPLES = 24; // slightly denser than IntroRipple — personal bumps are narrower and need more samples to render smoothly
const DRAW_DURATION = 1;
const DRAW_STAGGER = 0.5;

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

// One extra bump per line — local, narrower and offset from the shared
// bumps' seeding range so it reads as an independent wobble.
function personalBump(i: number): Bump {
  const base = i * 17;
  return {
    center: seeded(base + 1) * W,
    width: 70 + seeded(base + 2) * 90, // 70–160, narrower than the shared bumps
    amp: (seeded(base + 3) - 0.5) * 50, // -25..25
  };
}

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
    dA: buildPath(baselineY, [...bumpsA, personalBump(i)]),
    delay: (i / LINE_COUNT) * DRAW_STAGGER,
    strokeWidth: 1.4 + seeded(i * 7 + 900) * 1.0,
    strokeOpacity: 0.45 + seeded(i * 7 + 901) * 0.35,
  };
});

// Draw-in only, no idle drift — the lines settle and stay put once drawn.
const styleText = lines
  .map(
    (l) => `
.line-overlap-${l.i} {
  animation: path-draw-in ${DRAW_DURATION}s cubic-bezier(0.16,1,0.3,1) both ${l.delay.toFixed(3)}s;
}`
  )
  .join("\n");

const NAME_FADE_MASK =
  "radial-gradient(ellipse 26% 16% at 24% 50%, transparent 0%, transparent 45%, black 100%)";

const V_PAD = 50;

export default function IntroRippleOverlap({ fadeMask = false }: { fadeMask?: boolean }) {
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
            className={`line-overlap-${l.i}`}
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
