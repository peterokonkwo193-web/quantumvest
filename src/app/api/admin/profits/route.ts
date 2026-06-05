import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

const schema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  amount: z.number().positive("Amount must be greater than 0").finite(),
  plan_id: z.string().uuid().optional().nullable(),
  investment_id: z.string().uuid().optional().nullable(),
  profit_type: z.string().default("manual"),
  profit_percentage: z.number().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  payout_date: z.string().optional().nullable(),
  status: z.enum(["pending", "approved"]).default("pending"),
  auto_pay: z.boolean().default(false),
});

export async function GET() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("profits")
    .select(
      `
      *,
      users(full_name, email),
      investment_plans(plan_name, roi),
      user_investments(amount)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profits: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { user, supabase } = auth;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    user_id,
    plan_id,
    investment_id,
    profit_type,
    amount,
    profit_percentage,
    description,
    payout_date,
    status,
    auto_pay,
  } = parsed.data;

  const { data: profit, error } = await supabase
    .from("profits")
    .insert({
      user_id,
      plan_id: plan_id ?? null,
      investment_id: investment_id ?? null,
      profit_type,
      amount,
      profit_percentage: profit_percentage ?? null,
      description: description ?? null,
      payout_date: payout_date ?? null,
      status,
      issued_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!profit) {
    return NextResponse.json({ error: "Failed to create profit record" }, { status: 500 });
  }

  if (auto_pay || status === "approved") {
    const { error: payError } = await supabase.rpc("distribute_profit", {
      p_profit_id: profit.id,
      p_admin_id: user.id,
    });
    if (payError) return NextResponse.json({ error: payError.message }, { status: 400 });
  }

  return NextResponse.json({ profit });
}
