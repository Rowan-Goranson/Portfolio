import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { MML_PAPER, MML_DATA, MML_SPEC, MML_COMPARISON, MML_CONCLUSION } from "../research-content-data";
import WhyBox from "../../WhyBox";

export default function MMLCrimePage() {
  const project = findProject("research", "mml-crime")!;
  const { replication, original } = MML_COMPARISON;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{project.oneLiner}</p>
        <p className="font-mono text-sm text-[var(--accent)] mb-1">
          real DDD re-estimation · mmlBorder {replication.mmlBorder.coef} (t={replication.mmlBorder.t}) vs. the paper&apos;s{" "}
          {original.mmlBorderCol3.coef} (se={original.mmlBorderCol3.se}) — same sign, same significance
        </p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">
          group project with two classmates (Eamon Coffey, Will Kearney) · not a solo project
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-10 gap-y-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. the paper we replicated</p>
              <div className="border border-[var(--paper-line)] p-5">
                <p className="text-sm font-semibold text-[var(--ink)] mb-1">{MML_PAPER.title}</p>
                <p className="font-mono text-[11px] text-[var(--ink-muted)] mb-3">
                  {MML_PAPER.citation} · doi:{MML_PAPER.doi}
                </p>
                <WhyBox label="the paper's theory & findings">
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
                    Theory: legal marijuana grown in MML states displaces illegal Mexican imports, cutting into drug-trafficking-organization
                    (DTO) profits and reducing the incentive for the violence that protects that trade. Tested via a{" "}
                    <span className="text-[var(--ink)]">{MML_PAPER.method}</span>.
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {MML_PAPER.findings.map((f) => (
                      <li key={f} className="text-sm text-[var(--ink-muted)] leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[var(--paper-line)]">
                        {f}
                      </li>
                    ))}
                  </ul>
                </WhyBox>
              </div>
            </div>

            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">2. real data &amp; the exact regression we ran</p>
              <div className="border border-[var(--paper-line)] p-5">
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
                  {MML_DATA.window} · county-year panel, {MML_DATA.totalControlObs.toLocaleString()} control-variable observations.
                </p>
                <WhyBox label="data sources & the real Stata command">
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
                    Crime: {MML_DATA.crimeSourcesNote}. MML dates: {MML_DATA.mmlSourceNote}. Controls: {MML_DATA.controlSourcesNote}.
                  </p>
                  <pre className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed whitespace-pre-wrap bg-[var(--paper-recessed)] p-3 border border-[var(--paper-line)]">
                    {MML_SPEC}
                  </pre>
                </WhyBox>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">3. our replication vs. the paper&apos;s own table</p>
              <div className="border border-[var(--paper-line)] p-5">
                <div className="flex flex-col divide-y divide-[var(--paper-line)]">
                  <div className="py-2.5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm text-[var(--ink)]">mmlBorder (our replication)</span>
                      <span className="font-mono text-xs text-[var(--accent)]">
                        {replication.mmlBorder.coef} (t={replication.mmlBorder.t}){replication.mmlBorder.sig ? "**" : ""}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-[var(--ink-muted)]">n={replication.n.toLocaleString()}</p>
                  </div>
                  <div className="py-2.5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm text-[var(--ink)]">MML × Mexico border (paper, col. 3)</span>
                      <span className="font-mono text-xs text-[var(--ink-muted)]">
                        {original.mmlBorderCol3.coef} (se={original.mmlBorderCol3.se})***
                      </span>
                    </div>
                  </div>
                  <div className="py-2.5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm text-[var(--ink)]">mmlInland (our replication)</span>
                      <span className="font-mono text-xs text-[var(--ink-muted)]">
                        {replication.mmlInland.coef} (t={replication.mmlInland.t}) — n.s.
                      </span>
                    </div>
                  </div>
                  <div className="py-2.5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm text-[var(--ink)]">MML inland (paper, across columns)</span>
                      <span className="font-mono text-xs text-[var(--ink-muted)]">
                        {original.mmlInlandRange[0]} to {original.mmlInlandRange[1]} — n.s.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">conclusion</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{MML_CONCLUSION}</p>
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
