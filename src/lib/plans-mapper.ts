import type { InvestmentPlan } from "@/lib/data/investment-plans";
import type { Database } from "@/lib/database.types";

type DbPlan = Database["public"]["Tables"]["investment_plans"]["Row"];

const iconByTier = ["rocket", "layers", "crown", "gem", "sparkles"];
const colorByTier = ["#64748b", "#94a3b8", "#C6FF00", "#e2e8f0", "#a855f7"];

export function mapDbPlanToInvestmentPlan(plan: DbPlan, index: number): InvestmentPlan {
  return {
    id: plan.id,
    name: plan.plan_name,
    tier: index + 1,
    minDeposit: Number(plan.min_deposit),
    maxDeposit: plan.max_deposit ? Number(plan.max_deposit) : null,
    roi: Number(plan.roi),
    duration: `${plan.duration} Days`,
    durationDays: plan.duration,
    features: plan.features ?? [],
    highlighted: plan.plan_name.toLowerCase().includes("gold"),
    icon: iconByTier[index % iconByTier.length] ?? "rocket",
    color: colorByTier[index % colorByTier.length] ?? "#C6FF00",
  };
}
