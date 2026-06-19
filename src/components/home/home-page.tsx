"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Lock,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { FadeIn, AnimatedCounter, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { investmentPlans } from "@/lib/data/investment-plans";
import { FAQSection } from "@/components/sections/faq-section";
import { LiveCryptoChart } from "@/components/charts/live-crypto-chart";
import { formatCurrency } from "@/lib/utils";

const stats = [
  { value: 180, prefix: "$", suffix: "M+", label: "Assets Under Management" },
  { value: 12400, suffix: "+", label: "Active Investors" },
  { value: 24, suffix: "%", label: "Average Annual ROI" },
  { value: 99.9, suffix: "%", label: "Platform Uptime" },
];

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    desc: "Sign up in under 2 minutes. Verify your identity and get instant access to your personal investment dashboard.",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Choose a Plan & Deposit",
    desc: "Select the investment tier that matches your goals. Fund your account using Bitcoin, USDT, or Ethereum.",
    icon: Wallet,
  },
  {
    step: "03",
    title: "Watch Your Returns Grow",
    desc: "Your investment goes to work immediately. Track profits in real time and withdraw earnings on your schedule.",
    icon: TrendingUp,
  },
];

const trust = [
  { icon: ShieldCheck, title: "Multi-Sig Security", desc: "Funds secured with 3-of-5 multi-signature wallets and cold storage protection." },
  { icon: Lock, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit to the highest industry standard." },
  { icon: Zap, title: "Instant Notifications", desc: "Real-time alerts for every deposit, profit credit, and withdrawal request." },
  { icon: CheckCircle, title: "Daily Profit Credits", desc: "Earnings are calculated and credited to your balance every 24 hours." },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "Private Investor",
    quote: "I was skeptical at first, but after my first 7-day cycle on the Starter Plan I was fully convinced. Withdrew my profit in under an hour. Incredible platform.",
    initials: "MT",
  },
  {
    name: "Sandra O.",
    role: "Business Owner",
    quote: "QuantumVest has become a cornerstone of my passive income strategy. The Gold Plan returns are consistent and the support team is always available.",
    initials: "SO",
  },
  {
    name: "James K.",
    role: "Retired Engineer",
    quote: "After years saving in traditional banks, the difference is night and day. My Platinum plan completed its cycle and paid out exactly as promised.",
    initials: "JK",
  },
  {
    name: "Amara N.",
    role: "Freelance Designer",
    quote: "The dashboard makes everything transparent — I can watch my balance grow in real time. Deposits are confirmed fast and withdrawals never kept me waiting.",
    initials: "AN",
  },
  {
    name: "David R.",
    role: "Software Engineer",
    quote: "I run the numbers for a living and QuantumVest's fixed returns checked out exactly as advertised. Moved from the Silver to the Gold plan after my first payout.",
    initials: "DR",
  },
  {
    name: "Priya S.",
    role: "Pharmacist",
    quote: "Customer support walked me through my first crypto deposit step by step. Two cycles later, I've reinvested my profits straight into the Elite plan.",
    initials: "PS",
  },
  {
    name: "Tunde A.",
    role: "Logistics Manager",
    quote: "What sold me was the live tracking — no guessing games. My Starter plan matured on schedule and the funds hit my wallet balance immediately.",
    initials: "TA",
  },
  {
    name: "Elena M.",
    role: "University Lecturer",
    quote: "I split my savings across two plans to test the waters. Both completed on time and the email notifications kept me informed at every stage.",
    initials: "EM",
  },
  {
    name: "Robert C.",
    role: "Small Business Owner",
    quote: "Three cycles in and not a single delay. The platform feels far more professional than other crypto platforms I've tried — clean, fast, and reliable.",
    initials: "RC",
  },
];

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="section-padding relative flex min-h-[92vh] flex-col items-center justify-center text-center">
        <FadeIn>
          <span className="label-mono mb-6 inline-block rounded-full border border-neon/30 bg-neon/5 px-4 py-2 text-neon">
            Trusted by 12,000+ Investors Worldwide
          </span>
          <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-7xl">
            Invest Smart.
            <br />
            <span className="text-neon neon-glow-text">Earn Every Day.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant md:text-xl">
            QuantumVest is a professional crypto investment platform offering fixed-return plans, real-time profit tracking, and institutional-grade security — all in one place.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Investing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/plans">View Investment Plans</Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Stats */}
      <section className="section-padding border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <FadeIn key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-white md:text-5xl">
                <AnimatedCounter
                  end={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.value === 99.9 ? 1 : 0}
                />
              </p>
              <p className="label-mono mt-2 text-on-surface-variant">{s.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Live Markets */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-10 text-center">
            <span className="label-mono text-neon">Live Markets</span>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Real-Time Crypto Prices</h2>
            <p className="mt-3 text-on-surface-variant">Live market data updated every 60 seconds. Click any coin to view its price chart.</p>
          </FadeIn>
          <FadeIn>
            <LiveCryptoChart />
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-14 text-center">
            <span className="label-mono text-neon">Simple Process</span>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">How It Works</h2>
            <p className="mt-3 text-on-surface-variant">Three steps to start earning passive income today.</p>
          </FadeIn>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <FadeIn key={s.step}>
                <GlassCard className="h-full p-8">
                  <div className="mb-4 flex items-center gap-4">
                    <span className="label-mono text-3xl font-extrabold text-neon/30">{s.step}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/20 bg-neon/10">
                      <s.icon className="h-6 w-6 text-neon" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{s.title}</h3>
                  <p className="text-on-surface-variant">{s.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section className="section-padding bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mb-14 text-center">
            <span className="label-mono text-neon">Investment Plans</span>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Choose Your Tier</h2>
            <p className="mt-3 text-on-surface-variant">Fixed returns. Transparent pricing. No hidden fees.</p>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {investmentPlans.map((plan) => (
              <FadeIn key={plan.id}>
                <div
                  className={`glass-card flex h-full flex-col p-6 ${
                    plan.highlighted
                      ? "border-neon/40 shadow-[0_0_30px_rgba(198,255,0,0.15)]"
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <span className="label-mono mb-3 inline-block rounded-full bg-neon/10 px-2 py-0.5 text-center text-[10px] text-neon">
                      Most Popular
                    </span>
                  )}
                  <p className="label-mono text-on-surface-variant">{plan.name}</p>
                  <p className="my-3 text-4xl font-extrabold text-neon">{plan.roi}%</p>
                  <p className="text-xs text-on-surface-variant">ROI over {plan.duration}</p>
                  <div className="my-4 border-t border-white/5" />
                  <p className="text-sm text-on-surface-variant">
                    From{" "}
                    <span className="font-bold text-white">{formatCurrency(plan.minDeposit)}</span>
                    {plan.maxDeposit ? ` – ${formatCurrency(plan.maxDeposit)}` : "+"}
                  </p>
                  <div className="mt-auto pt-4">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "neon" : "outline"}
                      asChild
                    >
                      <Link href={`/signup?plan=${plan.id}`}>Get Started</Link>
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost" size="lg" asChild>
              <Link href="/plans">
                See Full Plan Details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose QuantumVest */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-14 text-center">
            <span className="label-mono text-neon">Why QuantumVest</span>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Built for Serious Investors</h2>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((t) => (
              <FadeIn key={t.title}>
                <GlassCard className="h-full p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/20 bg-neon/10">
                    <t.icon className="h-6 w-6 text-neon" />
                  </div>
                  <h3 className="mb-2 font-bold text-white">{t.title}</h3>
                  <p className="text-sm text-on-surface-variant">{t.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white/[0.02]">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-14 text-center">
            <span className="label-mono text-neon">Client Testimonials</span>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">What Our Investors Say</h2>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={(i % 3) * 0.1}>
                <GlassCard className="h-full p-8">
                  <p className="mb-6 leading-relaxed text-on-surface-variant">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neon/30 bg-neon/10 text-sm font-bold text-neon">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-xs text-on-surface-variant">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="mx-auto max-w-3xl">
          <FadeIn className="mb-10 text-center">
            <span className="label-mono text-neon">Got Questions?</span>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Frequently Asked Questions</h2>
          </FadeIn>
          <FAQSection />
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <FadeIn>
          <div className="mx-auto max-w-3xl rounded-[32px] border border-neon/20 bg-neon/5 p-6 text-center sm:p-10 md:p-12">
            <span className="label-mono text-neon">Get Started Today</span>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Ready to Grow Your Wealth?</h2>
            <p className="mt-4 text-on-surface-variant">
              Join thousands of investors already earning daily returns on QuantumVest. Open your account in minutes — no experience required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Talk to an Advisor</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
