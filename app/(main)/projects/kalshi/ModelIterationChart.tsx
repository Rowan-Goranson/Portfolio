"use client";

const versions = [
  { label: "v1", sublabel: "Normal baseline", nll: 0 },
  { label: "v2", sublabel: "+bias/drift/clim", nll: 0.062 },
  { label: "v3", sublabel: "+clim²", nll: 0.074 },
  { label: "v4", sublabel: "Logistic drift", nll: 0.096 },
];

export default function ModelIterationChart() {
  const max = 0.1;
  return (
    <div className="flex items-end gap-4 h-full">
      {versions.map(({ label, sublabel, nll }) => {
        const pct = nll === 0 ? 8 : (nll / max) * 100;
        return (
          <div key={label} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs font-mono text-[var(--accent)]">
              {nll === 0 ? "—" : `−${nll.toFixed(3)}`}
            </span>
            <div className="w-full flex items-end" style={{ height: "100px" }}>
              <div
                className={`w-full transition-all ${nll === 0 ? "bg-[var(--paper-line)]" : "bg-[var(--accent)]"}`}
                style={{ height: `${pct}%`, opacity: nll === 0 ? 1 : 0.75 }}
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-mono text-[var(--ink)]">{label}</div>
              <div className="text-xs text-[var(--ink-muted)] mt-0.5">{sublabel}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
