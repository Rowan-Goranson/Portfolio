// Server-rendered, no interactivity — deliberately not a client component, so
// there's no hydration pass to mismatch against (the failure mode hit twice
// elsewhere in this codebase, where Math.cos/sin differ in their last bit
// between the server's and the browser's math library).

const W = 640;
const H = 280;
const N = 90;

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Naive spread: a random walk with drift — non-stationary, wanders away
// from zero. Stand-in for a raw, un-hedged price difference between two
// cointegrated names.
const naive = (() => {
  let v = 0;
  return Array.from({ length: N }, (_, i) => {
    v += (seeded(i * 2 + 1) - 0.42) * 2.4;
    return v;
  });
})();

// Corrected spread: same underlying noise, but mean-reverting around zero —
// stand-in for the spread after the OLS hedge ratio removes the trend.
const corrected = Array.from({ length: N }, (_, i) => {
  const osc = Math.sin(i * 0.35) * 9;
  const noise = (seeded(i * 2 + 2) - 0.5) * 6;
  return osc + noise;
});

function toPath(series: number[], scale: number, mid: number) {
  const step = W / (series.length - 1);
  return series
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(mid - v * scale).toFixed(1)}`)
    .join(" ");
}

export default function Figure() {
  const mid = H * 0.55;
  const naiveMax = Math.max(...naive.map(Math.abs));
  const scale = (H * 0.38) / naiveMax;

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Naive spread drifting away from zero versus hedge-ratio-corrected spread reverting around zero">
        <line x1={0} y1={mid} x2={W} y2={mid} stroke="#c7d0bc" strokeWidth={1} />
        <text x={W} y={mid - 6} textAnchor="end" fontSize={10} fontFamily="var(--font-geist-mono)" fill="#5b5f51">0</text>

        <path d={toPath(naive, scale, mid)} fill="none" stroke="#5b5f51" strokeWidth={1.5} strokeDasharray="3 3" />
        <path d={toPath(corrected, scale, mid)} fill="none" stroke="#a2372b" strokeWidth={1.75} />
      </svg>
      <figcaption className="mt-4 flex items-start justify-between gap-6 text-xs">
        <span className="italic text-[var(--ink-muted)]">
          Fig. 1 — naive spread (dashed) drifts; hedge-ratio-corrected spread (solid) reverts to zero. Illustrative.
        </span>
        <span className="shrink-0 font-mono text-[var(--ink-muted)] flex items-center gap-3">
          <span className="flex items-center gap-1.5"><i className="inline-block w-3 border-t border-dashed border-[var(--ink-muted)]" /> naive</span>
          <span className="flex items-center gap-1.5"><i className="inline-block w-3 border-t-[1.5px] border-[var(--accent)]" /> corrected</span>
        </span>
      </figcaption>
    </figure>
  );
}
