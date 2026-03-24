export type PlanType = "Monthly" | "Yearly";
export type DrawMode = "random" | "weighted-high" | "weighted-low";
export type SubscriptionStatus = "Active" | "Inactive" | "Lapsed" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Rejected" | "None";
export type ProofStatus = "Not Submitted" | "Submitted" | "Approved" | "Rejected";

export type ScoreEntry = {
  id: number;
  points: number;
  date: string;
};

export type Charity = {
  id: number;
  name: string;
  focus: string;
  description: string;
  image: string;
  featured: boolean;
  events: string[];
};

export type Subscriber = {
  id: number;
  name: string;
  email: string;
  country: string;
  plan: PlanType;
  charityId: number;
  charityPercent: number;
  renewalDate: string;
  subscriptionStatus: SubscriptionStatus;
  enteredDraws: number;
  upcomingDraws: number;
  winnings: number;
  paymentStatus: PaymentStatus;
  proofStatus: ProofStatus;
  proofNote: string;
  scores: ScoreEntry[];
};

export type DrawWinner = {
  subscriberId: number;
  name: string;
  matchCount: number;
  tier: "5-Number Match" | "4-Number Match" | "3-Number Match";
  payout: number;
  proofStatus: ProofStatus;
  paymentStatus: PaymentStatus;
};

export type DrawSummary = {
  drawNumbers: number[];
  activeSubscribers: number;
  projectedRevenue: number;
  charityPool: number;
  prizePool: number;
  rolloverApplied: boolean;
  published: boolean;
  tiers: {
    label: "5-Number Match" | "4-Number Match" | "3-Number Match";
    share: number;
    winners: Array<{
      subscriber: Subscriber;
      matchCount: number;
    }>;
    pool: number;
    rollover: boolean;
  }[];
  winners: DrawWinner[];
};

export type PlatformState = {
  charities: Charity[];
  subscribers: Subscriber[];
};

export const plans = {
  Monthly: { price: 29, charityMinimum: 10, cadence: "Billed every 30 days" },
  Yearly: { price: 299, charityMinimum: 10, cadence: "Billed annually with discount" },
} as const;

export const charities: Charity[] = [
  {
    id: 1,
    name: "Birdie Futures",
    focus: "Junior golf scholarships",
    description: "Funds coaching, travel, and equipment for young golfers from underrepresented communities.",
    image: "Scholarship nights and junior coaching access",
    featured: true,
    events: ["Summer academy drive", "Junior invitational day"],
  },
  {
    id: 2,
    name: "Greens For Good",
    focus: "Community wellness",
    description: "Builds inclusive community golf days that fund local mental health and wellness programs.",
    image: "Wellness-led charity rounds and donor salons",
    featured: true,
    events: ["Nine holes for hope", "Corporate charity scramble"],
  },
  {
    id: 3,
    name: "Fairway Relief Fund",
    focus: "Emergency family support",
    description: "Provides direct support to families facing medical and financial hardship.",
    image: "Private donor evenings and relief campaigns",
    featured: false,
    events: ["Relief weekend cup", "Winter donor showcase"],
  },
];

export const initialSubscriber: Subscriber = {
  id: 101,
  name: "Alex Palmer",
  email: "alex@projectintern.test",
  country: "United Kingdom",
  plan: "Yearly",
  charityId: 2,
  charityPercent: 18,
  renewalDate: "2026-12-01",
  subscriptionStatus: "Active",
  enteredDraws: 7,
  upcomingDraws: 1,
  winnings: 420,
  paymentStatus: "Pending",
  proofStatus: "Submitted",
  proofNote: "Screenshot uploaded from club scoring portal.",
  scores: [
    { id: 1, points: 31, date: "2026-03-10" },
    { id: 2, points: 27, date: "2026-03-03" },
    { id: 3, points: 35, date: "2026-02-22" },
    { id: 4, points: 30, date: "2026-02-10" },
    { id: 5, points: 33, date: "2026-01-29" },
  ],
};

export const sampleSubscribers: Subscriber[] = [
  initialSubscriber,
  {
    id: 102,
    name: "Maya Ford",
    email: "maya@projectintern.test",
    country: "United States",
    plan: "Monthly",
    charityId: 1,
    charityPercent: 15,
    renewalDate: "2026-04-08",
    subscriptionStatus: "Active",
    enteredDraws: 4,
    upcomingDraws: 1,
    winnings: 0,
    paymentStatus: "None",
    proofStatus: "Not Submitted",
    proofNote: "",
    scores: [
      { id: 6, points: 24, date: "2026-03-14" },
      { id: 7, points: 29, date: "2026-03-01" },
      { id: 8, points: 18, date: "2026-02-19" },
      { id: 9, points: 21, date: "2026-02-01" },
      { id: 10, points: 26, date: "2026-01-17" },
    ],
  },
  {
    id: 103,
    name: "Jordan Mills",
    email: "jordan@projectintern.test",
    country: "Canada",
    plan: "Yearly",
    charityId: 3,
    charityPercent: 12,
    renewalDate: "2026-09-14",
    subscriptionStatus: "Active",
    enteredDraws: 9,
    upcomingDraws: 1,
    winnings: 1600,
    paymentStatus: "Paid",
    proofStatus: "Approved",
    proofNote: "Verified against official score archive.",
    scores: [
      { id: 11, points: 35, date: "2026-03-11" },
      { id: 12, points: 30, date: "2026-02-26" },
      { id: 13, points: 22, date: "2026-02-16" },
      { id: 14, points: 31, date: "2026-02-02" },
      { id: 15, points: 28, date: "2026-01-18" },
    ],
  },
  {
    id: 104,
    name: "Sophie Lin",
    email: "sophie@projectintern.test",
    country: "Australia",
    plan: "Monthly",
    charityId: 2,
    charityPercent: 22,
    renewalDate: "2026-04-02",
    subscriptionStatus: "Lapsed",
    enteredDraws: 2,
    upcomingDraws: 0,
    winnings: 85,
    paymentStatus: "Pending",
    proofStatus: "Submitted",
    proofNote: "Awaiting manual review.",
    scores: [
      { id: 16, points: 14, date: "2026-03-09" },
      { id: 17, points: 17, date: "2026-02-28" },
      { id: 18, points: 20, date: "2026-02-15" },
      { id: 19, points: 11, date: "2026-01-30" },
      { id: 20, points: 16, date: "2026-01-12" },
    ],
  },
];

export const defaultPlatformState: PlatformState = {
  charities,
  subscribers: sampleSubscribers,
};

export function getCharityById(id: number) {
  return charities.find((charity) => charity.id === id) ?? charities[0];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getPlanPrice(plan: PlanType) {
  return plans[plan].price;
}

export function getMonthlyEquivalent(plan: PlanType) {
  return plan === "Yearly" ? plans.Yearly.price / 12 : plans.Monthly.price;
}

export function sortScores(scores: ScoreEntry[]) {
  return [...scores].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function applyRollingScores(scores: ScoreEntry[], entry: ScoreEntry) {
  return sortScores([entry, ...scores]).slice(0, 5);
}

export function updateExistingScore(scores: ScoreEntry[], id: number, nextPoints: number, nextDate: string) {
  return sortScores(
    scores.map((score) =>
      score.id === id
        ? {
            ...score,
            points: nextPoints,
            date: nextDate,
          }
        : score,
    ),
  );
}

function createSeededRandom(seed: number) {
  let current = seed % 2147483647;
  if (current <= 0) {
    current += 2147483646;
  }

  return () => {
    current = (current * 16807) % 2147483647;
    return (current - 1) / 2147483646;
  };
}

function pickWeighted(candidates: number[], nextRandom: () => number, reverse = false) {
  const frequencies = new Map<number, number>();
  candidates.forEach((value) => frequencies.set(value, (frequencies.get(value) ?? 0) + 1));
  const weighted = [...frequencies.entries()].flatMap(([value, count]) => {
    const weight = reverse ? Math.max(1, 8 - count) : count;
    return Array.from({ length: weight }, () => value);
  });
  const index = Math.floor(nextRandom() * weighted.length);
  return weighted[index];
}

export function generateDrawNumbers(subscribers: Subscriber[], mode: DrawMode, seed = 20260324) {
  const universe = subscribers.flatMap((subscriber) => subscriber.scores.map((score) => score.points));
  const fallback = [12, 18, 24, 30, 36];
  if (universe.length === 0) {
    return fallback;
  }

  const nextRandom = createSeededRandom(seed);
  const selection = new Set<number>();
  while (selection.size < 5) {
    let nextNumber = fallback[selection.size] ?? 10 + selection.size * 4;
    if (mode === "random") {
      nextNumber = Math.floor(nextRandom() * 45) + 1;
    } else if (mode === "weighted-high") {
      nextNumber = pickWeighted(universe, nextRandom);
    } else {
      nextNumber = pickWeighted(universe, nextRandom, true);
    }
    selection.add(nextNumber);
  }

  return [...selection].sort((a, b) => a - b);
}

export function getMatchCount(drawNumbers: number[], scores: ScoreEntry[]) {
  const scoreSet = new Set(scores.map((score) => score.points));
  return drawNumbers.filter((number) => scoreSet.has(number)).length;
}

export function getSubscriberDonation(subscriber: Subscriber) {
  return (getMonthlyEquivalent(subscriber.plan) * subscriber.charityPercent) / 100;
}

export function buildDrawSummary(subscribers: Subscriber[], mode: DrawMode, rollover = 1200, published = false, seed = 20260324): DrawSummary {
  const eligibleSubscribers = subscribers.filter((subscriber) => subscriber.subscriptionStatus === "Active");
  const drawNumbers = generateDrawNumbers(eligibleSubscribers, mode, seed);
  const activeSubscribers = eligibleSubscribers.length;
  const projectedRevenue = eligibleSubscribers.reduce((sum, subscriber) => sum + getMonthlyEquivalent(subscriber.plan), 0);
  const prizePool = projectedRevenue * 0.55;
  const charityPool = eligibleSubscribers.reduce((sum, subscriber) => sum + getSubscriberDonation(subscriber), 0);

  const winners = eligibleSubscribers
    .map((subscriber) => ({
      subscriber,
      matchCount: getMatchCount(drawNumbers, subscriber.scores),
    }))
    .filter((entry) => entry.matchCount >= 3);

  const byTier = {
    five: winners.filter((entry) => entry.matchCount === 5),
    four: winners.filter((entry) => entry.matchCount === 4),
    three: winners.filter((entry) => entry.matchCount === 3),
  };

  const jackpotBase = prizePool * 0.4 + (byTier.five.length === 0 ? rollover : 0);

  const tiers: DrawSummary["tiers"] = [
    {
      label: "5-Number Match",
      share: 0.4,
      winners: byTier.five,
      pool: jackpotBase,
      rollover: true,
    },
    {
      label: "4-Number Match",
      share: 0.35,
      winners: byTier.four,
      pool: prizePool * 0.35,
      rollover: false,
    },
    {
      label: "3-Number Match",
      share: 0.25,
      winners: byTier.three,
      pool: prizePool * 0.25,
      rollover: false,
    },
  ];

  const flattenedWinners: DrawWinner[] = tiers.flatMap((tier) => {
    const payout = tier.winners.length ? tier.pool / tier.winners.length : 0;
    return tier.winners.map(({ subscriber, matchCount }) => ({
      subscriberId: subscriber.id,
      name: subscriber.name,
      matchCount,
      tier: tier.label,
      payout,
      proofStatus: subscriber.proofStatus,
      paymentStatus: subscriber.paymentStatus,
    }));
  });

  return {
    drawNumbers,
    activeSubscribers,
    projectedRevenue,
    charityPool,
    prizePool,
    rolloverApplied: byTier.five.length === 0,
    published,
    tiers,
    winners: flattenedWinners,
  };
}
