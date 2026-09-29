import { PDP_PANELS } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

function Panel({ label, grid, avg }: { label: string; grid: number[]; avg: number[] }) {
  const w = 200,
    h = 130,
    padL = 34,
    padB = 22,
    padT = 10,
    padR = 8;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const yMin = Math.min(...avg);
  const yMax = Math.max(...avg);
  const yRange = yMax - yMin || 1;
  const xMin = grid[0];
  const xMax = grid[grid.length - 1];
  const xRange = xMax - xMin || 1;

  const xOf = (x: number) => padL + ((x - xMin) / xRange) * plotW;
  const yOf = (y: number) => padT + (1 - (y - yMin) / yRange) * plotH;

  const points = grid.map((x, i) => `${xOf(x).toFixed(1)},${yOf(avg[i]).toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <text x={padL - 4} y={padT + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={7} fill={MUTED}>
          {yMax.toFixed(3)}
        </text>
        <text x={padL - 4} y={h - padB} textAnchor="end" fontFamily="var(--font-mono)" fontSize={7} fill={MUTED}>
          {yMin.toFixed(3)}
        </text>
        <text x={padL} y={h - padB + 14} textAnchor="start" fontFamily="var(--font-mono)" fontSize={7} fill={MUTED}>
          {xMin.toFixed(1)}
        </text>
        <text x={w - padR} y={h - padB + 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize={7} fill={MUTED}>
          {xMax.toFixed(1)}
        </text>
        <polyline points={points} fill="none" stroke={ACCENT} strokeWidth={1.5} />
      </svg>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] text-center mt-1">{label}</p>
    </div>
  );
}

export default function PDPPanels() {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PDP_PANELS.map((p) => (
          <Panel key={p.key} label={p.label} grid={p.grid} avg={p.avg} />
        ))}
      </div>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-4">
        Partial dependence of a one-shot diagnostic classifier&rsquo;s predicted P(payout) on each variable, others held at their real values.
        Flat = the FV model already explains it; sloped = signal was still on the table. This is the actual diagnostic that flagged clim_var
        and doy_cos (Trial 4 / v5 above).
      </p>
    </div>
  );
}
