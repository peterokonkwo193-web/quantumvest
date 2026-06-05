import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  const { error: updateError } = await supabase
    .from("profits")
    .update({ status: "approved" })
    .eq("id", id)
    .in("status", ["pending", "scheduled"]);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const { error } = await supabase.rpc("distribute_profit", {
    p_profit_id: id,
    p_admin_id: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
