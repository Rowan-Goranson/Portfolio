"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface Stat { label: string; value: string }

interface Props {
  category: string;
  title: string;
  description: string;
  tags: string[];
  stats?: Stat[];
  githubHref?: string;
  children: React.ReactNode;
}

export default function ProjectLayout({
  category, title, description, tags, stats, githubHref, children,
}: Props) {
  const container = useRef<HTMLDivElement>(null);

  // One reveal moment on load — the header. Body sections just appear;
  // motion isn't spent again on every scroll-into-view.
  useGSAP(
    () => {
      gsap.from(".proj-hero-line", {
        y: 44,
        opacity: 0,
        duration: 0.9,
        stagger: 0.11,
        ease: "power3.out",
        delay: 0.05,
      });
      gsap.from(".proj-meta", {
        opacity: 0,
        y: 14,
        duration: 0.7,
        delay: 0.38,
        ease: "power2.out",
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="max-w-5xl mx-auto px-6 pt-16 pb-24">

      {/* Header */}
      <div className="mb-16 overflow-hidden">
        <p className="proj-hero-line italic text-[var(--ink-muted)] text-base mb-5">
          {category}
        </p>
        <h1 className="proj-hero-line text-[clamp(2rem,5.5vw,3.5rem)] font-bold text-[var(--ink)] leading-[1.05] tracking-tight mb-6 max-w-3xl">
          {title}
        </h1>
        <p className="proj-hero-line text-[var(--ink-muted)] text-base leading-relaxed max-w-2xl mb-7">
          {description}
        </p>
        <div className="proj-meta flex flex-wrap gap-3 mb-8">
          {tags.map((t) => (
            <span key={t} className="text-xs font-mono text-[var(--ink-muted)]">
              {t}
            </span>
          ))}
        </div>
        {stats && (
          <div className="proj-meta grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[var(--paper-line)]">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-[var(--ink)] font-mono tracking-tight">{value}</div>
                <div className="text-xs text-[var(--ink-muted)] mt-1 font-mono">{label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 h-px bg-[var(--paper-line)]" />
      </div>

      {/* Body */}
      <div className="space-y-16">{children}</div>

      {/* Footer */}
      {githubHref && (
        <div className="mt-16 pt-8 border-t border-[var(--paper-line)]">
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
          >
            view source on github ↗
          </a>
        </div>
      )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="italic text-[var(--ink-muted)] text-base mb-6">
        {title}
      </h2>
      <div className="text-[var(--ink-muted)] leading-relaxed">{children}</div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 border border-[var(--paper-line)] bg-[var(--paper-recessed)] ${className}`}>
      {children}
    </div>
  );
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  const cls = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[cols];
  return <div className={`grid gap-4 ${cls}`}>{children}</div>;
}

export function CodeBlock({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)] overflow-hidden">
      {label && (
        <div className="px-4 py-2 border-b border-[var(--paper-line)] text-xs text-[var(--ink-muted)] font-mono">
          {label}
        </div>
      )}
      <div className="p-5 font-mono text-sm text-[var(--ink-muted)] leading-relaxed">{children}</div>
    </div>
  );
}
