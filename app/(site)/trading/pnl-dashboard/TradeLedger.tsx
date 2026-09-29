import { TRADE_LEDGER, LEDGER_TOTALS, LEDGER_TOTALS_PCT, CURRENT_ACCOUNT_VALUE, LIVE_MAX_DRAWDOWN } from "../trading-content-data";
import WhyBox from "../../WhyBox";

function Row({ row }: { row: (typeof TRADE_LEDGER)[number] }) {
  const pct = (row.pnl / CURRENT_ACCOUNT_VALUE) * 100;
  return (
    <div className="grid grid-cols-[90px_70px_1fr_70px] items-center gap-3 py-1.5">
      <span className="font-mono text-xs text-[var(--ink-muted)]">{row.date}</span>
      <span className="font-mono text-xs text-[var(--ink)]">{row.bucket}</span>
      <span className="text-xs text-[var(--ink-muted)]">
        actual {row.actual}° — {row.won ? "won" : "lost"}
        {row.fv !== undefined && row.stakeFrac !== undefined && (
          <span className="font-mono text-[10px] text-[var(--accent)]">
            {" "}
            · fv {(row.fv * 100).toFixed(1)}% · size {(row.stakeFrac * 100).toFixed(2)}%
          </span>
        )}
      </span>
      <span className={`font-mono text-xs text-right ${row.won ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"}`}>
        {pct >= 0 ? "+" : ""}
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}

export default function TradeLedger() {
  const reversed = [...TRADE_LEDGER].reverse();
  const recent = reversed.slice(0, 5);
  const rest = reversed.slice(5);

  return (
    <div>
      <div className="flex flex-col divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
        {recent.map((row) => (
          <Row key={row.date} row={row} />
        ))}
        {rest.length > 0 && (
          <details className="group">
            <summary className="flex items-center gap-2 py-2 cursor-pointer list-none font-mono text-xs text-[var(--ink-muted)]">
              <span className="inline-block w-3 transition-transform group-open:rotate-90">›</span>
              show {rest.length} earlier trades
            </summary>
            <div className="flex flex-col divide-y divide-[var(--paper-line)] border-t border-[var(--paper-line)] -mt-px">
              {rest.map((row) => (
                <Row key={row.date} row={row} />
              ))}
            </div>
          </details>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 font-mono text-xs">
        <span className="text-[var(--ink-muted)]">
          {LEDGER_TOTALS.wins}/{LEDGER_TOTALS.trades} won
        </span>
        <span className="text-[var(--accent)]">
          {LEDGER_TOTALS_PCT >= 0 ? "+" : ""}
          {(LEDGER_TOTALS_PCT * 100).toFixed(2)}% realized (gross, pre-fee)
        </span>
      </div>
      <div className="mt-4">
        <WhyBox label="notes">
          <p className="mb-2">
            Max drawdown {(LIVE_MAX_DRAWDOWN.pct * 100).toFixed(2)}%, {LIVE_MAX_DRAWDOWN.peakDate} → {LIVE_MAX_DRAWDOWN.troughDate} —
            measured against bankroll at the time of that peak. Rows shown as % of current bankroll, not dollars, to keep account size
            private.
          </p>
          <p className="mb-2">One more trade (Sept 26) is still open and not yet in this tally.</p>
          <p>
            fv/size (fair value and applied Kelly stake, at decision time) only show from Sept 24 onward — that&apos;s when this got
            a durable DB column instead of living only in a rotating text log; earlier trades predate it and aren&apos;t backfilled.
          </p>
        </WhyBox>
      </div>
    </div>
  );
}
