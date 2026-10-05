// Real, label-free mini previews for project cards — each pulls from the
// same real data/components the actual detail pages use, just stripped of
// axis labels and captions so it reads at thumbnail size. Card layout
// (aspect-video box) is unchanged; this only replaces the empty gray fill
// for projects that have one. Projects without a preview here fall back to
// the plain placeholder box.

import { DISTRIBUTION_COMPARISON, TRADE_LEDGER, STAT_ARB_WALKFORWARD, BS_CURVE } from "./trading/trading-content-data";
import { MM_TUNING, POINT_SHAVING_SKEW, MML_COMPARISON } from "./research/research-content-data";
import { generateBoard } from "@/lib/catan/board";
import { buildCatanLayout } from "@/lib/catan/layout";
import { computeRecommendation } from "@/lib/catan/recommend";
import CatanBoard from "./games/catan-visualizer/CatanBoard";

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const RECESSED = "var(--paper-recessed)";

function WeatherModelPreview() {
  const { x, normal, skewt } = DISTRIBUTION_COMPARISON;
  const w = 300,
    h = 169,
    pad = 14;
  const xMin = x[0],
    xMax = x[x.length - 1];
  const yMax = Math.max(...normal, ...skewt);
  const xOf = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (w - pad * 2);
  const yOf = (v: number) => h - pad - (v / yMax) * (h - pad * 2);
  const normalPath = x.map((v, i) => `${xOf(v).toFixed(1)},${yOf(normal[i]).toFixed(1)}`).join(" ");
  const skewtPath = x.map((v, i) => `${xOf(v).toFixed(1)},${yOf(skewt[i]).toFixed(1)}`).join(" ");
  const skewtArea = `${xOf(xMin).toFixed(1)},${h - pad} ${skewtPath} ${xOf(xMax).toFixed(1)},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={MUTED} strokeWidth={1} opacity={0.3} />
      <polygon points={skewtArea} fill={ACCENT} opacity={0.12} />
      <polyline points={normalPath} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4,3" />
      <polyline points={skewtPath} fill="none" stroke={ACCENT} strokeWidth={2.5} />
    </svg>
  );
}

function CurvePreview({ values, markX, filled = true }: { values: number[]; markX?: number; filled?: boolean }) {
  const w = 300,
    h = 169,
    pad = 12;
  // Natural data range (not forced through zero) — a tuning curve whose
  // values all sit near e.g. 9.03 needs its real narrow range to show the
  // shape at all; forcing a zero baseline would flatten it to a sliver.
  const yMin = Math.min(...values),
    yMax = Math.max(...values);
  const xOf = (i: number) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const yOf = (v: number) => h - pad - ((v - yMin) / (yMax - yMin || 1)) * (h - pad * 2);
  const path = values.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  // Area fill always drops to the bottom of the box (a silhouette under the
  // curve), independent of whether 0 is a meaningful reference for this
  // particular series.
  const area = `${xOf(0).toFixed(1)},${h - pad} ${path} ${xOf(values.length - 1).toFixed(1)},${h - pad}`;
  const showZero = yMin < 0 && yMax > 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {showZero && <line x1={pad} y1={yOf(0)} x2={w - pad} y2={yOf(0)} stroke={MUTED} strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />}
      {filled && <polygon points={area} fill={ACCENT} opacity={0.12} />}
      <polyline points={path} fill="none" stroke={ACCENT} strokeWidth={2.5} />
      {markX !== undefined && <circle cx={xOf(markX)} cy={yOf(values[markX])} r={4} fill={ACCENT} />}
    </svg>
  );
}

function PnlDashboardPreview() {
  const values = TRADE_LEDGER.reduce<number[]>((acc, r) => [...acc, (acc[acc.length - 1] ?? 0) + r.pnl], [0]);
  return <CurvePreview values={values} />;
}

function MMPredictorPreview() {
  const grid = MM_TUNING.decay.grid;
  const values = grid.map((g) => g.mae);
  const markX = grid.findIndex((g) => g.x === MM_TUNING.decay.chosen);
  return <CurvePreview values={values} markX={markX} />;
}

function SkewProbitPreview() {
  const { z, z2, z3, cons } = POINT_SHAVING_SKEW.varyAlphaCoefs;
  const grid = Array.from({ length: 41 }, (_, i) => -1.5 + (i * 5) / 40);
  const values = grid.map((v) => z * v + z2 * v * v + z3 * v * v * v + cons);
  return <CurvePreview values={values} />;
}

function StatArbPreview() {
  return <CurvePreview values={STAT_ARB_WALKFORWARD.cum1x} />;
}

function MmlCrimePreview() {
  const { replication, original } = MML_COMPARISON;
  const w = 300,
    h = 169;
  const max = Math.max(Math.abs(replication.mmlBorder.coef), Math.abs(original.mmlBorderCol3.coef)) * 1.15;
  const zero = w - 30;
  const scale = (w - 50) / max;
  const barH = 36;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <line x1={zero} y1={16} x2={zero} y2={h - 16} stroke={MUTED} strokeWidth={1.5} opacity={0.5} />
      <rect
        x={zero + replication.mmlBorder.coef * scale}
        y={h / 2 - barH - 8}
        width={Math.abs(replication.mmlBorder.coef * scale)}
        height={barH}
        fill={ACCENT}
      />
      <rect
        x={zero + original.mmlBorderCol3.coef * scale}
        y={h / 2 + 8}
        width={Math.abs(original.mmlBorderCol3.coef * scale)}
        height={barH}
        fill={MUTED}
        opacity={0.55}
      />
    </svg>
  );
}

function ChessGaugePreview() {
  const w = 300,
    h = 169,
    x0 = 14,
    x1 = w - 14,
    max = 2600;
  const bands = [
    { from: 0, to: 1200, color: RECESSED },
    { from: 1200, to: 1600, color: "#e9e6de" },
    { from: 1600, to: 2000, color: "#ddd6c4" },
    { from: 2000, to: 2200, color: "#c9bfa0" },
    { from: 2200, to: 2600, color: "#b3a687" },
  ];
  const xOf = (v: number) => x0 + ((x1 - x0) * v) / max;
  const bandY = h / 2 - 8;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {bands.map((b) => (
        <rect key={b.from} x={xOf(b.from)} y={bandY} width={xOf(b.to) - xOf(b.from)} height={16} fill={b.color} />
      ))}
      <line x1={xOf(1991)} y1={bandY - 24} x2={xOf(1991)} y2={bandY + 40} stroke={ACCENT} strokeWidth={3} />
    </svg>
  );
}

function DerivativesPricerPreview() {
  const { spot, call, put } = BS_CURVE;
  const w = 300,
    h = 169,
    pad = 10;
  const xMin = spot[0],
    xMax = spot[spot.length - 1];
  const yMax = Math.max(...call, ...put);
  const xOf = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (w - pad * 2);
  const yOf = (y: number) => pad + (1 - y / yMax) * (h - pad * 2);
  const callPath = spot.map((s, i) => `${xOf(s).toFixed(1)},${yOf(call[i]).toFixed(1)}`).join(" ");
  const putPath = spot.map((s, i) => `${xOf(s).toFixed(1)},${yOf(put[i]).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <polyline points={callPath} fill="none" stroke={ACCENT} strokeWidth={2} />
      <polyline points={putPath} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="4,3" />
    </svg>
  );
}

// No real dataset yet (manuscript not public) — schematic only, same motif
// as the labeled version on the thesis page itself, just stripped down.
function ThesisPreview() {
  const w = 300,
    h = 169,
    pad = 14;
  const fairValue = 44;
  const points = [10, 30, 18, 42, 28, 52, 34, 50, 64, 40, 58, 46];
  const xOf = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const yOf = (v: number) => h - pad - (v / 80) * (h - pad * 2);
  const path = points.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <line x1={pad} y1={yOf(fairValue)} x2={w - pad} y2={yOf(fairValue)} stroke={MUTED} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
      <polyline points={path} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function CatanPreview() {
  const board = generateBoard();
  const layout = buildCatanLayout(1);
  const { top } = computeRecommendation(board);
  return <CatanBoard board={board} layout={layout} recommendedNodes={[top.node1, top.node2]} />;
}

export const PROJECT_PREVIEWS: Record<string, () => React.ReactElement> = {
  "pnl-dashboard": PnlDashboardPreview,
  "weather-model": WeatherModelPreview,
  "mm-predictor": MMPredictorPreview,
  "skew-probit": SkewProbitPreview,
  "stat-arb": StatArbPreview,
  "derivatives-pricer": DerivativesPricerPreview,
  "mml-crime": MmlCrimePreview,
  thesis: ThesisPreview,
  achievements: ChessGaugePreview,
  "catan-visualizer": CatanPreview,
};
