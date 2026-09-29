// Direct port of the Python repo's src/constants.py (placement-relevant
// subset only — dev-card/game-loop constants are not needed here).
// https://github.com/Rowan-Goranson/Settlers-of-Catan-Placement-Algorithm

export const RESOURCES = ["wood", "brick", "sheep", "ore", "wheat"] as const;
export type Resource = (typeof RESOURCES)[number];

export const SYNERGY_RESOURCES: [Resource, Resource][] = [
  ["wood", "brick"],
  ["ore", "wheat"],
];

export const DICE_NUMBERS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

export const TILE_DISTRIBUTION: Record<Resource | "desert", number> = {
  wood: 4,
  brick: 3,
  sheep: 4,
  ore: 3,
  wheat: 4,
  desert: 1,
};

// hex index -> the 6 node ids around it, in a fixed winding order.
export const HEX_TO_NODE_MAP: Record<number, string[]> = {
  0: ["node_0", "node_1", "node_2", "node_3", "node_4", "node_5"],
  1: ["node_2", "node_6", "node_7", "node_8", "node_9", "node_3"],
  2: ["node_7", "node_10", "node_11", "node_12", "node_13", "node_8"],
  3: ["node_14", "node_5", "node_4", "node_17", "node_16", "node_15"],
  4: ["node_4", "node_3", "node_9", "node_19", "node_18", "node_17"],
  5: ["node_9", "node_8", "node_13", "node_21", "node_20", "node_19"],
  6: ["node_13", "node_12", "node_51", "node_22", "node_52", "node_21"],
  7: ["node_23", "node_15", "node_16", "node_26", "node_25", "node_24"],
  8: ["node_16", "node_17", "node_18", "node_28", "node_27", "node_26"],
  9: ["node_18", "node_19", "node_20", "node_30", "node_29", "node_28"],
  10: ["node_20", "node_21", "node_52", "node_32", "node_31", "node_30"],
  11: ["node_52", "node_22", "node_53", "node_34", "node_33", "node_32"],
  12: ["node_25", "node_26", "node_27", "node_37", "node_36", "node_35"],
  13: ["node_27", "node_28", "node_29", "node_39", "node_38", "node_37"],
  14: ["node_29", "node_30", "node_31", "node_41", "node_40", "node_39"],
  15: ["node_31", "node_32", "node_33", "node_43", "node_42", "node_41"],
  16: ["node_36", "node_37", "node_38", "node_46", "node_45", "node_44"],
  17: ["node_38", "node_39", "node_40", "node_48", "node_47", "node_46"],
  18: ["node_40", "node_41", "node_42", "node_50", "node_49", "node_48"],
};

// The 6 corner hexes of the board — a node-set match against one of these
// means that node sits at an outer corner (used for a placement bonus).
export const CORNER_HEXES: Record<number, string[]> = {
  0: ["node_0", "node_1", "node_2", "node_3", "node_4", "node_5"],
  1: ["node_7", "node_10", "node_11", "node_12", "node_13", "node_8"],
  2: ["node_23", "node_15", "node_16", "node_26", "node_25", "node_24"],
  3: ["node_52", "node_22", "node_53", "node_34", "node_33", "node_32"],
  4: ["node_36", "node_37", "node_38", "node_46", "node_45", "node_44"],
  5: ["node_40", "node_41", "node_42", "node_50", "node_49", "node_48"],
};

export const PORT_TYPES = ["3:1", "3:1", "3:1", "3:1", "2:1_brick", "2:1_wood", "2:1_ore", "2:1_wheat", "2:1_sheep"];

export const PORT_LOCATION = [
  "node_0", "node_1",
  "node_6", "node_7",
  "node_12", "node_51",
  "node_53", "node_34",
  "node_42", "node_43",
  "node_48", "node_47",
  "node_45", "node_44",
  "node_35", "node_25",
  "node_15", "node_14",
];

export const PIP_WEIGHTS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};
