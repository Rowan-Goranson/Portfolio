import Link from "next/link";
import ProjectsFilterView from "../ProjectsFilterView";
import { projects } from "../projects-data";

export default function ProjectsPage() {
  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-6 text-[var(--ink)]">All Projects</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-10">
          Every project regardless of category, filterable by tag — click a tag to filter, click
          again to clear. Multiple active tags narrow the list.
        </p>
        <ProjectsFilterView projects={projects} />
      </section>

      <Link
        href="/"
        className="inline-block mt-16 text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
      >
        ← back
      </Link>
    </div>
  );
}
