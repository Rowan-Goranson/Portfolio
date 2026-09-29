import { scoreNode, scoreNodeSynergy } from "./scoring";
import type { Board, PairResult, ScoreLine } from "./types";

const CANDIDATE_POOL = 14; // top individual nodes considered as a first-settlement candidate
const SHORTLIST_SIZE = 4; // additional runner-up pairs shown below the top pick

function withOrigin(lines: ScoreLine[], origin: "Spot A" | "Spot B"): ScoreLine[] {
  return lines.map((l) => ({ ...l, label: `${origin}: ${l.label}` }));
}

export function computeRecommendation(board: Board): { top: PairResult; shortlist: PairResult[] } {
  // A node touching only one hex produces off a single dice number and
  // resource — never a real candidate, so it's excluded from consideration
  // entirely rather than just scored low.
  const nodeIds = Object.keys(board.nodes).filter((id) => board.nodes[id].adjHexes.length > 1);
  const individual = new Map(nodeIds.map((id) => [id, scoreNode(board, id)] as const));

  const candidates = [...nodeIds]
    .sort((a, b) => individual.get(b)!.total - individual.get(a)!.total)
    .slice(0, CANDIDATE_POOL);

  const pairs = new Map<string, PairResult>();

  for (const node1 of candidates) {
    const excluded = new Set([node1, ...board.nodes[node1].connectedNodes]);
    let best: { node2: string; total: number } | null = null;

    for (const node2 of nodeIds) {
      if (excluded.has(node2)) continue;
      const synergy = scoreNodeSynergy(board, node1, node2);
      const total = individual.get(node1)!.total + individual.get(node2)!.total + synergy.total;
      if (!best || total > best.total) best = { node2, total };
    }
    if (!best) continue;

    const key = [node1, best.node2].sort().join("|");
    if (pairs.has(key) && pairs.get(key)!.total >= best.total) continue;

    const synergy = scoreNodeSynergy(board, node1, best.node2);
    pairs.set(key, {
      node1,
      node2: best.node2,
      total: best.total,
      strategy: synergy.strategy,
      breakdown: [
        ...withOrigin(individual.get(node1)!.breakdown, "Spot A"),
        ...withOrigin(individual.get(best.node2)!.breakdown, "Spot B"),
        ...synergy.breakdown,
      ],
    });
  }

  const ranked = [...pairs.values()].sort((a, b) => b.total - a.total);
  const [top, ...rest] = ranked;
  return { top, shortlist: rest.slice(0, SHORTLIST_SIZE) };
}
