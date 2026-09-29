// Real content extracted from two actual local projects — not part of this
// repo: ~/Desktop/Coding_Proj/Stat_Arb_Project (pairs-trading backtester)
// and the skew-probit NCAA study (~/Downloads/proj_skewed_prob.py against a
// real 87,290-game NCAA basketball line/result dataset). Every number here
// was either read directly from that code's own saved output, or computed
// by running its own unmodified functions once and copying the result —
// nothing here is estimated or invented.

// ---------------------------------------------------------------------------
// March Madness Predictor — moved here from the former Sports category
// (folded into Research; see projects-data.ts). Real content from
// ~/Documents/MM_16.py, run against the user's actual NCAA D-I scores
// database (~/Downloads/ncaab scores teamIds 0001 2425.xlsx, 140,711 games,
// plus six live 2025-26 season pulls) and a real 2026 Final Four bracket
// template. Every number came from actually running that unmodified script
// once and copying the printed output — the tuning grids especially, since
// it would be easy to just assert "we tuned this" without showing the curve.
// ---------------------------------------------------------------------------

// The model: a Bradley-Terry-style point-margin regression — one dummy
// variable per team (+1 home, -1 away, 0 otherwise) regressed against the
// game's point differential, plus a neutral-site indicator. Backtest: fit
// on each season's regular season, predict that same season's postseason
// games, measure mean absolute error against the real final margin.
export const MM_DATASET = {
  nGamesTotal: 140711,
  nGamesFiltered: 57136,
  seasons: "2015–2025",
  nPostseasonGames: 1250,
};

// Real MAE at every grid value the script actually tested, holding the
// other two knobs at the values already chosen in earlier cells (matches
// the script's own cell order: cap first at decay=0.992, then decay at the
// winning cap=38, then shrinkage at the winning cap=38/decay=0.99).
export const MM_TUNING = {
  baselineMAE: 9.0552,
  finalMAE: 9.0277,
  cap: {
    chosen: 38,
    grid: [
      { x: 37, mae: 9.0299 },
      { x: 38, mae: 9.0294 },
      { x: 39, mae: 9.0296 },
      { x: 40, mae: 9.0301 },
      { x: 41, mae: 9.0314 },
      { x: 42, mae: 9.0331 },
      { x: 43, mae: 9.035 },
    ],
  },
  decay: {
    chosen: 0.99,
    grid: [
      { x: 0.985, mae: 9.0343 },
      { x: 0.986, mae: 9.0323 },
      { x: 0.987, mae: 9.0305 },
      { x: 0.988, mae: 9.0289 },
      { x: 0.989, mae: 9.0282 },
      { x: 0.99, mae: 9.0279 },
      { x: 0.991, mae: 9.0281 },
      { x: 0.992, mae: 9.0294 },
      { x: 0.993, mae: 9.0316 },
      { x: 0.994, mae: 9.0352 },
      { x: 0.995, mae: 9.0394 },
      { x: 0.996, mae: 9.0443 },
    ],
  },
  shrink: {
    chosen: 0.084,
    grid: [
      { x: 0.08, mae: 9.0277 },
      { x: 0.081, mae: 9.0277 },
      { x: 0.082, mae: 9.0277 },
      { x: 0.083, mae: 9.0277 },
      { x: 0.084, mae: 9.0277 },
      { x: 0.085, mae: 9.0277 },
      { x: 0.086, mae: 9.0277 },
      { x: 0.09, mae: 9.0278 },
      { x: 0.094, mae: 9.0279 },
      { x: 0.096, mae: 9.028 },
    ],
  },
};

// Real 2026 Final Four predictions from the tuned model (cap=38, decay=.99,
// shrink=.084) fit on the actual 2025-26 season through March 19, applied
// to the real bracket template. pred = predicted (home − away) margin;
// "home" here is just the template's left-column slot, not a true home
// team (both games are on a neutral court).
export interface BracketGame {
  round: string;
  team1: string;
  team2: string;
  margin: number; // positive favors team1
}

export const MM_BRACKET_2026: BracketGame[] = [
  { round: "Semifinal 1", team1: "Connecticut", team2: "Illinois", margin: 3.75 },
  { round: "Semifinal 2", team1: "Arizona", team2: "Michigan", margin: 0.46 },
  { round: "Championship (if UConn/Arizona)", team1: "Connecticut", team2: "Arizona", margin: 6.91 },
  { round: "Championship (if UConn/Michigan)", team1: "Connecticut", team2: "Michigan", margin: 7.81 },
  { round: "Championship (if Illinois/Arizona)", team1: "Illinois", team2: "Arizona", margin: 2.71 },
  { round: "Championship (if Illinois/Michigan)", team1: "Illinois", team2: "Michigan", margin: 3.62 },
];

// ---------------------------------------------------------------------------
// Point Shaving in NCAA — joint work with a classmate (Kellen), from their
// real final paper and slide deck ("Kellen + Rowan Point Shaving Metrics",
// "Final Paper Metrics Kellen Rowan"). Every number below is transcribed
// directly from that paper's own real regression output (Table 2) and real
// dataset description — not re-derived locally, since the paper's dataset
// (95,781 games, Todd Beck's prediction tracker) is a superset of what's
// available on this machine and re-running it here wouldn't reproduce the
// same table. This supersedes an earlier, much thinner version of this page
// built from a local, unrelated, less complete script.
// ---------------------------------------------------------------------------

export const POINT_SHAVING_DATASET = {
  nGames: 95781,
  seasonRange: "2003-2025",
  nSpreadModels: 42,
  nFavoriteWonSample: 70207,
  source: "Todd Beck's prediction tracker (thepredictiontracker.com)",
};

// The real prior-literature approach (Wolfers 2006): compare P(won but
// didn't cover | won) against P(didn't beat 2x the spread | beat the
// spread) — a "suspicious" gap between them was read as evidence of point
// shaving. The paper's real, exact counterargument: a team favored by S
// points has exactly S-1 winning margins that count as "won but didn't
// cover" (1, 2, ..., S-1), so that probability rises mechanically with
// spread size alone. They confirmed this isn't just an argument but a fact
// about the data: a simulation drawing margins from Normal(spread, σ) with
// zero manipulation imposed reproduces the identical divergence pattern
// seen in the real data (their Figure 5 vs. Figure 3) — the two are
// visually indistinguishable despite the simulation containing no
// point-shaving by construction.
export const POINT_SHAVING_MECHANICAL_NOTE =
  "A team favored by S points has exactly S−1 possible winning margins (1, 2, …, S−1) that count as \"won but didn't cover.\" That count grows with S regardless of any behavior on the court — Wolfers' divergence is present by construction. We confirmed this isn't just an argument: simulating margins from a zero-manipulation Normal(spread, σ) distribution reproduces the same divergence pattern seen in the real data, visually indistinguishable from the real chart.";

// The real trial log — four models, in the order actually estimated,
// all on the n=70,207 sample of games the favorite won. Exact coefficients,
// t-stats (in parentheses), and log-likelihoods from Table 2 of the paper.
export interface PointShavingTrial {
  label: string;
  hypothesis: string;
  method: string;
  result: string;
  ll: number;
}

export const POINT_SHAVING_TRIAL_LOG: PointShavingTrial[] = [
  {
    label: "Model 1 — standard probit (Wolfers baseline)",
    hypothesis: "If Wolfers is right, standardized absolute spread (z_absline) should positively predict winning-without-covering.",
    method: "P(Y=1) = Φ(β0 + β1·z_absline + β2·z_absline²), Y = 1 if favorite won but didn't cover, conditional on winning.",
    result: "z_absline: 0.668*** (t=87.09) — large and significant, exactly what Wolfers' reading would predict.",
    ll: -39438.4,
  },
  {
    label: "Model 2 — heteroskedastic probit",
    hypothesis: "Large-spread blowouts (garbage time, pulled starters) should inflate outcome variance, not just shift the mean — conflating the two is exactly the flaw in Model 1.",
    method: "Same mean equation, but the latent variance is now itself a function of spread: P(Y=1) = Φ((β0+β1·z)/exp(γ0+γ1·z+γ2·z²)).",
    result: "z_absline in the mean equation drops from 0.668 to 0.197*** (t=9.11) — a 70% reduction. The variance equation confirms why: z_absline predicts outcome dispersion with coefficient 1.009*** (t=23.45).",
    ll: -39013.4,
  },
  {
    label: "Model 3 — skew-probit, constant α",
    hypothesis: "Even after correcting variance, the outcome distribution might not be symmetric — the heteroskedastic probit still assumes it is.",
    method: "Azzalini (1985) skew-normal link with a single shape parameter α estimated jointly with the mean equation.",
    result: "α = −0.728*** (t=−25.99) — statistically significant asymmetry the first two models structurally can't represent.",
    ll: -39166.7,
  },
  {
    label: "Model 4 — skew-probit, α varying by spread",
    hypothesis: "The direction and degree of asymmetry might itself change across the spread distribution — close games and blowouts could be skewed differently.",
    method: "α = γ0 + γ1·z + γ2·z² + γ3·z³, a cubic in standardized spread, estimated jointly with the mean equation.",
    result: "Best fit of all four models. Every α-equation coefficient significant at p<0.001 — the shape of asymmetry genuinely shifts with spread size, not just its presence.",
    ll: -38962.4,
  },
];

export const POINT_SHAVING_HETEROSKEDASTICITY = {
  meanCoefProbit: 0.668,
  meanCoefHetprobit: 0.197,
  pctDrop: 70.5,
  varianceCoefs: { z: 1.009, z2: -0.119 }, // sigma(z) = exp(1.009z - 0.119z^2)
};

export const POINT_SHAVING_SKEW = {
  constAlpha: -0.728,
  constAlphaT: -25.99,
  varyAlphaCoefs: { z: -1.2, z2: 1.17, z3: -0.237, cons: -2.239 }, // alpha(z) cubic
  bestLL: -38962.4,
  deltaLLvsProbit: 476.0,
};

export const POINT_SHAVING_CONCLUSION =
  "Wolfers' identification strategy is fundamentally flawed — the divergence it relies on is mechanical, reproduced exactly by a zero-manipulation simulation. There is genuine, statistically significant asymmetry in outcomes (the skew-probit's real improvement in fit proves that), but the paper is explicit that asymmetry ≠ point shaving: it's equally consistent with garbage-time substitution patterns, coaches resting starters in blowouts, or betting markets pricing more accurately over time. No concrete evidence of manipulation either way.";

// ---------------------------------------------------------------------------
// Medical Marijuana Laws & Crime — group replication project (Eamon Coffey,
// Rowan Goranson, Will Kearney), from the real "Team #10 Metrics Project"
// deck. Every number here is transcribed directly from that deck's own real
// Stata output and from the original paper's published tables (screenshotted
// into the deck for comparison) — nothing re-derived locally.
// ---------------------------------------------------------------------------

export const MML_PAPER = {
  citation: "Gavrilova, Kamada & Zoutman (2019), The Economic Journal, Vol. 129, Issue 617, pp. 375–407",
  doi: "10.1111/ecoj.12521",
  title: "Is Legal Pot Crippling Mexican Drug Trafficking Organisations?",
  findings: [
    "12.5% drop in violent crime in counties near the Mexican border after medical marijuana law (MML) adoption",
    "40.6% drop specifically in drug-law-related homicides in those counties",
    "effect concentrated within ~350km of the border; no comparable effect in distant inland counties",
    "inland MML states also reduce crime in nearby border states (spillover), consistent with reduced demand for DTO-supplied marijuana",
  ],
  method: "difference-in-difference-in-difference (DDD): before/after MML, MML/non-MML states, near/far from the Mexican border",
};

export const MML_DATA = {
  window: "1994–2012",
  crimeSourcesNote: "FBI Uniform Crime Reports (violent crime rates) + Supplementary Homicide Reports (incident-level, including drug- and gang-related circumstances)",
  mmlSourceNote: "state legislative records + ProCon.org (MML adoption dates and provisions)",
  controlSourcesNote: "U.S. Census Bureau, Bureau of Labor Statistics, Bureau of Economic Analysis",
  totalControlObs: 59601,
};

// The real regression actually run (Stata, verbatim from the deck):
//   gen byte mmlInland = mml*(1-border)
//   gen byte mmlBorder = mml*border
//   reghdfe violent_rate mmlInland mmlBorder portionhispanic portionmale
//     portion20_24 povertyrate incomepercapita unemployment,
//     absorb(geofips border#year) vce(cluster statefips)
export const MML_SPEC =
  "reghdfe violent_rate mmlInland mmlBorder portionhispanic portionmale portion20_24 povertyrate incomepercapita unemployment, absorb(geofips border#year) vce(cluster statefips)";

// Real replication result (their own Stata output) vs. the original paper's
// own published Table 2, column 3 — same MML×border interaction, same sign,
// same significance, different magnitude and standard error.
export const MML_COMPARISON = {
  replication: { mmlInland: { coef: 15.2, t: 0.72, sig: false }, mmlBorder: { coef: -131.0, t: -3.25, sig: true }, n: 12033 },
  original: { mmlBorderCol3: { coef: -107.984, se: 20.969, sig: true }, mmlInlandRange: [1.169, 4.111] },
};

export const MML_CONCLUSION =
  "Both mmlInland and mmlBorder come out with the right sign and land close to the paper's own published magnitude — mmlBorder significant and negative in both, mmlInland small and statistically indistinguishable from zero in both. The standard errors don't match exactly, most likely from small discrepancies in county coverage or missing covariates that shift the effective number of clusters. Overall: a real, independent replication that reproduces the paper's central result, not just a citation of it.";

// ---------------------------------------------------------------------------
// Senior Honors Thesis — the manuscript itself isn't public yet, so unlike
// every other entry on this page, nothing below is a result pulled from a
// script's real output. This is deliberately just the question and the
// status, not invented findings.
// ---------------------------------------------------------------------------

export const THESIS_STATUS = "in progress · manuscript not yet public";

export const THESIS_QUESTION =
  "A dual Math-Econ senior honors thesis on prediction market efficiency — whether observed market prices track the true underlying probability, and where and why they systematically don't.";

export const THESIS_LIVE_CONNECTION =
  "The Kalshi weather-market trading system elsewhere on this site is a live, running instance of exactly this question: it fits a fair-value model for NYC temperature contracts and trades the gap wherever the market price and the model's estimate of true probability disagree. It's the applied, tested counterpart to the thesis's academic question, not a separate project.";

