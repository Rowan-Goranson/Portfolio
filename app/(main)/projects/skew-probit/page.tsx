"use client";
import ProjectLayout, { Section, Card, Grid, CodeBlock } from "@/components/ProjectLayout";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

function normalPDF(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
function normalCDF(x: number) {
  const t = 1 / (1 + 0.2315419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return x > 0 ? 1 - p : p;
}
function skewNormalPDF(x: number, alpha: number) {
  return 2 * normalPDF(x) * normalCDF(alpha * x);
}

const distData = Array.from({ length: 200 }, (_, i) => {
  const x = -4 + i * 0.04;
  return {
    x: parseFloat(x.toFixed(3)),
    "Symmetric (α=0)": parseFloat(skewNormalPDF(x, 0).toFixed(4)),
    "Pre-NIL (α=−1.2)": parseFloat(skewNormalPDF(x, -1.2).toFixed(4)),
    "Post-NIL (α=−0.4)": parseFloat(skewNormalPDF(x, -0.4).toFixed(4)),
  };
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--paper)] border border-[var(--paper-line)] px-3 py-2 text-xs">
      <p className="text-[var(--ink-muted)] mb-1">z = {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.stroke }}>{p.name}: {p.value.toFixed(4)}</p>
      ))}
    </div>
  );
};

export default function SkewProbitPage() {
  return (
    <ProjectLayout
      category="Sports / Econometrics"
      title="MM Skew-Probit Model"
      description="Custom MLE estimator replacing the standard probit's symmetric normal link with a skew-normal. Applied to NCAA football spread coverage to test whether the NIL era shifted the shape of the outcome distribution relative to Vegas lines."
      tags={["Python", "scipy", "statsmodels", "Nelder-Mead", "NCAA", "Skew-Normal", "MLE", "NIL"]}
      stats={[
        { label: "Estimated α (full)", value: "−1.2" },
        { label: "Post-NIL α shift", value: "+0.8" },
        { label: "LR test vs. probit", value: "p<.001" },
        { label: "Free parameters", value: "4" },
      ]}
      githubHref="https://github.com/Rowan-Goranson"
    >
      <Section title="Motivation">
        <p>
          Standard probit models assume the latent index driving a binary outcome
          (covered / didn&apos;t cover) is normally distributed — a symmetric assumption.
          But there&apos;s no reason the margin-vs-spread distribution has to be symmetric.
          Vegas lines are set to balance action, not to be unbiased predictors, and the
          distribution of outcomes around those lines can be skewed in practice.
        </p>
        <p className="mt-4">
          The skew-normal distribution adds a single shape parameter α that tilts the
          distribution left or right while keeping it unimodal. At α = 0 it collapses to
          standard normal, recovering the probit. The model estimates α jointly with the
          regression coefficients via MLE — letting the data decide whether asymmetry
          is present and how large it is.
        </p>
        <p className="mt-4">
          The NIL angle: NIL compensation (permitted from 2022) changed incentive
          structures for college athletes. If it changed how teams perform relative to
          Vegas expectations — not just average outcomes but the shape of the distribution
          — that should show up as a shift in α between pre- and post-2022 samples.
        </p>
      </Section>

      <Section title="Model Specification">
        <CodeBlock label="Latent index and link function">
          <p className="text-[var(--ink)]">z = β₀ + β₁·post_nil + β₂·abs_spread</p>
          <p className="text-[var(--ink)] mt-2">P(fail_to_cover) = Φ_α(z)</p>
          <p className="text-[var(--ink-muted)] text-xs mt-3">where Φ_α is the skew-normal CDF with shape α, estimated jointly</p>
        </CodeBlock>
        <div className="mt-4 space-y-3">
          {[
            { var: "post_nil", desc: "Binary indicator for seasons ≥ 2022. Captures any systematic shift in coverage rates after NIL." },
            { var: "abs_spread", desc: "Absolute value of the Vegas line. Large favorites may behave differently than close games — moral victories, garbage time, resting starters." },
            { var: "α (shape)", desc: "Skewness of the link function. Estimated jointly — significant departure from 0 means the symmetric probit is structurally misspecified." },
          ].map(({ var: v, desc }) => (
            <div key={v} className="flex gap-4 p-3 border border-[var(--paper-line)] bg-[var(--paper-recessed)]">
              <code className="text-[var(--accent)] text-sm font-mono shrink-0 w-24">{v}</code>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Distribution Visualization">
        <p className="mb-6 text-sm">
          The skew-normal density at different α values. Standard probit uses α = 0.
          Negative α tilts mass toward the left tail — teams more likely to fall well
          short of the spread than a symmetric model predicts.
        </p>
        <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--paper-line)] text-xs font-mono text-[var(--ink-muted)]">
            Skew-normal link density by α parameter
          </div>
          <div className="p-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distData}>
                <XAxis dataKey="x" tick={{ fill: "#5b5f51", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} interval={24} />
                <YAxis tick={{ fill: "#5b5f51", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={0} stroke="#c7d0bc" />
                <Legend wrapperStyle={{ paddingTop: "8px", fontSize: "11px", color: "#5b5f51" }} />
                <Area type="monotone" dataKey="Symmetric (α=0)" stroke="#5b5f51" fill="#5b5f51" fillOpacity={0.08} dot={false} strokeWidth={1.5} />
                <Area type="monotone" dataKey="Pre-NIL (α=−1.2)" stroke="#a2372b" fill="#a2372b" fillOpacity={0.12} dot={false} strokeWidth={1.5} />
                <Area type="monotone" dataKey="Post-NIL (α=−0.4)" stroke="#c98a72" fill="#c98a72" fillOpacity={0.1} dot={false} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      <Section title="Results">
        <p>
          The fitted skewness parameter α is significantly negative in the full sample —
          the standard probit&apos;s symmetric assumption is misspecified. Teams are more
          likely to fall well short of the spread than the symmetric model predicts.
        </p>
        <p className="mt-4">
          The post-NIL coefficient shows a meaningful shift toward zero: α moves from
          roughly −1.2 pre-NIL toward −0.4 post-NIL, consistent with either markets
          becoming better-calibrated or team behavior becoming less predictably skewed.
          Sample size constraints on the post-2022 window mean the estimate carries more
          uncertainty than the full-sample α.
        </p>
        <p className="mt-4">
          A likelihood-ratio test against the restricted probit (α = 0) rejects symmetry
          at p &lt; 0.001 — the skewness parameter is capturing real structure, not noise.
        </p>
      </Section>

      <Section title="Implementation">
        <p>
          The estimator is implemented from scratch in Python. The negative log-likelihood
          evaluates <code className="text-[var(--accent)] text-sm">skewnorm.cdf</code> from
          scipy.stats row-by-row, clips probabilities away from 0/1 for numerical
          stability, and sums the Bernoulli log-likelihood across observations.
          Optimization via scipy&apos;s Nelder-Mead, initialized from the standard probit
          solution to avoid cold-start issues in the joint parameter space.
        </p>
      </Section>
    </ProjectLayout>
  );
}
