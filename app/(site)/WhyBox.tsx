// Shared collapsible methodology callout — the "why does this hold up"
// supplementary explanation that supports the main content without
// competing with it for attention. One convention site-wide instead of a
// mix of static boxes and one-off dropdowns.
export default function WhyBox({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border border-[var(--paper-line)] p-5" open={defaultOpen}>
      <summary className="font-mono text-xs text-[var(--accent)] cursor-pointer list-none flex items-center gap-2">
        <span className="inline-block w-3 font-mono text-xs text-[var(--ink-muted)] transition-transform group-open:rotate-90">›</span>
        {label}
      </summary>
      <div className="text-sm text-[var(--ink-muted)] leading-relaxed mt-3">{children}</div>
    </details>
  );
}
