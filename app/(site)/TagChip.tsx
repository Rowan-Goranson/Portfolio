import { TAG_COLOR, type Tag } from "./projects-data";

// A fixed-color, sharp-edged taxonomy label — not a pill. Per CLAUDE.md:
// category tags are functional, each gets one consistent color, and that
// color is separate from the single editorial accent used for hover states.
export default function TagChip({ tag }: { tag: Tag }) {
  const color = TAG_COLOR[tag];
  return (
    <span
      className="font-mono text-xs px-1.5 py-0.5 border leading-none"
      style={{ color, borderColor: color }}
    >
      {tag}
    </span>
  );
}
