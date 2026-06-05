import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const schema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
  amount: z.number().positive("Amount must be greater than 0").finite(),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { planId, amount } = parsed.data;

  const { data: profile } = await supabase
    .from("users")
    .select("is_suspended, wallet_balance")
    .eq("id", user.id)
    .single();

  if (profile?.is_suspended) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  if (!profile || profile.wallet_balance < amount) {
    return NextResponse.json(
      { error: "Insufficient wallet balance" },
      { status: 400 }
    );
  }

  const { data: plan } = await supabase
    .from("investment_plans")
    .select("id,min_deposit,max_deposit,roi,duration")
    .eq("id", planId)
    .single();

  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  if (amount < plan.min_deposit || (plan.max_deposit && amount > plan.max_deposit)) {
    return NextResponse.json({ error: "Amount is outside plan limits" }, { status: 400 });
  }

  const expectedProfit = Number((amount * (plan.roi / 100)).toFixed(2));
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);

  const { error: investmentError } = await supabase.from("user_investments").insert({
    user_id: user.id,
    plan_id: plan.id,
    amount,
    expected_profit: expectedProfit,
    status: "active",
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });

  if (investmentError) {
    return NextResponse.json({ error: investmentError.message }, { status: 400 });
  }

  await supabase.from("transactions").insert({
    user_id: user.id,
    amount,
    transaction_type: "investment",
    status: "completed",
  });

  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Investment Activated",
    message: `Your investment of $${amount.toLocaleString()} was activated successfully.`,
  });

  return NextResponse.json({ success: true, expectedProfit });
}
