import type { Bucket, DraftPick, PairResult, ScoreLine } from "@/lib/catan/types";

const BUCKET_ORDER: Bucket[] = [
  "Strategy Bonus",
  "Pair Setup",
  "Production & Pips",
  "Resource Scarcity",
  "Ports",
  "Diversity & Synergy",
];

function groupByBucket(lines: ScoreLine[]): { bucket: Bucket; subtotal: number; lines: ScoreLine[] }[] {
  const groups = new Map<Bucket, ScoreLine[]>();
  for (const line of lines) {
    if (!groups.has(line.bucket)) groups.set(line.bucket, []);
    groups.get(line.bucket)!.push(line);
  }
  return BUCKET_ORDER.filter((b) => groups.has(b)).map((bucket) => {
    const bucketLines = groups.get(bucket)!;
    return { bucket, subtotal: bucketLines.reduce((s, l) => s + l.amount, 0), lines: bucketLines };
  });
}

export default function CatanPanel({
  top,
  shortlist,
  draftInfo,
}: {
  top: PairResult;
  shortlist: PairResult[];
  draftInfo?: { picks: DraftPick[]; pickRankInfo: { consideredPairs: number; chosenRank: number } | null };
}) {
  const buckets = groupByBucket(top.breakdown);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs text-[var(--ink-muted)] mb-2">
          {draftInfo ? "Your pick" : "Recommended pair"}
        </p>
        <p className="text-lg font-semibold text-[var(--ink)] mb-1">
          {top.strategy.replace("&", " & ").replace("_", " ")}
        </p>
        <p className="font-mono text-sm text-[var(--accent)]">score {top.total.toFixed(2)}</p>
        {draftInfo?.pickRankInfo && (
          <p className="text-xs text-[var(--ink-muted)] mt-2 max-w-[42ch]">
            {draftInfo.pickRankInfo.chosenRank === 1
              ? `Top-ranked spot held up (1 of ${draftInfo.pickRankInfo.consideredPairs} candidate pairs).`
              : `Picked from rank #${draftInfo.pickRankInfo.chosenRank} of ${draftInfo.pickRankInfo.consideredPairs} — higher-ranked spots looked likely to be taken before your next turn.`}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs text-[var(--ink-muted)]">Factors &amp; weights</p>
        {buckets.map(({ bucket, subtotal, lines }) => (
          <details key={bucket} className="border border-[var(--paper-line)] group">
            <summary className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer list-none">
              <span className="text-sm text-[var(--ink)]">{bucket}</span>
              <span className={`font-mono text-xs ${subtotal >= 0 ? "text-[var(--ink-muted)]" : "text-[var(--accent)]"}`}>
                {subtotal >= 0 ? "+" : ""}
                {subtotal.toFixed(3)}
              </span>
            </summary>
            <div className="border-t border-[var(--paper-line)] px-3 py-2 flex flex-col gap-1">
              {lines.map((line, i) => (
                <div key={`${line.key}-${i}`} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--ink-muted)]">{line.label}</span>
                  <span className="font-mono text-xs text-[var(--ink-muted)] shrink-0">
                    {line.amount >= 0 ? "+" : ""}
                    {line.amount.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      {shortlist.length > 0 && (
        <div>
          <p className="font-mono text-xs text-[var(--ink-muted)] mb-2">Runner-up spots</p>
          <div className="flex flex-col divide-y divide-[var(--paper-line)]">
            {shortlist.map((pair) => (
              <div key={`${pair.node1}-${pair.node2}`} className="flex items-center justify-between gap-3 py-2">
                <span className="text-xs text-[var(--ink-muted)]">{pair.strategy.replace("&", " & ").replace("_", " ")}</span>
                <span className="font-mono text-xs text-[var(--ink-muted)]">{pair.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {draftInfo && (
        <div>
          <p className="font-mono text-xs text-[var(--ink-muted)] mb-2">Draft order</p>
          <div className="flex flex-col divide-y divide-[var(--paper-line)]">
            {draftInfo.picks.map((pick, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-3 py-1.5 ${
                  pick.isUser ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"
                }`}
              >
                <span className="text-xs">
                  Round {pick.round}, seat {pick.seat + 1}
                  {pick.isUser ? " (you)" : ""}
                </span>
                <span className="font-mono text-xs shrink-0">{pick.nodeId.replace("node_", "#")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
