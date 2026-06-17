export interface InvestmentPlan {
  id: string;
  name: string;
  tier: number;
  minDeposit: number;
  maxDeposit: number | null;
  roi: number;
  duration: string;
  durationDays: number;
  features: string[];
  highlighted?: boolean;
  icon: string;
  color: string;
}

export const investmentPlans: InvestmentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tier: 1,
    minDeposit: 50,
    maxDeposit: 1000,
    roi: 10,
    duration: "7 Days",
    durationDays: 7,
    color: "#64748b",
    features: [
      "Investment dashboard access",
      "Email support",
      "Daily profit updates",
      "Secure wallet protection",
    ],
    icon: "rocket",
  },
  {
    id: "silver",
    name: "Silver",
    tier: 2,
    minDeposit: 5000,
    maxDeposit: 9999,
    roi: 18,
    duration: "14 Days",
    durationDays: 14,
    color: "#94a3b8",
    features: [
      "Everything in Starter",
      "Priority withdrawals",
      "Priority support",
      "Portfolio performance reports",
    ],
    icon: "layers",
  },
  {
    id: "gold",
    name: "Gold",
    tier: 3,
    minDeposit: 10000,
    maxDeposit: 14999,
    roi: 25,
    duration: "21 Days",
    durationDays: 21,
    highlighted: true,
    color: "#C6FF00",
    features: [
      "Everything in Silver",
      "Personal account manager",
      "VIP investment insights",
      "Premium support 24/7",
    ],
    icon: "crown",
  },
  {
    id: "platinum",
    name: "Platinum",
    tier: 4,
    minDeposit: 15000,
    maxDeposit: 19999,
    roi: 35,
    duration: "30 Days",
    durationDays: 30,
    color: "#e2e8f0",
    features: [
      "Everything in Gold",
      "Instant withdrawals",
      "Private investment consultation",
      "Dedicated account team",
    ],
    icon: "gem",
  },
  {
    id: "elite",
    name: "Elite",
    tier: 5,
    minDeposit: 20000,
    maxDeposit: null,
    roi: 45,
    duration: "45 Days",
    durationDays: 45,
    color: "#a855f7",
    features: [
      "Everything in Platinum",
      "Dedicated wealth advisor",
      "Exclusive investment opportunities",
      "Global asset diversification",
      "Highest priority service",
    ],
    icon: "sparkles",
  },
];

export function calculateExpectedProfit(deposit: number, roi: number): number {
  return Math.round(deposit * (roi / 100) * 100) / 100;
}
