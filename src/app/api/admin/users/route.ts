import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const kycStatus = searchParams.get("kyc_status");
  const suspended = searchParams.get("suspended");
  const activeInvestors = searchParams.get("active_investors");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT)))
  );
  const offset = (page - 1) * limit;

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const safeSearch = search.replace(/[%_]/g, "\\$&");
    query = query.or(
      `email.ilike.%${safeSearch}%,full_name.ilike.%${safeSearch}%`
    );
  }
  if (kycStatus) query = query.eq("kyc_status", kycStatus);
  if (suspended === "true") query = query.eq("is_suspended", true);
  if (suspended === "false") query = query.eq("is_suspended", false);

  const { data: users, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  let result = users ?? [];

  if (activeInvestors === "true") {
    const { data: investments } = await supabase
      .from("user_investments")
      .select("user_id")
      .eq("status", "active");
    const activeIds = new Set((investments ?? []).map((i) => i.user_id));
    result = result.filter((u) => activeIds.has(u.id));
  }

  return NextResponse.json({
    users: result,
    pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  });
}
