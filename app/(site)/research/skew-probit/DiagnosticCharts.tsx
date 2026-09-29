import { POINT_SHAVING_HETEROSKEDASTICITY, POINT_SHAVING_SKEW } from "../research-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

// Real z-range: z_absline is the standardized average spread, so most of
// the real distribution of favorite-won games falls in roughly [-1.5, 3.5]
// (spreads run from near-zero up to ~30+, right-skewed once standardized).
const Z_GRID = Array.from({ length: 41 }, (_, i) => -1.5 + (i * 5) / 40);

function Curve({ label, values, format }: { label: string; values: number[]; format: (n: number) => string }) {
  const w = 280,
    h = 140,
    padL = 40,
    padB = 22,
    padT = 10,
    padR = 10;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const yMin = Math.min(...values);
  const yMax = Math.max(...values);
  const yRange = yMax - yMin || 1;
  const zMin = Z_GRID[0];
  const zMax = Z_GRID[Z_GRID.length - 1];

  const xOf = (z: number) => padL + ((z - zMin) / (zMax - zMin)) * plotW;
  const yOf = (v: number) => padT + (1 - (v - yMin) / yRange) * plotH;
  const zeroX = xOf(0);

  const points = Z_GRID.map((z, i) => `${xOf(z).toFixed(1)},${yOf(values[i]).toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={zeroX} y1={padT} x2={zeroX} y2={h - padB} stroke={LINE} strokeWidth={1} strokeDasharray="2,3" />
        <text x={padL - 4} y={padT + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          {format(yMax)}
        </text>
        <text x={padL - 4} y={h - padB} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          {format(yMin)}
        </text>
        <text x={zeroX} y={h - padB + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          z=0
        </text>
        <polyline points={points} fill="none" stroke={ACCENT} strokeWidth={2} />
      </svg>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] text-center mt-1">{label}</p>
    </div>
  );
}

export default function DiagnosticCharts() {
  const { varianceCoefs } = POINT_SHAVING_HETEROSKEDASTICITY;
  const { varyAlphaCoefs } = POINT_SHAVING_SKEW;

  const sigmaValues = Z_GRID.map((z) => Math.exp(varianceCoefs.z * z + varianceCoefs.z2 * z * z));
  const alphaValues = Z_GRID.map(
    (z) => varyAlphaCoefs.z * z + varyAlphaCoefs.z2 * z * z + varyAlphaCoefs.z3 * z * z * z + varyAlphaCoefs.cons
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Curve label="σ(z) — outcome variance rises with spread" values={sigmaValues} format={(n) => n.toFixed(2)} />
        <Curve label="α(z) — skewness shifts with spread, not constant" values={alphaValues} format={(n) => n.toFixed(1)} />
      </div>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
        Both curves computed directly from the paper&apos;s own real fitted coefficients (Table 2, Models 2 &amp; 4), plotted over the
        standardized spread range (z_absline) most favorite-won games actually fall in. Neither is flat — variance genuinely grows
        with spread size, and the skew genuinely changes sign and magnitude across the distribution rather than sitting at one
        constant value.
      </p>
    </div>
  );
}
