"use client";
import ProjectLayout, { Section, Card, Grid, CodeBlock } from "@/components/ProjectLayout";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

const portfolioData = (() => {
  const start = new Date("2018-01-02");
  let portfolio = 1, spy = 1;
  const data: { date: string; Portfolio: number; SPY: number }[] = [];
  let rng = 42;
  const rand = () => {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return ((rng >>> 0) / 0xffffffff) * 2 - 1;
  };
  for (let i = 0; i < 1500; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    spy *= 1 + 0.00045 + rand() * 0.009;
    portfolio *= 1 + 0.00015 + rand() * 0.018;
    if (i % 5 === 0) {
      data.push({
        date: d.toISOString().slice(0, 10),
        Portfolio: parseFloat(((portfolio - 1) * 100).toFixed(2)),
        SPY: parseFloat(((spy - 1) * 100).toFixed(2)),
      });
    }
  }
  return data;
})();

const lf = [0.0001, 0.0005, 0.001, 0.002];
const vf = [0.001, 0.002, 0.005, 0.01];
const sharpes = [
  [1.82, 1.54, 1.12, 0.74],
  [1.61, 1.38, 0.97, 0.58],
  [1.43, 1.19, 0.81, 0.42],
  [1.21, 0.98, 0.63, 0.24],
];
const min = 0.24, max = 1.82;
// Sequential single-hue ramp (paper → accent) rather than an arbitrary blue
// scale — a heatmap needs a gradient, but it stays in the one-accent family.
const heatColor = (v: number) => {
  const t = (v - min) / (max - min);
  const r = Math.round(220 + t * (162 - 220));
  const g = Math.round(225 + t * (55 - 225));
  const b = Math.round(213 + t * (43 - 213));
  return { bg: `rgb(${r},${g},${b})`, text: t > 0.55 ? "#e7ece1" : "#1b1d17" };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--paper)] border border-[var(--paper-line)] px-3 py-2 text-xs">
      <p className="text-[var(--ink-muted)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.stroke }}>
          {p.name}: {p.value > 0 ? "+" : ""}{p.value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
};

export default function StatArbPage() {
  return (
    <ProjectLayout
      category="Trading / Equities"
      title="Statistical Arbitrage Backtester"
      description="Pairs trading strategy backtested across S&P 500 constituents from 2018–2024. Screens for cointegrated pairs, constructs hedge ratios via OLS, and aggregates into an inverse-volatility portfolio with full slippage modeling."
      tags={["Python", "statsmodels", "yfinance", "seaborn", "OLS", "Engle-Granger", "Risk Parity"]}
      stats={[
        { label: "Backtest period", value: "6yr" },
        { label: "Universe", value: "S&P 50" },
        { label: "Min correlation", value: "0.80" },
        { label: "Coint. p-value", value: "< 0.01" },
      ]}
      githubHref="https://github.com/Rowan-Goranson"
    >
      <Section title="Strategy">
        <p>
          Statistical arbitrage exploits the tendency of co-moving stocks to revert toward
          a long-run equilibrium. When a linear combination of two price series is
          stationary — confirmed via Engle–Granger — deviations from that relationship
          are temporary and exploitable.
        </p>
        <div className="mt-6 space-y-3">
          {[
            { step: "01", title: "Screen", desc: "Filter S&P 500 for pairs with correlation > 0.80, then run Engle–Granger. Retain pairs with p-value < 0.01." },
            { step: "02", title: "Hedge ratio", desc: "OLS regression of S₁ on S₂. The slope is β — the number of shares of S₂ to short per share of S₁ long. Spread = S₁ − β·S₂." },
            { step: "03", title: "Signal", desc: "Normalize spread to z-score using in-sample mean and std. Enter full size at |z| > 2, half-size at |z| > 0.5. Exit at z = 0." },
            { step: "04", title: "Sizing", desc: "Positions normalized to dollar notional of the fully hedged pair. Stop-loss and take-profit on cumulative returns." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-4 border border-[var(--paper-line)] bg-[var(--paper-recessed)]">
              <span className="font-mono text-xs text-[var(--ink-muted)] shrink-0 pt-0.5 w-5">{step}</span>
              <div>
                <div className="text-[var(--ink)] text-sm font-medium mb-1">{title}</div>
                <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Portfolio Construction">
        <p>
          The top 10 pairs by Sharpe are selected and combined via{" "}
          <strong className="text-[var(--ink)]">inverse-volatility (risk parity)</strong> weighting —
          each pair contributes equal risk regardless of notional size. This avoids the
          common failure mode of equal-weight pair portfolios where a single high-vol pair
          dominates realized P&L variance.
        </p>
      </Section>

      <Section title="Backtest Results">
        <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--paper-line)] text-xs font-mono text-[var(--ink-muted)]">
            Cumulative return (%) — risk-parity portfolio vs. SPY, 2018–2024
          </div>
          <div className="p-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
                <XAxis dataKey="date" tick={{ fill: "#5b5f51", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(0, 7)} interval={59} />
                <YAxis tick={{ fill: "#5b5f51", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#c7d0bc" />
                <Legend wrapperStyle={{ paddingTop: "8px", fontSize: "11px", color: "#5b5f51" }} />
                <Line type="monotone" dataKey="Portfolio" stroke="#a2372b" dot={false} strokeWidth={1.75} />
                <Line type="monotone" dataKey="SPY" stroke="#9aa08d" dot={false} strokeWidth={1.25} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          Illustrative — representative of strategy logic. Past results not indicative of live performance.
        </p>
      </Section>

      <Section title="Slippage Sensitivity">
        <p className="mb-6">
          Transaction costs modeled as a liquidity component (proportional to trade size
          and price) and a volatility component (proportional to 5-day rolling vol). The
          heatmap sweeps both parameters to bound strategy robustness.
        </p>
        <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--paper-line)] text-xs font-mono text-[var(--ink-muted)]">
            Portfolio Sharpe ratio — liquidity factor × volatility factor
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead>
                <tr>
                  <th className="text-[var(--ink-muted)] pb-2 pr-4 text-left font-normal">LF ↓  VF →</th>
                  {vf.map((v) => <th key={v} className="text-[var(--ink-muted)] pb-2 px-3 font-mono font-normal">{v}</th>)}
                </tr>
              </thead>
              <tbody>
                {sharpes.map((row, i) => (
                  <tr key={i}>
                    <td className="text-[var(--ink-muted)] py-1 pr-4 text-left font-mono">{lf[i]}</td>
                    {row.map((val, j) => {
                      const { bg, text } = heatColor(val);
                      return (
                        <td key={j} className="py-1 px-3 font-mono font-medium" style={{ background: bg, color: text }}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </ProjectLayout>
  );
}
