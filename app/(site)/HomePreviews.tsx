// Homepage-only previews — no border/box, sitting directly on the paper
// background. One Sol LeWitt piece, run three times: a plane divided by a
// straight line, grid crosshatch on one side, diagonal crosshatch on the
// other, meeting at a hard edge with no transition (the grid/diagonal
// split square). What varies is the divider itself — its angle and
// position — so the three read as genuinely different compositions, not
// the same shape resized.
//
// On hover, each spins as one rigid unit — see .home-preview-spin in
// globals.css. One accent color per category, from the site's own
// TAG_COLOR taxonomy — not a new palette.

import { TAG_COLOR } from "./projects-data";

const W = 190, H = 128;

function directionLines(x0: number, y0: number, x1: number, y1: number, angleDeg: number, spacing: number) {
  const w = x1 - x0, h = y1 - y0;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad);
  const nx = -dy, ny = dx;
  const half = Math.sqrt(w * w + h * h);
  const count = Math.ceil((Math.abs(w * nx) + Math.abs(h * ny)) / 2 / spacing) + 1;
  const segs: [number, number, number, number][] = [];
  for (let i = -count; i <= count; i++) {
    const offset = i * spacing;
    const px = cx + nx * offset, py = cy + ny * offset;
    segs.push([px - dx * half, py - dy * half, px + dx * half, py + dy * half]);
  }
  return segs;
}

function DividedPlane({
  leftY,
  rightY,
  spacing,
  color,
  id,
}: {
  leftY: number;
  rightY: number;
  spacing: number;
  color: string;
  id: string;
}) {
  // The divider is a straight line from (0, leftY) to (W, rightY) — tilted,
  // not just a horizontal split — so each instance's seam has its own
  // angle and position, not just a different proportion of the same shape.
  const topClip = `0,0 ${W},0 ${W},${rightY} 0,${leftY}`;
  const botClip = `0,${leftY} ${W},${rightY} ${W},${H} 0,${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <g className="home-preview-spin">
        <defs>
          <clipPath id={`${id}-top`}>
            <polygon points={topClip} />
          </clipPath>
          <clipPath id={`${id}-bot`}>
            <polygon points={botClip} />
          </clipPath>
        </defs>
        <g stroke={color} clipPath={`url(#${id}-top)`}>
          {directionLines(0, 0, W, H, 0, spacing).map(([x1, y1, x2, y2], i) => (
            <line key={`h${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="home-preview-line" />
          ))}
          {directionLines(0, 0, W, H, 90, spacing + 2).map(([x1, y1, x2, y2], i) => (
            <line key={`v${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="home-preview-line" />
          ))}
        </g>
        <g stroke={color} clipPath={`url(#${id}-bot)`}>
          {directionLines(0, 0, W, H, 45, spacing).map(([x1, y1, x2, y2], i) => (
            <line key={`d1-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="home-preview-line" />
          ))}
          {directionLines(0, 0, W, H, -45, spacing).map(([x1, y1, x2, y2], i) => (
            <line key={`d2-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="home-preview-line" />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function HomeTradingLine() {
  // Seam falls left-to-right — grid region large on the left, shrinking
  // toward the right.
  return <DividedPlane leftY={100} rightY={22} spacing={6} color={TAG_COLOR.Trading} id="trading-divided" />;
}

// Research: a different LeWitt piece entirely (the etching detail) rather
// than a re-angled divided plane — a field of horizontal not-straight
// lines, with one small rectangle of dense straight verticals sitting
// inside it, untouched by the field around it.
function FieldWithPatch({ patch, color }: { patch: [number, number, number, number]; color: string }) {
  const rows = 10, pad = 6;
  const rowPaths = Array.from({ length: rows }, (_, r) => {
    const baseY = pad + (r / (rows - 1)) * (H - pad * 2);
    const segs = 8;
    let d = `M ${pad},${baseY}`;
    for (let s = 1; s <= segs; s++) {
      const x = pad + (s / segs) * (W - pad * 2);
      const wob = Math.sin(s * 1.7 + r * 0.9) * 2.4;
      d += ` L ${x.toFixed(1)},${(baseY + wob).toFixed(1)}`;
    }
    return d;
  });
  const [px, py, pw, ph] = patch;
  const cols = Math.max(4, Math.round(pw / 6));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <g className="home-preview-spin">
        <g stroke={color} fill="none">
          {rowPaths.map((d, i) => (
            <path key={i} d={d} className="home-preview-line" />
          ))}
        </g>
        <rect x={px} y={py} width={pw} height={ph} fill="var(--paper)" stroke="none" />
        <g stroke={color} className="home-preview-line-heavy">
          {Array.from({ length: cols + 1 }, (_, c) => {
            const x = px + (c / cols) * pw;
            return <line key={c} x1={x} y1={py} x2={x} y2={py + ph} />;
          })}
        </g>
        <rect x={px} y={py} width={pw} height={ph} fill="none" stroke={color} className="home-preview-line-heavy" />
      </g>
    </svg>
  );
}

export function HomeResearchLine() {
  return <FieldWithPatch patch={[76, 30, 48, 68]} color={TAG_COLOR.Research} />;
}

// Games: a third distinct piece — the colored-panel wall installation,
// straight rays radiating from a single point. Structurally unrelated to
// the other two (no grid, no field, no divided region) rather than a
// re-angled version of Trading's divided plane.
function Starburst({ rayCount, color }: { rayCount: number; color: string }) {
  const origin = { x: 14, y: 114 };
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const t = rayCount > 1 ? i / (rayCount - 1) : 0;
    const along = t * (W + H - 2 * 14);
    return along < W - 14 ? { x: 14 + along, y: 8 } : { x: W - 8, y: 8 + (along - (W - 14)) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <g className="home-preview-spin">
        <g stroke={color}>
          {rays.map((t, i) => (
            <line key={i} x1={origin.x} y1={origin.y} x2={t.x} y2={t.y} className="home-preview-line" />
          ))}
          <circle cx={origin.x} cy={origin.y} r={2.5} fill={color} className="home-preview-line-heavy" />
        </g>
      </g>
    </svg>
  );
}

export function HomeGamesLine() {
  return <Starburst rayCount={20} color={TAG_COLOR.Games} />;
}
