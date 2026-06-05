import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;
  const { suspend } = await request.json();

  const { error } = await supabase.rpc("suspend_user", {
    p_target_user_id: id,
    p_suspend: Boolean(suspend),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    const adminClient = createAdminSupabaseClient();
    if (suspend) {
      await adminClient.auth.admin.updateUserById(id, { ban_duration: "876000h" });
    } else {
      await adminClient.auth.admin.updateUserById(id, { ban_duration: "none" });
    }
  } catch {
    // Service role optional; profile flag still applies
  }

  return NextResponse.json({ success: true });
}
