import { DISTRIBUTION_COMPARISON } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

export default function DistributionChart() {
  const { x, normal, skewt, date, predictedHighF } = DISTRIBUTION_COMPARISON;
  const w = 600,
    h = 190,
    padL = 30,
    padB = 24,
    padT = 10,
    padR = 10;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xMin = x[0];
  const xMax = x[x.length - 1];
  const yMax = Math.max(...normal, ...skewt);

  const xOf = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * plotW;
  const yOf = (v: number) => padT + (1 - v / yMax) * plotH;

  const normalPath = x.map((v, i) => `${xOf(v).toFixed(1)},${yOf(normal[i]).toFixed(1)}`).join(" ");
  const skewtPath = x.map((v, i) => `${xOf(v).toFixed(1)},${yOf(skewt[i]).toFixed(1)}`).join(" ");
  const centerX = xOf(predictedHighF);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={centerX} y1={padT} x2={centerX} y2={h - padB} stroke={LINE} strokeWidth={1} strokeDasharray="2,3" />
        <text x={centerX} y={h - padB + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {predictedHighF}°F forecast
        </text>
        <polyline points={normalPath} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4,3" />
        <polyline points={skewtPath} fill="none" stroke={ACCENT} strokeWidth={2} />
      </svg>
      <div className="flex items-center gap-5 mt-2 font-mono text-[10px] text-[var(--ink-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: MUTED }} /> Normal (Trial 1)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: ACCENT }} /> skew-t (v4, live)
        </span>
      </div>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-2">
        Real fitted densities for one actual day ({date}) — the skew-t curve is visibly shifted and asymmetric with a fatter left tail,
        exactly the shape a symmetric Normal distribution structurally can&apos;t represent.
      </p>
    </div>
  );
}
