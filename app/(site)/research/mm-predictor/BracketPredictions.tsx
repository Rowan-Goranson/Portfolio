import { MM_BRACKET_2026 } from "../research-content-data";

export default function BracketPredictions() {
  return (
    <div>
      <div className="flex flex-col divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
        {MM_BRACKET_2026.map((g) => {
          const favorite = g.margin >= 0 ? g.team1 : g.team2;
          return (
            <div key={g.round} className="py-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--ink)]">
                  {g.team1} vs. {g.team2}
                </span>
                <span className="font-mono text-xs text-[var(--accent)]">{favorite} by {Math.abs(g.margin).toFixed(1)}</span>
              </div>
              <p className="font-mono text-[10px] text-[var(--ink-muted)]">{g.round}</p>
            </div>
          );
        })}
      </div>
      <p className="font-mono text-[11px] text-[var(--ink-muted)] leading-relaxed mt-3">
        Real output of the tuned model applied to the actual 2025–26 season (through Mar 19) and a real bracket template — not a
        worked example. Both semifinals are on a neutral court, so &quot;team1/team2&quot; is just the template&apos;s slot order, not a home team.
      </p>
    </div>
  );
}
