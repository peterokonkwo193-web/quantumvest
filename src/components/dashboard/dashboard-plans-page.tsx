"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Crown, Gem, Layers, Loader2, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/motion-components";
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

function PlanCard({ plan, index, hasActivePlan }: { plan: InvestmentPlan; index: number; hasActivePlan: boolean }) {
  const Icon = iconMap[plan.icon as keyof typeof iconMap] ?? Rocket;
  const profitAtMin = calculateExpectedProfit(plan.minDeposit, plan.roi);
  const profitAtMax = plan.maxDeposit ? calculateExpectedProfit(plan.maxDeposit, plan.roi) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`relative flex flex-col rounded-[20px] border p-5 transition-all ${
        plan.highlighted
          ? "border-neon/40 bg-neon/5 shadow-[0_0_40px_rgba(198,255,0,0.12)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-neon px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-black">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.highlighted ? "bg-neon" : "border border-white/10 bg-white/5"}`}>
          <Icon className={`h-5 w-5 ${plan.highlighted ? "text-black" : "text-neon"}`} />
        </div>
        <div>
          <p className="label-mono text-[10px] text-on-surface-variant">Tier {String(plan.tier).padStart(2, "0")}</p>
          <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
        </div>
      </div>

      <div className="mb-1">
        <span className={`text-4xl font-extrabold leading-none ${plan.highlighted ? "text-neon neon-glow-text" : "text-white"}`}>
          {plan.roi}%
        </span>
        <span className="ml-1 text-xs text-on-surface-variant">ROI</span>
      </div>
      <p className="label-mono mb-4 text-xs text-on-surface-variant">{plan.duration}</p>

      <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Min Deposit</span>
          <span className="font-mono font-bold text-white">{formatCurrency(plan.minDeposit)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Max Deposit</span>
          <span className="font-mono font-bold text-white">{plan.maxDeposit ? formatCurrency(plan.maxDeposit) : "Unlimited"}</span>
        </div>
        <div className="border-t border-white/10 pt-2">
          <p className="mb-0.5 text-xs text-on-surface-variant">Min profit earned:</p>
          <p className="font-mono font-bold text-neon">+ {formatCurrency(profitAtMin)}</p>
        </div>
        {profitAtMax && (
          <div>
            <p className="mb-0.5 text-xs text-on-surface-variant">Max profit earned:</p>
            <p className="font-mono font-bold text-neon">+ {formatCurrency(profitAtMax)}</p>
          </div>
        )}
      </div>

      <ul className="mb-6 flex-grow space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-on-surface-variant">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />
            {f}
          </li>
        ))}
      </ul>

      <Button variant={plan.highlighted ? "neon" : "outline"} size="sm" className="w-full" asChild>
        <Link href={`/dashboard/wallet?plan=${plan.id}&tab=deposit`}>
          Invest in {plan.name}
        </Link>
      </Button>
    </motion.div>
  );
}

export function DashboardPlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>(investmentPlans);
  const [loading, setLoading] = useState(true);
  const [activePlanIds, setActivePlanIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [plansRes, investRes] = await Promise.all([
        supabase.from("investment_plans").select("*").order("min_deposit", { ascending: true }),
        user
          ? supabase.from("user_investments").select("plan_id").eq("user_id", user.id).eq("status", "active")
          : Promise.resolve({ data: [] }),
      ]);

      if (plansRes.data?.length) {
        setPlans(plansRes.data.map((p, i) => mapDbPlanToInvestmentPlan(p, i)));
      }
      if (investRes.data?.length) {
        setActivePlanIds(investRes.data.map((r) => r.plan_id));
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-[1400px]">
      <FadeIn className="mb-8">
        <span className="label-mono text-neon">Investment Plans</span>
        <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
          Choose Your <span className="text-neon neon-glow-text">Plan</span>
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Select a plan and go straight to deposit. Fixed returns, daily profit credits, withdraw anytime.
        </p>
      </FadeIn>

      {activePlanIds.length > 0 && (
        <FadeIn className="mb-6 rounded-2xl border border-neon/30 bg-neon/5 p-4">
          <p className="text-sm font-bold text-neon">Active Plan</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            You have {activePlanIds.length} active investment{activePlanIds.length > 1 ? "s" : ""}. You can add more deposits to any plan.
          </p>
        </FadeIn>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} hasActivePlan={activePlanIds.includes(plan.id)} />
          ))}
        </div>
      )}

      {/* Comparison table */}
      <FadeIn className="mt-12">
        <div className="overflow-x-auto rounded-[20px] border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-4 text-left font-bold text-white">Plan</th>
                <th className="px-5 py-4 text-right text-on-surface-variant">Range</th>
                <th className="px-5 py-4 text-right text-on-surface-variant">ROI</th>
                <th className="px-5 py-4 text-right text-on-surface-variant">Duration</th>
                <th className="px-5 py-4 text-right text-on-surface-variant">Min Profit</th>
                <th className="px-5 py-4 text-right text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className={`border-b border-white/5 hover:bg-white/5 ${plan.highlighted ? "bg-neon/5" : ""}`}>
                  <td className="px-5 py-3 font-bold text-white">{plan.name}</td>
                  <td className="px-5 py-3 text-right font-mono text-on-surface-variant">
                    {formatCurrency(plan.minDeposit)} – {plan.maxDeposit ? formatCurrency(plan.maxDeposit) : "∞"}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-neon">{plan.roi}%</td>
                  <td className="px-5 py-3 text-right text-on-surface-variant">{plan.duration}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-neon">
                    +{formatCurrency(calculateExpectedProfit(plan.minDeposit, plan.roi))}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/wallet?plan=${plan.id}&tab=deposit`}>Invest →</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  );
}
