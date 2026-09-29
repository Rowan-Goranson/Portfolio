"use client";
import { useRef, useEffect, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);

function sr(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function linePath(W: number, H: number, mu: number, sigma: number, peak: number): string {
  const N = 140;
  const maxPDF = 1 / (sigma * Math.sqrt(2 * Math.PI));
  return Array.from({ length: N + 1 }, (_, i) => {
    const xf = i / N;
    const z = (xf - mu) / sigma;
    const pdf = Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
    const y = H - (pdf / maxPDF) * peak * H;
    return `${i === 0 ? "M" : "L"}${(xf * W).toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function areaPath(W: number, H: number, mu: number, sigma: number, peak: number): string {
  return `${linePath(W, H, mu, sigma, peak)} L${W},${H} L0,${H} Z`;
}

const W = 1440;
const H = 900;

// A quiet paper texture, not a starfield — kept sparse.
const bgDots = Array.from({ length: 26 }, (_, i) => ({
  x: sr(i * 3 + 1) * W,
  y: sr(i * 3 + 2) * H,
  r: 1.2 + sr(i * 3 + 3) * 2.0,
  op: 0.05 + sr(i * 3 + 4) * 0.08,
}));

// One faint area fill and a couple of pencil-line curves — the hero graphic
// is a distribution sketch (this is the actual domain, not decoration), kept
// monochrome-ink so it reads as a notebook diagram, not a marketing graphic.
const areas = [
  { mu: 0.50, sigma: 0.22, peak: 0.55, op: 0.05 },
];

const strokes = [
  { mu: 0.50, sigma: 0.22, peak: 0.55, op: 0.22, sw: 1.5 },
  { mu: 0.62, sigma: 0.09, peak: 0.75, op: 0.16, sw: 1.25 },
  { mu: 0.34, sigma: 0.30, peak: 0.40, op: 0.10, sw: 1.25 },
];

export default function PageBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  // Gate rendering to after mount: the dot/curve layout below depends on
  // Math.sin, which can differ in its last bit between the server's and the
  // browser's math library and trips React's hydration check. Skipping SSR
  // for this purely decorative (aria-hidden) layer sidesteps that entirely.
  const mounted = useIsClient();

  // Fade background out after the hero section scrolls past.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const t = Math.max(0, Math.min(1, (window.scrollY - vh * 0.05) / (vh * 1.55)));
        svg.style.opacity = String(1 - t * t);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  if (!mounted) return null;

  return (
    // "parallax-bg" picks up the CSS scroll-driven animation in globals.css
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="parallax-bg fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      <defs>
        {areas.map((a, i) => (
          <linearGradient key={i} id={`area-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1b1d17" stopOpacity={a.op} />
            <stop offset="100%" stopColor="#1b1d17" stopOpacity="0" />
          </linearGradient>
        ))}

        <linearGradient id="fadeEdges" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#e7ece1" stopOpacity="1" />
          <stop offset="6%"   stopColor="#e7ece1" stopOpacity="0" />
          <stop offset="94%"  stopColor="#e7ece1" stopOpacity="0" />
          <stop offset="100%" stopColor="#e7ece1" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Paper texture — static, no animation */}
      {bgDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#5b5f51" opacity={d.op} />
      ))}

      {/* Area fill under the primary curve */}
      {areas.map((a, i) => (
        <path key={i} d={areaPath(W, H, a.mu, a.sigma, a.peak)} fill={`url(#area-${i})`} />
      ))}

      {/* Distribution sketch — monochrome ink, no glow */}
      {strokes.map((c, i) => (
        <path
          key={i}
          d={linePath(W, H, c.mu, c.sigma, c.peak)}
          fill="none"
          stroke="#1b1d17"
          strokeWidth={c.sw}
          opacity={c.op}
          strokeLinecap="round"
        />
      ))}

      {/* Edge fade */}
      <rect x="0" y="0" width={W} height={H} fill="url(#fadeEdges)" />
    </svg>
  );
}
