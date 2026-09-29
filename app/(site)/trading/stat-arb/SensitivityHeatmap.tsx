import { STAT_ARB_SENSITIVITY } from "../trading-content-data";

export default function SensitivityHeatmap() {
  const { liquidityFactors, volatilityFactors, sharpe } = STAT_ARB_SENSITIVITY;
  const flat = sharpe.flat();
  const max = Math.max(...flat);
  const min = Math.min(...flat);

  return (
    <div>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `56px repeat(${volatilityFactors.length}, 64px)` }}>
        <div />
        {volatilityFactors.map((vf) => (
          <div key={vf} className="font-mono text-[10px] text-[var(--ink-muted)] text-center pb-1">
            {vf}
          </div>
        ))}
        {liquidityFactors.map((lf, r) => (
          <div key={lf} className="contents">
            <div className="font-mono text-[10px] text-[var(--ink-muted)] flex items-center pr-2">{lf}</div>
            {volatilityFactors.map((vf, c) => {
              const v = sharpe[r][c];
              const t = (v - min) / (max - min || 1);
              return (
                <div
                  key={vf}
                  className="font-mono text-[11px] text-center py-2 border border-[var(--paper-line)]"
                  style={{ backgroundColor: `color-mix(in srgb, var(--accent) ${(t * 45).toFixed(0)}%, var(--paper))` }}
                >
                  {v.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-[var(--ink-muted)] mt-2">rows: liquidity_factor · cols: volatility_factor · cell: portfolio Sharpe</p>
    </div>
  );
}
