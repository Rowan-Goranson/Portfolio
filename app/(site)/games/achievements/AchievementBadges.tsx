// Bespoke mini-diagrams, one per game, in that game's own vocabulary —
// chosen over a single shared chart type after reviewing three concepts.
// Everything here is static/deterministic (no randomness, no interaction),
// so this renders fully server-side like the rest of the detail pages.

const ACCENT = "var(--accent)";
const MUTED = "var(--ink-muted)";
const LINE = "var(--paper-line)";
const RECESSED = "var(--paper-recessed)";

function BadgeShell({
  name,
  stat,
  caption,
  children,
}: {
  name: string;
  stat: string;
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--paper-line)] p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="text-[0.98rem] font-semibold text-[var(--ink)]">{name}</span>
        <span className="font-mono text-sm text-[var(--accent)]">{stat}</span>
      </div>
      {children}
      <p className="font-mono text-[11px] text-[var(--ink-muted)] mt-2 leading-relaxed">{caption}</p>
    </div>
  );
}

function ChessGauge() {
  const w = 900,
    h = 130;
  const bands = [
    { from: 0, to: 1000, label: "Beginner", color: RECESSED },
    { from: 1000, to: 1500, label: "Intermediate", color: "#e9e6de" },
    { from: 1500, to: 1800, label: "Advanced", color: "#ddd6c4" },
    { from: 1800, to: 2000, label: "Expert", color: "#c9bfa0" },
    { from: 2000, to: 2200, label: "Master", color: "#b3a687" },
    { from: 2200, to: 2600, label: "Grand Master", color: "#b3a687" }
  ];
  const max = 2600,
    x0 = 20,
    x1 = w - 20,
    bandY = 74,
    lineTop = 68,
    lineBottom = 96;
  const xOf = (v: number) => x0 + ((x1 - x0) * v) / max;
  const bx = xOf(2200);
  const markers = [
    { v: 1937, label: "Chess.com 1937", sub: "~top 1%", mainY: 58, subY: 46 },
    { v: 1991, label: "Lichess 1991", sub: "~top 1%", mainY: 26, subY: 14 },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {bands.map((b) => (
        <g key={b.label}>
          <rect x={xOf(b.from)} y={bandY} width={xOf(b.to) - xOf(b.from)} height={18} fill={b.color} />
          <text x={xOf(b.from) + 4} y={bandY + 33} fontFamily="var(--font-mono)" fontSize={11} fill={MUTED}>
            {b.label}
          </text>
        </g>
      ))}
      <line x1={bx} y1={lineTop - 6} x2={bx} y2={lineBottom + 2} stroke={MUTED} strokeWidth={1.5} strokeDasharray="3,3" />
      <text x={bx} y={40} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill={MUTED}>
        Master 2200+
      </text>
      {markers.map((m) => {
        const x = xOf(m.v);
        return (
          <g key={m.v}>
            <line x1={x} y1={lineTop} x2={x} y2={lineBottom} stroke={ACCENT} strokeWidth={2} />
            <text x={x} y={m.subY} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
              {m.sub}
            </text>
            <text x={x} y={m.mainY} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} fontWeight={600} fill={ACCENT}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CatanBar() {
  const w = 900,
    h = 120,
    x0 = 20,
    x1 = w - 20,
    y = 34,
    pct = 99.98;
  const fillW = (x1 - x0) * (pct / 100);
  const tagY = y + 46;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <rect x={x0} y={y} width={x1 - x0} height={10} fill={RECESSED} />
      <rect x={x0} y={y} width={fillW} height={10} fill={ACCENT} />
      <text x={x0} y={y - 10} fontFamily="var(--font-mono)" fontSize={11} fill={MUTED}>
        0th pct
      </text>
      <text x={x1} y={y - 10} textAnchor="end" fontFamily="var(--font-mono)" fontSize={11} fill={MUTED}>
        100th pct
      </text>
      <text x={x0 + fillW} y={y + 32} textAnchor="end" fontFamily="var(--font-mono)" fontSize={13} fontWeight={600} fill={ACCENT}>
        top ~0.02% (~{pct}th pct)
      </text>
      <rect x={x0} y={tagY} width={340} height={26} fill="none" stroke={ACCENT} strokeWidth={1.5} />
      <text x={x0 + 12} y={tagY + 17} fontFamily="var(--font-mono)" fontSize={11} fill={ACCENT}>
        Finalist — June 2024 World Finals Qualifier
      </text>
    </svg>
  );
}

function PokerDiagram() {
  const w = 900,
    h = 96,
    x0 = 20,
    x1 = w - 20,
    barY = 54,
    total = 6,
    filled = 4;
  const segW = (x1 - x0 - (total - 1) * 8) / total;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <text x={x0} y={26} fontFamily="var(--font-mono)" fontSize={12} fill={MUTED}>
        Team: IPA · Role: Captain
      </text>
      <text x={x1} y={26} textAnchor="end" fontFamily="var(--font-mono)" fontSize={12} fill={MUTED}>
        win share: 66.7%
      </text>
      {Array.from({ length: total }, (_, i) => {
        const sx = x0 + i * (segW + 8);
        const isFilled = i < filled;
        return (
          <rect
            key={i}
            x={sx}
            y={barY - 14}
            width={segW}
            height={28}
            fill={isFilled ? ACCENT : RECESSED}
            stroke={isFilled ? ACCENT : LINE}
            strokeWidth={1}
          />
        );
      })}
      <text x={x0} y={barY + 34} fontFamily="var(--font-mono)" fontSize={11} fill={MUTED}>
        4 of 6 first-place finals wins were mine
      </text>
    </svg>
  );
}

function ZetamacScale() {
  const w = 900,
    h = 110,
    x0 = 20,
    x1 = w - 20,
    y = 40,
    max = 120;
  const xOf = (v: number) => x0 + ((x1 - x0) * v) / max;
  const marks = [
    { v: 97, label: "classic 97", sub: "~85th pct", mainY: 18, subY: 6 },
    { v: 44, label: "hard 44", sub: "~75th pct", mainY: 88, subY: 100 },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={LINE} strokeWidth={2} />
      {[0, 30, 60, 90, 120].map((t) => {
        const x = xOf(t);
        return (
          <g key={t}>
            <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={MUTED} strokeWidth={1} />
            <text x={x} y={y + 24} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
              {t}
            </text>
          </g>
        );
      })}
      {marks.map((m) => {
        const x = xOf(m.v);
        return (
          <g key={m.v}>
            <circle cx={x} cy={y} r={5} fill={ACCENT} />
            <text x={x} y={m.subY} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
              {m.sub}
            </text>
            <text x={x} y={m.mainY} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} fontWeight={600} fill={ACCENT}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HearthstoneBar() {
  const w = 900,
    h = 90,
    x0 = 20,
    x1 = w - 20,
    y = 34,
    pct = 99.9;
  const fillW = (x1 - x0) * (pct / 100);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <rect x={x0} y={y} width={x1 - x0} height={10} fill={RECESSED} />
      <rect x={x0} y={y} width={fillW} height={10} fill={ACCENT} />
      <text x={x0} y={y - 10} fontFamily="var(--font-mono)" fontSize={11} fill={MUTED}>
        0th pct
      </text>
      <text x={x1} y={y - 10} textAnchor="end" fontFamily="var(--font-mono)" fontSize={11} fill={MUTED}>
        100th pct
      </text>
      <text x={x0 + fillW} y={y + 32} textAnchor="end" fontFamily="var(--font-mono)" fontSize={13} fontWeight={600} fill={ACCENT}>
        peak Legend rank (~{pct}th pct)
      </text>
    </svg>
  );
}

function SlaySpireBar() {
  const w = 900,
    h = 90,
    x0 = 20,
    x1 = w - 20,
    y = 40,
    max = 20;
  const xOf = (v: number) => x0 + ((x1 - x0) * v) / max;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={LINE} strokeWidth={2} />
      {[0, 5, 10, 15, 20].map((t) => {
        const x = xOf(t);
        return (
          <g key={t}>
            <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={MUTED} strokeWidth={1} />
            <text x={x} y={y + 24} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={MUTED}>
              {`A${t}`}
            </text>
          </g>
        );
      })}
      <circle cx={xOf(max)} cy={y} r={5} fill={ACCENT} />
      <text x={xOf(max)} y={y - 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize={11} fontWeight={600} fill={ACCENT}>
        A20 (max)
      </text>
    </svg>
  );
}

export default function AchievementBadges() {
  return (
    <div>
      <p className="font-mono text-xs text-[var(--ink-muted)] mb-8">
        Rough estimates for context where noted with a ~ — not verified statistics. Everything else is exact.
      </p>

      <div className="flex flex-col gap-6">
        <BadgeShell
          name="Chess (rapid)"
          stat="1991 / 1937"
          caption="Best win vs. a 1857 FIDE-rated opponent (~top 15% of the FIDE pool) · FIDE tournaments won: —"
        >
          <ChessGauge />
        </BadgeShell>

        <BadgeShell name="Catan — colonist.io" stat="#96 world rank" caption="colonist.io world leaderboard">
          <CatanBar />
        </BadgeShell>

        <BadgeShell
          name="Poker — Intercollegiate Poker Association (captain)"
          stat="$12,000 earnings"
          caption="Team tournament earnings · 6th out of 40 teams"
        >
          <PokerDiagram />
        </BadgeShell>

        <BadgeShell name="Zetamac" stat="97 / 44" caption="Peak correct answers in 60 seconds — classic vs. hard operator mix">
          <ZetamacScale />
        </BadgeShell>

        <BadgeShell name="Hearthstone (Gambler688)" stat="Top 1000" caption="Peak Legend rank">
          <HearthstoneBar />
        </BadgeShell>

        <BadgeShell name="Slay the Spire — The Silent" stat="A20 (max)" caption="Fully climbed to max ascension">
          <SlaySpireBar />
        </BadgeShell>
      </div>
    </div>
  );
}
