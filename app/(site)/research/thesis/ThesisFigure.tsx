// Explicitly schematic — unlike every other chart on this site, there's no
// real dataset behind this one yet (the thesis manuscript isn't public).
// It illustrates the question ("does price track true value?") rather than
// showing any actual result, and the page says so directly beneath it.

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";

const PRICE_POINTS = [
  6, 22, 14, 34, 26, 46, 30, 44, 58, 40, 62, 48, 70, 54, 66, 44, 58, 36, 50, 30,
];

export default function ThesisFigure() {
  const w = 640,
    h = 260,
    pad = 28;
  const fairValue = 44;
  const xOf = (i: number) => pad + (i / (PRICE_POINTS.length - 1)) * (w - pad * 2);
  const yOf = (v: number) => h - pad - (v / 80) * (h - pad * 2);
  const path = PRICE_POINTS.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  const gaps = PRICE_POINTS.map((v, i) => ({ i, v })).filter((p) => Math.abs(p.v - fairValue) > 18);

  return (
    <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)]">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={pad} y1={yOf(fairValue)} x2={w - pad} y2={yOf(fairValue)} stroke={MUTED} strokeWidth={1.5} strokeDasharray="5,4" opacity={0.6} />
        <text x={pad} y={yOf(fairValue) - 8} textAnchor="start" className="font-mono" fontSize="11" fill={MUTED}>
          true value (unobserved)
        </text>

        {gaps.map((g) => (
          <line key={g.i} x1={xOf(g.i)} y1={yOf(g.v)} x2={xOf(g.i)} y2={yOf(fairValue)} stroke={ACCENT} strokeWidth={1} opacity={0.2} />
        ))}

        <polyline points={path} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {gaps.map((g) => (
          <circle key={g.i} cx={xOf(g.i)} cy={yOf(g.v)} r={3.5} fill={ACCENT} />
        ))}

        <text x={pad} y={pad - 10} className="font-mono" fontSize="11" fill={ACCENT}>
          observed market price
        </text>
      </svg>
    </div>
  );
}
