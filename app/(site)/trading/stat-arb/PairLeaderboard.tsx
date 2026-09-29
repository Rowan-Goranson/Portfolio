import { STAT_ARB_PAIRS } from "../trading-content-data";

export default function PairLeaderboard() {
  const sorted = [...STAT_ARB_PAIRS].sort((a, b) => b.sharpe - a.sharpe);
  return (
    <div>
      <div className="flex flex-col divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
        {sorted.map((p) => (
          <div
            key={`${p.s1}-${p.s2}`}
            className="grid grid-cols-[110px_1fr_70px_60px_70px] items-center gap-3 py-1.5"
          >
            <span className="font-mono text-xs text-[var(--ink)]">
              {p.s1}–{p.s2}
            </span>
            <span className="text-xs text-[var(--ink-muted)]">p={p.pValue < 0.001 ? p.pValue.toExponential(1) : p.pValue.toFixed(4)}</span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{(p.maxDrawdown * 100).toFixed(1)}%</span>
            <span className="font-mono text-xs text-right text-[var(--ink-muted)]">{p.sharpe.toFixed(2)}</span>
            <span className={`font-mono text-xs text-right ${p.cumReturn >= 0 ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"}`}>
              {p.cumReturn >= 0 ? "+" : ""}
              {(p.cumReturn * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[110px_1fr_70px_60px_70px] gap-3 mt-1.5 font-mono text-[10px] text-[var(--ink-muted)]">
        <span>pair</span>
        <span>cointegration</span>
        <span className="text-right">max dd</span>
        <span className="text-right">sharpe</span>
        <span className="text-right">2018–23</span>
      </div>
    </div>
  );
}
