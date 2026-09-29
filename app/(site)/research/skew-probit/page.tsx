import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import {
  POINT_SHAVING_DATASET,
  POINT_SHAVING_MECHANICAL_NOTE,
  POINT_SHAVING_HETEROSKEDASTICITY,
  POINT_SHAVING_SKEW,
  POINT_SHAVING_CONCLUSION,
} from "../research-content-data";
import PointShavingTrialLog from "./PointShavingTrialLog";
import DiagnosticCharts from "./DiagnosticCharts";
import WhyBox from "../../WhyBox";

export default function SkewProbitPage() {
  const project = findProject("research", "skew-probit")!;
  const { nGames, seasonRange, nSpreadModels, nFavoriteWonSample, source } = POINT_SHAVING_DATASET;
  const het = POINT_SHAVING_HETEROSKEDASTICITY;
  const skew = POINT_SHAVING_SKEW;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{project.oneLiner}</p>
        <p className="font-mono text-sm text-[var(--accent)] mb-1">
          {nGames.toLocaleString()} D-I games, {seasonRange} · {nSpreadModels} spread models averaged into one line · z_absline
          coefficient drops {het.pctDrop}% ({het.meanCoefProbit} → {het.meanCoefHetprobit}) once heteroskedasticity is modeled
        </p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">
          joint work with a classmate (Kellen) · data from {source} · not a solo project
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. why the standard point-shaving test is broken</p>
              <WhyBox label="a mechanical fact, not a judgment call" defaultOpen>
                {POINT_SHAVING_MECHANICAL_NOTE}
              </WhyBox>
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">
                2. the real trial log — {nFavoriteWonSample.toLocaleString()} favorite-won games, four models
              </p>
              <PointShavingTrialLog />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">3. what the correction actually looks like</p>
              <DiagnosticCharts />
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">headline numbers</p>
              <div className="flex flex-col divide-y divide-[var(--paper-line)]">
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-sm text-[var(--ink)]">mean-equation coefficient, probit → heteroskedastic probit</span>
                  <span className="font-mono text-xs text-[var(--ink-muted)]">
                    {het.meanCoefProbit} → {het.meanCoefHetprobit} (−{het.pctDrop}%)
                  </span>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-sm text-[var(--ink)]">skew-probit improvement over standard probit</span>
                  <span className="font-mono text-xs text-[var(--ink-muted)]">+{skew.deltaLLvsProbit.toFixed(1)} log-likelihood</span>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-sm text-[var(--ink)]">constant-α skew parameter</span>
                  <span className="font-mono text-xs text-[var(--ink-muted)]">
                    {skew.constAlpha} (t={skew.constAlphaT})
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">conclusion</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{POINT_SHAVING_CONCLUSION}</p>
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
