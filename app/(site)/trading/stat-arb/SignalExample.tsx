import { STAT_ARB_EXAMPLE_PAIR } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

export default function SignalExample() {
  const { s1, s2, dates, zscore, entryZ, scaleInZ } = STAT_ARB_EXAMPLE_PAIR;
  const w = 600,
    h = 150,
    padL = 22,
    padB = 18,
    padT = 10,
    padR = 10;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const n = dates.length;
  const yMax = Math.max(...zscore, entryZ) + 0.3;
  const yMin = Math.min(...zscore, -entryZ) - 0.3;

  const xOf = (i: number) => padL + (i / (n - 1)) * plotW;
  const yOf = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const path = zscore.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  const zeroY = yOf(0);

  const thresholds = [entryZ, scaleInZ, -scaleInZ, -entryZ];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="var(--paper-recessed)" opacity={0.3} />
        {thresholds.map((t) => (
          <line
            key={t}
            x1={padL}
            y1={yOf(t)}
            x2={w - padR}
            y2={yOf(t)}
            stroke={MUTED}
            strokeWidth={Math.abs(t) === entryZ ? 1 : 0.75}
            strokeDasharray={Math.abs(t) === entryZ ? "3,2" : "1,3"}
            opacity={0.6}
          />
        ))}
        <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke={LINE} strokeWidth={1} />
        <polyline points={path} fill="none" stroke={ACCENT} strokeWidth={1.5} />
        <text x={w - padR} y={yOf(entryZ) - 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          z=+{entryZ} full short
        </text>
        <text x={w - padR} y={yOf(-entryZ) + 9} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          z=-{entryZ} full long
        </text>
        <text x={padL} y={h - 4} fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {dates[0]}
        </text>
        <text x={w - padR} y={h - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {dates[n - 1]}
        </text>
      </svg>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-2">
        The single best pair by Sharpe ({s1}–{s2}): real hedge-ratio-adjusted spread z-score, 2018–2023. Crossing ±{entryZ} opens a
        full position, ±{scaleInZ} a half position, back toward 0 exits.
      </p>
    </div>
  );
}
