"use client";

import { CheckCircle, Globe, Shield, TrendingUp, Users } from "lucide-react";
import { FadeIn, GlassCard, AnimatedCounter } from "@/components/animations/motion-components";

const milestones = [
  { year: "2021", title: "Company Founded", desc: "QuantumVest launched with a mission to make professional crypto investment accessible to everyday investors." },
  { year: "2022", title: "Platform Launch", desc: "Released the QuantumVest investment dashboard, serving our first 500 investors across 20 countries." },
  { year: "2023", title: "Security Certified", desc: "Achieved SOC 2 Type II certification. Cold storage infrastructure expanded to protect growing AUM." },
  { year: "2024", title: "10,000 Investors", desc: "Crossed 10,000 active investors and expanded crypto support to include BTC, ETH, and USDT TRC20." },
  { year: "2025", title: "Real-Time Dashboard", desc: "Launched live profit tracking, instant notifications, and the investor dashboard used today." },
  { year: "2026", title: "Continued Growth", desc: "Serving investors worldwide with $180M+ in assets under management and expanding plan tiers." },
];

const values = [
  { icon: Shield, title: "Security First", desc: "Every decision we make starts with protecting your funds. Multi-sig wallets, cold storage, and AES-256 encryption are non-negotiable." },
  { icon: CheckCircle, title: "Full Transparency", desc: "Fixed ROI plans with no hidden fees. What you see on the plans page is exactly what you earn — no surprises." },
  { icon: TrendingUp, title: "Consistent Returns", desc: "We offer structured investment plans with fixed returns so you always know what to expect before you invest." },
  { icon: Globe, title: "Global Access", desc: "Investors from around the world can access our platform and deposit using major cryptocurrencies." },
];

export function AboutPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <FadeIn className="mb-20 text-center">
          <span className="label-mono text-neon">Our Story</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-6xl">
            Built on <span className="text-neon neon-glow-text">Trust</span> &amp; Results
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
            QuantumVest was founded to give individual investors access to professional, fixed-return crypto investment plans — with the security and transparency that serious investors demand.
          </p>
        </FadeIn>

        {/* Stats */}
        <FadeIn className="mb-24">
          <div className="grid gap-6 rounded-[32px] border border-white/10 bg-white/[0.02] p-10 sm:grid-cols-2 md:grid-cols-4">
            {[
              { value: 180, prefix: "$", suffix: "M+", label: "Assets Under Management" },
              { value: 12400, suffix: "+", label: "Active Investors" },
              { value: 50, suffix: "+", label: "Countries Served" },
              { value: 99.9, suffix: "%", label: "Platform Uptime" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-neon">
                  <AnimatedCounter end={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.value === 99.9 ? 1 : 0} />
                </p>
                <p className="label-mono mt-2 text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Mission */}
        <FadeIn className="mb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="label-mono text-neon">Our Mission</span>
              <h2 className="text-3xl font-bold text-white">Democratising Professional Investment</h2>
              <p className="text-on-surface-variant">
                For too long, high-yield investment strategies were reserved for institutions and the ultra-wealthy. QuantumVest changes that. We offer the same disciplined, structured investment approach — with fixed returns, daily profit credits, and full transparency — available to any investor from any country.
              </p>
              <p className="text-on-surface-variant">
                Whether you are investing $1,000 or $100,000, you get the same level of security, the same professional management, and the same real-time visibility into your portfolio.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((v) => (
                <GlassCard key={v.title} className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-neon/20 bg-neon/10">
                    <v.icon className="h-5 w-5 text-neon" />
                  </div>
                  <h3 className="mb-1 font-bold text-white">{v.title}</h3>
                  <p className="text-xs text-on-surface-variant">{v.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Timeline */}
        <FadeIn className="mb-24">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-neon/20 md:block" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex flex-col gap-4 md:flex-row md:items-center ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 md:text-right">
                    {i % 2 === 0 && (
                      <GlassCard className="inline-block p-6 text-left md:text-right">
                        <span className="label-mono text-neon">{m.year}</span>
                        <h3 className="mt-2 font-bold text-white">{m.title}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{m.desc}</p>
                      </GlassCard>
                    )}
                  </div>
                  <div className="hidden h-4 w-4 shrink-0 rounded-full bg-neon shadow-[0_0_10px_rgba(198,255,0,0.6)] md:block" />
                  <div className="flex-1">
                    {i % 2 !== 0 && (
                      <GlassCard className="inline-block p-6">
                        <span className="label-mono text-neon">{m.year}</span>
                        <h3 className="mt-2 font-bold text-white">{m.title}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{m.desc}</p>
                      </GlassCard>
                    )}
                    {i % 2 === 0 && (
                      <GlassCard className="p-6 md:hidden">
                        <span className="label-mono text-neon">{m.year}</span>
                        <h3 className="mt-2 font-bold text-white">{m.title}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{m.desc}</p>
                      </GlassCard>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <div className="rounded-[32px] border border-neon/20 bg-neon/5 p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-neon" />
            <h2 className="text-2xl font-bold text-white">Join Our Community of Investors</h2>
            <p className="mx-auto mt-4 max-w-xl text-on-surface-variant">
              Thousands of investors trust QuantumVest to grow their portfolio. Create your free account today and start earning.
            </p>
            <a
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-pill bg-neon px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:scale-105"
            >
              Open Your Account
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
