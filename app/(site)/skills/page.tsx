import Link from "next/link";
import SkillRow from "../SkillRow";
import WhyBox from "../WhyBox";
import TierMeter from "../TierMeter";
import { categories, softSkills, TIER_ORDER, TIER_COLOR } from "../skills-data";

export default function SkillsPage() {
  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <h1 className="text-[1.55rem] font-semibold leading-tight mb-3 text-[var(--ink)]">Skills</h1>
        {/* The rubric — ordered low to high, left to right, so the scale is
            explained once here instead of the reader having to infer it
            from scattered per-row meters. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.7rem]">
          {TIER_ORDER.map((tier) => (
            <span key={tier} className="flex items-center gap-1.5" style={{ color: TIER_COLOR[tier] }}>
              <TierMeter tier={tier} />
              {tier}
            </span>
          ))}
        </div>
      </section>

      {/* Paired two-up: Math+Machine Learning, then Computer Science+Markets
          & Trading — halves the page length versus one full-width section
          per category. Stacks to one column on mobile. */}
      {[0, 2].map((startIdx) => (
        <section key={startIdx} className="pt-8 mt-14 border-t border-[var(--paper-line)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-14">
            {categories.slice(startIdx, startIdx + 2).map((cat, j) => {
              const i = startIdx + j;
              return (
                <div key={cat.name}>
                  <p className="font-mono text-[0.7rem] text-[var(--ink-muted)] mb-2">{`§5.${i + 1}`}</p>
                  <h2 className="text-[1.55rem] font-semibold leading-tight mb-3 text-[var(--ink)]">
                    {cat.name}
                  </h2>
                  <div className="mb-5">
                    <WhyBox label="background">
                      {cat.coursework && cat.coursework.length > 0 ? (
                        <div className="flex flex-col gap-1 font-mono text-[0.7rem]">
                          {cat.coursework.map((course) =>
                            typeof course === "string" ? (
                              <div key={course}>{course}</div>
                            ) : (
                              <a
                                key={course.href}
                                href={course.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors w-fit"
                              >
                                {course.text} ↗
                              </a>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-[0.7rem]">— coming soon.</span>
                      )}
                    </WhyBox>
                  </div>
                  <div className="divide-y divide-[var(--paper-line)] border-t border-[var(--paper-line)]">
                    {cat.skills.map((s) => (
                      <SkillRow key={s.name} skill={s} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="pt-8 mt-14 border-t border-[var(--paper-line)]">
        <p className="font-mono text-[0.7rem] text-[var(--ink-muted)] mb-2">§5.5</p>
        <h2 className="text-[1.55rem] font-semibold leading-tight mb-8 text-[var(--ink)]">
        Leadership &amp; Activities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
          {softSkills.map((group, gi) => (
            <div key={`${group.name}-${gi}`}>
              <h3 className="italic text-[var(--ink-muted)] text-[0.9rem] mb-4">{group.name}</h3>
              <div className="space-y-4">
                {group.entries.map((entry, i) => (
                  <div key={i}>
                    <div className="text-[0.9rem] font-semibold text-[var(--ink)]">{entry.title}</div>
                    <p className="mt-1 text-[0.8rem] text-[var(--ink-muted)]">{entry.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/"
        className="inline-block mt-14 text-[0.8rem] font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
      >
        ← back
      </Link>
    </div>
  );
}
