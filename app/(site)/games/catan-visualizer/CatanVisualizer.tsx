"use client";

import { useEffect, useMemo, useState } from "react";
import { generateBoard } from "@/lib/catan/board";
import { runDraft } from "@/lib/catan/draft";
import { buildCatanLayout } from "@/lib/catan/layout";
import { computeRecommendation } from "@/lib/catan/recommend";
import type { Board } from "@/lib/catan/types";
import CatanBoard from "./CatanBoard";
import CatanPanel from "./CatanPanel";

// Pure geometry, no randomness — safe to compute once, shared across every
// reshuffle (only the resource/number/port assignment changes).
const LAYOUT = buildCatanLayout(1);

type Mode = "open" | "draft";
const SEATS = [0, 1, 2, 3] as const;
const SEAT_LABEL = ["1st", "2nd", "3rd", "4th"];

// Board generation (and, in draft mode, opponent placement) uses
// Math.random and must never run during the render SSR/hydration compares —
// this codebase has hit that exact hydration-mismatch bug before. Generate
// only after mount; `result` below is derived via useMemo rather than a
// second effect+setState so nothing here recomputes during the
// hydration-compared render either.
export default function CatanVisualizer() {
  const [mounted, setMounted] = useState(false);
  const [board, setBoard] = useState<Board | null>(null);
  const [mode, setMode] = useState<Mode>("open");
  const [userSeat, setUserSeat] = useState<number>(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setBoard(generateBoard());
  }, []);

  const result = useMemo(() => {
    if (!board) return null;
    if (mode === "open") return { kind: "open" as const, data: computeRecommendation(board) };
    return { kind: "draft" as const, data: runDraft(board, userSeat) };
  }, [board, mode, userSeat]);

  if (!mounted || !board || !result) {
    return <div className="aspect-video bg-[var(--paper-recessed)] border border-[var(--paper-line)]" />;
  }

  const recommendedNodes: [string, string] =
    result.kind === "open" ? [result.data.top.node1, result.data.top.node2] : [result.data.userPair.node1, result.data.userPair.node2];
  const opponentNodes =
    result.kind === "draft" ? result.data.picks.filter((p) => !p.isUser).map((p) => ({ nodeId: p.nodeId, seat: p.seat })) : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-6">
        <button
          type="button"
          onClick={() => setBoard(generateBoard())}
          className="text-sm font-mono text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
        >
          ↻ reshuffle
        </button>

        <div className="flex items-center gap-4">
          {(["open", "draft"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`font-mono text-xs pb-1 border-b transition-colors ${
                mode === m ? "text-[var(--accent)] border-[var(--accent)]" : "text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)]"
              }`}
            >
              {m === "open" ? "open board" : "draft mode"}
            </button>
          ))}
        </div>

        {mode === "draft" && (
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[var(--ink-muted)]">seat:</span>
            {SEATS.map((seat) => (
              <button
                key={seat}
                type="button"
                onClick={() => setUserSeat(seat)}
                aria-pressed={userSeat === seat}
                className={`font-mono text-xs pb-1 border-b transition-colors ${
                  userSeat === seat
                    ? "text-[var(--accent)] border-[var(--accent)]"
                    : "text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)]"
                }`}
              >
                {SEAT_LABEL[seat]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div className="border border-[var(--paper-line)] p-4">
          <CatanBoard board={board} layout={LAYOUT} recommendedNodes={recommendedNodes} opponentNodes={opponentNodes} />
        </div>
        {result.kind === "open" ? (
          <CatanPanel top={result.data.top} shortlist={result.data.shortlist} />
        ) : (
          <CatanPanel
            top={result.data.userPair}
            shortlist={[]}
            draftInfo={{ picks: result.data.picks, pickRankInfo: result.data.pickRankInfo }}
          />
        )}
      </div>
    </div>
  );
}
