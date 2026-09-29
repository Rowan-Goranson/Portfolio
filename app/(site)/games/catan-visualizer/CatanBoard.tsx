import { PIP_WEIGHTS } from "@/lib/catan/constants";
import type { CatanLayout } from "@/lib/catan/layout";
import type { Board } from "@/lib/catan/types";
import { RESOURCE_COLOR, RESOURCE_TEXT } from "./catanTheme";

const HOT_NUMBERS = new Set([6, 8]);

export default function CatanBoard({
  board,
  layout,
  recommendedNodes,
  opponentNodes,
}: {
  board: Board;
  layout: CatanLayout;
  recommendedNodes: [string, string];
  opponentNodes?: { nodeId: string; seat: number }[];
}) {
  const pad = 0.65;
  const { minX, minY, maxX, maxY } = layout.bounds;
  const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <svg viewBox={viewBox} className="w-full h-auto" role="img" aria-label="Randomly generated Catan board">
      {board.hexes.map((hex) => {
        const polygon = layout.hexPolygons[hex.index];
        const points = polygon.map((p) => `${p.x},${p.y}`).join(" ");
        const center = layout.hexCenters[hex.index];
        const pip = hex.diceNumber !== null ? PIP_WEIGHTS[hex.diceNumber] : 0;
        const hot = hex.diceNumber !== null && HOT_NUMBERS.has(hex.diceNumber);

        return (
          <g key={hex.index}>
            <polygon points={points} fill={RESOURCE_COLOR[hex.resource]} stroke="var(--paper-line)" strokeWidth={0.03} />
            {hex.diceNumber !== null && (
              <g>
                <circle cx={center.x} cy={center.y} r={0.32} fill="var(--paper)" stroke="var(--paper-line)" strokeWidth={0.02} />
                <text
                  x={center.x}
                  y={center.y + 0.02}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="var(--font-mono)"
                  fontSize={0.34}
                  fontWeight={600}
                  fill={hot ? "var(--accent)" : "var(--ink)"}
                >
                  {hex.diceNumber}
                </text>
                <g>
                  {Array.from({ length: pip }).map((_, i) => (
                    <circle
                      key={i}
                      cx={center.x - (pip - 1) * 0.045 + i * 0.09}
                      cy={center.y + 0.42}
                      r={0.028}
                      fill={hot ? "var(--accent)" : "var(--ink-muted)"}
                    />
                  ))}
                </g>
              </g>
            )}
            {hex.resource !== "desert" && (
              <text
                x={center.x}
                y={center.y - 0.55}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={0.14}
                fill={RESOURCE_TEXT[hex.resource]}
                opacity={0.75}
              >
                {hex.resource}
              </text>
            )}
          </g>
        );
      })}

      {layout.portAnchors.map(({ nodeA, nodeB, midpoint, anchor }) => {
        const port = board.nodes[nodeA].port;
        if (!port) return null;
        const label = port === "3:1" ? "3:1" : `2:1 ${port.split("_")[1]}`;
        return (
          <g key={nodeA + nodeB}>
            <line x1={anchor.x} y1={anchor.y} x2={midpoint.x} y2={midpoint.y} stroke="var(--paper-line)" strokeWidth={0.025} />
            <text
              x={anchor.x}
              y={anchor.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-mono)"
              fontSize={0.15}
              fill="var(--ink-muted)"
            >
              {label}
            </text>
          </g>
        );
      })}

      {opponentNodes?.map(({ nodeId, seat }) => {
        const point = layout.nodePositions[nodeId];
        return (
          <g key={nodeId}>
            <circle cx={point.x} cy={point.y} r={0.16} fill="var(--ink-muted)" stroke="var(--paper)" strokeWidth={0.03} />
            <text
              x={point.x}
              y={point.y + 0.01}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-mono)"
              fontSize={0.15}
              fontWeight={700}
              fill="var(--paper)"
            >
              {seat + 1}
            </text>
          </g>
        );
      })}

      {recommendedNodes.map((nodeId, i) => {
        const point = layout.nodePositions[nodeId];
        return (
          <g key={nodeId}>
            <circle cx={point.x} cy={point.y} r={0.22} fill="var(--accent)" stroke="var(--paper)" strokeWidth={0.035} />
            <text
              x={point.x}
              y={point.y + 0.01}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-mono)"
              fontSize={0.19}
              fontWeight={700}
              fill="var(--paper)"
            >
              {i === 0 ? "A" : "B"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
