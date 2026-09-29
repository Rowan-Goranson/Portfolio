import { BACKTEST_SUMMARY, LIVE_SHARPE, LIVE_CAGR, LIVE_MAX_DRAWDOWN, LIVE_SHARPE_N_DAYS, BOOTSTRAP_METHODOLOGY_NOTE } from "../trading-content-data";
import WhyBox from "../../WhyBox";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const RECESSED = "var(--paper-recessed)";

// Domain is built per-band, not passed in: median is pinned to the exact
// center (50%) and the scale extends symmetrically from there just far
// enough to fit p05/p95 and the live point — so "how far is live from
// typical" reads directly as distance from the middle, on every band.
function Band({
  label,
  p05,
  median,
  p95,
  format,
  live,
}: {
  label: string;
  p05: number;
  median: number;
  p95: number;
  format: (n: number) => string;
  live: number;
}) {
  const lo = Math.min(p05, live);
  const hi = Math.max(p95, live);
  const halfRange = Math.max(median - lo, hi - median) * 1.05;
  const domainLo = median - halfRange;
  const domainHi = median + halfRange;
  const xOf = (v: number) => ((v - domainLo) / (domainHi - domainLo)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-[var(--ink)]">{label}</span>
        <span className="font-mono text-xs text-[var(--accent)]">live: {format(live)}</span>
      </div>
      <svg viewBox="0 0 100 16" className="w-full h-auto" preserveAspectRatio="none">
        <rect x={0} y={6} width={100} height={4} fill={RECESSED} />
        <rect x={xOf(p05)} y={6} width={xOf(p95) - xOf(p05)} height={4} fill={MUTED} opacity={0.35} />
        <line x1={xOf(median)} y1={5} x2={xOf(median)} y2={11} stroke={MUTED} strokeWidth={1.5} />
        <line x1={xOf(live)} y1={0} x2={xOf(live)} y2={16} stroke={ACCENT} strokeWidth={2} />
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-[var(--ink-muted)] mt-1">
        <span>p05 {format(p05)}</span>
        <span>median {format(median)}</span>
        <span>p95 {format(p95)}</span>
      </div>
    </div>
  );
}

const pct = (n: number) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
const fixed2 = (n: number) => n.toFixed(2);

export default function BootstrapBands() {
  const b = BACKTEST_SUMMARY;
  return (
    <div>
      <p className="font-mono text-xs text-[var(--ink-muted)] mb-1">
        {b.window} ({b.trades} trades), bootstrapped {"2000"}x — red is live, against the p05–p95 range.
      </p>
      <div className="flex flex-col gap-5 mt-5">
        <Band
          label="Sharpe (annualized)"
          p05={b.bootstrap.sharpe.p05}
          median={b.bootstrap.sharpe.median}
          p95={b.bootstrap.sharpe.p95}
          format={fixed2}
          live={LIVE_SHARPE}
        />
        <Band
          label="Max drawdown"
          p05={b.bootstrap.maxDrawdown.p05}
          median={b.bootstrap.maxDrawdown.median}
          p95={b.bootstrap.maxDrawdown.p95}
          format={pct}
          live={LIVE_MAX_DRAWDOWN.pct}
        />
        <Band
          label="CAGR"
          p05={b.bootstrap.cagr.p05}
          median={b.bootstrap.cagr.median}
          p95={b.bootstrap.cagr.p95}
          format={pct}
          live={LIVE_CAGR}
        />
      </div>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-4">
        win rate {pct(b.winRate).replace("+", "")} · total return {pct(b.totalReturn)} · positive over {(b.probPositive * 100).toFixed(0)}% of
        resampled histories
      </p>
      <div className="mt-4">
        <WhyBox label="why bootstrap, and why live looks extreme">
          <p className="mb-2">
            {BOOTSTRAP_METHODOLOGY_NOTE}
          </p>
          <p>
            The live markers are only {LIVE_SHARPE_N_DAYS} calendar days / 16 trades — CAGR and Sharpe get exaggerated by annualizing
            that short a window. Reference only, not a claim these rates hold over a year.
          </p>
        </WhyBox>
      </div>
    </div>
  );
}
