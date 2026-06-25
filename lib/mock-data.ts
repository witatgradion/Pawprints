// Mock data for the Empathy prototype.
// Every number carries a sample size and confidence — see context.md §0.
// One coherent story runs through the hero scenario: participants keep
// clicking the cart icon expecting checkout, and stall at the cart page.

export type TestStatus = "live" | "draft" | "complete";

export type Step = {
  order: number;
  label: string;
  pageUrl: string;
  selector: string;
  isFinal?: boolean;
};

export type Scenario = {
  id: string;
  title: string;
  instruction: string;
  steps: Step[];
  metrics: ScenarioMetrics;
};

export type ScenarioMetrics = {
  started: number;
  completed: number;
  directSuccess: number;
  indirectSuccess: number;
  gaveUp: number;
  abandoned: number;
  firstClickCorrect: number; // count
  seqMean: number; // 1-7
  seqN: number;
  falseSuccess: number; // count among completers
  confidenceLow: number; // low-confidence successes
  medianTimeOnTask: string;
  medianTimeToFirstClick: string;
  ci: number; // confidence level %, e.g. 95
  funnel: { label: string; reached: number }[];
  struggle: {
    index: number; // 0-10 composite
    rageClicks: number;
    deadClicks: number;
    hesitation: number;
    backAndForth: number;
  };
  giveUpReasons: { reason: string; count: number }[];
  expectationMismatches: { label: string; count: number }[];
  heatmap: { x: number; y: number; w: number }[]; // x,y as 0-1 of screenshot
  recommendations: Recommendation[];
};

export type Recommendation = {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  finding: string; // what's wrong (quantified)
  fix: string; // how to fix
  affectedStep: string;
  impact: number; // 0-100 measured impact score
  frequency: number; // % of participants affected
};

export type Test = {
  id: string;
  name: string;
  targetUrl: string;
  status: TestStatus;
  participants: number;
  avgSuccess: number; // %
  updated: string;
  scenarios: Scenario[];
};

// ── helper: generate a clustered heatmap for the cart page ──────────────
function cartHeatmap(): { x: number; y: number; w: number }[] {
  const pts: { x: number; y: number; w: number }[] = [];
  // heavy cluster on the cart icon, top-right
  for (let i = 0; i < 34; i++) {
    pts.push({
      x: 0.9 + (((i * 53) % 7) - 3) * 0.006,
      y: 0.085 + (((i * 31) % 7) - 3) * 0.008,
      w: 0.55 + ((i * 17) % 5) * 0.09,
    });
  }
  // secondary cluster on the (real) checkout button, lower
  for (let i = 0; i < 16; i++) {
    pts.push({
      x: 0.78 + (((i * 41) % 9) - 4) * 0.01,
      y: 0.72 + (((i * 23) % 9) - 4) * 0.01,
      w: 0.4 + ((i * 13) % 4) * 0.08,
    });
  }
  // scatter on the promo banner (dead clicks)
  for (let i = 0; i < 11; i++) {
    pts.push({
      x: 0.5 + (((i * 37) % 11) - 5) * 0.03,
      y: 0.21 + (((i * 19) % 5) - 2) * 0.01,
      w: 0.3 + ((i * 7) % 3) * 0.08,
    });
  }
  // ambient noise
  for (let i = 0; i < 22; i++) {
    pts.push({
      x: 0.15 + ((i * 73) % 70) / 100,
      y: 0.3 + ((i * 47) % 55) / 100,
      w: 0.18 + ((i * 11) % 3) * 0.05,
    });
  }
  return pts;
}

// ── HERO SCENARIO: Add to cart & checkout ───────────────────────────────
const checkoutScenario: Scenario = {
  id: "sc_checkout",
  title: "Add a backpack to your cart and check out",
  instruction:
    "Imagine you want to buy the Trailhead 22L backpack. Add it to your cart and complete the purchase.",
  steps: [
    { order: 1, label: "Open the Backpacks category", pageUrl: "/c/backpacks", selector: "nav a[href='/c/backpacks']" },
    { order: 2, label: "Open the Trailhead 22L product page", pageUrl: "/p/trailhead-22l", selector: "a.product-card[data-id='trailhead-22l']" },
    { order: 3, label: "Click “Add to cart”", pageUrl: "/p/trailhead-22l", selector: "button.add-to-cart" },
    { order: 4, label: "Open the cart", pageUrl: "/cart", selector: "a.cart-link" },
    { order: 5, label: "Click “Proceed to checkout”", pageUrl: "/cart", selector: "button.checkout-cta" },
    { order: 6, label: "Place the order", pageUrl: "/checkout", selector: "button.place-order", isFinal: true },
  ],
  metrics: {
    started: 48,
    completed: 31,
    directSuccess: 19,
    indirectSuccess: 12,
    gaveUp: 13,
    abandoned: 4,
    firstClickCorrect: 27,
    seqMean: 4.3,
    seqN: 31,
    falseSuccess: 5,
    confidenceLow: 6,
    medianTimeOnTask: "1m 52s",
    medianTimeToFirstClick: "6.4s",
    ci: 95,
    funnel: [
      { label: "Open Backpacks", reached: 48 },
      { label: "Open product page", reached: 45 },
      { label: "Add to cart", reached: 41 },
      { label: "Open cart", reached: 38 },
      { label: "Proceed to checkout", reached: 27 },
      { label: "Place order", reached: 31 },
    ],
    struggle: {
      index: 6.8,
      rageClicks: 14,
      deadClicks: 22,
      hesitation: 31,
      backAndForth: 9,
    },
    giveUpReasons: [
      { reason: "Couldn't find it", count: 7 },
      { reason: "Too many steps", count: 3 },
      { reason: "Thought I was done", count: 2 },
      { reason: "Didn't trust it", count: 1 },
    ],
    expectationMismatches: [
      { label: "Clicked the cart icon badge expecting it to open checkout", count: 28 },
      { label: "Clicked the promo banner expecting a discount field", count: 11 },
      { label: "Clicked the product image expecting add-to-cart", count: 9 },
    ],
    heatmap: cartHeatmap(),
    recommendations: [
      {
        severity: "critical",
        title: "The cart icon is mistaken for the checkout button",
        finding:
          "58% of participants (28/48) clicked the cart-count badge expecting it to start checkout. It only opens the mini-cart, so they bounced back and re-tried — the single biggest source of the step-5 drop-off.",
        fix: "Add a prominent “Checkout” call-to-action inside the mini-cart drawer the moment it opens, so the cart icon leads somewhere actionable.",
        affectedStep: "Step 5 · Proceed to checkout",
        impact: 92,
        frequency: 58,
      },
      {
        severity: "high",
        title: "“Proceed to checkout” sits below the fold on the cart page",
        finding:
          "Reach dropped from 38 to 27 between opening the cart and starting checkout (−29%). Hesitation events spike here; the primary CTA renders under the order summary on a 768px viewport.",
        fix: "Pin the “Proceed to checkout” button to the top of the cart summary, or make it sticky on scroll.",
        affectedStep: "Step 5 · Proceed to checkout",
        impact: 74,
        frequency: 31,
      },
      {
        severity: "medium",
        title: "The promo banner looks interactive but isn't",
        finding:
          "11 participants dead-clicked the “Save 15% this week” banner expecting a code field. These are expectation mismatches, not random noise.",
        fix: "Either make the banner open a real promo-code field, or restyle it so it doesn't read as a button.",
        affectedStep: "Step 4 · Open the cart",
        impact: 41,
        frequency: 23,
      },
      {
        severity: "low",
        title: "Shipping cost only appears at the final step",
        finding:
          "3 of 13 give-ups cited “too many steps”, and confidence dipped after shipping was revealed late on the order screen.",
        fix: "Show an estimated total (incl. shipping) on the cart page before checkout begins.",
        affectedStep: "Step 6 · Place the order",
        impact: 28,
        frequency: 15,
      },
    ],
  },
};

const discountScenario: Scenario = {
  id: "sc_discount",
  title: "Find and apply a discount code",
  instruction: "You have the code TRAIL15. Apply it before paying.",
  steps: [
    { order: 1, label: "Open the cart", pageUrl: "/cart", selector: "a.cart-link" },
    { order: 2, label: "Open the “Have a code?” field", pageUrl: "/cart", selector: "button.promo-toggle" },
    { order: 3, label: "Apply the code", pageUrl: "/cart", selector: "button.apply-code", isFinal: true },
  ],
  metrics: blankMetricsWith({
    started: 46,
    completed: 24,
    directSuccess: 16,
    indirectSuccess: 8,
    gaveUp: 18,
    abandoned: 4,
    firstClickCorrect: 20,
    seqMean: 3.8,
    seqN: 24,
    medianTimeOnTask: "2m 14s",
    medianTimeToFirstClick: "9.1s",
  }),
};

const signupScenario: Scenario = {
  id: "sc_signup",
  title: "Sign up for an account",
  instruction: "Create a new Acme Store account with your email.",
  steps: [
    { order: 1, label: "Open the account menu", pageUrl: "/", selector: "button.account-menu" },
    { order: 2, label: "Click “Create account”", pageUrl: "/", selector: "a[href='/signup']" },
    { order: 3, label: "Submit the form", pageUrl: "/signup", selector: "button.signup-submit", isFinal: true },
  ],
  metrics: blankMetricsWith({
    started: 47,
    completed: 39,
    directSuccess: 33,
    indirectSuccess: 6,
    gaveUp: 6,
    abandoned: 2,
    firstClickCorrect: 33,
    seqMean: 5.6,
    seqN: 39,
    medianTimeOnTask: "0m 58s",
    medianTimeToFirstClick: "4.2s",
  }),
};

const refundScenario: Scenario = {
  id: "sc_refund",
  title: "Locate the refund policy",
  instruction: "Find out how many days you have to return an item.",
  steps: [
    { order: 1, label: "Scroll to the footer", pageUrl: "/", selector: "footer" },
    { order: 2, label: "Open “Returns & refunds”", pageUrl: "/help/returns", selector: "a[href='/help/returns']", isFinal: true },
  ],
  metrics: blankMetricsWith({
    started: 44,
    completed: 17,
    directSuccess: 9,
    indirectSuccess: 8,
    gaveUp: 23,
    abandoned: 4,
    firstClickCorrect: 15,
    seqMean: 2.9,
    seqN: 17,
    medianTimeOnTask: "2m 41s",
    medianTimeToFirstClick: "11.8s",
  }),
};

// Lighter scenarios reuse the hero's qualitative shape so the UI stays rich,
// but with their own headline outcome numbers.
function blankMetricsWith(p: Partial<ScenarioMetrics>): ScenarioMetrics {
  return {
    started: 40,
    completed: 20,
    directSuccess: 12,
    indirectSuccess: 8,
    gaveUp: 16,
    abandoned: 4,
    firstClickCorrect: 18,
    seqMean: 4,
    seqN: 20,
    falseSuccess: 3,
    confidenceLow: 4,
    medianTimeOnTask: "1m 40s",
    medianTimeToFirstClick: "7.0s",
    ci: 95,
    funnel: ["Reach the page", "Find the entry point", "Complete the task"].map((label, i) => ({
      label,
      reached: Math.max(2, (p.started ?? 40) - i * 9),
    })),
    struggle: { index: 5, rageClicks: 8, deadClicks: 12, hesitation: 18, backAndForth: 5 },
    giveUpReasons: [
      { reason: "Couldn't find it", count: Math.round((p.gaveUp ?? 16) * 0.55) },
      { reason: "Too many steps", count: Math.round((p.gaveUp ?? 16) * 0.25) },
      { reason: "Didn't trust it", count: Math.round((p.gaveUp ?? 16) * 0.2) },
    ],
    expectationMismatches: [
      { label: "Clicked a non-interactive element expecting an action", count: 9 },
    ],
    heatmap: cartHeatmap(),
    recommendations: checkoutScenario.metrics.recommendations.slice(0, 2),
    ...p,
  };
}

export const tests: Test[] = [
  {
    id: "acme-checkout",
    name: "Acme Store — Checkout & Account",
    targetUrl: "https://acme.store",
    status: "live",
    participants: 48,
    avgSuccess: 60,
    updated: "2 hours ago",
    scenarios: [checkoutScenario, discountScenario, signupScenario, refundScenario],
  },
  {
    id: "acme-mobile-v2",
    name: "Acme Store — Mobile redesign v2",
    targetUrl: "https://staging.acme.store",
    status: "draft",
    participants: 0,
    avgSuccess: 0,
    updated: "yesterday",
    scenarios: [
      { ...checkoutScenario, id: "sc_m_checkout", title: "Check out on mobile" },
      { ...signupScenario, id: "sc_m_signup" },
    ],
  },
  {
    id: "marketing-pricing",
    name: "Marketing site — Pricing page",
    targetUrl: "https://acme.io/pricing",
    status: "complete",
    participants: 62,
    avgSuccess: 74,
    updated: "5 days ago",
    scenarios: [
      { ...signupScenario, id: "sc_pr_plan", title: "Pick the right plan for a 10-person team" },
      { ...discountScenario, id: "sc_pr_annual", title: "Switch to annual billing" },
      { ...refundScenario, id: "sc_pr_contact", title: "Contact sales" },
    ],
  },
];

export function getTest(id: string): Test | undefined {
  return tests.find((t) => t.id === id);
}

// ── derived metric helpers ──────────────────────────────────────────────
export const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function successRate(m: ScenarioMetrics) {
  return pct(m.completed, m.started);
}
export function falseSuccessRate(m: ScenarioMetrics) {
  return pct(m.falseSuccess + m.confidenceLow, m.completed);
}
