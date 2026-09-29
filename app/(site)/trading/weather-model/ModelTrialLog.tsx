import { MODEL_TRIAL_LOG, MODEL_FURTHER_EXPLORATION } from "../trading-content-data";

export default function ModelTrialLog() {
  return (
    <div className="flex flex-col gap-2">
      {MODEL_TRIAL_LOG.map((trial, i) => (
        <details key={trial.label} className="border border-[var(--paper-line)] group" open={i === MODEL_TRIAL_LOG.length - 1}>
          <summary className="flex items-baseline justify-between gap-3 px-3 py-2 cursor-pointer list-none">
            <span className="text-sm text-[var(--ink)]">
              <span className="inline-block w-3 font-mono text-xs text-[var(--ink-muted)] transition-transform group-open:rotate-90">›</span>
              <span className="font-mono text-xs text-[var(--ink-muted)] mr-2">§1.3.{i + 1}</span>
              {trial.label}
            </span>
            <span className="font-mono text-xs text-[var(--accent)] shrink-0">{trial.result}</span>
          </summary>
          <div className="border-t border-[var(--paper-line)] px-3 py-3 flex flex-col gap-1.5">
            <p className="text-sm text-[var(--ink)] leading-relaxed">{trial.hypothesis}</p>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{trial.method}</p>
          </div>
        </details>
      ))}

      <details className="border border-[var(--paper-line)] mt-2 group">
        <summary className="px-3 py-2 cursor-pointer list-none font-mono text-xs text-[var(--ink-muted)]">
          <span className="inline-block w-3 transition-transform group-open:rotate-90">›</span> further exploration — not all of it adopted
        </summary>
        <ul className="border-t border-[var(--paper-line)] px-3 py-3 flex flex-col gap-2.5">
          {MODEL_FURTHER_EXPLORATION.map((line) => (
            <li key={line} className="text-sm text-[var(--ink-muted)] leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[var(--paper-line)]">
              {line}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
