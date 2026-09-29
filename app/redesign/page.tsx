import Link from "next/link";
import Figure from "./Figure";

function SidenoteRef({ n }: { n: number }) {
  return <sup className="font-mono text-[var(--accent)] text-[0.7em] ml-0.5">{n}</sup>;
}

// A sidenote sits in its own grid row, beside the sentence that cites it —
// same-row placement in CSS Grid keeps it roughly line-aligned, rather than
// every note in a section dumping into one stack (which reads as a footnote
// list, not a margin note).
function SidenoteRow({ n, children, note }: { n: number; children: React.ReactNode; note: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-2 mt-4">
      <p className="md:col-span-5 text-base text-[var(--ink-muted)] leading-relaxed">
        {children}
        <SidenoteRef n={n} />
      </p>
      <p className="md:col-span-7 text-xs text-[var(--ink-muted)] leading-relaxed border-l border-[var(--paper-line)] pl-4">
        <span className="font-mono text-[var(--accent)] mr-1.5">{n}</span>
        {note}
      </p>
    </div>
  );
}

const sections = [
  { id: "s1", n: "§1", label: "Spread" },
  { id: "s2", n: "§2", label: "Abstract" },
  { id: "s3", n: "§3", label: "Contents" },
];

const projects = [
  {
    n: "3.1",
    title: "Kalshi Weather Trading",
    category: "Trading / Prediction Markets",
    abstract:
      "Automated trading system for NYC daily high-temperature contracts. A skew-t distribution fitted over NBS forecast residuals — conditioned on lead time, climatological variance, recent bias, and forecast drift — computes fair value against live market prices. Unattended daily execution with a kill switch, idempotent order state, and reconciliation.",
    tags: "Python · scipy · MLE · skew-t",
    stat: "14",
    statLabel: "model parameters",
    href: "/projects/kalshi",
  },
  {
    n: "3.2",
    title: "Statistical Arbitrage Backtester",
    category: "Trading / Equities",
    abstract:
      "Pairs trading strategy backtested on S&P 500 constituents, 2018–2024. Engle–Granger cointegration screening, OLS hedge ratios, z-score entry/exit signals, and inverse-volatility portfolio construction, with slippage modeled as a function of trade size and rolling volatility.",
    tags: "Python · statsmodels · risk parity",
    stat: "1.82",
    statLabel: "best-pair Sharpe",
    href: "/projects/stat-arb",
  },
  {
    n: "3.3",
    title: "Settlers of Catan Placement Algorithm",
    category: "Games / Simulation",
    abstract:
      "Initial settlement placement scored as a weighted sum of pip output, resource diversity, and port access, with weights optimized by grid search against bots running the same algorithm — a stricter benchmark than random placement.",
    tags: "Python · simulation · optimization",
    stat: "58%",
    statLabel: "win rate vs. bots",
    href: "/projects/catan",
  },
  {
    n: "3.4",
    title: "MM Skew-Probit Model",
    category: "Sports / Econometrics",
    abstract:
      "A skew-normal link replaces the standard probit's symmetric assumption in a model of NCAA football spread coverage, testing whether the NIL era shifted the shape of the outcome distribution relative to Vegas lines.",
    tags: "Python · scipy · MLE",
    stat: "p<.001",
    statLabel: "LR test vs. probit",
    href: "/projects/skew-probit",
  },
];

export default function RedesignHome() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-20">

      {/* Title block — quiet, not a hero. Large + light, not bold.
          Also the page's only wayfinding: in-page section jumps + a way out. */}
      <header className="mb-28">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6 mb-5">
          <p className="font-mono text-xs tracking-widest text-[var(--ink-muted)]">
            ROWAN GORANSON — WORKING PORTFOLIO — 2026
          </p>
          <nav className="flex items-center gap-4 font-mono text-xs text-[var(--ink-muted)] shrink-0">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-[var(--accent)] transition-colors">
                {s.n}
              </a>
            ))}
            <Link href="/" className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">
              main site ↗
            </Link>
          </nav>
        </div>
        <h1 className="font-light text-[clamp(3rem,8.5vw,6.5rem)] leading-[0.95] tracking-tight text-[var(--ink)]">
          Rowan Goranson
        </h1>
        <p className="mt-6 text-base text-[var(--ink-muted)] max-w-xl leading-relaxed">
          Quantitative projects in prediction markets, statistical arbitrage,
          and econometric modeling. Each one rests on a specific statistical
          claim — starting below with the idea underneath the first.
        </p>
      </header>

      {/* §1 — the figure is the hero, not a headline + buttons */}
      <section id="s1" className="pt-14 border-t border-[var(--paper-line)] mb-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-8">
          <div className="md:col-span-5">
            <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">§1</p>
            <h2 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">
              Naive vs. corrected spread
            </h2>
            <p className="text-base text-[var(--ink-muted)] leading-relaxed">
              A raw price spread between two cointegrated equities drifts —
              it isn&apos;t stationary on its own.
            </p>
          </div>
          <div className="md:col-span-7">
            <Figure />
          </div>
        </div>

        <SidenoteRow n={1} note="Confirmed with an Engle–Granger test on the raw price difference — it fails to reject a unit root.">
          That&apos;s checked, not assumed.
        </SidenoteRow>
        <SidenoteRow n={2} note="The hedge ratio is the OLS slope of one price series regressed on the other; the residual is the corrected spread.">
          Regressing one leg on the other for a hedge ratio removes the trend, leaving a spread that reverts to a stable mean — the mechanism behind §3.2.
        </SidenoteRow>
      </section>

      {/* §2 — abstract */}
      <section id="s2" className="pt-14 border-t border-[var(--paper-line)] mb-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-8">
          <div className="md:col-span-5">
            <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">§2</p>
            <h2 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">
              Abstract
            </h2>
            <p className="text-base text-[var(--ink-muted)] leading-relaxed">
              Four independent projects spanning prediction-market trading,
              statistical arbitrage, game-theoretic simulation, and sports
              econometrics, unified by the same method: state a distributional
              assumption explicitly, test whether the data supports it, and
              replace it when it doesn&apos;t.
            </p>
          </div>
          <div className="md:col-span-7" />
        </div>

        <SidenoteRow n={3} note="E.g. skew-t over normal for temperature-forecast errors; skew-normal over probit for spread coverage.">
          Each entry below leads with that assumption and how it was checked, not with the result alone.
        </SidenoteRow>
      </section>

      {/* §3 — contents, as abstracts, not cards */}
      <section id="s3" className="pt-14 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">§3</p>
        <h2 className="text-[1.75rem] font-semibold leading-tight mb-10 text-[var(--ink)]">
          Contents
        </h2>

        <div className="space-y-8">
          {projects.map((p) => (
            <Link key={p.n} href={p.href} className="group block">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-4">
                <div className="md:col-span-9">
                  <p className="font-mono text-xs text-[var(--ink-muted)] mb-2">
                    {p.n} — {p.category}
                  </p>
                  <h3 className="text-[1.25rem] font-semibold text-[var(--ink)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-[62ch] mb-3">
                    {p.abstract}
                  </p>
                  <p className="font-mono text-xs text-[var(--ink-muted)]">{p.tags}</p>
                </div>
                {/* The border turns the margin into a deliberate ruled gutter
                    instead of looking like leftover empty space. */}
                <div className="md:col-span-3 flex md:flex-col justify-between md:justify-start gap-1 md:border-l md:border-[var(--paper-line)] md:pl-8">
                  <div className="font-mono text-[2.25rem] leading-none font-bold text-[var(--ink)]">{p.stat}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{p.statLabel}</div>
                </div>
              </div>
              <div className="mt-8 h-px bg-[var(--paper-line)]" />
            </Link>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12">
            <div className="md:col-span-9">
              <p className="font-mono text-xs text-[var(--ink-muted)] mb-2">3.5 — Research</p>
              <p className="text-base text-[var(--ink-muted)]">— econometric modeling and academic work, in progress.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
