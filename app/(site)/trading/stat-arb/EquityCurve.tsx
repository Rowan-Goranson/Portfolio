import { STAT_ARB_PORTFOLIO } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

export default function EquityCurve() {
  const { dates, cumulative, spyCumulative, drawdown } = STAT_ARB_PORTFOLIO;
  const w = 600,
    h = 190,
    padL = 34,
    padB = 20,
    padT = 10,
    padR = 10;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const n = dates.length;
  const yMax = Math.max(...cumulative, ...spyCumulative);
  const yMin = Math.min(0, ...cumulative, ...spyCumulative);

  const xOf = (i: number) => padL + (i / (n - 1)) * plotW;
  const yOf = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const portfolioPath = cumulative.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  const spyPath = spyCumulative.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  const zeroY = yOf(0);

  // drawdown mini-chart
  const dh = 46,
    dPadT = 4,
    dPadB = 14;
  const ddMin = Math.min(...drawdown);
  const ddOf = (v: number) => dPadT + (1 - (v - ddMin) / (0 - ddMin)) * (dh - dPadT - dPadB);
  const ddArea =
    `${xOf(0).toFixed(1)},${ddOf(0).toFixed(1)} ` +
    drawdown.map((v, i) => `${xOf(i).toFixed(1)},${ddOf(v).toFixed(1)}`).join(" ") +
    ` ${xOf(n - 1).toFixed(1)},${ddOf(0).toFixed(1)}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke={LINE} strokeWidth={1} />
        <text x={padL - 4} y={padT + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {(yMax * 100).toFixed(0)}%
        </text>
        <text x={padL - 4} y={zeroY + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          0%
        </text>
        <polyline points={spyPath} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4,3" />
        <polyline points={portfolioPath} fill="none" stroke={ACCENT} strokeWidth={2} />
        <text x={padL} y={h - 4} fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {dates[0]}
        </text>
        <text x={w - padR} y={h - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
          {dates[n - 1]}
        </text>
      </svg>
      <div className="flex items-center gap-5 mt-1 font-mono text-[10px] text-[var(--ink-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: ACCENT }} /> portfolio (5x, risk-parity)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: MUTED }} /> SPY
        </span>
      </div>

      <p className="font-mono text-[10px] text-[var(--ink-muted)] mt-4 mb-1">drawdown</p>
      <svg viewBox={`0 0 ${w} ${dh}`} className="w-full h-auto">
        <polygon points={ddArea} fill={MUTED} opacity={0.25} />
        <text x={padL - 4} y={dPadT + 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          0%
        </text>
        <text x={padL - 4} y={dh - dPadB + 2} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8} fill={MUTED}>
          {(ddMin * 100).toFixed(0)}%
        </text>
      </svg>
    </div>
  );
}
