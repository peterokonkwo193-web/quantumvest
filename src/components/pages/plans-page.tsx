"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Crown,
  Gem,
  Layers,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { FadeIn } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import {
  investmentPlans,
  calculateExpectedProfit,
  type InvestmentPlan,
} from "@/lib/data/investment-plans";
import { mapDbPlanToInvestmentPlan } from "@/lib/plans-mapper";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

const iconMap = {
  rocket: Rocket,
  layers: Layers,
  crown: Crown,
  gem: Gem,
  sparkles: Sparkles,
};

function PlanCard({ plan, index }: { plan: InvestmentPlan; index: number }) {
  const Icon = iconMap[plan.icon as keyof typeof iconMap] ?? Rocket;
  const profitAtMin = calculateExpectedProfit(plan.minDeposit, plan.roi);
  const profitAtMax = plan.maxDeposit
    ? calculateExpectedProfit(plan.maxDeposit, plan.roi)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className={`relative flex flex-col rounded-[24px] border p-8 transition-all ${
        plan.highlighted
          ? "border-neon/40 bg-neon/5 shadow-[0_0_40px_rgba(198,255,0,0.15)] scale-[1.02]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-neon px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-black">
            Most Popular
          </span>
        </div>
      )}

      {/* Tier + Icon */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            plan.highlighted ? "bg-neon" : "border border-white/10 bg-white/5"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${plan.highlighted ? "text-black" : "text-neon"}`}
          />
        </div>
        <div>
          <p className="label-mono text-xs text-on-surface-variant">Tier {String(plan.tier).padStart(2, "0")}</p>
          <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
        </div>
      </div>

      {/* ROI */}
      <div className="mb-1">
        <span
          className={`text-6xl font-extrabold leading-none ${
            plan.highlighted ? "text-neon neon-glow-text" : "text-white"
          }`}
        >
          {plan.roi}%
        </span>
        <span className="ml-2 text-sm text-on-surface-variant">ROI</span>
      </div>
      <p className="label-mono mb-6 text-xs text-on-surface-variant">{plan.duration}</p>

      {/* Deposit range */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Min Deposit</span>
          <span className="font-mono font-bold text-white">{formatCurrency(plan.minDeposit)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Max Deposit</span>
          <span className="font-mono font-bold text-white">
            {plan.maxDeposit ? formatCurrency(plan.maxDeposit) : "Unlimited"}
          </span>
        </div>

        <div className="border-t border-white/10 pt-3">
          <p className="mb-1 text-xs text-on-surface-variant">Profit earned at minimum deposit:</p>
          <p className="font-mono text-lg font-bold text-neon">
            + {formatCurrency(profitAtMin)}
          </p>
        </div>

        {profitAtMax && (
          <div>
            <p className="mb-1 text-xs text-on-surface-variant">Profit earned at maximum deposit:</p>
            <p className="font-mono text-lg font-bold text-neon">
              + {formatCurrency(profitAtMax)}
            </p>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-grow space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        variant={plan.highlighted ? "neon" : "outline"}
        size="lg"
        className="w-full"
        asChild
      >
        <Link href={`/signup?plan=${plan.id}`}>
          Start with {plan.name}
        </Link>
      </Button>
    </motion.div>
  );
}

export function PlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>(investmentPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("investment_plans")
        .select("*")
        .order("min_deposit", { ascending: true });

      if (data?.length) {
        setPlans(data.map((p, i) => mapDbPlanToInvestmentPlan(p, i)));
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <FadeIn className="mb-6 text-center">
          <span className="label-mono text-neon">Investment Plans</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-6xl">
            Choose Your <span className="text-neon neon-glow-text">Plan</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
            Five investment tiers from <strong className="text-white">$1,000</strong> to{" "}
            <strong className="text-white">$20,000+</strong>. Fixed returns. Daily profit credits. Withdraw anytime.
          </p>
        </FadeIn>

        {/* Tier ladder visual */}
        <FadeIn className="mb-16">
          <div className="mx-auto flex max-w-3xl items-end justify-center gap-1 px-4">
            {investmentPlans.map((plan, i) => {
              const heights = ["h-10", "h-16", "h-24", "h-32", "h-40"];
              return (
                <div key={plan.id} className="flex flex-1 flex-col items-center gap-1">
                  <span className="label-mono text-[10px] text-neon">{plan.roi}%</span>
                  <div
                    className={`w-full rounded-t-lg ${heights[i]} ${
                      plan.highlighted
                        ? "bg-neon/80"
                        : "bg-white/10"
                    }`}
                  />
                  <span className="label-mono text-[9px] text-on-surface-variant">{plan.name}</span>
                  <span className="text-[9px] text-on-surface-variant/60">{formatCurrency(plan.minDeposit)}</span>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Plan cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neon" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        )}

        {/* Profit table */}
        <FadeIn className="mt-16">
          <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left font-bold text-white">Plan</th>
                  <th className="px-6 py-4 text-right text-on-surface-variant">Deposit Range</th>
                  <th className="px-6 py-4 text-right text-on-surface-variant">ROI</th>
                  <th className="px-6 py-4 text-right text-on-surface-variant">Duration</th>
                  <th className="px-6 py-4 text-right text-on-surface-variant">Min Profit</th>
                  <th className="px-6 py-4 text-right text-on-surface-variant">Max Profit</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                      plan.highlighted ? "bg-neon/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {plan.highlighted && (
                          <span className="rounded-full bg-neon px-2 py-0.5 text-[10px] font-bold text-black">
                            Popular
                          </span>
                        )}
                        <span className="font-bold text-white">{plan.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-on-surface-variant">
                      {formatCurrency(plan.minDeposit)} – {plan.maxDeposit ? formatCurrency(plan.maxDeposit) : "∞"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-neon">{plan.roi}%</td>
                    <td className="px-6 py-4 text-right text-on-surface-variant">{plan.duration}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-neon">
                      +{formatCurrency(calculateExpectedProfit(plan.minDeposit, plan.roi))}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-neon">
                      {plan.maxDeposit
                        ? `+${formatCurrency(calculateExpectedProfit(plan.maxDeposit, plan.roi))}`
                        : "Unlimited"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        <FadeIn className="mt-10 text-center">
          <p className="text-sm text-on-surface-variant">
            All plans include secure wallet protection, daily profit updates, and 24/7 platform access.
            ROI is applied to your deposited principal and credited upon plan completion.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href="/signup">Open Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Ask a Question</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
