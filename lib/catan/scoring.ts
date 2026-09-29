// Port of the placement-scoring subset of the Python repo's src/bot.py
// (score_node, score_node_synergy, and their helpers). Weight VALUES are
// unchanged from the source — this is a faithful port, not a rebalance.
//
// One fix applied: the source dict defines 'scarce_res>4pips_corner' but
// score_node looks up 'scarce_res>4pips+corner' (a typo that would raise a
// KeyError in Python whenever that branch fires — i.e. it never successfully
// ran in the original). Ported here using the intended 0.05 value, matching
// the naming pattern of its two sibling entries ('scarce_res_2pips+corner',
// 'scarce_res_3pips+corner') which both use '+corner'.
//
// Preserved as-is: 'no_ports' is stored as -0.1 and applied via
// `node_score -= SCORING_WEIGHTS['no_ports']`, which nets to +0.1 (having NO
// port outscores having exactly one, at +0.075). That looks inverted from
// what "ports are good" intuition would suggest, but it's the actual
// tuned/backtested behavior of the original algorithm, not a rendering bug —
// left untouched so the visualizer reflects what the algorithm really does.
//
// Fixed here (per explicit request, after measuring): OWS/OWS_HYBRID were
// recommended far more often than other strategies. The first attempt —
// trimming the OWS/OWS_HYBRID strategy weights — barely moved the needle
// (still ~60-70% OWS across 200 random boards) because the real cause was
// elsewhere: OWS_ratio_bonus_magnifier was 0.005 against a distance term
// that maxes out around 2, so `owsPipBalanceScore`'s
// `max(0, 1.5 - distance*magnifier)` was effectively always ~1.5 regardless
// of actual ore/wheat/sheep balance — a near-constant +1.5 add-on any time
// OWS qualified, not a bonus that responds to input at all. Rescaled to
// 0.75 so the full [0, 2] distance range spans the intended [0, 1.5] bonus
// range. `CITIES&ROADS_balance_score` had the exact same 0.005-magnifier
// bug (same formula shape) and is fixed the same way, for the same reason.
//
// Fixed here: `is_ows_hybrid_setup`'s "at least one other resource"
// condition (`other.size > 0`, where `other` can only ever be wood and/or
// brick) also matched pairs with BOTH wood and brick present — i.e. all 5
// resources, a genuinely BALANCED setup — and this branch is checked before
// BALANCED in the elif chain. Measured: ~73% of pairs that satisfy
// `is_balanced_setup` were being classified OWS_HYBRID before BALANCED was
// ever reached. Tightened to `other.size === 1` (a real "OWS plus a little
// of one other thing" hybrid, not five-resource balance in disguise).
//
// Tuned here (per explicit request): the whole Strategy Bonus bucket was
// dominating pair scores relative to every other bucket (Pair Setup tops
// out around 0.85; individual node scores rarely exceed ~1-2), because a
// qualifying strategy handed out 0.5-1.83 on its own, before any balance
// bonus. All seven strategy weights (OWS, OWS_HYBRID, ROAD, CITIES&ROADS,
// BALANCED, PORT, PRODUCTION) scaled by 0.6, preserving their relative
// order.
//
// Added here (per explicit request, not in the original source): a node
// touching only one hex (18 of the 54 nodes — the board's outer corners)
// produces off a single dice number and resource, so it's excluded outright
// wherever a pair is chosen (recommend.ts's candidate pool, draft.ts's
// chooseFirstPlacement/chooseSecondPlacement) rather than merely scored
// low. Also new: `ore_no_wheat_penalty` — a settlement pair with ore
// production but zero wheat can never build a city on its own (costs
// 3 ore + 2 wheat), so that combination now takes a large penalty in
// scoreNodeSynergy.

import { CORNER_HEXES, PIP_WEIGHTS, RESOURCES, SYNERGY_RESOURCES, TILE_DISTRIBUTION } from "./constants";
import type { Board, HexTile, ScoreLine, ScoreResult, Strategy } from "./types";

export const SCORING_WEIGHTS = {
  "single_pips>11": 0.06,
  "single_pips<=11>=9": 0.04,
  "single_pips<=7_penalty": 1.365,
  scarce_res_bonus: 0.02,
  scarce_res_2pips: 0,
  "scarce_res_2pips+corner": 0.05,
  scarce_res_3pips: 0.05,
  "scarce_res_3pips+corner": 0.05,
  "scarce_res>4pips": 0.1,
  "scarce_res>4pips+corner": 0.05,
  // Port weights scaled by 0.4 from their originals (no_ports: -.1,
  // 1_port/2_ports: .075, port_synergy: .1) — per node, ports could add up
  // to .175 versus a pip bonus topping out at .06, so port access was
  // outweighing production probability by ~3x. Now ports still matter
  // (.07 max) without dominating pips.
  no_ports: -0.04,
  "1_port": 0.03,
  "2_ports": 0.03,
  port_synergy: 0.04,
  number_diversity: 0.05,
  resource_synergy: 0.1,
  ore_check: 0.735,
  // Replaces the old '3hexes' weight, which was a -1.31 PENALTY applied
  // when a node touched exactly 3 hexes (using a desert-excluding count,
  // not raw adjacency) — backwards from the intended model: a full 3-hex
  // intersection is the favorable spot, a 2-hex edge is only slightly
  // worse, and a 1-hex corner is already excluded outright elsewhere
  // (never a scoring path). Same bug exists in the Python source (ported
  // faithfully until now); fixed in both per explicit request. Uses raw
  // hex adjacency count, not the old desert-excluding metric.
  hex_count_3: 0.2,
  hex_count_2: -0.2,

  "2spot_pips>10.3": 0.4,
  "2spot_pips<=10.3>=9": 0.3,
  "2spot_number_diversity=5": 0.1,
  "2spot_number_diversity=6": 0.2,
  "2spot_port_synergy": 0.06, // scaled by 0.4, same reason as the per-node port weights above
  "2spot_settle_spot": 0.1,
  // A settlement pair producing ore but zero wheat can never build a city
  // (costs 3 ore + 2 wheat, per COSTS_CARD) with its own production — a
  // large, deliberate penalty since this shouldn't be recommended at all.
  ore_no_wheat_penalty: 2.5,

  OWS: 0.68,
  OWS_ratio_bonus_magnifier: 0.75,
  OWS_HYBRID: 1.1,
  ROAD: 0.66,
  ROAD_settle_spot_magnifier: 0.005,
  "CITIES&ROADS": 0.3,
  "CITIES&ROADS_balance_score": 0.75,
  BALANCED: 0.9,
  PORT: 0.35,
  PRODUCTION: 0.07,
} as const;

type ResourceTier = "scarce" | "plentiful" | "normal";

function analyzeResources(board: Board): Record<string, ResourceTier> {
  const scores: Record<string, ResourceTier> = {};
  for (const resource of RESOURCES) {
    let pipCount = 0;
    for (const hex of board.hexes) {
      if (hex.resource !== resource) continue;
      pipCount += hex.diceNumber !== null ? PIP_WEIGHTS[hex.diceNumber] : 0;
    }
    const avg = pipCount / TILE_DISTRIBUTION[resource];
    scores[resource] = avg < 2.6 ? "scarce" : avg > 3.87 ? "plentiful" : "normal";
  }
  return scores;
}

function scorePips(board: Board, nodeId: string, nodeId2?: string): number {
  let total = 0;
  for (const hexIndex of board.nodes[nodeId].adjHexes) {
    const hex = board.hexes[hexIndex];
    if (hex.diceNumber !== null) total += PIP_WEIGHTS[hex.diceNumber];
  }
  if (nodeId2) {
    for (const hexIndex of board.nodes[nodeId2].adjHexes) {
      const hex = board.hexes[hexIndex];
      if (hex.diceNumber !== null) total += PIP_WEIGHTS[hex.diceNumber];
    }
  }
  return total;
}

function checkCorner(hex: HexTile): boolean {
  const scanned = [...hex.nodeIds].sort();
  return Object.values(CORNER_HEXES).some((corner) => {
    const sorted = [...corner].sort();
    return sorted.length === scanned.length && sorted.every((v, i) => v === scanned[i]);
  });
}

function numberDiversityIsThree(board: Board, nodeId: string): boolean {
  const nums = new Set<number>();
  for (const hexIndex of board.nodes[nodeId].adjHexes) {
    const hex = board.hexes[hexIndex];
    if (hex.resource !== "desert" && hex.diceNumber !== null) nums.add(hex.diceNumber);
  }
  return nums.size === 3;
}

function numberDiversityCount(board: Board, nodeId: string, nodeId2: string): number {
  const nums = new Set<number>();
  for (const nid of [nodeId, nodeId2]) {
    for (const hexIndex of board.nodes[nid].adjHexes) {
      const hex = board.hexes[hexIndex];
      if (hex.resource !== "desert" && hex.diceNumber !== null) nums.add(hex.diceNumber);
    }
  }
  return nums.size;
}

function checkResSynergy(board: Board, nodeId: string): boolean {
  const resources = new Set(board.nodes[nodeId].adjHexes.map((i) => board.hexes[i].resource));
  return SYNERGY_RESOURCES.some((pair) => pair.every((r) => resources.has(r)));
}

function checkPort(board: Board, nodeId: string): Set<string> {
  const ports = new Set<string>();
  for (const hexIndex of board.nodes[nodeId].adjHexes) {
    const hex = board.hexes[hexIndex];
    for (const id of hex.nodeIds) {
      const port = board.nodes[id].port;
      if (port) ports.add(port);
    }
  }
  return ports;
}

function checkPortSynergy(board: Board, nodeId: string): boolean {
  const ports = checkPort(board, nodeId);
  for (const hexIndex of board.nodes[nodeId].adjHexes) {
    const hex = board.hexes[hexIndex];
    for (const port of ports) {
      if (port === "3:1") continue;
      if (port.includes("_")) {
        const portResource = port.split("_")[1];
        if (portResource === hex.resource && hex.diceNumber !== null && PIP_WEIGHTS[hex.diceNumber] >= 3) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkPortSynergyDual(board: Board, node1: string, node2: string): boolean {
  const allPorts = new Set([...checkPort(board, node1), ...checkPort(board, node2)]);
  const hexIndices = new Set([...board.nodes[node1].adjHexes, ...board.nodes[node2].adjHexes]);
  const pipTotals: Record<string, number> = {};
  for (const hexIndex of hexIndices) {
    const hex = board.hexes[hexIndex];
    if (hex.diceNumber === null) continue;
    pipTotals[hex.resource] = (pipTotals[hex.resource] ?? 0) + PIP_WEIGHTS[hex.diceNumber];
  }
  for (const port of allPorts) {
    if (!port.includes("_")) continue;
    const portResource = port.split("_")[1];
    if ((pipTotals[portResource] ?? 0) >= 4) return true;
  }
  return false;
}

function oreCheck(board: Board, nodeId: string): boolean {
  return board.nodes[nodeId].adjHexes.some((i) => {
    const hex = board.hexes[i];
    return hex.resource === "ore" && hex.diceNumber !== null && hex.diceNumber >= 3;
  });
}

function hexPipTotals(board: Board, hexIndices: Set<number>, resources: string[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const r of resources) totals[r] = 0;
  for (const i of hexIndices) {
    const hex = board.hexes[i];
    if (hex.diceNumber !== null && resources.includes(hex.resource)) {
      totals[hex.resource] += PIP_WEIGHTS[hex.diceNumber];
    }
  }
  return totals;
}

function pairHexes(board: Board, node1: string, node2: string): Set<number> {
  return new Set([...board.nodes[node1].adjHexes, ...board.nodes[node2].adjHexes]);
}

function isOwsSetup(board: Board, node1: string, node2: string): boolean {
  const hexIndices = pairHexes(board, node1, node2);
  for (const i of hexIndices) {
    const r = board.hexes[i].resource;
    if (r !== "desert" && !["ore", "wheat", "sheep"].includes(r)) return false;
  }
  return true;
}

function owsPipBalanceScore(board: Board, node1: string, node2: string): number {
  const hexIndices = pairHexes(board, node1, node2);
  const totals = hexPipTotals(board, hexIndices, ["ore", "wheat", "sheep"]);
  const target = [6, 6, 3];
  const actual = [totals.ore, totals.wheat, totals.sheep];
  const normalize = (vec: number[]) => {
    const sum = vec.reduce((a, b) => a + b, 0);
    return sum ? vec.map((x) => x / sum) : vec.map(() => 0);
  };
  const normActual = normalize(actual);
  const normTarget = normalize(target);
  const distance = normActual.reduce((acc, v, i) => acc + Math.abs(v - normTarget[i]), 0);
  return Math.max(0, 1.5 - distance * SCORING_WEIGHTS.OWS_ratio_bonus_magnifier);
}

function isOwsHybridSetup(board: Board, node1: string, node2: string): boolean {
  const hexIndices = pairHexes(board, node1, node2);
  const totals = hexPipTotals(board, hexIndices, ["ore", "wheat"]);
  const other = new Set<string>();
  for (const i of hexIndices) {
    const r = board.hexes[i].resource;
    if (!["ore", "wheat", "sheep"].includes(r) && r !== "desert") other.add(r);
  }
  // `other` can only ever contain "wood" and/or "brick" (every other
  // resource is excluded above). Originally `other.size > 0` — "at least
  // one" — which meant a pair with BOTH wood and brick present (i.e. all 5
  // resources: a genuinely BALANCED setup) also satisfied this looser
  // condition. Since this branch is checked before BALANCED in the elif
  // chain below, that swallowed the large majority of true BALANCED pairs
  // before BALANCED was ever evaluated (measured: ~73% of pairs that
  // satisfy is_balanced_setup were being classified OWS_HYBRID instead).
  // Requiring exactly one extra resource — a real "OWS plus a little of one
  // other thing" hybrid — excludes the all-5-resources case and lets it
  // fall through to BALANCED correctly.
  return totals.ore >= 3 && totals.wheat >= 3 && other.size === 1;
}

function isRoadSetup(board: Board, node1: string, node2: string): boolean {
  const hexIndices = pairHexes(board, node1, node2);
  const totals = hexPipTotals(board, hexIndices, ["wood", "brick", "ore", "wheat", "sheep"]);
  if (totals.wood < 3 || totals.brick < 3) return false;
  if (totals.ore > 0) return false;
  if (totals.sheep === 0 || totals.wheat === 0) return false;
  const ratio = totals.wood / totals.brick;
  return ratio >= 0.66 && ratio <= 1.5;
}

function isCityAndRoadsSetup(board: Board, node1: string, node2: string): boolean {
  const hexIndices = pairHexes(board, node1, node2);
  const tracked = ["ore", "wheat", "wood", "brick"];
  const seen = new Set<string>();
  for (const i of hexIndices) {
    const hex = board.hexes[i];
    if (hex.diceNumber === null) continue;
    if (tracked.includes(hex.resource)) seen.add(hex.resource);
    else if (hex.resource !== "desert") return false;
  }
  return [...seen].every((r) => tracked.includes(r));
}

function cityAndRoadsBalanceScore(board: Board, node1: string, node2: string): number {
  const hexIndices = pairHexes(board, node1, node2);
  const totals = hexPipTotals(board, hexIndices, ["ore", "wheat", "wood", "brick"]);
  const cities = totals.ore + totals.wheat;
  const roads = totals.wood + totals.brick;
  if (cities === 0 || roads === 0) return 0;
  const distance = Math.abs(cities / roads - 1);
  return Math.max(0, 1.5 - distance * SCORING_WEIGHTS["CITIES&ROADS_balance_score"]);
}

function isBalancedSetup(board: Board, node1: string, node2: string): boolean {
  const hexIndices = pairHexes(board, node1, node2);
  const resources = ["ore", "wheat", "sheep", "wood", "brick"];
  const totals = hexPipTotals(board, hexIndices, resources);
  const seen = new Set<string>();
  for (const i of hexIndices) {
    const hex = board.hexes[i];
    if (resources.includes(hex.resource) && hex.diceNumber !== null) seen.add(hex.resource);
  }
  if (resources.some((r) => !seen.has(r))) return false;
  return totals.wheat >= 3;
}

function isPortSetup(board: Board, node1: string, node2: string): boolean {
  const hexIndices = pairHexes(board, node1, node2);
  const totals = hexPipTotals(board, hexIndices, ["ore", "wheat", "sheep", "wood", "brick"]);
  const ports = new Set([...checkPort(board, node1), ...checkPort(board, node2)]);
  for (const port of ports) {
    if (port === "3:1" || !port.includes("_")) continue;
    const portResource = port.split("_")[1];
    if ((totals[portResource] ?? 0) >= 9) return true;
  }
  return false;
}

function findAccessibleSettleSpots(board: Board, startIds: string[], maxDepth = 4): Set<string> {
  const exclude = new Set(startIds);
  const visited = new Set(startIds);
  const queue: [string, number][] = startIds.map((id) => [id, 0]);
  const validSpots = new Set<string>();
  while (queue.length) {
    const [current, depth] = queue.shift()!;
    if (depth >= maxDepth) continue;
    for (const neighbor of board.nodes[current].connectedNodes) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      queue.push([neighbor, depth + 1]);
      if (!exclude.has(neighbor)) validSpots.add(neighbor);
    }
  }
  return validSpots;
}

export function generateCandidateNodes(board: Board, excludeNodes: Set<string>): string[] {
  const valid: string[] = [];
  for (const nodeId of Object.keys(board.nodes)) {
    if (excludeNodes.has(nodeId)) continue;
    const neighbors = board.nodes[nodeId].connectedNodes;
    if ([...neighbors].some((n) => excludeNodes.has(n))) continue;
    valid.push(nodeId);
  }
  return valid;
}

function checkSettleSpot(board: Board, taken: Set<string>): boolean {
  return generateCandidateNodes(board, taken).length > 0;
}

// --- top-level scoring ---

export function scoreNode(board: Board, nodeId: string): ScoreResult {
  const lines: ScoreLine[] = [];
  const push = (key: string, label: string, bucket: ScoreLine["bucket"], amount: number) => {
    if (amount !== 0) lines.push({ key, label, bucket, amount });
  };

  const resourceScores = analyzeResources(board);
  const pipscore = scorePips(board, nodeId);

  if (pipscore > 11) {
    push("single_pips>11", "High pip production (>11)", "Production & Pips", SCORING_WEIGHTS["single_pips>11"]);
  } else if (pipscore >= 9) {
    push("single_pips<=11>=9", "Solid pip production (9–11)", "Production & Pips", SCORING_WEIGHTS["single_pips<=11>=9"]);
  } else if (pipscore <= 7) {
    push("single_pips<=7_penalty", "Low pip production (≤7)", "Production & Pips", -SCORING_WEIGHTS["single_pips<=7_penalty"]);
  }

  const scarceSeen = new Set<string>();
  for (const hexIndex of board.nodes[nodeId].adjHexes) {
    const hex = board.hexes[hexIndex];
    if (hex.resource === "desert") continue;
    const corner = checkCorner(hex);
    if (resourceScores[hex.resource] === "scarce" && !scarceSeen.has(hex.resource)) {
      push("scarce_res_bonus", `Scarce resource: ${hex.resource}`, "Resource Scarcity", SCORING_WEIGHTS.scarce_res_bonus);
      scarceSeen.add(hex.resource);
      const pip = hex.diceNumber !== null ? PIP_WEIGHTS[hex.diceNumber] : 0;
      if (pip === 2) {
        push("scarce_res_2pips", `Scarce ${hex.resource}, low production`, "Resource Scarcity", SCORING_WEIGHTS.scarce_res_2pips);
        if (corner) push("scarce_res_2pips+corner", "...at a corner hex", "Resource Scarcity", SCORING_WEIGHTS["scarce_res_2pips+corner"]);
      }
      if (pip === 3) {
        push("scarce_res_3pips", `Scarce ${hex.resource}, decent production`, "Resource Scarcity", SCORING_WEIGHTS.scarce_res_3pips);
        if (corner) push("scarce_res_3pips+corner", "...at a corner hex", "Resource Scarcity", SCORING_WEIGHTS["scarce_res_3pips+corner"]);
      }
      if (pip >= 4) {
        push("scarce_res>4pips", `Scarce ${hex.resource}, high production`, "Resource Scarcity", SCORING_WEIGHTS["scarce_res>4pips"]);
        if (corner) push("scarce_res>4pips+corner", "...at a corner hex", "Resource Scarcity", SCORING_WEIGHTS["scarce_res>4pips+corner"]);
      }
    }
  }

  const ports = checkPort(board, nodeId);
  if (ports.size === 0) push("no_ports", "No port access", "Ports", -SCORING_WEIGHTS.no_ports);
  if (ports.size === 1) push("1_port", "One port in range", "Ports", SCORING_WEIGHTS["1_port"]);
  else if (ports.size === 2) push("2_ports", "Two ports in range", "Ports", SCORING_WEIGHTS["2_ports"]);
  if (checkPortSynergy(board, nodeId)) push("port_synergy", "Port matches adjacent resource", "Ports", SCORING_WEIGHTS.port_synergy);

  if (numberDiversityIsThree(board, nodeId)) {
    push("number_diversity", "3 distinct dice numbers", "Diversity & Synergy", SCORING_WEIGHTS.number_diversity);
  }
  if (checkResSynergy(board, nodeId)) {
    push("resource_synergy", "Wood+brick or ore+wheat synergy", "Diversity & Synergy", SCORING_WEIGHTS.resource_synergy);
  }
  if (oreCheck(board, nodeId) && resourceScores.wheat !== "scarce") {
    push("ore_check", "Decent ore access", "Production & Pips", SCORING_WEIGHTS.ore_check);
  }
  const hexCount = board.nodes[nodeId].adjHexes.length;
  if (hexCount === 3) {
    push("hex_count_3", "Full 3-hex intersection", "Diversity & Synergy", SCORING_WEIGHTS.hex_count_3);
  } else if (hexCount === 2) {
    push("hex_count_2", "2-hex edge spot", "Diversity & Synergy", SCORING_WEIGHTS.hex_count_2);
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, breakdown: lines };
}

export function scoreNodeSynergy(board: Board, node1: string, node2: string): ScoreResult & { strategy: Strategy } {
  const lines: ScoreLine[] = [];
  const push = (key: string, label: string, bucket: ScoreLine["bucket"], amount: number) => {
    if (amount !== 0) lines.push({ key, label, bucket, amount });
  };

  const pipscore = scorePips(board, node1, node2) / 2;
  if (pipscore > 10.3) {
    push("2spot_pips>10.3", "Combined pip production >10.3 avg", "Pair Setup", SCORING_WEIGHTS["2spot_pips>10.3"]);
  } else if (pipscore >= 9) {
    push("2spot_pips<=10.3>=9", "Combined pip production 9–10.3 avg", "Pair Setup", SCORING_WEIGHTS["2spot_pips<=10.3>=9"]);
  }

  const numbers = numberDiversityCount(board, node1, node2);
  if (numbers === 5) push("2spot_number_diversity=5", "5 distinct dice numbers", "Pair Setup", SCORING_WEIGHTS["2spot_number_diversity=5"]);
  if (numbers === 6) push("2spot_number_diversity=6", "6 distinct dice numbers", "Pair Setup", SCORING_WEIGHTS["2spot_number_diversity=6"]);

  if (checkPortSynergyDual(board, node1, node2)) {
    push("2spot_port_synergy", "Combined port + resource synergy", "Pair Setup", SCORING_WEIGHTS["2spot_port_synergy"]);
  }

  const pairOreWheat = hexPipTotals(board, pairHexes(board, node1, node2), ["ore", "wheat"]);
  if (pairOreWheat.ore > 0 && pairOreWheat.wheat === 0) {
    push("ore_no_wheat_penalty", "Ore access with zero wheat — ore alone can't build cities", "Pair Setup", -SCORING_WEIGHTS.ore_no_wheat_penalty);
  }

  let strategy: Strategy;
  const taken = new Set([node1, node2]);

  if (isOwsSetup(board, node1, node2)) {
    strategy = "OWS";
    push("OWS", "Strategy: Ore-Wheat-Sheep", "Strategy Bonus", SCORING_WEIGHTS.OWS);
    push("OWS_balance", "OWS resource balance", "Strategy Bonus", owsPipBalanceScore(board, node1, node2));
    if (checkSettleSpot(board, taken)) push("2spot_settle_spot", "Room to expand", "Strategy Bonus", SCORING_WEIGHTS["2spot_settle_spot"]);
  } else if (isOwsHybridSetup(board, node1, node2)) {
    strategy = "OWS_HYBRID";
    push("OWS_HYBRID", "Strategy: OWS Hybrid", "Strategy Bonus", SCORING_WEIGHTS.OWS_HYBRID);
    if (checkSettleSpot(board, taken)) push("2spot_settle_spot", "Room to expand", "Strategy Bonus", SCORING_WEIGHTS["2spot_settle_spot"]);
  } else if (isRoadSetup(board, node1, node2)) {
    strategy = "ROAD";
    push("ROAD", "Strategy: Road-building (wood/brick)", "Strategy Bonus", SCORING_WEIGHTS.ROAD);
    const roadSpots = findAccessibleSettleSpots(board, [node1, node2]);
    push("ROAD_settle_spot_magnifier", "Accessible future settle spots", "Strategy Bonus", roadSpots.size * SCORING_WEIGHTS.ROAD_settle_spot_magnifier);
  } else if (isCityAndRoadsSetup(board, node1, node2)) {
    strategy = "CITIES&ROADS";
    push("CITIES&ROADS", "Strategy: Cities & Roads", "Strategy Bonus", SCORING_WEIGHTS["CITIES&ROADS"]);
    push("CITIES&ROADS_balance_score", "Cities/roads production balance", "Strategy Bonus", cityAndRoadsBalanceScore(board, node1, node2));
  } else if (isBalancedSetup(board, node1, node2)) {
    strategy = "BALANCED";
    push("BALANCED", "Strategy: Balanced (all 5 resources)", "Strategy Bonus", SCORING_WEIGHTS.BALANCED);
    if (checkSettleSpot(board, taken)) push("2spot_settle_spot", "Room to expand", "Strategy Bonus", SCORING_WEIGHTS["2spot_settle_spot"]);
  } else if (isPortSetup(board, node1, node2)) {
    strategy = "PORT";
    push("PORT", "Strategy: Port-focused", "Strategy Bonus", SCORING_WEIGHTS.PORT);
  } else {
    strategy = "PRODUCTION";
    push("PRODUCTION", "Strategy: General production", "Strategy Bonus", SCORING_WEIGHTS.PRODUCTION);
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, breakdown: lines, strategy };
}
