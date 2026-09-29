import { POINT_SHAVING_TRIAL_LOG } from "../research-content-data";

export default function PointShavingTrialLog() {
  return (
    <div className="flex flex-col gap-2">
      {POINT_SHAVING_TRIAL_LOG.map((trial, i) => (
        <details
          key={trial.label}
          className="border border-[var(--paper-line)] group"
          open={i === POINT_SHAVING_TRIAL_LOG.length - 1}
        >
          <summary className="flex items-baseline justify-between gap-3 px-3 py-2 cursor-pointer list-none">
            <span className="text-sm text-[var(--ink)]">
              <span className="inline-block w-3 font-mono text-xs text-[var(--ink-muted)] transition-transform group-open:rotate-90">›</span>
              {trial.label}
            </span>
            <span className="font-mono text-xs text-[var(--accent)] shrink-0">LL {trial.ll.toFixed(1)}</span>
          </summary>
          <div className="border-t border-[var(--paper-line)] px-3 py-3 flex flex-col gap-1.5">
            <p className="text-sm text-[var(--ink)] leading-relaxed">{trial.hypothesis}</p>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{trial.method}</p>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{trial.result}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
