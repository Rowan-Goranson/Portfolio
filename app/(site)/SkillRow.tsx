"use client";
import { useState } from "react";
import Link from "next/link";
import { TIER_COLOR, type Skill } from "./skills-data";
import TierMeter from "./TierMeter";

// Each row manages its own open/closed state independently — no shared
// "only one open" coordination needed for this to feel right.
export default function SkillRow({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-6 py-2.5 text-left"
      >
        <span className="text-[0.9rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
          {skill.name}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <TierMeter tier={skill.tier} />
          <span className="font-mono text-[0.8rem] font-medium" style={{ color: TIER_COLOR[skill.tier] }}>
            {skill.tier}
          </span>
          <span
            aria-hidden="true"
            className={`text-[var(--ink-muted)] transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            ⌄
          </span>
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-3 font-mono text-[0.7rem] text-[var(--ink-muted)] leading-relaxed">
            {skill.topics && skill.topics.length > 0 ? (
              <>
                <p className="flex flex-wrap gap-x-1.5 gap-y-1">
                  {skill.topics.map((t, i) => (
                    <span key={t}>
                      {t}
                      {i < skill.topics!.length - 1 && <span className="text-[var(--paper-line)]"> ·</span>}
                    </span>
                  ))}
                </p>
                {skill.links && skill.links.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {skill.links.map((l) =>
                      l.href.startsWith("http") ? (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
                        >
                          {l.label} ↗
                        </a>
                      ) : (
                        <Link key={l.href} href={l.href} className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">
                          {l.label} ↗
                        </Link>
                      )
                    )}
                  </p>
                )}
              </>
            ) : (
              "— coming soon."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
