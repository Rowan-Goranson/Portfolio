import Link from "next/link";
import { categories } from "./skills-data";

// A quiet, name-only ledger of the strongest (Advanced-tier) skills, sitting
// in the hero next to the name — not a scrolled-to section, visible on
// load. Deliberately minimal: no meters, no numbers, just names, the way a
// colophon reads. Sits lower and pulled in from the edge rather than
// vertically centered flush right, so it reads as its own quiet block
// instead of a corner pin.
const HIGHLIGHT_SKILLS = categories
  .flatMap((cat) => cat.skills.filter((s) => s.tier === "Advanced"))
  .map((s) => s.name);

export default function HeroSkills() {
  return (
    <div className="hidden sm:block text-right shrink-0 mt-24 md:mt-32">
      <p className="text-[0.95rem] text-[var(--ink-muted)] mb-3">Top Skills</p>
      <div className="w-20 h-px bg-[var(--paper-line)] ml-auto mb-4" />
      <div className="flex flex-col gap-2 mb-5">
        {HIGHLIGHT_SKILLS.map((name) => (
          <span key={name} className="text-[0.88rem] text-[var(--ink-muted)]">
            {name}
          </span>
        ))}
      </div>
      <Link
        href="/skills"
        className="inline-block text-sm text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
      >
        view all skills →
      </Link>
    </div>
  );
}
