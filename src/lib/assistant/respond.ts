import { investmentPlans, calculateExpectedProfit } from "@/lib/data/investment-plans";
import { faqItems } from "@/lib/data/faq";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function plansList() {
  return investmentPlans
    .map(
      (p) =>
        `• **${p.name}** — ${fmt(p.minDeposit)}${p.maxDeposit ? `–${fmt(p.maxDeposit)}` : "+"}, ${p.roi}% ROI over ${p.duration}`
    )
    .join("\n");
}

function findPlanByName(text: string) {
  return investmentPlans.find((p) => text.includes(p.name.toLowerCase()));
}

function findAmount(text: string): number | null {
  const match = text.replace(/,/g, "").match(/\$?\s?(\d{2,7}(?:\.\d{1,2})?)\s?(k)?/i);
  if (!match) return null;
  let amount = parseFloat(match[1]);
  if (match[2]) amount *= 1000;
  return Number.isFinite(amount) ? amount : null;
}

function planForAmount(amount: number) {
  return (
    investmentPlans.find((p) => amount >= p.minDeposit && (p.maxDeposit === null || amount <= p.maxDeposit)) ??
    (amount > 0 && amount < investmentPlans[0].minDeposit ? investmentPlans[0] : investmentPlans[investmentPlans.length - 1])
  );
}

interface Intent {
  id: string;
  keywords: string[];
  respond: (text: string) => string;
}

const intents: Intent[] = [
  {
    id: "greeting",
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "what's up", "yo "],
    respond: () =>
      "Hello! I'm the QuantumVest assistant. I can help you understand our investment plans, deposits, withdrawals, profits, and security — or recommend a plan based on your budget. What would you like to know?",
  },
  {
    id: "thanks",
    keywords: ["thank", "thanks", "appreciate", "cheers"],
    respond: () => "You're very welcome! Let me know if there's anything else you'd like to know about investing with QuantumVest.",
  },
  {
    id: "plans-overview",
    keywords: ["plan", "plans", "tier", "tiers", "package", "options", "investment levels"],
    respond: () =>
      `We offer five fixed-return investment plans:\n\n${plansList()}\n\nTell me your budget (e.g. "I have $5,000") and I'll recommend the best plan and estimate your profit.`,
  },
  {
    id: "recommend-by-amount",
    keywords: ["i have", "i want to invest", "if i invest", "i'm planning to invest", "i can deposit", "budget", "recommend", "which plan", "best plan", "suitable plan", "suggest"],
    respond: (text) => {
      const amount = findAmount(text);
      if (amount === null) {
        return "Tell me how much you're planning to invest (e.g. \"I have $5,000\") and I'll recommend the right plan and estimate your potential profit.";
      }
      const plan = planForAmount(amount);
      const profit = calculateExpectedProfit(Math.max(amount, plan.minDeposit), plan.roi);
      const principal = Math.max(amount, plan.minDeposit);
      return (
        `Based on ${fmt(amount)}, the **${plan.name} Plan** is the best fit:\n\n` +
        `• Minimum deposit: ${fmt(plan.minDeposit)}${plan.maxDeposit ? ` (up to ${fmt(plan.maxDeposit)})` : "+"}\n` +
        `• Fixed ROI: ${plan.roi}% over ${plan.duration}\n` +
        `• Estimated profit on ${fmt(principal)}: **${fmt(profit)}**\n` +
        `• Total payout at cycle end: ${fmt(principal + profit)}\n\n` +
        `To get started, sign up, deposit using BTC, USDT (TRC20), or ETH, and activate this plan from your dashboard once your balance reflects the deposit.`
      );
    },
  },
  {
    id: "specific-plan",
    keywords: ["starter", "silver", "gold", "platinum", "elite"],
    respond: (text) => {
      const plan = findPlanByName(text);
      if (!plan) return plansList();
      const exampleProfit = calculateExpectedProfit(plan.minDeposit, plan.roi);
      return (
        `**${plan.name} Plan**\n` +
        `• Deposit range: ${fmt(plan.minDeposit)}${plan.maxDeposit ? `–${fmt(plan.maxDeposit)}` : "+"}\n` +
        `• Fixed ROI: ${plan.roi}% over ${plan.duration}\n` +
        `• Example: deposit ${fmt(plan.minDeposit)} → earn roughly ${fmt(exampleProfit)} profit by the end of the cycle\n` +
        `• Includes: ${plan.features.join(", ")}\n\n` +
        `Want me to calculate your potential earnings for a different amount on this plan?`
      );
    },
  },
  {
    id: "roi-profit",
    keywords: ["roi", "return", "profit", "earning", "earn", "interest", "yield", "how much will i make", "how much can i make"],
    respond: () =>
      "Each plan has a **fixed ROI** applied to your deposited principal over its cycle — there's no guesswork. For example, a $5,000 deposit on the Silver Plan (18% ROI / 14 days) returns $900 profit by the end of the cycle. Profits accrue and are credited to your wallet balance, visible live on your dashboard. Tell me your investment amount and I'll calculate your exact estimated return.",
  },
  {
    id: "how-to-start",
    keywords: ["get started", "how do i start", "how to start", "sign up", "signup", "register", "create account", "begin", "new here", "new investor"],
    respond: () =>
      "Getting started is simple:\n\n1. Create a free account (Sign Up)\n2. Go to your dashboard and choose **Deposit**\n3. Send BTC, USDT (TRC20), or ETH to the wallet address shown, then confirm the payment\n4. Once our team approves your deposit, your wallet balance updates\n5. Activate any investment plan that fits your balance — your earnings begin accruing immediately\n\nWant a recommendation on which plan to start with based on your budget?",
  },
  {
    id: "deposit",
    keywords: ["deposit", "fund my account", "add money", "add funds", "top up", "topup", "send crypto", "wallet address", "how do i pay", "payment method"],
    respond: () =>
      "To deposit: open your dashboard, click **Deposit**, choose your cryptocurrency (Bitcoin, USDT on the TRC20 network, or Ethereum), and you'll be shown a wallet address and QR code. Send the funds, optionally enter the transaction hash, then click **Confirm Payment**. Our team verifies and approves it — usually quickly — after which your wallet balance updates and you can activate a plan.",
  },
  {
    id: "withdraw",
    keywords: ["withdraw", "withdrawal", "cash out", "take out my money", "get my money", "payout", "how do i withdraw"],
    respond: () =>
      "You can request a withdrawal anytime from your dashboard — just enter the amount and your destination wallet address. Our team reviews and processes withdrawals, typically within 24–48 hours, and Platinum/Elite investors get priority processing. Funds are sent directly to the wallet address you provide, so always double-check it before submitting.",
  },
  {
    id: "security",
    keywords: ["safe", "security", "secure", "protect", "hack", "scam", "trust", "legit", "is this real", "fraud"],
    respond: () =>
      "We take security seriously: funds are held in multi-signature cold storage wallets requiring multiple authorizations to move, all data is protected with AES-256 encryption, and accounts are monitored continuously for suspicious activity. You're always in control — withdrawals only go to wallet addresses you specify.",
  },
  {
    id: "kyc",
    keywords: ["kyc", "verification", "verify identity", "id document", "identity check"],
    respond: () =>
      "KYC identity verification is currently **not required** to use the platform — you can deposit, invest, and withdraw without submitting ID documents. Just make sure your account email and wallet addresses are accurate, since withdrawals are sent to the address you provide.",
  },
  {
    id: "multiple-plans",
    keywords: ["multiple plans", "more than one plan", "several plans", "two plans", "stack plans", "combine plans"],
    respond: () =>
      "Yes — you can run multiple investment plans at the same time, as long as you have enough wallet balance to fund each one. Every plan tracks its own cycle and ROI independently, and all profits flow into the same wallet balance shown on your dashboard.",
  },
  {
    id: "cycle-end",
    keywords: ["cycle end", "plan ends", "after the plan", "matures", "maturity", "what happens when", "finish", "completes"],
    respond: () =>
      "When your plan's cycle completes, your original principal plus the fixed profit is credited straight to your wallet balance. From there you can withdraw it, reinvest it into a new plan (the same tier or a higher one), or simply leave it in your account until you're ready.",
  },
  {
    id: "crypto-types",
    keywords: ["bitcoin", "btc", "usdt", "tether", "ethereum", "eth", "crypto type", "which crypto", "cryptocurrenc", "trc20"],
    respond: () =>
      "We accept three cryptocurrencies for deposits and withdrawals: **Bitcoin (BTC)**, **Tether (USDT)** on the TRC20 network, and **Ethereum (ETH)**. You can also track live prices for these and other major coins right on our homepage.",
  },
  {
    id: "advice",
    keywords: ["advice", "tip", "tips", "how can i make the most", "maximize", "grow my money", "strategy", "should i invest", "is it worth", "guidance", "futile", "fruitful", "useful"],
    respond: () =>
      "A few pointers to get the most from QuantumVest:\n\n" +
      "• **Match your plan to your timeline** — shorter cycles (Starter, Silver) free up funds sooner; longer cycles (Platinum, Elite) carry higher fixed ROI.\n" +
      "• **Reinvest your profits** — letting payouts roll into a new cycle compounds your returns over time.\n" +
      "• **Diversify across cycles** — running a couple of plans with staggered end dates keeps part of your balance liquid while the rest keeps earning.\n" +
      "• **Start where you're comfortable** — you can always move up a tier once you've seen a full cycle complete.\n\n" +
      "Tell me your budget and timeline and I can suggest a concrete plan.",
  },
  {
    id: "support",
    keywords: ["support", "contact", "help", "talk to someone", "human", "agent", "email you", "phone", "reach you"],
    respond: () =>
      "You can reach our support team through the **Contact** page — we typically respond within 24 hours. Logged-in investors also get account-specific help directly from the dashboard. Is there something specific I can try to answer for you right now?",
  },
];

const FALLBACK =
  "I'm not totally sure I understood that — but I can help with investment plans, deposits, withdrawals, profits/ROI, security, KYC, or recommend a plan based on your budget. Try asking something like \"What plan suits $5,000?\" or \"How do I withdraw my funds?\"";

function intentById(id: string) {
  return intents.find((i) => i.id === id)!;
}

export function getAssistantReply(userMessage: string): string {
  const text = userMessage.toLowerCase().trim();
  if (!text) return FALLBACK;

  // Highest priority: a concrete dollar amount in an investing context — give a
  // personalized plan recommendation rather than the generic plan list.
  const amount = findAmount(text);
  const investingContext = /plan|invest|deposit|put in|suit|fit|work|good for|right for|recommend|suggest|budget|afford/.test(text);
  if (amount !== null && investingContext) {
    return intentById("recommend-by-amount").respond(text);
  }

  // Next: a specific plan name mentioned, when not asking for the full list.
  const plan = findPlanByName(text);
  const asksForOverview = /\b(plans|options|tiers|levels|list|compare|all of|which one)\b/.test(text);
  if (plan && !asksForOverview) {
    return intentById("specific-plan").respond(text);
  }

  let best: { intent: Intent; score: number } | null = null;

  for (const intent of intents) {
    if (intent.id === "recommend-by-amount" || intent.id === "specific-plan") continue;
    let score = 0;
    for (const kw of intent.keywords) {
      if (text.includes(kw)) score += kw.length; // longer/more specific matches score higher
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }

  if (best) return best.intent.respond(text);

  // Last resort: try to match the question against the static FAQ data
  const faqMatch = faqItems.find((item) =>
    text.split(/\s+/).some((word) => word.length > 3 && item.question.toLowerCase().includes(word))
  );
  if (faqMatch) return faqMatch.answer;

  return FALLBACK;
}

export const SUGGESTED_PROMPTS = [
  "What investment plans do you offer?",
  "What plan suits $5,000?",
  "How do I deposit funds?",
  "When can I withdraw my profits?",
  "How do you keep my funds safe?",
];
