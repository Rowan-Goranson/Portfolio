import { LIVE_FV_SNAPSHOT } from "../trading-content-data";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const RECESSED = "var(--paper-recessed)";

export default function LiveFVSnapshot() {
  const maxVal = Math.max(...LIVE_FV_SNAPSHOT.candidates.flatMap((c) => [c.fv, c.ask]));

  return (
    <div>
      <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">real candidate set, {LIVE_FV_SNAPSHOT.date}</p>
      <div className="flex flex-col gap-3">
        {LIVE_FV_SNAPSHOT.candidates.map((c) => {
          const color = c.traded ? ACCENT : MUTED;
          return (
            <div key={c.ticker} className="grid grid-cols-[70px_1fr_70px] items-center gap-3">
              <span className="font-mono text-xs" style={{ color }}>
                {c.ticker}
                {c.traded && " *"}
              </span>
              <svg viewBox="0 0 300 20" className="w-full h-auto">
                <rect x={0} y={2} width={300} height={7} fill={RECESSED} />
                <rect x={0} y={2} width={(c.ask / maxVal) * 300} height={7} fill="none" stroke={MUTED} strokeWidth={1} />
                <rect x={0} y={11} width={300} height={7} fill={RECESSED} />
                <rect x={0} y={11} width={(c.fv / maxVal) * 300} height={7} fill={color} />
              </svg>
              <span className="font-mono text-xs text-right" style={{ color }}>
                {c.edge >= 0 ? "+" : ""}
                {(c.edge * 100).toFixed(1)}¢
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 font-mono text-[10px] text-[var(--ink-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-1.5" style={{ background: MUTED, opacity: 0.5 }} /> ask (market)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-1.5" style={{ background: MUTED }} /> fv (model)
        </span>
        <span>* traded — 122 contracts @ 1¢</span>
      </div>
    </div>
  );
}
