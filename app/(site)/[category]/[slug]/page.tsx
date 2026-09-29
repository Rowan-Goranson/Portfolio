import Link from "next/link";
import { notFound } from "next/navigation";
import TagChip from "../../TagChip";
import { findProject, projects, CATEGORY_LABEL } from "../../projects-data";

export function generateStaticParams() {
  return projects.map((p) => ({ category: p.category, slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const project = findProject(category, slug);
  if (!project) notFound();

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-8 text-[var(--ink)]">{project.title}</h1>

        {/* Hero visual placeholder — no real assets yet */}
        <div className="aspect-video max-w-2xl bg-[var(--paper-recessed)] border border-[var(--paper-line)] mb-8" />

        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-2">{project.oneLiner}</p>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">— full write-up coming soon.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
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
