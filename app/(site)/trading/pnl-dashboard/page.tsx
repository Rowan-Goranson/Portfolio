import Link from "next/link";
import TagChip from "../../TagChip";
import WhyBox from "../../WhyBox";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { LEDGER_TOTALS, LEDGER_TOTALS_PCT, LIVE_MAX_DRAWDOWN } from "../trading-content-data";
import TradeLedger from "./TradeLedger";
import BootstrapBands from "./BootstrapBands";

// The live numbers are the actual content of this page — everything else
// (backtest comparison, methodology notes) is supporting evidence, so it's
// sized and ordered accordingly: a full-width stat banner up front, then
// the ledger, then the backtest tucked into a closed dropdown.
function LiveStat({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex-1 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
      <div className="relative inline-block mb-2">
        <span className="font-mono text-2xl sm:text-3xl font-semibold text-[var(--ink)]">{num}</span>
        <span className="absolute -left-1 -right-2 -bottom-1 h-1.5 border-b-2 border-[var(--accent)]" aria-hidden="true" />
      </div>
      <p className="font-mono text-[0.7rem] uppercase tracking-wide text-[var(--accent)]">{label}</p>
    </div>
  );
}

export default function PnlDashboardPage() {
  const project = findProject("trading", "pnl-dashboard")!;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed mb-8">{project.oneLiner}</p>

        <div className="flex flex-col sm:flex-row border-t border-b border-[var(--paper-line)] divide-y divide-x-0 sm:divide-y-0 sm:divide-x divide-[var(--paper-line)] mb-8">
          <LiveStat num={`${LEDGER_TOTALS.wins}/${LEDGER_TOTALS.trades}`} label="Trades Won" />
          <LiveStat
            num={`${LEDGER_TOTALS_PCT >= 0 ? "+" : ""}${(LEDGER_TOTALS_PCT * 100).toFixed(1)}%`}
            label="Realized, Live Since Jul 2026"
          />
          <LiveStat num={`${(LIVE_MAX_DRAWDOWN.pct * 100).toFixed(1)}%`} label="Max Drawdown" />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div>
          <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">live trade ledger</p>
          <TradeLedger />
        </div>

        <div className="mt-10">
          <WhyBox label="backtest comparison (bootstrapped)">
            <BootstrapBands />
          </WhyBox>
        </div>

        <p className="font-mono text-xs text-[var(--ink-muted)] mt-12">
          the model behind these trades →{" "}
          <Link href="/trading/weather-model" className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">
            Kalshi Weather Model
          </Link>
        </p>
      </section>

      <Link
        href={`/${project.category}`}
        className="inline-block mt-16 text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
      >
        ← back to {CATEGORY_LABEL[project.category]}
      </Link>
    </div>
  );
}
