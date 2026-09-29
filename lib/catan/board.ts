import {
  DICE_NUMBERS,
  HEX_TO_NODE_MAP,
  PORT_LOCATION,
  PORT_TYPES,
  TILE_DISTRIBUTION,
} from "./constants";
import type { Board, BoardEdge, BoardNode, HexTile } from "./types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeHexes(): HexTile[] {
  const resourcePool: (keyof typeof TILE_DISTRIBUTION)[] = [];
  for (const [resource, count] of Object.entries(TILE_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) resourcePool.push(resource as keyof typeof TILE_DISTRIBUTION);
  }
  const shuffledResources = shuffle(resourcePool);
  const dicePool = shuffle(DICE_NUMBERS);

  const hexes: HexTile[] = [];
  let diceIdx = 0;
  shuffledResources.forEach((resource, index) => {
    const diceNumber = resource === "desert" ? null : dicePool[diceIdx++];
    hexes.push({ index, resource, diceNumber, nodeIds: HEX_TO_NODE_MAP[index] });
  });
  return hexes;
}

function createNodes(hexes: HexTile[]): Record<string, BoardNode> {
  const nodes: Record<string, BoardNode> = {};
  for (const hex of hexes) {
    for (const nodeId of hex.nodeIds) {
      if (!nodes[nodeId]) {
        nodes[nodeId] = { id: nodeId, adjHexes: [], connectedNodes: new Set(), port: null };
      }
      nodes[nodeId].adjHexes.push(hex.index);
    }
  }
  return nodes;
}

function createEdges(hexes: HexTile[], nodes: Record<string, BoardNode>): BoardEdge[] {
  const edgeKeys = new Set<string>();
  const edges: BoardEdge[] = [];
  for (const hex of hexes) {
    for (let i = 0; i < 6; i++) {
      const a = hex.nodeIds[i];
      const b = hex.nodeIds[(i + 1) % 6];
      const key = [a, b].sort().join("|");
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({ a, b });
      nodes[a].connectedNodes.add(b);
      nodes[b].connectedNodes.add(a);
    }
  }
  return edges;
}

function assignPorts(nodes: Record<string, BoardNode>) {
  const portList = shuffle(PORT_TYPES);
  for (let i = 0; i < PORT_LOCATION.length; i += 2) {
    const portType = portList[i / 2];
    nodes[PORT_LOCATION[i]].port = portType;
    nodes[PORT_LOCATION[i + 1]].port = portType;
  }
}

export function generateBoard(): Board {
  const hexes = makeHexes();
  const nodes = createNodes(hexes);
  const edges = createEdges(hexes, nodes);
  assignPorts(nodes);
  return { hexes, nodes, edges };
}
