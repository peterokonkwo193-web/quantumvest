"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Gem,
  Layers,
  Rocket,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InvestmentPlan,
  calculateExpectedProfit,
} from "@/lib/data/investment-plans";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const iconMap = {
  rocket: Rocket,
  layers: Layers,
  crown: Crown,
  gem: Gem,
  sparkles: Sparkles,
};

interface InvestmentPlanCardProps {
  plan: InvestmentPlan;
  compact?: boolean;
}

export function InvestmentPlanCard({ plan, compact }: InvestmentPlanCardProps) {
  const Icon = iconMap[plan.icon as keyof typeof iconMap] || Rocket;
  const expectedProfit = calculateExpectedProfit(plan.minDeposit, plan.roi);

  return (
    <motion.div
      whileHover={{ y: -8, scale: plan.highlighted ? 1.03 : 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card relative flex h-full flex-col rounded-glass p-6 md:p-8",
        plan.highlighted &&
          "z-10 scale-105 border-neon/40 bg-neon/5 shadow-neon-lg"
      )}
    >
      {plan.highlighted && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-neon px-4 py-1">
          <span className="label-mono text-[10px] font-bold text-on-neon">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <span className="label-mono mb-2 block text-on-surface-variant">
          Tier {String(plan.tier).padStart(2, "0")}
        </span>
        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              plan.highlighted ? "bg-neon" : "bg-neon/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                plan.highlighted ? "text-on-neon" : "text-neon"
              )}
            />
          </div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-2"
        >
          <span className="text-4xl font-extrabold text-neon neon-glow-text">
            {plan.roi}%
          </span>
          <span className="ml-2 text-on-surface-variant">ROI</span>
        </motion.div>
        <p className="label-mono text-on-surface-variant">{plan.duration}</p>
      </div>

      {!compact && (
        <div className="mb-6 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Min Deposit</span>
            <span className="font-mono font-bold text-white">
              {formatCurrency(plan.minDeposit)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Max Deposit</span>
            <span className="font-mono font-bold text-white">
              {plan.maxDeposit
                ? formatCurrency(plan.maxDeposit)
                : "Unlimited"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Expected Profit</span>
            <span className="font-mono font-bold text-neon">
              {formatCurrency(expectedProfit)}+
            </span>
          </div>
        </div>
      )}

      <ul className="mb-8 flex-grow space-y-3">
        {plan.features.slice(0, compact ? 3 : undefined).map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-on-surface-variant"
          >
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={plan.highlighted ? "neon" : "outline"}
        className="w-full"
        asChild
      >
        <Link href={`/signup?plan=${plan.id}`}>
          {plan.highlighted ? "Activate Plan" : "Initialize"}
        </Link>
      </Button>
    </motion.div>
  );
}
