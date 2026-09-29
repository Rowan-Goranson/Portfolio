"use client";
import { useState } from "react";
import ProjectCard from "./ProjectCard";
import { ALL_TAGS, TAG_COLOR, type Project, type Tag } from "./projects-data";

// Click a tag to activate it, click again to clear — multiple active tags
// narrow the list by AND (a project must carry every active tag), not OR.
export default function ProjectsFilterView({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Set<Tag>>(new Set());

  function toggle(tag: Tag) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  const activeList = [...active];
  const filtered = activeList.length === 0 ? projects : projects.filter((p) => activeList.every((tag) => p.tags.includes(tag)));

  return (
    <div>
      <div className="flex flex-wrap gap-6 mb-12">
        {ALL_TAGS.map((tag) => {
          const isActive = active.has(tag);
          const color = TAG_COLOR[tag];
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={isActive}
              className={`font-mono text-xs pb-1 border-b transition-colors ${
                isActive ? "" : "text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)]"
              }`}
              style={isActive ? { color, borderColor: color } : undefined}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => (
            <ProjectCard key={`${p.category}-${p.slug}`} project={p} />
          ))}
        </div>
      ) : (
        <p className="font-mono text-xs text-[var(--ink-muted)]">— no projects match all selected tags.</p>
      )}
    </div>
  );
}
