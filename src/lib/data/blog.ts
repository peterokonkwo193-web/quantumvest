export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "understanding-fixed-return-plans",
    title: "Understanding Fixed-Return Investment Plans",
    excerpt:
      "Fixed-return plans offer predictable earnings with no market guesswork. Learn how they work, what to look for, and why thousands of investors choose structured crypto investment.",
    category: "Education",
    date: "May 20, 2026",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
  },
  {
    slug: "how-to-choose-an-investment-plan",
    title: "How to Choose the Right Investment Plan for Your Goals",
    excerpt:
      "With five tiers ranging from $1,000 to $20,000+, choosing the right QuantumVest plan depends on your capital, timeline, and risk appetite. Here's how to decide.",
    category: "Strategy",
    date: "May 10, 2026",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1642104704554-05fbfddd05f0?w=800&q=80",
  },
  {
    slug: "crypto-deposit-security-guide",
    title: "A Beginner's Guide to Secure Crypto Deposits",
    excerpt:
      "Sending crypto for the first time? This step-by-step guide covers how to safely deposit BTC, USDT, and ETH to your QuantumVest account without making common mistakes.",
    category: "Security",
    date: "May 3, 2026",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1563986768608-01da106d4270?w=800&q=80",
  },
  {
    slug: "passive-income-with-crypto",
    title: "Building Passive Income Through Crypto Investment",
    excerpt:
      "Explore how structured investment plans can generate consistent passive income — and how reinvesting your returns can compound your wealth over time.",
    category: "Wealth Building",
    date: "Apr 25, 2026",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
  },
];
