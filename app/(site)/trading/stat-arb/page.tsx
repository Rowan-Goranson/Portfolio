import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { STAT_ARB_PORTFOLIO } from "../trading-content-data";
import PairLeaderboard from "./PairLeaderboard";
import EquityCurve from "./EquityCurve";
import SignalExample from "./SignalExample";
import SensitivityHeatmap from "./SensitivityHeatmap";

export default function StatArbPage() {
  const project = findProject("trading", "stat-arb")!;
  const { summary, spyTotalReturn, window: backtestWindow, riskParityWeights, leverage } = STAT_ARB_PORTFOLIO;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{project.oneLiner}</p>
        <p className="font-mono text-sm text-[var(--accent)] mb-1">
          {backtestWindow}: +{(summary.totalReturn * 100).toFixed(0)}% ({leverage}x, top 5 pairs) vs. +
          {(spyTotalReturn * 100).toFixed(0)}% SPY · Sharpe {summary.sharpe.toFixed(2)} · max drawdown{" "}
          {(summary.maxDrawdown * 100).toFixed(0)}%
        </p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">backtest only — never traded live, not connected to any broker</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. top 10 cointegrated pairs — S&amp;P 500, 2018–2023</p>
              <PairLeaderboard />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
                Screened ~1,225 pairs from 50 large-caps for correlation &gt;0.8, then Engle-Granger cointegration p&lt;0.01. Each row is
                its own independent backtest of the strategy&apos;s real entry/exit z-score rules.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">2. portfolio — top 5 pairs, inverse-volatility weighted, {leverage}x leverage</p>
              <EquityCurve />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
                Real weights: {riskParityWeights.map((w) => `${w.pair} ${(w.weight * 100).toFixed(0)}%`).join(" · ")}. Beats SPY on raw
                return over this window, but at a much larger drawdown — {(summary.maxDrawdown * 100).toFixed(0)}% vs. a much milder SPY
                decline in the same March 2020 stretch, the cost of {leverage}x leverage on a concentrated 5-pair book.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">3. the signal — one pair&apos;s real z-score</p>
              <SignalExample />
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">4. sensitivity — slippage assumptions, not volatility, drive the result</p>
              <SensitivityHeatmap />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
                Re-ran the full top-5 portfolio at every combination of the two slippage-model knobs. Sharpe is flat across
                volatility_factor but drops from 0.83 to 0.36 as liquidity_factor alone rises 20x — this backtest&apos;s edge lives or
                dies on how expensive trading is assumed to be, not on how volatile the market is.
              </p>
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">honest limitations</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                No borrow costs, no market-impact modeling beyond the linear slippage terms above, and pair selection uses the full
                2018–2023 window rather than a walk-forward split — so the same data that picked the top 10 pairs also backtested them.
                A real deployment would need out-of-sample pair selection before this Sharpe means anything predictive.
              </p>
            </div>
          </div>
        </div>
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
