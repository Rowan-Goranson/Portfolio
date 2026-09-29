import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { MM_DATASET, MM_TUNING } from "../research-content-data";
import TuningCurves from "./TuningCurves";
import BracketPredictions from "./BracketPredictions";
import WhyBox from "../../WhyBox";

export default function MMPredictorPage() {
  const project = findProject("research", "mm-predictor")!;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{project.oneLiner}</p>
        <p className="font-mono text-sm text-[var(--accent)] mb-1">
          {MM_DATASET.nGamesFiltered.toLocaleString()} games, {MM_DATASET.seasons} · tuned MAE {MM_TUNING.finalMAE.toFixed(2)} pts on{" "}
          {MM_DATASET.nPostseasonGames.toLocaleString()} real held-out postseason games
        </p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">
          real 2026 Final Four predictions below — generated once from the actual model, not illustrative
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. the model — Bradley-Terry point-margin ratings</p>
              <WhyBox label="the regression setup">
                <p>
                  One dummy regressor per D-I team (+1 home, −1 away, 0 otherwise), regressed against real point differential, plus a
                  neutral-site indicator — the classic Bradley-Terry / Massey setup. Fit each season&apos;s regular season, predict that
                  season&apos;s tournament games, score against the real final margin. Three knobs on top of the base regression:{" "}
                  <span className="text-[var(--ink)]">point-capping</span> extreme blowouts before fitting,{" "}
                  <span className="text-[var(--ink)]">time-decay</span> weighting so recent games count more, and{" "}
                  <span className="text-[var(--ink)]">shrinkage</span> of each prediction toward the league-average margin.
                </p>
              </WhyBox>
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">2. tuning each knob — real backtested MAE, not assumed values</p>
              <TuningCurves />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">3. real 2026 Final Four predictions</p>
              <BracketPredictions />
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">honest limitations</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                Backtest MAE (~9 points) is on the final margin of games that were often already close by tip-off in the tournament —
                a naive &quot;always predict the season-average margin&quot; baseline wouldn&apos;t be dramatically worse, so this model&apos;s real
                edge over a trivial baseline is modest, not large. No injury or lineup-change information, and the tuning grid was
                searched sequentially (cap, then decay, then shrinkage) rather than jointly, so it may not be the true joint optimum.
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
