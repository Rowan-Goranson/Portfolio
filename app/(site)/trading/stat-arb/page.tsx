import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { STAT_ARB_PORTFOLIO, STAT_ARB_WALKFORWARD } from "../trading-content-data";
import PairLeaderboard from "./PairLeaderboard";
import EquityCurve from "./EquityCurve";
import SignalExample from "./SignalExample";
import WalkForwardCurve from "./WalkForwardCurve";
import VersionTable from "./VersionTable";
import LeverageTable from "./LeverageTable";

export default function StatArbPage() {
  const project = findProject("trading", "stat-arb")!;
  const wf = STAT_ARB_WALKFORWARD;
  const v1 = STAT_ARB_PORTFOLIO;
  const oneX = wf.leverage[0];
  const foldsPositive = wf.folds.filter((f) => f.ret > 0).length;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{project.oneLiner}</p>
        <p className="font-mono text-sm text-[var(--accent)] mb-1">
          walk-forward {wf.window}: {(oneX.cumReturn * 100).toFixed(0)}% (1x) vs. +{(wf.spyTotalReturn * 100).toFixed(0)}% SPY · Sharpe{" "}
          {oneX.sharpe.toFixed(2)} · max drawdown {(oneX.maxDrawdown * 100).toFixed(0)}%
        </p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">
          This page originally led with +{(v1.summary.totalReturn * 100).toFixed(0)}% (Sharpe {v1.summary.sharpe.toFixed(2)}). That number did not survive
          out-of-sample validation — below is what changed and why.
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
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. research process — same strategy, three versions</p>
              <VersionTable />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
                v1 picked pairs, hedge ratios and z-score parameters on the full sample, acted on a same-bar close (look-ahead), and a
                positional-argument bug fed the wrong stop-loss and cost settings into the pair ranking. Fixing the bugs (v2, top 10 pairs)
                made the in-sample result look <em>better</em> (Sharpe 3.4) — a sign the in-sample fit, not the strategy, was
                producing the return. v3 re-estimates everything on a 2-year formation window and trades the next 6 months with those
                estimates frozen ({wf.folds.length} folds, {wf.nDays.toLocaleString()} out-of-sample days).
              </p>
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">2. walk-forward out-of-sample return, {wf.window}</p>
              <WalkForwardCurve />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
                Pairs chosen by cointegration p-value only (p&lt;0.01, top 10 per fold), never by backtest Sharpe. Equal-weighted, 1x, no
                borrow costs on the short leg. {foldsPositive} of {wf.folds.length} folds were profitable; the cointegrating relationships
                found in each formation window did not persist into the next.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">3. what leverage does to a negative edge</p>
              <LeverageTable />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
                Same out-of-sample returns scaled by L, minus {(wf.financingRate * 100).toFixed(0)}%/yr financing on the borrowed part.
                Leverage multiplies the loss and adds volatility drag; at 10x the worst day ({(wf.leverage[5].worstDay * 100).toFixed(0)}%)
                is enough to nearly wipe the account.
              </p>
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">honest limitations</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                One parameter set and a short window that includes March 2020. The universe is 50 current mega-caps (survivorship bias),
                with no borrow or market-impact costs beyond a linear slippage term. A nested search over entry/exit z-score and
                p-value cutoff, chosen only on formation data, did not help (1x Sharpe −1.04). Next: sector-matched pairs, log prices
                and a rolling hedge ratio.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-[var(--paper-line)]">
          <p className="font-mono text-xs text-[var(--accent)] mb-1">v1 as originally published — in-sample, kept for comparison</p>
          <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed max-w-[70ch] mb-8">
            Not predictive: pairs, hedge ratios and the slippage grid were all fit on the data they were scored on. The slippage
            sensitivity grid shown here before was also an artifact — a units error meant the volatility term had no effect on cost.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-10">
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">top 10 cointegrated pairs — S&amp;P 500, 2018–2023 (in-sample)</p>
                <PairLeaderboard />
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">v1 portfolio — top 5 pairs, {v1.leverage}x, in-sample</p>
                <EquityCurve />
              </div>
            </div>
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">the signal — one pair&apos;s z-score (in-sample fit)</p>
              <SignalExample />
            </div>
          </div>
        </div>

        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-10 text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
          >
            view source on github ↗
          </a>
        )}
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
