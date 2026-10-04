import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { DATA_PROVENANCE_NOTE } from "../trading-content-data";
import ModelTrialLog from "./ModelTrialLog";
import DistributionChart from "./DistributionChart";
import PDPPanels from "./PDPPanels";
import LiveFVSnapshot from "./LiveFVSnapshot";
import ExecutionPipeline from "./ExecutionPipeline";
import WhyBox from "../../WhyBox";

export default function WeatherModelPage() {
  const project = findProject("trading", "weather-model")!;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{project.oneLiner}</p>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-4">
          Kalshi&apos;s KXHIGHNY markets pay $1 if NYC&apos;s daily high temperature lands in a given 1°F bucket (or above/below a
          threshold) — the model below estimates the true probability of each bucket to find the mispriced ones.
        </p>
        <p className="font-mono text-sm text-[var(--accent)] mb-1">v1 → v4: −5.3% NLL end-to-end, each step LR-tested and walk-forward validated</p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-1">
          see it trading → <Link href="/trading/pnl-dashboard" className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">PnL Dashboard</Link>
        </p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">
          the academic version of this question → <Link href="/research/thesis" className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">Senior Honors Thesis</Link>
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-x-10 gap-y-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. why skew-t, not Normal</p>
              <DistributionChart />
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">2. model trial log — how v4 actually got here</p>
              <ModelTrialLog />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">3. partial-dependence diagnostics — what justified each step</p>
              <PDPPanels />
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">4. model vs. market, one real day</p>
              <LiveFVSnapshot />
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">5. what happens next — turning that into a trade</p>
              <ExecutionPipeline />
            </div>

            <WhyBox label="data provenance">{DATA_PROVENANCE_NOTE}</WhyBox>
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
