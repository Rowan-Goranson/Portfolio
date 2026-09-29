"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const categories = [
  { href: "/trading", label: "Trading" },
  { href: "/games",   label: "Games"   },
  { href: "/sports",  label: "Sports"  },
  { href: "/research",label: "Research"},
];

export default function Nav() {
  const path = usePathname();
  const isProject = path.startsWith("/projects/");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${
      scrolled
        ? "bg-[var(--paper)]/92 backdrop-blur-lg border-[var(--paper-line)]"
        : "bg-[var(--paper)]/25 backdrop-blur-sm border-transparent"
    }`}>
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-12">
        <Link href="/" className="font-bold text-[var(--ink)] text-sm tracking-wide hover:text-[var(--accent)] transition-colors">
          Rowan Goranson
        </Link>
        <div className="flex items-center gap-1">
          {categories.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hidden sm:inline-block px-3 py-1.5 text-xs font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors tracking-wide"
            >
              {label}
            </Link>
          ))}
          {isProject && (
            <Link href="/" className="ml-3 text-xs font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
              ← back
            </Link>
          )}
          <a
            href="https://github.com/Rowan-Goranson"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 text-xs font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            github ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
