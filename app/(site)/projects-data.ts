// Content for the project navigation system — category grids, the
// all-projects tag view, and detail-page stubs all read from here, so new
// projects only need an entry added in one place.

export type Category = "trading" | "games" | "research";
export type Status = "live" | "backtest" | "research";

// The cross-cutting tag vocabulary — deliberately just these four, shared by
// every project regardless of category, so the tag filter on /projects
// means the same thing everywhere instead of accumulating one-off tags.
export type Tag = "Trading" | "Games" | "Research" | "Sports";
export const ALL_TAGS: Tag[] = ["Trading", "Games", "Research", "Sports"];

// Fixed per-tag color — a functional taxonomy label, not decoration, so it
// stays constant everywhere a tag appears (cards, detail pages, filters) and
// stays separate from the one editorial accent (--accent) reserved for hover
// and interaction state. Muted to sit alongside the paper/ink palette.
export const TAG_COLOR: Record<Tag, string> = {
  Trading: "#3d5a80",
  Games: "#8a6d3b",
  Research: "#5b4b8a",
  Sports: "#3f6b52",
};

export interface Project {
  slug: string;
  category: Category;
  number: string; // §x.x — matches the category page's own §-number
  title: string;
  oneLiner: string;
  tags: Tag[];
  heroVisual: string; // path/placeholder — no real assets yet, cards render a placeholder box regardless
  repoUrl?: string;
  status: Status;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  trading: "Trading",
  games: "Games",
  research: "Research",
};

// Matches the §-numbers assigned site-wide: Trading=§1, Games=§2,
// Research=§3. Sports was folded into Research — it never had more than one
// real project of its own, and everything sports-related was econometrics
// work anyway (the "Sports" tag still exists for filtering, just not as a
// homepage category).
export const CATEGORY_NUMBER: Record<Category, string> = {
  trading: "1",
  games: "2",
  research: "3",
};

export const projects: Project[] = [
  // --- Trading (§1) ---
  {
    slug: "pnl-dashboard",
    category: "trading",
    number: "§1.1",
    title: "PnL Dashboard",
    oneLiner: "Live PnL reporting dashboard for the Kalshi weather algo trading",
    tags: ["Trading"],
    heroVisual: "placeholder",
    status: "live",
  },
  {
    slug: "weather-model",
    category: "trading",
    number: "§1.2",
    title: "Kalshi Weather Model",
    oneLiner: "Skew-t fair-value model for NYC temperature contracts, driving the live Kalshi execution stack.",
    tags: ["Trading", "Research"],
    heroVisual: "placeholder",
    status: "live",
  },
  {
    slug: "stat-arb",
    category: "trading",
    number: "§1.3",
    title: "Statistical Arbitrage Backtester",
    oneLiner: "Pairs-trading backtester across S&P 500 constituents using cointegration and inverse-volatility sizing.",
    tags: ["Trading", "Research"],
    heroVisual: "placeholder",
    status: "backtest",
  },
  {
    slug: "derivatives-pricer",
    category: "trading",
    number: "§1.4",
    title: "Derivatives Pricer (C++)",
    oneLiner: "From-scratch closed-form Black-Scholes option pricer in C++, exposed to Python via pybind11 bindings.",
    tags: ["Trading"],
    heroVisual: "placeholder",
    status: "research",
  },

  // --- Games (§2) ---
  {
    slug: "catan-visualizer",
    category: "games",
    number: "§2.1",
    title: "Catan Placement Visualizer",
    oneLiner: "Interactive visualizer for the Settlers of Catan settlement-placement algorithm.",
    tags: ["Games"],
    heroVisual: "placeholder",
    repoUrl: "https://github.com/Rowan-Goranson/Settlers-of-Catan-Placement-Algorithm",
    status: "live",
  },
  {
    slug: "achievements",
    category: "games",
    number: "§2.2",
    title: "Gaming Achievements",
    oneLiner: "A recap of competitive results across chess, Catan, poker, and a few others.",
    tags: ["Games"],
    heroVisual: "placeholder",
    status: "live",
  },

  // --- Research (§3) — includes the former Sports category's real project ---
  {
    slug: "mm-predictor",
    category: "research",
    number: "§3.1",
    title: "March Madness Predictor",
    oneLiner: "Bradley-Terry point-margin ratings over 57k D-I games, tuned by real backtested MAE — real 2026 Final Four predictions.",
    tags: ["Research", "Sports"],
    heroVisual: "placeholder",
    status: "backtest",
  },
  {
    slug: "skew-probit",
    category: "research",
    number: "§3.2",
    title: "Point Shaving in NCAA",
    oneLiner: "Retested Wolfers (2006)'s point-shaving test on 95,781 D-I games — the identifying divergence turns out to be mechanical, not corruption, once heteroskedasticity is modeled correctly.",
    tags: ["Research", "Sports"],
    heroVisual: "placeholder",
    status: "research",
  },
  {
    slug: "thesis",
    category: "research",
    number: "§3.3",
    title: "Senior Honors Thesis",
    oneLiner: "Dual Math-Econ senior honors thesis on prediction market efficiency.",
    tags: ["Research"],
    heroVisual: "placeholder",
    status: "research",
  },
  {
    slug: "mml-crime",
    category: "research",
    number: "§3.4",
    title: "Medical Marijuana Laws & Crime",
    oneLiner: "Replicating Gavrilova, Kamada & Zoutman (2019) on medical marijuana laws and violent crime — a real DDD re-estimation, checked against the published paper's own tables.",
    tags: ["Research"],
    heroVisual: "placeholder",
    status: "research",
  },
];

export function projectsByCategory(category: Category): Project[] {
  return projects.filter((p) => p.category === category);
}

export function findProject(category: string, slug: string): Project | undefined {
  return projects.find((p) => p.category === category && p.slug === slug);
}
