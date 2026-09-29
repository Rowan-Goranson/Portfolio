import Link from "next/link";
import TagChip from "../../TagChip";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import CatanVisualizer from "./CatanVisualizer";
import WhyBox from "../../WhyBox";

export default function CatanVisualizerPage() {
  const project = findProject("games", "catan-visualizer")!;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-2">{project.oneLiner}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="mb-10">
          <WhyBox label="how it works">
            <ul className="flex flex-col gap-2">
              <li>Two modes: simulating placements with no opponents, or against random placement bots with draft order.</li>
              <li>Tree-based algorithm scoring candidate placements, tuned via hyperparameter optimization against randomly-placing bots.</li>
              <li>Placements are selected out of all possible candidates; noise introduced for draft mode.</li>
            </ul>
          </WhyBox>
        </div>

        <CatanVisualizer />

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
