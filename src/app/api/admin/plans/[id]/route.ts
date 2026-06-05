import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("investment_plans")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ plan: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;

  const { count } = await supabase
    .from("user_investments")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", id)
    .eq("status", "active");

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete plan with active investments" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("investment_plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
