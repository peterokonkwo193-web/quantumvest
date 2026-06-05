import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

export async function POST() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { user, supabase } = auth;

  const today = new Date().toISOString().split("T")[0];

  const { data: dueProfits, error: fetchError } = await supabase
    .from("profits")
    .select("id")
    .eq("status", "scheduled")
    .lte("payout_date", today);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }

  const processed: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const profit of dueProfits ?? []) {
    const { error } = await supabase.rpc("distribute_profit", {
      p_profit_id: profit.id,
      p_admin_id: user.id,
    });
    if (error) failed.push({ id: profit.id, error: error.message });
    else processed.push(profit.id);
  }

  return NextResponse.json({ processed: processed.length, failed });
}
