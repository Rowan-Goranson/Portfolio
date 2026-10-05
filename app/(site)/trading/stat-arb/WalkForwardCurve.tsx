import { STAT_ARB_WALKFORWARD } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

export default function WalkForwardCurve() {
  const { dates, cum1x, cum5x, spyCumulative } = STAT_ARB_WALKFORWARD;
  const w = 600,
    h = 220,
    padL = 38,
    padB = 20,
    padT = 10,
    padR = 10;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const n = dates.length;
  const yMax = Math.max(...spyCumulative, ...cum1x, ...cum5x);
  const yMin = Math.min(...spyCumulative, ...cum1x, ...cum5x);

  const xOf = (i: number) => padL + (i / (n - 1)) * plotW;
  const yOf = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const path = (vals: number[]) => vals.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  const zeroY = yOf(0);
  const pct = (v: number) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}%`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke={LINE} strokeWidth={1} />
        <text x={padL - 4} y={padT + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {pct(yMax)}
        </text>
        <text x={padL - 4} y={zeroY + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          0%
        </text>
        <text x={padL - 4} y={h - padB} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {pct(yMin)}
        </text>
        <polyline points={path(spyCumulative)} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4,3" />
        <polyline points={path(cum5x)} fill="none" stroke={ACCENT} strokeWidth={1.5} opacity={0.55} />
        <polyline points={path(cum1x)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <text x={padL} y={h - 4} fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {dates[0]}
        </text>
        <text x={w - padR} y={h - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {dates[n - 1]}
        </text>
      </svg>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1 font-mono text-[10px] text-[var(--ink-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: ACCENT }} /> walk-forward, 1x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: ACCENT, opacity: 0.55 }} /> walk-forward, 5x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: MUTED }} /> SPY
        </span>
      </div>
    </div>
  );
}
