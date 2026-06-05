import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { user, supabase } = auth;
  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const { error } = await supabase.rpc("soft_delete_user", {
    p_target_user_id: id,
    p_admin_id: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    const adminClient = createAdminSupabaseClient();
    await adminClient.auth.admin.updateUserById(id, { ban_duration: "876000h" });
  } catch {
    // Soft delete in DB still applied
  }

  return NextResponse.json({ success: true });
}
