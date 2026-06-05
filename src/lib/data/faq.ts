export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "How do I get started?",
    answer:
      "Create a free account on the signup page, verify your email, and fund your account using Bitcoin, USDT (TRC20), or Ethereum. Once your deposit is confirmed by our team, you can activate an investment plan and begin earning.",
  },
  {
    question: "What is the minimum investment amount?",
    answer:
      "The minimum investment starts at $1,000 with our Starter Plan. Our five tiers are: Starter ($1,000–$4,999), Silver ($5,000–$9,999), Gold ($10,000–$14,999), Platinum ($15,000–$19,999), and Elite ($20,000+). There is no upper limit on the Elite plan.",
  },
  {
    question: "How is my ROI calculated?",
    answer:
      "ROI is fixed per plan and applied to your deposited principal over the plan duration. For example, a $5,000 investment on the Silver Plan (18% ROI over 14 days) returns $900 in profit at the end of the cycle. Profits are credited to your wallet balance daily.",
  },
  {
    question: "When can I withdraw my funds?",
    answer:
      "You can request a withdrawal at any time from your dashboard. Withdrawals are reviewed by our team and processed to your submitted wallet address. Processing time is typically within 24–48 hours. Elite and Platinum investors receive priority processing.",
  },
  {
    question: "What cryptocurrencies can I use to deposit?",
    answer:
      "We currently accept Bitcoin (BTC), Tether (USDT via TRC20 network), and Ethereum (ETH). Deposit addresses are provided in your dashboard when you submit a deposit request.",
  },
  {
    question: "How are my funds kept safe?",
    answer:
      "All funds are held in multi-signature cold storage wallets that require multiple authorizations to move. We use AES-256 encryption for all data, conduct regular security audits, and monitor accounts 24/7 for suspicious activity.",
  },
  {
    question: "Can I run multiple investment plans at once?",
    answer:
      "Yes. You can activate multiple investment plans simultaneously, subject to your available wallet balance. Each plan tracks its own cycle independently, and profits are credited to your single wallet balance.",
  },
  {
    question: "What happens when my plan cycle ends?",
    answer:
      "When a plan cycle completes, your principal and profits are credited to your wallet balance. You can then withdraw, reinvest into another plan, or let the balance sit in your account — the choice is yours.",
  },
];
