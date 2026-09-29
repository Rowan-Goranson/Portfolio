import Link from "next/link";
import IntroRipple from "./IntroRipple";
import IntroRippleOverlap from "./IntroRippleOverlap";
import IntroLeWitt from "./IntroLeWitt";
import { HomeTradingLine, HomeResearchLine, HomeGamesLine } from "./HomePreviews";
import HomeProofStrip from "./HomeProofStrip";

const tradingSection = {
  title: "Trading Algorithms",
  href: "/trading",
  desc: "A live Kalshi weather-trading system with real PnL, the execution stack behind it, as well as equity backtest and C++ derivatives pricer",
};

const otherSections = [
  { title: "Strategy Games", href: "/games", desc: "Settlers of Catan, Chess, Poker, etc; Game-theoretic simulation and optimization, peak ranks, and more" },
  { title: "Research (ML & Econometrics)", href: "/research", desc: "Senior Honors Thesis on prediction markets, skew-probit and Bradley-Terry sports models, and other group projects" },
];

// One real preview per category — bare accent-stroke lines (HomePreviews.tsx),
// not the bordered card thumbnails used elsewhere, so the homepage keeps
// "figures are the content" but in its own quieter, boxless register.
const CATEGORY_PREVIEWS: Record<string, () => React.ReactElement> = {
  "/trading": HomeTradingLine,
  "/research": HomeResearchLine,
  "/games": HomeGamesLine,
};

// Homepage order: Trading, Research, Games. Sports was folded into Research
// — it never had more than one real project of its own.
const allCategories = [
  tradingSection,
  otherSections.find((s) => s.href === "/research")!,
  otherSections.find((s) => s.href === "/games")!,
];

const description =
  "I'm a current college senior passionate about Markets, Games, and Machine Learning. Explore my project portfolio and accomplishments, including a Prediction Markets trading algorithm with live PnL, a ML algorithm to determine optimal Catan placements, March Madness spread predictors, and much more";

function LinkList({
  sections,
  inward = true,
  divided = false,
  rightAligned = [],
  previews,
}: {
  sections: { title: string; href: string; desc: string }[];
  inward?: boolean;
  divided?: boolean;
  rightAligned?: string[];
  previews?: Record<string, () => React.ReactElement>;
}) {
  return (
    <div
      className={`flex flex-col items-stretch ${inward ? "md:pr-[8%]" : ""} ${
        divided ? "divide-y divide-[var(--paper-line)]" : "gap-8"
      }`}
    >
      {sections.map((s) => {
        const right = rightAligned.includes(s.href);
        const Preview = previews?.[s.href];
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`group flex items-center gap-5 ${divided ? "py-8 first:pt-0" : ""} ${
              right ? "justify-end flex-row-reverse" : "justify-start"
            }`}
          >
            <div className={right ? "flex-1 text-right" : "flex-1"}>
              <div className="text-[1.5rem] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                {s.title}
              </div>
              <p className="mt-1.5 text-base text-[var(--ink-muted)]">{s.desc}</p>
            </div>
            {Preview && (
              <div className="hidden sm:flex w-44 md:w-64 aspect-[4/3] shrink-0 items-center justify-center -my-2">
                <Preview />
              </div>
            )}
            <span className="text-[var(--ink-muted)] text-sm font-mono shrink-0 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all">
              ↗
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// name=1 — stacked lowercase, goranson indented under the "n" of rowan
function NameStackedIndent() {
  return (
    <h1 className="font-light text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-tight">
      <span className="block text-[var(--ink)]">rowan</span>
      <span className="block text-[var(--accent)]" style={{ marginLeft: "3.4ch" }}>goranson</span>
    </h1>
  );
}

// name=3 — large serif "rowan", "goranson" in red small caps, wide tracking, beneath
function NameSerifSmallCaps() {
  return (
    <div>
      <div className="text-[clamp(3rem,6vw,5rem)] font-normal leading-[0.95] tracking-tight text-[var(--ink)]">rowan</div>
      <div
        className="mt-3 text-lg font-semibold tracking-[0.3em] text-[var(--accent)]"
        style={{ fontVariantCaps: "small-caps" }}
      >
        goranson
      </div>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const introParam = one(sp.intro);
  const vParam = Number(one(sp.v));
  const nameParam = Number(one(sp.name));

  const variant = ([1, 2, 3] as const).includes(vParam as 1 | 2 | 3) ? (vParam as 1 | 2 | 3) : 1;
  // Default is now ripple + name=2 ("on the line") — the chosen direction.
  // Still overridable via ?name= for reference against the other studies.
  const nameVariant = [1, 2, 3, 4].includes(nameParam) ? nameParam : 2;

  // Default is now the LeWitt Arcs system (v=2) — nine concentric arcs from
  // each corner and side midpoint, overlapping where they naturally cross,
  // and static once drawn (no idle drift). Ripple and the line-overlap
  // study both stay reachable as known-good fallbacks (?intro=ripple,
  // ?intro=overlap); explicit ?intro=lewitt&v=1/2/3 still picks any LeWitt
  // system directly.
  const intro =
    introParam === "lewitt" ? (
      <IntroLeWitt variant={variant} fadeMask={nameVariant === 2} />
    ) : introParam === "ripple" ? (
      <IntroRipple fadeMask={nameVariant === 2} />
    ) : introParam === "overlap" ? (
      <IntroRippleOverlap fadeMask={nameVariant === 2} />
    ) : (
      <IntroLeWitt variant={2} fadeMask={nameVariant === 2} />
    );

  return (
    <div>
      {/* Phase 1 — full viewport, line field only. Kept at h-screen (not
          shortened) because the SVG uses preserveAspectRatio="none" — it
          stretches to exactly fill this box, so any height other than the
          viewport's own visibly squishes the artwork. The "less scrolling"
          goal is handled below instead, by pulling phase 2 up over this
          section's tail with a negative margin rather than shrinking the
          box the artwork renders into. */}
      <section className="intro-phase relative h-screen w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden">
        {intro}
        {nameVariant === 2 && (
          // name=2 — set on one of the intro's lines, as if written on the
          // drawing. Approximated at the field's vertical center rather than
          // tracing a specific line's exact curve. The lines themselves fade
          // out under this text (see IntroRipple's fadeMask prop) instead of
          // being covered by an opaque box.
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-[7vw]">
            <p className="font-light text-[clamp(1rem,2vw,1.375rem)] leading-snug tracking-tight text-[var(--ink-muted)] max-w-[46ch] mb-4">
                    live systematic trading in prediction markets, fixed-income quantitative research at Tradeweb, Dual econ-math honors thesis, and top-tier
                    competitor across chess, catan, and poker
            </p>
            <h1 className="font-light text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight">
              <span className="text-[var(--ink)]">rowan</span> <span className="text-[var(--accent)]">goranson</span>
            </h1>
          </div>
        )}
        {/* Fixed to the true viewport, not this section's own box — the
            section starts below the sticky header, so an absolute position
            tied to the section's own bottom edge sits past the fold.
            Shares the intro's scroll-driven fade via .intro-layer. */}
        <div className="intro-layer fixed inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="font-mono text-[10px] tracking-widest text-[var(--ink-muted)]">SCROLL</span>
          <span className="text-xs text-[var(--ink-muted)]" aria-hidden="true">↓</span>
        </div>
      </section>

      {/* Phase 2 — content, fades in as the intro fades out. Negative
          margin pulls this up over the intro section's own tail end (an
          opaque background so it cleanly covers rather than showing lines
          through), which is what actually shortens the scroll distance —
          see the note on the intro-phase section above. */}
      <div className="content-phase relative left-1/2 right-1/2 -mx-[50vw] w-screen px-[7vw] py-24 -mt-[28vh] bg-[var(--paper)]">
        {nameVariant === 4 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 min-h-[60vh]">
            <div className="flex items-center justify-center">
              <div className="max-w-md">
                <h1 className="font-light text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-tight text-[var(--ink)]">
                  rowan
                </h1>
                <p className="mt-6 text-base text-[var(--ink-muted)] leading-relaxed">{description}</p>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center md:pr-[8%]">
              <h1 className="font-light text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-tight text-[var(--accent)] mb-10">
                goranson
              </h1>
              <LinkList sections={[tradingSection, ...otherSections]} inward={false} />
            </div>
          </div>
        ) : (
          <div>
            {nameVariant === 3 ? (
              <NameSerifSmallCaps />
            ) : nameVariant === 2 ? (
              // Real content, not decoration — .intro-phase (where the
              // "on the line" instance lives) is display:none under
              // prefers-reduced-motion, so this fallback is the only
              // copy of the name reduced-motion users would otherwise see.
              <div className="name-reduced-fallback hidden">
                <p className="font-light text-lg leading-snug tracking-tight text-[var(--ink-muted)] max-w-[46ch] mb-4">
                  Live systematic trading in prediction markets, fixed-income quantitative research at Tradeweb, Dual Econ-Math Honors Thesis, and top-tier
                  competitor across Chess, Catan, and Poker
                </p>
                <h1 className="font-light text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-tight mb-6">
                  <span className="text-[var(--ink)]">rowan</span> <span className="text-[var(--accent)]">goranson</span>
                </h1>
              </div>
            ) : (
              <NameStackedIndent />
            )}

            {/* Proof strip of three externally-groundable numbers so the
                biggest signals don't require digging into a category to
                find. The positioning statement itself now lives up in the
                intro hero, above the name, instead of being repeated here. */}
            <div className="mb-14">
              <HomeProofStrip />
            </div>

            {/* Just the four categories, Trading first, one plain divided
                list — no bio, no separate hero treatment for Trading.
                Only Research is right-aligned; the rest sit left. Real
                preview visuals (same ones used on the project cards) carry
                the same "figures are the content" rule onto the homepage. */}
            <LinkList
              sections={allCategories}
              inward={false}
              divided
              rightAligned={["/research"]}
              previews={CATEGORY_PREVIEWS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
