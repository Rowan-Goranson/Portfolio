import { EXECUTION_STEPS } from "../trading-content-data";

export default function ExecutionPipeline() {
  return (
    <div className="flex flex-col">
      {EXECUTION_STEPS.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 border border-[var(--accent)] flex items-center justify-center font-mono text-[9px] text-[var(--accent)] shrink-0">
              {i + 1}
            </div>
            {i < EXECUTION_STEPS.length - 1 && <div className="w-px flex-1 bg-[var(--paper-line)] my-0.5" />}
          </div>
          <details className="pb-2 flex-1 group" open={i === 0}>
            <summary className="text-sm font-semibold text-[var(--ink)] cursor-pointer list-none leading-5">
              <span className="inline-block w-3 font-mono text-xs text-[var(--ink-muted)] transition-transform group-open:rotate-90">›</span>
              {step.label}
            </summary>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed mt-1 pl-3">{step.detail}</p>
          </details>
        </div>
      ))}
    </div>
  );
}
