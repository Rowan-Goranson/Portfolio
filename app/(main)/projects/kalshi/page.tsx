import ProjectLayout, { Section, Card, Grid, CodeBlock } from "@/components/ProjectLayout";
import ModelIterationChart from "./ModelIterationChart";

export default function KalshiPage() {
  return (
    <ProjectLayout
      category="Trading / Prediction Markets"
      title="Kalshi Weather Trading"
      description="Automated trading system for NYC daily high-temperature contracts on Kalshi. A custom probabilistic model computes fair values against live market prices; a production execution stack handles sizing, order management, and unattended daily operation."
      tags={["Python", "scipy", "statsmodels", "SQLite", "Kalshi REST API", "launchd", "MLE", "skew-t"]}
      stats={[
        { label: "Model parameters", value: "14" },
        { label: "Data sources", value: "3" },
        { label: "Model versions", value: "v1–v4" },
        { label: "Schedule", value: "Daily" },
      ]}
      githubHref="https://github.com/Rowan-Goranson"
    >
      <Section title="The Problem">
        <p>
          Kalshi lists temperature-bucket contracts for NYC each day — &quot;high between
          78–82°F&quot;, &quot;high above 88°F&quot;, etc. The edge lives in the gap between
          market prices and a fair-value distribution that correctly models the structure
          of NBS forecast errors.
        </p>
        <p className="mt-4">
          NBS forecasts have systematic, predictable error structure: errors widen with lead
          time, grow when recent forecasts disagree, carry a seasonal skew, and exhibit
          heavier tails than a normal distribution. A standard normal model misses all of
          this. The production model is a fitted{" "}
          <strong className="text-[var(--ink)]">skew-t distribution</strong> parameterized as a
          function of five observable forecast-context features.
        </p>
      </Section>

      <Section title="Model Features">
        <Grid cols={2}>
          {[
            { name: "Lead hours", desc: "Errors widen nonlinearly as forecast issuance moves further from the target date." },
            { name: "Recent bias", desc: "7-day rolling mean of same-lead residuals — captures whether the model has been running systematically hot or cold." },
            { name: "Forecast drift", desc: "Std dev of prior issuances for the same target date. When forecasts disagree across updates, realized error is larger." },
            { name: "Climatological variance", desc: "Historical tmax variance in a ±7-day calendar window. Some weeks are inherently more unpredictable." },
            { name: "Day-of-year (cyclic)", desc: "Seasonal asymmetry encoded as cos(doy). Summer and winter temperature errors have different shapes." },
          ].map(({ name, desc }) => (
            <Card key={name}>
              <div className="text-[var(--ink)] text-sm font-medium mb-1">{name}</div>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title="Model Iteration">
        <p className="mb-6">
          Four model versions, each compared to its predecessor via a likelihood-ratio
          test. Only additions with chi-squared p-values well below 0.001 were retained.
          Each version adds a structural improvement to the scale, location, or tail
          behavior of the fitted distribution.
        </p>
        <div className="border border-[var(--paper-line)] bg-[var(--paper-recessed)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--paper-line)] text-xs font-mono text-[var(--ink-muted)]">
            OOS NLL improvement per observation vs. v1 baseline
          </div>
          <div className="p-6 h-52">
            <ModelIterationChart />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { v: "v1", desc: "Normal distribution baseline — lead hours + spread only" },
            { v: "v2", desc: "Skew-t + recent_bias, forecast_drift, clim_var, doy_cos" },
            { v: "v3", desc: "Added clim_var² — captures non-monotonic mid-range behavior" },
            { v: "v4", desc: "Replaced linear drift term with logistic sigmoid (PDP-guided)" },
          ].map(({ v, desc }) => (
            <div key={v} className="p-3 border border-[var(--paper-line)] bg-[var(--paper-recessed)]">
              <div className="font-mono text-[var(--accent)] text-xs mb-1">{v}</div>
              <p className="text-[var(--ink-muted)] text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Execution Stack">
        <div className="space-y-3">
          {[
            { step: "01", name: "data_refresh.py", desc: "Tops up NBS forecast history, NOAA GHCN climatology, and the NWS CLI daily report (Kalshi's actual settlement source). Verifies freshness with retries — a stale refresh trips the kill switch rather than trading on stale inputs." },
            { step: "02", name: "fv_live.py", desc: "Mirrors the research pipeline exactly. Finds the freshest open KXHIGHNY event, pulls the most recently issued forecast as of that event's open time, and computes edge per bucket net of taker fees." },
            { step: "03", name: "sizing.py", desc: "Selects the highest-Kelly bucket, caps via fractional Kelly + max-position constraint, then checks available liquidity from the orderbook's NO-bid side (YES buy at price P fills against NO bids ≥ 1−P)." },
            { step: "04", name: "state.py", desc: "Idempotency: deterministic client_order_id per decision, UNIQUE constraint at the DB layer. A duplicate order is blocked at the database, not just application logic." },
            { step: "05", name: "execution.py", desc: "Kill switch → FV → candidate → size → idempotency check → record intent → submit → record outcome. Marketable limit IOC — fills immediately or not at all. Network failures go to reconcile.py rather than guessing." },
            { step: "06", name: "scheduler.py + launchd", desc: "Fires daily at 10:05 AM ET. pmset wake brings the machine up at 9:55 AM. Survives sleep, not full shutdown. All output logged since there's no terminal attached." },
          ].map(({ step, name, desc }) => (
            <div key={step} className="flex gap-4 p-4 border border-[var(--paper-line)] bg-[var(--paper-recessed)]">
              <span className="font-mono text-xs text-[var(--ink-muted)] shrink-0 pt-0.5 w-5">{step}</span>
              <div>
                <div className="font-mono text-sm text-[var(--ink)] mb-1">{name}</div>
                <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Reliability Design">
        <Grid cols={2}>
          {[
            { name: "Kill switch", desc: "Flag-file halt checked before every order. Auto-trips when data_refresh fails after 3 retries. Also manually settable." },
            { name: "Idempotent state", desc: "SQLite UNIQUE constraint on client_order_id — enforced at DB layer. The same decision can never be submitted twice regardless of how many times the scheduler runs." },
            { name: "Reconciliation", desc: "On network-level failure (no response), searches Kalshi order history for the client_order_id rather than assuming rejection or re-submitting." },
            { name: "Freshness verification", desc: "After each refresh, check_freshness confirms new data actually landed in the DB — not just that the API calls returned 200." },
          ].map(({ name, desc }) => (
            <Card key={name}>
              <div className="text-[var(--ink)] text-sm font-medium mb-1">{name}</div>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title="Data Sources">
        <Grid cols={3}>
          {[
            { name: "IEM NBS Archive", desc: "NBS forecast history for NYC. ~1-2h lag from issuance. Provides predicted high, spread, and lead time features." },
            { name: "NOAA GHCN", desc: "Historical daily max temperatures. Used to compute seasonal climatological variance from decades of observations." },
            { name: "NWS CLI Report", desc: "NWS Daily Climate Report via IEM AFOS. Kalshi's actual settlement source — used for recent_bias and confirmed authoritative on one observed GHCN discrepancy." },
          ].map(({ name, desc }) => (
            <Card key={name}>
              <div className="text-[var(--accent)] text-xs font-mono mb-2">{name}</div>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed">{desc}</p>
            </Card>
          ))}
        </Grid>
        <p className="mt-4 text-sm text-[var(--ink-muted)]">
          Model parameters and functional form are private. Execution stack and data pipeline available on GitHub.
        </p>
      </Section>
    </ProjectLayout>
  );
}
