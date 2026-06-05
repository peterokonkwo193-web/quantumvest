import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;

  const supabase = createAdminSupabaseClient();

  const { data: profits, error } = await supabase
    .from("profits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const userIds = [...new Set((profits ?? []).map((p) => p.user_id))];
  const { data: users } = userIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] };

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const enriched = (profits ?? []).map((p) => ({
    ...p,
    user_full_name: userMap.get(p.user_id)?.full_name ?? null,
    user_email: userMap.get(p.user_id)?.email ?? null,
  }));

  return NextResponse.json({ profits: enriched });
}
