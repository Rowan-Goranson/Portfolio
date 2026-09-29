import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { THESIS_STATUS, THESIS_QUESTION, THESIS_LIVE_CONNECTION } from "../research-content-data";
import ThesisFigure from "./ThesisFigure";

export default function ThesisPage() {
  const project = findProject("research", "thesis")!;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-1">{THESIS_QUESTION}</p>
        <p className="font-mono text-sm text-[var(--accent)] mb-8">{THESIS_STATUS}</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">1. the question, schematically</p>
              <ThesisFigure />
              <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-3">
                illustrative only — the manuscript&apos;s own data and results aren&apos;t posted here yet.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">the live counterpart</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-4">{THESIS_LIVE_CONNECTION}</p>
              <Link
                href="/trading/weather-model"
                className="font-mono text-xs text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
              >
                see it running live → Kalshi Weather Model
              </Link>
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">status</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                Draft is in progress and not yet posted publicly. Available on request —{" "}
                <a
                  href="https://www.linkedin.com/in/rowangoranson/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
                >
                  reach out on LinkedIn ↗
                </a>
                .
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
