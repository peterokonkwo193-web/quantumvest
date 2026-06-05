import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;

  const [profileRes, investmentsRes, transactionsRes, withdrawalsRes] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", id).single(),
      supabase
        .from("user_investments")
        .select("*, investment_plans(plan_name, roi, duration)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    investments: investmentsRes.data ?? [],
    transactions: transactionsRes.data ?? [],
    withdrawals: withdrawalsRes.data ?? [],
    activeInvestments: (investmentsRes.data ?? []).filter((i) => i.status === "active"),
  });
}
