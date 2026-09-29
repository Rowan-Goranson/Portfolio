import Link from "next/link";
import TagChip from "./TagChip";
import type { Project } from "./projects-data";
import { PROJECT_PREVIEWS } from "./ProjectPreviews";

// Shared by category grids and the all-projects tag view — one card, so
// both stay visually identical. No shadows, no rounded corners, no pill
// tags: hover shifts the hairline border to the accent and lifts the card
// slightly instead.
export default function ProjectCard({ project }: { project: Project }) {
  const Preview = PROJECT_PREVIEWS[project.slug];
  return (
    <Link
      href={`/${project.category}/${project.slug}`}
      className="group block border border-[var(--paper-line)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Real mini preview where one exists; plain placeholder otherwise. */}
      <div className="aspect-video bg-[var(--paper-recessed)] border-b border-[var(--paper-line)] group-hover:border-[var(--accent)] transition-colors duration-200 overflow-hidden flex items-center justify-center p-3">
        {Preview && <Preview />}
      </div>
      <div className="p-5">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-2">{project.number}</p>
        <h3 className="text-lg font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors mb-1">
          {project.title}
        </h3>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">{project.oneLiner}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </Link>
  );
}
