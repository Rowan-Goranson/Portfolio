import type { Resource } from "./constants";

export interface HexTile {
  index: number;
  resource: Resource | "desert";
  diceNumber: number | null;
  nodeIds: string[];
}

export interface BoardNode {
  id: string;
  adjHexes: number[];
  connectedNodes: Set<string>;
  port: string | null;
}

export interface BoardEdge {
  a: string;
  b: string;
}

export interface Board {
  hexes: HexTile[];
  nodes: Record<string, BoardNode>;
  edges: BoardEdge[];
}

export type Strategy =
  | "OWS"
  | "OWS_HYBRID"
  | "ROAD"
  | "CITIES&ROADS"
  | "BALANCED"
  | "PORT"
  | "PRODUCTION";

export type Bucket =
  | "Production & Pips"
  | "Resource Scarcity"
  | "Ports"
  | "Diversity & Synergy"
  | "Pair Setup"
  | "Strategy Bonus";

export interface ScoreLine {
  key: string;
  label: string;
  bucket: Bucket;
  amount: number;
}

export interface ScoreResult {
  total: number;
  breakdown: ScoreLine[];
}

export interface PairResult {
  node1: string;
  node2: string;
  total: number;
  strategy: Strategy;
  breakdown: ScoreLine[];
}

export interface DraftPick {
  seat: number;
  round: 1 | 2;
  nodeId: string;
  isUser: boolean;
}

export interface DraftResult {
  picks: DraftPick[];
  userPair: PairResult;
  pickRankInfo: { consideredPairs: number; chosenRank: number } | null;
}
