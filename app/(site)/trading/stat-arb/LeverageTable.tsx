import { STAT_ARB_WALKFORWARD } from "../trading-content-data";

const COLS = "grid-cols-[60px_1fr_1fr_1fr_1fr]";

export default function LeverageTable() {
  const { leverage } = STAT_ARB_WALKFORWARD;
  return (
    <div>
      <div className="flex flex-col divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
        {leverage.map((r) => (
          <div key={r.leverage} className={`grid ${COLS} items-center gap-3 py-1.5`}>
            <span className="font-mono text-xs text-[var(--ink)]">{r.leverage}x</span>
            <span className="font-mono text-xs text-right text-[var(--ink)]">{(r.cumReturn * 100).toFixed(1)}%</span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{(r.annVol * 100).toFixed(0)}%</span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{r.sharpe.toFixed(2)}</span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{(r.maxDrawdown * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div className={`grid ${COLS} gap-3 mt-1.5 font-mono text-[10px] text-[var(--ink-muted)]`}>
        <span>lev.</span>
        <span className="text-right">return</span>
        <span className="text-right">ann. vol</span>
        <span className="text-right">sharpe</span>
        <span className="text-right">max dd</span>
      </div>
    </div>
  );
}
