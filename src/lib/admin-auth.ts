import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { User } from "@supabase/supabase-js";

export async function requireAdmin(): Promise<
  { user: User; supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> } | NextResponse
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { user, supabase };
}

export function isAdminResponse(
  result: Awaited<ReturnType<typeof requireAdmin>>
): result is NextResponse {
  return result instanceof NextResponse;
}
