// Port of the 4-player draft orchestration from the Python repo:
// src/bot.py (choose_first_placement, choose_second_placement,
// simulate_opponent_picks, opponents_before_second_pick) and
// src/game.py (pick_random_settle), sequenced the way src/main.py actually
// runs a game's setup phase.
//
// Preserved as-is (not "fixed"): choose_first_placement's pair-scoring loop
// never excludes adjacent node pairs from consideration when ranking
// candidates — it only ever returns a single node from the winning pair, so
// nothing illegal gets placed, but the ranking itself can rate an
// unplaceable adjacent pair highly.
//
// Fixed here (per explicit request): the source's simulate_opponent_picks
// is called with taken_nodes = {node1_id} only, ignoring the real board's
// actual already-taken nodes at that point in the draft — its "is my
// second-favorite spot safe?" estimate was always computed as if the board
// were otherwise empty. Here it's passed the real running `taken` set (plus
// node1) so the risk estimate reflects what's actually already placed.
//
// Added here (per explicit request): the user's own picks (chooseFirstPlacement
// / chooseSecondPlacement) never consider a node touching only one hex — it
// produces off a single dice number and resource, so it's excluded outright
// rather than merely scored low. Random opponents are untouched (they're
// deliberately naive, per the source's own pick_random_settle).

import { shuffle } from "./board";
import { generateCandidateNodes, scoreNode, scoreNodeSynergy } from "./scoring";
import type { Board, DraftPick, DraftResult, PairResult } from "./types";

function opponentsBeforeSecondPick(seat: number): number {
  return { 0: 6, 1: 4, 2: 2, 3: 0 }[seat] ?? 0;
}

function pickRandomSettle(board: Board, taken: Set<string>): string {
  const remaining = Object.keys(board.nodes).filter((id) => !taken.has(id));
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function simulateOpponentPicks(board: Board, taken: Set<string>, node1Id: string, userSeat: number, m = 2): Set<string> {
  const k = opponentsBeforeSecondPick(userSeat);
  const openNodes = generateCandidateNodes(board, new Set([...taken, node1Id]));
  const scored = openNodes
    .map((n) => [n, scoreNode(board, n).total] as const)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const topCandidates = scored.slice(0, k + m).map(([n]) => n);
  const sampleSize = Math.min(k, topCandidates.length);
  return new Set(shuffle(topCandidates).slice(0, sampleSize));
}

function chooseFirstPlacement(
  board: Board,
  taken: Set<string>,
  userSeat: number
): { node: string; pickRankInfo: { consideredPairs: number; chosenRank: number } } {
  const sortedIds = [...Object.keys(board.nodes)].sort();
  const pairs: { node1: string; node2: string; total: number; score1: number; score2: number }[] = [];

  for (let i = 0; i < sortedIds.length; i++) {
    for (let j = i + 1; j < sortedIds.length; j++) {
      const node1 = sortedIds[i];
      const node2 = sortedIds[j];
      if (taken.has(node1) || taken.has(node2)) continue;
      if (board.nodes[node1].adjHexes.length === 1 || board.nodes[node2].adjHexes.length === 1) continue;
      const score1 = scoreNode(board, node1).total;
      const score2 = scoreNode(board, node2).total;
      const synergy = scoreNodeSynergy(board, node1, node2).total;
      pairs.push({ node1, node2, total: score1 + score2 + synergy, score1, score2 });
    }
  }

  const ranked = [...pairs].sort((a, b) => b.total - a.total);

  for (let rank = 0; rank < ranked.length; rank++) {
    const pair = ranked[rank];
    const simulated = simulateOpponentPicks(board, taken, pair.node1, userSeat);
    if (!simulated.has(pair.node2)) {
      return {
        node: pair.score1 >= pair.score2 ? pair.node1 : pair.node2,
        pickRankInfo: { consideredPairs: ranked.length, chosenRank: rank + 1 },
      };
    }
  }

  const top = ranked[0];
  return {
    node: top.score1 >= top.score2 ? top.node1 : top.node2,
    pickRankInfo: { consideredPairs: ranked.length, chosenRank: 1 },
  };
}

function chooseSecondPlacement(board: Board, firstNodeId: string, taken: Set<string>): string {
  let bestNode: string | null = null;
  let bestScore = -Infinity;
  for (const node2 of Object.keys(board.nodes)) {
    if (node2 === firstNodeId || taken.has(node2)) continue;
    if (board.nodes[node2].adjHexes.length === 1) continue;
    const score1 = scoreNode(board, firstNodeId).total;
    const score2 = scoreNode(board, node2).total;
    const synergy = scoreNodeSynergy(board, firstNodeId, node2).total;
    const total = score1 + score2 + synergy;
    if (total > bestScore) {
      bestScore = total;
      bestNode = node2;
    }
  }
  return bestNode!;
}

export function runDraft(board: Board, userSeat: number): DraftResult {
  const taken = new Set<string>();
  const picks: DraftPick[] = [];
  const firstNodes: Record<number, string> = {};
  let pickRankInfo: { consideredPairs: number; chosenRank: number } | null = null;

  const claim = (nodeId: string) => {
    taken.add(nodeId);
    for (const n of board.nodes[nodeId].connectedNodes) taken.add(n);
  };

  for (const seat of [0, 1, 2, 3]) {
    let node: string;
    if (seat === userSeat) {
      const result = chooseFirstPlacement(board, taken, userSeat);
      node = result.node;
      pickRankInfo = result.pickRankInfo;
    } else {
      node = pickRandomSettle(board, taken);
    }
    firstNodes[seat] = node;
    claim(node);
    picks.push({ seat, round: 1, nodeId: node, isUser: seat === userSeat });
  }

  let userNode2 = "";
  for (const seat of [3, 2, 1, 0]) {
    let node2: string;
    if (seat === userSeat) {
      node2 = chooseSecondPlacement(board, firstNodes[userSeat], taken);
      userNode2 = node2;
    } else {
      node2 = pickRandomSettle(board, taken);
    }
    claim(node2);
    picks.push({ seat, round: 2, nodeId: node2, isUser: seat === userSeat });
  }

  const node1 = firstNodes[userSeat];
  const synergy = scoreNodeSynergy(board, node1, userNode2);
  const score1 = scoreNode(board, node1);
  const score2 = scoreNode(board, userNode2);
  const withOrigin = (lines: typeof score1.breakdown, origin: "Spot A" | "Spot B") =>
    lines.map((l) => ({ ...l, label: `${origin}: ${l.label}` }));

  const userPair: PairResult = {
    node1,
    node2: userNode2,
    total: score1.total + score2.total + synergy.total,
    strategy: synergy.strategy,
    breakdown: [...withOrigin(score1.breakdown, "Spot A"), ...withOrigin(score2.breakdown, "Spot B"), ...synergy.breakdown],
  };

  return { picks, userPair, pickRankInfo };
}
