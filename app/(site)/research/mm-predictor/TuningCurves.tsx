import { MM_TUNING } from "../research-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

function Panel({
  label,
  grid,
  chosen,
  format,
}: {
  label: string;
  grid: { x: number; mae: number }[];
  chosen: number;
  format: (n: number) => string;
}) {
  const w = 200,
    h = 130,
    padL = 38,
    padB = 22,
    padT = 10,
    padR = 8;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xs = grid.map((g) => g.x);
  const maes = grid.map((g) => g.mae);
  const xMin = xs[0];
  const xMax = xs[xs.length - 1];
  const yMin = Math.min(...maes);
  const yMax = Math.max(...maes);
  const yRange = yMax - yMin || 1;

  const xOf = (x: number) => padL + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const yOf = (y: number) => padT + (1 - (y - yMin) / yRange) * plotH;

  const points = grid.map((g) => `${xOf(g.x).toFixed(1)},${yOf(g.mae).toFixed(1)}`).join(" ");
  const chosenPoint = grid.find((g) => g.x === chosen);

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
          {xMin}
        </text>
        <text x={w - padR} y={h - padB + 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize={7} fill={MUTED}>
          {xMax}
        </text>
        <polyline points={points} fill="none" stroke={MUTED} strokeWidth={1.5} />
        {chosenPoint && (
          <>
            <line x1={xOf(chosenPoint.x)} y1={padT} x2={xOf(chosenPoint.x)} y2={h - padB} stroke={ACCENT} strokeWidth={1} strokeDasharray="2,2" />
            <circle cx={xOf(chosenPoint.x)} cy={yOf(chosenPoint.mae)} r={2.5} fill={ACCENT} />
          </>
        )}
      </svg>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] text-center mt-1">
        {label} — chosen {format(chosen)}
      </p>
    </div>
  );
}

export default function TuningCurves() {
  const { baselineMAE, finalMAE, cap, decay, shrink } = MM_TUNING;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Panel label="point cap" grid={cap.grid} chosen={cap.chosen} format={(n) => `${n}`} />
        <Panel label="time decay (r)" grid={decay.grid} chosen={decay.chosen} format={(n) => n.toFixed(3)} />
        <Panel label="shrinkage" grid={shrink.grid} chosen={shrink.chosen} format={(n) => n.toFixed(3)} />
      </div>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-4">
        Each knob grid-searched one at a time (holding the other two at their already-chosen values), real MAE on 1,250 real
        postseason games across 10 tournaments. Untuned baseline: {baselineMAE.toFixed(4)} pts. Fully tuned: {finalMAE.toFixed(4)} pts
        — a modest, real ~0.3-point improvement, not a dramatic one.
      </p>
    </div>
  );
}
