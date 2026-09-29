import Link from "next/link";

interface Props {
  n?: string;
  title: string;
  blurb: React.ReactNode;
}

// Shared by every stub page (/trading, /games, /research, /about, /skills)
// — one component, so they stay structurally identical until real content
// replaces the placeholder paragraph. `n` is omitted for pages that aren't
// part of the numbered domain list (e.g. /skills).
export default function Stub({ n, title, blurb }: Props) {
  return (
    <div className="pt-10">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        {n && <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">{n}</p>}
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-6 text-[var(--ink)]">
          {title}
        </h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch]">
          {blurb}
        </p>
        <p className="mt-6 font-mono text-xs text-[var(--ink-muted)]">— content coming soon.</p>
        <Link href="/" className="inline-block mt-10 text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors">
          ← back
        </Link>
      </section>
    </div>
  );
}
