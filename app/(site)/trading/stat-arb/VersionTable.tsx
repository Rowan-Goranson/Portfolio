import { STAT_ARB_WALKFORWARD } from "../trading-content-data";

const COLS = "grid-cols-[1fr_70px_80px_60px_70px]";
const pct = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)}%`;

export default function VersionTable() {
  const { versions } = STAT_ARB_WALKFORWARD;
  return (
    <div>
      <div className="flex flex-col divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
        {versions.map((v) => (
          <div key={`${v.id}-${v.label}`} className={`grid ${COLS} items-baseline gap-3 py-2`}>
            <span className="text-xs text-[var(--ink)]">
              <span className="font-mono">{v.id}</span> {v.label}
              <span className="block text-[11px] text-[var(--ink-muted)]">{v.note}</span>
            </span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{v.window}</span>
            <span className={`font-mono text-xs text-right ${v.cumReturn >= 0 ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>
              {pct(v.cumReturn)}
            </span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{v.sharpe.toFixed(2)}</span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{(v.maxDrawdown * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div className={`grid ${COLS} gap-3 mt-1.5 font-mono text-[10px] text-[var(--ink-muted)]`}>
        <span>version</span>
        <span className="text-right">window</span>
        <span className="text-right">return</span>
        <span className="text-right">sharpe</span>
        <span className="text-right">max dd</span>
      </div>
    </div>
  );
}
