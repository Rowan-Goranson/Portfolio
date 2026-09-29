// Pixel geometry for the standard 19-hex Catan board (rows of 3/4/5/4/3,
// pointy-top hexagons). None of this exists in the source Python repo — it's
// a pure graph/simulation engine with no visual layer — so it's derived here
// from scratch and cross-checked against HEX_TO_NODE_MAP for consistency.
//
// The vertex winding (which corner of a hex is list-index 0, and which
// direction the other 5 follow) isn't specified anywhere in the source data;
// it's an internal convention the original author picked when hand-writing
// HEX_TO_NODE_MAP, and can't be inferred without testing embeddings against
// it. Verified by brute-force search over all 12 (start-angle, direction)
// combinations: placing hex centers in the standard row layout below and
// starting each hex's node list at 210° and proceeding counter-clockwise in
// 60° steps is the only combination where every node shared between adjacent
// hexes resolves to a single consistent pixel position (0 mismatches across
// all 19 hexes; every other combination produced 32+ mismatches). Confirmed
// this also yields exactly 54 unique nodes, matching a real Catan board.

import { HEX_TO_NODE_MAP, PORT_LOCATION } from "./constants";

const HEX_ROWS = [
  [0, 1, 2],
  [3, 4, 5, 6],
  [7, 8, 9, 10, 11],
  [12, 13, 14, 15],
  [16, 17, 18],
];

const START_ANGLE_DEG = 210;
const WINDING_DIR = 1;

export interface Point {
  x: number;
  y: number;
}

export interface CatanLayout {
  size: number;
  hexCenters: Record<number, Point>;
  hexPolygons: Record<number, Point[]>;
  nodePositions: Record<string, Point>;
  portAnchors: { nodeA: string; nodeB: string; midpoint: Point; anchor: Point }[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

function hexCenters(size: number): Record<number, Point> {
  const rowSpacingY = 1.5 * size;
  const hexWidth = Math.sqrt(3) * size;
  const centers: Record<number, Point> = {};
  HEX_ROWS.forEach((row, rowIdx) => {
    const n = row.length;
    row.forEach((hexIndex, i) => {
      centers[hexIndex] = { x: (i - (n - 1) / 2) * hexWidth, y: rowIdx * rowSpacingY };
    });
  });
  return centers;
}

function hexVertex(center: Point, size: number, k: number): Point {
  const angle = ((START_ANGLE_DEG + WINDING_DIR * 60 * k) * Math.PI) / 180;
  return { x: center.x + size * Math.cos(angle), y: center.y + size * Math.sin(angle) };
}

export function buildCatanLayout(size: number): CatanLayout {
  const centers = hexCenters(size);
  const hexPolygons: Record<number, Point[]> = {};
  const nodePositions: Record<string, Point> = {};

  for (let hexIndex = 0; hexIndex < 19; hexIndex++) {
    const center = centers[hexIndex];
    const nodeIds = HEX_TO_NODE_MAP[hexIndex];
    const polygon: Point[] = [];
    for (let k = 0; k < 6; k++) {
      const point = hexVertex(center, size, k);
      polygon.push(point);
      if (!(nodeIds[k] in nodePositions)) nodePositions[nodeIds[k]] = point;
    }
    hexPolygons[hexIndex] = polygon;
  }

  const portAnchors = [];
  for (let i = 0; i < PORT_LOCATION.length; i += 2) {
    const nodeA = PORT_LOCATION[i];
    const nodeB = PORT_LOCATION[i + 1];
    const a = nodePositions[nodeA];
    const b = nodePositions[nodeB];
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const dist = Math.hypot(midpoint.x, midpoint.y) || 1;
    const pushOut = 0.55 * size;
    const anchor = {
      x: midpoint.x + (midpoint.x / dist) * pushOut,
      y: midpoint.y + (midpoint.y / dist) * pushOut,
    };
    portAnchors.push({ nodeA, nodeB, midpoint, anchor });
  }

  const allX = Object.values(nodePositions).map((p) => p.x).concat(portAnchors.map((p) => p.anchor.x));
  const allY = Object.values(nodePositions).map((p) => p.y).concat(portAnchors.map((p) => p.anchor.y));
  const bounds = { minX: Math.min(...allX), maxX: Math.max(...allX), minY: Math.min(...allY), maxY: Math.max(...allY) };

  return { size, hexCenters: centers, hexPolygons, nodePositions, portAnchors, bounds };
}
