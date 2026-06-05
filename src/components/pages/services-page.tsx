"use client";

import { ArrowRight, BarChart3, Lock, MessageCircle, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: TrendingUp,
    title: "Fixed-Return Investment Plans",
    description: "Choose from five structured investment tiers with clearly defined ROI, duration, and minimum deposit. Know exactly what you earn before you invest.",
    features: ["10% – 45% ROI depending on tier", "7 to 45-day plan cycles", "No hidden fees or surprise deductions"],
  },
  {
    icon: Wallet,
    title: "Crypto Deposit & Withdrawal",
    description: "Fund your account and withdraw earnings using Bitcoin, USDT (TRC20), or Ethereum. All transactions are processed securely and logged in real time.",
    features: ["BTC, USDT (TRC20), ETH supported", "Pending deposits reviewed within 24 hours", "Withdrawal requests processed promptly"],
  },
  {
    icon: BarChart3,
    title: "Live Investor Dashboard",
    description: "Track your wallet balance, active investments, profit accumulation, and full transaction history from a single real-time dashboard.",
    features: ["Live balance & profit display", "Full transaction history", "Real-time Supabase sync"],
  },
  {
    icon: ShieldCheck,
    title: "Institutional-Grade Security",
    description: "Your funds are protected by multi-signature wallets, cold storage, and AES-256 encryption. Every deposit is held under strict custody protocols.",
    features: ["Multi-sig cold storage", "AES-256 encryption", "24/7 security monitoring"],
  },
  {
    icon: Lock,
    title: "KYC & Account Verification",
    description: "Secure account onboarding with identity verification ensures only legitimate investors access the platform, protecting all users.",
    features: ["Fast identity review", "Regulatory compliance", "Account protected from fraud"],
  },
  {
    icon: MessageCircle,
    title: "Dedicated Investor Support",
    description: "Our support team is available to assist with account setup, deposit queries, plan selection, and withdrawal requests.",
    features: ["24/7 support via contact form", "Priority support for Platinum & Elite", "Response within 24 hours"],
  },
];

export function ServicesPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-20 text-center">
          <span className="label-mono text-neon">What We Offer</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-6xl">
            Investment <span className="text-neon neon-glow-text">Services</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
            Everything you need to invest confidently, track your earnings, and withdraw profits — all in one secure platform.
          </p>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.08}>
              <GlassCard className="flex h-full flex-col p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-neon/20 bg-neon/10">
                  <service.icon className="h-6 w-6 text-neon" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{service.title}</h3>
                <p className="mb-6 flex-grow text-on-surface-variant">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <span className="mt-0.5 text-neon">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-20">
          <GlassCard className="mx-auto max-w-2xl p-12 text-center" glow>
            <h2 className="text-2xl font-bold text-white">Ready to Start Investing?</h2>
            <p className="mt-4 text-on-surface-variant">
              Open a free account today and choose the plan that matches your investment goals.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/signup">
                  Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/plans">View Plans</Link>
              </Button>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  );
}
