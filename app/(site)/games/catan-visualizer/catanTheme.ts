import type { Resource } from "@/lib/catan/constants";

// Resource hex colors — a new, separate taxonomy from the site's TAG_COLOR
// (game resources, not content categories), muted to sit inside the
// paper/ink palette rather than a saturated cartoon board. Brick is kept a
// clay brown rather than a red so it never competes with --accent, which
// this page reuses as the "this is the algorithm's pick" highlight color.
export const RESOURCE_COLOR: Record<Resource | "desert", string> = {
  wood: "#4a6b45",
  brick: "#8a5a3c",
  sheep: "#b7c98a",
  wheat: "#b99a4e",
  ore: "#7a7f85",
  desert: "#d9c9a3",
};

// Text color for numerals drawn on each resource's dice-number token —
// dark resources need a light numeral for contrast.
export const RESOURCE_TEXT: Record<Resource | "desert", string> = {
  wood: "#f3f1ea",
  brick: "#f3f1ea",
  sheep: "#1b1d17",
  wheat: "#1b1d17",
  ore: "#f3f1ea",
  desert: "#1b1d17",
};
