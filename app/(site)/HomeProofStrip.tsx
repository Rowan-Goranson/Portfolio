import Link from "next/link";

// The three biggest, externally-groundable signals — live trading, gaming
// acumen, and academic rarity (dual Honors thesis) — each with a real
// number, not a claim taken on faith.
const PROOF_POINTS: { num: string; label: string; detail: string; href?: string }[] = [
  {
    num: "+26.3%",
    label: "Live Trading Return",
    detail: "Kalshi algo trading weather system, live since Jul 2026",
    href: "/trading",
  },
  {
    num: "#96",
    label: "Ranked globally settlers of Catan",
    detail: "Catan world rank /4.3M players · 1991 chess rapid rating (~top 1%) · 3rd most 1st place finishes /250 students",
    href: "/games",
  },
  {
    num: "1/2,500",
    label: "Dual Honors Thesis — Econ & Math",
    detail: "The only student in BC's Class of 2027 approved for and pursuing both Honors Math and Honors Econ programs",
  },
];

export default function HomeProofStrip() {
  return (
    <div className="flex flex-col sm:flex-row border-t border-b border-[var(--paper-line)] divide-y divide-x-0 sm:divide-y-0 sm:divide-x divide-[var(--paper-line)]">
      {PROOF_POINTS.map((p) => (
        <div key={p.label} className="flex-1 py-6 sm:px-8 sm:first:pl-0 sm:last:pr-0">
          <div className="relative inline-block mb-3">
            <span className="font-mono text-3xl sm:text-4xl font-semibold text-[var(--ink)]">{p.num}</span>
            <span className="absolute -left-1 -right-2 -bottom-1.5 h-2 border-b-2 border-[var(--accent)]" aria-hidden="true" />
          </div>
          <p className="font-mono text-[0.7rem] uppercase tracking-wide text-[var(--accent)] mb-2">{p.label}</p>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-[34ch]">{p.detail}</p>
          {p.href && (
            <Link
              href={p.href}
              className="inline-block mt-2.5 font-mono text-xs text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
            >
              → {p.href}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
