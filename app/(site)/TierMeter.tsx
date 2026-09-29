import { TIER_VALUE, TIER_ORDER, TIER_COLOR, type Tier } from "./skills-data";

// A 4-square meter, filled up to the tier's value — makes the 4-level scale
// legible at every single skill row (not just in one legend the reader has
// to remember), and the same component builds the legend itself so the two
// can never drift out of sync.
export default function TierMeter({ tier, size = 5 }: { tier: Tier; size?: number }) {
  const value = TIER_VALUE[tier];
  return (
    <span className="inline-flex gap-[2px] items-center" aria-hidden="true">
      {TIER_ORDER.map((t, i) => (
        <span
          key={t}
          style={{
            width: size,
            height: size,
            backgroundColor: i < value ? TIER_COLOR[tier] : "transparent",
            border: `1px solid ${i < value ? TIER_COLOR[tier] : "var(--paper-line)"}`,
          }}
        />
      ))}
    </span>
  );
}
