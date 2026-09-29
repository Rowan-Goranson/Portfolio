"use client";
import { useState, useSyncExternalStore } from "react";
import ProjectLayout, { Section, Grid, Card } from "@/components/ProjectLayout";

const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);

const HEX_TILES = [
  { q: 0, r: -2, resource: "ore", pips: 10 },
  { q: 1, r: -2, resource: "sheep", pips: 2 },
  { q: 2, r: -2, resource: "wood", pips: 9 },
  { q: -1, r: -1, resource: "wheat", pips: 12 },
  { q: 0, r: -1, resource: "brick", pips: 6 },
  { q: 1, r: -1, resource: "sheep", pips: 4 },
  { q: 2, r: -1, resource: "brick", pips: 10 },
  { q: -2, r: 0, resource: "wheat", pips: 9 },
  { q: -1, r: 0, resource: "wood", pips: 11 },
  { q: 0, r: 0, resource: "desert", pips: 7 },
  { q: 1, r: 0, resource: "wood", pips: 3 },
  { q: 2, r: 0, resource: "ore", pips: 8 },
  { q: -2, r: 1, resource: "wood", pips: 8 },
  { q: -1, r: 1, resource: "ore", pips: 3 },
  { q: 0, r: 1, resource: "wheat", pips: 4 },
  { q: 1, r: 1, resource: "sheep", pips: 5 },
  { q: -2, r: 2, resource: "brick", pips: 5 },
  { q: -1, r: 2, resource: "wheat", pips: 6 },
  { q: 0, r: 2, resource: "sheep", pips: 11 },
];

const RESOURCE_COLORS: Record<string, string> = {
  ore: "#475569", sheep: "#4ade80", wood: "#166534",
  wheat: "#a16207", brick: "#92400e", desert: "#57534e",
};

const PIP_DOTS: Record<number, number> = { 2:1,3:2,4:3,5:4,6:5,8:5,9:4,10:3,11:2,12:1 };

function hexToPixel(q: number, r: number, size: number) {
  return { x: size * 1.5 * q, y: size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r) };
}

const TOP_VERTICES = [
  { q: 0, r: -1, label: "#1", score: 92 },
  { q: 1, r: -1, label: "#2", score: 87 },
  { q: -1, r: 0, label: "#3", score: 83 },
  { q: 0, r: 0, label: "#4", score: 79 },
  { q: 1, r: 0, label: "#5", score: 76 },
];

function Hex({ q, r, resource, pips, size }: { q:number;r:number;resource:string;pips:number;size:number }) {
  const { x, y } = hexToPixel(q, r, size);
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * 60 * i;
    return `${x + size * Math.cos(a)},${y + size * Math.sin(a)}`;
  }).join(" ");
  const dots = PIP_DOTS[pips] ?? 0;
  const hot = pips === 6 || pips === 8;
  return (
    <g>
      <polygon points={pts} fill={RESOURCE_COLORS[resource]} fillOpacity={0.75} stroke="#1b1d17" strokeWidth={1.5} />
      {resource !== "desert" && (
        <>
          <circle cx={x} cy={y} r={size * 0.28} fill="#e7ece1" fillOpacity={0.9} />
          <text x={x} y={y - 3} textAnchor="middle" dominantBaseline="middle"
            fill={hot ? "#a2372b" : "#1b1d17"} fontSize={size * 0.22} fontWeight="bold" fontFamily="monospace">{pips}</text>
          <g transform={`translate(${x - (dots - 1) * 3.5},${y + size * 0.15})`}>
            {Array.from({ length: dots }, (_, i) => (
              <circle key={i} cx={i * 7} cy={0} r={2} fill={hot ? "#a2372b" : "#5b5f51"} />
            ))}
          </g>
        </>
      )}
    </g>
  );
}

export default function CatanPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  // The board's polygon points come from Math.cos/sin, which can differ in
  // its last bit between the server's and the browser's math library and
  // trips React's hydration check — render the board client-side only.
  const mounted = useIsClient();
  const size = 50;

  return (
    <ProjectLayout
      category="Games / Simulation"
      title="Settlers of Catan Placement Algorithm"
      description="Initial settlement placement algorithm optimized through backtesting against bots with identical logic. Scores board vertices by pip output, resource diversity, and port access — then sweeps the weighting parameters to maximize win rate."
      tags={["Python", "Simulation", "Game Theory", "Hyperparameter Optimization", "Backtest"]}
      stats={[
        { label: "Simulated games", value: "10k+" },
        { label: "Win rate vs. bots", value: "~58%" },
        { label: "Weight parameters", value: "3" },
        { label: "Scoring components", value: "3" },
      ]}
      githubHref="https://github.com/Rowan-Goranson"
    >
      <Section title="The Problem">
        <p>
          Initial settlement placement in Catan is a non-trivial optimization. Each
          settlement sits at the vertex of three tiles, collecting the matching resource
          every time one of those tiles&apos; numbers is rolled. The board is randomly
          generated each game, so the algorithm must evaluate every vertex against the
          live board state rather than following a fixed heuristic.
        </p>
        <p className="mt-4">
          The key tradeoff: high-pip numbers (6, 8) produce frequently but attract
          competition and may yield poor diversity. Diverse resource access reduces
          dependence on any single production chain. Port positions can amplify a
          resource-heavy position significantly. The algorithm formalizes these into
          a weighted scoring function, then backtests the weights.
        </p>
      </Section>

      <Section title="Interactive Board">
        <p className="mb-4 text-sm">
          Example board layout. Numbers in accent (6, 8) are most productive. Accent dots
          mark the algorithm&apos;s top-ranked starting positions — hover to see scores.
        </p>
        <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex items-center justify-center p-6 flex-1" style={{ minHeight: 420 }}>
              {mounted && (
                <svg width={460} height={420} viewBox="-230 -210 460 420">
                  {HEX_TILES.map((t) => <Hex key={`${t.q},${t.r}`} {...t} size={size} />)}
                  {TOP_VERTICES.map((v) => {
                    const { x, y } = hexToPixel(v.q, v.r, size);
                    const on = hovered === v.label;
                    return (
                      <g key={v.label} onMouseEnter={() => setHovered(v.label)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                        <circle cx={x} cy={y} r={on ? 11 : 8} fill={on ? "#a2372b" : "#e7ece1"} stroke="#a2372b" strokeWidth={1.5} />
                        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill={on ? "#e7ece1" : "#a2372b"} fontSize={8} fontWeight="bold">{v.label}</text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
            <div className="border-t md:border-t-0 md:border-l border-[var(--paper-line)] p-4 min-w-44">
              <p className="italic text-[var(--ink-muted)] text-sm mb-3">Resources</p>
              {Object.entries(RESOURCE_COLORS).map(([res, color]) => (
                <div key={res} className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5" style={{ background: color }} />
                  <span className="text-xs text-[var(--ink-muted)] capitalize">{res}</span>
                </div>
              ))}
              <p className="italic text-[var(--ink-muted)] text-sm mt-4 mb-3">Top spots</p>
              {TOP_VERTICES.map((v) => (
                <div key={v.label}
                  className={`flex items-center justify-between px-2 py-1 cursor-pointer transition-colors mb-0.5 ${hovered === v.label ? "bg-[var(--paper-line)]" : "hover:bg-[var(--paper-line)]"}`}
                  onMouseEnter={() => setHovered(v.label)} onMouseLeave={() => setHovered(null)}>
                  <span className="text-xs text-[var(--accent)] font-mono">{v.label}</span>
                  <span className="text-xs text-[var(--ink-muted)]">{v.score}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Scoring Function">
        <p className="mb-6">
          Each vertex is scored as a weighted sum of three components. Weights are treated
          as hyperparameters and optimized via grid search over win rate.
        </p>
        <div className="space-y-3">
          {[
            { param: "α — Pip score", desc: "Sum of pip values (probability mass) across adjacent tiles. A vertex touching 6-8-9 produces ~3× more resources per roll than 3-11-12. Normalized to the board maximum each game." },
            { param: "β — Resource diversity", desc: "Number of distinct resource types among adjacent tiles. Single-resource settlements are brittle — one bad run of dice can stall the entire build chain. Penalized for duplicate resources." },
            { param: "γ — Port proximity", desc: "Bonus for adjacency to favorable ports. 2:1 ports compound a resource-heavy position significantly; 3:1 ports provide baseline trading flexibility. Interacts with the diversity score." },
          ].map(({ param, desc }) => (
            <div key={param} className="flex gap-4 p-4 border border-[var(--paper-line)] bg-[var(--paper-recessed)]">
              <code className="text-[var(--accent)] font-mono text-sm shrink-0 w-36">{param}</code>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Validation Methodology">
        <p>
          Win rate is measured against bots using the same algorithm with different
          weight configurations — a strictly harder benchmark than random placement.
          The sweep tests thousands of (α, β, γ) combinations, averaging win rate across
          many full game simulations per combination to smooth variance.
        </p>
        <p className="mt-4">
          The optimal configuration weights pip score most heavily, with a substantial
          diversity bonus and a smaller port term. Extreme pip-score weighting eventually
          hurts by ignoring diversity; extreme diversity weighting chases poor resource
          combos on low-pip tiles. The optimal point is clearly interior.
        </p>
      </Section>
    </ProjectLayout>
  );
}
