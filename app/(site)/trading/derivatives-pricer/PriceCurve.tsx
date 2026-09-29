import { BS_CURVE, BS_PARAMS } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";

export default function PriceCurve() {
  const { spot, call, put } = BS_CURVE;
  const w = 600,
    h = 260,
    padL = 44,
    padR = 16,
    padT = 16,
    padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xMin = spot[0];
  const xMax = spot[spot.length - 1];
  const yMax = Math.max(...call, ...put);

  const xOf = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const yOf = (y: number) => padT + (1 - y / yMax) * plotH;

  const callPath = spot.map((s, i) => `${xOf(s).toFixed(1)},${yOf(call[i]).toFixed(1)}`).join(" ");
  const putPath = spot.map((s, i) => `${xOf(s).toFixed(1)},${yOf(put[i]).toFixed(1)}`).join(" ");
  const strikeX = xOf(BS_PARAMS.K);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke={LINE} strokeWidth={1} />
        <line x1={strikeX} y1={padT} x2={strikeX} y2={h - padB} stroke={MUTED} strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
        <text x={strikeX} y={padT - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
          K={BS_PARAMS.K}
        </text>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={padL - 6} y={yOf(yMax * t) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
            {(yMax * t).toFixed(0)}
          </text>
        ))}
        {spot.map((s, i) =>
          i % 3 === 0 ? (
            <text key={s} x={xOf(s)} y={h - padB + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
              {s}
            </text>
          ) : null
        )}
        <polyline points={callPath} fill="none" stroke={ACCENT} strokeWidth={2} />
        <polyline points={putPath} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="4,3" />
      </svg>
      <div className="flex gap-5 mt-2 font-mono text-[11px] text-[var(--ink-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: ACCENT }} />
          call
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 border-t border-dashed" style={{ borderColor: MUTED }} />
          put
        </span>
        <span>spot (x) vs. price (y), T={BS_PARAMS.T}yr, r={(BS_PARAMS.r * 100).toFixed(0)}%, σ={(BS_PARAMS.sigma * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
