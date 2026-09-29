// Content for /skills — kept separate from the page/components so it's easy
// to edit without touching any layout or rendering logic.

export type Tier = "Working" | "Moderate" | "Strong" | "Advanced";

// Order matters here — it's the scale used by the overview chart.
export const TIER_ORDER: Tier[] = ["Working", "Moderate", "Strong", "Advanced"];

export const TIER_VALUE: Record<Tier, number> = {
  Working: 1,
  Moderate: 2,
  Strong: 3,
  Advanced: 4,
};

// A heat progression anchored by the site's own tokens at both ends —
// Working is exactly --ink-muted, Advanced is exactly --accent — but the
// middle steps swing through gold and burnt orange instead of a straight
// RGB blend, which just produced muddy, hard-to-tell-apart browns. Distinct
// hues read as distinct tiers at a glance; a linear interpolation didn't.
export const TIER_COLOR: Record<Tier, string> = {
  Working: "#5b5f51",
  Moderate: "#a8823c",
  Strong: "#c05a2e",
  Advanced: "#a2372b",
};

export interface SkillLink {
  label: string;
  href: string;
}

export interface Skill {
  name: string;
  tier: Tier;
  // What the skill actually entails — real subtopics grounded in real
  // coursework/project work, not a marketing sentence. Left undefined
  // (falls back to "coming soon" in SkillRow) for skills with no real
  // evidence surfaced yet, rather than filling every row just to fill it.
  topics?: string[];
  // Real project pages that put this skill to work — kept separate from
  // topics since a topic is "what this covers" and a link is "where you can
  // see it used."
  links?: SkillLink[];
}

// A plain string for a course/experience name, or {text, href} for one that
// should render as a clickable reference (e.g. an external profile).
export type CourseworkEntry = string | { text: string; href: string };

export interface SkillCategory {
  name: string;
  skills: Skill[];
  // Real courses/experience in this domain — left empty until confirmed,
  // same "coming soon" rule as everything else on this site: never a
  // guessed course title standing in for a real one.
  coursework?: CourseworkEntry[];
}

export const categories: SkillCategory[] = [
  {
    name: "Math",
    coursework: [
      "MATH2203 Multivariable Calculus (Honors)",
      "MATH2211 Linear Algebra (Honors)",
      "MATH3310 Intro to Abstract Algebra",
      "MATH3320 Introduction to Analysis",
      "MATH4410 Differential Equations",
      "MATH4426 Probability",
      "MATH4427 Mathematical Statistics",
      "MATH4470 Mathematical Modeling (in progress)",
      "MATH4480 Topics in Mathematics (in progress)",
      "ECON1151 Statistics",
      "ECON2228 Econometric Methods",
      "ECON3370 Topics in Applied Econometrics",
      "ECON3308 Game Theory in Economics",
    ],
    skills: [
      {
        name: "Probability",
        tier: "Advanced",
        topics: ["combinatorics", "distribution theory", "stochastic processes", "Bayesian inference", "MLE for custom distributions (skew-normal, skew-t)"],
        links: [
          { label: "Kalshi Weather Model", href: "/trading/weather-model" },
          { label: "Point Shaving in NCAA", href: "/research/skew-probit" },
        ],
      },
      {
        name: "Statistics",
        tier: "Advanced",
        topics: ["hypothesis testing", "MLE", "bootstrap / resampling", "likelihood-ratio testing", "regression diagnostics (heteroskedasticity, BP test)"],
        links: [{ label: "PnL Dashboard", href: "/trading/pnl-dashboard" }],
      },
      {
        name: "Econometrics",
        tier: "Advanced",
        topics: ["panel data & fixed effects", "DDD / DID identification", "GLM (probit, logit, heteroskedastic probit)", "FGLS", "nonlinear least squares"],
        links: [
          { label: "Medical Marijuana Laws & Crime", href: "/research/mml-crime" },
          { label: "Point Shaving in NCAA", href: "/research/skew-probit" },
        ],
      },
      {
        name: "Mental math",
        tier: "Advanced",
        topics: ["speed arithmetic", "estimation under time pressure"],
        links: [{ label: "Gaming Achievements", href: "/games/achievements" }],
      },
      {
        name: "Game theory",
        tier: "Strong",
        topics: ["combinatorial game analysis", "expected-value optimization", "positional/synergy scoring"],
        links: [{ label: "Catan Placement Visualizer", href: "/games/catan-visualizer" }],
      },
    ],
  },
  {
    name: "Machine Learning",
    coursework: [
      "ECON3389 Machine Learning for Econ",
      "The Elements of Statistical Learning (2009) Self-Study",
      "Nielsen — Data Science Intern (Jun–Aug 2025)",
      "Tradeweb — Quantitative Research Intern (Jun–Aug 2026)",
    ],
    skills: [
      {
        name: "Machine learning (general)",
        tier: "Advanced",
        topics: ["gradient-boosted trees (XGBoost)", "walk-forward cross-validation", "model calibration", "feature engineering"],
        links: [
          { label: "Kalshi Weather Model", href: "/trading/weather-model" },
          { label: "March Madness Predictor", href: "/research/mm-predictor" },
        ],
      },
      {
        name: "Deep learning/NN",
        tier: "Moderate",
        topics: ["PySpark / Databricks pipelines", "deep learning model tuning (Nielsen)"],
      },
      { name: "LLMs/NLP", tier: "Moderate" },
      {
        name: "Time series",
        tier: "Strong",
        topics: ["walk-forward / expanding-window CV", "time-decay weighting", "forecast-drift modeling"],
        links: [
          { label: "Kalshi Weather Model", href: "/trading/weather-model" },
          { label: "March Madness Predictor", href: "/research/mm-predictor" },
        ],
      },
    ],
  },
  {
    name: "Computer Science",
    coursework: [
      { text: "LeetCode — Python, Self-Study", href: "https://leetcode.com/u/RowanLam/" },
      "Nielsen — Data Science Intern (Jun–Aug 2025)",
    ],
    skills: [
      {
        name: "Python",
        tier: "Strong",
        topics: ["pandas / numpy", "statsmodels / scipy", "XGBoost", "ETL / pipeline scripting"],
        links: [{ label: "all projects", href: "/projects" }],
      },
      {
        name: "SQL",
        tier: "Moderate",
        topics: ["querying & joins", "local database pipelines"],
        links: [{ label: "Kalshi Weather Model", href: "/trading/weather-model" }],
      },
      {
        name: "Data engineering",
        tier: "Strong",
        topics: ["ETL pipelines", "idempotency / data-integrity constraints", "failure handling (kill switches)", "reconciliation logic"],
        links: [{ label: "Kalshi Weather Model", href: "/trading/weather-model" }],
      },
      {
        name: "C++",
        tier: "Moderate",
        topics: ["closed-form numerical implementations", "Python bindings (pybind11)"],
        links: [{ label: "Derivatives Pricer (C++)", href: "/trading/derivatives-pricer" }],
      },
    ],
  },
  {
    name: "Markets & Trading",
    coursework: [
      "ACCT1021 Financial Accounting",
      "ECON2203 Microeconomic Theory (Honors)",
      "ECON2204 Macroeconomic Theory (Honors)",
      "MFIN1021 Fundamentals of Finance",
      "MFIN1127 Corporate Finance",
      "MFIN1151 Investments",
      "MFIN2202 Derivatives & Risk Management (in progress)",
      "Tradeweb — Quantitative Research Intern (Jun–Aug 2026)",
      "Inside the Black Box (2013) Self-Study",
      "Fortune's Formula (2005) Self-Study",
      "When Genius Failed (2000) Self-Study",
    ],
    skills: [
      {
        name: "Prediction markets",
        tier: "Advanced",
        topics: ["fair-value estimation", "live order execution", "edge detection"],
        links: [{ label: "Trading", href: "/trading" }],
      },
      {
        name: "Fixed income",
        tier: "Strong",
        topics: ["DV01-matched Treasury hedging", "Treasury relative-value / repo-premium modeling", "rates fair-value pricing (Bachelier)"],
      },
      {
        name: "Options",
        tier: "Strong",
        topics: ["Black-Scholes pricing (European options)"],
        links: [{ label: "Derivatives Pricer (C++)", href: "/trading/derivatives-pricer" }],
      },
      {
        name: "Market microstructure",
        tier: "Strong",
        topics: ["orderbook depth-of-book analysis", "bid/ask mechanics", "fill-probability estimation"],
        links: [{ label: "Kalshi Weather Model", href: "/trading/weather-model" }],
      },
      {
        name: "Risk management",
        tier: "Strong",
        topics: ["Kelly-criterion sizing", "position caps", "drawdown analysis", "kill-switch safeguards"],
        links: [{ label: "PnL Dashboard", href: "/trading/pnl-dashboard" }],
      },
    ],
  },
];

export interface SoftSkillEntry {
  title: string;
  description: string;
}

export interface SoftSkillGroup {
  name: string;
  entries: SoftSkillEntry[];
}

// Placeholder entries — structured so real ones can drop in without touching
// the page.
export const softSkills: SoftSkillGroup[] = [
  {
    name: "Work Experience",
    entries: [
      { title: "Tradeweb — Quantitative Research Intern", description: "DV01-matched Treasury hedging and rates relative-value research (Jun–Aug 2026)" },
      { title: "Nielsen — Data Science Intern", description: "Databricks/PySpark deep-learning pipeline for purchase-journey analytics (Jun–Aug 2025)" },
      { title: "Rakuten Advertising — Business Development Intern", description: "Automated outreach scripts lifted response rates ~50%, adopted team-wide (Jun–Aug 2024)" },
    ],
  },
  {
    name: "Leadership Positions",
    entries: [
      { title: "BC Chinese Student Association President", description: "4 Years on Executive Board, lead BC's largest student led club" },
      { title: "BC Quant Finance Founder President", description: "Lead BC's first ever quantiative finance club and recruiting cohort" },
    ],
  },
  {
    name: "Leadership Positions",
    entries: [
      { title: "180 Degrees Consulting Founder President", description: "Started the biggest international non-profit consulting organization's BC branch" },
      { title: "BC Music Outreach Program Lead", description: "Lead volunteer program teaching piano to underprivledged kids grades K-5" },
    ],
  },
  {
    name: "Competitive Activity",
    entries: [
      { title: "Basketball and Soccer Intermural Champion", description: "Winner of competitve intermural division" },
      { title: "BC Board Game and TCG Club", description: "Active member: root, dune imperium, catan, war chest" },
    ],
  },
];
