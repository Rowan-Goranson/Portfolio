import Link from "next/link";
import TagChip from "../../TagChip";
import WhyBox from "../../WhyBox";
import { findProject, CATEGORY_LABEL } from "../../projects-data";
import { BS_PARAMS, BS_PARITY_CHECK } from "../trading-content-data";
import PriceCurve from "./PriceCurve";

export default function DerivativesPricerPage() {
  const project = findProject("trading", "derivatives-pricer")!;

  return (
    <div className="pt-10 pb-24">
      <section className="pt-10 border-t border-[var(--paper-line)]">
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-3">
          {project.number} — {CATEGORY_LABEL[project.category]}
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-tight mb-4 text-[var(--ink)]">{project.title}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed mb-8">{project.oneLiner}</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-10">
          <div>
            <p className="font-mono text-xs text-[var(--ink-muted)] mb-4">
              real prices, S=70–130, K={BS_PARAMS.K}, T={BS_PARAMS.T}yr, r={(BS_PARAMS.r * 100).toFixed(0)}%, σ=
              {(BS_PARAMS.sigma * 100).toFixed(0)}%
            </p>
            <div className="border border-[var(--paper-line)] p-5">
              <PriceCurve />
            </div>

            <div className="mt-6">
              <WhyBox label="the formula">
                <p className="mb-2">
                  Closed-form European option pricing: C = S·N(d₁) − K·e<sup>−rT</sup>·N(d₂), P = K·e<sup>−rT</sup>·N(−d₂) − S·N(−d₁),
                  with d₁ = [ln(S/K) + (r + ½σ²)T] / (σ√T) and d₂ = d₁ − σ√T.
                </p>
                <p>
                  N(·) is the standard normal CDF, implemented directly via the complementary error function
                  (<code>0.5·erfc(−x/√2)</code>) rather than a series approximation or a library call — the whole pricer is ~25 lines of
                  real C++, no external math dependency beyond <code>&lt;cmath&gt;</code>.
                </p>
              </WhyBox>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">put-call parity check</p>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">
                The source has no test suite of its own, so this is the actual verification: compiled the real, unmodified
                <code> black_scholes.cpp</code> with a small driver and confirmed C − P equals S − K·e<sup>−rT</sup> exactly, at S={BS_PARITY_CHECK.spot}.
              </p>
              <div className="flex flex-col divide-y divide-[var(--paper-line)] font-mono text-xs">
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-[var(--ink)]">C − P</span>
                  <span className="text-[var(--ink-muted)]">{BS_PARITY_CHECK.callMinusPut.toFixed(6)}</span>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-[var(--ink)]">
                    S − K·e<sup>−rT</sup>
                  </span>
                  <span className="text-[var(--ink-muted)]">{BS_PARITY_CHECK.spotMinusPvStrike.toFixed(6)}</span>
                </div>
              </div>
            </div>

            <div className="border border-[var(--paper-line)] p-5">
              <p className="font-mono text-xs text-[var(--accent)] mb-2">real architecture</p>
              <div className="flex flex-col divide-y divide-[var(--paper-line)]">
                <div className="py-2.5">
                  <p className="text-sm text-[var(--ink)]">black_scholes.cpp / .hpp</p>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-1">the pricing core — pure C++, no dependencies</p>
                </div>
                <div className="py-2.5">
                  <p className="text-sm text-[var(--ink)]">bindings.cpp</p>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-1">pybind11 module exposing black_scholes_price() to Python</p>
                </div>
                <div className="py-2.5">
                  <p className="text-sm text-[var(--ink)]">CMakeLists.txt</p>
                  <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-1">builds the Python extension module via pybind11_add_module</p>
                </div>
              </div>
            </div>

            <WhyBox label="scope, honestly">
              <p>
                European options only — no Greeks, no implied-volatility solver, no American early exercise. It&apos;s a small,
                correct pricing core built to learn the C++/Python binding boundary, not a full pricing library; the parity check
                above is the real bar it clears, not a claim it does more than this.
              </p>
            </WhyBox>
          </div>
        </div>
      </section>

      <Link
        href={`/${project.category}`}
        className="inline-block mt-16 text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
      >
        ← back to {CATEGORY_LABEL[project.category]}
      </Link>
    </div>
  );
}
