// LeWitt-style intro: systems-based line drawings in the spirit of Sol
// LeWitt's early wall-drawing instructions (direction studies, arcs from
// points, straight/not-straight/broken line series) — not a copy of any
// specific piece, just built the same way his certificates work: state a
// simple rule, then execute it exhaustively with no randomness beyond what
// the rule specifies.
//
// Three variants (?v=1/2/3). All three share the same finishing touches:
// - 1px hairline, dark gray, low opacity ("pencil-like")
// - draw in left-to-right / center-out on load (stroke-dashoffset, using
//   pathLength=1 so it works identically on <line>, <circle>, and <path>)
// - fade + drift away on scroll, via the same .intro-layer scroll-timeline
//   rule everything else in this project's intro layers uses
//
// Server-rendered, no interactivity, no randomness — purely deterministic
// geometry, so there's nothing here that can hydration-mismatch either.

const W = 1440;
const H = 900;
const STROKE = "#1a1a1a";
const OPACITY = 0.35;

// Two fade holes — one for the name, one for HeroSkills on the right — cut
// with an SVG-native <mask> rather than a CSS mask-image. A CSS mask-image
// needs two gradient layers plus `mask-composite: intersect` to punch two
// independent holes (the default "add" compositing makes each hole's own
// *opaque* area paint over the other's hole), and that combination turned
// out not to render correctly in testing despite computing correctly —
// SVG's own <mask> element draws each hole as ordinary overlapping shapes
// with no composite-mode ambiguity, so it just works. Two more things
// confirmed by direct testing: circles, not ellipses (this browser engine
// fails to paint an objectBoundingBox radial-gradient onto a non-square
// bounding box — silently renders as fully transparent, no error, no hole),
// and each circle's full extent has to stay inside the SVG's own viewBox
// (0,0,W,H) — a circle whose edge crosses outside it breaks the gradient
// for every shape in the mask, not just the one that crosses.
const FADE_HOLES = [
  { cx: 0.24, cy: 0.5, r: 230 }, // name
  { cx: 0.87, cy: 0.6, r: 175 }, // HeroSkills — cx+r must stay under W (1440)
];

function drawStyle(index: number, total: number, span = 0.7, duration = 0.9) {
  const delay = total > 1 ? (index / (total - 1)) * span : 0;
  return {
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: `path-draw-in ${duration}s cubic-bezier(0.16,1,0.3,1) both ${delay.toFixed(3)}s`,
  } as React.CSSProperties;
}

// Circles specifically (ArcsFromPoints) don't use drawStyle/pathLength=1 —
// confirmed by direct testing that this browser engine intermittently fails
// to fully reveal a <circle>'s stroke when stroke-dasharray/dashoffset are
// driven by a CSS animation through the pathLength=1 normalization: some
// circles freeze with a real, visible gap even though computed style
// reports stroke-dashoffset:0 (fully drawn). Removing the animation
// entirely always renders a perfect closed loop, so the fix is to stop
// relying on pathLength normalization and animate the real circumference
// instead — same visual effect, no normalization step to go wrong.
function circleDrawStyle(index: number, total: number, circumference: number, span = 0.7, duration = 0.9) {
  const delay = total > 1 ? (index / (total - 1)) * span : 0;
  return {
    strokeDasharray: circumference,
    strokeDashoffset: circumference,
    animation: `path-draw-in-len ${duration}s cubic-bezier(0.16,1,0.3,1) both ${delay.toFixed(3)}s`,
    ["--len" as string]: circumference,
  } as React.CSSProperties;
}

// ---- Variant 1: lines in four directions, one per quadrant, plus overlap ----

type Seg = { x1: number; y1: number; x2: number; y2: number };

function directionLines(x0: number, y0: number, x1: number, y1: number, angleDeg: number, spacing: number): Seg[] {
  const w = x1 - x0;
  const h = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const nx = -dy;
  const ny = dx;
  const half = Math.sqrt(w * w + h * h); // long enough to cover the box once clipped
  const count = Math.ceil((Math.abs(w * nx) + Math.abs(h * ny)) / 2 / spacing) + 1;
  const segs: Seg[] = [];
  for (let i = -count; i <= count; i++) {
    const offset = i * spacing;
    const px = cx + nx * offset;
    const py = cy + ny * offset;
    segs.push({ x1: px - dx * half, y1: py - dy * half, x2: px + dx * half, y2: py + dy * half });
  }
  return segs;
}

function FourDirections() {
  const mx = W / 2;
  const my = H / 2;
  const quadrants = [
    { id: "q-tl", x0: 0, y0: 0, x1: mx, y1: my, angle: 90 }, // vertical
    { id: "q-tr", x0: mx, y0: 0, x1: W, y1: my, angle: 0 }, // horizontal
    { id: "q-bl", x0: 0, y0: my, x1: mx, y1: H, angle: -45 }, // "/"
    { id: "q-br", x0: mx, y0: my, x1: W, y1: H, angle: 45 }, // "\"
  ];
  const overlapSize = Math.min(W, H) * 0.34;
  const overlap = { x0: mx - overlapSize / 2, y0: my - overlapSize / 2, x1: mx + overlapSize / 2, y1: my + overlapSize / 2 };
  const overlapAngles = [90, 0, -45, 45];

  const groups = [
    ...quadrants.map((q) => ({ clipId: q.id, segs: directionLines(q.x0, q.y0, q.x1, q.y1, q.angle, 22) })),
    ...overlapAngles.map((angle) => ({
      clipId: "q-overlap",
      segs: directionLines(overlap.x0, overlap.y0, overlap.x1, overlap.y1, angle, 14),
    })),
  ];
  const total = groups.reduce((n, g) => n + g.segs.length, 0);
  let seen = 0;

  return (
    <>
      <defs>
        {quadrants.map((q) => (
          <clipPath id={q.id} key={q.id}>
            <rect x={q.x0} y={q.y0} width={q.x1 - q.x0} height={q.y1 - q.y0} />
          </clipPath>
        ))}
        <clipPath id="q-overlap">
          <rect x={overlap.x0} y={overlap.y0} width={overlapSize} height={overlapSize} />
        </clipPath>
      </defs>
      {groups.map((g, gi) => (
        <g key={gi} clipPath={`url(#${g.clipId})`}>
          {g.segs.map((s, i) => {
            const idx = seen++;
            return (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} pathLength={1} vectorEffect="non-scaling-stroke" style={drawStyle(idx, total)} />
            );
          })}
        </g>
      ))}
    </>
  );
}

// ---- Variant 2: arcs from the four corners and four side midpoints ----

function ArcsFromPoints() {
  const points = [
    { cx: 0, cy: 0 }, { cx: W, cy: 0 }, { cx: 0, cy: H }, { cx: W, cy: H },
    { cx: W / 2, cy: 0 }, { cx: W / 2, cy: H }, { cx: 0, cy: H / 2 }, { cx: W, cy: H / 2 },
  ];
  const RING_COUNT = 9;
  const RING_SPACING = 105;
  const total = points.length * RING_COUNT;
  let seen = 0;

  return (
    <>
      {points.map((p, pi) => (
        <g key={pi}>
          {Array.from({ length: RING_COUNT }, (_, r) => {
            const idx = seen++;
            const radius = (r + 1) * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            return (
              <circle
                key={r}
                cx={p.cx}
                cy={p.cy}
                r={radius}
                fill="none"
                // No vector-effect="non-scaling-stroke" here (unlike the
                // other two variants) — confirmed by direct testing that
                // this exact combination (non-scaling-stroke + a CSS
                // animation on stroke-dasharray/dashoffset + a <circle>
                // under this SVG's non-uniform preserveAspectRatio="none"
                // scale) makes Chromium render some circles as an
                // incomplete arc with a real, visible gap, even though
                // stroke-dashoffset correctly computes to 0 (fully drawn).
                // Removing non-scaling-stroke was the only thing that
                // actually fixed it — the tiny resulting stroke-width
                // unevenness on non-8:5-ratio viewports is an acceptable
                // trade for a hairline that isn't broken.
                style={circleDrawStyle(idx, total, circumference)}
              />
            );
          })}
        </g>
      ))}
    </>
  );
}

// ---- Variant 3: straight / not-straight / broken lines in a grid of squares ----

function GridLines() {
  const COLS = 8;
  const ROWS = 5;
  const cw = W / COLS;
  const ch = H / ROWS;
  const cells: { type: number; x0: number; y0: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({ type: (r + c) % 3, x0: c * cw, y0: r * ch });
    }
  }
  const total = cells.length;

  return (
    <>
      {cells.map((cell, i) => {
        const { x0, y0, type } = cell;
        const x1 = x0 + cw;
        const y1 = y0 + ch;
        const style = drawStyle(i, total, 0.8, 0.6);
        if (type === 0) {
          // straight — corner to corner
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} pathLength={1} vectorEffect="non-scaling-stroke" style={style} />;
        }
        if (type === 1) {
          // not-straight — a fixed, systematic bow (not random), left-mid to right-mid
          const midY = (y0 + y1) / 2;
          const bow = ch * 0.3;
          const d = `M ${x0},${midY} Q ${(x0 + x1) / 2},${midY - bow} ${x1},${midY}`;
          return <path key={i} d={d} fill="none" pathLength={1} vectorEffect="non-scaling-stroke" style={style} />;
        }
        // broken — corner to corner with a fixed gap in the middle third
        const dx = x1 - x0;
        const dy = y1 - y0;
        const a1x = x0 + dx * 0.4, a1y = y0 + dy * 0.4;
        const b0x = x0 + dx * 0.6, b0y = y0 + dy * 0.6;
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={a1x} y2={a1y} pathLength={1} vectorEffect="non-scaling-stroke" style={style} />
            <line x1={b0x} y1={b0y} x2={x1} y2={y1} pathLength={1} vectorEffect="non-scaling-stroke" style={style} />
          </g>
        );
      })}
    </>
  );
}

export default function IntroLeWitt({ variant, fadeMask = false }: { variant: 1 | 2 | 3; fadeMask?: boolean }) {
  return (
    <svg
      className="intro-layer absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      mask={fadeMask ? "url(#hero-fade-mask)" : undefined}
    >
      {fadeMask && (
        <defs>
          <radialGradient id="hero-fade-hole">
            <stop offset="0%" stopColor="black" />
            <stop offset="45%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <mask id="hero-fade-mask" maskUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
            <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="white" />
            {FADE_HOLES.map((h, i) => (
              <circle key={i} cx={h.cx * W} cy={h.cy * H} r={h.r} fill="url(#hero-fade-hole)" />
            ))}
          </mask>
        </defs>
      )}
      <g stroke={STROKE} strokeOpacity={OPACITY} strokeWidth={1} fill="none">
        {variant === 1 && <FourDirections />}
        {variant === 2 && <ArcsFromPoints />}
        {variant === 3 && <GridLines />}
      </g>
    </svg>
  );
}
