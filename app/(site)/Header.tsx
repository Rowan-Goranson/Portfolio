import Link from "next/link";

const navItems = [
  { href: "https://www.linkedin.com/in/rowangoranson/", label: "LinkedIn", external: true },
  { href: "https://github.com/Rowan-Goranson?tab=repositories", label: "GitHub", external: true },
  { href: "/projects", label: "Projects", external: false },
  { href: "/skills", label: "Skills", external: false },
  { href: "/about", label: "About", external: false },
];

// The site's only wayfinding — a quiet running head, not the old Nav
// component. New, not reused, per the academic-paper style from /redesign.
// Sticky + a solid background: Header is a direct child of body (not inside
// main's max-w-6xl), so px-[7vw] alone already lines it up with the page
// content's own true-viewport-relative margin — no breakout hack needed.
export default function Header() {
  return (
    <div className="sticky top-0 z-20 bg-[var(--paper)] px-[7vw] pt-10 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6">
        <Link href="/" className="font-mono text-xs tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
          PORTFOLIO UPDATED — SEPTEMBER 23, 2026
        </Link>
        <nav className="flex items-center gap-6 font-mono text-xs text-[var(--ink-muted)] shrink-0">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="hover:text-[var(--accent)] transition-colors">
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </div>
  );
}
