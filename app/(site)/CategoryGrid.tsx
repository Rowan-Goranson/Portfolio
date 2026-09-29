import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { projectsByCategory, CATEGORY_NUMBER, type Category } from "./projects-data";

// Shared by /trading, /games, /research — one template, so the three
// category pages stay structurally identical (§-number, title, blurb,
// hairline rule, card grid) with only the content differing.
export default function CategoryGrid({
  category,
  title,
  blurb,
}: {
  category: Category;
  title: string;
  blurb: string;
}) {
  const items = projectsByCategory(category);

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">{`§${CATEGORY_NUMBER[category]}`}</p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-6 text-[var(--ink)]">{title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-12">{blurb}</p>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-[var(--ink-muted)]">— content coming soon.</p>
        )}
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
