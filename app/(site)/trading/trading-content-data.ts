// Real content extracted from the actual Kalshi weather-trading system
// (~/Desktop/Kalshi_Trading, not part of this repo). Every number here was
// either read directly from that system's own database/logs, or computed
// by running its own unmodified backtest/diagnostic code once and copying
// the output — nothing here is estimated or invented. See the two detail
// pages this feeds for what's a real backtest vs. a real live trade.

// Real Normal (Trial 1) vs. fitted skew-t (v4) densities, both computed by
// running the actual fv_model.py functions (predict_std/BIAS_BASELINE_INT
// for Trial 1; _v4_dist/FITTED_V4_PARAMS for v4) against one real historical
// forecast row (research/kxhighny_ml_features.csv — 2022-12-27, lead_hours=29,
// predicted_high_f=35). Not illustrative — this is what the two models
// actually predicted for a real day.
export const DISTRIBUTION_COMPARISON = {
  date: "2022-12-27",
  predictedHighF: 35,
  x: [23.0, 23.81, 24.63, 25.44, 26.25, 27.07, 27.88, 28.69, 29.51, 30.32, 31.14, 31.95, 32.76, 33.58, 34.39, 35.2, 36.02, 36.83, 37.64, 38.46, 39.27, 40.08, 40.9, 41.71, 42.53, 43.34, 44.15, 44.97, 45.78, 46.59],
  normal: [0.00006, 0.00016, 0.00039, 0.00091, 0.00198, 0.00402, 0.00765, 0.01361, 0.02267, 0.03534, 0.05155, 0.07038, 0.08993, 0.10753, 0.12035, 0.12605, 0.12356, 0.11336, 0.09733, 0.07821, 0.05882, 0.0414, 0.02727, 0.01681, 0.0097, 0.00524, 0.00265, 0.00125, 0.00055, 0.00023],
  skewt: [0.00003, 0.00007, 0.00013, 0.00026, 0.00053, 0.00106, 0.00213, 0.00424, 0.00825, 0.01555, 0.02793, 0.04715, 0.07357, 0.10461, 0.13391, 0.15313, 0.15601, 0.14204, 0.11646, 0.08699, 0.06, 0.03878, 0.02381, 0.01407, 0.00809, 0.00456, 0.00255, 0.00142, 0.00079, 0.00044],
};

export interface TrialLogEntry {
  label: string;
  hypothesis: string;
  method: string;
  result: string;
}

export const MODEL_TRIAL_LOG: TrialLogEntry[] = [
  {
    label: "Trial 1 — Normal baseline",
    hypothesis:
      "NBS's own reported forecast spread isn't well-calibrated — it's persistently biased and more volatile than it admits, especially at longer lead times.",
    method:
      "Correct the reported spread with two fitted parameters: a lead-time-dependent inflation and a fixed bias shift, keeping the residual distribution Normal.",
    result: "2.4235 NLL/obs",
  },
  {
    label: "Trial 2 — skew-t",
    hypothesis:
      "Forecast residuals aren't just mis-scaled Normal noise — they show real skew and fatter tails than a symmetric bell curve can represent.",
    method: "MLE fit (Nelder-Mead) of a skew-t distribution — location, scale, skew, and tail-heaviness each a function of lead time. 8 parameters.",
    result: "2.3783 NLL/obs (−0.045 vs. Trial 1)",
  },
  {
    label: "Trial 3 — skew-t + features",
    hypothesis:
      "Lead time alone doesn't capture everything relevant to forecast error — recent forecast drift, recent realized bias, seasonal skew, and the day's climatological variance should matter too.",
    method: "Same skew-t MLE framework, extended to 11 parameters across forecast-drift, recent-bias, climatological-variance, and day-of-year terms.",
    result: "2.2953 NLL/obs (−0.044 vs. Trial 2)",
  },
  {
    label: "v4 — production (live)",
    hypothesis:
      "A partial-dependence diagnostic on the Trial-3 fit showed clim_var's relationship to predicted outcome wasn't flat — real signal was still being left on the table.",
    method:
      "Added a quadratic clim_var term, refit via MLE, confirmed with a likelihood-ratio test against Trial 3 on the same window, then re-confirmed on an annual walk-forward CV (not just one split). This is what fv_live.py trades on today.",
    result: "LR stat 81 (need 3.84)",
  },
];

export const MODEL_FURTHER_EXPLORATION = [
  "v5 (doy_cos² added to the skew term): the same PDP process flagged a sharp, non-linear turn in doy_cos right around New Year. The quadratic extension gave a marginal, inconclusive OOS gain on walk-forward CV — not adopted.",
  "v6 (forecast_drift_std² added to scale): written to address a leftover flat/rise/dip/rise pattern the existing drift term couldn't express. Not yet fit or walk-forward tested — an open thread, not a result.",
  "Parameter audit, not just parameter addition: periodically re-tested whether an old parameter (df, tail-heaviness, live since v2) was still pulling its weight. LR stat 1.19 (not significant) — dropping it would cost ~0 NLL, confirmed across 3 full annual folds. Verified, but not yet adopted — would need a full re-fit and downstream re-run before it's safe to call done.",
];

export interface PDPPanel {
  key: string;
  label: string;
  grid: number[];
  avg: number[];
}

// Partial-dependence curves from a one-shot diagnostic XGBoost classifier
// (research/pdp_diagnostic.py) — a flat curve means the FV model already
// explains that variable; a sloped one means there's room left. Downsampled
// from 30 grid points to ~10 for a cleaner line without losing the shape.
export const PDP_PANELS: PDPPanel[] = [
  {
    key: "recent_bias",
    label: "recent_bias",
    grid: [-1.964, -1.28, -0.595, 0.09, 0.775, 1.459, 2.144, 2.658, 3.0],
    avg: [0.1927, 0.194, 0.1934, 0.1938, 0.1959, 0.1970, 0.1954, 0.1913, 0.1903],
  },
  {
    key: "clim_var",
    label: "clim_var",
    grid: [38.6, 47.9, 57.1, 66.4, 75.6, 84.8, 94.1, 103.3, 105.6],
    avg: [0.1922, 0.1918, 0.1919, 0.1940, 0.1939, 0.1937, 0.1938, 0.1953, 0.1963],
  },
  {
    key: "doy_cos",
    label: "doy_cos",
    grid: [-0.985, -0.713, -0.441, -0.169, 0.103, 0.375, 0.647, 0.919, 0.987],
    avg: [0.1934, 0.1931, 0.1937, 0.1942, 0.1939, 0.1942, 0.1969, 0.1987, 0.1905],
  },
  {
    key: "forecast_drift_std",
    label: "forecast_drift_std",
    grid: [0, 0.208, 0.415, 0.623, 0.831, 1.038, 1.246, 1.454, 1.506],
    avg: [0.1904, 0.1904, 0.1937, 0.1937, 0.1917, 0.1929, 0.1953, 0.1953, 0.1927],
  },
  {
    key: "spread_f",
    label: "spread_f",
    grid: [1, 2, 3, 4, 5, 6, 7],
    avg: [0.1910, 0.1928, 0.1970, 0.2061, 0.2109, 0.2109, 0.2109],
  },
];

// The real candidate set fv_live.py computed and logged for one real day —
// Sept 26, 2026, straight from Execution/logs/scheduler.log. T69 is the one
// actually traded (122 contracts @ 1c). Not the exchange's full bucket
// ladder, just the exact candidates that day's decision considered.
export interface LiveCandidate {
  ticker: string;
  fv: number;
  ask: number;
  edge: number;
  traded: boolean;
}

export const LIVE_FV_SNAPSHOT = {
  date: "September 26, 2026",
  candidates: [
    { ticker: "T69", fv: 0.2205, ask: 0.01, edge: 0.2005, traded: true },
    { ticker: "B68.5", fv: 0.1093, ask: 0.02, edge: 0.0793, traded: false },
    { ticker: "B66.5", fv: 0.1291, ask: 0.09, edge: 0.0291, traded: false },
    { ticker: "B64.5", fv: 0.1348, ask: 0.21, edge: -0.0952, traded: false },
    { ticker: "B62.5", fv: 0.1240, ask: 0.3, edge: -0.196, traded: false },
    { ticker: "T62", fv: 0.2823, ask: 0.4, edge: -0.1377, traded: false },
  ] as LiveCandidate[],
};

export const DATA_PROVENANCE_NOTE =
  "Caught a real settlement bug rather than trusting a data source blindly: GHCN's archived high for July 15, 2026 loaded as 81°F, but the NWS's own primary CLI report — what Kalshi actually settles on — already had the correct 95°F. Confirmed independently before changing anything. The live system now pulls the CLI report directly for the last ~10 days of settlement; the full 2021–2025 training window still runs on GHCN, tracked as an open audit item rather than assumed fine.";

// The 12 unambiguous "B"-ticker live trades since the system went live
// (July 24, 2026) — resolved by cross-referencing real settlement temps
// against Kalshi's own confirmed ticker convention (Bxx.5 -> between floor
// xx and cap xx+1, verified against 40+ historical resolved markets). The
// 4 "T"-ticker (open-ended) trades below were resolved via a read-only
// live lookup (Kalshi's own market.result field, cross-checked against
// observed settlement temps — both agree on all 4). Only the Sept 26 trade
// is excluded now: target date not yet settled (market status: active).
// The Sept 12 row uses count=3, not the 6 originally requested — cross-
// checked against Execution/execution_state.db's trade_intents table,
// whose fill_count shows the order only partially filled.
export interface LedgerRow {
  date: string;
  bucket: string;
  count: number;
  priceCents: number;
  actual: number;
  won: boolean;
  pnl: number;
  // Real fv/kelly_f/stake_frac at decision time — only populated from
  // 2026-09-24 onward. Everything before that predates the durable DB
  // columns added to record this (previously logged only to a text log
  // that doesn't go back that far); rather than guess, earlier rows just
  // don't have it. See state.py in the real repo for the migration.
  fv?: number;
  stakeFrac?: number;
}

export const TRADE_LEDGER: LedgerRow[] = [
  { date: "2026-07-24", bucket: "81–82°", count: 1, priceCents: 28, actual: 83, won: false, pnl: -0.28 },
  { date: "2026-07-25", bucket: "82–83°", count: 2, priceCents: 29, actual: 81, won: false, pnl: -0.58 },
  { date: "2026-07-27", bucket: "83–84°", count: 7, priceCents: 21, actual: 83, won: true, pnl: 5.53 },
  { date: "2026-08-04", bucket: "83–84°", count: 4, priceCents: 26, actual: 84, won: true, pnl: 2.96 },
  { date: "2026-09-10", bucket: "<85°", count: 2, priceCents: 30, actual: 84, won: true, pnl: 1.4 },
  { date: "2026-09-12", bucket: "<75°", count: 3, priceCents: 3, actual: 78, won: false, pnl: -0.09 },
  { date: "2026-09-14", bucket: "<74°", count: 3, priceCents: 38, actual: 75, won: false, pnl: -1.14 },
  { date: "2026-09-15", bucket: "74–75°", count: 3, priceCents: 9, actual: 72, won: false, pnl: -0.27 },
  { date: "2026-09-17", bucket: "86–87°", count: 4, priceCents: 2, actual: 82, won: false, pnl: -0.08 },
  { date: "2026-09-18", bucket: "<80°", count: 2, priceCents: 32, actual: 80, won: false, pnl: -0.64 },
  { date: "2026-09-19", bucket: "73–74°", count: 1, priceCents: 8, actual: 69, won: false, pnl: -0.08 },
  { date: "2026-09-20", bucket: "73–74°", count: 7, priceCents: 10, actual: 67, won: false, pnl: -0.7 },
  { date: "2026-09-21", bucket: "72–73°", count: 22, priceCents: 5, actual: 72, won: true, pnl: 20.9 },
  { date: "2026-09-22", bucket: "67–68°", count: 8, priceCents: 9, actual: 68, won: true, pnl: 7.28 },
  { date: "2026-09-23", bucket: "71–72°", count: 45, priceCents: 3, actual: 67, won: false, pnl: -1.35 },
  {
    date: "2026-09-24",
    bucket: "72–73°",
    count: 17,
    priceCents: 3,
    actual: 66,
    won: false,
    pnl: -0.51,
    fv: 0.19894759453149025,
    stakeFrac: 0.016557041097030236,
  },
];

export const LEDGER_TOTALS = {
  trades: TRADE_LEDGER.length,
  wins: TRADE_LEDGER.filter((r) => r.won).length,
  staked: TRADE_LEDGER.reduce((s, r) => s + (r.count * r.priceCents) / 100, 0),
  pnl: TRADE_LEDGER.reduce((s, r) => s + r.pnl, 0),
};

// Real total account value (cash + the one open position, marked at cost),
// fetched read-only from Kalshi on 2026-09-26 — not disclosed directly on
// the site, only used as the denominator for every % figure below so the
// live ledger can be shown honestly without publishing the exact balance.
export const CURRENT_ACCOUNT_VALUE = 121.5757 + 1.22;

export const LEDGER_TOTALS_PCT = LEDGER_TOTALS.pnl / CURRENT_ACCOUNT_VALUE;

// Real peak-to-trough on the cumulative live P&L curve (running-peak
// method, verified by script against execution_state.db's actual fills):
// peak +$9.03 on 2026-09-10, trough +$6.03 on 2026-09-20 after seven small
// losses in a row — a live-ledger figure, not the backtest's max drawdown
// below (different sample size, not a contradiction — see BACKTEST_SUMMARY
// for the 567-trade/5-year figure).
//
// The % is computed against the bankroll AT THE TIME OF THE PEAK, not
// today's (larger, post-recovery) balance — that's the standard max-
// drawdown definition. The starting bankroll is back-solved from two real
// numbers (today's fetched account value minus the ledger's total realized
// P&L), which assumes no deposits/withdrawals happened during the window.
function computeLiveDrawdown() {
  let cum = 0;
  let peakCum = 0;
  let maxDdDollars = 0;
  let peakCumAtMaxDd = 0;
  let peakDate = "";
  let troughDate = "";
  let runningPeakDate = "";
  for (const row of TRADE_LEDGER) {
    cum += row.pnl;
    if (cum > peakCum) {
      peakCum = cum;
      runningPeakDate = row.date;
    }
    const dd = cum - peakCum;
    if (dd < maxDdDollars) {
      maxDdDollars = dd;
      troughDate = row.date;
      peakDate = runningPeakDate;
      peakCumAtMaxDd = peakCum;
    }
  }
  return { dollars: maxDdDollars, peakDate, troughDate, peakCumAtMaxDd };
}

const STARTING_BANKROLL = CURRENT_ACCOUNT_VALUE - LEDGER_TOTALS.pnl;
const _liveDrawdown = computeLiveDrawdown();
const PEAK_BANKROLL_AT_DRAWDOWN = STARTING_BANKROLL + _liveDrawdown.peakCumAtMaxDd;

export const LIVE_MAX_DRAWDOWN = {
  dollars: _liveDrawdown.dollars,
  peakDate: _liveDrawdown.peakDate,
  troughDate: _liveDrawdown.troughDate,
  pct: _liveDrawdown.dollars / PEAK_BANKROLL_AT_DRAWDOWN,
};

// Live Sharpe, computed the same way BACKTEST_SUMMARY's is (pnl_selection.py's
// summarize_performance): one return per CALENDAR day since go-live (0 on
// days with no resolved trade, including today — the Sept 26 trade is still
// open), mean/std of that full daily series, annualized by sqrt(365). Not
// pulled from anywhere — computed here, directly from TRADE_LEDGER, so it
// can't drift out of sync with the ledger above.
export const LIVE_GO_LIVE_DATE = "2026-07-24";
export const LIVE_SNAPSHOT_DATE = "2026-09-26"; // "today" as of this data pull

function liveDailyReturns(): number[] {
  const pnlByDate = new Map(TRADE_LEDGER.map((r) => [r.date, r.pnl]));
  const returns: number[] = [];
  const d = new Date(`${LIVE_GO_LIVE_DATE}T00:00:00Z`);
  const end = new Date(`${LIVE_SNAPSHOT_DATE}T00:00:00Z`);
  while (d <= end) {
    const iso = d.toISOString().slice(0, 10);
    returns.push((pnlByDate.get(iso) ?? 0) / CURRENT_ACCOUNT_VALUE);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return returns;
}

const LIVE_DAILY_RETURNS = liveDailyReturns();
const LIVE_MEAN_DAILY_RETURN = LIVE_DAILY_RETURNS.reduce((a, b) => a + b, 0) / LIVE_DAILY_RETURNS.length;
const LIVE_STD_DAILY_RETURN = Math.sqrt(
  LIVE_DAILY_RETURNS.reduce((a, b) => a + (b - LIVE_MEAN_DAILY_RETURN) ** 2, 0) / (LIVE_DAILY_RETURNS.length - 1)
);
export const LIVE_SHARPE = (LIVE_MEAN_DAILY_RETURN / LIVE_STD_DAILY_RETURN) * Math.sqrt(365);
export const LIVE_SHARPE_N_DAYS = LIVE_DAILY_RETURNS.length;

// Live CAGR, same annualization as the backtest's (compounded total return,
// raised to 365/n_days) — extrapolating a 65-day return out to a full year
// produces an extreme number by construction; shown for reference next to
// the backtest's point estimate, not as a claim the strategy actually
// compounds at this rate.
const LIVE_ENDING_BANKROLL_MULT = LIVE_DAILY_RETURNS.reduce((acc, r) => acc * (1 + r), 1);
export const LIVE_TOTAL_RETURN = LIVE_ENDING_BANKROLL_MULT - 1;
export const LIVE_CAGR = Math.pow(LIVE_ENDING_BANKROLL_MULT, 365 / LIVE_SHARPE_N_DAYS) - 1;

// Real backtest, not the live ledger above — run directly against the
// production sizing cell (kelly_multiplier=0.10, max_position=0.02, from
// sizing.py) using the model's raw fv (what's actually live; the XGBoost
// calibrator was never wired into the live path). 567 trades, 2021-08-06
// to 2026-05-16, argmax-Kelly-per-day selection, bootstrapped 2000x.
export const BACKTEST_SUMMARY = {
  window: "2021-08-06 to 2026-05-16",
  days: 1712,
  trades: 567,
  totalReturn: 4.615,
  winRate: 0.317,
  point: { cagr: 0.445, sharpe: 1.12, maxDrawdown: -0.398 },
  bootstrap: {
    cagr: { p05: 0.0897, median: 0.4369, p95: 0.8845 },
    sharpe: { p05: 0.418, median: 1.1201, p95: 1.6565 },
    maxDrawdown: { p05: -0.4944, median: -0.3133, p95: -0.2049 },
  },
  probPositive: 0.99,
};

// Real methodology, paraphrased from bootstrap_performance's own docstring
// in Weather/portfolio/pnl_selection.py — not written for this page.
export const BOOTSTRAP_METHODOLOGY_NOTE =
  "Why bootstrap instead of trusting the single backtest run: with only 567 trades, the one realized sequence of wins and losses is just one draw from a much wider range of outcomes. Each of the 2000 resamples keeps the real calendar pattern of which days had a trade, but reshuffles — with replacement — which historical outcome lands on each of those days. That randomizes the sequence Sharpe and max drawdown are sensitive to, while leaving how often the strategy actually traded untouched. The point estimate (accent line) is what really happened; the band is the honest range around it.";

export const EXECUTION_STEPS = [
  { label: "Kill switch", detail: "flag-file halt, checked before every order — manual or auto-tripped on repeated data-refresh failure" },
  { label: "Live FV", detail: "fv_live.py computes fresh fair value per bucket from live prices + the production v4 model" },
  { label: "Best candidate", detail: "argmax positive-edge bucket for the day — one trade, not several correlated bets on the same underlying" },
  { label: "Kelly size", detail: "0.10× Kelly fraction, capped at 2% of live balance — the backtested sizing cell" },
  { label: "Idempotency check", detail: "DB unique constraint on client_order_id — an exact duplicate submission is blocked, a genuinely different decision isn't" },
  { label: "Submit", detail: "marketable IOC limit order — fills now at the checked price or not at all, never rests unmonitored" },
  { label: "Reconcile", detail: "on a network-ambiguous failure (timeout, no response), searches Kalshi's own order history by client_order_id instead of guessing" },
];
// ---------------------------------------------------------------------------
// Statistical Arbitrage Backtester
// ---------------------------------------------------------------------------

// The real top-10 cointegrated pairs (of 50 S&P 500 names, correlation >0.8
// then Engle-Granger cointegration p<0.01), each independently backtested
// with the strategy's real entry/exit z-score rules — straight from
// top10_pairs_results.csv, the script's own saved output.
export interface PairResult {
  s1: string;
  s2: string;
  pValue: number;
  cumReturn: number;
  sharpe: number;
  annReturn: number;
  annVol: number;
  maxDrawdown: number;
}

export const STAT_ARB_PAIRS: PairResult[] = [
  { s1: "PM", s2: "UNH", pValue: 0.001566, cumReturn: 0.3008, sharpe: 0.5375, annReturn: 0.048, annVol: 0.0893, maxDrawdown: -0.1235 },
  { s1: "ABT", s2: "QCOM", pValue: 0.000702, cumReturn: 0.2901, sharpe: 0.5211, annReturn: 0.0467, annVol: 0.0895, maxDrawdown: -0.1529 },
  { s1: "ABT", s2: "TXN", pValue: 0.007072, cumReturn: 0.2295, sharpe: 0.4887, annReturn: 0.0376, annVol: 0.0769, maxDrawdown: -0.1103 },
  { s1: "MA", s2: "WMT", pValue: 0.0000043, cumReturn: 0.158, sharpe: 0.3308, annReturn: 0.0282, annVol: 0.0853, maxDrawdown: -0.1467 },
  { s1: "JNJ", s2: "TMO", pValue: 0.008939, cumReturn: 0.1361, sharpe: 0.3255, annReturn: 0.0241, annVol: 0.074, maxDrawdown: -0.1371 },
  { s1: "CRM", s2: "META", pValue: 0.006929, cumReturn: 0.1735, sharpe: 0.3005, annReturn: 0.0328, annVol: 0.109, maxDrawdown: -0.2933 },
  { s1: "TSLA", s2: "UPS", pValue: 0.00746, cumReturn: 0.1915, sharpe: 0.2829, annReturn: 0.0387, annVol: 0.1367, maxDrawdown: -0.2549 },
  { s1: "ACN", s2: "HD", pValue: 0.000121, cumReturn: 0.0964, sharpe: 0.2769, annReturn: 0.0174, annVol: 0.0627, maxDrawdown: -0.1224 },
  { s1: "IBM", s2: "LLY", pValue: 0.000444, cumReturn: 0.1024, sharpe: 0.1898, annReturn: 0.0251, annVol: 0.1325, maxDrawdown: -0.213 },
  { s1: "V", s2: "WMT", pValue: 0.0000837, cumReturn: 0.0735, sharpe: 0.1797, annReturn: 0.0157, annVol: 0.0872, maxDrawdown: -0.1885 },
];

// Real portfolio built from the top 5 of those pairs (inverse-volatility /
// risk-parity weights, 5x leverage — both exactly what the script computes),
// backtested 2018-01-02 to 2023-12-29 (1,509 trading days). Equity curve,
// drawdown, and the SPY comparison are all real, downsampled from daily to
// ~60 points for the chart; SPY was pulled the same way the script's own
// data_loader.load_spy_cumulative does.
export const STAT_ARB_PORTFOLIO = {
  window: "2018-01-02 to 2023-12-29",
  nDays: 1509,
  leverage: 5,
  riskParityWeights: [
    { pair: "PM-UNH", weight: 0.1852 },
    { pair: "ABT-QCOM", weight: 0.1844 },
    { pair: "ABT-TXN", weight: 0.2152 },
    { pair: "MA-WMT", weight: 0.1918 },
    { pair: "JNJ-TMO", weight: 0.2234 },
  ],
  summary: { totalReturn: 1.2108, sharpe: 0.727, annReturn: 0.156, annVol: 0.2146, maxDrawdown: -0.5995 },
  spyTotalReturn: 0.9611,
  dates: [
    "2018-01-02", "2018-02-07", "2018-03-16", "2018-04-23", "2018-05-30", "2018-07-05", "2018-08-10", "2018-09-17",
    "2018-10-23", "2018-11-29", "2019-01-08", "2019-02-14", "2019-03-22", "2019-04-30", "2019-06-05", "2019-07-12",
    "2019-08-16", "2019-09-24", "2019-10-30", "2019-12-05", "2020-01-14", "2020-02-20", "2020-03-27", "2020-05-04",
    "2020-06-10", "2020-07-16", "2020-08-21", "2020-09-29", "2020-11-03", "2020-12-10", "2021-01-19", "2021-02-25",
    "2021-04-01", "2021-05-10", "2021-06-16", "2021-07-22", "2021-08-27", "2021-10-04", "2021-11-09", "2021-12-15",
    "2022-01-24", "2022-03-01", "2022-04-06", "2022-05-13", "2022-06-21", "2022-07-28", "2022-09-01", "2022-10-10",
    "2022-11-14", "2022-12-21", "2023-01-30", "2023-03-08", "2023-04-14", "2023-05-19", "2023-06-28", "2023-08-03",
    "2023-09-11", "2023-10-16", "2023-11-21", "2023-12-29",
  ],
  cumulative: [
    0.0, 0.0692, 0.1057, 0.1952, 0.174, 0.1938, 0.2256, 0.2647, 0.3186, 0.3937, 0.4235, 0.4817, 0.5293, 0.5813, 0.727,
    0.7526, 0.6946, 0.7666, 0.8691, 1.0166, 0.9672, 0.9139, 0.8538, 0.6724, 0.7627, 0.784, 0.8003, 0.7147, 0.5134,
    0.6286, 0.6185, 0.6595, 0.7033, 0.6835, 0.6594, 0.7485, 0.7571, 0.753, 0.8358, 0.7836, 0.8327, 0.773, 0.7826,
    0.789, 0.7046, 0.7382, 0.8195, 0.752, 0.7734, 0.8076, 0.8263, 0.7544, 0.8763, 0.937, 1.0537, 1.0923, 1.1026,
    1.1344, 1.2188, 1.2108,
  ],
  drawdown: [
    0.0, -0.0127, 0.0, 0.0, -0.043, -0.0232, -0.0505, -0.0114, -0.0356, -0.0229, -0.0752, -0.017, 0.0, -0.0469,
    -0.0127, -0.0341, -0.0922, -0.0202, -0.011, 0.0, -0.0618, -0.1151, -0.1752, -0.3566, -0.2663, -0.245, -0.2287,
    -0.3143, -0.5156, -0.4004, -0.4105, -0.3695, -0.3256, -0.3455, -0.3696, -0.2805, -0.2719, -0.276, -0.1932,
    -0.2454, -0.1963, -0.256, -0.2464, -0.24, -0.3244, -0.2908, -0.2095, -0.277, -0.2556, -0.2214, -0.2027, -0.2746,
    -0.1527, -0.092, -0.0268, -0.0372, -0.0549, -0.0585, -0.0025, -0.0367,
  ],
  spyCumulative: [
    0.0, -0.0041, 0.0243, -0.0042, 0.0183, 0.0248, 0.0625, 0.0857, 0.0313, 0.0327, -0.0265, 0.0403, 0.0634, 0.1196,
    0.0775, 0.1505, 0.1053, 0.1374, 0.1692, 0.1995, 0.265, 0.3017, -0.0153, 0.1019, 0.2396, 0.252, 0.325, 0.3024,
    0.3168, 0.4371, 0.4901, 0.5046, 0.5817, 0.6501, 0.6666, 0.7249, 0.7835, 0.7033, 0.8573, 0.8701, 0.754, 0.7146,
    0.7861, 0.6069, 0.5068, 0.6313, 0.5926, 0.4523, 0.5939, 0.5652, 0.6234, 0.6166, 0.6778, 0.7029, 0.7818, 0.8326,
    0.831, 0.7866, 0.8572, 0.9611,
  ],
};

// The best pair (PM-UNH) — real z-score signal over time, downsampled to 80
// points. The strategy enters at |z|>2 (full size) or |z|>0.5 (half size)
// and holds until it crosses back toward 0.
export const STAT_ARB_EXAMPLE_PAIR = {
  s1: "PM",
  s2: "UNH",
  entryZ: 2,
  scaleInZ: 0.5,
  dates: [
    "2018-01-02", "2018-01-30", "2018-02-27", "2018-03-26", "2018-04-23", "2018-05-18", "2018-06-15", "2018-07-13",
    "2018-08-09", "2018-09-06", "2018-10-03", "2018-10-30", "2018-11-28", "2018-12-27", "2019-01-25", "2019-02-22",
    "2019-03-21", "2019-04-17", "2019-05-15", "2019-06-12", "2019-07-10", "2019-08-06", "2019-09-03", "2019-10-01",
    "2019-10-28", "2019-11-22", "2019-12-20", "2020-01-21", "2020-02-18", "2020-03-16", "2020-04-13", "2020-05-08",
    "2020-06-05", "2020-07-02", "2020-07-31", "2020-08-27", "2020-09-24", "2020-10-21", "2020-11-17", "2020-12-15",
    "2021-01-13", "2021-02-10", "2021-03-10", "2021-04-07", "2021-05-04", "2021-06-01", "2021-06-29", "2021-07-27",
    "2021-08-23", "2021-09-20", "2021-10-15", "2021-11-11", "2021-12-09", "2022-01-06", "2022-02-03", "2022-03-03",
    "2022-03-30", "2022-04-28", "2022-05-25", "2022-06-23", "2022-07-21", "2022-08-17", "2022-09-14", "2022-10-11",
    "2022-11-07", "2022-12-05", "2023-01-03", "2023-01-31", "2023-03-01", "2023-03-28", "2023-04-25", "2023-05-22",
    "2023-06-20", "2023-07-18", "2023-08-14", "2023-09-11", "2023-10-06", "2023-11-02", "2023-11-30", "2023-12-29",
  ],
  zscore: [
    2.465, 2.64, 2.248, 1.658, -0.104, -0.618, -0.678, -0.486, -0.323, -1.169, -0.525, 0.609, -0.258, -2.009, -1.609,
    0.209, 1.032, 0.933, 0.604, -0.562, -0.086, 0.035, -0.791, 0.24, 0.309, -0.139, 0.117, 0.463, 0.248, -0.868,
    -0.749, -1.399, -1.281, -1.662, -0.867, -0.577, -0.617, -1.469, -1.321, -0.313, -0.834, 0.194, 0.04, 0.133,
    0.318, 0.662, 1.118, 1.108, 1.082, 1.29, 0.828, -0.16, -1.26, 0.156, 0.784, 0.623, -1.062, 0.153, 1.527, 0.413,
    -0.997, -0.224, -0.791, -1.667, -1.622, 0.466, 0.609, 1.402, 0.759, 0.46, 0.835, 0.137, 0.575, 0.816, 0.225,
    0.525, -0.433, -0.829, -0.726, 0.031,
  ],
};

// ---------------------------------------------------------------------------
// Research-process update: the same strategy re-run walk-forward. Everything
// below is generated by Stat_Arb_Project/src/walk_forward.py and compare.py
// (results/*.csv). Each fold fits pairs (cointegration p-value only, top 10,
// p<0.01), hedge ratio and spread mean/std on a 2-year formation window, then
// trades the next 6 months with those estimates frozen. 8 folds, 1,005 days.
// Equal-weighted pairs, 1x; the leverage rows scale daily returns and charge
// 5%/yr financing on the borrowed part. Curves downsampled to 60 points.
// ---------------------------------------------------------------------------
export const STAT_ARB_WALKFORWARD = {
  window: "2020-01-03 to 2023-12-29",
  nDays: 1005,
  formationDays: 504,
  tradeDays: 126,
  financingRate: 0.05,
  spyTotalReturn: 0.57,
  spySharpe: 0.61,
  dates: ["2020-01-03", "2020-01-29", "2020-02-24", "2020-03-18", "2020-04-13", "2020-05-06", "2020-06-01", "2020-06-24", "2020-07-20", "2020-08-12", "2020-09-04", "2020-09-30", "2020-10-23", "2020-11-17", "2020-12-11", "2021-01-07", "2021-02-02", "2021-02-26", "2021-03-23", "2021-04-16", "2021-05-11", "2021-06-04", "2021-06-29", "2021-07-23", "2021-08-17", "2021-09-10", "2021-10-05", "2021-10-28", "2021-11-22", "2021-12-16", "2022-01-12", "2022-02-07", "2022-03-03", "2022-03-28", "2022-04-21", "2022-05-16", "2022-06-09", "2022-07-06", "2022-07-29", "2022-08-23", "2022-09-16", "2022-10-11", "2022-11-03", "2022-11-29", "2022-12-22", "2023-01-19", "2023-02-13", "2023-03-09", "2023-04-03", "2023-04-27", "2023-05-22", "2023-06-15", "2023-07-12", "2023-08-04", "2023-08-29", "2023-09-22", "2023-10-17", "2023-11-09", "2023-12-05", "2023-12-29"],
  cum1x: [0.0, 0.0009, -0.0052, -0.0473, -0.0311, -0.0384, -0.0164, -0.016, -0.0262, -0.0239, -0.041, -0.0351, -0.0395, -0.0448, -0.0514, -0.0435, -0.0311, -0.0372, -0.0399, -0.0387, -0.0787, -0.09, -0.0908, -0.0743, -0.0993, -0.0926, -0.0825, -0.1028, -0.1181, -0.1247, -0.1248, -0.117, -0.1085, -0.1084, -0.145, -0.2028, -0.1766, -0.2153, -0.2119, -0.2177, -0.2179, -0.2264, -0.2114, -0.1992, -0.1934, -0.194, -0.1966, -0.1891, -0.1837, -0.1837, -0.1945, -0.214, -0.2215, -0.1963, -0.1893, -0.191, -0.1972, -0.1852, -0.1795, -0.194],
  cum5x: [-0.0008, -0.0098, -0.0539, -0.2562, -0.203, -0.2441, -0.1666, -0.1767, -0.2291, -0.2321, -0.3091, -0.2977, -0.3229, -0.3513, -0.3823, -0.3652, -0.3327, -0.3626, -0.3801, -0.3859, -0.5186, -0.5562, -0.5666, -0.5348, -0.6008, -0.5916, -0.5745, -0.625, -0.6608, -0.678, -0.6832, -0.6734, -0.6621, -0.6663, -0.7356, -0.8222, -0.7956, -0.8445, -0.8432, -0.851, -0.8533, -0.8634, -0.8518, -0.8424, -0.839, -0.8418, -0.8468, -0.8421, -0.8393, -0.8417, -0.8546, -0.8738, -0.8815, -0.8632, -0.8591, -0.8625, -0.8695, -0.8615, -0.8587, -0.8726],
  spyCumulative: [0.0, 0.0131, 0.0, -0.2556, -0.14, -0.1132, -0.0467, -0.0471, 0.0163, 0.0574, 0.0735, 0.0536, 0.0879, 0.1346, 0.1524, 0.1978, 0.2055, 0.2018, 0.2347, 0.3227, 0.313, 0.3396, 0.3602, 0.3991, 0.4122, 0.4166, 0.3818, 0.4623, 0.4918, 0.4882, 0.5081, 0.432, 0.395, 0.4642, 0.4069, 0.2849, 0.2893, 0.2362, 0.3289, 0.33, 0.2487, 0.1586, 0.2016, 0.2801, 0.2387, 0.2645, 0.3432, 0.274, 0.3422, 0.3469, 0.3678, 0.4455, 0.4621, 0.4647, 0.4724, 0.416, 0.4344, 0.4272, 0.5021, 0.57],
  leverage: [
    { leverage: 1, cumReturn: -0.1940, annVol: 0.0666, sharpe: -0.78, maxDrawdown: -0.2329, worstDay: -0.0381 },
    { leverage: 2, cumReturn: -0.4773, annVol: 0.1332, sharpe: -1.15, maxDrawdown: -0.5034, worstDay: -0.0763 },
    { leverage: 3, cumReturn: -0.6672, annVol: 0.1998, sharpe: -1.28, maxDrawdown: -0.6872, worstDay: -0.1146 },
    { leverage: 5, cumReturn: -0.8726, annVol: 0.3330, sharpe: -1.38, maxDrawdown: -0.8826, worstDay: -0.1911 },
    { leverage: 8, cumReturn: -0.9740, annVol: 0.5329, sharpe: -1.43, maxDrawdown: -0.9766, worstDay: -0.3058 },
    { leverage: 10, cumReturn: -0.9919, annVol: 0.6661, sharpe: -1.45, maxDrawdown: -0.9928, worstDay: -0.3824 },
  ],
  folds: [
    { start: "2020-01-03", end: "2020-07-02", pairsPassed: 17, pairsTraded: 10, ret: -0.0178 },
    { start: "2020-07-06", end: "2020-12-31", pairsPassed: 10, pairsTraded: 10, ret: -0.0262 },
    { start: "2021-01-04", end: "2021-07-02", pairsPassed: 35, pairsTraded: 10, ret: -0.0319 },
    { start: "2021-07-06", end: "2021-12-31", pairsPassed: 28, pairsTraded: 10, ret: -0.0561 },
    { start: "2022-01-03", end: "2022-07-05", pairsPassed: 30, pairsTraded: 10, ret: -0.1022 },
    { start: "2022-07-06", end: "2023-01-03", pairsPassed: 25, pairsTraded: 10, ret: 0.0262 },
    { start: "2023-01-04", end: "2023-07-06", pairsPassed: 21, pairsTraded: 10, ret: -0.0332 },
    { start: "2023-07-07", end: "2023-12-29", pairsPassed: 7, pairsTraded: 7, ret: 0.0354 },
  ],
  // v1 = the numbers this page originally led with (top 5 pairs, 5x, 2018-2023, all in-sample).
  // v2 = same script after fixing the look-ahead + argument-order bugs (top 10 pairs, 5x, 2018-2023,
  // still in-sample). v3 = walk-forward.
  versions: [
    { id: "v1", label: "original", note: "in-sample, look-ahead, argument-order bug", window: "2018–2023", cumReturn: 1.2108, sharpe: 0.73, maxDrawdown: -0.5995 },
    { id: "v2", label: "bugs fixed", note: "still in-sample", window: "2018–2023", cumReturn: 18.216, sharpe: 3.42, maxDrawdown: -0.073 },
    { id: "v3", label: "walk-forward, 5x", note: "out-of-sample", window: "2020–2023", cumReturn: -0.8726, sharpe: -1.38, maxDrawdown: -0.8826 },
    { id: "v3", label: "walk-forward, 1x", note: "out-of-sample", window: "2020–2023", cumReturn: -0.194, sharpe: -0.78, maxDrawdown: -0.2329 },
  ],
};

// ---------------------------------------------------------------------------
// Derivatives Pricer (C++) — from ~/Desktop/Coding_Proj/Derivatives_Pricer,
// not part of this repo. A from-scratch closed-form Black-Scholes pricer in
// C++ (black_scholes.cpp/.hpp), exposed to Python via pybind11 bindings
// (bindings.cpp) and built with CMake. The source has no test suite of its
// own, so the curve below and the parity check were both produced by
// compiling that exact unmodified black_scholes.cpp with a small driver and
// running it once — not re-implemented or estimated here.
// ---------------------------------------------------------------------------

export const BS_PARAMS = { K: 100, T: 0.5, r: 0.05, sigma: 0.25 };

// Real call/put prices from black_scholes_price(S, 100, 0.5, 0.05, 0.25, ...)
// for S=70..130, step 5 — the exact values the compiled binary printed.
export const BS_CURVE = {
  spot: [70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
  call: [0.1712, 0.4562, 1.0254, 2.0066, 3.5073, 5.5893, 8.26, 11.4774, 15.1664, 19.2371, 23.6002, 28.1769, 32.9032],
  put: [27.7022, 22.9872, 18.5564, 14.5376, 11.0382, 8.1203, 5.791, 4.0084, 2.6974, 1.7681, 1.1312, 0.7079, 0.4342],
};

// Real put-call parity check at S=100 (same run): C - P should equal
// S - K*e^(-rT) exactly, up to floating-point precision — confirms the
// formula is implemented correctly without needing a separate test suite.
export const BS_PARITY_CHECK = {
  spot: 100,
  callMinusPut: 2.469009,
  spotMinusPvStrike: 2.469009,
};

